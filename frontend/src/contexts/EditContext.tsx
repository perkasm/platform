import { createContext, useContext, useState } from "react";
import {
  mockCards,
  mockTransactions,
  mockLoyaltyPrograms,
  mockPortfolioStats,
  mockChartData,
  type Card,
  type Transaction,
  type LoyaltyProgram,
} from "@/data/mockData";

const STORAGE_KEY = "perkasm_dashboard_data";

const CASH_BACK_REWARDS = new Set(["Cash Back", "Daily Cash"]);

/** Default metadata for known reward currencies so programs can be auto-created */
const KNOWN_PROGRAMS: Record<string, Omit<LoyaltyProgram, "balance" | "dollarValue">> = {
  "Chase UR":          { id: "ur",       name: "Chase Ultimate Rewards",   shortName: "Chase UR",       cpp: 2.0, color: "#1a3a6b" },
  "Amex MR":           { id: "mr",       name: "Amex Membership Rewards",  shortName: "Amex MR",        cpp: 1.8, color: "#b08840" },
  "United Miles":      { id: "united",   name: "United MileagePlus",       shortName: "United Miles",   cpp: 1.4, color: "#003580" },
  "Capital One Miles": { id: "c1miles",  name: "Capital One Miles",        shortName: "Capital One Miles", cpp: 1.7, color: "#c0392b" },
};

/** Recompute loyalty program balances, portfolio stats, and current-month chart
 *  entry from the current set of cards. Called after every card mutation. */
function recomputeFromCards(
  cards: Card[],
  loyaltyPrograms: LoyaltyProgram[],
  chartData: ChartEntry[],
  portfolioStats: PortfolioStats
): Pick<StoredData, "loyaltyPrograms" | "portfolioStats" | "chartData"> {
  // Auto-create programs for any card whose primaryReward has no matching program yet
  const existingShortNames = new Set(loyaltyPrograms.map((p) => p.shortName));
  const autoCreated: LoyaltyProgram[] = [];
  for (const card of cards) {
    if (CASH_BACK_REWARDS.has(card.primaryReward)) continue;
    if (existingShortNames.has(card.primaryReward)) continue;
    const known = KNOWN_PROGRAMS[card.primaryReward];
    if (known) {
      autoCreated.push({ ...known, balance: 0, dollarValue: 0 });
      existingShortNames.add(card.primaryReward);
    }
  }

  // Sync loyalty program balances from linked cards
  const updatedPrograms = [...loyaltyPrograms, ...autoCreated].map((prog) => {
    const linked = cards.filter(
      (c) => !CASH_BACK_REWARDS.has(c.primaryReward) && c.primaryReward === prog.shortName
    );
    if (linked.length === 0) return prog;
    const balance = linked.reduce((s, c) => s + c.balance, 0);
    const dollarValue = Math.round(balance * prog.cpp) / 100;
    return { ...prog, balance, dollarValue };
  });

  const totalPoints = updatedPrograms.reduce((s, p) => s + p.balance, 0);
  const totalValue = Math.round(updatedPrograms.reduce((s, p) => s + p.dollarValue, 0));
  const cardsActive = cards.length;

  // Monthly earn in dollars: cash-back cards use monthlyEarned as dollars;
  // points cards convert via their program's cpp
  const monthlyEarn = Math.round(
    cards.reduce((sum, card) => {
      if (CASH_BACK_REWARDS.has(card.primaryReward)) return sum + card.monthlyEarned;
      const prog = updatedPrograms.find((p) => p.shortName === card.primaryReward);
      const cpp = prog ? prog.cpp : 1.0;
      return sum + (card.monthlyEarned * cpp) / 100;
    }, 0)
  );

  // Current month (last chart entry) = total points earned across non-cash-back cards
  const currentMonthPts = cards
    .filter((c) => !CASH_BACK_REWARDS.has(c.primaryReward))
    .reduce((s, c) => s + c.monthlyEarned, 0);

  const updatedChart = chartData.map((entry, i) =>
    i === chartData.length - 1 ? { ...entry, points: currentMonthPts } : entry
  );

  return {
    loyaltyPrograms: updatedPrograms,
    portfolioStats: { ...portfolioStats, totalPoints, totalValue, cardsActive, monthlyEarn },
    chartData: updatedChart,
  };
}

interface PortfolioStats {
  totalValue: number;
  totalPoints: number;
  cardsActive: number;
  monthlyEarn: number;
}

interface ChartEntry {
  month: string;
  points: number;
}

interface StoredData {
  cards: Card[];
  transactions: Transaction[];
  loyaltyPrograms: LoyaltyProgram[];
  portfolioStats: PortfolioStats;
  chartData: ChartEntry[];
}

/** Normalize legacy shortName values that drifted from catalog primaryReward keys */
const SHORT_NAME_MIGRATIONS: Record<string, string> = {
  United: "United Miles",
};

/** IDs that were pre-seeded as mock data and should be removed if no card links to them */
const MOCK_PROGRAM_IDS = new Set(["ur", "mr", "hyatt", "united", "marriott"]);

function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: StoredData = JSON.parse(raw);
      // Migrate stale shortNames so they match cardCatalog primaryReward values
      parsed.loyaltyPrograms = parsed.loyaltyPrograms.map((p) => {
        const migrated = SHORT_NAME_MIGRATIONS[p.shortName];
        return migrated ? { ...p, shortName: migrated } : p;
      });
      // Remove pre-seeded mock programs that have no linked card
      const cardRewards = new Set(parsed.cards.map((c) => c.primaryReward));
      parsed.loyaltyPrograms = parsed.loyaltyPrograms.filter(
        (p) => !MOCK_PROGRAM_IDS.has(p.id) || cardRewards.has(p.shortName)
      );
      return parsed;
    }
  } catch {}
  return {
    cards: mockCards,
    transactions: mockTransactions,
    loyaltyPrograms: mockLoyaltyPrograms,
    portfolioStats: mockPortfolioStats,
    chartData: mockChartData,
  };
}

interface EditContextValue {
  isEditMode: boolean;
  toggleEditMode: () => void;

  cards: Card[];
  updateCard: (id: string, changes: Partial<Card>) => void;
  addCard: (card: Card) => void;
  removeCard: (id: string) => void;
  clearAllCards: () => void;
  /** Set of loyalty program shortNames that are auto-derived from card balances */
  linkedProgramShortNames: Set<string>;

  transactions: Transaction[];
  updateTransaction: (id: string, changes: Partial<Transaction>) => void;
  addTransaction: (tx: Transaction) => void;
  removeTransaction: (id: string) => void;

  loyaltyPrograms: LoyaltyProgram[];
  updateLoyaltyProgram: (id: string, changes: Partial<LoyaltyProgram>) => void;
  addLoyaltyProgram: (p: LoyaltyProgram) => void;
  removeLoyaltyProgram: (id: string) => void;

  portfolioStats: PortfolioStats;
  updatePortfolioStats: (changes: Partial<PortfolioStats>) => void;

  chartData: ChartEntry[];
  updateChartEntry: (index: number, changes: Partial<ChartEntry>) => void;

  resetToDefaults: () => void;
}

const EditContext = createContext<EditContextValue | null>(null);

export function EditProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [data, setData] = useState<StoredData>(() => {
    const loaded = loadData();
    const derived = recomputeFromCards(loaded.cards, loaded.loyaltyPrograms, loaded.chartData, loaded.portfolioStats);
    return { ...loaded, ...derived };
  });

  const save = (newData: StoredData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const toggleEditMode = () => setIsEditMode((v) => !v);

  const updateCard = (id: string, changes: Partial<Card>) => {
    const updatedCards = data.cards.map((c) => (c.id === id ? { ...c, ...changes } : c));
    const derived = recomputeFromCards(updatedCards, data.loyaltyPrograms, data.chartData, data.portfolioStats);
    save({ ...data, cards: updatedCards, ...derived });
  };

  const addCard = (card: Card) => {
    const updatedCards = [...data.cards, card];
    const derived = recomputeFromCards(updatedCards, data.loyaltyPrograms, data.chartData, data.portfolioStats);
    save({ ...data, cards: updatedCards, ...derived });
  };

  const removeCard = (id: string) => {
    const updatedCards = data.cards.filter((c) => c.id !== id);
    const derived = recomputeFromCards(updatedCards, data.loyaltyPrograms, data.chartData, data.portfolioStats);
    save({ ...data, cards: updatedCards, ...derived });
  };

  const clearAllCards = () => {
    const derived = recomputeFromCards([], data.loyaltyPrograms, data.chartData, data.portfolioStats);
    save({ ...data, cards: [], ...derived });
  };

  const updateTransaction = (id: string, changes: Partial<Transaction>) =>
    save({ ...data, transactions: data.transactions.map((t) => (t.id === id ? { ...t, ...changes } : t)) });

  const addTransaction = (tx: Transaction) =>
    save({ ...data, transactions: [tx, ...data.transactions] });

  const removeTransaction = (id: string) =>
    save({ ...data, transactions: data.transactions.filter((t) => t.id !== id) });

  const updateLoyaltyProgram = (id: string, changes: Partial<LoyaltyProgram>) =>
    save({ ...data, loyaltyPrograms: data.loyaltyPrograms.map((p) => (p.id === id ? { ...p, ...changes } : p)) });

  const addLoyaltyProgram = (p: LoyaltyProgram) =>
    save({ ...data, loyaltyPrograms: [...data.loyaltyPrograms, p] });

  const removeLoyaltyProgram = (id: string) =>
    save({ ...data, loyaltyPrograms: data.loyaltyPrograms.filter((p) => p.id !== id) });

  const updatePortfolioStats = (changes: Partial<PortfolioStats>) =>
    save({ ...data, portfolioStats: { ...data.portfolioStats, ...changes } });

  const updateChartEntry = (index: number, changes: Partial<ChartEntry>) =>
    save({
      ...data,
      chartData: data.chartData.map((e, i) => (i === index ? { ...e, ...changes } : e)),
    });

  const resetToDefaults = () =>
    save({
      cards: mockCards,
      transactions: mockTransactions,
      loyaltyPrograms: mockLoyaltyPrograms,
      portfolioStats: mockPortfolioStats,
      chartData: mockChartData,
    });

  const linkedProgramShortNames = new Set(
    data.cards
      .filter((c) => !CASH_BACK_REWARDS.has(c.primaryReward))
      .map((c) => c.primaryReward)
  );

  return (
    <EditContext.Provider
      value={{
        isEditMode,
        toggleEditMode,
        cards: data.cards,
        updateCard,
        addCard,
        removeCard,
        clearAllCards,
        linkedProgramShortNames,
        transactions: data.transactions,
        updateTransaction,
        addTransaction,
        removeTransaction,
        loyaltyPrograms: data.loyaltyPrograms,
        updateLoyaltyProgram,
        addLoyaltyProgram,
        removeLoyaltyProgram,
        portfolioStats: data.portfolioStats,
        updatePortfolioStats,
        chartData: data.chartData,
        updateChartEntry,
        resetToDefaults,
      }}
    >
      {children}
    </EditContext.Provider>
  );
}

export function useEdit() {
  const ctx = useContext(EditContext);
  if (!ctx) throw new Error("useEdit must be used within EditProvider");
  return ctx;
}

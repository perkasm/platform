import { useState, useMemo } from "react";
import { Utensils, Plane, ShoppingBasket, Fuel, ShoppingBag, Tv, MoreHorizontal, Search, RefreshCw, AlertTriangle } from "lucide-react";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import { useTellerData } from "@/hooks/use-teller-data";
import { useEdit } from "@/contexts/EditContext";
import { type Card } from "@/data/mockData";
import { TellerAccount, TellerTransaction } from "@/services/teller.service";

type Category = "dining" | "travel" | "groceries" | "gas" | "shopping" | "streaming" | "other";
type DateRange = "7d" | "30d" | "90d";

const categoryIcon: Record<Category, React.ReactNode> = {
  dining: <Utensils className="h-4 w-4" />,
  travel: <Plane className="h-4 w-4" />,
  groceries: <ShoppingBasket className="h-4 w-4" />,
  gas: <Fuel className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  streaming: <Tv className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

const categoryColor: Record<Category, string> = {
  dining: "bg-orange-50 text-orange-500",
  travel: "bg-blue-50 text-blue-500",
  groceries: "bg-green-50 text-green-600",
  gas: "bg-yellow-50 text-yellow-600",
  shopping: "bg-purple-50 text-purple-500",
  streaming: "bg-pink-50 text-pink-500",
  other: "bg-gray-100 text-gray-500",
};

// ─── Reward helpers ──────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  dining: ["dining", "restaurant", "grubhub", "doordash", "cheesecake", "resy", "bar"],
  travel: ["travel", "airline", "flight", "hotel", "united", "transit", "transport", "accommodation", "rental car"],
  groceries: ["supermarket", "grocery", "wholesale", "trader joe", "whole foods"],
  gas: ["gas station", "gas", "fuel", "ev charging"],
  shopping: ["online retail", "retail", "shopping", "amazon"],
  streaming: ["streaming", "entertainment", "digital", "subscription"],
  other: [],
};

function getEarnRate(card: Card, category: Category): number {
  const kws = CATEGORY_KEYWORDS[category];
  let best = 0;
  let fallback = 1;
  for (const cat of card.categories) {
    const lower = cat.name.toLowerCase();
    if (lower.includes("everything")) { fallback = cat.multiplier; continue; }
    if (kws.some((kw) => lower.includes(kw))) best = Math.max(best, cat.multiplier);
  }
  return best > 0 ? best : fallback;
}

// ─────────────────────────────────────────────────────────────────────────────

function mapTellerCategory(details: Record<string, unknown> | null): Category {
  const cat = (details as Record<string, unknown> | null)?.["category"] as string | undefined;
  if (!cat) return "other";
  const lower = cat.toLowerCase();
  if (lower === "dining" || lower === "bar" || lower === "restaurant") return "dining";
  if (lower === "travel" || lower === "transport" || lower === "accommodation" || lower === "airline") return "travel";
  if (lower === "groceries" || lower === "grocery") return "groceries";
  if (lower === "fuel" || lower === "gas") return "gas";
  if (lower === "shopping" || lower === "clothing" || lower === "electronics" || lower === "retail") return "shopping";
  if (lower === "software" || lower === "entertainment" || lower === "streaming" || lower === "subscription") return "streaming";
  return "other";
}

interface DisplayTransaction {
  id: string;
  merchant: string;
  category: Category;
  amount: number;
  accountId: string;
  accountName: string;
  date: string;
  isDebit: boolean;
  matchedCard: Card | null;
  earnRate: number;
  isCashBack: boolean;
  bestCard: Card | null;
  bestRate: number;
}

function toDisplay(
  tx: TellerTransaction,
  accountMap: Map<string, TellerAccount>,
  cards: Card[],
): DisplayTransaction {
  const account = accountMap.get(tx.account_id);
  const amount = parseFloat(tx.amount);
  const category = mapTellerCategory(tx.details);

  // Match Teller account → user card by last 4 digits
  const matchedCard = account?.last_four
    ? (cards.find((c) => c.last4 === account.last_four) ?? null)
    : null;

  const cashBack = matchedCard
    ? matchedCard.primaryReward === "Cash Back" || matchedCard.primaryReward === "Daily Cash"
    : false;

  const earnRate = matchedCard ? getEarnRate(matchedCard, category) : 0;

  // Find best available card for this category
  let bestCard: Card | null = null;
  let bestRate = 0;
  for (const card of cards) {
    const rate = getEarnRate(card, category);
    if (rate > bestRate) { bestRate = rate; bestCard = card; }
  }

  return {
    id: tx.id,
    merchant: tx.description,
    category,
    amount: Math.abs(amount),
    accountId: tx.account_id,
    accountName: account ? `${account.name}${account.last_four ? ` ••${account.last_four}` : ""}` : "Account",
    date: tx.date,
    isDebit: amount < 0,
    matchedCard,
    earnRate,
    isCashBack: cashBack,
    bestCard,
    bestRate,
  };
}

function dateRangeCutoff(range: DateRange): Date {
  const d = new Date();
  if (range === "7d") d.setDate(d.getDate() - 7);
  else if (range === "30d") d.setDate(d.getDate() - 30);
  else d.setDate(d.getDate() - 90);
  return d;
}

function RewardBadge({ tx }: { tx: DisplayTransaction }) {
  if (!tx.matchedCard || !tx.isDebit) return null;
  const isOptimal = tx.earnRate >= tx.bestRate;
  const earned = tx.isCashBack
    ? `+$${(tx.amount * tx.earnRate / 100).toFixed(2)}`
    : `+${Math.round(tx.amount * tx.earnRate).toLocaleString()} pts`;
  return (
    <div className="flex items-center gap-1 mt-0.5">
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        isOptimal
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
          : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
      }`}>
        {earned}
      </span>
      {!isOptimal && tx.bestCard && (
        <span
          className="text-[9px] text-amber-500 dark:text-amber-400"
          title={`${tx.bestCard.name} earns ${tx.bestRate}x here`}
        >
          <AlertTriangle size={10} />
        </span>
      )}
    </div>
  );
}

function TransactionRow({ tx }: { tx: DisplayTransaction }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${categoryColor[tx.category]}`}>
        {categoryIcon[tx.category]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#1D1D1F] dark:text-slate-100 text-sm font-medium truncate">{tx.merchant}</p>
        <p className="text-[#6E6E73] dark:text-slate-400 text-xs">{tx.accountName} · {tx.date}</p>
        <RewardBadge tx={tx} />
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-medium ${tx.isDebit ? "text-[#1D1D1F] dark:text-slate-100" : "text-emerald-600"}`}>
          {tx.isDebit ? "-" : "+"}${tx.amount.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

const DateRangePills = ({
  selected,
  onChange,
}: {
  selected: DateRange;
  onChange: (r: DateRange) => void;
}) => (
  <div className="flex gap-1">
    {(["7d", "30d", "90d"] as DateRange[]).map((r) => (
      <button
        key={r}
        onClick={(e) => { e.stopPropagation(); onChange(r); }}
        className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-200 ${
          selected === r
            ? "bg-[#1D1D1F] dark:bg-slate-200 dark:text-slate-900 text-white"
            : "bg-[#F5F5F7] dark:bg-slate-700 text-[#6E6E73] dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
        }`}
      >
        {r === "7d" ? "Last 7d" : r === "30d" ? "Last 30d" : "Last 90d"}
      </button>
    ))}
  </div>
);

function LoadingRows() {
  return (
    <div className="px-6 pb-4 space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-gray-100 dark:bg-slate-700 rounded-full w-2/3 animate-pulse" />
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full w-1/3 animate-pulse" />
          </div>
          <div className="h-3.5 bg-gray-100 dark:bg-slate-700 rounded-full w-16 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function RecentTransactions() {
  const { accounts, transactions, loading, error, refetch } = useTellerData();
  const { cards } = useEdit();
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");

  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts]
  );

  const cutoff = useMemo(() => dateRangeCutoff(dateRange), [dateRange]);

  const allDisplayed = useMemo(
    () => transactions.map((tx) => toDisplay(tx, accountMap, cards)),
    [transactions, accountMap, cards]
  );

  const filtered = useMemo(() => {
    return allDisplayed.filter((tx) => {
      if (new Date(tx.date) < cutoff) return false;
      if (accountFilter !== "all" && tx.accountId !== accountFilter) return false;
      if (search && !tx.merchant.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allDisplayed, cutoff, accountFilter, search]);

  const CollapsedContent = (
    <>
      {loading ? (
        <LoadingRows />
      ) : error ? (
        <div className="px-6 pb-4 text-center py-6">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-1.5 text-xs text-[#0071E3] hover:underline"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      ) : allDisplayed.length === 0 ? (
        <div className="px-6 pb-6 text-center py-6">
          <p className="text-sm text-[#6E6E73] dark:text-slate-400">No transactions yet.</p>
          <p className="text-xs text-[#6E6E73] dark:text-slate-500 mt-1">Connect a bank account to see your transactions.</p>
        </div>
      ) : (
        <div className="px-6 pb-4 divide-y divide-gray-50 dark:divide-slate-700/50">
          {allDisplayed.slice(0, 5).map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </>
  );

  const ExpandedContent = (
    <div className="px-6 pb-6">
      {/* Search & filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E6E73]" />
          <input
            type="text"
            placeholder="Search merchants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F5F5F7] dark:bg-slate-700 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3]/20 text-[#1D1D1F] dark:text-slate-100 placeholder-[#6E6E73] dark:placeholder-slate-400"
          />
        </div>
        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="text-sm bg-[#F5F5F7] dark:bg-slate-700 dark:text-slate-100 border-none rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#0071E3]/20 text-[#1D1D1F]"
        >
          <option value="all">All accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}{a.last_four ? ` ••${a.last_four}` : ""}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingRows />
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-1.5 text-xs text-[#0071E3] hover:underline"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
          {filtered.length > 0 ? (
            filtered.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
          ) : (
            <p className="text-[#6E6E73] dark:text-slate-400 text-sm text-center py-8">No transactions found.</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <ExpandableSection
      title="Recent Transactions"
      headerRight={<DateRangePills selected={dateRange} onChange={setDateRange} />}
      collapsedContent={CollapsedContent}
      expandedContent={ExpandedContent}
    />
  );
}

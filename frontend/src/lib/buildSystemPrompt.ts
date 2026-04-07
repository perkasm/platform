import type { Card, Transaction, LoyaltyProgram } from "@/data/mockData";
import type { TellerAccount, TellerTransaction } from "@/services/teller.service";

interface PortfolioStats {
  totalValue: number;
  totalPoints: number;
  cardsActive: number;
  monthlyEarn: number;
}

export interface TellerContext {
  accounts: TellerAccount[];
  transactions: TellerTransaction[];
  cards: Card[];
}

export interface DashboardContext {
  cards: Card[];
  transactions: Transaction[];
  loyaltyPrograms: LoyaltyProgram[];
  portfolioStats: PortfolioStats;
  teller?: TellerContext;
}

// ── Teller helpers ────────────────────────────────────────────────────────────

type Category = "dining" | "travel" | "groceries" | "gas" | "shopping" | "streaming" | "other";

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  dining: ["dining", "restaurant", "bar"],
  travel: ["travel", "airline", "hotel", "transit", "transport", "accommodation"],
  groceries: ["supermarket", "grocery", "wholesale"],
  gas: ["gas station", "gas", "fuel", "ev charging"],
  shopping: ["online retail", "retail", "shopping", "amazon"],
  streaming: ["streaming", "entertainment", "digital", "subscription"],
  other: [],
};

function mapTellerCategory(details: Record<string, unknown> | null): Category {
  const cat = (details?.["category"] as string | undefined)?.toLowerCase() ?? "";
  if (!cat) return "other";
  if (cat === "dining" || cat === "bar" || cat === "restaurant") return "dining";
  if (cat === "travel" || cat === "transport" || cat === "accommodation" || cat === "airline") return "travel";
  if (cat === "groceries" || cat === "grocery") return "groceries";
  if (cat === "fuel" || cat === "gas") return "gas";
  if (cat === "shopping" || cat === "clothing" || cat === "electronics" || cat === "retail") return "shopping";
  if (cat === "software" || cat === "entertainment" || cat === "streaming" || cat === "subscription") return "streaming";
  return "other";
}

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

function buildTellerSection(ctx: TellerContext): string {
  const { accounts, transactions, cards } = ctx;
  if (transactions.length === 0) return "";

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const lines = transactions.slice(0, 30).map((tx) => {
    const account = accountMap.get(tx.account_id);
    const amount = parseFloat(tx.amount);
    const isDebit = amount < 0;
    const absAmount = Math.abs(amount);
    const category = mapTellerCategory(tx.details);

    const matchedCard = account?.last_four
      ? (cards.find((c) => c.last4 === account.last_four) ?? null)
      : null;

    const earnRate = matchedCard ? getEarnRate(matchedCard, category) : 0;
    const isCashBack = matchedCard
      ? matchedCard.primaryReward === "Cash Back" || matchedCard.primaryReward === "Daily Cash"
      : false;

    let bestCard: Card | null = null;
    let bestRate = 0;
    for (const card of cards) {
      const rate = getEarnRate(card, category);
      if (rate > bestRate) { bestRate = rate; bestCard = card; }
    }

    const cardLabel = matchedCard
      ? `${matchedCard.name} (••${matchedCard.last4})`
      : account
      ? `${account.name}${account.last_four ? ` ••${account.last_four}` : ""}`
      : "Unknown account";

    let earnedLabel = "";
    if (matchedCard && isDebit) {
      earnedLabel = isCashBack
        ? ` | earned $${(absAmount * earnRate / 100).toFixed(2)} cash back`
        : ` | earned ~${Math.round(absAmount * earnRate).toLocaleString()} pts @ ${earnRate}x`;
    }

    const suboptimal =
      matchedCard && bestCard && bestRate > earnRate
        ? ` ⚠️ SUBOPTIMAL (${bestCard.name} earns ${bestRate}x here)`
        : "";

    return `- ${tx.date} | ${tx.description} (${category}) | $${absAmount.toFixed(2)} ${isDebit ? "debit" : "credit"} | ${cardLabel}${earnedLabel}${suboptimal}`;
  });

  const suboptimalCount = transactions.slice(0, 30).filter((tx) => {
    const account = accountMap.get(tx.account_id);
    const amount = parseFloat(tx.amount);
    if (amount >= 0) return false;
    const category = mapTellerCategory(tx.details);
    const matchedCard = account?.last_four ? (cards.find((c) => c.last4 === account.last_four) ?? null) : null;
    if (!matchedCard) return false;
    const earnRate = getEarnRate(matchedCard, category);
    let bestRate = 0;
    for (const card of cards) {
      const rate = getEarnRate(card, category);
      if (rate > bestRate) bestRate = rate;
    }
    return earnRate < bestRate;
  }).length;

  return `## Live Bank Transactions (last ${Math.min(30, transactions.length)} from Teller)
${lines.join("\n")}

## Spending Efficiency (live data)
${suboptimalCount} of the last ${Math.min(30, transactions.length)} transactions used a suboptimal card.`;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildSystemPrompt(ctx: DashboardContext): string {
  const { cards, transactions, loyaltyPrograms, portfolioStats, teller } = ctx;

  const cardsSection = cards
    .map((c) => {
      const rates = c.categories
        .map((cat) => `${cat.multiplier}x ${cat.name}`)
        .join(", ");
      const perks = c.perks.join("; ");
      const fee = c.annualFee > 0 ? `$${c.annualFee}/yr` : "No annual fee";
      const feeDate = c.nextFeeDate ? ` (due ${c.nextFeeDate})` : "";
      return `- ${c.name} (${c.network}, ...${c.last4}): Earns ${c.primaryReward}. Earn rates: ${rates}. Current balance: ${c.balance.toLocaleString()} pts. Monthly earned: ${c.monthlyEarned.toLocaleString()} pts. Annual fee: ${fee}${feeDate}. Perks: ${perks}.`;
    })
    .join("\n");

  const loyaltySection = loyaltyPrograms
    .map(
      (p) =>
        `- ${p.name} (${p.shortName}): ${p.balance.toLocaleString()} pts @ ${p.cpp}¢/pt = $${p.dollarValue.toFixed(2)}`
    )
    .join("\n");

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Use live Teller transactions if available, otherwise fall back to manual/mock
  const transactionsSection = teller && teller.transactions.length > 0
    ? buildTellerSection(teller)
    : (() => {
        const recentTxns = transactions
          .slice(0, 12)
          .map((t) => {
            const flag = t.isOptimal ? "" : " ⚠️ SUBOPTIMAL (better card available)";
            return `- ${t.date} | ${t.merchant} (${t.category}) | $${t.amount.toFixed(2)} | ${t.cardName} | +${t.pointsEarned} pts${flag}`;
          })
          .join("\n");
        const suboptimalCount = transactions.filter((t) => !t.isOptimal).length;
        return `## Recent Transactions (last ${Math.min(12, transactions.length)})
${recentTxns}

## Spending Efficiency
${suboptimalCount} of the last ${transactions.length} transactions used a suboptimal card.`;
      })();

  return `You are Perkasm, an expert credit card rewards optimizer. You have full visibility into the user's portfolio below.

**Response rules:**
- Match the length of your response to the complexity of the question. A greeting gets a short friendly reply. A specific question gets a focused answer. Only give a full portfolio breakdown when explicitly asked.
- Use markdown formatting (tables, bold, bullet lists) so responses are easy to scan — never dump unformatted walls of text.
- Always reference the user's actual card names, earn rates, and balances when relevant. Be specific and data-driven.

## Portfolio Summary
- Total portfolio value: $${portfolioStats.totalValue.toLocaleString()}
- Total points: ${portfolioStats.totalPoints.toLocaleString()} across all programs
- Active cards: ${portfolioStats.cardsActive}
- Monthly earning rate: ~${portfolioStats.monthlyEarn.toLocaleString()} pts/month

## Credit Cards
${cardsSection}

## Loyalty Program Balances
${loyaltySection}

${transactionsSection}

Today is ${today}. When recommending a card, cite the specific earn rate. When discussing redemptions, use the actual cpp values and balances above.`;
}

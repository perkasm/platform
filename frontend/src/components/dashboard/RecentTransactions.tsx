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
  dining: "bg-orange-500/15 text-orange-400",
  travel: "bg-luxury-accent-indigo/15 text-luxury-accent-indigo",
  groceries: "bg-luxury-accent-mint/15 text-luxury-accent-mint",
  gas: "bg-amber-500/15 text-amber-400",
  shopping: "bg-purple-500/15 text-purple-400",
  streaming: "bg-pink-500/15 text-pink-400",
  other: "bg-luxury-elevated text-luxury-text-muted",
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

const TELLER_CAT_MAP: [Category, string[]][] = [
  ["dining",    ["dining", "restaurant", "bar", "food", "drink", "cafe", "bakery", "dessert"]],
  ["travel",    ["travel", "accommodation", "airline", "hotel", "lodging", "flight", "car rental", "vacation"]],
  ["travel",    ["transport", "transit", "commut", "ride", "parking", "toll"]],
  ["groceries", ["grocer", "supermarket", "wholesale", "food store", "market"]],
  ["gas",       ["fuel", "gas station", "petrol", "ev charg", "gas_station"]],
  ["shopping",  ["shopping", "clothing", "apparel", "electronics", "retail", "merchandise", "department store"]],
  ["streaming", ["software", "entertainment", "streaming", "subscription", "digital", "saas", "media"]],
];

function fromTellerCategory(cat: string): Category | null {
  const lower = cat.toLowerCase();
  for (const [mapped, keywords] of TELLER_CAT_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return mapped;
  }
  return null;
}

function categorizeByDescription(text: string): Category {
  const s = text.toLowerCase();

  if (/\b(restaurant|grubhub|doordash|ubereats|uber\s*eat|door\s*dash|seamless|caviar|postmates|chownow)\b/.test(s)) return "dining";
  if (/\b(mcdonald|burger\s*king|wendy|chipotle|subway|starbucks|dunkin|taco\s*bell|chick.fil|popeyes|panera|shake\s*shack|sweetgreen|domino|five\s*guys|wingstop|papa\s*john|little\s*caesar|sonic\s*drive|whataburger|in.n.out|raising\s*cane)\b/.test(s)) return "dining";
  if (/\b(pizza|sushi|ramen|pho|barbecue|bbq|steakhouse|seafood|diner|bistro|brasserie|taproom|brewpub|brewery|winery|distillery|gastropub|cheesecake\s*factory|olive\s*garden|applebee|chili.s|outback|ihop|waffle\s*house|denny.s|cracker\s*barrel)\b/.test(s)) return "dining";
  if (/\b(coffee|cafe|caf[eé]|espresso|latte|boba|tea\s*house|juice\s*bar|smoothie|bakery|bagel|donut|pastry|crepe|dessert|gelato|ice\s*cream|frozen\s*yogurt|fro.?yo)\b/.test(s)) return "dining";
  if (/\bbar\b|\btavern\b|\bpub\b|\bsaloon\b|\bsportsbar\b/.test(s)) return "dining";

  if (/\b(united\s*air|delta\s*air|american\s*air|southwest|jetblue|spirit\s*air|frontier\s*air|alaska\s*air|hawaiian\s*air|air\s*canada|british\s*air|lufthansa|emirates|qatar\s*air|air\s*france|klm|turkish|singapore\s*air|virgin)\b/.test(s)) return "travel";
  if (/\b(airline|flight|airport|amtrak|greyhound|megabus|train\s*ticket|rail|airfare)\b/.test(s)) return "travel";
  if (/\b(hotel|marriott|hilton|hyatt|sheraton|westin|starwood|fairmont|four\s*seasons|ritz|intercontinental|holiday\s*inn|best\s*western|hampton\s*inn|courtyard|doubletree|radisson|wyndham|choice\s*hotel|motel)\b/.test(s)) return "travel";
  if (/\b(airbnb|vrbo|booking\.com|expedia|priceline|kayak|hotwire|travelocity|orbitz|hotels\.com|trivago)\b/.test(s)) return "travel";
  if (/\b(hertz|enterprise\s*rent|avis|budget\s*rent|national\s*car|alamo|dollar\s*rent|thrifty\s*car|sixt|zipcar|turo)\b/.test(s)) return "travel";
  if (/\b(uber(?!\s*eat|\s*eats)|lyft|via\s*ride|curb\s*cab|taxi|rideshare|ride\s*share)\b/.test(s)) return "travel";

  if (/\b(wal.?mart|target(?!\s*visa))\b/.test(s) && /\b(grocery|grocer|market|food)\b/.test(s)) return "groceries";
  if (/\b(kroger|safeway|albertson|publix|whole\s*foods|wholefds|wholefoods|trader\s*joe|traderjoe|aldi|costco|sam.?s\s*club|bjs\s*wholesale|fresh\s*market|sprouts|harris\s*teeter|meijer|wegmans|giant\s*food|food\s*lion|heb\b|h-e-b|market\s*basket|stop\s*.?\s*shop|winn.?dixie|piggly|brookshire|hy.?vee|food\s*4\s*less|ralphs|vons|pavilions|tom\s*thumb|randall|jewel.?osco|lucky\s*store|stater\s*bros|winco|fresh\s*thyme|natural\s*grocers|earthfare)\b/.test(s)) return "groceries";
  if (/\b(instacart|shipt|freshdirect|good\s*eggs|imperfect\s*food|misfits\s*market|thrive\s*market)\b/.test(s)) return "groceries";

  if (/\b(shell|exxon|mobil|bp\b|chevron|texaco|sunoco|marathon|conoco|phillips\s*66|arco|valero|citgo|gulf\s*oil|speedway|wawa|casey.?s|circle\s*k|7.?eleven|quiktrip|kwik\s*trip|pilot\s*travel|loves\s*travel|love.?s\s*travel|flying\s*j|ta\s*travel|sheetz|racetrac|thorntons)\b/.test(s)) return "gas";
  if (/\b(gas\s*station|fuel\s*stop|filling\s*station|ev\s*charg|tesla\s*supercharg|electrify\s*america|chargepoint|blink\s*charg|evgo)\b/.test(s)) return "gas";

  if (/\b(amazon(?!\s*prime\s*video)(?!\s*music)(?!\s*web\s*service)|amzn(?!\s*prime))\b/.test(s)) return "shopping";
  if (/\b(ebay|etsy|shopify|wish\b|temu|shein|aliexpress|alibaba)\b/.test(s)) return "shopping";
  if (/\b(best\s*buy|apple\s*store|microsoft\s*store|newegg|b.?h\s*photo|micro\s*center)\b/.test(s)) return "shopping";
  if (/\b(home\s*depot|lowe.?s|menards|true\s*value|ace\s*hardware|harbor\s*freight)\b/.test(s)) return "shopping";
  if (/\b(ikea|wayfair|overstock|bed\s*bath|pottery\s*barn|crate\s*.?\s*barrel|williams.?sonoma|restoration\s*hardware)\b/.test(s)) return "shopping";
  if (/\b(nordstrom|macy.?s|bloomingdale|neiman\s*marcus|saks|lord\s*.?\s*taylor|jcpenney|kohl.?s|dillard)\b/.test(s)) return "shopping";
  if (/\b(gap\b|old\s*navy|banana\s*republic|h\s*&\s*m|hm\b|zara|uniqlo|forever\s*21|h&m)\b/.test(s)) return "shopping";
  if (/\b(nike|adidas|under\s*armour|lululemon|patagonia|rei\b|dick.?s\s*sporting|foot\s*locker)\b/.test(s)) return "shopping";
  if (/\b(wal.?mart|target)\b/.test(s)) return "shopping";

  if (/\b(netflix|hulu|disney\+?|hbo|max\b|peacock|paramount\+?|crunchyroll|funimation|shudder|mubi|criterion)\b/.test(s)) return "streaming";
  if (/\b(spotify|apple\s*music|amazon\s*music|tidal|pandora|deezer|soundcloud|youtube\s*music|sirius\s*xm|audible|kindle\s*unlimited)\b/.test(s)) return "streaming";
  if (/\b(youtube\s*premium|twitch\s*sub|patreon|substack|onlyfan)\b/.test(s)) return "streaming";
  if (/\b(adobe\b|photoshop|lightroom|illustrator|microsoft\s*365|office\s*365|google\s*one|google\s*workspace|dropbox|box\.com|icloud|lastpass|1password|nordvpn|expressvpn)\b/.test(s)) return "streaming";
  if (/\b(apple\s*tv\+?|apple\s*arcade|apple\s*fitness|apple\s*one|apple\s*news)\b/.test(s)) return "streaming";

  return "other";
}

function mapTellerCategory(details: Record<string, unknown> | null, description = ""): Category {
  const cat = (details as Record<string, unknown> | null)?.["category"] as string | undefined;
  const counterpartyRaw = (details as Record<string, unknown> | null)?.["counterparty"];
  const counterparty = (
    typeof counterpartyRaw === "object" && counterpartyRaw !== null
      ? (counterpartyRaw as Record<string, unknown>)["name"]
      : counterpartyRaw
  ) as string | undefined;

  if (cat) {
    const mapped = fromTellerCategory(cat);
    if (mapped) return mapped;
  }

  const nameToCheck = counterparty || description;
  if (nameToCheck) return categorizeByDescription(nameToCheck);
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
  categoryMap: Record<string, string> = {},
): DisplayTransaction {
  const account = accountMap.get(tx.account_id);
  const amount = parseFloat(tx.amount);
  const category = (categoryMap[tx.id] as Category | undefined)
    ?? mapTellerCategory(tx.details, tx.description);

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
          ? "bg-luxury-accent-mint/15 text-luxury-accent-mint"
          : "bg-luxury-accent-amber/15 text-luxury-accent-amber"
      }`}>
        {earned}
      </span>
      {!isOptimal && tx.bestCard && (
        <span
          className="text-[9px] text-luxury-accent-amber"
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
        <p className="text-luxury-text-primary text-sm font-ui font-medium truncate">{tx.merchant}</p>
        <p className="text-luxury-text-secondary text-xs font-mono-data">{tx.accountName} · {tx.date}</p>
        <RewardBadge tx={tx} />
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-mono-data font-medium ${tx.isDebit ? "text-luxury-text-primary" : "text-luxury-accent-mint"}`}>
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
            ? "bg-luxury-accent-indigo/20 text-luxury-accent-indigo border border-luxury-accent-indigo/30"
            : "bg-luxury-elevated text-luxury-text-secondary hover:bg-luxury-bg hover:text-luxury-text-primary"
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
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-luxury-elevated via-luxury-border/40 to-luxury-elevated bg-[length:200%_100%] animate-shimmer" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 rounded-full w-2/3 bg-gradient-to-r from-luxury-elevated via-luxury-border/40 to-luxury-elevated bg-[length:200%_100%] animate-shimmer" />
            <div className="h-3 rounded-full w-1/3 bg-gradient-to-r from-luxury-elevated via-luxury-border/40 to-luxury-elevated bg-[length:200%_100%] animate-shimmer" />
          </div>
          <div className="h-3.5 rounded-full w-16 bg-gradient-to-r from-luxury-elevated via-luxury-border/40 to-luxury-elevated bg-[length:200%_100%] animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function RecentTransactions() {
  const { accounts, transactions, categoryMap, loading, error, refetch } = useTellerData();
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
    () => transactions.map((tx) => toDisplay(tx, accountMap, cards, categoryMap)),
    [transactions, accountMap, cards, categoryMap]
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
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-1.5 text-xs text-luxury-accent-indigo hover:underline"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      ) : allDisplayed.length === 0 ? (
        <div className="px-6 pb-6 text-center py-6">
          <p className="text-sm text-luxury-text-secondary">No transactions yet.</p>
          <p className="text-xs text-luxury-text-muted mt-1">Connect a bank account to see your transactions.</p>
        </div>
      ) : (
        <div className="px-6 pb-4 divide-y divide-luxury-border/40">
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-text-muted" />
          <input
            type="text"
            placeholder="Search merchants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-luxury-elevated border border-luxury-border rounded-xl outline-none focus:ring-2 focus:ring-luxury-accent-indigo/20 text-luxury-text-primary placeholder:text-luxury-text-muted"
          />
        </div>
        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="text-sm bg-luxury-elevated border border-luxury-border text-luxury-text-primary rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-luxury-accent-indigo/20"
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
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-1.5 text-xs text-luxury-accent-indigo hover:underline"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      ) : (
        <div className="divide-y divide-luxury-border/40">
          {filtered.length > 0 ? (
            filtered.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
          ) : (
            <p className="text-luxury-text-muted text-sm text-center py-8">No transactions found.</p>
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

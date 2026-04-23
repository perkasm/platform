import { useMemo, useState, useEffect } from "react";
import {
  Utensils, Plane, ShoppingBasket, Fuel, ShoppingBag, Tv, MoreHorizontal,
  TrendingUp, Lightbulb, CreditCard, Star, Zap, Sparkles,
} from "lucide-react";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import { useTellerData } from "@/hooks/use-teller-data";
import { useEdit } from "@/contexts/EditContext";
import { generateSpendingAdvice } from "@/services/categorize.service";
import type { Card } from "@/data/mockData";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Category = "dining" | "travel" | "groceries" | "gas" | "shopping" | "streaming" | "other";

// ─── Category metadata ─────────────────────────────────────────────────────────

const categoryMeta: Record<Category, { icon: React.ReactNode; label: string; color: string; barColor: string }> = {
  dining:    { icon: <Utensils className="h-3.5 w-3.5" />,      label: "Dining",     color: "text-orange-400",  barColor: "bg-orange-400" },
  travel:    { icon: <Plane className="h-3.5 w-3.5" />,         label: "Travel",     color: "text-indigo-400",  barColor: "bg-indigo-400" },
  groceries: { icon: <ShoppingBasket className="h-3.5 w-3.5" />, label: "Groceries",  color: "text-emerald-400", barColor: "bg-emerald-400" },
  gas:       { icon: <Fuel className="h-3.5 w-3.5" />,          label: "Gas",        color: "text-amber-400",   barColor: "bg-amber-400" },
  shopping:  { icon: <ShoppingBag className="h-3.5 w-3.5" />,   label: "Shopping",   color: "text-purple-400",  barColor: "bg-purple-400" },
  streaming: { icon: <Tv className="h-3.5 w-3.5" />,            label: "Streaming",  color: "text-pink-400",    barColor: "bg-pink-400" },
  other:     { icon: <MoreHorizontal className="h-3.5 w-3.5" />, label: "Other",      color: "text-zinc-400",    barColor: "bg-zinc-500" },
};

// ─── Helpers (mirrors RecentTransactions logic) ────────────────────────────────

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  dining:    ["dining", "restaurant", "grubhub", "doordash", "cheesecake", "resy", "bar"],
  travel:    ["travel", "airline", "flight", "hotel", "united", "transit", "transport", "accommodation", "rental car"],
  groceries: ["supermarket", "grocery", "wholesale", "trader joe", "whole foods"],
  gas:       ["gas station", "gas", "fuel", "ev charging"],
  shopping:  ["online retail", "retail", "shopping", "amazon"],
  streaming: ["streaming", "entertainment", "digital", "subscription"],
  other:     [],
};

// Teller category values → our Category
// Uses includes() to handle compound values like "food_and_drink", "general_merchandise", etc.
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

// Merchant name / description → Category fallback
// Strip common bank-generated prefixes so the merchant name is exposed for matching
function stripBankPrefix(text: string): string {
  return text
    // Point-of-sale / payment processor prefixes
    .replace(/^sq\s*\*\s*/i, "")            // Square: "SQ *MERCHANT"
    .replace(/^tst\s*\*\s*/i, "")           // Toast: "TST* RESTAURANT"
    .replace(/^pp\s*\*\s*/i, "")            // PayPal: "PP *MERCHANT"
    .replace(/^paypal\s*\*\s*/i, "")
    .replace(/^sp\s+\*\s*/i, "")            // Shopify: "SP *MERCHANT"
    .replace(/^zettle\s*\*\s*/i, "")
    // Bank card prefixes
    .replace(/^checkcard\s+\d+\s+/i, "")   // "CHECKCARD 1234 MERCHANT"
    .replace(/^debit card\s+\d+\s+/i, "")
    .replace(/^pos\s+(debit|credit|purchase)\s+/i, "")
    .replace(/^ach\s+(debit|credit)\s+/i, "")
    .replace(/^purchase\s+authorized\s+on\s+\d+\/\d+\s+/i, "")
    .replace(/^recurring\s+(debit\s+)?/i, "")
    // Trailing store numbers and transaction codes
    .replace(/\s+#\d+\s*\w{0,4}(\s+.*)?$/, "")  // "#1234 CITYNAME STATE"
    .replace(/\s+\d{6,}.*$/, "")               // long trailing codes
    .replace(/\s+\d{2}\/\d{2}(\s+.*)?$/, "")   // trailing date "01/14 CITYNAME"
    .trim();
}

function categorizeByDescription(text: string): Category {
  // Try matching on the raw text first, then on the bank-prefix-stripped version
  const result = _matchCategory(text.toLowerCase());
  if (result !== "other") return result;
  const stripped = stripBankPrefix(text).toLowerCase();
  return stripped !== text.toLowerCase() ? _matchCategory(stripped) : "other";
}

function _matchCategory(s: string): Category {
  // Dining — food delivery, fast food, coffee, sit-down restaurants
  if (/\b(restaurant|grubhub|doordash|ubereats|uber\s*eat|door\s*dash|seamless|caviar|postmates|chownow)\b/.test(s)) return "dining";
  if (/\b(mcdonald|burger\s*king|wendy|chipotle|subway|starbucks|dunkin|taco\s*bell|chick.fil|popeyes|panera|shake\s*shack|sweetgreen|domino|five\s*guys|wingstop|papa\s*john|little\s*caesar|sonic\s*drive|whataburger|in.n.out|raising\s*cane)\b/.test(s)) return "dining";
  if (/\b(pizza|sushi|ramen|pho|barbecue|bbq|steakhouse|seafood|diner|bistro|brasserie|taproom|brewpub|brewery|winery|distillery|gastropub|cheesecake\s*factory|olive\s*garden|applebee|chili.s|outback|ihop|waffle\s*house|denny.s|cracker\s*barrel)\b/.test(s)) return "dining";
  if (/\b(coffee|cafe|caf[eé]|espresso|latte|boba|tea\s*house|juice\s*bar|smoothie|bakery|bagel|donut|pastry|crepe|dessert|gelato|ice\s*cream|frozen\s*yogurt|fro.?yo)\b/.test(s)) return "dining";
  if (/\bbar\b|\btavern\b|\bpub\b|\bsaloon\b|\bsportsbar\b/.test(s)) return "dining";

  // Travel — airlines, hotels, car rental, rideshare, booking platforms
  if (/\b(united\s*air|delta\s*air|american\s*air|southwest|jetblue|spirit\s*air|frontier\s*air|alaska\s*air|hawaiian\s*air|air\s*canada|british\s*air|lufthansa|emirates|qatar\s*air|air\s*france|klm|turkish|singapore\s*air|virgin)\b/.test(s)) return "travel";
  if (/\b(airline|flight|airport|amtrak|greyhound|megabus|train\s*ticket|rail|airfare)\b/.test(s)) return "travel";
  if (/\b(hotel|marriott|hilton|hyatt|sheraton|westin|starwood|fairmont|four\s*seasons|ritz|intercontinental|holiday\s*inn|best\s*western|hampton\s*inn|courtyard|doubletree|radisson|wyndham|choice\s*hotel|motel)\b/.test(s)) return "travel";
  if (/\b(airbnb|vrbo|booking\.com|expedia|priceline|kayak|hotwire|travelocity|orbitz|hotels\.com|trivago)\b/.test(s)) return "travel";
  if (/\b(hertz|enterprise\s*rent|avis|budget\s*rent|national\s*car|alamo|dollar\s*rent|thrifty\s*car|sixt|zipcar|turo)\b/.test(s)) return "travel";
  if (/\b(uber(?!\s*eat|\s*eats)|lyft|via\s*ride|curb\s*cab|taxi|rideshare|ride\s*share)\b/.test(s)) return "travel";

  // Groceries — supermarkets and delivery
  if (/\b(wal.?mart|target(?!\s*visa))\b/.test(s) && /\b(grocery|grocer|market|food)\b/.test(s)) return "groceries";
  if (/\b(kroger|safeway|albertson|publix|whole\s*foods|wholefds|wholefoods|trader\s*joe|traderjoe|aldi|costco|sam.?s\s*club|bjs\s*wholesale|fresh\s*market|sprouts|harris\s*teeter|meijer|wegmans|giant\s*food|food\s*lion|heb\b|h-e-b|market\s*basket|stop\s*.?\s*shop|winn.?dixie|piggly|brookshire|hy.?vee|food\s*4\s*less|ralphs|vons|pavilions|tom\s*thumb|randall|jewel.?osco|lucky\s*store|stater\s*bros|winco|fresh\s*thyme|natural\s*grocers|earthfare)\b/.test(s)) return "groceries";
  if (/\b(instacart|shipt|freshdirect|good\s*eggs|imperfect\s*food|misfits\s*market|thrive\s*market)\b/.test(s)) return "groceries";

  // Gas — stations and EV charging
  if (/\b(shell|exxon|mobil|bp\b|chevron|texaco|sunoco|marathon|conoco|phillips\s*66|arco|valero|citgo|gulf\s*oil|speedway|wawa|casey.?s|circle\s*k|7.?eleven|quiktrip|kwik\s*trip|pilot\s*travel|loves\s*travel|love.?s\s*travel|flying\s*j|ta\s*travel|sheetz|racetrac|thorntons)\b/.test(s)) return "gas";
  if (/\b(gas\s*station|fuel\s*stop|filling\s*station|ev\s*charg|tesla\s*supercharg|electrify\s*america|chargepoint|blink\s*charg|evgo)\b/.test(s)) return "gas";

  // Shopping — retail, e-commerce, department stores
  if (/\b(amazon(?!\s*prime\s*video)(?!\s*music)(?!\s*web\s*service)|amzn(?!\s*prime))\b/.test(s)) return "shopping";
  if (/\b(ebay|etsy|shopify|wish\b|temu|shein|aliexpress|alibaba)\b/.test(s)) return "shopping";
  if (/\b(best\s*buy|apple\s*store|microsoft\s*store|newegg|b.?h\s*photo|micro\s*center)\b/.test(s)) return "shopping";
  if (/\b(home\s*depot|lowe.?s|menards|true\s*value|ace\s*hardware|harbor\s*freight)\b/.test(s)) return "shopping";
  if (/\b(ikea|wayfair|overstock|bed\s*bath|pottery\s*barn|crate\s*.?\s*barrel|williams.?sonoma|restoration\s*hardware)\b/.test(s)) return "shopping";
  if (/\b(nordstrom|macy.?s|bloomingdale|neiman\s*marcus|saks|lord\s*.?\s*taylor|jcpenney|kohl.?s|dillard)\b/.test(s)) return "shopping";
  if (/\b(gap\b|old\s*navy|banana\s*republic|h\s*&\s*m|hm\b|zara|uniqlo|forever\s*21|h&m)\b/.test(s)) return "shopping";
  if (/\b(nike|adidas|under\s*armour|lululemon|patagonia|rei\b|dick.?s\s*sporting|foot\s*locker)\b/.test(s)) return "shopping";
  if (/\b(wal.?mart|target)\b/.test(s)) return "shopping"; // catch-all for walmart/target without grocery context

  // Streaming & subscriptions
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

  // 1. Try Teller's category field
  if (cat) {
    const mapped = fromTellerCategory(cat);
    if (mapped) return mapped;
  }

  // 2. Fall back to merchant name (counterparty) then description
  const nameToCheck = counterparty || description;
  if (nameToCheck) return categorizeByDescription(nameToCheck);
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

function getBestRate(cards: Card[], category: Category): number {
  let best = 0;
  for (const card of cards) best = Math.max(best, getEarnRate(card, category));
  return best;
}

// Effective cents-per-dollar return for a card's rate in a category
// Points assumed at 1.5 cpp; cash back treated as straight percent
function effectiveCpd(rate: number, unit: "x" | "%"): number {
  return unit === "%" ? rate : rate * 1.5;
}

// ─── Card recommendation database ─────────────────────────────────────────────

interface CardRec {
  id: string;
  name: string;
  issuer: string;
  annualFee: number;
  highlight: string;
  bestFor: Category[];
  categoryRates: Partial<Record<Category, { rate: number; unit: "x" | "%" }>>;
  everythingRate?: number;
  everythingUnit?: "x" | "%";
}

const CARD_RECS: CardRec[] = [
  {
    id: "amex-plat",
    name: "Platinum Card",
    issuer: "American Express",
    annualFee: 695,
    highlight: "5x on flights & prepaid hotels, $200 airline credit, Centurion + Priority Pass lounge access, $189 CLEAR Plus credit",
    bestFor: ["travel"],
    categoryRates: {
      travel: { rate: 5, unit: "x" },
    },
    everythingRate: 1,
    everythingUnit: "x",
  },
  {
    id: "amex-gold",
    name: "Gold Card",
    issuer: "American Express",
    annualFee: 250,
    highlight: "4x at restaurants & US supermarkets (up to $25k/yr), 3x on flights, $120 dining credit, $120 Uber Cash",
    bestFor: ["dining", "groceries"],
    categoryRates: {
      dining:    { rate: 4, unit: "x" },
      groceries: { rate: 4, unit: "x" },
      travel:    { rate: 3, unit: "x" },
    },
    everythingRate: 1,
    everythingUnit: "x",
  },
  {
    id: "chase-csr",
    name: "Sapphire Reserve",
    issuer: "Chase",
    annualFee: 550,
    highlight: "3x on dining & travel worldwide, $300 travel credit, Priority Pass lounge access, 1.5x redemption on Chase Travel",
    bestFor: ["dining", "travel"],
    categoryRates: {
      dining: { rate: 3, unit: "x" },
      travel: { rate: 3, unit: "x" },
    },
    everythingRate: 1,
    everythingUnit: "x",
  },
  {
    id: "cap1-venturex",
    name: "Venture X",
    issuer: "Capital One",
    annualFee: 395,
    highlight: "10x on hotels & car rentals via portal, 5x on flights, 2x on everything else, $300 travel credit, lounge access",
    bestFor: ["travel"],
    categoryRates: {
      travel: { rate: 10, unit: "x" },
    },
    everythingRate: 2,
    everythingUnit: "x",
  },
  {
    id: "amex-bcp",
    name: "Blue Cash Preferred",
    issuer: "American Express",
    annualFee: 95,
    highlight: "6% back at US supermarkets (up to $6k/yr) & on streaming, 3% on transit & gas, $84 Disney Bundle credit",
    bestFor: ["groceries", "streaming", "gas"],
    categoryRates: {
      groceries: { rate: 6, unit: "%" },
      streaming: { rate: 6, unit: "%" },
      gas:       { rate: 3, unit: "%" },
      travel:    { rate: 3, unit: "%" },
    },
    everythingRate: 1,
    everythingUnit: "%",
  },
  {
    id: "citi-strata",
    name: "Strata Premier",
    issuer: "Citi",
    annualFee: 95,
    highlight: "3x on dining, groceries, gas, travel & hotels — $100 annual hotel benefit, strong transfer partners",
    bestFor: ["dining", "travel", "groceries", "gas"],
    categoryRates: {
      dining:    { rate: 3, unit: "x" },
      travel:    { rate: 3, unit: "x" },
      groceries: { rate: 3, unit: "x" },
      gas:       { rate: 3, unit: "x" },
    },
    everythingRate: 1,
    everythingUnit: "x",
  },
  {
    id: "chase-csp",
    name: "Sapphire Preferred",
    issuer: "Chase",
    annualFee: 95,
    highlight: "3x on dining, 2x on travel, 5x on Chase Travel portal, $50 hotel credit, solid transfer partners",
    bestFor: ["dining", "travel"],
    categoryRates: {
      dining:  { rate: 3, unit: "x" },
      travel:  { rate: 2, unit: "x" },
    },
    everythingRate: 1,
    everythingUnit: "x",
  },
  {
    id: "wf-autograph",
    name: "Autograph Card",
    issuer: "Wells Fargo",
    annualFee: 0,
    highlight: "3x on restaurants, travel, gas, transit, streaming & phone plans — no annual fee, great starter card",
    bestFor: ["dining", "travel", "gas", "streaming"],
    categoryRates: {
      dining:    { rate: 3, unit: "x" },
      travel:    { rate: 3, unit: "x" },
      gas:       { rate: 3, unit: "x" },
      streaming: { rate: 3, unit: "x" },
    },
    everythingRate: 1,
    everythingUnit: "x",
  },
  {
    id: "citi-custom-cash",
    name: "Custom Cash Card",
    issuer: "Citi",
    annualFee: 0,
    highlight: "5% back on your top eligible spend category each billing cycle (up to $500/mo), 1% on everything else — no annual fee",
    bestFor: ["dining", "groceries", "gas", "travel", "shopping", "streaming"],
    categoryRates: {
      dining:    { rate: 5, unit: "%" },
      groceries: { rate: 5, unit: "%" },
      gas:       { rate: 5, unit: "%" },
      travel:    { rate: 5, unit: "%" },
      shopping:  { rate: 5, unit: "%" },
      streaming: { rate: 5, unit: "%" },
    },
    everythingRate: 1,
    everythingUnit: "%",
  },
];

// ─── Main component ────────────────────────────────────────────────────────────

export function SpendingInsights() {
  const { accounts, transactions, categoryMap, loading } = useTellerData();
  const { cards } = useEdit();

  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts]
  );

  const cutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d;
  }, []);

  // Aggregate spending & suboptimal usage
  // categoryMap (AI-enriched) updates asynchronously; falls back to regex until ready
  const { categorySpend, totalSpend, suboptimalCount } = useMemo(() => {
    const spend: Record<Category, number> = {
      dining: 0, travel: 0, groceries: 0, gas: 0, shopping: 0, streaming: 0, other: 0,
    };
    let total = 0;
    let suboptimal = 0;

    for (const tx of transactions) {
      const amount = parseFloat(tx.amount);
      if (amount >= 0) continue;
      if (new Date(tx.date) < cutoff) continue;

      const category = (categoryMap[tx.id] as Category | undefined)
        ?? mapTellerCategory(tx.details, tx.description);
      const absAmt = Math.abs(amount);
      spend[category] += absAmt;
      total += absAmt;

      if (cards.length > 1) {
        const account = accountMap.get(tx.account_id);
        const matchedCard = account?.last_four
          ? cards.find((c) => c.last4 === account.last_four) ?? null
          : null;
        if (matchedCard) {
          const actual = getEarnRate(matchedCard, category);
          const best = getBestRate(cards, category);
          if (actual < best) suboptimal++;
        }
      }
    }

    return { categorySpend: spend, totalSpend: total, suboptimalCount: suboptimal };
  }, [transactions, categoryMap, accountMap, cards, cutoff]);

  const sortedCategories = useMemo(
    () =>
      (Object.entries(categorySpend) as [Category, number][])
        .filter(([cat, amt]) => cat !== "other" && amt > 0)
        .sort((a, b) => b[1] - a[1]),
    [categorySpend]
  );

  const topCategory = sortedCategories[0]?.[0];
  const topSpend = sortedCategories[0]?.[1] ?? 0;
  const hasData = totalSpend > 0;

  // Score & rank card recommendations
  const cardRecommendations = useMemo(() => {
    if (!hasData) return [];

    const existingNames = new Set(
      cards.map((c) => c.name.toLowerCase().replace(/[^a-z0-9]/g, ""))
    );

    return CARD_RECS.filter((rec) => {
      const key = rec.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return !existingNames.has(key);
    })
      .filter((rec) =>
        rec.bestFor.some((cat) => sortedCategories.slice(0, 4).some(([c]) => c === cat))
      )
      .map((rec) => {
        // Estimate annualized additional value vs. user's current best cards
        let additionalAnnual = 0;
        for (const [cat, spend] of sortedCategories) {
          const recRateInfo = rec.categoryRates[cat];
          const recCpd = recRateInfo
            ? effectiveCpd(recRateInfo.rate, recRateInfo.unit)
            : effectiveCpd(rec.everythingRate ?? 1, rec.everythingUnit ?? "x");

          const myBestCpd = cards.length > 0
            ? effectiveCpd(getBestRate(cards, cat), "x")
            : effectiveCpd(1, "x");

          if (recCpd > myBestCpd) {
            const annualized = (spend / 90) * 365;
            additionalAnnual += (annualized * (recCpd - myBestCpd)) / 100;
          }
        }
        return { rec, additionalAnnual };
      })
      .sort((a, b) => {
        const netA = a.additionalAnnual - a.rec.annualFee * 0.4;
        const netB = b.additionalAnnual - b.rec.annualFee * 0.4;
        return netB - netA;
      })
      .slice(0, 3);
  }, [sortedCategories, hasData, cards]);

  // AI-generated spending advice
  const [aiAdvice, setAiAdvice] = useState<string[]>([]);
  const [adviceLoading, setAdviceLoading] = useState(false);

  useEffect(() => {
    if (!hasData) return;
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
    if (!apiKey) return;

    // Collect top merchants by frequency from the last 90 days
    const merchantCounts = new Map<string, number>();
    for (const tx of transactions) {
      const amount = parseFloat(tx.amount);
      if (amount >= 0) continue;
      if (new Date(tx.date) < cutoff) continue;
      const counterparty = (tx.details as Record<string, unknown> | null)?.["counterparty"];
      const name =
        typeof counterparty === "object" && counterparty !== null
          ? ((counterparty as Record<string, unknown>)["name"] as string | undefined)
          : typeof counterparty === "string"
          ? counterparty
          : undefined;
      if (name) merchantCounts.set(name, (merchantCounts.get(name) ?? 0) + 1);
    }
    const topMerchants = [...merchantCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);

    const cardNames = cards.map((c) => `${c.name}${c.last4 ? ` (...${c.last4})` : ""}`);

    setAdviceLoading(true);
    generateSpendingAdvice(categorySpend, totalSpend, topMerchants, cardNames, apiKey)
      .then((advice) => {
        setAiAdvice(advice);
        setAdviceLoading(false);
      })
      .catch(() => setAdviceLoading(false));
  // Re-run only when spend totals change meaningfully (rounded to $10)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasData, Math.round(totalSpend / 10)]);

  // Build observations
  const observations = useMemo(() => {
    const obs: { text: string; type: "neutral" | "warn" | "good" }[] = [];
    if (!hasData) return obs;

    if (topCategory) {
      const pct = Math.round((topSpend / totalSpend) * 100);
      obs.push({
        text: `${categoryMeta[topCategory].label} is your biggest expense at ${pct}% of spend over the last 90 days.`,
        type: "neutral",
      });
    }

    if (suboptimalCount > 0 && cards.length > 1) {
      obs.push({
        text: `${suboptimalCount} transaction${suboptimalCount === 1 ? " was" : "s were"} charged to a suboptimal card — you left rewards on the table.`,
        type: "warn",
      });
    } else if (cards.length > 1 && suboptimalCount === 0 && transactions.length > 0) {
      obs.push({
        text: "Nice — all recent transactions appear to be on your best-earning card for each category.",
        type: "good",
      });
    }

    if (categorySpend.dining > 200) {
      const annualized = Math.round((categorySpend.dining / 90) * 365);
      obs.push({
        text: `At your current pace you'll spend ~$${annualized.toLocaleString()} on dining this year. A 4x card could earn ~$${Math.round(annualized * 0.04 * 1.5)} in value annually.`,
        type: "neutral",
      });
    }

    if (categorySpend.travel > 150) {
      const annualized = Math.round((categorySpend.travel / 90) * 365);
      obs.push({
        text: `~$${annualized.toLocaleString()} in projected annual travel spend — a premium travel card with transfer partners could recoup more than the annual fee.`,
        type: "neutral",
      });
    }

    if (categorySpend.groceries > 150) {
      const annualized = Math.round((categorySpend.groceries / 90) * 365);
      obs.push({
        text: `~$${annualized.toLocaleString()} in annual grocery spend makes a 6% supermarket card worth considering.`,
        type: "neutral",
      });
    }

    if (categorySpend.shopping > 150) {
      const annualized = Math.round((categorySpend.shopping / 90) * 365);
      obs.push({
        text: `You're spending ~$${annualized.toLocaleString()}/yr on shopping. A 5% rotating-category or flat-rate 2x card can add up quickly here.`,
        type: "neutral",
      });
    }

    if (categorySpend.streaming > 20) {
      const monthly = Math.round(categorySpend.streaming / 3);
      obs.push({
        text: `$${monthly}/mo on streaming subscriptions detected. The Amex Blue Cash Preferred earns 6% back on eligible streaming services.`,
        type: "neutral",
      });
    }

    if (categorySpend.gas > 80) {
      const annualized = Math.round((categorySpend.gas / 90) * 365);
      obs.push({
        text: `~$${annualized.toLocaleString()} in annual gas spend — the Citi Custom Cash or Citi Strata Premier both earn 3–5% back at gas stations.`,
        type: "neutral",
      });
    }

    const otherPct = totalSpend > 0 ? Math.round((categorySpend.other / totalSpend) * 100) : 0;
    if (otherPct > 30) {
      obs.push({
        text: `${otherPct}% of spend is uncategorized. A flat 2x card like the Capital One Venture X ensures you never leave rewards on the table.`,
        type: "warn",
      });
    }

    if (cards.length === 0) {
      obs.push({
        text: "Add your credit cards so we can identify which card earns the most in each category.",
        type: "warn",
      });
    }

    return obs.slice(0, 5);
  }, [hasData, topCategory, topSpend, totalSpend, suboptimalCount, cards, categorySpend, transactions]);

  // ─── Collapsed preview ────────────────────────────────────────────────────────

  const CollapsedContent = (
    <div className="px-6 pb-5">
      {loading ? (
        <div className="space-y-2.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-4 rounded-full bg-gradient-to-r from-luxury-elevated via-luxury-border/40 to-luxury-elevated bg-[length:200%_100%] animate-shimmer"
              style={{ width: `${72 - i * 16}%` }}
            />
          ))}
        </div>
      ) : !hasData ? (
        <p className="text-sm text-luxury-text-muted text-center py-3">
          Connect a bank account to see spending insights.
        </p>
      ) : (
        <div className="space-y-2.5">
          {sortedCategories.slice(0, 3).map(([cat, amt]) => {
            const pct = Math.round((amt / totalSpend) * 100);
            const meta = categoryMeta[cat];
            return (
              <div key={cat} className="flex items-center gap-3">
                <div className={`flex-shrink-0 ${meta.color}`}>{meta.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-luxury-text-secondary font-medium">{meta.label}</span>
                    <span className="text-xs text-luxury-text-muted font-mono-data">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-luxury-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.barColor} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-mono-data text-luxury-text-secondary flex-shrink-0 w-14 text-right">
                  ${amt.toFixed(0)}
                </span>
              </div>
            );
          })}
          {observations.length > 0 && (
            <p className="text-xs text-luxury-text-muted mt-3 pt-3 border-t border-luxury-border/40 leading-relaxed">
              {observations[0].text}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // ─── Expanded full view ───────────────────────────────────────────────────────

  const ExpandedContent = (
    <div className="px-6 pb-6 space-y-6">
      {/* Spending breakdown */}
      {hasData && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-luxury-accent-indigo" />
            <span className="text-sm font-semibold text-luxury-text-primary">Spending Breakdown</span>
            <span className="text-xs text-luxury-text-muted ml-auto font-mono-data">Last 90 days · ${totalSpend.toFixed(0)} total</span>
          </div>
          <div className="space-y-3">
            {[
              ...sortedCategories,
              ...(categorySpend.other > 0 ? [["other", categorySpend.other] as [Category, number]] : []),
            ].map(([cat, amt]) => {
              const pct = Math.round((amt / totalSpend) * 100);
              const meta = categoryMeta[cat];
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-luxury-elevated ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-luxury-text-primary font-medium">{meta.label}</span>
                      <span className="text-sm font-mono-data text-luxury-text-secondary">${amt.toFixed(0)}</span>
                    </div>
                    <div className="h-2 bg-luxury-elevated rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${meta.barColor} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono-data text-luxury-text-muted flex-shrink-0 w-8 text-right">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Observations */}
      {observations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-luxury-text-primary">Observations</span>
          </div>
          <div className="space-y-2.5">
            {observations.map((obs, i) => (
              <div key={i} className="flex gap-2.5 text-sm text-luxury-text-secondary leading-relaxed">
                <span
                  className={`flex-shrink-0 mt-0.5 font-bold ${
                    obs.type === "warn"
                      ? "text-luxury-accent-amber"
                      : obs.type === "good"
                      ? "text-luxury-accent-mint"
                      : "text-luxury-accent-indigo"
                  }`}
                >
                  •
                </span>
                <span>{obs.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI-powered insights */}
      {(adviceLoading || aiAdvice.length > 0) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-luxury-accent-indigo" />
            <span className="text-sm font-semibold text-luxury-text-primary">AI Insights</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-luxury-accent-indigo/15 text-luxury-accent-indigo border border-luxury-accent-indigo/20">
              GPT-4o mini
            </span>
          </div>
          {adviceLoading ? (
            <div className="space-y-2.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-3.5 rounded-full bg-gradient-to-r from-luxury-elevated via-luxury-border/40 to-luxury-elevated bg-[length:200%_100%] animate-shimmer"
                  style={{ width: `${88 - i * 9}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {aiAdvice.map((insight, i) => (
                <div key={i} className="flex gap-2.5 text-sm text-luxury-text-secondary leading-relaxed">
                  <span className="flex-shrink-0 mt-0.5 font-bold text-luxury-accent-indigo">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Card recommendations */}
      {cardRecommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-luxury-accent-indigo" />
            <span className="text-sm font-semibold text-luxury-text-primary">Cards Worth Considering</span>
          </div>
          <p className="text-xs text-luxury-text-muted mb-3 -mt-1">
            Based on your top spending categories over the last 90 days.
          </p>
          <div className="space-y-3">
            {cardRecommendations.map(({ rec, additionalAnnual }, idx) => (
              <div
                key={rec.id}
                className="bg-luxury-elevated rounded-xl p-4 border border-luxury-border/60"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-luxury-text-primary">
                      {rec.issuer} {rec.name}
                    </p>
                    <p className="text-xs text-luxury-text-muted mt-0.5">
                      {rec.annualFee === 0 ? "No annual fee" : `$${rec.annualFee}/yr annual fee`}
                      {additionalAnnual > 10 && (
                        <span className="ml-2 text-luxury-accent-mint font-medium">
                          ~+${Math.round(additionalAnnual)}/yr in added value
                        </span>
                      )}
                    </p>
                  </div>
                  {idx === 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-luxury-accent-indigo/15 text-luxury-accent-indigo border border-luxury-accent-indigo/20 flex-shrink-0">
                      <Star className="h-2.5 w-2.5" /> Best match
                    </span>
                  )}
                </div>

                {/* Rate pills */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(Object.entries(rec.categoryRates) as [Category, { rate: number; unit: "x" | "%" }][]).map(
                    ([cat, rateInfo]) => (
                      <span
                        key={cat}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-luxury-bg border border-luxury-border text-luxury-text-secondary"
                      >
                        {rateInfo.rate}{rateInfo.unit} {categoryMeta[cat]?.label ?? cat}
                      </span>
                    )
                  )}
                  {rec.everythingRate && rec.everythingRate > 1 && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-luxury-bg border border-luxury-border text-luxury-text-secondary">
                      {rec.everythingRate}{rec.everythingUnit ?? "x"} everything else
                    </span>
                  )}
                </div>

                <p className="text-xs text-luxury-text-muted leading-relaxed">{rec.highlight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasData && !loading && (
        <div className="text-center py-10">
          <Zap className="h-8 w-8 text-luxury-text-muted mx-auto mb-3" />
          <p className="text-sm text-luxury-text-secondary font-medium">No transaction data yet</p>
          <p className="text-xs text-luxury-text-muted mt-1 leading-relaxed max-w-xs mx-auto">
            Connect a bank account to unlock spending insights and personalized card recommendations.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <ExpandableSection
      title="Spending Insights"
      badge={hasData ? `${sortedCategories.length} categories` : undefined}
      collapsedContent={CollapsedContent}
      expandedContent={ExpandedContent}
    />
  );
}

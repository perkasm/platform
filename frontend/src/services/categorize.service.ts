/**
 * AI-powered transaction categorization via OpenRouter.
 *
 * Batches transaction descriptions → single LLM call → caches results in
 * localStorage so repeat page loads don't re-bill the API.
 */

export type TxCategory =
  | "dining"
  | "travel"
  | "groceries"
  | "gas"
  | "shopping"
  | "streaming"
  | "other";

const CATEGORIES: TxCategory[] = [
  "dining", "travel", "groceries", "gas", "shopping", "streaming", "other",
];

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";
const CACHE_KEY = "perkasm_tx_categories_v2";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const BATCH_SIZE = 80; // descriptions per API call
const ADVICE_CACHE_KEY = "perkasm_spending_advice_v1";
const ADVICE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

// ─── Cache helpers ────────────────────────────────────────────────────────────

interface CacheEntry {
  category: TxCategory;
  ts: number;
}

function readCache(): Record<string, CacheEntry> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, CacheEntry>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage full — ignore
  }
}

/** Stable cache key: description + merchant + Teller category hint */
function txCacheKey(description: string, merchantName?: string, tellerCat?: string): string {
  return `${description.toLowerCase().trim()}|${merchantName?.toLowerCase().trim() ?? ""}|${tellerCat ?? ""}`;
}

// ─── OpenRouter call ──────────────────────────────────────────────────────────

/** Strip common bank-generated prefixes so the model sees the actual merchant name */
function stripBankPrefix(text: string): string {
  return text
    .replace(/^sq\s*\*\s*/i, "")
    .replace(/^tst\s*\*\s*/i, "")
    .replace(/^pp\s*\*\s*/i, "")
    .replace(/^paypal\s*\*\s*/i, "")
    .replace(/^sp\s+\*\s*/i, "")
    .replace(/^checkcard\s+\d+\s+/i, "")
    .replace(/^debit card\s+\d+\s+/i, "")
    .replace(/^pos\s+(debit|credit|purchase)\s+/i, "")
    .replace(/^ach\s+(debit|credit)\s+/i, "")
    .replace(/^purchase\s+authorized\s+on\s+\d+\/\d+\s+/i, "")
    .replace(/^recurring\s+(debit\s+)?/i, "")
    .replace(/\s+#\d+\s*\w{0,4}(\s+.*)?$/, "")
    .replace(/\s+\d{6,}.*$/, "")
    .replace(/\s+\d{2}\/\d{2}(\s+.*)?$/, "")
    .trim();
}

async function callOpenRouter(
  items: TxMeta[],
  apiKey: string,
): Promise<Record<number, TxCategory>> {
  const numbered = items
    .map((item, i) => {
      const cleaned = stripBankPrefix(item.description);
      // Show cleaned name first; if different from raw, include original for context
      const parts: string[] = [cleaned !== item.description ? `${cleaned} (raw: ${item.description})` : item.description];
      if (item.merchantName && item.merchantName.toLowerCase() !== cleaned.toLowerCase()) {
        parts.push(`merchant: ${item.merchantName}`);
      }
      if (item.amount) {
        const abs = Math.abs(parseFloat(item.amount));
        if (!isNaN(abs)) parts.push(`$${abs.toFixed(2)}`);
      }
      if (item.tellerCategory) parts.push(`hint: ${item.tellerCategory}`);
      return `${i + 1}. ${parts.join(" | ")}`;
    })
    .join("\n");

  const system = `You are a financial transaction categorizer.
Classify each bank transaction description into exactly one of these categories:
- dining: restaurants, cafes, bars, food delivery (DoorDash, Uber Eats, etc.)
- travel: airlines, hotels, car rental, rideshare (Uber rides, Lyft), Airbnb, booking sites, parking
- groceries: supermarkets, grocery stores, grocery delivery (Instacart, Shipt)
- gas: gas stations (Shell, Chevron, BP, etc.), EV charging
- shopping: retail stores, e-commerce (Amazon, eBay, Target), department stores, clothing
- streaming: streaming services (Netflix, Spotify, Hulu), software subscriptions (Adobe, Microsoft 365)
- other: utilities, insurance, ATM, bank fees, transfers, medical, anything unclear

Return ONLY a valid JSON object with integer keys 1..N and category values. No explanation.
Example: {"1":"dining","2":"streaming","3":"other"}`;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Perkasm",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Categorize these ${items.length} transactions:\n${numbered}` },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => response.statusText);
    throw new Error(`OpenRouter ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? "{}";

  try {
    const parsed: Record<string, string> = JSON.parse(content);
    const result: Record<number, TxCategory> = {};
    for (let i = 1; i <= descriptions.length; i++) {
      const raw = parsed[String(i)]?.toLowerCase().trim();
      result[i] = (CATEGORIES.includes(raw as TxCategory) ? raw : "other") as TxCategory;
    }
    return result;
  } catch {
    console.warn("[categorize] failed to parse LLM response:", content);
    return {};
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface TxMeta {
  id: string;
  description: string;
  amount?: string;         // raw transaction amount (negative = debit)
  merchantName?: string;   // counterparty name from Teller, if present
  tellerCategory?: string; // details.category from Teller, if present
}

/**
 * Returns a map of transaction id → TxCategory.
 * Reads from cache first, calls OpenRouter for any misses, writes back to cache.
 */
export async function enrichCategories(
  transactions: TxMeta[],
  apiKey: string,
): Promise<Record<string, TxCategory>> {
  if (!apiKey || transactions.length === 0) return {};

  const cache = readCache();
  const now = Date.now();
  const result: Record<string, TxCategory> = {};
  const toFetch: Array<{ idx: number; id: string; description: string; cacheKey: string }> = [];

  for (const tx of transactions) {
    const key = txCacheKey(tx.description, tx.merchantName, tx.tellerCategory);
    const entry = cache[key];
    if (entry && now - entry.ts < CACHE_TTL_MS) {
      result[tx.id] = entry.category;
    } else {
      toFetch.push({ idx: toFetch.length, id: tx.id, description: tx.description, cacheKey: key });
    }
  }

  if (toFetch.length === 0) return result;

  // Process in batches
  for (let start = 0; start < toFetch.length; start += BATCH_SIZE) {
    const batch = toFetch.slice(start, start + BATCH_SIZE);
    // Build TxMeta for the batch items (preserve merchantName/amount from original)
    const batchMeta: TxMeta[] = batch.map((b) => {
      const original = transactions.find((t) => t.id === b.id);
      return original ?? { id: b.id, description: b.description };
    });
    try {
      const categories = await callOpenRouter(batchMeta, apiKey);
      for (let i = 0; i < batch.length; i++) {
        const cat = categories[i + 1] ?? "other";
        const item = batch[i];
        result[item.id] = cat;
        cache[item.cacheKey] = { category: cat, ts: now };
      }
    } catch (err) {
      console.error("[categorize] batch failed:", err);
      // Leave missing entries — callers fall back to regex
    }
  }

  writeCache(cache);
  return result;
}

// ─── AI Spending Advice ───────────────────────────────────────────────────────

function adviceCacheKey(categorySpend: Record<string, number>, totalSpend: number): string {
  const rounded = Object.entries(categorySpend)
    .filter(([, v]) => v > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${Math.round(v / 10) * 10}`)
    .join("|");
  return `advice|${Math.round(totalSpend / 10) * 10}|${rounded}`;
}

/**
 * Generates AI-powered spending insights and card recommendations.
 * Returns an array of advice strings, each ready to display as a bullet.
 * Results are cached for 24 hours.
 */
export async function generateSpendingAdvice(
  categorySpend: Record<string, number>,
  totalSpend: number,
  topMerchants: string[],
  cardNames: string[],
  apiKey: string,
): Promise<string[]> {
  if (!apiKey || totalSpend === 0) return [];

  const cacheKey = adviceCacheKey(categorySpend, totalSpend);
  try {
    const cached: Record<string, { advice: string[]; ts: number }> =
      JSON.parse(localStorage.getItem(ADVICE_CACHE_KEY) ?? "{}");
    const entry = cached[cacheKey];
    if (entry && Date.now() - entry.ts < ADVICE_CACHE_TTL_MS) return entry.advice;
  } catch { /* ignore */ }

  const breakdown = Object.entries(categorySpend)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => `  - ${k}: $${v.toFixed(0)} (${Math.round((v / totalSpend) * 100)}%)`)
    .join("\n");

  const merchantLine = topMerchants.length > 0
    ? `\nFrequent merchants: ${topMerchants.slice(0, 8).join(", ")}`
    : "";

  const cardLine = cardNames.length > 0
    ? `\nUser's current cards: ${cardNames.join(", ")}`
    : "\nNo cards added yet";

  const prompt = `You are a credit card rewards optimizer with deep knowledge of reward rates and benefits.

A user's spending over the last 90 days ($${totalSpend.toFixed(0)} total):
${breakdown}${merchantLine}${cardLine}

Analyze their spending patterns and return a JSON object with key "insights" containing an array of exactly 4 strings. Each string should be one actionable, specific insight under 160 characters. Requirements:
1. Note the most significant spending pattern (use specific dollar amounts or percentages).
2. Evaluate if their current cards are optimal for their top 1-2 categories — be specific about reward rates.
3. Recommend one specific credit card (name it) that would meaningfully improve their rewards, with estimated dollar value.
4. Give one quick optimization tip they can act on immediately.

Return only the JSON object, no other text.`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Perkasm",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter ${response.status}`);
    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? "{}";

    const parsed = JSON.parse(content);
    const raw: unknown =
      parsed.insights ?? parsed.advice ?? parsed.recommendations ?? Object.values(parsed)[0];
    const advice: string[] = Array.isArray(raw)
      ? (raw as unknown[]).filter((s) => typeof s === "string").slice(0, 5) as string[]
      : [];

    try {
      const cache: Record<string, { advice: string[]; ts: number }> =
        JSON.parse(localStorage.getItem(ADVICE_CACHE_KEY) ?? "{}");
      cache[cacheKey] = { advice, ts: Date.now() };
      localStorage.setItem(ADVICE_CACHE_KEY, JSON.stringify(cache));
    } catch { /* storage full */ }

    return advice;
  } catch (err) {
    console.warn("[spending-advice] failed:", err);
    return [];
  }
}

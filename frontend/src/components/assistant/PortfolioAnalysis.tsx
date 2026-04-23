import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEdit } from "@/contexts/EditContext";
import { buildSystemPrompt } from "@/lib/buildSystemPrompt";
import { streamChat } from "@/lib/openrouter";
import { normalizeMarkdown } from "@/lib/formatMarkdown";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY ?? "";
const CACHE_KEY = "perkasm_portfolio_analysis_v3";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

interface CachedAnalysis {
  content: string;
  generatedAt: number;
  cardCount: number;
}

function loadCache(cardCount: number): CachedAnalysis | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedAnalysis = JSON.parse(raw);
    if (Date.now() - parsed.generatedAt > CACHE_TTL_MS) return null;
    if (parsed.cardCount !== cardCount) return null;
    return parsed;
  } catch {
    return null;
  }
}

const ANALYSIS_PROMPT = `Give me a portfolio analysis of my cards with:
1. A summary table of all my cards (name, earn rates, annual fee, key perks)
2. The best card to use for each spending category based on my actual cards
3. Top 3 actionable recommendations to maximize my rewards

Use markdown tables and formatting. Be thorough but scannable.`;

export function PortfolioAnalysis() {
  const { cards, transactions, loyaltyPrograms, portfolioStats } = useEdit();

  const [analysis, setAnalysis] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [generatedAt, setGeneratedAt] = useState<number | null>(null);
  const hasRunRef = useRef(false);

  const generate = useCallback(async () => {
    const systemPrompt = buildSystemPrompt({
      cards,
      transactions,
      loyaltyPrograms,
      portfolioStats,
    });

    setIsStreaming(true);
    setAnalysis("");

    let full = "";
    try {
      for await (const chunk of streamChat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: ANALYSIS_PROMPT },
        ],
        API_KEY
      )) {
        full += chunk;
        setAnalysis(full);
      }

      const cache: CachedAnalysis = {
        content: full,
        generatedAt: Date.now(),
        cardCount: cards.length,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      setGeneratedAt(cache.generatedAt);
    } catch (err) {
      setAnalysis("_Failed to generate analysis. Try refreshing._");
      console.error(err);
    } finally {
      setIsStreaming(false);
    }
  }, [cards, transactions, loyaltyPrograms, portfolioStats]);

  useEffect(() => {
    if (cards.length === 0) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const cached = loadCache(cards.length);
    if (cached) {
      setAnalysis(cached.content);
      setGeneratedAt(cached.generatedAt);
    } else {
      generate();
    }
  }, [cards.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (cards.length === 0) return null;

  const timeAgo = generatedAt
    ? (() => {
        const mins = Math.floor((Date.now() - generatedAt) / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
      })()
    : null;

  return (
    <div className="bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden mb-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-luxury-elevated/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-luxury-accent-indigo to-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-luxury-text-primary font-ui">
              Portfolio Analysis
            </p>
            {timeAgo && !isStreaming && (
              <p className="text-[11px] text-luxury-text-muted font-ui">Generated {timeAgo}</p>
            )}
            {isStreaming && (
              <p className="text-[11px] text-luxury-accent-indigo font-ui">Analyzing your cards…</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isStreaming && analysis && (
            <button
              onClick={(e) => { e.stopPropagation(); hasRunRef.current = false; generate(); }}
              className="p-1.5 rounded-full hover:bg-luxury-elevated transition-colors text-luxury-text-muted hover:text-luxury-accent-indigo"
              title="Refresh analysis"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
          {isExpanded
            ? <ChevronUp className="h-4 w-4 text-luxury-text-muted" />
            : <ChevronDown className="h-4 w-4 text-luxury-text-muted" />
          }
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-luxury-border">
          {!analysis && isStreaming && (
            <div className="pt-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-3 bg-gradient-to-r from-luxury-elevated via-luxury-border/40 to-luxury-elevated bg-[length:200%_100%] animate-shimmer rounded-full ${i === 4 ? "w-1/2" : "w-full"}`} />
              ))}
            </div>
          )}
          {analysis && (
            <div className="pt-4 text-sm leading-relaxed prose prose-sm prose-invert max-w-none
              prose-p:my-1.5 prose-p:leading-relaxed
              prose-headings:font-semibold prose-h2:text-base prose-h2:mt-4 prose-h2:mb-2 prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1
              prose-strong:font-semibold
              prose-ul:my-1.5 prose-ul:pl-4 prose-li:my-0.5
              prose-ol:my-1.5 prose-ol:pl-4
              prose-hr:my-4 prose-hr:border-luxury-border
              prose-th:bg-luxury-bg prose-th:px-2.5 prose-th:py-2 prose-th:text-left prose-th:font-semibold
              prose-td:px-2.5 prose-td:py-2 prose-td:border-b prose-td:border-luxury-border
              [&_table]:border-collapse [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:rounded-lg [&_table]:border [&_table]:border-luxury-border
              [&_thead]:bg-luxury-bg
              [&_tr:last-child_td]:border-b-0
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {normalizeMarkdown(analysis)}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

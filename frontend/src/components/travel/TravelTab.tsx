import { useState, useRef, useEffect } from "react";
import { Plane, Calendar, Users, Search, ArrowUp, Sparkles, AlertCircle, ArrowLeftRight, MapPin, CreditCard, ChevronRight, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { streamChat, type ChatMessage } from "@/lib/openrouter";
import { useEdit } from "@/contexts/EditContext";
import { MessageBubble, type Message } from "@/components/assistant/MessageBubble";
import { POINT_VALUATIONS, TRANSFER_PARTNERS, searchAirports, type Airport } from "@/data/travelData";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY ?? "";
const MAX_CALLS = 20;

let idCounter = 0;
const uid = () => `tv-${++idCounter}`;

// ── Types ──────────────────────────────────────────────────────────────────────

interface FlightOption {
  cabin: string;
  estimatedPrice: number;
  airline: string;
  notes?: string;
}

interface PointsRedemption {
  program: string;
  pointsNeeded: number;
  totalPoints: number;
  status: "sufficient" | "close" | "insufficient";
  partner: string;
  cpp: number;
  notes: string;
}

interface TransferOpportunity {
  currency: string;
  transferTo: string;
  ratio: string;
  pointsNeeded: number;
  notes: string;
}

interface BestCard {
  name: string;
  reason: string;
  bonus: string;
}

interface TripAnalysis {
  cashOptions: FlightOption[];
  pointsRedemptions: PointsRedemption[];
  transferOpportunities: TransferOpportunity[];
  bestCard: BestCard | null;
  summary: string;
}

interface TripContext {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  travelers: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildTravelSystemPrompt(
  cards: ReturnType<typeof useEdit>["cards"],
  loyaltyPrograms: ReturnType<typeof useEdit>["loyaltyPrograms"]
): string {
  const cardLines =
    cards.length > 0
      ? cards
          .map((c) => {
            const cpp = POINT_VALUATIONS[c.primaryReward]?.cpp ?? 1.0;
            return `- ${c.name}: ${c.balance.toLocaleString()} ${c.primaryReward} pts (CPP: ~${cpp}¢/pt)`;
          })
          .join("\n")
      : "No cards on file.";

  const programLines =
    loyaltyPrograms.length > 0
      ? loyaltyPrograms
          .map(
            (p) =>
              `- ${p.name}: ${p.balance.toLocaleString()} pts @ ${p.cpp}¢/pt (balance value: $${p.dollarValue.toFixed(2)})`
          )
          .join("\n")
      : "No loyalty programs.";

  const relevantTransfers = Object.entries(TRANSFER_PARTNERS).filter(([prog]) =>
    loyaltyPrograms.some(
      (p) =>
        p.name.toLowerCase().includes(prog.toLowerCase()) ||
        prog.toLowerCase().includes(p.name.toLowerCase()) ||
        p.shortName?.toLowerCase().includes(prog.split(" ")[0].toLowerCase())
    )
  );

  const transferLines =
    relevantTransfers.length > 0
      ? relevantTransfers
          .map(
            ([prog, partners]) =>
              `- ${prog} → Airlines: ${partners.airlines.join(", ")}${partners.hotels.length > 0 ? `; Hotels: ${partners.hotels.join(", ")}` : ""} (ratio: ${partners.ratio})`
          )
          .join("\n")
      : "No matching transfer partners found.";

  return `You are a travel rewards expert. You MUST respond with ONLY a valid JSON object — no markdown, no code fences, no explanation, just raw JSON.

## User's Cards & Points
${cardLines}

## Loyalty Program Balances
${programLines}

## Available Transfer Partners
${transferLines}

JSON schema you must follow exactly:
{
  "cashOptions": [{"cabin":"string","estimatedPrice":number,"airline":"string","notes":"string"}],
  "pointsRedemptions": [{"program":"string","pointsNeeded":number,"totalPoints":number,"status":"sufficient"|"close"|"insufficient","partner":"string","cpp":number,"notes":"string"}],
  "transferOpportunities": [{"currency":"string","transferTo":"string","ratio":"string","pointsNeeded":number,"notes":"string"}],
  "bestCard":{"name":"string","reason":"string","bonus":"string"}|null,
  "summary":"string"
}

Rules:
- estimatedPrice is per person in USD
- pointsNeeded is per person, totalPoints = pointsNeeded × number of travelers
- status: "sufficient" if user balance ≥ totalPoints, "close" if within 25%, "insufficient" otherwise
- Only include programs and transfer partners the user actually has
- cashOptions: include economy and business at minimum
- summary: 1-2 sentences, plain text, no markdown`;
}

function buildSearchQuery(trip: TripContext): string {
  return `Analyze a ${trip.returnDate ? "round-trip" : "one-way"} flight from ${trip.origin} to ${trip.destination}, departing ${trip.departDate}${trip.returnDate ? `, returning ${trip.returnDate}` : ""}, for ${trip.travelers} traveler${trip.travelers > 1 ? "s" : ""}. Return the JSON object only.`;
}

function parseAnalysis(raw: string): TripAnalysis | null {
  try {
    // Strip markdown fences if model ignores instructions
    const cleaned = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    const idx = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (idx === -1 || last === -1) return null;
    return JSON.parse(cleaned.slice(idx, last + 1)) as TripAnalysis;
  } catch {
    return null;
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "sufficient" | "close" | "insufficient" }) {
  if (status === "sufficient")
    return (
      <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
        <CheckCircle className="h-3 w-3" /> Enough points
      </span>
    );
  if (status === "close")
    return (
      <span className="flex items-center gap-1 text-amber-400 text-[11px] font-medium">
        <AlertTriangle className="h-3 w-3" /> Close
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-red-400 text-[11px] font-medium">
      <XCircle className="h-3 w-3" /> Not enough
    </span>
  );
}

function TripResultsPanel({ analysis }: { analysis: TripAnalysis }) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      {analysis.summary && (
        <p className="text-luxury-text-secondary text-sm leading-relaxed">{analysis.summary}</p>
      )}

      {/* Cash Prices */}
      {analysis.cashOptions.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-luxury-text-muted mb-2.5">
            Estimated Cash Prices
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {analysis.cashOptions.map((opt, i) => (
              <div
                key={i}
                className="bg-luxury-bg border border-luxury-border rounded-xl p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Plane className="h-3.5 w-3.5 text-luxury-accent-indigo flex-shrink-0" />
                    <p className="text-luxury-text-primary font-semibold text-sm">{opt.cabin}</p>
                  </div>
                  <p className="text-luxury-text-muted text-xs">{opt.airline}</p>
                  {opt.notes && (
                    <p className="text-luxury-text-muted text-[11px] mt-1 leading-snug">{opt.notes}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-luxury-text-primary font-mono-data font-bold text-xl">
                    ${opt.estimatedPrice.toLocaleString()}
                  </p>
                  <p className="text-luxury-text-muted text-[11px]">per person</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points Redemptions */}
      {analysis.pointsRedemptions.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-luxury-text-muted mb-2.5">
            Points Redemption Options
          </h3>
          <div className="space-y-2.5">
            {analysis.pointsRedemptions.map((r, i) => (
              <div
                key={i}
                className={`bg-luxury-bg border rounded-xl p-4 ${
                  r.status === "sufficient"
                    ? "border-emerald-500/25"
                    : r.status === "close"
                    ? "border-amber-500/25"
                    : "border-luxury-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-luxury-text-primary font-semibold text-sm">{r.program}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-luxury-text-muted text-xs">
                      Book via {r.partner} · {r.cpp}¢/pt
                    </p>
                    {r.notes && (
                      <p className="text-luxury-text-muted text-[11px] mt-1.5 leading-relaxed">{r.notes}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-luxury-text-primary font-mono-data font-bold text-lg">
                      {r.totalPoints.toLocaleString()}
                    </p>
                    <p className="text-luxury-text-muted text-[11px]">pts needed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer Opportunities */}
      {analysis.transferOpportunities.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-luxury-text-muted mb-2.5">
            Transfer Opportunities
          </h3>
          <div className="space-y-2">
            {analysis.transferOpportunities.map((t, i) => (
              <div
                key={i}
                className="bg-luxury-bg border border-luxury-border rounded-xl p-3.5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-luxury-accent-indigo font-semibold text-sm">{t.currency}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-luxury-text-muted" />
                  <span className="text-luxury-text-secondary text-sm">{t.transferTo}</span>
                  <span className="ml-auto text-luxury-text-muted text-[11px] bg-luxury-elevated px-2 py-0.5 rounded-full flex-shrink-0">
                    {t.ratio}
                  </span>
                  <span className="text-luxury-text-primary font-mono-data text-sm font-semibold flex-shrink-0">
                    {t.pointsNeeded.toLocaleString()} pts
                  </span>
                </div>
                {t.notes && (
                  <p className="text-luxury-text-muted text-[11px] leading-relaxed">{t.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Card */}
      {analysis.bestCard && (
        <div className="bg-gradient-to-r from-luxury-accent-indigo/10 to-purple-600/10 border border-luxury-accent-indigo/25 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-luxury-accent-indigo/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CreditCard className="h-4 w-4 text-luxury-accent-indigo" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-luxury-accent-indigo mb-1">
                Best Card to Book With
              </p>
              <p className="text-luxury-text-primary font-semibold text-sm">{analysis.bestCard.name}</p>
              <p className="text-luxury-text-muted text-xs mt-0.5">
                {analysis.bestCard.bonus} · {analysis.bestCard.reason}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AirportInput({
  value,
  onChange,
  placeholder,
  label,
  icon,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
  icon: React.ReactNode;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (focused) {
      setResults(searchAirports(query));
      setOpen(searchAirports(query).length > 0);
    }
  }, [query, focused]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (airport: Airport) => {
    const label = `${airport.city} (${airport.code})`;
    setQuery(label);
    onChange(label);
    setOpen(false);
    setFocused(false);
  };

  return (
    <div ref={wrapRef} className="relative flex-1 min-w-0">
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-luxury-text-muted font-ui mb-1 pl-1">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 bg-luxury-bg border rounded-xl px-3 py-2.5 transition-all duration-150 ${
          focused
            ? "border-luxury-accent-indigo/60 ring-1 ring-luxury-accent-indigo/20"
            : "border-luxury-border"
        }`}
      >
        <span className="text-luxury-text-muted flex-shrink-0">{icon}</span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => {
            setFocused(true);
            setResults(searchAirports(query));
            if (searchAirports(query).length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-luxury-text-primary placeholder:text-luxury-text-muted outline-none min-w-0"
        />
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-luxury-surface border border-luxury-border rounded-xl shadow-xl overflow-hidden"
          >
            {results.map((airport) => (
              <button
                key={airport.code}
                onMouseDown={() => select(airport)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-luxury-elevated text-left transition-colors"
              >
                <span className="text-luxury-accent-indigo font-mono-data text-sm font-bold w-10 flex-shrink-0">
                  {airport.code}
                </span>
                <div className="min-w-0">
                  <p className="text-luxury-text-primary text-sm truncate">{airport.city}</p>
                  <p className="text-luxury-text-muted text-[11px] truncate">{airport.name}</p>
                </div>
                <span className="ml-auto text-luxury-text-muted text-[11px] flex-shrink-0">
                  {airport.country}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function TravelTab() {
  const { cards, loyaltyPrograms } = useEdit();

  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [showTravelerPopup, setShowTravelerPopup] = useState(false);

  const [tripContext, setTripContext] = useState<TripContext | null>(null);
  const [tripAnalysis, setTripAnalysis] = useState<TripAnalysis | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [streamProgress, setStreamProgress] = useState("");

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatStreaming, setIsChatStreaming] = useState(false);

  const [callCount, setCallCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const travelerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (travelerRef.current && !travelerRef.current.contains(e.target as Node)) {
        setShowTravelerPopup(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasNoCards = cards.length === 0;
  const atLimit = callCount >= MAX_CALLS;

  const swapAirports = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSearch = async () => {
    if (!origin.trim() || !destination.trim() || !departDate) return;
    if (atLimit) {
      setError("Search limit reached for this session (20 searches).");
      return;
    }

    const trip: TripContext = {
      origin,
      destination,
      departDate,
      returnDate: tripType === "roundtrip" ? returnDate : "",
      travelers,
    };
    setTripContext(trip);
    setIsSearching(true);
    setTripAnalysis(null);
    setStreamProgress("");
    setError(null);
    setCallCount((c) => c + 1);

    const systemPrompt = buildTravelSystemPrompt(cards, loyaltyPrograms);
    const searchQuery = buildSearchQuery(trip);

    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: searchQuery },
    ];

    let fullResponse = "";
    try {
      for await (const chunk of streamChat(apiMessages, API_KEY, { jsonMode: true })) {
        fullResponse += chunk;
        setStreamProgress(fullResponse);
      }

      const parsed = parseAnalysis(fullResponse);
      if (parsed) {
        setTripAnalysis(parsed);
        setChatHistory([
          { role: "user", content: searchQuery },
          { role: "assistant", content: fullResponse },
        ]);
      } else {
        setError("Couldn't parse the AI response. Try searching again.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Search failed";
      setError(msg);
    } finally {
      setIsSearching(false);
      setStreamProgress("");
    }
  };

  const sendChatMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isChatStreaming) return;
    if (atLimit) {
      setError("Rate limit reached for this session (20 queries).");
      return;
    }

    setChatInput("");
    setError(null);
    setCallCount((c) => c + 1);

    const userMsg: Message = { id: uid(), role: "user", content: trimmed };
    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);

    // Chat uses a conversational system prompt (not JSON)
    const chatSystemPrompt = `You are a travel rewards expert. Answer conversationally about points, miles, and travel strategy. Be specific and reference the user's actual data where relevant.\n\n${buildTravelSystemPrompt(cards, loyaltyPrograms)}${tripContext ? `\n\nCurrent trip: ${tripContext.origin} → ${tripContext.destination}, departing ${tripContext.departDate}${tripContext.returnDate ? `, returning ${tripContext.returnDate}` : ""}, ${tripContext.travelers} traveler(s).` : ""}`;

    const updatedHistory: ChatMessage[] = [...chatHistory, { role: "user", content: trimmed }];
    const apiMessages: ChatMessage[] = [
      { role: "system", content: chatSystemPrompt },
      ...updatedHistory,
    ];

    const assistantId = uid();
    setChatMessages([
      ...nextMessages,
      { id: assistantId, role: "assistant", content: "", isTyping: true },
    ]);
    setIsChatStreaming(true);

    let fullResponse = "";
    try {
      for await (const chunk of streamChat(apiMessages, API_KEY)) {
        fullResponse += chunk;
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fullResponse, isTyping: false } : m
          )
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setChatMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsChatStreaming(false);
    }

    if (fullResponse) {
      setChatHistory([...updatedHistory, { role: "assistant", content: fullResponse }]);
    }
  };

  const positiveBalances = loyaltyPrograms.filter((p) => p.balance > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-4">

      {/* ── Hero Search Card ── */}
      <div className="bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 bg-luxury-elevated rounded-lg p-0.5">
            {(["roundtrip", "oneway"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTripType(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium font-ui transition-all duration-150 ${
                  tripType === type
                    ? "bg-luxury-surface text-luxury-text-primary shadow-sm"
                    : "text-luxury-text-muted hover:text-luxury-text-secondary"
                }`}
              >
                {type === "roundtrip" ? "Round trip" : "One way"}
              </button>
            ))}
          </div>

          {positiveBalances.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {positiveBalances.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-luxury-elevated border border-luxury-border rounded-full px-3 py-1"
                >
                  <span className="text-luxury-text-muted font-ui text-[10px]">{p.shortName}</span>
                  <span className="text-luxury-text-primary font-mono-data text-[11px] font-semibold">
                    {p.balance.toLocaleString()}
                  </span>
                  <span className="text-luxury-text-muted font-mono-data text-[10px]">
                    · ${p.dollarValue.toFixed(0)}
                  </span>
                </div>
              ))}
              {positiveBalances.length > 4 && (
                <span className="text-luxury-text-muted text-[11px] font-ui flex-shrink-0">
                  +{positiveBalances.length - 4} more
                </span>
              )}
            </div>
          )}
          {hasNoCards && (
            <p className="text-luxury-text-muted text-xs font-ui">
              Add cards in Dashboard to see your points
            </p>
          )}
        </div>

        <div className="px-5 pb-5 space-y-3">
          <div className="flex items-end gap-2">
            <AirportInput
              value={origin}
              onChange={setOrigin}
              placeholder="City or airport"
              label="From"
              icon={<MapPin className="h-3.5 w-3.5" />}
            />
            <button
              onClick={swapAirports}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-luxury-border bg-luxury-elevated text-luxury-text-muted hover:text-luxury-accent-indigo hover:border-luxury-accent-indigo/40 transition-all duration-150 self-end mb-1"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </button>
            <AirportInput
              value={destination}
              onChange={setDestination}
              placeholder="City or airport"
              label="To"
              icon={<Plane className="h-3.5 w-3.5" />}
            />
          </div>

          <div className="flex items-end gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex-1 min-w-[130px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-luxury-text-muted font-ui mb-1 pl-1">
                Depart
              </label>
              <div className="flex items-center gap-2 bg-luxury-bg border border-luxury-border rounded-xl px-3 py-2.5 focus-within:border-luxury-accent-indigo/60 focus-within:ring-1 focus-within:ring-luxury-accent-indigo/20 transition-all">
                <Calendar className="h-3.5 w-3.5 text-luxury-text-muted flex-shrink-0" />
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-luxury-text-primary outline-none min-w-0"
                />
              </div>
            </div>

            {tripType === "roundtrip" && (
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-luxury-text-muted font-ui mb-1 pl-1">
                  Return
                </label>
                <div className="flex items-center gap-2 bg-luxury-bg border border-luxury-border rounded-xl px-3 py-2.5 focus-within:border-luxury-accent-indigo/60 focus-within:ring-1 focus-within:ring-luxury-accent-indigo/20 transition-all">
                  <Calendar className="h-3.5 w-3.5 text-luxury-text-muted flex-shrink-0" />
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-luxury-text-primary outline-none min-w-0"
                  />
                </div>
              </div>
            )}

            <div ref={travelerRef} className="relative flex-shrink-0">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-luxury-text-muted font-ui mb-1 pl-1">
                Travelers
              </label>
              <button
                onClick={() => setShowTravelerPopup((v) => !v)}
                className="flex items-center gap-2 bg-luxury-bg border border-luxury-border rounded-xl px-3 py-2.5 text-sm text-luxury-text-primary hover:border-luxury-accent-indigo/40 transition-all w-28"
              >
                <Users className="h-3.5 w-3.5 text-luxury-text-muted flex-shrink-0" />
                <span className="font-mono-data">
                  {travelers} {travelers === 1 ? "adult" : "adults"}
                </span>
              </button>
              <AnimatePresence>
                {showTravelerPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute z-50 right-0 mt-1 bg-luxury-surface border border-luxury-border rounded-xl shadow-xl p-4 w-44"
                  >
                    <p className="text-xs font-semibold text-luxury-text-secondary font-ui mb-3">Adults</p>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-luxury-border text-luxury-text-secondary hover:border-luxury-accent-indigo/40 hover:text-luxury-accent-indigo transition-all font-medium text-lg"
                      >
                        −
                      </button>
                      <span className="text-luxury-text-primary font-mono-data font-semibold text-lg">
                        {travelers}
                      </span>
                      <button
                        onClick={() => setTravelers((t) => Math.min(9, t + 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-luxury-border text-luxury-text-secondary hover:border-luxury-accent-indigo/40 hover:text-luxury-accent-indigo transition-all font-medium text-lg"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => setShowTravelerPopup(false)}
                      className="mt-3 w-full text-xs text-luxury-accent-indigo font-ui font-medium hover:underline"
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleSearch}
              disabled={!origin.trim() || !destination.trim() || !departDate || isSearching || atLimit}
              className="flex items-center gap-2 bg-gradient-to-r from-luxury-accent-indigo to-purple-600 hover:opacity-90 disabled:from-luxury-elevated disabled:to-luxury-elevated disabled:text-luxury-text-muted text-white rounded-xl px-5 py-2.5 text-sm font-medium font-ui transition-all duration-200 disabled:cursor-not-allowed shadow-glow-indigo/30 flex-shrink-0 self-end"
            >
              {isSearching ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Analyzing…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </button>
          </div>

          {callCount > 0 && (
            <p className="text-right text-[11px] text-luxury-text-muted font-ui">
              {MAX_CALLS - callCount} AI searches remaining
            </p>
          )}
        </div>
      </div>

      {/* ── Error banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading skeleton ── */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-luxury-surface border border-luxury-border rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-luxury-accent-indigo/30 border-t-luxury-accent-indigo rounded-full"
              />
              <span className="text-luxury-text-muted text-sm font-ui">Analyzing your points & options…</span>
            </div>
            {[80, 60, 70, 50].map((w, i) => (
              <motion.div
                key={i}
                className="h-3 bg-luxury-elevated rounded-full"
                style={{ width: `${w}%` }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trip Analysis Results ── */}
      <AnimatePresence>
        {tripAnalysis && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-luxury-border flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-luxury-accent-indigo" />
              <h2 className="text-luxury-text-primary font-ui text-sm font-semibold">AI Trip Analysis</h2>
              {tripContext && (
                <span className="ml-auto text-[11px] text-luxury-text-muted bg-luxury-elevated px-2.5 py-1 rounded-full font-mono-data">
                  {tripContext.origin} → {tripContext.destination}
                </span>
              )}
            </div>
            <div className="p-5">
              <TripResultsPanel analysis={tripAnalysis} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Travel Strategy Chat ── */}
      <div className="bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-luxury-border flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-luxury-accent-indigo" />
          <h2 className="text-luxury-text-primary font-ui text-sm font-semibold">Travel Strategy</h2>
          {tripContext && (
            <span className="ml-auto text-[11px] text-luxury-text-muted bg-luxury-elevated px-2.5 py-1 rounded-full font-mono-data">
              {tripContext.origin} → {tripContext.destination}
            </span>
          )}
        </div>

        <div className="h-64 overflow-y-auto px-5 py-4 space-y-4">
          {chatMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <p className="text-luxury-text-muted font-ui text-sm text-center">
                {tripContext
                  ? "Trip loaded — ask me anything."
                  : "Search a trip above, or ask a question directly."}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Worth transferring Chase points?",
                  "Best business class to Asia?",
                  "Which card for hotels?",
                  "Maximize points on airfare?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendChatMessage(prompt)}
                    disabled={hasNoCards || atLimit}
                    className="text-xs bg-luxury-elevated border border-luxury-border text-luxury-accent-indigo rounded-full px-3 py-1.5 hover:bg-luxury-bg hover:border-luxury-accent-indigo/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chatMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={chatBottomRef} />
        </div>

        <div className="px-5 py-3.5 border-t border-luxury-border">
          <div className="flex items-end gap-2 bg-luxury-elevated border border-luxury-border rounded-2xl px-4 py-3">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendChatMessage(chatInput);
                }
              }}
              placeholder={
                hasNoCards
                  ? "Add cards in Dashboard first…"
                  : atLimit
                  ? "Session limit reached"
                  : "Ask about points, transfers, booking strategy…"
              }
              rows={1}
              disabled={isChatStreaming || hasNoCards || atLimit}
              className="flex-1 bg-transparent text-sm text-luxury-text-primary placeholder:text-luxury-text-muted resize-none outline-none leading-relaxed max-h-28 disabled:opacity-50"
              style={{ scrollbarWidth: "none" }}
            />
            <button
              onClick={() => sendChatMessage(chatInput)}
              disabled={!chatInput.trim() || isChatStreaming || hasNoCards || atLimit}
              className="w-8 h-8 flex-shrink-0 bg-luxury-accent-indigo disabled:bg-luxury-elevated disabled:text-luxury-text-muted rounded-full flex items-center justify-center transition-all duration-200 hover:bg-purple-500 disabled:cursor-not-allowed"
            >
              <ArrowUp className="h-4 w-4 text-white" />
            </button>
          </div>
          <p className="text-center text-luxury-text-muted font-ui text-[10px] mt-1.5">
            AI responses may not reflect real-time prices — verify before booking
          </p>
        </div>
      </div>
    </div>
  );
}

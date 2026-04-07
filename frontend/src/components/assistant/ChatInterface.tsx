import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, AlertCircle, Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { MessageBubble, type Message } from "./MessageBubble";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { useEdit } from "@/contexts/EditContext";
import { useTellerData } from "@/hooks/use-teller-data";
import { buildSystemPrompt } from "@/lib/buildSystemPrompt";
import { streamChat, type ChatMessage } from "@/lib/openrouter";

// ── Types ────────────────────────────────────────────────────────────────────

interface StoredSession {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
  history: ChatMessage[];
}

// ── Constants ────────────────────────────────────────────────────────────────

let idCounter = 0;
const uid = () => `msg-${++idCounter}`;

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY ?? "";
const STORAGE_KEY = "perkasm_chat_sessions";
const MAX_SESSIONS = 3;

// ── Session storage helpers ──────────────────────────────────────────────────

function loadSessions(): StoredSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: StoredSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function upsertSession(
  sessions: StoredSession[],
  updated: StoredSession
): StoredSession[] {
  const exists = sessions.some((s) => s.id === updated.id);
  let next: StoredSession[];
  if (exists) {
    next = sessions.map((s) => (s.id === updated.id ? updated : s));
  } else {
    // Prepend new session, keep at most MAX_SESSIONS
    next = [updated, ...sessions].slice(0, MAX_SESSIONS);
  }
  saveSessions(next);
  return next;
}

function makeSessionId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeTitle(firstUserMessage: string): string {
  return firstUserMessage.length > 36
    ? firstUserMessage.slice(0, 33) + "…"
    : firstUserMessage;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ChatInterface() {
  const { cards, transactions, loyaltyPrograms, portfolioStats } = useEdit();
  const { accounts, transactions: tellerTransactions } = useTellerData();

  const [sessions, setSessions] = useState<StoredSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    () => loadSessions()[0]?.id ?? null
  );
  const [messages, setMessages] = useState<Message[]>(
    () => loadSessions()[0]?.messages ?? []
  );
  const [history, setHistory] = useState<ChatMessage[]>(
    () => loadSessions()[0]?.history ?? []
  );
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(
    () => (loadSessions()[0]?.messages ?? []).length === 0
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Tracks the session id being written to during a streaming response
  const streamingSessionRef = useRef<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Session management ──────────────────────────────────────────────────

  const startNewChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setHistory([]);
    setInput("");
    setError(null);
    setShowPrompts(true);
  }, []);

  const loadSession = useCallback((session: StoredSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setHistory(session.history);
    setError(null);
    setShowPrompts(false);
  }, []);

  // ── Messaging ───────────────────────────────────────────────────────────

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setShowPrompts(false);
    setInput("");
    setError(null);

    const userMsg: Message = { id: uid(), role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);

    const systemPrompt = buildSystemPrompt({
      cards,
      transactions,
      loyaltyPrograms,
      portfolioStats,
      teller: tellerTransactions.length > 0
        ? { accounts, transactions: tellerTransactions, cards }
        : undefined,
    });

    const updatedHistory: ChatMessage[] = [
      ...history,
      { role: "user", content: trimmed },
    ];

    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...updatedHistory,
    ];

    // Determine or create the session id for this conversation
    const sessionId = activeSessionId ?? makeSessionId();
    if (!activeSessionId) setActiveSessionId(sessionId);
    streamingSessionRef.current = sessionId;

    const assistantId = uid();
    const withTyping: Message[] = [
      ...nextMessages,
      { id: assistantId, role: "assistant", content: "", isTyping: true },
    ];
    setMessages(withTyping);
    setIsStreaming(true);

    let fullResponse = "";
    try {
      for await (const chunk of streamChat(apiMessages, API_KEY)) {
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: fullResponse, isTyping: false }
              : m
          )
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
      streamingSessionRef.current = null;
    }

    if (fullResponse) {
      const finalHistory: ChatMessage[] = [
        ...updatedHistory,
        { role: "assistant", content: fullResponse },
      ];
      setHistory(finalHistory);

      const finalMessages: Message[] = [
        ...nextMessages,
        { id: assistantId, role: "assistant", content: fullResponse },
      ];

      const isNewSession = !sessions.some((s) => s.id === sessionId);
      const session: StoredSession = {
        id: sessionId,
        title: isNewSession ? makeTitle(trimmed) : (sessions.find((s) => s.id === sessionId)?.title ?? makeTitle(trimmed)),
        createdAt: isNewSession ? new Date().toISOString() : (sessions.find((s) => s.id === sessionId)?.createdAt ?? new Date().toISOString()),
        messages: finalMessages,
        history: finalHistory,
      };

      setSessions((prev) => upsertSession(prev, session));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 130px)" }}>
      {/* Header */}
      <div className="text-center pt-8 pb-4 flex-shrink-0">
        <h1 className="text-[#1D1D1F] dark:text-slate-100 text-2xl font-semibold">
          Perkasm Assistant
        </h1>
        <p className="text-[#6E6E73] dark:text-slate-400 text-sm mt-1">
          Ask anything about your rewards, cards, or redemption strategy.
        </p>
      </div>

      {/* Chat history bar */}
      <div className="flex-shrink-0 px-4 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {/* New chat button */}
          <button
            onClick={startNewChat}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all duration-150 border ${
              activeSessionId === null
                ? "bg-[#0071E3] text-white border-[#0071E3]"
                : "bg-transparent text-[#6E6E73] dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-[#0071E3] hover:text-[#0071E3] dark:hover:text-[#0071E3]"
            }`}
          >
            <Plus className="h-3 w-3" />
            New chat
          </button>

          {/* Recent sessions */}
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => loadSession(session)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 max-w-[180px] truncate transition-all duration-150 border ${
                activeSessionId === session.id
                  ? "bg-[#0071E3] text-white border-[#0071E3]"
                  : "bg-transparent text-[#6E6E73] dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-[#0071E3] hover:text-[#0071E3] dark:hover:text-[#0071E3]"
              }`}
            >
              {session.title}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="flex-shrink-0 px-4">
        <AnimatePresence>
          {showPrompts && (
            <SuggestedPrompts onSelect={(p) => sendMessage(p)} />
          )}
        </AnimatePresence>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        {messages.length === 0 && !showPrompts && (
          <p className="text-center text-[#6E6E73] dark:text-slate-500 text-sm mt-12">
            Start a conversation above.
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {error && (
          <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm px-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sticky input bar */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-gray-100 dark:border-slate-700/50 bg-white dark:bg-transparent">
        <div className="flex items-end gap-2 bg-[#F5F5F7] dark:bg-slate-800 rounded-2xl px-4 py-3 border dark:border-slate-700/60">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your rewards..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-sm text-[#1D1D1F] dark:text-slate-100 placeholder-[#6E6E73] dark:placeholder-slate-500 resize-none outline-none leading-relaxed max-h-32 disabled:opacity-50"
            style={{ scrollbarWidth: "none" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 flex-shrink-0 bg-[#0071E3] disabled:bg-[#C7C7CC] rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#0077ED] disabled:cursor-not-allowed"
          >
            <ArrowUp className="h-4 w-4 text-white" />
          </button>
        </div>
        <p className="text-center text-[#C7C7CC] dark:text-slate-600 text-[10px] mt-2">
          Powered by your rewards data
        </p>
      </div>
    </div>
  );
}

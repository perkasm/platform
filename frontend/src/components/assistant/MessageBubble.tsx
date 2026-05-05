import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { normalizeMarkdown } from "@/lib/formatMarkdown";

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-base font-bold text-luxury-text-primary mt-4 mb-2 pb-1 border-b border-luxury-border">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-bold text-luxury-accent-indigo mt-4 mb-2 uppercase tracking-wide">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-luxury-text-primary mt-3 mb-1">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed text-luxury-text-primary my-1.5">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-luxury-text-secondary not-italic" style={{ fontStyle: "italic" }}>{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="my-2 space-y-1 pl-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 space-y-1.5 pl-5 list-decimal">{children}</ol>
  ),
  li: ({ children, ...props }) => {
    // Inside an ol the browser handles the marker; inside ul we render a custom dot
    const isOrdered = (props as { ordered?: boolean }).ordered;
    return isOrdered ? (
      <li className="text-sm text-luxury-text-primary leading-relaxed pl-0.5">{children}</li>
    ) : (
      <li className="text-sm text-luxury-text-primary leading-relaxed flex gap-2 items-start list-none">
        <span className="mt-[6px] flex-shrink-0 w-1.5 h-1.5 rounded-full bg-luxury-accent-indigo/70 inline-block" />
        <span>{children}</span>
      </li>
    );
  },
  hr: () => <hr className="my-4 border-luxury-border" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-luxury-accent-indigo/60 pl-3 my-2 text-luxury-text-secondary italic text-sm">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    return isBlock ? (
      <code className="block text-xs font-mono text-luxury-text-primary">{children}</code>
    ) : (
      <code className="text-xs font-mono text-luxury-accent-indigo bg-luxury-bg px-1.5 py-0.5 rounded">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-luxury-bg border border-luxury-border rounded-xl p-4 my-3 overflow-x-auto text-xs leading-relaxed">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-luxury-border">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-luxury-bg/80">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold text-luxury-text-secondary border-b border-luxury-border">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-luxury-text-primary border-b border-luxury-border/50 last:border-0">
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-luxury-bg/30">{children}</tr>
  ),
};

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse justify-start" : "flex-row w-full"}`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-luxury-accent-indigo to-purple-600 flex items-center justify-center flex-shrink-0 mb-0.5">
          <span className="text-white text-xs font-bold">P</span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`rounded-2xl px-4 py-3 ${
          isUser
            ? "max-w-[72%] bg-luxury-accent-indigo/90 text-white rounded-br-sm"
            : "w-full bg-luxury-elevated border border-luxury-border text-luxury-text-primary rounded-bl-sm"
        }`}
      >
        {message.isTyping ? (
          <div className="flex items-center gap-1 py-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 bg-luxury-accent-indigo/60 rounded-full block"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        ) : isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="min-w-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {normalizeMarkdown(message.content)}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

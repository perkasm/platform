import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeMarkdown } from "@/lib/formatMarkdown";

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
      className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-luxury-accent-indigo to-purple-600 flex items-center justify-center flex-shrink-0 mb-0.5">
          <span className="text-white text-xs font-bold">P</span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-luxury-accent-indigo/90 text-white rounded-br-sm"
            : "bg-luxury-elevated border border-luxury-border text-luxury-text-primary rounded-bl-sm"
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
          <div className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none
            prose-p:my-1 prose-p:leading-relaxed
            prose-headings:font-semibold prose-h3:text-base prose-h3:mt-3 prose-h3:mb-1
            prose-strong:font-semibold
            prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5
            prose-ol:my-1 prose-ol:pl-4
            prose-hr:my-3 prose-hr:border-luxury-border
            prose-table:text-xs prose-table:w-full
            prose-th:bg-luxury-bg prose-th:px-2 prose-th:py-1.5 prose-th:text-left prose-th:font-semibold
            prose-td:px-2 prose-td:py-1.5 prose-td:border-b prose-td:border-luxury-border
            [&_table]:border-collapse [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:max-w-full
            [&_thead]:bg-luxury-bg
            [&_tr]:border-b [&_tr]:border-luxury-border
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {normalizeMarkdown(message.content)}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

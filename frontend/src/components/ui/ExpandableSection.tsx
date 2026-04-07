import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ExpandableSectionProps {
  title: string;
  badge?: string | number;
  headerRight?: ReactNode;
  collapsedContent: ReactNode;
  expandedContent: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function ExpandableSection({
  title,
  badge,
  headerRight,
  collapsedContent,
  expandedContent,
  defaultExpanded = false,
  className = "",
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#F5F5F7] dark:hover:bg-slate-700/60 transition-all duration-200"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[#1D1D1F] dark:text-slate-100 font-semibold text-base">{title}</span>
          {badge !== undefined && (
            <span className="bg-[#F5F5F7] dark:bg-slate-700 text-[#6E6E73] dark:text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {headerRight}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-[#6E6E73] dark:text-slate-500" />
          </motion.div>
        </div>
      </button>

      {/* Collapsed content — always visible */}
      <AnimatePresence initial={false}>
        {!expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {collapsedContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {expandedContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

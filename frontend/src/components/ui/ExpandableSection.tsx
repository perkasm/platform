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
    <div className={`bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-luxury-elevated/60 transition-all duration-200"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-luxury-text-primary font-ui font-semibold text-base">{title}</span>
          {badge !== undefined && (
            <span className="bg-luxury-elevated text-luxury-text-secondary text-xs font-medium px-2 py-0.5 rounded-full">
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
            <ChevronDown className="h-4 w-4 text-luxury-text-muted" />
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

import { motion } from "framer-motion";

const prompts = [
  "Best card for my next purchase",
  "Plan a trip to Tokyo with points",
  "Am I earning the most I can?",
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex flex-wrap justify-center gap-2 mb-6"
    >
      {prompts.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="text-sm text-luxury-accent-indigo border border-luxury-accent-indigo/30 bg-luxury-elevated hover:bg-luxury-accent-indigo hover:text-white px-4 py-2 rounded-full font-medium transition-all duration-200"
        >
          {prompt}
        </button>
      ))}
    </motion.div>
  );
}

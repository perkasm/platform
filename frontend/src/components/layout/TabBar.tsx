import { motion } from "framer-motion";
import { LayoutDashboard, Sparkles } from "lucide-react";

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "assistant", label: "Assistant", icon: Sparkles },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex justify-center py-3 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-indigo-100/60 dark:border-slate-700/50">
      <div className="bg-indigo-50/80 dark:bg-slate-800 rounded-full p-1 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative px-5 py-2 rounded-full text-sm font-medium z-10 transition-colors duration-200 flex items-center gap-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`relative z-10 h-3.5 w-3.5 transition-colors duration-200 ${isActive ? "text-white" : "text-indigo-400 dark:text-slate-400"}`} />
              <span className={`relative z-10 transition-colors duration-200 ${isActive ? "text-white" : "text-indigo-400 dark:text-slate-400"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

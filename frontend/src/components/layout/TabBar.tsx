import { motion } from "framer-motion";
import { LayoutDashboard, Sparkles, Plane } from "lucide-react";

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "assistant", label: "Assistant", icon: Sparkles },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex justify-center py-3 px-4 bg-transparent border-b border-luxury-border">
      <div className="bg-luxury-elevated/80 backdrop-blur-sm border border-luxury-border rounded-full p-1 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative px-5 py-2 rounded-full text-sm font-ui font-medium z-10 transition-colors duration-200 flex items-center gap-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-luxury-accent-indigo to-purple-600 rounded-full shadow-md shadow-glow-indigo"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`relative z-10 h-3.5 w-3.5 transition-colors duration-200 ${isActive ? "text-white" : "text-luxury-text-secondary"}`} />
              <span className={`relative z-10 transition-colors duration-200 ${isActive ? "text-white" : "text-luxury-text-secondary"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Button } from "./button";

interface NavigationTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function NavigationTabs({ tabs, activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="flex space-x-1 rounded-lg bg-muted p-1" data-testid="navigation-tabs-container">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          className={cn(
            "flex items-center space-x-2 transition-all duration-200",
            activeTab === tab.id
              ? "bg-background shadow-card text-primary font-medium"
              : "hover:bg-background/50 text-muted-foreground"
          )}
          onClick={() => onTabChange(tab.id)}
          data-tab-id={tab.id}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </Button>
      ))}
    </div>
  );
}

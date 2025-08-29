import { useState } from "react";
import { NavigationTabs } from "@/components/ui/navigation-tabs";
import { MainDashboard } from "@/components/dashboard/main-dashboard";
import { MyCards } from "@/components/cards/my-cards";
import { AIChat } from "@/components/chat/ai-chat";
import { CardRecommendations } from "@/components/recommendations/card-recommendations";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LayoutDashboard, CreditCard, Bot, Star } from "lucide-react";

const tabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    id: "cards",
    label: "My Cards", 
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    id: "ai-chat",
    label: "AI Chat",
    icon: <Bot className="h-4 w-4" />
  },
  {
    id: "recommendations",
    label: "Recommendations",
    icon: <Star className="h-4 w-4" />
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <MainDashboard />;
      case "cards":
        return <MyCards />;
      case "ai-chat":
        return <AIChat />;
      case "recommendations":
        return <CardRecommendations />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PerkAsm.com</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Rewards Optimization</p>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <NavigationTabs 
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">John Smith</p>
                <p className="text-xs text-muted-foreground">Premium Member</p>
              </div>
              <div className="w-8 h-8 bg-gradient-premium rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-premium-foreground">JS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-background/50 border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-3">PerkAsm.com</h3>
              <p className="text-sm text-muted-foreground">
                Maximize your credit card rewards with AI-powered optimization and predictive analytics.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Real-time optimization</li>
                <li>Predictive analytics</li>
                <li>Portfolio management</li>
                <li>AI chat assistant</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Security</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>SOC 2 compliant</li>
                <li>End-to-end encryption</li>
                <li>Anonymous processing</li>
                <li>Tokenized credentials</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Support</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 PerkAsm.com. All rights reserved. | 
              <span className="ml-2">Empowering Rewards Sophisticates</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

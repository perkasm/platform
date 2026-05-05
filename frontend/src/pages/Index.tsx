import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TabBar } from "@/components/layout/TabBar";
import { PortfolioSummary } from "@/components/dashboard/PortfolioSummary";
import { MyCards } from "@/components/dashboard/MyCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { PointValues } from "@/components/dashboard/PointValues";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { SpendingInsights } from "@/components/dashboard/SpendingInsights";
import { ChatInterface } from "@/components/assistant/ChatInterface";
import { PortfolioAnalysis } from "@/components/assistant/PortfolioAnalysis";
import { TravelTab } from "@/components/travel/TravelTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "dashboard" && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-4">
          <PortfolioSummary />
          <MyCards />
          <RecentTransactions />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PointValues />
            <AIInsights />
          </div>
          <SpendingInsights />
        </main>
      )}

      {activeTab === "travel" && (
        <TravelTab />
      )}

      {activeTab === "assistant" && (
        <div className="mx-auto px-4 sm:px-6 mt-4" style={{ maxWidth: "920px" }}>
          <PortfolioAnalysis />
          <ChatInterface />
        </div>
      )}
    </div>
  );
};

export default Index;

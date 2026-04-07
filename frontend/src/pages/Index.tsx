import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TabBar } from "@/components/layout/TabBar";
import { PortfolioSummary } from "@/components/dashboard/PortfolioSummary";
import { MyCards } from "@/components/dashboard/MyCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { PointValues } from "@/components/dashboard/PointValues";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { ChatInterface } from "@/components/assistant/ChatInterface";
import { PortfolioAnalysis } from "@/components/assistant/PortfolioAnalysis";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/50 to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
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
        </main>
      )}

      {activeTab === "assistant" && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-4" style={{ maxWidth: "768px" }}>
          <PortfolioAnalysis />
          <div className="bg-white dark:bg-transparent rounded-2xl dark:rounded-none shadow-sm dark:shadow-none overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

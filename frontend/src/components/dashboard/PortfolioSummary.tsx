import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { TrendingUp } from "lucide-react";
import { useEdit } from "@/contexts/EditContext";

const BAR_COLORS = ["#60a5fa", "#3b82f6", "#2563eb", "#4f46e5", "#6366f1", "#93c5fd"];

export function PortfolioSummary() {
  const { portfolioStats, chartData, updateChartEntry } = useEdit();

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-200/50 dark:shadow-blue-900/30 p-8 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-20 -translate-x-16 pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <p className="text-indigo-200 text-sm font-medium tracking-wide uppercase">Total Rewards Value</p>
          <div className="flex items-center gap-1.5 bg-emerald-400/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full">
            <TrendingUp className="h-3 w-3" />
            Live from your cards
          </div>
        </div>

        {/* Big number */}
        <div className="text-white text-6xl font-light tracking-tight mt-1 mb-8">
          <span>${portfolioStats.totalValue.toLocaleString()}</span>
        </div>

        {/* Three stats */}
        <div className="flex items-center gap-0 mb-8">
          <div className="flex-1">
            <p className="text-indigo-300 text-xs font-medium">Total Points</p>
            <div className="text-white text-xl font-semibold mt-0.5">
              {portfolioStats.totalPoints.toLocaleString()}
            </div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="flex-1 pl-6">
            <p className="text-indigo-300 text-xs font-medium">Cards Active</p>
            <div className="text-white text-xl font-semibold mt-0.5">
              {portfolioStats.cardsActive}
            </div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="flex-1 pl-6">
            <p className="text-indigo-300 text-xs font-medium">Est. Monthly Earn</p>
            <div className="text-white text-xl font-semibold mt-0.5">
              ${portfolioStats.monthlyEarn.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={22} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(199,210,254,0.8)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.12)" }}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.97)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  fontSize: "12px",
                  color: "#1e293b",
                  fontWeight: 500,
                }}
                formatter={(value: number) => [`${value.toLocaleString()} pts`, "Points Earned"]}
              />
              <Bar dataKey="points" radius={[5, 5, 0, 0]}>
                {chartData.map((_entry, index) => (
                  <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart history inputs — current month is auto-derived from cards */}
        <div className="mt-3 grid grid-cols-6 gap-1">
          {chartData.map((entry, i) => {
            const isCurrentMonth = i === chartData.length - 1;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-indigo-300/70 text-[10px]">{entry.month}</span>
                {isCurrentMonth ? (
                  <span className="w-full bg-white/10 text-indigo-200/70 text-[10px] rounded px-1 py-0.5 border border-white/20 text-center italic">auto</span>
                ) : (
                  <input
                    type="number"
                    value={entry.points}
                    onChange={(e) => updateChartEntry(i, { points: Number(e.target.value) })}
                    className="w-full bg-white/20 text-white text-[10px] rounded px-1 py-0.5 border border-white/40 focus:outline-none focus:border-white text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-indigo-300/70 text-xs mt-2 text-center">Points earned — last 6 months · current month auto-synced from cards</p>
      </div>
    </div>
  );
}

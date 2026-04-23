import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { TrendingUp } from "lucide-react";
import { useEdit } from "@/contexts/EditContext";

const BAR_COLORS = ["#6C63FF", "#7B73FF", "#5B52FF", "#8880FF", "#4B42FF", "#9A93FF"];

export function PortfolioSummary() {
  const { portfolioStats, chartData, updateChartEntry } = useEdit();

  return (
    <div className="relative bg-luxury-elevated border border-luxury-border rounded-2xl p-8 overflow-hidden">
      {/* Subtle indigo radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(244_100%_70%/0.12),transparent_60%)] pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <p className="text-luxury-text-secondary font-ui text-xs uppercase tracking-widest">Total Rewards Value</p>
          <div className="flex items-center gap-1.5 bg-luxury-accent-mint/15 text-luxury-accent-mint border border-luxury-accent-mint/20 text-xs font-semibold px-2.5 py-1 rounded-full">
            <TrendingUp className="h-3 w-3" />
            Live from your cards
          </div>
        </div>

        {/* Big number */}
        <div className="text-luxury-text-primary text-5xl font-display font-bold tracking-tight mt-1 mb-8">
          <span className="font-mono-data">${portfolioStats.totalValue.toLocaleString()}</span>
        </div>

        {/* Three stats */}
        <div className="flex items-center gap-0 mb-8">
          <div className="flex-1">
            <p className="text-luxury-text-secondary font-ui text-xs font-medium">Total Points</p>
            <div className="text-luxury-text-primary font-mono-data text-xl font-semibold mt-0.5">
              {portfolioStats.totalPoints.toLocaleString()}
            </div>
          </div>
          <div className="w-px h-10 bg-luxury-border" />
          <div className="flex-1 pl-6">
            <p className="text-luxury-text-secondary font-ui text-xs font-medium">Cards Active</p>
            <div className="text-luxury-text-primary font-mono-data text-xl font-semibold mt-0.5">
              {portfolioStats.cardsActive}
            </div>
          </div>
          <div className="w-px h-10 bg-luxury-border" />
          <div className="flex-1 pl-6">
            <p className="text-luxury-text-secondary font-ui text-xs font-medium">Est. Monthly Earn</p>
            <div className="text-luxury-text-primary font-mono-data text-xl font-semibold mt-0.5">
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
                tick={{ fill: "hsl(240,16%,60%)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(108,99,255,0.08)" }}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid hsl(240,16%,19%)",
                  background: "hsl(240,10%,8%)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  fontSize: "12px",
                  color: "hsl(240,14%,96%)",
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
                <span className="text-luxury-text-muted text-[10px]">{entry.month}</span>
                {isCurrentMonth ? (
                  <span className="w-full bg-luxury-bg/40 text-luxury-text-secondary text-[10px] rounded px-1 py-0.5 border border-luxury-border text-center italic">auto</span>
                ) : (
                  <input
                    type="number"
                    value={entry.points}
                    onChange={(e) => updateChartEntry(i, { points: Number(e.target.value) })}
                    className="w-full bg-luxury-bg/60 text-luxury-text-primary text-[10px] rounded px-1 py-0.5 border border-luxury-border focus:outline-none focus:border-luxury-accent-indigo text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-luxury-text-muted text-xs mt-2 text-center">Points earned — last 6 months · current month auto-synced from cards</p>
      </div>
    </div>
  );
}

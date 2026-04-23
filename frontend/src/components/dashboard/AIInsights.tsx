import { useState, useMemo } from "react";
import { Sparkles, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEdit } from "@/contexts/EditContext";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import type { Card } from "@/data/mockData";

// ─── Benefit parsing ──────────────────────────────────────────────────────────

type Frequency = "monthly" | "semi-annual" | "yearly";

interface BenefitItem {
  key: string;
  label: string;
  frequency: Frequency;
  value?: number;
}

function parseBenefits(perks: string[]): BenefitItem[] {
  const items: BenefitItem[] = [];
  for (const perk of perks) {
    // Only keep actionable perks with a tangible benefit to claim
    const actionable = /\$\d|free bag|free checked|one.time pass|lounge pass|membership|status|CLEAR|lounge access|Priority Pass/i.test(perk);
    if (!actionable) continue;

    // Skip one-time welcome bonuses and sign-up offers
    if (/earn \d+,?\d+ bonus/i.test(perk)) continue;
    if (/after \$\d+ spend/i.test(perk)) continue;
    if (/\d+%?\s+intro/i.test(perk)) continue;

    // Skip informational perks that don't require action to claim
    if (/pair with|points become|no foreign|no annual fee/i.test(perk)) continue;
    if (/transfer (miles|points) to/i.test(perk)) continue;

    let frequency: Frequency = "yearly";
    if (/\/month|\$\d+\/month|per month|\(\$\d+\/month\)/i.test(perk)) {
      frequency = "monthly";
    } else if (/semi.annual|every 6 months|\$\d+ semi|\(?\$\d+ semi/i.test(perk)) {
      frequency = "semi-annual";
    }

    const valueMatch = perk.match(/\$(\d+(?:,\d+)?)/);
    const value = valueMatch ? parseInt(valueMatch[1].replace(",", "")) : undefined;

    items.push({ key: perk, label: perk, frequency, value });
  }
  return items;
}

// ─── Period key helpers ───────────────────────────────────────────────────────

function getPeriodKey(freq: Frequency): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  if (freq === "monthly") return `${year}-${month}`;
  if (freq === "semi-annual") return `${year}-${now.getMonth() < 6 ? "H1" : "H2"}`;
  return `${year}`;
}

function makeItemId(cardId: string, perkKey: string, freq: Frequency): string {
  return `${cardId}::${perkKey}::${getPeriodKey(freq)}`;
}

// ─── localStorage ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "perkasm_benefits_checked";

function loadChecked(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecked(checked: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BenefitRow({
  benefit,
  checked,
  onToggle,
  cardColor,
}: {
  benefit: BenefitItem;
  checked: boolean;
  onToggle: () => void;
  cardColor: string;
}) {
  return (
    <motion.button
      layout
      onClick={onToggle}
      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors duration-150 ${
        checked
          ? "bg-luxury-accent-mint/10 border border-luxury-accent-mint/20"
          : "bg-luxury-elevated hover:bg-luxury-bg border border-luxury-border"
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {checked ? (
          <CheckCircle2 className="h-4 w-4 text-luxury-accent-mint" />
        ) : (
          <Circle className="h-4 w-4 text-luxury-text-muted" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs leading-relaxed ${
            checked
              ? "line-through text-luxury-text-muted"
              : "text-luxury-text-primary"
          }`}
        >
          {benefit.label}
        </p>
      </div>
      {benefit.value !== undefined && (
        <span
          className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: cardColor }}
        >
          ${benefit.value}
        </span>
      )}
    </motion.button>
  );
}

interface CardGroup {
  card: Card;
  benefits: BenefitItem[];
}

function CardBenefitGroup({
  group,
  checked,
  onToggle,
}: {
  group: CardGroup;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const { card, benefits } = group;
  const checkedCount = benefits.filter(
    (b) => checked[makeItemId(card.id, b.key, b.frequency)]
  ).length;

  return (
    <div className="space-y-1.5">
      {/* Card header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: card.color }} />
        <p className="text-xs font-semibold text-luxury-text-primary truncate flex-1">{card.name}</p>
        <span className="text-[10px] text-luxury-text-secondary flex-shrink-0">
          {checkedCount}/{benefits.length} claimed
        </span>
      </div>
      {benefits.map((benefit) => {
        const id = makeItemId(card.id, benefit.key, benefit.frequency);
        return (
          <BenefitRow
            key={benefit.key}
            benefit={benefit}
            checked={!!checked[id]}
            onToggle={() => onToggle(id)}
            cardColor={card.color}
          />
        );
      })}
    </div>
  );
}

// ─── Collapsed summary pill ───────────────────────────────────────────────────

function SummaryPill({
  card,
  benefits,
  checked,
}: {
  card: Card;
  benefits: BenefitItem[];
  checked: Record<string, boolean>;
}) {
  const monthly = benefits.filter((b) => b.frequency === "monthly");
  const yearly = benefits.filter((b) => b.frequency !== "monthly");
  const monthlyDone = monthly.filter((b) => checked[makeItemId(card.id, b.key, b.frequency)]).length;
  const yearlyDone = yearly.filter((b) => checked[makeItemId(card.id, b.key, b.frequency)]).length;

  return (
    <div className="flex items-center gap-2.5 border border-luxury-border rounded-full px-4 py-2 flex-shrink-0 bg-luxury-elevated">
      <div className="w-3 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: card.color }} />
      <p className="text-luxury-text-primary text-xs font-medium truncate max-w-[120px]">{card.name}</p>
      {monthly.length > 0 && (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          monthlyDone === monthly.length
            ? "bg-luxury-accent-mint/15 text-luxury-accent-mint"
            : "bg-luxury-accent-amber/15 text-luxury-accent-amber"
        }`}>
          {monthlyDone}/{monthly.length} mo
        </span>
      )}
      {yearly.length > 0 && (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          yearlyDone === yearly.length
            ? "bg-luxury-accent-mint/15 text-luxury-accent-mint"
            : "bg-luxury-accent-indigo/15 text-luxury-accent-indigo"
        }`}>
          {yearlyDone}/{yearly.length} yr
        </span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AIInsights() {
  const { cards } = useEdit();
  const [tab, setTab] = useState<"monthly" | "yearly">("monthly");
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecked);

  const cardBenefits = useMemo((): CardGroup[] => {
    return cards
      .map((card) => ({ card, benefits: parseBenefits(card.perks) }))
      .filter((cb) => cb.benefits.length > 0);
  }, [cards]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveChecked(next);
      return next;
    });
  };

  const filteredGroups: CardGroup[] = cardBenefits
    .map((cb) => ({
      ...cb,
      benefits: cb.benefits.filter((b) =>
        tab === "monthly" ? b.frequency === "monthly" : b.frequency !== "monthly"
      ),
    }))
    .filter((cb) => cb.benefits.length > 0);

  // Total unclaimed for badge
  const totalUnclaimed = cardBenefits.reduce((sum, cb) => {
    return (
      sum +
      cb.benefits.filter((b) => !checked[makeItemId(cb.card.id, b.key, b.frequency)]).length
    );
  }, 0);

  // Period label
  const now = new Date();
  const monthLabel = now.toLocaleString("en-US", { month: "long" });
  const yearLabel = now.getFullYear();

  const CollapsedContent = (
    <div className="px-6 pb-4 space-y-2">
      {cardBenefits.length === 0 ? (
        <p className="text-luxury-text-secondary text-xs py-1">
          Add cards to see your benefits checklist.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {cardBenefits.map(({ card, benefits }) => (
            <SummaryPill key={card.id} card={card} benefits={benefits} checked={checked} />
          ))}
        </div>
      )}
    </div>
  );

  const ExpandedContent = (
    <div className="px-6 pb-6 space-y-5">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-luxury-elevated border border-luxury-border rounded-xl p-1">
        {(["monthly", "yearly"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              tab === t
                ? "bg-luxury-bg text-luxury-text-primary shadow-sm"
                : "text-luxury-text-secondary hover:text-luxury-text-primary"
            }`}
          >
            {t === "monthly" ? `Monthly · ${monthLabel}` : `Annual · ${yearLabel}`}
          </button>
        ))}
      </div>

      {/* Checklist */}
      {filteredGroups.length === 0 ? (
        <p className="text-luxury-text-secondary text-sm text-center py-4">
          {cardBenefits.length === 0
            ? "Add cards to see your benefits checklist."
            : `No ${tab} benefits found for your cards.`}
        </p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
          >
            {filteredGroups.map((group) => (
              <CardBenefitGroup
                key={group.card.id}
                group={group}
                checked={checked}
                onToggle={toggle}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {filteredGroups.length > 0 && (
        <p className="text-[10px] text-luxury-text-muted text-center">
          Checks reset automatically each {tab === "monthly" ? "month" : "year"}
        </p>
      )}
    </div>
  );

  return (
    <ExpandableSection
      title="Benefits Checklist"
      badge={totalUnclaimed > 0 ? totalUnclaimed : undefined}
      headerRight={<Sparkles className="h-4 w-4 text-luxury-accent-indigo" />}
      collapsedContent={CollapsedContent}
      expandedContent={ExpandedContent}
    />
  );
}

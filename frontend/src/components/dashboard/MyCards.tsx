import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Plus, Search, ChevronLeft, Check, Building2, Pencil } from "lucide-react";
import { type Card } from "@/data/mockData";
import { cardCatalog, issuerColors, type CardIssuer, type CardTemplate } from "@/data/cardCatalog";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import { useEdit } from "@/contexts/EditContext";
import { useTellerConnect } from "@/hooks/use-teller-connect";

function CardThumbnail({ card, onRemove }: { card: Card; onRemove: (id: string) => void }) {
  return (
    <div className="relative flex-shrink-0 group/card">
      <div
        className="relative flex-shrink-0 w-52 h-32 rounded-2xl p-4 text-white flex flex-col justify-between cursor-default overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200"
        style={{ backgroundColor: card.color }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-black/10 rounded-full pointer-events-none" />
        <div className="relative flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{card.network}</span>
          <div className="w-6 h-4 rounded-sm bg-yellow-300/70" />
        </div>
        <div className="relative">
          <p className="text-xs font-semibold leading-tight mb-0.5">{card.name}</p>
          <p className="text-[10px] opacity-60 mb-2 font-mono">•••• •••• •••• {card.last4}</p>
          <span className="text-[10px] bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded-full font-semibold">
            {card.primaryCategory}
          </span>
        </div>
      </div>
      <button
        onClick={() => onRemove(card.id)}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-all z-10 opacity-0 group-hover/card:opacity-100 scale-75 group-hover/card:scale-100"
      >
        <X size={12} />
      </button>
    </div>
  );
}

const CASH_BACK_REWARDS = new Set(["Cash Back", "Daily Cash"]);
function isCashBackCard(card: Pick<Card, "primaryReward">) {
  return CASH_BACK_REWARDS.has(card.primaryReward);
}

function CardDetail({
  card,
  isEditMode,
  onUpdate,
  onRemove,
}: {
  card: Card;
  isEditMode: boolean;
  onUpdate: (id: string, changes: Partial<Card>) => void;
  onRemove: (id: string) => void;
}) {
  const [perksOpen, setPerksOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState(false);
  const [localBalance, setLocalBalance] = useState(card.balance);
  const cashBack = isCashBackCard(card);

  return (
    <div className="border border-luxury-border rounded-xl p-5 relative group/detail">
      <button
        onClick={() => onRemove(card.id)}
        className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover/detail:opacity-100 scale-75 group-hover/detail:scale-100"
      >
        <X size={12} />
      </button>

      {/* Card header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-6 rounded-md flex-shrink-0" style={{ backgroundColor: card.color }} />
        <div className="flex-1 min-w-0">
          {isEditMode ? (
            <input
              type="text"
              value={card.name}
              onChange={(e) => onUpdate(card.id, { name: e.target.value })}
              className="text-sm font-semibold w-full bg-luxury-elevated text-luxury-text-primary rounded-lg px-2 py-0.5 border border-luxury-border focus:border-luxury-accent-indigo focus:outline-none"
            />
          ) : (
            <p className="text-luxury-text-primary font-semibold text-sm truncate">{card.name}</p>
          )}
          <p className="text-luxury-text-secondary text-xs font-mono-data">•••• {card.last4} · {card.network}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-luxury-bg/60 border border-luxury-border rounded-xl p-3">
          <p className="text-luxury-text-secondary font-ui text-xs mb-0.5">
            {cashBack ? "Rewards Type" : "Point Balance"}
          </p>
          {cashBack ? (
            <p className="text-luxury-text-primary font-mono-data font-semibold text-sm">Cash Back</p>
          ) : isEditMode ? (
            <input
              type="number"
              value={card.balance}
              onChange={(e) => onUpdate(card.id, { balance: Number(e.target.value) })}
              className="text-sm font-mono-data font-semibold w-full bg-luxury-bg border border-luxury-border text-luxury-text-primary rounded-lg px-2 py-0.5 focus:border-luxury-accent-indigo focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          ) : editingBalance ? (
            <input
              type="number"
              value={localBalance}
              onChange={(e) => setLocalBalance(Number(e.target.value))}
              onBlur={() => { onUpdate(card.id, { balance: localBalance }); setEditingBalance(false); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") { onUpdate(card.id, { balance: localBalance }); setEditingBalance(false); }
                if (e.key === "Escape") setEditingBalance(false);
              }}
              autoFocus
              className="text-sm font-mono-data font-semibold w-full bg-luxury-bg border border-luxury-accent-indigo text-luxury-text-primary rounded-lg px-2 py-0.5 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          ) : (
            <button
              onClick={() => { setLocalBalance(card.balance); setEditingBalance(true); }}
              className="text-luxury-text-primary font-mono-data font-semibold hover:text-luxury-accent-indigo transition-colors text-left group/bal flex items-center gap-1 w-full"
              title="Click to update balance"
            >
              {card.balance > 0 ? card.balance.toLocaleString() : "0"}
              <Pencil size={10} className="opacity-0 group-hover/bal:opacity-60 transition-opacity flex-shrink-0" />
            </button>
          )}
        </div>
        <div className="bg-luxury-bg/60 border border-luxury-border rounded-xl p-3">
          <p className="text-luxury-text-secondary font-ui text-xs mb-0.5">Earned This Month</p>
          {isEditMode ? (
            <input
              type="number"
              value={card.monthlyEarned}
              onChange={(e) => onUpdate(card.id, { monthlyEarned: Number(e.target.value) })}
              className="text-sm font-mono-data font-semibold w-full bg-luxury-bg border border-luxury-border text-luxury-text-primary rounded-lg px-2 py-0.5 focus:border-luxury-accent-indigo focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          ) : (
            <p className="text-luxury-text-primary font-mono-data font-semibold">
              {card.primaryReward === "Cash Back" ? `$${card.monthlyEarned}` : `${card.monthlyEarned.toLocaleString()} pts`}
            </p>
          )}
        </div>
        <div className="bg-luxury-bg/60 border border-luxury-border rounded-xl p-3">
          <p className="text-luxury-text-secondary font-ui text-xs mb-0.5">Annual Fee</p>
          {isEditMode ? (
            <input
              type="number"
              value={card.annualFee}
              onChange={(e) => onUpdate(card.id, { annualFee: Number(e.target.value) })}
              className="text-sm font-mono-data font-semibold w-full bg-luxury-bg border border-luxury-border text-luxury-text-primary rounded-lg px-2 py-0.5 focus:border-luxury-accent-indigo focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          ) : (
            <p className="text-luxury-text-primary font-mono-data font-semibold">
              {card.annualFee === 0 ? "None" : `$${card.annualFee}`}
            </p>
          )}
        </div>
        <div className="bg-luxury-bg/60 border border-luxury-border rounded-xl p-3">
          <p className="text-luxury-text-secondary font-ui text-xs mb-0.5">Next Fee Date</p>
          {isEditMode ? (
            <input
              type="date"
              value={card.nextFeeDate ?? ""}
              onChange={(e) => onUpdate(card.id, { nextFeeDate: e.target.value || null })}
              className="text-xs font-semibold w-full bg-luxury-elevated text-luxury-text-primary rounded-lg px-2 py-0.5 border border-luxury-border focus:border-luxury-accent-indigo focus:outline-none"
            />
          ) : (
            <p className="text-luxury-text-primary font-mono-data font-semibold">
              {card.nextFeeDate
                ? new Date(card.nextFeeDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                : "N/A"}
            </p>
          )}
        </div>
      </div>

      {/* Spending categories */}
      <div className="mb-4">
        <p className="text-luxury-text-secondary font-ui text-xs font-medium mb-2">Earn Rates</p>
        <div className="flex flex-wrap gap-1.5">
          {card.categories.map((cat) => (
            <span key={cat.name} className="text-xs bg-luxury-accent-indigo/15 text-luxury-accent-indigo px-2.5 py-1 rounded-full font-medium">
              {cat.multiplier}x {cat.name}
            </span>
          ))}
        </div>
      </div>

      {/* Perks toggle */}
      <button
        onClick={() => setPerksOpen(!perksOpen)}
        className="flex items-center gap-1.5 text-luxury-accent-indigo text-sm font-medium hover:opacity-75 transition-opacity duration-200"
      >
        <motion.div animate={{ rotate: perksOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight className="h-4 w-4" />
        </motion.div>
        Card Perks ({card.perks.length})
      </button>

      <AnimatePresence>
        {perksOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
            className="mt-2 space-y-1"
          >
            {card.perks.map((perk) => (
              <li key={perk} className="text-sm text-luxury-text-secondary flex items-start gap-2">
                <span className="text-luxury-accent-indigo mt-0.5">·</span>
                {perk}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Catalog Card Picker ──────────────────────────────────────────────────────

const ISSUERS: CardIssuer[] = ["Chase", "Capital One", "Amex", "Bank of America", "United", "Apple"];

function CatalogPicker({
  onSelect,
  onCustom,
  onCancel,
  onConnectBank,
}: {
  onSelect: (template: CardTemplate) => void;
  onCustom: () => void;
  onCancel: () => void;
  onConnectBank: () => void;
}) {
  const [search, setSearch] = useState("");
  const [issuerFilter, setIssuerFilter] = useState<CardIssuer | "All">("All");

  const filtered = cardCatalog.filter((t) => {
    const matchIssuer = issuerFilter === "All" || t.issuer === issuerFilter;
    const matchSearch = search === "" || t.name.toLowerCase().includes(search.toLowerCase());
    return matchIssuer && matchSearch;
  });

  return (
    <div className="border border-luxury-border rounded-xl p-4 space-y-3 bg-luxury-elevated">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-luxury-text-primary">Add Card</p>
        <button onClick={onCancel} className="text-luxury-text-muted hover:text-luxury-text-primary transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-text-muted" />
        <input
          type="text"
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm bg-luxury-bg text-luxury-text-primary rounded-lg border border-luxury-border focus:border-luxury-accent-indigo focus:outline-none placeholder:text-luxury-text-muted"
        />
      </div>

      {/* Issuer filters */}
      <div className="flex gap-1.5 flex-wrap">
        {(["All", ...ISSUERS] as const).map((issuer) => (
          <button
            key={issuer}
            onClick={() => setIssuerFilter(issuer)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              issuerFilter === issuer
                ? "text-white"
                : "bg-luxury-bg text-luxury-text-secondary border border-luxury-border hover:border-luxury-accent-indigo/50"
            }`}
            style={issuerFilter === issuer ? { backgroundColor: issuer === "All" ? "hsl(244,100%,70%)" : issuerColors[issuer] } : {}}
          >
            {issuer}
          </button>
        ))}
      </div>

      {/* Card list */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
        {filtered.map((template) => (
          <button
            key={template.name}
            onClick={() => onSelect(template)}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-luxury-bg border border-luxury-border hover:border-luxury-accent-indigo/50 transition-colors text-left group"
          >
            <div
              className="w-8 h-5 rounded flex-shrink-0 shadow-sm"
              style={{ backgroundColor: template.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-luxury-text-primary truncate">{template.name}</p>
              <p className="text-[10px] text-luxury-text-secondary font-mono-data">{template.primaryCategory} · {template.annualFee === 0 ? "No annual fee" : `$${template.annualFee}/yr`}</p>
            </div>
            <ChevronRight size={14} className="text-luxury-text-muted group-hover:text-luxury-accent-indigo transition-colors flex-shrink-0" />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-luxury-text-muted py-4">No cards match your search</p>
        )}
      </div>

      <button
        onClick={onConnectBank}
        className="w-full py-2 rounded-lg text-xs font-medium text-luxury-accent-indigo border border-luxury-accent-indigo/30 bg-luxury-accent-indigo/10 hover:bg-luxury-accent-indigo/20 transition-colors flex items-center justify-center gap-1.5"
      >
        <Building2 size={13} />
        Connect bank account
      </button>
      <button
        onClick={onCustom}
        className="w-full py-2 rounded-lg text-xs font-medium text-luxury-text-secondary border border-dashed border-luxury-border hover:border-luxury-accent-indigo hover:text-luxury-accent-indigo transition-colors"
      >
        + Add custom card
      </button>
    </div>
  );
}

// ─── Detail entry form (after picking from catalog or custom) ─────────────────

function CardEntryForm({
  template,
  onAdd,
  onBack,
  onCancel,
}: {
  template: CardTemplate | null;
  onAdd: (card: Card) => void;
  onBack: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(template?.name ?? "");
  const [last4, setLast4] = useState("");
  const [balance, setBalance] = useState(0);
  const [annualFee, setAnnualFee] = useState(template?.annualFee ?? 0);
  const [perksOpen, setPerksOpen] = useState(false);
  const [chosenCategory, setChosenCategory] = useState("");

  const cashBack = template ? isCashBackCard(template) : false;
  const needsCategory = !!(template?.chosenCategoryOptions?.length);

  const handleSubmit = () => {
    if (!last4 || (!template && !name)) return;
    if (needsCategory && !chosenCategory) return;

    // Replace the generic "Chosen Category" slot with the user's actual pick
    let categories = template?.categories ?? [{ name: "Everything Else", multiplier: 1 }];
    if (chosenCategory) {
      categories = categories.map((c) =>
        c.name === "Chosen Category" ? { ...c, name: chosenCategory } : c
      );
    }

    onAdd({
      id: `card_${Date.now()}`,
      name: template?.name ?? name,
      last4,
      network: template?.network ?? "Visa",
      primaryCategory: chosenCategory ? `3% ${chosenCategory}` : (template?.primaryCategory ?? "1x Everything"),
      primaryReward: template?.primaryReward ?? "Points",
      balance: cashBack ? 0 : balance,
      monthlyEarned: 0,
      annualFee,
      nextFeeDate: null,
      color: template?.color ?? "#1a3a6b",
      categories,
      perks: template?.perks ?? [],
      chosenCategory: chosenCategory || undefined,
    });
  };

  return (
    <div className="border border-luxury-border rounded-xl p-4 space-y-3 bg-luxury-elevated">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-luxury-text-muted hover:text-luxury-text-primary transition-colors">
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-semibold text-luxury-text-primary font-ui flex-1 truncate">
          {template ? template.name : "Custom Card"}
        </p>
        <button onClick={onCancel} className="text-luxury-text-muted hover:text-luxury-text-primary transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Card preview */}
      {template && (
        <div
          className="relative w-full h-20 rounded-xl p-3 text-white overflow-hidden shadow"
          style={{ backgroundColor: template.color }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none" />
          <p className="relative text-xs font-bold">{template.name}</p>
          <p className="relative text-[10px] opacity-70 mt-0.5">{template.rewardsCurrency} · {template.annualFee === 0 ? "No annual fee" : `$${template.annualFee}/yr`}</p>
          <p className="relative text-[10px] opacity-60 mt-1">{template.description.slice(0, 80)}…</p>
        </div>
      )}

      {/* Earn rates preview */}
      {template && (
        <div>
          <p className="text-[10px] font-semibold text-luxury-text-secondary uppercase tracking-wide mb-1.5">Earn Rates</p>
          <div className="flex flex-wrap gap-1">
            {template.categories.map((cat) => (
              <span key={cat.name} className="text-[10px] bg-luxury-accent-indigo/15 text-luxury-accent-indigo px-2 py-0.5 rounded-full font-medium">
                {cat.multiplier}x {cat.name}
              </span>
            ))}
          </div>
          {template.annualFeeNote && (
            <p className="text-[10px] text-luxury-text-muted mt-1">* {template.annualFeeNote}</p>
          )}
        </div>
      )}

      {/* Perks preview */}
      {template && template.perks.length > 0 && (
        <div>
          <button
            onClick={() => setPerksOpen(!perksOpen)}
            className="flex items-center gap-1 text-[10px] font-semibold text-luxury-accent-indigo uppercase tracking-wide"
          >
            <motion.div animate={{ rotate: perksOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
              <ChevronRight size={12} />
            </motion.div>
            {perksOpen ? "Hide" : "Show"} Perks ({template.perks.length})
          </button>
          <AnimatePresence>
            {perksOpen && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
                className="mt-1.5 space-y-1"
              >
                {template.perks.map((perk) => (
                  <li key={perk} className="text-[10px] text-luxury-text-secondary flex items-start gap-1.5">
                    <Check size={10} className="text-luxury-accent-indigo mt-0.5 flex-shrink-0" />
                    {perk}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Chosen category picker */}
      {needsCategory && (
        <div className="border border-luxury-accent-amber/30 bg-luxury-accent-amber/10 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-semibold text-luxury-accent-amber uppercase tracking-wide">
            Which category did you choose for 3%?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {template!.chosenCategoryOptions!.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setChosenCategory(opt)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  chosenCategory === opt
                    ? "bg-luxury-accent-indigo text-white"
                    : "bg-luxury-bg text-luxury-text-secondary border border-luxury-border hover:border-luxury-accent-indigo/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-luxury-border pt-3 space-y-2">
        <p className="text-[10px] font-semibold text-luxury-text-secondary uppercase tracking-wide">Your Card Details</p>
        {!template && (
          <input
            type="text"
            placeholder="Card name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm bg-luxury-bg text-luxury-text-primary rounded-lg px-3 py-2 border border-luxury-border focus:border-luxury-accent-indigo focus:outline-none placeholder:text-luxury-text-muted"
          />
        )}
        <div className={cashBack ? "" : "grid grid-cols-2 gap-2"}>
          <input
            type="text"
            placeholder="Last 4 digits"
            maxLength={4}
            value={last4}
            onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
            className="text-sm bg-luxury-bg text-luxury-text-primary rounded-lg px-3 py-2 border border-luxury-border focus:border-luxury-accent-indigo focus:outline-none font-mono-data w-full placeholder:text-luxury-text-muted"
          />
          {!cashBack && (
            <input
              type="number"
              placeholder="Current point balance"
              value={balance || ""}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="text-sm bg-luxury-bg text-luxury-text-primary rounded-lg px-3 py-2 border border-luxury-border focus:border-luxury-accent-indigo focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-luxury-text-muted"
            />
          )}
        </div>
        {cashBack && (
          <p className="text-[10px] text-luxury-text-muted">Cash back cards don't need a point balance.</p>
        )}
        {!template && (
          <input
            type="number"
            placeholder="Annual fee"
            value={annualFee || ""}
            onChange={(e) => setAnnualFee(Number(e.target.value))}
            className="w-full text-sm bg-luxury-bg text-luxury-text-primary rounded-lg px-3 py-2 border border-luxury-border focus:border-luxury-accent-indigo focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-luxury-text-muted"
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg text-xs font-medium text-luxury-text-primary border border-luxury-border hover:bg-luxury-elevated transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!last4 || last4.length < 4 || (!template && !name) || (needsCategory && !chosenCategory)}
          className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-luxury-accent-indigo to-purple-600 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Add to Garage
        </button>
      </div>
    </div>
  );
}

// ─── Add Card Flow ─────────────────────────────────────────────────────────────

type AddStep = "catalog" | "entry";

function AddCardFlow({ onAdd, onCancel, onConnectBank }: { onAdd: (card: Card) => void; onCancel: () => void; onConnectBank: () => void }) {
  const [step, setStep] = useState<AddStep>("catalog");
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null);

  if (step === "catalog") {
    return (
      <CatalogPicker
        onSelect={(t) => { setSelectedTemplate(t); setStep("entry"); }}
        onCustom={() => { setSelectedTemplate(null); setStep("entry"); }}
        onCancel={onCancel}
        onConnectBank={onConnectBank}
      />
    );
  }

  return (
    <CardEntryForm
      template={selectedTemplate}
      onAdd={onAdd}
      onBack={() => setStep("catalog")}
      onCancel={onCancel}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MyCards() {
  const { isEditMode, cards, updateCard, addCard, removeCard, clearAllCards } = useEdit();
  const [showAddForm, setShowAddForm] = useState(false);
  const { open: openTellerConnect } = useTellerConnect();

  const handleAdd = (card: Card) => { addCard(card); setShowAddForm(false); };
  const handleCancel = () => setShowAddForm(false);
  const handleClearAll = () => clearAllCards();

  const CollapsedCards = (
    <div className="px-6 pb-6 space-y-3">
      {cards.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleClearAll}
            className="text-[11px] text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors font-medium"
          >
            Remove all cards
          </button>
        </div>
      )}
      <div className="flex gap-3 overflow-x-auto">
        {cards.map((card) => (
          <CardThumbnail key={card.id} card={card} onRemove={removeCard} />
        ))}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex-shrink-0 w-52 h-32 rounded-2xl border-2 border-dashed border-luxury-border flex flex-col items-center justify-center gap-2 text-luxury-text-muted hover:border-luxury-accent-indigo hover:text-luxury-accent-indigo transition-colors"
          >
            <Plus size={20} />
            <span className="text-xs font-medium">Add Card</span>
          </button>
        )}
      </div>
      {showAddForm && (
        <AddCardFlow onAdd={handleAdd} onCancel={handleCancel} onConnectBank={openTellerConnect} />
      )}
    </div>
  );

  const ExpandedCards = (
    <div className="px-6 pb-6 space-y-3">
      {cards.map((card) => (
        <CardDetail key={card.id} card={card} isEditMode={isEditMode} onUpdate={updateCard} onRemove={removeCard} />
      ))}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-luxury-border flex items-center justify-center gap-2 text-luxury-text-muted hover:border-luxury-accent-indigo hover:text-luxury-accent-indigo transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Add Card
        </button>
      )}
      {showAddForm && (
        <AddCardFlow onAdd={handleAdd} onCancel={handleCancel} onConnectBank={openTellerConnect} />
      )}
    </div>
  );

  return (
    <ExpandableSection
      title="My Cards"
      badge={cards.length}
      collapsedContent={CollapsedCards}
      expandedContent={ExpandedCards}
    />
  );
}

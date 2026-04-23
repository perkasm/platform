import { useState } from "react";
import { X, Plus, Link } from "lucide-react";
import { type LoyaltyProgram } from "@/data/mockData";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import { useEdit } from "@/contexts/EditContext";

type SortKey = "value" | "balance";

function ProgramRow({
  program,
  isEditMode,
  isLinked,
  onUpdate,
  onRemove,
}: {
  program: LoyaltyProgram;
  isEditMode: boolean;
  isLinked: boolean;
  onUpdate: (id: string, changes: Partial<LoyaltyProgram>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: program.color }}
      >
        {program.shortName.slice(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-luxury-text-primary font-ui text-sm font-medium truncate">{program.shortName}</p>
          {isLinked && (
            <span title="Auto-synced from your card balances" className="flex items-center gap-0.5 text-[10px] text-luxury-accent-indigo bg-luxury-accent-indigo/10 px-1.5 py-0.5 rounded-full font-medium">
              <Link size={9} />
              synced
            </span>
          )}
        </div>
        {isEditMode ? (
          <div className="flex items-center gap-1 mt-0.5">
            {isLinked ? (
              <span className="text-xs text-luxury-text-secondary italic">
                {program.balance.toLocaleString()} pts · set via card balances
              </span>
            ) : (
              <>
                <input
                  type="number"
                  value={program.balance}
                  onChange={(e) => {
                    const balance = Number(e.target.value);
                    onUpdate(program.id, { balance, dollarValue: Math.round(balance * program.cpp) / 100 });
                  }}
                  placeholder="Balance"
                  className="text-xs w-24 bg-luxury-elevated border border-luxury-border text-luxury-text-primary rounded-lg px-2 py-0.5 focus:border-luxury-accent-indigo focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono-data"
                />
                <span className="text-luxury-text-secondary text-xs">pts ·</span>
              </>
            )}
            <input
              type="number"
              step="0.1"
              value={program.cpp}
              onChange={(e) => {
                const cpp = Number(e.target.value);
                onUpdate(program.id, { cpp, dollarValue: Math.round(program.balance * cpp) / 100 });
              }}
              placeholder="cpp"
              className="text-xs w-14 bg-luxury-elevated border border-luxury-border text-luxury-text-primary rounded-lg px-2 py-0.5 focus:border-luxury-accent-indigo focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono-data"
            />
            <span className="text-luxury-text-secondary text-xs">¢/pt</span>
          </div>
        ) : (
          <p className="text-luxury-text-secondary text-xs font-mono-data">{program.balance.toLocaleString()} pts · {program.cpp}¢/pt</p>
        )}
      </div>
      <div className="text-right flex-shrink-0 flex items-center gap-2">
        <p className="text-luxury-text-primary font-mono-data text-sm font-semibold">
          ${program.dollarValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
        {isEditMode && !isLinked && (
          <button
            onClick={() => onRemove(program.id)}
            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors flex-shrink-0"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

function AddProgramForm({ onAdd, onCancel }: { onAdd: (p: LoyaltyProgram) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [balance, setBalance] = useState(0);
  const [cpp, setCpp] = useState(1.0);

  const handleSubmit = () => {
    if (!name || !shortName) return;
    const dollarValue = Math.round(balance * cpp) / 100;
    onAdd({
      id: `prog_${Date.now()}`,
      name,
      shortName,
      balance,
      cpp,
      dollarValue,
      color: "#4f46e5",
    });
  };

  return (
    <div className="border border-luxury-border rounded-xl p-4 space-y-3 bg-luxury-elevated mt-2">
      <p className="text-sm font-semibold text-luxury-text-primary">Add Loyalty Program</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Full name (e.g. Chase Ultimate Rewards)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-2 text-sm bg-luxury-bg text-luxury-text-primary rounded-lg px-3 py-2 border border-luxury-border focus:border-luxury-accent-indigo focus:outline-none placeholder:text-luxury-text-muted"
        />
        <input
          type="text"
          placeholder="Short name (e.g. Chase UR)"
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
          className="text-sm bg-luxury-bg text-luxury-text-primary rounded-lg px-3 py-2 border border-luxury-border focus:border-luxury-accent-indigo focus:outline-none placeholder:text-luxury-text-muted"
        />
        <input
          type="number"
          placeholder="Point balance"
          value={balance || ""}
          onChange={(e) => setBalance(Number(e.target.value))}
          className="text-sm bg-luxury-bg text-luxury-text-primary rounded-lg px-3 py-2 border border-luxury-border focus:border-luxury-accent-indigo focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-luxury-text-muted font-mono-data"
        />
        <input
          type="number"
          step="0.1"
          placeholder="Value (¢/pt)"
          value={cpp || ""}
          onChange={(e) => setCpp(Number(e.target.value))}
          className="col-span-2 text-sm bg-luxury-bg text-luxury-text-primary rounded-lg px-3 py-2 border border-luxury-border focus:border-luxury-accent-indigo focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-luxury-text-muted font-mono-data"
        />
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
          disabled={!name || !shortName}
          className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-luxury-accent-indigo to-purple-600 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function PointValues() {
  const { isEditMode, loyaltyPrograms, updateLoyaltyProgram, addLoyaltyProgram, removeLoyaltyProgram, linkedProgramShortNames } = useEdit();
  const [sortBy, setSortBy] = useState<SortKey>("value");
  const [showAddForm, setShowAddForm] = useState(false);

  const sorted = [...loyaltyPrograms].sort((a, b) =>
    sortBy === "value" ? b.dollarValue - a.dollarValue : b.balance - a.balance
  );

  const SortToggle = (
    <div className="flex gap-1">
      {(["value", "balance"] as SortKey[]).map((k) => (
        <button
          key={k}
          onClick={(e) => { e.stopPropagation(); setSortBy(k); }}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 ${
            sortBy === k
              ? "bg-luxury-accent-indigo/20 text-luxury-accent-indigo border border-luxury-accent-indigo/30"
              : "bg-luxury-elevated text-luxury-text-secondary hover:bg-luxury-bg hover:text-luxury-text-primary"
          }`}
        >
          By {k}
        </button>
      ))}
    </div>
  );

  const totalValue = loyaltyPrograms.reduce((s, p) => s + p.dollarValue, 0);

  const CollapsedContent = (
    <div className="px-6 pb-4 divide-y divide-luxury-border/40">
      {sorted.slice(0, 3).map((p) => (
        <ProgramRow key={p.id} program={p} isEditMode={isEditMode} isLinked={linkedProgramShortNames.has(p.shortName)} onUpdate={updateLoyaltyProgram} onRemove={removeLoyaltyProgram} />
      ))}
    </div>
  );

  const ExpandedContent = (
    <div className="px-6 pb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-luxury-text-secondary font-ui text-xs font-medium">All programs</p>
        {SortToggle}
      </div>
      <div className="divide-y divide-luxury-border/40">
        {sorted.map((p) => (
          <ProgramRow key={p.id} program={p} isEditMode={isEditMode} isLinked={linkedProgramShortNames.has(p.shortName)} onUpdate={updateLoyaltyProgram} onRemove={removeLoyaltyProgram} />
        ))}
      </div>

      {isEditMode && !showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mt-3 py-3 rounded-xl border border-dashed border-luxury-border flex items-center justify-center gap-2 text-luxury-text-muted hover:border-luxury-accent-indigo hover:text-luxury-accent-indigo transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Add Program
        </button>
      )}
      {isEditMode && showAddForm && (
        <AddProgramForm
          onAdd={(p) => { addLoyaltyProgram(p); setShowAddForm(false); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="mt-4 pt-3 border-t border-luxury-border flex justify-between">
        <span className="text-luxury-text-secondary font-ui text-xs font-medium">Total value</span>
        <span className="text-luxury-text-primary font-mono-data text-sm font-semibold">
          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );

  return (
    <ExpandableSection
      title="Point Values"
      badge={loyaltyPrograms.length}
      collapsedContent={CollapsedContent}
      expandedContent={ExpandedContent}
    />
  );
}

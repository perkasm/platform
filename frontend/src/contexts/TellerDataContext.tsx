import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { tellerService, TellerEnrollment, TellerAccount, TellerTransaction } from "@/services/teller.service";
import { enrichCategories, type TxCategory } from "@/services/categorize.service";
import { useAuth } from "./AuthContext";

interface TellerDataState {
  enrollments: TellerEnrollment[];
  accounts: TellerAccount[];
  transactions: TellerTransaction[];
  /** AI-enriched category map: transaction id → category. Available after async enrichment. */
  categoryMap: Record<string, TxCategory>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const TellerDataContext = createContext<TellerDataState | null>(null);

export function TellerDataProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState<TellerEnrollment[]>([]);
  const [accounts, setAccounts] = useState<TellerAccount[]>([]);
  const [transactions, setTransactions] = useState<TellerTransaction[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, TxCategory>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);

      try {
        const enrollmentList = await tellerService.listEnrollments();
        if (cancelled) return;
        setEnrollments(enrollmentList);

        if (enrollmentList.length === 0) {
          setAccounts([]);
          setTransactions([]);
          setLoading(false);
          return;
        }

        const results = await Promise.all(
          enrollmentList.map(async (enrollment) => {
            const [accts, txns] = await Promise.all([
              tellerService.getAccounts(enrollment.id),
              tellerService.getAllTransactions(enrollment.id, 200),
            ]);
            return { accounts: accts, transactions: txns };
          })
        );

        if (cancelled) return;

        const allAccounts = results.flatMap((r) => r.accounts);
        const allTransactions = results
          .flatMap((r) => r.transactions)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setAccounts(allAccounts);
        setTransactions(allTransactions);
        setLoading(false);

        // Enrich categories via AI in the background (non-blocking)
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
        if (apiKey && allTransactions.length > 0) {
          const txMeta = allTransactions.map((tx) => {
            const details = tx.details as Record<string, unknown> | null;
            const counterpartyRaw = details?.["counterparty"];
            const merchantName =
              typeof counterpartyRaw === "object" && counterpartyRaw !== null
                ? ((counterpartyRaw as Record<string, unknown>)["name"] as string | undefined)
                : typeof counterpartyRaw === "string"
                ? counterpartyRaw
                : undefined;
            return {
              id: tx.id,
              description: tx.description,
              amount: tx.amount,
              merchantName,
              tellerCategory: details?.["category"] as string | undefined,
            };
          });
          enrichCategories(txMeta, apiKey)
            .then((map) => { if (!cancelled) setCategoryMap(map); })
            .catch((err) => console.warn("[TellerDataContext] AI categorization failed:", err));
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load transaction data");
          console.error(err);
          setLoading(false);
        }
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [version, token]);

  return (
    <TellerDataContext.Provider value={{ enrollments, accounts, transactions, categoryMap, loading, error, refetch }}>
      {children}
    </TellerDataContext.Provider>
  );
}

export function useTellerData(): TellerDataState {
  const ctx = useContext(TellerDataContext);
  if (!ctx) throw new Error("useTellerData must be used within TellerDataProvider");
  return ctx;
}

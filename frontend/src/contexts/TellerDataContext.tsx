import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { tellerService, TellerEnrollment, TellerAccount, TellerTransaction } from "@/services/teller.service";
import { useAuth } from "./AuthContext";

interface TellerDataState {
  enrollments: TellerEnrollment[];
  accounts: TellerAccount[];
  transactions: TellerTransaction[];
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    // Don't fetch if not authenticated
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
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load transaction data");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [version, token]);

  return (
    <TellerDataContext.Provider value={{ enrollments, accounts, transactions, loading, error, refetch }}>
      {children}
    </TellerDataContext.Provider>
  );
}

export function useTellerData(): TellerDataState {
  const ctx = useContext(TellerDataContext);
  if (!ctx) throw new Error("useTellerData must be used within TellerDataProvider");
  return ctx;
}

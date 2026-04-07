import { get, post, del } from "./api";

export interface TellerEnrollment {
  id: number;
  enrollment_id: string;
  institution_name: string | null;
  created_at: string;
}

export interface TellerAccount {
  id: string;
  name: string;
  type: string;
  subtype: string | null;
  status: string;
  currency: string;
  institution: { name: string } | null;
  last_four: string | null;
}

export interface TellerBalance {
  account_id: string;
  available: string | null;
  ledger: string | null;
}

export interface TellerTransaction {
  id: string;
  account_id: string;
  date: string;
  description: string;
  amount: string;
  type: string;
  status: string;
  details: Record<string, unknown> | null;
  running_balance: string | null;
}

export const tellerService = {
  saveEnrollment(enrollment_id: string, access_token: string, institution_name?: string) {
    return post<TellerEnrollment>("/teller/enrollments", {
      enrollment_id,
      access_token,
      institution_name,
    });
  },

  listEnrollments() {
    return get<TellerEnrollment[]>("/teller/enrollments");
  },

  deleteEnrollment(enrollmentId: number) {
    return del(`/teller/enrollments/${enrollmentId}`);
  },

  getAccounts(enrollmentId: number) {
    return get<TellerAccount[]>(`/teller/enrollments/${enrollmentId}/accounts`);
  },

  getBalances(enrollmentId: number, accountId: string) {
    return get<TellerBalance>(`/teller/enrollments/${enrollmentId}/accounts/${accountId}/balances`);
  },

  getTransactions(enrollmentId: number, accountId: string, count = 100) {
    return get<TellerTransaction[]>(
      `/teller/enrollments/${enrollmentId}/accounts/${accountId}/transactions?count=${count}`
    );
  },

  getAllTransactions(enrollmentId: number, count = 100) {
    return get<TellerTransaction[]>(
      `/teller/enrollments/${enrollmentId}/transactions?count=${count}`
    );
  },
};

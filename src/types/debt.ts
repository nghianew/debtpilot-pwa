export type DebtType =
  | 'credit_card'
  | 'fixed_monthly'
  | 'personal_loan'
  | 'installment'
  | 'borrowed_money'
  | 'other';

export type InterestType = 'none' | 'simple' | 'compound';
export type DebtStatus = 'active' | 'paid';

export interface DebtItem {
  id?: number;
  name: string;
  type: DebtType;
  originalAmount: number;
  currentBalance: number;
  interestType: InterestType;
  apr?: number;
  monthlyInterestRate?: number;
  minimumPaymentPercent?: number;
  minimumPayment?: number;
  fixedMonthlyPayment?: number;
  dueDay?: number;
  dueDate?: string;
  notes?: string;
  status: DebtStatus;
  createdAt: string;
  updatedAt: string;
}

export type DebtItemFormValues = Omit<DebtItem, 'id' | 'createdAt' | 'updatedAt'>;

export interface Payment {
  id?: number;
  debtId: number;
  amount: number;
  paymentDate: string;
  note?: string;
  createdAt: string;
}

export interface PaymentFormValues {
  debtId: number;
  amount: number;
  paymentDate: string;
  note?: string;
}

export interface DebtProgress {
  totalPaid: number;
  progress: number;
}

export interface DashboardSummary {
  totalOriginalDebt: number;
  totalRemainingDebt: number;
  totalPaid: number;
  recordedPayments: number;
  overallProgress: number;
  totalMonthlyRequired: number;
  totalInterestEstimate: number;
  overdueCount: number;
  dueSoonCount: number;
  activeCount: number;
  paidCount: number;
}

export interface DuePaymentItem {
  debt: DebtItem;
  dueDate: Date;
  amountDue: number;
  label: string;
}

export interface DuePaymentGroups {
  overdue: DuePaymentItem[];
  today: DuePaymentItem[];
  thisWeek: DuePaymentItem[];
}

export interface MonthlyProjection {
  month: number;
  date: Date;
  remainingDebt: number;
  interestPaid: number;
  paymentsMade: number;
}

export interface CombinedProjectionInput {
  extraDailyPayment: number;
  startDate?: Date;
  maxYears?: number;
}

export interface CombinedProjectionResult {
  payoffDate: Date | null;
  totalDays: number;
  totalMonths: number;
  totalRemainingDebt: number;
  totalInterestUntilPayoff: number;
  totalPaidUntilPayoff: number;
  monthlyProjection: MonthlyProjection[];
  warning?: string;
}

import { AlertTriangle, CalendarClock, CheckCircle2, Coins, Gauge, WalletCards } from 'lucide-react';
import { DuePaymentsPanel } from '../components/DuePaymentsPanel';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { QuickPaymentPanel } from '../components/QuickPaymentPanel';
import { StatCard } from '../components/StatCard';
import { dashboardSummary, getDuePaymentGroups } from '../lib/finance';
import { formatCurrency, formatPercent } from '../lib/format';
import type { DebtItem, Payment, PaymentFormValues } from '../types/debt';
import type { AppView } from '../types/navigation';

interface DashboardPageProps {
  debts: DebtItem[];
  payments: Payment[];
  isLoading: boolean;
  onNavigate: (view: AppView) => void;
  onSeedDemoData: () => Promise<void>;
  onAddPayment: (values: PaymentFormValues) => Promise<void>;
  onMarkDuePaid: (debt: DebtItem, amount?: number, note?: string) => Promise<void>;
}

export function DashboardPage({
  debts,
  payments,
  isLoading,
  onNavigate,
  onSeedDemoData,
  onAddPayment,
  onMarkDuePaid
}: DashboardPageProps) {
  const summary = dashboardSummary(debts, payments);
  const dueGroups = getDuePaymentGroups(debts, payments);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan nợ"
        description="Theo dõi tổng nợ, tiến độ trả, khoản đến hạn và thanh toán hằng ngày."
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-lg bg-white/70" />
          ))}
        </div>
      ) : debts.length === 0 ? (
        <EmptyState
          title="Chưa có khoản nợ"
          description="Thêm khoản nợ đầu tiên hoặc dùng dữ liệu demo để xem DebtPilot hoạt động."
          action={
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => onNavigate('cards')}
                className="rounded-md bg-mint px-4 py-3 text-sm font-bold text-white shadow-soft"
              >
                Thêm khoản nợ
              </button>
              <button
                type="button"
                onClick={() => void onSeedDemoData()}
                className="rounded-md border border-ink/15 px-4 py-3 text-sm font-bold text-ink hover:bg-ink/5"
              >
                Tải demo
              </button>
            </div>
          }
        />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Tổng nợ"
              value={formatCurrency(summary.totalOriginalDebt)}
              detail={`${summary.activeCount} khoản đang nợ`}
              accent="bg-ink"
              icon={<WalletCards aria-hidden="true" className="h-5 w-5" />}
            />
            <StatCard
              label="Còn lại"
              value={formatCurrency(summary.totalRemainingDebt)}
              detail={`${formatCurrency(summary.totalInterestEstimate)} lãi ước tính/tháng`}
              accent="bg-coral"
              icon={<Coins aria-hidden="true" className="h-5 w-5" />}
            />
            <StatCard
              label="Đã trả"
              value={formatCurrency(summary.totalPaid)}
              detail={`${formatPercent(summary.overallProgress)} tiến độ`}
              accent="bg-mint"
              icon={<CheckCircle2 aria-hidden="true" className="h-5 w-5" />}
            />
            <StatCard
              label="Khoản đến hạn"
              value={String(summary.dueSoonCount)}
              detail={`${summary.overdueCount} quá hạn`}
              accent="bg-gold"
              icon={<CalendarClock aria-hidden="true" className="h-5 w-5" />}
            />
            <StatCard
              label="Tiến độ"
              value={formatPercent(summary.overallProgress)}
              detail={`${summary.paidCount} khoản đã trả xong`}
              accent="bg-mint"
              icon={<Gauge aria-hidden="true" className="h-5 w-5" />}
            />
            <StatCard
              label="Phải trả/tháng"
              value={formatCurrency(summary.totalMonthlyRequired)}
              detail="Tối thiểu hoặc cố định"
              accent="bg-ink"
              icon={<CalendarClock aria-hidden="true" className="h-5 w-5" />}
            />
            <StatCard
              label="Lãi ước tính"
              value={formatCurrency(summary.totalInterestEstimate)}
              detail="Từ các khoản còn hoạt động"
              accent="bg-coral"
              icon={<Coins aria-hidden="true" className="h-5 w-5" />}
            />
            <StatCard
              label="Quá hạn"
              value={String(summary.overdueCount)}
              detail="Cần xử lý trước"
              accent="bg-coral"
              icon={<AlertTriangle aria-hidden="true" className="h-5 w-5" />}
            />
          </section>

          <QuickPaymentPanel debts={debts} onAddPayment={onAddPayment} />
          <DuePaymentsPanel groups={dueGroups} onMarkPaid={onMarkDuePaid} />
        </>
      )}
    </div>
  );
}

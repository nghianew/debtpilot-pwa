import { Activity, CalendarClock, FileText, Gauge } from 'lucide-react';
import type { ReactNode } from 'react';
import { estimateMonthlyInterest, getDebtProgress, getNextDueDate, getRequiredPayment } from '../lib/finance';
import {
  formatCurrency,
  formatDateLong,
  formatDebtType,
  formatInterestType,
  formatPercent
} from '../lib/format';
import type { DebtItem, Payment } from '../types/debt';

interface DebtDetailProps {
  debt: DebtItem;
  payments: Payment[];
}

export function DebtDetail({ debt, payments }: DebtDetailProps) {
  const progress = getDebtProgress(debt);
  const nextDueDate = getNextDueDate(debt);
  const debtPayments = payments.filter((payment) => payment.debtId === debt.id).slice(0, 5);

  return (
    <section className="rounded-lg border border-ink/10 bg-ink p-4 text-white shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-white/55">
            {formatDebtType(debt.type)}
          </p>
          <h2 className="mt-1 break-words text-2xl font-black">{debt.name}</h2>
        </div>
        <div className="rounded-md bg-white/10 px-3 py-2 text-sm font-bold">
          {debt.status === 'paid' ? 'Đã trả' : 'Đang nợ'}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <DetailMetric
          icon={<Gauge aria-hidden="true" className="h-5 w-5" />}
          label="Tiến độ"
          value={formatPercent(progress.progress)}
        />
        <DetailMetric
          icon={<Activity aria-hidden="true" className="h-5 w-5" />}
          label="Lãi tháng"
          value={formatCurrency(estimateMonthlyInterest(debt))}
        />
        <DetailMetric
          icon={<CalendarClock aria-hidden="true" className="h-5 w-5" />}
          label="Khoản đến hạn"
          value={formatCurrency(getRequiredPayment(debt))}
        />
        <DetailMetric
          icon={<CalendarClock aria-hidden="true" className="h-5 w-5" />}
          label="Ngày đến hạn"
          value={nextDueDate ? formatDateLong(nextDueDate) : 'Chưa có'}
        />
      </div>

      <div className="mt-4 rounded-md bg-white/10 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-white/60">Cấu trúc</p>
        <p className="mt-2 text-sm leading-6 text-white/75">
          Gốc: <span className="font-bold text-white">{formatCurrency(debt.originalAmount)}</span>
          {' · '}
          Còn lại: <span className="font-bold text-white">{formatCurrency(debt.currentBalance)}</span>
          {' · '}
          Lãi: <span className="font-bold text-white">{formatInterestType(debt.interestType)}</span>
        </p>
      </div>

      {debt.notes ? (
        <div className="mt-3 flex gap-2 rounded-md bg-white/10 p-3 text-sm leading-6 text-white/75">
          <FileText aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {debt.notes}
        </div>
      ) : null}

      {debtPayments.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-white/60">Thanh toán gần đây</p>
          <div className="mt-2 space-y-2">
            {debtPayments.map((payment) => (
              <div key={payment.id} className="flex justify-between gap-3 rounded-md bg-white/10 p-3">
                <div>
                  <p className="text-sm font-bold">{formatCurrency(payment.amount)}</p>
                  <p className="mt-1 text-xs text-white/55">
                    {formatDateLong(new Date(`${payment.paymentDate}T00:00:00`))}
                  </p>
                </div>
                {payment.note ? <p className="max-w-32 text-right text-xs text-white/60">{payment.note}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

interface DetailMetricProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function DetailMetric({ icon, label, value }: DetailMetricProps) {
  return (
    <div className="rounded-md bg-white/10 p-3">
      <div className="flex items-center gap-2 text-white/70">
        {icon}
        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 break-words text-lg font-black">{value}</p>
    </div>
  );
}

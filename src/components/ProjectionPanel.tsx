import { AlertTriangle, CalendarDays, Coins, Timer } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatCurrency, formatDateLong, formatMonthCount } from '../lib/format';
import type { CombinedProjectionResult } from '../types/debt';

interface ProjectionPanelProps {
  result: CombinedProjectionResult;
}

export function ProjectionPanel({ result }: ProjectionPanelProps) {
  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultMetric
          label="Thời gian trả hết"
          value={result.warning && !result.payoffDate ? 'Cần tăng trả' : formatMonthCount(result.totalMonths)}
          detail={`${result.totalDays.toLocaleString('vi-VN')} ngày`}
          icon={<Timer aria-hidden="true" className="h-4 w-4" />}
        />
        <ResultMetric
          label="Ngày trả hết"
          value={result.payoffDate ? formatDateLong(result.payoffDate) : 'Chưa đạt'}
          detail="Ước tính"
          icon={<CalendarDays aria-hidden="true" className="h-4 w-4" />}
        />
        <ResultMetric
          label="Tổng lãi"
          value={formatCurrency(result.totalInterestUntilPayoff)}
          detail="Đến khi trả hết"
          icon={<Coins aria-hidden="true" className="h-4 w-4" />}
        />
        <ResultMetric
          label="Tổng đã trả"
          value={formatCurrency(result.totalPaidUntilPayoff)}
          detail={`${formatCurrency(result.totalRemainingDebt)} còn lại`}
          icon={<Coins aria-hidden="true" className="h-4 w-4" />}
        />
      </div>

      {result.warning ? (
        <div className="flex gap-2 rounded-md bg-coral/10 p-3 text-coral">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-sm font-semibold leading-5">{result.warning}</p>
        </div>
      ) : null}

      <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wide text-mint">Dự báo tổng nợ</p>
          <h3 className="text-lg font-black text-ink">Từng tháng</h3>
        </div>

        <div className="-mx-4 overflow-x-auto px-4">
          <div className="max-h-96 overflow-y-auto rounded-md border border-ink/10">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-limewash text-xs font-bold uppercase tracking-wide text-ink/55">
                <tr>
                  <th className="px-3 py-3">Tháng</th>
                  <th className="px-3 py-3">Còn lại</th>
                  <th className="px-3 py-3">Lãi tháng</th>
                  <th className="px-3 py-3">Đã trả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 bg-white">
                {result.monthlyProjection.map((month) => (
                  <tr key={month.month}>
                    <td className="px-3 py-3 font-bold text-ink">{month.month}</td>
                    <td className="px-3 py-3 text-ink">{formatCurrency(month.remainingDebt)}</td>
                    <td className="px-3 py-3 text-ink/70">{formatCurrency(month.interestPaid)}</td>
                    <td className="px-3 py-3 text-ink/70">{formatCurrency(month.paymentsMade)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </section>
  );
}

interface ResultMetricProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}

function ResultMetric({ label, value, detail, icon }: ResultMetricProps) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/50">{label}</p>
          <p className="mt-2 break-words text-xl font-black text-ink">{value}</p>
          <p className="mt-2 text-sm font-semibold text-ink/55">{detail}</p>
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-mint text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

import { CalendarDays, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { estimateMonthlyInterest, getDebtProgress, getNextDueDate, getRequiredPayment } from '../lib/finance';
import { formatCurrency, formatDateShort, formatDebtType, formatPercent } from '../lib/format';
import type { DebtItem } from '../types/debt';

interface DebtListItemProps {
  debt: DebtItem;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DebtListItem({ debt, isSelected, onSelect, onEdit, onDelete }: DebtListItemProps) {
  const progress = getDebtProgress(debt);
  const nextDueDate = getNextDueDate(debt);

  return (
    <article
      className={`rounded-lg border bg-white p-4 shadow-soft transition ${
        isSelected ? 'border-mint ring-2 ring-mint/15' : 'border-ink/10'
      }`}
    >
      <button type="button" onClick={onSelect} className="w-full text-left" title={`Mở ${debt.name}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-ink">{debt.name}</p>
            <p className="mt-1 text-sm text-ink/60">
              {formatDebtType(debt.type)} · {debt.status === 'paid' ? 'Đã trả' : 'Đang nợ'}
            </p>
          </div>
          <ChevronRight
            aria-hidden="true"
            className={`mt-1 h-5 w-5 shrink-0 text-ink/40 transition ${isSelected ? 'rotate-90' : ''}`}
          />
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-mint" style={{ width: `${progress.progress}%` }} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Metric label="Còn lại" value={formatCurrency(debt.currentBalance)} />
          <Metric label="Đã trả" value={formatCurrency(progress.totalPaid)} />
          <Metric label="Tiến độ" value={formatPercent(progress.progress)} />
          <Metric
            label="Đến hạn"
            value={nextDueDate ? formatDateShort(nextDueDate) : 'Chưa có'}
            icon={<CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />}
          />
          <Metric label="Phải trả/tháng" value={formatCurrency(getRequiredPayment(debt))} />
          <Metric label="Lãi ước tính" value={formatCurrency(estimateMonthlyInterest(debt))} />
        </div>
      </button>

      <div className="mt-4 flex gap-2 border-t border-ink/10 pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-ink/15 px-3 py-2.5 text-sm font-bold text-ink hover:bg-ink/5"
          title={`Sửa ${debt.name}`}
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
          Sửa
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="grid h-11 w-11 place-items-center rounded-md border border-coral/25 text-coral hover:bg-coral/10"
          title={`Xóa ${debt.name}`}
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

interface MetricProps {
  label: string;
  value: string;
  icon?: ReactNode;
}

function Metric({ label, value, icon }: MetricProps) {
  return (
    <div className="rounded-md bg-limewash p-3">
      <p className="flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-wide text-ink/50">
        {icon}
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

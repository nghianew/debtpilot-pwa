import { AlertTriangle, CalendarCheck2 } from 'lucide-react';
import { formatCurrency, formatDateLong } from '../lib/format';
import type { DebtItem, DuePaymentGroups, DuePaymentItem } from '../types/debt';

interface DuePaymentsPanelProps {
  groups: DuePaymentGroups;
  onMarkPaid: (debt: DebtItem, amount?: number, note?: string) => Promise<void>;
}

export function DuePaymentsPanel({ groups, onMarkPaid }: DuePaymentsPanelProps) {
  const hasItems =
    groups.overdue.length > 0 || groups.today.length > 0 || groups.thisWeek.length > 0;

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-mint">Khoản đến hạn</p>
          <h2 className="text-xl font-black text-ink">Cần thanh toán</h2>
        </div>
        <CalendarCheck2 aria-hidden="true" className="mt-1 h-5 w-5 text-mint" />
      </div>

      {!hasItems ? (
        <p className="rounded-md bg-limewash p-3 text-sm font-semibold text-ink/60">
          Không có khoản đến hạn trong tuần này.
        </p>
      ) : (
        <div className="space-y-4">
          <DueGroup
            title="Quá hạn"
            tone="danger"
            items={groups.overdue}
            onMarkPaid={onMarkPaid}
          />
          <DueGroup title="Hôm nay" items={groups.today} onMarkPaid={onMarkPaid} />
          <DueGroup title="Tuần này" items={groups.thisWeek} onMarkPaid={onMarkPaid} />
        </div>
      )}
    </section>
  );
}

interface DueGroupProps {
  title: string;
  tone?: 'danger' | 'normal';
  items: DuePaymentItem[];
  onMarkPaid: (debt: DebtItem, amount?: number, note?: string) => Promise<void>;
}

function DueGroup({ title, tone = 'normal', items, onMarkPaid }: DueGroupProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3
        className={`mb-2 flex items-center gap-2 text-sm font-black ${
          tone === 'danger' ? 'text-coral' : 'text-ink'
        }`}
      >
        {tone === 'danger' ? <AlertTriangle aria-hidden="true" className="h-4 w-4" /> : null}
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <DueRow key={`${item.debt.id}-${item.dueDate.toISOString()}`} item={item} onMarkPaid={onMarkPaid} />
        ))}
      </div>
    </div>
  );
}

function DueRow({ item, onMarkPaid }: { item: DuePaymentItem; onMarkPaid: DueGroupProps['onMarkPaid'] }) {
  async function payPartial() {
    const input = window.prompt('Nhập số tiền thanh toán một phần', String(item.amountDue));
    if (!input) {
      return;
    }

    const amount = Number(input.replace(/[^\d]/g, ''));
    if (!amount || amount <= 0) {
      return;
    }

    await onMarkPaid(item.debt, amount, 'Thanh toán một phần');
  }

  return (
    <div className="rounded-md bg-limewash p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">{item.debt.name}</p>
          <p className="mt-1 text-sm text-ink/60">
            {formatCurrency(item.amountDue)} · {formatDateLong(item.dueDate)}
          </p>
          <p className="mt-1 text-xs font-semibold text-ink/45">{item.label}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void onMarkPaid(item.debt, item.amountDue, 'Đánh dấu đã thanh toán')}
          className="rounded-md bg-mint px-3 py-2.5 text-sm font-bold text-white"
        >
          Đánh dấu đã thanh toán
        </button>
        <button
          type="button"
          onClick={() => void payPartial()}
          className="rounded-md border border-ink/15 px-3 py-2.5 text-sm font-bold text-ink hover:bg-white"
        >
          Thanh toán một phần
        </button>
      </div>
    </div>
  );
}

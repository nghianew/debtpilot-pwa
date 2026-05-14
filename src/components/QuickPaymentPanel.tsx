import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../lib/format';
import type { DebtItem, PaymentFormValues } from '../types/debt';

interface QuickPaymentPanelProps {
  debts: DebtItem[];
  onAddPayment: (values: PaymentFormValues) => Promise<void>;
}

export function QuickPaymentPanel({ debts, onAddPayment }: QuickPaymentPanelProps) {
  const activeDebts = debts.filter((debt) => debt.status === 'active' && debt.currentBalance > 0);
  const [debtId, setDebtId] = useState<number>(activeDebts[0]?.id ?? 0);
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!debtId && activeDebts[0]?.id) {
      setDebtId(activeDebts[0].id);
    }
  }, [activeDebts, debtId]);

  async function handleSubmit() {
    if (!debtId || amount <= 0) {
      return;
    }

    setIsSaving(true);
    try {
      await onAddPayment({
        debtId,
        amount,
        paymentDate: new Date().toISOString().slice(0, 10),
        note
      });
      setAmount(0);
      setNote('');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-mint">Hôm nay đã trả</p>
          <h2 className="text-xl font-black text-ink">Ghi nhanh thanh toán</h2>
        </div>
        <CheckCircle2 aria-hidden="true" className="mt-1 h-5 w-5 text-mint" />
      </div>

      {activeDebts.length === 0 ? (
        <p className="mt-4 rounded-md bg-limewash p-3 text-sm font-semibold text-ink/60">
          Không còn khoản nợ đang hoạt động.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-ink">Khoản nợ</span>
            <select
              value={debtId}
              onChange={(event) => setDebtId(Number(event.target.value))}
              className="input"
            >
              {activeDebts.map((debt) => (
                <option key={debt.id} value={debt.id}>
                  {debt.name} · {formatCurrency(debt.currentBalance)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-ink">Số tiền</span>
            <span className="flex items-center rounded-md border border-ink/15 bg-white px-3 focus-within:border-mint focus-within:ring-2 focus-within:ring-mint/20">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="10000"
                value={amount || ''}
                onChange={(event) => setAmount(Number(event.target.value) || 0)}
                className="h-12 min-w-0 flex-1 bg-transparent text-base font-bold text-ink outline-none"
              />
              <span className="ml-1 text-sm font-bold text-ink/45">₫</span>
            </span>
          </label>

          <button
            type="button"
            disabled={isSaving || amount <= 0}
            onClick={() => void handleSubmit()}
            className="inline-flex h-12 items-center justify-center gap-2 self-end rounded-md bg-mint px-4 text-sm font-bold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            Lưu
          </button>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-ink">Ghi chú</span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ví dụ: chuyển khoản, tiền mặt..."
              className="input"
            />
          </label>
        </div>
      )}
    </section>
  );
}

import { Calculator, Coins } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { ProjectionPanel } from '../components/ProjectionPanel';
import { simulateCombinedProjection } from '../lib/finance';
import { formatCurrency } from '../lib/format';
import type { DebtItem } from '../types/debt';
import type { AppView } from '../types/navigation';

interface SimulatorPageProps {
  debts: DebtItem[];
  onNavigate: (view: AppView) => void;
}

export function SimulatorPage({ debts, onNavigate }: SimulatorPageProps) {
  const [extraDailyPayment, setExtraDailyPayment] = useState(100000);
  const activeDebts = debts.filter((debt) => debt.status === 'active' && debt.currentBalance > 0);
  const projection = useMemo(
    () => simulateCombinedProjection(activeDebts, { extraDailyPayment }),
    [activeDebts, extraDailyPayment]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dự báo trả nợ"
        description="Dự báo toàn bộ nợ cùng lúc, gồm lãi đơn, lãi kép, không lãi, khoản trả tháng và trả thêm hằng ngày."
      />

      {activeDebts.length === 0 ? (
        <EmptyState
          title="Không có nợ đang hoạt động"
          description="Thêm khoản nợ để chạy dự báo trả nợ tổng hợp."
          action={
            <button
              type="button"
              onClick={() => onNavigate('cards')}
              className="rounded-md bg-mint px-4 py-3 text-sm font-bold text-white shadow-soft"
            >
              Thêm khoản nợ
            </button>
          }
        />
      ) : (
        <>
          <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-mint">Trả thêm</p>
                <h2 className="text-xl font-black text-ink">Khoản trả hằng ngày</h2>
              </div>
              <Calculator aria-hidden="true" className="mt-1 h-5 w-5 text-mint" />
            </div>

            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-semibold text-ink">Số tiền trả thêm mỗi ngày</span>
              <span className="flex items-center rounded-md border border-ink/15 bg-white px-3 focus-within:border-mint focus-within:ring-2 focus-within:ring-mint/20">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="10000"
                  value={extraDailyPayment || ''}
                  onChange={(event) => setExtraDailyPayment(Number(event.target.value) || 0)}
                  className="h-12 min-w-0 flex-1 bg-transparent text-base font-bold text-ink outline-none"
                />
                <span className="ml-1 text-sm font-bold text-ink/45">₫</span>
              </span>
            </label>

            <div className="mt-4 rounded-md bg-limewash p-3">
              <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wide text-ink/50">
                <Coins aria-hidden="true" className="h-4 w-4" />
                Tổng còn lại hiện tại
              </p>
              <p className="mt-1 text-lg font-black text-ink">
                {formatCurrency(activeDebts.reduce((total, debt) => total + debt.currentBalance, 0))}
              </p>
            </div>
          </section>

          <ProjectionPanel result={projection} />
        </>
      )}
    </div>
  );
}

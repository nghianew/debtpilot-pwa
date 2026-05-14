import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DebtDetail } from '../components/DebtDetail';
import { DebtForm } from '../components/DebtForm';
import { DebtListItem } from '../components/DebtListItem';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import type { DebtItem, DebtItemFormValues, Payment } from '../types/debt';

interface CardsPageProps {
  debts: DebtItem[];
  payments: Payment[];
  onAddDebt: (values: DebtItemFormValues) => Promise<void>;
  onUpdateDebt: (debtId: number, values: DebtItemFormValues) => Promise<void>;
  onDeleteDebt: (debtId: number) => Promise<void>;
}

export function CardsPage({ debts, payments, onAddDebt, onUpdateDebt, onDeleteDebt }: CardsPageProps) {
  const [selectedDebtId, setSelectedDebtId] = useState<number | undefined>(debts[0]?.id);
  const [editingDebtId, setEditingDebtId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (!selectedDebtId && debts[0]?.id) {
      setSelectedDebtId(debts[0].id);
      return;
    }

    if (selectedDebtId && !debts.some((debt) => debt.id === selectedDebtId)) {
      setSelectedDebtId(debts[0]?.id);
    }
  }, [debts, selectedDebtId]);

  const editingDebt = useMemo(
    () => debts.find((debt) => debt.id === editingDebtId) ?? null,
    [debts, editingDebtId]
  );
  const selectedDebt = useMemo(
    () => debts.find((debt) => debt.id === selectedDebtId) ?? debts[0],
    [debts, selectedDebtId]
  );

  async function handleSubmit(values: DebtItemFormValues) {
    if (editingDebt?.id) {
      await onUpdateDebt(editingDebt.id, values);
    } else {
      await onAddDebt(values);
    }

    setIsFormOpen(false);
    setEditingDebtId(null);
  }

  async function handleDelete(debt: DebtItem) {
    if (!debt.id) {
      return;
    }

    const confirmed = window.confirm(`Xóa ${debt.name}? Lịch sử thanh toán của khoản này cũng sẽ bị xóa.`);
    if (!confirmed) {
      return;
    }

    await onDeleteDebt(debt.id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khoản nợ"
        description="Quản lý nợ thẻ tín dụng, nợ cố định hàng tháng, vay cá nhân, trả góp và nợ linh tinh."
        action={
          <button
            type="button"
            onClick={() => {
              setEditingDebtId(null);
              setIsFormOpen(true);
            }}
            className="grid h-12 w-12 place-items-center rounded-md bg-mint text-white shadow-soft"
            title="Thêm khoản nợ"
          >
            <Plus aria-hidden="true" className="h-6 w-6" />
          </button>
        }
      />

      {isFormOpen ? (
        <DebtForm
          initialDebt={editingDebt}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingDebtId(null);
          }}
        />
      ) : null}

      {debts.length === 0 && !isFormOpen ? (
        <EmptyState
          title="Thêm khoản nợ đầu tiên"
          description="Có thể là nợ thẻ tín dụng, tiền mượn, khoản vay hoặc món mua trả góp."
          action={
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="rounded-md bg-mint px-4 py-3 text-sm font-bold text-white shadow-soft"
            >
              Thêm khoản nợ
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-3">
            {debts.map((debt) => (
              <DebtListItem
                key={debt.id ?? debt.name}
                debt={debt}
                isSelected={selectedDebt?.id === debt.id}
                onSelect={() => setSelectedDebtId(debt.id)}
                onEdit={() => {
                  setEditingDebtId(debt.id ?? null);
                  setIsFormOpen(true);
                }}
                onDelete={() => void handleDelete(debt)}
              />
            ))}
          </div>

          {selectedDebt ? (
            <div className="lg:sticky lg:top-4 lg:self-start">
              <DebtDetail debt={selectedDebt} payments={payments} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

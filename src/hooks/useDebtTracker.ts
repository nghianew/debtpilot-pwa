import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../db/database';
import { demoDebts } from '../db/demoData';
import { applyPaymentToDebt, sanitizeMoney } from '../lib/finance';
import type { DebtItem, DebtItemFormValues, Payment, PaymentFormValues } from '../types/debt';

function normalizeDebtValues(values: DebtItemFormValues): DebtItemFormValues {
  const originalAmount = sanitizeMoney(values.originalAmount);
  const currentBalance = sanitizeMoney(values.currentBalance || originalAmount);
  const status = currentBalance <= 0 ? 'paid' : values.status;

  return {
    name: values.name.trim() || 'Khoản nợ chưa đặt tên',
    type: values.type,
    originalAmount: Math.max(originalAmount, currentBalance),
    currentBalance,
    interestType: values.interestType,
    apr: optionalNumber(values.apr),
    monthlyInterestRate: optionalNumber(values.monthlyInterestRate),
    minimumPayment: optionalMoney(values.minimumPayment),
    fixedMonthlyPayment: optionalMoney(values.fixedMonthlyPayment),
    dueDay: values.dueDay ? Math.min(31, Math.max(1, Math.round(values.dueDay))) : undefined,
    dueDate: values.dueDate || undefined,
    notes: values.notes?.trim() || undefined,
    status
  };
}

export function useDebtTracker() {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [savedDebts, savedPayments] = await Promise.all([
        db.debts.orderBy('updatedAt').reverse().toArray(),
        db.payments.orderBy('paymentDate').reverse().toArray()
      ]);
      setDebts(savedDebts);
      setPayments(savedPayments);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể tải dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const actions = useMemo(
    () => ({
      async addDebt(values: DebtItemFormValues) {
        const now = new Date().toISOString();
        await db.debts.add({
          ...normalizeDebtValues(values),
          createdAt: now,
          updatedAt: now
        });
        await loadData();
      },
      async updateDebt(debtId: number, values: DebtItemFormValues) {
        await db.debts.update(debtId, {
          ...normalizeDebtValues(values),
          updatedAt: new Date().toISOString()
        });
        await loadData();
      },
      async deleteDebt(debtId: number) {
        await db.transaction('rw', db.debts, db.payments, async () => {
          await db.debts.delete(debtId);
          await db.payments.where('debtId').equals(debtId).delete();
        });
        await loadData();
      },
      async addPayment(values: PaymentFormValues) {
        const debt = await db.debts.get(values.debtId);
        if (!debt || !debt.id) {
          return;
        }

        const { paidAmount, nextDebt } = applyPaymentToDebt(debt, values.amount);
        if (paidAmount <= 0) {
          return;
        }

        await db.transaction('rw', db.debts, db.payments, async () => {
          await db.payments.add({
            debtId: debt.id as number,
            amount: paidAmount,
            paymentDate: values.paymentDate,
            note: values.note?.trim() || undefined,
            createdAt: new Date().toISOString()
          });
          await db.debts.update(debt.id as number, nextDebt);
        });
        await loadData();
      },
      async markDuePaid(debt: DebtItem, amount?: number, note?: string) {
        if (!debt.id) {
          return;
        }

        const freshDebt = await db.debts.get(debt.id);
        if (!freshDebt) {
          return;
        }

        const { paidAmount, nextDebt } = applyPaymentToDebt(
          freshDebt,
          amount ?? freshDebt.fixedMonthlyPayment ?? freshDebt.minimumPayment ?? freshDebt.currentBalance
        );
        if (paidAmount <= 0) {
          return;
        }

        await db.transaction('rw', db.debts, db.payments, async () => {
          await db.payments.add({
            debtId: debt.id as number,
            amount: paidAmount,
            paymentDate: new Date().toISOString().slice(0, 10),
            note,
            createdAt: new Date().toISOString()
          });
          await db.debts.update(debt.id as number, nextDebt);
        });
        await loadData();
      },
      async seedDemoData() {
        const now = new Date().toISOString();
        await db.transaction('rw', db.debts, db.payments, async () => {
          await db.payments.clear();
          await db.debts.clear();
          await db.debts.bulkAdd(
            demoDebts.map((debt) => ({
              ...normalizeDebtValues(debt),
              createdAt: now,
              updatedAt: now
            }))
          );
        });
        await loadData();
      },
      async clearAllData() {
        await db.transaction('rw', db.debts, db.payments, async () => {
          await db.payments.clear();
          await db.debts.clear();
        });
        await loadData();
      }
    }),
    [loadData]
  );

  return {
    debts,
    payments,
    isLoading,
    error,
    refreshData: loadData,
    ...actions
  };
}

function optionalNumber(value: number | undefined) {
  if (!Number.isFinite(value) || !value || value <= 0) {
    return undefined;
  }

  return Number(value);
}

function optionalMoney(value: number | undefined) {
  if (!Number.isFinite(value) || !value || value <= 0) {
    return undefined;
  }

  return sanitizeMoney(value);
}

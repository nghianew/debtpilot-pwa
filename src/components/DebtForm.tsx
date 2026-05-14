import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { formatDebtType, formatInterestType } from '../lib/format';
import type { DebtItem, DebtItemFormValues, DebtType, InterestType } from '../types/debt';

interface DebtFormProps {
  initialDebt?: DebtItem | null;
  onSubmit: (values: DebtItemFormValues) => Promise<void> | void;
  onCancel: () => void;
}

const debtTypes: DebtType[] = [
  'credit_card',
  'fixed_monthly',
  'personal_loan',
  'installment',
  'borrowed_money',
  'other'
];

const interestTypes: InterestType[] = ['none', 'simple', 'compound'];

const emptyValues: DebtItemFormValues = {
  name: '',
  type: 'other',
  originalAmount: 0,
  currentBalance: 0,
  interestType: 'none',
  status: 'active'
};

export function DebtForm({ initialDebt, onSubmit, onCancel }: DebtFormProps) {
  const [values, setValues] = useState<DebtItemFormValues>(emptyValues);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialDebt) {
      setValues({
        name: initialDebt.name,
        type: initialDebt.type,
        originalAmount: initialDebt.originalAmount,
        currentBalance: initialDebt.currentBalance,
        interestType: initialDebt.interestType,
        apr: initialDebt.apr,
        monthlyInterestRate: initialDebt.monthlyInterestRate,
        minimumPaymentPercent: initialDebt.minimumPaymentPercent ?? legacyMinimumPaymentPercent(initialDebt),
        fixedMonthlyPayment: initialDebt.fixedMonthlyPayment,
        dueDay: initialDebt.dueDay,
        dueDate: initialDebt.dueDate,
        notes: initialDebt.notes,
        status: initialDebt.status
      });
      return;
    }

    setValues(emptyValues);
  }, [initialDebt]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const originalAmount = Math.max(values.originalAmount, values.currentBalance);
      await onSubmit({
        ...values,
        originalAmount,
        currentBalance: values.currentBalance || originalAmount,
        status: values.currentBalance <= 0 ? 'paid' : values.status
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">
            {initialDebt ? 'Sửa khoản nợ' : 'Thêm khoản nợ'}
          </h2>
          <p className="text-sm text-ink/60">Tất cả số tiền được lưu bằng VND trên thiết bị này.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="grid h-10 w-10 place-items-center rounded-md text-ink/60 hover:bg-ink/5 hover:text-ink"
          title="Đóng"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-ink">Tên khoản nợ</span>
          <input
            required
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="Ví dụ: Nợ thẻ tín dụng, tiền mượn, trả góp"
            className="input"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-semibold text-ink">Loại nợ</span>
          <select
            value={values.type}
            onChange={(event) =>
              setValues((current) => ({ ...current, type: event.target.value as DebtType }))
            }
            className="input"
          >
            {debtTypes.map((type) => (
              <option key={type} value={type}>
                {formatDebtType(type)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-sm font-semibold text-ink">Trạng thái</span>
          <select
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value === 'paid' ? 'paid' : 'active'
              }))
            }
            className="input"
          >
            <option value="active">Đang nợ</option>
            <option value="paid">Đã trả</option>
          </select>
        </label>

        <MoneyField
          label="Số tiền ban đầu"
          value={values.originalAmount}
          onChange={(originalAmount) =>
            setValues((current) => ({
              ...current,
              originalAmount,
              currentBalance: current.currentBalance || originalAmount
            }))
          }
        />
        <MoneyField
          label="Dư nợ hiện tại"
          value={values.currentBalance}
          onChange={(currentBalance) => setValues((current) => ({ ...current, currentBalance }))}
        />

        <label>
          <span className="mb-1 block text-sm font-semibold text-ink">Kiểu lãi</span>
          <select
            value={values.interestType}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                interestType: event.target.value as InterestType
              }))
            }
            className="input"
          >
            {interestTypes.map((type) => (
              <option key={type} value={type}>
                {formatInterestType(type)}
              </option>
            ))}
          </select>
        </label>

        <NumberField
          label="APR năm"
          value={values.apr ?? 0}
          suffix="%"
          step="0.01"
          onChange={(apr) => setValues((current) => ({ ...current, apr }))}
        />
        <NumberField
          label="Lãi tháng"
          value={values.monthlyInterestRate ?? 0}
          suffix="%"
          step="0.01"
          onChange={(monthlyInterestRate) =>
            setValues((current) => ({ ...current, monthlyInterestRate }))
          }
        />
        <NumberField
          label="Thanh toán tối thiểu (%)"
          value={values.minimumPaymentPercent ?? 0}
          suffix="% dư nợ"
          step="0.1"
          max={100}
          onChange={(minimumPaymentPercent) =>
            setValues((current) => ({ ...current, minimumPaymentPercent }))
          }
        />
        <MoneyField
          label="Trả cố định hằng tháng"
          value={values.fixedMonthlyPayment ?? 0}
          onChange={(fixedMonthlyPayment) =>
            setValues((current) => ({ ...current, fixedMonthlyPayment }))
          }
        />
        <NumberField
          label="Ngày đến hạn trong tháng"
          value={values.dueDay ?? 0}
          min={0}
          max={31}
          step="1"
          onChange={(dueDay) => setValues((current) => ({ ...current, dueDay }))}
        />
        <label>
          <span className="mb-1 block text-sm font-semibold text-ink">Ngày đến hạn riêng</span>
          <input
            type="date"
            value={values.dueDate ?? ''}
            onChange={(event) => setValues((current) => ({ ...current, dueDate: event.target.value }))}
            className="input"
          />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-ink">Ghi chú</span>
          <textarea
            value={values.notes ?? ''}
            onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
            className="min-h-24 w-full rounded-md border border-ink/15 bg-white px-3 py-3 text-base font-semibold text-ink outline-none transition placeholder:text-ink/35 focus:border-mint focus:ring-2 focus:ring-mint/20"
            placeholder="Điều kiện trả, người cho mượn, ghi nhớ riêng..."
          />
        </label>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-mint px-4 py-3 text-sm font-bold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          {isSaving ? 'Đang lưu' : 'Lưu khoản nợ'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-ink/15 px-4 py-3 text-sm font-bold text-ink hover:bg-ink/5"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}

function legacyMinimumPaymentPercent(debt: DebtItem) {
  if (!debt.minimumPayment || debt.currentBalance <= 0) {
    return undefined;
  }

  return Math.min(100, Math.max(0, (debt.minimumPayment / debt.currentBalance) * 100));
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: string;
  suffix?: string;
}

function NumberField({ label, value, onChange, min = 0, max, step = '1', suffix }: NumberFieldProps) {
  const [displayValue, setDisplayValue] = useState(value > 0 ? String(value) : '');

  useEffect(() => {
    setDisplayValue(value > 0 ? String(value) : '');
  }, [value]);

  function handleChange(rawValue: string) {
    const nextValue = rawValue.replace(',', '.').replace(/[^\d.]/g, '');
    const dotIndex = nextValue.indexOf('.');
    const normalizedValue =
      dotIndex >= 0
        ? `${nextValue.slice(0, dotIndex + 1)}${nextValue.slice(dotIndex + 1).replace(/\./g, '')}`
        : nextValue;
    const numericValue = Number(normalizedValue);

    setDisplayValue(normalizedValue);
    onChange(Number.isFinite(numericValue) ? numericValue : 0);
  }

  return (
    <label>
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      <span className="flex items-center rounded-md border border-ink/15 bg-white px-3 focus-within:border-mint focus-within:ring-2 focus-within:ring-mint/20">
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          aria-valuemin={min}
          aria-valuemax={max}
          data-step={step}
          onChange={(event) => handleChange(event.target.value)}
          className="h-12 min-w-0 flex-1 bg-transparent text-base font-semibold text-ink outline-none"
        />
        {suffix ? <span className="ml-1 text-sm font-semibold text-ink/50">{suffix}</span> : null}
      </span>
    </label>
  );
}

function MoneyField({ label, value, onChange }: Omit<NumberFieldProps, 'suffix' | 'step'>) {
  const [displayValue, setDisplayValue] = useState(value > 0 ? String(Math.round(value)) : '');

  useEffect(() => {
    setDisplayValue(value > 0 ? String(Math.round(value)) : '');
  }, [value]);

  function handleChange(rawValue: string) {
    const digitsOnly = rawValue.replace(/[^\d]/g, '');
    setDisplayValue(digitsOnly);
    onChange(digitsOnly ? Number(digitsOnly) : 0);
  }

  return (
    <label>
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      <span className="flex items-center rounded-md border border-ink/15 bg-white px-3 focus-within:border-mint focus-within:ring-2 focus-within:ring-mint/20">
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder="0"
          onChange={(event) => handleChange(event.target.value)}
          className="h-12 min-w-0 flex-1 bg-transparent text-base font-semibold text-ink outline-none"
        />
        <span className="ml-1 text-sm font-semibold text-ink/50">₫</span>
      </span>
    </label>
  );
}

import type { DebtType, InterestType } from '../types/debt';

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

const percentFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 1
});

const debtTypeLabels: Record<DebtType, string> = {
  credit_card: 'Nợ thẻ tín dụng',
  fixed_monthly: 'Nợ cố định hàng tháng',
  personal_loan: 'Khoản vay cá nhân',
  installment: 'Mua trả góp',
  borrowed_money: 'Tiền mượn',
  other: 'Nợ linh tinh'
};

const interestTypeLabels: Record<InterestType, string> = {
  none: 'Không lãi',
  simple: 'Lãi đơn',
  compound: 'Lãi kép'
};

export function formatCurrency(value: number) {
  const safeValue = Number.isFinite(value) ? Math.round(value) : 0;
  return vndFormatter.format(safeValue).replace(/\u00a0/g, ' ');
}

export function formatPercent(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${percentFormatter.format(safeValue)}%`;
}

export function formatMonthCount(months: number) {
  if (months <= 0) {
    return 'Đã trả xong';
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} tháng`;
  }

  if (remainingMonths === 0) {
    return `${years} năm`;
  }

  return `${years} năm ${remainingMonths} tháng`;
}

export function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit'
  }).format(date);
}

export function formatDateLong(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function formatDebtType(type: DebtType) {
  return debtTypeLabels[type];
}

export function formatInterestType(type: InterestType) {
  return interestTypeLabels[type];
}

import type { DebtItemFormValues } from '../types/debt';

export const demoDebts: DebtItemFormValues[] = [
  {
    name: 'Thẻ tín dụng VPBank',
    type: 'credit_card',
    originalAmount: 42000000,
    currentBalance: 42000000,
    interestType: 'compound',
    apr: 28.5,
    minimumPaymentPercent: 4,
    dueDay: 8,
    notes: 'Ưu tiên trả vì lãi cao.',
    status: 'active'
  },
  {
    name: 'Điện thoại trả góp',
    type: 'installment',
    originalAmount: 24000000,
    currentBalance: 15000000,
    interestType: 'none',
    fixedMonthlyPayment: 3000000,
    dueDay: 15,
    notes: 'Không lãi, trả cố định mỗi tháng.',
    status: 'active'
  },
  {
    name: 'Mượn bạn Minh',
    type: 'borrowed_money',
    originalAmount: 10000000,
    currentBalance: 6000000,
    interestType: 'none',
    fixedMonthlyPayment: 1000000,
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 4)
      .toISOString()
      .slice(0, 10),
    notes: 'Có thể trả linh hoạt.',
    status: 'active'
  },
  {
    name: 'Khoản vay cá nhân',
    type: 'personal_loan',
    originalAmount: 80000000,
    currentBalance: 68000000,
    interestType: 'simple',
    monthlyInterestRate: 1.2,
    fixedMonthlyPayment: 5000000,
    dueDay: 28,
    status: 'active'
  }
];

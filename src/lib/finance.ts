import type {
  CombinedProjectionInput,
  CombinedProjectionResult,
  DashboardSummary,
  DebtItem,
  DebtProgress,
  DuePaymentGroups,
  DuePaymentItem,
  MonthlyProjection,
  Payment
} from '../types/debt';

const VND = 1;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;
const DEFAULT_MAX_YEARS = 50;

export function sanitizeMoney(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.round(value);
}

export function getDebtProgress(debt: DebtItem): DebtProgress {
  const originalAmount = Math.max(debt.originalAmount, debt.currentBalance, 0);
  const totalPaid = sanitizeMoney(Math.max(0, originalAmount - debt.currentBalance));
  const progress = originalAmount <= 0 ? 100 : Math.min(100, (totalPaid / originalAmount) * 100);

  return { totalPaid, progress };
}

export function getRequiredPayment(debt: DebtItem) {
  if (debt.status === 'paid' || debt.currentBalance <= 0) {
    return 0;
  }

  const configuredPayment = debt.fixedMonthlyPayment ?? debt.minimumPayment ?? 0;

  if (configuredPayment > 0) {
    return sanitizeMoney(Math.min(debt.currentBalance, configuredPayment));
  }

  return sanitizeMoney(debt.currentBalance);
}

export function estimateMonthlyInterest(debt: DebtItem) {
  if (debt.status === 'paid' || debt.currentBalance <= 0 || debt.interestType === 'none') {
    return 0;
  }

  const monthlyRate = getMonthlyRate(debt);
  return sanitizeMoney(debt.currentBalance * monthlyRate);
}

export function dashboardSummary(
  debts: DebtItem[],
  payments: Payment[],
  now = new Date()
): DashboardSummary {
  const activeDebts = debts.filter((debt) => debt.status === 'active');
  const totalOriginalDebt = sanitizeMoney(
    debts.reduce((total, debt) => total + Math.max(debt.originalAmount, debt.currentBalance), 0)
  );
  const totalRemainingDebt = sanitizeMoney(
    activeDebts.reduce((total, debt) => total + debt.currentBalance, 0)
  );
  const balanceDerivedPaid = sanitizeMoney(Math.max(0, totalOriginalDebt - totalRemainingDebt));
  const recordedPayments = sanitizeMoney(payments.reduce((total, payment) => total + payment.amount, 0));
  const totalPaid = Math.max(balanceDerivedPaid, recordedPayments);
  const dueGroups = getDuePaymentGroups(debts, payments, now);

  return {
    totalOriginalDebt,
    totalRemainingDebt,
    totalPaid,
    recordedPayments,
    overallProgress: totalOriginalDebt <= 0 ? 0 : Math.min(100, (totalPaid / totalOriginalDebt) * 100),
    totalMonthlyRequired: sanitizeMoney(activeDebts.reduce((total, debt) => total + getRequiredPayment(debt), 0)),
    totalInterestEstimate: sanitizeMoney(
      activeDebts.reduce((total, debt) => total + estimateMonthlyInterest(debt), 0)
    ),
    overdueCount: dueGroups.overdue.length,
    dueSoonCount: dueGroups.today.length + dueGroups.thisWeek.length,
    activeCount: activeDebts.length,
    paidCount: debts.filter((debt) => debt.status === 'paid').length
  };
}

export function getDuePaymentGroups(
  debts: DebtItem[],
  payments: Payment[],
  now = new Date()
): DuePaymentGroups {
  const today = startOfDay(now);
  const weekEnd = addDays(today, 7);
  const groups: DuePaymentGroups = {
    overdue: [],
    today: [],
    thisWeek: []
  };

  for (const debt of debts) {
    if (debt.status === 'paid' || debt.currentBalance <= 0) {
      continue;
    }

    const dueItem = getDuePaymentItem(debt, payments, today);
    if (!dueItem) {
      continue;
    }

    const dueDate = startOfDay(dueItem.dueDate);

    if (dueDate < today) {
      groups.overdue.push(dueItem);
    } else if (isSameDay(dueDate, today)) {
      groups.today.push(dueItem);
    } else if (dueDate <= weekEnd) {
      groups.thisWeek.push(dueItem);
    }
  }

  groups.overdue.sort(sortDueItems);
  groups.today.sort(sortDueItems);
  groups.thisWeek.sort(sortDueItems);

  return groups;
}

export function getNextDueDate(debt: DebtItem, now = new Date()) {
  if (debt.dueDate) {
    return startOfDay(new Date(`${debt.dueDate}T00:00:00`));
  }

  if (!debt.dueDay) {
    return null;
  }

  const today = startOfDay(now);
  const year = today.getFullYear();
  const month = today.getMonth();
  const dayThisMonth = Math.min(debt.dueDay, daysInMonth(year, month));
  const dueThisMonth = new Date(year, month, dayThisMonth);

  if (dueThisMonth >= today) {
    return dueThisMonth;
  }

  const nextMonth = month + 1;
  return new Date(year, nextMonth, Math.min(debt.dueDay, daysInMonth(year, nextMonth)));
}

export function applyPaymentToDebt(debt: DebtItem, amount: number) {
  const paidAmount = sanitizeMoney(Math.min(Math.max(amount, 0), debt.currentBalance));
  const nextBalance = sanitizeMoney(Math.max(0, debt.currentBalance - paidAmount));

  return {
    paidAmount,
    nextDebt: {
      ...debt,
      currentBalance: nextBalance,
      status: nextBalance <= 0 ? 'paid' : 'active',
      updatedAt: new Date().toISOString()
    } satisfies DebtItem
  };
}

export function simulateCombinedProjection(
  debts: DebtItem[],
  input: CombinedProjectionInput
): CombinedProjectionResult {
  const startDate = startOfDay(input.startDate ?? new Date());
  const maxYears = input.maxYears ?? DEFAULT_MAX_YEARS;
  const maxDays = Math.max(DAYS_PER_YEAR, Math.round(maxYears * DAYS_PER_YEAR));
  const extraDailyPayment = sanitizeMoney(input.extraDailyPayment);
  const states = debts
    .filter((debt) => debt.status === 'active' && debt.currentBalance > 0)
    .map<ProjectionDebtState>((debt) => ({
      debt,
      balance: debt.currentBalance,
      simpleInterestBase: debt.currentBalance
    }));
  const monthlyProjection: MonthlyProjection[] = [];

  if (states.length === 0) {
    return {
      payoffDate: startDate,
      totalDays: 0,
      totalMonths: 0,
      totalRemainingDebt: 0,
      totalInterestUntilPayoff: 0,
      totalPaidUntilPayoff: 0,
      monthlyProjection
    };
  }

  let totalInterest = 0;
  let totalPaid = 0;
  let monthInterest = 0;
  let monthPayments = 0;
  let previousMonthDebt = totalProjectionDebt(states);
  let simulatedDays = 0;
  let warning: string | undefined;

  for (let day = 1; day <= maxDays; day += 1) {
    simulatedDays = day;

    for (const state of states) {
      if (state.balance <= 0 || state.debt.interestType === 'none') {
        continue;
      }

      const dailyRate = getDailyRate(state.debt);
      const interest =
        state.debt.interestType === 'simple'
          ? state.simpleInterestBase * dailyRate
          : state.balance * dailyRate;

      state.balance += interest;
      totalInterest += interest;
      monthInterest += interest;
    }

    const dailyPaid = applyExtraDailyPayment(states, extraDailyPayment);
    totalPaid += dailyPaid;
    monthPayments += dailyPaid;

    if (day % DAYS_PER_MONTH === 0) {
      const monthlyPaid = applyMonthlyPayments(states);
      totalPaid += monthlyPaid;
      monthPayments += monthlyPaid;
    }

    const remainingDebt = totalProjectionDebt(states);

    if (day % DAYS_PER_MONTH === 0 || remainingDebt <= VND || day === maxDays) {
      const projectionMonth = Math.max(1, Math.ceil(day / DAYS_PER_MONTH));

      monthlyProjection.push({
        month: projectionMonth,
        date: addDays(startDate, day),
        remainingDebt: sanitizeMoney(remainingDebt),
        interestPaid: sanitizeMoney(monthInterest),
        paymentsMade: sanitizeMoney(monthPayments)
      });

      if (remainingDebt <= VND) {
        return {
          payoffDate: addDays(startDate, day),
          totalDays: day,
          totalMonths: Math.ceil(day / DAYS_PER_MONTH),
          totalRemainingDebt: 0,
          totalInterestUntilPayoff: sanitizeMoney(totalInterest),
          totalPaidUntilPayoff: sanitizeMoney(totalPaid),
          monthlyProjection
        };
      }

      const monthlyReduction = previousMonthDebt - remainingDebt;
      if (remainingDebt >= previousMonthDebt - VND) {
        warning = 'Khoản trả hiện tại quá thấp, tổng nợ không giảm sau lãi.';
        break;
      }

      if (projectionMonth >= 3 && monthlyReduction < Math.max(50000, previousMonthDebt * 0.0005)) {
        warning = 'Nợ đang giảm quá chậm. Hãy tăng khoản trả hằng ngày hoặc hằng tháng.';
        break;
      }

      previousMonthDebt = remainingDebt;
      monthInterest = 0;
      monthPayments = 0;
    }
  }

  return {
    payoffDate: null,
    totalDays: simulatedDays,
    totalMonths: Math.ceil(simulatedDays / DAYS_PER_MONTH),
    totalRemainingDebt: sanitizeMoney(totalProjectionDebt(states)),
    totalInterestUntilPayoff: sanitizeMoney(totalInterest),
    totalPaidUntilPayoff: sanitizeMoney(totalPaid),
    monthlyProjection,
    warning: warning ?? `Dự báo vượt quá ${maxYears} năm.`
  };
}

interface ProjectionDebtState {
  debt: DebtItem;
  balance: number;
  simpleInterestBase: number;
}

function getDuePaymentItem(debt: DebtItem, payments: Payment[], today: Date): DuePaymentItem | null {
  const amountDue = getRequiredPayment(debt);
  if (amountDue <= 0) {
    return null;
  }

  if (debt.dueDate) {
    return {
      debt,
      dueDate: startOfDay(new Date(`${debt.dueDate}T00:00:00`)),
      amountDue,
      label: 'Ngày đến hạn'
    };
  }

  if (!debt.dueDay) {
    return null;
  }

  const dueDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    Math.min(debt.dueDay, daysInMonth(today.getFullYear(), today.getMonth()))
  );

  const wasPaidThisPeriod = payments.some((payment) => {
    if (payment.debtId !== debt.id) {
      return false;
    }

    const paymentDate = startOfDay(new Date(`${payment.paymentDate}T00:00:00`));
    return paymentDate >= dueDate && paymentDate.getMonth() === dueDate.getMonth();
  });

  if (wasPaidThisPeriod) {
    return null;
  }

  return {
    debt,
    dueDate,
    amountDue,
    label: `Ngày ${debt.dueDay} hằng tháng`
  };
}

function applyExtraDailyPayment(states: ProjectionDebtState[], amount: number) {
  let remaining = sanitizeMoney(amount);
  let paid = 0;

  if (remaining <= 0) {
    return paid;
  }

  const orderedStates = [...states]
    .filter((state) => state.balance > 0)
    .sort((a, b) => getDailyRate(b.debt) - getDailyRate(a.debt) || b.balance - a.balance);

  for (const state of orderedStates) {
    if (remaining <= 0) {
      break;
    }

    const payment = Math.min(state.balance, remaining);
    state.balance -= payment;
    state.simpleInterestBase = Math.max(0, state.simpleInterestBase - payment);
    paid += payment;
    remaining -= payment;
  }

  return sanitizeMoney(paid);
}

function applyMonthlyPayments(states: ProjectionDebtState[]) {
  let paid = 0;

  for (const state of states) {
    if (state.balance <= 0) {
      continue;
    }

    const payment = Math.min(state.balance, getRequiredPayment(state.debt));
    state.balance -= payment;
    state.simpleInterestBase = Math.max(0, state.simpleInterestBase - payment);
    paid += payment;
  }

  return sanitizeMoney(paid);
}

function getMonthlyRate(debt: DebtItem) {
  if (debt.monthlyInterestRate && debt.monthlyInterestRate > 0) {
    return debt.monthlyInterestRate / 100;
  }

  if (debt.apr && debt.apr > 0) {
    return debt.apr / 100 / 12;
  }

  return 0;
}

function getDailyRate(debt: DebtItem) {
  if (debt.monthlyInterestRate && debt.monthlyInterestRate > 0) {
    return debt.monthlyInterestRate / 100 / DAYS_PER_MONTH;
  }

  if (debt.apr && debt.apr > 0) {
    return debt.apr / 100 / DAYS_PER_YEAR;
  }

  return 0;
}

function totalProjectionDebt(states: ProjectionDebtState[]) {
  return states.reduce((total, state) => total + Math.max(0, state.balance), 0);
}

function sortDueItems(a: DuePaymentItem, b: DuePaymentItem) {
  return a.dueDate.getTime() - b.dueDate.getTime() || a.debt.name.localeCompare(b.debt.name);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

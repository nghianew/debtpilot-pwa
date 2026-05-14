import Dexie, { type Table } from 'dexie';
import type { DebtItem, Payment } from '../types/debt';

const LEGACY_CARD_TO_VND_RATE = 25000;

interface LegacyCardRecord {
  id?: number;
  name: string;
  balance: number;
  apr: number;
  creditLimit: number;
  minimumPayment: number;
  dueDay: number;
  createdAt: string;
  updatedAt: string;
  baseCurrency?: 'VND';
}

export class DebtPilotDatabase extends Dexie {
  cards!: Table<LegacyCardRecord, number>;
  debts!: Table<DebtItem, number>;
  payments!: Table<Payment, number>;

  constructor() {
    super('debtpilot');

    this.version(1).stores({
      cards: '++id, name, dueDay, apr, balance, updatedAt'
    });

    this.version(2)
      .stores({
        cards: '++id, name, dueDay, apr, balance, updatedAt, baseCurrency'
      })
      .upgrade(async (transaction) => {
        const cards = transaction.table<LegacyCardRecord, number>('cards');

        await cards.toCollection().modify((card) => {
          if (card.baseCurrency === 'VND') {
            return;
          }

          card.balance = migrateUsdToVnd(card.balance);
          card.creditLimit = migrateUsdToVnd(card.creditLimit);
          card.minimumPayment = migrateUsdToVnd(card.minimumPayment);
          card.baseCurrency = 'VND';
          card.updatedAt = new Date().toISOString();
        });
      });

    this.version(3)
      .stores({
        cards: '++id, name, dueDay, apr, balance, updatedAt, baseCurrency',
        debts: '++id, name, type, status, dueDay, dueDate, updatedAt',
        payments: '++id, debtId, paymentDate, createdAt'
      })
      .upgrade(async (transaction) => {
        const cards = transaction.table<LegacyCardRecord, number>('cards');
        const debts = transaction.table<DebtItem, number>('debts');
        const existingDebtCount = await debts.count();

        if (existingDebtCount > 0) {
          return;
        }

        const legacyCards = await cards.toArray();
        const now = new Date().toISOString();

        if (legacyCards.length === 0) {
          return;
        }

        await debts.bulkAdd(
          legacyCards.map((card) => {
            const balance =
              card.baseCurrency === 'VND' ? normalizeVnd(card.balance) : migrateUsdToVnd(card.balance);
            const minimumPayment =
              card.baseCurrency === 'VND'
                ? normalizeVnd(card.minimumPayment)
                : migrateUsdToVnd(card.minimumPayment);

            return {
              name: card.name,
              type: 'credit_card',
              originalAmount: balance,
              currentBalance: balance,
              interestType: 'compound',
              apr: card.apr,
              minimumPayment,
              dueDay: card.dueDay,
              notes: 'Được chuyển từ dữ liệu thẻ tín dụng cũ.',
              status: balance <= 0 ? 'paid' : 'active',
              createdAt: card.createdAt ?? now,
              updatedAt: now
            } satisfies DebtItem;
          })
        );
      });
  }
}

export const db = new DebtPilotDatabase();

function migrateUsdToVnd(value: number) {
  return normalizeVnd((Number(value) || 0) * LEGACY_CARD_TO_VND_RATE);
}

function normalizeVnd(value: number) {
  return Math.max(0, Math.round(Number(value) || 0));
}

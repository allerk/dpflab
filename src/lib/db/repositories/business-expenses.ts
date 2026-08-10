import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import type { Db } from '../types';
import { businessExpenses } from '../schema';

export const BUSINESS_EXPENSE_CATEGORIES = [
  'utilities',
  'rent',
  'equipment',
  'consumables',
  'marketing',
  'transport',
  'software_admin',
  'taxes_fees',
  'other'
] as const;

export type BusinessExpenseCategory = (typeof BUSINESS_EXPENSE_CATEGORIES)[number];
export type BusinessExpenseRow = typeof businessExpenses.$inferSelect;

export type BusinessExpenseInput = {
  expenseDate: string;
  category: BusinessExpenseCategory;
  amountCents: number;
  currency?: string;
  vendor?: string;
  comment?: string;
  createdBy?: string;
};

export function isBusinessExpenseDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export async function createBusinessExpense(db: Db, input: BusinessExpenseInput): Promise<number> {
  if (!isBusinessExpenseDate(input.expenseDate)) throw new Error('Invalid expense date');
  if (!BUSINESS_EXPENSE_CATEGORIES.includes(input.category)) throw new Error('Invalid expense category');
  const amountCents = Math.round(input.amountCents);
  if (!Number.isInteger(amountCents) || amountCents <= 0) throw new Error('Expense amount must be positive');
  const currency = (input.currency ?? 'EUR').toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Invalid expense currency');
  const now = new Date();
  const [created] = await db
    .insert(businessExpenses)
    .values({
      expenseDate: input.expenseDate,
      category: input.category,
      amountCents,
      currency,
      vendor: input.vendor?.trim() ?? '',
      comment: input.comment?.trim() ?? '',
      createdBy: input.createdBy?.trim() ?? '',
      createdAt: now,
      updatedAt: now
    })
    .returning({ id: businessExpenses.id });
  return created.id;
}

export async function listBusinessExpenses(
  db: Db,
  input: { dateFrom?: string; dateTo?: string; category?: BusinessExpenseCategory; limit?: number } = {}
): Promise<BusinessExpenseRow[]> {
  if (input.dateFrom && !isBusinessExpenseDate(input.dateFrom)) throw new Error('Invalid expense start date');
  if (input.dateTo && !isBusinessExpenseDate(input.dateTo)) throw new Error('Invalid expense end date');
  return db
    .select()
    .from(businessExpenses)
    .where(
      and(
        input.dateFrom ? gte(businessExpenses.expenseDate, input.dateFrom) : undefined,
        input.dateTo ? lte(businessExpenses.expenseDate, input.dateTo) : undefined,
        input.category ? eq(businessExpenses.category, input.category) : undefined
      )
    )
    .orderBy(desc(businessExpenses.expenseDate), desc(businessExpenses.id))
    .limit(Math.min(Math.max(input.limit ?? 500, 1), 5_000));
}

export async function getBusinessExpenseTotals(
  db: Db,
  input: { dateFrom: string; dateTo: string }
): Promise<Array<{ currency: string; amountCents: number }>> {
  if (!isBusinessExpenseDate(input.dateFrom) || !isBusinessExpenseDate(input.dateTo)) throw new Error('Invalid expense period');
  const rows = await db
    .select({
      currency: businessExpenses.currency,
      amountCents: sql<number>`coalesce(sum(${businessExpenses.amountCents}), 0)`
    })
    .from(businessExpenses)
    .where(
      and(
        gte(businessExpenses.expenseDate, input.dateFrom),
        lte(businessExpenses.expenseDate, input.dateTo)
      )
    )
    .groupBy(businessExpenses.currency);
  return rows.map((row) => ({ currency: row.currency, amountCents: Number(row.amountCents) }));
}

export async function deleteBusinessExpense(db: Db, id: number): Promise<boolean> {
  const deleted = await db
    .delete(businessExpenses)
    .where(eq(businessExpenses.id, id))
    .returning({ id: businessExpenses.id });
  return deleted.length > 0;
}

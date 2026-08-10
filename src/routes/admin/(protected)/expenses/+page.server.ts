import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/db';
import {
  BUSINESS_EXPENSE_CATEGORIES,
  createBusinessExpense,
  deleteBusinessExpense,
  getBusinessExpenseTotals,
  isBusinessExpenseDate,
  listBusinessExpenses,
  type BusinessExpenseCategory
} from '$lib/db/repositories/business-expenses';
import { requireAdmin } from '$lib/server/admin/require-admin';
import { formatTallinnDate } from '$lib/server/crm/tallinn-time';

const monthStart = (date: string) => `${date.slice(0, 7)}-01`;
const value = (data: FormData, key: string, max = 500) =>
  String(data.get(key) ?? '').trim().slice(0, max);

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const db = getDb(event.platform);
  const today = formatTallinnDate(new Date());
  const dateFrom = monthStart(today);
  const [rows, totals] = await Promise.all([
    listBusinessExpenses(db, { limit: 500 }),
    getBusinessExpenseTotals(db, { dateFrom, dateTo: today })
  ]);
  return { rows, totals, today, dateFrom };
};

export const actions: Actions = {
  create: async (event) => {
    const { email: actor } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const expenseDate = value(data, 'expense_date', 10);
    const category = value(data, 'category', 40) as BusinessExpenseCategory;
    const rawAmount = value(data, 'amount', 32).replace(',', '.');
    const amount = Number(rawAmount);
    const values = {
      expenseDate,
      category,
      amount: rawAmount,
      vendor: value(data, 'vendor', 160),
      comment: value(data, 'comment', 1_000)
    };
    if (!isBusinessExpenseDate(expenseDate)) {
      return fail(422, { section: 'create', error: 'Проверьте дату', values });
    }
    if (!BUSINESS_EXPENSE_CATEGORIES.includes(category)) {
      return fail(422, { section: 'create', error: 'Выберите категорию', values });
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) {
      return fail(422, { section: 'create', error: 'Сумма должна быть больше нуля', values });
    }
    await createBusinessExpense(db, {
      expenseDate,
      category,
      amountCents: Math.round(amount * 100),
      vendor: values.vendor,
      comment: values.comment,
      createdBy: actor
    });
    redirect(303, '/admin/expenses?saved=1');
  },

  delete: async (event) => {
    requireAdmin(event);
    const db = getDb(event.platform);
    const id = Number(value(await event.request.formData(), 'id', 20));
    if (!Number.isInteger(id) || id < 1) return fail(400, { error: 'Некорректная запись' });
    if (!(await deleteBusinessExpense(db, id))) return fail(404, { error: 'Расход не найден' });
    redirect(303, '/admin/expenses?deleted=1');
  }
};

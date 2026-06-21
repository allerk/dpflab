import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { getDb } from '$lib/db/index.js';
import {
  getFaqRows,
  createFaqItem,
  deleteFaqItem,
  reorderFaqItem
} from '$lib/db/repositories/faq.js';
import { makeLangStr, getLang } from '$lib/db/langstr.js';

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const db = getDb(event.platform);
  const raw = await getFaqRows(db);
  const rows = raw.map((r) => ({
    id: r.id,
    sortOrder: r.sortOrder,
    questionRu: getLang(r.question, 'ru')
  }));
  return { rows };
};

export const actions: Actions = {
  create: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const questionRu = (data.get('question_ru') as string)?.trim() ?? '';
    const questionEt = (data.get('question_et') as string)?.trim() ?? '';
    const answerRu = (data.get('answer_ru') as string)?.trim() ?? '';
    const answerEt = (data.get('answer_et') as string)?.trim() ?? '';

    const errors: Record<string, string> = {};
    if (!questionRu) errors.question_ru = 'required';
    if (!questionEt) errors.question_et = 'required';
    if (!answerRu) errors.answer_ru = 'required';
    if (!answerEt) errors.answer_et = 'required';

    if (Object.keys(errors).length) {
      return fail(400, { errors, values: { questionRu, questionEt, answerRu, answerEt } });
    }

    await createFaqItem(db, {
      question: makeLangStr({ ru: questionRu, et: questionEt }),
      answer: makeLangStr({ ru: answerRu, et: answerEt })
    });
    console.info(`[admin] action=create domain=faq email=${email}`);
    redirect(303, '/admin/faq');
  },

  delete: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await deleteFaqItem(db, id);
    console.info(`[admin] action=delete domain=faq id=${id} email=${email}`);
    redirect(303, '/admin/faq');
  },

  moveUp: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await reorderFaqItem(db, id, 'up');
    console.info(`[admin] action=moveUp domain=faq id=${id} email=${email}`);
    redirect(303, '/admin/faq');
  },

  moveDown: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const data = await event.request.formData();
    const id = parseInt(data.get('id') as string, 10);
    if (isNaN(id)) return fail(400, { error: 'Invalid id' });

    await reorderFaqItem(db, id, 'down');
    console.info(`[admin] action=moveDown domain=faq id=${id} email=${email}`);
    redirect(303, '/admin/faq');
  }
};

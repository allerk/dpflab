import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { getDb } from '$lib/db/index.js';
import { getFaqRows, updateFaqItem } from '$lib/db/repositories/faq.js';
import { makeLangStr, getLang } from '$lib/db/langstr.js';

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const db = getDb(event.platform);
  const id = parseInt(event.params.id, 10);
  if (isNaN(id)) error(404, 'Not found');

  const rows = await getFaqRows(db);
  const row = rows.find((r) => r.id === id);
  if (!row) error(404, 'Not found');

  return {
    row: {
      id: row.id,
      questionRu: getLang(row.question, 'ru'),
      questionEt: getLang(row.question, 'et'),
      answerRu: getLang(row.answer, 'ru'),
      answerEt: getLang(row.answer, 'et')
    }
  };
};

export const actions: Actions = {
  update: async (event) => {
    const { email } = requireAdmin(event);
    const db = getDb(event.platform);
    const id = parseInt(event.params.id, 10);
    if (isNaN(id)) error(404, 'Not found');

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

    await updateFaqItem(db, id, {
      question: makeLangStr({ ru: questionRu, et: questionEt }),
      answer: makeLangStr({ ru: answerRu, et: answerEt })
    });
    console.info(`[admin] action=update domain=faq id=${id} email=${email}`);
    redirect(303, '/admin/faq');
  }
};

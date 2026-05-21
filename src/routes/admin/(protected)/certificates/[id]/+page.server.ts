import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/require-admin.js';
import { db } from '$lib/db/index.js';
import { getCertificateRows, updateCertificate } from '$lib/db/repositories/certificates.js';
import { makeLangStr, getLang } from '$lib/db/langstr.js';

export const load: PageServerLoad = async (event) => {
  requireAdmin(event);
  const id = parseInt(event.params.id, 10);
  if (isNaN(id)) error(404, 'Not found');

  const rows = await getCertificateRows(db);
  const row = rows.find((r) => r.id === id);
  if (!row) error(404, 'Not found');

  return {
    row: {
      id: row.id,
      titleRu: getLang(row.title, 'ru'),
      titleEt: getLang(row.title, 'et'),
      textRu: getLang(row.text, 'ru'),
      textEt: getLang(row.text, 'et')
    }
  };
};

export const actions: Actions = {
  update: async (event) => {
    const { email } = requireAdmin(event);
    const id = parseInt(event.params.id, 10);
    if (isNaN(id)) error(404, 'Not found');

    const data = await event.request.formData();
    const titleRu = (data.get('title_ru') as string)?.trim() ?? '';
    const titleEt = (data.get('title_et') as string)?.trim() ?? '';
    const textRu = (data.get('text_ru') as string)?.trim() ?? '';
    const textEt = (data.get('text_et') as string)?.trim() ?? '';

    const errors: Record<string, string> = {};
    if (!titleRu) errors.title_ru = 'required';
    if (!titleEt) errors.title_et = 'required';
    if (!textRu) errors.text_ru = 'required';
    if (!textEt) errors.text_et = 'required';

    if (Object.keys(errors).length) {
      return fail(400, { errors, values: { titleRu, titleEt, textRu, textEt } });
    }

    await updateCertificate(db, id, {
      title: makeLangStr({ ru: titleRu, et: titleEt }),
      text: makeLangStr({ ru: textRu, et: textEt })
    });
    console.info(`[admin] action=update domain=certificates id=${id} email=${email}`);
    redirect(303, '/admin/certificates');
  }
};

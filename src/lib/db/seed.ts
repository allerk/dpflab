import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { faq, reviews, pricing, certificates, contacts, siteImages } from './schema';
import { makeLangStr } from './langstr';
import { SITE_IMAGE_KEYS } from './repositories/site-images';

const client = createClient({ url: process.env.DATABASE_URL ?? 'file:./data/dpflab.db' });
const db = drizzle(client, { schema });

// Clear existing content so the script is idempotent
await db.delete(faq);
await db.delete(reviews);
await db.delete(pricing);
await db.delete(certificates);
await db.delete(contacts);

await db.insert(faq).values([
  {
    question: makeLangStr({
      et: 'Kui kaua kestab puhastus?',
      ru: 'Сколько длится чистка?'
    }),
    answer: makeLangStr({
      et: 'Tsükkel kestab keskmiselt 1–2,5 tundi sõltuvalt filtri tüübist ja seisukorrast.',
      ru: 'Цикл в среднем 1–2,5 часа в зависимости от типа и состояния фильтра.'
    }),
    sortOrder: 1
  },
  {
    question: makeLangStr({
      et: 'Kas pakute DPF-filtri äraveo ja tagasitoomise teenust?',
      ru: 'Предоставляете ли вы услугу вывоза и обратной доставки DPF-фильтра?'
    }),
    answer: makeLangStr({
      et: 'Jah, pakume DPF-filtri äraveo ja tagasitoomise teenust. Enamasti toome filtri ära ja tagastame selle samal päeval. Teenuse maksimaalne täitmisaeg alates äraveost kuni tagasitoomiseni on 24 tundi.',
      ru: 'Да, мы предоставляем услугу вывоза и обратной доставки DPF-фильтра. В большинстве случаев мы забираем фильтр и возвращаем его обратно в тот же день. Максимальный срок выполнения услуги с момента вывоза до обратной доставки составляет 24 часа.'
    }),
    sortOrder: 2
  },
  {
    question: makeLangStr({
      et: 'Kas teenus sobib kõikidele automarkidele?',
      ru: 'Подходит ли услуга для всех марок авто?'
    }),
    answer: makeLangStr({
      et: 'Jah, töötame kõikide DPF ja FAP filtritega — nii sõidu- kui ka veoautodele.',
      ru: 'Да, мы работаем со всеми типами DPF и FAP фильтров — как для легковых, так и для грузовых автомобилей.'
    }),
    sortOrder: 3
  },
  {
    question: makeLangStr({
      et: 'Mis on hinna sees?',
      ru: 'Что входит в стоимость?'
    }),
    answer: makeLangStr({
      et: 'Diagnostika, sügav hüdrodünaamiline puhastus, läbilaskvuse test ja teostatud tööde raport.',
      ru: 'Диагностика, глубокая гидродинамическая очистка, тест пропускной способности и отчёт о выполненных работах.'
    }),
    sortOrder: 4
  },
  {
    question: makeLangStr({
      et: 'Kas annate garantii?',
      ru: 'Даёте ли гарантию?'
    }),
    answer: makeLangStr({
      et: 'Jah, anname garantii puhastuse tulemusele. Taastame läbilaskvuse kuni 98%.',
      ru: 'Да, мы предоставляем гарантию на результат очистки. Восстанавливаем пропускную способность до 98%.'
    }),
    sortOrder: 5
  }
]);

await db.insert(pricing).values([
  {
    icon: 'filter',
    title: makeLangStr({ et: 'DPF filtri puhastus', ru: 'Очистка DPF фильтра' }),
    price: 'от 100€',
    cta: makeLangStr({ et: 'Tellida', ru: 'Заказать' }),
    sortOrder: 1
  },
  {
    icon: 'truck',
    title: makeLangStr({ et: 'Veoauto DPF puhastus', ru: 'Очистка DPF грузового авто' }),
    price: 'от 200€',
    cta: makeLangStr({ et: 'Tellida', ru: 'Заказать' }),
    sortOrder: 2
  }
]);

await db.insert(contacts).values({
  phone: '+372 5555 5014',
  phoneHref: 'tel:+37255555014',
  whatsapp: 'https://wa.me/37255555014',
  email: 'info@dpflab.ee',
  address: 'Saha-Loo tee 36, Iru, 74206',
  weekdaysOpen: '09:00',
  weekdaysClose: '18:00',
  saturdayOpen: '10:00',
  saturdayClose: '15:00'
});

// Initialize site image slots without overwriting admin-set values
for (const key of SITE_IMAGE_KEYS) {
  await db.insert(siteImages).values({ key, filename: null }).onConflictDoNothing();
}

console.log('✓ Database seeded');
client.close();

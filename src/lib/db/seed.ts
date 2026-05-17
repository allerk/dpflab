import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { faq, reviews, pricing, certificates, contacts } from './schema';
import { makeLangStr } from './langstr';

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
      ee: 'Kui kaua võtab DPF puhastus aega?',
      ru: 'Сколько времени занимает очистка DPF?'
    }),
    answer: makeLangStr({
      ee: 'Standardne puhastus — 24 tundi. Kiirtellimuse korral teostame töö kiiremini lisatasu eest.',
      ru: 'Стандартная очистка — 24 часа. При срочном заказе мы можем выполнить работу быстрее за дополнительную плату.'
    }),
    sortOrder: 1
  },
  {
    question: makeLangStr({
      ee: 'Kas teenus sobib kõikidele automarkidele?',
      ru: 'Подходит ли услуга для всех марок авто?'
    }),
    answer: makeLangStr({
      ee: 'Jah, töötame kõikide DPF ja FAP filtritega — nii sõidu- kui ka veoautodele.',
      ru: 'Да, мы работаем со всеми типами DPF и FAP фильтров — как для легковых, так и для грузовых автомобилей.'
    }),
    sortOrder: 2
  },
  {
    question: makeLangStr({
      ee: 'Mis on hinna sees?',
      ru: 'Что входит в стоимость?'
    }),
    answer: makeLangStr({
      ee: 'Diagnostika, sügav hüdrodünaamiline puhastus, läbilaskvuse test ja teostatud tööde raport.',
      ru: 'Диагностика, глубокая гидродинамическая очистка, тест пропускной способности и отчёт о выполненных работах.'
    }),
    sortOrder: 3
  },
  {
    question: makeLangStr({
      ee: 'Kas annate garantii?',
      ru: 'Даёте ли гарантию?'
    }),
    answer: makeLangStr({
      ee: 'Jah, anname garantii puhastuse tulemusele. Taastame läbilaskvuse kuni 98%.',
      ru: 'Да, мы предоставляем гарантию на результат очистки. Восстанавливаем пропускную способность до 98%.'
    }),
    sortOrder: 4
  },
  {
    question: makeLangStr({
      ee: 'Kas on võimalik filtri kohaletoomine?',
      ru: 'Возможен ли забор и доставка фильтра?'
    }),
    answer: makeLangStr({
      ee: 'Jah, meil töötab kullerteenus üle kogu Eesti. Hind sõltub piirkonnast.',
      ru: 'Да, у нас работает курьерская служба по всей Эстонии. Стоимость зависит от региона.'
    }),
    sortOrder: 5
  }
]);

await db.insert(reviews).values([
  {
    stars: 5,
    text: makeLangStr({
      ee: 'Kiire, kvaliteetne ja taskukohase hinnaga. Filter nagu uus, auto sõidab täiesti teisiti!',
      ru: 'Быстро, качественно и по адекватной цене. Фильтр как новый, машина поехала совсем иначе!'
    }),
    author: '— Aleksei, Tallinn',
    sortOrder: 1
  },
  {
    stars: 5,
    text: makeLangStr({
      ee: 'Teeme DPFLABiga pidevalt koostööd. Alati kiire teenindus ja tagastus.',
      ru: 'Сотрудничаем с DPFLAB на постоянной основе. Всегда быстро забирают и возвращают фильтры.'
    }),
    author: '— AutoPro OÜ',
    sortOrder: 2
  },
  {
    stars: 5,
    text: makeLangStr({
      ee: 'Suurepärane teenus! Tulid kohale, puhastasid ja tõid tagasi. Soovitan!',
      ru: 'Отличный сервис! Забрали, почистили и привезли обратно. Рекомендую!'
    }),
    author: '— Igor, Tartu',
    sortOrder: 3
  }
]);

await db.insert(pricing).values([
  {
    icon: 'filter',
    title: makeLangStr({ ee: 'DPF filtri puhastus', ru: 'Очистка DPF фильтра' }),
    price: 'от 150€',
    cta: makeLangStr({ ee: 'Tellida', ru: 'Заказать' }),
    sortOrder: 1
  },
  {
    icon: 'scope',
    title: makeLangStr({ ee: 'Filtri diagnostika', ru: 'Диагностика фильтра' }),
    price: 'от 30€',
    cta: makeLangStr({ ee: 'Tellida', ru: 'Заказать' }),
    sortOrder: 2
  },
  {
    icon: 'bolt',
    title: makeLangStr({ ee: 'Kiirpuhastus (24h)', ru: 'Срочная очистка (24ч)' }),
    price: 'от 200€',
    cta: makeLangStr({ ee: 'Tellida', ru: 'Заказать' }),
    sortOrder: 3
  }
]);

await db.insert(certificates).values([
  {
    title: makeLangStr({ ee: 'ISO 9001', ru: 'ISO 9001' }),
    text: makeLangStr({ ee: 'Kvaliteedisertifikaat', ru: 'Сертификат качества' }),
    sortOrder: 1
  },
  {
    title: makeLangStr({ ee: 'Garantii 12 kuud', ru: 'Гарантия 12 мес.' }),
    text: makeLangStr({ ee: 'Kõikidele töödele', ru: 'На все виды работ' }),
    sortOrder: 2
  },
  {
    title: makeLangStr({ ee: 'Tootja partner', ru: 'Партнёр производителя' }),
    text: makeLangStr({ ee: 'Volitatud teenindus', ru: 'Авторизованный сервис' }),
    sortOrder: 3
  },
  {
    title: makeLangStr({ ee: 'Iga filtri kohta raport', ru: 'Отчёт по каждому фильтру' }),
    text: makeLangStr({ ee: 'Läbilaskvuse testiga', ru: 'С тестом пропускной способности' }),
    sortOrder: 4
  }
]);

await db.insert(contacts).values({
  phone: '+372 5850 7200',
  phoneHref: 'tel:+37258507200',
  whatsapp: 'https://wa.me/37258507200',
  email: 'info@dpflab.ee',
  address: 'Tallinn, Estonia',
  weekdaysOpen: '09:00',
  weekdaysClose: '18:00',
  saturdayOpen: '10:00',
  saturdayClose: '15:00'
});

console.log('✓ Database seeded');
client.close();

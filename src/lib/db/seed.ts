import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { faq, reviews, pricing, certificates, contacts } from './schema';

const client = createClient({ url: process.env.DATABASE_URL ?? 'file:./data/dpflab.db' });
const db = drizzle(client, { schema });

// Clear existing content so the script is idempotent
await db.delete(faq);
await db.delete(reviews);
await db.delete(pricing);
await db.delete(certificates);
await db.delete(contacts);

await db.insert(faq).values([
  { locale: 'ru', question: 'Сколько времени занимает очистка DPF?', answer: 'Стандартная очистка — 24 часа. При срочном заказе мы можем выполнить работу быстрее за дополнительную плату.', sortOrder: 1 },
  { locale: 'ru', question: 'Подходит ли услуга для всех марок авто?', answer: 'Да, мы работаем со всеми типами DPF и FAP фильтров — как для легковых, так и для грузовых автомобилей.', sortOrder: 2 },
  { locale: 'ru', question: 'Что входит в стоимость?', answer: 'Диагностика, глубокая гидродинамическая очистка, тест пропускной способности и отчёт о выполненных работах.', sortOrder: 3 },
  { locale: 'ru', question: 'Даёте ли гарантию?', answer: 'Да, мы предоставляем гарантию на результат очистки. Восстанавливаем пропускную способность до 98%.', sortOrder: 4 },
  { locale: 'ru', question: 'Возможен ли забор и доставка фильтра?', answer: 'Да, у нас работает курьерская служба по всей Эстонии. Стоимость зависит от региона.', sortOrder: 5 },

  { locale: 'ee', question: 'Kui kaua võtab DPF puhastus aega?', answer: 'Standardne puhastus — 24 tundi. Kiirtellimuse korral teostame töö kiiremini lisatasu eest.', sortOrder: 1 },
  { locale: 'ee', question: 'Kas teenus sobib kõikidele automarkidele?', answer: 'Jah, töötame kõikide DPF ja FAP filtritega — nii sõidu- kui ka veoautodele.', sortOrder: 2 },
  { locale: 'ee', question: 'Mis on hinna sees?', answer: 'Diagnostika, sügav hüdrodünaamiline puhastus, läbilaskvuse test ja teostatud tööde raport.', sortOrder: 3 },
  { locale: 'ee', question: 'Kas annate garantii?', answer: 'Jah, anname garantii puhastuse tulemusele. Taastame läbilaskvuse kuni 98%.', sortOrder: 4 },
  { locale: 'ee', question: 'Kas on võimalik filtri kohaletoomine?', answer: 'Jah, meil töötab kullerteenus üle kogu Eesti. Hind sõltub piirkonnast.', sortOrder: 5 }
]);

await db.insert(reviews).values([
  { locale: 'ru', stars: 5, text: 'Быстро, качественно и по адекватной цене. Фильтр как новый, машина поехала совсем иначе!', author: '— Алексей, Tallinn', sortOrder: 1 },
  { locale: 'ru', stars: 5, text: 'Сотрудничаем с DPFLAB на постоянной основе. Всегда быстро забирают и возвращают фильтры.', author: '— AutoPro OÜ', sortOrder: 2 },
  { locale: 'ru', stars: 5, text: 'Отличный сервис! Забрали, почистили и привезли обратно. Рекомендую!', author: '— Игорь, Tartu', sortOrder: 3 },

  { locale: 'ee', stars: 5, text: 'Kiire, kvaliteetne ja taskukohase hinnaga. Filter nagu uus, auto sõidab täiesti teisiti!', author: '— Aleksei, Tallinn', sortOrder: 1 },
  { locale: 'ee', stars: 5, text: 'Teeme DPFLABiga pidevalt koostööd. Alati kiire teenindus ja tagastus.', author: '— AutoPro OÜ', sortOrder: 2 },
  { locale: 'ee', stars: 5, text: 'Suurepärane teenus! Tulid kohale, puhastasid ja tõid tagasi. Soovitan!', author: '— Igor, Tartu', sortOrder: 3 }
]);

await db.insert(pricing).values([
  { locale: 'ru', icon: 'filter', title: 'Очистка DPF фильтра', price: 'от 150€', cta: 'Заказать', sortOrder: 1 },
  { locale: 'ru', icon: 'scope', title: 'Диагностика фильтра', price: 'от 30€', cta: 'Заказать', sortOrder: 2 },
  { locale: 'ru', icon: 'bolt', title: 'Срочная очистка (24ч)', price: 'от 200€', cta: 'Заказать', sortOrder: 3 },

  { locale: 'ee', icon: 'filter', title: 'DPF filtri puhastus', price: 'alates 150€', cta: 'Tellida', sortOrder: 1 },
  { locale: 'ee', icon: 'scope', title: 'Filtri diagnostika', price: 'alates 30€', cta: 'Tellida', sortOrder: 2 },
  { locale: 'ee', icon: 'bolt', title: 'Kiirpuhastus (24h)', price: 'alates 200€', cta: 'Tellida', sortOrder: 3 }
]);

await db.insert(certificates).values([
  { locale: 'ru', title: 'ISO 9001', text: 'Сертификат качества', sortOrder: 1 },
  { locale: 'ru', title: 'Гарантия 12 мес.', text: 'На все виды работ', sortOrder: 2 },
  { locale: 'ru', title: 'Партнёр производителя', text: 'Авторизованный сервис', sortOrder: 3 },
  { locale: 'ru', title: 'Отчёт по каждому фильтру', text: 'С тестом пропускной способности', sortOrder: 4 },

  { locale: 'ee', title: 'ISO 9001', text: 'Kvaliteedisertifikaat', sortOrder: 1 },
  { locale: 'ee', title: 'Garantii 12 kuud', text: 'Kõikidele töödele', sortOrder: 2 },
  { locale: 'ee', title: 'Tootja partner', text: 'Volitatud teenindus', sortOrder: 3 },
  { locale: 'ee', title: 'Iga filtri kohta raport', text: 'Läbilaskvuse testiga', sortOrder: 4 }
]);

await db.insert(contacts).values([
  {
    locale: 'ru',
    phone: '+372 5850 7200',
    phoneHref: 'tel:+37258507200',
    whatsapp: 'https://wa.me/37258507200',
    email: 'info@dpflab.ee',
    address: 'Tallinn, Estonia',
    hoursWeek: 'Пн – Пт: 9:00 – 18:00',
    hoursSat: 'Сб: 10:00 – 15:00'
  },
  {
    locale: 'ee',
    phone: '+372 5850 7200',
    phoneHref: 'tel:+37258507200',
    whatsapp: 'https://wa.me/37258507200',
    email: 'info@dpflab.ee',
    address: 'Tallinn, Eesti',
    hoursWeek: 'E – R: 9:00 – 18:00',
    hoursSat: 'L: 10:00 – 15:00'
  }
]);

console.log('✓ Database seeded');
client.close();

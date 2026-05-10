import type { ContentBundle, Locale } from './types';

const ru: ContentBundle = {
  locale: 'ru',
  nav: { home: 'Главная', services: 'Услуги', process: 'Как мы работаем', benefits: 'Преимущества', pricing: 'Цены', about: 'О нас', contacts: 'Контакты', cta: 'Написать в WhatsApp' },
  brand: { name: 'DPFLAB', tagline: 'ОЧИСТКА DPF ФИЛЬТРОВ' },
  contacts: { phone: '+372 5850 7200', phoneHref: 'tel:+37258507200', whatsapp: 'https://wa.me/37258507200', email: 'info@dpflab.ee', address: 'Tallinn, Estonia', hoursWeek: 'Пн – Пт: 9:00 – 18:00', hoursSat: 'Сб:        10:00 – 15:00' },
  hero: {
    title: ['ПРОФЕССИОНАЛЬНАЯ', 'ОЧИСТКА', 'DPF', 'ФИЛЬТРОВ', 'В ЭСТОНИИ'],
    titlePlain: 'Профессиональная очистка DPF фильтров в Эстонии',
    subtitle: 'Вернём мощность двигателя и сэкономим до 80% от стоимости нового фильтра',
    ctaPrimary: 'Получить цену',
    ctaSecondary: 'Написать в WhatsApp',
    badges: [
      { icon: 'clock', title: 'Чистка за 24 часа', text: 'Оперативно и качественно' },
      { icon: 'shield', title: 'Гарантия результата', text: 'До 98% пропускной способности' },
      { icon: 'truck', title: 'Забор и доставка', text: 'По всей Эстонии' }
    ],
    imageAlt: 'DPF фильтр крупным планом'
  },
  why: {
    title: 'ПОЧЕМУ ЭТО ВАЖНО?',
    lead: 'Засорённый DPF фильтр приводит к:',
    points: ['потере мощности двигателя', 'увеличению расхода топлива', 'аварийному режиму двигателя', 'дорогому ремонту или замене фильтра'],
    footer: 'Мы полностью очищаем фильтр, восстанавливая его пропускную способность до 98%',
    imageAlt: 'Сравнение до/после'
  },
  process: {
    title: 'КАК МЫ', titleAccent: 'РАБОТАЕМ?',
    steps: [
      { icon: 'phone', text: 'Вы оставляете заявку' },
      { icon: 'truck', text: 'Мы забираем фильтр или вы привозите сами' },
      { icon: 'search', text: 'Проводим диагностику' },
      { icon: 'drop', text: 'Выполняем глубокую очистку' },
      { icon: 'report', text: 'Возвращаем фильтр с отчётом' }
    ]
  },
  pricing: {
    title: 'СТОИМОСТЬ', titleAccent: 'УСЛУГ',
    items: [
      { icon: 'filter', title: 'Очистка DPF фильтра', price: 'от 150€', cta: 'Заказать' },
      { icon: 'scope', title: 'Диагностика фильтра', price: 'от 30€', cta: 'Заказать' },
      { icon: 'bolt', title: 'Срочная очистка (24ч)', price: 'от 200€', cta: 'Заказать' }
    ],
    footer: 'Точная стоимость зависит от типа и состояния фильтра.'
  },
  benefits: {
    title: 'ПРЕИМУЩЕСТВА', titleAccent: 'DPFLAB',
    items: [
      { icon: 'machine', text: 'Современное оборудование' },
      { icon: 'drop', text: 'Глубокая гидродинамическая очистка' },
      { icon: 'car', text: 'Подходит для легковых и грузовых авто' },
      { icon: 'handshake', text: 'Работаем с автосервисами (B2B)' },
      { icon: 'shield', text: 'Гарантия на все виды работ' }
    ]
  },
  gallery: {
    title: 'ДО / ПОСЛЕ ОЧИСТКИ',
    pairs: [
      { before: 'DPF до #1', after: 'DPF после #1' },
      { before: 'DPF до #2', after: 'DPF после #2' },
      { before: 'DPF до #3', after: 'DPF после #3' },
      { before: 'DPF до #4', after: 'DPF после #4' },
      { before: 'DPF до #5', after: 'DPF после #5' }
    ],
    labelBefore: 'ДО', labelAfter: 'ПОСЛЕ'
  },
  reviews: {
    title: 'ОТЗЫВЫ КЛИЕНТОВ',
    items: [
      { stars: 5, text: 'Быстро, качественно и по адекватной цене. Фильтр как новый, машина поехала совсем иначе!', author: '— Алексей, Tallinn' },
      { stars: 5, text: 'Сотрудничаем с DPFLAB на постоянной основе. Всегда быстро забирают и возвращают фильтры.', author: '— AutoPro OÜ' },
      { stars: 5, text: 'Отличный сервис! Забрали, почистили и привезли обратно. Рекомендую!', author: '— Игорь, Tartu' }
    ]
  },
  faq: {
    title: 'ЧАСТЫЕ', titleAccent: 'ВОПРОСЫ',
    items: [
      { q: 'Сколько времени занимает очистка DPF?', a: 'Стандартная очистка — 24 часа. При срочном заказе мы можем выполнить работу быстрее за дополнительную плату.' },
      { q: 'Подходит ли услуга для всех марок авто?', a: 'Да, мы работаем со всеми типами DPF и FAP фильтров — как для легковых, так и для грузовых автомобилей.' },
      { q: 'Что входит в стоимость?', a: 'Диагностика, глубокая гидродинамическая очистка, тест пропускной способности и отчёт о выполненных работах.' },
      { q: 'Даёте ли гарантию?', a: 'Да, мы предоставляем гарантию на результат очистки. Восстанавливаем пропускную способность до 98%.' },
      { q: 'Возможен ли забор и доставка фильтра?', a: 'Да, у нас работает курьерская служба по всей Эстонии. Стоимость зависит от региона.' }
    ]
  },
  certificates: {
    title: 'СЕРТИФИКАТЫ', titleAccent: 'И ГАРАНТИИ',
    items: [
      { title: 'ISO 9001', text: 'Сертификат качества' },
      { title: 'Гарантия 12 мес.', text: 'На все виды работ' },
      { title: 'Партнёр производителя', text: 'Авторизованный сервис' },
      { title: 'Отчёт по каждому фильтру', text: 'С тестом пропускной способности' }
    ]
  },
  contact: {
    title: 'ОСТАВЬТЕ ЗАЯВКУ',
    subtitle: 'Мы свяжемся с вами в течение 10 минут',
    contactsTitle: 'КОНТАКТЫ',
    fields: { name: 'Ваше имя', phone: 'Телефон', comment: 'Комментарий (необязательно)', submit: 'Отправить заявку' },
    success: 'Спасибо! Мы свяжемся с вами в ближайшее время.',
    validation: { name: 'Введите имя', phone: 'Введите корректный телефон' }
  },
  footer: {
    copy: '© 2026 DPFLAB OÜ',
    rights: 'Все права защищены.',
    links: [{ label: 'Политика конфиденциальности', href: '#' }, { label: 'Условия использования', href: '#' }]
  }
};

const ee: ContentBundle = {
  locale: 'ee',
  nav: { home: 'Avaleht', services: 'Teenused', process: 'Kuidas töötame', benefits: 'Eelised', pricing: 'Hinnad', about: 'Meist', contacts: 'Kontaktid', cta: 'Kirjuta WhatsAppi' },
  brand: { name: 'DPFLAB', tagline: 'DPF FILTRITE PUHASTUS' },
  contacts: { phone: '+372 5850 7200', phoneHref: 'tel:+37258507200', whatsapp: 'https://wa.me/37258507200', email: 'info@dpflab.ee', address: 'Tallinn, Eesti', hoursWeek: 'E – R: 9:00 – 18:00', hoursSat: 'L:    10:00 – 15:00' },
  hero: {
    title: ['PROFESSIONAALNE', 'DPF', 'FILTRITE', 'PUHASTUS', 'EESTIS'],
    titlePlain: 'Professionaalne DPF filtrite puhastus Eestis',
    subtitle: 'Taastame mootori võimsuse ja säästame kuni 80% uue filtri hinnast',
    ctaPrimary: 'Küsi hinda',
    ctaSecondary: 'Kirjuta WhatsAppi',
    badges: [
      { icon: 'clock', title: 'Puhastus 24 tunniga', text: 'Kiire ja kvaliteetne' },
      { icon: 'shield', title: 'Tulemuse garantii', text: 'Kuni 98% läbilaskvus' },
      { icon: 'truck', title: 'Kullerteenus', text: 'Üle kogu Eesti' }
    ],
    imageAlt: 'DPF filter lähivaates'
  },
  why: {
    title: 'MIKS SEE ON OLULINE?',
    lead: 'Ummistunud DPF filter põhjustab:',
    points: ['mootori võimsuse kadu', 'kütusekulu suurenemist', 'mootori avariirežiimi', 'kallist remonti või filtri vahetust'],
    footer: 'Me puhastame filtri täielikult ja taastame selle läbilaskvuse kuni 98%',
    imageAlt: 'Enne / pärast võrdlus'
  },
  process: {
    title: 'KUIDAS ME', titleAccent: 'TÖÖTAME?',
    steps: [
      { icon: 'phone', text: 'Esitate päringu' },
      { icon: 'truck', text: 'Toome filtri ära või toote ise kohale' },
      { icon: 'search', text: 'Teostame diagnostika' },
      { icon: 'drop', text: 'Teostame sügavpuhastuse' },
      { icon: 'report', text: 'Tagastame filtri koos raportiga' }
    ]
  },
  pricing: {
    title: 'TEENUSTE', titleAccent: 'HINNAD',
    items: [
      { icon: 'filter', title: 'DPF filtri puhastus', price: 'alates 150€', cta: 'Tellida' },
      { icon: 'scope', title: 'Filtri diagnostika', price: 'alates 30€', cta: 'Tellida' },
      { icon: 'bolt', title: 'Kiirpuhastus (24h)', price: 'alates 200€', cta: 'Tellida' }
    ],
    footer: 'Täpne hind sõltub filtri tüübist ja seisukorrast.'
  },
  benefits: {
    title: 'DPFLAB', titleAccent: 'EELISED',
    items: [
      { icon: 'machine', text: 'Kaasaegsed seadmed' },
      { icon: 'drop', text: 'Sügav hüdrodünaamiline puhastus' },
      { icon: 'car', text: 'Sobib sõidu- ja veoautodele' },
      { icon: 'handshake', text: 'Töötame autoteenindustega (B2B)' },
      { icon: 'shield', text: 'Garantii kõigile töödele' }
    ]
  },
  gallery: {
    title: 'ENNE / PÄRAST PUHASTUST',
    pairs: [
      { before: 'DPF enne #1', after: 'DPF pärast #1' },
      { before: 'DPF enne #2', after: 'DPF pärast #2' },
      { before: 'DPF enne #3', after: 'DPF pärast #3' },
      { before: 'DPF enne #4', after: 'DPF pärast #4' },
      { before: 'DPF enne #5', after: 'DPF pärast #5' }
    ],
    labelBefore: 'ENNE', labelAfter: 'PÄRAST'
  },
  reviews: {
    title: 'KLIENTIDE TAGASISIDE',
    items: [
      { stars: 5, text: 'Kiire, kvaliteetne ja taskukohase hinnaga. Filter nagu uus, auto sõidab täiesti teisiti!', author: '— Aleksei, Tallinn' },
      { stars: 5, text: 'Teeme DPFLABiga pidevalt koostööd. Alati kiire teenindus ja tagastus.', author: '— AutoPro OÜ' },
      { stars: 5, text: 'Suurepärane teenus! Tulid kohale, puhastasid ja tõid tagasi. Soovitan!', author: '— Igor, Tartu' }
    ]
  },
  faq: {
    title: 'KORDUMA', titleAccent: 'KIPPUVAD KÜSIMUSED',
    items: [
      { q: 'Kui kaua võtab DPF puhastus aega?', a: 'Standardne puhastus — 24 tundi. Kiirtellimuse korral teostame töö kiiremini lisatasu eest.' },
      { q: 'Kas teenus sobib kõikidele automarkidele?', a: 'Jah, töötame kõikide DPF ja FAP filtritega — nii sõidu- kui ka veoautodele.' },
      { q: 'Mis on hinna sees?', a: 'Diagnostika, sügav hüdrodünaamiline puhastus, läbilaskvuse test ja teostatud tööde raport.' },
      { q: 'Kas annate garantii?', a: 'Jah, anname garantii puhastuse tulemusele. Taastame läbilaskvuse kuni 98%.' },
      { q: 'Kas on võimalik filtri kohaletoomine?', a: 'Jah, meil töötab kullerteenus üle kogu Eesti. Hind sõltub piirkonnast.' }
    ]
  },
  certificates: {
    title: 'SERTIFIKAADID', titleAccent: 'JA GARANTIID',
    items: [
      { title: 'ISO 9001', text: 'Kvaliteedisertifikaat' },
      { title: 'Garantii 12 kuud', text: 'Kõikidele töödele' },
      { title: 'Tootja partner', text: 'Volitatud teenindus' },
      { title: 'Iga filtri kohta raport', text: 'Läbilaskvuse testiga' }
    ]
  },
  contact: {
    title: 'ESITA PÄRING',
    subtitle: 'Võtame teiega ühendust 10 minuti jooksul',
    contactsTitle: 'KONTAKTID',
    fields: { name: 'Teie nimi', phone: 'Telefon', comment: 'Kommentaar (valikuline)', submit: 'Saada päring' },
    success: 'Aitäh! Võtame teiega peagi ühendust.',
    validation: { name: 'Sisestage nimi', phone: 'Sisestage korrektne telefon' }
  },
  footer: {
    copy: '© 2026 DPFLAB OÜ',
    rights: 'Kõik õigused kaitstud.',
    links: [{ label: 'Privaatsuspoliitika', href: '#' }, { label: 'Kasutustingimused', href: '#' }]
  }
};

export const CONTENT: Record<Locale, ContentBundle> = { ru, ee };

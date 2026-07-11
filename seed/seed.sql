-- Seed content for Cloudflare D1.
-- Apply with: npm run db:seed:local  (or :remote for production — FIRST FILL ONLY).
-- Bilingual fields are stored as JSON strings: {"et":"…","ru":"…"} (see langstr.ts).

DELETE FROM faq;
DELETE FROM pricing;
DELETE FROM contacts;

INSERT INTO faq (question, answer, sort_order) VALUES
('{"et":"Kui kaua kestab puhastus?","ru":"Сколько длится чистка?"}',
 '{"et":"Tsükkel kestab keskmiselt 1–2,5 tundi sõltuvalt filtri tüübist ja seisukorrast.","ru":"Цикл в среднем 1–2,5 часа в зависимости от типа и состояния фильтра."}',
 1),
('{"et":"Kas pakute DPF-filtri äraveo ja tagasitoomise teenust?","ru":"Предоставляете ли вы услугу вывоза и обратной доставки DPF-фильтра?"}',
 '{"et":"Jah, pakume DPF-filtri äraveo ja tagasitoomise teenust. Enamasti toome filtri ära ja tagastame selle samal päeval. Teenuse maksimaalne täitmisaeg alates äraveost kuni tagasitoomiseni on 24 tundi.","ru":"Да, мы предоставляем услугу вывоза и обратной доставки DPF-фильтра. В большинстве случаев мы забираем фильтр и возвращаем его обратно в тот же день. Максимальный срок выполнения услуги с момента вывоза до обратной доставки составляет 24 часа."}',
 2),
('{"et":"Kas teenus sobib kõikidele automarkidele?","ru":"Подходит ли услуга для всех марок авто?"}',
 '{"et":"Jah, töötame kõikide DPF ja FAP filtritega — nii sõidu- kui ka veoautodele.","ru":"Да, мы работаем со всеми типами DPF и FAP фильтров — как для легковых, так и для грузовых автомобилей."}',
 3),
('{"et":"Mis on hinna sees?","ru":"Что входит в стоимость?"}',
 '{"et":"Diagnostika, sügav hüdrodünaamiline puhastus, läbilaskvuse test ja teostatud tööde raport.","ru":"Диагностика, глубокая гидродинамическая очистка, тест пропускной способности и отчёт о выполненных работах."}',
 4),
('{"et":"Kas annate garantii?","ru":"Даёте ли гарантию?"}',
 '{"et":"Jah, anname garantii puhastuse tulemusele. Taastame läbilaskvuse kuni 98%.","ru":"Да, мы предоставляем гарантию на результат очистки. Восстанавливаем пропускную способность до 98%."}',
 5);

INSERT INTO pricing (icon, title, price, cta, sort_order) VALUES
('filter', '{"et":"DPF filtri puhastus","ru":"Очистка DPF фильтра"}', '100€', '{"et":"Tellida","ru":"Заказать"}', 1),
('truck', '{"et":"Veoauto DPF puhastus","ru":"Очистка DPF грузового авто"}', '200€', '{"et":"Tellida","ru":"Заказать"}', 2);

INSERT INTO contacts (phone, phone_href, whatsapp, email, address, weekdays_open, weekdays_close, saturday_open, saturday_close) VALUES
('+372 5555 5014', 'tel:+37255555014', 'https://wa.me/37255555014', 'info@dpflab.ee', 'Saha-Loo tee 36, Iru, 74206', '09:00', '18:00', '10:00', '15:00');

INSERT OR IGNORE INTO site_images (key, filename) VALUES
('hero_main', NULL),
('why_main', NULL),
('contact_workshop', NULL);

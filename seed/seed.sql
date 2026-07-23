-- Seed content for Cloudflare D1.
-- Apply with: npm run db:seed:local  (or :remote for production — FIRST FILL ONLY).
-- Bilingual fields are stored as JSON strings: {"et":"…","ru":"…"} (see langstr.ts).

DELETE FROM faq;
DELETE FROM pricing;
DELETE FROM contacts;

INSERT INTO faq (question, answer, sort_order) VALUES
('{"et":"Kui kaua kestab puhastus?","ru":"Сколько длится чистка?","en":"How long does the cleaning take?"}',
 '{"et":"Tsükkel kestab keskmiselt 1–2,5 tundi sõltuvalt filtri tüübist ja seisukorrast.","ru":"Цикл в среднем 1–2,5 часа в зависимости от типа и состояния фильтра.","en":"A cleaning cycle usually takes 1–2.5 hours depending on the filter type and condition."}',
 1),
('{"et":"Kas pakute DPF-filtri äraveo ja tagasitoomise teenust?","ru":"Предоставляете ли вы услугу вывоза и обратной доставки DPF-фильтра?","en":"Do you collect and return DPF filters?"}',
 '{"et":"Jah, pakume DPF-filtri äraveo ja tagasitoomise teenust. Enamasti toome filtri ära ja tagastame selle samal päeval. Teenuse maksimaalne täitmisaeg alates äraveost kuni tagasitoomiseni on 24 tundi.","ru":"Да, мы предоставляем услугу вывоза и обратной доставки DPF-фильтра. В большинстве случаев мы забираем фильтр и возвращаем его обратно в тот же день. Максимальный срок выполнения услуги с момента вывоза до обратной доставки составляет 24 часа.","en":"Yes. We can collect and return a DPF filter, usually on the same day. The maximum turnaround from collection to return is 24 hours."}',
 2),
('{"et":"Kas teenus sobib kõikidele automarkidele?","ru":"Подходит ли услуга для всех марок авто?","en":"Does the service work for all vehicle makes?"}',
 '{"et":"Jah, töötame kõikide DPF ja FAP filtritega — nii sõidu- kui ka veoautodele.","ru":"Да, мы работаем со всеми типами DPF и FAP фильтров — как для легковых, так и для грузовых автомобилей.","en":"Yes. We work with DPF and FAP filters for passenger cars and commercial vehicles."}',
 3),
('{"et":"Mis on hinna sees?","ru":"Что входит в стоимость?","en":"What is included in the price?"}',
 '{"et":"Diagnostika, sügav hüdrodünaamiline puhastus, läbilaskvuse test ja teostatud tööde raport.","ru":"Диагностика, глубокая гидродинамическая очистка, тест пропускной способности и отчёт о выполненных работах.","en":"Diagnostics, deep hydrodynamic cleaning, a flow test and a completed-service report."}',
 4),
('{"et":"Kas annate garantii?","ru":"Даёте ли гарантию?","en":"Do you provide a guarantee?"}',
 '{"et":"Jah, anname garantii puhastuse tulemusele. Taastame läbilaskvuse kuni 98%.","ru":"Да, мы предоставляем гарантию на результат очистки. Восстанавливаем пропускную способность до 98%.","en":"Yes. We guarantee the cleaning result and can restore up to 98% of the filter flow."}',
 5);

INSERT INTO pricing (icon, title, price, cta, sort_order) VALUES
('filter', '{"et":"DPF filtri puhastus","ru":"Очистка DPF фильтра","en":"DPF filter cleaning"}', '100€', '{"et":"Tellida","ru":"Заказать","en":"Request service"}', 1),
('truck', '{"et":"Veoauto DPF puhastus","ru":"Очистка DPF грузового авто","en":"Commercial vehicle DPF cleaning"}', '200€', '{"et":"Tellida","ru":"Заказать","en":"Request service"}', 2);

INSERT INTO contacts (phone, phone_href, whatsapp, email, address, weekdays_open, weekdays_close, saturday_open, saturday_close) VALUES
('+372 5555 5014', 'tel:+37255555014', 'https://wa.me/37255555014', 'info@dpflab.ee', 'Saha-Loo tee 36, Iru, 74206', '09:00', '18:00', '10:00', '15:00');

INSERT OR IGNORE INTO site_images (key, filename) VALUES
('hero_main', NULL),
('why_main', NULL),
('contact_workshop', NULL);

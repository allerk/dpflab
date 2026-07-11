# План миграции DPFLAB на Cloudflare (Workers + D1 + R2)

> Статус: **черновик плана, код ещё не трогаем.** Документ описывает, что и в каком порядке менять.
> Целевой стек: SvelteKit + `@sveltejs/adapter-cloudflare` (Workers) · Cloudflare **D1** (БД вместо файлового SQLite) · Cloudflare **R2** (картинки вместо `data/images/`).

---

## 1. Зачем и что меняется по сути

Сейчас приложение — это **долгоживущий Node-процесс**: `@sveltejs/adapter-node`, файловый SQLite (`data/dpflab.db`) с автомиграциями на старте, загрузка картинок на диск (`data/images/`), чтение whitelist с диска. Cloudflare Workers — это **serverless-рантайм без файловой системы и без постоянного процесса**. Поэтому переезд — не «передеплой», а замена трёх подсистем:

| Подсистема | Сейчас | Станет |
|------------|--------|--------|
| Рантайм/адаптер | `adapter-node`, `node build/index.js` | `adapter-cloudflare`, Worker |
| База данных | `@libsql/client` (`file:`), `drizzle-orm/libsql`, `migrate()` на старте | Cloudflare **D1**, `drizzle-orm/d1`, миграции через `wrangler` |
| Хранение картинок | `data/images/` на диске (`fs`) | Cloudflare **R2** (object storage) |
| Whitelist админов | файл `config/admin-whitelist.txt` (`fs`) | env-переменная (или D1/KV) |
| Секреты/конфиг | `.env` через `$env/dynamic/private` | `wrangler secret` + vars (`platform.env`) |

Хорошая новость: **все репозитории БД уже принимают `db` параметром** (`getFaqItems(db, …)` и т.д.), поэтому переписывать запросы не нужно — меняется только то, *откуда берётся* `db` и его тип.

---

## 2. Карта несовместимостей (что конкретно ломается)

Найдено в коде:

1. **`src/lib/db/index.ts`** — создаёт `db` синглтоном на загрузке модуля и вызывает `migrate()`. На Workers так нельзя: БД доступна только per-request через `platform.env.DB`, а рантайм-миграции D1 не поддерживает.
2. **`src/lib/db/types.ts`** — `Db = LibSQLDatabase<schema>` → станет `DrizzleD1Database<schema>`.
3. **`src/routes/+page.server.ts`** и все **`src/routes/admin/(protected)/**/+page.server.ts`** — импортируют `db` напрямую (`import { db } from '$lib/db'`). Нужно получать `db` из `event.platform.env.DB`.
4. **`src/routes/images/[file]/+server.ts`** — `readFile` с диска → `platform.env.BUCKET.get(key)` (R2).
5. **`src/routes/admin/(protected)/images/+page.server.ts`** — `writeFile`/`mkdir`/`unlink` → R2 `put`/`delete`.
6. **`src/lib/server/admin/images.ts`** — `readdir` (листинг) → R2 `list`.
7. **`src/lib/server/admin/whitelist.ts`** — `fs.statSync`/`readFileSync` → чтение из env.
8. **`src/lib/server/admin/session.ts`** — `node:crypto` (`createHmac`, `timingSafeEqual`, `Buffer`). Работает на Workers **с флагом `nodejs_compat`**; переписывать на Web Crypto не обязательно (но это запасной вариант).
9. **`src/lib/db/seed.ts`** — использует libsql-клиент. Для D1 сидинг идёт через `wrangler d1 execute` или одноразовый скрипт.
10. **`drizzle.config.ts`** — `dbCredentials.url` (файл) → конфиг под D1 (`driver: 'd1-http'` для studio/push; генерация миграций остаётся `dialect: 'sqlite'`).
11. **Тесты** (`tests/helpers/db.ts`, `createTestDb` на libsql in-memory) — при смене типа `Db` на D1 ломается типизация. Нужно перевести тестовую БД на Miniflare D1 либо обобщить тип `Db`.
12. **`.nvmrc`, systemd, nginx, `skill ci`** — больше не нужны для прод-рантайма (остаются только для справки/локалки).

---

## 3. Целевая архитектура

- **Worker** обслуживает SSR + все серверные роуты SvelteKit.
- **D1** (`binding: DB`) — весь контент и заявки. Существующие SQL-миграции в `drizzle/` совместимы с D1 (тот же SQLite-диалект), применяются командой `wrangler d1 migrations apply`.
- **R2** (`binding: BUCKET`) — загруженные картинки. URL остаётся прежним (`/images/<file>`), но раздаёт их Worker из R2 (сохраняем контроль доступа и кеш-заголовки).
- **Конфиг `wrangler.jsonc`** с биндингами D1 + R2, `compatibility_flags: ["nodejs_compat"]`, секретами.
- **Доступ к биндингам** — через `event.platform.env` в `+page.server.ts`, `+server.ts`, `hooks.server.ts`. Объявляется в `src/app.d.ts` (`App.Platform`).
- **Локальная разработка** — `wrangler dev` / vite с `platformProxy` (Miniflare эмулирует D1 и R2 локально).

---

## 4. Поэтапный план

### Фаза 0 — подготовка (без изменений в коде приложения)
- [ ] Создать аккаунт Cloudflare, установить/обновить `wrangler` (v4).
- [ ] Создать **D1**: `wrangler d1 create dpflab` → получить `database_id`.
- [ ] Создать **R2**: `wrangler r2 bucket create dpflab-images`.
- [ ] Добавить `wrangler.jsonc` с биндингами `DB`, `BUCKET`, `compatibility_flags: ["nodejs_compat"]`, `compatibility_date`.
- [ ] Ветка `feat/cloudflare-migration` от `main`.

### Фаза 1 — адаптер и платформенные типы
- [ ] `npm i -D @sveltejs/adapter-cloudflare` (убрать `adapter-node`).
- [ ] `svelte.config.js` → `adapter-cloudflare` с `platformProxy`.
- [ ] `src/app.d.ts` → описать `App.Platform.env` (`DB: D1Database`, `BUCKET: R2Bucket`, секреты).
- [ ] `npm i -D @cloudflare/workers-types`, подключить в `tsconfig`.
- [ ] Контрольная точка: `npm run build` проходит (адаптер собирается).

### Фаза 2 — база данных на D1
- [ ] `src/lib/db/types.ts`: `Db = DrizzleD1Database<schema>`.
- [ ] Новый хелпер `getDb(platform)` → `drizzle(platform.env.DB, { schema })`. Убрать синглтон и `migrate()` из `src/lib/db/index.ts`.
- [ ] Прокинуть `db` из `event.platform` во всех серверных роутах (`+page.server.ts`, admin actions, form actions). Репозитории не трогаем — сигнатуры те же.
- [ ] `drizzle.config.ts`: вариант под D1 (`driver: 'd1-http'` + `CLOUDFLARE_*` env для studio/push; генерация миграций — прежняя).
- [ ] Миграции: `wrangler d1 migrations apply dpflab --local` (локально) и `--remote` (прод). Проверить, что формат каталога `drizzle/` совпадает с тем, что ждёт wrangler (возможно, нужен `migrations_dir`).
- [ ] Сидинг: перегнать `seed.ts` в `seed/seed.sql` (или одноразовый скрипт через wrangler), применить `wrangler d1 execute dpflab --file=seed/seed.sql`. **Только при первом наполнении.**

### Фаза 3 — картинки на R2
- [ ] `src/routes/images/[file]/+server.ts`: `platform.env.BUCKET.get(filename)`, отдать тело + `Content-Type` + кеш-заголовки; 404 если нет. Сохранить защиту от path traversal.
- [ ] `src/routes/admin/(protected)/images/+page.server.ts`: upload → `BUCKET.put(filename, bytes)`, delete → `BUCKET.delete(filename)`. Сохранить проверку расширений и коллизий имён.
- [ ] `src/lib/server/admin/images.ts`: `listImages()` → `BUCKET.list()`.
- [ ] Перенести существующие картинки из `data/images/` в R2 (`wrangler r2 object put` или скрипт).

### Фаза 4 — auth/whitelist/секреты
- [ ] `src/lib/server/admin/whitelist.ts`: читать из `platform.env.ADMIN_WHITELIST` (CSV) вместо файла. Кеш по mtime убрать.
- [ ] Секреты: `wrangler secret put ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ADMIN_WHITELIST`. Убедиться, что `$env/dynamic/private` корректно резолвится в `platform.env` на adapter-cloudflare (либо читать прямо из `platform.env`).
- [ ] `session.ts`: проверить `node:crypto` под `nodejs_compat`; при проблемах — перевести HMAC на Web Crypto (`crypto.subtle`).

### Фаза 5 — тесты и CI
- [ ] `tests/helpers/db.ts`: тестовая D1 через Miniflare (`@miniflare/d1` / `unstable_dev`) **или** обобщить тип `Db` до `BaseSQLiteDatabase`, чтобы юнит-тесты репозиториев остались на in-memory SQLite.
- [ ] Прогнать `npm test` (47 тестов) — починить типизацию.
- [ ] CI (GitHub Actions): `npm ci` → `check` → `test` → `build`; деплой через `cloudflare/wrangler-action` на push в `main`. Миграции D1 — отдельный шаг `wrangler d1 migrations apply --remote`.

### Фаза 6 — деплой и DNS
- [ ] `wrangler deploy` (или Cloudflare Pages/Workers CI).
- [ ] Привязать домен (см. **Раздел 6** ниже).
- [ ] Прогнать smoke-тест: главная (ru/et), форма заявки (пишет в D1), админка (логин, загрузка картинки в R2, редактирование контента).

---

## 5. Риски и подводные камни

- **`db`-синглтон → per-request.** Самое инвазивное изменение. Нужно аккуратно пробросить `platform` во все серверные обработчики; есть риск пропустить роут.
- **Локалка без Node-БД.** Дев теперь через `wrangler dev`/Miniflare; команды `npm run db:*` меняются на `wrangler d1 …`.
- **Сидинг D1** отличается от `tsx seed.ts` — нужен SQL-путь.
- **`nodejs_compat`** покрывает `node:crypto`/`Buffer`, но не файловую систему — все `fs`-вызовы должны уйти.
- **Лимиты Workers**: CPU-time на запрос, размер бандла; D1 — лимиты на размер БД и число запросов; R2 — оплата за операции. Для лендинга с низким трафиком — в пределах бесплатных лимитов, но стоит держать в уме.
- **Почта `@dpflab.ee`** при переносе nameservers — критично, см. предупреждение в Разделе 6.
- **Откат**: ветка изолирована; `main` (adapter-node) остаётся рабочим до явного переключения DNS. Откат = вернуть NS/деплой на старый таргет.

---

## 6. Перенос DNS домена `dpflab.ee` на Cloudflare — чек-лист для тебя

> Это та часть, которую делаешь **ты руками** в панелях Cloudflare и zone.ee. Cloudflare Workers с кастомным доменом требует, чтобы зона `dpflab.ee` обслуживалась nameservers Cloudflare, поэтому DNS переносим на Cloudflare (домен при этом **остаётся зарегистрирован в zone.ee** — меняются только nameservers).

### ⚠️ Сначала самое важное — не потеряй почту
У тебя на zone.ee есть Webmail/почта `@dpflab.ee` (пакет Starter включает e-mail). При смене nameservers на Cloudflare почта **перестанет работать**, если не перенести её DNS-записи. Поэтому **до** переключения:
- [ ] В панели zone.ee (Webhosting → DNS / Domains → `dpflab.ee` → DNS records) **выпиши все текущие записи**: `MX`, все `TXT` (особенно `SPF` вида `v=spf1 …` и `DKIM`), а также `CNAME` для autoconfig/autodiscover и любые служебные записи почты.
- [ ] Сделай скриншот/экспорт всей зоны на всякий случай.

### Шаги переноса
1. [ ] Зарегистрируй аккаунт на **dash.cloudflare.com**.
2. [ ] **Add a site** → введи `dpflab.ee` → выбери план **Free**.
3. [ ] Cloudflare просканирует текущие записи и предложит их импортировать. **Проверь, что MX и TXT (SPF/DKIM) почты подхватились.** Если каких-то нет — добавь вручную по выписке из шага выше.
4. [ ] Cloudflare покажет **два своих nameserver** (вида `xxx.ns.cloudflare.com`). Запиши их.
5. [ ] В панели **zone.ee** → Domains → `dpflab.ee` → **Nameservers** замени текущие NS на выданные Cloudflare. (На `.ee` смена NS делается у регистратора, т.е. в zone.ee.)
6. [ ] Дождись активации зоны в Cloudflare (от нескольких минут до ~24 ч; обычно быстро). Cloudflare пришлёт письмо «`dpflab.ee` is now active».
7. [ ] В **Cloudflare → SSL/TLS** выстави режим **Full** (или Full strict).
8. [ ] Привяжи Worker к домену: **Workers & Pages → твой Worker → Settings → Domains & Routes → Add Custom Domain** → `dpflab.ee` (и при желании `www.dpflab.ee`). Cloudflare сам создаст нужные DNS-записи и сертификат.
9. [ ] Проверь:
   - [ ] `https://dpflab.ee` открывается и отдаёт приложение;
   - [ ] письмо на `@dpflab.ee` приходит (отправь тестовое) — значит MX уцелели;
   - [ ] `www` ведёт куда нужно.

### Альтернатива (если переносить NS не хочется)
Оставить DNS на zone.ee нельзя для Workers Custom Domains — им нужна зона на Cloudflare. Обходные пути (Cloudflare Pages + CNAME через сторонний DNS) усложняют setup и всё равно упираются в ограничения. **Рекомендация — переносить NS на Cloudflare** по чек-листу выше.

---

## 7. Открытые вопросы (уточнить до старта)
1. **Сидинг прод-данных**: наполняем D1 актуальным контентом сразу из `seed/seed.sql` или ты заводишь контент через админку после деплоя?
2. **Whitelist админов**: устраивает хранение в env-переменной (CSV), или предпочитаешь таблицу в D1 (тогда + мини-CRUD)?
3. **Тесты**: переводим тестовую БД на Miniflare D1 (ближе к проду) или обобщаем тип `Db`, чтобы юнит-тесты остались на лёгком in-memory SQLite (быстрее)?
4. **Текущие картинки**: есть ли уже загруженные на старом хостинге, которые надо перенести в R2, или начинаем с чистого бакета?

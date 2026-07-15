# Email-уведомления администратора о новых заявках — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Отправлять администратору короткое email-уведомление со ссылкой на каждую успешно сохранённую заявку.

**Architecture:** Action получает ID вставленной записи, передаёт задачу в `ExecutionContext.waitUntil`, а изолированный серверный модуль отправляет сообщение через Cloudflare Email Service binding. Получатель ограничен конфигурацией Wrangler для каждого окружения.

**Tech Stack:** SvelteKit, TypeScript, Drizzle + Cloudflare D1, Cloudflare Workers Email Service, Vitest, Wrangler.

## Global Constraints

- Письмо не содержит имя, телефон, email, комментарий, язык или другие персональные данные.
- Тема `prod`: `Новая заявка #<id>`; `develop`: `TEST: Новая заявка #<id>`.
- Получатель задаётся отдельно через `destination_address` в `wrangler.jsonc`.
- Сбой отправки не отменяет сохранённую заявку и не меняет успешный ответ формы.
- `local` не содержит email binding и не отправляет реальные письма.

---

## Структура файлов

- Modify: `src/lib/db/repositories/contact-submissions.ts` — вернуть ID новой заявки.
- Create: `src/lib/server/notifications/contact-submission.ts` — формировать безопасное письмо и обрабатывать сбой отправки.
- Modify: `src/app.d.ts` — описать email binding и переменные окружения.
- Modify: `src/routes/+page.server.ts` — поставить уведомление в `waitUntil`.
- Modify: `wrangler.jsonc` — bindings и переменные в `develop`/ `prod`.
- Modify: `tests/db/contact-submissions.repository.test.ts` — ID вставки.
- Create: `tests/server/contact-submission-notification.test.ts` — темы, ссылка, отсутствие ПДн и ошибки.

### Task 1: Возвращаемый ID заявки

**Files:**
- Modify: `src/lib/db/repositories/contact-submissions.ts`
- Modify: `tests/db/contact-submissions.repository.test.ts`

**Interfaces:**
- Produces: `createContactSubmission(db, input): Promise<number>`.

- [ ] **Step 1: Write the failing test**

```ts
const id = await createContactSubmission(db, {
  name: 'Alice', phone: '+372 5000 0000', email: 'alice@example.com', locale: 'ru'
});
expect(id).toBe(1);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/db/contact-submissions.repository.test.ts`

Expected: FAIL because the function resolves to `undefined`.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function createContactSubmission(db: Db, input: SubmissionInput): Promise<number> {
  const [created] = await db.insert(contactSubmissions).values({
    name: input.name, phone: input.phone, email: input.email,
    comment: input.comment ?? '', locale: input.locale, createdAt: new Date()
  }).returning({ id: contactSubmissions.id });
  return created.id;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/db/contact-submissions.repository.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/repositories/contact-submissions.ts tests/db/contact-submissions.repository.test.ts
git commit -m "feat: return contact submission id"
```

### Task 2: Изолированная отправка уведомления

**Files:**
- Create: `src/lib/server/notifications/contact-submission.ts`
- Create: `tests/server/contact-submission-notification.test.ts`
- Modify: `src/app.d.ts`

**Interfaces:**
- Produces: `sendContactSubmissionNotification({ id, origin, env }): Promise<void>`.

- [ ] **Step 1: Write the failing tests**

```ts
await sendContactSubmissionNotification({ id: 123, origin: 'https://example.test', env: fakeProdEnv });
expect(fakeProdEnv.ADMIN_EMAIL.send).toHaveBeenCalledWith(expect.objectContaining({
  subject: 'Новая заявка #123',
  text: expect.stringContaining('https://example.test/admin/submissions/123')
}));
expect(JSON.stringify(fakeProdEnv.ADMIN_EMAIL.send.mock.calls)).not.toContain('Alice');
```

Add a develop case expecting `TEST: Новая заявка #7`, plus missing-binding and rejected-`send()` cases that resolve without throwing.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/server/contact-submission-notification.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Write minimal implementation and types**

```ts
export async function sendContactSubmissionNotification({ id, origin, env }: NotificationInput) {
  if (!env?.ADMIN_EMAIL || !env.NOTIFICATION_FROM_EMAIL) return;
  const subject = (env.APP_ENV === 'develop' ? 'TEST: ' : '') + 'Новая заявка #' + id;
  const url = new URL('/admin/submissions/' + id, origin).href;
  try {
    await env.ADMIN_EMAIL.send({
      from: env.NOTIFICATION_FROM_EMAIL, to: undefined, subject,
      text: 'Поступила новая заявка.\n' + url
    });
  } catch (error) {
    console.error('[notifications] event=contact_submission_email_failed', { id, error });
  }
}
```

Type `ADMIN_EMAIL` against the installed Workers Email Service API. With `destination_address`, pass `to: undefined`; Cloudflare substitutes the binding-configured recipient, so the application neither stores nor accepts a recipient address.

- [ ] **Step 4: Run tests and type check**

Run: `npm test -- tests/server/contact-submission-notification.test.ts && npm run check`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/notifications/contact-submission.ts tests/server/contact-submission-notification.test.ts src/app.d.ts
git commit -m "feat: add contact submission notification"
```

### Task 3: Подключение к action формы

**Files:**
- Modify: `src/routes/+page.server.ts`

**Interfaces:**
- Consumes: `createContactSubmission(): Promise<number>`, `sendContactSubmissionNotification()`.
- Produces: прежний ответ `{ success: true }`.

- [ ] **Step 1: Implement post-save scheduling**

```ts
const id = await createContactSubmission(db, { name, phone, email, comment, locale: locals.locale });
const notification = sendContactSubmissionNotification({
  id, origin: new URL(request.url).origin, env: platform?.env
});
if (platform?.context?.waitUntil) platform.context.waitUntil(notification);
else await notification;
```

- [ ] **Step 2: Run checks**

Run: `npm run check && npm test -- tests/db/contact-submissions.repository.test.ts tests/server/contact-submission-notification.test.ts`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/routes/+page.server.ts
git commit -m "feat: notify admin about contact submissions"
```

### Task 4: Конфигурация Cloudflare и приёмка develop

**Files:**
- Modify: `wrangler.jsonc`

**Interfaces:**
- `develop.send_email.ADMIN_EMAIL.destination_address` — личный тестовый адрес.
- `prod.send_email.ADMIN_EMAIL.destination_address` — адрес клиента.
- `NOTIFICATION_FROM_EMAIL` — подтверждённый Email Service адрес.

- [ ] **Step 1: Add configuration**

Добавить `APP_ENV`, `NOTIFICATION_FROM_EMAIL` и `send_email` binding `ADMIN_EMAIL` в `develop` и `prod`; намеренно не добавлять binding в `local`.

- [ ] **Step 2: Configure Cloudflare Email Service**

В панели Cloudflare подтвердить домен и адрес отправителя. В `develop` указать личного получателя, в `prod` — клиента. Адреса не добавлять в тесты или TypeScript.

- [ ] **Step 3: Validate and deploy develop**

Run: `npm run check && npm test && npm run deploy:develop`

Expected: все проверки проходят, Wrangler разворачивает `dpflab-develop` с email binding.

- [ ] **Step 4: Manual acceptance**

Отправить валидную форму в develop и проверить одну запись, письмо `TEST: Новая заявка #<id>`, ссылку на защищённую запись и отсутствие ПДн в письме.

- [ ] **Step 5: Commit**

```bash
git add wrangler.jsonc
git commit -m "chore: configure email notifications"
```

## План самопроверки

- Спецификация покрыта задачами: окружения и получатели, TEST-тема, ID, ссылка, отсутствие ПДн, фоновая отправка, локальное отключение и обработка ошибок.
- Адреса не выдумываются: они остаются конфигурацией Cloudflare.
- Имена согласованы: `ADMIN_EMAIL`, `APP_ENV`, `NOTIFICATION_FROM_EMAIL`, `sendContactSubmissionNotification`, `createContactSubmission`.

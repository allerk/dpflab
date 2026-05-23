---
name: ci
description: Set up CI checks and deploy to the zone.ee VPS. Use when wiring GitHub Actions, writing deploy scripts, configuring systemd, troubleshooting the production build, managing migrations on the server, or rolling out a new release. Triggers on mentions of CI, GitHub Actions, deploy, zone.ee, VPS, systemd, redeploy, production build, or nginx.
---

# CI & Deployment

Production target: a zone.ee VPS running Node 24.15.0 (pinned in `.nvmrc`) under systemd, fronted by nginx. Full reference: `wiki/deployment.md`.

## CI checks (GitHub Actions)

A pull-request workflow should run, in this order, on Node 24.15.0:

```yaml
- npm ci
- npm run check   # TypeScript + Svelte type-check (no separate lint step)
- npm test        # vitest — see [[tdd]]
- npm run build   # confirms adapter-node output is clean
```

Cache `~/.npm` keyed on `package-lock.json`. Don't cache `build/` or `data/` between runs.

Do not run `db:seed` in CI — it wipes content rows. Migrations apply automatically on server startup ([[database]]), so CI doesn't need to touch a real DB.

## First deploy

On the VPS (one-time setup):

```bash
git clone <repo> /var/www/dpflab && cd /var/www/dpflab
npm ci --omit=dev
npm run build
mkdir -p data/images
npm run db:migrate
npm run db:seed                 # ONLY on first deploy — destructive
cp config/admin-whitelist.example.txt config/admin-whitelist.txt
# create .env (see below)
```

`.env` (never committed):

```
DATABASE_URL=file:/var/www/dpflab/data/dpflab.db
ADMIN_PASSWORD=<strong>
ADMIN_SESSION_SECRET=<base64url, 32+ bytes>
NODE_ENV=production
```

Generate the secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.

## systemd unit

`/etc/systemd/system/dpflab.service`:

```ini
[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dpflab
EnvironmentFile=/var/www/dpflab/.env
ExecStart=/usr/bin/node build/index.js
Restart=on-failure
RestartSec=5
```

`systemctl daemon-reload && systemctl enable --now dpflab`.

## Redeploy loop

```bash
git pull
npm ci --omit=dev
npm run build
systemctl restart dpflab
```

`data/` is never touched by build or restart — DB and uploaded images persist. Migrations apply on boot.

## Required at runtime alongside `build/`

- `drizzle/` — migration files; without this the boot-time `migrate()` call fails.
- `data/` — SQLite DB and image uploads.
- `config/admin-whitelist.txt` — gitignored, managed on the server.
- `.env` — gitignored, managed on the server.
- `node_modules/` — prod deps only (`npm ci --omit=dev`).

## Images without redeploy

`data/images/` is served at `/images/<filename>`. SFTP upload is sufficient — no restart, no rebuild. The admin panel writes here too. Supported: `.jpg/.jpeg/.png/.webp/.gif/.svg/.avif`.

## nginx (reverse proxy + TLS)

Proxy `127.0.0.1:3000`, forward `Host` / `X-Real-IP` / `X-Forwarded-For` / `X-Forwarded-Proto`. Issue certs via `certbot --nginx -d <domain>`. Full template in `wiki/deployment.md`.

## Troubleshooting

- `migrate()` fails on boot → `drizzle/` is missing in the working directory. Confirm `WorkingDirectory=` in the unit file matches the repo root.
- 502 from nginx → check `systemctl status dpflab` and `journalctl -u dpflab -n 100`.
- New images return 404 → confirm they live under `data/images/` (not `static/images/`) and that the server has read perms.
- Session cookie not sticking in prod → `NODE_ENV=production` must be set so the cookie is `Secure`-flagged behind TLS.
- DB file locked → another `node build/index.js` is still running; only systemd should hold it.

## Don'ts

- Never `git push --force` to `main` — production pulls from it.
- Never run `npm run db:seed` after first deploy; it overwrites edited content. Use the admin panel.
- Never commit `.env`, `config/admin-whitelist.txt`, or anything under `data/`.
- Don't add `--no-verify` to deploy hooks; investigate failures instead.

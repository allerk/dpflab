# Deployment Guide (zone.ee VPS)

## Prerequisites

- Node.js 24.15.0 (pin with `nvm use` or set system version — see `.nvmrc`)
- SSH / SFTP access to the VPS
- The repo cloned at a fixed path, e.g. `/var/www/dpflab`

---

## Environment variables

Create a `.env` file in the project root on the server (never committed):

```
DATABASE_URL=file:/var/www/dpflab/data/dpflab.db
ADMIN_PASSWORD=<strong password>
ADMIN_SESSION_SECRET=<32+ random bytes, base64>

# Optional — set to "production" to make the session cookie Secure-only
NODE_ENV=production
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

---

## Admin email whitelist

Copy the example file and add the real admin email:

```bash
cp config/admin-whitelist.example.txt config/admin-whitelist.txt
echo "your@email.com" >> config/admin-whitelist.txt
```

The file is read on every login (mtime-cached), so you can add or remove addresses without restarting the server.

---

## First deploy

```bash
# 1. Install dependencies
npm ci --omit=dev

# 2. Build
npm run build

# 3. Create the data directory (SQLite DB + images live here)
mkdir -p data/images

# 4. Run migrations and seed initial content
npm run db:migrate
npm run db:seed     # only on first deploy — wipes and re-inserts all content rows

# 5. Start the server
PORT=3000 node build/index.js
```

Migrations run automatically on startup too (`src/lib/db/index.ts`), so step 4 is a safety net for the very first run.

---

## Process management (systemd)

Create `/etc/systemd/system/dpflab.service`:

```ini
[Unit]
Description=DPFLAB site
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dpflab
EnvironmentFile=/var/www/dpflab/.env
ExecStart=/usr/bin/node build/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable dpflab
systemctl start dpflab
```

---

## Updating the app (redeploy)

```bash
git pull
npm ci --omit=dev
npm run build
systemctl restart dpflab
```

The `data/` directory is never touched by a build or restart — the SQLite DB and images persist across deploys.

---

## Updating images (no redeploy needed)

Images are served from `data/images/` at the path `/images/<filename>`.

Upload via SFTP:
```
sftp user@your-vps
put local-photo.jpg /var/www/dpflab/data/images/photo.jpg
```

The file is immediately available at `https://yourdomain.com/images/photo.jpg`. No restart required.

To use an image in a component, replace the `<div class="placeholder">` with:
```html
<img src="/images/photo.jpg" alt="..." />
```

Supported formats: `.jpg` / `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`, `.avif`

---

## Nginx reverse proxy (recommended)

Put nginx in front so you get SSL termination and can later cache static assets:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Get a free SSL cert via Let's Encrypt:
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Directory layout on the server

```
/var/www/dpflab/
├── build/          ← compiled app (output of npm run build)
├── drizzle/        ← migration files (checked in, required at runtime)
├── data/
│   ├── dpflab.db   ← SQLite database
│   └── images/     ← uploaded images (served at /images/<file>)
├── config/
│   └── admin-whitelist.txt   ← gitignored, managed manually
├── .env            ← gitignored, managed manually
└── node_modules/   ← only prod deps (npm ci --omit=dev)
```

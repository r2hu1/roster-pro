# Self-Hosting Guide — Roster Pro

Guide to deploy and self-host the Roster Pro platform across bare metal, Docker, or managed cloud infrastructure.

---

## 1. Prerequisites & Dependencies

### Core Services
- **Bun 1.x**: JavaScript/TypeScript runtime & package manager.
- **PostgreSQL 15+**: Primary relational database.
- **Redis (Upstash or Redis 7+)**: Session secondary storage, rate limiting, and realtime pub/sub.
- **Node.js 20+** (if not using Bun directly in production runners).

### External Integrations
- **Google OAuth**: For owner and staff dashboard authentication.
- **ImageKit**: For uploading restaurant logos and menu dish images.
- **Polar.sh** (Optional / Billing): For SaaS subscription tiers and billing management.

---

## 2. Environment Variables

Create `.env` files for each app using the templates below.

### `apps/api/.env`
```env
# Server
PORT=3000
NODE_ENV=production
APP_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/roster_pro

# Better Auth
BETTER_AUTH_SECRET=generate_a_random_32_char_secret_here
BETTER_AUTH_URL=https://api.yourdomain.com

# Redis / Upstash
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Security & Encryption (AES-256-GCM 32-byte hex key)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
API_KEY=your_internal_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ImageKit (Media Uploads)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Polar (Billing / Subscriptions)
POLAR_ACCESS_TOKEN=your_polar_token
POLAR_MONTHLY_PRODUCT_ID=your_product_id
POLAR_WEBHOOK_SECRET=your_webhook_secret
```

### `apps/web/.env`
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
NEXT_PUBLIC_CLIENT_WEB_URL=https://order.yourdomain.com
NEXT_PUBLIC_MARKETING_URL=https://yourdomain.com
API_KEY=your_internal_api_key
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### `apps/client-web/.env`
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://order.yourdomain.com
NEXT_PUBLIC_MARKETING_URL=https://yourdomain.com
API_KEY=your_internal_api_key
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### `apps/marketing/.env`
```env
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
NEXT_PUBLIC_CLIENT_WEB_URL=https://order.yourdomain.com
```

---

## 3. Quick Start (Bare-metal / VPS)

### 1. Clone & Install
```bash
git clone https://github.com/your-org/roster-pro.git
cd roster-pro
bun install
```

### 2. Run Database Migrations
Push Drizzle schema directly to your PostgreSQL database:
```bash
bun run db:push
```
Or run generated migrations:
```bash
bun run db:migrate
```

### 3. Build Apps
```bash
bun run build
```

### 4. Start via Process Manager (PM2 / Systemd)

Using PM2 ecosystem file (`ecosystem.config.cjs`):
```js
module.exports = {
  apps: [
    {
      name: "roster-api",
      cwd: "./apps/api",
      script: "bun",
      args: "run start",
      env: { NODE_ENV: "production" }
    },
    {
      name: "roster-web",
      cwd: "./apps/web",
      script: "bun",
      args: "run start -p 3001",
      env: { NODE_ENV: "production" }
    },
    {
      name: "roster-client-web",
      cwd: "./apps/client-web",
      script: "bun",
      args: "run start -p 3003",
      env: { NODE_ENV: "production" }
    },
    {
      name: "roster-marketing",
      cwd: "./apps/marketing",
      script: "bun",
      args: "run start -p 3002",
      env: { NODE_ENV: "production" }
    }
  ]
};
```
Start PM2:
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

---

## 4. Reverse Proxy Setup (Nginx)

Example reverse proxy configuration routing subdomains to their respective internal services:

```nginx
# API
server {
    server_name api.yourdomain.com;
    listen 80;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Restaurant Dashboard
server {
    server_name app.yourdomain.com;
    listen 80;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Customer QR Ordering
server {
    server_name order.yourdomain.com;
    listen 80;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Marketing Landing
server {
    server_name yourdomain.com;
    listen 80;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable SSL via Certbot:
```bash
certbot --nginx -d yourdomain.com -d app.yourdomain.com -d order.yourdomain.com -d api.yourdomain.com
```

---

## 5. Maintenance & Troubleshooting

### Drizzle Studio
Inspect your production database securely over SSH tunnel:
```bash
bun run db:studio
```

### Database Backup
```bash
pg_dump -U user -h localhost roster_pro > backup_$(date +%F).sql
```

### Health Checks
- API Health: Check `GET /v1/health` (or `/auth/session`)
- Inspect real-time logs:
  ```bash
  pm2 logs roster-api
  ```

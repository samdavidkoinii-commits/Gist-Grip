# Gist & Grip Brands

A production-style full-stack beauty salon booking platform based on the approved visual direction.

## Stack
- Frontend: React + Vite + React Router
- Backend: Node.js + Express + Prisma
- Database: PostgreSQL (with a simple fallback demo mode when DATABASE_URL is absent)
- Payments: Paystack (optional, enabled with PAYSTACK_SECRET_KEY)
- Email: Resend (optional, enabled with RESEND_API_KEY)
- Media: Cloudinary (optional for admin uploads)

## Features
- Premium responsive marketing site
- Services and categories
- Team/staff profiles
- Gallery
- Offers
- Customer booking flow with live availability
- Customer account and appointments
- JWT authentication + role-based admin/staff/customer access
- Admin dashboard with appointments, customers, services, staff, reports
- Paystack payment initialization + webhook verification
- Resend booking confirmation email integration
- Cloudinary image upload endpoint
- PostgreSQL/Prisma schema
- Seed data for a realistic salon demo

## Run locally

### 1. Requirements
- Node.js 20+
- npm 10+
- PostgreSQL 15+ (Docker recommended)

### 2. Install
```bash
npm run install:all
```

### 3. Configure backend
Copy `backend/.env.example` to `backend/.env`.

For a quick demo without Postgres, leave `DATABASE_URL` empty. The API will use an in-memory repository and seed demo data automatically.

For full persistence, set `DATABASE_URL` and run:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Start both apps
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Health check: http://localhost:4000/api/health

### Local demo credentials
Development demo credentials can be configured with `ADMIN_DEMO_PASSWORD` and `CUSTOMER_DEMO_PASSWORD`.

## Real integrations
The code reads these backend environment variables:
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_CALLBACK_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Never expose secret keys in the frontend.

### PostgreSQL with Docker
```bash
docker compose up -d postgres
```
Then set:
```env
DATABASE_URL=postgresql://gistgrip:gistgrip_dev_password@localhost:5432/gistgrip?schema=public
```

### Production notes
- Replace `JWT_SECRET` with a long random secret.
- Set a real frontend origin, Paystack secret/callback, Resend verified sender, and Cloudinary credentials.
- Use HTTPS in production.
- Put the API behind a reverse proxy and configure database backups.

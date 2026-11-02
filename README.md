# Lumiere Salon / Gist & Grip

Full-stack salon booking website built with React, Express, Prisma, and PostgreSQL.

## Requirements

- Node.js 20+
- npm 10+
- PostgreSQL 15+

## Local development

```bash
npm run install:all
```

Copy `backend/.env.example` and `frontend/.env.example`, then configure their values.

```bash
docker compose up -d postgres
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health: `http://localhost:4000/api/health`

Local Docker database:

```env
DATABASE_URL=postgresql://lumiere:lumiere_dev_password@localhost:5432/lumiere?schema=public
```

## Environment variables

Backend:

- `NODE_ENV`
- `PORT`
- `FRONTEND_URL`
- `JWT_SECRET`
- `DATABASE_URL`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_CALLBACK_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `CONTACT_EMAIL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_SEED_PASSWORD` (required only when seeding production)

Frontend:

- `VITE_API_URL`

Never commit `.env` files or secrets.

## Production deployment

Backend deployment:

- Build: `npm install && npm run build && npm run prisma:generate`
- Pre-deploy: `npm run prisma:migrate`
- Start: `npm start`

Frontend deployment:

- Build: `npm run build`
- Output: `dist`

Configure real production HTTPS domains before enabling live payments. Production startup requires a database, JWT secret, frontend origin, Paystack secret, and Paystack callback.

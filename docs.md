# Implementation Map

## REST base
`/api/v1`

## Public
`GET /services`, `GET /services/:id`, `GET /staff`, `GET /gallery`, `GET /promotions`, `GET /settings`

## Auth
`POST /auth/register`, `POST /auth/login`

## Booking
`GET /appointments/availability`, `POST /appointments`, `GET /appointments`, `PATCH /appointments/:id/status`

## Admin
`GET /admin/dashboard`, `GET /admin/appointments`

## Payments
`POST /payments/webhook`, `GET /payments/:reference`

## Media
`POST /uploads/image` as multipart form field `image` for admin/super-admin uploads.

## External integrations
Paystack initialization occurs on the backend and sends GHS amounts in pesewas/cents. Paystack supports checkout channels such as card, mobile money and bank transfer. Configure `PAYSTACK_SECRET_KEY` and callback URL to activate live payment initialization.

Cloudinary is used only when its credentials are configured. Secrets remain server-side.

Resend is used for booking confirmation emails when `RESEND_API_KEY` is present.

# Gist & Grip API Spec

Base: `/api/v1`

### Auth
- POST `/auth/register` — create customer account
- POST `/auth/login` — login and receive JWT

### Public content
- GET `/services`
- GET `/services/:id`
- GET `/staff`
- GET `/gallery`
- GET `/promotions`
- GET `/settings`

### Booking
- GET `/appointments/availability?serviceId=&staffId=&date=`
- POST `/appointments`
- GET `/appointments` — authenticated customer's appointments; admin/staff get broader access
- PATCH `/appointments/:id/status` — admin/staff

### Admin
- GET `/admin/dashboard`
- GET `/admin/appointments`

### Payments
- POST `/payments/webhook` — Paystack webhook, HMAC signature checked
- GET `/payments/:reference` — authenticated payment lookup

### Media
- POST `/uploads/image` — authenticated admin/super-admin multipart upload, form field `image`

All responses follow `{ success, data, message? }` where practical. Booking conflict errors use `TIME_SLOT_UNAVAILABLE`.

import 'dotenv/config';
import crypto from 'node:crypto';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? crypto.randomBytes(32).toString('hex'),
  databaseUrl: process.env.DATABASE_URL ?? '',
  paystackSecret: process.env.PAYSTACK_SECRET_KEY ?? '',
  paystackCallback: process.env.PAYSTACK_CALLBACK_URL ?? 'http://localhost:5173/payment/callback',
  resendKey: process.env.RESEND_API_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'Lumière Beauty <onboarding@resend.dev>',
  contactEmail: process.env.CONTACT_EMAIL ?? 'hello@gistgripbraids.com',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? ''
  }
};

if (process.env.NODE_ENV === 'production') {
  const missing = [
    !config.databaseUrl && 'DATABASE_URL',
    !process.env.JWT_SECRET && 'JWT_SECRET',
    (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes('localhost')) && 'FRONTEND_URL',
    (!config.paystackSecret) && 'PAYSTACK_SECRET_KEY',
    (!process.env.PAYSTACK_CALLBACK_URL || process.env.PAYSTACK_CALLBACK_URL.includes('localhost')) && 'PAYSTACK_CALLBACK_URL'
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Production configuration is missing: ${missing.join(', ')}`);
  }
}

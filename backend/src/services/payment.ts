import crypto from 'node:crypto';
import { config } from '../config.js';

export async function initializePaystack(email: string, amountGhs: number, reference: string) {
  if (!config.paystackSecret) {
    throw new Error('Paystack is not configured');
  }

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.paystackSecret}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amountGhs * 100),
      currency: 'GHS',
      reference,
      callback_url: config.paystackCallback,
      channels: ['card', 'mobile_money', 'bank_transfer']
    })
  });
  const data = await response.json();
  if (!response.ok || !data.status) throw new Error(data.message ?? 'Paystack initialization failed');
  return data.data;
}

export function verifyPaystackSignature(rawBody: string, signature: string) {
  if (!config.paystackSecret) return false;
  const hash = crypto.createHmac('sha512', config.paystackSecret).update(rawBody).digest('hex');
  const received = Buffer.from(signature);
  const expected = Buffer.from(hash);
  return received.length === expected.length && crypto.timingSafeEqual(expected, received);
}

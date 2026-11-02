import { Router } from 'express';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { verifyPaystackSignature } from '../services/payment.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/webhook', (req, res) => {
  const signature = String(req.headers['x-paystack-signature'] || '');
  if (!verifyPaystackSignature(req.bodyRaw || JSON.stringify(req.body), signature)) {
    return res.status(401).send('invalid signature');
  }
  const event = req.body;
  if (event?.event === 'charge.success' && prisma) {
    const reference = String(event?.data?.reference || '');
    const database = prisma;
    if (reference) {
      database.payment.updateMany({
        where: { transactionReference: reference },
        data: { status: 'SUCCESSFUL', paidAt: new Date(), gatewayResponse: event.data }
      }).then(async () => {
        const payment = await database.payment.findUnique({ where: { transactionReference: reference } });
        if (payment) await database.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: 'CONFIRMED' }
        });
      }).catch((error: unknown) => console.error('Paystack webhook processing failed', error));
    }
  }
  return res.sendStatus(200);
});

router.get('/verify/:reference', async (req, res) => {
  const reference = String(req.params.reference || '');
  if (!reference) return res.status(400).json({ success: false, message: 'Payment reference is required' });
  if (!config.paystackSecret) return res.status(503).json({ success: false, message: 'Payment verification is not configured' });
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${config.paystackSecret}` }
    });
    const result: any = await response.json();
    if (!response.ok || !result.status || result.data?.status !== 'success') {
      return res.status(402).json({ success: false, message: 'Payment has not been verified' });
    }
    if (prisma) {
      const database = prisma;
      const payment = await database.payment.findUnique({ where: { transactionReference: reference } });
      if (!payment) return res.status(404).json({ success: false, message: 'Payment reference not found' });
      if (Number(result.data.amount) !== Math.round(Number(payment.amount) * 100) || result.data.currency !== 'GHS') {
        return res.status(400).json({ success: false, message: 'Payment amount or currency does not match' });
      }
      await database.payment.update({ where: { transactionReference: reference }, data: { status: 'SUCCESSFUL', paidAt: new Date(), gatewayResponse: result.data } });
      await database.appointment.update({ where: { id: payment.appointmentId }, data: { status: 'CONFIRMED' } });
    }
    return res.json({ success: true, data: { reference, status: 'SUCCESSFUL' } });
  } catch {
    return res.status(502).json({ success: false, message: 'Could not verify payment at this time' });
  }
});

router.get('/:reference', requireAuth, async (req, res) => {
  if (!prisma) return res.status(503).json({ success: false, message: 'Payment records are unavailable' });
  const database = prisma;
  const reference = String(req.params.reference || '');
  const payment = await database.payment.findUnique({ where: { transactionReference: reference }, include: { appointment: true } });
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role) && payment.customerId !== req.user!.id) {
    return res.status(403).json({ success: false, message: 'You cannot access this payment' });
  }
  return res.json({ success: true, data: payment });
});

export default router;

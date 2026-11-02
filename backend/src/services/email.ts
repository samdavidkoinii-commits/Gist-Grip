import { Resend } from 'resend';
import { config } from '../config.js';

export async function sendBookingConfirmation(to: string, details: { name:string; bookingNumber:string; service:string; date:string; time:string; staff:string; amount:number }) {
  if (!config.resendKey) return { skipped: true };
  const resend = new Resend(config.resendKey);
  const { data, error } = await resend.emails.send({
    from: config.emailFrom,
    to: [to],
    subject: `Appointment confirmed — ${details.bookingNumber}`,
    html: `<div style="font-family:Arial,sans-serif"><h2>Your Gist & Grip appointment is confirmed</h2><p>Hi ${details.name},</p><p><b>${details.service}</b> with ${details.staff}</p><p>${details.date} at ${details.time}</p><p>Booking: <b>${details.bookingNumber}</b></p><p>Total: GHS ${details.amount.toFixed(2)}</p></div>`
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function sendContactMessage(details: { name:string; phone:string; instagram:string; message:string }) {
  if (!config.resendKey) throw new Error('Email service is not configured');
  const escape = (value:string) => value.replace(/[&<>"']/g, character => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  })[character] || character);
  const resend = new Resend(config.resendKey);
  const { error } = await resend.emails.send({
    from: config.emailFrom,
    to: [config.contactEmail],
    replyTo: undefined,
    subject: `Website message from ${details.name}`,
    html: `<p><b>Name:</b> ${escape(details.name)}</p><p><b>Phone:</b> ${escape(details.phone)}</p><p><b>Instagram:</b> ${escape(details.instagram)}</p><p>${escape(details.message).replace(/\n/g,'<br>')}</p>`
  });
  if (error) throw new Error(error.message);
}

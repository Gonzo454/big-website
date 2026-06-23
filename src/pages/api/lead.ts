import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const RECIPIENTS = [
  'andrea@blackdeerig.com',
  'sienna@blackdeerig.com',
];

export const POST: APIRoute = async ({ request }) => {
  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { name, email, phone, property_type, message, context } = body;

  if (!name || !email) {
    return new Response(JSON.stringify({ error: 'Name and email are required' }), { status: 400 });
  }

  const subject = `New Inquiry from ${name}${context ? ` — ${context}` : ''}`;

  const html = `
    <h2>New Website Inquiry</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px;">
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Property Type</td><td style="padding:8px;border-bottom:1px solid #eee;">${property_type || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Context</td><td style="padding:8px;border-bottom:1px solid #eee;">${context || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;vertical-align:top;">Message</td><td style="padding:8px;">${message || '—'}</td></tr>
    </table>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'Blackdeer IG Website <noreply@blackdeerig.com>',
      to: RECIPIENTS,
      replyTo: email,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Email send error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

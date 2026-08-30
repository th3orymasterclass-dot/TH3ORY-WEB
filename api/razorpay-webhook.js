import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { safeCompare } from './_lib/security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

  if (!webhookSecret) {
    console.error('[Razorpay Webhook Error]: Missing RAZORPAY_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const razorpaySignature = req.headers['x-razorpay-signature'];

  if (!razorpaySignature) {
    console.error('[Razorpay Webhook Error]: Missing x-razorpay-signature header');
    return res.status(400).json({ error: 'Missing signature header' });
  }

  try {
    // Get body for HMAC verification
    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyStr)
      .digest('hex');

    // Constant-time comparison
    if (!safeCompare(expectedSignature, String(razorpaySignature).trim())) {
      console.error('[Razorpay Webhook Error]: Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    console.log(`[Razorpay Webhook Event Verified]: ${event}`);

    // Initialize Supabase Admin client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    let supabase = null;
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
    }

    switch (event) {
      case 'payment.captured':
      case 'order.paid': {
        const orderId = paymentEntity?.order_id || orderEntity?.id;
        const email = paymentEntity?.email;
        const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : 0;
        const notes = paymentEntity?.notes || orderEntity?.notes || {};

        if (supabase && orderId && email) {
          const cleanEmail = email.trim().toLowerCase();
          const studentName = notes.name || notes.studentName || cleanEmail.split('@')[0];
          
          // Cryptographically secure random enrollment code
          const secureCode = `TH3ORY-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

          // Atomic insert with idempotency check
          const { data: existing } = await supabase
            .from('enrollments')
            .select('id')
            .eq('order_id', orderId)
            .maybeSingle();

          if (!existing) {
            await supabase.from('enrollments').insert([
              {
                order_id: orderId,
                email: cleanEmail,
                name: studentName,
                amount_paid: amount,
                currency: paymentEntity?.currency || 'INR',
                gateway: 'razorpay',
                enrollment_code: secureCode,
                plan_name: notes.planName || 'TH3ORY Masterclass',
                coupon_code: notes.couponCode || 'NONE',
              },
            ]);

            // Create or update student account
            await supabase.from('student_accounts').upsert([
              {
                email: cleanEmail,
                name: studentName,
                enrollment_code: secureCode,
                plan_name: notes.planName || 'TH3ORY Masterclass',
              },
            ], { onConflict: 'email' });
          }
        }
        break;
      }

      case 'payment.failed': {
        const orderId = paymentEntity?.order_id;
        const reason = paymentEntity?.error_description || 'Payment Failed';
        console.warn(`[Webhook Payment Failed]: Order ${orderId} - ${reason}`);
        break;
      }

      case 'refund.processed': {
        const paymentId = payload.payload?.refund?.entity?.payment_id;
        console.log(`[Webhook Refund Processed]: Payment ${paymentId}`);
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }

    return res.status(200).json({ success: true, eventReceived: event });
  } catch (error) {
    console.error('[Razorpay Webhook Exception]:', error.message);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
}

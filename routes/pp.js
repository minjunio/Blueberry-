'use strict';

const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch'); // npm install node-fetch (or use global fetch on Node 18+)
const crc32 = require('buffer-crc32'); // npm install buffer-crc32

const router = express.Router();

// === CONFIGURATION (use environment variables) ===
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID; // Get this from PayPal dashboard when you create the webhook
const IS_PRODUCTION = process.env.PAYPAL_MODE === 'live';

// Simple in-memory cache for PayPal certificates (use Redis/file in production)
const certCache = new Map();

async function getPayPalCert(certUrl) {
    if (certCache.has(certUrl)) {
        return certCache.get(certUrl);
    }
    const response = await fetch(certUrl);
    const pem = await response.text();
    certCache.set(certUrl, pem);
    return pem;
}

/**
 * Verifies the PayPal webhook signature.
 * Returns true if signature is valid.
 */
async function verifyPayPalWebhookSignature(req) {
    const headers = req.headers;
    const rawBody = req.body.toString(); // Must be the raw Buffer/string

    const transmissionId = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const certUrl = headers['paypal-cert-url'];

    if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !WEBHOOK_ID) {
        console.error('Missing required PayPal webhook headers or WEBHOOK_ID');
        return false;
    }

    // Build the signed message exactly as PayPal expects
    const crcValue = parseInt('0x' + crc32(rawBody).toString('hex'));
    const message = `\( {transmissionId}| \){transmissionTime}|\( {WEBHOOK_ID}| \){crcValue}`;

    const signatureBuffer = Buffer.from(transmissionSig, 'base64');
    const certPem = await getPayPalCert(certUrl);

    const verifier = crypto.createVerify('SHA256');
    verifier.update(message);

    return verifier.verify(certPem, signatureBuffer);
}

/**
 * Main webhook endpoint
 * Mount this at /api/paypal/webhook
 */
router.post('/webhook', async (req, res) => {
    try {
        const isValid = await verifyPayPalWebhookSignature(req);

        if (!isValid) {
            console.error('❌ Invalid PayPal webhook signature — possible spoofing attempt');
            return res.sendStatus(400);
        }

        const event = JSON.parse(req.body.toString());
        console.log(`✅ Verified PayPal event: ${event.event_type} | ${event.id}`);

        if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            await handleSuccessfulPayment(event.resource);
        }

        // Always acknowledge quickly (within a few seconds)
        res.sendStatus(200);
    } catch (error) {
        console.error('PayPal webhook processing error:', error);
        // Return 200 so PayPal doesn't keep retrying if we've already logged it
        res.sendStatus(200);
    }
});

/**
 * Core business logic: mark order paid + auto-whitelist
 */
async function handleSuccessfulPayment(resource) {
    const captureId = resource.id;
    const amount = parseFloat(resource.amount?.value || '0');
    const currency = resource.amount?.currency_code || 'USD';
    const payerEmail = (resource.payer?.email_address || '').toLowerCase().trim();
    const payPalCreateTime = resource.create_time;

    console.log(`💰 Payment captured: \[ {amount} ${currency} from ${payerEmail} (Capture ID: ${captureId})`);

    if (!payerEmail || amount <= 0) {
        console.warn('Webhook missing payer email or amount');
        return;
    }

    // === TODO: Replace with your actual database logic ===
    // 1. Check idempotency (have we already processed this captureId?)
    // const alreadyProcessed = await db.orders.findOne({ paypal_capture_id: captureId });
    // if (alreadyProcessed) return;

    // 2. Find a recent pending order for this buyer + amount
    //    (adjust time window as needed — 45-90 minutes is usually safe)
    // const pendingOrder = await findRecentPendingOrderForBuyer(payerEmail, amount, 90);

    // if (pendingOrder) {
    //     // Mark order as paid
    //     await markOrderAsPaid(pendingOrder.id, {
    //         paypal_capture_id: captureId,
    //         paid_at: new Date(),
    //         status: 'paid'
    //     });

    //     // === AUTO-WHITELIST / GRANT ACCESS ===
    //     await grantAccessToBuyer(payerEmail, {
    //         productId: pendingOrder.product_id,
    //         orderId: pendingOrder.id,
    //         amount: amount
    //     });

    //     // Optional: Send confirmation email, Discord role, license key, etc.
    //     console.log(`✅ User ${payerEmail} auto-whitelisted for product ${pendingOrder.product_id}`);
    // } else {
    //     // Payment received but no matching pending order — log for manual review
    //     console.log(`⚠️  No matching pending order found for ${payerEmail} - \]{amount}. Manual review may be needed.`);
    //     // You can still create an order record here if you want
    // }
}

// === Placeholder functions — implement according to your DB schema ===
async function findRecentPendingOrderForBuyer(email, amount, minutesWindow = 90) {
    // Example with Prisma / raw SQL / your ORM:
    // return await prisma.order.findFirst({
    //     where: {
    //         buyer_email: email,
    //         amount: amount,
    //         status: 'pending',
    //         created_at: { gte: new Date(Date.now() - minutesWindow * 60 * 1000) }
    //     }
    // });
    console.log(`[TODO] Find pending order for ${email} amount $${amount}`);
    return null;
}

async function markOrderAsPaid(orderId, paymentDetails) {
    console.log(`[TODO] Mark order ${orderId} as paid`, paymentDetails);
    // await prisma.order.update({ where: { id: orderId }, data: { ...paymentDetails, status: 'paid' } });
}

async function grantAccessToBuyer(email, accessDetails) {
    console.log(`[TODO] Grant whitelist/access to ${email}`, accessDetails);
    // Examples:
    // - Update buyers table: is_whitelisted = true, access_granted_at = now
    // - Insert into access_grants or licenses table
    // - Generate + email a license key for the StealthTool desktop app
    // - Update a Redis cache for fast desktop app checks
}

/**
 * Optional: Helper route to create a pending order before sending user to PayPal
 * Call this from your frontend when an authenticated user starts checkout.
 */
router.post('/create-pending-order', express.json(), async (req, res) => {
    const { buyerEmail, productId, amount, paypalButtonId } = req.body;

    if (!buyerEmail || !productId || !amount) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // === TODO: Insert into your orders table ===
    // const order = await createPendingOrder({ buyerEmail, productId, amount, paypalButtonId, status: 'pending' });

    console.log(`[TODO] Created pending order for ${buyerEmail} - product ${productId}`);

    res.json({ success: true, /* orderId: order.id */ });
});

module.exports = router;
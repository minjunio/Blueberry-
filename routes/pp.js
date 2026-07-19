'use strict';

const express = require('express');
const crypto = require('crypto');
const crc32 = require('buffer-crc32');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();

// === DATABASE CONNECTION (same as server.js) ===
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data');
const db = new sqlite3.Database(path.join(DATA_DIR, 'database.sqlite'));

// === CONFIGURATION ===
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

// In-memory cache for PayPal certificates
const certCache = new Map();

async function getPayPalCert(certUrl) {
    if (certCache.has(certUrl)) return certCache.get(certUrl);
    const res = await fetch(certUrl);
    const pem = await res.text();
    certCache.set(certUrl, pem);
    return pem;
}

/**
 * Verifies PayPal webhook signature
 */
async function verifyPayPalSignature(req) {
    const headers = req.headers;
    const rawBody = req.body.toString();

    const transmissionId = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const certUrl = headers['paypal-cert-url'];

    if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !WEBHOOK_ID) {
        console.error('Missing required PayPal webhook headers or WEBHOOK_ID');
        return false;
    }

    const crcValue = parseInt('0x' + crc32(rawBody).toString('hex'));
    const message = `\( {transmissionId}| \){transmissionTime}|\( {WEBHOOK_ID}| \){crcValue}`;

    const signatureBuffer = Buffer.from(transmissionSig, 'base64');
    const certPem = await getPayPalCert(certUrl);

    const verifier = crypto.createVerify('SHA256');
    verifier.update(message);

    return verifier.verify(certPem, signatureBuffer);
}

/**
 * Main webhook route
 */
router.post('/webhook', async (req, res) => {
    try {
        const isValid = await verifyPayPalSignature(req);

        if (!isValid) {
            console.error('❌ Invalid PayPal signature — possible spoofing attempt');
            return res.sendStatus(400);
        }

        const event = JSON.parse(req.body.toString());
        console.log(`✅ Verified PayPal event: ${event.event_type} | ID: ${event.id}`);

        if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            await handlePaymentCaptureCompleted(event.resource);
        }

        // Always respond quickly with 200
        res.sendStatus(200);
    } catch (error) {
        console.error('PayPal webhook processing error:', error);
        res.sendStatus(200); // Prevent PayPal from retrying
    }
});

/**
 * Core business logic when payment is successful
 */
async function handlePaymentCaptureCompleted(resource) {
    const captureId = resource.id;
    const amount = parseFloat(resource.amount?.value || 0);
    const currency = resource.amount?.currency_code || 'USD';
    const payerEmail = (resource.payer?.email_address || '').toLowerCase().trim();
    const createTime = resource.create_time;

    console.log(`💰 Payment Captured: \[ {amount} ${currency} | Email: ${payerEmail} | Capture ID: ${captureId}`);

    if (!payerEmail || amount <= 0) {
        console.warn('Webhook missing payer email or amount');
        return;
    }

    // Check if we already processed this capture (idempotency)
    db.get(
        "SELECT * FROM orders WHERE giftcard_code = ? AND status = 'Paid'",
        [captureId],
        (err, existing) => {
            if (existing) {
                console.log(`⚠️ Capture ${captureId} already processed. Skipping.`);
                return;
            }

            // Find recent pending order for this buyer + amount
            const timeWindow = new Date(Date.now() - 90 * 60 * 1000).toISOString(); // last 90 minutes

            db.get(
                `SELECT * FROM orders 
                 WHERE email = ? 
                   AND status = 'Pending Payment' 
                   AND created_at > ?
                 ORDER BY created_at DESC 
                 LIMIT 1`,
                [payerEmail, timeWindow],
                (err, order) => {
                    if (!order) {
                        console.log(`⚠️ No matching pending order found for ${payerEmail} - \]{amount}`);
                        // You can still log the payment somewhere if needed
                        return;
                    }

                    // Mark order as paid
                    db.run(
                        `UPDATE orders 
                         SET status = 'Paid', 
                             giftcard_code = ? 
                         WHERE id = ?`,
                        [captureId, order.id],
                        (updateErr) => {
                            if (updateErr) {
                                console.error('Failed to update order:', updateErr);
                                return;
                            }

                            console.log(`✅ Order #${order.order_id} marked as Paid for ${payerEmail}`);

                            // === AUTO-WHITELIST / ACCESS GRANT ===
                            // Add your custom logic here
                            grantAccessAfterPayment(payerEmail, order);
                        }
                    );
                }
            );
        }
    );
}

/**
 * Custom function: Grant access / whitelist after successful payment
 * Customize this based on your needs
 */
function grantAccessAfterPayment(buyerEmail, order) {
    console.log(`🎉 Granting access to ${buyerEmail} for order ${order.order_id}`);

    // Example options:
    // 1. Update order status to 'Completed'
    // 2. Add user to whitelist/machines.json
    // 3. Generate license key and email it
    // 4. Update a user access table

    // Example: Mark order as Completed
    db.run(
        "UPDATE orders SET status = 'Completed' WHERE id = ?",
        [order.id]
    );

    // TODO: Add your actual whitelist logic here if needed
    // Example: Add to machines.json or call your existing whitelist functions
}

/**
 * Optional: Create pending order before redirecting to PayPal
 * You can call this from frontend if you want better matching
 */
router.post('/create-pending-order', express.json(), (req, res) => {
    const { buyerEmail, productId, amount } = req.body;

    if (!buyerEmail || !productId || !amount) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const order_id = Math.random().toString(36).substring(2, 10).toUpperCase();

    db.run(
        `INSERT INTO orders (order_id, product_id, email, status) 
         VALUES (?, ?, ?, 'Pending Payment')`,
        [order_id, productId, buyerEmail],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, order_id });
        }
    );
});

module.exports = router;
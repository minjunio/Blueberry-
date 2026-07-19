'use strict';

const express = require('express');
const crypto = require('crypto');
const crc32 = require('buffer-crc32');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();

// === DATABASE (same as your server.js) ===
const DATA_DIR = path.join(__dirname, '..', 'data');
const db = new sqlite3.Database(path.join(DATA_DIR, 'database.sqlite'));

// === CONFIGURATION ===
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';

if (!WEBHOOK_ID) {
    console.warn('⚠️  PAYPAL_WEBHOOK_ID is not set in environment variables!');
}

// Cache for PayPal certificates
const certCache = new Map();

async function getPayPalCert(certUrl) {
    if (certCache.has(certUrl)) return certCache.get(certUrl);
    try {
        const res = await fetch(certUrl);
        const pem = await res.text();
        certCache.set(certUrl, pem);
        return pem;
    } catch (err) {
        console.error('Failed to fetch PayPal certificate:', err);
        throw err;
    }
}

/**
 * Verify PayPal Webhook Signature
 */
async function verifyPayPalSignature(req) {
    const headers = req.headers;
    const rawBody = req.body.toString();

    const transmissionId = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const certUrl = headers['paypal-cert-url'];

    if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl) {
        console.error('❌ Missing required PayPal headers');
        return false;
    }

    if (!WEBHOOK_ID) {
        console.error('❌ PAYPAL_WEBHOOK_ID environment variable is missing');
        return false;
    }

    const crcValue = parseInt('0x' + crc32(rawBody).toString('hex'));
    const message = `\( {transmissionId}| \){transmissionTime}|\( {WEBHOOK_ID}| \){crcValue}`;

    console.log(`🔐 Verifying webhook using ID prefix: ${WEBHOOK_ID.substring(0, 12)}...`);

    try {
        const certPem = await getPayPalCert(certUrl);
        const signatureBuffer = Buffer.from(transmissionSig, 'base64');

        const verifier = crypto.createVerify('SHA256');
        verifier.update(message);

        const isValid = verifier.verify(certPem, signatureBuffer);

        if (!isValid) {
            console.error('❌ Signature verification FAILED');
        }

        return isValid;
    } catch (err) {
        console.error('Signature verification error:', err);
        return false;
    }
}

// ======================================================
// MAIN WEBHOOK ENDPOINT
// ======================================================
router.post('/webhook', async (req, res) => {
    try {
        const isValid = await verifyPayPalSignature(req);

        if (!isValid) {
            console.error('❌ Invalid PayPal signature — possible spoofing attempt');
            return res.sendStatus(400);
        }

        const event = JSON.parse(req.body.toString());
        console.log(`✅ Verified PayPal event: ${event.event_type}`);

        if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            await handlePaymentCaptureCompleted(event.resource);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(200);
    }
});

// ======================================================
// BUSINESS LOGIC
// ======================================================
async function handlePaymentCaptureCompleted(resource) {
    const captureId = resource.id;
    const amount = parseFloat(resource.amount?.value || 0);
    const payerEmail = (resource.payer?.email_address || '').toLowerCase().trim();

    console.log(`💰 Payment received: $${amount} from ${payerEmail}`);

    if (!payerEmail || amount <= 0) return;

    // Idempotency check
    db.get("SELECT id FROM orders WHERE giftcard_code = ?", [captureId], (err, row) => {
        if (row) {
            console.log(`⚠️ Already processed: ${captureId}`);
            return;
        }

        // Find recent pending order (last 2 hours)
        const timeWindow = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

        db.get(
            `SELECT * FROM orders 
             WHERE email = ? 
               AND status IN ('Pending Payment', 'Pending') 
               AND created_at > ?
             ORDER BY created_at DESC LIMIT 1`,
            [payerEmail, timeWindow],
            (err, order) => {
                if (!order) {
                    console.log(`⚠️ No matching pending order found for ${payerEmail}`);
                    return;
                }

                // Mark as Paid
                db.run(
                    `UPDATE orders SET status = 'Paid', giftcard_code = ? WHERE id = ?`,
                    [captureId, order.id],
                    () => {
                        console.log(`✅ Order ${order.order_id} marked as Paid`);
                        grantUserAccess(payerEmail, order);
                    }
                );
            }
        );
    });
}

// ======================================================
// CUSTOMIZE THIS - Add your whitelist logic here
// ======================================================
function grantUserAccess(buyerEmail, order) {
    console.log(`🎉 Granting access to ${buyerEmail}`);

    // Mark as Completed
    db.run("UPDATE orders SET status = 'Completed' WHERE id = ?", [order.id]);

    // TODO: Add your actual logic (whitelist, license key, email, etc.)
}

// ======================================================
// Optional: Create pending order from frontend
// ======================================================
router.post('/create-pending-order', express.json(), (req, res) => {
    const { buyerEmail, productId } = req.body;
    if (!buyerEmail || !productId) return res.status(400).json({ success: false });

    const order_id = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    db.run(
        `INSERT INTO orders (order_id, product_id, email, status) VALUES (?, ?, ?, 'Pending Payment')`,
        [order_id, productId, buyerEmail],
        function (err) {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true, order_id });
        }
    );
});

module.exports = router;
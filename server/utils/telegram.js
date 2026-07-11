// ===== ATLAS FLOWERS - Telegram Bot Utility =====
// Node.js built-in https moduli orqali Telegram Bot API'ga xabar yuboradi
// (tashqi npm paket kerak emas)

const https = require('node:https');

/**
 * Telegram Bot API'ga HTML formatlangan xabar yuboradi
 * @param {string} botToken - BotFather'dan olingan bot token
 * @param {string} chatId - Xabar yuborilishi kerak bo'lgan chat ID
 * @param {string} text - Xabar matni (HTML formatda)
 * @returns {Promise<{ok: boolean, description?: string}>}
 */
function sendTelegramMessage(botToken, chatId, text) {
    return new Promise((resolve) => {
        if (!botToken || !chatId) {
            resolve({ ok: false, description: 'Bot token yoki Chat ID kiritilmagan' });
            return;
        }

        const payload = JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
        });

        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${botToken}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
            timeout: 10000,
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    resolve(data);
                } catch (err) {
                    resolve({ ok: false, description: 'Telegram javobini o\'qishda xatolik' });
                }
            });
        });

        req.on('error', (err) => {
            resolve({ ok: false, description: err.message });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ ok: false, description: 'Telegram serveriga ulanish vaqti tugadi' });
        });

        req.write(payload);
        req.end();
    });
}

/**
 * Yangi buyurtma haqida chiroyli formatlangan Telegram xabarini quradi
 * @param {object} order - Buyurtma obyekti { id, customer_name, customer_phone, customer_email, total, created_at, items }
 * @returns {string}
 */
function buildOrderMessage(order) {
    const itemsList = order.items
        .map((item) => `• ${escapeHtml(item.product_name)} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`)
        .join('\n');

    const date = new Date(order.created_at || Date.now()).toLocaleString('uz-UZ', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });

    return (
        `🌹 <b>ATLAS FLOWERS - Yangi Buyurtma!</b>\n\n` +
        `<b>📦 Buyurtma ID:</b> #${order.id}\n` +
        `<b>👤 Mijoz:</b> ${escapeHtml(order.customer_name)}\n` +
        `<b>📞 Telefon:</b> ${escapeHtml(order.customer_phone)}\n` +
        `<b>📧 Email:</b> ${escapeHtml(order.customer_email || '-')}\n` +
        (order.customer_address ? `<b>📍 Manzil:</b> ${escapeHtml(order.customer_address)}\n` : '') +
        `\n<b>🛍️ Mahsulotlar:</b>\n${itemsList}\n\n` +
        `<b>💰 Jami:</b> ${formatPrice(order.total)}\n` +
        `<b>📅 Vaqt:</b> ${date}\n\n` +
        `<i>Mijoz bilan bog'laning va buyurtmani tasdiqlang!</i>`
    );
}

function formatPrice(value) {
    return new Intl.NumberFormat('uz-UZ').format(value) + " so'm";
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

module.exports = {
    sendTelegramMessage,
    buildOrderMessage,
};

// ===== ATLAS FLOWERS - Sozlamalar API =====
// GET  /api/settings                  - Ochiq sozlamalar (do'kon ma'lumotlari, ochiq sahifa uchun)
// GET  /api/admin/settings             - Barcha sozlamalar (faqat admin, token'lar bilan)
// PUT  /api/admin/settings             - Sozlamalarni yangilash (faqat admin)
// POST /api/admin/settings/telegram/test - Telegram test xabarini yuborish (faqat admin)

const { sendJson, sendError, readJsonBody } = require('../utils/http');
const { requireAdmin } = require('../utils/middleware');
const { getAllSettings, setSettings } = require('../utils/settings');
const { sendTelegramMessage } = require('../utils/telegram');

// Ochiq (public) sahifada ko'rsatilishi mumkin bo'lgan sozlamalar
const PUBLIC_KEYS = ['shop_name', 'shop_phone', 'shop_email', 'shop_address', 'delivery_price', 'free_delivery_threshold', 'delivery_time'];

function registerSettingsRoutes(router) {
    router.get('/api/settings', async (req, res) => {
        const all = getAllSettings();
        const publicSettings = {};
        for (const key of PUBLIC_KEYS) {
            if (all[key] !== undefined) publicSettings[key] = all[key];
        }
        sendJson(res, 200, { ok: true, settings: publicSettings });
    });

    router.get('/api/admin/settings', requireAdmin(async (req, res) => {
        sendJson(res, 200, { ok: true, settings: getAllSettings() });
    }));

    router.put('/api/admin/settings', requireAdmin(async (req, res) => {
        let body;
        try {
            body = await readJsonBody(req);
        } catch (err) {
            return sendError(res, 400, err.message);
        }

        if (!body || typeof body !== 'object') return sendError(res, 400, "Sozlamalar noto'g'ri formatda");

        setSettings(body);
        sendJson(res, 200, { ok: true, settings: getAllSettings() });
    }));

    router.post('/api/admin/settings/telegram/test', requireAdmin(async (req, res) => {
        let body;
        try {
            body = await readJsonBody(req);
        } catch (err) {
            return sendError(res, 400, err.message);
        }

        const { bot_token, chat_id } = body;
        if (!bot_token || !chat_id) return sendError(res, 400, 'Bot Token va Chat ID kiritilishi shart');

        const message = `🌹 <b>ATLAS FLOWERS - Test Xabar</b>\n\n✅ Telegram bot muvaffaqiyatli ulandi!\n\nBu test xabar. Buyurtmalar shu formatda keladi.`;
        const result = await sendTelegramMessage(bot_token, chat_id, message);

        if (result.ok) {
            sendJson(res, 200, { ok: true, message: 'Test xabar muvaffaqiyatli yuborildi!' });
        } else {
            sendError(res, 400, result.description || "Telegram'ga yuborishda xatolik");
        }
    }));
}

module.exports = { registerSettingsRoutes };

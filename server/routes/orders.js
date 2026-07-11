// ===== ATLAS FLOWERS - Buyurtmalar API =====
// POST /api/orders               - Yangi buyurtma yaratish (ochiq, login ixtiyoriy)
// GET  /api/orders/my            - O'z buyurtmalarim (login talab qilinadi)
// GET  /api/admin/orders         - Barcha buyurtmalar (faqat admin)
// PUT  /api/admin/orders/:id     - Buyurtma statusini o'zgartirish (faqat admin)

const db = require('../db/connection');
const { sendJson, sendError, readJsonBody, extractToken } = require('../utils/http');
const { getUserByToken } = require('../utils/session');
const { requireAdmin } = require('../utils/middleware');
const { sendTelegramMessage, buildOrderMessage } = require('../utils/telegram');
const { getSetting } = require('../utils/settings');

const VALID_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

function registerOrderRoutes(router) {
    // ----- Yangi buyurtma yaratish -----
    router.post('/api/orders', async (req, res) => {
        let body;
        try {
            body = await readJsonBody(req);
        } catch (err) {
            return sendError(res, 400, err.message);
        }

        const { customer_name, customer_email, customer_phone, customer_address, items, notes } = body;

        if (!customer_name || !customer_name.trim()) return sendError(res, 400, 'Mijoz ismi kiritilishi shart');
        if (!customer_phone || !customer_phone.trim()) return sendError(res, 400, 'Telefon raqam kiritilishi shart');
        if (!Array.isArray(items) || items.length === 0) return sendError(res, 400, "Savat bo'sh bo'lishi mumkin emas");

        // Har bir mahsulotni bazadan tekshirib, haqiqiy narxni olamiz (klient narxiga ishonmaymiz)
        let total = 0;
        const resolvedItems = [];
        for (const item of items) {
            const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.id ?? item.product_id);
            const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

            if (product) {
                total += product.price * quantity;
                resolvedItems.push({ product_id: product.id, product_name: product.name, price: product.price, quantity });
            } else {
                // Agar mahsulot bazada topilmasa ham, klient yuborgan nom/narxni saqlaymiz (fallback)
                const price = parseInt(item.price, 10) || 0;
                total += price * quantity;
                resolvedItems.push({ product_id: null, product_name: item.name || "Noma'lum mahsulot", price, quantity });
            }
        }

        // Foydalanuvchi tizimga kirgan bo'lsa, order'ni unga bog'laymiz
        const token = extractToken(req);
        const user = getUserByToken(token);

        let orderId;
        db.exec('BEGIN');
        try {
            const result = db.prepare(`
                INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, customer_address, total, notes, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
            `).run(
                user ? user.id : null,
                customer_name.trim(),
                customer_email || (user ? user.email : null) || '',
                customer_phone.trim(),
                customer_address || null,
                total,
                notes || null
            );
            orderId = result.lastInsertRowid;

            const insertItem = db.prepare(`
                INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
                VALUES (?, ?, ?, ?, ?)
            `);
            for (const item of resolvedItems) {
                insertItem.run(orderId, item.product_id, item.product_name, item.price, item.quantity);
            }
            db.exec('COMMIT');
        } catch (err) {
            db.exec('ROLLBACK');
            return sendError(res, 500, "Buyurtmani saqlashda xatolik: " + err.message);
        }

        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
        order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

        // Telegram'ga yuborish (fon vazifasi - javobni kutdirmaymiz)
        const botToken = getSetting('telegram_bot_token');
        const chatId = getSetting('telegram_chat_id');
        if (botToken && chatId) {
            const message = buildOrderMessage(order);
            sendTelegramMessage(botToken, chatId, message).then((result) => {
                const sentFlag = result.ok ? 1 : 0;
                db.prepare('UPDATE orders SET telegram_sent = ? WHERE id = ?').run(sentFlag, orderId);
            });
        }

        sendJson(res, 201, { ok: true, order });
    });

    // ----- O'z buyurtmalarim -----
    router.get('/api/orders/my', async (req, res) => {
        const token = extractToken(req);
        const user = getUserByToken(token);
        if (!user) return sendError(res, 401, 'Tizimga kirish talab qilinadi');

        const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
        for (const order of orders) {
            order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
        }
        sendJson(res, 200, { ok: true, orders });
    });

    // ----- Admin: barcha buyurtmalar -----
    router.get('/api/admin/orders', requireAdmin(async (req, res) => {
        const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
        for (const order of orders) {
            order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
        }
        sendJson(res, 200, { ok: true, orders });
    }));

    // ----- Admin: statusni o'zgartirish -----
    router.put('/api/admin/orders/:id', requireAdmin(async (req, res, ctx) => {
        const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(ctx.params.id);
        if (!existing) return sendError(res, 404, 'Buyurtma topilmadi');

        let body;
        try {
            body = await readJsonBody(req);
        } catch (err) {
            return sendError(res, 400, err.message);
        }

        const { status } = body;
        if (!VALID_STATUSES.includes(status)) {
            return sendError(res, 400, `Status quyidagilardan biri bo'lishi kerak: ${VALID_STATUSES.join(', ')}`);
        }

        db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, ctx.params.id);
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(ctx.params.id);
        order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

        sendJson(res, 200, { ok: true, order });
    }));
}

module.exports = { registerOrderRoutes };

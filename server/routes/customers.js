// ===== ATLAS FLOWERS - Mijozlar API (faqat admin) =====
// GET /api/admin/customers        - Barcha mijozlar ro'yxati
// GET /api/admin/customers/:id    - Bitta mijoz va uning buyurtmalari

const db = require('../db/connection');
const { sendJson, sendError } = require('../utils/http');
const { requireAdmin } = require('../utils/middleware');

function registerCustomerRoutes(router) {
    router.get('/api/admin/customers', requireAdmin(async (req, res) => {
        const customers = db.prepare(`
            SELECT
                u.id, u.name, u.email, u.phone, u.created_at,
                COUNT(o.id) AS orders_count,
                COALESCE(SUM(o.total), 0) AS total_spent
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id
            WHERE u.role = 'customer'
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `).all();

        sendJson(res, 200, { ok: true, customers });
    }));

    router.get('/api/admin/customers/:id', requireAdmin(async (req, res, ctx) => {
        const customer = db.prepare('SELECT id, name, email, phone, created_at FROM users WHERE id = ? AND role = ?').get(ctx.params.id, 'customer');
        if (!customer) return sendError(res, 404, 'Mijoz topilmadi');

        const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(ctx.params.id);
        for (const order of orders) {
            order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
        }

        sendJson(res, 200, { ok: true, customer: { ...customer, orders } });
    }));
}

module.exports = { registerCustomerRoutes };

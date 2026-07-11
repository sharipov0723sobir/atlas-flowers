// ===== ATLAS FLOWERS - Dashboard Statistikasi (faqat admin) =====
// GET /api/admin/dashboard - Umumiy statistika, so'nggi kunlik buyurtmalar, top mahsulotlar

const db = require('../db/connection');
const { sendJson } = require('../utils/http');
const { requireAdmin } = require('../utils/middleware');

function registerDashboardRoutes(router) {
    router.get('/api/admin/dashboard', requireAdmin(async (req, res) => {
        const totalOrders = db.prepare('SELECT COUNT(*) AS count FROM orders').get().count;
        const totalRevenue = db.prepare("SELECT COALESCE(SUM(total), 0) AS sum FROM orders WHERE status != 'cancelled'").get().sum;
        const totalCustomers = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'").get().count;
        const totalProducts = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
        const pendingOrders = db.prepare("SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'").get().count;

        // So'nggi 7 kunlik buyurtmalar soni (kun bo'yicha)
        const dailyOrders = db.prepare(`
            SELECT date(created_at) AS day, COUNT(*) AS count
            FROM orders
            WHERE created_at >= datetime('now', '-7 days')
            GROUP BY day
            ORDER BY day ASC
        `).all();

        // Eng ko'p sotilgan mahsulotlar (top 5)
        const topProducts = db.prepare(`
            SELECT product_name AS name, SUM(quantity) AS total_sold
            FROM order_items
            GROUP BY product_name
            ORDER BY total_sold DESC
            LIMIT 5
        `).all();

        sendJson(res, 200, {
            ok: true,
            stats: {
                totalOrders,
                totalRevenue,
                totalCustomers,
                totalProducts,
                pendingOrders,
                dailyOrders,
                topProducts,
            },
        });
    }));
}

module.exports = { registerDashboardRoutes };

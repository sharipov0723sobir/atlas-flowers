// ===== ATLAS FLOWERS - Mahsulotlar API =====
// GET    /api/products         - Faol mahsulotlar ro'yxati (ochiq)
// GET    /api/products/:id     - Bitta mahsulot (ochiq)
// POST   /api/products         - Yangi mahsulot qo'shish (faqat admin)
// PUT    /api/products/:id     - Mahsulotni tahrirlash (faqat admin)
// DELETE /api/products/:id     - Mahsulotni o'chirish (faqat admin)

const db = require('../db/connection');
const { sendJson, sendError, readJsonBody } = require('../utils/http');
const { requireAdmin } = require('../utils/middleware');

function registerProductRoutes(router) {
    // Ochiq: faqat faol mahsulotlarni ko'rsatadi
    router.get('/api/products', async (req, res) => {
        const products = db.prepare("SELECT * FROM products WHERE status = 'active' ORDER BY id ASC").all();
        sendJson(res, 200, { ok: true, products });
    });

    // Admin: barcha mahsulotlarni ko'rsatadi (nofaollarni ham)
    router.get('/api/admin/products', requireAdmin(async (req, res) => {
        const products = db.prepare('SELECT * FROM products ORDER BY id ASC').all();
        sendJson(res, 200, { ok: true, products });
    }));

    router.get('/api/products/:id', async (req, res, ctx) => {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(ctx.params.id);
        if (!product) return sendError(res, 404, 'Mahsulot topilmadi');
        sendJson(res, 200, { ok: true, product });
    });

    router.post('/api/admin/products', requireAdmin(async (req, res) => {
        let body;
        try {
            body = await readJsonBody(req);
        } catch (err) {
            return sendError(res, 400, err.message);
        }

        const { name, price, old_price, category, description, badge, image_class, status } = body;
        if (!name || !name.trim()) return sendError(res, 400, "Mahsulot nomi kiritilishi shart");
        if (!price || price <= 0) return sendError(res, 400, "Narx to'g'ri kiritilishi kerak");
        if (!category) return sendError(res, 400, 'Kategoriya tanlanishi shart');

        const result = db.prepare(`
            INSERT INTO products (name, price, old_price, category, description, badge, image_class, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            name.trim(),
            price,
            old_price || null,
            category,
            description || '',
            badge || null,
            image_class || 'rose-bg',
            status || 'active'
        );

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
        sendJson(res, 201, { ok: true, product });
    }));

    router.put('/api/admin/products/:id', requireAdmin(async (req, res, ctx) => {
        const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(ctx.params.id);
        if (!existing) return sendError(res, 404, 'Mahsulot topilmadi');

        let body;
        try {
            body = await readJsonBody(req);
        } catch (err) {
            return sendError(res, 400, err.message);
        }

        const fields = ['name', 'price', 'old_price', 'category', 'description', 'badge', 'image_class', 'status'];
        const updates = {};
        for (const field of fields) {
            updates[field] = body[field] !== undefined ? body[field] : existing[field];
        }

        db.prepare(`
            UPDATE products SET
                name = ?, price = ?, old_price = ?, category = ?, description = ?, badge = ?, image_class = ?, status = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `).run(
            updates.name, updates.price, updates.old_price, updates.category,
            updates.description, updates.badge, updates.image_class, updates.status,
            ctx.params.id
        );

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(ctx.params.id);
        sendJson(res, 200, { ok: true, product });
    }));

    router.delete('/api/admin/products/:id', requireAdmin(async (req, res, ctx) => {
        const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(ctx.params.id);
        if (!existing) return sendError(res, 404, 'Mahsulot topilmadi');

        db.prepare('DELETE FROM products WHERE id = ?').run(ctx.params.id);
        sendJson(res, 200, { ok: true, message: "Mahsulot o'chirildi" });
    }));
}

module.exports = { registerProductRoutes };

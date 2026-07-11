// ===== ATLAS FLOWERS - Database Schema =====

const db = require('./connection');

function initSchema() {
    // Foydalanuvchilar (mijozlar va adminlar)
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password_hash TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);

    // Sessiyalar (login token'lari)
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    // Mahsulotlar
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            old_price INTEGER,
            category TEXT NOT NULL,
            description TEXT,
            badge TEXT,
            image_class TEXT DEFAULT 'rose-bg',
            rating REAL DEFAULT 5,
            reviews INTEGER DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);

    // Buyurtmalar
    db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_address TEXT,
            total INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'cancelled')),
            notes TEXT,
            telegram_sent INTEGER DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );
    `);

    // Buyurtma tarkibidagi mahsulotlar
    db.exec(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER,
            product_name TEXT NOT NULL,
            price INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        );
    `);

    // Sayt sozlamalari (Telegram token, do'kon ma'lumotlari va h.k.)
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    `);

    // Tezkor qidiruv uchun indekslar
    db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`);

    console.log('✅ Database schema tayyor');
}

module.exports = { initSchema };

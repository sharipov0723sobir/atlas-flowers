// ===== ATLAS FLOWERS - Boshlang'ich ma'lumotlarni yuklash (seed) =====

const db = require('./connection');
const { initSchema } = require('./schema');
const { hashPassword } = require('../utils/auth');

const DEFAULT_PRODUCTS = [
    { name: "Romantik Atirgul Buketi", price: 350000, old_price: null, category: "roses premium", description: "15 ta qizil premium atirgul, nozik qadoqlash bilan. Sevgi va muhabbat ramzi.", badge: "top", image_class: "rose-bg", rating: 5, reviews: 48 },
    { name: "Bahor Lolalari", price: 280000, old_price: null, category: "tulips mixed", description: "25 ta rang-barang lola, bahorning go'zalligi.", badge: "new", image_class: "tulip-bg", rating: 4, reviews: 32 },
    { name: "Oq Liliya Kompozitsiyasi", price: 420000, old_price: null, category: "lilies premium", description: "Premium oq liliyalar va yashil, nafis kompozitsiya.", badge: null, image_class: "orchid-bg", rating: 5, reviews: 56 },
    { name: "Quyosh Nuri", price: 240000, old_price: 300000, category: "mixed holiday", description: "Sariq atirgul va kungaboqar, quvonch ramzi.", badge: "sale", image_class: "sunflower-bg", rating: 4.5, reviews: 41 },
    { name: "Binafsha Orzular", price: 310000, old_price: null, category: "mixed premium", description: "Eustoma va pushti atirgullar, romantik kompozitsiya.", badge: null, image_class: "lavender-bg", rating: 5, reviews: 39 },
    { name: "Hashamatli Quti", price: 650000, old_price: null, category: "roses premium", description: "101 ta premium atirgul hashamatli qutida. Unutilmas sovg'a.", badge: "vip", image_class: "luxury-bg", rating: 5, reviews: 64 },
];

const DEFAULT_SETTINGS = {
    shop_name: 'ATLAS FLOWERS',
    shop_phone: '+998 90 123 45 67',
    shop_email: 'info@atlasflowers.uz',
    shop_address: "Toshkent sh., Amir Temur ko'chasi, 108",
    delivery_price: '0',
    free_delivery_threshold: '500000',
    delivery_time: '2-3 soat',
    telegram_bot_token: '',
    telegram_chat_id: '',
};

function seed() {
    initSchema();

    // ----- Mahsulotlarni yuklash (faqat bo'sh bo'lsa) -----
    const productCount = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
    if (productCount === 0) {
        const insert = db.prepare(`
            INSERT INTO products (name, price, old_price, category, description, badge, image_class, rating, reviews, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `);
        for (const p of DEFAULT_PRODUCTS) {
            insert.run(p.name, p.price, p.old_price, p.category, p.description, p.badge, p.image_class, p.rating, p.reviews);
        }
        console.log(`✅ ${DEFAULT_PRODUCTS.length} ta mahsulot qo'shildi`);
    } else {
        console.log(`ℹ️  Mahsulotlar allaqachon mavjud (${productCount} ta), o'tkazib yuborildi`);
    }

    // ----- Sozlamalarni yuklash -----
    const upsertSetting = db.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO NOTHING
    `);
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        upsertSetting.run(key, value);
    }
    console.log('✅ Sozlamalar tayyor');

    // ----- Admin hisobini yaratish (faqat mavjud bo'lmasa) -----
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@atlasflowers.uz';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
    if (!existingAdmin) {
        const { hash, salt } = hashPassword(adminPassword);
        db.prepare(`
            INSERT INTO users (name, email, phone, password_hash, password_salt, role)
            VALUES (?, ?, ?, ?, ?, 'admin')
        `).run('Administrator', adminEmail, '+998900000000', hash, salt);
        console.log(`✅ Admin hisobi yaratildi: ${adminEmail} / ${adminPassword}`);
        console.log('⚠️  Ishga tushirgandan keyin parolni albatta o\'zgartiring!');
    } else {
        console.log(`ℹ️  Admin hisobi allaqachon mavjud: ${adminEmail}`);
    }

    console.log('🌹 Seed muvaffaqiyatli yakunlandi!');
}

// To'g'ridan-to'g'ri ishga tushirilganda
if (require.main === module) {
    seed();
}

module.exports = { seed };

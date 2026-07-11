// ===== ATLAS FLOWERS - Backend Server =====
// Zero-dependency: faqat Node.js built-in modullar (http, node:sqlite, crypto, https, fs, path)
// Ishga tushirish: NODE_OPTIONS="" node --experimental-sqlite index.js

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

// .env faylini yuklash (agar mavjud bo'lsa) - tashqi paketsiz oddiy parser
loadEnvFile();

const Router = require('./utils/router');
const { sendJson, sendError } = require('./utils/http');
const { seed } = require('./db/seed');

const { registerAuthRoutes } = require('./routes/auth');
const { registerProductRoutes } = require('./routes/products');
const { registerOrderRoutes } = require('./routes/orders');
const { registerCustomerRoutes } = require('./routes/customers');
const { registerSettingsRoutes } = require('./routes/settings');
const { registerDashboardRoutes } = require('./routes/dashboard');

const PORT = process.env.PORT || 3000;
const SITE_ROOT = path.join(__dirname, '..'); // Asosiy sayt fayllari (index.html, admin.html, va h.k.) shu papkada

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
};

// Statik fayl sifatida serve qilish mumkin bo'lgan fayllar/papkalar ro'yxati (xavfsizlik uchun cheklangan)
const ALLOWED_STATIC_FILES = new Set([
    'index.html', 'admin.html', 'styles.css', 'admin-styles.css',
    'script.js', 'admin-script.js', 'atlas-pattern.svg', 'README.md',
]);

// ----- Database'ni tayyorlash (schema + seed) -----
seed();

// ----- Router'ni tuzish -----
const router = new Router();
registerAuthRoutes(router);
registerProductRoutes(router);
registerOrderRoutes(router);
registerCustomerRoutes(router);
registerSettingsRoutes(router);
registerDashboardRoutes(router);

// ----- HTTP Server -----
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);

    // CORS (frontend boshqa portda ochilsa ham ishlashi uchun)
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // ----- API so'rovlari -----
    if (pathname.startsWith('/api/')) {
        try {
            const handled = await router.dispatch(req, res, pathname, {});
            if (!handled) sendError(res, 404, 'API endpoint topilmadi');
        } catch (err) {
            console.error('Server xatosi:', err);
            if (!res.headersSent) sendError(res, 500, 'Ichki server xatosi');
        }
        return;
    }

    // ----- Statik fayllar (frontend) -----
    serveStatic(req, res, pathname);
});

function serveStatic(req, res, pathname) {
    let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');

    // Xavfsizlik: yo'l bo'ylab chiqishga (path traversal) yo'l qo'ymaymiz
    const safeName = path.basename(relativePath);
    if (!ALLOWED_STATIC_FILES.has(safeName)) {
        sendError(res, 404, 'Sahifa topilmadi');
        return;
    }

    const filePath = path.join(SITE_ROOT, safeName);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            sendError(res, 404, 'Fayl topilmadi');
            return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
    });
}

/**
 * .env faylini o'qib, process.env'ga yuklaydi (tashqi paketsiz, oddiy KEY=VALUE parser)
 */
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const idx = trimmed.indexOf('=');
        if (idx === -1) return;
        const key = trimmed.slice(0, idx).trim();
        let value = trimmed.slice(idx + 1).trim();
        // Qo'shtirnoqlarni olib tashlash
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
    });
}

server.listen(PORT, () => {
    console.log('');
    console.log('🌹 ========================================');
    console.log('   ATLAS FLOWERS - Backend Server');
    console.log('   ========================================');
    console.log(`   ✅ Server ishga tushdi: http://localhost:${PORT}`);
    console.log(`   🛍️  Asosiy sayt:        http://localhost:${PORT}/`);
    console.log(`   🔐 Admin panel:        http://localhost:${PORT}/admin.html`);
    console.log(`   📡 API bazasi:         http://localhost:${PORT}/api/`);
    console.log('   ========================================');
    console.log('');
});

module.exports = server;

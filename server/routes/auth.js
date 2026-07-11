// ===== ATLAS FLOWERS - Auth API =====
// POST /api/auth/register  - Ro'yxatdan o'tish
// POST /api/auth/login     - Kirish
// POST /api/auth/logout    - Chiqish
// GET  /api/auth/me        - Joriy foydalanuvchi ma'lumoti

const db = require('../db/connection');
const { hashPassword, verifyPassword } = require('../utils/auth');
const { createSession, getUserByToken, destroySession } = require('../utils/session');
const { sendJson, sendError, readJsonBody, extractToken, setSessionCookie, clearSessionCookie } = require('../utils/http');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function register(router) {
    router.post('/api/auth/register', async (req, res) => {
        let body;
        try {
            body = await readJsonBody(req);
        } catch (err) {
            return sendError(res, 400, err.message);
        }

        const { name, email, phone, password } = body;

        if (!name || !name.trim()) return sendError(res, 400, "Ism kiritilishi shart");
        if (!email || !EMAIL_REGEX.test(email)) return sendError(res, 400, "Email noto'g'ri formatda");
        if (!password || password.length < 6) return sendError(res, 400, "Parol kamida 6 belgidan iborat bo'lishi kerak");

        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
        if (existing) return sendError(res, 409, "Bu email bilan foydalanuvchi allaqachon mavjud");

        const { hash, salt } = hashPassword(password);

        const result = db.prepare(`
            INSERT INTO users (name, email, phone, password_hash, password_salt, role)
            VALUES (?, ?, ?, ?, ?, 'customer')
        `).run(name.trim(), email.toLowerCase(), phone || null, hash, salt);

        const token = createSession(result.lastInsertRowid);
        setSessionCookie(res, token);

        sendJson(res, 201, {
            ok: true,
            token,
            user: { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase(), phone: phone || null, role: 'customer' },
        });
    });
}

function login(router) {
    router.post('/api/auth/login', async (req, res) => {
        let body;
        try {
            body = await readJsonBody(req);
        } catch (err) {
            return sendError(res, 400, err.message);
        }

        const { email, password } = body;
        if (!email || !password) return sendError(res, 400, "Email va parol kiritilishi shart");

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
        if (!user) return sendError(res, 401, "Email yoki parol xato");

        const valid = verifyPassword(password, user.password_salt, user.password_hash);
        if (!valid) return sendError(res, 401, "Email yoki parol xato");

        const token = createSession(user.id);
        setSessionCookie(res, token);

        sendJson(res, 200, {
            ok: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
        });
    });
}

function logout(router) {
    router.post('/api/auth/logout', async (req, res) => {
        const token = extractToken(req);
        destroySession(token);
        clearSessionCookie(res);
        sendJson(res, 200, { ok: true });
    });
}

function me(router) {
    router.get('/api/auth/me', async (req, res) => {
        const token = extractToken(req);
        const user = getUserByToken(token);
        if (!user) return sendError(res, 401, "Tizimga kirilmagan");
        sendJson(res, 200, { ok: true, user });
    });
}

function registerAuthRoutes(router) {
    register(router);
    login(router);
    logout(router);
    me(router);
}

module.exports = { registerAuthRoutes };

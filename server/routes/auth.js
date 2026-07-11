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
// Login (username): harflar, raqamlar, "_", "." — kamida 3 belgi
const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,30}$/;

function register(router) {
    router.post('/api/auth/register', async (req, res) => {
        let body;
        try {
            body = await readJsonBody(req);
        } catch (err) {
            return sendError(res, 400, err.message);
        }

        const { name, email, username, phone, password } = body;

        if (!name || !name.trim()) return sendError(res, 400, "Ism kiritilishi shart");
        if (!password || password.length < 6) return sendError(res, 400, "Parol kamida 6 belgidan iborat bo'lishi kerak");

        const hasEmail = email && email.trim();
        const hasUsername = username && username.trim();
        if (!hasEmail && !hasUsername) return sendError(res, 400, "Email yoki login kiritilishi shart");
        if (hasEmail && !EMAIL_REGEX.test(email)) return sendError(res, 400, "Email noto'g'ri formatda");
        if (hasUsername && !USERNAME_REGEX.test(username)) return sendError(res, 400, "Login kamida 3 belgidan iborat bo'lishi va faqat harf/raqam/._ dan tashkil topishi kerak");

        if (hasEmail) {
            const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
            if (existingEmail) return sendError(res, 409, "Bu email bilan foydalanuvchi allaqachon mavjud");
        }
        if (hasUsername) {
            const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
            if (existingUsername) return sendError(res, 409, "Bu login bilan foydalanuvchi allaqachon mavjud");
        }

        const { hash, salt } = hashPassword(password);

        const result = db.prepare(`
            INSERT INTO users (name, username, email, phone, password_hash, password_salt, role)
            VALUES (?, ?, ?, ?, ?, ?, 'customer')
        `).run(name.trim(), hasUsername ? username.trim() : null, hasEmail ? email.toLowerCase() : null, phone || null, hash, salt);

        const token = createSession(result.lastInsertRowid);
        setSessionCookie(res, token);

        sendJson(res, 201, {
            ok: true,
            token,
            user: {
                id: result.lastInsertRowid,
                name: name.trim(),
                username: hasUsername ? username.trim() : null,
                email: hasEmail ? email.toLowerCase() : null,
                phone: phone || null,
                role: 'customer',
            },
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

        // "login" maydoni email yoki username bo'lishi mumkin (eski "email" maydoni bilan ham moslashuvchan)
        const identifier = (body.login || body.username || body.email || '').trim();
        const { password } = body;

        if (!identifier || !password) return sendError(res, 400, "Login (yoki email) va parol kiritilishi shart");

        const isEmail = identifier.includes('@');
        const user = isEmail
            ? db.prepare('SELECT * FROM users WHERE email = ?').get(identifier.toLowerCase())
            : db.prepare('SELECT * FROM users WHERE username = ?').get(identifier);

        if (!user) return sendError(res, 401, "Login/email yoki parol xato");

        const valid = verifyPassword(password, user.password_salt, user.password_hash);
        if (!valid) return sendError(res, 401, "Login/email yoki parol xato");

        const token = createSession(user.id);
        setSessionCookie(res, token);

        sendJson(res, 200, {
            ok: true,
            token,
            user: { id: user.id, name: user.name, username: user.username, email: user.email, phone: user.phone, role: user.role },
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

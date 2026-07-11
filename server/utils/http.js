// ===== ATLAS FLOWERS - HTTP Yordamchi Funksiyalar =====
// Node.js built-in http moduli bilan ishlash uchun kichik yordamchilar

/**
 * JSON javobni yuboradi
 */
function sendJson(res, statusCode, data) {
    const body = JSON.stringify(data);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
    });
    res.end(body);
}

function sendError(res, statusCode, message) {
    sendJson(res, statusCode, { ok: false, error: message });
}

/**
 * So'rov tanasini (body) o'qiydi va JSON qilib qaytaradi
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<object>}
 */
function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let raw = '';
        let size = 0;
        const MAX_SIZE = 2 * 1024 * 1024; // 2MB limit

        req.on('data', (chunk) => {
            size += chunk.length;
            if (size > MAX_SIZE) {
                reject(new Error('So\'rov tanasi juda katta'));
                req.destroy();
                return;
            }
            raw += chunk;
        });

        req.on('end', () => {
            if (!raw) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(raw));
            } catch (err) {
                reject(new Error('JSON formatida xatolik'));
            }
        });

        req.on('error', reject);
    });
}

/**
 * Cookie header'ini obyektga aylantiradi
 * @param {string} cookieHeader
 * @returns {Record<string,string>}
 */
function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(';').forEach((pair) => {
        const idx = pair.indexOf('=');
        if (idx === -1) return;
        const key = pair.slice(0, idx).trim();
        const value = pair.slice(idx + 1).trim();
        cookies[key] = decodeURIComponent(value);
    });
    return cookies;
}

/**
 * So'rovdan sessiya tokenini oladi (Cookie yoki Authorization: Bearer)
 */
function extractToken(req) {
    const cookies = parseCookies(req.headers['cookie']);
    if (cookies.atlas_session) return cookies.atlas_session;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    return null;
}

/**
 * Sessiya cookie'sini o'rnatadi (HttpOnly, 7 kun)
 */
function setSessionCookie(res, token) {
    const maxAge = 7 * 24 * 60 * 60; // 7 kun (soniyada)
    res.setHeader('Set-Cookie', `atlas_session=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`);
}

/**
 * Sessiya cookie'sini tozalaydi (logout)
 */
function clearSessionCookie(res) {
    res.setHeader('Set-Cookie', 'atlas_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
}

module.exports = {
    sendJson,
    sendError,
    readJsonBody,
    parseCookies,
    extractToken,
    setSessionCookie,
    clearSessionCookie,
};

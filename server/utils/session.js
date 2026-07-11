// ===== ATLAS FLOWERS - Sessiya Boshqaruvi =====

const db = require('../db/connection');
const { generateToken, expiryDate } = require('./auth');

/**
 * Foydalanuvchi uchun yangi sessiya yaratadi
 * @param {number} userId
 * @returns {string} token
 */
function createSession(userId) {
    const token = generateToken();
    const expiresAt = expiryDate(7);
    db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
    return token;
}

/**
 * Tokenga mos foydalanuvchini topadi (agar sessiya amal qilsa)
 * @param {string} token
 * @returns {object|null} user (parolsiz)
 */
function getUserByToken(token) {
    if (!token) return null;

    const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
    if (!session) return null;

    if (new Date(session.expires_at) < new Date()) {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
        return null;
    }

    const user = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(session.user_id);
    return user || null;
}

/**
 * Sessiyani o'chiradi (logout)
 * @param {string} token
 */
function destroySession(token) {
    if (!token) return;
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

/**
 * Muddati o'tgan sessiyalarni tozalaydi
 */
function cleanupExpiredSessions() {
    db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
}

module.exports = {
    createSession,
    getUserByToken,
    destroySession,
    cleanupExpiredSessions,
};

// ===== ATLAS FLOWERS - Auth Utility =====
// Parolni xavfsiz hash qilish (crypto.pbkdf2) va sessiya tokenlari

const crypto = require('node:crypto');

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';

/**
 * Parolni tuz (salt) bilan hash qiladi
 * @param {string} password - Oddiy matndagi parol
 * @returns {{hash: string, salt: string}}
 */
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
        .toString('hex');
    return { hash, salt };
}

/**
 * Kiritilgan parolni saqlangan hash bilan solishtiradi
 * @param {string} password - Kiritilgan parol
 * @param {string} salt - Saqlangan tuz
 * @param {string} storedHash - Saqlangan hash
 * @returns {boolean}
 */
function verifyPassword(password, salt, storedHash) {
    const hash = crypto
        .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
        .toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

/**
 * Xavfsiz tasodifiy sessiya tokeni yaratadi
 * @returns {string}
 */
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Berilgan kun sonidan keyingi ISO vaqtni qaytaradi
 * @param {number} days
 * @returns {string}
 */
function expiryDate(days = 7) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    expiryDate,
};

// ===== ATLAS FLOWERS - Sozlamalar Utility =====

const db = require('../db/connection');

/**
 * Bitta sozlama qiymatini oladi
 * @param {string} key
 * @returns {string|null}
 */
function getSetting(key) {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : null;
}

/**
 * Barcha sozlamalarni obyekt sifatida qaytaradi
 * @returns {Record<string,string>}
 */
function getAllSettings() {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const result = {};
    for (const row of rows) result[row.key] = row.value;
    return result;
}

/**
 * Bitta sozlama qiymatini o'rnatadi (mavjud bo'lmasa, yaratadi)
 * @param {string} key
 * @param {string} value
 */
function setSetting(key, value) {
    db.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(key, String(value ?? ''));
}

/**
 * Bir nechta sozlamani birdan o'rnatadi
 * @param {Record<string,string>} pairs
 */
function setSettings(pairs) {
    for (const [key, value] of Object.entries(pairs)) {
        setSetting(key, value);
    }
}

module.exports = { getSetting, getAllSettings, setSetting, setSettings };

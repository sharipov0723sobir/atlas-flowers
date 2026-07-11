// ===== ATLAS FLOWERS - Database ulanishi =====
// Node.js built-in node:sqlite moduli ishlatiladi (tashqi paket kerak emas)

const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '..', 'data', 'atlas-flowers.db');

const db = new DatabaseSync(DB_PATH);

// Ishonchlilik va tezlik uchun sozlamalar
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

module.exports = db;

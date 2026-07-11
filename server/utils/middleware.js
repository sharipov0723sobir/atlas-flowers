// ===== ATLAS FLOWERS - Middleware Yordamchilari =====

const { getUserByToken } = require('./session');
const { extractToken, sendError } = require('./http');

/**
 * So'rovdan foydalanuvchini aniqlaydi va ctx.user'ga qo'yadi.
 * Agar sessiya yo'q bo'lsa, ctx.user = null bo'ladi (xato qaytarmaydi).
 */
function attachUser(req) {
    const token = extractToken(req);
    return getUserByToken(token);
}

/**
 * Handler'ni faqat tizimga kirgan foydalanuvchilar uchun himoyalaydi
 */
function requireAuth(handler) {
    return async (req, res, ctx) => {
        const user = attachUser(req);
        if (!user) return sendError(res, 401, "Tizimga kirish talab qilinadi");
        return handler(req, res, { ...ctx, user });
    };
}

/**
 * Handler'ni faqat admin foydalanuvchilar uchun himoyalaydi
 */
function requireAdmin(handler) {
    return async (req, res, ctx) => {
        const user = attachUser(req);
        if (!user) return sendError(res, 401, "Tizimga kirish talab qilinadi");
        if (user.role !== 'admin') return sendError(res, 403, "Faqat administrator uchun ruxsat berilgan");
        return handler(req, res, { ...ctx, user });
    };
}

module.exports = { attachUser, requireAuth, requireAdmin };

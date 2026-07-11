// ===== ATLAS FLOWERS - Yengil Router =====
// Tashqi paketsiz, :param sintaksisini qo'llab-quvvatlaydigan oddiy router

class Router {
    constructor() {
        this.routes = []; // { method, regex, keys, handler }
    }

    _register(method, path, handler) {
        const keys = [];
        const pattern = path
            .split('/')
            .map((segment) => {
                if (segment.startsWith(':')) {
                    keys.push(segment.slice(1));
                    return '([^/]+)';
                }
                return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            })
            .join('/');
        const regex = new RegExp(`^${pattern}/?$`);
        this.routes.push({ method, regex, keys, handler });
    }

    get(path, handler) { this._register('GET', path, handler); }
    post(path, handler) { this._register('POST', path, handler); }
    put(path, handler) { this._register('PUT', path, handler); }
    delete(path, handler) { this._register('DELETE', path, handler); }

    /**
     * So'rovga mos route'ni topib ishga tushiradi
     * @returns {boolean} true - route topildi va ishga tushdi, false - topilmadi
     */
    async dispatch(req, res, pathname, ctx) {
        for (const route of this.routes) {
            if (route.method !== req.method) continue;
            const match = route.regex.exec(pathname);
            if (!match) continue;

            const params = {};
            route.keys.forEach((key, i) => {
                params[key] = decodeURIComponent(match[i + 1]);
            });

            await route.handler(req, res, { ...ctx, params });
            return true;
        }
        return false;
    }
}

module.exports = Router;

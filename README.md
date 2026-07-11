# 🌹 ATLAS FLOWERS - Premium Gul Do'koni

![ATLAS FLOWERS](https://img.shields.io/badge/ATLAS-FLOWERS-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-gold?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

## 📋 Loyiha Haqida

**ATLAS FLOWERS** - bu zamonaviy va nafis premium gul do'koni uchun yaratilgan to'liq funksional veb-sayt. Sayt atlas matosidan ilhomlangan ko'k, binafsha, yashil va oltin ranglarda ishlangan.

### ✨ Asosiy Xususiyatlar

#### 🎨 Dizayn
- **Premium uslub**: Nafis va zamonaviy dizayn
- **Ranglar**: Ko'k (#2D5F9F), Binafsha (#7B5BA7), Yashil (#4A8B7C), Oltin (#D4AF37)
- **Atlas teksturasi**: Yumshoq fon animatsiyalari
- **Responsive**: Telefon, planshet va kompyuter uchun moslashtirilgan

#### 🛍️ Funksiyalar

**Mijozlar uchun:**
- ✅ Mahsulotlarni ko'rish va qidirish
- ✅ Kategoriyalar bo'yicha filtrlash (Atirgullar, Lola, Liliya, Aralash, Premium, Bayram)
- ✅ Savatcha (qo'shish, o'chirish, miqdorni o'zgartirish)
- ✅ Quick View (tezkor ko'rish)
- ✅ Wishlist (sevimlilar ro'yxati)
- ✅ Login/Ro'yxatdan o'tish
- ✅ Aloqa formasi
- ✅ Mijozlar fikrlari bo'limi
- ✅ Aksiya bannerlari
- ✅ Chegirmalar ko'rsatish

**Boshqaruv:**
- ✅ Mahsulotlar ma'lumotlar bazasi
- ✅ LocalStorage orqali ma'lumotlarni saqlash
- ✅ Xabar yuborish tizimi

## 🚀 Ishga Tushirish (Backend bilan)

Loyiha endi **to'liq ishlaydigan backend** bilan keladi: SQLite ma'lumotlar bazasi, autentifikatsiya, buyurtmalar API va server-side Telegram integratsiyasi. Tashqi npm paketlar talab qilinmaydi — faqat Node.js'ning built-in modullari ishlatiladi.

### Talablar
- **Node.js 22.5+** (`node:sqlite` moduli uchun kerak)

### O'rnatish va ishga tushirish

```bash
# 1. Repositoryni klonlash
git clone https://github.com/sharipov0723sobir/atlas-flowers.git
cd atlas-flowers/server

# 2. (ixtiyoriy) Muhit o'zgaruvchilarini sozlash
cp .env.example .env
# .env faylini ochib ADMIN_USERNAME, ADMIN_PASSWORD, PORT qiymatlarini o'zgartiring

# 3. Serverni ishga tushirish
node --experimental-sqlite index.js
# yoki: npm start
```

Server birinchi marta ishga tushganda avtomatik:
- SQLite ma'lumotlar bazasini yaratadi (`server/data/atlas-flowers.db`)
- 6 ta namunaviy mahsulotni qo'shadi
- Admin hisobini yaratadi: **Login: `Sobir0980` / Parol: `admin1234`** (`.env` orqali o'zgartiriladi)

> ℹ️ Admin panelga kirish endi **email emas, login (username)** orqali amalga oshiriladi. Oddiy mijozlar esa xohlasa email, xohlasa login bilan ro'yxatdan o'tishi mumkin.

### Saytni ochish

| Sahifa | URL |
|---|---|
| 🛍️ Asosiy sayt | http://localhost:3000/ |
| 🔐 Admin panel | http://localhost:3000/admin.html |
| 📡 API | http://localhost:3000/api/ |

> ⚠️ Ishga tushirgandan keyin admin parolini albatta o'zgartiring (Admin panel orqali hali parol o'zgartirish UI mavjud emas — hozircha `.env`'dagi `ADMIN_PASSWORD`ni o'zgartirib bazani qayta yarating, yoki to'g'ridan-to'g'ri bazada yangilang).

## 📁 Fayl Strukturasi

```
atlas-flowers/
│
├── index.html              # Asosiy sahifa (frontend)
├── admin.html               # Admin panel (frontend, login gate bilan)
├── styles.css               # Asosiy CSS
├── admin-styles.css         # Admin panel CSS
├── script.js                # Frontend JS (Backend API bilan ishlaydi)
├── admin-script.js          # Admin panel JS (Backend API bilan ishlaydi)
├── atlas-pattern.svg        # Ikat/atlas naqshi (fon uchun)
├── .gitignore
├── README.md
│
└── server/                  # ===== BACKEND (Node.js, zero-dependency) =====
    ├── index.js              # HTTP server kirish nuqtasi
    ├── package.json
    ├── .env.example           # Muhit o'zgaruvchilari namunasi
    ├── db/
    │   ├── connection.js      # SQLite ulanishi (node:sqlite)
    │   ├── schema.js          # Jadvallar: users, sessions, products, orders...
    │   └── seed.js            # Boshlang'ich ma'lumotlar (admin, mahsulotlar)
    ├── routes/
    │   ├── auth.js            # /api/auth/* (register, login, logout, me)
    │   ├── products.js        # /api/products, /api/admin/products
    │   ├── orders.js          # /api/orders, /api/admin/orders
    │   ├── customers.js       # /api/admin/customers
    │   ├── settings.js        # /api/settings, /api/admin/settings
    │   └── dashboard.js       # /api/admin/dashboard
    ├── utils/
    │   ├── auth.js            # Parol hash (pbkdf2), token generatsiya
    │   ├── session.js         # Sessiya yaratish/tekshirish
    │   ├── middleware.js      # requireAuth, requireAdmin
    │   ├── router.js          # Yengil HTTP router (:param bilan)
    │   ├── http.js            # JSON javob, cookie, body parser
    │   ├── settings.js        # Sozlamalarni o'qish/yozish
    │   └── telegram.js        # Telegram Bot API bilan ishlash
    └── data/                  # SQLite fayli shu yerda yaratiladi (.gitignore'da)
```

## 🎯 Sahifalar va Bo'limlar

### 1️⃣ Asosiy Sayt (index.html)
- Bosh sahifa (Hero banner)
- Mahsulotlar bo'limi (6 ta mahsulot)
- Kategoriyalar filtri
- Kolleksiyalar
- Mijozlar fikrlari
- Aloqa formasi
- Savatcha
- Login/Register

### 2️⃣ Admin Panel (admin.html)
**Dashboard:**
- Jami buyurtmalar statistikasi
- Jami daromad
- Jami mijozlar
- Eng ko'p sotilgan mahsulotlar

**Buyurtmalar:**
- Barcha buyurtmalarni ko'rish
- Status bo'yicha filtrlash
- Buyurtmani bajarish/bekor qilish
- Telegram'ga avtomatik yuborish

**Mahsulotlar:**
- Mahsulotlar ro'yxati
- Yangi mahsulot qo'shish
- Mahsulotni tahrirlash/o'chirish

**Mijozlar:**
- Ro'yxatdan o'tgan mijozlar
- Mijozlar buyurtmalari

**Telegram Bot:**
- Bot token sozlash
- Chat ID sozlash
- Test xabar yuborish
- Avtomatik buyurtma yuborish

## 📡 API Dokumentatsiyasi

Barcha so'rovlar `/api` prefiksi bilan boshlanadi. Autentifikatsiya **HttpOnly cookie** (`atlas_session`) orqali amalga oshiriladi.

### Auth (`/api/auth`)
| Method | Endpoint | Tavsif | Ruxsat |
|---|---|---|---|
| POST | `/auth/register` | Ro'yxatdan o'tish | Ochiq |
| POST | `/auth/login` | Kirish | Ochiq |
| POST | `/auth/logout` | Chiqish | Ochiq |
| GET | `/auth/me` | Joriy foydalanuvchi | Login talab |

### Mahsulotlar (`/api/products`)
| Method | Endpoint | Tavsif | Ruxsat |
|---|---|---|---|
| GET | `/products` | Faol mahsulotlar ro'yxati | Ochiq |
| GET | `/products/:id` | Bitta mahsulot | Ochiq |
| GET | `/admin/products` | Barcha mahsulotlar (nofaollar ham) | Admin |
| POST | `/admin/products` | Yangi mahsulot qo'shish | Admin |
| PUT | `/admin/products/:id` | Mahsulotni tahrirlash | Admin |
| DELETE | `/admin/products/:id` | Mahsulotni o'chirish | Admin |

### Buyurtmalar (`/api/orders`)
| Method | Endpoint | Tavsif | Ruxsat |
|---|---|---|---|
| POST | `/orders` | Yangi buyurtma yaratish | Ochiq |
| GET | `/orders/my` | O'z buyurtmalarim | Login talab |
| GET | `/admin/orders` | Barcha buyurtmalar | Admin |
| PUT | `/admin/orders/:id` | Statusni o'zgartirish | Admin |

### Mijozlar va Sozlamalar
| Method | Endpoint | Tavsif | Ruxsat |
|---|---|---|---|
| GET | `/admin/customers` | Mijozlar ro'yxati | Admin |
| GET | `/admin/customers/:id` | Mijoz tafsilotlari | Admin |
| GET | `/settings` | Ochiq sozlamalar (do'kon ma'lumoti) | Ochiq |
| GET | `/admin/settings` | Barcha sozlamalar (tokenlar bilan) | Admin |
| PUT | `/admin/settings` | Sozlamalarni yangilash | Admin |
| POST | `/admin/settings/telegram/test` | Test xabar yuborish | Admin |
| GET | `/admin/dashboard` | Statistika | Admin |

> 🔒 **Xavfsizlik:** Buyurtma narxi har doim serverda mahsulotlar bazasidan qayta hisoblanadi — klientdan kelgan narxga ishonilmaydi. Parollar `crypto.pbkdf2` (100,000 iteratsiya, SHA-512) bilan xeshlanadi.

## 🛒 Savatcha Funksiyalari

- Mahsulotlarni qo'shish
- Miqdorni o'zgartirish (+/-)
- Mahsulotni o'chirish
- Umumiy narxni ko'rsatish
- Buyurtma berish (backend API orqali, real vaqtda saqlanadi)
- Savat holati LocalStorage'da, lekin buyurtmalar va foydalanuvchi ma'lumotlari **serverda** saqlanadi

## 🔐 Login/Register

Backend orqali to'liq ishlaydi (SQLite'da saqlanadi, parol xavfsiz xeshlanadi):

**Login (Kirish):**
- Email
- Parol

**Register (Ro'yxatdan o'tish):**
- Ism
- Email
- Telefon
- Parol (kamida 6 belgi)

## 🎨 Ranglar va Dizayn

```css
--primary-blue: #2D5F9F      /* Asosiy ko'k */
--primary-purple: #7B5BA7    /* Asosiy binafsha */
--primary-green: #4A8B7C     /* Asosiy yashil */
--primary-gold: #D4AF37      /* Asosiy oltin */
--accent-rose: #C85A8E       /* Aksent rang */
```

## 📱 Responsive Dizayn

- **Desktop**: 1200px+
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## ⚡ Animatsiyalar

- Smooth scroll
- Fade in/out
- Hover effects
- Slide in notifications
- Gradient animations

## 🔧 Texnologiyalar

**Frontend:**
- **HTML5**: Semantik markup
- **CSS3**: Flexbox, Grid, Animations
- **JavaScript (ES6+)**: Fetch API orqali backend bilan ishlaydi
- **Font Awesome**: Ikonkalar

**Backend (zero-dependency):**
- **Node.js 22+**: HTTP server (`node:http`)
- **node:sqlite**: Ma'lumotlar bazasi (eksperimental, built-in)
- **node:crypto**: Parol xeshlash (pbkdf2), token generatsiya
- **node:https**: Telegram Bot API bilan bog'lanish
- Tashqi npm paketlar **ishlatilmagan** — butunlay Node.js standart kutubxonasi asosida

## 📱 Telegram Bot Sozlash

### 1. Bot Yaratish

1. Telegram'da **@BotFather** botiga yozing
2. `/newbot` buyrug'ini yuboring
3. Bot nomini kiriting (masalan: `ATLAS FLOWERS Bot`)
4. Bot username'ini kiriting (masalan: `atlas_flowers_bot`)
5. BotFather sizga **Token** beradi: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2. Chat ID Olish

1. Yaratgan botingizga `/start` yuboring
2. **@userinfobot** botiga o'ting
3. O'z **Chat ID**'ingizni ko'ring (masalan: `123456789`)

### 3. Admin Panelda Sozlash

1. Admin panelga kiring: http://localhost:3000/admin.html (email/parol bilan)
2. **Telegram Bot** bo'limiga o'ting
3. **Bot Token** va **Chat ID** ni kiriting
4. **Test Xabar Yuborish** tugmasini bosing (server orqali yuboriladi)
5. Telegram'da xabar kelganini tekshiring
6. **Saqlash** tugmasini bosing

> 🔒 Bot Token va Chat ID endi **faqat serverda** (SQLite bazasida) saqlanadi, brauzer LocalStorage'ida emas — bu tokenning oshkor bo'lib qolishining oldini oladi.

### 4. Avtomatik Buyurtmalar

Mijoz saytda "Buyurtma berish" tugmasini bosганda, server:
1. Buyurtmani SQLite bazasiga yozadi
2. Narxni serverda mahsulotlar jadvalidan qayta hisoblaydi (xavfsizlik)
3. Fonda (foydalanuvchini kutdirmasdan) Telegram'ga xabar yuboradi
4. Xabar muvaffaqiyatli yuborilgan-yuborilmaganini bazaga (`telegram_sent`) belgilaydi

Xabar formati:

```
🌹 ATLAS FLOWERS - Yangi Buyurtma!

📦 Buyurtma ID: #12345
👤 Mijoz: Sardor Rahimov
📞 Telefon: +998 90 123 45 67
📧 Email: sardor@example.com

🛍️ Mahsulotlar:
• Romantik Atirgul Buketi x1 - 350,000 so'm
• Bahor Lolalari x2 - 560,000 so'm

💰 Jami: 910,000 so'm
📅 Vaqt: 2026-07-11 10:30

Mijoz bilan bog'laning va buyurtmani tasdiqlang!
```

## 🎁 Premium Funksiyalar

### Mijozlar Uchun:
✅ Aksiya bannerlari va promo kodlar
✅ Chegirmalarni ko'rsatish
✅ Top, Yangi, VIP belgilar
✅ Yulduzli reyting tizimi
✅ Xabar yuborish tizimi
✅ Scroll to top tugmasi
✅ Qidiruv funksiyasi
✅ Filter funksiyasi
✅ Savatcha (LocalStorage)
✅ Login/Register tizimi
✅ Quick View
✅ Wishlist

### Admin Panel:
✅ Login gate (faqat admin rolidagi foydalanuvchilar kirishi mumkin)
✅ Dashboard (statistika: buyurtmalar, daromad, mijozlar, top mahsulotlar)
✅ Buyurtmalarni boshqarish (status: kutilmoqda/jarayonda/bajarildi/bekor qilindi)
✅ Mahsulotlarni boshqarish (qo'shish/tahrirlash/o'chirish, faol/nofaol holat)
✅ Mijozlarni ko'rish (buyurtmalar tarixi bilan)
✅ Telegram bot integratsiyasi (server-side, token xavfsiz saqlanadi)
✅ Real-time buyurtma xabarnomalar (Telegram'ga avtomatik)
✅ Test xabar yuborish
✅ Do'kon va yetkazib berish sozlamalari

### Backend Xavfsizligi:
✅ Parollar pbkdf2 (100,000 iteratsiya) bilan xeshlanadi
✅ Sessiyalar HttpOnly cookie orqali (XSS'dan himoya)
✅ Admin route'lar role-based tekshiriladi (403/401)
✅ Buyurtma narxi serverda qayta hisoblanadi (narx manipulyatsiyasidan himoya)
✅ SQL in'ektsiyasidan himoya (prepared statements)

## 🔮 Kelajakda Qo'shilishi Mumkin

- 💳 To'lov tizimi (Click, Payme, Uzcard)
- 📧 Email xabarnomalar
- 📊 Kengaytirilgan statistika (grafiklar bilan)
- 📦 Buyurtma tracking (mijoz o'z buyurtmasini kuzatishi uchun UI)
- 🎨 Real mahsulot rasmlarini yuklash (fayl upload)
- 🗺️ Xarita integratsiyasi
- 🌐 Ko'p tillilik (O'zbek, Rus, Ingliz)
- 👥 Qo'shimcha foydalanuvchi rollari (Manager, Operator)
- 📱 Mobile app (Flutter, React Native) — mavjud API bilan ishlashi mumkin
- 🤖 AI chatbot yordamchisi
- 📈 SEO optimizatsiya
- 🔑 Admin panelda parol o'zgartirish UI
- 🐳 Docker konteynerlashtirish va production deploy yo'riqnomasi

## 📞 Qo'llab-quvvatlash

Savollar yoki muammolar bo'lsa:
- 📧 Email: info@atlasflowers.uz
- 📱 Telefon: +998 90 123 45 67
- 💬 Telegram: @atlasflowers

## 📄 Litsenziya

MIT License - Bu loyihani erkin foydalanishingiz mumkin.

## 👨‍💻 Muallif

**ATLAS FLOWERS** - Premium Gul Do'koni
- 🌐 Website: [atlasflowers.uz](https://atlasflowers.uz)
- 📷 Instagram: @atlas.flowers

---

**© 2026 ATLAS FLOWERS. Barcha huquqlar himoyalangan.**

🌹 *Har bir gul – qalbdan sovg'a*

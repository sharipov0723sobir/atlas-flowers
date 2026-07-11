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

## 🚀 Ishga Tushirish

### Talablar
Saytni ishlatish uchun faqat zamonaviy veb-brauzer kerak:
- Google Chrome (tavsiya etiladi)
- Firefox
- Safari
- Edge

### O'rnatish

1. **Fayllarni yuklab oling**
```bash
# Agar Git orqali klonlasangiz
git clone [repository-url]
cd atlas-flowers
```

2. **Saytni ochish**
- `index.html` faylini brauzerde oching
- Yoki lokal server ishga tushiring:

```bash
# Python bilan
python -m http.server 8000

# Node.js bilan
npx serve
```

3. **Brauzerda oching**
```
http://localhost:8000
```

## 📁 Fayl Strukturasi

```
atlas-flowers/
│
├── index.html          # Asosiy sahifa
├── admin.html          # Admin panel
├── styles.css          # Asosiy CSS
├── admin-styles.css    # Admin panel CSS
├── script.js           # Asosiy JavaScript
├── admin-script.js     # Admin panel JavaScript
├── .gitignore          # Git sozlamalari
└── README.md           # Dokumentatsiya
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

## 🛒 Savatcha Funksiyalari

- Mahsulotlarni qo'shish
- Miqdorni o'zgartirish (+/-)
- Mahsulotni o'chirish
- Umumiy narxni ko'rsatish
- Buyurtma berish
- LocalStorage'da saqlash

## 🔐 Login/Register

**Login (Kirish):**
- Email
- Parol

**Register (Ro'yxatdan o'tish):**
- Ism
- Email
- Telefon
- Parol

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

- **HTML5**: Semantik markup
- **CSS3**: Flexbox, Grid, Animations
- **JavaScript (ES6+)**: Modern syntax
- **Font Awesome**: Ikonkalar
- **LocalStorage**: Ma'lumotlarni saqlash

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

1. `admin.html` sahifasini oching
2. **Telegram Bot** bo'limiga o'ting
3. **Bot Token** va **Chat ID** ni kiriting
4. **Test Xabar Yuborish** tugmasini bosing
5. Telegram'da xabar kelganini tekshiring
6. **Saqlash** tugmasini bosing

### 4. Avtomatik Buyurtmalar

Endi barcha buyurtmalar avtomatik ravishda Telegram'ga tushadi:

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
✅ Dashboard (statistika)
✅ Buyurtmalarni boshqarish
✅ Mahsulotlarni boshqarish
✅ Mijozlarni ko'rish
✅ Telegram bot integratsiyasi
✅ Real-time buyurtma xabarnomalar
✅ Status o'zgartirish
✅ Test xabar yuborish

## 🔮 Kelajakda Qo'shilishi Mumkin

- 🔒 Backend integratsiyasi (Node.js, PHP, Python)
- 💳 To'lov tizimi (Click, Payme, Uzcard)
- 📧 Email xabarnomalar
- 📊 Kengaytirilgan statistika
- 📦 Buyurtma tracking
- 🎨 Real mahsulot rasmlari
- 🗺️ Xarita integratsiyasi
- 🌐 Ko'p tillilik (O'zbek, Rus, Ingliz)
- 👥 Foydalanuvchi rollari (Admin, Manager, Operator)
- 📱 Mobile app (Flutter, React Native)
- 🤖 AI chatbot yordamchisi
- 📈 SEO optimizatsiya

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

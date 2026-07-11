// ===== ATLAS FLOWERS - Frontend (Backend API bilan integratsiya) =====

const API_BASE = '/api';

// Global o'zgaruvchilar
let cart = [];
let wishlist = [];
let currentUser = null;
let products = []; // Backend'dan yuklanadi

// ===== DOM ELEMENTS =====
const navMenu = document.getElementById('navMenu');
const hamburger = document.getElementById('hamburger');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const scrollTopBtn = document.getElementById('scrollTop');
const searchInput = document.getElementById('searchInput');
const productGrid = document.getElementById('productGrid');
const loginModal = document.getElementById('loginModal');
const quickViewModal = document.getElementById('quickViewModal');

// ===== API YORDAMCHI FUNKSIYA =====
async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
    });
    let data;
    try {
        data = await response.json();
    } catch (err) {
        data = { ok: false, error: 'Server javobini o\'qishda xatolik' };
    }
    if (!response.ok || data.ok === false) {
        throw new Error(data.error || 'Noma\'lum xatolik yuz berdi');
    }
    return data;
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', async () => {
    initializeApp();
    loadCartFromStorage();
    updateCartUI();

    await Promise.all([
        loadProducts(),
        checkCurrentUser(),
    ]);

    loadWishlistFromStorage();

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
});

// ===== MAHSULOTLARNI BACKEND'DAN YUKLASH =====
async function loadProducts() {
    try {
        const data = await api('/products');
        products = data.products;
        renderProducts();
    } catch (err) {
        console.error('Mahsulotlarni yuklashda xatolik:', err.message);
        if (productGrid) {
            productGrid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: var(--dark-gray);">Mahsulotlarni yuklab bo'lmadi. Server ishga tushirilganini tekshiring.</p>`;
        }
    }
}

function renderProducts() {
    if (!productGrid) return;

    productGrid.innerHTML = products.map((product) => {
        const badgeHTML = product.badge
            ? `<div class="product-badge ${product.badge}">${getBadgeText(product.badge)}</div>`
            : '';
        const oldPriceHTML = product.old_price
            ? `<span class="old-price">${formatPrice(product.old_price).replace(" so'm", '')}</span>`
            : '';
        const stars = renderStars(product.rating);

        return `
            <div class="product-card" data-category="${product.category}" data-id="${product.id}">
                <div class="product-image">
                    ${badgeHTML}
                    <div class="product-overlay">
                        <button class="btn-icon" onclick="quickView(${product.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="toggleWishlist(${product.id})">
                            <i class="${wishlist.includes(product.id) ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    <div class="placeholder-image ${product.image_class || 'rose-bg'}">
                        <i class="fas fa-rose"></i>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${escapeHtml(product.name)}</h3>
                    <div class="product-rating">${stars}<span>(${product.reviews})</span></div>
                    <p class="product-description">${escapeHtml(product.description || '')}</p>
                    <div class="product-footer">
                        <span class="product-price">${formatPrice(product.price)}</span>
                        ${oldPriceHTML}
                        <button class="btn btn-small" onclick="addToCart(${product.id}, '${escapeJs(product.name)}', ${product.price})">
                            <i class="fas fa-shopping-bag"></i> Savatga
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getBadgeText(badge) {
    const texts = { top: 'Top', new: 'Yangi', sale: getDiscountLabel(), vip: 'VIP' };
    return texts[badge] || badge;
}

function getDiscountLabel() {
    return 'Chegirma';
}

function renderStars(rating) {
    let html = '';
    for (let i = 0; i < 5; i++) {
        if (i < Math.floor(rating)) html += '<i class="fas fa-star"></i>';
        else if (i < rating) html += '<i class="fas fa-star-half-alt"></i>';
        else html += '<i class="far fa-star"></i>';
    }
    return html;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeJs(str) {
    return String(str).replace(/'/g, "\\'");
}

// ===== INITIALIZATION =====
function initializeApp() {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
        updateActiveNavLink();
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    searchInput.addEventListener('input', handleSearch);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts(this.dataset.category);
        });
    });

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

// ===== NAVIGATION =====
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ===== SEARCH & FILTER =====
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('.product-name').textContent.toLowerCase();
        const desc = card.querySelector('.product-description').textContent.toLowerCase();
        card.style.display = (name.includes(searchTerm) || desc.includes(searchTerm)) ? 'block' : 'none';
    });
}

function filterProducts(category) {
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = (category === 'all' || card.dataset.category.includes(category)) ? 'block' : 'none';
    });
}

// ===== CART FUNCTIONALITY =====
function toggleCart() {
    cartSidebar.classList.toggle('active');
}

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    updateCartUI();
    saveCartToStorage();
    showNotification(`${name} savatga qo'shildi!`);
    cartSidebar.classList.add('active');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
    saveCartToStorage();
}

function updateCartQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
            saveCartToStorage();
        }
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <p>Savatingiz bo'sh</p>
            </div>
        `;
        cartTotal.textContent = '0 so\'m';
    } else {
        let itemsHTML = '';
        let total = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            itemsHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${escapeHtml(item.name)}</div>
                        <div class="cart-item-price">${formatPrice(item.price)}</div>
                        <div class="cart-item-quantity">
                            <button onclick="updateCartQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <div class="cart-item-remove" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
            `;
        });

        cartItems.innerHTML = itemsHTML;
        cartTotal.textContent = formatPrice(total);
    }
}

function saveCartToStorage() {
    localStorage.setItem('atlasFlowersCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('atlasFlowersCart');
    if (savedCart) cart = JSON.parse(savedCart);
}

function loadWishlistFromStorage() {
    const saved = localStorage.getItem('atlasFlowersWishlist');
    if (saved) {
        wishlist = JSON.parse(saved);
        renderProducts(); // Yurak belgilarini to'g'ri holatda ko'rsatish uchun qayta chizamiz
    }
}

// ===== CHECKOUT (Backend API orqali) =====
async function checkout() {
    if (cart.length === 0) {
        showNotification('Savatingiz bo\'sh!', 'error');
        return;
    }

    if (!currentUser) {
        openLoginModal();
        showNotification('Buyurtma berish uchun tizimga kiring', 'info');
        return;
    }

    const phone = prompt('Telefon raqamingizni kiriting:', currentUser.phone || '+998 ');
    if (!phone) return;

    const address = prompt('Yetkazib berish manzilini kiriting (ixtiyoriy):', '') || '';

    try {
        const data = await api('/orders', {
            method: 'POST',
            body: JSON.stringify({
                customer_name: currentUser.name,
                customer_email: currentUser.email,
                customer_phone: phone,
                customer_address: address,
                items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
            }),
        });

        showNotification(`Buyurtma qabul qilindi! (#${data.order.id}) Tez orada siz bilan bog'lanamiz.`, 'success');

        cart = [];
        updateCartUI();
        saveCartToStorage();
        toggleCart();
    } catch (err) {
        showNotification('Buyurtma yuborishda xatolik: ' + err.message, 'error');
    }
}

// ===== WISHLIST FUNCTIONALITY =====
function toggleWishlist(id) {
    const index = wishlist.indexOf(id);
    const heartIcon = event.target.closest('.btn-icon').querySelector('i');

    if (index === -1) {
        wishlist.push(id);
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
        showNotification('Sevimlilar ro\'yxatiga qo\'shildi!');
    } else {
        wishlist.splice(index, 1);
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
        showNotification('Sevimlilar ro\'yxatidan o\'chirildi');
    }

    localStorage.setItem('atlasFlowersWishlist', JSON.stringify(wishlist));
}

// ===== QUICK VIEW MODAL =====
function quickView(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const modal = document.getElementById('quickViewModal');
    const image = document.getElementById('quickViewImage');
    const title = document.getElementById('quickViewTitle');
    const price = document.getElementById('quickViewPrice');
    const description = document.getElementById('quickViewDescription');
    const rating = document.getElementById('quickViewRating');

    image.innerHTML = `<div class="placeholder-image ${product.image_class || 'rose-bg'}"><i class="fas fa-rose"></i></div>`;
    title.textContent = product.name;
    price.textContent = formatPrice(product.price);
    description.textContent = product.description || '';
    rating.innerHTML = renderStars(product.rating) + `<span>(${product.reviews})</span>`;

    document.getElementById('quantityInput').value = 1;
    modal.classList.add('active');
    modal.dataset.productId = id;
}

function closeQuickView() {
    document.getElementById('quickViewModal').classList.remove('active');
}

function addFromQuickView() {
    const modal = document.getElementById('quickViewModal');
    const productId = parseInt(modal.dataset.productId);
    const quantity = parseInt(document.getElementById('quantityInput').value);
    const product = products.find(p => p.id === productId);

    if (product) {
        for (let i = 0; i < quantity; i++) {
            addToCart(product.id, product.name, product.price);
        }
        closeQuickView();
    }
}

function increaseQuantity() {
    const input = document.getElementById('quantityInput');
    input.value = parseInt(input.value) + 1;
}

function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
}

// ===== LOGIN/REGISTER (Backend API orqali) =====
function openLoginModal() {
    loginModal.classList.add('active');
}

function closeLoginModal() {
    loginModal.classList.remove('active');
}

function showAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const data = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        currentUser = data.user;
        showNotification(`Xush kelibsiz, ${currentUser.name}!`);
        closeLoginModal();
        updateUserUI();
        e.target.reset();
    } catch (err) {
        showNotification('Kirishda xatolik: ' + err.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const inputs = e.target.querySelectorAll('input');
    const name = inputs[0].value;
    const email = inputs[1].value;
    const phone = inputs[2].value;
    const password = inputs[3].value;

    try {
        const data = await api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, phone, password }),
        });

        currentUser = data.user;
        showNotification(`Ro'yxatdan o'tdingiz, ${currentUser.name}!`);
        closeLoginModal();
        updateUserUI();
        e.target.reset();
    } catch (err) {
        showNotification('Ro\'yxatdan o\'tishda xatolik: ' + err.message, 'error');
    }
}

async function checkCurrentUser() {
    try {
        const data = await api('/auth/me');
        currentUser = data.user;
        updateUserUI();
    } catch (err) {
        currentUser = null;
    }
}

function updateUserUI() {
    const userBtn = document.querySelector('.icon-btn[onclick="openLoginModal()"]');
    if (currentUser && userBtn) {
        userBtn.innerHTML = `<i class="fas fa-user-circle"></i>`;
        userBtn.title = currentUser.name;
        userBtn.setAttribute('onclick', 'handleUserClick()');
    }
}

async function handleUserClick() {
    if (confirm(`${currentUser.name}, tizimdan chiqishni xohlaysizmi?`)) {
        try {
            await api('/auth/logout', { method: 'POST' });
        } catch (err) { /* baribir tozalaymiz */ }
        currentUser = null;
        location.reload();
    }
}

// ===== CONTACT FORM =====
function handleContactForm(e) {
    e.preventDefault();
    showNotification('Xabaringiz yuborildi! Tez orada javob beramiz.');
    e.target.reset();
}

// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4A8B7C' : type === 'error' ? '#E63946' : '#2D5F9F'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 320px;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${escapeHtml(message)}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3500);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

console.log('🌹 ATLAS FLOWERS - Premium Gul Do\'koni');
console.log('✨ Sayt muvaffaqiyatli yuklandi! (Backend API bilan ulangan)');

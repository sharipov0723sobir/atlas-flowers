// ===== ATLAS FLOWERS JavaScript =====

// Global o'zgaruvchilar
let cart = [];
let wishlist = [];
let currentUser = null;

// Mahsulotlar ma'lumotlar bazasi
const products = [
    { id: 1, name: "Romantik Atirgul Buketi", price: 350000, category: "roses premium", rating: 5, reviews: 48, description: "15 ta qizil premium atirgul, nozik qadoqlash bilan. Sevgi va muhabbat ramzi." },
    { id: 2, name: "Bahor Lolalari", price: 280000, category: "tulips mixed", rating: 4, reviews: 32, description: "25 ta rang-barang lola, bahorning go'zalligi." },
    { id: 3, name: "Oq Liliya Kompozitsiyasi", price: 420000, category: "lilies premium", rating: 5, reviews: 56, description: "Premium oq liliyalar va yashil, nafis kompozitsiya." },
    { id: 4, name: "Quyosh Nuri", price: 240000, category: "mixed holiday", rating: 4.5, reviews: 41, description: "Sariq atirgul va kungaboqar, quvonch ramzi." },
    { id: 5, name: "Binafsha Orzular", price: 310000, category: "mixed premium", rating: 5, reviews: 39, description: "Eustoma va pushti atirgullar, romantik kompozitsiya." },
    { id: 6, name: "Hashamatli Quti", price: 650000, category: "roses premium", rating: 5, reviews: 64, description: "101 ta premium atirgul hashamatli qutida. Unutilmas sovg'a." }
];

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

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadCartFromStorage();
    updateCartUI();
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Close mobile menu
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
});


// ===== INITIALIZATION =====
function initializeApp() {
    // Hamburger menu
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Scroll events
    window.addEventListener('scroll', () => {
        // Scroll to top button
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
        
        // Active nav link
        updateActiveNavLink();
    });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts(this.dataset.category);
        });
    });
    
    // Contact form
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


// ===== SEARCH FUNCTIONALITY =====
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        const productDesc = card.querySelector('.product-description').textContent.toLowerCase();
        
        if (productName.includes(searchTerm) || productDesc.includes(searchTerm)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===== FILTER FUNCTIONALITY =====
function filterProducts(category) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        if (category === 'all' || card.dataset.category.includes(category)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease';
        } else {
            card.style.display = 'none';
        }
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
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    updateCartUI();
    saveCartToStorage();
    showNotification(`${name} savatga qo'shildi!`);
    
    // Open cart sidebar
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
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
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
                        <div class="cart-item-name">${item.name}</div>
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
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Savatingiz bo\'sh!', 'error');
        return;
    }
    
    if (!currentUser) {
        openLoginModal();
        showNotification('Buyurtma berish uchun tizimga kiring', 'info');
        return;
    }
    
    // Buyurtma berish logikasi
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const message = `Buyurtma qabul qilindi!\nJami: ${formatPrice(total)}\n\nBiz tez orada siz bilan bog'lanamiz.`;
    
    alert(message);
    cart = [];
    updateCartUI();
    saveCartToStorage();
    toggleCart();
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
    
    // Set image background
    let bgClass = '';
    if (product.category.includes('roses')) bgClass = 'rose-bg';
    else if (product.category.includes('tulips')) bgClass = 'tulip-bg';
    else if (product.category.includes('lilies')) bgClass = 'orchid-bg';
    else bgClass = 'lavender-bg';
    
    image.innerHTML = `<div class="placeholder-image ${bgClass}"><i class="fas fa-flower"></i></div>`;
    title.textContent = product.name;
    price.textContent = formatPrice(product.price);
    description.textContent = product.description;
    
    // Generate stars
    let starsHTML = '';
    for (let i = 0; i < 5; i++) {
        if (i < Math.floor(product.rating)) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else if (i < product.rating) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        } else {
            starsHTML += '<i class="far fa-star"></i>';
        }
    }
    starsHTML += `<span>(${product.reviews})</span>`;
    rating.innerHTML = starsHTML;
    
    modal.classList.add('active');
    modal.dataset.productId = id;
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    modal.classList.remove('active');
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
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// ===== LOGIN/REGISTER MODAL =====
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

function handleLogin(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    currentUser = {
        name: email.split('@')[0],
        email: email
    };
    
    localStorage.setItem('atlasFlowersUser', JSON.stringify(currentUser));
    showNotification(`Xush kelibsiz, ${currentUser.name}!`);
    closeLoginModal();
    updateUserUI();
}

function handleRegister(e) {
    e.preventDefault();
    const name = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    
    currentUser = {
        name: name,
        email: email
    };
    
    localStorage.setItem('atlasFlowersUser', JSON.stringify(currentUser));
    showNotification(`Ro'yxatdan o'tdingiz, ${currentUser.name}!`);
    closeLoginModal();
    updateUserUI();
}

function updateUserUI() {
    const userBtn = document.querySelector('.icon-btn:has(.fa-user)');
    if (currentUser && userBtn) {
        userBtn.innerHTML = `<i class="fas fa-user-circle"></i>`;
        userBtn.title = currentUser.name;
    }
}

// ===== CONTACT FORM =====
function handleContactForm(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Bu yerda backend'ga yuborish logikasi bo'lishi kerak
    showNotification('Xabaringiz yuborildi! Tez orada javob beramiz.');
    e.target.reset();
}


// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
}

function showNotification(message, type = 'success') {
    // Create notification element
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
        max-width: 300px;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Load user from storage on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('atlasFlowersUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserUI();
    }
    
    const savedWishlist = localStorage.getItem('atlasFlowersWishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
    }
});

console.log('🌹 ATLAS FLOWERS - Premium Gul Do\'koni');
console.log('✨ Sayt muvaffaqiyatli yuklandi!');

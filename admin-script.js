// ===== ATLAS FLOWERS - Admin Panel (Backend API bilan integratsiya) =====

const API_BASE = '/api';

// Global o'zgaruvchilar
let orders = [];
let customers = [];
let adminProducts = [];
let currentAdmin = null;

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
        data = { ok: false, error: "Server javobini o'qishda xatolik" };
    }
    if (!response.ok || data.ok === false) {
        throw new Error(data.error || "Noma'lum xatolik yuz berdi");
    }
    return data;
}

// ===== LOGIN GATE =====
const loginGate = document.getElementById('adminLoginGate');
const panelRoot = document.getElementById('adminPanelRoot');

document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const login = document.getElementById('adminLoginEmail').value;
    const password = document.getElementById('adminLoginPassword').value;
    const errorDiv = document.getElementById('adminLoginError');
    errorDiv.classList.remove('show');

    try {
        const data = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ login, password }),
        });

        if (data.user.role !== 'admin') {
            errorDiv.textContent = "Bu hisob administrator emas. Admin panelga faqat adminlar kira oladi.";
            errorDiv.classList.add('show');
            await api('/auth/logout', { method: 'POST' }).catch(() => {});
            return;
        }

        currentAdmin = data.user;
        showAdminPanel();
    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.add('show');
    }
});

function showAdminPanel() {
    loginGate.style.display = 'none';
    panelRoot.classList.remove('admin-panel-hidden');
    document.getElementById('adminName').textContent = currentAdmin.name;
    loadAdminData();
}

function showLoginGate() {
    loginGate.style.display = 'flex';
    panelRoot.classList.add('admin-panel-hidden');
}

async function adminLogout() {
    if (confirm("Admin paneldan chiqishni xohlaysizmi?")) {
        try {
            await api('/auth/logout', { method: 'POST' });
        } catch (err) { /* baribir chiqamiz */ }
        currentAdmin = null;
        showLoginGate();
    }
}

// ===== SAHIFA YUKLANGANDA SESSIYANI TEKSHIRISH =====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await api('/auth/me');
        if (data.user.role === 'admin') {
            currentAdmin = data.user;
            showAdminPanel();
        } else {
            showLoginGate();
        }
    } catch (err) {
        showLoginGate();
    }

    setupMenuNavigation();
    setupOrdersFilter();
    setupProductForm();
    setupTelegramForm();
    setupSettingsForms();
});

// ===== ADMIN MA'LUMOTLARINI YUKLASH =====
async function loadAdminData() {
    await Promise.all([
        loadDashboard(),
        loadOrders(),
        loadProductsAdmin(),
        loadCustomers(),
        loadTelegramSettings(),
    ]);
}

// ===== DASHBOARD =====
async function loadDashboard() {
    try {
        const data = await api('/admin/dashboard');
        const stats = data.stats;

        document.getElementById('totalOrders').textContent = stats.totalOrders;
        document.getElementById('totalRevenue').textContent = formatPrice(stats.totalRevenue);
        document.getElementById('totalCustomers').textContent = stats.totalCustomers;
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('ordersCount').textContent = stats.pendingOrders;

        renderTopProducts(stats.topProducts);
    } catch (err) {
        console.error('Dashboard yuklashda xatolik:', err.message);
    }
}

function renderTopProducts(topProducts) {
    const topProductsDiv = document.getElementById('topProducts');
    if (!topProducts || topProducts.length === 0) {
        topProductsDiv.innerHTML = '<p style="text-align: center; color: var(--dark-gray);">Hali buyurtmalar yo\'q</p>';
        return;
    }

    topProductsDiv.innerHTML = topProducts.map((product, index) => `
        <div class="top-product-item">
            <div class="product-rank">${index + 1}</div>
            <div class="product-info">
                <div class="product-name">${escapeHtml(product.name)}</div>
                <div class="product-sales">${product.total_sold} ta sotildi</div>
            </div>
        </div>
    `).join('');
}

// ===== BUYURTMALAR =====
async function loadOrders() {
    try {
        const data = await api('/admin/orders');
        orders = data.orders;
        renderOrders();
    } catch (err) {
        console.error('Buyurtmalarni yuklashda xatolik:', err.message);
    }
}

function renderOrders(filter = 'all') {
    const tbody = document.getElementById('ordersTableBody');
    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">Buyurtmalar topilmadi</td></tr>';
        return;
    }

    tbody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${escapeHtml(order.customer_name)}</td>
            <td>${escapeHtml(order.customer_phone)}</td>
            <td>${order.items.length} ta mahsulot</td>
            <td>${formatPrice(order.total)}</td>
            <td><span class="order-status ${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <div class="order-actions">
                    <button class="btn-action btn-view" onclick="viewOrder(${order.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${order.status === 'pending' || order.status === 'processing' ? `
                        <button class="btn-action btn-complete" onclick="completeOrder(${order.id})">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-action btn-cancel" onclick="cancelOrder(${order.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusText(status) {
    const statusTexts = {
        pending: 'Kutilmoqda',
        processing: 'Jarayonda',
        completed: 'Bajarildi',
        cancelled: 'Bekor qilindi',
    };
    return statusTexts[status] || status;
}

function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const itemsText = order.items.map(item => `${item.product_name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`).join('\n');

    alert(`Buyurtma #${order.id}\n\nMijoz: ${order.customer_name}\nTelefon: ${order.customer_phone}\nEmail: ${order.customer_email}\n${order.customer_address ? 'Manzil: ' + order.customer_address + '\n' : ''}\nMahsulotlar:\n${itemsText}\n\nJami: ${formatPrice(order.total)}\nVaqt: ${formatDate(order.created_at)}`);
}

async function completeOrder(orderId) {
    try {
        await api(`/admin/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'completed' }),
        });
        await loadOrders();
        await loadDashboard();
        showNotification('Buyurtma bajarildi!', 'success');
    } catch (err) {
        showNotification('Xatolik: ' + err.message, 'error');
    }
}

async function cancelOrder(orderId) {
    if (!confirm("Buyurtmani bekor qilishni tasdiqlaysizmi?")) return;
    try {
        await api(`/admin/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'cancelled' }),
        });
        await loadOrders();
        await loadDashboard();
        showNotification('Buyurtma bekor qilindi', 'error');
    } catch (err) {
        showNotification('Xatolik: ' + err.message, 'error');
    }
}

function setupOrdersFilter() {
    document.querySelectorAll('.orders-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.orders-filters .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderOrders(this.dataset.status);
        });
    });
}

// ===== MAHSULOTLAR =====
async function loadProductsAdmin() {
    try {
        const data = await api('/admin/products');
        adminProducts = data.products;
        renderProductsAdmin();
    } catch (err) {
        console.error('Mahsulotlarni yuklashda xatolik:', err.message);
    }
}

function renderProductsAdmin() {
    const grid = document.getElementById('adminProductsGrid');

    grid.innerHTML = adminProducts.map(product => {
        const bgClass = product.image_class || getCategoryBg(product.category);
        const inactiveLabel = product.status === 'inactive' ? '<span style="color:#721C24; font-weight:600;"> (Nofaol)</span>' : '';
        return `
            <div class="admin-product-card">
                <div class="admin-product-image ${bgClass}">
                    <i class="fas fa-rose"></i>
                </div>
                <div class="admin-product-info">
                    <div class="admin-product-name">${escapeHtml(product.name)}${inactiveLabel}</div>
                    <div class="admin-product-price">${formatPrice(product.price)}</div>
                    <p style="color: var(--dark-gray); font-size: 0.9rem; margin-bottom: 1rem;">${escapeHtml(product.description || '')}</p>
                    <div class="admin-product-actions">
                        <button class="btn-action btn-view" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Tahrirlash
                        </button>
                        <button class="btn-action btn-cancel" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> O'chirish
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getCategoryBg(category) {
    if (!category) return 'lavender-bg';
    if (category.includes('roses')) return 'rose-bg';
    if (category.includes('tulips')) return 'tulip-bg';
    if (category.includes('lilies')) return 'orchid-bg';
    if (category.includes('holiday')) return 'sunflower-bg';
    return 'lavender-bg';
}

function openProductModal() {
    document.getElementById('productModal').classList.add('active');
    document.getElementById('productModalTitle').textContent = "Yangi Mahsulot Qo'shish";
    document.getElementById('productForm').reset();
    document.getElementById('productForm').dataset.editId = '';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function editProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('productModalTitle').textContent = 'Mahsulotni Tahrirlash';
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category.split(' ')[0];
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productStatus').value = product.status;
    document.getElementById('productForm').dataset.editId = productId;

    document.getElementById('productModal').classList.add('active');
}

async function deleteProduct(productId) {
    if (!confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) return;
    try {
        await api(`/admin/products/${productId}`, { method: 'DELETE' });
        await loadProductsAdmin();
        await loadDashboard();
        showNotification("Mahsulot o'chirildi", 'success');
    } catch (err) {
        showNotification('Xatolik: ' + err.message, 'error');
    }
}

function setupProductForm() {
    document.getElementById('productForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const editId = e.target.dataset.editId;
        const categoryValue = document.getElementById('productCategory').value;
        const payload = {
            name: document.getElementById('productName').value,
            price: parseInt(document.getElementById('productPrice').value, 10),
            category: categoryValue,
            description: document.getElementById('productDescription').value,
            status: document.getElementById('productStatus').value,
            image_class: getCategoryBg(categoryValue),
        };

        try {
            if (editId) {
                await api(`/admin/products/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
                showNotification('Mahsulot yangilandi!', 'success');
            } else {
                await api('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
                showNotification("Mahsulot qo'shildi!", 'success');
            }
            await loadProductsAdmin();
            await loadDashboard();
            closeProductModal();
        } catch (err) {
            showNotification('Xatolik: ' + err.message, 'error');
        }
    });
}

// ===== MIJOZLAR =====
async function loadCustomers() {
    try {
        const data = await api('/admin/customers');
        customers = data.customers;
        renderCustomers();
    } catch (err) {
        console.error('Mijozlarni yuklashda xatolik:', err.message);
    }
}

function renderCustomers() {
    const tbody = document.getElementById('customersTableBody');

    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Mijozlar topilmadi</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map((customer, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(customer.name)}</td>
            <td>${escapeHtml(customer.email)}</td>
            <td>${escapeHtml(customer.phone || 'N/A')}</td>
            <td>${customer.orders_count}</td>
            <td>${formatDate(customer.created_at)}</td>
            <td>
                <button class="btn-action btn-view" onclick="viewCustomer(${customer.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function viewCustomer(id) {
    try {
        const data = await api(`/admin/customers/${id}`);
        const customer = data.customer;
        alert(`Mijoz: ${customer.name}\nEmail: ${customer.email}\nTelefon: ${customer.phone || 'N/A'}\nBuyurtmalar: ${customer.orders.length}\nRo'yxat sanasi: ${formatDate(customer.created_at)}`);
    } catch (err) {
        showNotification('Xatolik: ' + err.message, 'error');
    }
}

// ===== SOZLAMALAR (Do'kon va Yetkazib berish) =====
function setupSettingsForms() {
    document.getElementById('shopInfoForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputs = e.target.querySelectorAll('input, textarea');
        try {
            await api('/admin/settings', {
                method: 'PUT',
                body: JSON.stringify({
                    shop_name: inputs[0].value,
                    shop_phone: inputs[1].value,
                    shop_email: inputs[2].value,
                    shop_address: inputs[3].value,
                }),
            });
            showNotification('Do\'kon ma\'lumotlari saqlandi!', 'success');
        } catch (err) {
            showNotification('Xatolik: ' + err.message, 'error');
        }
    });

    document.getElementById('deliveryForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputs = e.target.querySelectorAll('input');
        try {
            await api('/admin/settings', {
                method: 'PUT',
                body: JSON.stringify({
                    delivery_price: inputs[0].value,
                    free_delivery_threshold: inputs[1].value,
                    delivery_time: inputs[2].value,
                }),
            });
            showNotification('Yetkazib berish sozlamalari saqlandi!', 'success');
        } catch (err) {
            showNotification('Xatolik: ' + err.message, 'error');
        }
    });
}

// ===== TELEGRAM BOT (Backend orqali, token frontend'da saqlanmaydi) =====
async function loadTelegramSettings() {
    try {
        const data = await api('/admin/settings');
        document.getElementById('botToken').value = data.settings.telegram_bot_token || '';
        document.getElementById('chatId').value = data.settings.telegram_chat_id || '';

        // Do'kon va yetkazib berish formalarini ham to'ldiramiz
        const shopForm = document.getElementById('shopInfoForm');
        if (shopForm) {
            const inputs = shopForm.querySelectorAll('input, textarea');
            inputs[0].value = data.settings.shop_name || '';
            inputs[1].value = data.settings.shop_phone || '';
            inputs[2].value = data.settings.shop_email || '';
            inputs[3].value = data.settings.shop_address || '';
        }
        const deliveryForm = document.getElementById('deliveryForm');
        if (deliveryForm) {
            const inputs = deliveryForm.querySelectorAll('input');
            inputs[0].value = data.settings.delivery_price || '0';
            inputs[1].value = data.settings.free_delivery_threshold || '500000';
            inputs[2].value = data.settings.delivery_time || '2-3 soat';
        }
    } catch (err) {
        console.error('Sozlamalarni yuklashda xatolik:', err.message);
    }
}

async function testTelegramBot() {
    const botToken = document.getElementById('botToken').value;
    const chatId = document.getElementById('chatId').value;

    if (!botToken || !chatId) {
        showTelegramStatus("Iltimos, Bot Token va Chat ID ni kiriting!", 'error');
        return;
    }

    try {
        const data = await api('/admin/settings/telegram/test', {
            method: 'POST',
            body: JSON.stringify({ bot_token: botToken, chat_id: chatId }),
        });
        showTelegramStatus('✅ ' + data.message, 'success');
    } catch (err) {
        showTelegramStatus('❌ ' + err.message, 'error');
    }
}

function showTelegramStatus(message, type) {
    const statusDiv = document.getElementById('telegramStatus');
    statusDiv.className = `telegram-status ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

function setupTelegramForm() {
    document.getElementById('telegramForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const botToken = document.getElementById('botToken').value;
        const chatId = document.getElementById('chatId').value;

        try {
            await api('/admin/settings', {
                method: 'PUT',
                body: JSON.stringify({ telegram_bot_token: botToken, telegram_chat_id: chatId }),
            });
            showTelegramStatus('✅ Sozlamalar saqlandi! Endi buyurtmalar avtomatik shu botga tushadi.', 'success');
        } catch (err) {
            showTelegramStatus('❌ ' + err.message, 'error');
        }
    });
}

// ===== MENU NAVIGATSIYASI =====
function setupMenuNavigation() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;

            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));

            item.classList.add('active');
            document.getElementById(section).classList.add('active');
        });
    });
}

// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
}

function formatDate(dateString) {
    const date = new Date(dateString.replace(' ', 'T'));
    return date.toLocaleString('uz-UZ', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#D4EDDA' : type === 'error' ? '#F8D7DA' : '#CCE5FF'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721C24' : '#004085'};
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 320px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

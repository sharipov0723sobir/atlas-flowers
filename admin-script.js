// ===== ADMIN PANEL JAVASCRIPT =====

// Global o'zgaruvchilar
let orders = [];
let customers = [];
let adminProducts = [];
let telegramConfig = {
    botToken: '',
    chatId: ''
};

// LocalStorage'dan ma'lumotlarni yuklash
function loadAdminData() {
    // Buyurtmalarni yuklash
    const savedOrders = localStorage.getItem('atlasFlowersOrders');
    orders = savedOrders ? JSON.parse(savedOrders) : [];
    
    // Mijozlarni yuklash
    const savedCustomers = localStorage.getItem('atlasFlowersCustomers');
    customers = savedCustomers ? JSON.parse(savedCustomers) : [];
    
    // Mahsulotlarni yuklash
    const savedProducts = localStorage.getItem('atlasFlowersProducts');
    adminProducts = savedProducts ? JSON.parse(savedProducts) : getDefaultProducts();
    
    // Telegram konfiguratsiyasini yuklash
    const savedTelegramConfig = localStorage.getItem('atlasFlowersTelegram');
    if (savedTelegramConfig) {
        telegramConfig = JSON.parse(savedTelegramConfig);
        document.getElementById('botToken').value = telegramConfig.botToken || '';
        document.getElementById('chatId').value = telegramConfig.chatId || '';
    }
    
    updateDashboard();
    renderOrders();
    renderProducts();
    renderCustomers();
}

// Default mahsulotlar
function getDefaultProducts() {
    return [
        { id: 1, name: "Romantik Atirgul Buketi", price: 350000, category: "roses premium", description: "15 ta qizil premium atirgul", status: "active" },
        { id: 2, name: "Bahor Lolalari", price: 280000, category: "tulips mixed", description: "25 ta rang-barang lola", status: "active" },
        { id: 3, name: "Oq Liliya Kompozitsiyasi", price: 420000, category: "lilies premium", description: "Premium oq liliyalar", status: "active" },
        { id: 4, name: "Quyosh Nuri", price: 240000, category: "mixed holiday", description: "Sariq atirgul va kungaboqar", status: "active" },
        { id: 5, name: "Binafsha Orzular", price: 310000, category: "mixed premium", description: "Eustoma va pushti atirgullar", status: "active" },
        { id: 6, name: "Hashamatli Quti", price: 650000, category: "roses premium", description: "101 ta premium atirgul", status: "active" }
    ];
}

// ===== DASHBOARD =====
function updateDashboard() {
    // Jami buyurtmalar
    document.getElementById('totalOrders').textContent = orders.length;
    
    // Jami daromad
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('totalRevenue').textContent = formatPrice(totalRevenue);
    
    // Jami mijozlar
    document.getElementById('totalCustomers').textContent = customers.length;
    
    // Jami mahsulotlar
    document.getElementById('totalProducts').textContent = adminProducts.length;
    
    // Buyurtmalar soni
    document.getElementById('ordersCount').textContent = orders.filter(o => o.status === 'pending').length;
    
    // Eng ko'p sotilgan mahsulotlar
    renderTopProducts();
}

function renderTopProducts() {
    const productSales = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            if (productSales[item.name]) {
                productSales[item.name] += item.quantity;
            } else {
                productSales[item.name] = item.quantity;
            }
        });
    });
    
    const sortedProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const topProductsDiv = document.getElementById('topProducts');
    if (sortedProducts.length === 0) {
        topProductsDiv.innerHTML = '<p style="text-align: center; color: var(--dark-gray);">Hali buyurtmalar yo\'q</p>';
        return;
    }
    
    topProductsDiv.innerHTML = sortedProducts.map((product, index) => `
        <div class="top-product-item">
            <div class="product-rank">${index + 1}</div>
            <div class="product-info">
                <div class="product-name">${product[0]}</div>
                <div class="product-sales">${product[1]} ta sotildi</div>
            </div>
        </div>
    `).join('');
}

// ===== ORDERS =====
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
            <td>${order.customer.name}</td>
            <td>${order.customer.phone}</td>
            <td>${order.items.length} ta mahsulot</td>
            <td>${formatPrice(order.total)}</td>
            <td><span class="order-status ${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDate(order.date)}</td>
            <td>
                <div class="order-actions">
                    <button class="btn-action btn-view" onclick="viewOrder(${order.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${order.status === 'pending' ? `
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
        'pending': 'Kutilmoqda',
        'processing': 'Jarayonda',
        'completed': 'Bajarildi',
        'cancelled': 'Bekor qilindi'
    };
    return statusTexts[status] || status;
}

function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    let itemsHTML = order.items.map(item => 
        `<li>${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}</li>`
    ).join('');
    
    alert(`Buyurtma #${order.id}\n\nMijoz: ${order.customer.name}\nTelefon: ${order.customer.phone}\nEmail: ${order.customer.email}\n\nMahsulotlar:\n${order.items.map(item => `${item.name} x${item.quantity}`).join('\n')}\n\nJami: ${formatPrice(order.total)}\nVaqt: ${formatDate(order.date)}`);
}

function completeOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'completed';
        localStorage.setItem('atlasFlowersOrders', JSON.stringify(orders));
        renderOrders();
        updateDashboard();
        showNotification('Buyurtma bajarildi!', 'success');
    }
}

function cancelOrder(orderId) {
    if (confirm('Buyurtmani bekor qilishni tasdiqlaysizmi?')) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'cancelled';
            localStorage.setItem('atlasFlowersOrders', JSON.stringify(orders));
            renderOrders();
            updateDashboard();
            showNotification('Buyurtma bekor qilindi', 'error');
        }
    }
}

// ===== PRODUCTS =====
function renderProducts() {
    const grid = document.getElementById('adminProductsGrid');
    
    grid.innerHTML = adminProducts.map(product => {
        const bgClass = getCategoryBg(product.category);
        return `
            <div class="admin-product-card">
                <div class="admin-product-image ${bgClass}">
                    <i class="fas fa-flower"></i>
                </div>
                <div class="admin-product-info">
                    <div class="admin-product-name">${product.name}</div>
                    <div class="admin-product-price">${formatPrice(product.price)}</div>
                    <p style="color: var(--dark-gray); font-size: 0.9rem; margin-bottom: 1rem;">${product.description}</p>
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
    if (category.includes('roses')) return 'rose-bg';
    if (category.includes('tulips')) return 'tulip-bg';
    if (category.includes('lilies')) return 'orchid-bg';
    if (category.includes('holiday')) return 'sunflower-bg';
    return 'lavender-bg';
}

function openProductModal() {
    document.getElementById('productModal').classList.add('active');
    document.getElementById('productModalTitle').textContent = 'Yangi Mahsulot Qo\'shish';
    document.getElementById('productForm').reset();
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
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productStatus').value = product.status;
    
    document.getElementById('productModal').classList.add('active');
}

function deleteProduct(productId) {
    if (confirm('Mahsulotni o\'chirishni tasdiqlaysizmi?')) {
        adminProducts = adminProducts.filter(p => p.id !== productId);
        localStorage.setItem('atlasFlowersProducts', JSON.stringify(adminProducts));
        renderProducts();
        updateDashboard();
        showNotification('Mahsulot o\'chirildi', 'success');
    }
}

// ===== CUSTOMERS =====
function renderCustomers() {
    const tbody = document.getElementById('customersTableBody');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Mijozlar topilmadi</td></tr>';
        return;
    }
    
    tbody.innerHTML = customers.map((customer, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone || 'N/A'}</td>
            <td>${getCustomerOrders(customer.email)}</td>
            <td>${formatDate(customer.registeredDate)}</td>
            <td>
                <button class="btn-action btn-view" onclick="viewCustomer('${customer.email}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getCustomerOrders(email) {
    return orders.filter(o => o.customer.email === email).length;
}

function viewCustomer(email) {
    const customer = customers.find(c => c.email === email);
    const customerOrders = orders.filter(o => o.customer.email === email);
    
    alert(`Mijoz: ${customer.name}\nEmail: ${customer.email}\nTelefon: ${customer.phone || 'N/A'}\nBuyurtmalar: ${customerOrders.length}\nRo'yxat sanasi: ${formatDate(customer.registeredDate)}`);
}

// ===== TELEGRAM BOT =====
function testTelegramBot() {
    const botToken = document.getElementById('botToken').value;
    const chatId = document.getElementById('chatId').value;
    
    if (!botToken || !chatId) {
        showTelegramStatus('Iltimos, Bot Token va Chat ID ni kiriting!', 'error');
        return;
    }
    
    const message = `🌹 <b>ATLAS FLOWERS - Test Xabar</b>\n\n✅ Telegram bot muvaffaqiyatli ulandi!\n\nBu test xabar. Buyurtmalar shu formatda keladi.`;
    
    sendTelegramMessage(botToken, chatId, message);
}

async function sendTelegramMessage(botToken, chatId, message) {
    const statusDiv = document.getElementById('telegramStatus');
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            showTelegramStatus('✅ Xabar muvaffaqiyatli yuborildi! Telegram'ni tekshiring.', 'success');
        } else {
            showTelegramStatus('❌ Xatolik: ' + (data.description || 'Noma\'lum xato'), 'error');
        }
    } catch (error) {
        showTelegramStatus('❌ Tarmoq xatosi: ' + error.message, 'error');
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

// ===== TELEGRAM FORM SUBMIT =====
document.getElementById('telegramForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const botToken = document.getElementById('botToken').value;
    const chatId = document.getElementById('chatId').value;
    
    telegramConfig = { botToken, chatId };
    localStorage.setItem('atlasFlowersTelegram', JSON.stringify(telegramConfig));
    
    showTelegramStatus('✅ Sozlamalar saqlandi!', 'success');
});

// ===== BUYURTMANI TELEGRAM'GA YUBORISH =====
function sendOrderToTelegram(order) {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
        console.log('Telegram not configured');
        return;
    }
    
    const itemsList = order.items.map(item => 
        `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
    ).join('\n');
    
    const message = `🌹 <b>ATLAS FLOWERS - Yangi Buyurtma!</b>\n\n` +
        `<b>📦 Buyurtma ID:</b> #${order.id}\n` +
        `<b>👤 Mijoz:</b> ${order.customer.name}\n` +
        `<b>📞 Telefon:</b> ${order.customer.phone}\n` +
        `<b>📧 Email:</b> ${order.customer.email}\n\n` +
        `<b>🛍️ Mahsulotlar:</b>\n${itemsList}\n\n` +
        `<b>💰 Jami:</b> ${formatPrice(order.total)}\n` +
        `<b>📅 Vaqt:</b> ${formatDate(order.date)}\n\n` +
        `<i>Mijoz bilan bog'laning va buyurtmani tasdiqlang!</i>`;
    
    sendTelegramMessage(telegramConfig.botToken, telegramConfig.chatId, message);
}

// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('uz-UZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
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
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function adminLogout() {
    if (confirm('Admin paneldan chiqishni xohlaysizmi?')) {
        window.location.href = 'index.html';
    }
}

// ===== MENU NAVIGATION =====
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        
        // Remove active class from all menu items and sections
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked item and corresponding section
        item.classList.add('active');
        document.getElementById(section).classList.add('active');
    });
});

// Orders filter buttons
document.querySelectorAll('.orders-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.orders-filters .filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderOrders(this.dataset.status);
    });
});

// Product form submit
document.getElementById('productForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        price: parseInt(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        status: document.getElementById('productStatus').value
    };
    
    adminProducts.push(newProduct);
    localStorage.setItem('atlasFlowersProducts', JSON.stringify(adminProducts));
    
    renderProducts();
    updateDashboard();
    closeProductModal();
    showNotification('Mahsulot qo\'shildi!', 'success');
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAdminData();
    
    // Check for new orders from main site
    window.addEventListener('storage', (e) => {
        if (e.key === 'atlasFlowersOrders') {
            loadAdminData();
        }
    });
});

// Export function for main site
window.adminReceiveOrder = function(order) {
    orders.push(order);
    localStorage.setItem('atlasFlowersOrders', JSON.stringify(orders));
    sendOrderToTelegram(order);
    updateDashboard();
    renderOrders();
};

const DB_NAME = 'GroceryAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'groceries';

let db;
const state = {
    items: [],
    unselectedItems: []
};

async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

async function loadItems() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveItem(item) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = item.id ? store.put(item) : store.add(item);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteItem(id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function clearAll() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toFixed(2);
}

function calculateTotal() {
    const total = state.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function createCard(item, isUnselected = false) {
    const card = document.createElement('div');
    card.className = `grocery-card${isUnselected ? ' unselected-card' : ''}`;
    card.dataset.id = item.id;
    
    card.innerHTML = `
        <span class="swipe-hint">Remove →</span>
        <div class="card-content">
            <div class="item-info">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-unit">${formatCurrency(item.price)} each</div>
            </div>
            <div class="item-controls">
                <div class="price-display">${formatCurrency(item.price * item.qty)}</div>
                <div class="price-input-group">
                    <span>₹</span>
                    <input type="number" class="price-input" value="${item.price}" step="0.01" min="0" ${isUnselected ? 'disabled' : ''}>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn minus" ${isUnselected ? 'disabled' : ''}>−</button>
                    <span class="qty-value">${item.qty}</span>
                    <button class="qty-btn plus" ${isUnselected ? 'disabled' : ''}>+</button>
                </div>
            </div>
        </div>
    `;
    
    if (!isUnselected) {
        setupCardSwipe(card, item);
        setupCardControls(card, item);
    }
    
    return card;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupCardSwipe(card, item) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    const onStart = (e) => {
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        isDragging = true;
        card.classList.add('swiping');
    };
    
    const onMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        currentX = x - startX;
        
        if (currentX > 0) {
            card.style.transform = `translateX(${currentX}px)`;
        }
    };
    
    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        card.classList.remove('swiping');
        
        if (currentX > 100) {
            moveToUnselected(item, card);
        } else {
            card.style.transform = '';
        }
        currentX = 0;
    };
    
    card.addEventListener('mousedown', onStart);
    card.addEventListener('touchstart', onStart, { passive: true });
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
}

async function moveToUnselected(item, card) {
    card.classList.add('removing');
    
    setTimeout(async () => {
        const index = state.items.findIndex(i => i.id === item.id);
        if (index !== -1) {
            state.items.splice(index, 1);
            item.selected = false;
            await saveItem(item);
            state.unselectedItems.push(item);
            renderCards();
            calculateTotal();
            showToast(`${item.name} moved to unselected`);
        }
    }, 300);
}

function setupCardControls(card, item) {
    const minusBtn = card.querySelector('.minus');
    const plusBtn = card.querySelector('.plus');
    const priceInput = card.querySelector('.price-input');
    
    minusBtn.addEventListener('click', async () => {
        if (item.qty > 1) {
            item.qty--;
            await saveItem(item);
            updateCardDisplay(card, item);
            calculateTotal();
        } else {
            moveToUnselected(item, card.closest('.grocery-card'));
        }
    });
    
    plusBtn.addEventListener('click', async () => {
        item.qty++;
        await saveItem(item);
        updateCardDisplay(card, item);
        calculateTotal();
    });
    
    priceInput.addEventListener('change', async (e) => {
        const newPrice = parseFloat(e.target.value) || 0;
        item.price = Math.max(0, newPrice);
        await saveItem(item);
        updateCardDisplay(card, item);
        calculateTotal();
    });
}

function updateCardDisplay(card, item) {
    card.querySelector('.qty-value').textContent = item.qty;
    card.querySelector('.price-display').textContent = formatCurrency(item.price * item.qty);
    card.querySelector('.item-unit').textContent = `${formatCurrency(item.price)} each`;
}

function renderCards() {
    const selectedContainer = document.getElementById('selectedCards');
    const unselectedContainer = document.getElementById('unselectedCards');
    const unselectedLabel = document.getElementById('unselectedLabel');
    
    selectedContainer.innerHTML = '';
    unselectedContainer.innerHTML = '';
    
    if (state.items.length === 0 && state.unselectedItems.length === 0) {
        selectedContainer.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <p>Add items to start marking</p>
            </div>
        `;
    } else {
        state.items.forEach(item => {
            selectedContainer.appendChild(createCard(item, false));
        });
    }
    
    if (state.unselectedItems.length > 0) {
        unselectedLabel.style.display = 'block';
        state.unselectedItems.forEach(item => {
            const card = createCard(item, true);
            card.addEventListener('click', () => moveToSelected(item, card));
            unselectedContainer.appendChild(card);
        });
    } else {
        unselectedLabel.style.display = 'none';
    }
}

async function moveToSelected(item, card) {
    card.classList.add('removing');
    
    setTimeout(async () => {
        const index = state.unselectedItems.findIndex(i => i.id === item.id);
        if (index !== -1) {
            state.unselectedItems.splice(index, 1);
            item.selected = true;
            await saveItem(item);
            state.items.push(item);
            renderCards();
            calculateTotal();
            showToast(`${item.name} added back`);
        }
    }, 300);
}

async function addNewItem() {
    const nameInput = document.getElementById('itemName');
    const priceInput = document.getElementById('itemPrice');
    const qtyInput = document.getElementById('itemQty');
    
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value) || 0;
    const qty = parseInt(qtyInput.value) || 1;
    
    if (!name) {
        showToast('Please enter item name');
        nameInput.focus();
        return;
    }
    
    const newItem = {
        name,
        price,
        qty,
        selected: true
    };
    
    const id = await saveItem(newItem);
    newItem.id = id;
    state.items.push(newItem);
    
    nameInput.value = '';
    priceInput.value = '';
    qtyInput.value = '1';
    nameInput.focus();
    
    renderCards();
    calculateTotal();
    showToast(`${name} added`);
}

function shareToWhatsApp() {
    if (state.items.length === 0) {
        showToast('No items to share');
        return;
    }
    
    let message = '🛒 *Grocery List*\n\n';
    
    state.items.forEach(item => {
        const total = item.price * item.qty;
        message += `• ${item.name}\n`;
        message += `  Qty: ${item.qty} × ${formatCurrency(item.price)} = ${formatCurrency(total)}\n`;
    });
    
    const grandTotal = state.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    message += `\n*Total: ${formatCurrency(grandTotal)}*`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

async function resetCart() {
    if (state.items.length === 0 && state.unselectedItems.length === 0) {
        showToast('Cart is already empty');
        return;
    }
    
    await clearAll();
    state.items = [];
    state.unselectedItems = [];
    renderCards();
    calculateTotal();
    showToast('Cart reset');
}

function init() {
    initDB().then(async (database) => {
        db = database;
        const items = await loadItems();
        
        state.items = items.filter(i => i.selected !== false);
        state.unselectedItems = items.filter(i => i.selected === false);
        
        renderCards();
        calculateTotal();
    }).catch(err => {
        console.error('DB Error:', err);
        showToast('Error loading data');
    });
    
    document.getElementById('addBtn').addEventListener('click', addNewItem);
    document.getElementById('shareBtn').addEventListener('click', shareToWhatsApp);
    document.getElementById('resetBtn').addEventListener('click', resetCart);
    
    document.getElementById('itemName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewItem();
    });
    
    document.getElementById('itemPrice').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewItem();
    });
    
    document.getElementById('itemQty').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewItem();
    });
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
}

document.addEventListener('DOMContentLoaded', init);

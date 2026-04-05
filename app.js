const DB_NAME = 'GroceryAppDB';
const DB_VERSION = 2;
const STORE_NAME = 'groceries';
const LISTS_STORE = 'savedLists';
const SUGGESTIONS_STORE = 'suggestions';

const ITEM_SUGGESTIONS = {
    'Banana': 'dozen',
    'Apple': 'kg',
    'Orange': 'kg',
    'Mango': 'kg',
    'Grapes': 'kg',
    'Papaya': 'kg',
    'Watermelon': 'kg',
    'Pineapple': 'pcs',
    'Onion': 'kg',
    'Tomato': 'kg',
    'Potato': 'kg',
    'Carrot': 'kg',
    'Cabbage': 'pcs',
    'Cauliflower': 'pcs',
    'Ladies Finger': 'kg',
    'Beans': 'kg',
    'Green Peas': 'kg',
    'Coriander': 'pcs',
    'Mint': 'pcs',
    'Lemon': 'pcs',
    'Ginger': 'g',
    'Garlic': 'g',
    'Green Chilli': 'g',
    'Rice': 'kg',
    'Wheat Flour': 'kg',
    'Sugar': 'kg',
    'Salt': 'kg',
    'Turmeric': 'g',
    'Red Chilli': 'g',
    'Cumin Seeds': 'g',
    'Pepper': 'g',
    'Oil': 'l',
    'Ghee': 'l',
    'Milk': 'l',
    'Curd': 'kg',
    'Butter': 'g',
    'Cheese': 'g',
    'Eggs': 'dozen',
    'Chicken': 'kg',
    'Fish': 'kg',
    'Mutton': 'kg',
    'Prawns': 'kg',
    'Toor Dal': 'kg',
    'Chana Dal': 'kg',
    'Urad Dal': 'kg',
    'Moong Dal': 'kg',
    'Masoor Dal': 'kg',
    'Chai': 'g',
    'Coffee': 'g',
    'Biscuits': 'pcs',
    'Chips': 'pcs',
    'Namkeen': 'g',
    'Bread': 'pcs',
    'Paratha': 'pcs',
    'Roti': 'pcs',
    'Cola': 'l',
    'Juice': 'l',
    'Water': 'l',
    'Basmati Rice': 'kg',
    'Groundnut Oil': 'l',
    'Sunflower Oil': 'l',
    'Mustard Oil': 'l',
    'Refined Oil': 'l',
    'Besan': 'kg',
    'Maida': 'kg',
    'Sooji': 'kg',
    'Poha': 'kg',
    'Oats': 'kg',
    'Corn Flakes': 'g',
    'Muesli': 'g',
    'Peanut Butter': 'g',
    'Jam': 'g',
    'Honey': 'g',
    'Pickle': 'g',
    'Sauce': 'ml',
    'Ketchup': 'ml',
    'Vinegar': 'ml',
    'Paneer': 'g',
    'Coconut': 'pcs',
    'Coconut Oil': 'l',
    'Semolina': 'kg',
    'Vermicelli': 'g',
    'Popcorn': 'g',
    'Salt Biscuits': 'pcs',
    'Marie Biscuits': 'pcs',
    'Cream Biscuits': 'pcs',
    'Glucose Biscuits': 'pcs',
    'Rusk': 'pcs',
    'Cake': 'g',
    'Cookies': 'g',
    'Chocolate': 'g',
    'Candy': 'pcs',
    'Gum': 'pcs',
    'Ice Cream': 'l',
    'Lassi': 'l',
    'Buttermilk': 'l',
    'Shrikhand': 'g',
    'Rasgulla': 'pcs',
    'Gulab Jamun': 'pcs',
    'Rasmalai': 'pcs',
    'Barfi': 'g',
    'Ladoo': 'pcs',
    'Halwa': 'g',
    'Papad': 'pcs',
    'Wafers': 'g',
    'Bhujia': 'g',
    'Mixture': 'g',
    'Samosa': 'pcs',
    'Kachori': 'pcs',
    'Pakora': 'g',
    'Bread Pakora': 'pcs'
};

let db;
const state = {
    items: [],
    unselectedItems: [],
    savedLists: [],
    suggestions: []
};

async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
            
            if (!database.objectStoreNames.contains(LISTS_STORE)) {
                database.createObjectStore(LISTS_STORE, { keyPath: 'id', autoIncrement: true });
            }
            
            if (!database.objectStoreNames.contains(SUGGESTIONS_STORE)) {
                database.createObjectStore(SUGGESTIONS_STORE, { keyPath: 'name' });
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

async function loadSavedLists() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(LISTS_STORE, 'readonly');
        const store = tx.objectStore(LISTS_STORE);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveList(list) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(LISTS_STORE, 'readwrite');
        const store = tx.objectStore(LISTS_STORE);
        const request = store.add(list);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteList(id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(LISTS_STORE, 'readwrite');
        const store = tx.objectStore(LISTS_STORE);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function loadSuggestions() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(SUGGESTIONS_STORE, 'readonly');
        const store = tx.objectStore(SUGGESTIONS_STORE);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function addSuggestion(name) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(SUGGESTIONS_STORE, 'readwrite');
        const store = tx.objectStore(SUGGESTIONS_STORE);
        const request = store.put({ name, unit: ITEM_SUGGESTIONS[name] || 'pcs' });
        
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

function updateSuggestions() {
    const datalist = document.getElementById('itemSuggestions');
    datalist.innerHTML = '';
    
    const allSuggestions = [...Object.keys(ITEM_SUGGESTIONS), ...state.suggestions.map(s => s.name)];
    const unique = [...new Set(allSuggestions)];
    
    unique.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        datalist.appendChild(option);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function createCard(item, isUnselected = false) {
    const card = document.createElement('div');
    card.className = `grocery-card${isUnselected ? ' unselected-card' : ''}`;
    card.dataset.id = item.id;
    
    card.innerHTML = `
        <span class="swipe-hint">← Swipe to remove</span>
        <div class="card-content">
            <div class="item-header">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-unit-badge">${item.unit}</div>
            </div>
            <div class="item-controls">
                <div class="item-price-total">
                    ${formatCurrency(item.price * item.qty)}
                    <span>(${formatCurrency(item.price)}/${item.unit})</span>
                </div>
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
    } else {
        card.addEventListener('click', () => moveToSelected(item, card));
    }
    
    return card;
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
        
        if (currentX > 80) {
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
            showToast(`${item.name} removed`);
        }
    }, 300);
}

function setupCardControls(card, item) {
    const minusBtn = card.querySelector('.minus');
    const plusBtn = card.querySelector('.plus');
    const priceInput = card.querySelector('.price-input');
    
    minusBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (item.qty > 0.1) {
            item.qty = Math.round((item.qty - 1) * 10) / 10;
            if (item.qty < 0.1) item.qty = 0.1;
            await saveItem(item);
            updateCardDisplay(card, item);
            calculateTotal();
        }
        
        if (item.qty <= 0.1) {
            moveToUnselected(item, card);
        }
    });
    
    plusBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        item.qty = Math.round((item.qty + 1) * 10) / 10;
        await saveItem(item);
        updateCardDisplay(card, item);
        calculateTotal();
    });
    
    priceInput.addEventListener('change', async (e) => {
        e.stopPropagation();
        const newPrice = parseFloat(e.target.value) || 0;
        item.price = Math.max(0, newPrice);
        await saveItem(item);
        updateCardDisplay(card, item);
        calculateTotal();
    });
}

function updateCardDisplay(card, item) {
    card.querySelector('.qty-value').textContent = item.qty;
    card.querySelector('.item-price-total').innerHTML = `
        ${formatCurrency(item.price * item.qty)}
        <span>(${formatCurrency(item.price)}/${item.unit})</span>
    `;
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
                <svg viewBox="0 0 24 24">
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
            showToast(`${item.name} restored`);
        }
    }, 300);
}

function handleItemNameInput() {
    const nameInput = document.getElementById('itemName');
    const unitSelect = document.getElementById('itemUnit');
    
    const name = nameInput.value.trim();
    
    if (ITEM_SUGGESTIONS[name]) {
        unitSelect.value = ITEM_SUGGESTIONS[name];
    } else {
        const customSuggestion = state.suggestions.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (customSuggestion && customSuggestion.unit) {
            unitSelect.value = customSuggestion.unit;
        }
    }
}

async function addNewItem() {
    const nameInput = document.getElementById('itemName');
    const priceInput = document.getElementById('itemPrice');
    const qtyInput = document.getElementById('itemQty');
    const unitSelect = document.getElementById('itemUnit');
    
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value) || 0;
    const qty = parseFloat(qtyInput.value) || 1;
    const unit = unitSelect.value;
    
    if (!name) {
        showToast('Please enter item name');
        nameInput.focus();
        return;
    }
    
    if (!ITEM_SUGGESTIONS[name] && !state.suggestions.find(s => s.name.toLowerCase() === name.toLowerCase())) {
        await addSuggestion(name);
        state.suggestions.push({ name, unit });
        updateSuggestions();
    }
    
    const existingItem = state.items.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (existingItem) {
        existingItem.qty += qty;
        existingItem.price = price || existingItem.price;
        await saveItem(existingItem);
        renderCards();
        calculateTotal();
        showToast(`${name} updated`);
    } else {
        const newItem = {
            name,
            price,
            qty,
            unit,
            selected: true
        };
        
        const id = await saveItem(newItem);
        newItem.id = id;
        state.items.push(newItem);
        renderCards();
        calculateTotal();
        showToast(`${name} added`);
    }
    
    nameInput.value = '';
    priceInput.value = '';
    qtyInput.value = '1';
    nameInput.focus();
}

function shareToWhatsApp() {
    if (state.items.length === 0) {
        showToast('No items to share');
        return;
    }
    
    let message = '🛒 *Grocery List*\n\n';
    
    state.items.forEach(item => {
        const total = item.price * item.qty;
        message += `📦 ${item.name}\n`;
        message += `   Qty: ${item.qty} ${item.unit} × ${formatCurrency(item.price)} = ${formatCurrency(total)}\n\n`;
    });
    
    const grandTotal = state.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    message += `━━━━━━━━━━━━━━━\n`;
    message += `💰 *Total: ${formatCurrency(grandTotal)}*\n`;
    message += `━━━━━━━━━━━━━━━\n`;
    message += `\n_Sent via Grocery Marking App_`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
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

async function saveCurrentList() {
    if (state.items.length === 0) {
        showToast('No items to save');
        return;
    }
    
    const list = {
        date: new Date().toISOString(),
        items: [...state.items],
        total: state.items.reduce((sum, item) => sum + (item.price * item.qty), 0)
    };
    
    await saveList(list);
    state.savedLists.unshift({ ...list, id: Date.now() });
    
    showSavedListModal(list);
}

function showSavedListModal(list) {
    const modal = document.getElementById('savedListModal');
    const preview = document.getElementById('savedListPreview');
    
    preview.innerHTML = `
        <div style="font-size: 13px; color: #558B2F; margin-bottom: 12px;">
            Saved on ${new Date(list.date).toLocaleString()}
        </div>
        ${list.items.map(item => `
            <div class="saved-list-item">
                <span>${item.name} (${item.qty} ${item.unit})</span>
                <span style="font-weight: 600; color: #2E7D32;">${formatCurrency(item.price * item.qty)}</span>
            </div>
        `).join('')}
        <div class="saved-list-item" style="border-top: 2px solid #E8F5E9; margin-top: 12px; padding-top: 12px;">
            <strong>Total</strong>
            <strong style="color: #2E7D32;">${formatCurrency(list.total)}</strong>
        </div>
    `;
    
    modal.classList.add('active');
}

async function loadList(list) {
    await clearAll();
    state.items = [];
    state.unselectedItems = [];
    
    for (const item of list.items) {
        const newItem = { ...item, id: undefined };
        const id = await saveItem(newItem);
        state.items.push({ ...newItem, id });
    }
    
    renderCards();
    calculateTotal();
    closeHistoryModal();
    showToast('List loaded');
}

async function deleteListById(id) {
    await deleteList(id);
    state.savedLists = state.savedLists.filter(l => l.id !== id);
    renderHistory();
    showToast('List deleted');
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    
    if (state.savedLists.length === 0) {
        historyList.innerHTML = `
            <div class="no-history">
                <p>No saved lists yet</p>
                <p style="font-size: 14px; margin-top: 8px;">Save your current list to see it here</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = state.savedLists.map(list => `
        <div class="history-item" data-id="${list.id}">
            <div class="history-item-header">
                <span class="history-item-date">${new Date(list.date).toLocaleDateString()} ${new Date(list.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span class="history-item-total">${formatCurrency(list.total)}</span>
            </div>
            <div class="history-item-preview">
                ${list.items.map(i => `${i.name} (${i.qty} ${i.unit})`).join(', ')}
            </div>
            <div class="history-item-actions">
                <button class="btn btn-load" onclick="loadList(${JSON.stringify(list).replace(/"/g, '&quot;')})">Load</button>
                <button class="btn btn-delete" onclick="deleteListById(${list.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function showHistoryModal() {
    renderHistory();
    document.getElementById('historyModal').classList.add('active');
}

function closeHistoryModal() {
    document.getElementById('historyModal').classList.remove('active');
}

function closeSavedModal() {
    document.getElementById('savedListModal').classList.remove('active');
}

function init() {
    initDB().then(async (database) => {
        db = database;
        
        const items = await loadItems();
        state.items = items.filter(i => i.selected !== false);
        state.unselectedItems = items.filter(i => i.selected === false);
        
        state.savedLists = await loadSavedLists();
        state.suggestions = await loadSuggestions();
        updateSuggestions();
        
        renderCards();
        calculateTotal();
    }).catch(err => {
        console.error('DB Error:', err);
        showToast('Error loading data');
    });
    
    document.getElementById('addBtn').addEventListener('click', addNewItem);
    document.getElementById('shareBtn').addEventListener('click', shareToWhatsApp);
    document.getElementById('resetBtn').addEventListener('click', resetCart);
    document.getElementById('saveListBtn').addEventListener('click', saveCurrentList);
    document.getElementById('historyBtn').addEventListener('click', showHistoryModal);
    
    document.getElementById('closeHistory').addEventListener('click', closeHistoryModal);
    document.getElementById('closeSaved').addEventListener('click', closeSavedModal);
    
    document.getElementById('newListBtn').addEventListener('click', () => {
        closeSavedModal();
        resetCart();
    });
    
    document.getElementById('itemName').addEventListener('input', handleItemNameInput);
    
    document.getElementById('itemName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewItem();
    });
    
    document.getElementById('itemPrice').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewItem();
    });
    
    document.getElementById('itemQty').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewItem();
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
}

document.addEventListener('DOMContentLoaded', init);

window.loadList = loadList;
window.deleteListById = deleteListById;

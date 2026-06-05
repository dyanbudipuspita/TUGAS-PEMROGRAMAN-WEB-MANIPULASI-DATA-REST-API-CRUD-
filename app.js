/**
 * ShopForge — DummyJSON CRUD
 * Vanilla JS | Fetch API | async/await | try...catch
 */

const API_BASE = 'https://dummyjson.com/products';

// ── STATE ──────────────────────────────────────────────────────────────────
let products = [];
let editingId = null;
let pendingDeleteId = null;

// ── DOM REFS ───────────────────────────────────────────────────────────────
const form        = document.getElementById('product-form');
const inputName   = document.getElementById('input-name');
const inputPrice  = document.getElementById('input-price');
const inputCat    = document.getElementById('input-category');
const editIdEl    = document.getElementById('edit-id');
const submitBtn   = document.getElementById('submit-btn');
const submitLabel = document.getElementById('submit-label');
const cancelBtn   = document.getElementById('cancel-btn');
const productList = document.getElementById('product-list');
const skeletonList= document.getElementById('skeleton-list');
const emptyState  = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const countBadge  = document.getElementById('product-count');
const loadingOv   = document.getElementById('loading-overlay');
const confirmMod  = document.getElementById('confirm-modal');
const modalDesc   = document.getElementById('modal-desc');
const confirmBtn  = document.getElementById('confirm-delete-btn');
const methodTag   = document.getElementById('method-tag');
const chipLabel   = document.getElementById('chip-label');
const chipDot     = document.querySelector('.chip-dot');
const btnIco      = document.getElementById('btn-ico');

// ── TOAST ──────────────────────────────────────────────────────────────────
function showAlert(message, type = 'success') {
  const wrap = document.getElementById('toast-wrap');
  const icons = { success: '✓', error: '✕', info: '↻' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '•'}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  wrap.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 260);
  }, 4500);
}
function closeAlert() {} // kept for compatibility

// ── LOADING ────────────────────────────────────────────────────────────────
function setLoading(on) {
  loadingOv.classList.toggle('hidden', !on);
}

// ── MODAL ──────────────────────────────────────────────────────────────────
function openModal(id, name) {
  pendingDeleteId = id;
  modalDesc.textContent = `"${name}" akan dihapus dari koleksi pakaian.`;
  confirmMod.classList.remove('hidden');
}
function closeModal() {
  pendingDeleteId = null;
  confirmMod.classList.add('hidden');
}
confirmBtn.addEventListener('click', () => {
  if (pendingDeleteId !== null) deleteProduct(pendingDeleteId);
  closeModal();
});

// ── RENDER ─────────────────────────────────────────────────────────────────
function escHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str || ''));
  return d.innerHTML;
}

function renderProducts(list) {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = query
    ? list.filter(p => p.title.toLowerCase().includes(query))
    : list;

  countBadge.textContent = filtered.length;
  productList.innerHTML  = '';

  if (filtered.length === 0) {
    productList.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  productList.classList.remove('hidden');

  filtered.forEach((p, i) => {
    const price = typeof p.price === 'number'
      ? p.price.toFixed(2)
      : parseFloat(p.price || 0).toFixed(2);
    const cat = escHtml(p.category || '—');

    const card = document.createElement('div');
    card.className  = 'prod-card';
    card.dataset.id = p.id;
    card.style.animationDelay = `${i * 0.045}s`;
    card.innerHTML = `
      <div class="card-meta">
        <span class="card-id">#${p.id}</span>
        <span class="card-cat">${cat}</span>
      </div>
      <div class="card-name">${escHtml(p.title)}</div>
      <div class="card-price">$${price}</div>
      <div class="card-actions">
        <button class="c-btn c-btn-edit" onclick="startEdit(${p.id})">✎ Edit</button>
        <button class="c-btn c-btn-del"  onclick="openModal(${p.id}, '${escHtml(p.title).replace(/'/g,"\\'")}')">✕ Hapus</button>
      </div>
    `;
    productList.appendChild(card);
  });
}

// ── 1. FETCH (GET) ─────────────────────────────────────────────────────────
async function fetchProducts() {
  try {
    skeletonList.classList.remove('hidden');
    productList.classList.add('hidden');

    const res = await fetch(`${API_BASE}?limit=18&select=id,title,price,category`);
    if (!res.ok) throw new Error(`Server merespons ${res.status}: ${res.statusText}`);

    const data = await res.json();
    products = data.products || [];

    skeletonList.classList.add('hidden');
    renderProducts(products);
    showAlert(`${products.length} item pakaian berhasil dimuat`, 'success');

  } catch (err) {
    skeletonList.classList.add('hidden');
    emptyState.classList.remove('hidden');
    showAlert(`Gagal memuat produk: ${err.message}`, 'error');
    console.error('[fetchProducts]', err);
  }
}

// ── 2. TAMBAH (POST) ────────────────────────────────────────────────────────
async function addProduct(title, price, category) {
  try {
    setLoading(true);
    const res = await fetch(`${API_BASE}/add`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, price: parseFloat(price), category })
    });
    if (!res.ok) throw new Error(`POST gagal — status ${res.status}`);

    const newProduct = await res.json();

    const exists = products.find(p => p.id === newProduct.id);
    if (exists) newProduct.id = Date.now();
    products.unshift(newProduct);

    renderProducts(products);

    const newCard = productList.querySelector(`[data-id="${newProduct.id}"]`);
    if (newCard) newCard.classList.add('is-new');

    showAlert(`"${title}" berhasil ditambahkan ke koleksi! (ID: ${newProduct.id})`, 'success');
    resetForm();

  } catch (err) {
    showAlert(`Gagal menambah: ${err.message}`, 'error');
    console.error('[addProduct]', err);
  } finally {
    setLoading(false);
  }
}

// ── 3. EDIT (PATCH) ─────────────────────────────────────────────────────────
function startEdit(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  editingId        = id;
  editIdEl.value   = id;
  inputName.value  = product.title    || '';
  inputPrice.value = product.price    || '';
  inputCat.value   = product.category || '';

  // update UI
  methodTag.textContent = 'PATCH';
  methodTag.className   = 'method-tag patch';
  chipLabel.textContent = 'Edit Item Pakaian';
  chipDot.className     = 'chip-dot chip-amber';
  submitLabel.textContent = 'Simpan Pakaian';
  btnIco.textContent    = '✎';
  cancelBtn.classList.remove('hidden');

  document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  inputName.focus();
}

async function updateProduct(id, title, price, category) {
  try {
    setLoading(true);
    const apiId = id > 100000 ? 1 : id;

    const res = await fetch(`${API_BASE}/${apiId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, price: parseFloat(price), category })
    });
    if (!res.ok) throw new Error(`PATCH gagal — status ${res.status}`);
    await res.json();

    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], title, price: parseFloat(price), category };
    }

    renderProducts(products);

    const updCard = productList.querySelector(`[data-id="${id}"]`);
    if (updCard) updCard.classList.add('is-updated');

    showAlert(`"${title}" berhasil diperbarui!`, 'info');
    resetForm();

  } catch (err) {
    showAlert(`Gagal memperbarui: ${err.message}`, 'error');
    console.error('[updateProduct]', err);
  } finally {
    setLoading(false);
  }
}

// ── 4. HAPUS (DELETE) ───────────────────────────────────────────────────────
async function deleteProduct(id) {
  try {
    setLoading(true);
    const apiId = id > 100000 ? 1 : id;

    const res = await fetch(`${API_BASE}/${apiId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`DELETE gagal — status ${res.status}`);

    const result = await res.json();
    if (!result.isDeleted && apiId !== 1) {
      throw new Error('Server tidak mengkonfirmasi (isDeleted: false)');
    }

    const deleted = products.find(p => p.id === id);
    const card = productList.querySelector(`[data-id="${id}"]`);
    if (card) {
      card.style.transition = 'all 0.3s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.85)';
      setTimeout(() => {
        products = products.filter(p => p.id !== id);
        renderProducts(products);
      }, 300);
    } else {
      products = products.filter(p => p.id !== id);
      renderProducts(products);
    }

    const name = deleted ? deleted.title : `ID ${id}`;
    showAlert(`"${name}" berhasil dihapus dari koleksi!`, 'success');
    if (editingId === id) resetForm();

  } catch (err) {
    showAlert(`Gagal menghapus: ${err.message}`, 'error');
    console.error('[deleteProduct]', err);
  } finally {
    setLoading(false);
  }
}

// ── FORM SUBMIT ─────────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title    = inputName.value.trim();
  const price    = parseFloat(inputPrice.value);
  const category = inputCat.value.trim() || 'Pakaian';

  let valid = true;
  if (!title || title.length < 3) {
    inputName.classList.add('error');
    showAlert('Nama pakaian minimal 3 karakter!', 'error');
    valid = false;
  } else { inputName.classList.remove('error'); }

  if (isNaN(price) || price < 0) {
    inputPrice.classList.add('error');
    showAlert('Harga harus berupa angka positif!', 'error');
    valid = false;
  } else { inputPrice.classList.remove('error'); }

  if (!valid) return;

  if (editingId !== null) await updateProduct(editingId, title, price, category);
  else                    await addProduct(title, price, category);
});

// ── RESET ───────────────────────────────────────────────────────────────────
function cancelEdit() { resetForm(); }
function resetForm() {
  editingId = null;
  editIdEl.value = inputName.value = inputPrice.value = inputCat.value = '';
  inputName.classList.remove('error');
  inputPrice.classList.remove('error');

  methodTag.textContent   = 'POST';
  methodTag.className     = 'method-tag';
  chipLabel.textContent   = 'Tambah Item Pakaian';
  chipDot.className       = 'chip-dot chip-green';
  submitLabel.textContent = 'Tambah Pakaian';
  btnIco.textContent      = '＋';
  cancelBtn.classList.add('hidden');
}

// ── SEARCH ──────────────────────────────────────────────────────────────────
searchInput.addEventListener('input', () => renderProducts(products));

// ── ESCAPE ──────────────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    if (editingId !== null) resetForm();
  }
});

// ── INIT ────────────────────────────────────────────────────────────────────
fetchProducts();

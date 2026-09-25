// ============ دیتای پیش‌فرض منو ============
const DEFAULT_MENU = {
  food: [
    { id: 'f1', name: 'چلوکباب سلطانی', desc: 'برنج ایرانی، کباب کوبیده و برگ', price: 350000, img: '' },
    { id: 'f2', name: 'کباب بختیاری', desc: 'میکس مرغ و گوشت با گوجه کبابی', price: 320000, img: '' },
    { id: 'f3', name: 'جوجه کباب زعفرانی', desc: 'سینه مرغ مزه‌دار با زعفران', price: 220000, img: '' },
    { id: 'f4', name: 'کباب کوبیده', desc: 'دو سیخ کوبیده گوشت گوسفندی', price: 180000, img: '' },
    { id: 'f5', name: 'دنده کباب', desc: 'دنده بره با سس مخصوص', price: 480000, img: '' }
  ],
  drink: [
    { id: 'd1', name: 'دوغ محلی', desc: 'دوغ گازدار سنتی', price: 35000, img: '' },
    { id: 'd2', name: 'نوشابه قوطی', desc: 'کوکا، اسپرایت، فانتا', price: 30000, img: '' },
    { id: 'd3', name: 'آب پرتقال طبیعی', desc: 'تازه‌فشرده', price: 60000, img: '' },
    { id: 'd4', name: 'چای', desc: 'چای سیاه دم‌کشیده', price: 25000, img: '' },
    { id: 'd5', name: 'لیموناد', desc: 'لیمو تازه با نعنا', price: 55000, img: '' }
  ],
  hookah: [
    { id: 'h1', name: 'قلیون دو سیب', desc: 'تنباکو دو سیب سنتی', price: 180000, img: '' },
    { id: 'h2', name: 'قلیون انبه', desc: 'تنباکو انبه میوه‌ای', price: 190000, img: '' },
    { id: 'h3', name: 'قلیون نعنا', desc: 'تنباکو خنک نعنا', price: 170000, img: '' },
    { id: 'h4', name: 'قلیون مخلوط ویژه', desc: 'ترکیب مخصوص سرآشپز', price: 220000, img: '' }
  ]
};

// ============ مدیریت دیتا ============
function getMenu() {
  const saved = localStorage.getItem('grillMenu');
  return saved ? JSON.parse(saved) : DEFAULT_MENU;
}

// ============ متغیرها ============
let currentTable = null;
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// ============ انتخاب میز ============
window.addEventListener('DOMContentLoaded', () => {
  // چک URL برای شماره میز (QR Code): ?table=5
  const params = new URLSearchParams(window.location.search);
  const tableParam = params.get('table');

  if (tableParam) {
    currentTable = parseInt(tableParam);
    document.getElementById('tableNumber').textContent = currentTable;
    document.getElementById('tableModal').classList.add('hidden');
  } else {
    const savedTable = localStorage.getItem('tableNumber');
    if (savedTable) {
      currentTable = parseInt(savedTable);
      document.getElementById('tableNumber').textContent = currentTable;
      document.getElementById('tableModal').classList.add('hidden');
    }
  }

  renderMenu();
  renderCart();
  initTabs();
});

function setTable() {
  const input = document.getElementById('tableInput');
  const num = parseInt(input.value);
  if (!num || num < 1 || num > 50) {
    alert('لطفاً شماره میز معتبر (1 تا 50) وارد کنید');
    return;
  }
  currentTable = num;
  localStorage.setItem('tableNumber', num);
  document.getElementById('tableNumber').textContent = num;
  document.getElementById('tableModal').classList.add('hidden');
}

// ============ تب‌ها ============
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.category).classList.add('active');
    });
  });
}

// ============ رندر منو ============
function renderMenu() {
  const menu = getMenu();
  ['food', 'drink', 'hookah'].forEach(cat => {
    const section = document.getElementById(cat);
    if (!section) return;
    section.innerHTML = '';
    (menu[cat] || []).forEach(item => {
      const div = document.createElement('div');
      div.className = 'menu-item';
      div.innerHTML = `
        <img src="${item.img || 'https://via.placeholder.com/300x180/333/ff4500?text=' + encodeURIComponent(item.name)}" alt="${item.name}">
        <div class="menu-item-body">
          <h3>${item.name}</h3>
          <p>${item.desc || ''}</p>
          <div class="price">${item.price.toLocaleString('fa-IR')} تومان</div>
          <button onclick="addToCart('${item.id}', '${cat}')">افزودن به سفارش</button>
        </div>
      `;
      section.appendChild(div);
    });
  });
}

// ============ سبد خرید ============
function addToCart(id, category) {
  const menu = getMenu();
  const item = menu[category].find(i => i.id === id);
  if (!item) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, qty: 1, category });
  }
  saveCart();
  renderCart();
  updateCartCount();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  if (!container) return;
  container.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#888;padding:20px;">سبد خالی است</p>';
  }

  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <small>${(item.price * item.qty).toLocaleString('fa-IR')} تومان</small>
      </div>
      <div class="qty-controls">
        <button onclick="changeQty(${idx}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${idx}, 1)">+</button>
      </div>
    `;
    container.appendChild(div);
  });

  document.getElementById('cartTotal').textContent = total.toLocaleString('fa-IR');
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  renderCart();
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function toggleCart() {
  document.getElementById('cartPanel').classList.toggle('open');
}

document.getElementById('cartBtn')?.addEventListener('click', toggleCart);

// ============ ثبت سفارش ============
function submitOrder() {
  if (!currentTable) {
    alert('شماره میز مشخص نیست');
    return;
  }
  if (cart.length === 0) {
    alert('سبد خرید خالی است');
    return;
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const order = {
    id: 'ORD-' + Date.now(),
    table: currentTable,
    items: [...cart],
    total,
    time: new Date().toISOString(),
    status: 'new' // new | preparing | served
  };

  // ذخیره در localStorage (شبیه‌سازی ارسال به سرور)
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // پاک کردن سبد
  cart = [];
  saveCart();
  renderCart();
  updateCartCount();
  toggleCart();

  alert(`✅ سفارش شما برای میز ${currentTable} ثبت شد!\nبه زودی آماده می‌شود.`);
}

// نمایش خودکار مودال میز
window.addEventListener('load', () => {
  if (!currentTable) {
    document.getElementById('tableModal').classList.remove('hidden');
  } else {
    document.getElementById('tableModal').classList.add('hidden');
  }
});
const DEFAULT_MENU = {
  food: [
    { id: 'f1', name: 'چلوکباب سلطانی', desc: 'برنج ایرانی، کباب کوبیده و برگ', price: 350000, img: '' },
    { id: 'f2', name: 'کباب بختیاری', desc: 'میکس مرغ و گوشت', price: 320000, img: '' },
    { id: 'f3', name: 'جوجه کباب زعفرانی', desc: 'سینه مرغ مزه‌دار', price: 220000, img: '' },
    { id: 'f4', name: 'کباب کوبیده', desc: 'دو سیخ کوبیده', price: 180000, img: '' },
    { id: 'f5', name: 'دنده کباب', desc: 'دنده بره با سس مخصوص', price: 480000, img: '' }
  ],
  drink: [
    { id: 'd1', name: 'دوغ محلی', desc: 'دوغ گازدار سنتی', price: 35000, img: '' },
    { id: 'd2', name: 'نوشابه قوطی', desc: 'کوکا، اسپرایت', price: 30000, img: '' },
    { id: 'd3', name: 'آب پرتقال طبیعی', desc: 'تازه‌فشرده', price: 60000, img: '' },
    { id: 'd4', name: 'چای', desc: 'چای سیاه', price: 25000, img: '' },
    { id: 'd5', name: 'لیموناد', desc: 'لیمو تازه', price: 55000, img: '' }
  ],
  hookah: [
    { id: 'h1', name: 'قلیون دو سیب', desc: 'تنباکو دو سیب', price: 180000, img: '' },
    { id: 'h2', name: 'قلیون انبه', desc: 'تنباکو انبه', price: 190000, img: '' },
    { id: 'h3', name: 'قلیون نعنا', desc: 'تنباکو خنک', price: 170000, img: '' },
    { id: 'h4', name: 'قلیون مخلوط ویژه', desc: 'ترکیب مخصوص', price: 220000, img: '' }
  ]
};

function getMenu() {
  const saved = localStorage.getItem('grillMenu');
  return saved ? JSON.parse(saved) : DEFAULT_MENU;
}
function saveMenu(menu) {
  localStorage.setItem('grillMenu', JSON.stringify(menu));
}

function showPanel(id) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`.admin-tab[onclick*="${id}"]`).classList.add('active');
  document.getElementById(id).classList.add('active');

  if (id === 'menu') renderMenuEditor();
  if (id === 'qrcodes') renderQRCodes();
}

// ============ سفارشات ============
function getOrders() {
  return JSON.parse(localStorage.getItem('orders') || '[]');
}

function renderOrders() {
  const container = document.getElementById('ordersList');
  const orders = getOrders().sort((a, b) => new Date(b.time) - new Date(a.time));

  if (orders.length === 0) {
    container.innerHTML = '<p style="color:#888; text-align:center; padding:30px;">هیچ سفارشی وجود ندارد</p>';
    return;
  }

  container.innerHTML = '';
  orders.forEach(order => {
    const time = new Date(order.time).toLocaleTimeString('fa-IR');
    const div = document.createElement('div');
    div.className = `order-card ${order.status}`;
    div.innerHTML = `
      <div class="order-header">
        <h3>🪑 میز ${order.table}</h3>
        <span class="badge ${order.status}">
          ${order.status === 'new' ? 'جدید' : order.status === 'preparing' ? 'در حال آماده‌سازی' : 'تحویل شده'}
        </span>
      </div>
      <small style="color:#888;">کد: ${order.id} | ساعت: ${time}</small>
      <ul class="order-items">
        ${order.items.map(i => `
          <li>
            <span>${i.name} × ${i.qty}</span>
            <span>${(i.price * i.qty).toLocaleString('fa-IR')} تومان</span>
          </li>
        `).join('')}
      </ul>
      <div style="text-align:left; font-size:1.1rem;">
        جمع: <strong style="color:#4caf50;">${order.total.toLocaleString('fa-IR')} تومان</strong>
      </div>
      <div class="order-actions">
        ${order.status === 'new' ? `<button class="btn-prep" onclick="changeStatus('${order.id}', 'preparing')">👨‍🍳 شروع آماده‌سازی</button>` : ''}
        ${order.status === 'preparing' ? `<button class="btn-serve" onclick="changeStatus('${order.id}', 'served')">✅ تحویل شد</button>` : ''}
        <button class="btn-delete" onclick="deleteOrder('${order.id}')">🗑 حذف</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function changeStatus(id, status) {
  const orders = getOrders();
  const o = orders.find(x => x.id === id);
  if (o) o.status = status;
  localStorage.setItem('orders', JSON.stringify(orders));
  renderOrders();
}

function deleteOrder(id) {
  if (!confirm('حذف این سفارش؟')) return;
  const orders = getOrders().filter(o => o.id !== id);
  localStorage.setItem('orders', JSON.stringify(orders));
  renderOrders();
}

// ============ ویرایش منو ============
function renderMenuEditor() {
  const menu = getMenu();
  const container = document.getElementById('menuEditor');
  container.innerHTML = '';
  const catNames = { food: '🍖 غذا', drink: '🥤 نوشیدنی', hookah: '💨 قلیون' };

  ['food', 'drink', 'hookah'].forEach(cat => {
    const h = document.createElement('h3');
    h.style.cssText = 'margin:15px 0 10px; color:#ffa500;';
    h.textContent = catNames[cat];
    container.appendChild(h);

    (menu[cat] || []).forEach(item => {
      const div = document.createElement('div');
      div.className = 'menu-edit-item';
      div.innerHTML = `
        <input value="${item.name}" onchange="updateItem('${cat}', '${item.id}', 'name', this.value)">
        <input value="${item.desc || ''}" onchange="updateItem('${cat}', '${item.id}', 'desc', this.value)">
        <input type="number" value="${item.price}" onchange="updateItem('${cat}', '${item.id}', 'price', this.value)">
        <button onclick="deleteItem('${cat}', '${item.id}')">حذف</button>
      `;
      container.appendChild(div);
    });
  });
}

function updateItem(cat, id, field, value) {
  const menu = getMenu();
  const item = menu[cat].find(i => i.id === id);
  if (!item) return;
  item[field] = field === 'price' ? parseInt
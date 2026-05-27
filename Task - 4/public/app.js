const api = (path, opts = {}) => {
  const headers = opts.headers || {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return fetch(path, { ...opts, headers }).then(async res => {
    const ok = res.ok;
    const data = await res.json().catch(()=>({}));
    if (!ok) throw data;
    return data;
  });
};

function showUser(user) {
  const disp = document.getElementById('userDisplay');
  const logoutBtn = document.getElementById('logoutBtn');
  if (user) {
    disp.innerText = user.name + ' (' + user.role + ')';
    logoutBtn.classList.remove('hidden');
    if (user.role === 'admin') document.getElementById('adminActions').classList.remove('hidden');
  } else {
    disp.innerText = '';
    logoutBtn.classList.add('hidden');
    document.getElementById('adminActions').classList.add('hidden');
  }
}

function loadProducts() {
  api('/api/products').then(list => {
    const el = document.getElementById('products');
    el.innerHTML = '';
    list.forEach(p => {
      const d = document.createElement('div'); d.className='card product-card';
      d.innerHTML = `
        <div class="product-title">${p.title}</div>
        <div class="muted">${p.description||''}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
          <div class="product-price">$${p.price}</div>
          <div class="small muted">Stock: ${p.stock}</div>
        </div>
      `;
      el.appendChild(d);
    });
  }).catch(e=>console.error(e));
}

document.getElementById('registerForm').addEventListener('submit', e=>{
  e.preventDefault();
  const f = e.target;
  const data = { name: f.name.value, email: f.email.value, password: f.password.value };
  api('/auth/register', { method:'POST', body: JSON.stringify(data), headers:{'Content-Type':'application/json'} }).then(res=>{
    localStorage.setItem('token', res.token);
    showUser(res.user);
    loadProducts();
  }).catch(err=>alert(err.error||JSON.stringify(err)));
});

document.getElementById('loginForm').addEventListener('submit', e=>{
  e.preventDefault();
  const f = e.target;
  const data = { email: f.email.value, password: f.password.value };
  api('/auth/login', { method:'POST', body: JSON.stringify(data), headers:{'Content-Type':'application/json'} }).then(res=>{
    localStorage.setItem('token', res.token);
    showUser(res.user);
    loadProducts();
  }).catch(err=>alert(err.error||JSON.stringify(err)));
});

document.getElementById('logoutBtn').addEventListener('click', ()=>{
  localStorage.removeItem('token');
  showUser(null);
});

document.getElementById('productForm').addEventListener('submit', e=>{
  e.preventDefault();
  const f = e.target;
  const data = { title: f.title.value, price: parseFloat(f.price.value), stock: parseInt(f.stock.value,10), description: f.description.value };
  api('/api/products', { method:'POST', body: JSON.stringify(data), headers:{'Content-Type':'application/json'} }).then(()=>{
    f.reset(); loadProducts();
  }).catch(err=>alert(err.error||JSON.stringify(err)));
});

// Initialize user display if token exists
(() => {
  const token = localStorage.getItem('token');
  if (!token) return;
  // decode simple payload
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    showUser({ name: payload.email, role: payload.role });
  } catch (e) { console.warn('Invalid token'); }
  loadProducts();
})();

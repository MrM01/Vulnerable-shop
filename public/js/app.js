// [VULN-3, parte frontend] Las reseñas se insertan con innerHTML, sin
// escapar el contenido que viene del backend. Esto es lo que convierte
// el XSS almacenado del backend en ejecución real en el navegador.

function escapeHtml(str) { 
  const div = document.createElement('div'); div.textContent = str; return div.innerHTML; 
}

async function loadProducts() {
  const container = document.getElementById('products');
  if (!container) return;

  const products = await fetch('/api/products').then(r => r.json());

  for (const product of products) {
    const reviews = await fetch(`/api/products/${product.id}/reviews`).then(r => r.json());
    const reviewsHtml = reviews 
      .map(r => `<div class="review"><b>${escapeHtml(r.author)}</b>: ${escapeHtml(r.comment)}</div>`) 
      .join('');

    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <h3>${product.name} - Q${product.price}</h3>
      ${reviewsHtml}
    `;
    container.appendChild(div);
  }
}

async function submitReview() {
  const productId = document.getElementById('reviewProductId').value;
  const author = document.getElementById('reviewAuthor').value;
  const comment = document.getElementById('reviewComment').value;

  await fetch(`/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, comment }),
  });

  location.reload();
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  document.getElementById('result').textContent = JSON.stringify(data, null, 2);

  if (data.token) {
    sessionStorage.setItem('token', data.token);
  }
}

async function loadProfile() {
  const id = document.getElementById('userId').value;
  const token = sessionStorage.getItem('token');

  if (!token) {
    document.getElementById('profileResult').textContent = 'Inicia sesión primero en /login.html';
    return;
  }

  const res = await fetch(`/api/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  document.getElementById('profileResult').textContent = JSON.stringify(data, null, 2);
}

const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('attachment');
    const formData = new FormData();
    formData.append('attachment', fileInput.files[0]);

    const res = await fetch('/api/upload/feedback', { method: 'POST', body: formData });
    const data = await res.json();
    document.getElementById('uploadResult').textContent = JSON.stringify(data, null, 2);
  });
}

loadProducts();

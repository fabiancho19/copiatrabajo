document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-cart');
  if (!btn) return;

  const id = btn.dataset.id;
  const nombre = btn.dataset.nombre;
  const precio = Number(btn.dataset.precio);
  const imagen = btn.dataset.imagen || '';
  const color = btn.dataset.color || '';

  const cart = readCart();
  const i = cart.findIndex(p => p.id === id);

  if (i >= 0) cart[i].qty += 1;
  else cart.push({ id, nombre, precio, qty: 1, imagen, color });

  function toast(msg){
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
    }, 2200);
  }

  writeCart(cart);

  const originalText = btn.textContent;
  btn.textContent = "Añadido al carrito ✓";
  btn.style.background = "#1a1a1a"; 

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = ""; 
  }, 2000);

  toast(`${nombre} añadido al carrito `);
});

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  const hero = document.createElement("section");
  hero.className = "hero";

  const title = document.createElement("h1");
  title.textContent = "KAVA";

  const subtitle = document.createElement("p");
  subtitle.textContent = "Luxury & Style";

  hero.appendChild(title);
  hero.appendChild(subtitle);
  app.appendChild(hero);

  window.addEventListener("scroll", () => {
    const scroll = window.scrollY;
    const scale = Math.max(1 - scroll / 600, 0.75);
    title.style.transform = `scale(${scale})`;
    subtitle.style.opacity = Math.max(1 - scroll / 300, 0);
  });
});

window.addEventListener("scroll", () => {
  const miniHeader = document.getElementById("mini-header");
  if (window.scrollY > 300) miniHeader.classList.add("show");
  else miniHeader.classList.remove("show");
});

document.addEventListener("DOMContentLoaded", () => {
  const details = document.getElementById('menu-hamb');
  const summary = document.getElementById('hamburger');
  if (!details || !summary) return;

  const syncAria = () => summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
  details.addEventListener('toggle', syncAria);
  syncAria();

  details.querySelector('#nav')?.addEventListener('click', (e) => {
    if (e.target.closest('a')) details.open = false;
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') details.open = false; });
});

// Precios en COP, tallas y colores según catálogo.
(function renderCatalog(){
  const grid = document.getElementById('grid-productos');
  const tpl  = document.getElementById('tpl-tarjeta');
  if (!grid || !tpl) return;

  const money = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);

  grid.innerHTML = ''; 
  PRODUCTS.forEach(prod => {
    const node = tpl.content.cloneNode(true);

    const $img   = node.querySelector('img');
    const $name  = node.querySelector('strong');
    const $talla = node.querySelector('.tallas');
    const $price = node.querySelector('em');
    const $menu  = node.querySelector('.colores');
    const $btn   = node.querySelector('[data-add]');

    // Datos base
    $name.textContent = prod.nombre;
    $talla.textContent = `Tallas: ${prod.tallas}`;
    $price.textContent = money(prod.precio);
    $img.src = prod.imagen || 'img/default.jpg';
    $img.alt = prod.nombre;

    // swatch de colores
    let selectedColor = prod.colores[0] || null;
    prod.colores.forEach((c, idx) => {
      const li = document.createElement('li');
      const b  = document.createElement('button');
      b.type = 'button';
      b.title = c.replace('-', ' ');
      b.style.setProperty('--c', COLOR_HEX[c] || '#ccc');
      b.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
      b.addEventListener('click', () => {
        selectedColor = c;
        $menu.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed','false'));
        b.setAttribute('aria-pressed','true');
        $name.textContent = `${prod.nombre} — ${c.replace('-', ' ')}`;
      });
      li.appendChild(b);
      $menu.appendChild(li);
    });

    $btn.addEventListener('click', () => {
      const old = $btn.textContent;
      $btn.textContent = 'Añadido ✓';
      setTimeout(() => { $btn.textContent = old; }, 900);
    });

    grid.appendChild(node);
  });
})();

// (filtrado en vivo)
(function(){
  const input = document.getElementById('buscador');
  const form  = document.getElementById('buscador-form');
  if (!input || !form) return;

  const norm = s => (s||'').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();

  // Ir a la sección colección al enviar (enter)
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const target = document.getElementById('novedades');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const filtrar = () => {
    const q = norm(input.value);
    const grid = document.getElementById('grid-productos');
    if (!grid) return;

    const cards = grid.querySelectorAll('article');
    if (!q){
      cards.forEach(a => a.removeAttribute('hidden'));
      return;
    }
    cards.forEach(a => {
      const txt = norm(a.textContent);
      const show = txt.includes(q);
      if (show) a.removeAttribute('hidden'); else a.setAttribute('hidden','');
    });
  };

  input.addEventListener('input', filtrar);
})();

// carrito
const CART_KEY = 'kava_cart';
const readCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
};
const writeCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

/* Enganche: al crear cada tarjeta, añadimos al carrito el ítem pulsado */
(function hookAddButtons(){
  const grid = document.getElementById('grid-productos');
  if (!grid) return;

  const clickHandler = (e) => {
    const btn = e.target.closest('button[data-add]');
    if (!btn) return;

    const card = btn.closest('article');
    if (!card) return;

    const name = card.querySelector('strong')?.textContent || '';
    const priceText = card.querySelector('em')?.textContent || '';
    const img = card.querySelector('img')?.getAttribute('src') || '';
    const baseName = name.split(' — ')[0].trim();
    const colorSel = (name.includes(' — ') ? name.split(' — ')[1].trim() : null) || 'default';

    const precio = (() => {
      const m = priceText.replace(/[^\d]/g,'');
      return m ? Number(m) : 0;
    })();

    const id = (baseName + '|' + colorSel).toLowerCase().replace(/\s+/g,'-');

    const cart = readCart();
    const ix = cart.findIndex(i => i.id === id);
    if (ix > -1) cart[ix].qty += 1;
    else cart.push({ id, nombre: baseName, color: colorSel, precio: precio, qty: 1, imagen: img });

    writeCart(cart);

    const old = btn.textContent;
    btn.textContent = 'Añadido ✓';
    setTimeout(() => { btn.textContent = old; }, 900);
  };

  grid.addEventListener('click', clickHandler);
})();

// Privacidad
function aceptarPrivacidad() {
  document.getElementById('modal-privacidad').classList.add('oculto');
}
function rechazarPrivacidad() {
  document.querySelector('.modal-body').innerHTML = `
    <p style="text-align: center; padding: 40px 20px; font-size: 16px; color: #13343b;">
      <strong>Debes aceptar nuestra Política de Privacidad para continuar usando el sitio.</strong>
    </p>`;
  document.querySelector('.btn-rechazar').style.display = 'none';
}

// ===== ZOOM EN FIGURES CON CLASS zoom-wrap =====
document.addEventListener('pointerdown', e => {
  const wrap = e.target.closest('.zoom-wrap');
  if (!wrap) return;
  wrap.classList.toggle('zoomed');
});
document.addEventListener('mousemove', e => {
  const wrap = e.target.closest('.zoom-wrap.zoomed');
  if (!wrap) return;
  const img = wrap.querySelector('img');
  const rect = wrap.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width * 100;
  const y = (e.clientY - rect.top) / rect.height * 100;
  img.style.transformOrigin = `${x}% ${y}%`;
});
document.addEventListener('touchmove', e => {
  const wrap = e.target.closest('.zoom-wrap.zoomed');
  if (!wrap) return;
  const img = wrap.querySelector('img');
  const rect = wrap.getBoundingClientRect();
  const touch = e.touches[0];
  const x = (touch.clientX - rect.left) / rect.width * 100;
  const y = (touch.clientY - rect.top) / rect.height * 100;
  img.style.transformOrigin = `${x}% ${y}%`;
}, { passive: true });

/* =========================
   CHIP DE USUARIO (NUEVO)
   ========================= */
(function(){
  const chip   = document.getElementById('user-chip');
  const nameEl = document.getElementById('user-name');
  if(!chip || !nameEl) return;
/* ===== CERRAR SESIÓN ===== */
(function(){
  // Crea el botón de cerrar sesión si no existe
  let logoutBtn = document.getElementById('logout-btn');
  if (!logoutBtn) {
    logoutBtn = document.createElement('button');
    logoutBtn.id = 'logout-btn';
    logoutBtn.textContent = 'Cerrar sesión';
    logoutBtn.className = 'logout-btn';
    document.body.appendChild(logoutBtn);
  }

  // Estilos rápidos opcionales (puedes moverlos a tu CSS)
  logoutBtn.style.position = 'fixed';
  logoutBtn.style.bottom = '20px';
  logoutBtn.style.right = '20px';
  logoutBtn.style.background = '#000';
  logoutBtn.style.color = '#fff';
  logoutBtn.style.border = 'none';
  logoutBtn.style.padding = '10px 16px';
  logoutBtn.style.borderRadius = '8px';
  logoutBtn.style.cursor = 'pointer';
  logoutBtn.style.fontWeight = '700';
  logoutBtn.style.zIndex = '9999';

  // Acción: borrar datos y volver a Login
  logoutBtn.addEventListener('click', () => {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
      localStorage.removeItem('usuario');
      localStorage.removeItem('rol');
      localStorage.removeItem('kava_cart'); // limpia carrito también si quieres
      location.href = 'Login.html';
    }
  });
})();

  // 1) Nombre desde localStorage (clave 'usuario' como en admin)
  const u = JSON.parse(localStorage.getItem('usuario') || 'null');
  const nombre = (u && (u.Nombre || u.nombre)) ? (u.Nombre || u.nombre) : 'Registrate';
  nameEl.textContent = nombre;

  // 2) Click: si está logueado, ve a perfil; si no, a Login
  chip.addEventListener('click', ()=>{
    if(u && (u.Nombre || u.nombre)) {
      location.href = 'Perfil.html';
    } else {
      location.href = 'Login.html';
    }
  });

  // 3) Recalcular posición: a la izq del carrito, sin chocar con buscador
  const ajustarOffset = () => {
    if (window.matchMedia('(max-width: 768px)').matches) return; // en móvil no hace falta
    const buscador = document.getElementById('buscador');
    const carrito  = document.getElementById('carrito-link');
    if(!buscador || !carrito) return;

    const wBuscador = buscador.getBoundingClientRect().width || 160;
    const wCarrito  = carrito.getBoundingClientRect().width  || 36;
    const wChip     = chip.getBoundingClientRect().width     || 180;
    const GAP = 12;
    const offset = -1 * (wBuscador + wCarrito + GAP + wChip);
    chip.style.transform = `translateY(-50%) translateX(${offset}px)`;
  };

  window.addEventListener('load', ajustarOffset);
  window.addEventListener('resize', ajustarOffset);
  setTimeout(ajustarOffset, 120);
})();
/* ===== User Icon + Menú (solo si hay sesión) ===== */
(function(){
  const trigger = document.getElementById('user-trigger');
  const menu    = document.getElementById('user-menu');
  if(!trigger || !menu) return;

  // ¿Hay sesión?
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  // Si NO hay sesión, ocultamos todo
  if(!usuario || !(usuario.Nombre || usuario.nombre)){
    trigger.hidden = true;
    menu.hidden = true;
    return;
  }

  // Hay sesión → mostramos el icono
  trigger.hidden = false;

  // Posicionar EXACTO a la izquierda del carrito (sin chocar con buscador)
  const ajustarOffset = () => {
    if (window.matchMedia('(max-width: 768px)').matches) return; // móvil ya usa layout
    const buscador = document.getElementById('buscador');
    const carrito  = document.getElementById('carrito-link');
    if(!buscador || !carrito) return;

    const wBuscador = buscador.getBoundingClientRect().width || 160;
    const wCarrito  = carrito.getBoundingClientRect().width  || 36;
    const wIcon     = trigger.getBoundingClientRect().width  || 36;
    const GAP = 12;
    const offset = -1 * (wBuscador + wCarrito + GAP + wIcon);
    trigger.style.transform = `translateY(-50%) translateX(${offset}px)`;
  };
  window.addEventListener('load', ajustarOffset);
  window.addEventListener('resize', ajustarOffset);
  setTimeout(ajustarOffset, 120);

  // Toggle del menú
  const openMenu = () => { menu.hidden = false; trigger.setAttribute('aria-expanded','true'); };
  const closeMenu = () => { menu.hidden = true;  trigger.setAttribute('aria-expanded','false'); };

  trigger.addEventListener('click', (e)=>{
    e.stopPropagation();
    menu.hidden ? openMenu() : closeMenu();
  });

  // Cerrar al hacer click fuera o con Escape
  document.addEventListener('click', (e)=>{
    if(!menu.hidden && !e.target.closest('#user-menu') && e.target !== trigger){
      closeMenu();
    }
  });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeMenu(); });

  // Acciones del menú
  document.getElementById('go-profile')?.addEventListener('click', ()=>{
    location.href = 'Perfil.html';
  });

  document.getElementById('logout')?.addEventListener('click', ()=>{
    // Limpia y redirige
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('kava_cart');
    location.href = 'Login.html';
  });
})();
/* ===== User Chip + Menú (solo si hay sesión) ===== */
(function(){
  const trigger = document.getElementById('user-trigger');
  const nameEl  = document.getElementById('user-trigger-name');
  const menu    = document.getElementById('user-menu');
  if(!trigger || !nameEl || !menu) return;

  // lee usuario
  const u = JSON.parse(localStorage.getItem('usuario') || 'null');
  const nombre = (u && (u.Nombre || u.nombre)) ? (u.Nombre || u.nombre) : null;

  // sin sesión => no mostrar
  if(!nombre){
    trigger.hidden = true;
    menu.hidden = true;
    return;
  }

  // con sesión
  nameEl.textContent = nombre;
  trigger.hidden = false;

  // Colocar a la izquierda del carrito/buscador
// === Posición exacta del chip usuario ===

  window.addEventListener('load', ajustarOffset);
  window.addEventListener('resize', ajustarOffset);
  setTimeout(ajustarOffset, 120);

  // abrir/cerrar menú
  const openMenu = () => { menu.hidden = false; trigger.setAttribute('aria-expanded','true'); };
  const closeMenu = () => { menu.hidden = true;  trigger.setAttribute('aria-expanded','false'); };

  trigger.addEventListener('click', (e)=>{ e.stopPropagation(); menu.hidden ? openMenu() : closeMenu(); });
  document.addEventListener('click', (e)=>{ if(!menu.hidden && !e.target.closest('#user-menu')) closeMenu(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeMenu(); });

  // acciones
  document.getElementById('go-profile')?.addEventListener('click', ()=>{ location.href = 'Perfil.html'; });
  document.getElementById('logout')?.addEventListener('click', ()=>{
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('kava_cart');
    location.href = 'Login.html';
  });
})();

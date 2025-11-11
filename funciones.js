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
//(filtrado en vivo)
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
    if (!grid) return; // aún no hay catálogo, salimos

    const cards = grid.querySelectorAll('article');
    if (!q){
      cards.forEach(a => a.removeAttribute('hidden'));
      return;
    }
    cards.forEach(a => {
      const txt = norm(a.textContent);
      // match básico por nombre, tallas, precio, color.
      const show = txt.includes(q);
      if (show) a.removeAttribute('hidden'); else a.setAttribute('hidden','');
    });
  };

  input.addEventListener('input', filtrar);
})();
//carrito
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

  // Observa las tarjetas ya renderizadas y futuras (por si re-renders)
  const clickHandler = (e) => {
    const btn = e.target.closest('button[data-add]');
    if (!btn) return;

    const card = btn.closest('article');
    if (!card) return;

    const name = card.querySelector('strong')?.textContent || '';
    const priceText = card.querySelector('em')?.textContent || '';
    const img = card.querySelector('img')?.getAttribute('src') || '';
    const baseName = name.split(' — ')[0].trim();      // nombre sin color agregado
    const colorSel = (name.includes(' — ') ? name.split(' — ')[1].trim() : null) || 'default';

    // Tomamos precio a partir del catálogo renderizado (ya formateado a COP)
    const precio = (() => {
      // intenta extraer número del <em> formateado COP
      const m = priceText.replace(/[^\d]/g,'');
      return m ? Number(m) : 0;
    })();

    // id robusto con color
    const id = (baseName + '|' + colorSel).toLowerCase().replace(/\s+/g,'-');

    const cart = readCart();
    const ix = cart.findIndex(i => i.id === id);
    if (ix > -1) cart[ix].qty += 1;
    else cart.push({ id, nombre: baseName, color: colorSel, precio: precio, qty: 1, imagen: img });

    writeCart(cart);

    // feedback rápido (manteniendo tu animación original si existe)
    const old = btn.textContent;
    btn.textContent = 'Añadido ✓';
    setTimeout(() => { btn.textContent = old; }, 900);
  };

  grid.addEventListener('click', clickHandler);
})();
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
const swatches = document.querySelectorAll('.swatches');

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

// En móvil (mantiene zoom mientras tocas)
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

// Formularios de Google llenados por ClaroGo! (ventas y no venta).
// 1. En el registro de no venta pasa solo a la segunda hoja ("Siguiente").
// 2. Vigila la página todo el rato: apenas aparece el botón Enviar de Google, muestra un panel fijo (visible sin bajar)
//    con todas las respuestas ya escritas y un botón "Enviar formulario" que parpadea hasta que el ejecutivo lo presiona.
//    El botón Enviar de Google también parpadea de forma permanente. Nunca se envía nada sin el clic del ejecutivo.
(async () => {
  const NV = '1FAIpQLSeWwyqN1vbUn3wOvHTImDsNFbUwVvG0rijrWWggigDqOrgJHQ';
  const VENTA = '1FAIpQLSe3nbhazUn9YVJqTLlP6tOdMZum-VkfEa9wTE8yAGPTqVuRsw';
  const esNV = location.pathname.includes(NV), esVenta = location.pathname.includes(VENTA);
  if (!esNV && !esVenta || window.__cgFormas) return;
  window.__cgFormas = true;
  const esperar = ms => new Promise(r => setTimeout(r, ms));

  let pedido = null;
  if (esNV) {
    pedido = (await chrome.storage.local.get('nv_pedido')).nv_pedido;
    if (!pedido || Date.now() - pedido.ts > 15 * 60000) return;   // solo si se abrió desde la extensión hace poco
  } else if (!/entry\./.test(location.search)) return;           // formulario de ventas abierto lleno desde ClaroGo!

  const estilo = document.createElement('style');
  estilo.textContent = `
    @keyframes cgLatido{0%,100%{box-shadow:0 0 0 0 rgba(19,128,74,.75);transform:scale(1)}50%{box-shadow:0 0 0 12px rgba(19,128,74,0);transform:scale(1.06)}}
    .cg-enviar{outline:4px solid #13804a!important;outline-offset:3px;border-radius:8px;animation:cgLatido 1s ease-in-out infinite!important}
    .cg-lleno{outline:3px solid #1a56b8!important;outline-offset:4px;border-radius:10px}
    #cg-panel{position:fixed;right:16px;top:16px;z-index:2147483647;width:min(360px,92vw);max-height:calc(100vh - 32px);overflow:auto;padding:14px;border-radius:16px;background:#fff;color:#1f2430;font:13px/1.4 "Segoe UI",system-ui,sans-serif;box-shadow:0 16px 40px rgba(0,0,0,.35);border:3px solid #1a56b8}
    #cg-panel h3{margin:0 0 4px;font-size:15px;color:#1a56b8}
    #cg-panel .cg-sub{margin:0 0 8px;color:#5f6673;font-size:12px}
    #cg-panel .cg-fila{padding:5px 0;border-top:1px solid #e3e6eb;cursor:pointer}
    #cg-panel .cg-fila b{display:block;font-size:12px}
    #cg-panel .cg-fila span{color:#374151}
    #cg-panel .cg-ok{color:#13804a;font-weight:900}
    #cg-panel button{width:100%;border:0;border-radius:12px;font:800 15px "Segoe UI",system-ui,sans-serif;cursor:pointer}
    #cg-enviar-ya{margin-top:10px;padding:13px;background:#13804a;color:#fff;animation:cgLatido 1s ease-in-out infinite}
    #cg-ir{margin-top:6px;padding:8px;background:#eef4ff;color:#1a56b8;font-size:13px!important}
    #cg-paso{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:2147483647;padding:12px 18px;border-radius:14px;font:600 15px/1.4 "Segoe UI",system-ui,sans-serif;color:#fff;background:#1a56b8;box-shadow:0 10px 30px rgba(0,0,0,.3)}`;
  document.documentElement.appendChild(estilo);

  const boton = txt => [...document.querySelectorAll('[role="button"]')].find(b => b.innerText.trim() === txt);
  const paso = t => { let p = document.getElementById('cg-paso'); if (!p) { p = document.createElement('div'); p.id = 'cg-paso'; document.documentElement.appendChild(p); } p.textContent = t; return p; };

  // Paso 1: primera hoja del registro de no venta → Siguiente
  for (let i = 0; i < 40 && !boton('Siguiente') && !boton('Enviar'); i++) await esperar(250);
  if (esNV && boton('Siguiente') && !boton('Enviar') && !pedido.avanzo) {
    paso('ClaroGo!: "Cliente evaluado: No" listo. Pasando a la hoja del motivo…');
    pedido.avanzo = true; await chrome.storage.local.set({ nv_pedido: pedido });
    await esperar(1000);
    const s = boton('Siguiente'); if (s) s.click();
  }

  // Paso 2: vigilar hasta que aparezca el botón Enviar (sirve si Google recarga la página o si cambia de hoja sin recargar)
  const lleno = q => {
    if ([...q.querySelectorAll('input[type="text"],input[type="email"],input[type="date"],input:not([type]),textarea')].some(i => i.type !== 'hidden' && String(i.value || '').trim())) return true;
    if (q.querySelector('[role="radio"][aria-checked="true"],[role="checkbox"][aria-checked="true"]')) return true;
    const op = q.querySelector('[role="listbox"] [role="option"][aria-selected="true"]');
    return !!(op && (op.getAttribute('data-value') || '').trim());
  };
  const valor = q => {
    const t = [...q.querySelectorAll('input[type="text"],input[type="email"],input[type="date"],input:not([type]),textarea')].map(i => i.type !== 'hidden' ? String(i.value || '').trim() : '').filter(Boolean).join(' ');
    if (t) return t;
    const r = q.querySelector('[role="radio"][aria-checked="true"],[role="checkbox"][aria-checked="true"]');
    if (r) { const v = r.getAttribute('data-value') || ''; return v === '__other_option__' ? 'Otro' : v; }
    const o = q.querySelector('[role="listbox"] [role="option"][aria-selected="true"]');
    return o ? o.getAttribute('data-value') || '' : '';
  };
  const titulo = q => ((q.querySelector('[role="heading"]') || q).innerText || '').split('\n')[0].replace(/\s*\*$/, '').trim();
  const ver = el => { try { el.scrollIntoView({ block: 'center' }); } catch (e) {} };

  let panel = null, enviado = false;
  const armarPanel = () => {
    const preguntas = [...document.querySelectorAll('[role="listitem"]')].filter(lleno);
    preguntas.forEach(q => q.classList.add('cg-lleno'));
    // Google Forms no permite armar HTML con texto (Trusted Types): todo se crea elemento por elemento
    const el = (tag, props, ...hijos) => { const n = document.createElement(tag); Object.assign(n, props || {}); hijos.forEach(h => n.append(h)); return n; };
    panel = el('div', { id: 'cg-panel' },
      el('h3', { textContent: '✅ Listo para enviar' }),
      el('p', { className: 'cg-sub', textContent: 'ClaroGo! llenó estas respuestas. Toca una para verla en el formulario.' }));
    preguntas.forEach(q => {
      const f = el('div', { className: 'cg-fila' },
        el('b', {}, el('span', { className: 'cg-ok', textContent: '✓ ' }), titulo(q).slice(0, 70)),
        el('span', { textContent: valor(q).slice(0, 140) }));
      f.onclick = () => ver(q);
      panel.append(f);
    });
    // Solo el ejecutivo decide: este botón presiona el Enviar de Google únicamente cuando él lo toca
    const ya = el('button', { id: 'cg-enviar-ya', textContent: 'Enviar formulario' });
    ya.onclick = () => { const e = boton('Enviar'); if (e) { enviado = true; e.click(); } };
    const ir = el('button', { id: 'cg-ir', textContent: 'Ver el botón Enviar en la página' });
    ir.onclick = () => { const e = boton('Enviar'); if (e) ver(e); };
    panel.append(ya, ir);
    document.documentElement.appendChild(panel);
    const p = document.getElementById('cg-paso'); if (p) p.remove();
    // Recorrido rápido por las respuestas (si el navegador lo permite) y queda en el botón Enviar
    (async () => { for (const q of preguntas) { ver(q); await esperar(700); } const e = boton('Enviar'); if (e) ver(e); })();
  };

  const reloj = setInterval(() => {
    const e = boton('Enviar');
    if (e) {
      if (!e.classList.contains('cg-enviar')) e.classList.add('cg-enviar');   // parpadea siempre, aunque Google vuelva a dibujar el botón
      if (!panel) armarPanel();
      if (!e.dataset.cgClic) { e.dataset.cgClic = '1'; e.addEventListener('click', () => { enviado = true; }, true); }
    } else if (panel && enviado) {
      // Formulario enviado: se quita el panel y se olvida el pedido
      clearInterval(reloj); panel.remove(); panel = null;
      if (esNV) chrome.storage.local.remove('nv_pedido');
    } else if (panel && !enviado) {
      // El ejecutivo volvió a la hoja anterior: se oculta el panel hasta que vuelva a aparecer Enviar
      panel.remove(); panel = null;
    }
  }, 500);
  setTimeout(() => clearInterval(reloj), 30 * 60000);
})();

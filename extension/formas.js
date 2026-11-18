// Formularios de Google llenados por ClaroGo! (ventas y no venta).
// 1. En el registro de no venta pasa solo a la segunda página ("Siguiente").
// 2. Recorre con la pantalla cada respuesta ya escrita y la marca, para que el ejecutivo vea que se llenó.
// 3. Termina en el botón Enviar con un aviso. Enviar lo presiona siempre el ejecutivo: este script nunca lo hace.
(async () => {
  const NV = '1FAIpQLSeWwyqN1vbUn3wOvHTImDsNFbUwVvG0rijrWWggigDqOrgJHQ';
  const VENTA = '1FAIpQLSe3nbhazUn9YVJqTLlP6tOdMZum-VkfEa9wTE8yAGPTqVuRsw';
  const esNV = location.pathname.includes(NV), esVenta = location.pathname.includes(VENTA);
  if (!esNV && !esVenta) return;
  const esperar = ms => new Promise(r => setTimeout(r, ms));

  let pedido = null;
  if (esNV) {
    pedido = (await chrome.storage.local.get('nv_pedido')).nv_pedido;
    if (!pedido || Date.now() - pedido.ts > 10 * 60000) return;   // solo si se abrió desde la extensión hace poco
  } else if (!/entry\./.test(location.search)) return;           // formulario de ventas abierto lleno desde ClaroGo!

  // Aviso fijo arriba
  const aviso = document.createElement('div');
  aviso.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;max-width:min(560px,92vw);padding:12px 18px;border-radius:14px;font:600 15px/1.4 "Segoe UI",system-ui,sans-serif;color:#fff;background:#1a56b8;box-shadow:0 10px 30px rgba(0,0,0,.3);text-align:center';
  const decir = (t, color) => { aviso.textContent = t; aviso.style.background = color || '#1a56b8'; if (!aviso.isConnected) document.documentElement.appendChild(aviso); };
  const estilo = document.createElement('style');
  estilo.textContent = '@keyframes cgMarca{0%{box-shadow:0 0 0 0 rgba(26,86,184,.55)}100%{box-shadow:0 0 0 14px rgba(26,86,184,0)}}.cg-lleno{outline:3px solid #1a56b8!important;outline-offset:4px;border-radius:10px;animation:cgMarca 1s ease-out 2;background:#eef4ff!important}@keyframes cgEnviar{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}.cg-enviar{outline:4px solid #13804a!important;outline-offset:4px;border-radius:8px;animation:cgEnviar 1.2s ease-in-out infinite}';
  document.documentElement.appendChild(estilo);

  const boton = txt => [...document.querySelectorAll('[role="button"]')].find(b => b.innerText.trim() === txt);
  // Espera a que el formulario termine de dibujarse
  for (let i = 0; i < 40 && !boton('Siguiente') && !boton('Enviar'); i++) await esperar(250);

  // Paso 1: primera página del registro de no venta → Siguiente
  if (esNV && boton('Siguiente') && !boton('Enviar')) {
    if (pedido.avanzo) return;   // si el ejecutivo volvió atrás a propósito, no se avanza de nuevo
    decir('ClaroGo!: "Cliente evaluado: No" listo. Pasando a la página del motivo…');
    pedido.avanzo = true; await chrome.storage.local.set({ nv_pedido: pedido });
    await esperar(1200);
    const s = boton('Siguiente'); if (s) s.click();
    // Google cambia a la segunda hoja sin recargar la página: se espera aquí mismo a que aparezca el botón Enviar
    for (let i = 0; i < 60 && !boton('Enviar'); i++) await esperar(250);
    if (!boton('Enviar')) return;   // si recargó la página completa, el script nuevo sigue desde ahí
    await esperar(600);
  }
  if (window.__cgRecorrido) return;   // nunca dos recorridos a la vez en la misma página
  window.__cgRecorrido = true;

  // Paso 2: recorrer las respuestas escritas
  const lleno = q => {
    if ([...q.querySelectorAll('input[type="text"],input[type="email"],input[type="date"],input:not([type]),textarea')].some(i => i.type !== 'hidden' && String(i.value || '').trim())) return true;
    if (q.querySelector('[role="radio"][aria-checked="true"],[role="checkbox"][aria-checked="true"]')) return true;
    const op = q.querySelector('[role="listbox"] [role="option"][aria-selected="true"]');
    return !!(op && (op.getAttribute('data-value') || '').trim());
  };
  // El recorrido parte solo cuando la pestaña está a la vista y la página terminó de acomodarse
  if (document.hidden) await new Promise(r => document.addEventListener('visibilitychange', function f() { if (!document.hidden) { document.removeEventListener('visibilitychange', f); r(); } }));
  await esperar(1200);
  const preguntas = [...document.querySelectorAll('[role="listitem"]')].filter(lleno);
  // Lleva la pantalla al elemento: se calcula la posición y se mueve la página (funciona aunque el navegador ignore el desplazamiento suave)
  const raiz = document.scrollingElement || document.documentElement;
  const irA = el => {
    const r = el.getBoundingClientRect(), y = Math.max(0, r.top + raiz.scrollTop - innerHeight / 2 + Math.min(r.height, innerHeight * .6) / 2);
    raiz.scrollTop = y; window.scrollTo(0, y);
    el.scrollIntoView({ block: 'center' });
  };
  // Foco: la respuesta que se está mostrando queda iluminada y el resto de la página se oscurece un poco
  const fe = document.createElement('style');
  fe.textContent = '.cg-foco{position:relative;z-index:2147483000;box-shadow:0 0 0 4px #1a56b8,0 0 0 9999px rgba(15,23,42,.45)!important;border-radius:10px;transition:box-shadow .3s}';
  document.documentElement.appendChild(fe);
  // Lista de lo que se llenó, siempre a la vista abajo a la derecha
  const lista = document.createElement('div');
  lista.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:2147483647;width:min(340px,90vw);max-height:60vh;overflow:auto;padding:12px 14px;border-radius:14px;background:#fff;color:#1f2430;font:13px/1.4 "Segoe UI",system-ui,sans-serif;box-shadow:0 12px 32px rgba(0,0,0,.3);border:2px solid #1a56b8';
  lista.innerHTML = '<b style="display:block;font-size:14px;margin-bottom:6px;color:#1a56b8">ClaroGo! llenó estas respuestas</b>';
  document.documentElement.appendChild(lista);
  const resumen = q => {
    const titulo = (q.querySelector('[role="heading"]') || q).innerText.split('\n')[0].replace(/\*$/, '').trim();
    const v = [...q.querySelectorAll('input[type="text"],input[type="email"],input[type="date"],input:not([type]),textarea')].map(i => i.type !== 'hidden' ? String(i.value || '').trim() : '').filter(Boolean).join(' ')
      || ((q.querySelector('[role="radio"][aria-checked="true"],[role="checkbox"][aria-checked="true"]') || {}).getAttribute ? q.querySelector('[role="radio"][aria-checked="true"],[role="checkbox"][aria-checked="true"]').getAttribute('data-value') : '')
      || ((q.querySelector('[role="listbox"] [role="option"][aria-selected="true"]') || {}).getAttribute ? q.querySelector('[role="listbox"] [role="option"][aria-selected="true"]').getAttribute('data-value') : '');
    return [titulo, v === '__other_option__' ? 'Otro' : v];
  };
  decir(`ClaroGo!: mostrando ${preguntas.length} respuestas ya escritas…`);
  let antes = null;
  for (const q of preguntas) {
    if (antes) antes.classList.remove('cg-foco');
    irA(q); q.classList.add('cg-lleno', 'cg-foco'); antes = q;
    const [t, v] = resumen(q), fila = document.createElement('div');
    fila.style.cssText = 'padding:4px 0;border-top:1px solid #e3e6eb';
    fila.innerHTML = '<span style="color:#13804a;font-weight:800">✓ </span><b></b><br><span style="color:#5f6673"></span>';
    fila.querySelector('b').textContent = t.slice(0, 60); fila.querySelector('span:last-child').textContent = String(v || '').slice(0, 120);
    lista.appendChild(fila);
    await esperar(1300);
  }
  if (antes) antes.classList.remove('cg-foco');
  // Paso 3: listo para enviar
  const enviar = boton('Enviar');
  if (enviar) { irA(enviar); enviar.classList.add('cg-enviar'); }
  const ir = document.createElement('button');
  ir.textContent = 'Ir al botón Enviar';
  ir.style.cssText = 'margin-top:8px;width:100%;padding:8px;border:0;border-radius:9px;background:#13804a;color:#fff;font:700 13px "Segoe UI",system-ui,sans-serif;cursor:pointer';
  ir.onclick = () => { if (enviar) irA(enviar); };
  lista.appendChild(ir);
  decir('✅ Listo para enviar. Revisa lo marcado en azul y, si está bien, presiona Enviar.', '#13804a');
  aviso.style.cursor = 'pointer'; aviso.title = 'Clic para cerrar'; aviso.onclick = () => aviso.remove();
  if (esNV) await chrome.storage.local.remove('nv_pedido');
})();

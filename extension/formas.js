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
    return;   // la página siguiente vuelve a cargar este script
  }

  // Paso 2: recorrer las respuestas escritas
  const lleno = q => {
    if ([...q.querySelectorAll('input[type="text"],input[type="email"],input[type="date"],input:not([type]),textarea')].some(i => i.type !== 'hidden' && String(i.value || '').trim())) return true;
    if (q.querySelector('[role="radio"][aria-checked="true"],[role="checkbox"][aria-checked="true"]')) return true;
    const op = q.querySelector('[role="listbox"] [role="option"][aria-selected="true"]');
    return !!(op && (op.getAttribute('data-value') || '').trim());
  };
  const preguntas = [...document.querySelectorAll('[role="listitem"]')].filter(lleno);
  decir(`ClaroGo!: revisando ${preguntas.length} respuestas ya escritas…`);
  for (const q of preguntas) {
    q.scrollIntoView({ behavior: 'smooth', block: 'center' });
    q.classList.add('cg-lleno');
    await esperar(700);
  }
  // Paso 3: listo para enviar
  const enviar = boton('Enviar');
  if (enviar) { enviar.scrollIntoView({ behavior: 'smooth', block: 'center' }); enviar.classList.add('cg-enviar'); }
  decir('✅ Listo para enviar. Revisa lo marcado en azul y, si está bien, presiona Enviar.', '#13804a');
  aviso.style.cursor = 'pointer'; aviso.title = 'Clic para cerrar'; aviso.onclick = () => aviso.remove();
  if (esNV) await chrome.storage.local.remove('nv_pedido');
})();

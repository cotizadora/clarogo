// GoExt: deja marcado en segundo plano el código de conclusión de Genesys que calza con el motivo que tocó el ejecutivo.
// Solo actúa dentro del recuadro "Códigos de conclusión" (acw-gadgets-wrap-up). Solo marca el código: nunca presiona
// "Listo" ni envía nada. Si el recuadro aparece después de tipificar, o queda sin código, lo vuelve a marcar; así,
// si se acaba el tiempo, Genesys cierra la llamada con ese código.
// Si el ejecutivo cambia el código a mano después de que GoExt lo marcó, se respeta su elección.
(() => {
  if (!/acw-gadgets-wrap-up/.test(location.pathname)) return;
  const VIGENCIA = 30 * 60 * 1000;   // un pedido vale 30 minutos (o hasta que entra otra llamada)
  let pedido = null, aplicado = '', ultimoIntento = 0, intentos = 0;
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const todos = () => { const out = []; const walk = r => r.querySelectorAll('*').forEach(e => { out.push(e); if (e.shadowRoot) walk(e.shadowRoot); }); walk(document); return out; };
  const visible = e => !!(e.getClientRects && e.getClientRects().length);
  // Texto de toda la página, incluido lo que Genesys pone dentro de componentes encapsulados
  const textoProfundo = () => { const partes = []; const walk = r => { r.childNodes.forEach(n => { if (n.nodeType === 3) { const t = n.textContent.trim(); if (t) partes.push(t); } else if (n.nodeType === 1) { if (n.shadowRoot) walk(n.shadowRoot); walk(n); } }); }; walk(document.body || document.documentElement); return partes.join('\n'); };
  // Código que Genesys muestra como establecido ("El código quedó establecido" y debajo el código). '' si no hay
  const establecido = () => { const m = textoProfundo().match(/c[oó]digo qued[oó] establecido\s*\n\s*([^\n]+)/i); return m ? m[1].trim() : null; };
  async function elegir(codigo) {
    const meta = norm(codigo);
    const buscar = () => todos().filter(e => visible(e) && norm(e.textContent) === meta).sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length)[0];
    let el = buscar();
    if (!el) {   // lista cerrada o larga: se escribe en "Buscar códigos de conclusión"
      const inp = todos().find(e => e.tagName === 'INPUT' && e.type !== 'hidden' && visible(e));
      if (inp) {
        inp.focus(); inp.click();
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(inp, codigo.slice(0, 18));
        inp.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        for (let i = 0; i < 10 && !el; i++) { await new Promise(r => setTimeout(r, 250)); el = buscar(); }
      }
    }
    if (!el) return false;
    const op = el.closest('[role="option"],[role="radio"],[role="menuitem"],gux-option,button,label,li') || el;
    // Si ya está elegido no se vuelve a tocar (así nunca se desmarca)
    if (op.getAttribute('aria-selected') === 'true' || op.getAttribute('aria-checked') === 'true' || op.hasAttribute('selected')) return true;
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup'].forEach(t => op.dispatchEvent(new MouseEvent(t, { bubbles: true, composed: true })));
    op.click();
    return true;
  }
  async function revisar() {
    if (!pedido || !pedido.codigo || Date.now() - pedido.ts > VIGENCIA) return;
    const actual = establecido();
    if (actual !== null && norm(actual) === norm(pedido.codigo)) { aplicado = pedido.codigo; intentos = 0; return; }   // ya está
    // Ya lo marcó GoExt y ahora hay otro código: lo cambió el ejecutivo a mano, se respeta
    if (aplicado === pedido.codigo && actual) return;
    // Ya marcado pero Genesys no muestra cuál quedó: se vuelve a revisar con calma (no se insiste)
    if (aplicado === pedido.codigo && Date.now() - ultimoIntento < 15000) return;
    if (Date.now() - ultimoIntento < 2500 || intentos >= 12) return;
    ultimoIntento = Date.now(); intentos++;
    if (await elegir(pedido.codigo)) aplicado = pedido.codigo;
  }
  const cargar = o => { const p = o && o.gc_pendiente; if (!p || !pedido || p.ts !== pedido.ts) { aplicado = ''; intentos = 0; } pedido = p || null; revisar(); };
  try { chrome.storage.local.get('gc_pendiente').then(cargar); } catch (e) {}
  try { chrome.storage.onChanged.addListener((c, area) => { if (area === 'local' && c.gc_pendiente) cargar({ gc_pendiente: c.gc_pendiente.newValue }); }); } catch (e) {}
  let pendiente = 0;
  try { new MutationObserver(() => { if (!pendiente) pendiente = setTimeout(() => { pendiente = 0; revisar(); }, 400); }).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
  setInterval(revisar, 3000);
})();

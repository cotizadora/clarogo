// ClaroGo! Genesys: abre WhatsApp Web con el cliente y el mensaje.
// Modo rápido (experimental): si WhatsApp Web ya está abierto, presiona "Nuevo chat", busca el número,
// abre el chat y deja el mensaje escrito, sin recargar. Si algo no calza, recarga la pestaña como antes.
// El mensaje nunca se envía solo: el ejecutivo lo revisa y presiona Enter.

// Se ejecuta dentro de la pestaña de WhatsApp Web. Devuelve 'ok' o el motivo por el que no pudo.
async function chatRapido(numero, texto, img) {
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const hasta = async (fn, ms = 3000) => { const fin = Date.now() + ms; while (Date.now() < fin) { const v = fn(); if (v) return v; await esperar(100); } return null; };
  const visible = el => !!el && el.getClientRects().length > 0;
  const pegar = (el, txt) => {
    el.focus();
    const dt = new DataTransfer(); dt.setData('text/plain', txt);
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  };
  try {
    if (!document.querySelector('#side, #pane-side')) return 'sin-sesion';
    // 1. Botón "Nuevo chat"
    const nuevo = document.querySelector('[data-icon="new-chat-outline"], [data-icon="new-chat"], [aria-label="Nuevo chat"], [title="Nuevo chat"], [aria-label="New chat"], [title="New chat"]');
    if (!nuevo) return 'sin-boton';
    // 2. Buscador del panel de nuevo chat: el cuadro que se hace visible después de presionar el botón
    const antes = new Set([...document.querySelectorAll('[contenteditable="true"], input[type="text"]')].filter(visible));
    (nuevo.closest('button, [role="button"]') || nuevo).click();
    const buscador = await hasta(() => [...document.querySelectorAll('[contenteditable="true"], input[type="text"]')].find(e => visible(e) && !antes.has(e) && !e.closest('footer')) || null);
    if (!buscador) return 'sin-buscador';
    buscador.focus();
    if (buscador.isContentEditable) document.execCommand('insertText', false, numero); else { buscador.value = numero; buscador.dispatchEvent(new Event('input', { bubbles: true })); }
    // 3. Resultado: solo si hay exactamente un resultado (así nunca se abre el chat de otra persona)
    const panel = buscador.closest('[tabindex="-1"]') || buscador.parentElement.parentElement.parentElement.parentElement;
    await esperar(900);
    const resultados = await hasta(() => { const r = [...panel.querySelectorAll('[role="listitem"], [role="row"], [role="button"][tabindex]')].filter(e => visible(e) && /\d|[a-z]/i.test(e.textContent) && !e.contains(buscador)); return r.length ? r : null; }, 2500);
    if (!resultados) return 'sin-resultados';
    const reales = resultados.filter(e => !/(nuevo grupo|nueva comunidad|new group|new community|contactos en whatsapp|contacts on whatsapp)/i.test(e.textContent));
    if (reales.length !== 1) return 'resultados-' + reales.length;
    (reales[0].querySelector('[role="gridcell"], span[title]') || reales[0]).click();
    // 4. Cuadro para escribir del chat abierto
    const cajaActual = () => document.querySelector('footer [contenteditable="true"]');
    if (!await hasta(cajaActual, 3000)) return 'sin-caja';
    // WhatsApp termina de cargar el chat (y su borrador) un instante después de mostrarlo:
    // se espera, se pega y se revisa que el mensaje siga ahí. Si WhatsApp lo borró, se vuelve a pegar.
    await esperar(700);
    const inicio = texto.replace(/\s+/g, ' ').trim().slice(0, 25);
    const estaPegado = c => c && c.textContent.replace(/\s+/g, ' ').includes(inicio);
    // 5. La lámina: se pega como imagen en el chat; WhatsApp abre su vista previa lista para enviar
    const adjuntar = async () => {
      if (!img) return 'ok';
      try {
        const [cab, b64] = String(img).split(','), tipo = (cab.match(/data:([^;]+)/) || [])[1] || 'image/png';
        const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        const archivo = new File([u], 'lamina-plan.' + (tipo.includes('jpeg') ? 'jpg' : 'png'), { type: tipo });
        const caja = cajaActual(); if (!caja) return 'ok-sin-lamina';
        const antes = new Set([...document.querySelectorAll('img')]), editAntes = new Set([...document.querySelectorAll('[contenteditable="true"]')]);
        caja.focus();
        const dt = new DataTransfer(); dt.items.add(archivo);
        caja.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
        // Se da por adjuntada si aparece la vista previa (una imagen nueva en la página)
        const vista = await hasta(() => [...document.querySelectorAll('img')].find(i => !antes.has(i) && visible(i) && /^blob:|^data:/.test(i.src)) || null, 3500);
        if (!vista) return 'ok-sin-lamina';
        // WhatsApp copia el mensaje escrito como pie de la imagen: se vacía, para que la lámina vaya sola
        // (el mensaje ya va aparte). Se revisa un momento, porque WhatsApp puede llenarlo un instante después.
        const pie = () => [...document.querySelectorAll('[contenteditable="true"]')].find(e => e !== cajaActual() && !e.closest('footer') && visible(e) && estaPegado(e));
        for (let i = 0; i < 8; i++) {
          const p = pie();
          if (p) {
            p.focus();
            document.execCommand('selectAll', false, null);
            document.execCommand('delete', false, null);
            if (p.textContent.trim()) { p.textContent = ''; p.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' })); }
          }
          await esperar(250);
        }
        return 'ok';
      } catch (e) { return 'ok-sin-lamina'; }
    };
    let c0 = cajaActual();
    if (c0 && c0.textContent.trim() && !estaPegado(c0)) return adjuntar();   // ya había un borrador del ejecutivo: no se pisa
    for (let i = 0; i < 5; i++) {
      const caja = cajaActual();
      if (!caja) { await esperar(300); continue; }
      if (!estaPegado(caja)) {
        if (caja.textContent.trim()) return adjuntar();
        pegar(caja, texto);
        await esperar(250);
        if (!caja.textContent.trim()) document.execCommand('insertText', false, texto);
      }
      await esperar(800);
      const ahora = cajaActual();
      if (estaPegado(ahora)) { await esperar(600); if (estaPegado(cajaActual())) return adjuntar(); }
    }
    return estaPegado(cajaActual()) ? adjuntar() : 'ok-sin-texto';
  } catch (e) { return 'error: ' + e.message; }
}

async function abrirWhatsApp(url, img) {
  if (!/^https:\/\/web\.whatsapp\.com\/send\?/.test(url)) return false;
  const u = new URL(url), numero = u.searchParams.get('phone') || '', texto = u.searchParams.get('text') || '';
  const tabs = (await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' })).sort((a, b) => a.id - b.id);
  if (!tabs.length) { await chrome.tabs.create({ url, active: true }); return 'nueva'; }
  const t = tabs[0];
  await chrome.tabs.update(t.id, { active: true });
  await chrome.windows.update(t.windowId, { focused: true });
  let modo = 'recarga';
  try {
    const [r] = await chrome.scripting.executeScript({ target: { tabId: t.id }, func: chatRapido, args: [numero, texto, /^data:image\/(png|jpeg);base64,/.test(String(img || '')) ? img : ''] });
    // 'ok-sin-lamina': el chat y el mensaje quedaron; la lámina queda en el portapapeles para Ctrl+V
    if (r && (r.result === 'ok' || r.result === 'ok-sin-lamina')) modo = 'rapido';
  } catch (e) {}
  if (modo !== 'rapido') await chrome.tabs.update(t.id, { url, active: true });
  return modo;
}

chrome.runtime.onMessage.addListener((msg, _de, responder) => {
  if (msg && msg.tipo === 'wa') { abrirWhatsApp(msg.url, msg.img).then(responder, () => responder(false)); return true; }
});

// Formularios de ventas y no venta: en la segunda hoja Google carga la página de una forma en que Edge
// no vuelve a activar formas.js. Aquí se vigila la pestaña y se inyecta el script cada vez que la hoja cambia.
const FORMAS = /^https:\/\/docs\.google\.com\/forms\/d\/e\/(1FAIpQLSeWwyqN1vbUn3wOvHTImDsNFbUwVvG0rijrWWggigDqOrgJHQ|1FAIpQLSe3nbhazUn9YVJqTLlP6tOdMZum-VkfEa9wTE8yAGPTqVuRsw)\//;
chrome.tabs.onUpdated.addListener((tabId, cambio, tab) => {
  const url = cambio.url || (tab && tab.url) || '';
  if (!FORMAS.test(url) || (cambio.status !== 'complete' && !cambio.url)) return;
  setTimeout(() => { chrome.scripting.executeScript({ target: { tabId }, files: ['formas.js'] }).catch(() => {}); }, cambio.url && cambio.status !== 'complete' ? 1500 : 300);
});
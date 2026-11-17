// ClaroGo! Genesys: abre WhatsApp Web con el cliente y el mensaje.
// Modo rápido (experimental): si WhatsApp Web ya está abierto, presiona "Nuevo chat", busca el número,
// abre el chat y deja el mensaje escrito, sin recargar. Si algo no calza, recarga la pestaña como antes.
// El mensaje nunca se envía solo: el ejecutivo lo revisa y presiona Enter.

// Se ejecuta dentro de la pestaña de WhatsApp Web. Devuelve 'ok' o el motivo por el que no pudo.
async function chatRapido(numero, texto) {
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
    const caja = await hasta(() => document.querySelector('footer [contenteditable="true"]'), 3000);
    if (!caja) return 'sin-caja';
    if (caja.textContent.trim()) return 'ok';      // ya había un borrador: no se pisa
    pegar(caja, texto);
    await esperar(200);
    if (!caja.textContent.trim()) document.execCommand('insertText', false, texto.replace(/\n/g, ' '));
    return 'ok';
  } catch (e) { return 'error: ' + e.message; }
}

async function abrirWhatsApp(url) {
  if (!/^https:\/\/web\.whatsapp\.com\/send\?/.test(url)) return false;
  const u = new URL(url), numero = u.searchParams.get('phone') || '', texto = u.searchParams.get('text') || '';
  const tabs = (await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' })).sort((a, b) => a.id - b.id);
  if (!tabs.length) { await chrome.tabs.create({ url, active: true }); return 'nueva'; }
  const t = tabs[0];
  await chrome.tabs.update(t.id, { active: true });
  await chrome.windows.update(t.windowId, { focused: true });
  let modo = 'recarga';
  try {
    const [r] = await chrome.scripting.executeScript({ target: { tabId: t.id }, func: chatRapido, args: [numero, texto] });
    if (r && r.result === 'ok') modo = 'rapido';
  } catch (e) {}
  if (modo !== 'rapido') await chrome.tabs.update(t.id, { url, active: true });
  return modo;
}

chrome.runtime.onMessage.addListener((msg, _de, responder) => {
  if (msg && msg.tipo === 'wa') { abrirWhatsApp(msg.url).then(responder, () => responder(false)); return true; }
});

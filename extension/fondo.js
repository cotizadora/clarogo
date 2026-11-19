// GoExt (extensión de ClaroGo!): abre WhatsApp Web con el cliente y el mensaje.
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

function avisoLamina() {
  try {
    const id = 'cg-lamina-' + Date.now();
    chrome.notifications.create(id, { type: 'basic', iconUrl: 'icono-128.png', title: 'GoExt: falta la imagen del plan', message: 'WhatsApp no aceptó pegarla sola. Ya está copiada: haz clic en el chat y presiona Ctrl+V.', priority: 2 });
    setTimeout(() => chrome.notifications.clear(id), 12000);
  } catch (e) {}
}
// Se ejecuta dentro de WhatsApp Web ya cargado con el chat y el mensaje escrito (pestaña nueva o recargada):
// pega la lámina como imagen y deja la vista previa lista para enviar. Devuelve 'esperar' si el chat aún no carga.
async function soloLamina(texto, img) {
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const visible = el => !!el && el.getClientRects().length > 0;
  const cajaActual = () => document.querySelector('footer [contenteditable="true"]');
  if (!cajaActual()) return 'esperar';
  const inicio = texto.replace(/\s+/g, ' ').trim().slice(0, 25);
  const estaPegado = c => c && c.textContent.replace(/\s+/g, ' ').includes(inicio);
  // WhatsApp escribe el mensaje del enlace un instante después de mostrar el chat
  for (let i = 0; i < 24 && inicio && !estaPegado(cajaActual()); i++) await esperar(250);
  if (document.documentElement.dataset.cgLamina) return 'ok';   // ya se adjuntó en esta carga
  document.documentElement.dataset.cgLamina = '1';
  try {
    const [cab, b64] = String(img).split(','), tipo = (cab.match(/data:([^;]+)/) || [])[1] || 'image/png';
    const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const archivo = new File([u], 'lamina-plan.' + (tipo.includes('jpeg') ? 'jpg' : 'png'), { type: tipo });
    const caja = cajaActual(); if (!caja) return 'ok-sin-lamina';
    const antes = new Set([...document.querySelectorAll('img')]);
    caja.focus();
    const dt = new DataTransfer(); dt.items.add(archivo);
    caja.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    let vista = null; for (let i = 0; i < 14 && !vista; i++) { await esperar(250); vista = [...document.querySelectorAll('img')].find(x => !antes.has(x) && visible(x) && /^blob:|^data:/.test(x.src)); }
    if (!vista) return 'ok-sin-lamina';
    // El mensaje ya va aparte: se vacía el pie de la imagen si WhatsApp lo copió ahí
    for (let i = 0; i < 8; i++) {
      const pie = [...document.querySelectorAll('[contenteditable="true"]')].find(e => e !== cajaActual() && !e.closest('footer') && visible(e) && estaPegado(e));
      if (pie) { pie.focus(); document.execCommand('selectAll', false, null); document.execCommand('delete', false, null); }
      await esperar(250);
    }
    return 'ok';
  } catch (e) { return 'ok-sin-lamina'; }
}
// Espera a que WhatsApp Web cargue el chat en esa pestaña (hasta 45 segundos) y adjunta la lámina
async function laminaAlCargar(tabId, texto, img) {
  if (!/^data:image\/(png|jpeg);base64,/.test(String(img || ''))) return;
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  await esperar(2500);
  for (let i = 0; i < 30; i++) {
    try {
      const t = await chrome.tabs.get(tabId);
      if (t.status === 'complete') {
        const [r] = await chrome.scripting.executeScript({ target: { tabId }, func: soloLamina, args: [texto, img] });
        if (r && r.result === 'ok') return;
        if (r && r.result === 'ok-sin-lamina') return avisoLamina();
      }
    } catch (e) {}
    await esperar(1500);
  }
  avisoLamina();
}
async function abrirWhatsApp(url, img) {
  if (!/^https:\/\/web\.whatsapp\.com\/send\?/.test(url)) return false;
  const u = new URL(url), numero = u.searchParams.get('phone') || '', texto = u.searchParams.get('text') || '';
  const tabs = (await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' })).sort((a, b) => a.id - b.id);
  // WhatsApp no estaba abierto: pestaña nueva con el mensaje y, cuando cargue el chat, se adjunta la lámina
  if (!tabs.length) { const nt = await chrome.tabs.create({ url, active: true }); if (img) laminaAlCargar(nt.id, texto, img); return 'nueva'; }
  const t = tabs[0];
  await chrome.tabs.update(t.id, { active: true });
  await chrome.windows.update(t.windowId, { focused: true });
  let modo = 'recarga';
  try {
    const [r] = await chrome.scripting.executeScript({ target: { tabId: t.id }, func: chatRapido, args: [numero, texto, /^data:image\/(png|jpeg);base64,/.test(String(img || '')) ? img : ''] });
    // 'ok-sin-lamina': el chat y el mensaje quedaron; la lámina queda en el portapapeles para Ctrl+V
    if (r && (r.result === 'ok' || r.result === 'ok-sin-lamina')) modo = 'rapido';
    // WhatsApp no aceptó la imagen pegada: queda copiada y se avisa para pegarla a mano
    if (r && r.result === 'ok-sin-lamina' && img) avisoLamina();
  } catch (e) {}
  // Modo rápido no calzó: se recarga WhatsApp con el mensaje y, cuando cargue el chat, se adjunta la lámina
  if (modo !== 'rapido') { await chrome.tabs.update(t.id, { url, active: true }); if (img) laminaAlCargar(t.id, texto, img); }
  return modo;
}

// Al instalar o activar una versión nueva, las pestañas de ClaroGo! ya abiertas quedan desconectadas de la extensión.
// Se les vuelve a poner el puente para que el Rutificador y el Historial sigan funcionando sin tener que recargar.
chrome.runtime.onInstalled.addListener(async d => {
  if (d && d.reason !== 'install' && d.reason !== 'update') return;
  try {
    const tabs = await chrome.tabs.query({ url: 'https://cotizadora.github.io/clarogo/*' });
    for (const t of tabs) chrome.scripting.executeScript({ target: { tabId: t.id }, files: ['puente.js'] }).catch(() => {});
  } catch (e) {}
  conectarGenesys();
});
// Las pestañas de Genesys que ya estaban abiertas no reciben el vigilante de llamadas hasta recargarlas:
// se les pone al instalar, al actualizar y al abrir el navegador, en todos sus marcos.
async function conectarGenesys() {
  try {
    const tabs = await chrome.tabs.query({ url: ['https://*.pure.cloud/*', 'https://*.mypurecloud.com/*', 'https://*.genesys.cloud/*'] });
    for (const t of tabs) chrome.scripting.executeScript({ target: { tabId: t.id, allFrames: true }, files: ['llamada.js'] }).catch(() => {});
  } catch (e) {}
}
chrome.runtime.onStartup.addListener(() => setTimeout(conectarGenesys, 5000));

// Llamada nueva en Genesys (llamada.js): solo se anota la hora de la llamada (sirve para saber si el cliente cortó
// apenas contestó). GoExt NO se abre sola: el ejecutivo la abre con el ícono o con Alt+Shift+G, como siempre.
async function abrirPorLlamada(msg) {
  try { await chrome.storage.local.set({ ultima_llamada: { ts: Date.now(), clave: msg.clave } }); } catch (e) {}
}
// Llamada cortada: Genesys muestra la tipificación al terminar la llamada. Si el ejecutivo no presionó Desconectar
// en los últimos segundos, fue el cliente quien cortó: alerta roja al centro, encima de cualquier pestaña.
// Al abrir GoExt con el ícono en los 2 minutos siguientes, el motivo "Corte de llamado" aparece listo.
let ultimoFin = 0;
// Se ejecuta dentro de la pestaña: recuadro rojo "LLAMADA CORTADA" al centro, encima de la página.
// Se desvanece al mover el mouse, hacer clic, usar la rueda o presionar una tecla (tras 0,9 s), o solo a los 10 segundos.
function avisoCortada(temprano) {
  if (document.getElementById('goext-cortada')) return;
  const caja = document.createElement('div');
  caja.id = 'goext-cortada';
  caja.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2147483647;width:min(480px,90vw);padding:26px 24px;border-radius:20px;background:#c00000;color:#fff;text-align:center;font:700 18px/1.4 "Segoe UI",system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.45);border:4px solid rgba(255,255,255,.9);transition:opacity .6s;pointer-events:none';
  const linea = (txt, css) => { const d = document.createElement('div'); d.textContent = txt; d.style.cssText = css; caja.appendChild(d); };
  linea('📵', 'font-size:52px;line-height:1');
  linea('LLAMADA CORTADA', 'font-size:36px;letter-spacing:.04em;margin:6px 0 4px');
  linea(temprano ? 'El cliente cortó apenas contestó. Tipifica la llamada.' : 'El cliente cortó. Tipifica la llamada.', 'font-weight:600');
  document.documentElement.appendChild(caja);
  let listo = false;
  const cerrar = () => { if (listo) return; listo = true; caja.style.opacity = '0'; setTimeout(() => caja.remove(), 650); ['mousemove', 'mousedown', 'keydown', 'wheel'].forEach(t => window.removeEventListener(t, cerrar, true)); };
  setTimeout(() => ['mousemove', 'mousedown', 'keydown', 'wheel'].forEach(t => window.addEventListener(t, cerrar, true)), 900);
  setTimeout(cerrar, 10000);
}
async function finDeLlamada() {
  if (Date.now() - ultimoFin < 15000) return;   // una sola alerta por llamada
  ultimoFin = Date.now();
  let o = {}; try { o = await chrome.storage.local.get(['corte_ejecutivo', 'ultima_llamada', 'avisoCorte']); } catch (e) {}
  if (o.avisoCorte === false) return;
  if (o.corte_ejecutivo && Date.now() - o.corte_ejecutivo < 8000) return;   // cortó el ejecutivo
  const temprano = !!(o.ultima_llamada && Date.now() - o.ultima_llamada.ts < 25000);
  try { await chrome.storage.local.set({ corte: { ts: Date.now(), temprano } }); } catch (e) {}
  // El aviso se dibuja dentro de la pestaña que el ejecutivo está mirando (sin ventanas nuevas ni barra de tareas).
  // Si GoExt no puede dibujar en esa pestaña, queda solo una notificación de Windows.
  try {
    const [t] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!t) throw new Error('sin pestaña');
    await chrome.scripting.executeScript({ target: { tabId: t.id }, func: avisoCortada, args: [temprano] });
  } catch (e) {
    try { const id = 'cg-corte-' + Date.now(); chrome.notifications.create(id, { type: 'basic', iconUrl: 'icono-128.png', title: '📵 LLAMADA CORTADA', message: 'El cliente cortó. Tipifica la llamada.', priority: 2 }); setTimeout(() => chrome.notifications.clear(id), 12000); } catch (x) {}
  }
}
chrome.runtime.onMessage.addListener((msg, _de, responder) => {
  if (msg && msg.tipo === 'llamada' && /^\d{9}$/.test(String(msg.tel || ''))) { abrirPorLlamada(msg); setTimeout(() => revisarVersion(false), 5000); return; }
  if (msg && msg.tipo === 'corte-ejecutivo') { chrome.storage.local.set({ corte_ejecutivo: Date.now() }); return; }
  if (msg && msg.tipo === 'fin-llamada') { finDeLlamada(); return; }
  // Al cerrarse la alerta de llamada cortada ya no se abre nada solo: el ejecutivo abre GoExt con el ícono
  if (msg && msg.tipo === 'abrir-tipificacion') return;
  // "Activar versión nueva": se recarga desde el fondo, con la ventana ya cerrada (recargar desde la ventana puede dejarla trabada)
  if (msg && msg.tipo === 'recargar') { setTimeout(() => chrome.runtime.reload(), 400); return; }
  // Pedido del Rutificador: se guarda con la pestaña de la planilla que lo hizo
  if (msg && msg.tipo === 'rutif-pedido') {
    const origen = _de && _de.tab ? _de.tab : null;
    const fondo = !!msg.fondo;   // al pegar el RUT: se busca en segundo plano, sin cambiar de pestaña ni de ventana
    chrome.storage.local.set({ rutif_pedido: { rut: msg.rut, id: msg.id, ts: Date.now(), fondo }, rutif_tab: { tab: origen ? origen.id : 0, ts: Date.now() } }).then(async () => {
      // Si ya hay un Rutificador abierto se usa ese; si no, se abre uno al lado de la planilla
      const URL_RUTIF = 'https://www.nombrerutyfirma.com/';
      let t = null;
      try { t = (await chrome.tabs.query({ url: ['https://www.nombrerutyfirma.com/*', 'https://nombrerutyfirma.com/*'] }))[0] || null; } catch (e) {}
      if (t) { await chrome.tabs.update(t.id, { url: URL_RUTIF, active: !fondo }); if (!fondo) chrome.windows.update(t.windowId, { focused: true }); }
      else chrome.tabs.create(origen ? { url: URL_RUTIF, active: !fondo, index: origen.index + 1, windowId: origen.windowId } : { url: URL_RUTIF, active: !fondo });
    });
    return;
  }
  // Después del Rutificador se vuelve a la misma pestaña de Mi Planilla desde donde se pidió
  if (msg && msg.tipo === 'volver-planilla') {
    chrome.storage.local.get('rutif_tab').then(async o => {
      let t = null;
      try { if (o.rutif_tab && o.rutif_tab.tab) t = await chrome.tabs.get(o.rutif_tab.tab); } catch (e) { t = null; }
      if (!t) { const tabs = await chrome.tabs.query({ url: 'https://cotizadora.github.io/clarogo/*' }); t = tabs.find(x => /#control/.test(x.url || '')) || tabs[0]; }
      if (!t) return;
      chrome.tabs.update(t.id, { active: true }); chrome.windows.update(t.windowId, { focused: true });
    }).catch(() => {});
    return;
  }
  if (msg && msg.tipo === 'wa') { abrirWhatsApp(msg.url, msg.img).then(responder, () => responder(false)); return true; }
});

// Aviso de "Tipificación enviada": además del aviso dentro del formulario, una notificación de Windows que se va sola.
// Así aparece siempre, aunque Google cambie de página al enviar.
let ultimoAviso = 0, ultimaPestanaForm = 0, ultimoGenesys = 0;

// Vuelve a la pestaña de Genesys (la usada más recientemente) y enciende el neón en su botón Enviar.
// Solo resalta: nunca presiona Enviar. Si no encuentra el botón, igual deja Genesys a la vista.
async function volverAGenesys() {
  try {
    const tabs = (await chrome.tabs.query({ url: ['https://*.pure.cloud/*', 'https://*.mypurecloud.com/*', 'https://*.genesys.cloud/*'] }))
      .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
    if (!tabs.length) return;
    const t = tabs[0];
    await chrome.tabs.update(t.id, { active: true });
    await chrome.windows.update(t.windowId, { focused: true });
    chrome.scripting.executeScript({ target: { tabId: t.id, allFrames: true }, func: neonEnviarGenesys }).catch(() => {});
  } catch (e) {}
}

// Vuelve a la pestaña de ClaroGo! (la de Mi Planilla si hay) para seguir con la siguiente línea de la venta
async function volverAClaroGo() {
  try {
    const tabs = (await chrome.tabs.query({ url: 'https://cotizadora.github.io/clarogo/*' })).sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
    const t = tabs.find(x => /#control/.test(x.url || '')) || tabs[0]; if (!t) return;
    await chrome.tabs.update(t.id, { active: true }); await chrome.windows.update(t.windowId, { focused: true });
  } catch (e) {}
}

// Corre dentro de cada marco de Genesys. Actúa solo en el recuadro de conclusión (acw-gadgets-wrap-up):
// busca el botón "Enviar" (también dentro de componentes con shadow DOM) y lo hace brillar hasta que se presiona.
async function neonEnviarGenesys() {
  if (!/acw-gadgets-wrap-up/.test(location.pathname)) return null;
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const visible = e => !!(e.getClientRects && e.getClientRects().length);
  const todos = () => { const out = []; const walk = r => r.querySelectorAll('*').forEach(e => { out.push(e); if (e.shadowRoot) walk(e.shadowRoot); }); walk(document); return out; };
  const buscar = () => todos().filter(e => visible(e) && /^(button|gux-button)$/i.test(e.tagName) || (visible(e) && e.getAttribute && e.getAttribute('role') === 'button'))
    .filter(e => ['enviar', 'submit'].includes(norm(e.textContent)))
    .sort((a, b) => (/gux-button/i.test(b.tagName) ? 1 : 0) - (/gux-button/i.test(a.tagName) ? 1 : 0))[0];
  let b = null;
  for (let i = 0; i < 40 && !b; i++) { b = buscar(); if (!b) await new Promise(r => setTimeout(r, 500)); }   // hasta 20 segundos
  if (!b) return 'no';
  if (!document.getElementById('cg-neon-estilo')) {
    const st = document.createElement('style'); st.id = 'cg-neon-estilo';
    st.textContent = '@keyframes cgNeonGen{0%,100%{box-shadow:0 0 6px 2px #39ff14,0 0 18px 6px rgba(57,255,20,.75);transform:scale(1)}50%{box-shadow:0 0 14px 5px #39ff14,0 0 34px 14px rgba(57,255,20,.55);transform:scale(1.07)}}';
    (document.head || document.documentElement).appendChild(st);
  }
  const antes = b.getAttribute('style') || '';
  b.style.setProperty('animation', 'cgNeonGen 0.9s ease-in-out infinite', 'important');
  b.style.setProperty('outline', '3px solid #39ff14', 'important');
  b.style.setProperty('outline-offset', '3px');
  b.style.setProperty('border-radius', '8px');
  b.style.setProperty('position', 'relative');
  b.style.setProperty('z-index', '10');
  try { b.scrollIntoView({ block: 'center' }); } catch (e) {}
  // Se apaga al presionarlo o a los 2 minutos
  const apagar = () => { if (antes) b.setAttribute('style', antes); else b.removeAttribute('style'); };
  b.addEventListener('click', apagar, { once: true, capture: true });
  setTimeout(apagar, 120000);
  return 'ok';
}
// Formulario de venta enviado (trámite administrativo, después de cerrar y tipificar en Genesys):
// solo muestra la animación. Genesys no se toca. Si quedan líneas de la misma venta, vuelve a ClaroGo! para la siguiente.
let ultimaVenta = 0;
chrome.storage.onChanged.addListener((c, area) => {
  const v = area === 'local' && c.venta_enviada && c.venta_enviada.newValue;
  if (!v || Date.now() - ultimaVenta < 5000) return;
  ultimaVenta = Date.now();
  const VENTA = 'https://docs.google.com/forms/d/e/1FAIpQLSe3nbhazUn9YVJqTLlP6tOdMZum-VkfEa9wTE8yAGPTqVuRsw/*';
  setTimeout(async () => {
    let vl = null; try { vl = (await chrome.storage.local.get('venta_lineas')).venta_lineas; } catch (e) {}
    const quedan = vl && vl.quedan > 0 && Date.now() - vl.ts < 30 * 60000 ? vl.quedan : 0;
    try {
      const t = (await chrome.tabs.query({ url: VENTA })).sort((a, b) => (b.active - a.active) || ((b.lastAccessed || 0) - (a.lastAccessed || 0)))[0];
      if (t) await chrome.scripting.executeScript({ target: { tabId: t.id }, func: avisoCentro, args: [quedan ? `Faltan ${quedan} ${quedan === 1 ? 'línea' : 'líneas'} por subir` : 'Venta registrada', '¡Formulario de venta enviado!'] });
    } catch (e) {}
    if (quedan) setTimeout(volverAClaroGo, 4400);
  }, 1500);
});

chrome.storage.onChanged.addListener((c, area) => {
  const env = area === 'local' && c.nv_enviado && c.nv_enviado.newValue;
  if (!env) return;
  // Historial de tipificaciones por teléfono (máximo 5.000): permite saber si un cliente ya fue llamado y cómo se tipificó
  if (env.tel && String(env.tel).length === 9) {
    chrome.storage.local.get('historial_tip').then(o => {
      const h = o.historial_tip || [];
      if (!h.some(x => x.tel === env.tel && Math.abs(x.ts - env.ts) < 60000)) h.push({ tel: env.tel, motivo: env.motivo || env.texto || '', ts: env.ts });
      chrome.storage.local.set({ historial_tip: h.slice(-5000) });
    });
  }
  // Después de la animación se vuelve a Genesys y el botón Enviar queda en neón (el ejecutivo lo presiona)
  if (Date.now() - ultimoGenesys > 10000) { ultimoGenesys = Date.now(); setTimeout(volverAGenesys, env.aviso ? 4400 : 1500); }
  if (!env.aviso || Date.now() - ultimoAviso < 10000) return;   // un solo aviso por envío
  ultimoAviso = Date.now();
  // Aviso al centro del formulario, con los colores del formulario. Se intenta dos veces (mientras Google cambia de página)
  // La pestaña del formulario se busca cada vez (el fondo de la extensión puede haberse dormido y olvidado cuál era)
  const intentar = async (n) => {
    let id = ultimaPestanaForm;
    try { const t = (await chrome.tabs.query({ url: 'https://docs.google.com/forms/d/e/1FAIpQLSeWwyqN1vbUn3wOvHTImDsNFbUwVvG0rijrWWggigDqOrgJHQ/*' })).sort((a, b) => (b.active - a.active) || ((b.lastAccessed || 0) - (a.lastAccessed || 0))); if (t.length) id = t[0].id; } catch (e) {}
    if (!id) return notificar();
    chrome.scripting.executeScript({ target: { tabId: id }, func: avisoCentro, args: [env.texto || ''] })
      .catch(() => { if (n < 3) setTimeout(() => intentar(n + 1), 1500); else notificar(); });
  };
  setTimeout(() => intentar(1), 1500);
  function notificar() { try {
    const id = 'cg-enviado-' + env.ts;
    chrome.notifications.create(id, { type: 'basic', iconUrl: 'icono-128.png', title: '✅ Tipificación enviada', message: env.texto || 'El registro de no venta se envió correctamente.', priority: 1 });
    setTimeout(() => chrome.notifications.clear(id), 6000);
  } catch (e) {} }
});

// Tarjeta al centro de la pantalla con los colores del formulario de Google (morado #5746E3). Se desvanece sola.
// Corre dentro de la página del formulario: todo se crea elemento por elemento (Google no permite armar HTML con texto).
function avisoCentro(texto, tituloTxt) {
  if (document.getElementById('cg-exito')) return;
  const el = (tag, css, txt) => { const n = document.createElement(tag); n.style.cssText = css; if (txt) n.textContent = txt; return n; };
  const fondo = el('div', 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(87,70,227,.18);transition:opacity .9s;font-family:"Google Sans",Roboto,"Segoe UI",Arial,sans-serif');
  fondo.id = 'cg-exito';
  const tarjeta = el('div', 'width:min(440px,90vw);background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 18px 50px rgba(32,33,36,.35);text-align:center;transform:scale(.9);transition:transform .35s');
  const franja = el('div', 'height:10px;background:#5746E3');
  const cuerpo = el('div', 'padding:22px 26px 24px');
  const cara = el('div', 'font-size:58px;line-height:1;margin-bottom:10px', '😊');
  const titulo = el('div', 'font-size:22px;font-weight:600;color:#202124;margin-bottom:6px', '¡Tipificado por GoExt correctamente!');
  const detalle = el('div', 'display:inline-block;margin-top:6px;padding:6px 14px;border-radius:999px;background:#EEEDFC;color:#5746E3;font-size:14px;font-weight:600', texto || 'Registro de atención enviado');
  cuerpo.append(cara, titulo, detalle); tarjeta.append(franja, cuerpo); fondo.append(tarjeta);
  document.documentElement.appendChild(fondo);
  requestAnimationFrame(() => { tarjeta.style.transform = 'scale(1)'; });
  fondo.onclick = () => fondo.remove();
  setTimeout(() => { fondo.style.opacity = '0'; }, 3200);
  setTimeout(() => fondo.remove(), 4200);
}

// Formularios de ventas y no venta: en la segunda hoja Google carga la página de una forma en que Edge
// no vuelve a activar formas.js. Aquí se vigila la pestaña y se inyecta el script cada vez que la hoja cambia.
const FORMAS = /^https:\/\/docs\.google\.com\/forms\/d\/e\/(1FAIpQLSeWwyqN1vbUn3wOvHTImDsNFbUwVvG0rijrWWggigDqOrgJHQ|1FAIpQLSe3nbhazUn9YVJqTLlP6tOdMZum-VkfEa9wTE8yAGPTqVuRsw)\//;
chrome.tabs.onUpdated.addListener((tabId, cambio, tab) => {
  const url = cambio.url || (tab && tab.url) || '';
  if (!FORMAS.test(url) || (cambio.status !== 'complete' && !cambio.url)) return;
  ultimaPestanaForm = tabId;
  setTimeout(() => { chrome.scripting.executeScript({ target: { tabId }, files: ['formas.js'] }).catch(() => {}); }, cambio.url && cambio.status !== 'complete' ? 1500 : 300);
});
// Aviso de versión nueva para todos los ejecutivos, sin tener que abrir la ventanita:
// al abrir el navegador y con cada llamada (como máximo cada 2 horas) se compara la versión en uso con la publicada.
// - Si ya está descargada en la carpeta pero no activada: notificación "clic para activarla".
// - Si hay una más nueva en internet: notificación "clic para actualizar" (abre actualizar.html, que la baja y la activa).
const verMayorF = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
async function revisarVersion(forzar) {
  try {
    const o = await chrome.storage.local.get(['rev_version', 'aviso_version']);
    if (!forzar && o.rev_version && Date.now() - o.rev_version < 2 * 3600000) return;
    await chrome.storage.local.set({ rev_version: Date.now() });
    const usada = chrome.runtime.getManifest().version;
    const local = await fetch(chrome.runtime.getURL('manifest.json') + '?v=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).catch(() => ({}));
    let tipo = '', nueva = '';
    if (local.version && verMayorF(local.version, usada)) { tipo = 'activar'; nueva = local.version; }
    else {
      const web = await fetch('https://cotizadora.github.io/clarogo/extension/manifest.json?v=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).catch(() => ({}));
      if (web.version && verMayorF(web.version, usada)) { tipo = 'bajar'; nueva = web.version; }
    }
    if (!tipo) return;
    const av = o.aviso_version || {};
    if (av.version === nueva && av.tipo === tipo && Date.now() - av.ts < 4 * 3600000) return;   // no repetir el mismo aviso seguido
    await chrome.storage.local.set({ aviso_version: { version: nueva, tipo, ts: Date.now() } });
    chrome.notifications.create('cg-ver-' + tipo + '-' + Date.now(), {
      type: 'basic', iconUrl: 'icono-128.png', priority: 2, requireInteraction: true,
      title: tipo === 'activar' ? `GoExt ${nueva} está lista` : `Hay una versión nueva de GoExt (${nueva})`,
      message: tipo === 'activar' ? 'Haz clic aquí para activarla.' : 'Haz clic aquí para actualizar. Se descarga y se activa sola.'
    });
  } catch (e) {}
}
chrome.notifications.onClicked.addListener(id => {
  if (!String(id).startsWith('cg-ver-')) return;
  chrome.notifications.clear(id);
  if (id.startsWith('cg-ver-activar')) chrome.runtime.reload();
  else chrome.tabs.create({ url: chrome.runtime.getURL('actualizar.html'), active: true });
});
chrome.runtime.onStartup.addListener(() => setTimeout(() => revisarVersion(true), 20000));

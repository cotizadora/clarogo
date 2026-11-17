// ClaroGo! Genesys: lee los cuadros de la llamada (FONO_CONTACTO, RUT_PERSONA, etc.),
// los copia en el formato que entiende Mi Planilla y, si se pide, los envía a una pestaña de ClaroGo!.
const PLANILLA = 'https://cotizadora.github.io/clarogo/';
const $ = s => document.querySelector(s);
let TEXTO = '';

// Se ejecuta dentro de cada marco de la página de Genesys.
// Recorre la página en orden: cada texto "CLAVE:" queda asociado al siguiente cuadro de texto.
function leerMarco() {
  const datos = {};
  const esClave = t => /^[A-Za-z][A-Za-z0-9_]*:$/.test(t);
  const textoPropio = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
  const recorrer = (raiz) => {
    let clave = '';
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_ELEMENT);
    for (let el = w.currentNode; el; el = w.nextNode()) {
      if (el.shadowRoot) recorrer(el.shadowRoot);
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (el.type === 'hidden' || el.type === 'button' || el.type === 'submit') continue;
        let k = clave;
        if (!k && el.id) { const lb = (el.getRootNode().querySelector ? el.getRootNode() : document).querySelector(`label[for="${CSS.escape(el.id)}"]`); if (lb && esClave(lb.textContent.trim())) k = lb.textContent.trim(); }
        if (k) { const v = String(el.value || '').trim(); if (!(k.slice(0, -1) in datos) || v) datos[k.slice(0, -1)] = v; clave = ''; }
        continue;
      }
      const t = textoPropio(el);
      if (t && esClave(t)) clave = t;
    }
  };
  try { recorrer(document.body || document.documentElement); } catch (e) {}
  return datos;
}

const telFormato = s => { let d = String(s || '').replace(/\D/g, ''); if (d.length === 11 && d.startsWith('56')) d = d.slice(2); return d.length === 9 ? d : ''; };

function mostrar(estado, clase) { $('#estado').textContent = estado; $('#estado').className = clase || ''; }

async function copiar(silencioso) {
  try { await navigator.clipboard.writeText(TEXTO); if (!silencioso) mostrar('Copiado. Pégalo en Mi Planilla.', 'ok'); return true; }
  catch (e) { mostrar('No se pudo copiar: ' + e.message, 'mal'); return false; }
}

// Secciones que un ejecutivo deja abiertas a la mano: nunca se le cambian
const PROTEGIDAS = ['oferta', 'png', 'stock', 'script'];
const seccionDe = url => { try { return new URL(url).hash.slice(1) || 'inicio'; } catch (e) { return ''; } };
const esperar = ms => new Promise(r => setTimeout(r, ms));
// Ninguna pestaña puede dejar la ventanita esperando: si no responde a tiempo, se sigue sin ella
// (Edge pone a dormir las pestañas que no se usan y a veces no contestan)
const conLimite = (p, ms) => Promise.race([p, esperar(ms).then(() => { throw new Error('sin respuesta'); })]);

// Llama a Mi Planilla dentro de la pestaña. Devuelve false si la página no la reconoce.
async function entregar(tabId) {
  try {
    const [res] = await conLimite(chrome.scripting.executeScript({
      target: { tabId }, world: 'MAIN', args: [TEXTO],
      func: txt => (typeof window.clarogoDesdeGenesys === 'function') ? window.clarogoDesdeGenesys(txt) : 'sin-planilla'
    }), 2500);
    return !!res && res.result !== 'sin-planilla';
  } catch (e) { return false; }
}
// Abre una pestaña nueva en la planilla y espera hasta que la página esté lista (máximo 15 segundos)
async function abrirNueva() {
  const tab = await chrome.tabs.create({ url: PLANILLA + '#control', active: true });
  for (let i = 0; i < 30; i++) { await esperar(500); if (await entregar(tab.id)) return tab; }
  throw new Error('la planilla tardó demasiado en abrir');
}
async function enviar() {
  $('#enviar').disabled = true;
  mostrar('Enviando a Mi Planilla…', 'ok');
  try {
    // De la más antigua a la más nueva
    const tabs = (await chrome.tabs.query({ url: PLANILLA + '*' })).filter(t => !t.discarded).sort((a, b) => a.id - b.id);
    // 1. Una pestaña que ya está en la planilla. 2. Una pestaña de ClaroGo! en el inicio u otra sección libre.
    // Las pestañas en Oferta, PNG, Stock o Script no se tocan: en ese caso se abre una pestaña nueva.
    const candidata = tabs.find(t => seccionDe(t.url) === 'control') || tabs.find(t => !PROTEGIDAS.includes(seccionDe(t.url)));
    let tab = null;
    if (candidata && await entregar(candidata.id)) tab = candidata;
    else tab = await abrirNueva();       // no hay pestaña libre o no se reconoce: se abre desde cero
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
    window.close();
  } catch (e) { mostrar('No se pudo enviar: ' + e.message + '. Los datos siguen copiados.', 'mal'); $('#enviar').disabled = false; }
}

// Pestañas de Genesys abiertas en cualquier ventana, aunque estés mirando otra
const GENESYS = ['https://*.pure.cloud/*', 'https://*.mypurecloud.com/*', 'https://*.genesys.cloud/*'];
const llenos = d => Object.values(d).filter(Boolean).length;
async function leerPestana(tabId) {
  try {
    const marcos = await conLimite(chrome.scripting.executeScript({ target: { tabId, allFrames: true }, func: leerMarco }), 4000);
    // Se queda con el marco que trae más datos (el guion de la llamada)
    return marcos.map(m => m.result || {}).sort((a, b) => llenos(b) - llenos(a));
  } catch (e) { return []; }
}
async function iniciar() {
  const tabs = await chrome.tabs.query({ url: GENESYS });
  if (!tabs.length) { mostrar('No encontré Genesys abierto. Abre Genesys con la llamada y vuelve a intentarlo.', 'mal'); return; }
  // Primero la pestaña que estás mirando (si es Genesys), luego la usada más recientemente
  tabs.sort((a, b) => (b.active - a.active) || ((b.lastAccessed || 0) - (a.lastAccessed || 0)));
  let todos = [];
  for (const t of tabs) {
    const m = await leerPestana(t.id);
    const tel = m.some(d => d.FONO_CONTACTO || d.Fono1 || d.Fono2 || d.LEGACY_ID);
    if (tel) { todos = m; break; }                       // la primera con teléfono gana
    if (!todos.length && m.some(d => llenos(d))) todos = m;  // si ninguna trae teléfono, la que tenga algún dato
  }
  const d = Object.assign({}, ...todos.slice().reverse());
  const conDatos = Object.entries(d).filter(([, v]) => v);
  if (!conDatos.length) { mostrar('No encontré datos del cliente. Abre la llamada con el panel "Interacción de llamada" visible y vuelve a intentarlo.', 'mal'); return; }
  // Mismo formato que Ctrl+A en Genesys: CLAVE: y el valor en la línea siguiente
  TEXTO = Object.entries(d).map(([k, v]) => `${k}:\n${v || k}`).join('\n');
  const tel = telFormato(d.FONO_CONTACTO) || telFormato(d.Fono1) || telFormato(d.Fono2) || telFormato(d.LEGACY_ID);
  const nombre = [d.FIRST_NAME, d.SECOND_NAME, d.THIRD_NAME].filter(Boolean).join(' ');
  const filas = [['Teléfono', tel || 'No viene'], ['RUT', d.RUT_PERSONA], ['Nombre', nombre], ['Campaña', d.vNombre_Campana || d.CampaignDescription], ['Viene de', d.Segment_of_Origin]].filter(([, v]) => v);
  $('#datos').innerHTML = filas.map(([k, v]) => `<tr><td>${k}</td><td${k === 'Teléfono' ? ' class="tel"' : ''}></td></tr>`).join('');
  [...$('#datos').querySelectorAll('tr')].forEach((tr, i) => { tr.lastChild.textContent = filas[i][1]; });
  $('#datos').hidden = false;
  if (await copiar(true)) mostrar(tel ? '✓ Datos copiados.' : 'Datos copiados, pero esta llamada no trae teléfono.', tel ? 'ok' : 'mal');
  $('#enviar').disabled = $('#copiar').disabled = false;
  if (tel) prepararWhatsApp(tel, nombre);
}

/* ── WhatsApp Web con la oferta ───────────────────────────────────── */
// Los mensajes de cada plan vienen de ClaroGo! (así siempre están al día). Si no hay ClaroGo! abierto, queda el saludo.
let MENSAJES = [], TEL = '';
// Presentación de respaldo: usa el nombre y el mensaje guardados desde ClaroGo! y el saludo según la hora
const NOMBRE_DEFECTO = 'Eduardo Pérez';
const PLANTILLA_DEFECTO = 'Hola {cliente}, {saludo}, mi nombre es {nombre}. Tal como conversamos telefónicamente, le envío la propuesta por este medio. Estoy a su disposición para aclarar cualquiera de las dudas.';
const saludoHora = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? 'muy buenos días' : h >= 12 && h < 20 ? 'muy buenas tardes' : 'muy buenas noches'; };
async function presentacionGuardada(cliente) {
  let p = {}; try { p = await chrome.storage.local.get(['nombre', 'plantilla']); } catch (e) {}
  const pn = (() => { const x = String(cliente || '').trim().split(/\s+/)[0] || ''; return x.length > 1 ? x.charAt(0).toUpperCase() + x.slice(1).toLowerCase() : ''; })();
  let txt = (p.plantilla || PLANTILLA_DEFECTO).replace(/\{saludo\}/gi, saludoHora()).replace(/\{nombre\}/gi, p.nombre || NOMBRE_DEFECTO);
  txt = pn ? txt.replace(/\{cliente\}/gi, pn) : txt.replace(/\s*\{cliente\}\s*(?=[,.!?])/gi, '').replace(/\s*\{cliente\}/gi, '');
  txt = txt.replace(/\s*\{compania\}/gi, '').replace(/ {2,}/g, ' ');
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}
// Selector de planes: por defecto el Plan 500 (el más barato); si el ejecutivo ya eligió otro, se respeta
let PLAN_ELEGIDO = 'v500';
function pintarPlanes() {
  let pref = MENSAJES.findIndex(m => m.id === PLAN_ELEGIDO);
  if (pref < 0) pref = MENSAJES.findIndex(m => m.id === 'v500');
  if (pref < 0) pref = 0;
  $('#wa-plan').innerHTML = MENSAJES.map((m, i) => `<option value="${i}"${i === pref ? ' selected' : ''}></option>`).join('');
  [...$('#wa-plan').options].forEach((o, i) => { o.textContent = MENSAJES[i].titulo; });
}
async function prepararWhatsApp(tel, nombre) {
  TEL = tel.replace(/\D/g, '');
  // 1. Al instante: saludo + oferta, con los planes que ClaroGo! dejó guardados en la extensión
  const pres = await presentacionGuardada(nombre);
  let guardados = []; try { guardados = (await chrome.storage.local.get('planes')).planes || []; } catch (e) {}
  MENSAJES = guardados.map(p => ({ id: p.id, titulo: p.titulo, texto: `${pres}\n\n${p.detalle}` }))
    .concat([{ id: '', titulo: guardados.length ? 'Solo la presentación, sin plan' : 'Solo la presentación (abre ClaroGo! una vez para cargar los planes)', texto: pres }]);
  pintarPlanes(); $('#wa').hidden = false;
  // 2. Si alguna pestaña de ClaroGo! responde, se usan sus mensajes (saludan con el nombre del cliente si está en la planilla)
  try {
    const tabs = (await chrome.tabs.query({ url: PLANILLA + '*' })).filter(t => !t.discarded).sort((a, b) => a.id - b.id);
    for (const t of tabs) {
      try {
        const [r] = await conLimite(chrome.scripting.executeScript({ target: { tabId: t.id }, world: 'MAIN', args: [nombre || '', TEL], func: (n, t) => typeof window.clarogoMensajesWA === 'function' ? window.clarogoMensajesWA(n, t) : null }), 1500);
        if (r && Array.isArray(r.result) && r.result.length) { MENSAJES = r.result; pintarPlanes(); break; }
      } catch (e) {}
    }
  } catch (e) {}
}
$('#wa-plan').addEventListener('change', () => { const m = MENSAJES[+$('#wa-plan').value]; PLAN_ELEGIDO = m ? m.id : ''; });
$('#wa-abrir').onclick = async () => {
  const m = MENSAJES[+$('#wa-plan').value] || MENSAJES[0];
  const url = `https://web.whatsapp.com/send?phone=56${TEL}&text=${encodeURIComponent(m.texto)}`;
  $('#wa-abrir').disabled = true;
  // El mensaje también queda copiado: si no aparece escrito en WhatsApp, se pega con Ctrl+V
  try { await navigator.clipboard.writeText(m.texto); } catch (e) {}
  // Primero el modo rápido del proceso de fondo (abre el chat sin recargar WhatsApp Web).
  // Si el proceso de fondo no responde, se abre desde aquí mismo como antes.
  try { const r = await chrome.runtime.sendMessage({ tipo: 'wa', url }); if (r) { window.close(); return; } } catch (e) {}
  try {
    let tabs = [];
    try { tabs = (await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' })).sort((a, b) => a.id - b.id); } catch (e) {}
    if (tabs.length) {
      await chrome.tabs.update(tabs[0].id, { url, active: true });
      await chrome.windows.update(tabs[0].windowId, { focused: true });
    } else await chrome.tabs.create({ url, active: true });
    window.close();
  } catch (e) { mostrar('No se pudo abrir WhatsApp Web: ' + e.message, 'mal'); $('#wa-abrir').disabled = false; }
};

$('#copiar').onclick = () => copiar(false);
$('#enviar').onclick = enviar;
// Versión instalada, tomada del manifest: así se ve de inmediato si la extensión se actualizó
$('#version').textContent = 'v' + chrome.runtime.getManifest().version;
iniciar();

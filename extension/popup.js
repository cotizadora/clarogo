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

const telFormato = s => { let d = String(s || '').replace(/\D/g, ''); if (d.length === 11 && d.startsWith('56')) d = d.slice(2); return d.length === 9 ? `${d[0]} ${d.slice(1, 5)} ${d.slice(5)}` : ''; };

function mostrar(estado, clase) { $('#estado').textContent = estado; $('#estado').className = clase || ''; }

async function copiar(silencioso) {
  try { await navigator.clipboard.writeText(TEXTO); if (!silencioso) mostrar('Copiado. Pégalo en Mi Planilla.', 'ok'); return true; }
  catch (e) { mostrar('No se pudo copiar: ' + e.message, 'mal'); return false; }
}

// Secciones que un ejecutivo deja abiertas a la mano: nunca se le cambian
const PROTEGIDAS = ['oferta', 'png', 'stock', 'script'];
const seccionDe = url => { try { return new URL(url).hash.slice(1) || 'inicio'; } catch (e) { return ''; } };
const esperar = ms => new Promise(r => setTimeout(r, ms));

// Llama a Mi Planilla dentro de la pestaña. Devuelve false si la página no la reconoce.
async function entregar(tabId) {
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId }, world: 'MAIN', args: [TEXTO],
      func: txt => (typeof window.clarogoDesdeGenesys === 'function') ? window.clarogoDesdeGenesys(txt) : 'sin-planilla'
    });
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
    const tabs = (await chrome.tabs.query({ url: PLANILLA + '*' })).sort((a, b) => a.id - b.id);
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

async function iniciar() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !/^https:\/\/[^/]*(pure\.cloud|mypurecloud\.com|genesys\.cloud)\//.test(tab.url || '')) {
    mostrar('Abre esta ventana con la llamada de Genesys en pantalla.', 'mal'); return;
  }
  let marcos = [];
  try { marcos = await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, func: leerMarco }); }
  catch (e) { mostrar('No se pudo leer Genesys: ' + e.message, 'mal'); return; }
  // Se queda con el marco que trae más datos (el guion de la llamada)
  const todos = marcos.map(m => m.result || {}).sort((a, b) => Object.values(b).filter(Boolean).length - Object.values(a).filter(Boolean).length);
  const d = Object.assign({}, ...todos.slice().reverse());
  const llenos = Object.entries(d).filter(([, v]) => v);
  if (!llenos.length) { mostrar('No encontré datos del cliente. Abre la llamada con el panel "Interacción de llamada" visible y vuelve a intentarlo.', 'mal'); return; }
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
async function prepararWhatsApp(tel, nombre) {
  TEL = tel.replace(/\D/g, '');
  try {
    const tabs = (await chrome.tabs.query({ url: PLANILLA + '*' })).sort((a, b) => a.id - b.id);
    for (const t of tabs) {
      const [r] = await chrome.scripting.executeScript({ target: { tabId: t.id }, world: 'MAIN', args: [nombre || ''], func: n => typeof window.clarogoMensajesWA === 'function' ? window.clarogoMensajesWA(n) : null });
      if (r && Array.isArray(r.result) && r.result.length) { MENSAJES = r.result; break; }
    }
  } catch (e) {}
  if (!MENSAJES.length) MENSAJES = [{ id: '', titulo: 'Solo saludo (abre ClaroGo! para ver los planes)', texto: 'Hola, te escribo por la oferta de Claro que conversamos. ¿Tienes un momento para revisarla?' }];
  const pref = MENSAJES.findIndex(m => m.id === 'v800');
  $('#wa-plan').innerHTML = MENSAJES.map((m, i) => `<option value="${i}"${i === (pref < 0 ? 0 : pref) ? ' selected' : ''}></option>`).join('');
  [...$('#wa-plan').options].forEach((o, i) => { o.textContent = MENSAJES[i].titulo; });
  $('#wa').hidden = false;
}
$('#wa-abrir').onclick = async () => {
  const m = MENSAJES[+$('#wa-plan').value] || MENSAJES[0];
  const url = `https://web.whatsapp.com/send?phone=56${TEL}&text=${encodeURIComponent(m.texto)}`;
  $('#wa-abrir').disabled = true;
  const ok = await chrome.runtime.sendMessage({ tipo: 'wa', url }).catch(() => false);
  if (ok) window.close(); else { mostrar('No se pudo abrir WhatsApp Web.', 'mal'); $('#wa-abrir').disabled = false; }
};

$('#copiar').onclick = () => copiar(false);
$('#enviar').onclick = enviar;
iniciar();

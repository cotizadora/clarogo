// GoExt (extensión de ClaroGo!): lee los cuadros de la llamada (FONO_CONTACTO, RUT_PERSONA, etc.),
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

// Plan elegido en el selector de WhatsApp y comentario escrito: llegan a la fila nueva de la planilla
function extraEnvio() {
  let plan = '';
  try { const m = (typeof MENSAJES !== 'undefined' && MENSAJES[+document.querySelector('#wa-plan').value]) || null; if (m && m.id) plan = m.titulo; } catch (e) {}
  return { plan, notas: (document.querySelector('#comentario').value || '').trim(), rut: (document.querySelector('#rut-cli').value || '').trim(), historial: HIST_TXT };
}
// Llama a Mi Planilla dentro de la pestaña. Devuelve false si la página no la reconoce.
async function entregar(tabId) {
  try {
    const [res] = await conLimite(chrome.scripting.executeScript({
      target: { tabId }, world: 'MAIN', args: [TEXTO, extraEnvio()],
      func: (txt, extra) => (typeof window.clarogoDesdeGenesys === 'function') ? window.clarogoDesdeGenesys(txt, extra) : 'sin-planilla'
    }), 5000);   // recién encendido el computador la página puede tardar en responder
    return !!res && res.result !== 'sin-planilla';
  } catch (e) { return false; }
}
// Abre una pestaña nueva en la planilla y espera hasta que la página esté lista (máximo 15 segundos)
async function abrirNueva() {
  // Se abre en segundo plano: si pasara al frente, la ventana de la extensión se cerraría antes de entregar el cliente
  const tab = await chrome.tabs.create({ url: PLANILLA + '#control', active: false });
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
    const candidatas = [...tabs.filter(t => seccionDe(t.url) === 'control'), ...tabs.filter(t => seccionDe(t.url) !== 'control' && !PROTEGIDAS.includes(seccionDe(t.url)))];
    let tab = null;
    for (const c of candidatas) { if (await entregar(c.id)) { tab = c; break; } }   // prueba cada pestaña libre antes de abrir otra
    if (!tab) tab = await abrirNueva();       // no hay pestaña libre o ninguna responde: se abre desde cero
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
  if (!tabs.length) { await llamadaAnterior('No encontré Genesys abierto. Abre Genesys con la llamada y vuelve a intentarlo.'); return; }
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
  if (!conDatos.length) { await llamadaAnterior('No encontré datos del cliente. Abre la llamada con el panel "Interacción de llamada" visible y vuelve a intentarlo.'); return; }
  await pintarLlamada(d, null);
}

// Historial de tipificaciones (lo guarda fondo.js al enviar cada registro): avisa si este teléfono ya fue llamado
let HIST_TXT = '';
const fechaCorta = ts => { const x = new Date(ts), p = n => String(n).padStart(2, '0'); return `${p(x.getDate())}-${p(x.getMonth() + 1)}-${x.getFullYear()} ${p(x.getHours())}:${p(x.getMinutes())}`; };
async function mostrarHistorial(tel) {
  HIST_TXT = ''; const caja = document.querySelector('#hist'); if (!caja) return;
  const t9 = String(tel || '').slice(-9); caja.hidden = true; if (t9.length !== 9) return;
  let h = [], pl = [];
  try {
    const o = await chrome.storage.local.get(['historial_tip', 'planilla_ct']);
    h = (o.historial_tip || []).filter(x => x.tel === t9).sort((a, b) => b.ts - a.ts);
    // Lo que ya está en Mi Planilla para este teléfono (se copia en tiempo real desde ClaroGo!)
    pl = ((o.planilla_ct && o.planilla_ct.filas) || []).filter(r => String(r.telefono || '').replace(/\D/g, '').slice(-9) === t9).sort((a, b) => String(b.fecha + b.hora).localeCompare(String(a.fecha + a.hora)));
  } catch (e) {}
  if (!h.length && !pl.length) return;
  const fPl = r => String(r.fecha || '').split('-').reverse().join('-').slice(0, 5);
  HIST_TXT = h.slice(0, 5).map(x => fechaCorta(x.ts) + ' ' + x.motivo).join(' | ');
  // Una sola línea: lo último de cada fuente. El detalle completo queda al pasar el mouse
  const partes = [];
  if (h.length) partes.push(`Tipificado: ${h[0].motivo} · ${fechaCorta(h[0].ts).slice(0, 5)}${h.length > 1 ? ` (${h.length})` : ''}`);
  if (pl.length) partes.push(`Planilla: ${pl[0].tipo || 'sin tipificar'} · ${fPl(pl[0])}`);
  caja.textContent = '🔁 ' + partes.join(' | ');
  caja.title = [...h.slice(0, 8).map(x => fechaCorta(x.ts) + ' · ' + x.motivo), ...pl.slice(0, 8).map(r => `${fPl(r)} ${r.hora || ''} · Planilla: ${r.tipo || 'sin tipificar'}${r.nombre ? ' · ' + r.nombre : ''}${r.notas ? ' · ' + r.notas.slice(0, 60) : ''}`)].join('\n');
  caja.hidden = false;
}
// Última llamada leída: si la llamada se corta, se puede tipificar igual durante unos minutos
const ANTERIOR_MS = 15 * 60000;
async function llamadaAnterior(motivo) {
  let u = null;
  try { u = (await chrome.storage.local.get('ultima_llamada')).ultima_llamada; } catch (e) {}
  if (!u || !u.d || Date.now() - u.ts > ANTERIOR_MS) { mostrar(motivo, 'mal'); return; }
  await pintarLlamada(u.d, u);
}
const haceCuanto = ms => { const s = Math.round(ms / 1000); return s < 60 ? `hace ${s} s` : `hace ${Math.round(s / 60)} min`; };
function marcarTipificada() {
  try { chrome.storage.local.get('ultima_llamada').then(o => { const u = o.ultima_llamada; if (u && TEL_NV && String(u.tel || '') === TEL_NV) { u.tipificada = true; chrome.storage.local.set({ ultima_llamada: u }); } }); } catch (e) {}
}
async function pintarLlamada(d, anterior) {
  // Mismo formato que Ctrl+A en Genesys: CLAVE: y el valor en la línea siguiente
  TEXTO = Object.entries(d).map(([k, v]) => `${k}:\n${v || k}`).join('\n');
  const tel = telFormato(d.FONO_CONTACTO) || telFormato(d.Fono1) || telFormato(d.Fono2) || telFormato(d.LEGACY_ID);
  const nombre = [d.FIRST_NAME, d.SECOND_NAME, d.THIRD_NAME].filter(Boolean).join(' ');
  if (d.RUT_PERSONA && /\d{6,}/.test(d.RUT_PERSONA) && !document.querySelector('#rut-cli').value) document.querySelector('#rut-cli').value = d.RUT_PERSONA;
  const filas = [['Teléfono', tel || 'No viene'], ['RUT', d.RUT_PERSONA], ['Nombre', nombre], ['Campaña', d.vNombre_Campana || d.CampaignDescription], ['Viene de', d.Segment_of_Origin]].filter(([, v]) => v);
  $('#datos').innerHTML = filas.map(([k, v]) => `<tr><td>${k}</td><td${k === 'Teléfono' ? ' class="tel"' : ''}></td></tr>`).join('');
  [...$('#datos').querySelectorAll('tr')].forEach((tr, i) => { tr.lastChild.textContent = filas[i][1]; });
  $('#datos').hidden = false;
  const copiado = await copiar(true);
  if (anterior) {
    mostrar(`📞 Llamada anterior (${haceCuanto(Date.now() - anterior.ts)}). Puedes tipificarla.`, 'anterior');
  } else if (copiado) mostrar(tel ? '✓ Datos copiados.' : 'Datos copiados, pero esta llamada no trae teléfono.', tel ? 'ok' : 'mal');
  $('#enviar').disabled = false;
  if (tel) prepararWhatsApp(tel, nombre);
  TEL_NV = (tel || '').replace(/\D/g, '');
  await mostrarHistorial(TEL_NV);
  // Se guarda la llamada actual (si es la misma de antes, se conserva si ya fue tipificada)
  if (!anterior) {
    try {
      const prev = (await chrome.storage.local.get('ultima_llamada')).ultima_llamada;
      chrome.storage.local.set({ ultima_llamada: { d, tel: TEL_NV, ts: Date.now(), tipificada: !!(prev && prev.tel === TEL_NV && prev.tipificada) } });
    } catch (e) {}
  }
}

/* ── No venta: formulario "Registro de atención (NO VENTA)" de la empresa ──
   Se abre con las respuestas ya marcadas (Cliente evaluado: No, motivo, teléfono y comentario).
   El ejecutivo revisa, presiona Siguiente y Enviar: la extensión nunca lo envía sola. */
const NV_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSeWwyqN1vbUn3wOvHTImDsNFbUwVvG0rijrWWggigDqOrgJHQ/viewform';
const NV_MOTIVOS = ['CLIENTE EMPRESA', 'CLIENTE OFENSIVO', 'CLIENTE PIDE NO SER CONTACTADO', 'CLIENTE CONFORME CON COMPAÑIA ACTUAL', 'CORTE DE LLAMADO', 'LLAMADA MUDA', 'MALA EXPERIENCIA CON CLARO', 'PORTABILIDAD MENOS DE 120 DIAS', 'NO ES TITULAR', 'NO HAY STOCK DE EQUIPO SOLICITADO', 'PAGA MENOS EN LA COMPAÑIA ACTUAL', 'SE ENVIA INFO POR WSP', 'SIN COBERTURA CLARO', 'EXTRANJERO SIN DOCUMENTACION', 'C.I VENCIDO', 'NUMERO NO ACTIVO'];
const NV_COMPANIAS = ['WOM', 'ENTEL', 'MOVISTAR', 'MUNDO PACIFICO', 'Otros'];
let TEL_NV = '';
// Grupos de motivos con su color: seguimiento (verde), rechazo del cliente (rojo), requisitos (naranjo), llamada (gris)
const NV_GRUPOS = [
  ['seg', 'Seguimiento', ['SE ENVIA INFO POR WSP']],
  ['rech', 'Rechazo del cliente', ['CLIENTE CONFORME CON COMPAÑIA ACTUAL', 'PAGA MENOS EN LA COMPAÑIA ACTUAL', 'MALA EXPERIENCIA CON CLARO', 'CLIENTE PIDE NO SER CONTACTADO', 'CLIENTE OFENSIVO']],
  ['req', 'Requisitos', ['PORTABILIDAD MENOS DE 120 DIAS', 'NO ES TITULAR', 'SIN COBERTURA CLARO', 'NO HAY STOCK DE EQUIPO SOLICITADO', 'CLIENTE EMPRESA', 'EXTRANJERO SIN DOCUMENTACION', 'C.I VENCIDO', 'NUMERO NO ACTIVO']],
  ['llam', 'Llamada', ['CORTE DE LLAMADO', 'LLAMADA MUDA']]
];
const nvGrupo = m => (NV_GRUPOS.find(g => g[2].includes(m)) || ['otro'])[0];
const NV_CORTO = { 'CLIENTE CONFORME CON COMPAÑIA ACTUAL': 'Conforme con su compañía', 'PAGA MENOS EN LA COMPAÑIA ACTUAL': 'Paga menos en su compañía', 'CLIENTE PIDE NO SER CONTACTADO': 'Pide no ser contactado', 'PORTABILIDAD MENOS DE 120 DIAS': 'Portabilidad menos de 120 días', 'NO HAY STOCK DE EQUIPO SOLICITADO': 'Sin stock del equipo', 'EXTRANJERO SIN DOCUMENTACION': 'Extranjero sin documentación', 'MALA EXPERIENCIA CON CLARO': 'Mala experiencia con Claro', 'SE ENVIA INFO POR WSP': 'Se envía info por WhatsApp', 'NUMERO NO ACTIVO': 'Número no activo', 'C.I VENCIDO': 'Carnet vencido', 'SIN COBERTURA CLARO': 'Sin cobertura Claro' };
const nvTexto = m => m === '__otro' ? 'Otro (escribir)' : (NV_CORTO[m] || m.charAt(0) + m.slice(1).toLowerCase());
// Uso: cada vez que se abre un registro se guarda la fecha. El puntaje pesa más lo reciente (la mitad cada 14 días)
let NV_USO = {}, NV_ORDEN = 'grupo';
const nvPuntaje = m => (NV_USO[m] || []).reduce((s, t) => s + Math.pow(.5, (Date.now() - t) / (14 * 864e5)), 0);
function nvPintarChips() {
  const todos = [...NV_MOTIVOS, '__otro'], cont = $('#nv-chips'), sel = $('#nv-motivo').value;
  const chip = m => `<button type="button" class="g-${m === '__otro' ? 'otro' : nvGrupo(m)}${m === sel ? ' on' : ''}" data-m="${m}" title="${m === '__otro' ? 'Escribir otro motivo' : m}">${nvTexto(m)}</button>`;
  if (NV_ORDEN === 'grupo') cont.innerHTML = NV_GRUPOS.map(([g, t, ms]) => `<div class="g-t">${t}</div>` + ms.map(chip).join('')).join('') + `<div class="g-t">Otro</div>` + chip('__otro');
  else {
    const lista = NV_MOTIVOS.slice().sort(NV_ORDEN === 'az' ? (a, b) => nvTexto(a).localeCompare(nvTexto(b), 'es') : (a, b) => (nvPuntaje(b) - nvPuntaje(a)) || nvTexto(a).localeCompare(nvTexto(b), 'es'));
    cont.innerHTML = lista.map(chip).join('') + chip('__otro');
  }
  [...$('#nv-orden').querySelectorAll('button')].forEach(b => b.classList.toggle('on', b.dataset.orden === NV_ORDEN));
}
function nvPintar() {
  const m = $('#nv-motivo').value;
  $('#nv-otro').hidden = m !== '__otro';
  $('#nv-comp').hidden = !/CONFORME CON COMPA|PAGA MENOS/.test(m);
  $('#nv-abrir').textContent = m ? '📝 Tipificar en formulario: ' + nvTexto(m) : '📝 Tipificar en formulario';
  nvPintarChips();
}function nvURL() {
  const m = $('#nv-motivo').value, otro = ($('#nv-otro').value || '').trim(), comp = $('#nv-comp').value, obs = ($('#comentario').value || '').trim();
  const p = [['entry.1000912384', 'No'], ['entry.1655228490', 'NO']];
  if (TEL_NV) p.push(['entry.1534465510', TEL_NV.slice(-9)]);
  if (m === '__otro') { p.push(['entry.335135472', '__other_option__']); if (otro) p.push(['entry.335135472.other_option_response', otro]); }
  else if (m) p.push(['entry.335135472', m]);
  if (comp && /CONFORME CON COMPA/.test(m)) p.push(['entry.46466138', comp]);
  if (comp && /PAGA MENOS/.test(m)) p.push(['entry.1557285403', comp]);
  if (obs) p.push(['entry.613959426', obs]);
  return NV_FORM + '?usp=pp_url&' + p.map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
}
/* ── Código de conclusión en Genesys (segunda tipificación) ─────────
   Los motivos del formulario y los códigos de Genesys no calzan uno a uno: se sugiere uno y el ejecutivo puede cambiarlo.
   La extensión solo lo marca en Genesys; enviarlo en Genesys es decisión del ejecutivo. */
const GC_CODIGOS = ['Agendado / Pre-Cierre (llamar para cerrar venta)', 'Buzón de Voz', 'Cliente Corta Llamada en conversación', 'Cliente Corta Llamada en saludo', 'Cliente no desea que lo vuelvan a llamar (No Molestar)', 'FVC/Sin cobertura delivery (google)', 'Mudo / Sin Audio', 'No Venta / Deuda > $14.000 (según calculadora excel)', 'No Venta / No cumple el plazo 120 días', 'Rechazo/Cliente con deuda Claro', 'Rechazo/Cliente con deuda Operador Actual', 'Rechazo/Cliente con Serie No Vigente', 'Rechazo/Conformidad con su compañía actual', 'Rechazo/Desconfia de la llamada', 'Rechazo/Mala Experiencia Claro Cobertura (señal)', 'Rechazo/Mala Experiencia Claro Precio/postventa', 'Rechazo/Mejor oferta competencia $ precio', 'Rechazo/No aprueba validacion facial', 'Rechazo/No es el titular de la linea (pedir referido)', 'Rechazo/Tiene plan empresa (con rut empresa)', 'Venta + Equipo Outbound', 'Venta Outbound', 'Venta Referido Outbound', 'Volver a llamar (cliente no acepta, pero le interesa)', 'YA ES CLIENTE'];
const GC_SUGERIDO = {
  'CLIENTE EMPRESA': 'Rechazo/Tiene plan empresa (con rut empresa)',
  'CLIENTE OFENSIVO': 'Cliente no desea que lo vuelvan a llamar (No Molestar)',
  'CLIENTE PIDE NO SER CONTACTADO': 'Cliente no desea que lo vuelvan a llamar (No Molestar)',
  'CLIENTE CONFORME CON COMPAÑIA ACTUAL': 'Rechazo/Conformidad con su compañía actual',
  'CORTE DE LLAMADO': 'Cliente Corta Llamada en conversación',
  'LLAMADA MUDA': 'Mudo / Sin Audio',
  'MALA EXPERIENCIA CON CLARO': 'Rechazo/Mala Experiencia Claro Precio/postventa',
  'PORTABILIDAD MENOS DE 120 DIAS': 'No Venta / No cumple el plazo 120 días',
  'NO ES TITULAR': 'Rechazo/No es el titular de la linea (pedir referido)',
  'NO HAY STOCK DE EQUIPO SOLICITADO': 'Volver a llamar (cliente no acepta, pero le interesa)',
  'PAGA MENOS EN LA COMPAÑIA ACTUAL': 'Rechazo/Mejor oferta competencia $ precio',
  'SE ENVIA INFO POR WSP': 'Volver a llamar (cliente no acepta, pero le interesa)',
  'SIN COBERTURA CLARO': 'Rechazo/Mala Experiencia Claro Cobertura (señal)',
  'C.I VENCIDO': 'Rechazo/Cliente con Serie No Vigente'
};
// Corre dentro de cada marco de Genesys: solo actúa en el recuadro "Códigos de conclusión" y solo marca (no envía)
async function elegirConclusion(codigo) {
  if (!/acw-gadgets-wrap-up/.test(location.pathname)) return null;
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const meta = norm(codigo);
  const todos = () => { const out = []; const walk = r => r.querySelectorAll('*').forEach(e => { out.push(e); if (e.shadowRoot) walk(e.shadowRoot); }); walk(document); return out; };
  const visible = e => !!(e.getClientRects && e.getClientRects().length);
  const buscar = () => todos().filter(e => visible(e) && norm(e.textContent) === meta).sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length)[0];
  let el = buscar();
  if (!el) {   // si la lista está cerrada o es larga, se escribe en "Buscar códigos de conclusión"
    const inp = todos().find(e => e.tagName === 'INPUT' && e.type !== 'hidden' && visible(e));
    if (inp) {
      inp.focus(); inp.click();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(inp, codigo.slice(0, 18));
      inp.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      for (let i = 0; i < 10 && !el; i++) { await new Promise(r => setTimeout(r, 250)); el = buscar(); }
    }
  }
  if (!el) return 'no';
  const op = el.closest('[role="option"],[role="radio"],[role="menuitem"],gux-option,button,label,li') || el;
  op.scrollIntoView({ block: 'center' });
  ['pointerdown', 'mousedown', 'pointerup', 'mouseup'].forEach(t => op.dispatchEvent(new MouseEvent(t, { bubbles: true, composed: true })));
  op.click();
  return 'ok';
}
async function marcarEnGenesys(codigo) {
  if (!codigo) return 'sin';
  try {
    const tabs = await chrome.tabs.query({ url: GENESYS });
    for (const t of tabs) {
      const r = await conLimite(chrome.scripting.executeScript({ target: { tabId: t.id, allFrames: true }, func: elegirConclusion, args: [codigo] }), 5000);
      if ((r || []).some(x => x && x.result === 'ok')) return 'ok';
    }
  } catch (e) {}
  return 'no';
}
function initNoVenta() {
  $('#gc-codigo').innerHTML = '<option value="">No marcar en Genesys</option>' + GC_CODIGOS.map(() => '<option></option>').join('');
  [...$('#gc-codigo').options].forEach((o, i) => { if (i > 0) { o.value = GC_CODIGOS[i - 1]; o.textContent = GC_CODIGOS[i - 1]; } });
  $('#nv-comp').innerHTML = '<option value="">Compañía actual del cliente</option>' + NV_COMPANIAS.map(x => `<option>${x}</option>`).join('');
  $('#nv-chips').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; $('#nv-motivo').value = b.dataset.m; $('#gc-codigo').value = GC_SUGERIDO[b.dataset.m] || ''; nvPintar(); if (b.dataset.m === '__otro') $('#nv-otro').focus(); });
  $('#nv-orden').addEventListener('click', e => { const b = e.target.closest('[data-orden]'); if (!b) return; NV_ORDEN = b.dataset.orden; try { chrome.storage.local.set({ nvOrden: NV_ORDEN }); } catch (x) {} nvPintarChips(); });
  $('#nv-abrir').addEventListener('click', async () => {
    const m = $('#nv-motivo').value;
    if (!m) { mostrar('Elige el motivo de no venta.', 'mal'); return; }
    if (m === '__otro' && !($('#nv-otro').value || '').trim()) { mostrar('Escribe el motivo en el cuadro "Otro".', 'mal'); $('#nv-otro').focus(); return; }
    // Se guarda el uso para ordenar por "Más usados" (máximo 60 fechas por motivo)
    try { NV_USO[m] = [...(NV_USO[m] || []), Date.now()].slice(-60); await chrome.storage.local.set({ nvUso: NV_USO }); } catch (e) {}
    // Aviso para formas.js: pasa a la segunda página, recorre lo llenado y deja listo el botón Enviar
    const resumen = (m === '__otro' ? ($('#nv-otro').value || '').trim() : nvTexto(m)) + (TEL_NV ? ' · ' + TEL_NV.slice(-9) : '');
    try { await chrome.storage.local.remove('nv_enviado'); } catch (e) {}   // un registro nuevo nunca hereda el envío anterior
    try { await chrome.storage.local.set({ nv_pedido: { ts: Date.now(), auto: $('#nv-auto').checked, aviso: $('#nv-aviso').checked, resumen, tel: TEL_NV.slice(-9), motivo: m === '__otro' ? ($('#nv-otro').value || '').trim() : nvTexto(m) } }); } catch (e) {}
    marcarTipificada();
    // Segunda tipificación: marca el código de conclusión en Genesys (sin enviarlo). Si no se pudo, se avisa
    const codigo = $('#gc-codigo').value;
    if (codigo) {
      mostrar('Marcando el código en Genesys…', 'ok');
      const r = await marcarEnGenesys(codigo);
      if (r !== 'ok') { try { chrome.notifications.create('cg-gc-' + Date.now(), { type: 'basic', iconUrl: 'icono-128.png', title: 'Genesys: marca el código a mano', message: 'No encontré el recuadro de códigos de conclusión abierto. Código: ' + codigo, priority: 1 }); } catch (e) {} }
    }
    // Si el formulario ya está abierto en una pestaña, se reutiliza (no se juntan pestañas); si no, se abre una nueva
    let tabNV = null;
    try { tabNV = (await chrome.tabs.query({ url: 'https://docs.google.com/forms/d/e/1FAIpQLSeWwyqN1vbUn3wOvHTImDsNFbUwVvG0rijrWWggigDqOrgJHQ/*' })).sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))[0] || null; } catch (e) {}
    if (tabNV) { await chrome.tabs.update(tabNV.id, { url: nvURL(), active: true }); try { await chrome.windows.update(tabNV.windowId, { focused: true }); } catch (e) {} }
    else await chrome.tabs.create({ url: nvURL(), active: true });
    window.close();
  });
  nvPintar();
  // Preferencias de cada ejecutivo: envío automático y aviso al enviar
  ['nv-auto', 'nv-aviso'].forEach(id => $('#' + id).addEventListener('change', e => { try { chrome.storage.local.set({ [id]: e.target.checked }); } catch (x) {} }));
  try { chrome.storage.local.get(['nv-auto', 'nv-aviso']).then(o => { if (typeof o['nv-auto'] === 'boolean') $('#nv-auto').checked = o['nv-auto']; if (typeof o['nv-aviso'] === 'boolean') $('#nv-aviso').checked = o['nv-aviso']; }); } catch (e) {}
  try { chrome.storage.local.get(['nvUso', 'nvOrden']).then(o => { NV_USO = o.nvUso || {}; NV_ORDEN = o.nvOrden || 'grupo'; nvPintarChips(); }); } catch (e) {}
}initNoVenta();

/* ── WhatsApp Web con la oferta ───────────────────────────────────── */
// Los mensajes de cada plan vienen de ClaroGo! (así siempre están al día). Si no hay ClaroGo! abierto, se usan los guardados.
let MENSAJES = [], TEL = '', IMGS = {};
// Respaldo del mensaje corporativo: usa el nombre, el teléfono, el mensaje y la firma guardados desde ClaroGo!
const NOMBRE_DEFECTO = 'Eduardo Pérez';
const TELEFONO_DEFECTO = '+56 9 9796 6724';
const PLANTILLA_DEFECTO = 'Hola, {saludo}{trato}. Mi nombre es *{nombre}*, desde *Claro Chile*. Hablamos hace poco telefónicamente y, tal como acordamos, le envío la información sobre la propuesta.';
const FIRMA_DEFECTO = 'Quedo a su disposición para cualquier consulta.\n\nSaludos cordiales,\n*{nombre}*\nEjecutivo(a) de ventas · *Claro Chile*\n📱 {telefono}';
const saludoHora = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? 'muy buenos días' : h >= 12 && h < 20 ? 'muy buenas tardes' : 'muy buenas noches'; };
async function piezasGuardadas(cliente) {
  let p = {}; try { p = await chrome.storage.local.get(['nombre', 'plantilla', 'firma', 'telefono']); } catch (e) {}
  const nom = p.nombre || NOMBRE_DEFECTO, tel = p.telefono || TELEFONO_DEFECTO;
  // La extensión no tiene los datos del cliente: nunca pone su nombre ni un "estimado" o "estimada"
  const pn = '';
  let txt = (p.plantilla || PLANTILLA_DEFECTO).replace(/\{saludo\}/gi, saludoHora()).replace(/\{nombre\}/gi, nom).replace(/\{telefono\}/gi, tel);
  txt = txt.replace(/\{trato\}/gi, '');
  txt = pn ? txt.replace(/\{cliente\}/gi, pn) : txt.replace(/\s*\{cliente\}\s*(?=[,.!?])/gi, '').replace(/\s*\{cliente\}/gi, '');
  txt = txt.replace(/\s*\{compania\}/gi, '').replace(/ {2,}/g, ' ');
  const firma = (p.firma || FIRMA_DEFECTO).replace(/\{nombre\}/gi, nom).replace(/\{telefono\}/gi, tel);
  return { pres: txt.charAt(0).toUpperCase() + txt.slice(1), firma };
}
// Selector de planes: por defecto el Plan 500 (el más barato); si el ejecutivo ya eligió otro, se respeta
let PLAN_ELEGIDO = 'v500';
function pintarPlanes() {
  let pref = MENSAJES.findIndex(m => m.id === PLAN_ELEGIDO);
  if (pref < 0) pref = MENSAJES.findIndex(m => m.id === 'v500');
  if (pref < 0) pref = 0;
  $('#wa-plan').innerHTML = MENSAJES.map((m, i) => `<option value="${i}"${i === pref ? ' selected' : ''}></option>`).join('');
  [...$('#wa-plan').options].forEach((o, i) => { o.textContent = MENSAJES[i].titulo; });
  pintarLamina();
}
// La casilla "Adjuntar lámina" solo se puede usar si el plan elegido tiene lámina
function pintarLamina() {
  const m = MENSAJES[+$('#wa-plan').value] || {}, hay = !!IMGS[m.id];
  $('#wa-lamina').disabled = !hay;
  $('#wa-lamina-txt').textContent = hay ? '🖼️ Adjuntar la lámina del plan' : (m.id ? '🖼️ Lámina no disponible (abre ClaroGo! una vez)' : '🖼️ Sin lámina (solo la presentación)');
}
async function prepararWhatsApp(tel, nombre) {
  TEL = tel.replace(/\D/g, '');
  // 1. Al instante: presentación + oferta + firma, con lo que ClaroGo! dejó guardado en la extensión
  const { pres, firma } = await piezasGuardadas(nombre);
  let g = {}; try { g = await chrome.storage.local.get(['planes', 'adjuntar']); } catch (e) {}
  const guardados = g.planes || [];
  guardados.forEach(p => { if (p.img) IMGS[p.id] = p.img; });
  $('#wa-lamina').checked = g.adjuntar !== false;
  MENSAJES = guardados.map(p => ({ id: p.id, titulo: p.titulo, texto: [pres, p.detalle, firma].join('\n\n') }))
    .concat([{ id: '', titulo: guardados.length ? 'Solo la presentación, sin plan' : 'Solo la presentación (abre ClaroGo! una vez para cargar los planes)', texto: [pres, firma].join('\n\n') }]);
  pintarPlanes(); $('#wa').hidden = false;
  // 2. Si alguna pestaña de ClaroGo! responde, se usan sus mensajes (saludan con el nombre del cliente si está en la planilla)
  try {
    const tabs = (await chrome.tabs.query({ url: PLANILLA + '*' })).filter(t => !t.discarded).sort((a, b) => a.id - b.id);
    for (const t of tabs) {
      try {
        const [r] = await conLimite(chrome.scripting.executeScript({ target: { tabId: t.id }, world: 'MAIN', args: [nombre || '', TEL], func: (n, t) => typeof window.clarogoMensajesWA === 'function' ? window.clarogoMensajesWA(n, t) : null }), 1500);
        if (r && Array.isArray(r.result) && r.result.length) {
          MENSAJES = r.result; pintarPlanes();
          // Faltan láminas guardadas (GoExt recién instalada): se piden a esta misma pestaña de ClaroGo!
          if (MENSAJES.some(m => m.id && !IMGS[m.id])) {
            try {
              const [l] = await conLimite(chrome.scripting.executeScript({ target: { tabId: t.id }, world: 'MAIN', func: () => typeof window.clarogoLaminasWA === 'function' ? window.clarogoLaminasWA() : null }), 8000);
              if (l && Array.isArray(l.result)) { l.result.forEach(x => { if (x && x.id && /^data:image\/(png|jpeg);base64,/.test(String(x.img || ''))) IMGS[x.id] = x.img; }); pintarLamina(); }
            } catch (e) {}
          }
          break;
        }
      } catch (e) {}
    }
  } catch (e) {}
}
$('#wa-plan').addEventListener('change', () => { const m = MENSAJES[+$('#wa-plan').value]; PLAN_ELEGIDO = m ? m.id : ''; pintarLamina(); });
$('#wa-lamina').addEventListener('change', e => { try { chrome.storage.local.set({ adjuntar: e.target.checked }); } catch (x) {} });
// Imagen para el portapapeles (solo acepta PNG): la lámina de Persona Mayor viene en JPG y se convierte
const pngDe = d => new Promise(res => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext('2d').drawImage(i, 0, 0); c.toBlob(res, 'image/png'); }; i.onerror = () => res(null); i.src = d; });
$('#wa-abrir').onclick = async () => {
  const m = MENSAJES[+$('#wa-plan').value] || MENSAJES[0];
  const url = `https://web.whatsapp.com/send?phone=56${TEL}&text=${encodeURIComponent(m.texto)}`;
  const img = $('#wa-lamina').checked && !$('#wa-lamina').disabled ? (IMGS[m.id] || '') : '';
  $('#wa-abrir').disabled = true;
  // Portapapeles de respaldo: con lámina queda la imagen (Ctrl+V la adjunta); sin lámina queda el mensaje
  try { if (img) await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngDe(img) })]); else await navigator.clipboard.writeText(m.texto); } catch (e) {}
  // Primero el modo rápido del proceso de fondo (abre el chat sin recargar, escribe el mensaje y adjunta la lámina).
  // Si el proceso de fondo no responde, se abre desde aquí mismo como antes.
  try { const r = await chrome.runtime.sendMessage({ tipo: 'wa', url, img }); if (r) { window.close(); return; } } catch (e) {}
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

$('#enviar').onclick = enviar;
// Versión instalada, tomada del manifest: así se ve de inmediato si la extensión se actualizó
$('#version').textContent = 'v' + chrome.runtime.getManifest().version;
$('#historial').addEventListener('click', () => { chrome.tabs.create({ url: chrome.runtime.getURL('historial.html') + (TEL_NV ? '#' + TEL_NV.slice(-9) : '') }); window.close(); });
// Versión nueva descargada (con "Actualizar GoExt"): los archivos de la carpeta ya cambiaron pero la extensión sigue
// usando la anterior. El botón la recarga desde la carpeta, sin pasar por la página de extensiones.
const verMayor = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
fetch(chrome.runtime.getURL('manifest.json') + '?v=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).then(m => {
  const b = $('#activar'), usada = chrome.runtime.getManifest().version;
  if (m.version && m.version !== usada) { b.textContent = '⟳ Activar versión ' + m.version; b.hidden = false; b.onclick = () => { try { chrome.runtime.sendMessage({ tipo: 'recargar' }); } catch (e) {} window.close(); }; return; }
  // Si no hay nada descargado, se revisa si en internet hay una versión más nueva
  fetch('https://cotizadora.github.io/clarogo/extension/manifest.json?v=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).then(w => {
    if (!verMayor(w.version, usada)) return;
    b.textContent = '⬇ Hay versión ' + w.version; b.hidden = false; b.style.animation = 'none';
    b.title = 'Haz doble clic en "Actualizar GoExt" de tu escritorio y luego vuelve a abrir esta ventana';
    b.onclick = () => mostrar('Hay una versión nueva: haz doble clic en "Actualizar GoExt" de tu escritorio y vuelve a abrir GoExt.', 'anterior');
  }).catch(() => {});
}).catch(() => {});
iniciar();

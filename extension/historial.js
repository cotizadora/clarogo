// Historial de ClaroGo!: junta en un solo lugar los clientes de Mi Planilla (copiados en tiempo real por puente.js)
// y las tipificaciones enviadas desde la extensión. Se agrupa por teléfono y se actualiza solo si algo cambia.
const $ = s => document.querySelector(s);
let PLANILLA = [], TIPS = [], FILTRO = 'todo';
const t9 = v => String(v || '').replace(/\D/g, '').slice(-9);
const fechaPl = r => { const f = String(r.fecha || '').split('-').reverse().join('-'); return (f + ' ' + (r.hora || '')).trim(); };
const fechaTs = ts => { const d = new Date(ts), p = n => String(n).padStart(2, '0'); return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`; };
const clavePl = r => String(r.fecha || '') + ' ' + String(r.hora || '');
const claveTs = ts => { const d = new Date(ts), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
const VERDE = /venta|volver a llamar/i, ROJO = /no interesado|no molestar|ya es cliente|rechazo|equivocado/i;
const claseTipo = t => !t ? 'neu' : VERDE.test(t) ? 'ok' : ROJO.test(t) ? 'mal' : 'neu';
const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };

function agrupar() {
  const g = new Map();
  const tomar = k => { if (!g.has(k)) g.set(k, { tel: k, nombre: '', rut: '', origen: '', direccion: '', ev: [] }); return g.get(k); };
  if (FILTRO !== 'tip') PLANILLA.forEach(r => {
    const k = t9(r.telefono) || 'sin-' + r.id, c = tomar(k);
    c.nombre = c.nombre || r.nombre || ''; c.rut = c.rut || r.rut || ''; c.origen = c.origen || r.origen || ''; c.direccion = c.direccion || r.direccion || '';
    c.ev.push({ orden: clavePl(r), fecha: fechaPl(r), tipo: 'pl', titulo: r.tipo || 'Sin tipificar', det: [r.plan, r.deuda, r.eq, r.notas, r.agenda ? 'Llamar el ' + String(r.agenda).replace('T', ' ') : ''].filter(Boolean).join(' · ') });
  });
  if (FILTRO !== 'pl') TIPS.forEach(x => {
    const c = tomar(x.tel);
    c.ev.push({ orden: claveTs(x.ts), fecha: fechaTs(x.ts), tipo: 'tip', titulo: x.motivo || 'Tipificación', det: 'Registro de atención (no venta)' });
  });
  const lista = [...g.values()];
  lista.forEach(c => c.ev.sort((a, b) => b.orden.localeCompare(a.orden)));
  return lista.sort((a, b) => (b.ev[0] ? b.ev[0].orden : '').localeCompare(a.ev[0] ? a.ev[0].orden : ''));
}

function pintar() {
  const q = $('#q').value.trim().toLowerCase(), qd = q.replace(/\D/g, '');
  let lista = agrupar();
  if (q) lista = lista.filter(c => (qd.length >= 3 && (c.tel.includes(qd) || c.rut.replace(/\D/g, '').includes(qd))) || c.nombre.toLowerCase().includes(q) || c.ev.some(e => e.titulo.toLowerCase().includes(q)));
  $('#resumen').textContent = `${lista.length} clientes · ${PLANILLA.length} filas de planilla · ${TIPS.length} tipificaciones`;
  const caja = $('#lista'); caja.textContent = '';
  if (!lista.length) { caja.appendChild(el('div', 'vacio', q ? 'No hay clientes que coincidan con la búsqueda.' : 'Todavía no hay datos. Abre ClaroGo! una vez para traer tu planilla.')); return; }
  lista.slice(0, 300).forEach(c => {
    const card = el('section', 'cli'), cab = el('div', 'cab');
    cab.append(el('span', 'nom', c.nombre || 'Sin nombre'));
    if (/^\d{9}$/.test(c.tel)) cab.append(el('span', 'tel', c.tel));
    [c.rut && 'RUT ' + c.rut, c.origen, c.direccion].filter(Boolean).forEach(d => cab.append(el('span', 'dato', d)));
    card.append(cab);
    c.ev.slice(0, 12).forEach(e => {
      const fila = el('div', 'ev');
      fila.append(el('span', 'f', e.fecha));
      const fuente = el('span', null); fuente.append(el('span', 'chip ' + (e.tipo === 'pl' ? 'c-pl' : 'c-tip'), e.tipo === 'pl' ? 'Mi Planilla' : 'Tipificación')); fila.append(fuente);
      const d = el('span', 'det'); d.append(el('span', claseTipo(e.titulo), e.titulo)); if (e.det) d.append(document.createTextNode(' · ' + e.det));
      fila.append(d); card.append(fila);
    });
    caja.append(card);
  });
}

async function cargar() {
  const o = await chrome.storage.local.get(['planilla_ct', 'historial_tip']);
  PLANILLA = (o.planilla_ct && o.planilla_ct.filas) || [];
  TIPS = o.historial_tip || [];
  pintar();
}
// Tiempo real: cualquier cambio en la planilla o una tipificación nueva se refleja al instante
chrome.storage.onChanged.addListener((c, area) => { if (area === 'local' && (c.planilla_ct || c.historial_tip)) cargar(); });
$('#q').addEventListener('input', pintar);
document.querySelector('.filtros').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; FILTRO = b.dataset.f; document.querySelectorAll('.filtros button').forEach(x => x.classList.toggle('on', x === b)); pintar(); });
if (location.hash.length > 1) $('#q').value = decodeURIComponent(location.hash.slice(1));
cargar();

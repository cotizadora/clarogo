// Puente entre ClaroGo! y la extensión:
// 1. Avisa a la página que la extensión está instalada.
// 2. Le permite pedir que se abra WhatsApp Web en la pestaña que ya esté abierta.
// 3. Guarda en la extensión el nombre y el mensaje del ejecutivo, para usarlos aunque ClaroGo! no responda.
// 4. Revisión de deuda: recibe el RUT y la compañía, y devuelve el resultado que leyó el portal de pago.
document.documentElement.dataset.clarogoExt = '1';
document.documentElement.dataset.clarogoRutifAbre = '1';   // esta versión abre (o reutiliza) el Rutificador por su cuenta
window.addEventListener('message', e => {
  if (e.source !== window || !e.data) return;
  if (e.data.tipo === 'clarogo-wa' && /^https:\/\/web\.whatsapp\.com\/send\?/.test(String(e.data.url || ''))) chrome.runtime.sendMessage({ tipo: 'wa', url: e.data.url, img: /^data:image\/(png|jpeg);base64,/.test(String(e.data.img || '')) ? e.data.img : '' });
  if (e.data.tipo === 'clarogo-deuda' && /^(claro|entel|movistar|wom)$/.test(String(e.data.comp)) && /^[0-9kK.\-]{3,12}$/.test(String(e.data.rut || ''))) chrome.storage.local.set({ deuda_pedido: { rut: String(e.data.rut), comp: e.data.comp, id: String(e.data.id || '').slice(0, 40), ts: Date.now() } });
  // El fondo guarda el pedido junto con esta pestaña, para volver exactamente a ella después del Rutificador
  if (e.data.tipo === 'clarogo-rutif' && /^[0-9kK.\-]{3,12}$/.test(String(e.data.rut || ''))) chrome.runtime.sendMessage({ tipo: 'rutif-pedido', rut: String(e.data.rut), id: String(e.data.id || '').slice(0, 40) });
  if (e.data.tipo === 'clarogo-perfil') chrome.storage.local.set({ nombre: String(e.data.nombre || '').slice(0, 80), plantilla: String(e.data.plantilla || '').slice(0, 2000), firma: String(e.data.firma || '').slice(0, 2000), telefono: String(e.data.telefono || '').slice(0, 40), planes: Array.isArray(e.data.planes) ? e.data.planes.slice(0, 20).map(p => ({ id: String(p.id || ''), titulo: String(p.titulo || '').slice(0, 80), detalle: String(p.detalle || '').slice(0, 3000), img: /^data:image\/(png|jpeg);base64,/.test(String(p.img || '')) && String(p.img).length < 4000000 ? p.img : '' })) : [] });
});
chrome.storage.onChanged.addListener((c, area) => {
  if (area === 'local' && c.deuda_res && c.deuda_res.newValue) window.postMessage(Object.assign({ tipo: 'clarogo-deuda-res' }, c.deuda_res.newValue), location.origin);
  if (area === 'local' && c.rutif_res && c.rutif_res.newValue) window.postMessage(Object.assign({ tipo: 'clarogo-rutif-res' }, c.rutif_res.newValue), location.origin);
});
// Un pedido de deuda que nadie usó en 10 minutos se borra
chrome.storage.local.get('deuda_pedido').then(o => { if (o.deuda_pedido && Date.now() - o.deuda_pedido.ts > 10 * 60000) chrome.storage.local.remove('deuda_pedido'); });

// 5. Mi Planilla para el Historial de la extensión: se copia un resumen de cada cliente (los más recientes, hasta 3.000)
//    al abrir la planilla, cada vez que se guarda un cambio y cuando otra pestaña la modifica. Así la extensión ve lo mismo en tiempo real.
const PL_CAMPOS = ['id', 'fecha', 'hora', 'rut', 'nombre', 'telefono', 'origen', 'tipo', 'plan', 'notas', 'deuda', 'histTip', 'direccion', 'mail', 'campana', 'agenda', 'eq', 'tventa', 'upd'];
let plTimer = 0;
function copiarPlanilla() {
  clearTimeout(plTimer);
  plTimer = setTimeout(() => {
    let filas = [];
    try { filas = JSON.parse(localStorage.getItem('clarogo_control_v1') || '[]'); } catch (e) { return; }
    if (!Array.isArray(filas)) return;
    const resumen = filas.filter(r => r && !r.borrado).sort((a, b) => (b.upd || 0) - (a.upd || 0)).slice(0, 3000).map(r => {
      const o = {}; PL_CAMPOS.forEach(k => { if (r[k] != null && r[k] !== '') o[k] = typeof r[k] === 'string' ? r[k].slice(0, k === 'notas' || k === 'histTip' ? 400 : 160) : r[k]; });
      return o;
    });
    try { chrome.storage.local.set({ planilla_ct: { ts: Date.now(), filas: resumen } }); } catch (e) {}
  }, 300);
}
window.addEventListener('message', e => { if (e.source === window && e.data && e.data.tipo === 'clarogo-ct') copiarPlanilla(); });
window.addEventListener('storage', e => { if (e.key === 'clarogo_control_v1') copiarPlanilla(); });
copiarPlanilla();

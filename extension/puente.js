// Puente entre ClaroGo! y la extensión:
// 1. Avisa a la página que la extensión está instalada.
// 2. Le permite pedir que se abra WhatsApp Web en la pestaña que ya esté abierta.
// 3. Guarda en la extensión el nombre y el mensaje del ejecutivo, para usarlos aunque ClaroGo! no responda.
// 4. Revisión de deuda: recibe el RUT y la compañía, y devuelve el resultado que leyó el portal de pago.
document.documentElement.dataset.clarogoExt = '1';
window.addEventListener('message', e => {
  if (e.source !== window || !e.data) return;
  if (e.data.tipo === 'clarogo-wa' && /^https:\/\/web\.whatsapp\.com\/send\?/.test(String(e.data.url || ''))) chrome.runtime.sendMessage({ tipo: 'wa', url: e.data.url, img: /^data:image\/(png|jpeg);base64,/.test(String(e.data.img || '')) ? e.data.img : '' });
  if (e.data.tipo === 'clarogo-deuda' && /^(claro|entel|movistar|wom)$/.test(String(e.data.comp)) && /^[0-9kK.\-]{3,12}$/.test(String(e.data.rut || ''))) chrome.storage.local.set({ deuda_pedido: { rut: String(e.data.rut), comp: e.data.comp, id: String(e.data.id || '').slice(0, 40), ts: Date.now() } });
  if (e.data.tipo === 'clarogo-rutif' && /^[0-9kK.\-]{3,12}$/.test(String(e.data.rut || ''))) chrome.storage.local.set({ rutif_pedido: { rut: String(e.data.rut), id: String(e.data.id || '').slice(0, 40), ts: Date.now() } });
  if (e.data.tipo === 'clarogo-perfil') chrome.storage.local.set({ nombre: String(e.data.nombre || '').slice(0, 80), plantilla: String(e.data.plantilla || '').slice(0, 2000), firma: String(e.data.firma || '').slice(0, 2000), telefono: String(e.data.telefono || '').slice(0, 40), planes: Array.isArray(e.data.planes) ? e.data.planes.slice(0, 20).map(p => ({ id: String(p.id || ''), titulo: String(p.titulo || '').slice(0, 80), detalle: String(p.detalle || '').slice(0, 3000), img: /^data:image\/(png|jpeg);base64,/.test(String(p.img || '')) && String(p.img).length < 4000000 ? p.img : '' })) : [] });
});
chrome.storage.onChanged.addListener((c, area) => {
  if (area === 'local' && c.deuda_res && c.deuda_res.newValue) window.postMessage(Object.assign({ tipo: 'clarogo-deuda-res' }, c.deuda_res.newValue), location.origin);
  if (area === 'local' && c.rutif_res && c.rutif_res.newValue) window.postMessage(Object.assign({ tipo: 'clarogo-rutif-res' }, c.rutif_res.newValue), location.origin);
});
// Un pedido de deuda que nadie usó en 10 minutos se borra
chrome.storage.local.get('deuda_pedido').then(o => { if (o.deuda_pedido && Date.now() - o.deuda_pedido.ts > 10 * 60000) chrome.storage.local.remove('deuda_pedido'); });

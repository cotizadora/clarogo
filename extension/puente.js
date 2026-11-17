// Puente entre ClaroGo! y la extensión:
// 1. Avisa a la página que la extensión está instalada.
// 2. Le permite pedir que se abra WhatsApp Web en la pestaña que ya esté abierta.
// 3. Guarda en la extensión el nombre y el mensaje del ejecutivo, para usarlos aunque ClaroGo! no responda.
document.documentElement.dataset.clarogoExt = '1';
window.addEventListener('message', e => {
  if (e.source !== window || !e.data) return;
  if (e.data.tipo === 'clarogo-wa' && /^https:\/\/web\.whatsapp\.com\/send\?/.test(String(e.data.url || ''))) chrome.runtime.sendMessage({ tipo: 'wa', url: e.data.url });
  if (e.data.tipo === 'clarogo-perfil') chrome.storage.local.set({ nombre: String(e.data.nombre || '').slice(0, 80), plantilla: String(e.data.plantilla || '').slice(0, 2000), planes: Array.isArray(e.data.planes) ? e.data.planes.slice(0, 20).map(p => ({ id: String(p.id || ''), titulo: String(p.titulo || '').slice(0, 80), detalle: String(p.detalle || '').slice(0, 3000) })) : [] });
});

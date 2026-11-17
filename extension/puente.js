// Puente entre ClaroGo! y la extensión: avisa a la página que la extensión está instalada
// y le permite pedir que se abra WhatsApp Web en la pestaña que ya esté abierta.
document.documentElement.dataset.clarogoExt = '1';
window.addEventListener('message', e => {
  if (e.source !== window || !e.data || e.data.tipo !== 'clarogo-wa') return;
  if (!/^https:\/\/web\.whatsapp\.com\/send\?/.test(String(e.data.url || ''))) return;
  chrome.runtime.sendMessage({ tipo: 'wa', url: e.data.url });
});

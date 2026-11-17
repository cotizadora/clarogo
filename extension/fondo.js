// ClaroGo! Genesys: abre WhatsApp Web reutilizando la pestaña que ya esté abierta.
// Si hay varias, usa la más antigua. Si no hay ninguna, abre una nueva.
async function abrirWhatsApp(url) {
  if (!/^https:\/\/web\.whatsapp\.com\/send\?/.test(url)) return false;
  const tabs = (await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' })).sort((a, b) => a.id - b.id);
  if (tabs.length) {
    const t = tabs[0];
    await chrome.tabs.update(t.id, { url, active: true });
    await chrome.windows.update(t.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url, active: true });
  }
  return true;
}

chrome.runtime.onMessage.addListener((msg, _de, responder) => {
  if (msg && msg.tipo === 'wa') { abrirWhatsApp(msg.url).then(responder, () => responder(false)); return true; }
});

// GoExt: vigila Genesys para abrirse sola cuando entra una llamada nueva.
// Corre en cada marco de Genesys. Cada 2,5 segundos lee los cuadros "CLAVE:" del panel "Interacción de llamada"
// (igual que la ventanita) y, si aparece un teléfono de cliente distinto al anterior, avisa al fondo de GoExt.
// No cambia nada en Genesys: solo lee.
(() => {
  if (window.__goextLlamada) return; window.__goextLlamada = true;

  // Fin de llamada: en el recuadro "Códigos de conclusión" (tipificación de Genesys). Cuando se hace visible,
  // la llamada terminó: se avisa al fondo, que decide si fue el cliente quien cortó.
  if (/acw-gadgets-wrap-up/.test(location.pathname)) {
    let visible = false;
    setInterval(() => {
      const v = window.innerWidth > 0 && window.innerHeight > 0 && !!document.body && (document.body.textContent || '').trim().length > 0;
      if (v && !visible) { try { chrome.runtime.sendMessage({ tipo: 'fin-llamada' }); } catch (e) {} }
      visible = v;
    }, 1000);
    return;
  }
  // El ejecutivo cortó con el botón de Genesys: así no se confunde con un corte del cliente
  document.addEventListener('click', e => {
    const b = (e.composedPath ? e.composedPath() : [e.target]).find(n => n && n.tagName && (n.tagName === 'BUTTON' || n.getAttribute && n.getAttribute('role') === 'button' || n.tagName === 'GUX-BUTTON'));
    if (!b) return;
    const t = [b.getAttribute('aria-label'), b.getAttribute('title'), b.textContent].join(' ');
    if (/desconect|disconnect|colgar|finalizar llamada|terminar llamada|end call|hang ?up/i.test(t)) { try { chrome.runtime.sendMessage({ tipo: 'corte-ejecutivo' }); } catch (x) {} }
  }, true);
  const esClave = t => /^[A-Za-z][A-Za-z0-9_]*:$/.test(t);
  const textoPropio = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
  const leer = () => {
    const datos = {};
    const recorrer = raiz => {
      let clave = '';
      const w = document.createTreeWalker(raiz, NodeFilter.SHOW_ELEMENT);
      for (let el = w.currentNode; el; el = w.nextNode()) {
        if (el.shadowRoot) recorrer(el.shadowRoot);
        const tag = el.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
          if (el.type === 'hidden' || el.type === 'button' || el.type === 'submit') continue;
          if (clave) { const v = String(el.value || '').trim(); if (v) datos[clave.slice(0, -1)] = v; clave = ''; }
          continue;
        }
        const t = textoPropio(el);
        if (t && esClave(t)) clave = t;
      }
    };
    try { recorrer(document.body || document.documentElement); } catch (e) {}
    return datos;
  };
  const tel9 = s => { let d = String(s || '').replace(/\D/g, ''); if (d.length === 11 && d.startsWith('56')) d = d.slice(2); return d.length === 9 ? d : ''; };
  let ultimo = '', vuelta = 0, ultimaLectura = 0, pendiente = 0;
  const revisar = () => {
    if (!document.body) return;
    const ahora = Date.now();
    if (ahora - ultimaLectura < 600) return;   // como máximo una lectura cada 0,6 segundos
    // Revisión rápida: el marco tiene el guion de la llamada (textos tipo FONO_CONTACTO:).
    // Si el guion estuviera dentro de componentes encapsulados, la lectura completa se hace en una vuelta por medio.
    vuelta++;
    if (!/FONO_CONTACTO|Fono1|LEGACY_ID|RUT_PERSONA/.test(document.body.textContent || '') && vuelta % 2) return;
    ultimaLectura = ahora;
    const d = leer();
    const tel = tel9(d.FONO_CONTACTO || d.Fono1 || d.Fono2 || d.LEGACY_ID);
    if (!tel) { ultimo = ''; return; }
    const clave = tel + '|' + (d.ENTY_ID || d.RUT_PERSONA || '');
    if (clave === ultimo) return;
    ultimo = clave;
    try { chrome.runtime.sendMessage({ tipo: 'llamada', tel, clave }); } catch (e) {}
  };
  // Apenas Genesys cambia la pantalla (entra la llamada) se revisa al tiro; además, una revisión cada 0,7 segundos
  // (Edge hace más lentos los relojes de las pestañas que no están al frente; el cambio de pantalla avisa sin esperar un reloj)
  const pronto = () => {
    if (Date.now() - ultimaLectura >= 600) { revisar(); return; }
    if (!pendiente) pendiente = setTimeout(() => { pendiente = 0; revisar(); }, 650);
  };
  try { new MutationObserver(pronto).observe(document.documentElement, { childList: true, subtree: true, characterData: true }); } catch (e) {}
  setInterval(revisar, 700);
  setTimeout(revisar, 300);
})();

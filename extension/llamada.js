// GoExt: vigila Genesys para abrirse sola cuando entra una llamada nueva.
// Corre en cada marco de Genesys. Cada 2,5 segundos lee los cuadros "CLAVE:" del panel "Interacción de llamada"
// (igual que la ventanita) y, si aparece un teléfono de cliente distinto al anterior, avisa al fondo de GoExt.
// No cambia nada en Genesys: solo lee.
(() => {
  if (window.__goextLlamada) return; window.__goextLlamada = true;
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
  let ultimo = '', vuelta = 0;
  const revisar = () => {
    if (!document.body) return;
    // Revisión rápida: el marco tiene el guion de la llamada (textos tipo FONO_CONTACTO:).
    // Si el guion estuviera dentro de componentes encapsulados, la lectura completa se hace solo cada 10 segundos.
    vuelta++;
    if (!/FONO_CONTACTO|Fono1|LEGACY_ID|RUT_PERSONA/.test(document.body.textContent || '') && vuelta % 4) return;
    const d = leer();
    const tel = tel9(d.FONO_CONTACTO || d.Fono1 || d.Fono2 || d.LEGACY_ID);
    if (!tel) { ultimo = ''; return; }
    const clave = tel + '|' + (d.ENTY_ID || d.RUT_PERSONA || '');
    if (clave === ultimo) return;
    ultimo = clave;
    try { chrome.runtime.sendMessage({ tipo: 'llamada', tel, clave }); } catch (e) {}
  };
  setInterval(revisar, 2500);
  setTimeout(revisar, 1500);
})();

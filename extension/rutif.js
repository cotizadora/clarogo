// Rutificador (nombrerutyfirma.com): cuando el ejecutivo presiona RUTIFICADOR en Mi Planilla,
// la extensión busca el RUT, lee el nombre completo y la dirección del resultado y los devuelve a esa fila.
// Solo actúa si el pedido vino de la planilla en los últimos 10 minutos. El RUT se borra al terminar.
(async () => {
  if (window.top !== window || document.documentElement.dataset.cgRutif) return;
  document.documentElement.dataset.cgRutif = '1';
  const p = (await chrome.storage.local.get('rutif_pedido')).rutif_pedido;
  if (!p) return;
  if (Date.now() - p.ts > 10 * 60000) { await chrome.storage.local.remove('rutif_pedido'); return; }
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const soloRut = s => String(s || '').replace(/[^0-9kK]/g, '').toUpperCase();
  const rutPuntos = r => { const c = soloRut(r); return c.length < 2 ? '' : c.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + c.slice(-1); };

  // Aviso arriba
  const aviso = document.createElement('div');
  aviso.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:2147483647;max-width:min(560px,92vw);padding:12px 18px;border-radius:14px;font:600 15px/1.4 "Segoe UI",system-ui,sans-serif;color:#fff;background:#1a56b8;box-shadow:0 10px 30px rgba(0,0,0,.3);text-align:center';
  const decir = (t, color) => { aviso.textContent = t; aviso.style.background = color || '#1a56b8'; if (!aviso.isConnected) document.documentElement.appendChild(aviso); };

  // ¿Hay tabla de resultados?
  const tabla = [...document.querySelectorAll('table')].find(t => /direcci/i.test(t.innerText) && /rut/i.test(t.innerText));
  if (!tabla) {
    // Página de búsqueda: escribir el RUT y buscar
    if (p.enviado && Date.now() - p.enviado < 20000) return;   // ya se envió la búsqueda: esperar el resultado
    const campo = document.querySelector('form[action*="rut"] input[name="term"], #formato-live input[name="term"]');
    if (!campo) return;
    decir('ClaroGo!: buscando el RUT ' + rutPuntos(p.rut) + '…');
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    campo.focus(); set.call(campo, rutPuntos(p.rut)); ['input', 'change', 'keyup'].forEach(t => campo.dispatchEvent(new Event(t, { bubbles: true })));
    p.enviado = Date.now(); await chrome.storage.local.set({ rutif_pedido: p });
    await esperar(500);
    const form = campo.form;
    const boton = form && form.querySelector('button, input[type="submit"]');
    if (boton) boton.click(); else if (form) form.submit();
    return;
  }

  // Resultado: columnas Nombre, RUT, Sexo, Dirección, Ciudad/Comuna
  const cab = [...tabla.querySelectorAll('th')].map(th => th.innerText.trim().toLowerCase());
  const col = txt => cab.findIndex(c => c.startsWith(txt));
  const iNom = col('nombre'), iRut = col('rut'), iDir = col('direcci'), iCom = cab.findIndex(c => /comuna|ciudad/.test(c));
  const filas = [...tabla.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.innerText.trim())).filter(c => c.length >= 3);
  const fila = filas.find(c => soloRut(c[iRut]) === soloRut(p.rut)) || (filas.length === 1 ? filas[0] : null);
  if (!fila) {
    decir('ClaroGo!: el Rutificador no encontró datos para el RUT ' + rutPuntos(p.rut) + '.', '#8a1010');
    await chrome.storage.local.set({ rutif_res: { id: p.id, ts: Date.now(), encontrado: false } });
    await chrome.storage.local.remove('rutif_pedido');
    return;
  }
  const res = { id: p.id, ts: Date.now(), encontrado: true, nombre: iNom >= 0 ? fila[iNom] : '', direccion: iDir >= 0 ? fila[iDir] : '', comuna: iCom >= 0 ? fila[iCom] : '' };
  await chrome.storage.local.set({ rutif_res: res });
  await chrome.storage.local.remove('rutif_pedido');
  decir('✅ Enviado a tu planilla: ' + [res.nombre, [res.direccion, res.comuna].filter(Boolean).join(', ')].filter(Boolean).join(' · '), '#13804a');
  setTimeout(() => { aviso.style.transition = 'opacity .8s'; aviso.style.opacity = '0'; }, 6000);
})();

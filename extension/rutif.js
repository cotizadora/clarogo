// Rutificador (nombrerutyfirma.com): cuando el ejecutivo presiona RUTIFICADOR en Mi Planilla,
// la extensión busca el RUT, lee el nombre completo y la dirección del resultado y los devuelve a esa fila.
// Solo actúa si el pedido vino de la planilla en los últimos 10 minutos. El RUT se borra al terminar.
(async () => {
  if (window.top !== window || document.documentElement.dataset.cgRutif) return;
  document.documentElement.dataset.cgRutif = '1';
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const soloRut = s => String(s || '').replace(/[^0-9kK]/g, '').toUpperCase();
  const rutPuntos = r => { const c = soloRut(r); return c.length < 2 ? '' : c.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + c.slice(-1); };

  // Sello abajo a la izquierda: muestra que la extensión está trabajando y en qué paso va
  const sello = document.createElement('div');
  sello.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483647;padding:6px 10px;border-radius:10px;background:#1f2430;color:#fff;font:600 12px "Segoe UI",system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3)';
  const marcar = t => { sello.textContent = 'GoExt v' + chrome.runtime.getManifest().version + ' · ' + t; if (!sello.isConnected) document.documentElement.appendChild(sello); };
  // Aviso grande arriba
  const aviso = document.createElement('div');
  aviso.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:2147483647;max-width:min(560px,92vw);padding:12px 18px;border-radius:14px;font:600 15px/1.4 "Segoe UI",system-ui,sans-serif;color:#fff;background:#1a56b8;box-shadow:0 10px 30px rgba(0,0,0,.3);text-align:center';
  const decir = (t, color) => { aviso.textContent = t; aviso.style.background = color || '#1a56b8'; if (!aviso.isConnected) document.documentElement.appendChild(aviso); };

  // El pedido lo guarda la planilla justo al abrir esta pestaña: se espera hasta 6 segundos a que llegue
  marcar('esperando el RUT desde la planilla…');
  let p = null;
  for (let i = 0; i < 24; i++) {
    p = (await chrome.storage.local.get('rutif_pedido')).rutif_pedido;
    if (p && Date.now() - p.ts < 10 * 60000) break;
    p = null; await esperar(250);
  }
  if (!p) { marcar('sin pedido de la planilla (usa el botón RUTIFICADOR de la fila)'); return; }

  const tabla = [...document.querySelectorAll('table')].find(t => /direcci/i.test(t.textContent) && /rut/i.test(t.textContent));
  if (!tabla) {
    // Página de búsqueda: se pasa a la pestaña "RUT", se escribe el RUT y se busca
    if (p.enviado && Date.now() - p.enviado < 15000) { marcar('esperando el resultado…'); return; }
    const pestana = document.querySelector('a[href="#rut"], a[aria-controls="rut"]');
    if (pestana) { pestana.click(); await esperar(400); }
    const campo = document.querySelector('#rut input[name="term"], form[action*="rut"] input[name="term"], #formato-live input[name="term"]');
    if (!campo) { marcar('no encontré el cuadro del RUT'); decir('GoExt: no encontré dónde escribir el RUT. Pégalo con Ctrl+V.', '#8a1010'); return; }
    marcar('buscando el RUT ' + rutPuntos(p.rut) + '…');
    decir('GoExt: buscando el RUT ' + rutPuntos(p.rut) + '…');
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    campo.focus(); set.call(campo, rutPuntos(p.rut)); ['input', 'change', 'keyup'].forEach(t => campo.dispatchEvent(new Event(t, { bubbles: true })));
    p.enviado = Date.now(); await chrome.storage.local.set({ rutif_pedido: p });
    await esperar(400);
    const form = campo.form;
    const boton = form && form.querySelector('button[type="submit"], button, input[type="submit"]');
    if (boton) boton.click(); else if (form) form.submit();
    // Si en 4 segundos la página no cambió, se envía el formulario directamente
    setTimeout(() => { if (form && document.contains(form) && !/\/rut/.test(location.pathname)) form.submit(); }, 4000);
    return;
  }

  // Resultado: columnas Nombre, RUT, Sexo, Dirección, Ciudad/Comuna
  // Los títulos pueden traer íconos o enlaces de publicidad (por ejemplo en "Nombre"): se busca la palabra dentro del texto
  const cab = [...tabla.querySelectorAll('thead th, tr:first-child th')].map(th => th.textContent.replace(/\s+/g, ' ').trim().toLowerCase());
  const col = txt => cab.findIndex(c => c.includes(txt));
  const iNom = col('nombre'), iRut = col('rut'), iDir = col('direcci'), iCom = cab.findIndex(c => /comuna|ciudad/.test(c));
  const filas = [...tabla.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent.replace(/\s+/g, ' ').trim())).filter(c => c.length >= 3);
  const fila = filas.find(c => soloRut(c[iRut]) === soloRut(p.rut)) || (filas.length === 1 ? filas[0] : null);
  if (!fila) {
    marcar('sin resultados para este RUT');
    decir('GoExt: el Rutificador no encontró datos para el RUT ' + rutPuntos(p.rut) + '.', '#8a1010');
    await chrome.storage.local.set({ rutif_res: { id: p.id, ts: Date.now(), encontrado: false } });
    await chrome.storage.local.remove('rutif_pedido');
    return;
  }
  const res = { id: p.id, ts: Date.now(), encontrado: true, nombre: iNom >= 0 ? fila[iNom] : '', direccion: iDir >= 0 ? fila[iDir] : '', comuna: iCom >= 0 ? fila[iCom] : '' };
  await chrome.storage.local.set({ rutif_res: res });
  await chrome.storage.local.remove('rutif_pedido');
  marcar('enviado a la planilla');
  decir('✅ Enviado a tu planilla: ' + [res.nombre, [res.direccion, res.comuna].filter(Boolean).join(', ')].filter(Boolean).join(' · '), '#13804a');
  setTimeout(() => { aviso.style.transition = 'opacity .8s'; aviso.style.opacity = '0'; }, 6000);
  // Vuelve a la pestaña de Mi Planilla, donde la fila se ilumina
  setTimeout(() => { try { chrome.runtime.sendMessage({ tipo: 'volver-planilla' }); } catch (e) {} }, 1200);
})();

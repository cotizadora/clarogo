// Revisión de deuda en los portales de pago de Claro, Entel, Movistar y WOM.
// Solo actúa si el ejecutivo lo pidió desde Mi Planilla en los últimos 10 minutos:
// 1. Escribe el RUT del cliente en el portal y presiona el botón de consulta.
//    Si el portal muestra "No soy un robot", lo resuelve el ejecutivo.
// 2. Lee la pantalla de resultado y muestra un aviso: con deuda (y el monto) o sin deuda.
// 3. Devuelve el resultado a Mi Planilla. El RUT se borra de la extensión al terminar.
(async () => {
  const h = location.hostname;
  const COMP = /clarochile/.test(h) ? 'claro' : /entel/.test(h) ? 'entel' : /movistar/.test(h) ? 'movistar' : /wom/.test(h) ? 'wom' : '';
  const NOMBRE = { claro: 'Claro', entel: 'Entel', movistar: 'Movistar', wom: 'WOM' }[COMP];
  if (!COMP) return;
  const leer = async () => (await chrome.storage.local.get('deuda_pedido')).deuda_pedido;
  let p = await leer();
  if (p && Date.now() - p.ts > 10 * 60000) { await chrome.storage.local.remove('deuda_pedido'); return; }
  if (!p || p.comp !== COMP) return;

  const SITIO = {
    claro: { campo: '#rut', boton: '#submit-button', puntos: true },
    entel: { campo: 'input[id$="Rut_Input"]', boton: 'button.btn-primary', puntos: true },
    movistar: { campo: '#rutInput', boton: '#nextRut', puntos: true },
    wom: { campo: '#rut_form', boton: '#enviar_form', puntos: false }
  }[COMP];
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const rutTexto = (rut, puntos) => { const c = String(rut).replace(/[^0-9kK]/g, '').toUpperCase(); if (c.length < 2) return ''; const cu = c.slice(0, -1), dv = c.slice(-1); return (puntos ? cu.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : cu) + '-' + dv; };

  // Aviso fijo arriba a la derecha mientras se busca; el resultado final sale grande arriba al centro
  let caja = null;
  const aviso = (texto, color, grande) => {
    if (!caja) { caja = document.createElement('div'); caja.title = 'Clic para cerrar'; caja.onclick = () => caja.remove(); document.documentElement.appendChild(caja); }
    caja.style.cssText = grande
      ? 'position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:2147483647;width:min(560px,92vw);padding:22px 26px;border-radius:18px;font:700 24px/1.35 "Segoe UI",system-ui,sans-serif;color:#fff;text-align:center;box-shadow:0 16px 44px rgba(0,0,0,.45);white-space:pre-line;cursor:pointer;border:4px solid rgba(255,255,255,.85)'
      : 'position:fixed;top:14px;right:14px;z-index:2147483647;max-width:340px;padding:12px 16px;border-radius:12px;font:15px/1.4 "Segoe UI",system-ui,sans-serif;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.35);white-space:pre-line;cursor:pointer';
    caja.textContent = texto; caja.style.background = color;
  };

  // ── Paso 1: escribir el RUT y presionar el botón ──
  const ponerValor = (el, v) => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    el.focus(); set.call(el, v);
    ['input', 'keyup', 'change'].forEach(t => el.dispatchEvent(new Event(t, { bubbles: true })));
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: '0' }));
    el.blur();
  };
  if (!p.enviado) {
    let campo = null;
    for (let i = 0; i < 40 && !campo; i++) { campo = document.querySelector(SITIO.campo); if (!campo) await esperar(500); }
    if (!campo) { aviso(`ClaroGo!: no encontré dónde escribir el RUT en ${NOMBRE}. RUT copiado: pégalo con Ctrl+V.`, '#555'); return; }
    ponerValor(campo, rutTexto(p.rut, SITIO.puntos));
    await esperar(800);
    let boton = document.querySelector(SITIO.boton);
    if (COMP === 'entel') boton = [...document.querySelectorAll('button')].find(b => /ingresar/i.test(b.textContent)) || boton;
    p.enviado = Date.now(); await chrome.storage.local.set({ deuda_pedido: p });
    if (boton) { boton.classList.remove('disabled'); boton.disabled = false; boton.click(); }
    aviso(`ClaroGo!: RUT ${rutTexto(p.rut, true)} escrito en ${NOMBRE}.\nSi aparece "No soy un robot", resuélvelo y presiona el botón. Yo leo el resultado.`, '#1a56b8');
  } else {
    aviso(`ClaroGo!: buscando la deuda en ${NOMBRE}…`, '#1a56b8');
  }

  // ── Paso 2: leer el resultado ──
  const SIN = /(no\s+(registra|registras|tiene|tienes|posee|presenta|existen|hay|encontramos)\s+(deudas?|cuentas|documentos|boletas|montos|pagos|saldos?)(\s+(pendientes|por pagar|vencid[oa]s))?|sin deudas?|est[aá]s? al d[ií]a|no (hay|tienes) (nada )?(que|por) pagar|saldo\s*(pendiente)?\s*:?\s*\$\s*0(?![\d.]))/i;
  const MONTO = /\$\s?\d{1,3}(?:\.\d{3})+|\$\s?\d{4,}/;
  const CLAVE = /total|deuda|a pagar|monto|saldo|vencid/i;
  const leerResultado = () => {
    const campo = document.querySelector(SITIO.campo);
    if (campo && campo.offsetParent) return null;   // todavía en el formulario: no leer precios de publicidad
    const txt = document.body ? document.body.innerText : '';
    if (SIN.test(txt)) return { deuda: false, texto: `${NOMBRE}: sin deuda` };
    const lineas = txt.split('\n').map(s => s.trim()).filter(Boolean);
    for (let i = 0; i < lineas.length; i++) {
      if (!CLAVE.test(lineas[i])) continue;
      const m = (lineas[i] + ' ' + (lineas[i + 1] || '') + ' ' + (lineas[i + 2] || '')).match(MONTO);
      if (m) return { deuda: true, monto: m[0].replace(/\s/g, ''), texto: `${NOMBRE}: tiene deuda ${m[0].replace(/\s/g, '')}` };
    }
    return null;
  };
  const fin = async r => {
    obs.disconnect(); clearInterval(reloj);
    aviso(r.deuda ? `⚠️ TIENE DEUDA en ${NOMBRE}\n${r.monto}\n` + 'Revisa el detalle en pantalla.' : `✅ SIN DEUDA en ${NOMBRE}`, r.deuda ? '#c00000' : '#14804a', true);
    await chrome.storage.local.set({ deuda_res: { id: p.id || '', comp: COMP, deuda: r.deuda, monto: r.monto || '', texto: r.texto, ts: Date.now() } });
    await chrome.storage.local.remove('deuda_pedido');
  };
  let listo = false;
  const revisar = () => { if (listo) return; const r = leerResultado(); if (r) { listo = true; fin(r); } };
  const obs = new MutationObserver(() => revisar());
  obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  const reloj = setInterval(revisar, 1500);
  setTimeout(() => { if (!listo) { obs.disconnect(); clearInterval(reloj); } }, 5 * 60000);
  revisar();
})();

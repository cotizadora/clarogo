// ==UserScript==
// @name         ClaroGo! Genesys
// @namespace    https://cotizadora.github.io/clarogo/
// @version      1.1.0
// @description  Lee los datos del cliente en la llamada de Genesys y los envía a Mi Planilla de ClaroGo!. Herramienta no oficial. Atajo: Alt+Shift+G.
// @match        https://*.pure.cloud/*
// @match        https://*.mypurecloud.com/*
// @match        https://*.genesys.cloud/*
// @match        https://cotizadora.github.io/clarogo/*
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addValueChangeListener
// @grant        GM_openInTab
// @grant        unsafeWindow
// @updateURL    https://cotizadora.github.io/clarogo/ext/clarogo-genesys.user.js
// @downloadURL  https://cotizadora.github.io/clarogo/ext/clarogo-genesys.user.js
// ==/UserScript==

(function () {
  'use strict';
  const PLANILLA = 'https://cotizadora.github.io/clarogo/';
  const PROTEGIDAS = ['oferta', 'png', 'stock', 'script'];   // secciones que nunca se tocan
  const ID = Math.random().toString(36).slice(2);
  const esperar = ms => new Promise(r => setTimeout(r, ms));

  // ───────── Lado Mi Planilla: recibe los datos y llama a clarogoDesdeGenesys ─────────
  if (location.href.startsWith(PLANILLA)) {
    const seccion = () => location.hash.slice(1) || 'inicio';
    const t0 = Date.now();
    const latido = () => GM_setValue('pl_' + ID, { ts: Date.now(), t0, sec: seccion() });
    latido(); setInterval(latido, 2000);
    addEventListener('beforeunload', () => GM_deleteValue('pl_' + ID));

    const recibir = async (e) => {
      if (!e || !e.texto || Date.now() - e.ts > 30000) return;
      if (e.para !== ID && !(e.para === '*' && !PROTEGIDAS.includes(seccion()))) return;
      for (let i = 0; i < 30; i++) {                       // espera a que la página defina la función
        const f = unsafeWindow.clarogoDesdeGenesys;
        if (typeof f === 'function') {
          if (GM_getValue('hecho') === e.ts) return;       // evita entregar dos veces
          GM_setValue('hecho', e.ts);
          f.call(unsafeWindow, e.texto);
          return;
        }
        await esperar(500);
      }
    };
    GM_addValueChangeListener('entrega', (n, v, nv) => recibir(nv));
    recibir(GM_getValue('entrega'));                       // pestaña recién abierta
    return;
  }

  // ───────── Lado Genesys: corre en cada marco de la página ─────────
  function leer() {
    const datos = {};
    const esClave = t => /^[A-Za-z][A-Za-z0-9_]*:$/.test(t);
    const textoPropio = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    const recorrer = (raiz) => {
      let clave = '';
      const w = document.createTreeWalker(raiz, NodeFilter.SHOW_ELEMENT);
      for (let el = w.currentNode; el; el = w.nextNode()) {
        if (el.shadowRoot) recorrer(el.shadowRoot);
        const tag = el.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
          if (el.type === 'hidden' || el.type === 'button' || el.type === 'submit') continue;
          let k = clave;
          if (!k && el.id) { const lb = (el.getRootNode().querySelector ? el.getRootNode() : document).querySelector(`label[for="${CSS.escape(el.id)}"]`); if (lb && esClave(lb.textContent.trim())) k = lb.textContent.trim(); }
          if (k) { const v = String(el.value || '').trim(); if (!(k.slice(0, -1) in datos) || v) datos[k.slice(0, -1)] = v; clave = ''; }
          continue;
        }
        const t = textoPropio(el);
        if (t && esClave(t)) clave = t;
      }
    };
    try { recorrer(document.body || document.documentElement); } catch (e) {}
    return datos;
  }

  // Cada marco responde cuando alguien pide los datos
  GM_addValueChangeListener('pedido', (n, v, nv) => { if (nv) GM_setValue('resp_' + nv + '_' + ID, leer()); });

  const telFormato = s => { let d = String(s || '').replace(/\D/g, ''); if (d.length === 11 && d.startsWith('56')) d = d.slice(2); return d.length === 9 ? d : ''; };

  function aviso(texto, ok) {
    const d = document.createElement('div');
    d.textContent = texto;
    d.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:2147483647;max-width:320px;padding:10px 14px;border-radius:10px;font:14px/1.4 system-ui,sans-serif;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.3);white-space:pre-line;background:' + (ok ? '#e60000' : '#555');
    (document.body || document.documentElement).appendChild(d);
    setTimeout(() => d.remove(), 6000);
  }

  async function tomarDatos() {
    const pedido = String(Date.now());
    GM_setValue('pedido', pedido);
    await esperar(800);
    const claves = GM_listValues();
    const todos = claves.filter(k => k.startsWith('resp_' + pedido + '_')).map(k => GM_getValue(k) || {});
    todos.push(leer());
    claves.filter(k => k.startsWith('resp_')).forEach(k => GM_deleteValue(k));
    todos.sort((a, b) => Object.values(b).filter(Boolean).length - Object.values(a).filter(Boolean).length);
    const d = Object.assign({}, ...todos.slice().reverse());
    if (!Object.values(d).some(Boolean)) { aviso('ClaroGo!: no encontré datos del cliente. Abre la llamada con el panel de interacción visible.', false); return; }

    const texto = Object.entries(d).map(([k, v]) => `${k}:\n${v || k}`).join('\n');
    GM_setClipboard(texto);
    const tel = telFormato(d.FONO_CONTACTO) || telFormato(d.Fono1) || telFormato(d.Fono2) || telFormato(d.LEGACY_ID);
    const nombre = [d.FIRST_NAME, d.SECOND_NAME, d.THIRD_NAME].filter(Boolean).join(' ');

    // Elige la pestaña de la planilla: primero "control", luego una libre; si no hay, abre una
    const ahora = Date.now();
    // Las pestañas en segundo plano avisan más lento (el navegador frena sus relojes): se aceptan latidos de hasta 90 segundos.
    // Los de pestañas que ya no existen se borran.
    const pls = [];
    GM_listValues().filter(k => k.startsWith('pl_')).forEach(k => { const v = GM_getValue(k); if (!v || ahora - v.ts > 90000) GM_deleteValue(k); else pls.push(Object.assign({ id: k.slice(3) }, v)); });
    const p = pls.filter(x => x.sec === 'control').sort((a, b) => a.t0 - b.t0)[0] || pls.filter(x => !PROTEGIDAS.includes(x.sec)).sort((a, b) => a.t0 - b.t0)[0];
    GM_setValue('entrega', { texto, ts: ahora, para: p ? p.id : '*' });
    if (!p) GM_openInTab(PLANILLA + '#control', { active: true });
    else setTimeout(() => { if (GM_getValue('hecho') !== ahora) { GM_setValue('entrega', { texto, ts: Date.now(), para: '*' }); GM_openInTab(PLANILLA + '#control', { active: true }); } }, 6000);

    aviso('✓ Datos copiados y enviados a Mi Planilla\n' + (tel ? 'Tel: ' + tel : 'Esta llamada no trae teléfono') + (nombre ? '\n' + nombre : ''), !!tel);
  }

  addEventListener('keydown', e => {
    if (e.altKey && e.shiftKey && e.code === 'KeyG') { e.preventDefault(); tomarDatos(); }
  }, true);
})();

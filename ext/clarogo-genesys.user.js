// ==UserScript==
// @name         ClaroGo! Genesys
// @namespace    https://cotizadora.github.io/clarogo/
// @version      2.0.0
// @description  Lee los datos del cliente en la llamada de Genesys, los envía a Mi Planilla de ClaroGo! y abre WhatsApp Web con la oferta y la lámina. Herramienta no oficial. Atajo: Alt+Shift+G.
// @match        https://*.pure.cloud/*
// @match        https://*.mypurecloud.com/*
// @match        https://*.genesys.cloud/*
// @match        https://cotizadora.github.io/clarogo/*
// @match        https://web.whatsapp.com/*
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addValueChangeListener
// @grant        GM_openInTab
// @grant        GM_info
// @grant        unsafeWindow
// @updateURL    https://cotizadora.github.io/clarogo/ext/clarogo-genesys.user.js
// @downloadURL  https://cotizadora.github.io/clarogo/ext/clarogo-genesys.user.js
// ==/UserScript==

/* Cómo funciona (versión para Tampermonkey de la extensión ClaroGo! Genesys):
   - En Genesys: Alt+Shift+G (o el botón "ClaroGo!" abajo a la derecha) lee los cuadros de la llamada, copia los datos
     y abre un panel para enviarlos a Mi Planilla (con plan y comentario) o abrir WhatsApp Web con el mensaje y la lámina.
   - En Mi Planilla: recibe los clientes y le entrega al script el nombre, el mensaje, la firma y las láminas del ejecutivo.
   - En WhatsApp Web: abre el chat sin recargar, deja el mensaje escrito y pega la lámina. Nunca envía nada solo.
   Las pestañas se comunican por el almacenamiento de Tampermonkey (GM_setValue / GM_addValueChangeListener). */
(function () {
  'use strict';
  const PLANILLA = 'https://cotizadora.github.io/clarogo/';
  const PROTEGIDAS = ['oferta', 'png', 'stock', 'script'];   // secciones de la planilla que nunca se tocan
  const ID = Math.random().toString(36).slice(2);
  const VERSION = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '';
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const arriba = window.top === window;
  const vivos = (prefijo, maxMs = 90000) => {
    const ahora = Date.now(), lista = [];
    GM_listValues().filter(k => k.startsWith(prefijo)).forEach(k => { const v = GM_getValue(k); if (!v || ahora - v.ts > maxMs) GM_deleteValue(k); else lista.push(Object.assign({ id: k.slice(prefijo.length) }, v)); });
    return lista;
  };
  // Las pestañas en segundo plano avisan más lento (el navegador frena sus relojes): por eso se aceptan latidos de hasta 90 s
  const latir = (prefijo, extra) => { const t0 = Date.now(); const f = () => GM_setValue(prefijo + ID, Object.assign({ ts: Date.now(), t0 }, extra ? extra() : {})); f(); setInterval(f, 2000); addEventListener('beforeunload', () => GM_deleteValue(prefijo + ID)); };

  // ═════ WhatsApp: pide abrir el chat en la pestaña de WhatsApp Web que ya esté abierta (o abre una) ═════
  function enviarWA(url, img) {
    if (!/^https:\/\/web\.whatsapp\.com\/send\?/.test(url)) return 'no';
    const was = vivos('wa_').sort((a, b) => a.t0 - b.t0), ts = Date.now();
    if (!was.length) { GM_openInTab(url, { active: true }); return 'nueva'; }
    GM_setValue('wa_pedido', { url, img: img || '', ts, para: was[0].id });
    // Si la pestaña de WhatsApp no responde en 10 segundos, se abre una nueva con el mensaje
    setTimeout(() => { if (GM_getValue('wa_hecho') !== ts) GM_openInTab(url, { active: true }); }, 10000);
    return 'existente';
  }

  // ═════ Lado Mi Planilla ═════
  if (location.href.startsWith(PLANILLA)) {
    if (!arriba) return;
    const seccion = () => location.hash.slice(1) || 'inicio';
    latir('pl_', () => ({ sec: seccion() }));
    document.documentElement.dataset.clarogoExt = '1';   // la planilla usa el script para abrir WhatsApp
    // La planilla avisa el nombre, mensaje, firma, teléfono y láminas del ejecutivo; y pide abrir WhatsApp
    addEventListener('message', e => {
      if (e.source !== window || !e.data) return;
      if (e.data.tipo === 'clarogo-perfil') GM_setValue('perfil', { nombre: String(e.data.nombre || ''), plantilla: String(e.data.plantilla || ''), firma: String(e.data.firma || ''), telefono: String(e.data.telefono || ''), planes: Array.isArray(e.data.planes) ? e.data.planes.slice(0, 20) : [] });
      if (e.data.tipo === 'clarogo-wa') enviarWA(String(e.data.url || ''), /^data:image\/(png|jpeg);base64,/.test(String(e.data.img || '')) ? e.data.img : '');
    });
    // Recibe los clientes que manda Genesys
    const recibir = async (e) => {
      if (!e || !e.texto || Date.now() - e.ts > 30000) return;
      if (e.para !== ID && !(e.para === '*' && !PROTEGIDAS.includes(seccion()))) return;
      for (let i = 0; i < 30; i++) {
        const f = unsafeWindow.clarogoDesdeGenesys;
        if (typeof f === 'function') {
          if (GM_getValue('hecho') === e.ts) return;
          GM_setValue('hecho', e.ts);
          f.call(unsafeWindow, e.texto, e.extra || {});
          return;
        }
        await esperar(500);
      }
    };
    GM_addValueChangeListener('entrega', (n, v, nv) => recibir(nv));
    recibir(GM_getValue('entrega'));
    return;
  }

  // ═════ Lado WhatsApp Web ═════
  if (location.hostname === 'web.whatsapp.com') {
    if (!arriba) return;
    latir('wa_');
    // Abre el chat sin recargar, deja el mensaje y pega la lámina (misma lógica que la extensión)
    async function chatRapido(numero, texto, img) {
      const esperar = ms => new Promise(r => setTimeout(r, ms));
      const hasta = async (fn, ms = 3000) => { const fin = Date.now() + ms; while (Date.now() < fin) { const v = fn(); if (v) return v; await esperar(100); } return null; };
      const visible = el => !!el && el.getClientRects().length > 0;
      const pegar = (el, txt) => {
        el.focus();
        const dt = new DataTransfer(); dt.setData('text/plain', txt);
        el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      };
      try {
        if (!document.querySelector('#side, #pane-side')) return 'sin-sesion';
        // 1. Botón "Nuevo chat"
        const nuevo = document.querySelector('[data-icon="new-chat-outline"], [data-icon="new-chat"], [aria-label="Nuevo chat"], [title="Nuevo chat"], [aria-label="New chat"], [title="New chat"]');
        if (!nuevo) return 'sin-boton';
        // 2. Buscador del panel de nuevo chat: el cuadro que se hace visible después de presionar el botón
        const antes = new Set([...document.querySelectorAll('[contenteditable="true"], input[type="text"]')].filter(visible));
        (nuevo.closest('button, [role="button"]') || nuevo).click();
        const buscador = await hasta(() => [...document.querySelectorAll('[contenteditable="true"], input[type="text"]')].find(e => visible(e) && !antes.has(e) && !e.closest('footer')) || null);
        if (!buscador) return 'sin-buscador';
        buscador.focus();
        if (buscador.isContentEditable) document.execCommand('insertText', false, numero); else { buscador.value = numero; buscador.dispatchEvent(new Event('input', { bubbles: true })); }
        // 3. Resultado: solo si hay exactamente un resultado (así nunca se abre el chat de otra persona)
        const panel = buscador.closest('[tabindex="-1"]') || buscador.parentElement.parentElement.parentElement.parentElement;
        await esperar(900);
        const resultados = await hasta(() => { const r = [...panel.querySelectorAll('[role="listitem"], [role="row"], [role="button"][tabindex]')].filter(e => visible(e) && /\d|[a-z]/i.test(e.textContent) && !e.contains(buscador)); return r.length ? r : null; }, 2500);
        if (!resultados) return 'sin-resultados';
        const reales = resultados.filter(e => !/(nuevo grupo|nueva comunidad|new group|new community|contactos en whatsapp|contacts on whatsapp)/i.test(e.textContent));
        if (reales.length !== 1) return 'resultados-' + reales.length;
        (reales[0].querySelector('[role="gridcell"], span[title]') || reales[0]).click();
        // 4. Cuadro para escribir del chat abierto
        const cajaActual = () => document.querySelector('footer [contenteditable="true"]');
        if (!await hasta(cajaActual, 3000)) return 'sin-caja';
        // WhatsApp termina de cargar el chat (y su borrador) un instante después de mostrarlo:
        // se espera, se pega y se revisa que el mensaje siga ahí. Si WhatsApp lo borró, se vuelve a pegar.
        await esperar(700);
        const inicio = texto.replace(/\s+/g, ' ').trim().slice(0, 25);
        const estaPegado = c => c && c.textContent.replace(/\s+/g, ' ').includes(inicio);
        // 5. La lámina: se pega como imagen en el chat; WhatsApp abre su vista previa lista para enviar
        const adjuntar = async () => {
          if (!img) return 'ok';
          try {
            const [cab, b64] = String(img).split(','), tipo = (cab.match(/data:([^;]+)/) || [])[1] || 'image/png';
            const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
            const archivo = new File([u], 'lamina-plan.' + (tipo.includes('jpeg') ? 'jpg' : 'png'), { type: tipo });
            const caja = cajaActual(); if (!caja) return 'ok-sin-lamina';
            const antes = new Set([...document.querySelectorAll('img')]), editAntes = new Set([...document.querySelectorAll('[contenteditable="true"]')]);
            caja.focus();
            const dt = new DataTransfer(); dt.items.add(archivo);
            caja.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
            // Se da por adjuntada si aparece la vista previa (una imagen nueva en la página)
            const vista = await hasta(() => [...document.querySelectorAll('img')].find(i => !antes.has(i) && visible(i) && /^blob:|^data:/.test(i.src)) || null, 3500);
            if (!vista) return 'ok-sin-lamina';
            // WhatsApp copia el mensaje escrito como pie de la imagen: se vacía, para que la lámina vaya sola
            // (el mensaje ya va aparte). Se revisa un momento, porque WhatsApp puede llenarlo un instante después.
            const pie = () => [...document.querySelectorAll('[contenteditable="true"]')].find(e => e !== cajaActual() && !e.closest('footer') && visible(e) && estaPegado(e));
            for (let i = 0; i < 8; i++) {
              const p = pie();
              if (p) {
                p.focus();
                document.execCommand('selectAll', false, null);
                document.execCommand('delete', false, null);
                if (p.textContent.trim()) { p.textContent = ''; p.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' })); }
              }
              await esperar(250);
            }
            return 'ok';
          } catch (e) { return 'ok-sin-lamina'; }
        };
        let c0 = cajaActual();
        if (c0 && c0.textContent.trim() && !estaPegado(c0)) return adjuntar();   // ya había un borrador del ejecutivo: no se pisa
        for (let i = 0; i < 5; i++) {
          const caja = cajaActual();
          if (!caja) { await esperar(300); continue; }
          if (!estaPegado(caja)) {
            if (caja.textContent.trim()) return adjuntar();
            pegar(caja, texto);
            await esperar(250);
            if (!caja.textContent.trim()) document.execCommand('insertText', false, texto);
          }
          await esperar(800);
          const ahora = cajaActual();
          if (estaPegado(ahora)) { await esperar(600); if (estaPegado(cajaActual())) return adjuntar(); }
        }
        return estaPegado(cajaActual()) ? adjuntar() : 'ok-sin-texto';
      } catch (e) { return 'error: ' + e.message; }
    }
    GM_addValueChangeListener('wa_pedido', async (n, v, p) => {
      if (!p || p.para !== ID || Date.now() - p.ts > 15000) return;
      GM_setValue('wa_hecho', p.ts);
      const u = new URL(p.url), numero = u.searchParams.get('phone') || '', texto = u.searchParams.get('text') || '';
      document.title = '💬 ClaroGo!: chat listo';
      setTimeout(() => { if (document.title.startsWith('💬 ClaroGo!')) document.title = 'WhatsApp'; }, 15000);
      let r = 'error';
      try { r = await chatRapido(numero, texto, p.img); } catch (e) {}
      if (!(r === 'ok' || r === 'ok-sin-lamina')) location.href = p.url;   // si el modo rápido no pudo, se carga el chat con el mensaje
    });
    return;
  }

  // ═════ Lado Genesys (corre en cada marco de la página) ═════
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
  // Cada marco responde cuando se piden los datos; si el atajo se presiona dentro de un marco, avisa al marco principal
  GM_addValueChangeListener('pedido', (n, v, nv) => { if (nv) GM_setValue('resp_' + nv + '_' + ID, leer()); });
  addEventListener('keydown', e => {
    if (!(e.altKey && e.shiftKey && e.code === 'KeyG')) return;
    e.preventDefault(); e.stopPropagation();
    if (arriba) abrirPanel(); else GM_setValue('abrir_panel', Date.now());
  }, true);
  if (!arriba) return;

  const telFormato = s => { let d = String(s || '').replace(/\D/g, ''); if (d.length === 11 && d.startsWith('56')) d = d.slice(2); return d.length === 9 ? d : ''; };
  async function tomarDatos() {
    const pedido = String(Date.now());
    GM_setValue('pedido', pedido);
    await esperar(800);
    const claves = GM_listValues();
    const todos = claves.filter(k => k.startsWith('resp_' + pedido + '_')).map(k => GM_getValue(k) || {});
    todos.push(leer());
    claves.filter(k => k.startsWith('resp_')).forEach(k => GM_deleteValue(k));
    todos.sort((a, b) => Object.values(b).filter(Boolean).length - Object.values(a).filter(Boolean).length);
    return Object.assign({}, ...todos.slice().reverse());
  }

  // Mensaje de WhatsApp con lo que la planilla dejó guardado (sin nombre del cliente: el script no tiene sus datos)
  const NOMBRE_DEFECTO = 'Eduardo Pérez', TELEFONO_DEFECTO = '+56 9 9796 6724';
  const PLANTILLA_DEFECTO = 'Hola, {saludo}{trato}. Mi nombre es *{nombre}*, desde *Claro Chile*. Hablamos hace poco telefónicamente y, tal como acordamos, le envío la información sobre la propuesta.';
  const FIRMA_DEFECTO = 'Quedo a su disposición para cualquier consulta.\n\nSaludos cordiales,\n*{nombre}*\nEjecutivo(a) de ventas · *Claro Chile*\n📱 {telefono}';
  const saludoHora = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? 'muy buenos días' : h >= 12 && h < 20 ? 'muy buenas tardes' : 'muy buenas noches'; };
  function mensajes() {
    const p = GM_getValue('perfil') || {}, nom = p.nombre || NOMBRE_DEFECTO, tel = p.telefono || TELEFONO_DEFECTO;
    let pres = (p.plantilla || PLANTILLA_DEFECTO).replace(/\{saludo\}/gi, saludoHora()).replace(/\{nombre\}/gi, nom).replace(/\{telefono\}/gi, tel).replace(/\{trato\}/gi, '').replace(/\s*\{cliente\}\s*(?=[,.!?])/gi, '').replace(/\s*\{(cliente|compania)\}/gi, '').replace(/ {2,}/g, ' ');
    pres = pres.charAt(0).toUpperCase() + pres.slice(1);
    const firma = (p.firma || FIRMA_DEFECTO).replace(/\{nombre\}/gi, nom).replace(/\{telefono\}/gi, tel);
    const planes = (p.planes || []).map(x => ({ id: x.id, titulo: x.titulo, img: x.img || '', texto: [pres, x.detalle, firma].join('\n\n') }));
    return planes.concat([{ id: '', titulo: planes.length ? 'Solo la presentación, sin plan' : 'Solo la presentación (abre ClaroGo! una vez para cargar los planes)', img: '', texto: [pres, firma].join('\n\n') }]);
  }

  // ═════ Panel en Genesys (con sombra propia para que el estilo de Genesys no lo afecte) ═════
  let host = null, raiz = null, DATOS = {}, TEXTO = '', MENS = [];
  const $p = s => raiz.querySelector(s);
  function construir() {
    host = document.createElement('div'); host.id = 'clarogo-genesys';
    host.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647';
    raiz = host.attachShadow({ mode: 'open' });
    raiz.innerHTML = `<style>
      :host{all:initial} *{box-sizing:border-box;font-family:"Segoe UI",system-ui,sans-serif}
      .lanzar{border:0;border-radius:999px;background:#e60000;color:#fff;font-weight:900;font-size:13px;padding:8px 14px;box-shadow:0 4px 14px rgba(0,0,0,.3);cursor:pointer}
      .panel{display:none;width:320px;background:#fff;border:2px solid #b9bec7;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.35);overflow:hidden;color:#1f2430;font-size:14px}
      .on .panel{display:block} .on .lanzar{display:none}
      header{background:#e60000;color:#fff;padding:9px 12px;display:flex;align-items:center;gap:8px}
      header b{font-size:17px;font-weight:900} header .ver{background:#fff;color:#e60000;font-weight:800;font-size:11px;padding:1px 7px;border-radius:999px}
      header .x{margin-left:auto;background:none;border:0;color:#fff;font-size:18px;cursor:pointer}
      main{padding:10px 12px 12px}
      .estado{font-size:13px;color:#5f6673;margin:0 0 8px} .estado.ok{color:#14532d} .estado.mal{color:#8a1010}
      table{width:100%;border-collapse:collapse;margin-bottom:8px;font-size:13px} td{padding:4px 0;border-bottom:1px solid #e3e6eb} td:first-child{color:#5f6673;width:38%}
      td.tel{font-size:17px;font-weight:800}
      textarea{width:100%;border:1px solid #e3e6eb;border-radius:8px;padding:7px 9px;font-size:13px;resize:vertical}
      button.b{width:100%;border:0;border-radius:9px;padding:9px 10px;font-size:14px;font-weight:700;cursor:pointer;margin-top:6px}
      .rojo{background:#e60000;color:#fff} .verde{background:#25d366;color:#fff} button.b:disabled{opacity:.5;cursor:default}
      .wa{margin-top:10px;padding:9px;border:1px solid #c8eed6;background:#f1fbf4;border-radius:10px}
      .wa label{display:block;font-size:12px;font-weight:700;color:#5f6673;margin-bottom:4px}
      .wa select{width:100%;padding:6px;border:1px solid #e3e6eb;border-radius:8px;font-size:13px}
      .wa .chk{display:flex;align-items:center;gap:6px;margin-top:7px;color:#1f2430;cursor:pointer}
      small{display:block;margin-top:8px;color:#5f6673;font-size:11px}
    </style>
    <button class="lanzar" title="ClaroGo!: tomar datos de la llamada (Alt+Shift+G)">ClaroGo!</button>
    <div class="panel">
      <header><b>ClaroGo!</b><span>Genesys</span><span class="ver">v${VERSION}</span><button class="x" title="Cerrar">✕</button></header>
      <main>
        <p class="estado">Leyendo la llamada…</p>
        <table class="datos"></table>
        <textarea class="coment" rows="2" placeholder="Comentario para la planilla (opcional)"></textarea>
        <button class="b rojo enviar" disabled>➕ Enviar a Mi Planilla (fila nueva)</button>
        <div class="wa" hidden>
          <label>WhatsApp con la oferta</label>
          <select class="plan"></select>
          <label class="chk"><input type="checkbox" class="lamina"> <span class="lamina-t">🖼️ Adjuntar la lámina del plan</span></label>
          <button class="b verde abrir-wa">WhatsApp Web</button>
        </div>
        <small>Los datos ya quedaron copiados. Atajo: Alt+Shift+G. Herramienta no oficial.</small>
      </main>
    </div>`;
    document.documentElement.appendChild(host);
    $p('.lanzar').onclick = abrirPanel;
    $p('.x').onclick = () => host.classList.remove('on');
    $p('.enviar').onclick = enviarPlanilla;
    $p('.plan').onchange = pintarLamina;
    $p('.lamina').onchange = e => GM_setValue('adjuntar', e.target.checked);
    $p('.abrir-wa').onclick = abrirWA;
  }
  const estado = (t, c) => { const e = $p('.estado'); e.textContent = t; e.className = 'estado ' + (c || ''); };
  function pintarLamina() {
    const m = MENS[+$p('.plan').value] || {}, hay = !!m.img;
    $p('.lamina').disabled = !hay;
    $p('.lamina-t').textContent = hay ? '🖼️ Adjuntar la lámina del plan' : (m.id ? '🖼️ Lámina no disponible (abre ClaroGo! una vez)' : '🖼️ Sin lámina (solo la presentación)');
  }
  async function abrirPanel() {
    if (!host || !document.documentElement.contains(host)) construir();
    host.classList.add('on');
    estado('Leyendo la llamada…'); $p('.datos').innerHTML = ''; $p('.enviar').disabled = true; $p('.wa').hidden = true;
    DATOS = await tomarDatos();
    if (!Object.values(DATOS).some(Boolean)) { estado('No encontré datos del cliente. Abre la llamada con el panel "Interacción de llamada" visible.', 'mal'); return; }
    TEXTO = Object.entries(DATOS).map(([k, v]) => `${k}:\n${v || k}`).join('\n');
    try { GM_setClipboard(TEXTO); } catch (e) {}
    const tel = telFormato(DATOS.FONO_CONTACTO) || telFormato(DATOS.Fono1) || telFormato(DATOS.Fono2) || telFormato(DATOS.LEGACY_ID);
    const nombre = [DATOS.FIRST_NAME, DATOS.SECOND_NAME, DATOS.THIRD_NAME].filter(Boolean).join(' ');
    const filas = [['Teléfono', tel || 'No viene'], ['RUT', DATOS.RUT_PERSONA], ['Nombre', nombre], ['Campaña', DATOS.vNombre_Campana || DATOS.CampaignDescription], ['Viene de', DATOS.Segment_of_Origin]].filter(([, v]) => v);
    $p('.datos').innerHTML = filas.map(([k]) => `<tr><td>${k}</td><td${k === 'Teléfono' ? ' class="tel"' : ''}></td></tr>`).join('');
    [...$p('.datos').querySelectorAll('tr')].forEach((tr, i) => { tr.lastChild.textContent = filas[i][1]; });
    estado(tel ? '✓ Datos copiados.' : 'Datos copiados, pero esta llamada no trae teléfono.', tel ? 'ok' : 'mal');
    $p('.enviar').disabled = false;
    if (tel) {
      MENS = mensajes();
      let pref = MENS.findIndex(m => m.id === 'v500'); if (pref < 0) pref = 0;   // por defecto el Plan 500, el más barato
      $p('.plan').innerHTML = MENS.map((m, i) => `<option value="${i}"${i === pref ? ' selected' : ''}></option>`).join('');
      [...$p('.plan').options].forEach((o, i) => { o.textContent = MENS[i].titulo; });
      $p('.lamina').checked = GM_getValue('adjuntar', true) !== false;
      pintarLamina(); $p('.wa').hidden = false; $p('.wa').dataset.tel = tel;
    }
  }
  function enviarPlanilla() {
    const m = MENS[+$p('.plan').value];
    const extra = { plan: m && m.id ? m.titulo : '', notas: $p('.coment').value.trim() };
    const ahora = Date.now(), pls = vivos('pl_');
    const p = pls.filter(x => x.sec === 'control').sort((a, b) => a.t0 - b.t0)[0] || pls.filter(x => !PROTEGIDAS.includes(x.sec)).sort((a, b) => a.t0 - b.t0)[0];
    GM_setValue('entrega', { texto: TEXTO, extra, ts: ahora, para: p ? p.id : '*' });
    if (!p) GM_openInTab(PLANILLA + '#control', { active: true });
    else setTimeout(() => { if (GM_getValue('hecho') !== ahora) { GM_setValue('entrega', { texto: TEXTO, extra, ts: Date.now(), para: '*' }); GM_openInTab(PLANILLA + '#control', { active: true }); } }, 6000);
    estado(p ? '✓ Enviado a Mi Planilla. Cámbiate a esa pestaña para verlo.' : '✓ Abriendo Mi Planilla con el cliente…', 'ok');
    $p('.coment').value = '';
  }
  async function abrirWA() {
    const m = MENS[+$p('.plan').value] || MENS[0]; if (!m) return;
    const tel = $p('.wa').dataset.tel, img = $p('.lamina').checked && !$p('.lamina').disabled ? m.img : '';
    const url = `https://web.whatsapp.com/send?phone=56${tel}&text=${encodeURIComponent(m.texto)}`;
    // Portapapeles de respaldo: con lámina queda la imagen (Ctrl+V la adjunta); sin lámina queda el mensaje
    try {
      if (img) { const png = await new Promise(res => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext('2d').drawImage(i, 0, 0); c.toBlob(res, 'image/png'); }; i.onerror = () => res(null); i.src = img; }); if (png) await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]); }
      else GM_setClipboard(m.texto);
    } catch (e) {}
    const r = enviarWA(url, img);
    estado(r === 'existente' ? '✓ Listo: cámbiate a la pestaña de WhatsApp, el chat queda con el mensaje escrito.' : '✓ Abriendo WhatsApp Web con el mensaje…', 'ok');
  }
  GM_addValueChangeListener('abrir_panel', (n, v, nv, remoto) => { if (nv) abrirPanel(); });
  // El botón "ClaroGo!" aparece cuando la página de Genesys termina de cargar
  const listo = () => { if (!host) construir(); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', listo); else listo();
})();

// GoExt: actualización con un clic.
// 1. Abre goext://actualizar, el enlace que registra el instalador y que ejecuta "Actualizar GoExt" del escritorio.
// 2. Revisa cada 2 segundos la versión que quedó en la carpeta; cuando cambia, recarga GoExt sola.
// Si el enlace no existe (PC con un instalador antiguo), a los 25 segundos explica cómo hacerlo a mano.
const $ = s => document.querySelector(s);
const usada = chrome.runtime.getManifest().version;
const abrir = () => { location.href = 'goext://actualizar'; };
$('#otra').onclick = abrir;
setTimeout(abrir, 400);

const inicio = Date.now();
let listo = false;

// ── Para quienes instalaron con el .zip ──
// El actualizador del escritorio se intenta igual primero (así sigue funcionando para quienes usan el instalador).
// Si en 10 segundos no llega nada, o si este PC ya se actualizó antes con el .zip, se muestra la guía del .zip.
// El botón baja goext.zip a Descargas siempre con el mismo nombre y abre la carpeta con el archivo marcado.
const ZIP = 'https://cotizadora.github.io/clarogo/ext/clarogo-genesys-extension.zip';
let usoZip = false;
const verZip = () => { $('#zip').hidden = false; };
try { chrome.storage.local.get('modo_zip').then(o => { if (o.modo_zip) verZip(); }); } catch (e) {}
setTimeout(() => { if (!listo) verZip(); }, 10000);
$('#zip-bajar').onclick = async () => {
  const b = $('#zip-bajar'); b.disabled = true; b.textContent = 'Descargando…'; $('#zip-ok').textContent = '';
  try {
    const id = await chrome.downloads.download({ url: ZIP + '?v=' + Date.now(), filename: 'goext.zip', conflictAction: 'overwrite', saveAs: false });
    usoZip = true;
    const fin = await new Promise(res => {
      const f = d => { if (d.id === id && d.state && d.state.current !== 'in_progress') { chrome.downloads.onChanged.removeListener(f); res(d.state.current); } };
      chrome.downloads.onChanged.addListener(f);
      setTimeout(() => res('tarde'), 60000);
    });
    if (fin === 'complete') { $('#zip-ok').textContent = '✅ Descargado'; chrome.downloads.show(id); }
    else $('#zip-ok').textContent = 'No se pudo descargar. Revisa tu internet y vuelve a intentarlo.';
  } catch (e) {
    // Sin el permiso de descargas (versión antigua): se baja con un enlace normal
    const a = document.createElement('a'); a.href = ZIP; a.download = 'goext.zip'; document.body.appendChild(a); a.click(); a.remove();
    usoZip = true; $('#zip-ok').textContent = '✅ Revisa tu carpeta Descargas';
  }
  b.disabled = false; b.textContent = '⬇ Descargar GoExt otra vez';
};
const revisar = async () => {
  if (listo) return;
  try {
    const m = await fetch(chrome.runtime.getURL('manifest.json') + '?v=' + Date.now(), { cache: 'no-store' }).then(r => r.json());
    if (m.version && m.version !== usada) {
      listo = true;
      $('#giro').classList.add('ok');
      $('#estado').textContent = '✅ Versión ' + m.version + ' descargada';
      $('#detalle').textContent = 'Activándola… esta pestaña se cierra sola.';
      $('#otra').hidden = true; $('#nota').hidden = true; $('#zip').hidden = true;
      if (usoZip) { try { await chrome.storage.local.set({ modo_zip: true }); } catch (e) {} }
      setTimeout(() => chrome.runtime.reload(), 1200);
      return;
    }
  } catch (e) {}
  const seg = (Date.now() - inicio) / 1000;
  if (seg > 25 && !$('#nota').dataset.mano) {
    $('#nota').dataset.mano = '1';
    $('#nota').innerHTML = 'Si usas el instalador y no pasó nada, haz doble clic en <b>Actualizar GoExt</b> de tu escritorio. Esta pestaña sigue esperando y activa la versión nueva apenas llegue.';
  }
  if (seg < 900) setTimeout(revisar, 2000);   // 15 minutos: da tiempo para extraer el .zip con calma
  else { $('#giro').hidden = true; $('#estado').textContent = 'No llegó una versión nueva'; $('#detalle').textContent = 'Revisa tu internet y vuelve a intentarlo.'; }
};
setTimeout(revisar, 2000);

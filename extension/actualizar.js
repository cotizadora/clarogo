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
const revisar = async () => {
  if (listo) return;
  try {
    const m = await fetch(chrome.runtime.getURL('manifest.json') + '?v=' + Date.now(), { cache: 'no-store' }).then(r => r.json());
    if (m.version && m.version !== usada) {
      listo = true;
      $('#giro').classList.add('ok');
      $('#estado').textContent = '✅ Versión ' + m.version + ' descargada';
      $('#detalle').textContent = 'Activándola… esta pestaña se cierra sola.';
      $('#otra').hidden = true; $('#nota').hidden = true;
      setTimeout(() => chrome.runtime.reload(), 1200);
      return;
    }
  } catch (e) {}
  const seg = (Date.now() - inicio) / 1000;
  if (seg > 25 && !$('#nota').dataset.mano) {
    $('#nota').dataset.mano = '1';
    $('#nota').innerHTML = 'Si no pasó nada, haz doble clic en <b>Actualizar GoExt</b> de tu escritorio (o en el instalador). Desde esa vez el botón de GoExt actualiza solo. Esta pestaña sigue esperando y activa la versión nueva apenas llegue.'
      + '<br><br><b>Si tu computador bloquea el instalador</b> (Control inteligente de aplicaciones): <a href="https://cotizadora.github.io/clarogo/ext/clarogo-genesys-extension.zip" download="goext.zip">descarga GoExt en .zip</a>, haz <b>Extraer todo</b> en la misma carpeta donde la tienes y acepta <b>Reemplazar</b>. Esta pestaña la activa sola.';
  }
  if (seg < 180) setTimeout(revisar, 2000);
  else { $('#giro').hidden = true; $('#estado').textContent = 'No llegó una versión nueva'; $('#detalle').textContent = 'Revisa tu internet y vuelve a intentarlo.'; }
};
setTimeout(revisar, 2000);

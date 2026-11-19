// GoExt: alerta "LLAMADA CORTADA". Se desvanece apenas el ejecutivo mueve el mouse, hace clic o presiona una tecla
// (o sola a los 10 segundos) y luego pide al fondo abrir GoExt con el motivo "Corte de llamado" listo para tipificar.
if (/temprano=1/.test(location.search)) document.getElementById('sub').textContent = 'El cliente cortó apenas contestó. Tipifica la llamada.';
let cerrando = false;
const cerrar = () => {
  if (cerrando) return; cerrando = true;
  document.body.classList.add('fuera');
  try { chrome.runtime.sendMessage({ tipo: 'abrir-tipificacion' }); } catch (e) {}
  setTimeout(() => window.close(), 650);
};
// Un instante de gracia para que un movimiento casual al aparecer no la cierre antes de leerla
setTimeout(() => { ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'].forEach(t => window.addEventListener(t, cerrar, { once: true })); }, 900);
setTimeout(cerrar, 10000);

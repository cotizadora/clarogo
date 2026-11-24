# ClaroGo!

Portal de apoyo para ventas de equipos y planes con portabilidad. Es una herramienta no oficial, desarrollada por Eduardo Pérez. No es un sitio de Claro Chile.

- Sitio publicado: https://cotizadora.github.io/clarogo/
- Repositorio: https://github.com/cotizadora/clarogo
- Sitio anterior (sin cambios): https://financiamiento.neocities.org/

## Estructura

- `clarogo-2026.png`: miniatura que aparece al compartir el enlace.
- `index.html`: todo el portal en un solo archivo, con CSS y JavaScript propios. No usa CDN, fuentes externas ni librerías.
- `datos/stock.csv`: stock de equipos. Es lo único que hay que tocar para actualizar el stock.
- `galeria/`: imágenes de equipos optimizadas (1600 px) y `galeria/mini/` con las miniaturas.
- `tutoriales/`: los tres tutoriales interactivos originales, sin fuentes externas.
- `original/`: copia intacta del sitio de Neocities descargada el 12-11-2026. No se modifica.
- `CLAUDE.md`: instrucciones del proyecto.

## Cómo actualizar el stock

**Lo más simple (computador de Eduardo):** doble clic en el ícono **Actualizar stock ClaroGo** del escritorio. Se abre la carpeta Descargas con el último Excel ya marcado; se elige, se revisa el resumen y se presiona Sí. Publica con la sesión de GitHub que ya tiene el computador, sin claves, y avisa cuando el stock está en línea. El programa es `herramientas/actualizar-stock.ps1` (instalado en Documentos\CLARO\ClaroGo) y usa las mismas reglas que el portal.

**Desde la página:**

Se hace desde el mismo portal, sin editar la página:

1. Entra a **Stock de Equipos** y presiona **Actualizar stock**.
2. Elige o arrastra el Excel del stock diario tal como llega (por ejemplo `Stock Diario + Planilla de precios 16-11.xlsx`). El portal lo lee directo, sin convertirlo.
3. Revisa el resumen y la **fecha del stock**, que se toma del nombre del archivo. Corrígela si no corresponde.
4. Presiona **Publicar para todos**. En uno o dos minutos todos ven el stock nuevo, y el portal avisa cuando ya está en línea.

Cómo se arma el stock desde el Excel:

- Hoja Stock: Material (SKU), Marca, Stock disp., Pie Referencial y 18 cuotas referenciales (Financiamiento Portabilidad). Si un SKU viene en más de una fila, se suma su stock.
- Hoja Planilla: el nombre del equipo es el Modelo Comercial. Los equipos Vigentes sin stock se agregan con stock 0, para que al buscarlos aparezcan como sin stock.
- Se omiten los productos sin pie o cuota (#N/A) y los equipos que no están Vigentes.

La fecha se guarda en `datos/stock-info.json` y aparece destacada arriba de la tabla de Stock: verde si es de hoy, amarilla si es de ayer y roja si es más antigua.

**Conexión con GitHub (una sola vez por computador):** en el mismo cuadro, en "Conexión con GitHub", sigue los pasos para crear una clave de GitHub con acceso solo al repositorio clarogo (Contents: Read and write) y pégala. La clave queda guardada solo en ese navegador, y Limpiar caché no la borra. Si se pierde o se filtra, bórrala en GitHub y crea otra.

Sin la conexión, en "Otras formas de cargar" se puede descargar `stock.csv` y subirlo a la carpeta `datos` del repositorio.
## Cómo cambiar precios y planes

Todos los datos comerciales están al inicio del script de `index.html`, en el bloque "DATOS COMERCIALES": Excepciones de Boletas, Oferta Personas, Oferta PNG y los planes del Script. Cada cambio se anota más abajo con fecha y fuente.

## Cómo publicar

GitHub Pages publica la rama `main` desde la raíz. Cada push a `main` actualiza el sitio en uno o dos minutos.

## Instalar ClaroGo! Genesys (para ejecutivos)

Enlace para compartir: **https://cotizadora.github.io/clarogo/ext/**

1. Descargar el instalador (`ext/instalar-clarogo.bat`) y abrirlo con doble clic. No necesita permisos de administrador: baja `ext/clarogo-genesys-extension.zip`, borra y reemplaza todo en `Documentos\ClaroGo\extension` (la misma ruta para todos), copia la ruta y se cierra solo. Además deja `Documentos\ClaroGo\actualizar-clarogo.bat` y el acceso **Actualizar ClaroGo!** en el escritorio.
2. En la página elegir Edge o Chrome y seguir los 3 pasos (solo la primera vez): abrir edge://extensions o chrome://extensions, activar "Modo para desarrolladores", "Cargar desempaquetada" y pegar la carpeta.
3. Para actualizar: doble clic en **Actualizar ClaroGo!** del escritorio y "Activar versión nueva" en la ventanita de ClaroGo!. El acceso siempre baja el instalador publicado más nuevo, así que los cambios al instalador también les llegan solos.

**Importante al cambiar la extensión:** el instalador baja el zip, no la carpeta `extension/`. Cada vez que cambie la extensión hay que regenerar `ext/clarogo-genesys-extension.zip` con los archivos de `ext/extension-archivos.txt` (en la raíz del zip, sin carpeta). Los .bat se guardan con saltos de línea de Windows (`.gitattributes`).

Opción con Tampermonkey:

1. Instalar Tampermonkey (gratis): https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd
2. En edge://extensions, Detalles de Tampermonkey: activar "Permitir scripts de usuario".
3. Abrir https://cotizadora.github.io/clarogo/ext/clarogo-genesys.user.js y presionar Instalar.
4. En Genesys: botón rojo ClaroGo! o Alt+Shift+G. Abrir ClaroGo! una vez para cargar nombre, firma y láminas.
5. No tener activa a la vez la extensión antigua ClaroGo! Genesys.

## Historial de cambios

### 24-11-2026: ClaroGo! 2.21.1, formulario de no venta en Enlaces

- En Enlaces, Gestión Operativa, se agregó "Formulario No Venta", para los ejecutivos que tipifican sin la extensión GoExt.

### 24-11-2026: ClaroGo! 2.21.0 y GoExt 1.57.0, deuda en segundo plano al escribir el RUT

- RUT en Mi Planilla: se borran los puntos y espacios al escribir. El guion queda solo si el ejecutivo lo pone. Basta con presionar Enter, hacer clic afuera o pasar a otra celda.
- Con el RUT listo, nombre, dirección y deuda se buscan solos en segundo plano. La deuda se revisa en una pestaña de atrás (GoExt 1.57.0) y el ejecutivo no sale de la planilla. El botón de la fila dice "Revisando…" y el resultado queda en la fila y en Observación, con la fila en neón. Si la fila no tiene compañía, se pide elegirla y al elegirla se revisa sola. Si en 2 minutos no hay resultado, se avisa que se use el botón "Revisar".
- Ficha: el teléfono de contacto es por defecto el mismo número de la fila (el número por el que se llegó al cliente). Si el ejecutivo escribe otro, se respeta.
- Ficha: Observaciones crece para mostrar todos los comentarios. Si son muchos, se desliza dentro del cuadro o se agranda arrastrando la esquina.
- Ficha: botones con nombres más claros ("Ir al Script de Cierre con este cliente", "Subir la venta al formulario", "Copiar datos del cliente para WhatsApp", "Guardar cliente en un archivo", "Cerrar esta ficha").

### 24-11-2026: GoExt 1.56.0, la deuda se lee desde "Total a pagar"

- Probado en WOM con un RUT con deuda que dio Eduardo: WOM muestra una tabla con cada cuenta y "Total a pagar", y GoExt lo lee como "tiene deuda".
- Si la página tiene una línea de total ("Total a pagar", "Total deuda", "Deuda total"), GoExt toma ese monto primero. Antes tomaba el primer monto de la tabla, que con varias cuentas no es el total. Vale para todas las compañías.

### 24-11-2026: GoExt 1.55.0, revisión de deuda en WOM arreglada

- Después de consultar, WOM lleva a otra página, pagofacilwom.cl (no es wom.cl), y GoExt no tenía permiso para leerla. Ahora sí. Probado con el RUT de prueba 11.111.111-1 (con autorización de Eduardo): WOM muestra "De este lado no tienes deudas" y GoExt lo lee como sin deuda.
- El texto de WOM cuando sí hay deuda no se pudo ver (el RUT de prueba no tiene deuda). Si no lo lee, sale el aviso "GoExt no pudo leer el resultado".

### 24-11-2026: ClaroGo! 2.20.1 y GoExt 1.54.0, "sin deuda" también queda en Observación

- Cada revisión de deuda queda anotada en Observación con su fecha y hora, también cuando no hay deuda ("✅ Deuda revisada en Entel: sin deuda").
- Si GoExt ya salió del formulario del portal y en 30 segundos no logra leer el resultado, muestra un aviso: "GoExt no pudo leer el resultado de… Revísalo en pantalla", en vez de quedar en silencio.
- Según Eduardo, la revisión funciona en Entel, Claro y Movistar. WOM sigue pendiente: falta saber a qué página lleva WOM después de consultar.

### 24-11-2026: ClaroGo! 2.20.0 y GoExt 1.53.0, fila en neón y estrella de favorito con destellos

- Después de revisar la deuda, GoExt muestra el aviso y vuelve sola a la pestaña de ClaroGo! (3 segundos si hay deuda, 2 si no). Mi Planilla lleva a la fila revisada y la deja en neón celeste hasta el primer clic (o 30 segundos).
- "Ver fila" de un agendado también deja la fila en neón y la centra en la pantalla.
- La estrella de favorito es más grande y más fácil de presionar. Al marcar un cliente como favorito salen estrellas doradas destellando por toda la pantalla (no se muestran si Windows tiene las animaciones reducidas).

### 24-11-2026: GoExt 1.52.0 y ClaroGo! 2.19.1, actualización guiada para quienes usan el .zip

- La página de actualización sigue intentando primero el actualizador del escritorio (instalador .bat), igual que antes. Si en 10 segundos no responde, o si ese PC ya se actualizó antes con el .zip, muestra una guía: el botón "Descargar GoExt" baja goext.zip a Descargas (siempre con el mismo nombre, reemplazando el anterior) y abre la carpeta con el archivo marcado; luego Extraer todo → Extraer → Reemplazar. La página espera hasta 15 minutos y activa la versión nueva sola.
- GoExt pide el permiso "downloads" para eso.
- Se probó que una extensión no puede reemplazar sus propios archivos: Edge marca como peligrosos los .js descargados por una extensión. Por eso la extracción del .zip la sigue haciendo el ejecutivo.
- Sección Descargas: nuevo texto de "Para actualizar" del .zip.
- Quienes tengan una versión anterior a la 1.52.0 instalada con el .zip deben actualizar esta vez a mano.

### 24-11-2026: ClaroGo! 2.19.0 y GoExt 1.51.0, deuda anotada en Observación y arreglo de Claro y WOM

- Cuando GoExt detecta deuda, Mi Planilla agrega al tiro en Observación una línea con la fecha y hora de la revisión, por ejemplo "⚠️ Deuda revisada en WOM: tiene deuda de $25.990". Una sola vez por revisión. Sin deuda no se anota nada.
- Claro (Cloudflare) y WOM (reCAPTCHA) tienen una verificación de seguridad que habilita el botón sola. GoExt antes forzaba el botón antes de que terminara y el portal rechazaba la consulta. Ahora escribe el RUT, espera hasta 3 minutos a que el portal habilite el botón (si aparece una casilla, la marca el ejecutivo) y recién ahí lo presiona. Entel y Movistar siguen igual.

### 24-11-2026: ClaroGo! 2.18.1, botones de la planilla otra vez en una sola fila

- Los botones de cada fila (WhatsApp, Genesys, Copiar, Ficha, RUTIFICADOR, Script y Borrar) vuelven a ir en una sola fila con su texto, como antes. En dos filas no se entendía qué hacía cada uno.
- Dirección y Observación se reparten en partes iguales el espacio que queda.

### 24-11-2026: ClaroGo! 2.18.0, Mi Planilla ordenada en dos líneas

- Cada fila usa dos líneas para que todo calce sin apretarse: Fecha con Hora abajo, Nombre con los nombres arriba y los apellidos abajo, Dirección en dos líneas, Teléfono con Compañía abajo y Tipificación con Plan abajo. Los títulos de la tabla muestran las dos etiquetas.
- Los botones de cada fila van en dos filas (WhatsApp, Genesys, Copiar y Ficha arriba; RUTIFICADOR, Script y Borrar abajo), sin quitar ningún texto.
- La columna "Notas" ahora se llama "Observación" y se ve en dos líneas con el espacio que quedó libre.
- Los anchos de columna que se habían arrastrado con el diseño anterior se reinician (se guardan con otro nombre).

### 24-11-2026: ClaroGo! 2.17.1, hora debajo de la fecha en Mi Planilla

- La hora va en la segunda línea de la celda Fecha (se puede editar ahí mismo) y la columna Hora ya no se muestra. Su espacio queda para Notas en todos los tamaños de pantalla.

### 24-11-2026: ClaroGo! 2.17.0, notas siempre a la vista en Mi Planilla

- La columna Notas ya no se oculta en pantallas de hasta 1500 px (por ejemplo 1366 px). Para darle espacio, Dirección quedó en 70 px y se achicaron un poco Nombre, Fecha, RUT, Teléfono, Compañía, Tipificación, Plan y Agendar. En pantallas grandes, Dirección pasó de 260 a 170 px.
- La celda de Notas muestra solo el texto de los comentarios, separados por " · ". Las líneas de fecha y hora siguen guardadas y se ven al pasar el mouse o al abrir el editor.

### 24-11-2026: GoExt 1.50.0, aviso de tipificación más corto

- El aviso "¡Tipificado por GoExt correctamente!" dura la mitad (antes unos 3 segundos antes de desvanecerse, ahora 1,6) y la vuelta a Genesys ocurre a la mitad del tiempo (2,2 segundos en vez de 4,4). Lo mismo para el aviso de venta enviada y la notificación de respaldo.

### 24-11-2026: GoExt 1.49.0, no venta siempre con "NO" marcado

- En el formulario de no venta, GoExt hace clic directamente en "No" de "CLIENTE EVALUADO" (primera hoja) y en "NO" de "CLIENTE NO EVALUADO" (segunda hoja) cuando están sin marcar. Antes dependía solo de la dirección del formulario y Google a veces no lo aplicaba en la segunda hoja.

### 24-11-2026: GoExt 1.48.0, actualización obligatoria con aviso elegante

- Caso: algunos ejecutivos no actualizaban con el botón amarillo.
- Si hay una versión nueva (descargada o en internet), al abrir la ventanita aparece un aviso al centro que la tapa: ícono G!, "Hay una versión nueva de GoExt", flecha amarilla animada y el botón amarillo "Actualizar ahora".
- Se puede postergar 10 minutos, solo 2 veces por versión (para no trabar una llamada en curso). Después ya no se puede seguir sin actualizar.
- Voz suave y corta (voz natural en español de Windows/Edge, de preferencia de Chile, volumen 70 %): "Hay una nueva versión de GoExt. Actualízala con el botón amarillo." Suena como máximo una vez cada 2 horas por versión.

### 24-11-2026: GoExt 1.47.0, el neón va en el botón "Listo" de Genesys

- Captura de Eduardo: en "Códigos de conclusión" de Genesys el botón para terminar se llama **"Listo"**, no "Enviar". GoExt solo buscaba "Enviar" y por eso el neón no aparecía. Ahora reconoce "Listo" (y también "Enviar", "Done" y "Submit").

### 24-11-2026: GoExt 1.46.0, neón en Enviar de Genesys hasta que lo presionen

- Al volver a Genesys después del registro de no venta, el neón del botón Enviar ya no se apaga a los 2 minutos: queda encendido hasta que el ejecutivo presiona Enviar. Cada medio segundo GoExt revisa el botón y, si Genesys lo redibujó, le vuelve a poner el brillo. También se apaga si el recuadro de tipificación se cierra (Genesys ya registró el envío) o si el botón no aparece en 3 minutos.

### 24-11-2026: ClaroGo! v2.16.1, calce de tipificaciones con Genesys

- Regla de Eduardo: **nunca se elimina ninguna tipificación**. Se mantienen las 12 de Mi Planilla y los 25 códigos de Genesys.
- Calce aprobado (`TIPIF_EQUIV`): Venta → Venta Outbound; Volver a llamar → Volver a llamar (cliente no acepta, pero le interesa); Pendiente validación, volver a llamar → Agendado / Pre-Cierre; Buzón de voz y No contesta → Buzón de Voz; Mudo o corta llamada → Mudo / Sin Audio; No interesado → Rechazo/Conformidad con su compañía actual; No molestar → Cliente no desea que lo vuelvan a llamar (No Molestar); Ya es cliente Claro → YA ES CLIENTE; Rechazo de evaluación → No Venta / Deuda > $14.000; Número equivocado → Rechazo/No es el titular de la linea; Otro sin código.
- En los menús, cada tipificación de la planilla muestra su código de Genesys al lado (se guarda la misma tipificación de siempre). Al filtrar por un código de Genesys también aparecen las filas con su equivalente de la planilla.

### 24-11-2026: GoExt 1.45.0, una sola pestaña del formulario de no venta

- Caso: seguían abriéndose pestañas nuevas del registro de no venta. Con sesión de Google iniciada, el formulario queda en `docs.google.com/forms/u/0/d/e/...` (con /u/0/ o /u/1/) y GoExt solo buscaba `docs.google.com/forms/d/e/...`, así que no reconocía la pestaña ya abierta.
- Ahora GoExt busca la pestaña por el código del formulario en cualquier forma de la dirección y la reutiliza. Lo mismo para el formulario de venta, el aviso al enviar y el script que trabaja dentro del formulario (manifiesto con los patrones `/forms/u/*/d/e/...`).

### 24-11-2026: ClaroGo! v2.16.0, códigos de Genesys en la planilla

- El menú de tipificación de Mi Planilla (y el filtro de arriba) suma el grupo "Códigos de Genesys" con los 25 códigos de conclusión tal como aparecen en Genesys (lista enviada por Eduardo). Se mantienen las 12 tipificaciones propias de la planilla; los valores ya guardados no cambian. GoExt ya tenía los 25 códigos.
- Los códigos de venta de Genesys (Venta Outbound, Venta + Equipo Outbound, Venta Referido Outbound) cuentan como venta (fila verde, primeros en Ingreso de Venta). "Rechazo/…", "No Venta/…", "No Molestar" y "YA ES CLIENTE" van en rojo. "Agendado / Pre-Cierre" y "Volver a llamar (…)" abren la agenda, como "Volver a llamar".

### 20-11-2026: ClaroGo! v2.15.1, volver a la planilla desde el Script

- El aviso de arriba del Script trae siempre el botón rojo "← Volver a Mi Planilla". Sin cliente vinculado lleva a la planilla; con cliente vinculado abre su ficha (antes solo existía "Ver en la planilla" con cliente vinculado).

### 20-11-2026: ClaroGo! v2.15.0, comentarios con fecha y Script con módulos

- **Comentarios con fecha y hora:** todo comentario nuevo lleva antes una línea "📅 DD-MM-AAAA HH:MM" con el momento en que se escribió: columna Notas (editor ampliado), Observaciones de la ficha, botones de observación rápida, "Oferta enviada por WhatsApp" y el comentario que llega desde GoExt. Si se corrige algo en medio de un comentario, se respeta tal cual.
- **Retroactivo:** los comentarios guardados sin fecha reciben la fecha y hora del registro del cliente; cada "Oferta enviada por WhatsApp ... a las HH:MM" queda en su propia línea con esa hora. Se aplica al abrir la planilla, al importar y al combinar con el archivo.
- **Script de Cierre:** "Datos de la venta" usa los mismos módulos, orden y colores que la ficha de Mi Planilla: Cliente (azul), Venta (verde, con "📱 Números a portar": línea 1 con su plan y precio, adicionales con su plan de adicional), Equipo (morado, solo si aplica) y Despacho (naranjo). Los campos internos no cambiaron, así que la sincronización con la planilla sigue igual.
- Datos críticos del Script con asterisco rojo (*): nombre, RUT, fecha de nacimiento, correo, teléfono de contacto, validación enviada por, tipo de venta, número a portar y plan de la línea 1, calle, número, comuna, región, tiempo de despacho y nombre del ejecutivo. Son una guía: se puede avanzar sin ellos.

### 20-11-2026: ClaroGo! v2.14.0, Horario Ejecutivos en el teléfono

- En el teléfono ya no se ocultan los días: la tabla muestra la semana completa, se desliza hacia el lado y el nombre del ejecutivo queda fijo a la izquierda.
- Teléfono vertical: al entrar a Horario se pone en pantalla completa y horizontal (Android con Chrome o Edge; usa `screen.orientation.lock`). En iPhone el navegador no lo permite: aparece el aviso "Gira el teléfono" con el botón "↻ Ver en horizontal". Al salir de Horario vuelve a la normalidad.
- Teléfono horizontal: la semana completa cabe en pantalla; el menú rojo se va al deslizar y se esconden los botones flotantes solo en esta sección. En el computador no cambia nada.

### 20-11-2026: guía de migración a un computador nuevo

- `MIGRACION.md`: cómo respaldar, instalar Git, conectarse a GitHub (código de dispositivo), poner al día el repo, instalar y actualizar GoExt, recuperar Mi Planilla, recrear accesos del escritorio, publicar cambios, reglas aprendidas, pendientes e historial con fechas. `CLAUDE.md` avisa leerla primero.
- `herramientas/` suma `armar-zip.ps1`, `login-github.ps1` (sin rutas fijas del PC), `servidor-prueba.ps1`, `leer-formulario.ps1` e `imagen-goext.ps1`, que antes estaban solo en carpetas temporales.

### 19-11-2026: ClaroGo! v2.13.1, números a portar solo en Venta

- Pedido de Eduardo: los números a portar no pueden estar en dos módulos. Ahora "📱 Números a portar" va solo dentro del módulo verde Venta (línea 1 con su plan y precio, adicionales con su plan de adicional). Cliente queda solo con el teléfono de contacto. Ya no hay rectángulo aparte.
- Se quitó "Oferta de la campaña (Genesys)" de la ficha (el dato se sigue guardando).

### 19-11-2026: ClaroGo! v2.13.0, módulo "Números a portar"

- Ficha del cliente: módulo propio "📱 Números a portar", primero y a lo ancho, aparte del teléfono de contacto (que sigue en Cliente). Línea 1 con su número, su plan (para elegir) y su precio; debajo cada línea adicional con su número y, al lado, su plan de adicional y precio. "+ Agregar línea" y ✕ para quitar. Muestra cuántas líneas son.
- Se quitaron "Número a portar" de Cliente y "Líneas adicionales" de Venta para que no estén repetidos. Cambiar el plan en el módulo actualiza la columna Plan de la fila y los precios.

### 19-11-2026: GoExt 1.44.0, sin apertura automática

- Pedido de Eduardo: se elimina la apertura automática de GoExt al entrar una llamada (la ventana aparte se montaba sobre todo y aparecía en la barra de tareas). GoExt se abre solo de forma manual: ícono o Alt+Shift+G. Se quitó la casilla "Abrir GoExt sola".
- La alerta "LLAMADA CORTADA" ya no es una ventana: es un recuadro rojo dentro de la pestaña que se está mirando (Genesys, ClaroGo!, WhatsApp, etc.), que no bloquea los clics y se desvanece con el mouse o el teclado. Si GoExt no puede dibujar en esa pestaña, queda una notificación de Windows. Al abrir GoExt con el ícono en los 2 minutos siguientes, el motivo "Corte de llamado" aparece listo.
- Se borraron `cortada.html` y `cortada.js`. `llamada.js` sigue, solo para anotar la hora de la llamada y revisar si hay versión nueva.

### 19-11-2026: GoExt 1.43.0, la ventanita sí aparece al entrar la llamada

- Caso: la ventanita no se abría al entrar una llamada.
- El vigilante de llamadas (`llamada.js`) solo llegaba a las pestañas de Genesys cargadas después de instalar o actualizar GoExt. Ahora se conecta solo a las pestañas de Genesys ya abiertas (al instalar, al actualizar y al abrir el navegador), sin recargar.
- Si el navegador no deja abrir la ventanita sola (`chrome.action.openPopup`), GoExt la abre como ventana propia arriba a la derecha (`popup.html?sola=1`). Lo mismo después de la alerta de llamada cortada.

### 19-11-2026: ClaroGo! v2.12.2 y GoExt 1.42.0, GoExt se actualiza sola

- Por qué Eduardo dejó de ver el aviso: después de cada publicación se ejecutaba el actualizador en su PC para comprobar, así su carpeta ya estaba al día. Ya no se hace: Eduardo actualiza igual que sus compañeros.
- El instalador programa la tarea de Windows del usuario "GoExt actualizar" (sin administrador): cada 2 horas ejecuta `goext-silencioso.vbs`, que corre el actualizador sin abrir ventanas (`/silencioso`: sin mensajes, sin portapapeles, sin accesos). Al abrir el navegador, GoExt parte con la versión nueva.
- GoExt avisa con una notificación de Windows al abrir el navegador y con las llamadas (máximo cada 2 horas): "GoExt X está lista: clic para activarla" (si ya está en la carpeta) o "Hay una versión nueva: clic para actualizar". No se reactiva sola en medio del día para no cortar el seguimiento de una llamada.
- Para pruebas, la variable `GOEXT_BASE` hace que el instalador use otra carpeta y otra tarea, sin tocar la instalación real.

### 19-11-2026: GoExt 1.41.0, alerta de llamada cortada

- Cuando termina una llamada, Genesys muestra la tipificación (recuadro `acw-gadgets-wrap-up`). `llamada.js` detecta cuando ese recuadro se hace visible y avisa al fondo. También detecta si el ejecutivo presionó el botón Desconectar.
- Si no fue el ejecutivo (no presionó Desconectar en los últimos 8 segundos), se abre al centro de la ventana una alerta roja "📵 LLAMADA CORTADA" (`cortada.html`, ventana emergente encima de cualquier pestaña). Se desvanece al mover el mouse, hacer clic, usar la rueda o presionar una tecla (después de 0,9 s), o sola a los 10 segundos.
- Al cerrarse, GoExt se abre con el motivo "Corte de llamado" marcado. Si el cliente cortó en los primeros 25 segundos, el código de Genesys sugerido es "Cliente Corta Llamada en saludo".
- Casilla en la ventanita: "📵 Avisar si el cliente corta la llamada" (activada por defecto).

### 19-11-2026: GoExt 1.40.0, se abre sola al entrar una llamada

- Nuevo `llamada.js` (en todos los marcos de Genesys): cada 2,5 segundos lee los cuadros del panel "Interacción de llamada" y, cuando aparece un teléfono de cliente nuevo, avisa al fondo. Solo lee, no cambia nada en Genesys.
- El fondo abre la ventanita de GoExt sola (`chrome.action.openPopup`), una vez por llamada. Si el navegador no lo permite (ventana no visible o versión antigua), muestra una notificación "📞 Llamada nueva" para abrirla con el ícono o Alt+Shift+G.
- Casilla en la ventanita: "📞 Abrir GoExt sola al entrar una llamada" (activada por defecto). La apertura manual sigue igual.
- Se quitó el mensaje "No se pudo copiar: … Document is not focused": si el navegador no deja copiar, prueba otro método y sigue sin mostrar error.

### 19-11-2026: ClaroGo! v2.12.1, oferta de cada línea al subir la venta

- Aclarado con Eduardo: el formulario de ingreso de venta se envía uno por línea, cada uno con su plan normal ("Plan Vendido" solo tiene Plan 500/800/1000 GB y Adulto Mayor). Que una línea es adicional se marca en el Front, donde lleva su oferta de adicional.
- La lista "Subir la venta línea por línea" muestra la oferta de cada línea: la principal con el precio del plan y las adicionales, en verde, con su precio de adicional (ADICIONALES), más el recordatorio "en el Front márcala como adicional". Plan Persona Mayor: avisa que no tiene adicionales.

### 19-11-2026: ClaroGo! v2.12.0 y GoExt 1.39.0, Rutificador automático en segundo plano

- Apenas se pega un RUT válido (columna RUT de la planilla, fila que llega de Genesys o RUT del Script), GoExt busca en el Rutificador **en segundo plano**: abre o reutiliza su pestaña sin activarla y no cambia de ventana.
- Mientras tanto, la celda del nombre muestra "⏳ Buscando en el Rutificador…" y aparece un aviso. Cuando llega, se llenan nombre y dirección, el nombre se ilumina (si se está en la planilla) y el ejecutivo no se mueve de la sección donde está. Una sola búsqueda automática por RUT; el cliente de prueba no se busca. Si en 30 segundos no responde, avisa y queda el botón RUTIFICADOR.
- El botón RUTIFICADOR de la fila sigue igual (abre el Rutificador a la vista y vuelve a la planilla).

### 19-11-2026: ClaroGo! v2.11.5, alternativa .zip a la vista

- En Descargas y en la página de instalación, la alternativa "si el computador no te deja abrir el instalador" queda completa y visible justo debajo del botón del instalador (ya no hay que hacer clic para desplegarla).

### 19-11-2026: GoExt 1.38.0, la lámina se adjunta siempre

- Desde la planilla (botón WhatsApp) y desde GoExt el envío es el mismo: mensaje y lámina. Antes la lámina solo se adjuntaba en el modo rápido; si WhatsApp Web no estaba abierto o había que recargarlo (número que no está en los contactos), salía solo el texto.
- Ahora, en esos casos, GoExt espera a que WhatsApp cargue el chat (hasta 45 segundos) y pega la lámina como imagen (`soloLamina` / `laminaAlCargar` en fondo.js). Si WhatsApp no la acepta, avisa que está copiada para Ctrl+V.
- El .zip sigue siendo solo una alternativa opcional para cuando Windows bloquea el instalador; el instalador .bat es el camino principal.

### 19-11-2026: ClaroGo! v2.11.4 y GoExt 1.37.0, instalar sin instalador

- Caso: en Windows 11 el **Control inteligente de aplicaciones** bloquea el instalador .bat porque no tiene firma digital. No se debe desactivar.
- Descargas y la página de instalación tienen ahora "¿El computador bloquea el instalador?": descargar GoExt en .zip (se guarda como `goext.zip`), Extraer todo, y Cargar desempaquetada la carpeta `Descargas\goext`. Para actualizar: Extraer todo el .zip nuevo en esa misma carpeta, Reemplazar, y "Activar versión nueva".
- La pestaña de actualización de GoExt, si el actualizador no responde, ofrece el .zip y espera la versión nueva para activarla sola.
- Pendiente para una solución definitiva: publicar GoExt en la tienda de complementos de Edge (se instala con un clic, se actualiza sola y no la bloquea Windows). Requiere una cuenta de Microsoft Partner Center de Eduardo.

### 19-11-2026: ClaroGo! v2.11.3, enlace para compartir GoExt

- Enlace para WhatsApp: **https://cotizadora.github.io/clarogo/goext/**. Su vista previa es `goext/goext-invitacion.png` (1200×630, estilo de la imagen de ClaroGo!, ícono G! y "ClaroGo! funciona mucho mejor con GoExt") y al abrirlo lleva a ClaroGo! #descargas.
- Descargas: en Chrome el botón Copiar muestra y copia `chrome://extensions` (antes siempre copiaba `edge://extensions`, que no abre en Chrome).

### 19-11-2026: ClaroGo! v2.11.2 y GoExt 1.36.0, actualizar con un clic

- El instalador registra, solo para el usuario y sin administrador, el enlace `goext://` (HKCU\Software\Classes\goext) que ejecuta `Documentos\ClaroGo\actualizar-clarogo.bat`.
- En GoExt, el aviso de versión nueva ahora dice "⬇ Actualizar a X.Y.Z": abre `actualizar.html`, que lanza `goext://actualizar`, revisa cada 2 segundos la versión de la carpeta y recarga GoExt sola cuando llega la nueva. La primera vez el navegador pregunta si abre el actualizador ("Permitir siempre").
- Si el PC tiene un instalador antiguo (sin el enlace), la página explica que hay que usar "Actualizar GoExt" del escritorio una vez; desde ahí queda el enlace.
- Archivos nuevos en la extensión: `actualizar.html` y `actualizar.js` (agregados a `ext/extension-archivos.txt`). Probado en el PC de Eduardo: abrir `goext://actualizar` ejecuta el actualizador.

### 19-11-2026: ClaroGo! v2.11.1 y GoExt 1.35.0, la lámina llega a WhatsApp

- Problema: en un PC donde GoExt se instaló con ClaroGo! ya abierto, WhatsApp salía solo con el texto. ClaroGo! manda las láminas a GoExt solo al cargar la página, así que GoExt nunca las recibía.
- Ahora, apenas GoExt se conecta a una pestaña de ClaroGo! ya abierta, la página le reenvía nombre, mensaje y láminas (`clarogo-ext-hola`). Además, si al abrir WhatsApp a GoExt le faltan láminas, se las pide directo a ClaroGo! (`window.clarogoLaminasWA`).
- Si WhatsApp Web no acepta pegar la imagen, aparece un aviso de Windows: la lámina ya está copiada y se pega con Ctrl+V.

### 19-11-2026: ClaroGo! v2.11.0, sección Descargas

- La sección de MuteReal pasa a ser **Descargas** (#descargas; el enlace antiguo #mute lleva ahí). Tiene dos bloques: **GoExt** (destacado: "ClaroGo! funciona mucho mejor con GoExt", botón del instalador, pasos para instalar con botones de copiar y cómo actualizar, enlace a la guía completa) y **MuteReal**.
- La franja roja del inicio y el menú llevan a Descargas.
- Tutoriales: tarjeta nueva "Instalar y actualizar GoExt" que abre la guía de instalación (ext/).

### 19-11-2026: ClaroGo! v2.10.1 y extensión 1.34.0, la extensión se llama GoExt

- Nombres: **ClaroGo!** es la página y **GoExt** es la extensión (antes "ClaroGo! Genesys"). Cambiado en el manifiesto, la ventanita, el Historial, los avisos de deuda, Rutificador y formularios, la página de instalación, la guía antigua, la página de privacidad y los textos de ClaroGo!.
- El acceso del escritorio ahora se llama **Actualizar GoExt**. El instalador borra el antiguo "Actualizar ClaroGo!" para que no queden dos. El archivo del instalador sigue siendo `ext/instalar-clarogo.bat` porque los accesos ya instalados lo buscan por ese nombre.
- Sin cambiar: el script de Tampermonkey (`ext/clarogo-genesys.user.js`, opción antigua).

### 18-11-2026: extensión 1.33.0, el formulario de venta no toca Genesys

- El formulario de **venta** es un trámite administrativo que se hace después de cerrar y tipificar en Genesys: al enviarlo solo aparece la animación "¡Formulario de venta enviado!". Si quedan líneas de la misma venta, vuelve a ClaroGo! para la siguiente; con la última se queda ahí. Ya no lleva a Genesys ni enciende el neón.
- El registro de **no venta** sigue igual: animación, vuelta a Genesys y neón en Enviar.

### 18-11-2026: ClaroGo! v2.10.0 y extensión 1.32.0, varias líneas

- **Subir la venta línea por línea:** el formulario de venta se envía una vez por número. Si el cliente tiene más de una línea, "Subir venta" (ficha, Ingreso de Venta) abre la lista de líneas: cada una abre el formulario con su número en "número a portar", siempre en la misma pestaña, y queda marcada en verde. El botón rojo abre la siguiente pendiente.
- **Agregar líneas fácil:** en la ficha y en el Script, un cuadro por número con "+ Agregar línea" y ✕ para quitar. Pegar varios números de una vez los separa solos (quita el 56). Se guarda en el mismo dato de siempre (`adic`), así planilla, Script y extensión siguen conectados. La línea 1 es el número a portar.
- **Extensión:** mientras queden líneas por subir, después de enviar cada formulario vuelve a ClaroGo! para la siguiente; con la última va a Genesys con el neón en Enviar.
- **Cliente de prueba:** botón "🧪 Cliente de prueba (6 líneas)" en Mi Planilla. Crea "PRUEBA NO ENVIAR" con 6 números distintos para ver el flujo; el formulario muestra un aviso para no enviarlo.

### 18-11-2026: ClaroGo! v2.9.0, sección MuteReal

- Sección nueva **MuteReal** (#mute): programa de Eduardo para Windows que muestra si el micrófono está realmente silenciado. Botón grande de descarga (`descargas/MuteReal.exe`), qué hace y cómo usarlo.
- Destacada en el inicio de PC con una franja roja sobre los botones; en celular aparece como botón con la etiqueta "Importante". También está en el menú superior.

### 18-11-2026: ClaroGo! v2.8.2, Script y planilla siempre al día

- Planilla → Script: si la fila vinculada cambia (editada en la planilla, con el Rutificador, desde la extensión o en otra pestaña), el Script de Cierre toma los datos nuevos al entrar o apenas llegan. No se toca mientras se escribe en el Script.
- Script → planilla ya funcionaba: todo lo escrito en el Script queda en la fila y la extensión recibe la planilla al día en cada guardado.
- Dirección corregida a mano en la columna Dirección: reemplaza la que estaba separada en calle, número, comuna y región, así el Script y el formulario de venta usan la nueva.

### 18-11-2026: ClaroGo! v2.8.1 y extensión 1.31.0

- Mi Planilla: la dirección pasa a su propia columna **Dirección**, después de Nombre, editable (por si el Rutificador no la trae al día). Es el mismo dato que el campo Dirección de la ficha. Reemplaza la línea bajo el nombre de la v2.8.0.
- Deuda: el resultado en el portal de pago sale como aviso grande arriba al centro, rojo "TIENE DEUDA" con el monto o verde "SIN DEUDA". En la planilla el botón "Sin deuda" ahora es verde sólido (el de "Con deuda" ya era rojo).
- Menos pestañas: los portales de deuda se abren siempre en la misma pestaña, el formulario de ingreso de venta reutiliza su pestaña y la extensión reutiliza la pestaña del registro de no venta si ya está abierta.

### 18-11-2026: ClaroGo! v2.8.0 y extensión 1.30.0

- Extensión: después de enviar el formulario de **ingreso de venta** también aparece la animación y luego vuelve a Genesys con el botón Enviar en neón (antes solo pasaba con el registro de no venta).
- Mi Planilla: la dirección del cliente (por ejemplo la que trae el Rutificador) se ve bajo el nombre en una sola línea: calle número, comuna, región. Completa al pasar el mouse. La columna Nombre es más ancha; en pantallas de hasta 1500 px se oculta la hora (sigue en la ficha) para que todo quepa.

### 18-11-2026: acceso "Actualizar ClaroGo!" y página para PC

- El instalador deja el acceso "Actualizar ClaroGo!" en el escritorio (también si el escritorio está en OneDrive). Ese acceso baja siempre el instalador más nuevo y lo ejecuta.
- La página https://cotizadora.github.io/clarogo/ext/ es más grande, pensada para PC, y tiene un tercer paso que explica cómo actualizar.

### 18-11-2026: instalación simple de la extensión

- Página nueva https://cotizadora.github.io/clarogo/ext/ con dos pasos: descargar el instalador y elegir Edge o Chrome.
- `ext/instalar-clarogo.bat` rehecho: una sola descarga (el zip), reemplaza todos los archivos en `Documentos\ClaroGo\extension`, no abre ventanas y se cierra solo. Tarda alrededor de un segundo.
- `.gitattributes` para que los .bat se publiquen con saltos de línea de Windows.

### 18-11-2026: ClaroGo! v2.7.4, inicio más ordenado

- Inicio en PC: los enlaces de abajo (Canales críticos, Gestión operativa, Consultas y herramientas, ¿Tiene deuda?) tienen el mismo ancho que los botones de arriba y cada grupo va en su propio recuadro, todos de la misma altura. Canales críticos queda en una columna y el título de ¿Tiene deuda? cabe en una línea.

### 18-11-2026: ClaroGo! v2.7.3 y extensión 1.29.0

- Extensión: después de la animación "¡Tipificado por ClaroGo! correctamente!" vuelve sola a la pestaña de Genesys y el botón Enviar del recuadro de conclusión brilla en neón verde hasta que el ejecutivo lo presiona (o 2 minutos). Nunca lo presiona por su cuenta. Si no encuentra el botón en 20 segundos, igual deja Genesys a la vista.
- Mi Planilla: los botones de cada fila (WhatsApp, Genesys, copiar, Ficha, Rutificador, Script y borrar) quedan separados, con bordes redondeados y un poco más altos. En pantallas de hasta 1500 px el botón Genesys muestra solo el ícono para que todo quepa sin barra lateral.

### 18-11-2026: ClaroGo! v2.7.2, importar la planilla completa

- Mi Planilla: "Importar clientes" ahora también acepta el archivo de la planilla (`ClaroGo-planilla-control.json`) y las copias automáticas descargadas, no solo la exportación de clientes en .txt. Sirve para pasar los clientes a un computador nuevo. Se suman a los que ya hay y no se borra nada.

### 18-11-2026: ClaroGo! v2.7.1 y extensión 1.28.1

- Arreglo del Rutificador: después de activar una versión nueva, la pestaña de ClaroGo! ya abierta quedaba desconectada y el Rutificador no se abría. Ahora la extensión vuelve a conectarse sola a las pestañas abiertas.
- Si aun así la extensión no responde en 1,5 segundos, ClaroGo! abre el Rutificador igual (con el RUT copiado) y avisa que hay que recargar con F5.

### 18-11-2026: ClaroGo! v2.7.0 y extensión 1.28.0

- Nueva tipificación "Pendiente validación, volver a llamar" en Mi Planilla (en verde y con la misma agenda que "Volver a llamar").
- Botón "📋 Historial" en la extensión: abre una página con todos los clientes, juntando Mi Planilla y las tipificaciones enviadas desde la extensión. Busca por teléfono, RUT, nombre o tipificación.
- La planilla se copia a la extensión en tiempo real cada vez que se guarda un cambio, así el Historial y el aviso de cliente repetido siempre tienen los datos al día.

### 18-11-2026: ClaroGo! v2.6.4 y extensión 1.27.0

- El neón del nombre dura hasta 30 segundos (se apaga al hacer clic en la celda) y el título de la pestaña de la planilla parpadea "🟢 ¡Nombre listo!" hasta que se ve.
- La extensión abre el Rutificador al lado de la planilla o reutiliza el que ya esté abierto (permiso nuevo: nombrerutyfirma.com). Con una extensión antigua, la planilla lo sigue abriendo como antes.

### 18-11-2026: ClaroGo! v2.6.3 y extensión 1.26.4

- El pedido del Rutificador pasa por el fondo de la extensión, que anota la pestaña de la planilla que lo hizo y vuelve exactamente a ella. El brillo neón solo se enciende en esa pestaña y espera a que esté a la vista.

### 18-11-2026: ClaroGo! v2.6.2 y extensión 1.26.3

- Después del Rutificador la extensión vuelve a la pestaña de Mi Planilla y la celda del nombre de esa fila se ilumina con efecto neón unos segundos.

### 18-11-2026: ClaroGo! v2.6.1

- El nombre del Rutificador (APELLIDO1 APELLIDO2 NOMBRES) se pasa a "Nombres Apellido1 Apellido2", manteniendo juntos los apellidos compuestos (de la, del, san...).

### 18-11-2026: extensión 1.26.2, Rutificador más seguro

- rutif.js espera hasta 6 segundos el pedido de la planilla, cambia a la pestaña "RUT" antes de escribir, reenvía la búsqueda si la página no cambia y muestra un sello abajo a la izquierda con el paso en que va.

### 18-11-2026: extensión 1.26.1

- Rutificador: el título "Nombre" puede venir dentro de un enlace de publicidad; ahora se busca la palabra dentro del texto de cada título. Probado con una página de resultados real guardada por Eduardo.

### 18-11-2026: ClaroGo! v2.6.0 y extensión 1.26.0, Rutificador automático

- El botón RUTIFICADOR de Mi Planilla, con la extensión, pide la búsqueda: rutif.js escribe el RUT en nombrerutyfirma.com, busca, lee Nombre, Dirección y Ciudad/Comuna del resultado y los devuelve a la fila (nombre con mayúscula inicial y dirección ordenada). Sin extensión sigue copiando el RUT y abriendo la página.
- ext/extension-archivos.txt incluye rutif.js.

### 18-11-2026: extensión 1.25.1

- "Activar versión nueva" ahora pide la recarga al fondo de la extensión y cierra la ventana antes, en vez de recargar desde la misma ventana.

### 18-11-2026: extensión 1.25.0, activar versión nueva sin ir a Extensiones

- La ventana de la extensión compara su versión con la de la carpeta: si ya se descargó una más nueva muestra "⟳ Activar versión nueva", que recarga la extensión (chrome.runtime.reload). Si en internet hay una versión más nueva, muestra "⬇ Hay versión…" con la indicación de usar el acceso directo.
- El instalador se cierra solo al terminar y explica los dos casos (primera vez y actualización).

### 18-11-2026: favorito de Extensiones

- Edge no deja que otro programa abra edge://extensions (quedaba en blanco): el instalador ya no lo intenta y explica dónde ir. La guía parte abriendo edge://extensions (o chrome://extensions) con un botón Copiar y guardándola en favoritos con Ctrl+D; para actualizar se usa ese favorito.

### 18-11-2026: guía solo de instalación y actualización

- ext/instalar.ps1 (se usa con `irm https://cotizadora.github.io/clarogo/ext/instalar.ps1 | iex`): crea Documentos\ClaroGo\extension, baja los archivos, deja Documentos\ClaroGo\actualizar.ps1 y el acceso directo "Actualizar ClaroGo!" en el escritorio, copia la ruta y abre edge://extensions.
- La guía queda solo con instalar, actualizar y problemas frecuentes, para ejecutivos sin conocimientos técnicos.

### 18-11-2026: instalación por comando (sin .bat)

- El Control Inteligente de Aplicaciones de Windows 11 bloquea el .bat descargado. La guía ahora usa un comando de PowerShell que se copia y se pega en la Terminal: descarga los archivos de la lista a Documentos\ClaroGo\extension, copia la ruta y abre edge://extensions. El .bat queda como alternativa para equipos sin ese control.

### 18-11-2026: instalador .bat y guía completa

- ext/instalar-clarogo.bat: crea Documentos\ClaroGo\extension, descarga cada archivo de la extensión desde GitHub Pages (lista en ext/extension-archivos.txt), copia la ruta al portapapeles y abre edge://extensions. Para actualizar se vuelve a ejecutar y se presiona "Volver a cargar". Al publicar una versión nueva hay que regenerar ext/extension-archivos.txt si cambian los archivos.
- ext/guia.html: guía con instalación, actualización, uso con demostraciones animadas, funciones, problemas frecuentes y una sección de Claude Code. Vista previa para WhatsApp en ext/guia-preview.png.

### 18-11-2026: extensión 1.24.0, código de conclusión en Genesys

- Segunda tipificación: al elegir un motivo de no venta se sugiere el código de conclusión de Genesys (menú "Genesys", se puede cambiar o dejar en "No marcar"). Al presionar "Tipificar en formulario" la extensión marca ese código en el recuadro Códigos de conclusión de Genesys (acw-gadgets-wrap-up) sin enviarlo; el ejecutivo lo envía en Genesys. Si el recuadro no está abierto, avisa con una notificación para marcarlo a mano.

### 18-11-2026: extensión 1.23.3, avisos compactos

- Cliente repetido en una sola línea: "🔁 Ya tipificado: motivo · fecha (N veces)"; el detalle completo al pasar el mouse. Aviso de llamada anterior más corto. La ventana cabe sin scroll aunque aparezcan los dos avisos.

### 18-11-2026: extensión 1.23.2 y guía para ejecutivos

- Corrección: después de un envío, el registro siguiente se quedaba en la primera hoja (confundía la primera hoja con la confirmación del envío anterior). Ahora solo se reconoce la confirmación en "formResponse" sin preguntas, y cada registro nuevo borra el envío anterior.
- Guía para compartir: https://cotizadora.github.io/clarogo/ext/guia.html (instalar, durante la llamada, WhatsApp, tipificar, llamada cortada, clientes repetidos y Mi Planilla).

### 18-11-2026: extensión 1.23.1, aviso final al centro

- Al enviar la tipificación aparece al centro del formulario una tarjeta con los colores del formulario de Google (morado #5746E3): carita sonriente, "¡Tipificado por ClaroGo! correctamente!" y el motivo con el teléfono. Se desvanece sola en unos 4 segundos. Si no se puede mostrar en la página, queda la notificación de Windows como respaldo.

### 18-11-2026: ClaroGo! v2.5.0 y extensión 1.23.0, historial de contactos

- La extensión guarda cada tipificación enviada (teléfono, motivo y fecha, hasta 5.000). Al leer una llamada avisa "Ya contactado N veces. Última: fecha · motivo" y manda ese historial a Mi Planilla.
- Mi Planilla cruza el teléfono con sus filas anteriores: la fila nueva queda con la marca 🔁, la ficha muestra "Contactado antes" (tipificaciones de la extensión y llamadas previas con su tipificación) y aparece un aviso. Se incluye en "Exportar clientes".
- Un solo aviso de "Tipificación enviada" por envío.

### 18-11-2026: extensión 1.22.1, aviso de envío garantizado

- "Enviar automáticamente" viene marcado por defecto; la elección de cada ejecutivo se guarda y no cambia sola.
- Al enviar la tipificación, además del aviso dentro del formulario aparece una notificación de Windows "Tipificación enviada" con el motivo y el teléfono, que se cierra sola a los 6 segundos (permiso nuevo: notificaciones).

### 18-11-2026: extensión 1.22.0, envío automático opcional

- Motivos ordenados por grupo por defecto. El botón dice "Tipificar en formulario".
- Casillas que cada ejecutivo decide y que se recuerdan: "Enviar automáticamente" (después de recorrer las respuestas, la extensión presiona Enviar) y "Avisar cuando se envíe" (aviso verde que se desvanece solo: "Tipificación enviada", con el motivo y el teléfono).

### 18-11-2026: extensión 1.21.0, motivos de no venta a la vista

- Ventana de 790 px: a la izquierda los datos de la llamada, RUT, comentario, Mi Planilla y WhatsApp; a la derecha los 16 motivos de no venta más "Otro" como botones, con colores por grupo (Seguimiento verde, Rechazo del cliente rojo, Requisitos naranjo, Llamada gris, Otro lila).
- Orden elegible y recordado: Más usados (cada uso pesa la mitad cada 14 días, así se adapta solo), A-Z o Por grupo. Cabe completa sin scroll (máximo 594 px de alto).

### 18-11-2026: extensión 1.20.1, sin panel de resumen

- Se quita el panel "Listo para enviar" con el resumen: en el formulario quedan el recorrido por las respuestas marcadas y el botón Enviar de Google parpadeando hasta que el ejecutivo lo presiona.

### 18-11-2026: extensión 1.20.0, tipificar la llamada anterior

- La extensión guarda la última llamada que leyó. Si al abrirla ya no hay llamada en Genesys (se cortó), muestra esa llamada en amarillo con el teléfono, el nombre y hace cuánto se leyó, para tipificarla o enviarla a la planilla. Solo durante 15 minutos y avisa si ya se registró la no venta de esa llamada. Si hay una llamada activa, siempre se muestra la actual.

### 18-11-2026: extensión 1.19.0, el script llega a la segunda hoja

- En la segunda hoja del registro de no venta (formResponse) Edge no activaba formas.js. Ahora fondo.js vigila la pestaña del formulario y le inyecta el script cada vez que la hoja cambia (permiso nuevo: docs.google.com/forms). El script corre una sola vez por página.

### 18-11-2026: extensión 1.18.1, sello de estado en los formularios

- Sello abajo a la izquierda en los formularios de ventas y no venta con la versión y el estado (revisando, activo, esperando la segunda hoja, listo para enviar, o por qué no actúa), para saber si la extensión está corriendo.

### 18-11-2026: extensión 1.18.0, panel "Listo para enviar" y ventana en dos columnas

- Causa del recorrido que no funcionaba: Google Forms bloquea armar HTML con texto (Trusted Types) y el script se detenía. Ahora todo se crea elemento por elemento.
- formas.js vigila la página: cuando aparece el botón Enviar (con o sin recarga) muestra un panel fijo con las respuestas llenadas, un botón "Enviar formulario" que parpadea y que solo envía si el ejecutivo lo presiona, y deja parpadeando el Enviar de Google hasta que se envía.
- Ventana de la extensión en dos columnas (620 px de ancho) para verla completa sin scroll.

### 18-11-2026: extensión 1.17.2, recorrido en la segunda hoja

- Con la sesión de Google iniciada, el formulario cambia a la segunda hoja sin recargar la página y el recorrido no partía. Ahora, después de presionar Siguiente, la extensión espera ahí mismo a que aparezca el botón Enviar y sigue con el recorrido.

### 18-11-2026: extensión 1.17.1, recorrido visible en los formularios

- El recorrido espera a que la pestaña esté a la vista, mueve la pantalla de forma directa a cada respuesta (sin depender del desplazamiento suave), la ilumina y oscurece el resto. Una lista fija abajo a la derecha muestra cada respuesta llenada y trae el botón "Ir al botón Enviar".

### 18-11-2026: extensión 1.17.0, formularios que se recorren solos

- formas.js: en el registro de no venta abierto desde la extensión, pasa solo a la segunda página. En ese formulario y en el de ventas abierto lleno desde ClaroGo!, recorre con la pantalla cada respuesta escrita, la marca en azul y termina en el botón Enviar con el aviso "Listo para enviar". Enviar lo presiona siempre el ejecutivo.

### 18-11-2026: ClaroGo! v2.4.0, fila abierta y ficha como un solo bloque

- La fila abierta y su ficha comparten el mismo fondo y un marco azul grueso alrededor de ambas.
- Módulos de la ficha con colores más intensos y bordes más marcados (Cliente azul, Venta verde, Equipo lila, Despacho naranjo, Observaciones gris).

### 18-11-2026: extensión 1.16.0, registro de no venta

- En la ventana de la extensión: "No venta: registro de atención" con los 16 motivos del formulario "Registro de atención (NO VENTA)" y "Otro (escribir)". Abre el formulario con Cliente evaluado: No, NO, el teléfono de la llamada, el motivo (o el texto de Otro), la compañía si el motivo es "conforme" o "paga menos", y el comentario como observación. El ejecutivo revisa, presiona Siguiente y Enviar.

### 18-11-2026: ClaroGo! v2.3.0, columna Agendar y ficha por módulos

- Nueva columna "Agendar" con ícono de calendario: azul si hay llamada agendada, amarillo si es hoy y rojo si está atrasada.
- Ficha del cliente: botones de acción y revisión de deuda arriba; módulos Cliente, Venta, Equipo, Despacho y Observaciones en marcos con esquinas redondeadas y fondo propio, con íconos de línea.

### 18-11-2026: ClaroGo! v2.2.0 y extensión 1.15.1

- Mi Planilla más ancha (hasta 1680 px) y filas de dos líneas. Botón de deuda con el logo arriba y el estado abajo (Revisar, Sin deuda, Con deuda).
- Extensión 1.15.1: si la planilla tarda en responder (por ejemplo recién encendido el computador) espera hasta 5 segundos, prueba cada pestaña libre y abre la nueva en segundo plano para que la ventana de la extensión no se cierre antes de entregar el cliente.

### 17-11-2026: ClaroGo! v2.1.0, número de versión visible

- La versión de ClaroGo! se ve arriba en todas las secciones, en la portada y en el pie (constante APP_VERSION). Se sube en cada cambio publicado.

### 17-11-2026: formulario de ventas lleno y exportar o importar clientes

- "📤 Subir venta al formulario" en la ficha y "Llenar con un cliente de Mi Planilla" en Ingreso de Venta: abren el formulario de Google con las respuestas escritas (enlace prellenado). Quedan para el ejecutivo: RAC Ejecutivo, Número de TRX, Tipo de Delivery y Origen Venta. Nunca se envía solo.
- "💾 Exportar cliente" (ficha) y "💾 Exportar clientes" (lista filtrada): archivo de texto legible en el celular, con los datos completos al final para importarlos. "📂 Importar clientes" los carga en otro computador (gana el registro más nuevo).

### 17-11-2026: Stock, solo pasan por el Front los equipos con más de 60 unidades

- Stock en verde si tiene más de 60 unidades y en rojo si tiene 60 o menos. Los verdes se ordenan primero.
- "Copiar lista filtrada" copia solo los equipos con más de 60 unidades. Aviso para los ejecutivos arriba de la tabla y al copiar un equipo de 60 o menos.

### 17-11-2026: Oferta PNG solo para Persona Natural con Giro

- Se quita la oferta PYME "RUT mayor a 50 millones" (otro segmento, pendiente de confirmar).
- Oferta PNG Móvil: 500 GB $7.555 monolínea y $6.716 multilínea; 800 GB $8.733 y $7.423; 1000 GB $9.071 y $8.315 (por línea, más IVA, 12 meses de descuento; multilínea desde 2 líneas; full $9.990, $12.990 y $17.990). Fuente: láminas "Oferta PNG Móvil" enviadas por Eduardo el 17-11-2026.
- La tabla de precios es la lámina oficial (ofertas/png-tabla.webp). Aviso para validar al cliente en el SII y pregunta frecuente actualizada.

### 17-11-2026: columna Deuda y RUT desde la extensión (1.15.0)

- Compañía ahora es un menú (Claro, Entel, Movistar, WOM, VTR, Virgin, Otra). Parte con la compañía que trae Genesys.
- Nueva columna Deuda al lado: botón con el logo de la compañía elegida que revisa el RUT de la fila en esa compañía. Para revisar otra, se cambia la compañía en el menú.
- Extensión 1.15.0: casilla "RUT del cliente" en la ventana; el RUT llega a la fila nueva de Mi Planilla.

### 17-11-2026: botón de deuda en cada fila

- En la columna Compañía de Mi Planilla hay un botón con el logo de la compañía del cliente para revisar su deuda, y una flecha ▾ para elegir otra compañía.
- La columna Plan muestra el plan sin la palabra "Plan" (el dato guardado no cambia).

### 17-11-2026: revisar deuda desde Mi Planilla (extensión 1.14.0)

- En la ficha del cliente, bajo "Cliente", hay botones "¿Tiene deuda?" de Claro, Entel, Movistar y WOM: copian el RUT y abren el portal de pago de esa compañía.
- Extensión 1.14.0 (deuda.js): escribe el RUT en el portal, presiona el botón y lee el resultado; muestra un aviso y lo devuelve a la fila (campo "deuda"). El captcha de cada portal lo resuelve el ejecutivo. Política de privacidad actualizada.

### 17-11-2026: accesos para revisar deuda en otras compañías

- Nuevo grupo de enlaces "¿Tiene deuda? Pago de cuentas con RUT" en el Inicio y en Enlaces: Claro (Pago Express), Entel, Movistar y WOM, con sus íconos en logos/. Los enlaces salen de los sitios oficiales de cada compañía (17-11-2026).
- El Inicio muestra los enlaces en 4 columnas.

### 17-11-2026: láminas con foto para los planes 500, 800, 1000 y 500 + Netflix

- Gráficas hechas por Eduardo con ChatGPT (prompts en herramientas/prompts-laminas.txt), guardadas en ofertas/plan-500.webp, plan-800.webp, plan-1000.webp y plan-500-netflix.webp. Precios revisados contra PLANES_VIGENTES, sin cambios de precios.
- Oferta Personas, el WhatsApp de Mi Planilla y la extensión usan estas gráficas en vez de la lámina dibujada. Para la extensión se achican a 800 px.

### 17-11-2026: extensión 1.13.1, ventana más corta

- Se quitan de la ventana de la extensión los dos textos de ayuda del final (lámina copiada y "Los datos ya quedan copiados...").

### 17-11-2026: extensión ClaroGo! Genesys para descargar

- Extensión 1.13.0 enviada a la tienda de Edge (Edge Add-ons), visibilidad oculta, en revisión. Política de privacidad en ext/privacidad.html.
- Se publica la extensión 1.13.0 como zip en ext/clarogo-genesys-extension.zip para que los compañeros la instalen con "Cargar desempaquetada".

### 17-11-2026: script ClaroGo! Genesys 2.0 (Tampermonkey)

- `ext/clarogo-genesys.user.js` 2.0.0 queda igual de completo que la extensión: botón "ClaroGo!" y panel dentro de Genesys (Alt+Shift+G), datos copiados, comentario y plan que llegan a Mi Planilla, y WhatsApp Web con el mensaje corporativo y la lámina (abre el chat sin recargar en la pestaña de WhatsApp ya abierta). Gratis, se instala desde un enlace y se actualiza solo.

### 17-11-2026: script ClaroGo! Genesys para Tampermonkey

- Nuevo `ext/clarogo-genesys.user.js` (versión 1.1.0): la misma lectura de Genesys de la extensión, instalable desde un enlace con Tampermonkey y con actualización automática. Publicado en https://cotizadora.github.io/clarogo/ext/clarogo-genesys.user.js
- Ajustes respecto del borrador: acepta pestañas de la planilla en segundo plano (antes abría una nueva cada vez), teléfono sin espacios, limpia avisos de pestañas cerradas y, si la pestaña elegida no responde en 6 segundos, abre una nueva.
- Para publicar una versión nueva: subir el número de `@version` en la cabecera y subir el archivo a `ext/` con el mismo nombre.

### 17-11-2026: Excepciones de Boletas nítida

- El cuadro de Excepciones de Boletas muestra la tabla como texto (nítida y de buen tamaño) en vez de una imagen reducida. La imagen para copiar o descargar sale más grande (1560 px de ancho), con letras más grandes y sin margen sobrante. Los montos no cambiaron.

### 17-11-2026: plan completo en la fila

- Mi Planilla: la columna Plan muestra el nombre completo del plan (hasta dos líneas, como el nombre del cliente), por ejemplo "Plan Persona Mayor" o "Plan 500 + Netflix". Se sigue eligiendo con un clic en la celda.

### 17-11-2026: notas en grande, plan y comentario desde la extensión (1.13)

- Mi Planilla: al hacer clic en la celda de Notas se abre encima un cuadro grande para leer y escribir el comentario; se guarda mientras se escribe, Enter o Esc lo cierran y Shift+Enter hace otra línea.
- Extensión 1.13: cuadro "Comentario para la planilla". Al enviar a Mi Planilla, la fila nueva llega con el plan elegido en el selector de WhatsApp y con ese comentario en Notas.
- La lámina del Plan Persona Mayor ahora se entrega en PNG, igual que las demás, porque WhatsApp no tomaba la JPG al pegarla.

### 17-11-2026: botón Ficha, sonidos y trucos

- Mi Planilla: el botón de la ficha ahora dice "▾ Ficha", es más ancho y azul, con una ola de luz que recorre las filas una tras otra para que se note que hace algo. En celular muestra solo la flecha.
- Sonido muy suave al pasar el mouse por botones y opciones que se pueden presionar. Se activa después del primer clic en la página (así lo exige el navegador) y se apaga o prende en el pie de página ("Sonidos: sí/no").
- Inicio: una línea en cursiva con un truco distinto en cada visita (22 trucos sobre las distintas secciones). Clic en ella para ver otro.

### 17-11-2026: columna Nombre con ancho fijo y hasta dos líneas

- La columna Nombre parte con 150 px (antes quedaba casi sin ancho en algunas pantallas) y Notas toma el espacio que sobra. El nombre se ve en hasta dos líneas; el completo aparece al pasar el mouse o al hacer clic en él.

### 17-11-2026: nombre completo, columnas ajustables y ficha con clic

- Mi Planilla: el nombre del cliente se ve siempre completo (si es largo, la celda crece hacia abajo). En celular, el nombre aparece debajo del teléfono.
- Ancho de columnas ajustable arrastrando el borde derecho del título; se recuerda en el navegador y doble clic en el borde vuelve al ancho original. Las columnas crecen hasta donde cabe la tabla, sin desplazamiento lateral.
- La ficha se abre o se cierra con un clic en el espacio vacío de cualquier celda, o con doble clic en un cuadro vacío o en el número de la fila (en un cuadro con texto, el doble clic sigue seleccionando la palabra).

### 17-11-2026: extensión 1.12.1, lámina sin texto repetido

- Al adjuntar la lámina, WhatsApp copiaba el mensaje como pie de la imagen y llegaba repetido. La extensión ahora vacía ese pie: la lámina va sola y el mensaje va aparte.

### 17-11-2026: trato según el género (extensión 1.12)

- Sin nombre del cliente (y siempre en la extensión) el saludo es cordial y sin "estimado(a)": "Hola, muy buenas tardes. Mi nombre es..."
- Desde la planilla, con el nombre del cliente: "estimada María" o "estimado Juan", según un diccionario de unos 600 nombres frecuentes (Chile, Latinoamérica, España y otros países) y, si no está, la terminación del nombre (-a, -o). Si no se puede saber, solo el nombre ("Hola, muy buenas tardes, Kyrie.").
- Trato manual por cliente en la ficha y en el cuadro de WhatsApp: Automático, Mujer, Hombre o Sin estimado(a). Nueva marca {trato} para el mensaje personal.

### 17-11-2026: mensaje corporativo y lámina adjunta (extensión 1.11)

- Mensaje corporativo para clientes: saludo según la hora, "estimado(a)" con el nombre del cliente si se sabe, nombre del ejecutivo y *Claro Chile* en negrita, oferta del plan y firma con nombre, cargo, *Claro Chile* y teléfono (+56 9 9796 6724 por defecto). En Inicio > Mi mensaje se cambian nombre, teléfono, presentación y firma.
- Casilla "Adjuntar la lámina del plan" en la planilla y en la extensión (se recuerda la elección). La extensión pega la lámina en el chat de WhatsApp después del mensaje (experimental); además la lámina queda copiada para pegarla con Ctrl+V si no aparece. Sin la extensión, la planilla copia la lámina para Ctrl+V.
- Extensión: se quitó el botón Copiar de nuevo y la ventanita tiene un marco con sombra para distinguirla de páginas blancas.

### 17-11-2026: copiado más ordenado

- Copiado para la supervisora: el equipo va en varias líneas (Equipo, SKU, Pie, Cuotas y Precio total).
- Dirección ordenada al terminar de escribirla: número y comuna separados por coma y mayúscula inicial en calle y comuna ("Las Zinnias 5790, Huechuraba, Región Metropolitana"), también si el número venía pegado a la comuna.
- Referencia o entrecalles con mayúscula inicial en cada palabra (salvo y, e, o, de, del) y sin espacios de más, en la ficha y en el Script.

### 17-11-2026: extensión 1.10, saludo y oferta juntos

- ClaroGo! le entrega a la extensión el detalle de cada plan junto con el nombre y el mensaje del ejecutivo. La extensión arma al instante el saludo según la hora más la oferta, con el Plan 500 elegido por defecto, y copia todo junto, aunque la pestaña de ClaroGo! esté dormida. Si ClaroGo! responde, usa sus mensajes, que saludan al cliente por su nombre si está en la planilla.

### 17-11-2026: Deshacer y Guardar

- Mi Planilla y Script de Cierre: barra fija arriba con "↶ Deshacer" (también Ctrl+Z fuera de los cuadros de texto), "💾 Guardar" y la hora del último guardado. Deshacer vuelve atrás paso a paso (hasta 60 pasos) sin perder nada: lo que se había agregado queda en Ver borrados. Guardar fuerza la copia local, el archivo y una copia automática, aunque todo ya se guarda solo con cada cambio.

### 17-11-2026: favoritos, colores por tipificación y extensión 1.9.2

- Mi Planilla: estrella al inicio de cada fila para marcar clientes favoritos, y filtro "★ Solo favoritos".
- Color de toda la fila según la tipificación: verde (Venta y Volver a llamar), amarillo (Buzón de voz, No contesta, Mudo o corta llamada, Otro) y rojo (No interesado, No molestar, Ya es cliente Claro, Rechazo de evaluación, Número equivocado).
- Extensión 1.9.2: en el modo rápido de WhatsApp, si WhatsApp borra el mensaje al terminar de cargar el chat, la extensión lo vuelve a pegar.

### 17-11-2026: equipo desde el Stock y Sin equipo

- Ficha de Mi Planilla, sección Equipo: casilla "Sin equipo" (bloquea y limpia los campos del equipo) y botón "Pegar equipo del Stock", que lee el texto del botón Copiar de Stock de Equipos y llena equipo (marca y modelo), SKU, pago inicial, forma de pago (18 cuotas de ...) y monto total. Nuevo campo SKU. El copiado para WhatsApp, la exportación y el Script usan estos datos; con Sin equipo el Script no muestra el paso del equipo.

### 17-11-2026: teléfonos sin espacios (extensión 1.9.1)

- Todos los teléfonos quedan juntos, sin espacios (por ejemplo 912345678): los que llegan de Genesys o la extensión, los que se escriben o pegan en la planilla, la ficha, el Script y el cuadro de WhatsApp. Los registros guardados antes se limpian solos al abrir la página.

### 17-11-2026: copiado rápido, Genesys y RUTIFICADOR, correo limpio

- Mi Planilla: botón 📋 en cada fila (y en la ficha) que copia los datos del cliente para WhatsApp, una línea por dato: cliente, RUT, teléfono, contacto, número a portar, nacimiento, correo, compañía, dirección, referencia, plan, líneas adicionales, tipo de venta, equipo, tipificación y observaciones (solo los que tienen información).
- Los botones de la fila muestran el nombre completo: "Genesys" junto a su ícono y "RUTIFICADOR" en negrita.
- Correo electrónico (ficha y Script): al escribir o pegar queda en minúsculas, sin espacios, con ñ cambiada por n y sin tildes.
- En pantallas de hasta 1500 px la columna Notas se oculta para dar espacio al nombre (las notas siguen en la ficha y en el copiado).

### 17-11-2026: dirección en una sola línea

- En la ficha de Mi Planilla la dirección es un solo campo, para pegarla tal como se copia ("Las Zinnias 5790 Huechuraba, Región Metropolitana"). Al pasar al Script de Cierre se separa sola en calle, número, interior, comuna y región; si se corrige en el Script, la línea de la planilla se actualiza. Las filas antiguas muestran su dirección armada en una línea. La exportación a Excel trae una sola columna Dirección.

### 17-11-2026: saludo con el nombre del cliente (extensión 1.9)

- El mensaje saluda al cliente por su primer nombre cuando la planilla lo tiene ("Hola María, muy buenos días..."); si no lo tiene, queda "Hola, muy buenos días...". Nuevas marcas para el mensaje personal: {cliente} (primer nombre) y {compania} (compañía de origen).
- La extensión busca al cliente en la planilla por su teléfono para usar su nombre; si no está, usa el nombre que traiga Genesys.

### 17-11-2026: mi nombre y mi mensaje (extensión 1.8)

- Inicio: botón "👤 Nombre · Mi mensaje" para que cada ejecutivo ponga su nombre (por defecto Eduardo Pérez) y personalice su presentación, con vista previa. {saludo} cambia solo según la hora (muy buenos días, muy buenas tardes, muy buenas noches) y {nombre} es su nombre. Se usa en WhatsApp, la planilla, el Script y la extensión.
- Al abrir WhatsApp (planilla y extensión) el mensaje completo, presentación y plan, también queda copiado para pegarlo con Ctrl+V.
- Extensión 1.8: guarda el nombre y el mensaje del ejecutivo (permiso storage) para usarlos aunque ClaroGo! no responda. El modo rápido de WhatsApp también se usa desde la planilla cuando la extensión está instalada.

### 17-11-2026: extensión 1.7.1, sin esperas trabadas

- Ninguna pestaña puede dejar la ventanita esperando: cada consulta tiene un límite de tiempo y se ignoran las pestañas dormidas de Edge. El botón de WhatsApp aparece de inmediato (con la presentación) y se completan los planes si ClaroGo! responde. Si la planilla no responde, Enviar a Mi Planilla abre una pestaña nueva.

### 17-11-2026: extensión 1.7, modo rápido de WhatsApp (experimental)

- Si WhatsApp Web ya está abierto, la extensión presiona Nuevo chat, busca el número, abre el chat solo si hay exactamente un resultado y deja el mensaje escrito, sin recargar. Si algo no calza (número que no está en tus chats o contactos, cambio en WhatsApp), recarga la pestaña como antes. El mensaje nunca se envía solo.

### 17-11-2026: Plan Persona Mayor, agenda de llamadas y mensaje de WhatsApp

- Oferta Personas: nueva fila con el Plan Persona Mayor (50 GB, 1.000 minutos y 500 SMS a todo destino, $4.990 por 12 meses y luego $6.990, solo Portabilidad PosPos). Fuente: gráfica enviada por Eduardo el 17-11-2026, guardada en `ofertas/plan-persona-mayor.webp`. Se puede ver en grande, copiar la gráfica y copiar el texto. Va aparte de los planes 5G: no entra a la calculadora ni al Script.
- WhatsApp (planilla y extensión 1.6): el mensaje parte con la presentación del ejecutivo ("Hola, muy buen día, mi nombre es ... Tal como conversamos telefónicamente, le envío la propuesta por este medio. Estoy a su disposición para aclarar cualquiera de las dudas.") y el Plan 500 por defecto. En la planilla se puede cambiar el plan (incluye Persona Mayor) y el nombre antes de enviar.
- Mi Planilla parte siempre sin filtros (todo el historial), aunque el navegador intente recordar los anteriores.
- Agenda de llamadas: botón ⏰ en cada fila (y se ofrece al tipificar Volver a llamar) con día, hora, atajos y observación. A la hora suena un aviso suave (una sola pestaña lo hace sonar), aparece un reloj rojo parpadeando abajo a la izquierda en todas las secciones y el título de la pestaña avisa. Se repite cada 10 minutos hasta marcar Ya llamé. Panel de agenda en la planilla con atrasados, +15 min, Cambiar y Ya llamé. La agenda se exporta a Excel.

### 17-11-2026: ícono de Genesys

- El botón 📞 de cada fila y el botón Pegar desde Genesys usan ahora un ícono naranjo simple que recuerda a Genesys (dibujado para ClaroGo!, no es el logo oficial).

### 17-11-2026: todo el historial por defecto y extensión 1.5

- Mi Planilla abre siempre con Todo el historial a la vista.
- Extensión 1.5: el botón WhatsApp Web abre la pestaña directamente desde la ventanita, sin depender del proceso de fondo. Reutiliza la pestaña de WhatsApp Web abierta o abre una nueva.

### 17-11-2026: aviso de registros de otros días

- Si el período elegido (por ejemplo Hoy) no tiene llamadas pero hay registros de otros días, Mi Planilla lo dice con la cantidad y ofrece botones para ver todo el historial o los últimos 7 días. Los registros no se habían borrado: el filtro Hoy los ocultaba.

### 17-11-2026: extensión 1.4, funciona desde cualquier pestaña

- La extensión busca la pestaña de Genesys aunque estés mirando otra (en cualquier ventana). Prefiere la que estás mirando si es Genesys; si no, la usada más recientemente que traiga teléfono.
- La ventanita muestra arriba la versión instalada.

### 17-11-2026: extensión 1.3, versión visible

- La ventanita de la extensión muestra arriba la versión instalada (por ejemplo v1.3.0), para ver de inmediato si se actualizó.

### 17-11-2026: WhatsApp Web con la oferta

- Mi Planilla: botón de WhatsApp en cada fila. Abre un cuadro para elegir el plan (por defecto el de la fila o el Plan 800), revisar el mensaje (saludo con el nombre del cliente y del ejecutivo, más el detalle del plan) y abrir WhatsApp Web con ese cliente. Anota en Observaciones la hora y el plan enviado.
- Extensión 1.2: botón WhatsApp Web en la ventanita, con los mensajes de los planes tomados de ClaroGo!. Reutiliza la pestaña de WhatsApp Web que ya esté abierta (la más antigua) y si no hay, abre una nueva. Con la extensión instalada, el botón de la planilla también reutiliza esa pestaña. Sin la extensión, la planilla usa siempre la misma pestaña que abrió.

### 16-11-2026: extensión 1.1, elige la pestaña de la planilla

- Al enviar a Mi Planilla, la extensión usa la pestaña de ClaroGo! más antigua que ya esté en la planilla; si no hay, la más antigua que esté en otra sección libre (inicio, galería, etc.) y la lleva a la planilla. Las pestañas en Oferta, PNG, Stock o Script no se tocan: en ese caso abre una pestaña nueva en la planilla. Si la pestaña no responde, abre una nueva desde cero. Siempre termina mostrando la planilla.

### 16-11-2026: Compañía de origen en la vista simple

- Mi Planilla muestra siempre la columna Compañía (de origen) en la fila, sin abrir la ficha. Se ajustaron los anchos: en PC chico se ocultan Hora, Plan y Notas (siguen en la ficha), y en celular se ven Teléfono, Compañía y Tipificación.

### 16-11-2026: extensión ClaroGo! Genesys

- En Genesys los datos del cliente (FONO_CONTACTO, RUT_PERSONA, etc.) están dentro de cuadros de texto, y Ctrl+A no copia lo escrito en ellos. Nueva extensión para Chrome y Edge en la carpeta `extension/`: con un clic en su ícono (o Alt+Shift+G) lee esos cuadros en la llamada, copia los datos y puede enviarlos a Mi Planilla como fila nueva.
- Mi Planilla recibe los datos de la extensión con `window.clarogoDesdeGenesys`.
- Instalación: en chrome://extensions o edge://extensions activar Modo de desarrollador, Cargar descomprimida y elegir la carpeta `extension` (en el PC de Eduardo: Documentos\CLARO\ClaroGo\extension-genesys). Luego fijar el ícono con el botón de extensiones.

### 16-11-2026: lectura de Genesys con Ctrl+A en la llamada

- La planilla ahora lee el texto que copia Ctrl+A y Ctrl+C en una llamada en línea de Genesys (campos CLAVE: y valor). El teléfono sale de FONO_CONTACTO (o Fono1, Fono2, LEGACY_ID). También toma RUT_PERSONA y FIRST/SECOND/THIRD_NAME cuando vienen, la campaña (vNombre_Campana), la compañía de origen (Segment_of_Origin), la oferta de la campaña (Glosa_Descripcion) y la fecha (vContactDate). Los campos vacíos, que Genesys copia con su propio nombre, se ignoran.
- Se dejó de leer el HTML del portapapeles, que traía un número fijo que no era del cliente. Se quitó la opción del archivo guardado.
- Pegar desde Genesys (arriba) crea siempre una fila nueva. El botón 📞 de una fila reemplaza su teléfono por el copiado y completa lo que falte.
- La ficha suma Compañía de origen y Oferta de la campaña, y se exportan a Excel.

### 16-11-2026: botón Genesys en cada fila

- Cada fila de Mi Planilla tiene el botón 📞, siempre visible sin abrir la ficha: pega en esa fila los datos que traiga lo copiado de Genesys (hoy, el teléfono). Solo llena lo vacío y nunca reemplaza lo que ya está escrito.
- Pegar desde Genesys ya no abre la ficha. Se abre solo cuando se presiona ▾.

### 16-11-2026: teléfono desde Genesys

- Genesys guarda el teléfono solo en una etiqueta oculta (la que aparece al pasar el mouse sobre "Mobile Number, Chile"), que Ctrl+A y Ctrl+C no copian como texto. Ahora la planilla lee también el formato HTML que se copia junto al texto, y de ahí saca el teléfono.
- Nuevo botón "Elegir archivo de Genesys" en el cuadro de pegar, para usar la página guardada con Ctrl+S.
- La hora de conexión se lee también en formato de 24 horas.
- Probado con una página real de Genesys enviada por Eduardo (no se guardó en el repositorio).

### 16-11-2026: títulos fijos en la tabla de Stock

- En Stock de Equipos, al bajar por los resultados la fila negra de títulos (Modelo, SKU, Marca, Pie, Cuotas, Total, Stock) queda fija bajo el menú. En celular la tabla se muestra como tarjetas con sus etiquetas, como antes.

### 16-11-2026: sin enlace a la Bandeja

- Se quitó el enlace Bandeja (SharePoint Excel), a pedido de Eduardo. Quedan 7 enlaces.

### 16-11-2026: ficha completa por cliente, planilla y Script conectados, copia cada hora

- Mi Planilla: cada fila tiene una ficha que se abre bajo ella (botón ▾ o clic en el número) con todos los datos que pide el Script de Cierre: nacimiento, correo, número a portar, contacto, validación, tipo de venta, líneas adicionales, equipo, despacho y observaciones con frases rápidas. Al cerrarla, la fila muestra los datos principales. Al pegar desde Genesys la ficha se abre sola.
- Planilla y Script conectados: el botón ▶ carga todos los datos de la fila en el Script y lo deja vinculado. Lo que se completa en el Script se guarda en la misma fila, sea venta o no. Si el Script se usa sin venir de la planilla, al escribir el RUT o el nombre se crea la fila sola.
- Copia automática en silencio cada hora en el navegador (se guardan las de las últimas 24 horas y una por día del último mes). Botón "Copias automáticas" para recuperar clientes que falten (suma, nunca borra) o descargar una copia. Limpiar caché no las borra.
- Exportar a Excel incluye todos los datos de la ficha.

### 16-11-2026: Oferta Personas en dos filas

- Fila 1: los tres planes (500, 800 y 1000). Fila 2: el Plan 500 + Netflix a la izquierda y el área multilínea, con fondo azul propio, con la calculadora al medio y la oferta calculada a la derecha. En celular todo queda en una columna.

### 16-11-2026: enlaces sin Planilla de Trabajo ni Buk

- Se quitaron los enlaces Planilla de Trabajo (ahora se usa Mi Planilla, integrada en el portal) y Buk, a pedido de Eduardo. Quedan 8 enlaces.

### 16-11-2026: reintento al publicar desde el escritorio

- Si alguien publica al mismo tiempo, el programa del escritorio se pone al día y reintenta la subida, en vez de mostrar error.

### 16-11-2026: fecha y hora de actualización del stock

- El recuadro de Stock muestra en grande la fecha y la hora de la actualización, por ejemplo "Lunes 16-11-2026 · 11:01 h". Si se publicó otro día, lo indica debajo.

### 16-11-2026: ícono de escritorio para actualizar el stock

- Nuevo programa `herramientas/actualizar-stock.ps1` con su ícono en el escritorio. Lee el Excel diario, muestra el resumen con la fecha y publica en GitHub con la sesión del computador, sin claves.
- Probado con el Excel del 16-11: genera el mismo stock.csv que el portal, byte a byte, y la publicación real quedó en línea.

### 16-11-2026: entrada directa del administrador

- Nueva dirección de administrador: https://cotizadora.github.io/clarogo/#admin. Pide la clave la primera vez y abre directo Actualizar stock. En ese navegador las veces siguientes entra sin pedir la clave.

### 16-11-2026: menú superior sin desplazamiento

- El menú superior ya no se desplaza de lado. Es una grilla pareja de 12 botones, siempre todos visibles: 12 en una fila en PC ancho, 6 por fila en PC y tablet, 3 por fila en celular y 2 en celulares muy angostos.
- Se agregó Inicio al menú y se quitó Enlaces, porque los enlaces ya están en el inicio. En celular el inicio mantiene el botón Enlaces.

### 16-11-2026: herramientas de stock ocultas

- El botón Actualizar stock ya no se ve para el público. Se activa en un equipo tocando 5 veces la fecha del stock e ingresando la clave de administrador. En el código solo queda su huella SHA-256, no la clave.
- La activación queda guardada en ese navegador y Limpiar caché no la borra.

### 16-11-2026: stock del 16-11 y actualización diaria desde el portal

- datos/stock.csv se reemplazó con `Stock Diario + Planilla de precios 16-11.xlsx` (fuente: archivo enviado por Eduardo; precios de la hoja Planilla 13-11). Quedaron 315 equipos: 130 con stock y 185 vigentes sin stock. No se incluyen 22 productos sin pie o cuota (#N/A).
- Dos SKU venían en dos filas con stock distinto (70011841 y 70016652). Ahora se suma su stock.
- Actualizar stock ahora lee el Excel diario directo y publica para todos con un botón, usando una clave de GitHub guardada solo en el navegador de quien publica.
- La sección Stock muestra siempre, destacada, la fecha de la última actualización (datos/stock-info.json).
- El enlace para crear la clave de GitHub llega con el nombre, el dueño, el vencimiento de un año y el permiso Contents ya puestos.

### 13-11-2026: enlaces en el inicio (PC)

- En PC (pantallas de 900 px o más) los enlaces aparecen en el inicio, debajo del menú, y el botón Enlaces se oculta. Todo cabe sin bajar, probado desde 1000x700 hasta 1920x1000.
- En el inicio se muestra solo el nombre de cada enlace; la descripción aparece al pasar el mouse.
- En celular el inicio queda igual. La sección Enlaces sigue disponible en el menú superior.

### 13-11-2026: Enlaces compactos

- La sección Enlaces pasó de botones grandes a filas compactas (ícono, nombre y descripción corta). Ahora cabe completa en pantalla sin bajar, en PC y en celular.
- En PC se muestra en tres columnas, una por grupo. La Planilla de Trabajo quedó dentro de Canales Críticos.

### 13-11-2026: horario precargado

- Horario Ejecutivos trae precargado el horario de la planilla del 13-11-2026 (12-11 al 29-11) con los 15 ejecutivos, transcrito de la imagen enviada por Eduardo, quien autorizó publicar los nombres. Los RUT no se incluyeron.
- En las semanas completas (16 al 22 y 23 al 29) los 15 ejecutivos dan 42 horas. Esta semana (9 al 15) es parcial porque la planilla parte el jueves 12.
- Pegar un horario nuevo reemplaza los datos precargados.

### 13-11-2026: horario con celdas vacías

- Horario Ejecutivos: una celda vacía cuenta como día sin turno y ya no marca la semana como incompleta.
- Si la planilla no trae algunos días de la semana (por ejemplo, esta semana parte el jueves 12), se avisa arriba de la tabla y el estado dice "Parcial".

### 13-11-2026: Horario Ejecutivos

- Nueva sección "Horario Ejecutivos": se copian los turnos desde la planilla (fila de días y fechas más las filas de ejecutivos) y se pegan con "Pegar horario".
- Tabla tipo Excel por semana (lunes a domingo) con los turnos, horas trabajadas y estado contra la meta de 42 horas: cumple, faltan horas, sobran horas o semana incompleta.
- Cálculo: duración de cada turno menos 1 hora de colación por día trabajado (ajustable). Con ese criterio las semanas completas de la planilla dan 42 horas.
- Los datos quedan solo en el navegador. El RUT no se guarda y ningún nombre queda en el código publicado.
- El menú de inicio se ajustó para que las 13 secciones quepan sin scroll en celulares chicos.

### 13-11-2026: varias pestañas abiertas sin perder registros

- La copia local del navegador ahora también se combina antes de guardar. Una pestaña antigua ya no puede reemplazar lo que guardó otra más nueva.
- Candado entre pestañas del mismo navegador: solo una escribe el archivo a la vez.
- Las pestañas abiertas se actualizan solas cuando otra guarda, sin recargar.
- La barra de guardado avisa cuántas otras pestañas de ClaroGo! están abiertas.
- Criterio: no gana la pestaña, gana cada registro en su versión editada más reciente. Los borrados también llevan fecha de edición, así que una pestaña antigua no los revive.

### 13-11-2026: se quita Prospectos

- Se quitó el acceso "Prospectos" (formulario de campaña digital) de Enlaces, a pedido de Eduardo.

### 13-11-2026: Prospectos y limpieza de caché sin preguntas

- Enlaces: Prospectos ahora abre el formulario para responder (`/viewform`) en vez del editor del formulario (`/edit`).
- Limpiar caché ya no muestra el cuadro de confirmación. Siempre guarda primero la planilla en el archivo del PC, limpia, recarga y avisa "Caché limpiada. Tu planilla está a salvo". La planilla y el archivo elegido nunca se borran.

### 13-11-2026: nuevo formulario de Ingreso de Venta

- El formulario de Google de Ingreso de Venta cambió al enlace indicado por Eduardo (`1FAIpQLSe3nbhazUn9...`). Se usa en la sección Ingreso de Venta y en Enlaces.

### 13-11-2026: lo que se ve es lo que se copia

- Oferta Personas, la calculadora, Oferta PNG y Excepciones de Boletas muestran en la página la misma lámina que se copia: el botón copia esa misma imagen, no una distinta.
- Debajo de cada lámina, "Ver el texto que se copia" muestra el mensaje exacto que copia el botón de texto.
- La calculadora muestra la cotización al lado de las líneas (debajo en celular) y se actualiza al cambiar cada línea.
- Oferta PNG muestra arriba la tabla de precios que se copia.
- Los botones se llaman "Copiar lámina" y "Copiar texto" en todas las secciones.

### 13-11-2026: lámina y texto de la calculadora multilínea

- La lámina de la cotización ahora muestra una tarjeta por línea (plan, gigas, roaming, larga distancia y precio), el total destacado, los íconos de redes sociales, lo que incluyen todas las líneas y la nota de evaluación comercial.
- El texto para WhatsApp detalla cada línea con sus atributos, los totales y lo que incluyen todas las líneas.
- Los botones se llaman "Copiar lámina" y "Copiar texto".

### 13-11-2026: ícono propio

- Nuevo ícono redondo rojo con "G!" para la pestaña, los marcadores y el acceso directo en celular: `favicon.svg`, `favicon-32.png`, `icono-192.png` y `apple-touch-icon.png`. También se agregó a los tutoriales.

### 13-11-2026: vuelve el Plan 500 + Netflix

Fuente: imagen "Plan 500 + Netflix, entretención sin límites" enviada por Eduardo el 13-11-2026.

- Se agregó Plan 500 + Netflix Estándar: $17.990 mensual, 500 GB a alta velocidad, roaming 2 GB + 40 minutos, larga distancia internacional 40 minutos, minutos libres a 300 números y 500 SMS.
- Aparece en Oferta Personas, la calculadora, el Script, Mi Planilla y Preguntas y Respuestas.
- No muestra valor de línea adicional porque la imagen no lo indica. Plan 800 + Netflix y Plan 1000 + Netflix siguen fuera.

### 13-11-2026: paso VDI simplificado

- El paso 1 del Script usa la opción 1 elegida por Eduardo: menciona la Resolución Exenta N.º 566 de SUBTEL, el medio por el que se envió el enlace y confirma que la validación fue exitosa y quedó aprobada.
- Nuevo selector "Enlace de validación enviado por" (correo electrónico, WhatsApp o SMS) en el formulario del Script.

### 13-11-2026: paso VDI en pasado

- El paso 1 del Script de Cierre (Validación de identidad) se lee una vez que el cliente ya validó. Se redactó en pasado, con la misma información, y termina dando paso a la lectura del contrato. El aviso "Leer una vez aprobada la VDI" pasó del paso 2 al paso 1.

### 13-11-2026: Mi Planilla nunca pierde registros

- Guardado en un archivo único del PC (`ClaroGo-planilla-control.json`, sugerido en Documentos). Se elige una sola vez por navegador y se reemplaza en cada guardado, sin acumular copias. Funciona en Chrome y Edge.
- Todos los navegadores del mismo PC que apunten a ese archivo quedan sincronizados. Al sincronizar se mezclan los registros: si uno cambió en dos lados, gana la versión editada más tarde.
- Se guarda solo: a los 4 segundos de cada cambio, cada 30 minutos, al cambiar de sección, al cambiar de pestaña o minimizar y al cerrar el navegador. Requiere que ClaroGo! esté abierto en alguna pestaña.
- Copia local en el navegador además del archivo. Si el archivo está dañado, no se sobrescribe y se avisa.
- Borrar ya no elimina: marca el registro como borrado y se recupera con "Ver borrados". Se quitó el botón "Borrar todo".
- Historial filtrable por período (hoy, 7 días, 30 días, este mes, entre fechas, todo), segmento (campaña y cola), tipificación y texto.
- Limpiar caché ahora guarda la planilla antes y no la borra, ni tampoco el archivo elegido.

### 13-11-2026: Mi Planilla con estilo de hoja de cálculo

- Una línea por registro y sin scroll horizontal: las columnas se ajustan al ancho de la pantalla.
- Estilo de Excel: cuadrícula, encabezado gris, números de fila, celdas sin bordes y celda activa con borde verde. Las ventas se marcan en verde.
- En pantallas medianas se ocultan Hora y Plan. En celular quedan N°, RUT, Nombre, Tipificación y el botón para pasar al Script.
- La campaña y la cola se ven al pasar el mouse sobre el número de fila y siguen saliendo en la exportación a Excel.

### 13-11-2026: Mi Planilla de Control

- Nueva sección "Mi Planilla": en Genesys se hace Ctrl+A y Ctrl+C, y el botón "Pegar desde Genesys" crea una fila con campaña, RUT, nombre, teléfono, cola, fecha y hora.
- El lector se armó con una página de Genesys guardada por Eduardo el 13-11-2026. Usa el título de la interacción (campaña, RUT y nombre separados por |), la línea "Teléfono:", la cola y la línea "Conectado a la conversación". La página original no se subió al repositorio.
- Cada fila se edita libremente y tiene tipificación, plan de interés y notas. Botones por fila: copiar el RUT y abrir el Rutificador, pasar los datos al Script de Cierre y borrar.
- Tipificaciones: Venta, Buzón de voz, Mudo o corta llamada y No molestar (de la Inducción VR de Genesys), más Volver a llamar, No contesta, No interesado, Ya es cliente Claro, Rechazo de evaluación, Número equivocado y Otro.
- Filtros por período, tipificación y búsqueda, resumen de llamadas por tipificación y exportación a Excel (CSV).
- Los datos se guardan solo en el navegador de cada ejecutivo (almacenamiento local). No se envían a ningún servidor.
- Pendiente: la carpeta de recursos de la página guardada no venía, así que no se pudo revisar el panel interno de Scripts de Genesys ni la lista de códigos de conclusión.

### 13-11-2026: nuevo Script de Cierre de Ventas

Fuente: planilla de Google Sheets "Cierre de ventas, Portabilidades conectados" indicada por Eduardo el 13-11-2026.

- El Script de Validación se reemplazó por el Script de Cierre de Ventas: validación de identidad (VDI), documentación, confirmación de datos, plan contratado, planes adicionales, activación (PortIn, Migración o Línea nueva), equipo, dirección y tiempo de despacho, y despedida.
- Arriba hay un formulario con los datos de la venta y el guion se completa solo. Los datos que faltan aparecen marcados en amarillo. Los pasos de adicionales y equipo aparecen solo si se completan.
- El plan, los valores, el roaming y la larga distancia salen de la Oferta Personas vigente.
- Se quitó la carga rápida desde Excel. Eduardo configurará más adelante la carga de datos desde Genesys.
- La planilla de origen trae datos reales de una clienta. No se copiaron al portal.

### 13-11-2026: se retiran los planes con Netflix

- Eduardo confirmó que los planes con Netflix (Plan 500, 800 y 1000 + Netflix) ya no van. Se quitaron de Oferta Personas, la calculadora, el Script y Preguntas y Respuestas.
- Quedan solo Plan 500, Plan 800 y Plan 1000 con los precios de las imágenes del 13-11-2026.

### 13-11-2026: precios Planes 5G, adicionales, calculadora y enlaces nuevos

Fuente: imágenes "Planes 5G Claro" y "Planes Adicionales Claro" enviadas por Eduardo el 13-11-2026.

| Plan | Meses 1 a 6 | Desde el mes 7 | Línea adicional |
|---|---|---|---|
| Plan 500 | $5.994 | $9.990 | $4.990 por 6 meses, después $8.990 |
| Plan 800 | $7.923 | $12.990 | $6.990 por siempre |
| Plan 1000 | $16.990 | $17.990 | $4.990 por 6 meses, después $6.990 |

- Los planes con Netflix siguen con el cargo fijo del documento Producto Móvil ($17.990, $20.990 y $25.990), porque las imágenes no los incluyen.
- Nueva calculadora de líneas en Oferta Personas: cada línea puede ser un plan base distinto o una línea adicional. Muestra el total de los meses 1 a 6 y desde el mes 7, avisa si una adicional no tiene su plan base, y copia la cotización como imagen o mensaje.
- Se agregaron 5G y llamadas ilimitadas a los atributos de cada plan.
- Enlaces: Genesys pasa a `login.mypurecloud.com` (org clarochilepersonas) y Front FVC pasa a `fvc-dev.clarovtrcloud.com`, según indicó Eduardo.

### 13-11-2026: Oferta Personas más completa

Fuente indicada por Eduardo: los documentos adjuntos (`PRODUCTO MÓVIL 14082026.pdf` y `producto-movil.md`). Los valores de la página de Claro no se usan, porque difieren de los documentos.

- Precios sin cambios: Plan 500 $9.990, Plan 800 $12.990, Plan 1000 $17.990 y con Netflix $17.990, $20.990 y $25.990 (cargo fijo normal).
- Cada tarjeta ahora muestra los íconos de WhatsApp, Instagram, Facebook, TikTok y X, y los atributos de los documentos: internet, minutos, 500 SMS a todo destino, roaming en 51 países los 365 días, larga distancia internacional, Netflix cuando corresponde, Claro Drive 100 GB gratis, Claro Club, equipos hasta 24 cuotas sin interés, cobro de minutos y SMS adicionales y uso justo.
- La imagen que se copia y el mensaje para WhatsApp incluyen esos mismos atributos.
- La portada vuelve a ser clara en PC (pantallas de 900 px o más). En celular sigue la versión oscura.

### 12-11-2026 (séptima entrega): ClaroGo! 2.0

- Miniatura nueva para compartir por WhatsApp: `clarogo-2026.png` (1200x630, 130 KB). Reemplaza a `og-preview.png`, que era la imagen del sitio antiguo y sigue guardada en `original/`.
- Se completaron los metadatos para compartir (dirección, tipo y tamaño de la imagen).
- Portada renovada con fondo oscuro y la marca "ClaroGo! 2.0 · 2026".
- El menú de inicio se ajusta al alto de la pantalla y se ve completo sin scroll. Probado en 320x520, 360x640 y 1366x640.
- La firma queda en un marco fijo al pie de todas las secciones.

### 12-11-2026 (sexta entrega): Oferta PNG pasa a la oferta PYME

Fuente: imagen "Oferta Móvil PYME, RUT mayor a 50 millones" enviada por Eduardo el 12-11-2026. La imagen no trae fecha de vigencia.

| Plan | Portabilidad hasta 3 líneas | Portabilidad desde 4 líneas |
|---|---|---|
| Plan L | $7.000 + IVA | $6.000 + IVA |
| Plan XL | $7.500 + IVA | $6.500 + IVA |
| Plan Premium Pro | $9.000 + IVA | $8.000 + IVA |

- Se eliminaron los planes PNG antiguos (Plan S, Max L, Max XL y Max Libre Pro, individuales y multilínea).
- La sección calcula el total según las líneas a portar. Supuesto: desde 4 líneas, el valor menor se aplica a todas las líneas.
- La imagen no indica gigas, minutos ni duración del precio, por eso la sección no los muestra.
- Se agregó una pregunta sobre la oferta PYME en Preguntas y Respuestas.

### 12-11-2026 (quinta entrega): se retiran los planes antiguos

Fuente: Eduardo confirmó el 12-11-2026 que los planes con letras ya no existen.

- Oferta Personas: se eliminó la "Oferta anterior del portal" (Max M, Max L Libre, Max XL Libre, Max Libre Pro, sus variantes de Línea Nueva y Port. Prepago, el adicional Max M y Plan Persona Mayor). Quedan solo Plan 500, Plan 800 y Plan 1000, con y sin Netflix.
- Script: la lista de planes ahora es la misma de Oferta Personas y muestra el cargo fijo normal. Ya no muestra precio promocional, valor desde el mes 7 ni redes sociales, porque no hay fuente vigente para esos datos.
- Oferta PNG: sigue con sus planes antiguos (S, Max L, Max XL, Max Libre Pro), ahora con aviso de "sin verificar". Falta confirmar si también dejaron de existir.
- Los planes retirados siguen disponibles en `original/oferta.html` y `original/Script.html`.

### 12-11-2026 (cuarta entrega): stock del 12-11

- datos/stock.csv se reemplazó con el archivo `Stock Diario, Planilla de precios 12-11.xlsx` que envió Eduardo.
- Quedaron 316 equipos: 131 con stock (hoja Stock) y 185 vigentes sin stock (hoja Planilla), para que al buscarlos aparezcan como sin stock.
- El nombre de cada equipo es el Modelo Comercial de la Planilla. Pie y 18 cuotas son los valores referenciales de Financiamiento Portabilidad.
- No se incluyeron 22 productos con stock que en el Excel no traen precio (#N/A): tablets, routers y equipos MDT, LS o ECOM.
- No se incluyeron los 508 equipos marcados como Antiguo en la Planilla.

### 12-11-2026 (tercera entrega): revisión de la oferta y Preguntas y Respuestas

Fuente indicada por Eduardo: `PRODUCTO MÓVIL 14082026.pdf` (Entrenamiento Técnico Comercial, 100 láminas) y los cuatro resúmenes de la carpeta "MD DE APOYO PRODUCTOS Y PROCESOS". Leídos el 12-11-2026.

- Oferta Personas: se agregó el bloque "Planes Libres vigentes" con Plan 500, Plan 800 y Plan 1000, y sus versiones con Netflix, tal como aparecen en las láminas 11 a 13 del PDF. Los valores son cargo fijo normal, sin descuentos.
- Oferta Personas: los planes que traía el sitio antiguo (Max M, Max L Libre, Max XL Libre, Max Libre Pro, Persona Mayor y sus variantes) quedaron bajo el título "Oferta anterior del portal" con un aviso de "sin verificar". No se borraron ni se cambiaron sus valores.
- Script: se agregó un aviso en el paso 4, porque su lista de planes es la del sitio antiguo.
- Nueva sección "Preguntas y Respuestas" con 61 preguntas en 12 categorías, con buscador y fuente en cada respuesta.

### 12-11-2026 (segunda entrega): portal nuevo integrado

- `index.html` se rehízo completo: una sola dirección con todas las secciones (Stock, Oferta Personas, Oferta PNG, Script, Ingreso de Venta, Enlaces, Galería, Excepciones de Boletas, Tutoriales, Audios y sugerencias por WhatsApp). Ya no carga nada desde Neocities.
- Se eliminaron las dependencias externas: Google Fonts, Tailwind por CDN, html2canvas y Font Awesome. Las capturas de tarjetas ahora se dibujan con canvas propio.
- El stock salió del código y pasó a `datos/stock.csv` (754 equipos, los mismos valores del original). Se agregó la herramienta "Actualizar stock".
- Las imágenes de la galería pasaron de 51 MB a 3,8 MB en total.
- Los precios, planes, textos del Script y la tabla de Excepciones de Boletas son los mismos del original. No se cambió ningún valor.
- La sección Enlaces se integró desde `claro-catalogo.neocities.org/Link`.
- La limpieza de caché quedó como botón manual en el pie de página, con confirmación. Usa las mismas funciones del original. En el original estaba en una pantalla que no se mostraba.

No se trasladó al portal nuevo (sigue disponible en `original/`):

- El módulo "Black Sale 2026" del Stock, porque la campaña venció el 05-04-2026.
- La cuenta regresiva del pie de página.
- Los sonidos al pasar el cursor y al capturar, y las ondas animadas de la portada.

### 12-11-2026 (primera entrega)

- Se descargó el sitio original desde Neocities y se guardó en `original/`.
- Se creó el repositorio público `cotizadora/clarogo` y se activó GitHub Pages desde la rama `main`.

## Cambios de precios y planes

| Fecha | Cambio | Fuente |
|---|---|---|
| 12-11-2026 | Se agregan Plan 500 ($9.990), Plan 800 ($12.990), Plan 1000 ($17.990), Plan 500 + Netflix ($17.990), Plan 800 + Netflix ($20.990) y Plan 1000 + Netflix ($25.990) como cargo fijo normal | `PRODUCTO MÓVIL 14082026.pdf`, láminas 11 a 13 |

No se modificó ningún valor que ya existía.

## Pendientes

- **Promociones vigentes.** El PDF solo trae cargos fijos sin descuento y remite al "Plan Comercial vigente" (ID Clave Claro 335). Sin ese documento no se pueden actualizar los precios promocionales, los adicionales ni la Oferta PNG.
- Con el Plan Comercial vigente: decidir si se elimina la "Oferta anterior del portal" y actualizar la lista de planes del Script.
- La tabla de Excepciones de Boletas no aparece en el PDF. Lo único que dice sobre deuda es que una deuda vencida con Claro mayor a $50.000 debe pagarse antes de contratar. Falta la fuente de la tabla.
- Los resúmenes de apoyo mencionan el derecho a retracto de 10 días y la plataforma "No Molestar". No se incluyeron en Preguntas y Respuestas porque no aparecen en el PDF.
- Las preguntas de Genesys, Front Comercial y Técnicas de venta salen de los resúmenes, no de los PDF originales.
- Buscar la oferta pública en el sitio oficial de Claro Chile, citando fecha de consulta.
- Diferencias que ya venían en el original y hay que aclarar con fuente:
  - Max L Libre aparece con 600 GIGAS en Oferta Personas y con 300 GB en el Script. Max XL Libre aparece con 1.000 GIGAS y 500 GB.
  - Línea Nueva de Max M dice 30% de descuento en Oferta Personas y 35% en el Script.
- Stock: los datos son los del sitio original. Falta una carga actualizada.
- La sección Preguntas y Respuestas publica contenido de entrenamiento interno en un sitio público. Revisar si alguna respuesta debe quitarse.
- Decidir si vuelve la cuenta regresiva del pie de página.
- Las imágenes originales de la galería (4384 px, 51 MB) no se subieron al repositorio. Siguen en Neocities.
- No se probó en un teléfono real: copiar imágenes al portapapeles, el formulario de Google incrustado y la limpieza de caché.
- Aclarar qué significa "encode" en el pedido original.

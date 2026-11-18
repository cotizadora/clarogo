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

Extensión (la misma que usa Eduardo):

1. Descargar https://cotizadora.github.io/clarogo/ext/clarogo-genesys-extension.zip
2. Clic derecho en el archivo descargado, "Extraer todo".
3. Abrir edge://extensions (o chrome://extensions) y activar "Modo para desarrolladores".
4. Presionar "Cargar desempaquetada" y elegir la carpeta extraída.
5. Para actualizar: descargar el zip nuevo, reemplazar la carpeta y presionar "Volver a cargar" en la extensión.

Opción con Tampermonkey:

1. Instalar Tampermonkey (gratis): https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd
2. En edge://extensions, Detalles de Tampermonkey: activar "Permitir scripts de usuario".
3. Abrir https://cotizadora.github.io/clarogo/ext/clarogo-genesys.user.js y presionar Instalar.
4. En Genesys: botón rojo ClaroGo! o Alt+Shift+G. Abrir ClaroGo! una vez para cargar nombre, firma y láminas.
5. No tener activa a la vez la extensión antigua ClaroGo! Genesys.

## Historial de cambios

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

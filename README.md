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

1. Abre el sitio, entra a **Stock de Equipos** y presiona **Actualizar stock**.
2. Copia desde Excel las columnas SKU, Marca, Modelo, Stock, Pie y Cuotas con su fila de títulos, pégalas y presiona **Revisar**. También puedes elegir un archivo CSV.
3. El portal avisa si hay filas con errores o SKU repetidos y muestra cuántos equipos son nuevos, cuántos ya no vienen y cuántos cambiaron de stock o precio.
4. Presiona **Descargar stock.csv**.
5. Presiona **Abrir GitHub para subirlo**, arrastra el archivo y confirma con "Commit changes". El sitio se actualiza solo en uno o dos minutos.

El archivo usa punto y coma como separador, así se abre directo en Excel. La fecha que muestra el portal ("Stock actualizado el...") es la de la última subida.

## Cómo cambiar precios y planes

Todos los datos comerciales están al inicio del script de `index.html`, en el bloque "DATOS COMERCIALES": Excepciones de Boletas, Oferta Personas, Oferta PNG y los planes del Script. Cada cambio se anota más abajo con fecha y fuente.

## Cómo publicar

GitHub Pages publica la rama `main` desde la raíz. Cada push a `main` actualiza el sitio en uno o dos minutos.

## Historial de cambios

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

# ClaroGo!

Portal de apoyo para ventas de equipos y planes con portabilidad. Es una herramienta no oficial, desarrollada por Eduardo Pérez. No es un sitio de Claro Chile.

- Sitio publicado: https://cotizadora.github.io/clarogo/
- Repositorio: https://github.com/cotizadora/clarogo
- Sitio anterior (sin cambios): https://financiamiento.neocities.org/

## Estructura

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

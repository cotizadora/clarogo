# ClaroGo!

Portal de apoyo para ventas de equipos Claro con portabilidad. Es una herramienta no oficial, desarrollada por Eduardo Pérez. No es un sitio de Claro Chile.

Sitio original: https://financiamiento.neocities.org/

## Estructura

- `index.html`: versión de trabajo (por ahora idéntica al original).
- `original/`: copia intacta del sitio descargada el 12-11-2026. No se modifica.
  - `index.html` (portada y marco de navegación)
  - `Stock.html`, `oferta.html`, `oferta_png.html`, `Script.html`, `Galeria.html`, `Tutoriales.html`, `Permisos.html`
  - `og-preview.png`
- `CLAUDE.md`: instrucciones del proyecto.

## Cómo publicar

- Repositorio: https://github.com/cotizadora/clarogo
- Sitio publicado: https://cotizadora.github.io/clarogo/

GitHub Pages publica la rama `main` desde la raíz. Cada push a `main` actualiza el sitio en uno o dos minutos.

## Historial de cambios

### 12-11-2026

- Se descargó el sitio original completo desde Neocities (portada y 7 subpáginas) y se guardó en `original/`.
- Se creó `index.html` como copia exacta de `original/index.html`. No se cambió ningún valor.
- No se modificaron precios, planes, stock, Excepciones de Boletas ni la limpieza de caché.
- Se creó el repositorio público `cotizadora/clarogo` y se activó GitHub Pages desde la rama `main`.
- Ojo: la versión publicada en GitHub Pages todavía carga las secciones desde Neocities, porque `index.html` es una copia sin cambios del original.

## Cambios de precios y planes

Ninguno hasta ahora. Cada cambio futuro se anota aquí con fecha y fuente.

## Pendientes

- Decidir cómo llevar las 7 subpáginas a la versión de trabajo. El original no es un solo archivo: la portada carga las secciones en un iframe desde Neocities.
- Decidir qué hacer con las dependencias externas del original: Google Fonts (todas las páginas), Tailwind por CDN y html2canvas (Oferta Personas y Oferta PNG) y Font Awesome (Script).
- Sección Enlaces: vive en otro sitio (`claro-catalogo.neocities.org/Link`) y no se descargó.
- Pie de página: tiene una cuenta regresiva al 11-03-2030 con un texto sin relación con el portal. Revisar con Eduardo antes de tocarlo.
- Stock: la campaña que aparece tiene vigencia hasta el 05-04-2026. Falta fuente para actualizar.
- Actualizar precios y planes con la oferta vigente de Claro Chile, citando fuente oficial y fecha de consulta.
- Aclarar qué significa "encode" en el pedido original.

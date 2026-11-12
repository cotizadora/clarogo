# ClaroGo! - Instrucciones para Claude Code

Este archivo es el punto de partida del proyecto. Léelo completo antes de hacer cualquier cambio.

## 1. Qué es el proyecto

ClaroGo! es un portal de ventas de equipos Claro con portabilidad (traer el número a Claro y llevarse un equipo nuevo). Lo construyó Eduardo Pérez antes de tener Claude. Hoy está publicado en:

- https://financiamiento.neocities.org/ (sitio actual, dominio gratuito de Neocities)

Secciones que tiene la página:

- Stock de Equipos (ruta /Stock)
- Oferta Personas
- Oferta PNG
- Ver Script
- Ingreso de Venta
- Enlaces
- Galería
- Excepciones de Boletas (tabla de deuda máxima por número de líneas portadas: 1 línea hasta $18.000, sube $9.000 por línea, hasta $63.000 con 6 o más)
- Tutoriales
- Audios (marcado como "Próximamente")
- Mejorar ClaroGo! (modal de comentarios que envía por WhatsApp)
- Limpieza de caché (borra Cookies, localStorage, sessionStorage, Cache API, Service Workers e IndexedDB)

Pie de página: incluye un texto que no tiene relación con el portal y debe tratarse como contenido a revisar con Eduardo antes de tocarlo.

## 2. Primer paso: obtener el código fuente

1. Intenta descargar la página completa:
   `curl -sL -o index.html https://financiamiento.neocities.org/`
2. Si la descarga falla con 403, 407 o "connect_rejected", NO intentes rodear la política de red (no uses otros proxies, no cambies HTTPS_PROXY, no uses el navegador para saltarte el bloqueo). Detente y pídele a Eduardo una de estas opciones:
   - Habilitar el dominio `financiamiento.neocities.org` en claude.ai → Configuración → Capacidades (o que el administrador lo haga, si es cuenta Team o Enterprise).
   - Adjuntar el archivo `index.html` copiado desde el navegador (Ctrl+U o Cmd+Option+U, seleccionar todo, copiar).
3. Si el sitio tiene más archivos (CSS, JS, imágenes, otras rutas como /Stock), pide la lista o la descarga completa. No asumas que todo está en un solo archivo.
4. Guarda el código original sin tocarlo en `original/index.html`. Todo cambio se hace sobre una copia.

## 3. Estructura del repositorio que hay que crear

Crear un repositorio nuevo en GitHub (privado al inicio) con esta estructura:

```
clarogo/
  index.html        <- versión de trabajo (una sola página)
  original/
    index.html      <- copia intacta del sitio original
  CLAUDE.md         <- este archivo
  README.md         <- descripción corta y cómo publicar
```

Publicar con GitHub Pages desde la rama principal. El enlace final debe ser el de GitHub Pages del propio repositorio, nunca un enlace temporal de Claude ni de claude.ai.

## 4. Reglas de desarrollo (obligatorias)

- Herramienta de un solo archivo HTML, mobile first, sin dependencias externas, sin CDN, JavaScript y CSS vanilla. Si el original usa algo externo, avísalo antes de mantenerlo.
- Cambiar solo lo que Eduardo pida. No agregar secciones, funciones ni decisiones de diseño por iniciativa propia.
- Antes de modificar algo, confirma con Eduardo si hay duda.
- Los datos comerciales (precios, planes, tabla de Excepciones de Boletas, stock) son sensibles. No los cambies sin una fuente que Eduardo indique. Anota en el README la fecha y la fuente de cada cambio de precios.
- Revisar la sección de Limpieza de caché antes de tocarla: borra almacenamiento del navegador, así que cualquier cambio debe probarse en el navegador.
- No convertir el portal en una página que imite un sitio oficial de Claro. Si se usa con clientes, debe identificarse como herramienta no oficial, con su nombre propio y su autoría.

## 5. Textos en español (obligatorio)

- Escribir "para" completo, nunca "pa".
- Nada de voseo chileno ("estás", no "estai").
- Sin guiones largos ni puntuación rara. Textos naturales, no con tono artificial o enciclopédico.

## 6. Pendientes que Eduardo tiene que aclarar

- Qué significa "encode" en su pedido. Puede ser codificar u ofuscar el script, codificar datos o algo distinto. No hagas ningún cambio de ese tipo hasta que lo confirme.
- Actualizar los planes del portal. Esto se hará en una etapa posterior. Por ahora solo se lleva el código a la nube.
- Si hay precios, planes o stock que deban actualizarse, pedir la fuente oficial primero.

## 7. Cierre de cada sesión

Al terminar cualquier cambio:

1. Actualiza el README con lo cambiado y la fecha.
2. Haz commit y push a GitHub.
3. Confirma que GitHub Pages se publicó y entrega el enlace del repositorio.
4. Resume en pocas líneas qué se cambió y qué queda pendiente.

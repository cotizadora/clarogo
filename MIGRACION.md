# MIGRACIÓN DE CLAROGO! Y GOEXT A UN COMPUTADOR NUEVO

Guía escrita el **20-11-2026 (10:20, hora de Chile)** en el computador antiguo de Eduardo Pérez, para que **Claude Code en el computador nuevo** retome todo sin perder tiempo.

Estado al escribir esta guía:

| Pieza | Versión | Dónde |
|---|---|---|
| Página **ClaroGo!** | **v2.15.0** (`APP_VERSION` en `index.html`; actualizado 20-11-2026 10:55) | https://cotizadora.github.io/clarogo/ |
| Extensión **GoExt** | **1.44.0** (`extension/manifest.json`) | https://cotizadora.github.io/clarogo/ext/ |
| Último commit | `2cd4322` 20-11-2026 10:15 "Stock del 20-11-2026 (desde el escritorio)" | https://github.com/cotizadora/clarogo |

---

## 0. PARA CLAUDE: LEE ESTO PRIMERO

1. **Esta guía puede estar desactualizada.** Después del 20-11-2026 10:20 pudo haber más cambios (en este PC, en otra sesión o desde la página, por ejemplo "Actualizar stock"). **Antes de tocar nada**:
   - `git fetch origin` y `git log --date=format:'%d-%m-%Y %H:%M' --format='%ad %h %s' -40` para ver los últimos cambios con fecha y hora.
   - Compara `APP_VERSION` de `index.html` y `version` de `extension/manifest.json` con lo publicado:
     - `curl -s https://cotizadora.github.io/clarogo/ | grep "APP_VERSION ="`
     - `curl -s https://cotizadora.github.io/clarogo/extension/manifest.json`
   - Lee la sección **"Historial de cambios"** del `README.md` (lo más nuevo va arriba, con fecha).
   - **Analiza el código** antes de confiar en esta guía: si algo de aquí no calza con el código, **manda el código y la fecha/hora más reciente**. Anota la diferencia en el README.
2. Lee también `CLAUDE.md` del repositorio: reglas obligatorias del proyecto (textos en español sin "pa", sin voseo, sin guiones largos; cambiar solo lo que Eduardo pida; subir versión y anotar en README en cada cambio; commit y push; confirmar que GitHub Pages publicó).
3. **Nombres:** **ClaroGo!** es la página. **GoExt** es la extensión (en código y archivos todavía hay nombres antiguos como `clarogo-genesys-extension.zip` o `instalar-clarogo.bat`: no se renombran porque los accesos ya instalados los buscan así).
4. Eduardo habla por voz y a veces el texto llega mal transcrito: "Claude Code" casi siempre significa **ClaroGo!**, "router" es **RUT**, "formulario de 90" es **formulario de venta**, "CoExt" fue un error: es **GoExt**.
5. Revisa la sección **9 (Reglas aprendidas)** antes de proponer o publicar algo.

---

## 1. QUÉ ES CADA COSA

- **ClaroGo!** (`index.html`, una sola página HTML, CSS y JavaScript propios, sin CDN): portal de ventas para ejecutivos de Claro con portabilidad. Herramienta **no oficial** de Eduardo Pérez. Secciones: Stock de Equipos, Oferta Personas, Oferta PNG, Ver Script (Script de Cierre), Ingreso de Venta, Galería, **Mi Planilla** (planilla de control de llamadas y clientes), Horario Ejecutivos, Preguntas y Respuestas, Excepciones de Boletas, Tutoriales, **Descargas** (GoExt y MuteReal), Audios (próximamente).
- **GoExt** (carpeta `extension/` del repo): extensión para Edge o Chrome cargada "desempaquetada". Lee la llamada en Genesys (`apps.sae1.pure.cloud`), envía clientes a Mi Planilla, arma WhatsApp con la lámina del plan, tipifica en el formulario de no venta, revisa deuda (Claro, Entel, Movistar, WOM), usa el Rutificador (nombrerutyfirma.com) en segundo plano, avisa llamada cortada. Archivos: ver `ext/extension-archivos.txt` (17 al 20-11-2026).
- **MuteReal** (`descargas/MuteReal.exe`): programa de Eduardo para Windows que muestra si el micrófono está realmente silenciado. Se descarga desde la sección Descargas.
- **Actualizar stock**: `herramientas/actualizar-stock.ps1` + acceso en el escritorio. Lee el Excel diario de stock y publica `datos/stock.csv` en GitHub con la sesión de git del computador.
- **Formularios de Google** (no son nuestros, solo se llenan):
  - Ingreso de venta: `https://docs.google.com/forms/d/e/1FAIpQLSe3nbhazUn9YVJqTLlP6tOdMZum-VkfEa9wTE8yAGPTqVuRsw/viewform` (se envía **uno por cada línea**, cada uno con su plan; que una línea es adicional se marca en el **Front**, no en el formulario).
  - Registro de no venta: `https://docs.google.com/forms/d/e/1FAIpQLSeWwyqN1vbUn3wOvHTImDsNFbUwVvG0rijrWWggigDqOrgJHQ/...` (este sí interactúa con Genesys: código de conclusión y neón en Enviar).

### Enlaces que se comparten

| Para qué | Enlace |
|---|---|
| ClaroGo! | https://cotizadora.github.io/clarogo/ |
| Mi Planilla | https://cotizadora.github.io/clarogo/#control |
| Descargas (GoExt y MuteReal) | https://cotizadora.github.io/clarogo/#descargas |
| Instalar GoExt (página simple) | https://cotizadora.github.io/clarogo/ext/ |
| Compartir GoExt por WhatsApp (con vista previa) | https://cotizadora.github.io/clarogo/goext/ |
| Administrador (actualizar stock desde la página) | https://cotizadora.github.io/clarogo/#admin |
| Repositorio | https://github.com/cotizadora/clarogo |
| Sitio antiguo (sin cambios) | https://financiamiento.neocities.org/ |

---

## 2. ANTES DE BORRAR EL PC ANTIGUO: QUÉ RESPALDAR

Copiar al pendrive (o a la nube) **todo esto**:

1. **`Documentos\CLARO\`** completa. Contiene:
   - `ClaroGo\repo\` = el repositorio git (con la carpeta oculta `.git`). Es una copia; la fuente oficial es GitHub.
   - `ClaroGo\actualizar-stock.ps1` y `ClaroGo\Actualizar stock ClaroGo.bat` (el programa de stock usa la carpeta `repo` que está al lado).
   - `CLAUDE.md`, PDFs de inducción, láminas de planes, `prompts-laminas.txt`, `MuteReal.exe` y `MuteReal.rar`.
   - Esta guía (`MIGRACION.md`).
2. **`Documentos\ClaroGo-planilla-control.json`** = **los clientes de Mi Planilla** (datos personales de clientes: nunca subirlo a GitHub ni compartirlo).
   - Antes de copiarlo: abrir ClaroGo! → Mi Planilla y revisar que diga "✅ Guardado automático activo en ClaroGo-planilla-control.json". Si no, presionar **Guardar** o **💾 Exportar clientes**.
3. **`Documentos\ClaroGo\`** (carpeta de GoExt instalada). No es imprescindible: el instalador la vuelve a crear.
4. **Escritorio**: `Actualizar stock ClaroGo.bat` (se puede regenerar; ver sección 8).
5. **No se puede copiar** (vive dentro de Edge): el Historial de tipificaciones de GoExt (`historial_tip`) y las preferencias de GoExt. El Historial de Mi Planilla sí viaja dentro del archivo `.json`.
6. Si Edge tiene favoritos o contraseñas: usar la **sincronización de Edge** con la cuenta de Microsoft de Eduardo (no exportar contraseñas a un archivo). En el PC antiguo había un `Contraseñas de Microsoft Edge.csv` suelto en Documentos: **no copiarlo**, borrarlo.

---

## 3. COMPUTADOR NUEVO: PASOS EN ORDEN

> Claude: guía a Eduardo paso a paso. Nunca escribas contraseñas por él: las escribe él.

1. **Copiar** `Documentos\CLARO` y `Documentos\ClaroGo-planilla-control.json` desde el respaldo a `Documentos` del PC nuevo.
2. **Claude Code**: abrir la sesión en la carpeta `Documentos\CLARO` (si la sesión parte sin carpeta, moverla ahí con la herramienta de cambiar carpeta).
3. **Instalar Git** (sin administrador, queda en la carpeta del usuario):
   ```
   winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements --silent
   ```
   En el PC antiguo quedó en `%LOCALAPPDATA%\Programs\Git\cmd\git.exe`. La sesión de PowerShell de Claude no lo ve en el PATH hasta reiniciarla: usar la ruta completa o `$env:Path = "$env:LOCALAPPDATA\Programs\Git\cmd;" + $env:Path`.
4. **Permitir la carpeta del repo en git**: `git config --global --add safe.directory "C:/Users/<usuario>/Documents/CLARO/ClaroGo/repo"`.
5. **Iniciar sesión en GitHub** (ver sección 4). Comprobar con `git push --dry-run origin main` (debe decir "Everything up-to-date").
6. **Poner al día el repo**: `git pull --ff-only` (y revisar la sección 0).
7. **Instalar GoExt como un ejecutivo más** (ver sección 6): página https://cotizadora.github.io/clarogo/ext/ → instalador → cargar `Documentos\ClaroGo\extension` en `edge://extensions`.
8. **Mi Planilla**: abrir https://cotizadora.github.io/clarogo/#control → **"Usar archivo existente"** → elegir `Documentos\ClaroGo-planilla-control.json` → permitir (si ofrece "Permitir en cada visita", elegirlo). También sirve **📂 Importar clientes** con ese mismo archivo (acepta la planilla .json, las copias automáticas y la exportación .txt).
9. **Acceso "Actualizar stock ClaroGo"** en el escritorio (ver sección 8).
10. **MuteReal**: descargar desde Descargas de ClaroGo! si se usa.
11. Revisar en ClaroGo! (Ctrl+F5) que arriba diga la versión actual.

---

## 4. CREDENCIALES Y CONEXIONES (sin escribir claves aquí)

| Qué | Cuenta | Cómo se conecta en un PC nuevo |
|---|---|---|
| **GitHub** (repo y GitHub Pages) | usuario **cotizadora** (correo noreply `290839906+cotizadora@users.noreply.github.com` para los commits) | `herramientas\login-github.ps1` (inicio por código de dispositivo, ver abajo) |
| **Clave de GitHub para "Publicar para todos" del stock desde la página** | token de GitHub con acceso solo al repo clarogo (Contents: Read and write), guardado solo en el navegador | En ClaroGo! → Stock → Actualizar stock → "Conexión con GitHub": crear una clave nueva con el enlace que trae y pegarla. Si se perdió, borrar la vieja en GitHub → Settings → Developer settings. |
| **Clave de administrador** de ClaroGo! (#admin y 5 toques en la fecha del stock) | la sabe Eduardo; en el código solo hay su huella SHA-256 | Eduardo la escribe la primera vez en el navegador nuevo |
| Genesys, Front FVC, formularios de Google, WhatsApp Web | cuentas de trabajo de Eduardo | Iniciar sesión normal en Edge |

### Inicio de sesión en GitHub que funcionó (19-11-2026)

- Lo que **no** sirvió: `git-credential-manager github login --browser` desde la consola de Claude ("Cannot prompt because user interactivity has been disabled"), y la ventanita gráfica del código (queda escondida).
- Lo que **sí** sirvió: correr `herramientas\login-github.ps1` en una pestaña de **terminal del usuario** (herramienta `run_in_terminal`), que usa `GCM_GUI_PROMPT=false` y `github login --device`. Claude lee el **código de 8 caracteres** con `read_terminal` y se lo dice a Eduardo; él entra a https://github.com/login/device en Edge con la cuenta cotizadora, escribe el código, **Continue** y **Authorize**.
  ```
  powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\<usuario>\Documents\CLARO\ClaroGo\repo\herramientas\login-github.ps1"
  ```
- Importante: el 18-11-2026 Eduardo escribió su contraseña de GitHub en el chat. Se le recomendó cambiarla. Si no lo hizo, recordárselo.

---

## 5. CÓMO SE ACTUALIZA LA PÁGINA (flujo de publicación)

1. Editar en `ClaroGo\repo\` (con la herramienta Edit o `sed` en Bash; **nunca** `Get-Content | Set-Content` de PowerShell 5, ver regla 9.1).
2. Subir `APP_VERSION` en `index.html` (ejemplo `2.13.1` → `2.13.2`) y, si cambió la extensión, `version` en `extension/manifest.json`.
3. Si cambió algo de `extension/`: **regenerar el zip** `ext/clarogo-genesys-extension.zip` (los instaladores bajan el zip, no la carpeta):
   ```
   powershell -NoProfile -ExecutionPolicy Bypass -File herramientas\armar-zip.ps1 -Repo "<ruta completa del repo>"
   ```
   Debe responder `archivos=<igual a las líneas de ext/extension-archivos.txt> version=<nueva>`. Si se agrega un archivo a la extensión, sumarlo a `ext/extension-archivos.txt`.
4. Anotar en `README.md` → "Historial de cambios" (arriba, con fecha y qué cambió).
5. Revisar: sin marca BOM (`head -c3 index.html` debe ser `3c 21 44`) y sin acentos rotos (`grep -c 'Ã' index.html` debe ser 0).
6. `git add …`, `git commit` (terminar el mensaje con la línea Co-Authored-By que indique la sesión) y `git push origin main`.
7. **Verificar en internet** (GitHub Pages tarda 1 a 3 minutos): `APP_VERSION` publicado, `extension/manifest.json` publicado y el zip publicado (`unzip -p zip manifest.json`). Ojo: `Invoke-WebRequest` entrega los .bat y .zip como bytes; usar `curl` en Bash.
8. Probar antes de publicar con el servidor local: `herramientas\servidor-prueba.ps1 -Root <carpeta> -Port 8765` y la herramienta del navegador integrado (`preview_start` con un `.claude/launch.json`). Para probar con datos reales de la planilla se copió el `.json` a la carpeta de prueba (nunca al repo).

### Actualizar stock (diario)

- Escritorio → **Actualizar stock ClaroGo** → elegir el Excel diario (Descargas) → revisar resumen → Sí. Publica con git del computador (necesita Git instalado y la sesión de GitHub de la sección 4).
- Alternativa desde la página: https://cotizadora.github.io/clarogo/#admin → Actualizar stock → Publicar para todos (necesita la clave de GitHub del navegador).

---

## 6. GOEXT: INSTALACIÓN Y ACTUALIZACIÓN (como cualquier ejecutivo)

### Instalar

1. https://cotizadora.github.io/clarogo/ext/ (o ClaroGo! → Descargas) → **Descargar instalador** (`instalar-clarogo.bat`) → doble clic. No necesita administrador. Hace:
   - baja `ext/clarogo-genesys-extension.zip`, lo descomprime aparte y **solo si viene completo** reemplaza `Documentos\ClaroGo\extension` (robocopy /MIR);
   - crea `Documentos\ClaroGo\actualizar-clarogo.bat` (siempre baja el instalador más nuevo y lo ejecuta);
   - crea `Documentos\ClaroGo\goext-silencioso.vbs` y la **tarea de Windows "GoExt actualizar"** (cada 2 horas, sin ventanas, modo `/silencioso`);
   - registra el enlace **`goext://`** en `HKCU\Software\Classes\goext` (abre el actualizador);
   - crea en el escritorio el acceso **"Actualizar GoExt"** (y borra el antiguo "Actualizar ClaroGo!").
2. En `edge://extensions` (Chrome: `chrome://extensions`): **Modo para desarrolladores** → **Cargar desempaquetada** → `Documentos\ClaroGo\extension` (en el cuadro de carpeta se puede pegar `%USERPROFILE%\Documents\ClaroGo\extension`).
3. Fijar el ícono rojo **G!**. Se abre con clic o **Alt+Shift+G**.

### Actualizar (ya no hay que hacer nada a mano)

- La tarea "GoExt actualizar" baja la versión nueva cada 2 horas. Al abrir Edge, GoExt parte con ella.
- Si Edge estaba abierto: notificación de Windows "GoExt X está lista: clic para activarla" o "Hay una versión nueva: clic para actualizar". También en la ventanita: "⬇ Actualizar a X" / "⟳ Activar versión X".
- Manual: doble clic en **Actualizar GoExt** del escritorio.
- **Windows 11 con Control inteligente de aplicaciones** bloquea el .bat: usar la alternativa **.zip** que está a la vista bajo el botón del instalador (Extraer todo → cargar `Descargas\goext`; para actualizar, extraer encima y "Activar versión nueva"). Ahí no hay actualización automática. No desactivar esa protección.

### Para pruebas sin tocar la instalación real

- Variable `GOEXT_BASE=<carpeta de prueba>`: el instalador usa esa carpeta y la tarea "GoExt actualizar (prueba)". Borrar la tarea al terminar: `schtasks /delete /tn "GoExt actualizar (prueba)" /f`.

---

## 7. MI PLANILLA Y DATOS DE CLIENTES

- Los clientes viven en el navegador (localStorage de cotizadora.github.io) **y** en el archivo `Documentos\ClaroGo-planilla-control.json` (guardado automático elegido con "Usar archivo existente" / "Crear archivo nuevo"). Además hay copias automáticas cada hora dentro del navegador ("Copias automáticas").
- En un PC nuevo el navegador parte vacío: usar **"Usar archivo existente"** con el `.json` (queda sincronizado) o **📂 Importar clientes**.
- La planilla se copia sola a GoExt (Historial) en cada guardado.

---

## 8. ACCESOS DIRECTOS DEL ESCRITORIO

| Acceso | Qué hace | Cómo recrearlo |
|---|---|---|
| **Actualizar GoExt** | `Documentos\ClaroGo\actualizar-clarogo.bat` | Lo crea el instalador de GoExt |
| **Actualizar stock ClaroGo** | `powershell -NoProfile -ExecutionPolicy Bypass -File "<Documentos>\CLARO\ClaroGo\actualizar-stock.ps1"` | Copiar `Documentos\CLARO\ClaroGo\Actualizar stock ClaroGo.bat` al escritorio y **corregir la ruta** dentro del .bat si el usuario de Windows del PC nuevo no se llama "Claro". El script debe estar en `ClaroGo\` porque busca la carpeta `repo` a su lado (la copia de `repo\herramientas\` es solo respaldo del código). |

---

## 9. REGLAS APRENDIDAS (no repetir errores)

1. **Codificación**: nunca reescribir `index.html` con `Get-Content | Set-Content` de Windows PowerShell 5: rompe los acentos ("Números" → "NÃºmeros") y agrega BOM. Pasó el 18-11-2026 y llegó a publicarse. Usar Edit o `sed`.
2. **Zip de GoExt**: armarlo solo con `herramientas\armar-zip.ps1` (un `powershell -Command` en línea desde Bash publicó un zip vacío el 18-11-2026). Verificar cantidad de archivos y versión antes del push.
3. **No actualizar GoExt en el PC de Eduardo** después de publicar (ni el .bat ni `goext://`): él actualiza igual que sus compañeros para monitorear que el flujo funcione. Verificar solo en internet.
4. **GoExt nunca abre ventanas solas** ni la ventanita automáticamente (en 1.40 a 1.43 una ventana se montó sobre todo y aparecía en la barra de tareas; se eliminó en 1.44.0). Avisos: dentro de la pestaña (con `pointer-events:none`) o notificación de Windows.
5. **Formulario de venta ≠ no venta**: el de venta es trámite administrativo (después de cerrar y tipificar), no toca Genesys. El de no venta sí (código de conclusión y neón en Enviar).
6. **Números a portar** solo en el módulo **Venta** de la ficha (línea 1 con su plan, adicionales con su plan de adicional). El teléfono de contacto va en **Cliente**. Nunca en dos módulos.
7. Archivos `.bat` siempre con saltos de línea Windows (CRLF); `.gitattributes` tiene `*.bat -text`.
8. Al cambiar diseño o quitar algo visible, preguntar antes (Eduardo prefiere que no se tomen decisiones de diseño por iniciativa propia). No mostrar mensajes de error técnicos al ejecutivo.
9. Precios, planes y stock son datos comerciales: no cambiarlos sin fuente indicada por Eduardo.
10. Nombre del ejecutivo y textos: Eduardo es "Eduardo Pérez"; trato formal ("usted" en mensajes a clientes); "para", nunca "pa".

---

## 10. PENDIENTES Y COSAS POR CONFIRMAR (al 20-11-2026)

- Confirmar con una llamada real: detección de **llamada cortada** (recuadro de tipificación de Genesys `acw-gadgets-wrap-up`, botón "Desconectar" del ejecutivo) y que la alerta roja aparezca dentro de la pestaña.
- Confirmar con WhatsApp real que la **lámina** se adjunta también cuando WhatsApp Web se abre o se recarga.
- Confirmar el **Rutificador en segundo plano** con el sitio real.
- Confirmar la notificación de versión nueva de GoExt dentro de Edge.
- Opción futura: publicar GoExt en la tienda de complementos de Edge (instala con un clic, se actualiza sola y no la bloquea Windows). Requiere cuenta de Microsoft Partner Center de Eduardo.
- Pendiente antiguo de `CLAUDE.md`: aclarar qué quiso decir Eduardo con "encode".
- La columna Dirección de la planilla queda angosta (114 px) en pantallas de 1366 px; Eduardo decidió dejarla así.

---

## 11. HISTORIAL RESUMIDO (con fecha y hora de Chile)

El detalle completo está en `README.md` y en `git log`. Últimos hitos:

- **20-11 10:14–10:15** Stock del 20-11-2026 desde el escritorio (Eduardo).
- **19-11 20:03** ClaroGo! v2.13.1: números a portar solo en Venta; sin "Oferta de la campaña" en la ficha.
- **19-11 20:00** v2.13.0: módulo Números a portar con plan por línea.
- **19-11 19:51** GoExt 1.44.0: sin apertura automática; alerta de llamada cortada dentro de la pestaña.
- **19-11 19:08** v2.12.2 / GoExt 1.42.0: tarea de Windows que actualiza GoExt cada 2 horas + notificación de versión nueva.
- **19-11 18:57** GoExt 1.41.0: alerta de llamada cortada.
- **19-11 16:56** v2.12.0 / GoExt 1.39.0: Rutificador automático en segundo plano al pegar el RUT.
- **19-11 16:02–16:12** instalación con .zip cuando Windows bloquea el instalador (alternativa visible).
- **19-11 15:51** GoExt 1.36.0: actualizar con un clic (`goext://`).
- **19-11 15:31** v2.11.0: sección Descargas (GoExt y MuteReal).
- **19-11 15:17** la extensión pasa a llamarse **GoExt**.
- **18-11 20:08** v2.10.0: venta línea por línea, agregar líneas fácil, cliente de prueba de 6 líneas.
- **18-11 19:07** página `ext/` e instalador .bat rápido.
- **18-11** Git instalado y sesión de GitHub en el PC antiguo; copia del pendrive puesta al día (estaba 60 commits atrás).

Comando para ver todo con hora:
```
git log --date=format:'%d-%m-%Y %H:%M' --format='%ad %h %s'
```

---

## 12. COMANDOS ÚTILES

```
# Estado y últimos cambios
git -C "<repo>" status -sb
git -C "<repo>" log --date=format:'%d-%m %H:%M' --format='%ad %h %s' -30

# Versión publicada
curl -s "https://cotizadora.github.io/clarogo/?v=$RANDOM" | grep "APP_VERSION ="
curl -s "https://cotizadora.github.io/clarogo/extension/manifest.json?v=$RANDOM" | grep version

# Zip publicado: versión y cantidad de archivos
curl -s "https://cotizadora.github.io/clarogo/ext/clarogo-genesys-extension.zip?v=$RANDOM" -o /tmp/z.zip && unzip -p /tmp/z.zip manifest.json | grep version && unzip -l /tmp/z.zip | tail -1

# Builds de GitHub Pages
curl -s "https://api.github.com/repos/cotizadora/clarogo/actions/runs?per_page=3"

# Tarea de GoExt en Windows
schtasks /query /tn "GoExt actualizar"

# Opciones del formulario de venta (lee el formulario público)
powershell -NoProfile -ExecutionPolicy Bypass -File herramientas\leer-formulario.ps1 -Html <form.html descargado con curl>

# Imagen de vista previa de GoExt para WhatsApp (1200x630)
powershell -NoProfile -ExecutionPolicy Bypass -File herramientas\imagen-goext.ps1 -Salida goext\goext-invitacion.png
```

### Herramientas del repo (`herramientas/`)

| Archivo | Para qué |
|---|---|
| `actualizar-stock.ps1`, `Actualizar stock ClaroGo.bat` | Publicar el stock diario desde el Excel |
| `armar-zip.ps1` | Regenerar el zip de GoExt |
| `login-github.ps1` | Iniciar sesión en GitHub por código de dispositivo |
| `servidor-prueba.ps1` | Servidor local para probar la página antes de publicar |
| `leer-formulario.ps1` | Listar preguntas y opciones del formulario de venta |
| `imagen-goext.ps1` | Generar la imagen de invitación de GoExt |
| `prompts-laminas.txt` | Textos para generar láminas de planes |

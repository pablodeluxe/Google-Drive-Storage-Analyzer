# 📘 Documentación Funcional y Manual de Usuario: Google Drive Storage Analyzer

Este documento describe en detalle cada una de las funcionalidades del sistema **Google Drive Storage Analyzer**, su propósito, su lógica de funcionamiento y una guía paso a paso sobre cómo utilizarlas.

---

## 📑 Tabla de Contenidos
1. [Introducción y Objetivos](#1-introducción-y-objetivos)
2. [Conexión y Modos de Acceso](#2-conexión-y-modos-de-acceso)
   - [2.1. Conexión Real con Google Drive (OAuth 2.0)](#21-conexión-real-con-google-drive-oauth-20)
   - [2.2. Modo Demostración (Datos de Prueba)](#22-modo-demostración-datos-de-prueba)
   - [2.3. Caché Local y Persistencia (IndexedDB)](#23-caché-local-y-persistencia-indexeddb)
3. [Resumen General del Almacenamiento (Storage Overview)](#3-resumen-general-del-almacenamiento-storage-overview)
4. [Visualizador de Mapa de Calor Jerárquico (Treemap Heatmap)](#4-visualizador-de-mapa-de-calor-jerárquico-treemap-heatmap)
   - [4.1. Modos de Alcance: «Por Carpeta» vs. «Top Global»](#41-modos-de-alcance-por-carpeta-vs-top-global)
   - [4.2. Navegación Jerárquica y Migas de Pan (Breadcrumbs)](#42-navegación-jerárquica-y-migas-de-pan-breadcrumbs)
   - [4.3. Selector de Densidad de Mosaicos (30, 50, 100, 250, 500)](#43-selector-de-densidad-de-mosaicos-30-50-100-250-500)
   - [4.4. Agrupación Inteligente «Otros»](#44-agrupación-inteligente-otros)
   - [4.5. Modos de Color: Por Tipo de Archivo y Paletas Térmicas](#45-modos-de-color-por-tipo-de-archivo-y-paletas-térmicas)
   - [4.6. Interacciones con los Mosaicos (Hover, Clic, Acciones Directas)](#46-interacciones-con-los-mosaicos-hover-clic-acciones-directas)
5. [Cajón de Detalles del Archivo (File Details Drawer)](#5-cajón-de-detalles-del-archivo-file-details-drawer)
6. [Asesor Inteligente de Limpieza (Cleanup Advisor)](#6-asesor-inteligente-de-limpieza-cleanup-advisor)
   - [6.1. Categorías de Detección Automática](#61-categorías-de-detección-automática)
   - [6.2. Modal de Limpieza por Lotes (Cleanup Modal)](#62-modal-de-limpieza-por-lotes-cleanup-modal)
   - [6.3. Operaciones: Papelera vs. Eliminación Permanente](#63-operaciones-papelera-vs-eliminación-permanente)
7. [Controles Generales de la Interfaz](#7-controles-generales-de-la-interfaz)

---

## 1. Introducción y Objetivos

**Google Drive Storage Analyzer** es una herramienta web interactiva diseñada para resolver uno de los problemas más habituales al gestionar Google Drive: **la falta de visibilidad sobre qué archivos y carpetas están consumiendo el espacio de almacenamiento**.

A diferencia de la interfaz nativa de Google Drive (que solo muestra listados lineales de archivos), esta aplicación ofrece:
- Una **visión espacial y proporcional** del almacenamiento mediante un Mapa de Calor (Treemap), donde el tamaño de cada rectángulo es directamente proporcional a su peso en disco.
- Herramientas automatizadas para descubrir archivos duplicados, instaladores olvidados y archivos masivos antiguos.
- Capacidad de liberar espacio de forma inmediata y segura.

---

## 2. Conexión y Modos de Acceso

La barra superior (*Header*) gestiona la autenticación y el origen de datos.

### 2.1. Conexión Real con Google Drive (OAuth 2.0)
- **Cómo usarla:**
  1. Haz clic en el botón azul **«Conectar Google Drive»** ubicado en la esquina superior derecha.
  2. Se abrirá la ventana emergente oficial de **Google Identity Services**.
  3. Selecciona tu cuenta de Google y concede los permisos de lectura y gestión de archivos.
  4. La aplicación comenzará a escanear tu unidad. Verás una barra de progreso indicando la cantidad de archivos indexados por segundo.
- **Seguridad:** La conexión es directa entre tu navegador y las APIs de Google. El token de acceso nunca se transmite a ningún servidor de terceros.

### 2.2. Modo Demostración (Datos de Prueba)
- **Propósito:** Permite probar todas las funciones, navegar por el mapa de calor y experimentar las reglas de limpieza con un conjunto de datos realista de ~50 GB sin necesidad de iniciar sesión.
- **Cómo usarlo:**
  1. En cualquier momento, pulsa el botón **«Modo Demo»**.
  2. Se cargará una estructura simulada con vídeos 4K, instaladores ISO, copias de seguridad de bases de datos, colecciones fotográficas y documentos.

### 2.3. Caché Local y Persistencia (IndexedDB)
- **Propósito:** Evita tener que reescanear todo tu Google Drive cada vez que abres o recargas la aplicación.
- **Cómo funciona:**
  - Al terminar un escaneo, los metadatos se guardan de forma encriptada en la base de datos local de tu navegador (**IndexedDB**).
  - En la barra superior verás una etiqueta con la fecha y hora del último análisis (ej. *«Caché guardada: Hoy 15:30»*).
  - Si deseas forzar una actualización para reflejar cambios recientes hechos en Drive, haz clic en el botón de **«Actualizar / Re-escanear»**.

---

## 3. Resumen General del Almacenamiento (Storage Overview)

Ubicado en la parte superior de la pantalla, este panel sintetiza la situación global del almacenamiento de tu cuenta de Google:

1. **Barra de Capacidad Global:**
   - Muestra el total consumido respecto a la cuota contratada (ej. `12.4 GB de 15 GB usados - 82.6%`).
   - Cambia dinámicamente de color según el nivel de urgencia:
     - **Azul/Verde:** Menor al 70% de ocupación.
     - **Ámbar:** Entre 70% y 85% de ocupación (alerta de espacio limitado).
     - **Rojo:** Superior al 85% (riesgo inminente de no poder recibir correos o subir archivos).
2. **Desglose por Servicios de Google:**
   - Indica el espacio ocupado individualmente por **Google Drive**, **Gmail** y **Google Fotos** (obtenido directamente de la cuota de la cuenta).
3. **Desglose por Categoría de Contenido:**
   - Muestra tarjetas de resumen con el peso y porcentaje de:
     - 🎥 **Vídeos** (archivos `.mp4`, `.mov`, `.mkv`, etc.)
     - 📦 **Archivos / ISO** (imágenes de disco, `.zip`, `.rar`, `.tar.gz`)
     - 📸 **Fotos e Imágenes** (`.raw`, `.png`, `.jpg`, `.psd`)
     - 📄 **Documentos** (`.pdf`, Google Docs, hojas de cálculo, presentaciones)
     - 🗑️ **Papelera** (espacio ocupado por archivos pendientes de vaciado)

---

## 4. Visualizador de Mapa de Calor Jerárquico (Treemap Heatmap)

Es el núcleo visual de la aplicación. Representa los archivos y carpetas como mosaicos rectangulares cuyo **ancho y alto equivalen exactamente a su tamaño en bytes**.

### 4.1. Modos de Alcance: «Por Carpeta» vs. «Top Global»
En la barra de herramientas del mapa encontrarás un selector con dos pestañas:

- **Por Carpeta (Navegación Jerárquica):**
  - Muestra exclusivamente los archivos y subcarpetas que se encuentran en el directorio actualmente activo.
  - Al inicio muestra la raíz de «Mi Unidad» y permite adentrarse en cualquier subcarpeta.
- **Top Global (Toda la Unidad):**
  - Aplana todo el contenido de tu Google Drive y muestra en pantalla los **archivos individuales más pesados de toda la cuenta**, sin importar en qué subcarpeta profunda estén guardados.
  - Es el modo más rápido para identificar qué archivo puntual está devorando la cuota.

### 4.2. Navegación Jerárquica y Migas de Pan (Breadcrumbs)
- Encima del mapa de calor, una barra de ruta (*breadcrumbs*) muestra el camino actual:
  ```
  Mi Unidad > Proyectos Audiovisuales > 2025 > Export Master
  ```
- **Cómo navegar:**
  - **Entrar a una carpeta:** Haz un solo clic sobre cualquier mosaico que represente una carpeta. El mapa de calor hará un zoom instantáneo para mostrar el contenido de esa carpeta ocupando el 100% de la pantalla.
  - **Subir de nivel:** Haz clic en cualquier carpeta previa en la barra de migas de pan, o pulsa el botón **«Volver»** con flecha a la izquierda.

### 4.3. Selector de Densidad de Mosaicos (30, 50, 100, 250, 500)
Para mantener una experiencia fluida y adaptada a la cantidad de archivos:
- Puedes seleccionar cuántos mosaicos dibujar a la vez: **`30`**, **`50`**, **`100`**, **`250`** o **`500`**.
- **Recomendación:**
  - `30` o `50`: Ideal para una visión rápida y limpia de los elementos gigantes.
  - `100` (Por defecto): El equilibrio perfecto entre detalle y legibilidad.
  - `250` o `500`: Excelente para pantallas grandes y auditorías profundas de carpetas con miles de archivos.

### 4.4. Agrupación Inteligente «Otros»
- Cuando una carpeta contiene más elementos que el límite seleccionado (por ejemplo, 1,200 fotos en una carpeta y el límite es 100):
  - El sistema toma los **99 archivos más grandes** y les asigna su mosaico individual.
  - Los 1,101 archivos restantes más pequeños se consolidan automáticamente en un mosaico gris llamado:
    `Otros (1,101 elementos más pequeños) — 1.8 GB (8.4%)`.
- De esta manera el mapa **siempre llena el 100% del lienzo** de forma matemáticamente exacta y sin ralentizar el navegador.

### 4.5. Modos de Color: Por Tipo de Archivo y Paletas Térmicas
En la esquina superior derecha del mapa puedes alternar la representación de color:

1. **Por Tipo de Archivo (Recomendado):**
   - 🔴 **Rojo/Rosa:** Vídeos.
   - 🟠 **Ámbar/Naranja:** Archivos comprimidos, instaladores e imágenes ISO.
   - 🟣 **Índigo/Púrpura:** Fotos e imágenes de alta resolución.
   - 🔵 **Azul:** Documentos y archivos de texto/hojas de cálculo.
   - 🟢 **Esmeralda:** Archivos de audio y música.
   - ⚪ **Pizarra/Gris:** Carpetas y otros formatos mixtos.
2. **Modo Térmico (Thermal):**
   - Colorea los mosaicos en un gradiente que va de azul/cian (archivos ligeros) a magenta/rojo brillante (archivos de gran peso).
3. **Modo Fuego (Fire):**
   - Utiliza una escala que va de amarillo cálido a rojo carbón oscuro para destacar visualmente los archivos que generan mayor "calor" en la cuota.

### 4.6. Interacciones con los Mosaicos
- **Puntero del Ratón (Hover):**
  - Al pasar el cursor sobre cualquier mosaico, aparece una tarjeta emergente (*Tooltip*) flotante con:
    - Nombre completo del archivo o carpeta.
    - Tamaño exacto formateado (ej. `14.82 GB`).
    - Porcentaje exacto que representa sobre la carpeta o vista activa (ej. `34.2%`).
    - Ruta completa en Google Drive.
    - Cantidad de archivos y subcarpetas contenidas (si es una carpeta).
- **Clic en Carpeta:** Desciende en la jerarquía (*drill-down*).
- **Clic en Archivo:** Abre el **Cajón Lateral de Detalles** con información exhaustiva.
- **Accesos Rápidos en Mosaicos Grandes:**
  - En mosaicos con suficiente espacio físico en pantalla, verás iconos directos para:
    - 🔗 **Abrir en Google Drive:** Abre el archivo directamente en una pestaña nueva de tu navegador.
    - 🗑️ **Mover a la papelera:** Envía el archivo a la papelera con un solo clic.

---

## 5. Cajón de Detalles del Archivo (File Details Drawer)

Al hacer clic en cualquier archivo del mapa de calor, se desliza un panel lateral desde el margen derecho con información técnica y opciones de gestión:

- **Metadatos mostrados:**
  - Nombre completo y extensión.
  - Tipo MIME oficial reportado por Google Drive.
  - Tamaño exacto en bytes y en formato legible (GB / MB / KB).
  - Fecha y hora de la última modificación.
  - Nombre y avatar del propietario del archivo.
  - Ruta de ubicación completa dentro de Google Drive.
- **Acciones Disponibles:**
  - **«Abrir en Google Drive»:** Enlace directo para previsualizar o editar en la web de Google Drive.
  - **«Mover a la papelera»:** Envía el elemento a la papelera de reciclaje de Drive. El espacio se marcará como papelera.
  - **«Eliminar permanentemente»:** Elimina el archivo de forma definitiva sin pasar por la papelera (solicita confirmación de seguridad previa).

---

## 6. Asesor Inteligente de Limpieza (Cleanup Advisor)

Ubicado debajo del mapa de calor, el **Asesor de Limpieza** analiza automáticamente todo el árbol de archivos en memoria y agrupa sugerencias de optimización en 5 tarjetas temáticas.

### 6.1. Categorías de Detección Automática
1. **Archivos Gigantes (> 1 GB):**
   - Identifica vídeos en bruto, exports 4K, backups de bases de datos o imágenes virtuales que individualmente superan 1 GB.
2. **Archivos Grandes (> 100 MB):**
   - Detecta archivos de peso considerable (presentaciones pesadas, grabaciones de Zoom, instaladores).
3. **Archivos Obsoletos (> 1 año sin modificar):**
   - Filtra archivos pesados que no han sido leídos ni modificados en los últimos 365 días y que probablemente ya no sean necesarios.
4. **Instaladores y Temporales:**
   - Detecta archivos con extensiones `.iso`, `.dmg`, `.exe`, `.pkg`, `.tar`, `.zip` que suelen descargarse una sola vez y quedan olvidados consumiendo espacio valioso.
5. **Posibles Duplicados:**
   - Compara los archivos de toda la unidad buscando aquellos que tengan **exactamente el mismo nombre y el mismo tamaño en bytes**, permitiéndote conservar uno y eliminar las copias redundantes.

### 6.2. Modal de Limpieza por Lotes (Cleanup Modal)
Al hacer clic en cualquiera de las 5 tarjetas del Asesor, se abre una ventana modal interactiva:
- **Buscador en tiempo real:** Filtra rápidamente dentro de la lista de sugerencias.
- **Casillas de Selección Múltiple (*Checkboxes*):**
  - Puedes seleccionar o deseleccionar archivos individuales.
  - Botón **«Seleccionar todos»** o **«Deseleccionar todos»**.
- **Contador Dinámico de Espacio Liberable:**
  - Un indicador superior muestra en tiempo real cuántos megabytes o gigabytes recuperarás con los archivos marcados (ej. *«18 archivos seleccionados (7.4 GB a liberar)»*).

### 6.3. Operaciones: Papelera vs. Eliminación Permanente
En el pie del modal encontrarás dos opciones de ejecución:
1. **Mover a la Papelera (Recomendado):**
   - Mueve los archivos seleccionados a la papelera de Google Drive.
   - Los archivos permanecen recuperables durante 30 días en caso de error.
2. **Eliminar Permanentemente:**
   - Invoca la llamada directa de borrado definitivo de Google Drive API.
   - Libera la cuota de almacenamiento de forma inmediata e irreversible.
   - Requiere confirmar un cuadro de diálogo de seguridad para evitar borrados accidentales.

*Al completar cualquier acción de limpieza, el mapa de calor, las tarjetas del asesor y la barra de cuota general se actualizan al instante sin requerir recargar la página.*

---

## 7. Controles Generales de la Interfaz

- **Selector de Tema (Modo Claro / Modo Oscuro):**
  - Ubicado en la cabecera (icono de Sol ☀️ / Luna 🌙).
  - Permite trabajar cómodamente en ambientes de poca luz con alto contraste y colores calibrados para no cansar la vista.
- **Información del Usuario Conectado:**
  - Muestra el nombre y correo de la cuenta de Google activa.
  - Botón de **«Cerrar Sesión»** para revocar el token en memoria y limpiar la sesión.
- **Diseño Responsivo:**
  - La interfaz se adapta automáticamente a pantallas de portátiles, monitores ultrawide y tablets, recalculando el lienzo del mapa de calor mediante `ResizeObserver`.

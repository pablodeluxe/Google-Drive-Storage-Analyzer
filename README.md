# 🚀 Google Drive Storage Analyzer

> **Analizador de almacenamiento inteligente y visualizador de mapa de calor jerárquico (Treemap Heatmap) para Google Drive.**

[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![D3 Hierarchy](https://img.shields.io/badge/D3-Hierarchy_3.1-orange.svg?style=flat-square&logo=d3.js)](https://d3js.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 🌟 Características Principales

- 🗺️ **Mapa de Calor Treemap Interactivo:** Visualiza el peso relativo de tus archivos y carpetas en un lienzo dinámico al estilo *WinDirStat / DaisyDisk*, cubriendo el 100% de la pantalla sin espacios vacíos.
- 📂 **Doble Modo de Exploración:**
  - **Por Carpetas:** Navega interactivamente (*drill-down*) carpeta por carpeta mediante migas de pan (*breadcrumbs*).
  - **Top Global:** Inspecciona directamente los archivos individuales más pesados de toda tu unidad de Google Drive.
- 🎚️ **Selector de Densidad:** Elige cuántos mosaicos renderizar a la vez (`30`, `50`, `100`, `250` o `500` mosaicos), agrupando automáticamente los elementos menores restantes en un bloque interactivo «Otros».
- 🎨 **Paletas de Color:** Alterna entre vista semántica por tipo de archivo (Vídeos, Fotos, Documentos, Archivos comprimidos/ISO) o paletas de calor de temperatura (*Thermal* y *Fire*).
- 🧹 **Asesor Inteligente de Limpieza:** Detecta al instante:
  - Archivos de más de **1 GB** y **100 MB**.
  - Archivos obsoletos que no se modifican desde hace más de 1 o 2 años.
  - Instaladores y archivos temporales (`.iso`, `.dmg`, `.exe`, `.zip`, `.tar`).
  - Posibles duplicados por coincidencia exacta de nombre y tamaño.
- 🗑️ **Gestión Directa por Lotes:** Mueve elementos a la papelera o elimínalos permanentemente desde la app con actualización inmediata del almacenamiento y la cuota.
- ⚡ **Persistencia Local con IndexedDB:** Guarda en caché el escaneo previo para que reingreses de forma instantánea sin tener que volver a escanear todo tu Drive.
- 🔧 **Diagnóstico y Configuración OAuth:** Modal guiado para ingresar tu propio ID de Cliente de Google Cloud con detección automática de errores de origen (`origin_mismatch`) y enlace directo para habilitar la API de Drive (error 403 `SERVICE_DISABLED`).
- 🔒 **100% Privado y Seguro:** Procesamiento local en el navegador del usuario (*Zero-Knowledge Client Architecture*). Ningún dato, credencial ni token sale de tu equipo.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, TypeScript 5.8, Vite 6
- **Estilos:** Tailwind CSS v4 con `@tailwindcss/vite`
- **Motor Gráfico:** `d3-hierarchy` (Squarified Treemap Layout con relación 1.1)
- **Animaciones:** `motion` (Framer Motion)
- **Iconos:** `lucide-react`
- **Base de Datos Local:** IndexedDB nativo (`DriveStorageAnalyzerDB`)
- **APIs de Google:** Google Identity Services (OAuth 2.0 Token Client) y Google Drive REST API v3

---

## 🚀 Inicio Rápido (Desarrollo Local)

### Prerrequisitos
- Node.js versión **18.x**, **20.x** o **22.x**.
- NPM, PNPM o Yarn.

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/pablodeluxe/google-drive-storage-analyzer.git
cd google-drive-storage-analyzer

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional para desarrollo, incluye modo Demo)
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre tu navegador en `http://localhost:3000`.

---

## 🔑 Configuración de Google Cloud (OAuth 2.0)

Para conectar tu propia cuenta de Google Drive:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/) y crea un proyecto.
2. En **APIs y Servicios > Biblioteca**, busca y **habilita la Google Drive API**.
3. En **Pantalla de consentimiento de OAuth**, selecciona tipo *Externo* o *Interno* y añade los scopes de Google Drive.
4. En **Credenciales**, crea un **ID de cliente de OAuth** (Tipo: *Aplicación web*):
   - **Orígenes autorizados de JavaScript:** Agrega la URL donde se ejecuta la app (ej: `http://localhost:3000` o tu dominio de producción).
5. Copia el ID de Cliente en tu `.env` (`VITE_GOOGLE_CLIENT_ID`) o ingrésalo directamente desde la interfaz con el botón de ajustes ⚙️.

---

## 📦 Compilación y Despliegue en Producción

Para compilar la aplicación para producción:

```bash
npm run build
```

Los archivos finales listos para desplegar se generarán en la carpeta `dist/`.

> 📖 **Documentación adicional disponible:**
> - 👉 **[DOCUMENTACION_TECNICA.md](./DOCUMENTACION_TECNICA.md):** Guía exhaustiva de arquitectura, tecnologías, directivas de seguridad y despliegue en producción (Docker, Cloud Run, Vercel, Netlify, Nginx).
> - 👉 **[DOCUMENTACION_FUNCIONAL.md](./DOCUMENTACION_FUNCIONAL.md):** Manual funcional completo con explicación detallada de cada módulo, visor Treemap, selector de densidades y asesor de limpieza.

---

## 📄 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo local en `http://localhost:3000`.
- `npm run build`: Compila la aplicación para producción en `/dist`.
- `npm run preview`: Previsualiza localmente el build de producción.
- `npm run lint`: Valida tipos y sintaxis con TypeScript (`tsc --noEmit`).

---

## 🛡️ Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo de licencia para más información.


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
  - **Top Global:** Inspecciona directamente los archivos más pesados de toda tu unidad de Google Drive.
- 🎚️ **Selector de Densidad:** Elige cuántos mosaicos renderizar a la vez (`30`, `50`, `100`, `250` o `500` mosaicos), agrupando los elementos restantes en un bloque interactivo «Otros».
- 🎨 **Paletas de Color:** Alterna entre vista semántica por tipo de archivo (Vídeos, Fotos, Documentos, Archivos comprimidos/ISO) o paletas de calor de temperatura (*Thermal* y *Fire*).
- 🧹 **Asesor Inteligente de Limpieza:** Detecta al instante:
  - Archivos de más de **1 GB** y **100 MB**.
  - Archivos obsoletos que no se modifican desde hace más de 1 o 2 años.
  - Instaladores y archivos temporales (.iso, .dmg, .exe, .zip).
  - Posibles duplicados por coincidencia exacta de nombre y tamaño.
- 🗑️ **Gestión Directa:** Mueve elementos a la papelera o elimínalos permanentemente desde la app con actualización inmediata del almacenamiento y cuota.
- ⚡ **Persistencia Local con IndexedDB:** Guarda en caché el escaneo previo para que reingreses de forma instantánea sin tener que volver a escanear todo tu Drive.
- 🔒 **100% Privado y Seguro:** Procesamiento local en el navegador del usuario (*Zero-Knowledge Client Architecture*). Ningún dato ni token sale de tu equipo.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, TypeScript 5.8, Vite 6
- **Estilos:** Tailwind CSS v4 con `@tailwindcss/vite`
- **Motor Gráfico:** `d3-hierarchy` (Squarified Treemap Layout)
- **Animaciones:** `motion` (Framer Motion)
- **Iconos:** `lucide-react`
- **Base de Datos Local:** IndexedDB nativo
- **APIs de Google:** Google Identity Services (OAuth 2.0) y Google Drive REST API v3

---

## 🚀 Inicio Rápido (Desarrollo Local)

### Prerrequisitos
- Node.js versión **18.x** o superior.
- NPM o Yarn.

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/pablodeluxe/Google-Drive-Storage-Analyzer.git
cd Google-Drive-Storage-Analyzer

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional para desarrollo, incluye modo Demo)
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre tu navegador en `http://localhost:3000`.

---

## 📦 Compilación y Despliegue en Producción

Para compilar la aplicación para producción:

```bash
npm run build
```

Los archivos finales listos para desplegar se generarán en la carpeta `dist/`.

> 📖 **Para una guía exhaustiva de despliegue en Docker, Cloud Run, Vercel, Netlify o servidores Nginx, consulta el documento:**
> 👉 **[DOCUMENTACION_TECNICA.md](./DOCUMENTACION_TECNICA.md)**

---

## 📄 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo local en `http://localhost:3000`.
- `npm run build`: Compila la aplicación para producción.
- `npm run preview`: Previsualiza localmente el build de producción.
- `npm run lint`: Valida tipos y sintaxis con TypeScript (`tsc --noEmit`).

---

## 🛡️ Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo de licencia para más información.

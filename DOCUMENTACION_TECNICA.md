# Documentación Técnica: Google Drive Storage Analyzer

Este documento detalla la arquitectura, el stack tecnológico, los requerimientos de infraestructura y las directrices para el despliegue en entornos productivos de **Google Drive Storage Analyzer**.

---

## 1. Descripción del Proyecto

**Google Drive Storage Analyzer** es una aplicación web de alta precisión orientada a la auditoría, inspección y optimización del almacenamiento en Google Drive. Permite a los usuarios:

- **Visualizar el consumo de espacio** mediante un **Mapa de Calor Treemap interactivo** impulsado por algoritmos de empaquetado rectangular (`d3-hierarchy`).
- **Navegar jerárquicamente** en la estructura de carpetas (*drill-down*) o inspeccionar un **Top N Global** de los archivos más pesados de todo Google Drive.
- **Identificar oportunidades de limpieza** con un **Asesor Inteligente** (detección de archivos masivos, archivos obsoletos/antiguos, instaladores ISO/DMG/EXE y posibles duplicados).
- **Gestionar archivos en tiempo real:** enviar a la papelera o eliminar permanentemente elementos con actualización inmediata del almacenamiento y cuotas.
- **Persistencia local ultrarrápida (IndexedDB):** almacena en caché el árbol de archivos y cuotas para reingresos instantáneos sin saturar los límites de peticiones de la API de Google.
- **Configuración y Diagnóstico OAuth Integrado:** soporte para Client IDs dinámicos y detección proactiva de errores de configuración (`origin_mismatch`, `SERVICE_DISABLED` 403).
- **Arquitectura Zero-Knowledge / Privacidad Total:** todo el escaneo, agregación de directorios, cálculo de tamaños y renderizado visual se procesan **100% en el navegador del usuario**. Ningún archivo, nombre o credencial se almacena en servidores externos.

---

## 2. Stack Tecnológico

### 2.1. Frontend & Core
| Tecnología | Versión | Rol / Justificación |
|---|---|---|
| **React** | 19.x | Biblioteca UI reactiva de alto rendimiento con renderizado por componentes funcionales y hooks. |
| **TypeScript** | 5.8 | Tipado estricto para modelos de datos (nodos de Drive, cuotas, estados de escaneo, eventos). |
| **Vite** | 6.x | Herramienta de compilación (*bundler*) y servidor de desarrollo con Rollup para builds optimizados. |
| **Tailwind CSS** | 4.x | Framework de utilidades CSS integrado nativamente con `@tailwindcss/vite` para estilos responsivos y modo oscuro. |
| **Lucide React** | 0.546+ | Iconografía vectorial SVG coherente, ligera y accesible. |
| **Motion** | 12.x | Transiciones fluidas, modales animados y microinteracciones de interfaz. |

### 2.2. Motor de Visualización & Algoritmos
| Tecnología | Versión | Rol / Justificación |
|---|---|---|
| **D3 Hierarchy** | 3.1.x | Motor matemático de cálculo para el Mapa de Calor Treemap (`d3Treemap`, `treemapSquarify`, `hierarchy`). |
| **Algoritmo Squarify** | Custom (1.1 ratio) | Asegura una relación de aspecto óptima (cercana al cuadrado) para que los mosaicos sean legibles y aprovechen el 100% del lienzo. |

### 2.3. APIs de Google & Autenticación
| Servicio | Versión | Rol |
|---|---|---|
| **Google Identity Services (GSI)** | v2 | Flujo OAuth 2.0 basado en Token Client (`initTokenClient`) para inicio de sesión seguro en el cliente. |
| **Google Drive REST API** | v3 | Endpoints de consulta de cuota (`/about`), listado paginado de archivos (`/files`), actualización (`/files/{id}`) y borrado (`/files/{id}`). |

### 2.4. Persistencia Local
| Tecnología | Implementación | Rol |
|---|---|---|
| **IndexedDB API** | Nativo (`DriveStorageAnalyzerDB`) | Almacenamiento local estructurado para guardar el árbol de directorios de escaneos previos e histórico de snapshots. |

---

## 3. Estructura del Código Fuente

```
/
├── public/                     # Recursos estáticos y favicon
├── src/
│   ├── components/             # Componentes modulares de interfaz de usuario
│   │   ├── CleanupAdvisor.tsx  # Tarjetas del asesor inteligente de limpieza
│   │   ├── CleanupModal.tsx    # Modal de selección y eliminación por lotes
│   │   ├── ClientIdModal.tsx   # Modal de configuración guiada de Google OAuth
│   │   ├── FileDetailsDrawer.tsx # Cajón lateral de metadatos del archivo
│   │   ├── Header.tsx          # Barra superior, autenticación y controles
│   │   ├── PrivacyPolicy.tsx   # Modal con la Política de Privacidad
│   │   ├── StorageOverview.tsx # Barra de cuota y tarjetas de categorías
│   │   ├── TermsOfService.tsx  # Modal con las Condiciones del Servicio
│   │   └── TreemapHeatmap.tsx  # Lienzo interactivo D3 Treemap con zoom
│   ├── config/                 # Configuración de OAuth y valores predeterminados
│   ├── services/               # Capa de servicios y comunicación externa
│   │   ├── auth.ts             # Cliente Google Identity Services (OAuth 2.0)
│   │   ├── db.ts               # Capa de base de datos local IndexedDB
│   │   └── drive.ts            # Consumo de Google Drive API v3 y jerarquías
│   ├── utils/
│   │   └── format.ts           # Formateadores de bytes, fechas y colores
│   ├── App.tsx                 # Componente raíz y orquestador de estado global
│   ├── index.css               # Estilos globales y configuración de Tailwind v4
│   ├── main.tsx                # Punto de entrada de React
│   └── types.ts                # Definiciones de TypeScript e interfaces
├── DOCUMENTACION_FUNCIONAL.md  # Manual de usuario y especificación funcional
├── DOCUMENTACION_TECNICA.md    # Arquitectura técnica y despliegue (este archivo)
├── README.md                   # Resumen del proyecto e inicio rápido
└── package.json                # Dependencias y scripts del proyecto
```

---

## 4. Arquitectura del Software

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NAVEGADOR CLIENTE                             │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐         ┌─────────────────────────────────┐  │
│  │   Google Identity     │         │       Google Drive API v3       │  │
│  │   Services (OAuth2)   │         │  (about.get / files.list, etc.) │  │
│  └──────────┬────────────┘         └────────────────┬────────────────┘  │
│             │ Access Token (Bearer)                 │ JSON (Batch)      │
│             ▼                                       ▼                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Servicio Drive (drive.ts)                      │  │
│  │  - Paginación continua de hasta 1000 items por lote               │  │
│  │  - Construcción del árbol jerárquico recursivo                    │  │
│  │  - Cálculo de peso acumulado, conteo de carpetas/archivos         │  │
│  │  - Detección de errores 403 (SERVICE_DISABLED / accessNotConfig)  │  │
│  └──────────────────┬───────────────────────────────┬────────────────┘  │
│                     │                               │                   │
│                     ▼                               ▼                   │
│  ┌───────────────────────────────┐     ┌─────────────────────────────┐  │
│  │    IndexedDB (db.ts)          │     │    D3 Treemap Engine        │  │
│  │  - Cache del último escaneo   │     │  - treemapSquarify (1.1)    │  │
│  │  - Histórico de instantáneas  │     │  - Límites: 30 a 500 tiles  │  │
│  │  - Carga offline / instantánea│     │  - Agrupación «Otros»       │  │
│  └───────────────────────────────┘     └──────────────┬──────────────┘  │
│                                                       │                 │
│                                                       ▼                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Interfaz de Usuario React                     │  │
│  │  - Header & StorageOverview (Cuota general de Drive, Gmail, Fotos) │  │
│  │  - TreemapHeatmap (Lienzo interactivo con zoom & drilldown)       │  │
│  │  - CleanupAdvisor (Reglas de limpieza: >1GB, >1 año, duplicados)  │  │
│  │  - FileDetailsDrawer & CleanupModal (Acciones de borrado real)    │  │
│  │  - ClientIdModal (Configuración OAuth e instrucciones de API)     │  │
│  │  - Footer (GitHub, Privacidad, Términos, Permisos de Google)      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.1. Flujo de Datos
1. **Autenticación:** El usuario pulsa «Conectar Google Drive». GSI abre la ventana emergente de Google con los permisos solicitados (`drive`, `userinfo.email`, `userinfo.profile`).
2. **Obtención de Cuota:** Se realiza una llamada a `GET https://www.googleapis.com/drive/v3/about?fields=storageQuota,user` para conocer el límite total, bytes en uso y detalles de la cuenta.
3. **Indexación de Archivos:** Se invoca `GET https://www.googleapis.com/drive/v3/files` paginado con `pageSize=1000`, solicitando únicamente los campos indispensables (`id, name, mimeType, size, quotaBytesUsed, parents, modifiedTime, webViewLink, owners, trashed`).
4. **Construcción de Árbol:** En memoria, se vinculan padres con hijos, resolviendo rutas completas y sumando recursivamente los tamaños de cada subcarpeta.
5. **Persistencia en IndexedDB:** Una vez completado, el árbol procesado se guarda localmente en IndexedDB. Al volver a abrir la aplicación, el escaneo se carga instantáneamente sin volver a consumir cuota de la API.
6. **Renderizado en Treemap:** Se normalizan los pesos y se calcula la geometría con D3. Si una carpeta supera el límite elegido (30, 50, 100, 250 o 500 elementos), los elementos menores se condensan en un nodo interactivo «Otros».

---

## 5. Requerimientos del Sistema

### 5.1. Requerimientos de Desarrollo Local
- **Node.js:** Versión `18.x`, `20.x` LTS o `22.x` LTS.
- **NPM:** Versión `9.x` o superior (o alternativa `pnpm` / `yarn`).
- **Navegador Web:** Chrome 90+, Edge 90+, Firefox 90+, Safari 15+ (con soporte para IndexedDB y ResizeObserver).

### 5.2. Requerimientos en Google Cloud Console (Para producción)
Para que los usuarios puedan autenticarse contra su propia cuenta de Google Drive en producción, se requiere configurar un proyecto en Google Cloud:

1. **Crear Proyecto:** En [Google Cloud Console](https://console.cloud.google.com/).
2. **Habilitar API:**
   - Ir a **APIs & Services > Library**.
   - Buscar y habilitar **Google Drive API** (Obligatorio para evitar el error 403 `SERVICE_DISABLED`).
   - URL directa de activación: `https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=[PROJECT_ID]`.
3. **Configurar Pantalla de Consentimiento OAuth (OAuth Consent Screen):**
   - Tipo de usuario: **Externo** (External) para público general, o **Interno** (Internal) si es para Google Workspace corporativo.
   - Datos básicos: Nombre de la app, correo de asistencia, enlaces a política de privacidad y términos.
   - **Scopes Requeridos:**
     - `https://www.googleapis.com/auth/drive` (o `.../drive.metadata.readonly` + `.../drive.file`).
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/userinfo.email`
4. **Crear Credenciales de ID de Cliente OAuth:**
   - Tipo de aplicación: **Aplicación web** (Web application).
   - Nombre: `Google Drive Storage Analyzer Prod`.
   - **Orígenes de JavaScript autorizados (Authorized JavaScript origins):**
     - Añadir la URL exacta de producción (ej. `https://tu-dominio.com`, `https://midriveanalyzer.web.app` o la URL de Cloud Run / Vercel).
     - *Nota:* Google OAuth no permite comodines (`*`) ni rutas con barra final (`/`).
5. **Copiar el Client ID:**
   - Ejemplo: `1234567890-abcdefg1234567.apps.googleusercontent.com`
   - Se configurará en la variable de entorno `VITE_GOOGLE_CLIENT_ID` o directamente a través del modal de configuración en la app.

---

## 6. Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto para producción (basado en `.env.example`):

```env
# ID de Cliente OAuth de Google Cloud Console
VITE_GOOGLE_CLIENT_ID="TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com"

# URL base del entorno productivo
APP_URL="https://tu-dominio.com"
```

---

## 7. Guía de Despliegue en Producción

Al ser una aplicación web estática del lado del cliente (SPA), puede desplegarse en cualquier servicio de alojamiento de estáticos o en un contenedor Docker con Nginx.

### Opción A: Despliegue en Plataformas Jamstack / Estáticas (Vercel, Netlify, Cloudflare Pages, Firebase Hosting)

1. **Compilar el proyecto:**
   ```bash
   npm run build
   ```
2. **Salida generada:**
   La compilación generará los archivos estáticos minimizados en la carpeta `dist/`.
3. **Regla de SPA (Single Page Application):**
   Cualquier petición que no sea un archivo físico debe ser redirigida a `index.html`.

#### Configuración para Vercel (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Configuración para Netlify (`_redirects` en `public/_redirects`):
```
/*    /index.html   200
```

---

### Opción B: Despliegue en Contenedores Docker (Cloud Run, AWS ECS, Kubernetes, Render)

Se proporciona un `Dockerfile` multi-etapa para generar una imagen ultra liviana (<25 MB) basada en Alpine Linux y Nginx:

#### `Dockerfile`:
```dockerfile
# Etapa 1: Compilación
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar código fuente y compilar
COPY . .
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

# Etapa 2: Servidor Nginx de Producción
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración personalizada de Nginx para SPA y compresión
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 8. Directivas de Seguridad & Buenas Prácticas

1. **Protocolo HTTPS Obligatorio:**
   Google Identity Services rechaza cualquier flujo OAuth originado en conexiones HTTP no seguras (salvo `http://localhost` para desarrollo).
2. **Tokens Efímeros:**
   El token de acceso OAuth obtenido reside únicamente en la memoria de la sesión activa del usuario. Nunca se almacena en `localStorage` no cifrado ni en bases de datos remotas.
3. **Manejo de Errores Resiliente:**
   - La aplicación detecta tokens expirados y solicita re-autenticación limpia.
   - Las respuestas de API deshabilitada (403 `SERVICE_DISABLED`) activan un enlace de activación guiado.
4. **Respeto a las Cuotas de Google Drive API:**
   Google impone cuotas por usuario de `12,000 queries por minuto`. El escaneo se realiza solicitando lotes de 1,000 elementos (`pageSize=1000`), lo que permite escanear unidades de más de 50,000 archivos en menos de 50 peticiones HTTP, minimizando el riesgo de errores `429 Too Many Requests`.

---

## 9. Comandos Útiles de Mantenimiento

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo local en el puerto 3000 con soporte para red (`0.0.0.0`). |
| `npm run lint` | Ejecuta el validador estático de TypeScript (`tsc --noEmit`). |
| `npm run build` | Compila el bundle optimizado para producción en `/dist`. |
| `npm run preview` | Previsualiza localmente el build de producción generado. |
| `npm run clean` | Elimina la carpeta `dist/` para realizar compilaciones limpias. |

---

## 10. Registro de Decisiones de Diseño

- **D3 Treemap con Ratio 1.1:** Se eligió un ratio de aspecto de 1.1 en lugar de valores alargados para garantizar que los mosaicos tengan proporciones rectangulares armónicas y legibles para los nombres de los archivos.
- **Atribución 0 al Nodo Raíz en D3:** El nodo raíz en `d3.hierarchy` no aporta valor propio a la suma (`sum(d => d.children?.length ? 0 : d.size)`), garantizando que el 100% de la superficie del lienzo sea cubierta por los mosaicos sin espacios vacíos ni artefactos en forma de «L».
- **Límites de Densidad (30, 50, 100, 250, 500):** Permiten al usuario ajustar la densidad del mapa según la potencia de su dispositivo o la cantidad de elementos en su unidad, consolidando los elementos menores en el mosaico interactivo «Otros».
- **Diagnósticos de Integración en Tiempo Real:** Detección contextual de errores en la API de Google Drive (como 403 `SERVICE_DISABLED` o `accessNotConfigured`) para ofrecer enlaces de solución directa en un solo clic al usuario.

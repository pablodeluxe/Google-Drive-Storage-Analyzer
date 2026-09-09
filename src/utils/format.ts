import { FileCategory, HeatmapColorMode } from '../types';

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0 || !Number.isFinite(bytes)) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const clampedI = Math.min(i, sizes.length - 1);
  const formatted = parseFloat((bytes / Math.pow(k, clampedI)).toFixed(dm));

  return `${formatted} ${sizes[clampedI]}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Desconocido';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getFileCategory(mimeType: string, filename: string = ''): FileCategory {
  if (mimeType === 'application/vnd.google-apps.folder') {
    return 'folder';
  }

  const lowerMime = mimeType.toLowerCase();
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (
    lowerMime.startsWith('video/') ||
    ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpeg'].includes(ext)
  ) {
    return 'video';
  }

  if (
    lowerMime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'tiff', 'heic', 'raw', 'psd'].includes(ext)
  ) {
    return 'image';
  }

  if (
    lowerMime.startsWith('audio/') ||
    ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma'].includes(ext)
  ) {
    return 'audio';
  }

  if (
    lowerMime.includes('zip') ||
    lowerMime.includes('tar') ||
    lowerMime.includes('compressed') ||
    lowerMime.includes('archive') ||
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso', 'dmg', 'tgz'].includes(ext)
  ) {
    return 'archive';
  }

  if (
    lowerMime.includes('spreadsheet') ||
    lowerMime.includes('excel') ||
    ['xls', 'xlsx', 'csv', 'ods'].includes(ext)
  ) {
    return 'spreadsheet';
  }

  if (
    lowerMime.includes('presentation') ||
    lowerMime.includes('powerpoint') ||
    ['ppt', 'pptx', 'key', 'odp'].includes(ext)
  ) {
    return 'presentation';
  }

  if (
    lowerMime.includes('pdf') ||
    lowerMime.includes('document') ||
    lowerMime.includes('word') ||
    lowerMime.includes('text/') ||
    ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'epub'].includes(ext)
  ) {
    return 'document';
  }

  if (
    lowerMime.includes('javascript') ||
    lowerMime.includes('json') ||
    ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'html', 'css', 'php', 'sql', 'sh'].includes(ext)
  ) {
    return 'code';
  }

  return 'other';
}

export const CATEGORY_LABELS: Record<FileCategory, string> = {
  video: 'Videos',
  image: 'Imágenes',
  audio: 'Audio',
  archive: 'Archivos Comprimidos / ISO',
  document: 'Documentos y PDFs',
  spreadsheet: 'Hojas de Cálculo',
  presentation: 'Presentaciones',
  code: 'Código / Datos',
  folder: 'Carpetas',
  other: 'Otros archivos',
};

export const CATEGORY_COLORS: Record<FileCategory, { bg: string; border: string; text: string; hex: string }> = {
  video: { bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-700 dark:text-rose-300', hex: '#f43f5e' },
  archive: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-700 dark:text-amber-300', hex: '#f59e0b' },
  image: { bg: 'bg-indigo-500/15', border: 'border-indigo-500/40', text: 'text-indigo-700 dark:text-indigo-300', hex: '#6366f1' },
  audio: { bg: 'bg-fuchsia-500/15', border: 'border-fuchsia-500/40', text: 'text-fuchsia-700 dark:text-fuchsia-300', hex: '#d946ef' },
  document: { bg: 'bg-blue-500/15', border: 'border-blue-500/40', text: 'text-blue-700 dark:text-blue-300', hex: '#3b82f6' },
  spreadsheet: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-700 dark:text-emerald-300', hex: '#10b981' },
  presentation: { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-700 dark:text-orange-300', hex: '#f97316' },
  code: { bg: 'bg-teal-500/15', border: 'border-teal-500/40', text: 'text-teal-700 dark:text-teal-300', hex: '#14b8a6' },
  folder: { bg: 'bg-slate-500/15', border: 'border-slate-500/40', text: 'text-slate-700 dark:text-slate-300', hex: '#64748b' },
  other: { bg: 'bg-gray-500/15', border: 'border-gray-500/40', text: 'text-gray-700 dark:text-gray-300', hex: '#71717a' },
};

/**
 * Returns an RGB color tuple for heatmaps based on ratio (0 to 1)
 * Heatmap gradient: "a mayor tamaño más fuerte el color"
 * - thermal: Cool Blue -> Teal -> Emerald -> Warm Yellow -> Fiery Orange -> Hot Crimson Red
 * - fire: Soft Amber -> Golden Yellow -> Vivid Orange -> Hot Red -> Deep Saturated Crimson
 */
export function getHeatmapColorForRatio(
  ratio: number,
  palette: 'thermal' | 'fire' = 'thermal'
): { hex: string; contrastText: string } {
  const clamped = Math.max(0, Math.min(1, ratio));

  const stops =
    palette === 'fire'
      ? [
          { pos: 0.0, r: 254, g: 240, b: 138 }, // #fef08a light yellow (soft)
          { pos: 0.25, r: 245, g: 158, b: 11 },  // #f59e0b amber
          { pos: 0.5, r: 234, g: 88, b: 12 },   // #ea580c vivid orange
          { pos: 0.75, r: 220, g: 38, b: 38 },  // #dc2626 hot fiery red
          { pos: 1.0, r: 153, g: 27, b: 27 },   // #991b1b deep saturated crimson
        ]
      : [
          { pos: 0.0, r: 2, g: 132, b: 199 },   // #0284c7 cool ocean blue
          { pos: 0.2, r: 13, g: 148, b: 136 },  // #0d9488 cool teal
          { pos: 0.4, r: 16, g: 185, b: 129 },  // #10b981 fresh emerald green
          { pos: 0.6, r: 234, g: 179, b: 8 },   // #eab308 warm golden yellow
          { pos: 0.8, r: 234, g: 88, b: 12 },   // #ea580c blazing orange
          { pos: 1.0, r: 220, g: 38, b: 38 },   // #dc2626 hot intense red
        ];

  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i].pos && clamped <= stops[i + 1].pos) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const range = upper.pos - lower.pos;
  const factor = range === 0 ? 0 : (clamped - lower.pos) / range;

  const r = Math.round(lower.r + factor * (upper.r - lower.r));
  const g = Math.round(lower.g + factor * (upper.g - lower.g));
  const b = Math.round(lower.b + factor * (upper.b - lower.b));

  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

  // Calculate luminance for contrast
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const contrastText = luminance > 0.62 ? '#0f172a' : '#ffffff';

  return { hex, contrastText };
}

import React from 'react';
import {
  X,
  Folder,
  File,
  ExternalLink,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  HardDrive,
  UserCheck,
} from 'lucide-react';
import { DriveNode } from '../types';
import {
  formatBytes,
  formatDate,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '../utils/format';

interface FileDetailsDrawerProps {
  selectedNode: DriveNode | null;
  onClose: () => void;
  onNavigateToNode: (node: DriveNode) => void;
  onRequestTrash: (node: DriveNode) => void;
}

export const FileDetailsDrawer: React.FC<FileDetailsDrawerProps> = ({
  selectedNode,
  onClose,
  onNavigateToNode,
  onRequestTrash,
}) => {
  if (!selectedNode) return null;

  const isFolder = selectedNode.isFolder;
  const categoryConfig = CATEGORY_COLORS[selectedNode.category] || CATEGORY_COLORS.other;

  return (
    <div
      id="file-details-drawer"
      className="w-full lg:w-84 xl:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between shrink-0 space-y-4"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isFolder ? 'bg-amber-500/15 text-amber-600' : 'bg-blue-500/15 text-blue-600'
              }`}
            >
              {isFolder ? <Folder className="w-5 h-5" /> : <File className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                {isFolder ? 'Carpeta / Directorio' : 'Detalle del archivo'}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate" title={selectedNode.name}>
                {selectedNode.name}
              </h4>
            </div>
          </div>

          <button
            id="close-drawer-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Size Display */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Espacio que ocupa
            </span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatBytes(selectedNode.size)}
            </span>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryConfig.bg} ${categoryConfig.text} border ${categoryConfig.border}`}
          >
            {CATEGORY_LABELS[selectedNode.category]}
          </span>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400 font-medium">Ubicación / Ruta:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 break-all bg-slate-100/70 dark:bg-slate-800/80 p-2 rounded-lg text-[11px]">
              {selectedNode.path || selectedNode.name}
            </span>
          </div>

          {selectedNode.modifiedTime && (
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-400">Última modificación:</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {formatDate(selectedNode.modifiedTime)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-slate-400">Propietario:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Tú (Propietario directo)</span>
            </span>
          </div>

          {isFolder && (
            <>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400">Archivos totales:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 font-mono">
                  {selectedNode.fileCount}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400">Subcarpetas:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 font-mono">
                  {selectedNode.folderCount}
                </span>
              </div>
            </>
          )}

          {!isFolder && selectedNode.mimeType && (
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-400">Tipo MIME:</span>
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]" title={selectedNode.mimeType}>
                {selectedNode.mimeType}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {isFolder ? (
          <button
            id="drawer-open-folder-btn"
            type="button"
            onClick={() => onNavigateToNode(selectedNode)}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Explorar mosaico de esta carpeta</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : selectedNode.webViewLink ? (
          <a
            id="drawer-open-drive-link"
            href={selectedNode.webViewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Ver en Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : null}

        <button
          id="drawer-trash-btn"
          type="button"
          onClick={() => onRequestTrash(selectedNode)}
          className="w-full py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Mover a la papelera (Liberar {formatBytes(selectedNode.size)})</span>
        </button>
      </div>
    </div>
  );
};

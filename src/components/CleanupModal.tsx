import React from 'react';
import { AlertTriangle, Trash2, X, Check, Folder, File } from 'lucide-react';
import { DriveNode } from '../types';
import { formatBytes } from '../utils/format';

interface CleanupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  items: DriveNode[];
  isProcessing: boolean;
  isPermanent?: boolean;
}

export const CleanupModal: React.FC<CleanupModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  items,
  isProcessing,
  isPermanent = false,
}) => {
  if (!isOpen || items.length === 0) return null;

  const totalBytes = items.reduce((acc, item) => acc + item.size, 0);

  return (
    <div
      id="cleanup-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs transition-opacity"
    >
      <div
        id="cleanup-modal-card"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {isPermanent
                  ? '¿Eliminar permanentemente?'
                  : '¿Mover a la Papelera de Google Drive?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isPermanent
                  ? 'Esta acción destruirá los archivos definitivamente.'
                  : 'Podrás restaurar los archivos desde la papelera de Google Drive si lo deseas.'}
              </p>
            </div>
          </div>
          <button
            id="close-cleanup-modal-btn"
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Affected Items List */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Espacio a liberar
              </span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                {formatBytes(totalBytes)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Elementos seleccionados
              </span>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {items.length} {items.length === 1 ? 'elemento' : 'elementos'}
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
              Lista de archivos afectados:
            </span>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-white dark:bg-slate-900/40">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-sm hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.isFolder ? (
                      <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
                    <span className="truncate text-slate-800 dark:text-slate-200 font-medium text-xs">
                      {item.name}
                    </span>
                  </div>
                  <span className="shrink-0 font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {formatBytes(item.size)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 leading-relaxed">
            <strong>Aviso de seguridad:</strong> Los archivos se moverán a tu Papelera oficial de Google Drive. Para liberar cuota de inmediato, también podrás vaciar la papelera directamente en Google Drive.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            id="cancel-cleanup-btn"
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            id="confirm-cleanup-btn"
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>
                  {isPermanent ? 'Eliminar definitivamente' : 'Mover a la Papelera'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

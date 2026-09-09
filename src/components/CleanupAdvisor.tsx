import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Trash2,
  CheckSquare,
  Square,
  File,
  Folder,
  ArrowRight,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { DriveNode } from '../types';
import { formatBytes, formatDate, CATEGORY_LABELS } from '../utils/format';

interface CleanupAdvisorProps {
  allNodes: DriveNode[];
  onSelectNode: (node: DriveNode) => void;
  onNavigateToNode: (node: DriveNode) => void;
  onRequestBulkTrash: (nodes: DriveNode[]) => void;
}

export const CleanupAdvisor: React.FC<CleanupAdvisorProps> = ({
  allNodes,
  onSelectNode,
  onNavigateToNode,
  onRequestBulkTrash,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'files' | 'folders' | 'stale'>('files');

  const filesOnly = useMemo(() => allNodes.filter((n) => !n.isFolder), [allNodes]);
  const foldersOnly = useMemo(() => allNodes.filter((n) => n.isFolder && n.id !== 'root'), [allNodes]);

  // Top largest files
  const topFiles = useMemo(() => {
    return [...filesOnly].sort((a, b) => b.size - a.size).slice(0, 15);
  }, [filesOnly]);

  // Top largest folders
  const topFolders = useMemo(() => {
    return [...foldersOnly].sort((a, b) => b.size - a.size).slice(0, 10);
  }, [foldersOnly]);

  // Stale files (> 2 years)
  const staleFiles = useMemo(() => {
    const twoYearsAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 365 * 2;
    return [...filesOnly]
      .filter((f) => f.modifiedTime && new Date(f.modifiedTime).getTime() < twoYearsAgo)
      .sort((a, b) => b.size - a.size)
      .slice(0, 15);
  }, [filesOnly]);

  const displayedList =
    activeTab === 'files' ? topFiles : activeTab === 'folders' ? topFolders : staleFiles;

  const toggleSelect = (node: DriveNode) => {
    const next = new Set(selectedIds);
    if (next.has(node.id)) {
      next.delete(node.id);
    } else {
      next.add(node.id);
    }
    setSelectedIds(next);
  };

  const selectAllDisplayed = () => {
    const next = new Set(selectedIds);
    const allSelected = displayedList.every((item) => next.has(item.id));
    if (allSelected) {
      displayedList.forEach((item) => next.delete(item.id));
    } else {
      displayedList.forEach((item) => next.add(item.id));
    }
    setSelectedIds(next);
  };

  const selectedNodes = useMemo(() => {
    const map = new Map(allNodes.map((n) => [n.id, n]));
    return Array.from(selectedIds)
      .map((id) => map.get(id))
      .filter((n): n is DriveNode => Boolean(n));
  }, [selectedIds, allNodes]);

  const selectedTotalBytes = selectedNodes.reduce((acc, n) => acc + n.size, 0);

  return (
    <div
      id="cleanup-advisor-card"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Sugerencias para liberar almacenamiento
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Identifica rápidamente elementos que consumen más gigabytes
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700">
          <button
            id="advisor-tab-files"
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'files'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Archivos Gigantes ({topFiles.length})
          </button>
          <button
            id="advisor-tab-folders"
            onClick={() => setActiveTab('folders')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'folders'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Carpetas más Pesadas ({topFolders.length})
          </button>
          <button
            id="advisor-tab-stale"
            onClick={() => setActiveTab('stale')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'stale'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Inactivos &gt;2 años ({staleFiles.length})
          </button>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      <div className="flex items-center justify-between text-xs py-1">
        <button
          onClick={selectAllDisplayed}
          className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
        >
          {displayedList.every((item) => selectedIds.has(item.id)) && displayedList.length > 0 ? (
            <CheckSquare className="w-4 h-4 text-blue-600" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
          <span>Seleccionar todos ({displayedList.length})</span>
        </button>

        {selectedIds.size > 0 && (
          <button
            id="advisor-bulk-trash-btn"
            onClick={() => onRequestBulkTrash(selectedNodes)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              Mover {selectedIds.size} a la papelera (Liberar {formatBytes(selectedTotalBytes)})
            </span>
          </button>
        )}
      </div>

      {/* List of items */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto bg-slate-50/40 dark:bg-slate-900/30">
        {displayedList.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            No se encontraron elementos que coincidan con este criterio.
          </div>
        ) : (
          displayedList.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                id={`advisor-item-${item.id}`}
                className={`px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/60 ${
                  isSelected ? 'bg-blue-50/70 dark:bg-blue-950/40' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleSelect(item)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div
                    onClick={() => onSelectNode(item)}
                    className="min-w-0 cursor-pointer flex-1"
                  >
                    <div className="flex items-center gap-1.5">
                      {item.isFolder ? (
                        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <File className="w-4 h-4 text-blue-500 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                      {item.path || item.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs block">
                      {formatBytes(item.size)}
                    </span>
                    {item.modifiedTime && (
                      <span className="text-[10px] text-slate-400">
                        {formatDate(item.modifiedTime)}
                      </span>
                    )}
                  </div>

                  {item.isFolder ? (
                    <button
                      type="button"
                      onClick={() => onNavigateToNode(item)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg"
                      title="Explorar mosaico de esta carpeta"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : item.webViewLink ? (
                    <a
                      href={item.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Abrir en Google Drive"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

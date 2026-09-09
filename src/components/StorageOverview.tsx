import React from 'react';
import {
  HardDrive,
  Video,
  Archive,
  Image as ImageIcon,
  FileText,
  Clock,
  Sparkles,
  Search,
  Filter,
  UserCheck,
} from 'lucide-react';
import { StorageQuota, FileCategory, DriveNode } from '../types';
import { formatBytes, CATEGORY_LABELS } from '../utils/format';

interface StorageOverviewProps {
  quota: StorageQuota | null;
  allNodes: DriveNode[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: FileCategory | 'huge' | 'stale' | 'all';
  onSelectCategory: (cat: FileCategory | 'huge' | 'stale' | 'all') => void;
}

export const StorageOverview: React.FC<StorageOverviewProps> = ({
  quota,
  allNodes,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}) => {
  const usage = quota?.usage || 0;
  const limit = quota?.limit || 0;
  const percentage = limit > 0 ? Math.min(100, Math.round((usage / limit) * 100)) : 0;
  const isNearLimit = percentage >= 85;

  // Calculate statistics across all files
  const fileNodes = allNodes.filter((n) => !n.isFolder);

  const stats = React.useMemo(() => {
    let videoBytes = 0;
    let archiveBytes = 0;
    let imageBytes = 0;
    let docBytes = 0;
    let hugeFilesCount = 0;
    let hugeFilesBytes = 0;
    let staleFilesCount = 0;
    let staleFilesBytes = 0;

    const twoYearsAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 365 * 2;

    for (const file of fileNodes) {
      if (file.category === 'video') videoBytes += file.size;
      if (file.category === 'archive') archiveBytes += file.size;
      if (file.category === 'image') imageBytes += file.size;
      if (file.category === 'document') docBytes += file.size;

      // Huge files (> 500 MB)
      if (file.size >= 500 * 1024 * 1024) {
        hugeFilesCount++;
        hugeFilesBytes += file.size;
      }

      // Stale files (> 2 years)
      if (file.modifiedTime && new Date(file.modifiedTime).getTime() < twoYearsAgo) {
        staleFilesCount++;
        staleFilesBytes += file.size;
      }
    }

    return {
      videoBytes,
      archiveBytes,
      imageBytes,
      docBytes,
      hugeFilesCount,
      hugeFilesBytes,
      staleFilesCount,
      staleFilesBytes,
    };
  }, [fileNodes]);

  return (
    <div
      id="storage-overview-container"
      className="space-y-4"
    >
      {/* Quota Progress Meter Bar */}
      {quota && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Almacenamiento de Google Drive
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {quota.userName} ({quota.userEmail})
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                {formatBytes(usage)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                {limit > 0 ? `de ${formatBytes(limit)} (${percentage}%)` : 'usados'}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          {limit > 0 && (
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isNearLimit ? 'bg-rose-500' : percentage > 65 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}

          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Filtro estricto: Solo archivos de tu propiedad (los archivos compartidos por otros no consumen tu cuota)</span>
            </div>
            {quota.usageInDriveTrash > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ {formatBytes(quota.usageInDriveTrash)} en papelera
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Cleanup Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-files-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, extensión (.mov, .zip, .pdf)..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-200"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            id="filter-all-btn"
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Todos ({fileNodes.length})
          </button>

          <button
            id="filter-huge-btn"
            type="button"
            onClick={() => onSelectCategory('huge')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === 'huge'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gigantes &gt;500MB ({formatBytes(stats.hugeFilesBytes)})</span>
          </button>

          <button
            id="filter-video-btn"
            type="button"
            onClick={() => onSelectCategory('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === 'video'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-rose-500" />
            <span>Videos ({formatBytes(stats.videoBytes)})</span>
          </button>

          <button
            id="filter-archive-btn"
            type="button"
            onClick={() => onSelectCategory('archive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === 'archive'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-amber-500" />
            <span>Zips / ISO ({formatBytes(stats.archiveBytes)})</span>
          </button>

          <button
            id="filter-stale-btn"
            type="button"
            onClick={() => onSelectCategory('stale')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === 'stale'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Antiguos &gt;2 años ({formatBytes(stats.staleFilesBytes)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

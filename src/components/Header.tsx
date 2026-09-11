import React, { useRef } from 'react';
import {
  RotateCw,
  LogOut,
  Sparkles,
  HardDrive,
  Download,
  Upload,
  Database,
  KeyRound,
} from 'lucide-react';
import { ScanProgress, AppUser } from '../types';

interface HeaderProps {
  user: AppUser | null;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onRescan: () => void;
  scanProgress: ScanProgress;
  isLoggingIn: boolean;
  cachedTimestamp?: number | null;
  onExportJSON?: () => void;
  onImportJSON?: (file: File) => void;
  onClearCache?: () => void;
  onOpenClientIdModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isDemoMode,
  onToggleDemoMode,
  onSignIn,
  onSignOut,
  onRescan,
  scanProgress,
  isLoggingIn,
  cachedTimestamp,
  onExportJSON,
  onImportJSON,
  onClearCache,
  onOpenClientIdModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportJSON) {
      onImportJSON(file);
      e.target.value = '';
    }
  };
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                Drive Storage Heatmap
              </h1>
              {isDemoMode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  Modo Demo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
              Mapa de calor y análisis de mosaicos para liberar espacio en Google Drive
            </p>
          </div>
        </div>

        {/* Actions & User state */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Scan button */}
          <button
            id="rescan-drive-btn"
            type="button"
            onClick={onRescan}
            disabled={scanProgress.isScanning}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Volver a escanear Google Drive"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${scanProgress.isScanning ? 'animate-spin text-blue-600' : ''}`}
            />
            <span className="hidden md:inline">
              {scanProgress.isScanning ? 'Escaneando...' : 'Re-escanear'}
            </span>
          </button>

          {/* Hidden file input for JSON import */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Local Snapshot Export/Import */}
          <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2">
            {onExportJSON && (
              <button
                id="export-json-btn"
                type="button"
                onClick={onExportJSON}
                className="p-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Exportar copia local del análisis (.json)"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            {onImportJSON && (
              <button
                id="import-json-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Cargar análisis desde archivo .json local"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Demo toggle */}
          <button
            id="toggle-demo-mode-btn"
            type="button"
            onClick={onToggleDemoMode}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
              isDemoMode
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">
              {isDemoMode ? 'Ver mi cuenta real' : 'Probar Demo'}
            </span>
          </button>

          {/* OAuth Client ID Settings button */}
          {onOpenClientIdModal && (
            <button
              id="header-client-id-config-btn"
              type="button"
              onClick={onOpenClientIdModal}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              title="Configurar Google Client ID / Orígenes OAuth"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          )}

          {/* User authentication */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[130px]">
                  {user.displayName || user.email}
                </span>
                <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                  {user.email}
                </span>
              </div>
              <button
                id="sign-out-btn"
                type="button"
                onClick={onSignOut}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Official Google Sign-In Button */
            <button
              id="google-sign-in-btn"
              type="button"
              onClick={onSignIn}
              disabled={isLoggingIn}
              className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs px-3 py-2 rounded-xl border border-slate-300 shadow-2xs hover:shadow-xs transition-all active:bg-slate-100 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isLoggingIn ? 'Conectando...' : 'Conectar Google Drive'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Scanning status banner */}
      {scanProgress.isScanning && (
        <div className="bg-blue-600 text-white px-4 py-2 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
            <span>{scanProgress.message}</span>
          </div>
          <span className="font-mono font-bold">
            {scanProgress.filesFound.toLocaleString()} archivos detectados
          </span>
        </div>
      )}
    </header>
  );
};

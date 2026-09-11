import React, { useState, useEffect } from 'react';
import { X, KeyRound, Copy, Check, ExternalLink, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getActiveGoogleClientId, setCustomGoogleClientId } from '../services/auth';

interface ClientIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavedAndConnect: () => void;
}

export const ClientIdModal: React.FC<ClientIdModalProps> = ({
  isOpen,
  onClose,
  onSavedAndConnect,
}) => {
  const [clientIdInput, setClientIdInput] = useState('');
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const activeClientId = getActiveGoogleClientId();

  useEffect(() => {
    if (isOpen) {
      setClientIdInput(activeClientId);
      setSavedSuccess(false);
    }
  }, [isOpen, activeClientId]);

  if (!isOpen) return null;

  const handleCopyOrigin = () => {
    if (currentOrigin) {
      navigator.clipboard.writeText(currentOrigin);
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2000);
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = clientIdInput.trim();
    setCustomGoogleClientId(cleanId);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
      onSavedAndConnect();
    }, 400);
  };

  const handleResetToDefault = () => {
    setCustomGoogleClientId('');
    setClientIdInput(getActiveGoogleClientId());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div
      id="client-id-config-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
    >
      <div
        id="client-id-config-modal"
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Configuración de Google OAuth 2.0
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resuelve errores de <span className="font-mono text-blue-600 dark:text-blue-400">origin_mismatch</span> en Vercel
              </p>
            </div>
          </div>
          <button
            id="close-client-id-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Step 1: Authorized Origin verification */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                1. Origen de tu aplicación en Vercel:
              </span>
              <button
                id="copy-origin-btn"
                type="button"
                onClick={handleCopyOrigin}
                className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {copiedOrigin ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar URI</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all">
              {currentOrigin || 'https://google-drive-storage-analyzer.vercel.app'}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              ⚠️ En Google Cloud Console, este valor debe estar en <strong>«Orígenes autorizados de JavaScript»</strong> exactamente igual y <strong>SIN barra final (<code className="font-mono text-rose-500">/</code>)</strong>.
            </p>
          </div>

          {/* Step 2: Client ID input */}
          <form onSubmit={handleSave} className="space-y-3">
            <label htmlFor="custom-client-id-input" className="block font-semibold text-slate-900 dark:text-slate-100">
              2. ID de cliente de OAuth 2.0 (Client ID):
            </label>
            <textarea
              id="custom-client-id-input"
              rows={2}
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              placeholder="123456789-xxxxxxxxxxxx.apps.googleusercontent.com"
              className="w-full px-3 py-2.5 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Puedes guardar aquí tu propio Client ID sin necesidad de volver a compilar o redesplegar en Vercel. Se guardará de inmediato en tu navegador.
            </p>
          </form>

          {/* Tips Checklist */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2 text-[11px]">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Causas comunes del error origin_mismatch:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-700 dark:text-slate-300">
              <li>
                <strong>Propagación de Google:</strong> Guardar un nuevo origen en Google Cloud puede tardar de <strong>2 a 5 minutos</strong> en tener efecto.
              </li>
              <li>
                <strong>Barra diagonal:</strong> Asegúrate de que no termine con <code className="font-mono">.app/</code>.
              </li>
              <li>
                <strong>Tipo de credencial:</strong> Debe ser una credencial de tipo <strong>«Aplicación web»</strong> (*Web Application*).
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="reset-client-id-btn"
            type="button"
            onClick={handleResetToDefault}
            className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline cursor-pointer"
          >
            Restaurar valor predeterminado
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="cancel-client-id-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              id="save-and-connect-btn"
              type="button"
              onClick={() => handleSave()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>¡Guardado! Conectando...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Guardar y Probar Conexión</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

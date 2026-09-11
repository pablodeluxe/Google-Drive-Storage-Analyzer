import React from 'react';
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, HardDrive, Trash2 } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
  onNavigateToPrivacy?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack, onNavigateToPrivacy }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <button
            id="terms-back-btn"
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Analizador</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Condiciones del Servicio
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Google Drive Storage Analyzer • Última actualización: Marzo 2025
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Herramienta Analítica</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Diseñada exclusivamente para visualizar el consumo de almacenamiento y ayudar a organizar tu espacio.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Acciones del Usuario</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Cualquier envío a la papelera o eliminación requiere tu confirmación explícita previa en la interfaz.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sin Garantías / Tal Cual</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              El servicio se ofrece de forma gratuita y bajo el principio estándar «tal cual» (*as-is*).
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-bold">1</span>
              Aceptación de las Condiciones
            </h2>
            <p>
              Al acceder o utilizar <strong>Google Drive Storage Analyzer</strong> («el Servicio» o «la Aplicación»), aceptas quedar vinculado por estas Condiciones del Servicio. Si no estás de acuerdo con alguno de los términos, te solicitamos no utilizar la aplicación ni conectar tu cuenta de Google.
            </p>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-bold">2</span>
              Descripción del Servicio y Propósito
            </h2>
            <p>
              Google Drive Storage Analyzer es una utilidad de visualización e higiene de almacenamiento interactiva que permite a los usuarios:
            </p>
            <ul className="space-y-2 my-2 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Explorar la jerarquía de carpetas y archivos mediante diagramas de árbol (*treemap* o mapa de calor).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Identificar archivos voluminosos, duplicados o no modificados durante períodos prolongados.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Exportar informes analíticos en formato JSON o CSV directamente a tu dispositivo local.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Mover voluntariamente a la papelera elementos seleccionados mediante la API oficial de Google Drive.</span>
              </li>
            </ul>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-bold">3</span>
              Responsabilidad sobre Archivos y Eliminaciones
            </h2>
            <p>
              El usuario es el único y exclusivo responsable de la revisión y verificación de los archivos antes de proceder a su eliminación o traslado a la papelera.
            </p>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Aviso de seguridad:</strong> Cuando utilizas las funciones de limpieza, la Aplicación solicita confirmación en pantalla antes de enviar solicitudes a Google Drive. Los archivos movidos a la papelera se gestionan bajo las políticas de retención propias de Google Drive (donde habitualmente se conservan durante 30 días antes del vaciado definitivo).
              </div>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-bold">4</span>
              Relación con Google y Servicios de Terceros
            </h2>
            <p>
              Google Drive Storage Analyzer es una herramienta independiente desarrollada con propósitos analíticos. <strong>No está afiliada, patrocinada, respaldada ni certificada por Google LLC ni Alphabet Inc.</strong> Todos los logotipos, marcas comerciales y nombres de productos de Google son propiedad de sus respectivos titulares.
            </p>
            <p>
              El uso de la cuenta de Google a través de esta aplicación está sujeto en todo momento a las{' '}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 underline font-medium"
              >
                Condiciones del Servicio de Google
              </a>
              .
            </p>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-bold">5</span>
              Exclusión de Garantías y Limitación de Responsabilidad
            </h2>
            <p>
              La Aplicación se proporciona «tal cual» (*as is*) y «según disponibilidad» (*as available*), sin garantías de ningún tipo, ya sean expresas o implícitas.
            </p>
            <p>
              En la máxima medida permitida por la legislación aplicable, el desarrollador no será responsable por ninguna pérdida directa, indirecta, incidental o consecuente, incluida la pérdida de datos, interrupción de servicios, discrepancias en el cálculo de cuotas de Google o errores de conectividad derivados de la red o de la API de Google.
            </p>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-bold">6</span>
              Privacidad y Tratamiento de Datos
            </h2>
            <p>
              Para conocer en detalle cómo se tratan y protegen los metadatos de tu cuenta y el uso del almacenamiento local, consulta nuestra{' '}
              <button
                type="button"
                onClick={onNavigateToPrivacy}
                className="text-blue-600 dark:text-blue-400 underline font-semibold cursor-pointer"
              >
                Política de Privacidad
              </button>
              .
            </p>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-bold">7</span>
              Modificaciones de las Condiciones
            </h2>
            <p>
              Nos reservamos el derecho de actualizar o modificar estas Condiciones del Servicio en cualquier momento. Cualquier cambio entrará en vigor de inmediato tras su publicación en esta misma página.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center py-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            Volver a la Aplicación
          </button>
          {onNavigateToPrivacy && (
            <button
              type="button"
              onClick={onNavigateToPrivacy}
              className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs transition-colors cursor-pointer"
            >
              Ver Política de Privacidad
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

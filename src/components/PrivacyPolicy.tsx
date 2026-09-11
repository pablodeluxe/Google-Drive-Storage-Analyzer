import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, HardDrive, EyeOff, ServerOff, Database, Mail, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
  onNavigateToTerms?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, onNavigateToTerms }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <button
            id="privacy-back-btn"
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Analizador</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Política de Privacidad
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Google Drive Storage Analyzer • Última actualización: Marzo 2025
              </p>
            </div>
          </div>
        </div>

        {/* Quick Highlights Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ServerOff className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">100% En tu Navegador</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tus archivos, nombres y carpetas nunca pasan por servidores externos. Todo el análisis se ejecuta localmente en tu cliente.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sin Lectura de Contenido</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              La herramienta solo solicita metadatos de almacenamiento (peso en bytes, tipo MIME y jerarquía) para armar el mapa de espacio.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sin Venta de Datos</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              No compartimos, vendemos, ni entrenamos modelos de inteligencia artificial con tus datos de Google Drive.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold">1</span>
              Introducción y Compromiso
            </h2>
            <p>
              Esta Política de Privacidad describe cómo <strong>Google Drive Storage Analyzer</strong> («la Aplicación») recopila, utiliza y protege la información cuando te conectas utilizando los servicios de Google OAuth 2.0 y las APIs de Google Drive.
            </p>
            <p>
              Nuestra filosofía fundamental es la <strong>privacidad por diseño</strong>: la aplicación está diseñada como una herramienta analítica del lado del cliente (*client-side application*), lo que significa que el procesamiento de tus archivos ocurre directamente en tu navegador y no en bases de datos intermedias de terceros.
            </p>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold">2</span>
              Datos a los que Accede la Aplicación
            </h2>
            <p>
              Cuando autorizas la conexión mediante el protocolo oficial de Google Identity Services, la Aplicación solicita acceso temporal a los siguientes alcances (*scopes*):
            </p>
            <ul className="space-y-2.5 my-3 pl-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100 font-medium">Metadatos de Google Drive:</strong> Nombres de archivo, identificadores de carpeta, tipo de archivo (MIME type), tamaño en bytes y fecha de última modificación. Estos datos se utilizan exclusivamente para calcular el desglose por categorías y renderizar el diagrama de árbol (treemap).
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100 font-medium">Información de Perfil Básica:</strong> Nombre, dirección de correo electrónico y foto de perfil del usuario de Google conectado, con el único fin de mostrar en el encabezado de la aplicación con qué cuenta se está interactuando.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100 font-medium">Capacidad de Almacenamiento:</strong> Cuota total asignada y espacio consumido devueltos por la API oficial de Google Drive.
                </div>
              </li>
            </ul>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
              <strong>Importante:</strong> La Aplicación <em>no lee ni descarga</em> el contenido íntimo de tus documentos de texto, hojas de cálculo, presentaciones, fotografías o videos personales.
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold">3</span>
              Almacenamiento Local y Caché
            </h2>
            <p>
              Para evitar llamadas repetitivas e innecesarias a la API de Google y optimizar los tiempos de carga, los metadatos escaneados se guardan temporalmente en el almacenamiento local de tu propio navegador (a través de la API estándar de <em>IndexedDB</em> o <em>localStorage</em>).
            </p>
            <p>
              En cualquier momento puedes borrar completamente esta copia local utilizando el botón <strong>«Limpiar Caché»</strong> ubicado en la barra de herramientas superior, o cerrando tu sesión con el botón <strong>«Desconectar»</strong>.
            </p>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold">4</span>
              Cumplimiento con la Política de Datos de Usuario de la API de Google
            </h2>
            <p>
              El uso y la transferencia que <em>Google Drive Storage Analyzer</em> realiza de la información recibida de las APIs de Google hacia cualquier otra aplicación se adhiere a la{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-700"
              >
                Política de Datos de Usuario de los Servicios de la API de Google
              </a>
              , incluidos los requisitos de <strong>Uso Limitado (Limited Use)</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
              <li>No utilizamos los datos de Google para mostrar anuncios publicitarios ni crear perfiles comerciales.</li>
              <li>No compartimos los datos con terceros bajo ninguna circunstancia.</li>
              <li>No empleamos los datos para entrenar modelos de lenguaje o algoritmos de inteligencia artificial externos.</li>
            </ul>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold">5</span>
              Revocación del Acceso
            </h2>
            <p>
              Tienes el control total de los accesos concedidos. Puedes revocar el acceso de esta aplicación en cualquier momento desde el panel de seguridad de tu cuenta de Google visitando:{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-700 break-all"
              >
                https://myaccount.google.com/permissions
              </a>
              .
            </p>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold">6</span>
              Contacto
            </h2>
            <p>
              Si tienes preguntas sobre esta Política de Privacidad o sobre el funcionamiento de la herramienta, puedes contactar al desarrollador directamente a través de las opciones del proyecto o por correo electrónico.
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
          {onNavigateToTerms && (
            <button
              type="button"
              onClick={onNavigateToTerms}
              className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs transition-colors cursor-pointer"
            >
              Ver Condiciones del Servicio
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

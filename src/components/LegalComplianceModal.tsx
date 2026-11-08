import React from 'react';
import { X, Shield, Globe, Trash2, CheckCircle2, FileCheck2 } from 'lucide-react';

interface LegalComplianceModalProps {
  brandName: string;
  onClose: () => void;
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({ brandName, onClose }) => {
  return (
    <div className="modal-overlay fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121418] text-neutral-900 dark:text-neutral-100 w-full max-w-3xl rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="px-6 py-4 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-montserrat text-sm font-extrabold uppercase tracking-wider">
                Marco Legal, Políticas de Tiendas (Play Store / App Store) & Uso de APIs Públicas
              </h3>
              <p className="text-xs text-neutral-400">
                Cumplimiento Normativo Internacional • {brandName} Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
          {/* 1. DECLARACIÓN DE USO DE APIS PÚBLICAS */}
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 font-montserrat font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
              <Globe className="w-4 h-4 text-neutral-900 dark:text-white" />
              1. Aclaratoria de Uso de APIs Públicas y Atribución de Fuentes
            </div>
            <p className="mb-2">
              <strong>{brandName}</strong> opera como un motor de indexación, lectura asistida y optimización curricular para candidatos. Las ofertas de empleo mostradas en el radar provienen de endpoints y APIs públicas oficiales (incluyendo <em>Get on Board Public API</em>, <em>Remotive Public API</em>, <em>RemoteOK API</em> y agregadores públicos indexados).
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Propiedad Intelectual:</strong> Todos los logotipos, nombres de empresas y descripciones de puestos pertenecen a sus respectivos empleadores y plataformas de origen.
              </li>
              <li>
                <strong>Redirección Transparente:</strong> Cada tarjeta de empleo incluye el enlace directo hacia la publicación original para garantizar el tráfico legítimo hacia la fuente oficial.
              </li>
              <li>
                <strong>No Afiliación Corporativa:</strong> {brandName} es una herramienta independiente del lado del candidato (<em>Candidate-Side Copilot</em>) y no reclama representación exclusiva de las empresas listadas.
              </li>
            </ul>
          </div>

          {/* 2. CUMPLIMIENTO GOOGLE PLAY & APPLE APP STORE */}
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 font-montserrat font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              2. Cumplimiento para Google Play Store y Apple App Store (CapacitorJS Native)
            </div>
            <p className="mb-2">
              Esta aplicación cumple estrictamente con la <strong>Guideline 4.2 (Minimum Functionality)</strong> y <strong>Guideline 5.1.1(v)</strong> de Apple App Store, así como las políticas de Datos de Usuario de Google Play:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Modo Visitante Sin Barreras:</strong> Los usuarios pueden explorar el radar completo de empleos sin obligación de registro previo (cumpliendo la regla de acceso previo al login de Apple).
              </li>
              <li>
                <strong>Uso de Cámara y Galería (Permisos Nativos):</strong> La fotografía subida por el usuario se emplea única y exclusivamente como avatar de perfil y fotografía opcional en su documento CV exportable.
              </li>
              <li>
                <strong>Transparencia de IA:</strong> Las sugerencias y adaptaciones generadas por el Copiloto IA se basan estrictamente en la información proporcionada por el usuario, quien conserva el control total antes de exportar o enviar su documento PDF.
              </li>
            </ul>
          </div>

          {/* 3. PRIVACIDAD, GDPR Y DERECHO AL OLVIDO */}
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 font-montserrat font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
              <FileCheck2 className="w-4 h-4 text-neutral-900 dark:text-white" />
              3. Protección de Datos Personales (GDPR / LOPD) y Eliminación de Cuenta
            </div>
            <p className="mb-2">
              Los datos contenidos en el Currículum Vitae del usuario (teléfono, correo electrónico, experiencia laboral y fotografía) no son vendidos ni cedidos a terceros. El usuario solo comparte sus datos cuando decide voluntariamente presionar los botones de contacto (Correo, WhatsApp, Telegram o Portal).
            </p>
            <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                Requisito obligatorio de tiendas móviles: Eliminación instantánea de cuenta y versiones de CV.
              </span>
              <button
                onClick={() => {
                  localStorage.clear();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 font-montserrat font-bold text-[10px] uppercase tracking-wider hover:bg-red-500/20 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Borrar Caché / Datos Locales
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-montserrat text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Entendido y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};


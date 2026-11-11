import React, { useEffect } from 'react';
import { X, Shield, Globe, Trash2, CheckCircle2, FileCheck2 } from 'lucide-react';

interface LegalComplianceModalProps {
  brandName: string;
  onClose: () => void;
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({ brandName, onClose }) => {
  // BLOQUEO ESTRICTO DEL SCROLL DEL BODY
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="modal-overlay fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overscroll-contain"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#12151c] text-neutral-900 dark:text-neutral-100 w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-neutral-300 dark:border-[#2b3140] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* HEADER */}
        <div className="px-5 sm:px-6 py-4 bg-neutral-950 dark:bg-[#0c0e13] text-white flex items-center justify-between border-b border-neutral-800 dark:border-[#202532] shrink-0">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400 dark:text-[#4ade80]" />
            <div>
              <h3 className="font-montserrat text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                Marco Legal, Políticas de Tiendas & Fuentes Oficiales
              </h3>
              <p className="text-[11px] text-neutral-400">
                Cumplimiento Normativo • {brandName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#181c25] border border-neutral-200 dark:border-[#282d3b]">
            <div className="flex items-center gap-2 font-montserrat font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
              <Globe className="w-4 h-4 text-[#4ade80]" />
              1. Aclaratoria de Uso de Redes y Fuentes Públicas de Empleo
            </div>
            <p className="mb-2">
              <strong>{brandName}</strong> opera como un motor de lectura asistida y optimización curricular para candidatos. Las ofertas provienen de fuentes oficiales abiertas y redes de empleo verificadas (LinkedIn, Indeed, ZipRecruiter, Glassdoor, Monster, FlexJobs, Get on Board, Remotive y agregadores internacionales).
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Logotipos y nombres pertenecen a sus respectivos empleadores y plataformas de origen.</li>
              <li>Cada tarjeta enlaza directamente a la publicación oficial para preservar la fuente.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#181c25] border border-neutral-200 dark:border-[#282d3b]">
            <div className="flex items-center gap-2 font-montserrat font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
              2. Cumplimiento Google Play & Apple App Store
            </div>
            <p>
              Cumple con la <strong>Guideline 4.2 (Minimum Functionality)</strong> de Apple y las directivas de Google Play mediante navegación abierta como visitante, uso ético de cámara/archivos y transparencia en el uso de IA.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#181c25] border border-neutral-200 dark:border-[#282d3b]">
            <div className="flex items-center gap-2 font-montserrat font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
              <FileCheck2 className="w-4 h-4 text-[#4ade80]" />
              3. Protección de Datos & Derecho al Olvido
            </div>
            <p className="mb-2">
              Los datos curriculares no son vendidos ni cedidos a terceros. Solo se transmiten cuando el usuario voluntariamente decide presionar los botones de contacto.
            </p>
            <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-[#242936] flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                Eliminación instantánea de datos y caché local.
              </span>
              <button
                onClick={() => {
                  localStorage.clear();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 font-montserrat font-bold text-[10px] uppercase tracking-wider hover:bg-red-500/20 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Borrar Datos Locales
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 sm:px-6 py-3.5 bg-neutral-100 dark:bg-[#0c0e13] border-t border-neutral-200 dark:border-[#202532] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

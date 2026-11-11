import React from 'react';

interface MidScrollIncentiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export const MidScrollIncentiveModal: React.FC<MidScrollIncentiveModalProps> = ({
  isOpen,
  onClose,
  onLoginClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#12151c] text-neutral-900 dark:text-neutral-100 w-full max-w-lg rounded-2xl border border-neutral-300 dark:border-[#2b3140] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ENCABEZADO CON DEGRADADO & ICONO */}
        <div className="relative px-6 py-5 bg-linear-to-r from-emerald-600 to-[#10b981] text-white overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15 pointer-events-none">
            <i className="ri-robot-3-line text-8xl" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-montserrat font-extrabold uppercase tracking-widest backdrop-blur-xs">
              <i className="ri-sparkling-fill" /> Experiencia Personalizada
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              title="Continuar viendo muestra"
            >
              <i className="ri-close-line text-xl" />
            </button>
          </div>
          <h3 className="relative z-10 font-montserrat text-lg sm:text-xl font-black mt-2 leading-tight">
            Personaliza tu Búsqueda de Empleo
          </h3>
          <p className="relative z-10 text-xs text-emerald-50 mt-1 leading-relaxed">
            Sube tu CV, créalo o complétalo directamente en la plataforma.
          </p>
        </div>

        {/* CONTENIDO Y VENTAJAS */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
            Al sincronizar tu perfil, obtendrás <strong>vacantes completamente optimizadas para tu CV</strong> y calcularás tu afinidad ATS antes de postular:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#181c25] border border-neutral-200 dark:border-[#252a36]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#4ade80] flex items-center justify-center shrink-0">
                <i className="ri-crosshair-2-line text-base" />
              </div>
              <div>
                <h4 className="font-montserrat font-bold text-neutral-900 dark:text-white text-[13px]">
                  Cálculo de Afinidad ATS Exacto
                </h4>
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5 leading-relaxed">
                  Sabrás de inmediato qué porcentaje de compatibilidad tienes con cada vacante antes de postular.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#181c25] border border-neutral-200 dark:border-[#252a36]">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <i className="ri-file-text-line text-base" />
              </div>
              <div>
                <h4 className="font-montserrat font-bold text-neutral-900 dark:text-white text-[13px]">
                  Adaptación Curricular A4 con 1 Clic
                </h4>
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5 leading-relaxed">
                  Genera una versión de tu CV optimizada para superar los filtros de recursos humanos de cada oferta.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#181c25] border border-neutral-200 dark:border-[#252a36]">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <i className="ri-lock-unlock-line text-base" />
              </div>
              <div>
                <h4 className="font-montserrat font-bold text-neutral-900 dark:text-white text-[13px]">
                  Acceso Total al Feed Completo
                </h4>
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5 leading-relaxed">
                  Desbloquea todas las vacantes sin límites de muestra de Google Jobs, LinkedIn, Indeed y Get on Board.
                </p>
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                onClose();
                onLoginClick();
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <i className="ri-upload-cloud-2-line text-sm" />
              Subir o Crear mi CV (Acceso Completo)
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-[11px] font-montserrat font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <i className="ri-arrow-down-s-line text-sm" />
              Minimizar y continuar explorando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


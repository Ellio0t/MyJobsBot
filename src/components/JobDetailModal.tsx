import React, { useEffect } from 'react';
import {
  X,
  Briefcase,
  DollarSign,
  MapPin,
  Languages,
  Calendar,
  CheckCircle2,
  Tag,
  Mail,
  ExternalLink,
  Sparkles,
  Building2,
  FileText,
} from 'lucide-react';
import { CVVersion, JobOffer } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { PortalBadge } from './PortalBadge';

interface JobDetailModalProps {
  job: JobOffer;
  activeCv: CVVersion;
  onClose: () => void;
  onOpenEmailModal: (job: JobOffer) => void;
  onAdaptCv: (job: JobOffer) => void;
  onWhatsApp: (job: JobOffer) => void;
  onTelegram: (job: JobOffer) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  activeCv,
  onClose,
  onOpenEmailModal,
  onAdaptCv,
  onWhatsApp,
  onTelegram,
}) => {
  // BLOQUEO ESTRICTO DEL SCROLL DEL BODY (Evita desplazamiento en la página de fondo)
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

  // Limpieza segura de descripción si contiene tags HTML de APIs públicas
  const renderFormattedDescription = (text: string) => {
    if (!text) return <p className="text-neutral-400 italic">Sin descripción adicional provista.</p>;
    
    // Si contiene etiquetas HTML comunes de APIs como Remotive o Get on Board
    const hasHtml = /<[a-z][\s\S]*>/i.test(text);
    if (hasHtml) {
      return (
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>p]:mb-2"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }

    // Si es texto plano con saltos de línea
    return (
      <div className="space-y-3 text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
        {text}
      </div>
    );
  };

  const hasCustomCv = activeCv.id !== 'cv-sample-visitor';

  const matchColor =
    (job.matchScore || 0) >= 75
      ? 'text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/30'
      : (job.matchScore || 0) >= 50
      ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
      : 'text-neutral-400 bg-neutral-500/10 border-neutral-500/30';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overscroll-contain transition-opacity animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#11141c] border border-neutral-300 dark:border-[#252b39] rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden overscroll-contain transition-all"
      >
        {/* ===================================================================
            CABECERA FIJA (SHRINK-0)
            =================================================================== */}
        <header className="px-5 py-4 border-b border-neutral-200 dark:border-[#202532] bg-neutral-50/70 dark:bg-[#141722] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <CompanyLogo
              logoUrl={job.companyLogo}
              companyName={job.company}
              category={job.category}
              sizeClass="w-12 h-12"
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="font-montserrat text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-[#4ade80]">
                  {job.company}
                </span>
                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                <PortalBadge source={job.source} size="sm" />
              </div>
              <h2 className="font-montserrat text-base sm:text-lg font-black text-neutral-900 dark:text-white leading-snug truncate">
                {job.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Score ATS solo si hay un CV real cargado */}
            {hasCustomCv ? (
              <div className={`px-2.5 py-1 rounded-lg border text-xs font-montserrat font-black uppercase tracking-wider flex items-center gap-1.5 ${matchColor}`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{job.matchScore ?? 68}% ATS</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-[#2b3040] text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 bg-neutral-100 dark:bg-[#181c25]">
                <Sparkles className="w-3 h-3 text-emerald-500 dark:text-[#4ade80]" />
                <span>Subir CV para Match</span>
              </div>
            )}

            {/* Botón de cierre */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#202532] transition-colors cursor-pointer"
              title="Cerrar ventana (Esc)"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ===================================================================
            CUERPO SCROLLEABLE (FLEX-1 OVERFLOW-Y-AUTO)
            =================================================================== */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-6 text-sm">
          {/* CUADRÍCULA DE HIGHLIGHTS EJECUTIVOS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-[#161922] border border-neutral-200 dark:border-[#222837] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4ade80]" />
                <span>Salario</span>
              </div>
              <p className="font-montserrat font-extrabold text-xs text-neutral-900 dark:text-white truncate">
                {job.salary || 'A convenir'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-[#161922] border border-neutral-200 dark:border-[#222837] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4ade80]" />
                <span>Modalidad</span>
              </div>
              <p className="font-montserrat font-extrabold text-xs text-neutral-900 dark:text-white truncate">
                {job.modality || '100% Remoto'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-[#161922] border border-neutral-200 dark:border-[#222837] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4ade80]" />
                <span>Idioma</span>
              </div>
              <p className="font-montserrat font-extrabold text-xs text-neutral-900 dark:text-white truncate">
                {job.languageReq || 'Español'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-[#161922] border border-neutral-200 dark:border-[#222837] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4ade80]" />
                <span>Cobertura</span>
              </div>
              <p className="font-montserrat font-extrabold text-xs text-neutral-900 dark:text-white truncate">
                {job.countryScope || 'LATAM / Global'}
              </p>
            </div>
          </div>

          {/* RESUMEN EJECUTIVO */}
          <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-[#4ade80]/5 border border-emerald-500/20 dark:border-[#4ade80]/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-montserrat font-extrabold uppercase tracking-wider text-emerald-700 dark:text-[#4ade80]">
              <i className="ri-robot-3-line text-sm" />
              <span>Resumen Ejecutivo JoBOT</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
              {job.oneLineSummary}
            </p>
          </div>

          {/* DESCRIPCIÓN COMPLETA */}
          <div className="space-y-2.5">
            <h3 className="font-montserrat text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-[#4ade80]" />
              <span>Detalles y Alcance de la Posición</span>
            </h3>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#141722] border border-neutral-200 dark:border-[#222837]">
              {renderFormattedDescription(job.description)}
            </div>
          </div>

          {/* REQUISITOS CLAVE */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-montserrat text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#4ade80]" />
                <span>Requisitos & Competencias Clave</span>
              </h3>
              <ul className="grid grid-cols-1 gap-2">
                {job.requirements.map((req, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-50 dark:bg-[#141722] border border-neutral-200 dark:border-[#222837] text-xs text-neutral-700 dark:text-neutral-300"
                  >
                    <i className="fa-solid fa-check text-xs text-emerald-600 dark:text-[#4ade80] mt-0.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* KEYWORDS / PALABRAS CLAVE ATS */}
          {job.keywords && job.keywords.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-montserrat text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600 dark:text-[#4ade80]" />
                <span>Palabras Clave ATS Indexadas</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-neutral-100 dark:bg-[#171a24] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-[#272e3d]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            PIE DE ACCIONES FIJO EN UNA SOLA LÍNEA (FLEX-NOWRAP SHRINK-0)
            =================================================================== */}
        <footer className="px-4 sm:px-5 py-3 border-t border-neutral-200 dark:border-[#202532] bg-neutral-50/80 dark:bg-[#141722] flex items-center justify-between gap-2 shrink-0 overflow-x-auto no-scrollbar flex-nowrap">
          <div className="flex items-center gap-2 shrink-0 flex-nowrap">
            {/* Postular por correo optimizado */}
            <button
              onClick={() => {
                onClose();
                onOpenEmailModal(job);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-black uppercase tracking-wider bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>Postular por Correo ATS</span>
            </button>

            {/* Adaptar CV a este puesto */}
            <button
              onClick={() => {
                onClose();
                onAdaptCv(job);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-[#32394c] bg-white dark:bg-[#1a1e28] hover:bg-neutral-100 dark:hover:bg-[#232836] text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              <i className="ri-robot-3-line text-sm text-emerald-600 dark:text-[#4ade80] shrink-0" />
              <span>Adaptar mi CV</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-nowrap">
            {/* Contacto WhatsApp */}
            <button
              onClick={() => onWhatsApp(job)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-emerald-600/10 text-emerald-700 dark:text-[#4ade80] border border-emerald-600/25 dark:border-[#4ade80]/30 hover:bg-emerald-600/20 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              title="Contactar por WhatsApp"
            >
              <i className="fa-brands fa-whatsapp text-sm" />
              <span>WhatsApp</span>
            </button>

            {/* Contacto Telegram */}
            <button
              onClick={() => onTelegram(job)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/25 dark:border-sky-500/30 hover:bg-sky-500/20 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              title="Contactar por Telegram"
            >
              <i className="fa-brands fa-telegram text-sm" />
              <span>Telegram</span>
            </button>

            {/* Ver en portal oficial */}
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-[#4ade80] transition-colors shrink-0 whitespace-nowrap"
              title="Ir al enlace original de postulación"
            >
              <span>Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};


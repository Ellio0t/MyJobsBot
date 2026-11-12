import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Copy, Check, FileText, Sparkles, ExternalLink, ChevronDown } from 'lucide-react';
import { CVVersion, JobOffer } from '../types';
import { generateOutreachDraft } from '../services/jobEngine';

type EmailClient = 'app' | 'gmail' | 'outlook';
const STORAGE_KEY = 'myjobsbot_preferred_email_client';

interface EmailModalProps {
  job: JobOffer;
  activeCv: CVVersion;
  onClose: () => void;
  onPrintCv: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({ job, activeCv, onClose, onPrintCv }) => {
  const initialDraft = generateOutreachDraft(activeCv.profile, job);
  const [recipient, setRecipient] = useState(job.contactEmail || 'seleccion@empresa.com');
  const [subject, setSubject] = useState(initialDraft.subject);
  const [body, setBody] = useState(initialDraft.body);
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

  // DETECCIÓN AUTOMÁTICA DEL SISTEMA (Móvil vs Escritorio)
  const [isMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isTouchScreen = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const isNarrow = window.innerWidth <= 768;
    return mobileRegex.test(ua) || isTouchScreen || isNarrow;
  });

  // PREFERENCIA INTELIGENTE CON MEMORIA (Auto-selección adaptativa)
  const [preferredClient, setPreferredClient] = useState<EmailClient>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as EmailClient | null;
    if (saved && ['app', 'gmail', 'outlook'].includes(saved)) {
      return saved;
    }
    // Si es primera vez: 'app' para teléfonos, 'gmail' para computadoras
    return isMobile ? 'app' : 'gmail';
  });

  const [hasCustomPreference, setHasCustomPreference] = useState(() => {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  });

  // BLOQUEO ESTRICTO DEL SCROLL DEL BODY (Evita que la página de fondo se mueva)
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

  const handleCopyAll = () => {
    navigator.clipboard.writeText(`Para: ${recipient}\nAsunto: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenClient = (client: EmailClient) => {
    // Guardar preferencia automáticamente para futuras postulaciones
    localStorage.setItem(STORAGE_KEY, client);
    setPreferredClient(client);
    setHasCustomPreference(true);

    if (client === 'gmail') {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        recipient
      )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
    } else if (client === 'outlook') {
      const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
        recipient
      )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(outlookUrl, '_blank');
    } else {
      const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }
    setSentSuccess(true);
  };

  const clientInfo = {
    app: {
      name: isMobile ? 'Abrir en mi App de Correo' : 'Abrir en App de Correo',
      desc: isMobile ? 'Detectado en tu teléfono móvil' : 'Cliente nativo del sistema',
      icon: <Send className="w-4 h-4 text-emerald-500 dark:text-[#4ade80]" />,
    },
    gmail: {
      name: 'Abrir en Gmail Web',
      desc: isMobile ? 'Bandeja web de Gmail' : 'Detectado para tu navegador',
      icon: <ExternalLink className="w-4 h-4 text-amber-500" />,
    },
    outlook: {
      name: 'Abrir en Outlook Web',
      desc: 'Bandeja web de Microsoft',
      icon: <i className="fa-brands fa-microsoft text-xs text-sky-400" />,
    },
  }[preferredClient];

  return (
    <div
      onClick={onClose}
      className="modal-overlay fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overscroll-contain"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#12151c] text-neutral-900 dark:text-neutral-100 w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-neutral-300 dark:border-[#2b3140] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-neutral-950 dark:bg-[#0c0e13] text-white border-b border-neutral-800 dark:border-[#202532] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 dark:bg-[#181c26] border border-white/10 dark:border-[#2d3444] flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-400 dark:text-[#4ade80]" />
            </div>
            <div>
              <h3 className="font-montserrat text-xs sm:text-sm font-extrabold tracking-wider uppercase">
                Redactor de Propuesta & Correo ATS
              </h3>
              <p className="text-[11px] text-neutral-400 line-clamp-1">
                Para: <span className="text-white font-semibold">{job.title}</span> en{' '}
                <span className="text-[#4ade80] font-semibold">{job.company}</span>
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

        {/* BODY CON SCROLL INDEPENDIENTE (Sin scroll en el fondo) */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
          {/* BADGE DE DETECCIÓN INTELIGENTE DEL SISTEMA */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 dark:bg-[#181c25] border border-emerald-500/25 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#4ade80] animate-pulse shrink-0" />
              <span className="text-[11px] text-neutral-700 dark:text-neutral-300">
                {isMobile ? (
                  <>Móvil detectado: <strong>App nativa preseleccionada</strong></>
                ) : (
                  <>Escritorio detectado: <strong>{preferredClient === 'gmail' ? 'Gmail Web' : 'Outlook Web'} preseleccionado</strong></>
                )}
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-[#4ade80]">
              Adaptativo
            </span>
          </div>

          {/* BADGE DE VERSIÓN DE CV VINCULADA */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-neutral-100 dark:bg-[#181c25] border border-neutral-200 dark:border-[#292f3f]">
            <div className="flex items-center gap-2.5 text-xs">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-[#4ade80] shrink-0" />
              <span>
                Versión vinculada: <strong className="font-montserrat text-neutral-900 dark:text-white">{activeCv.label}</strong>
              </span>
            </div>
            <button
              onClick={onPrintCv}
              className="text-xs font-montserrat font-bold text-neutral-900 dark:text-[#4ade80] underline hover:opacity-80 cursor-pointer"
            >
              Descargar PDF limpio
            </button>
          </div>

          {/* DESTINATARIO */}
          <div>
            <label className="block font-montserrat text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              Para (Correo del Reclutador / Empresa)
            </label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg text-xs sm:text-sm bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2f3545] text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
            />
          </div>

          {/* ASUNTO */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Asunto Optimizado para Filtros de Entrada
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-[#4ade80]">
                <Sparkles className="w-3 h-3" /> Parseado por IA
              </span>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2f3545] text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
            />
          </div>

          {/* CUERPO DEL CORREO */}
          <div>
            <label className="block font-montserrat text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              Propuesta Personalizada (Cuerpo del Correo)
            </label>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2f3545] text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80] font-sans resize-y"
            />
          </div>

          {sentSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-[#4ade80] text-xs font-medium">
              ¡Cliente de correo abierto con tu propuesta pre-cargada! No olvides adjuntar el PDF descargado antes de presionar Enviar.
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS CON DETECCIÓN AUTOMÁTICA */}
        <div className="px-5 sm:px-6 py-3.5 bg-neutral-50 dark:bg-[#0e1015] border-t border-neutral-200 dark:border-[#202532] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-[#2f3545] hover:bg-neutral-200 dark:hover:bg-[#1c212c] transition-colors cursor-pointer"
            title="Copiar para pegar en formularios tipo Greenhouse o Workday"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500 dark:text-[#4ade80]" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado!' : 'Copiar Texto'}
          </button>

          <div className="flex items-center gap-2">
            {/* BOTÓN HERO AUTO-DETECTADO */}
            <button
              onClick={() => handleOpenClient(preferredClient)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-montserrat font-extrabold uppercase tracking-wider bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              title={clientInfo.desc}
            >
              {clientInfo.icon}
              <span>{clientInfo.name}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 dark:bg-black/20 font-mono font-bold">
                Auto
              </span>
            </button>

            {/* SELECTOR DESPLEGABLE PARA CAMBIAR PROVEEDOR */}
            <div className="relative">
              <button
                onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                className="p-2 rounded-lg border border-neutral-300 dark:border-[#2f3545] bg-white dark:bg-[#151922] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1c212c] transition-colors cursor-pointer flex items-center justify-center"
                title="Cambiar proveedor de correo predeterminado"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showOptionsDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showOptionsDropdown && (
                <div className="absolute right-0 bottom-full mb-2 w-52 bg-white dark:bg-[#151922] border border-neutral-200 dark:border-[#2b3140] rounded-xl shadow-2xl p-1.5 z-20 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[9px] font-montserrat font-black uppercase tracking-wider text-neutral-400">
                    Cambiar vía preferida:
                  </div>

                  <button
                    onClick={() => {
                      setShowOptionsDropdown(false);
                      handleOpenClient('app');
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-montserrat font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      preferredClient === 'app'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#4ade80]'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1c212c]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5" />
                      App de Correo
                    </span>
                    {preferredClient === 'app' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>

                  <button
                    onClick={() => {
                      setShowOptionsDropdown(false);
                      handleOpenClient('gmail');
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-montserrat font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      preferredClient === 'gmail'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#4ade80]'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1c212c]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Gmail Web
                    </span>
                    {preferredClient === 'gmail' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>

                  <button
                    onClick={() => {
                      setShowOptionsDropdown(false);
                      handleOpenClient('outlook');
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-montserrat font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      preferredClient === 'outlook'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#4ade80]'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1c212c]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <i className="fa-brands fa-microsoft text-xs text-sky-500" />
                      Outlook Web
                    </span>
                    {preferredClient === 'outlook' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

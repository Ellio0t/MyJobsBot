import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Copy, Check, FileText, Sparkles, ExternalLink } from 'lucide-react';
import { CVVersion, JobOffer } from '../types';
import { generateOutreachDraft } from '../services/jobEngine';

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

  const handleOpenGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      recipient
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
    setSentSuccess(true);
  };

  const handleOpenDefaultMail = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setSentSuccess(true);
  };

  const handleOpenOutlook = () => {
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
      recipient
    )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(outlookUrl, '_blank');
    setSentSuccess(true);
  };

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
              rows={9}
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

        {/* FOOTER ACTIONS */}
        <div className="px-5 sm:px-6 py-3.5 bg-neutral-50 dark:bg-[#0e1015] border-t border-neutral-200 dark:border-[#202532] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-[#2f3545] hover:bg-neutral-200 dark:hover:bg-[#1c212c] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500 dark:text-[#4ade80]" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado!' : 'Copiar Texto'}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenDefaultMail}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-[#2f3545] hover:bg-neutral-200 dark:hover:bg-[#1c212c] transition-colors cursor-pointer"
              title="Abrir en tu cliente nativo (Outlook, Thunderbird, Mail de Apple/Android)"
            >
              <Send className="w-3.5 h-3.5" />
              App de Correo
            </button>
            <button
              onClick={handleOpenOutlook}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400 hover:bg-sky-500/20 transition-colors cursor-pointer"
              title="Abrir en Outlook Web"
            >
              <i className="fa-brands fa-microsoft text-xs" />
              Outlook
            </button>
            <button
              onClick={handleOpenGmail}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-montserrat font-extrabold uppercase tracking-wider bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              title="Abrir en Gmail Web"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Gmail Web
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

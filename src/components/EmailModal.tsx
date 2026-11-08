import React, { useState } from 'react';
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

  return (
    <div className="modal-overlay fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121418] text-neutral-900 dark:text-neutral-100 w-full max-w-2xl rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* TOP BAR */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-950 text-white border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-montserrat text-sm font-bold tracking-wider uppercase">
                Redactor Ejecutivo de Propuesta & Correo ATS
              </h3>
              <p className="text-xs text-neutral-400">
                Adaptado automáticamente para: <span className="text-white font-semibold">{job.title}</span> en{' '}
                <span className="text-white font-semibold">{job.company}</span>
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

        {/* BODY */}
        <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* BADGE DE VERSIÓN DE CV VINCULADA */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2.5 text-xs">
              <FileText className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <span>
                Versión de CV vinculada: <strong className="font-montserrat">{activeCv.label}</strong>
              </span>
            </div>
            <button
              onClick={onPrintCv}
              className="text-xs font-montserrat font-bold underline hover:opacity-80 cursor-pointer"
            >
              Descargar PDF limpio para adjuntar
            </button>
          </div>

          {/* DESTINATARIO */}
          <div>
            <label className="block font-montserrat text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              Para (Correo del Reclutador / Empresa)
            </label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-white"
            />
          </div>

          {/* ASUNTO OPTIMIZADO */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Asunto Optimizado para Filtros de Bandeja de Entrada
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3 h-3" /> Parseado por IA
              </span>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg text-sm font-medium bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-white"
            />
          </div>

          {/* CUERPO DEL MENSAJE */}
          <div>
            <label className="block font-montserrat text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              Propuesta Personalizada (Cuerpo del Correo)
            </label>
            <textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3.5 rounded-lg text-sm leading-relaxed bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-white font-sans"
            />
          </div>

          {sentSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              ¡Cliente de correo abierto con tu propuesta pre-cargada! No olvides adjuntar el PDF descargado antes de presionar Enviar.
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/70 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado al Portapapeles!' : 'Copiar Texto'}
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenDefaultMail}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              App de Correo
            </button>
            <button
              onClick={handleOpenGmail}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir en Gmail Listo para Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


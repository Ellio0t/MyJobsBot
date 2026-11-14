import React, { useState } from 'react';
import {
  Globe,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles,
  Download,
  Eye,
  Briefcase,
  Layers,
  ArrowUpRight,
  MessageCircle,
} from 'lucide-react';
import { CVProfile, UserSession } from '../types';
import { GoogleAccountBadge } from './ProfileView';
import { JobotIcon } from './JobotIcon';

interface PublicBentoProfileViewProps {
  profile: CVProfile;
  session?: UserSession;
  isOwner?: boolean;
  onDownloadPdf?: () => void;
  onOpenCvStudio?: () => void;
  onCreateYourOwn?: () => void;
  onUpdateSocialLinks?: (updatedLinks: {
    github?: string;
    portfolio?: string;
    linkedin?: string;
    twitter?: string;
    whatsapp?: string;
    publicSlug?: string;
    isPublic?: boolean;
  }) => void;
}

export function PublicBentoProfileView({
  profile,
  session,
  isOwner = true,
  onDownloadPdf,
  onOpenCvStudio,
  onCreateYourOwn,
  onUpdateSocialLinks,
}: PublicBentoProfileViewProps) {
  const [copied, setCopied] = useState(false);
  const [activePreviewMode, setActivePreviewMode] = useState<'bento' | 'links'>('bento');

  // Slug público derivado o personalizado
  const currentSlug =
    profile.publicSlug ||
    (profile.fullName && profile.fullName !== 'TU NOMBRE Y APELLIDO'
      ? profile.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : 'candidato');

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://myjobsbot.web.app';
  const publicShareUrl = `${originUrl}/p/${currentSlug}`;

  const [slugInput, setSlugInput] = useState(currentSlug);
  const [githubInput, setGithubInput] = useState(profile.github || 'https://github.com');
  const [portfolioInput, setPortfolioInput] = useState(profile.portfolio || 'https://miportafolio.dev');
  const [linkedinInput, setLinkedinInput] = useState(profile.linkedin || 'https://linkedin.com/in');
  const [twitterInput, setTwitterInput] = useState(profile.twitter || 'https://x.com');
  const [whatsappInput, setWhatsappInput] = useState(profile.whatsapp || '+54 9 11 5555-4321');
  const [isPublicState, setIsPublicState] = useState(profile.isPublic !== false);
  const [saveToast, setSaveToast] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveLinks = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSocialLinks) {
      onUpdateSocialLinks({
        publicSlug: slugInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
        github: githubInput.trim(),
        portfolio: portfolioInput.trim(),
        linkedin: linkedinInput.trim(),
        twitter: twitterInput.trim(),
        whatsapp: whatsappInput.trim(),
        isPublic: isPublicState,
      });
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Enlace directo de WhatsApp con mensaje preconfigurado para reclutadores
  const whatsappCleanNumber = whatsappInput.replace(/[^0-9]/g, '');
  const whatsappDirectUrl = whatsappCleanNumber
    ? `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(
        `¡Hola ${profile.fullName}! 👋 Vi tu perfil profesional verificado en JobsBOT y me gustaría hablar contigo sobre una oportunidad laboral.`
      )}`
    : '#';

  const mailtoUrl = `mailto:${profile.email}?subject=${encodeURIComponent(
    `Contacto Profesional para ${profile.fullName} — Oportunidad de Empleo`
  )}&body=${encodeURIComponent(
    `¡Hola ${profile.fullName}!\n\nRevisé tu perfil público y CV verificado en JobsBOT y nos gustaría conocerte para una vacante.\n\nSaludos cordiales.`
  )}`;

  return (
    <div className="space-y-6">
      {/* =====================================================================
          PANEL SUPERIOR: CONTROLES DE COMPARTIR Y URL PÚBLICA
          ===================================================================== */}
      {isOwner && (
        <div className="bg-white dark:bg-[#12151c] p-4 sm:p-6 rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-[#4ade80] text-[10px] font-montserrat font-extrabold uppercase tracking-wider border border-emerald-500/20">
                <Globe className="w-3 h-3" />
                Tu Landing Page Personal
              </div>
              <h3 className="font-montserrat text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                Mi Perfil Público Compartible (Estilo Bento / Read.cv)
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
                Este es el enlace que puedes colocar en tu biografía de LinkedIn, GitHub, Twitter o enviar directamente a empresas y reclutadores. Presenta tu identidad verificada sin intermediarios ni muros de pago.
              </p>
            </div>

            {/* Alternador de Modo: Vista Bento / Editar Enlaces */}
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-[#161a23] p-1 rounded-xl border border-neutral-200 dark:border-[#262c3b] self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setActivePreviewMode('bento')}
                className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activePreviewMode === 'bento'
                    ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Previsualizar</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewMode('links')}
                className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activePreviewMode === 'links'
                    ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Configurar Redes</span>
              </button>
            </div>
          </div>

          {/* BARRA DE COPIADO DE ENLACE DIRECTO */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2b3345] text-xs font-mono text-neutral-800 dark:text-neutral-200 select-all overflow-hidden truncate">
              <Globe className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span className="truncate">{publicShareUrl}</span>
            </div>

            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl font-montserrat text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] hover:opacity-90'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Enlace Público</span>
                </>
              )}
            </button>

            <a
              href={publicShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-[#2b3345] hover:bg-neutral-100 dark:hover:bg-[#1f2433] text-neutral-800 dark:text-neutral-200 font-montserrat text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abrir</span>
            </a>
          </div>
        </div>
      )}

      {/* =====================================================================
          FORMULARIO DE CONFIGURACIÓN DE REDES SOCIALES (MODO 'links')
          ===================================================================== */}
      {isOwner && activePreviewMode === 'links' && (
        <form
          onSubmit={handleSaveLinks}
          className="bg-white dark:bg-[#12151c] p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#222736]">
            <h4 className="font-montserrat text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-500" />
              Personalización de Enlaces Sociales y URL
            </h4>
            {saveToast && (
              <span className="text-xs text-emerald-600 dark:text-[#4ade80] font-bold animate-pulse">
                ¡Cambios guardados con éxito!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Slug personalizado */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                Nombre de Usuario en la URL (/p/tu-nombre)
              </label>
              <div className="flex items-center rounded-xl bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] px-3 py-2 text-xs text-neutral-500">
                <span>{originUrl}/p/</span>
                <input
                  type="text"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="tu-nombre-profesional"
                  className="flex-1 bg-transparent text-neutral-900 dark:text-neutral-100 font-bold focus:outline-none pl-1"
                />
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">Solo letras minúsculas, números y guiones.</p>
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                <i className="fa-brands fa-linkedin text-sky-600 mr-1" /> Perfil de LinkedIn
              </label>
              <input
                type="url"
                value={linkedinInput}
                onChange={(e) => setLinkedinInput(e.target.value)}
                placeholder="https://linkedin.com/in/tu-perfil"
                className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
              />
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                <i className="fa-brands fa-github text-neutral-900 dark:text-white mr-1" /> Perfil de GitHub
              </label>
              <input
                type="url"
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                placeholder="https://github.com/tu-usuario"
                className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
              />
            </div>

            {/* Portafolio / Web */}
            <div>
              <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                <Globe className="w-3.5 h-3.5 inline text-emerald-500 mr-1" /> Portafolio Web / Blog
              </label>
              <input
                type="url"
                value={portfolioInput}
                onChange={(e) => setPortfolioInput(e.target.value)}
                placeholder="https://tuportafolio.dev"
                className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                <i className="fa-brands fa-whatsapp text-emerald-500 mr-1" /> WhatsApp para Reclutadores
              </label>
              <input
                type="text"
                value={whatsappInput}
                onChange={(e) => setWhatsappInput(e.target.value)}
                placeholder="+54 9 11 5555-4321"
                className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
              />
            </div>

            {/* Twitter / X */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                <i className="fa-brands fa-x-twitter mr-1" /> Cuenta de X (Twitter)
              </label>
              <input
                type="url"
                value={twitterInput}
                onChange={(e) => setTwitterInput(e.target.value)}
                placeholder="https://x.com/tu-usuario"
                className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              Guardar Enlaces de Redes
            </button>
          </div>
        </form>
      )}

      {/* =====================================================================
          VISTA BENTO GRID (ESTILO BENTO.ME / READ.CV)
          ===================================================================== */}
      <div className="bento-container space-y-4">
        {/* Cabecera decorativa del visor */}
        {isOwner && (
          <div className="flex items-center justify-between px-2 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-montserrat font-bold uppercase tracking-wider text-[11px]">
                Previsualización en Vivo de tu Perfil Bento
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-[#4ade80] font-medium">
              ● En vivo y actualizado en tiempo real
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* =================================================================
              CARD 1 (HERO BENTO - 2 COLUMNAS): IDENTIDAD & REPUTACIÓN
              ================================================================= */}
          <div className="md:col-span-2 lg:col-span-2 rounded-3xl bg-white dark:bg-[#12151c] p-6 sm:p-7 border border-neutral-200 dark:border-[#262c3b] shadow-sm flex flex-col justify-between relative overflow-hidden group">
            {/* Gradiente sutil de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 via-sky-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-md bg-neutral-900">
                    <img
                      src={
                        profile.avatarUrl ||
                        session?.photoURL ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
                      }
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {session?.authProvider === 'google' && (
                    <div
                      title="Cuenta verificada por Google"
                      className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-white dark:bg-[#12151c] border border-neutral-200 dark:border-[#2f374a] shadow-sm flex items-center justify-center p-0.5"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-montserrat font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-[#4ade80] border border-emerald-500/25">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {profile.availability || 'Disponible para Contratar'}
                  </span>
                  {session?.authProvider === 'google' ? (
                    <GoogleAccountBadge email={session.email} />
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-montserrat font-bold bg-neutral-100 dark:bg-[#181c25] text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-[#2b3345]">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verificado
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h1 className="font-montserrat text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white leading-tight">
                  {profile.fullName}
                </h1>
                <p className="font-montserrat text-xs sm:text-sm font-bold text-sky-700 dark:text-sky-300 mt-1">
                  {profile.headline}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                  <span>{profile.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-neutral-100 dark:border-[#1e2330] flex items-center justify-between text-xs text-neutral-400 relative z-10">
              <span className="flex items-center gap-1.5 text-[11px]">
                <JobotIcon className="w-3.5 h-3.5 text-emerald-500" />
                Validado por JoBOT ATS
              </span>
              <span className="text-[10px] font-mono font-bold text-neutral-500">
                JobsBOT • Talent ID: #{profile.fullName.slice(0, 3).toUpperCase()}-94
              </span>
            </div>
          </div>

          {/* =================================================================
              CARD 2: CONTACTO DIRECTO (WHATSAPP & CORREO - 1 CLIC)
              ================================================================= */}
          <div className="rounded-3xl bg-white dark:bg-[#12151c] p-6 border border-neutral-200 dark:border-[#262c3b] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-400 block">
                Canal Directo Reclutadores
              </span>
              <h3 className="font-montserrat text-base font-extrabold text-neutral-900 dark:text-white">
                Contratar Candidato
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Sin burocracia ni intermediarios. Inicia contacto laboral directo ahora mismo.
              </p>
            </div>

            <div className="space-y-2.5">
              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-montserrat text-xs font-black uppercase tracking-wider transition-colors shadow-xs"
              >
                <i className="fa-brands fa-whatsapp text-sm" />
                <span>Escribir por WhatsApp</span>
              </a>

              <a
                href={mailtoUrl}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1a1f2c] dark:hover:bg-[#232a3b] text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-[#2d3548] font-montserrat text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enviar Correo</span>
              </a>
            </div>
          </div>

          {/* =================================================================
              CARD 3: DESCARGA DE CV A4 (FORMATO HARVARD ATS)
              ================================================================= */}
          <div className="rounded-3xl bg-gradient-to-br from-[#111111] to-[#1c2230] text-white p-6 border border-neutral-800 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-emerald-400 block">
                Documento Oficial ATS
              </span>
              <h3 className="font-montserrat text-base font-black text-white">
                Curriculum Vitae A4
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Descarga la versión impresa de 1 página estandarizada para algoritmos de reclutamiento.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={onDownloadPdf || (() => window.print())}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4ade80] hover:bg-[#3ec972] text-[#070709] font-montserrat text-xs font-black uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </button>

              {onOpenCvStudio && (
                <button
                  onClick={onOpenCvStudio}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-montserrat font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Ver en CV Studio</span>
                </button>
              )}
            </div>
          </div>

          {/* =================================================================
              CARD 4: ENLACES SOCIALES Y DE TRABAJO (BENTO GRID SOCIAL)
              ================================================================= */}
          <div className="md:col-span-2 rounded-3xl bg-white dark:bg-[#12151c] p-6 border border-neutral-200 dark:border-[#262c3b] shadow-sm space-y-3">
            <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-400 block">
              Huella Digital y Portafolio
            </span>
            <h3 className="font-montserrat text-sm sm:text-base font-black text-neutral-900 dark:text-white">
              Redes Profesionales & Código
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {/* LinkedIn */}
              <a
                href={profile.linkedin || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-[#181c25] hover:bg-sky-500/10 border border-neutral-200 dark:border-[#283042] hover:border-sky-500/40 transition-all text-center group"
              >
                <i className="fa-brands fa-linkedin text-xl text-sky-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-montserrat font-extrabold text-neutral-800 dark:text-neutral-200">
                  LinkedIn
                </span>
                <span className="text-[9px] text-neutral-400 flex items-center gap-0.5 mt-0.5">
                  Conectar <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              </a>

              {/* GitHub */}
              <a
                href={profile.github || 'https://github.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-[#181c25] hover:bg-neutral-200 dark:hover:bg-[#202636] border border-neutral-200 dark:border-[#283042] transition-all text-center group"
              >
                <i className="fa-brands fa-github text-xl text-neutral-900 dark:text-white mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-montserrat font-extrabold text-neutral-800 dark:text-neutral-200">
                  GitHub
                </span>
                <span className="text-[9px] text-neutral-400 flex items-center gap-0.5 mt-0.5">
                  Código <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              </a>

              {/* Portafolio */}
              <a
                href={profile.portfolio || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-[#181c25] hover:bg-emerald-500/10 border border-neutral-200 dark:border-[#283042] hover:border-emerald-500/40 transition-all text-center group"
              >
                <Globe className="w-5 h-5 text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-montserrat font-extrabold text-neutral-800 dark:text-neutral-200">
                  Portafolio
                </span>
                <span className="text-[9px] text-neutral-400 flex items-center gap-0.5 mt-0.5">
                  Web <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              </a>

              {/* Twitter / X */}
              <a
                href={profile.twitter || 'https://x.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-[#181c25] hover:bg-neutral-200 dark:hover:bg-[#202636] border border-neutral-200 dark:border-[#283042] transition-all text-center group"
              >
                <i className="fa-brands fa-x-twitter text-xl text-neutral-900 dark:text-white mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-montserrat font-extrabold text-neutral-800 dark:text-neutral-200">
                  X / Twitter
                </span>
                <span className="text-[9px] text-neutral-400 flex items-center gap-0.5 mt-0.5">
                  Seguir <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              </a>
            </div>
          </div>

          {/* =================================================================
              CARD 5: HABILIDADES & STACK TECNOLÓGICO
              ================================================================= */}
          <div className="md:col-span-2 rounded-3xl bg-white dark:bg-[#12151c] p-6 border border-neutral-200 dark:border-[#262c3b] shadow-sm space-y-3">
            <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-400 block">
              Stack de Competencias
            </span>
            <h3 className="font-montserrat text-sm sm:text-base font-black text-neutral-900 dark:text-white">
              Habilidades Técnicas Principales
            </h3>

            <div className="flex flex-wrap gap-2 pt-1">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-montserrat font-bold bg-neutral-100 dark:bg-[#191e2a] text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-[#2c3447]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{skill.name}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-400">Sin habilidades cargadas aún.</span>
              )}
            </div>
          </div>

          {/* =================================================================
              CARD 6: SÍNTESIS PROFESIONAL (RESUMEN EJECUTIVO)
              ================================================================= */}
          <div className="md:col-span-3 lg:col-span-4 rounded-3xl bg-white dark:bg-[#12151c] p-6 sm:p-7 border border-neutral-200 dark:border-[#262c3b] shadow-sm space-y-2">
            <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-emerald-600 dark:text-[#4ade80] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Resumen Ejecutivo & Trayectoria
            </span>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed text-justify">
              {profile.summary || 'Profesional de alto impacto con trayectoria orientada a resultados medibles y estándares internacionales de calidad técnica.'}
            </p>
          </div>
        </div>

        {/* =====================================================================
            BANNER VIRAL: BUCLE DE CRECIMIENTO ORGÁNICO
            ===================================================================== */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-purple-500/10 border border-emerald-500/25 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-montserrat font-bold uppercase tracking-wider text-emerald-600 dark:text-[#4ade80]">
              <JobotIcon className="w-3.5 h-3.5" />
              <span>JobsBOT Sovereign Platform</span>
            </div>
            <h4 className="font-montserrat text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white">
              ¿Eres reclutador o buscas trabajo remoto en USD?
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Genera tu propio perfil Bento verificado, adapta tu CV para filtros ATS y postula a vacantes con sueldo público.
            </p>
          </div>

          {onCreateYourOwn && (
            <button
              onClick={onCreateYourOwn}
              className="px-5 py-2.5 rounded-xl bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
            >
              Crear mi Perfil Gratis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

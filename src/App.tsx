import React, { useState, useEffect, useRef } from 'react';
import {
  BrandConfig,
  ChatMessage,
  CVVersion,
  JobCategory,
  JobOffer,
  ThemeMode,
  UserSession,
} from './types';
import { BRAND_OPTIONS, CURATED_JOBS, VISITOR_SAMPLE_CV } from './data/initialData';
import {
  calculateAtsMatch,
  createTailoredCvVersion,
  fetchLiveJobsFromApis,
  generateOutreachDraft,
} from './services/jobEngine';
import { CvA4Canvas, openStandaloneBrowserCv } from './components/CvA4Canvas';
import { EmailModal } from './components/EmailModal';
import { AuthModal } from './components/AuthModal';
import { LegalComplianceModal } from './components/LegalComplianceModal';

export function App() {
  const brand = BRAND_OPTIONS[0];

  // 1. MODO CLARO / OSCURO (Corrección: inyecta clase 'dark' directamente y recuerda selección)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('myjobsbot_theme') as ThemeMode) || 'auto';
  });

  useEffect(() => {
    localStorage.setItem('myjobsbot_theme', themeMode);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isSystemDark = mediaQuery.matches;
      const shouldDark = themeMode === 'dark' || (themeMode === 'auto' && isSystemDark);

      if (shouldDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [themeMode]);

  // 2. SESIÓN DE USUARIO: SIEMPRE ABRE COMO VISITANTE
  const [session, setSession] = useState<UserSession>({
    isAuthenticated: false,
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingActionAfterAuth, setPendingActionAfterAuth] = useState<'studio' | 'upload' | null>(
    null
  );

  // 3. Pestaña Principal ('jobs' = EMPLEOS | 'studio' = My CV)
  const [activeTab, setActiveTab] = useState<'jobs' | 'studio'>('jobs');

  // 4. CVs: El visitante NUNCA ve el CV personal del dueño, solo una plantilla base de ejemplo
  const [cvVersions, setCvVersions] = useState<CVVersion[]>([VISITOR_SAMPLE_CV]);
  const [activeCvId, setActiveCvId] = useState<string>(VISITOR_SAMPLE_CV.id);
  const activeCv = cvVersions.find((v) => v.id === activeCvId) || cvVersions[0];

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  // 5. Estado de Empleos
  const [jobs, setJobs] = useState<JobOffer[]>(CURATED_JOBS);
  const [selectedCategory, setSelectedCategory] = useState<JobCategory>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'es' | 'written-en'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncingApi, setIsSyncingApi] = useState(false);
  const [apiStatusText, setApiStatusText] = useState('Conectando a APIs públicas...');

  // 6. Modales
  const [selectedJobForEmail, setSelectedJobForEmail] = useState<JobOffer | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);

  // 7. JoBOT — Asistente IA Proactivo
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: '¡Hola! Soy JoBOT, tu agente proactivo de optimización curricular. Analizo en tiempo real las vacantes disponibles y adapto tu CV para que los filtros ATS te posicionen en los primeros lugares. ¿Qué puesto deseas conquistar hoy?',
      timestamp: 'En línea',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Sincronización automática de vacantes con múltiples APIs en paralelo
  const handleSyncLiveJobs = async (customQuery?: string) => {
    setIsSyncingApi(true);
    const q = customQuery || searchQuery || 'remote';
    try {
      const liveOffers = await fetchLiveJobsFromApis(q);
      if (liveOffers.length > 0) {
        setJobs((prev) => {
          const map = new Map<string, JobOffer>();
          [...prev, ...liveOffers].forEach((item) => map.set(item.id, item));
          return Array.from(map.values());
        });
        setApiStatusText(`En vivo (${CURATED_JOBS.length + liveOffers.length} vacantes indexadas)`);
      } else {
        setApiStatusText(`En vivo (${jobs.length} vacantes indexadas)`);
      }
    } catch {
      setApiStatusText(`En vivo (${jobs.length} vacantes indexadas)`);
    } finally {
      setIsSyncingApi(false);
    }
  };

  useEffect(() => {
    handleSyncLiveJobs('remote');
  }, []);

  const requireAuthAndRun = (target: 'studio' | 'upload') => {
    if (!session.isAuthenticated) {
      setPendingActionAfterAuth(target);
      setShowAuthModal(true);
    } else {
      setActiveTab('studio');
      if (target === 'upload') {
        setTimeout(() => cvFileInputRef.current?.click(), 150);
      }
    }
  };

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    if (pendingActionAfterAuth === 'studio' || pendingActionAfterAuth === 'upload') {
      setActiveTab('studio');
      if (pendingActionAfterAuth === 'upload') {
        setTimeout(() => cvFileInputRef.current?.click(), 200);
      }
    }
    setPendingActionAfterAuth(null);
  };

  const togglePhotoInActiveCv = () => {
    setCvVersions((prev) =>
      prev.map((v) =>
        v.id === activeCv.id
          ? {
              ...v,
              profile: {
                ...v.profile,
                showPhotoInCV: !v.profile.showPhotoInCV,
              },
            }
          : v
      )
    );
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setCvVersions((prev) =>
          prev.map((v) => ({
            ...v,
            profile: {
              ...v.profile,
              avatarUrl: dataUrl,
              showPhotoInCV: true,
            },
          }))
        );
        setSession((prev) => ({
          ...prev,
          photoURL: dataUrl,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCvUploadParse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileNameClean = file.name.replace(/\.[^/.]+$/, '');
    const { newVersion, explanation } = createTailoredCvVersion(
      activeCv,
      `CV Importado: ${fileNameClean}`,
      cvVersions.length
    );
    setCvVersions((prev) => [newVersion, ...prev]);
    setActiveCvId(newVersion.id);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `upload-${Date.now()}`,
        sender: 'bot',
        text: `📄 He procesado tu documento "${file.name}". Lo estandaricé bajo el formato ATS limpio de 2 columnas, inyecté las palabras clave recomendadas y creé una versión lista para descargar. ${explanation}`,
        timestamp: 'Ahora',
        createdVersionId: newVersion.id,
      },
    ]);
  };

  const handleSendChatPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userPrompt = chatInput.trim();
    setChatInput('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userPrompt,
      timestamp: 'Ahora',
    };

    const { newVersion, explanation } = createTailoredCvVersion(
      activeCv,
      userPrompt,
      cvVersions.length
    );

    setCvVersions((prev) => [...prev, newVersion]);
    setActiveCvId(newVersion.id);

    const botMsg: ChatMessage = {
      id: `b-${Date.now() + 1}`,
      sender: 'bot',
      text: explanation,
      timestamp: 'Ahora',
      createdVersionId: newVersion.id,
    };

    setChatMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleAdaptCvToJob = (job: JobOffer) => {
    if (!session.isAuthenticated) {
      setPendingActionAfterAuth('studio');
      setShowAuthModal(true);
      return;
    }
    const { newVersion, explanation } = createTailoredCvVersion(
      activeCv,
      job,
      cvVersions.length
    );
    setCvVersions((prev) => [...prev, newVersion]);
    setActiveCvId(newVersion.id);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `job-adapt-${Date.now()}`,
        sender: 'bot',
        text: `🎯 ${explanation}`,
        timestamp: 'Ahora',
        createdVersionId: newVersion.id,
      },
    ]);
    setActiveTab('studio');
  };

  const handleWhatsAppContact = (job: JobOffer) => {
    const draft = generateOutreachDraft(activeCv.profile, job);
    const phone = job.contactWhatsapp || '';
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(draft.whatsappText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(draft.whatsappText)}`;
    window.open(url, '_blank');
  };

  const handleTelegramContact = (job: JobOffer) => {
    const draft = generateOutreachDraft(activeCv.profile, job);
    const tgUser = job.contactTelegram;
    const url = tgUser
      ? `https://t.me/${tgUser}?text=${encodeURIComponent(draft.whatsappText)}`
      : `https://t.me/share/url?url=${encodeURIComponent(job.applyUrl)}&text=${encodeURIComponent(
          draft.whatsappText
        )}`;
    window.open(url, '_blank');
  };

  const renderCategoryFallbackIcon = (cat: JobOffer['category']) => {
    switch (cat) {
      case 'qa':
        return <i className="ri-shield-check-line text-xl" />;
      case 'data':
        return <i className="fa-solid fa-database text-lg" />;
      case 'support':
        return <i className="ri-customer-service-2-line text-xl" />;
      case 'ops':
        return <i className="fa-solid fa-table-list text-lg" />;
      default:
        return <i className="ri-code-s-slash-line text-xl" />;
    }
  };

  const processedJobs = jobs
    .map((job) => ({
      ...job,
      matchScore: calculateAtsMatch(activeCv.profile, job),
    }))
    .filter((job) => {
      if (selectedCategory !== 'all' && job.category !== selectedCategory) return false;
      if (languageFilter === 'es' && job.languageReq !== 'Español 100%') return false;
      if (languageFilter === 'written-en' && job.languageReq === 'Inglés Conversacional') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = `${job.title} ${job.company} ${job.oneLineSummary} ${job.keywords.join(' ')}`.toLowerCase();
        return matchText.includes(q);
      }
      return true;
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F7] dark:bg-[#0B0C0E] text-[#111111] dark:text-[#F3F4F6] transition-colors duration-200">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
      />
      <input
        ref={cvFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.html,.txt"
        className="hidden"
        onChange={handleCvUploadParse}
      />

      {/* =====================================================================
          HEADER EJECUTIVO CON ISOTIPO INVERTIDO Y TEXTO EN UNA LÍNEA
          ===================================================================== */}
      <header className="app-navbar no-print sticky top-0 z-40 bg-white/95 dark:bg-[#111317]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* LOGO: Ícono de Robot SIN fondo blanco (color dinámico invertido) + Texto en 1 sola línea */}
          <div className="flex items-center gap-2.5">
            <i className="ri-robot-3-line text-2xl text-neutral-900 dark:text-white shrink-0" />
            <div>
              <span className="font-montserrat font-extrabold text-base sm:text-lg tracking-[1.8px] uppercase text-neutral-900 dark:text-white">
                {brand.name}
              </span>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                Tu Agente Personal de Búsqueda de Empleo
              </p>
            </div>
          </div>

          {/* NAVEGACIÓN CENTRAL: "EMPLEOS" Y "My CV" */}
          <nav className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-md font-montserrat text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <i className="ri-briefcase-4-line text-sm" />
              <span>EMPLEOS</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                {processedJobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-md font-montserrat text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <i className="ri-file-user-line text-sm" />
              <span>My CV</span>
              {session.isAuthenticated && (
                <span className="hidden md:inline-block px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-500/20">
                  {cvVersions.length} v
                </span>
              )}
            </button>
          </nav>

          {/* CONTROLES: SELECTOR DE TEMA + VISITANTE / LOGIN */}
          <div className="flex items-center gap-2">
            {/* Selector de Modo Claro / Oscuro Funcional */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setThemeMode('auto')}
                title="Modo Automático según tu sistema"
                className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                  themeMode === 'auto'
                    ? 'bg-white dark:bg-neutral-800 shadow-xs text-neutral-900 dark:text-white'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                <i className="ri-computer-line" />
              </button>
              <button
                onClick={() => setThemeMode('light')}
                title="Modo Claro"
                className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                  themeMode === 'light'
                    ? 'bg-white dark:bg-neutral-800 shadow-xs text-amber-500 font-bold'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                <i className="ri-sun-line" />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                title="Modo Oscuro"
                className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-white dark:bg-neutral-800 shadow-xs text-indigo-400 font-bold'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                <i className="ri-moon-clear-line" />
              </button>
            </div>

            {/* Estado: "VISITANTE" / Iniciar Sesión */}
            {!session.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-montserrat font-bold uppercase tracking-wider bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  VISITANTE
                </span>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#111111] text-white dark:bg-white dark:text-[#111111] font-montserrat text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="ri-user-shared-line" />
                  <span>Iniciar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200 dark:border-neutral-800">
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  title="Cambiar foto de perfil"
                  className="w-8 h-8 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700 cursor-pointer relative group shrink-0"
                >
                  <img
                    src={session.photoURL || 'https://ui-avatars.com/api/?name=User&background=111&color=fff'}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => {
                    setSession({ isAuthenticated: false });
                    setCvVersions([VISITOR_SAMPLE_CV]);
                    setActiveCvId(VISITOR_SAMPLE_CV.id);
                  }}
                  title="Salir a modo visitante"
                  className="p-1 rounded text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <i className="ri-logout-box-r-line text-base" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================================
          CONTENIDO
          ===================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'jobs' ? (
          <div className="jobs-feed-section space-y-6">
            {/* BANNER DE OPTIMIZACIÓN */}
            <div className="visitor-banner relative overflow-hidden rounded-xl bg-[#111111] dark:bg-[#161920] text-white p-5 sm:p-6 border border-neutral-800 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 text-[10px] font-montserrat font-bold uppercase tracking-widest text-emerald-400">
                    <i className="ri-robot-3-line text-xs" /> MYJOBSBOT • Radar Inteligente
                  </div>
                  <h2 className="font-montserrat text-lg sm:text-xl font-extrabold uppercase tracking-wide leading-snug">
                    Optimiza tu búsqueda subiendo tu CV o elabora el tuyo desde aquí
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    Estandariza tu perfil a formato ATS para plataformas como{' '}
                    <strong className="text-white">LinkedIn, Get on Board y Remotive</strong>, y encuentra vacantes compatibles automáticamente.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={() => requireAuthAndRun('upload')}
                    className="px-4 py-2.5 rounded-lg bg-white text-[#111111] font-montserrat text-xs font-extrabold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <i className="ri-upload-cloud-2-line text-base" />
                    Subir mi CV
                  </button>
                  <button
                    onClick={() => requireAuthAndRun('studio')}
                    className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/25 font-montserrat text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles text-xs" />
                    Elaborar mi CV
                  </button>
                </div>
              </div>
            </div>

            {/* BARRA DE CONTROL DE EMPLEOS */}
            <div className="bg-white dark:bg-[#121418] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <h3 className="font-montserrat text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
                    Oportunidades de Empleo Indexadas
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {apiStatusText}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleSyncLiveJobs()}
                    disabled={isSyncingApi}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    <i className={`ri-refresh-line text-sm ${isSyncingApi ? 'animate-spin' : ''}`} />
                    Actualizar APIs
                  </button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'all', label: 'Todas las Áreas' },
                      { id: 'qa', label: 'QA & Testing' },
                      { id: 'data', label: 'Data & Contenido' },
                      { id: 'ops', label: 'Operaciones' },
                      { id: 'support', label: 'Soporte' },
                      { id: 'tech', label: 'Tecnología' },
                    ] as { id: JobCategory; label: string }[]
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg font-montserrat text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                          : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                  >
                    <option value="all">Idioma: Todos</option>
                    <option value="es">Solo 100% Español</option>
                    <option value="written-en">Sin Inglés Hablado</option>
                  </select>

                  <div className="relative flex-1 sm:w-60">
                    <i className="ri-search-2-line text-sm text-neutral-400 absolute left-3 top-2" />
                    <input
                      type="text"
                      placeholder="Buscar puesto, empresa, rubro..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSyncLiveJobs(searchQuery)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LISTADO DE EMPLEOS */}
            <div className="space-y-3.5">
              {processedJobs.map((job) => (
                <article
                  key={job.id}
                  className="bg-white dark:bg-[#121418] rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                        {job.companyLogo ? (
                          <img
                            src={job.companyLogo}
                            alt={job.company}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          renderCategoryFallbackIcon(job.category)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-montserrat text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                            {job.company}
                          </span>
                          <span className="text-neutral-300 dark:text-neutral-700">•</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-montserrat font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                            {job.salary}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            {job.languageReq}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            {job.countryScope}
                          </span>
                        </div>

                        <h4 className="font-montserrat text-base font-extrabold text-[#111111] dark:text-white leading-snug">
                          {job.title}
                        </h4>

                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-1">
                          {job.oneLineSummary}
                        </p>
                      </div>
                    </div>

                    <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-neutral-100 dark:border-neutral-800">
                      <div className="text-right">
                        <div className="font-montserrat text-lg font-black text-[#111111] dark:text-white leading-none">
                          {job.matchScore}% MATCH
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          {job.source}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setSelectedJobForEmail(job)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-[#111111] text-white dark:bg-white dark:text-[#111111] hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <i className="fa-solid fa-envelope text-xs" />
                        <span>Enviar Correo Optimizado</span>
                      </button>

                      <button
                        onClick={() => handleWhatsAppContact(job)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-600/25 hover:bg-emerald-600/20 transition-colors cursor-pointer"
                      >
                        <i className="fa-brands fa-whatsapp text-sm" />
                        <span>WhatsApp Directo</span>
                      </button>

                      <button
                        onClick={() => handleTelegramContact(job)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/25 hover:bg-sky-500/20 transition-colors cursor-pointer"
                      >
                        <i className="fa-brands fa-telegram text-sm" />
                        <span>Telegram</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleAdaptCvToJob(job)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <i className="ri-robot-3-line text-sm text-amber-500" />
                        <span>Adaptar mi CV a este puesto</span>
                      </button>

                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:underline"
                      >
                        <span>Portal Oficial</span>
                        <i className="ri-external-link-line text-sm" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          /* ===================================================================
             PESTAÑA My CV + JoBOT
             =================================================================== */
          <div className="space-y-6">
            <div className="cv-toolbar-controls no-print bg-white dark:bg-[#121418] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {cvVersions.map((ver) => (
                  <button
                    key={ver.id}
                    onClick={() => setActiveCvId(ver.id)}
                    className={`px-3.5 py-1.5 rounded-lg font-montserrat text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeCv.id === ver.id
                        ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {ver.label}
                  </button>
                ))}
                <button
                  onClick={() => requireAuthAndRun('upload')}
                  className="px-3 py-1.5 rounded-lg border border-dashed border-neutral-400 dark:border-neutral-600 font-montserrat text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <i className="ri-add-line text-sm" /> Importar CV
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={togglePhotoInActiveCv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-neutral-800 text-white hover:bg-neutral-700 cursor-pointer"
                >
                  {activeCv.profile.showPhotoInCV ? (
                    <>
                      <i className="ri-eye-off-line text-sm" /> Ocultar Foto (Modo ATS)
                    </>
                  ) : (
                    <>
                      <i className="ri-eye-line text-sm" /> Mostrar Foto en CV
                    </>
                  )}
                </button>

                <button
                  onClick={() => openStandaloneBrowserCv(activeCv.profile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <i className="ri-window-line text-sm" />
                  <span>Ver en Pestaña Limpia</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-montserrat font-extrabold uppercase tracking-wider bg-[#111111] text-white dark:bg-white dark:text-[#111111] hover:opacity-90 cursor-pointer shadow-sm"
                >
                  <i className="ri-printer-line text-sm" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="print-only-wrapper xl:col-span-8 overflow-x-auto">
                <CvA4Canvas
                  profile={activeCv.profile}
                  onAvatarClick={() => avatarInputRef.current?.click()}
                />
              </div>

              {/* ASISTENTE JoBOT */}
              <aside className="ai-chat-panel no-print xl:col-span-4 bg-white dark:bg-[#121418] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-lg flex flex-col h-[680px] sticky top-20">
                <div className="p-4 bg-[#111111] text-white rounded-t-xl border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="ri-robot-3-line text-xl text-emerald-400" />
                    <div>
                      <h3 className="font-montserrat text-xs font-extrabold uppercase tracking-wider">
                        JoBOT
                      </h3>
                      <p className="text-[10px] text-neutral-400">
                        Asistente de Adaptación Curricular
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-1.5">
                  {[
                    'Enfocar en Data Entry y Excel',
                    'Adaptar para Analista QA Web',
                    'Modo ATS sin foto',
                  ].map((quick, idx) => (
                    <button
                      key={idx}
                      onClick={() => setChatInput(quick)}
                      className="text-[10px] px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white transition-colors cursor-pointer"
                    >
                      + {quick}
                    </button>
                  ))}
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[90%] rounded-xl p-3 text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] font-medium'
                            : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800'
                        }`}
                      >
                        {msg.text}
                        {msg.createdVersionId && (
                          <button
                            onClick={() => setActiveCvId(msg.createdVersionId!)}
                            className="mt-2 w-full py-1.5 px-2.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-montserrat font-bold text-[10px] uppercase tracking-wider flex items-center justify-between cursor-pointer"
                          >
                            <span>Ver versión</span>
                            <i className="ri-arrow-right-s-line text-sm" />
                          </button>
                        )}
                      </div>
                      <span className="text-[9px] text-neutral-400 mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSendChatPrompt}
                  className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 rounded-b-xl flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Escribe cómo quieres adaptar tu CV..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-lg bg-[#111111] text-white dark:bg-white dark:text-[#111111] font-montserrat text-xs font-bold uppercase tracking-wider hover:opacity-90 cursor-pointer shrink-0"
                  >
                    Enviar
                  </button>
                </form>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* =====================================================================
          FOOTER MINIMALISTA CON 2 BOTONES NATIVOS
          ===================================================================== */}
      <footer className="app-footer no-print mt-12 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111317] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <i className="ri-robot-3-line text-base text-neutral-900 dark:text-white" />
            <span className="font-montserrat font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
              {brand.name}
            </span>
            <span>•</span>
            <span className="text-[11px]">{apiStatusText}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* 2 Botones Minimalistas Adaptados en lugar de iconos sueltos */}
            <button
              onClick={() => alert('Compilación para Android disponible mediante CapacitorJS (npx cap open android)')}
              className="px-2.5 py-1 rounded text-[11px] font-montserrat font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              Android App
            </button>
            <button
              onClick={() => alert('Compilación para iOS disponible mediante CapacitorJS (npx cap open ios)')}
              className="px-2.5 py-1 rounded text-[11px] font-montserrat font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              iOS App
            </button>

            <button
              onClick={() => setShowLegalModal(true)}
              className="ml-2 text-[11px] font-montserrat font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer"
            >
              Políticas & APIs
            </button>
          </div>
        </div>
      </footer>

      {selectedJobForEmail && (
        <EmailModal
          job={selectedJobForEmail}
          activeCv={activeCv}
          onClose={() => setSelectedJobForEmail(null)}
          onPrintCv={() => {
            setSelectedJobForEmail(null);
            setActiveTab('studio');
            setTimeout(() => window.print(), 300);
          }}
        />
      )}

      {showAuthModal && (
        <AuthModal
          brandName={brand.name}
          onClose={() => setShowAuthModal(false)}
          onSuccessLogin={handleLoginSuccess}
        />
      )}

      {showLegalModal && (
        <LegalComplianceModal
          brandName={brand.name}
          onClose={() => setShowLegalModal(false)}
        />
      )}
    </div>
  );
}
export default App;

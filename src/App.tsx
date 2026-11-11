import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { parseUploadedCvFile } from './services/cvParser';
import { onAuthStatusChanged, logoutUserReal } from './services/firebaseAuth';
import { CvA4Canvas, openStandaloneBrowserCv } from './components/CvA4Canvas';
import { EmailModal } from './components/EmailModal';
import { AuthModal } from './components/AuthModal';
import { LegalComplianceModal } from './components/LegalComplianceModal';
import { JobDetailModal } from './components/JobDetailModal';
import { Crown } from 'lucide-react';
import { CompanyLogo } from './components/CompanyLogo';
import { PortalBadge } from './components/PortalBadge';
import { NetworkTrustBanner } from './components/NetworkTrustBanner';
import { MidScrollIncentiveModal } from './components/MidScrollIncentiveModal';
import { AppSplashScreen } from './components/AppSplashScreen';
import { PostJobModal } from './components/PostJobModal';
import { SponsoredFeedCard } from './components/SponsoredFeedCard';
import { buildAffiliateApplyUrl, recordOutboundClick } from './services/affiliateEngine';
import { JobotIcon } from './components/JobotIcon';

export function App() {
  const brand = BRAND_OPTIONS[0];
  const APP_VERSION = 'v1.2.13';
  const [showSplash, setShowSplash] = useState(true);

  // 1. MODO DARK CARBONE / CLARO (Fondo #0a0a0c profundo vs tarjetas #16181d carbón)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('myjobsbot_theme') as ThemeMode) || 'dark';
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

  // 2. SESIÓN DE USUARIO: SINCRONIZADA CON FIREBASE AUTHENTICATION
  const [session, setSession] = useState<UserSession>({
    isAuthenticated: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStatusChanged((fbSession) => {
      if (fbSession.isAuthenticated) {
        setSession(fbSession);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUserReal();
    } catch (err) {
      console.warn('Error al cerrar sesión:', err);
    }
    setSession({ isAuthenticated: false });
    setCvVersions([VISITOR_SAMPLE_CV]);
    setActiveCvId(VISITOR_SAMPLE_CV.id);
  };
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
  const hasCustomCv = activeCv.id !== 'cv-sample-visitor';

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  // 5. Estado de Empleos
  const [jobs, setJobs] = useState<JobOffer[]>(CURATED_JOBS);
  const [selectedCategory, setSelectedCategory] = useState<JobCategory>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'es' | 'written-en'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncingApi, setIsSyncingApi] = useState(false);
  const [apiStatusText, setApiStatusText] = useState('Sincronizando con redes de empleo...');

  // 6. Modales
  const [selectedJobForEmail, setSelectedJobForEmail] = useState<JobOffer | null>(null);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<JobOffer | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showScrollLeadModal, setShowScrollLeadModal] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const scrollTriggerFiredRef = useRef(false);

  // Trigger mid-scroll: cuando el visitante no logueado scrollea a la mitad del feed
  useEffect(() => {
    if (session.isAuthenticated) return;
    const dismissed = sessionStorage.getItem('myjobsbot_scroll_lead_dismissed');
    if (dismissed === 'true') return;

    const handleScroll = () => {
      if (scrollTriggerFiredRef.current || session.isAuthenticated) return;
      const scrollPos = window.scrollY + window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      // Dispara cuando el usuario ha recorrido el 45% de la página
      if (totalHeight > 800 && scrollPos / totalHeight >= 0.45) {
        scrollTriggerFiredRef.current = true;
        setShowScrollLeadModal(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [session.isAuthenticated]);

  const handleDismissScrollLead = () => {
    setShowScrollLeadModal(false);
    sessionStorage.setItem('myjobsbot_scroll_lead_dismissed', 'true');
  };

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
    const defaultSearch = hasCustomCv && activeCv.targetRole ? activeCv.targetRole : 'remote';
    const q = customQuery !== undefined ? customQuery : (searchQuery || defaultSearch);
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
    handleSyncLiveJobs();
  }, []);

  // Adaptación dinámica del radar cuando el usuario muta o selecciona otro CV
  useEffect(() => {
    if (hasCustomCv && activeCv.targetRole) {
      if (!searchQuery) {
        handleSyncLiveJobs(activeCv.targetRole);
      }
    }
  }, [activeCvId]);

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

  const handleCvUploadParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { version, detectedSkillsCount } = await parseUploadedCvFile(
        file,
        cvVersions.length,
        session.displayName || 'Candidato Profesional'
      );

      setCvVersions((prev) => [version, ...prev]);
      setActiveCvId(version.id);
      setActiveTab('studio'); // Directo al Estudio para ver el CV Virtual rellenado

      setChatMessages((prev) => [
        ...prev,
        {
          id: `upload-${Date.now()}`,
          sender: 'bot',
          text: `📄 ¡Tu CV "${file.name}" fue digitalizado con éxito! He completado tu CV Virtual ATS con tus datos de contacto (${version.profile.email}, ${version.profile.phone}), detecté ${detectedSkillsCount} habilidades y estructuré tus experiencias. Ya puedes afinar cualquier campo a mano o generar nuevas adaptaciones automáticas.`,
          timestamp: 'Ahora',
          createdVersionId: version.id,
        },
      ]);
    } catch (err) {
      console.error('Error al procesar el archivo de CV:', err);
      const fileNameClean = file.name.replace(/\.[^/.]+$/, '');
      const { newVersion, explanation } = createTailoredCvVersion(
        activeCv,
        `CV Importado: ${fileNameClean}`,
        cvVersions.length
      );
      setCvVersions((prev) => [newVersion, ...prev]);
      setActiveCvId(newVersion.id);
      setActiveTab('studio');
    }
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
        return <i className="ri-shield-check-line text-xl text-emerald-400" />;
      case 'data':
        return <i className="fa-solid fa-database text-lg text-emerald-400" />;
      case 'support':
        return <i className="ri-customer-service-2-line text-xl text-emerald-400" />;
      case 'ops':
        return <i className="fa-solid fa-table-list text-lg text-emerald-400" />;
      default:
        return <i className="ri-code-s-slash-line text-xl text-emerald-400" />;
    }
  };

  // Procesamiento y filtrado de vacantes:
  // Si el usuario no está logueado, se muestra un pupurrí de hasta 10 ofertas por categoría
  // para incentivar el registro y subida de CV para obtener el feed completo y personalizado.
  const processedJobs = useMemo(() => {
    let list = jobs
      .map((job) => ({
        ...job,
        matchScore: hasCustomCv ? calculateAtsMatch(activeCv.profile, job) : 0,
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
      });

    // Ordenamiento: Las ofertas destacadas B2B (Vía B) se fijan en el TOP absoluto,
    // seguido del score ATS calculado si el usuario tiene su CV cargado.
    list.sort((a, b) => {
      const aFeat = a.isFeatured ? 1 : 0;
      const bFeat = b.isFeatured ? 1 : 0;
      if (aFeat !== bFeat) return bFeat - aFeat;
      if (hasCustomCv) {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      return 0;
    });

    // Regla de Pupurrí para usuarios no autenticados:
    // Máximo 10 ofertas por categoría si está en 'all', o hasta 10 ofertas en la categoría seleccionada
    if (!session.isAuthenticated) {
      if (selectedCategory === 'all') {
        const countMap: Record<string, number> = {};
        list = list.filter((j) => {
          const cat = j.category || 'tech';
          countMap[cat] = (countMap[cat] || 0) + 1;
          return countMap[cat] <= 10;
        });
      } else {
        list = list.slice(0, 10);
      }
    }

    return list;
  }, [jobs, selectedCategory, languageFilter, searchQuery, hasCustomCv, activeCv, session.isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] dark:bg-[#070709] text-[#111111] dark:text-[#E2E8F0] transition-colors duration-200">
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
          HEADER EJECUTIVO: ADAPTABLE A MÓVILES Y ANDROID
          ===================================================================== */}
      <header className="app-navbar no-print sticky top-0 z-40 bg-white/95 dark:bg-[#0f1115]/95 backdrop-blur-md border-b border-neutral-200 dark:border-[#20242c] shadow-xs w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-4 w-full min-w-0">
          {/* LOGO: Ícono Oficial de Robot y Título en Verde Claro Neón (#4ade80) */}
          <button
            onClick={() => {
              setActiveTab('jobs');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer group hover:opacity-95 transition-all bg-transparent border-0 p-0 outline-hidden shrink-0"
            title="Ir al Inicio (Radar de Empleos)"
            aria-label="Ir al Inicio de JobsBOT"
          >
            <JobotIcon className="h-10 sm:h-11 md:h-12 w-auto text-emerald-600 dark:text-[#4ade80] shrink-0 drop-shadow-[0_0_12px_rgba(74,222,128,0.35)] group-hover:scale-105 transition-transform" />
            <div className="flex flex-col justify-center leading-none">
              <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
                <span className="font-montserrat font-black text-sm sm:text-base md:text-lg tracking-[0.8px] sm:tracking-[1.8px] uppercase text-emerald-600 dark:text-[#4ade80] group-hover:text-emerald-500 dark:group-hover:text-[#6ee7b7] transition-colors">
                  {brand.name}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1 sm:px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-[#181c25] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-[#2b3040]">
                  {APP_VERSION}
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 whitespace-nowrap mt-1 leading-none">
                Tu Agente Personal de Búsqueda de Empleo
              </p>
            </div>
          </button>

          {/* NAVEGACIÓN CENTRAL: "EMPLEOS" Y "My CV" */}
          <nav className="flex items-center gap-0.5 sm:gap-1 bg-neutral-100 dark:bg-[#15181f] p-0.5 sm:p-1 rounded-lg border border-neutral-200 dark:border-[#232732] shrink-0">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-1.5 sm:px-3.5 py-1 sm:py-1.5 rounded-md font-montserrat text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <i className="ri-briefcase-4-line text-xs sm:text-sm" />
              <span className="hidden sm:inline">EMPLEOS</span>
              <span className={`px-1 sm:px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold ${
                activeTab === 'jobs' 
                  ? 'bg-black/15 text-white dark:bg-black/20 dark:text-black' 
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-[#4ade80]'
              }`}>
                {processedJobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`px-1.5 sm:px-3.5 py-1 sm:py-1.5 rounded-md font-montserrat text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <i className="ri-file-user-line text-xs sm:text-sm" />
              <span>CV</span>
              {session.isAuthenticated && (
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-500/20">
                  {cvVersions.length} v
                </span>
              )}
            </button>

            {/* BOTÓN B2B: PUBLICAR OFERTA DESTACADA */}
            <button
              onClick={() => setShowPostJobModal(true)}
              className="px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md font-montserrat text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
              title="Publicar y destacar vacante para empresas (B2B)"
            >
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Publicar</span>
            </button>
          </nav>

          {/* CONTROLES: SELECTOR DE TEMA + VISITANTE / LOGIN */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Versión móvil del botón de tema (un solo botón alternador) */}
            <button
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              title="Cambiar tema de color"
              className="sm:hidden p-1.5 rounded-lg border border-neutral-200 dark:border-[#232732] bg-neutral-100 dark:bg-[#15181f] text-neutral-700 dark:text-[#4ade80] text-xs cursor-pointer"
            >
              {themeMode === 'dark' ? <i className="ri-sun-line text-amber-400" /> : <i className="ri-moon-clear-line text-emerald-600" />}
            </button>

            {/* Versión desktop del selector de tema (3 botones) */}
            <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-[#15181f] p-1 rounded-lg border border-neutral-200 dark:border-[#232732]">
              <button
                onClick={() => setThemeMode('auto')}
                title="Modo Automático según tu sistema"
                className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                  themeMode === 'auto'
                    ? 'bg-white dark:bg-[#202530] shadow-xs text-neutral-900 dark:text-white'
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
                    ? 'bg-white dark:bg-[#202530] shadow-xs text-amber-500 font-bold'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                <i className="ri-sun-line" />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                title="Modo Oscuro Carbone"
                className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-white dark:bg-[#202530] shadow-xs text-[#4ade80] font-bold'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                <i className="ri-moon-clear-line" />
              </button>
            </div>

            {!session.isAuthenticated ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-montserrat font-bold uppercase tracking-wider bg-neutral-200/80 dark:bg-[#1a1e27] text-neutral-600 dark:text-neutral-300 border border-transparent dark:border-[#2a2f3d]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#4ade80] animate-pulse" />
                  VISITANTE
                </span>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-[10px] sm:text-xs font-extrabold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <i className="ri-user-shared-line text-xs" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Entrar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 sm:pl-2 border-l border-neutral-200 dark:border-[#20242c]">
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  title="Cambiar foto de perfil"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-neutral-300 dark:border-[#4ade80]/50 cursor-pointer relative group shrink-0"
                >
                  <img
                    src={session.photoURL || 'https://ui-avatars.com/api/?name=User&background=111&color=4ade80'}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="p-1 rounded text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <i className="ri-logout-box-r-line text-sm sm:text-base" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BANNER DE PORTALES CONECTADOS EN TIEMPO REAL */}
      <NetworkTrustBanner totalIndexed={jobs.length} />

      {/* =====================================================================
          CONTENIDO: MODO DARK CARBONE (#121419 / #191c24 CON CONTRASTE ELEVADO)
          ===================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'jobs' ? (
          <div className="jobs-feed-section space-y-6">
            {/* BANNER DE OPTIMIZACIÓN (FONDO CARBÓN ELEVADO #12151c CON BORDE CONTRASTADO) */}
            <div className="visitor-banner relative overflow-hidden rounded-xl bg-white dark:bg-[#12151c] text-neutral-900 dark:text-white p-5 sm:p-6 border border-neutral-200 dark:border-[#252a36] shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 dark:bg-[#4ade80]/15 text-[10px] font-montserrat font-bold uppercase tracking-widest text-emerald-600 dark:text-[#4ade80] border border-emerald-500/20 dark:border-[#4ade80]/30">
                    <i className="ri-sparkling-fill text-xs text-emerald-500 dark:text-[#4ade80]" /> Búsqueda Inteligente
                  </div>
                  <h2 className="font-montserrat text-lg sm:text-xl font-extrabold uppercase tracking-wide leading-snug">
                    Optimiza tu búsqueda subiendo tu CV
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Estandariza tu perfil a formato ATS para plataformas como{' '}
                    <strong className="text-neutral-900 dark:text-white">LinkedIn, Get on Board y Remotive</strong>, y encuentra vacantes compatibles automáticamente.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={() => requireAuthAndRun('upload')}
                    className="px-4 py-2.5 rounded-lg bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-xs font-extrabold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <i className="ri-upload-cloud-2-line text-base" />
                    Subir mi CV
                  </button>
                  <button
                    onClick={() => requireAuthAndRun('studio')}
                    className="px-4 py-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1a1e28] dark:hover:bg-[#232836] text-neutral-900 dark:text-white border border-neutral-300 dark:border-[#2f3545] font-montserrat text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles text-xs text-amber-500 dark:text-[#4ade80]" />
                    Elaborar mi CV
                  </button>
                </div>
              </div>
            </div>

            {/* BARRA DE FILTROS (FONDO CARBÓN #12151c) */}
            <div className="bg-white dark:bg-[#12151c] p-4 rounded-xl border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-neutral-200 dark:border-[#202532]">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-montserrat text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
                    Oportunidades de Empleo Indexadas
                  </h3>
                  {!session.isAuthenticated ? (
                    <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="ri-eye-line text-xs" /> Muestra Pública (Selección Curada 10x)
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-[#4ade80] border border-emerald-500/20 dark:border-[#4ade80]/30 font-semibold">
                      {apiStatusText}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleSyncLiveJobs()}
                    disabled={isSyncingApi}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-[#2f3545] bg-neutral-50 dark:bg-[#181c25] hover:bg-neutral-100 dark:hover:bg-[#202633] text-neutral-800 dark:text-neutral-200 cursor-pointer transition-colors"
                  >
                    <i className={`ri-refresh-line text-sm ${isSyncingApi ? 'animate-spin' : ''}`} />
                    Actualizar
                  </button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'all', label: 'Todas las Áreas' },
                      { id: 'tech', label: 'Tecnología' },
                      { id: 'health', label: 'Salud & Medicina' },
                      { id: 'legal', label: 'Legal & Leyes' },
                      { id: 'finance', label: 'Finanzas & Contab.' },
                      { id: 'sales', label: 'Ventas & Comercial' },
                      { id: 'support', label: 'Soporte al Cliente' },
                      { id: 'ops', label: 'Operaciones' },
                      { id: 'data', label: 'Datos & IA' },
                      { id: 'qa', label: 'QA & Calidad' },
                    ] as { id: JobCategory; label: string }[]
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg font-montserrat text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                          : 'bg-neutral-100 dark:bg-[#181c25] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#222734] border border-transparent dark:border-[#252a36]'
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
                    className="px-3 py-1.5 rounded-lg text-xs bg-neutral-100 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2f3545] text-neutral-900 dark:text-neutral-200"
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
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-neutral-100 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2f3545] text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AVISO DE MUESTRA PÚBLICA PARA USUARIOS NO AUTENTICADOS */}
            {!session.isAuthenticated && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <i className="ri-information-line text-base" />
                  </div>
                  <div>
                    <h5 className="font-montserrat font-bold text-neutral-900 dark:text-white text-xs">
                      Estás en Modo Visitante: Mostrando selección curada de muestra (hasta 10 empleos por área)
                    </h5>
                    <p className="text-neutral-600 dark:text-neutral-400 text-[11px] mt-0.5 leading-relaxed">
                      Para ver las <strong>89+ vacantes completas</strong> y recibir recomendaciones adaptadas a tu perfil con cálculo de afinidad ATS, <strong>inicia sesión y sube tu CV</strong>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-[11px] font-extrabold uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <i className="ri-user-shared-line text-xs" />
                  Iniciar Sesión
                </button>
              </div>
            )}

            {/* TARJETAS DE EMPLEO OPTIMIZADAS PARA MÓVIL Y DESKTOP */}
            <div className="space-y-3 sm:space-y-3.5">
              {processedJobs.map((job, index) => {
                const isFeatured = !!job.isFeatured;
                const outboundUrl = buildAffiliateApplyUrl(job);

                return (
                  <React.Fragment key={job.id}>
                    <article
                      onClick={() => setSelectedJobForDetails(job)}
                      className={`rounded-xl transition-all shadow-sm cursor-pointer group p-3.5 sm:p-5 relative ${
                        isFeatured
                          ? 'border-2 border-amber-500/60 dark:border-amber-400/60 bg-gradient-to-r from-amber-500/5 via-white to-amber-500/5 dark:from-amber-950/20 dark:via-[#141722] dark:to-amber-950/10 shadow-md'
                          : 'bg-white dark:bg-[#12151c] border border-neutral-200 dark:border-[#242935] hover:border-neutral-400 dark:hover:border-[#4ade80]/60'
                      }`}
                    >
                      {/* Distintivo de Oferta Destacada B2B */}
                      {isFeatured && (
                        <div className="mb-2.5 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-montserrat font-black uppercase tracking-wider bg-amber-500 text-black shadow-xs">
                            <Crown className="w-3 h-3" />
                            {job.featuredBadge || 'OFERTA DESTACADA'}
                          </span>
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <i className="ri-verified-badge-fill text-xs" />
                            Empresa Verificada (Prioridad TOP)
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 sm:gap-4 flex-1 min-w-0">
                          <CompanyLogo
                            logoUrl={job.companyLogo}
                            companyName={job.company}
                            category={job.category}
                            sizeClass="w-10 h-10 sm:w-12 sm:h-12 shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                              <span className="font-montserrat text-xs font-extrabold uppercase tracking-wider text-neutral-600 dark:text-[#4ade80]">
                                {job.company}
                              </span>
                              <span className="text-neutral-300 dark:text-neutral-600">•</span>
                              <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-montserrat font-bold bg-neutral-100 dark:bg-[#1a1e28] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-[#2a3040]">
                                {job.salary}
                              </span>
                              <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-neutral-100 dark:bg-[#1a1e28] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-[#2a3040]">
                                {job.languageReq}
                              </span>
                              <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-[#4ade80] border border-emerald-500/20 dark:border-[#4ade80]/30">
                                {job.countryScope}
                              </span>
                            </div>

                            <h4 className="font-montserrat text-sm sm:text-base font-extrabold text-[#111111] dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-[#4ade80] transition-colors">
                              {job.title}
                            </h4>

                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                              {job.oneLineSummary}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right flex flex-col items-end">
                          {hasCustomCv ? (
                            <div className="font-montserrat text-base sm:text-lg font-black text-[#111111] dark:text-[#4ade80] leading-none">
                              {job.matchScore}% MATCH
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requireAuthAndRun('upload');
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] sm:text-[10px] font-montserrat font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-[#4ade80] border border-emerald-500/25 dark:border-[#4ade80]/30 hover:bg-emerald-500/20 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                              title="Sube tu CV para calcular tu afinidad ATS exacta"
                            >
                              <i className="ri-upload-cloud-2-line text-xs" />
                              <span className="hidden sm:inline">Subir CV para Match</span>
                              <span className="sm:hidden">Match ATS</span>
                            </button>
                          )}
                          <div className="mt-1">
                            <PortalBadge source={job.source} size="sm" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 sm:pt-3 border-t border-neutral-100 dark:border-[#202532] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {/* Botón Ver Propuesta / Oferta Completa */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJobForDetails(job);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-montserrat font-bold uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1a1f2b] dark:hover:bg-[#232938] text-neutral-900 dark:text-white border border-neutral-300 dark:border-[#2b3345] hover:border-neutral-400 dark:hover:border-[#4ade80]/60 transition-all cursor-pointer shadow-xs"
                            title="Ver detalles completos de esta vacante"
                          >
                            <i className="ri-file-list-3-line text-xs text-emerald-600 dark:text-[#4ade80]" />
                            <span>Ver Oferta</span>
                          </button>

                          {/* Enviar Correo Optimizado */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJobForEmail(job);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-[#111111] text-white dark:bg-[#1c222e] dark:hover:bg-[#252c3c] dark:text-white border border-transparent dark:border-[#32394c] transition-colors cursor-pointer shadow-xs"
                            title="Enviar correo de postulación ATS formal"
                          >
                            <i className="fa-solid fa-envelope text-xs text-amber-400 dark:text-[#4ade80]" />
                            <span className="hidden sm:inline">Enviar Correo Optimizado</span>
                            <span className="sm:hidden">Correo ATS</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {/* Adaptar CV */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdaptCvToJob(job);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-[#32394c] bg-transparent dark:bg-[#171a23] hover:bg-neutral-100 dark:hover:bg-[#222634] text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                            title="Adaptar CV con IA a este puesto"
                          >
                            <JobotIcon className="w-3.5 h-3.5 text-amber-500 dark:text-[#4ade80]" />
                            <span className="hidden sm:inline">Adaptar mi CV a este puesto</span>
                            <span className="sm:hidden">Adaptar CV</span>
                          </button>

                          {/* Portal Oficial con Afiliación CPC/CPA (Vía A) */}
                          <a
                            href={outboundUrl}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            onClick={(e) => {
                              e.stopPropagation();
                              recordOutboundClick(job);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-[#4ade80]"
                            title="Ver en portal oficial"
                          >
                            <span className="hidden sm:inline">Portal</span>
                            <i className="ri-external-link-line text-xs" />
                          </a>
                        </div>
                      </div>
                    </article>

                    {/* MONETIZACIÓN VÍA D: ANUNCIO NATIVO DISCRETO CADA 8 OFERTAS */}
                    {(index + 1) % 8 === 0 && (
                      <SponsoredFeedCard index={index} />
                    )}
                  </React.Fragment>
                );
              })}

              {/* BLOQUE INFORMATIVO DE CIERRE DE MUESTRA PARA USUARIOS NO LOGUEADOS */}
              {!session.isAuthenticated && processedJobs.length > 0 && (
                <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#12151c] border-2 border-dashed border-neutral-300 dark:border-[#282e3c] text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-[#4ade80] flex items-center justify-center mx-auto text-xl">
                    <i className="ri-lock-2-line" />
                  </div>
                  <h4 className="font-montserrat text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white">
                    ¿Quieres ver más ofertas y personalizarlas para ti?
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                    Hay más de 89 vacantes indexadas en tiempo real. Inicia sesión gratis y sube tu CV para que JoBOT alinee automáticamente tu perfil con los requisitos del empleador.
                  </p>
                  <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                    >
                      Iniciar Sesión Gratis
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ===================================================================
             PESTAÑA My CV + JoBOT
             =================================================================== */
          <div className="space-y-6">
            <div className="cv-toolbar-controls no-print bg-white dark:bg-[#12151c] p-4 rounded-xl border border-neutral-200 dark:border-[#252a36] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {cvVersions.map((ver) => (
                  <button
                    key={ver.id}
                    onClick={() => setActiveCvId(ver.id)}
                    className={`px-3.5 py-1.5 rounded-lg font-montserrat text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeCv.id === ver.id
                        ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                        : 'bg-neutral-100 dark:bg-[#181c25] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#222734] border border-transparent dark:border-[#2a2f3e]'
                    }`}
                  >
                    {ver.label}
                  </button>
                ))}
                <button
                  onClick={() => requireAuthAndRun('upload')}
                  className="px-3 py-1.5 rounded-lg border border-dashed border-neutral-400 dark:border-[#384054] font-montserrat text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-neutral-100 dark:hover:bg-[#1b1f2a] cursor-pointer"
                >
                  <i className="ri-add-line text-sm text-emerald-500 dark:text-[#4ade80]" /> Importar CV
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={togglePhotoInActiveCv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-neutral-800 dark:bg-[#1c222e] text-white hover:bg-neutral-700 dark:hover:bg-[#252c3c] border border-transparent dark:border-[#32394c] cursor-pointer"
                >
                  {activeCv.profile.showPhotoInCV ? (
                    <>
                      <i className="ri-eye-off-line text-sm" /> Ocultar Foto (Modo ATS)
                    </>
                  ) : (
                    <>
                      <i className="ri-eye-line text-sm text-[#4ade80]" /> Mostrar Foto en CV
                    </>
                  )}
                </button>

                <button
                  onClick={() => openStandaloneBrowserCv(activeCv.profile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-[#32394c] bg-transparent dark:bg-[#171a23] hover:bg-neutral-100 dark:hover:bg-[#202532] cursor-pointer"
                >
                  <i className="ri-window-line text-sm" />
                  <span>Ver en Pestaña Limpia</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-montserrat font-extrabold uppercase tracking-wider bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] hover:opacity-90 cursor-pointer shadow-sm"
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

              {/* ASISTENTE JoBOT (MODO CARBÓN #12151c) */}
              <aside className="ai-chat-panel no-print xl:col-span-4 bg-white dark:bg-[#12151c] rounded-xl border border-neutral-200 dark:border-[#252a36] shadow-xl flex flex-col h-[680px] sticky top-20">
                <div className="p-4 bg-[#111111] dark:bg-[#161a23] text-white rounded-t-xl border-b border-neutral-800 dark:border-[#242936] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/favicon.svg"
                      alt="JoBOT"
                      className="w-8 h-8 shrink-0 drop-shadow-[0_0_10px_rgba(74,222,128,0.4)]"
                    />
                    <div>
                      <h3 className="font-montserrat text-xs font-extrabold uppercase tracking-wider text-emerald-400 dark:text-[#4ade80]">
                        JoBOT
                      </h3>
                      <p className="text-[10px] text-neutral-400">
                        Asistente de Adaptación Curricular
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-[#151821] border-b border-neutral-200 dark:border-[#242936] flex flex-wrap gap-1.5">
                  {[
                    'Enfocar en Data Entry y Excel',
                    'Adaptar para Analista QA Web',
                    'Modo ATS sin foto',
                  ].map((quick, idx) => (
                    <button
                      key={idx}
                      onClick={() => setChatInput(quick)}
                      className="text-[10px] px-2.5 py-1 rounded-md bg-white dark:bg-[#1c212c] border border-neutral-200 dark:border-[#2d3444] text-neutral-800 dark:text-neutral-200 hover:border-neutral-900 dark:hover:border-[#4ade80] transition-colors cursor-pointer"
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
                      <div className="flex items-start gap-2 max-w-[95%]">
                        {msg.sender === 'bot' && (
                          <img
                            src="/favicon.svg"
                            alt="JoBOT"
                            className="w-5 h-5 shrink-0 mt-0.5 drop-shadow-[0_0_6px_rgba(74,222,128,0.3)]"
                          />
                        )}
                        <div
                          className={`rounded-xl p-3 text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-medium shadow-xs'
                              : 'bg-neutral-100 dark:bg-[#181c25] text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-[#262c3b]'
                          }`}
                        >
                          {msg.text}
                          {msg.createdVersionId && (
                            <button
                              onClick={() => setActiveCvId(msg.createdVersionId!)}
                              className="mt-2 w-full py-1.5 px-2.5 rounded bg-emerald-500/15 dark:bg-[#4ade80]/15 text-emerald-700 dark:text-[#4ade80] border border-emerald-500/25 dark:border-[#4ade80]/30 font-montserrat font-bold text-[10px] uppercase tracking-wider flex items-center justify-between cursor-pointer"
                            >
                              <span>Ver versión</span>
                              <i className="ri-arrow-right-s-line text-sm" />
                            </button>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] text-neutral-400 mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSendChatPrompt}
                  className="p-3 border-t border-neutral-200 dark:border-[#242936] bg-neutral-50 dark:bg-[#151821] rounded-b-xl flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Escribe cómo quieres adaptar tu CV..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs bg-white dark:bg-[#191d27] border border-neutral-300 dark:border-[#2f3545] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-lg bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-xs font-bold uppercase tracking-wider hover:opacity-90 cursor-pointer shrink-0"
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
          FOOTER MINIMALISTA CON INDICADOR EN VIVO E ICONOS DE TIENDAS
          ===================================================================== */}
      <footer className="app-footer no-print mt-12 border-t border-neutral-200 dark:border-[#20242c] bg-white dark:bg-[#0c0d11] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('jobs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer group hover:opacity-90 transition-all bg-transparent border-0 p-0 outline-hidden"
              title="Ir al Inicio (Radar de Empleos)"
            >
              <JobotIcon className="h-10 sm:h-11 w-auto text-emerald-600 dark:text-[#4ade80] group-hover:scale-105 transition-transform shrink-0 drop-shadow-[0_0_8px_rgba(74,222,128,0.25)]" />
              <div className="flex flex-col justify-center leading-none">
                <span className="font-montserrat font-black text-sm sm:text-base text-emerald-600 dark:text-[#4ade80] uppercase tracking-[1px] group-hover:text-emerald-500 dark:group-hover:text-[#6ee7b7] transition-colors">
                  MY
                </span>
                <span className="font-montserrat font-black text-sm sm:text-base text-emerald-600 dark:text-[#4ade80] uppercase tracking-[1px] group-hover:text-emerald-500 dark:group-hover:text-[#6ee7b7] transition-colors mt-0.5">
                  JOBSBOT
                </span>
              </div>
            </button>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#181c25] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-[#2b3040]">
              {APP_VERSION}
            </span>
            <span>•</span>
            {/* Indicador de Punto Verde animado (En Vivo) */}
            <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
              </span>
              {apiStatusText}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Botón Adaptado de Descarga en Google Play (Android) */}
            <button
              onClick={() => alert('Compilación para Android disponible mediante CapacitorJS (npx cap open android)')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-[#141720] dark:hover:bg-[#1c212e] text-left border border-neutral-300 dark:border-[#252b39] hover:border-neutral-400 dark:hover:border-[#4ade80]/50 transition-all cursor-pointer shadow-xs group"
              title="Descargar para Android en Google Play (CapacitorJS)"
              aria-label="Descargar en Google Play"
            >
              <i className="fa-brands fa-google-play text-sm text-emerald-600 dark:text-[#4ade80] group-hover:scale-110 transition-transform shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[8px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Disponible en
                </span>
                <span className="text-[11px] font-montserrat font-extrabold text-neutral-900 dark:text-white">
                  Google Play
                </span>
              </div>
            </button>

            {/* Botón Adaptado de Descarga en App Store (iOS) */}
            <button
              onClick={() => alert('Compilación para iOS disponible mediante CapacitorJS (npx cap open ios)')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-[#141720] dark:hover:bg-[#1c212e] text-left border border-neutral-300 dark:border-[#252b39] hover:border-neutral-400 dark:hover:border-[#4ade80]/50 transition-all cursor-pointer shadow-xs group"
              title="Descargar para iOS en App Store (CapacitorJS)"
              aria-label="Descargar en App Store"
            >
              <i className="fa-brands fa-apple text-base text-emerald-600 dark:text-[#4ade80] group-hover:scale-110 transition-transform shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[8px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Consíguelo en el
                </span>
                <span className="text-[11px] font-montserrat font-extrabold text-neutral-900 dark:text-white">
                  App Store
                </span>
              </div>
            </button>

            <button
              onClick={() => setShowLegalModal(true)}
              className="ml-2 text-[11px] font-montserrat font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-[#4ade80] underline cursor-pointer"
            >
              Políticas & Portales
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

      {selectedJobForDetails && (
        <JobDetailModal
          job={selectedJobForDetails}
          activeCv={activeCv}
          onClose={() => setSelectedJobForDetails(null)}
          onOpenEmailModal={(job) => {
            setSelectedJobForDetails(null);
            setSelectedJobForEmail(job);
          }}
          onAdaptCv={(job) => {
            setSelectedJobForDetails(null);
            handleAdaptCvToJob(job);
          }}
        />
      )}

      {/* MODAL B2B: PUBLICAR OFERTA DESTACADA */}
      {showPostJobModal && (
        <PostJobModal
          isOpen={showPostJobModal}
          onClose={() => setShowPostJobModal(false)}
          onJobPublished={(newJob) => {
            setJobs((prev) => [newJob, ...prev]);
            setSelectedJobForDetails(newJob);
          }}
        />
      )}

      {/* MODAL INCENTIVO AL SCROLLEAR A MITAD DE PÁGINA (LEAD CAPTURE) */}
      <MidScrollIncentiveModal
        isOpen={showScrollLeadModal}
        onClose={handleDismissScrollLead}
        onLoginClick={() => setShowAuthModal(true)}
      />

      {/* PANTALLA DE ESPERA / SPLASH SCREEN INICIAL (My JobsBOT) */}
      {showSplash && (
        <AppSplashScreen
          onFinish={() => setShowSplash(false)}
          minDurationMs={1700}
        />
      )}
    </div>
  );
}
export default App;

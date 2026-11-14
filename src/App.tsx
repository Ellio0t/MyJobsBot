import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BrandConfig,
  ChatMessage,
  CVProfile,
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
import { CvA4Canvas, openStandaloneBrowserCv, CvTemplateId } from './components/CvA4Canvas';
import { CvQuickEditorPanel } from './components/CvQuickEditorPanel';
import { EmailModal } from './components/EmailModal';
import { AuthModal } from './components/AuthModal';
import { LegalComplianceModal } from './components/LegalComplianceModal';
import { JobDetailModal } from './components/JobDetailModal';
import { PlusCircle, Sparkles } from 'lucide-react';
import { CompanyLogo } from './components/CompanyLogo';
import { PortalBadge } from './components/PortalBadge';
import { NetworkTrustBanner } from './components/NetworkTrustBanner';
import { MidScrollIncentiveModal } from './components/MidScrollIncentiveModal';
import { AppSplashScreen } from './components/AppSplashScreen';
import { PublishJobView } from './components/PublishJobView';
import { SponsoredFeedCard } from './components/SponsoredFeedCard';
import { buildAffiliateApplyUrl, recordOutboundClick } from './services/affiliateEngine';
import { JobotIcon } from './components/JobotIcon';
import { ProfileView } from './components/ProfileView';
import {
  saveVaultLocally,
  loadVaultLocally,
  exportVaultBackupFile
} from './services/sovereigntyStorage';

// Utilidades ergonómicas para visualización limpia en tarjetas de empleo
function formatCompactSalary(raw: string): string {
  if (!raw) return 'A convenir';
  const s = raw.replace(/\s*\([^)]*\)/g, '').trim();
  const rangeMatch = s.match(/(?:\$|USD\s*)?([\d,.]+)\s*(?:-|a|\/)\s*(?:\$|USD\s*)?([\d,.]+)\s*(USD|EUR|\$)?(?:\s*\/\s*(mes|hora|año|mo|hr|h))?/i);
  if (rangeMatch) {
    const min = rangeMatch[1].replace(/^\$/, '');
    const max = rangeMatch[2].replace(/^\$/, '');
    const curr = (rangeMatch[3] && rangeMatch[3] !== '$') ? rangeMatch[3].toUpperCase() : 'USD';
    const period = rangeMatch[4] ? (rangeMatch[4].toLowerCase().startsWith('h') ? '/h' : '') : '';
    return `${min} - ${max} ${curr}${period}`;
  }
  const singleMatch = s.match(/(?:\$|USD\s*)?([\d,.]+)\s*(USD|EUR|\$)?(?:\s*\/\s*(mes|hora|año|mo|hr|h))?/i);
  if (singleMatch) {
    const amt = singleMatch[1].replace(/^\$/, '');
    const curr = (singleMatch[2] && singleMatch[2] !== '$') ? singleMatch[2].toUpperCase() : 'USD';
    const period = singleMatch[3] ? (singleMatch[3].toLowerCase().startsWith('h') ? '/h' : '') : '';
    return `${amt} ${curr}${period}`;
  }
  return s.length > 22 ? s.slice(0, 22) + '…' : s;
}

function formatCompactCountry(scope: string): string {
  if (!scope) return 'Remoto';
  if (scope.toUpperCase().includes('LATAM')) return 'LATAM Remoto';
  if (scope.toLowerCase().includes('global')) return 'Global Remoto';
  if (scope.toLowerCase().includes('hispano')) return 'Hispanoamérica';
  const clean = scope.replace(/\s*\([^)]*\)/g, '').trim();
  return clean.length > 18 ? clean.slice(0, 18) + '…' : clean;
}

const CATEGORY_ITEMS: { id: JobCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Todas', icon: 'ri-apps-2-line' },
  { id: 'tech', label: 'Tecnología', icon: 'ri-code-s-slash-line' },
  { id: 'data', label: 'Datos & IA', icon: 'ri-database-2-line' },
  { id: 'qa', label: 'QA & Calidad', icon: 'ri-checkbox-circle-line' },
  { id: 'support', label: 'Soporte', icon: 'ri-customer-service-2-line' },
  { id: 'sales', label: 'Ventas', icon: 'ri-funds-line' },
  { id: 'finance', label: 'Finanzas', icon: 'ri-money-dollar-circle-line' },
  { id: 'health', label: 'Salud', icon: 'ri-heart-pulse-line' },
  { id: 'legal', label: 'Legal', icon: 'ri-scales-3-line' },
  { id: 'ops', label: 'Operaciones', icon: 'ri-settings-4-line' },
];

export function App() {
  const brand = BRAND_OPTIONS[0];
  const APP_VERSION = 'v1.2.41';
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

  /**
   * Rellena automáticamente los datos del perfil y CV con la cuenta autenticada (Google OAuth)
   * si aún conserva los nombres o placeholders genéricos por defecto.
   */
  const applySessionDataToCv = (userSession: UserSession, versions: CVVersion[]): CVVersion[] => {
    if (!userSession.isAuthenticated) return versions;

    return versions.map((v) => {
      const isDefaultName =
        !v.profile.fullName ||
        v.profile.fullName === 'TU NOMBRE Y APELLIDO' ||
        v.profile.fullName === 'Candidato Profesional' ||
        v.profile.fullName === 'Profesional de Tecnología' ||
        v.profile.fullName.trim() === '';

      const isDefaultEmail =
        !v.profile.email ||
        v.profile.email === 'tu.correo@ejemplo.com' ||
        v.profile.email === 'usuario@jobsbot.pro' ||
        v.profile.email.includes('@ejemplo.com') ||
        v.profile.email.trim() === '';

      const isDefaultAvatar =
        !v.profile.avatarUrl ||
        v.profile.avatarUrl.includes('unsplash.com') ||
        v.profile.avatarUrl.includes('photo-1534528741775') ||
        v.profile.avatarUrl.trim() === '';

      const nextFullName = isDefaultName && userSession.displayName ? userSession.displayName : v.profile.fullName;
      const nextEmail = isDefaultEmail && userSession.email ? userSession.email : v.profile.email;
      const nextAvatar = isDefaultAvatar && userSession.photoURL ? userSession.photoURL : v.profile.avatarUrl;

      return {
        ...v,
        profile: {
          ...v.profile,
          fullName: nextFullName,
          email: nextEmail,
          avatarUrl: nextAvatar,
          showPhotoInCV: userSession.photoURL ? true : v.profile.showPhotoInCV,
        },
      };
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStatusChanged((fbSession) => {
      if (fbSession.isAuthenticated) {
        setSession(fbSession);
        setCvVersions((prev) => applySessionDataToCv(fbSession, prev));
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

  // Enrutamiento SPA nativo con sincronización bidireccional de URL (Deep Linking & Historial)
  const getPageFromUrl = (): 'jobs' | 'studio' | 'profile' | 'publish' => {
    if (typeof window === 'undefined') return 'jobs';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes('/cv') || path.includes('/estudio') || hash.includes('cv') || hash.includes('estudio')) {
      return 'studio';
    }
    if (path.includes('/perfil') || path.includes('/profile') || hash.includes('perfil') || hash.includes('profile')) {
      return 'profile';
    }
    if (path.includes('/publicar') || path.includes('/publish') || hash.includes('publicar') || hash.includes('publish')) {
      return 'publish';
    }
    return 'jobs';
  };

  // 3. Pestaña / Página Principal ('jobs' = / | 'studio' = /cv | 'profile' = /perfil | 'publish' = /publicar)
  const [activeTab, setActiveTab] = useState<'jobs' | 'studio' | 'profile' | 'publish'>(() => getPageFromUrl());

  const navigateTo = (tab: 'jobs' | 'studio' | 'profile' | 'publish', replace = false) => {
    setActiveTab(tab);

    let targetPath = '/';
    let pageTitle = 'JobsBOT • Ofertas de Empleo Remoto y Tech';

    switch (tab) {
      case 'studio':
        targetPath = '/cv';
        pageTitle = 'JobsBOT • Creador de CV A4 y Asistente JoBOT';
        break;
      case 'profile':
        targetPath = '/perfil';
        pageTitle = 'JobsBOT • Mi Perfil y Portabilidad';
        break;
      case 'publish':
        targetPath = '/publicar';
        pageTitle = 'JobsBOT • Publicar Oferta de Empleo';
        break;
      case 'jobs':
      default:
        targetPath = '/';
        pageTitle = 'JobsBOT • Ofertas de Empleo Remoto y Tech';
        break;
    }

    document.title = pageTitle;

    try {
      if (replace) {
        window.history.replaceState({ tab }, '', targetPath);
      } else if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab }, '', targetPath);
      }
    } catch {
      window.location.hash = targetPath === '/' ? '' : targetPath;
    }
  };

  // Escuchar eventos de navegación del navegador (atrás/adelante)
  useEffect(() => {
    const handlePopState = () => {
      const page = getPageFromUrl();
      setActiveTab(page);

      if (page === 'studio') document.title = 'JobsBOT • Creador de CV A4 y Asistente JoBOT';
      else if (page === 'profile') document.title = 'JobsBOT • Mi Perfil y Portabilidad';
      else if (page === 'publish') document.title = 'JobsBOT • Publicar Oferta de Empleo';
      else document.title = 'JobsBOT • Ofertas de Empleo Remoto y Tech';
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Sincronizar ruta inicial en la barra de direcciones
    const initialPage = getPageFromUrl();
    navigateTo(initialPage, true);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // 4. CVs: El visitante NUNCA ve el CV personal del dueño, solo una plantilla base de ejemplo
  const [cvVersions, setCvVersions] = useState<CVVersion[]>([VISITOR_SAMPLE_CV]);
  const [activeCvId, setActiveCvId] = useState<string>(VISITOR_SAMPLE_CV.id);
  const activeCv = cvVersions.find((v) => v.id === activeCvId) || cvVersions[0];
  const hasCustomCv = activeCv.id !== 'cv-sample-visitor';

  // Configuración de visualización y edición en CV Studio
  const [cvScale, setCvScale] = useState<number>(1); // Predeterminado: 100% tamaño real de la hoja física A4 (lo que ves es lo que se imprime)
  const [cvTemplate, setCvTemplate] = useState<CvTemplateId>('harvard'); // Harvard ATS por defecto (1 columna de máxima tracción)
  const [studioRightMode, setStudioRightMode] = useState<'chat' | 'editor'>('chat'); // Alternar entre IA JoBOT y Editor Manual
  const [isJobotFloatingOpen, setIsJobotFloatingOpen] = useState<boolean>(true); // Ventana flotante inteligente de JoBOT
  const [isJobotMinimized, setIsJobotMinimized] = useState<boolean>(false);

  const updateActiveCvProfile = (partial: Partial<CVProfile>) => {
    setCvVersions((prev) =>
      prev.map((v) =>
        v.id === activeCv.id
          ? { ...v, profile: { ...v.profile, ...partial } }
          : v
      )
    );
  };

  // SOBERANÍA LOCAL-FIRST: Cargar bóveda persistente al iniciar o cambiar de sesión
  useEffect(() => {
    const saved = loadVaultLocally(session.uid);
    if (saved && saved.length > 0) {
      const merged = session.isAuthenticated ? applySessionDataToCv(session, saved) : saved;
      setCvVersions(merged);
      setActiveCvId(merged[0].id);
    } else if (session.isAuthenticated) {
      setCvVersions((prev) => applySessionDataToCv(session, prev));
    }
  }, [session.uid, session.isAuthenticated, session.displayName, session.email, session.photoURL]);

  // SINCRONIZACIÓN INMEDIATA: Cada cambio en variantes se sella localmente sin servidores intermediarios
  useEffect(() => {
    if (cvVersions.length > 0 && (hasCustomCv || cvVersions.length > 1)) {
      saveVaultLocally(cvVersions, session.uid);
    }
  }, [cvVersions, session.uid, hasCustomCv]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  // 5. Estado de Empleos
  const [jobs, setJobs] = useState<JobOffer[]>(CURATED_JOBS);
  const [selectedCategory, setSelectedCategory] = useState<JobCategory>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'es' | 'written-en'>('all');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncingApi, setIsSyncingApi] = useState(false);
  const [apiStatusText, setApiStatusText] = useState('Sincronizando...');

  // Cerrar menú de idioma al hacer clic fuera
  useEffect(() => {
    function handleClickOutsideLang(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }
    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutsideLang);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideLang);
    };
  }, [isLangMenuOpen]);

  const getLanguageLabel = (filter: 'all' | 'es' | 'written-en') => {
    switch (filter) {
      case 'es':
        return 'Solo 100% Español';
      case 'written-en':
        return 'Sin Inglés Hablado';
      case 'all':
      default:
        return 'Idioma: Todos';
    }
  };

  // 6. Modales
  const [selectedJobForEmail, setSelectedJobForEmail] = useState<JobOffer | null>(null);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<JobOffer | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showScrollLeadModal, setShowScrollLeadModal] = useState(false);
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

  // 6.1 NAVEGACIÓN RÁPIDA CON FLECHAS FLOTANTES (SUBIR / BAJAR)
  const [showScrollNav, setShowScrollNav] = useState(false);

  useEffect(() => {
    const handleScrollNav = () => {
      // Muestra las flechas flotantes cuando el usuario se desplaza más de 200px
      if (window.scrollY > 200) {
        setShowScrollNav(true);
      } else {
        setShowScrollNav(false);
      }
    };

    window.addEventListener('scroll', handleScrollNav, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollNav);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
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
        setApiStatusText(`${CURATED_JOBS.length + liveOffers.length} vacantes activas`);
      } else {
        setApiStatusText(`${jobs.length} vacantes activas`);
      }
    } catch {
      setApiStatusText(`${jobs.length} vacantes activas`);
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
      navigateTo('studio');
      if (target === 'upload') {
        setTimeout(() => cvFileInputRef.current?.click(), 150);
      }
    }
  };

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    setCvVersions((prev) => applySessionDataToCv(newSession, prev));
    if (pendingActionAfterAuth === 'studio' || pendingActionAfterAuth === 'upload') {
      navigateTo('studio');
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
      navigateTo('studio'); // Directo al Estudio para ver el CV Virtual rellenado

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
      navigateTo('studio');
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
    navigateTo('studio');
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

  // SUGERENCIAS DINÁMICAS DE JoBOT: Personalizadas 100% según el CV del usuario y vacantes en vivo
  const dynamicQuickPrompts = useMemo(() => {
    const prompts: string[] = [];
    const skills = activeCv.profile.skills || [];
    const topSkill = skills[0]?.name?.split('(')[0]?.trim();
    const secondSkill = skills[1]?.name?.split('(')[0]?.trim();

    if (topSkill && secondSkill) {
      prompts.push(`Enfocar en ${topSkill} y ${secondSkill}`);
    } else if (topSkill) {
      prompts.push(`Enfocar en ${topSkill}`);
    } else {
      prompts.push('Enfocar en Habilidades Clave');
    }

    // Vacante con mayor afinidad ATS
    const bestMatch = processedJobs.find((j) => (j.matchScore ?? 0) > 0) || processedJobs[0];
    if (bestMatch) {
      prompts.push(`Adaptar para ${bestMatch.title.slice(0, 24)}`);
    } else {
      prompts.push('Adaptar para Puesto Objetivo');
    }

    // Regla de cumplimiento normativo ATS
    prompts.push(
      activeCv.profile.showPhotoInCV
        ? 'Modo ATS sin foto'
        : 'Restablecer foto profesional'
    );

    return prompts;
  }, [activeCv, processedJobs]);

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
      <header className="app-navbar no-print sticky top-0 z-40 bg-white/95 dark:bg-[#0f1115]/95 backdrop-blur-md border-b border-neutral-200 dark:border-[#20242c] shadow-xs w-full max-w-full">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 w-full">
          {/* FILA PRINCIPAL: LOGO A LA IZQUIERDA Y CONTROLES A LA DERECHA */}
          <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 w-full min-w-0">
            {/* LOGO: Ícono Oficial de Robot y Título en Verde Claro Neón (#4ade80) */}
            <button
              onClick={() => {
                navigateTo('jobs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer group hover:opacity-95 transition-all bg-transparent border-0 p-0 outline-hidden flex-1 min-w-0 pr-1"
              title="Ir al Inicio (Radar de Empleos)"
              aria-label="Ir al Inicio de JobsBOT"
            >
              <JobotIcon className="h-9 sm:h-11 md:h-12 w-auto text-emerald-600 dark:text-[#4ade80] shrink-0 drop-shadow-[0_0_12px_rgba(74,222,128,0.35)] group-hover:scale-105 transition-transform" />
              <div className="flex flex-col justify-center min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
                  <span className="font-montserrat font-black text-sm sm:text-base md:text-lg tracking-[0.8px] sm:tracking-[1.8px] uppercase text-emerald-600 dark:text-[#4ade80] group-hover:text-emerald-500 dark:group-hover:text-[#6ee7b7] transition-colors truncate">
                    {brand.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1 sm:px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-[#181c25] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-[#2b3040] shrink-0">
                    {APP_VERSION}
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 truncate mt-0.5 leading-normal pb-0.5">
                  Tu Agente Personal de Búsqueda de Empleo
                </p>
              </div>
            </button>

            {/* NAVEGACIÓN DESKTOP: "EMPLEOS", "CV", "PERFIL" Y "PUBLICAR" (Páginas Dedicadas) */}
            <nav className="hidden sm:flex items-center gap-1 bg-neutral-100 dark:bg-[#15181f] p-1 rounded-lg border border-neutral-200 dark:border-[#232732] shrink-0">
              <button
                onClick={() => navigateTo('jobs')}
                className={`px-3.5 py-1.5 rounded-md font-montserrat text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <i className="ri-briefcase-4-line text-sm" />
                <span>EMPLEOS</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'jobs' 
                    ? 'bg-black/15 text-white dark:bg-black/20 dark:text-black' 
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-[#4ade80]'
                }`}>
                  {processedJobs.length}
                </span>
              </button>

              <button
                onClick={() => navigateTo('studio')}
                className={`px-3.5 py-1.5 rounded-md font-montserrat text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'studio'
                    ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <i className="ri-file-user-line text-sm" />
                <span>CV</span>
                {session.isAuthenticated && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-500/20">
                    {cvVersions.length} v
                  </span>
                )}
              </button>

              {/* PESTAÑA PERFIL COMPLETO & RED PROFESIONAL */}
              <button
                onClick={() => {
                  if (!session.isAuthenticated) {
                    setShowAuthModal(true);
                  } else {
                    navigateTo('profile');
                  }
                }}
                className={`px-3.5 py-1.5 rounded-md font-montserrat text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Ver perfil completo y red profesional"
              >
                <i className="ri-user-3-line text-sm" />
                <span>PERFIL</span>
              </button>

              {/* PESTAÑA B2B: PUBLICAR OFERTA DESTACADA */}
              <button
                onClick={() => navigateTo('publish')}
                className={`px-3 py-1.5 rounded-md font-montserrat text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs ${
                  activeTab === 'publish'
                    ? 'bg-amber-500 text-black border border-amber-500 shadow-sm'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                }`}
                title="Publicar oferta de empleo para empresas"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                <span>PUBLICAR</span>
              </button>
            </nav>

            {/* CONTROLES: SELECTOR DE TEMA + VISITANTE / LOGIN */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
                    className="px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-[10px] sm:text-xs font-extrabold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                  >
                    <i className="ri-user-shared-line text-xs" />
                    <span className="hidden sm:inline">Iniciar Sesión</span>
                    <span className="sm:hidden">Entrar</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 sm:pl-2 border-l border-neutral-200 dark:border-[#20242c]">
                  <div
                    onClick={() => navigateTo('profile')}
                    title="Ver mi perfil completo y red profesional"
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border cursor-pointer relative group shrink-0 transition-all ${
                      activeTab === 'profile'
                        ? 'border-[#4ade80] ring-2 ring-[#4ade80]/40'
                        : 'border-neutral-300 dark:border-[#4ade80]/50 hover:border-[#4ade80]'
                    }`}
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

          {/* FILA 2 MÓVIL: ACCIONES EXCLUSIVAS POR DEBAJO DEL LOGO (EMPLEOS, CV, PERFIL, PUBLICAR) */}
          <div className="sm:hidden flex items-center gap-1.5 pb-2 pt-1 border-t border-neutral-100 dark:border-[#1a1e27] w-full">
            <button
              onClick={() => navigateTo('jobs')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg font-montserrat text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                  : 'bg-neutral-100 dark:bg-[#15181f] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-[#232732]'
              }`}
            >
              <i className="ri-briefcase-4-line text-xs" />
              <span>Empleos</span>
              <span className={`px-1 py-0.2 rounded-full text-[9px] font-extrabold ${
                activeTab === 'jobs'
                  ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-[#4ade80]'
              }`}>
                {processedJobs.length}
              </span>
            </button>

            <button
              onClick={() => navigateTo('studio')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg font-montserrat text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                  : 'bg-neutral-100 dark:bg-[#15181f] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-[#232732]'
              }`}
            >
              <i className="ri-file-user-line text-xs" />
              <span>CV</span>
              {session.isAuthenticated && (
                <span className="px-1 py-0.2 rounded-full text-[9px] bg-neutral-500/20">
                  {cvVersions.length}v
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (!session.isAuthenticated) {
                  setShowAuthModal(true);
                } else {
                  navigateTo('profile');
                }
              }}
              className={`flex-1 py-1.5 px-1.5 rounded-lg font-montserrat text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                  : 'bg-neutral-100 dark:bg-[#15181f] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-[#232732]'
              }`}
            >
              <i className="ri-user-3-line text-xs" />
              <span>Perfil</span>
            </button>

            <button
              onClick={() => navigateTo('publish')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg font-montserrat text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shadow-xs ${
                activeTab === 'publish'
                  ? 'bg-amber-500 text-black border border-amber-500 shadow-sm'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-500/35'
              }`}
              title="Publicar oferta de empleo"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Publicar</span>
            </button>
          </div>
        </div>
      </header>

      {/* BANNER DE PORTALES CONECTADOS EN TIEMPO REAL */}
      <NetworkTrustBanner totalIndexed={jobs.length} />

      {/* =====================================================================
          CONTENIDO: MODO DARK CARBONE (#121419 / #191c24 CON CONTRASTE ELEVADO)
          ===================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'profile' ? (
          <ProfileView
            session={session}
            activeCv={activeCv}
            cvVersions={cvVersions}
            setCvVersions={setCvVersions}
            setActiveCvId={setActiveCvId}
            onNavigateToStudio={() => {
              navigateTo('studio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToJobs={() => {
              navigateTo('jobs');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onTriggerAvatarUpload={() => avatarInputRef.current?.click()}
            onTriggerCvUpload={() => cvFileInputRef.current?.click()}
            onLogout={handleLogout}
            totalJobsIndexed={jobs.length}
          />
        ) : activeTab === 'publish' ? (
          <PublishJobView
            onBackToJobs={() => {
              navigateTo('jobs');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onJobPublished={(newJob) => {
              setJobs((prev) => [newJob, ...prev]);
              setSelectedJobForDetails(newJob);
              navigateTo('jobs');
            }}
          />
        ) : activeTab === 'jobs' ? (
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

            {/* =====================================================================
                ZONA DE CONTROL NATIVA PERSISTENTE (STICKY HEADER ULTRA-COMPACTO):
                LÍNEA 1: TÍTULO "OFERTAS DE EMPLEO" (MÁS GRANDE, SIN PUNTOS REDUNDANTES) + STATUS | BUSCADOR COMPLETA EL ESPACIO | SELECTOR IDIOMA CUSTOM | BOTÓN ACTUALIZAR
                LÍNEA 2: CARRUSEL HORIZONTAL DE CATEGORÍAS (CON "TODAS" Y SIN CORTES)
                ===================================================================== */}
            <div className="sticky top-[92px] sm:top-16 z-30 bg-[#F3F4F6]/98 dark:bg-[#070709]/98 backdrop-blur-md py-2 space-y-2 border-b border-neutral-300/80 dark:border-[#1a1e29] shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 transition-all">
              {/* LÍNEA 1: TÍTULO "OFERTAS DE EMPLEO" + STATUS DEBAJO | BUSCADOR QUE COMPLETA EL ESPACIO | IDIOMA CUSTOM | ACTUALIZAR (EN LA MISMA LÍNEA) */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 w-full">
                {/* Título más grande "OFERTAS DE EMPLEO" y vacantes activas debajo con indicador de rastreo en vivo minimalista */}
                <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center shrink-0 pr-1">
                  <h3 className="font-montserrat text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-neutral-900 dark:text-white leading-tight">
                    OFERTAS DE EMPLEO
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 font-medium leading-tight tracking-tight mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>{apiStatusText.replace('•', '').replace('En vivo', '').trim() || `${jobs.length} vacantes activas`}</span>
                  </div>
                </div>

                {/* Controles en la misma línea: Buscador que completa todo el espacio restante + Idioma + Actualizar */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Barra de búsqueda que completa todo el espacio restante que deja el título */}
                  <div className="relative flex-1 min-w-0">
                    <i className="ri-search-2-line text-sm text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Buscar puesto, empresa, rubro (ej: QA, Data)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSyncLiveJobs(searchQuery)}
                      className="w-full pl-9 pr-8 py-2 rounded-lg text-xs bg-white dark:bg-[#11141c] border border-neutral-300 dark:border-[#262c3b] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80] transition-colors shadow-2xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          handleSyncLiveJobs('');
                        }}
                        className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-xs cursor-pointer"
                      >
                        <i className="ri-close-circle-fill" />
                      </button>
                    )}
                  </div>

                  {/* Selector de idioma con Menú Desplegable Personalizado del Portal (Cero menús nativos azules, Cero iconos redundantes) */}
                  <div className="relative shrink-0" ref={langMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                      className="inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-montserrat font-bold bg-white dark:bg-[#11141c] border border-neutral-300 dark:border-[#262c3b] text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-[#384257] shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                      title="Filtrar por idioma"
                    >
                      <i className="ri-translate-2 text-xs text-purple-500 dark:text-purple-400" />
                      <span>{getLanguageLabel(languageFilter)}</span>
                      <i className={`ri-arrow-down-s-line text-sm text-neutral-400 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Popover con diseño nativo del portal JobsBOT */}
                    {isLangMenuOpen && (
                      <div className="absolute top-full right-0 mt-1.5 w-56 bg-white dark:bg-[#121622] rounded-xl border border-neutral-200 dark:border-[#283042] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-2.5 py-1 text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-[#1e2433] mb-1">
                          Filtrar por Idioma
                        </div>
                        {[
                          { id: 'all', label: 'Todos los idiomas', hint: 'Cualquier nivel o requisito' },
                          { id: 'es', label: 'Solo 100% Español', hint: 'Sin requisito de inglés' },
                          { id: 'written-en', label: 'Sin Inglés Hablado', hint: 'Inglés escrito o técnico' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setLanguageFilter(opt.id as any);
                              setIsLangMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-montserrat transition-colors cursor-pointer text-left ${
                              languageFilter === opt.id
                                ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/25'
                                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1a202c] font-medium'
                            }`}
                          >
                            <div>
                              <div className="leading-tight">{opt.label}</div>
                              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-normal">{opt.hint}</div>
                            </div>
                            {languageFilter === opt.id && (
                              <i className="ri-check-line text-sm text-purple-600 dark:text-purple-400 shrink-0 ml-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Botón de actualizar en la misma línea */}
                  <button
                    onClick={() => handleSyncLiveJobs()}
                    disabled={isSyncingApi}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-montserrat font-extrabold uppercase tracking-wider border border-neutral-300 dark:border-[#2f3545] bg-white dark:bg-[#181c25] hover:bg-neutral-100 dark:hover:bg-[#202633] text-neutral-800 dark:text-neutral-200 cursor-pointer transition-colors shadow-2xs shrink-0"
                    title="Sincronizar y actualizar vacantes en vivo"
                  >
                    <i className={`ri-refresh-line text-sm ${isSyncingApi ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </button>
                </div>
              </div>

              {/* LÍNEA 2: CARRUSEL HORIZONTAL DE CATEGORÍAS (SIN CORTARSE Y CON "TODAS") */}
              <div className="relative">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 px-1.5 no-scrollbar scroll-smooth">
                  {CATEGORY_ITEMS.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs scale-102 ring-2 ring-emerald-500/30'
                          : 'bg-white dark:bg-[#151922] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-300/80 dark:border-[#252b3a] hover:border-neutral-400'
                      }`}
                    >
                      <i className={`${cat.icon} text-xs`} />
                      <span>{cat.label}</span>
                    </button>
                  ))}
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
                            <Sparkles className="w-3 h-3" />
                            DESTACADA
                          </span>
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <i className="ri-verified-badge-fill text-xs" />
                            Empresa Verificada (Prioridad TOP)
                          </span>
                        </div>
                      )}

                      {/* FILA SUPERIOR: Empresa a la izquierda + Portal y Match ATS a la derecha */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <CompanyLogo
                            logoUrl={job.companyLogo}
                            companyName={job.company}
                            category={job.category}
                            sizeClass="w-8 h-8 sm:w-9 sm:h-9 shrink-0"
                          />
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-montserrat text-xs sm:text-sm font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 truncate">
                              {job.company}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <PortalBadge source={job.source} size="sm" />
                          {hasCustomCv ? (
                            <span className="font-montserrat text-xs sm:text-sm font-black text-emerald-600 dark:text-[#4ade80] px-2 py-0.5 rounded bg-emerald-500/10 dark:bg-[#4ade80]/15 border border-emerald-500/20 dark:border-[#4ade80]/30 whitespace-nowrap">
                              {job.matchScore}% MATCH
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requireAuthAndRun('upload');
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-montserrat font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-[#4ade80] border border-emerald-500/25 dark:border-[#4ade80]/30 hover:bg-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
                              title="Sube tu CV para calcular tu afinidad ATS exacta"
                            >
                              <i className="ri-upload-cloud-2-line text-xs" />
                              <span className="hidden sm:inline">Subir CV</span>
                              <span className="sm:hidden">Match ATS</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* TÍTULO DE LA VACANTE: En Azul Cielo / Sky Blue (ni amarillo, ni verde, ni morado) */}
                      <h4 className="font-montserrat text-sm sm:text-base font-extrabold text-sky-700 dark:text-sky-300 leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-200 transition-colors">
                        {job.title}
                      </h4>

                      {/* SUELDO DESTACADO EN VERDE DINERO (SIN RECUADRO AZUL) + ETIQUETAS CARACTERÍSTICAS */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-2">
                        {/* Sueldo destacado: Verde dinero puro sin recuadro azul con icono fa-sack-dollar */}
                        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-montserrat font-black text-emerald-600 dark:text-[#4ade80] tracking-tight">
                          <i className="fa-solid fa-sack-dollar text-xs sm:text-sm text-emerald-600 dark:text-[#4ade80]" />
                          <span>{formatCompactSalary(job.salary)}</span>
                        </span>

                        {/* Localidad: Color característico Azul Cielo Geográfico (no verde) */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-sky-500/10 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/25 dark:border-sky-500/35 truncate max-w-[170px] sm:max-w-none shadow-2xs">
                          <i className="ri-map-pin-2-line text-xs mr-1 text-sky-500 dark:text-sky-400" />
                          <span>{formatCompactCountry(job.countryScope)}</span>
                        </span>

                        {/* Idioma: Color característico Púrpura de Comunicación/Traducción (no verde) */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-purple-500/10 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25 dark:border-purple-500/35 shadow-2xs">
                          <i className="ri-translate-2 text-xs mr-1 text-purple-500 dark:text-purple-400" />
                          <span>{job.languageReq}</span>
                        </span>
                      </div>

                      {/* RESUMEN DE LA OFERTA: Ancho completo y máxima legibilidad */}
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2.5 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                        {job.oneLineSummary}
                      </p>

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
            <div className="cv-toolbar-controls no-print bg-white dark:bg-[#12151c] p-4 rounded-xl border border-neutral-200 dark:border-[#252a36] shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              {/* VERSIONES DE CV */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-400 mr-1 flex items-center gap-1">
                  <i className="ri-folder-user-line text-xs" /> Versiones:
                </span>
                {cvVersions.map((ver) => (
                  <button
                    key={ver.id}
                    onClick={() => setActiveCvId(ver.id)}
                    className={`px-3 py-1.5 rounded-lg font-montserrat text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
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
                  className="px-2.5 py-1.5 rounded-lg border border-dashed border-neutral-400 dark:border-[#384054] font-montserrat text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-neutral-100 dark:hover:bg-[#1b1f2a] cursor-pointer text-neutral-700 dark:text-neutral-300"
                >
                  <i className="ri-add-line text-sm text-emerald-500 dark:text-[#4ade80]" /> Importar
                </button>
              </div>

              {/* SELECTORES DE FORMATO Y ESCALA PROPORCIONAL */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* SELECTOR DE PLANTILLA DE ALTA TRACCIÓN */}
                <div className="flex items-center bg-neutral-100 dark:bg-[#161a23] p-1 rounded-lg border border-neutral-200 dark:border-[#2a2f3e]">
                  <button
                    onClick={() => setCvTemplate('harvard')}
                    className={`px-2.5 py-1 rounded text-[11px] font-montserrat font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                      cvTemplate === 'harvard'
                        ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                    title="Formato de 1 columna estándar internacional preferido por algoritmos ATS y reclutadores de Fortune 500"
                  >
                    <i className="ri-award-line text-xs" /> Harvard ATS
                  </button>
                  <button
                    onClick={() => setCvTemplate('executive')}
                    className={`px-2.5 py-1 rounded text-[11px] font-montserrat font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                      cvTemplate === 'executive'
                        ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                    title="Diseño moderno de 2 columnas con panel lateral estilizado para perfiles ejecutivos"
                  >
                    <i className="ri-layout-2-line text-xs" /> Ejecutivo
                  </button>
                </div>

                {/* SELECTOR DE ESCALA / PROPORCIÓN WYSIWYG Y ZOOM */}
                <div className="flex items-center bg-neutral-100 dark:bg-[#161a23] p-1 rounded-lg border border-neutral-200 dark:border-[#2a2f3e]">
                  <span className="text-[10px] font-montserrat font-bold text-neutral-400 px-1.5 hidden sm:inline">
                    Zoom:
                  </span>
                  <button
                    onClick={() => setCvScale((prev) => Math.max(0.5, Number((prev - 0.15).toFixed(2))))}
                    className="p-1.5 rounded text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#202534] transition-colors cursor-pointer"
                    title="Alejar (-)"
                  >
                    <i className="ri-zoom-out-line text-xs" />
                  </button>
                  <button
                    onClick={() => setCvScale(1)}
                    className={`px-2.5 py-1 rounded text-[10px] font-montserrat font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      cvScale === 1
                        ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709]'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                    title="100% Proporción exacta física A4 (lo que ves es lo que se imprime)"
                  >
                    100% (Real)
                  </button>
                  <button
                    onClick={() => setCvScale((prev) => Math.min(1.5, Number((prev + 0.15).toFixed(2))))}
                    className="p-1.5 rounded text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#202534] transition-colors cursor-pointer"
                    title="Aumentar (+) para inspeccionar detalles"
                  >
                    <i className="ri-zoom-in-line text-xs" />
                  </button>
                  {cvScale !== 1 && (
                    <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-[#4ade80] px-1">
                      {Math.round(cvScale * 100)}%
                    </span>
                  )}
                </div>

                {/* ACCIONES DEL DOCUMENTO */}
                <button
                  onClick={togglePhotoInActiveCv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-neutral-800 dark:bg-[#1c222e] text-white hover:bg-neutral-700 dark:hover:bg-[#252c3c] border border-transparent dark:border-[#32394c] cursor-pointer"
                >
                  {activeCv.profile.showPhotoInCV ? (
                    <>
                      <i className="ri-eye-off-line text-sm" /> Ocultar Foto
                    </>
                  ) : (
                    <>
                      <i className="ri-eye-line text-sm text-[#4ade80]" /> Mostrar Foto
                    </>
                  )}
                </button>

                <button
                  onClick={() => exportVaultBackupFile(cvVersions, session.email || 'mi-boveda')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-emerald-500/10 dark:bg-[#4ade80]/10 text-emerald-700 dark:text-[#4ade80] hover:bg-emerald-500/20 border border-emerald-500/25 dark:border-[#4ade80]/30 transition-colors cursor-pointer"
                  title="Descargar copia de seguridad soberana en JSON (todas tus variantes de CV)"
                >
                  <i className="ri-shield-check-line text-sm" />
                  <span className="hidden sm:inline">Bóveda JSON</span>
                </button>

                <button
                  onClick={() => openStandaloneBrowserCv(activeCv.profile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider border border-neutral-300 dark:border-[#32394c] bg-transparent dark:bg-[#171a23] hover:bg-neutral-100 dark:hover:bg-[#202532] cursor-pointer"
                >
                  <i className="ri-window-line text-sm" />
                  <span className="hidden sm:inline">Pestaña Limpia</span>
                </button>

                {/* BOTÓN JOBOT FLOTANTE */}
                <button
                  onClick={() => {
                    setIsJobotFloatingOpen(true);
                    setIsJobotMinimized(false);
                    setStudioRightMode('chat');
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                    isJobotFloatingOpen && !isJobotMinimized && studioRightMode === 'chat'
                      ? 'bg-[#4ade80] text-[#070709] border border-[#4ade80]'
                      : 'bg-neutral-100 dark:bg-[#161a23] text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-[#2a2f3e] hover:border-neutral-900 dark:hover:border-[#4ade80]'
                  }`}
                  title="Abrir o enfocar JoBOT"
                >
                  <JobotIcon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isJobotFloatingOpen && !isJobotMinimized && studioRightMode === 'chat'
                        ? 'text-[#070709]'
                        : 'text-emerald-500 dark:text-[#4ade80]'
                    }`}
                  />
                  <span>JOBOT</span>
                </button>

                {/* BOTÓN EDITAR DIRECTO */}
                <button
                  onClick={() => {
                    setIsJobotFloatingOpen(true);
                    setIsJobotMinimized(false);
                    setStudioRightMode('editor');
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                    isJobotFloatingOpen && !isJobotMinimized && studioRightMode === 'editor'
                      ? 'bg-[#4ade80] text-[#070709] border border-[#4ade80]'
                      : 'bg-neutral-100 dark:bg-[#161a23] text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-[#2a2f3e] hover:border-neutral-900 dark:hover:border-[#4ade80]'
                  }`}
                  title="Modificar directamente campos del CV"
                >
                  <i className="ri-edit-line text-xs" />
                  <span>EDITAR</span>
                </button>

                {/* BOTÓN IMPRIMIR PDF: AISLAMIENTO PURO A4 */}
                <button
                  onClick={() => {
                    if (cvScale !== 1) setCvScale(1);
                    setTimeout(() => window.print(), 120);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-montserrat font-extrabold uppercase tracking-wider bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] hover:opacity-90 cursor-pointer shadow-sm"
                  title="Imprimir o exportar en PDF la hoja de tu CV limpia"
                >
                  <i className="ri-printer-line text-sm" />
                  <span>Imprimir PDF</span>
                </button>
              </div>
            </div>

            {/* ===================================================================
                LIENZO CENTRAL HERO: HOJA A4 AL 100% DE PROPORCIÓN REAL (SIN CORTES)
                =================================================================== */}
            <div className="w-full flex flex-col items-center justify-start bg-neutral-100/60 dark:bg-[#0c0e14] p-3 sm:p-8 rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-inner min-h-[900px] overflow-x-auto overflow-y-visible">
              <CvA4Canvas
                profile={activeCv.profile}
                onAvatarClick={() => avatarInputRef.current?.click()}
                template={cvTemplate}
                scale={cvScale}
              />
            </div>

            {/* ===================================================================
                VENTANA FLOTANTE INTELIGENTE: ASISTENTE JOBOT / EDITOR DIRECTO
                =================================================================== */}
            {isJobotFloatingOpen && !isJobotMinimized && (
              <aside className="no-print fixed bottom-6 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[580px] max-h-[82vh] bg-white dark:bg-[#12151c] rounded-2xl border border-neutral-200 dark:border-[#293040] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
                {/* CABECERA DE LA VENTANA FLOTANTE */}
                <div className="p-2.5 bg-[#111111] dark:bg-[#161a23] text-white border-b border-neutral-800 dark:border-[#242936] flex items-center justify-between gap-2 select-none">
                  {/* SELECTOR DE PESTAÑAS DENTRO DEL ASISTENTE FLOTANTE: JOBOT / EDITAR */}
                  <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg flex-1">
                    <button
                      onClick={() => setStudioRightMode('chat')}
                      className={`flex-1 py-1.5 px-3 rounded-md font-montserrat text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        studioRightMode === 'chat'
                          ? 'bg-[#4ade80] text-[#070709] shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <JobotIcon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          studioRightMode === 'chat' ? 'text-[#070709]' : 'text-[#4ade80]'
                        }`}
                      />
                      <span>JOBOT</span>
                    </button>
                    <button
                      onClick={() => setStudioRightMode('editor')}
                      className={`flex-1 py-1.5 px-3 rounded-md font-montserrat text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        studioRightMode === 'editor'
                          ? 'bg-[#4ade80] text-[#070709] shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <i className="ri-edit-line text-xs shrink-0" />
                      <span>EDITAR</span>
                    </button>
                  </div>

                  {/* CONTROLES DE VENTANA FLOTANTE: MINIMIZAR Y CERRAR */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setIsJobotMinimized(true)}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 dark:hover:bg-[#202636] transition-colors cursor-pointer"
                      title="Minimizar ventana a botón flotante"
                    >
                      <i className="ri-subtract-line text-sm" />
                    </button>
                    <button
                      onClick={() => setIsJobotFloatingOpen(false)}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 dark:hover:bg-[#202636] transition-colors cursor-pointer"
                      title="Cerrar ventana flotante"
                    >
                      <i className="ri-close-line text-sm" />
                    </button>
                  </div>
                </div>

                {/* CUERPO DEL ASISTENTE FLOTANTE: MODO EDITOR DIRECTO O CHAT */}
                {studioRightMode === 'editor' ? (
                  <div className="flex-1 overflow-hidden">
                    <CvQuickEditorPanel
                      profile={activeCv.profile}
                      onUpdateProfile={updateActiveCvProfile}
                    />
                  </div>
                ) : (
                  /* VISTA DE CHAT CON ASISTENTE JOBOT */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-2.5 bg-neutral-50 dark:bg-[#151821] border-b border-neutral-200 dark:border-[#242936] flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto">
                      <span className="w-full text-[9px] font-montserrat font-bold uppercase tracking-wider text-emerald-600 dark:text-[#4ade80] mb-0.5 flex items-center gap-1">
                        <i className="ri-sparkling-fill text-xs" /> Sugerencias JoBOT según tu CV:
                      </span>
                      {dynamicQuickPrompts.map((quick, idx) => (
                        <button
                          key={idx}
                          onClick={() => setChatInput(quick)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-[#1c212c] border border-neutral-200 dark:border-[#2d3444] text-neutral-800 dark:text-neutral-200 hover:border-neutral-900 dark:hover:border-[#4ade80] transition-colors cursor-pointer"
                        >
                          + {quick}
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            msg.sender === 'user' ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div className="flex items-start gap-2 max-w-[95%]">
                            {msg.sender === 'bot' && (
                              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-emerald-500/10 dark:bg-[#4ade80]/15 border border-emerald-500/30 flex items-center justify-center p-1 shadow-xs mt-0.5">
                                <img
                                  src="/favicon.svg"
                                  alt="JoBOT"
                                  className="w-full h-full object-contain"
                                />
                              </div>
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
                      className="p-2.5 border-t border-neutral-200 dark:border-[#242936] bg-neutral-50 dark:bg-[#151821] flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Pídele a JoBOT que afine un texto o añada logros..."
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
                  </div>
                )}
              </aside>
            )}

            {/* BOTÓN FLOTANTE MINIMALISTA (FAB) CUANDO JOBOT ESTÁ MINIMIZADO O CERRADO */}
            {(!isJobotFloatingOpen || isJobotMinimized) && (
              <button
                onClick={() => {
                  setIsJobotFloatingOpen(true);
                  setIsJobotMinimized(false);
                }}
                className="no-print fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#111111] dark:bg-[#4ade80] text-white dark:text-[#070709] shadow-2xl hover:scale-105 active:scale-95 transition-all border border-neutral-700 dark:border-[#4ade80] font-montserrat font-extrabold text-xs uppercase tracking-wider cursor-pointer"
                title="Abrir JoBOT"
              >
                <JobotIcon className="w-5 h-5 shrink-0 text-emerald-400 dark:text-[#070709]" />
                <span>JOBOT</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-[#070709] animate-pulse" />
              </button>
            )}
          </div>
        )}
      </main>

      {/* =====================================================================
          FOOTER MINIMALISTA CON INDICADOR EN VIVO E ICONOS DE TIENDAS
          ===================================================================== */}
      <footer className="app-footer no-print mt-12 border-t border-neutral-200 dark:border-[#20242c] bg-white dark:bg-[#0c0d11] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 text-xs text-neutral-500 dark:text-neutral-400">
          {/* BLOQUE IZQUIERDO: EXCLUSIVAMENTE LOGO MYJOBSBOT */}
          <div className="flex items-center">
            <button
              onClick={() => {
                navigateTo('jobs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer group hover:opacity-90 transition-all bg-transparent border-0 p-0 outline-hidden"
              title="Ir al Inicio (Radar de Empleos)"
            >
              <JobotIcon className="h-8 sm:h-9 w-auto text-emerald-600 dark:text-[#4ade80] group-hover:scale-105 transition-transform shrink-0 drop-shadow-[0_0_8px_rgba(74,222,128,0.25)]" />
              <div className="flex flex-col justify-center leading-none -space-y-0.5 sm:-space-y-0.5">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-montserrat font-black text-sm sm:text-base text-emerald-600 dark:text-[#4ade80] uppercase tracking-[1px] leading-tight group-hover:text-emerald-500 dark:group-hover:text-[#6ee7b7] transition-colors">
                    MY
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-[#181c25] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-[#2b3040] shrink-0">
                    {APP_VERSION}
                  </span>
                </div>
                <span className="font-montserrat font-black text-sm sm:text-base text-emerald-600 dark:text-[#4ade80] uppercase tracking-[1px] leading-tight group-hover:text-emerald-500 dark:group-hover:text-[#6ee7b7] transition-colors">
                  JOBSBOT
                </span>
              </div>
            </button>
          </div>

          {/* BLOQUE DERECHO: INDICADOR EN VIVO TUMBADO A LA DERECHA JUNTO A LOS DEMÁS ANEXOS */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Indicador Discreto de Estado En Vivo */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100/70 dark:bg-[#13161f] border border-neutral-200/80 dark:border-[#222734]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{apiStatusText}</span>
            </div>
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

      {/* BOTONES FLOTANTES DE NAVEGACIÓN RÁPIDA (SUBIR / BAJAR) */}
      <div
        className={`fixed bottom-6 right-4 sm:bottom-8 sm:right-7 z-40 flex flex-col gap-1.5 transition-all duration-300 ${
          showScrollNav ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <button
          onClick={scrollToTop}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 dark:bg-[#151922]/95 backdrop-blur-md border border-neutral-300 dark:border-[#2a3040] shadow-lg flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-[#111111] hover:text-white dark:hover:bg-[#4ade80] dark:hover:text-[#070709] transition-all cursor-pointer group"
          title="Subir al inicio (Búsqueda y Filtros)"
          aria-label="Subir al inicio"
        >
          <i className="ri-arrow-up-line text-sm sm:text-base group-hover:-translate-y-0.5 transition-transform" />
        </button>
        <button
          onClick={scrollToBottom}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 dark:bg-[#151922]/95 backdrop-blur-md border border-neutral-300 dark:border-[#2a3040] shadow-lg flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-[#111111] hover:text-white dark:hover:bg-[#4ade80] dark:hover:text-[#070709] transition-all cursor-pointer group"
          title="Bajar al final"
          aria-label="Bajar al final"
        >
          <i className="ri-arrow-down-line text-sm sm:text-base group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

      {selectedJobForEmail && (
        <EmailModal
          job={selectedJobForEmail}
          activeCv={activeCv}
          onClose={() => setSelectedJobForEmail(null)}
          onPrintCv={() => {
            setSelectedJobForEmail(null);
            navigateTo('studio');
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

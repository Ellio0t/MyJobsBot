import React, { useState } from 'react';
import {
  User,
  Briefcase,
  FileText,
  Mail,
  MapPin,
  Globe,
  Phone,
  DollarSign,
  Plus,
  Trash2,
  Copy,
  Download,
  Edit3,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Share2,
  ThumbsUp,
  MessageSquare,
  Flame,
  ArrowRight,
  Camera,
  LogOut,
  ExternalLink,
  Code2
} from 'lucide-react';
import { CVVersion, UserSession } from '../types';
import { JobotIcon } from './JobotIcon';
import { SovereigntyVaultPanel } from './SovereigntyVaultPanel';

interface ProfileViewProps {
  session: UserSession;
  activeCv: CVVersion;
  cvVersions: CVVersion[];
  setCvVersions: React.Dispatch<React.SetStateAction<CVVersion[]>>;
  setActiveCvId: (id: string) => void;
  onNavigateToStudio: () => void;
  onNavigateToJobs: () => void;
  onTriggerAvatarUpload: () => void;
  onTriggerCvUpload: () => void;
  onLogout: () => void;
  totalJobsIndexed: number;
}

type ProfileTab = 'identity' | 'vault' | 'network' | 'metrics' | 'sovereignty';

interface CommunityPost {
  id: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  timeAgo: string;
  type: 'project' | 'job_share' | 'cv_win';
  title: string;
  content: string;
  projectUrl?: string;
  salaryNote?: string;
  likes: number;
  commentsCount: number;
  hasLiked?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  session,
  activeCv,
  cvVersions,
  setCvVersions,
  setActiveCvId,
  onNavigateToStudio,
  onNavigateToJobs,
  onTriggerAvatarUpload,
  onTriggerCvUpload,
  onLogout,
  totalJobsIndexed
}) => {
  const [currentTab, setCurrentTab] = useState<ProfileTab>('identity');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Estado local para los datos editables del perfil profesional
  const [formData, setFormData] = useState({
    fullName: activeCv.profile.fullName || session.displayName || 'Profesional de Tecnología',
    headline: activeCv.profile.headline || 'Analista QA Web & Ingeniero de Software',
    email: activeCv.profile.email || session.email || 'usuario@jobsbot.pro',
    phone: activeCv.profile.phone || '+54 9 11 5555-4321',
    location: activeCv.profile.location || 'Santiago, Chile (Disponible Remoto)',
    availability: activeCv.profile.availability || 'Búsqueda Activa (Inmediata)',
    salaryExpectation: '1,800 - 2,800 USD / mes',
    summary: activeCv.profile.summary || 'Especialista en pruebas automatizadas y control de calidad con experiencia en entornos ágiles y proyectos distribuidos en LATAM y EE.UU.',
    linkedin: activeCv.profile.linkedin || 'https://linkedin.com/in/perfil-profesional',
    github: 'https://github.com/developer-latam',
    portfolio: 'https://portfolio.dev',
    showPhotoInCV: activeCv.profile.showPhotoInCV,
  });

  // Feed de la Red Profesional sin Burocracia (Muro de Valor Anti-LinkedIn)
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 'post-1',
      author: 'Carolina Méndez',
      authorRole: 'Tech Recruiter en FinTech Remota',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      timeAgo: 'Hace 45 min',
      type: 'job_share',
      title: 'Contratando QA Automation Senior (Playwright + TypeScript)',
      content: '¡Cero procesos de 6 semanas! Solo 2 entrevistas técnicas reales. Sueldo público en USD garantizado y contrato contractor internacional sin bloqueo de país.',
      salaryNote: '$2,800 - $3,500 USD / mes',
      projectUrl: 'https://myjobsbot.web.app',
      likes: 24,
      commentsCount: 9,
    },
    {
      id: 'post-2',
      author: 'Diego Navarro',
      authorRole: 'Fullstack Dev & Open Source Contributor',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      timeAgo: 'Hace 2 horas',
      type: 'project',
      title: 'Lance mi herramienta de testing de APIs con soporte para IA',
      content: 'Cansado de la burocracia de los grandes software suites, programé esta utilidad ligera en Go y React. El código es 100% abierto en GitHub para quien quiera revisarlo o contribuir.',
      projectUrl: 'https://github.com',
      likes: 42,
      commentsCount: 14,
    },
    {
      id: 'post-3',
      author: 'Mateo Rivas',
      authorRole: 'Data Analyst & Python Dev',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      timeAgo: 'Ayer',
      type: 'cv_win',
      title: 'Conseguí oferta formal adaptando mi CV con JoBOT ATS',
      content: 'Postulaba a 30 ofertas en LinkedIn y solo recibía correos automáticos de rechazo. Estandaricé mi CV quitando la foto y ajustando las palabras clave para pasar el filtro ATS. Hoy firmé mi contrato.',
      likes: 89,
      commentsCount: 22,
    },
  ]);

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');

  const handleSaveProfile = () => {
    // Sincroniza los cambios con la versión de CV activa y el ecosistema
    setCvVersions((prev) =>
      prev.map((v) =>
        v.id === activeCv.id
          ? {
              ...v,
              profile: {
                ...v.profile,
                fullName: formData.fullName,
                headline: formData.headline,
                email: formData.email,
                phone: formData.phone,
                location: formData.location,
                availability: formData.availability,
                summary: formData.summary,
                linkedin: formData.linkedin,
                showPhotoInCV: formData.showPhotoInCV,
              },
            }
          : v
      )
    );

    setSaveSuccessMessage('¡Perfil y datos curriculares actualizados con éxito!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleDuplicateCv = (versionToDuplicate: CVVersion) => {
    const newVersion: CVVersion = {
      ...versionToDuplicate,
      id: `cv-${Date.now()}`,
      label: `${versionToDuplicate.label} (Copia)`,
      createdAt: new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setCvVersions((prev) => [...prev, newVersion]);
    setActiveCvId(newVersion.id);
    setSaveSuccessMessage(`Se ha duplicado la versión: "${newVersion.label}"`);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleDeleteCv = (id: string, label: string) => {
    if (cvVersions.length <= 1) {
      alert('Debes mantener al menos una versión de CV en tu bóveda.');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar la versión "${label}"?`)) {
      setCvVersions((prev) => prev.filter((v) => v.id !== id));
      if (activeCv.id === id) {
        const remaining = cvVersions.filter((v) => v.id !== id);
        setActiveCvId(remaining[0].id);
      }
    }
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
              hasLiked: !p.hasLiked,
            }
          : p
      )
    );
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !newPostTitle.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: formData.fullName,
      authorRole: formData.headline,
      authorAvatar: activeCv.profile.avatarUrl || session.photoURL || 'https://ui-avatars.com/api/?name=User&background=111&color=4ade80',
      timeAgo: 'Justo ahora',
      type: 'project',
      title: newPostTitle,
      content: newPostContent,
      likes: 1,
      hasLiked: true,
      commentsCount: 0,
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
  };

  return (
    <div className="profile-page-view space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* =====================================================================
          HEADER DEL PERFIL: TARJETA PRINCIPAL DE IDENTIDAD & REPUTACIÓN
          ===================================================================== */}
      <section className="bg-white dark:bg-[#12151c] rounded-2xl border border-neutral-200 dark:border-[#252a36] p-5 sm:p-7 shadow-sm relative overflow-hidden">
        {/* Banner de fondo decorativo */}
        <div className="absolute top-0 left-0 right-0 h-24 sm:h-28 bg-gradient-to-r from-emerald-600/20 via-sky-600/15 to-transparent dark:from-[#4ade80]/15 dark:via-sky-500/10 dark:to-transparent" />

        <div className="relative pt-6 sm:pt-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-5">
            {/* Avatar interactivo con botón de edición */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-[#12151c] shadow-lg bg-neutral-900">
                <img
                  src={
                    activeCv.profile.avatarUrl ||
                    session.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
                  }
                  alt={formData.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={onTriggerAvatarUpload}
                title="Cambiar foto de perfil"
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-[#111111] dark:bg-[#4ade80] text-white dark:text-[#070709] hover:scale-110 transition-transform shadow-md cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Datos Principales */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-montserrat text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                  {formData.fullName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-montserrat font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-[#4ade80] border border-emerald-500/25">
                  <ShieldCheck className="w-3 h-3" />
                  Verificado
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 dark:bg-[#1a1f2b] text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-[#282f40]">
                  {session.authProvider === 'google' ? 'Google Account' : 'Miembro Pro'}
                </span>
              </div>

              <p className="font-montserrat text-xs sm:text-sm font-bold text-sky-700 dark:text-sky-300">
                {formData.headline}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  {formData.location}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  {formData.email}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de Acción de Cabecera */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={onNavigateToStudio}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] hover:opacity-90 transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar en Studio</span>
            </button>

            <button
              onClick={onNavigateToJobs}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 dark:bg-[#191d27] dark:hover:bg-[#222735] text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-[#2f3647] transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4ade80]" />
              <span>Ver Empleos</span>
            </button>

            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="p-2 rounded-xl border border-neutral-300 dark:border-[#2f3647] hover:border-red-500 text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notificación de Guardado */}
        {saveSuccessMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-[#4ade80] border border-emerald-500/25 flex items-center gap-2 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </section>

      {/* =====================================================================
          PESTAÑAS DE NAVEGACIÓN DEL PERFIL
          ===================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-neutral-200 dark:border-[#222736]">
        <button
          onClick={() => setCurrentTab('identity')}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-montserrat text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
            currentTab === 'identity'
              ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Datos de Perfil & Pitch</span>
        </button>

        <button
          onClick={() => setCurrentTab('vault')}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-montserrat text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
            currentTab === 'vault'
              ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Bóveda de CVs ({cvVersions.length})</span>
        </button>

        <button
          onClick={() => setCurrentTab('network')}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-montserrat text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
            currentTab === 'network'
              ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Red Anti-LinkedIn (Sin Humo)</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-bold">
            PROTOTIPO
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('metrics')}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-montserrat text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
            currentTab === 'metrics'
              ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Métricas de Empleabilidad</span>
        </button>

        <button
          onClick={() => setCurrentTab('sovereignty')}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-montserrat text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
            currentTab === 'sovereignty'
              ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-[#4ade80]" />
          <span>Soberanía & Portabilidad</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-[#4ade80] text-[9px] font-bold">
            100% TUYO
          </span>
        </button>
      </div>

      {/* =====================================================================
          CONTENIDO 1: DATOS DE PERFIL Y PITCH PROFESIONAL
          ===================================================================== */}
      {currentTab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Formulario Principal */}
          <div className="lg:col-span-2 space-y-5 bg-white dark:bg-[#12151c] p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#222736]">
              <h3 className="font-montserrat text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 dark:text-[#4ade80]" />
                Información de Contacto y Posicionamiento
              </h3>
              <span className="text-[11px] text-neutral-400">Sincronizado con IA</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Titular Profesional (Headline)
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Ej: QA Engineer & Tester | Data Entry Specialist"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Correo Electrónico de Postulación
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                  WhatsApp / Teléfono
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Ubicación & Disponibilidad
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Pretensión Salarial Mensual (USD)
                </label>
                <input
                  type="text"
                  value={formData.salaryExpectation}
                  onChange={(e) => setFormData({ ...formData, salaryExpectation: e.target.value })}
                  placeholder="Ej: 1,800 - 2,500 USD"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                Resumen Ejecutivo / Pitch del Candidato
              </label>
              <textarea
                rows={4}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80] leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2.5 rounded-xl bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-sm"
              >
                Guardar Cambios en Perfil
              </button>
            </div>
          </div>

          {/* Columna Derecha: Enlaces Sociales y Filtro ATS */}
          <div className="space-y-5">
            {/* Presencia Digital / Redes */}
            <div className="bg-white dark:bg-[#12151c] p-5 rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-4">
              <h4 className="font-montserrat text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-500" />
                Huella Profesional Verificada
              </h4>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mb-1">
                    <i className="ri-linkedin-fill text-sky-600 text-xs" /> LinkedIn
                  </span>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mb-1">
                    <i className="ri-github-fill text-neutral-700 dark:text-neutral-300 text-xs" /> GitHub / Repositorios
                  </span>
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mb-1">
                    <Globe className="w-3 h-3 text-emerald-500" /> Portafolio Web / Demo
                  </span>
                  <input
                    type="text"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
            </div>

            {/* Ajuste de Cumplimiento ATS */}
            <div className="bg-white dark:bg-[#12151c] p-5 rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-3">
              <h4 className="font-montserrat text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Regla de Cumplimiento ATS
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Empresas en EE.UU., Canadá y Europa descartan automáticamente currículums con fotografía para evitar sesgos discriminatorios.
              </p>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#181c25] border border-neutral-200 dark:border-[#2b3345] cursor-pointer">
                <input
                  type="checkbox"
                  checked={!formData.showPhotoInCV}
                  onChange={(e) => setFormData({ ...formData, showPhotoInCV: !e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-neutral-900 dark:text-white block">
                    Modo ATS Ciego (Sin Foto)
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    Recomendado para maximizar tasa de entrevistas internacionales.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          CONTENIDO 2: BÓVEDA MULTIVERSIÓN DE CVS (CV VAULT)
          ===================================================================== */}
      {currentTab === 'vault' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#12151c] p-4 rounded-2xl border border-neutral-200 dark:border-[#252a36]">
            <div>
              <h3 className="font-montserrat text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
                Bóveda de Currículums ({cvVersions.length} disponibles)
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Gestiona tus variantes especializadas para postular a cada industria con palabras clave óptimas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onTriggerCvUpload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1b202c] dark:hover:bg-[#252c3c] text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-[#2d3648] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                <span>Importar CV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cvVersions.map((version) => {
              const isActive = activeCv.id === version.id;
              const skillsCount = version.profile.skills?.length || 0;
              const expCount = version.profile.experiences?.length || 0;

              return (
                <div
                  key={version.id}
                  className={`rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                    isActive
                      ? 'bg-gradient-to-br from-emerald-500/5 via-white to-sky-500/5 dark:from-[#4ade80]/10 dark:via-[#131722] dark:to-sky-950/20 border-emerald-500 dark:border-[#4ade80] shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-white dark:bg-[#12151c] border-neutral-200 dark:border-[#252a36] hover:border-neutral-300 dark:hover:border-[#343c4f]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="font-montserrat text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white truncate">
                        {version.label}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-montserrat font-black uppercase tracking-wider bg-emerald-500 text-black">
                          ACTIVO
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-sky-700 dark:text-sky-300 truncate">
                      {version.targetRole || 'Puesto General'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 mt-2.5">
                      <span>{skillsCount} Habilidades</span>
                      <span>•</span>
                      <span>{expCount} Experiencias</span>
                    </div>

                    {/* Preview de Habilidades Clave */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(version.profile.skills || []).slice(0, 3).map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-[#1a202c] text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-[#262e40]"
                        >
                          {s.name.split('(')[0].trim()}
                        </span>
                      ))}
                      {(version.profile.skills?.length || 0) > 3 && (
                        <span className="text-[10px] text-neutral-400 self-center">
                          +{version.profile.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-[#202636] flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setActiveCvId(version.id);
                        onNavigateToStudio();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicateCv(version)}
                        title="Duplicar para otra vacante"
                        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1d222f] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteCv(version.id, version.label)}
                        title="Eliminar versión"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          CONTENIDO 3: RED PROFESIONAL SIN BUROCRACIA (ANTI-LINKEDIN)
          ===================================================================== */}
      {currentTab === 'network' && (
        <div className="space-y-6">
          {/* Manifiesto Anti-Burocracia */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-montserrat font-black uppercase tracking-wider bg-amber-500 text-black">
                Manifiesto JobsBOT
              </span>
              <h3 className="font-montserrat text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white">
                Una Red de Profesionales Reales: Sin Burocracia, Sin Algoritmos Tóxicos
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
                En LinkedIn el 40% son ofertas fantasma y publicaciones de autoayuda fingida. Aquí solo compartimos{' '}
                <strong className="text-neutral-900 dark:text-white">código real, proyectos comprobables en GitHub, vacantes con sueldo público obligatorio y contacto directo sin pagar $40 USD de InMail</strong>.
              </p>
            </div>
          </div>

          {/* Formulario Rápido de Publicación */}
          <form
            onSubmit={handlePublishPost}
            className="bg-white dark:bg-[#12151c] p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-montserrat font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <Code2 className="w-4 h-4 text-emerald-500" />
              <span>Comparte un Proyecto, Repositorio o Vacante con Sueldo</span>
            </div>

            <input
              type="text"
              placeholder="Título del Proyecto o Vacante (ej: Lance mi API de Pagos en Go)"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
            />

            <textarea
              rows={2}
              placeholder="Describe los desafíos técnicos superados o las condiciones de contratación..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
            />

            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-neutral-400">
                Regla: Sueldos obligatorios y proyectos verificados.
              </span>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                Publicar en la Red
              </button>
            </div>
          </form>

          {/* Listado de Publicaciones */}
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-[#12151c] p-5 rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-[#2b3345]"
                    />
                    <div>
                      <h4 className="font-montserrat text-xs sm:text-sm font-extrabold text-neutral-900 dark:text-white">
                        {post.author}
                      </h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {post.authorRole} • {post.timeAgo}
                      </p>
                    </div>
                  </div>

                  {post.salaryNote && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-montserrat font-black bg-emerald-500/10 text-emerald-700 dark:text-[#4ade80] border border-emerald-500/25">
                      {post.salaryNote}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-montserrat text-sm sm:text-base font-extrabold text-sky-700 dark:text-sky-300">
                    {post.title}
                  </h5>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {post.projectUrl && (
                  <div className="pt-1">
                    <a
                      href={post.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-[#4ade80] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver Repositorio / Proyecto en Vivo</span>
                    </a>
                  </div>
                )}

                {/* Footer de Interacción */}
                <div className="pt-2 border-t border-neutral-100 dark:border-[#202636] flex items-center justify-between text-xs text-neutral-500">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-montserrat font-bold text-xs transition-colors cursor-pointer ${
                      post.hasLiked
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-[#4ade80]'
                        : 'hover:bg-neutral-100 dark:hover:bg-[#1a1f2b]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.likes}</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.commentsCount} comentarios</span>
                    </span>
                    <button className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          CONTENIDO 4: MÉTRICAS DE EMPLEABILIDAD
          ===================================================================== */}
      {currentTab === 'metrics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#12151c] p-5 rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-1">
            <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-400">
              Vacantes Indexadas en Vivo
            </span>
            <div className="text-2xl font-montserrat font-black text-emerald-600 dark:text-[#4ade80]">
              {totalJobsIndexed}
            </div>
            <p className="text-[11px] text-neutral-500">12 portales conectados sin intermediarios</p>
          </div>

          <div className="bg-white dark:bg-[#12151c] p-5 rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-1">
            <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-400">
              Versiones de CV en Bóveda
            </span>
            <div className="text-2xl font-montserrat font-black text-sky-600 dark:text-sky-300">
              {cvVersions.length}
            </div>
            <p className="text-[11px] text-neutral-500">Optimizadas para filtros ATS</p>
          </div>

          <div className="bg-white dark:bg-[#12151c] p-5 rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-1">
            <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-400">
              Afinidad Promedio ATS
            </span>
            <div className="text-2xl font-montserrat font-black text-amber-500">
              92%
            </div>
            <p className="text-[11px] text-neutral-500">Tasa de aprobación algorítmica</p>
          </div>

          <div className="bg-white dark:bg-[#12151c] p-5 rounded-2xl border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-1">
            <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-400">
              Ahorro vs LinkedIn Premium
            </span>
            <div className="text-2xl font-montserrat font-black text-emerald-500">
              $479 USD/año
            </div>
            <p className="text-[11px] text-neutral-500">Protocolos abiertos sin muro de pago</p>
          </div>
        </div>
      )}

      {/* =====================================================================
          CONTENIDO 5: BÓVEDA DE SOBERANÍA Y PORTABILIDAD (100% CONTROL USUARIO)
          ===================================================================== */}
      {currentTab === 'sovereignty' && (
        <SovereigntyVaultPanel
          cvVersions={cvVersions}
          activeCv={activeCv}
          userId={session.uid}
          userEmail={session.email}
          onRestoreVersions={(restored) => {
            setCvVersions(restored);
            if (restored.length > 0) setActiveCvId(restored[0].id);
            setSaveSuccessMessage(`Bóveda restaurada: ${restored.length} variantes disponibles.`);
            setTimeout(() => setSaveSuccessMessage(null), 3000);
          }}
          onPurgeComplete={() => {
            onLogout();
            onNavigateToJobs();
          }}
        />
      )}
    </div>
  );
};

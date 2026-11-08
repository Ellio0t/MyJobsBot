import { BrandConfig, CVVersion, JobOffer } from '../types';

export const BRAND_OPTIONS: BrandConfig[] = [
  {
    id: 'myjobsbot',
    name: 'MYJOBSBOT',
    tagline: 'Tu Agente Personal de Búsqueda de Empleo',
    badge: 'OFFICIAL BRAND',
    domain: 'myjobsbot.com',
  },
];

/**
 * Plantilla genérica para visitantes o usuarios que aún no tienen CV.
 * NUNCA contiene los datos personales, historial ni enlaces del propietario.
 */
export const VISITOR_SAMPLE_CV: CVVersion = {
  id: 'cv-sample-visitor',
  label: 'Plantilla Base ATS (Ejemplo)',
  targetRole: 'Tu Especialidad Profesional',
  createdAt: 'Plantilla de Ejemplo',
  isDefault: true,
  profile: {
    fullName: 'TU NOMBRE Y APELLIDO',
    headline: 'Tu Titular Profesional | Especialidad Principal • Áreas de Dominio Clave',
    avatarUrl: '',
    showPhotoInCV: false,
    availability: 'Inmediata (100% Remoto / Híbrido / Presencial)',
    phone: '+XX XXX XXXXXXX',
    email: 'tu.correo@ejemplo.com',
    linkedin: 'linkedin.com/in/tu-perfil',
    location: 'Tu Ciudad, Tu País (Disponible Remoto)',
    summary:
      'Resumen profesional de alto impacto diseñado para superar filtros robóticos (ATS). Aquí se describe tu trayectoria, fortalezas clave, herramientas dominadas y el valor medible que aportas a las organizaciones.',
    skills: [
      { name: 'Habilidad Principal / Especialidad', level: 95 },
      { name: 'Herramientas de Productividad & Gestión', level: 90 },
      { name: 'Resolución de Problemas & Comunicación', level: 92 },
      { name: 'Atención al Detalle & Procesos', level: 94 },
      { name: 'Gestión Documental & Análisis', level: 88 },
    ],
    languages: [
      { name: 'Español', level: 'Nativo / Avanzado' },
      { name: 'Inglés', level: 'Profesional / Técnico' },
    ],
    experiences: [
      {
        id: 'exp-sample-1',
        role: 'Tu Último Cargo o Especialidad Profesional',
        company: 'Empresa o Proyecto Destacado',
        location: 'Remoto / Presencial',
        period: '2022 – Presente',
        bullets: [
          'Logro medible 1: Descripción de responsabilidades clave usando palabras de acción y resultados cuantitativos.',
          'Logro medible 2: Optimización de procesos, reducción de tiempos o mejora de calidad en entregas.',
          'Logro medible 3: Colaboración interdisciplinaria y cumplimiento riguroso de normativas y procedimientos.',
        ],
      },
      {
        id: 'exp-sample-2',
        role: 'Cargo Anterior / Experiencia Previa',
        company: 'Organización o Negocio Previo',
        location: 'Ubicación',
        period: '2020 – 2022',
        bullets: [
          'Ejecución y seguimiento de operaciones diarias con altos estándares de precisión.',
          'Manejo de bases de datos, documentación y atención a requerimientos prioritarios.',
        ],
      },
    ],
    education: [
      {
        degree: 'Título Universitario, Técnico o Especialización',
        institution: 'Universidad o Instituto de Formación',
        year: 'Año de Graduación',
        details: 'Mención de honor, proyectos finales o certificaciones complementarias.',
      },
    ],
    atsKeywords: [
      'Palabra Clave 1',
      'Palabra Clave 2',
      'Gestión',
      'Optimización',
      'Productividad',
      'ATS',
      'Calidad',
    ],
  },
};

/**
 * Ofertas de empleo curadas y verificadas de respaldo
 */
export const CURATED_JOBS: JobOffer[] = [
  {
    id: 'analista-de-aseguramiento-de-calidad-de-software-usercode-spa-remote-eb1a',
    title: 'Analista de Aseguramiento de Calidad de Software (QA Web)',
    company: 'Usercode SpA',
    companyLogo: 'https://ui-avatars.com/api/?name=Usercode+SpA&background=111111&color=ffffff&bold=true',
    category: 'qa',
    salary: '$1,200 - $1,800 USD / mes (Negociable)',
    modality: '100% Remoto (3x5 y días libres extra)',
    countryScope: 'LATAM (Sin bloqueo de país - Equipo en Chile, México, Perú)',
    languageReq: 'Español 100%',
    oneLineSummary:
      'Ejecuta pruebas funcionales en plataformas web trabajando en equipo con Jefe de Proyecto, Arquitecto y Desarrolladores.',
    description:
      'Usercode SpA es una empresa tecnológica 100% remota especializada en software a medida Cloud y digitalización. Trabajarás junto al equipo de desarrollo, arquitecto y jefe de proyecto realizando pruebas funcionales y no funcionales en plataformas web.',
    requirements: [
      'Diseño y ejecución de pruebas funcionales y de regresión en plataformas web',
      'Reporte estructurado de bugs y seguimiento junto a desarrolladores y jefe de proyecto',
      'Colaboración remota en español mediante Slack, Google Meet y Monday',
      'Validación de requerimientos, formularios, flujos de usuario y APIs',
    ],
    keywords: ['QA', 'Quality Assurance', 'Pruebas Funcionales', 'Web', 'APIs', 'Slack', 'Monday', 'Bug Tracking', 'Español'],
    source: 'Get on Board',
    applyUrl:
      'https://www.getonbrd.com/jobs/sysadmin-devops-qa/analista-de-aseguramiento-de-calidad-de-software-usercode-spa-remote-eb1a',
    contactEmail: 'seleccion@usercode.cl',
    contactWhatsapp: '56900000000',
    publishedAt: 'Hace 2 días',
  },
  {
    id: 'conversational-ai-qa-specialist-evolution-collect-llc-remote',
    title: 'Conversational AI QA Specialist (Evaluación de Bots & Transcripts)',
    company: 'Evolution Collect LLC',
    companyLogo: 'https://ui-avatars.com/api/?name=Evolution+Collect&background=1f2937&color=ffffff&bold=true',
    category: 'qa',
    salary: '$2,900 - $3,200 USD / mes',
    modality: '100% Remoto (Full-Time)',
    countryScope: 'Worldwide / Global (Acepta Venezuela y toda LATAM)',
    languageReq: 'Inglés Escrito / Técnico',
    oneLineSummary:
      'Audita transcripciones de chats de IA, califica Pass/Fail según manuales SOP y registra pruebas en Excel.',
    description:
      'Rol con entrenamiento incluido. Revisarás conversaciones de bots extremo a extremo, validando resúmenes, detectando dificultades financieras indirectas y registrando resultados en Excel.',
    requirements: [
      'Experiencia en QA, anotación de datos de IA, moderación de contenido o revisión de calidad',
      'Atención milimétrica al detalle para detectar errores que las reglas automáticas omiten',
      'Manejo cómodo de Microsoft Excel / Google Sheets y seguimiento de manuales SOP',
      'Curiosidad por modelos de lenguaje (LLMs) — No requiere programar',
    ],
    keywords: ['Conversational AI QA', 'QA', 'Excel', 'SOP', 'LLM', 'Data Annotation', 'Transcript Review', 'Compliance'],
    source: 'Get on Board',
    applyUrl:
      'https://www.getonbrd.com/jobs/sysadmin-devops-qa/conversational-ai-qa-specialist-evolution-collect-llc-remote',
    contactEmail: 'careers@evolutioncollect.com',
    publishedAt: 'Hace 1 día',
  },
  {
    id: 'wordpress-content-publishing-specialist-junior-front-end-d-josh-brown-consulting-remote',
    title: 'WordPress Content Publishing Specialist / Data Entry Web',
    company: 'D. Josh Brown Consulting',
    companyLogo: 'https://ui-avatars.com/api/?name=Josh+Brown&background=0f172a&color=ffffff&bold=true',
    category: 'data',
    salary: '$1,200 - $1,500 USD / mes',
    modality: '100% Remoto (Full-Time)',
    countryScope: 'Worldwide / Global (Sin restricción geográfica)',
    languageReq: 'Inglés Escrito / Técnico',
    oneLineSummary:
      'Publica y formatea 100 artículos al mes en WordPress (4-5 diarios), subiendo imágenes y ajustando HTML/CSS básico.',
    description:
      'Trabajo estructurado de backoffice editorial y maquetación web. Trabajarás con editores y gestores SEO subiendo contenidos en WordPress (Gutenberg, Elementor, ACF), agregando imágenes optimizadas, enlaces internos y tablas.',
    requirements: [
      'Manejo práctico de WordPress (Elementor, Gutenberg, ACF) y subida de contenidos',
      'Conocimiento básico/junior de HTML y CSS para corregir detalles de formato',
      'Organización para cumplir entregas con 95% de precisión siguiendo instrucciones por cliente',
      'Optimización de imágenes, textos alternativos (Alt Text) y SEO On-Page básico',
    ],
    keywords: ['WordPress', 'Content Publishing', 'Data Entry', 'HTML', 'CSS', 'SEO', 'Backoffice', 'Catalog'],
    source: 'Get on Board',
    applyUrl:
      'https://www.getonbrd.com/jobs/programming/wordpress-content-publishing-specialist-junior-front-end-d-josh-brown-consulting-remote',
    contactEmail: 'hiring@djoshbrown.com',
    publishedAt: 'Hace 3 días',
  },
  {
    id: 'imerit-ai-trainer-video-data-annotation',
    title: 'AI Trainer — Data & Video Annotation Specialist',
    company: 'iMerit Technology',
    companyLogo: 'https://ui-avatars.com/api/?name=iMerit+Tech&background=18181b&color=ffffff&bold=true',
    category: 'data',
    salary: '$1,400 - $2,200 USD / mes (Contractor)',
    modality: '100% Remoto Asíncrono',
    countryScope: 'Worldwide / Global',
    languageReq: 'Inglés Escrito / Técnico',
    oneLineSummary:
      'Etiqueta, clasifica y valida conjuntos de datos visuales y textuales para entrenar modelos de IA bajo guías paso a paso.',
    description:
      'Modalidad de contratista independiente evaluando y etiquetando datos para sistemas inteligentes. Ideal para perfiles metódicos con alta atención al detalle visual y documental.',
    requirements: [
      'Alta precisión en entrada de datos (Data Entry) y etiquetado siguiendo rúbricas de calidad',
      'Manejo fluido de herramientas web y hojas de control',
      'Trabajo 100% asíncrono por objetivos y métricas de precisión',
    ],
    keywords: ['Data Entry', 'AI Data Annotation', 'Quality Control', 'Backoffice', 'SOP', 'Excel'],
    source: 'Remotive',
    applyUrl: 'https://remotive.com/remote-jobs/artificial-intelligence/ai-trainer-video-annotation-2091161',
    contactEmail: 'talent@imerit.net',
    contactTelegram: 'imerit_talent_bot',
    publishedAt: 'Hace 2 días',
  },
  {
    id: 'digital-media-data-analyst-interfell-remote',
    title: 'Analista de Datos Operativos & Reportes (Excel / Looker Studio)',
    company: 'Interfell / Bridge IM',
    companyLogo: 'https://ui-avatars.com/api/?name=Interfell&background=111827&color=ffffff&bold=true',
    category: 'ops',
    salary: '$1,700 - $2,300 USD / mes',
    modality: '100% Remoto',
    countryScope: 'LATAM (Abierto a Venezuela y toda la región)',
    languageReq: 'Inglés Escrito / Técnico',
    oneLineSummary:
      'Extrae métricas, valida que los números cuadren en Excel/Google Sheets y mantiene dashboards actualizados para el equipo.',
    description:
      'Responsable de consolidar reportes semanales y mensuales, verificar la integridad de los datos en hojas de cálculo y detectar anomalías en campañas y operaciones.',
    requirements: [
      'Dominio avanzado de Microsoft Excel y Google Sheets (Tablas dinámicas, VLOOKUP/XLOOKUP)',
      'Experiencia creando o manteniendo paneles de visualización de datos',
      'Capacidad analítica para detectar inconsistencias numéricas antes de entregar reportes',
    ],
    keywords: ['Excel', 'Google Sheets', 'Data Entry', 'Reportes', 'Dashboards', 'Data Validation', 'Backoffice'],
    source: 'Get on Board',
    applyUrl: 'https://www.getonbrd.com/jobs/digital-media-analyst-interfell-remote',
    contactEmail: 'reclutamiento@interfell.com',
    contactWhatsapp: '573000000000',
    publishedAt: 'Hace 4 días',
  },
  {
    id: 'ingeniero-soporte-monitoreo-factor-it-remote',
    title: 'Analista de Soporte N1/N2 y Monitoreo de Procesos de Datos',
    company: 'Factor IT',
    companyLogo: 'https://ui-avatars.com/api/?name=Factor+IT&background=27272a&color=ffffff&bold=true',
    category: 'support',
    salary: '$1,400 - $1,900 USD / mes',
    modality: '100% Remoto',
    countryScope: 'LATAM (100% Remoto)',
    languageReq: 'Español 100%',
    oneLineSummary:
      'Monitorea la ejecución de flujos de datos y pipelines, valida consistencia de registros y resuelve alertas operativas N1/N2.',
    description:
      'Supervisión de procesos batch y flujos de datos en tiempo real, identificando retrasos o errores, ejecutando reprocesamientos documentados (SOP) y generando reportes de incidencias en español.',
    requirements: [
      'Experiencia en soporte técnico N1/N2, monitoreo de flujos de trabajo (workflows) o bases de datos',
      'Seguimiento de procedimientos operativos documentados (SOP) y gestión de alertas',
      'Análisis de logs, SQL básico y elaboración de informes de incidentes',
    ],
    keywords: ['Soporte', 'Monitoreo', 'Workflows', 'SQL', 'SOP', 'Ticket Triage', 'Logs', 'APIs'],
    source: 'Get on Board',
    applyUrl: 'https://www.getonbrd.com/jobs/ingeniero-de-soporte-y-monitoreo-factor-it-remote',
    contactEmail: 'talento@factorit.com',
    publishedAt: 'Hace 3 días',
  },
];

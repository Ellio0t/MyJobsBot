import { CVProfile, CourseRecommendation, JobOffer } from '../types';

/**
 * MOTOR DE AFILIACIÓN EDUCATIVA Y UPSKILLING (VÍA C)
 * 
 * Detecta las brechas de habilidades (Skill Gap) entre el perfil del candidato
 * y los requisitos de la vacante, sugiriendo certificaciones y cursos oficiales
 * con enlace de afiliado (comisiones de 20% a 50%).
 */

// Catálogo curado de programas educativos con alta tasa de conversión y reconocimiento internacional
export const UPSKILLING_CATALOG: Array<{
  keywordMatches: string[];
  course: CourseRecommendation;
}> = [
  {
    keywordMatches: ['inglés conversacional', 'english', 'bilingual', 'b2', 'c1', 'toefl', 'ielts'],
    course: {
      id: 'course-open-english-pro',
      skillName: 'Inglés Profesional y Conversacional',
      title: 'Programa Intensivo de Inglés para Profesionales y Entrevistas',
      provider: 'Open English',
      durationHours: 40,
      level: 'Intermedio',
      estimatedAffinityBoost: 22,
      badgeText: 'Aumenta hasta +22% afinidad ATS',
      priceNote: 'Certificado internacional y clases en vivo 24/7',
      url: 'https://www.openenglish.com/?ref=jobsbot_affiliate&utm_source=jobsbot&utm_medium=upskilling_cta',
    },
  },
  {
    keywordMatches: ['postman', 'api', 'rest', 'qa automation', 'testing', 'cypress', 'selenium'],
    course: {
      id: 'course-postman-qa-cert',
      skillName: 'Postman & Automatización de Pruebas API',
      title: 'Certificación Oficial en API Testing & Automation con Postman',
      provider: 'Coursera',
      durationHours: 25,
      level: 'Intermedio',
      estimatedAffinityBoost: 18,
      badgeText: 'Aumenta hasta +18% afinidad ATS',
      priceNote: 'Certificado oficial verificado para LinkedIn',
      url: 'https://www.coursera.org/learn/postman-api-testing?ref=jobsbot&utm_source=jobsbot&utm_medium=career_upskill',
    },
  },
  {
    keywordMatches: ['aws', 'cloud', 'docker', 'kubernetes', 'devops', 'terraform', 'ci/cd'],
    course: {
      id: 'course-aws-cloud-cert',
      skillName: 'AWS Cloud Solutions & Docker',
      title: 'AWS Certified Solutions Architect & Contenedores Docker',
      provider: 'Coursera',
      durationHours: 35,
      level: 'Intermedio',
      estimatedAffinityBoost: 20,
      badgeText: 'Aumenta hasta +20% afinidad ATS',
      priceNote: 'Validez para examen oficial de Amazon Web Services',
      url: 'https://www.coursera.org/professional-certificates/aws-cloud-solutions?ref=jobsbot&utm_source=jobsbot',
    },
  },
  {
    keywordMatches: ['excel', 'power bi', 'sql', 'bigquery', 'data analysis', 'tableau', 'analytics'],
    course: {
      id: 'course-data-powerbi-excel',
      skillName: 'Power BI & Excel Avanzado',
      title: 'Especialización en Análisis de Datos Empresarial con Power BI y SQL',
      provider: 'Coursera',
      durationHours: 30,
      level: 'Intermedio',
      estimatedAffinityBoost: 17,
      badgeText: 'Aumenta hasta +17% afinidad ATS',
      priceNote: 'Impartido por Google Data Analytics Institute',
      url: 'https://www.coursera.org/professional-certificates/google-data-analytics?ref=jobsbot&utm_source=jobsbot',
    },
  },
  {
    keywordMatches: ['scrum', 'agile', 'kanban', 'jira', 'product owner', 'project manager'],
    course: {
      id: 'course-scrum-agile-cert',
      skillName: 'Scrum Master & Liderazgo Ágil',
      title: 'Certificación Profesional Scrum Master y Gestión Ágil con Jira',
      provider: 'Platzi',
      durationHours: 20,
      level: 'Principiante',
      estimatedAffinityBoost: 15,
      badgeText: 'Aumenta hasta +15% afinidad ATS',
      priceNote: 'Badge digital verificado con estándar internacional',
      url: 'https://platzi.com/cursos/scrum/?ref=jobsbot_partner&utm_source=jobsbot&utm_medium=ats_bridge',
    },
  },
  {
    keywordMatches: ['react', 'typescript', 'next.js', 'frontend', 'javascript', 'vue'],
    course: {
      id: 'course-react-ts-pro',
      skillName: 'React 19 & TypeScript Avanzado',
      title: 'Desarrollo Frontend Fullstack con React 19, TypeScript y Clean Architecture',
      provider: 'Platzi',
      durationHours: 45,
      level: 'Avanzado',
      estimatedAffinityBoost: 19,
      badgeText: 'Aumenta hasta +19% afinidad ATS',
      priceNote: 'Portafolio de proyectos reales para entrevistas',
      url: 'https://platzi.com/cursos/react-avanzado/?ref=jobsbot&utm_source=jobsbot',
    },
  },
  {
    keywordMatches: ['python', 'fastapi', 'backend', 'django', 'node.js', 'microservicios'],
    course: {
      id: 'course-python-backend',
      skillName: 'Python Backend & Microservicios',
      title: 'Arquitectura de Software y Microservicios con Python & FastAPI',
      provider: 'Coursera',
      durationHours: 35,
      level: 'Avanzado',
      estimatedAffinityBoost: 18,
      badgeText: 'Aumenta hasta +18% afinidad ATS',
      priceNote: 'Proyectos evaluados por ingenieros de la industria',
      url: 'https://www.coursera.org/specializations/python-3-programming?ref=jobsbot&utm_source=jobsbot',
    },
  },
  {
    keywordMatches: ['finanzas', 'compliance', 'legal', 'auditoría', 'fiscal', 'tributario'],
    course: {
      id: 'course-legal-compliance',
      skillName: 'Compliance Normativo y Finanzas Corporativas',
      title: 'Gestión de Riesgos, Compliance Internacional y Finanzas Estratégicas',
      provider: 'Coursera',
      durationHours: 25,
      level: 'Intermedio',
      estimatedAffinityBoost: 16,
      badgeText: 'Aumenta hasta +16% afinidad ATS',
      priceNote: 'Acreditado por Wharton Business School',
      url: 'https://www.coursera.org/learn/wharton-fintech?ref=jobsbot&utm_source=jobsbot',
    },
  },
];

/**
 * Compara los requerimientos del empleo con el CV y devuelve recomendaciones personalizadas
 */
export function detectSkillGaps(profile?: CVProfile | null, job?: JobOffer): CourseRecommendation[] {
  if (!job) return [];

  const jobReqText = [
    job.title,
    job.description,
    job.languageReq,
    ...job.requirements,
    ...job.keywords,
  ]
    .join(' ')
    .toLowerCase();

  const cvCorpus = profile
    ? [
        profile.headline,
        profile.summary,
        ...profile.skills.map((s) => s.name),
        ...profile.atsKeywords,
        ...profile.experiences.flatMap((e) => [e.role, ...e.bullets]),
      ]
        .join(' ')
        .toLowerCase()
    : '';

  const matchedRecommendations: CourseRecommendation[] = [];

  for (const item of UPSKILLING_CATALOG) {
    // 1. ¿El empleo exige o menciona esta habilidad?
    const jobNeedsIt = item.keywordMatches.some((kw) => jobReqText.includes(kw));

    if (jobNeedsIt) {
      // 2. ¿El candidato NO la tiene o no está logueado?
      const cvHasIt = cvCorpus && item.keywordMatches.some((kw) => cvCorpus.includes(kw));

      if (!cvHasIt) {
        matchedRecommendations.push(item.course);
      }
    }
  }

  // Si no hay brecha específica detectada, sugerir el curso general más relevante según la categoría del empleo
  if (matchedRecommendations.length === 0) {
    if (job.category === 'tech' || job.category === 'qa') {
      matchedRecommendations.push(UPSKILLING_CATALOG[1].course); // Postman / API
    } else if (job.category === 'data') {
      matchedRecommendations.push(UPSKILLING_CATALOG[3].course); // Power BI / Excel
    } else if (job.languageReq.includes('Inglés')) {
      matchedRecommendations.push(UPSKILLING_CATALOG[0].course); // Open English
    } else {
      matchedRecommendations.push(UPSKILLING_CATALOG[4].course); // Scrum / Agile
    }
  }

  // Devolver máximo 2 recomendaciones para no saturar al usuario
  return matchedRecommendations.slice(0, 2);
}

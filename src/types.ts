export type JobCategory =
  | 'all'
  | 'tech'
  | 'health'
  | 'legal'
  | 'finance'
  | 'sales'
  | 'support'
  | 'ops'
  | 'data'
  | 'qa';

export type ThemeMode = 'auto' | 'light' | 'dark';

export interface BrandConfig {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  domain: string;
}

export interface CVSkill {
  name: string;
  level: number; // 0 to 100
}

export interface CVLanguage {
  name: string;
  level: string;
}

export interface CVExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface CVProfile {
  fullName: string;
  headline: string;
  avatarUrl: string;
  showPhotoInCV: boolean;
  availability: string;
  phone: string;
  email: string;
  linkedin: string;
  location: string;
  summary: string;
  skills: CVSkill[];
  languages: CVLanguage[];
  experiences: CVExperience[];
  education: {
    degree: string;
    institution: string;
    year: string;
    details: string;
  }[];
  atsKeywords: string[];
}

export interface CVVersion {
  id: string;
  label: string;
  targetRole: string;
  createdAt: string;
  isDefault?: boolean;
  profile: CVProfile;
}

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  category: Exclude<JobCategory, 'all'>;
  salary: string;
  modality: string;
  countryScope: string;
  languageReq: 'Español 100%' | 'Inglés Escrito / Técnico' | 'Inglés Conversacional';
  oneLineSummary: string;
  description: string;
  requirements: string[];
  keywords: string[];
  source: 'Get on Board' | 'Remotive' | 'RemoteOK' | 'LinkedIn' | 'Indeed' | 'Glassdoor' | 'ZipRecruiter' | 'Monster' | 'FlexJobs' | 'Wellfound' | 'Dice' | string;
  applyUrl: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  contactTelegram?: string;
  publishedAt: string;
  matchScore?: number;
  // Monetización Vía B: B2B Destacadas
  isFeatured?: boolean;
  featuredBadge?: string;
  featuredTier?: 'gold' | 'diamond';
  sponsorCompany?: string;
  featuredExpiresAt?: string;
  // Monetización Vía D: Anuncio Nativo
  isSponsoredAd?: boolean;
}

export interface CourseRecommendation {
  id: string;
  skillName: string;
  title: string;
  provider: 'Coursera' | 'Platzi' | 'Open English' | 'Udemy' | 'Google Cloud Skills';
  providerLogo?: string;
  durationHours: number;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  estimatedAffinityBoost: number; // Por ejemplo +18%
  url: string;
  badgeText: string;
  priceNote?: string;
}

export interface PostJobFormData {
  title: string;
  company: string;
  companyLogo?: string;
  category: Exclude<JobCategory, 'all'>;
  salary: string;
  modality: string;
  countryScope: string;
  languageReq: 'Español 100%' | 'Inglés Escrito / Técnico' | 'Inglés Conversacional';
  oneLineSummary: string;
  description: string;
  requirements: string;
  keywords: string;
  applyUrl: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  planId: 'plan-15d' | 'plan-30d';
  billingEmail: string;
}

export interface UserSession {
  isAuthenticated: boolean;
  uid?: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  authProvider?: 'google' | 'email';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  createdVersionId?: string;
}


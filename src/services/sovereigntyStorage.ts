import { CVVersion } from '../types';

const VAULT_STORAGE_KEY_PREFIX = 'myjobsbot_sovereign_vault_';

/**
 * Obtiene la clave de almacenamiento local según el ID de usuario o 'guest'
 */
function getStorageKey(userId?: string): string {
  const safeId = userId && userId.trim() ? userId.trim() : 'anonymous_guest';
  return `${VAULT_STORAGE_KEY_PREFIX}${safeId}`;
}

/**
 * Guarda inmediatamente todas las variantes de CV en el almacenamiento local seguro del navegador
 */
export function saveVaultLocally(versions: CVVersion[], userId?: string): void {
  try {
    const key = getStorageKey(userId);
    const payload = {
      schemaVersion: '1.0.0',
      lastSyncedAt: new Date().toISOString(),
      userId: userId || 'anonymous_guest',
      versionsCount: versions.length,
      versions,
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn('No se pudo guardar la bóveda localmente (posible límite de cuota o navegación privada):', err);
  }
}

/**
 * Carga las variantes de CV almacenadas localmente. Retorna null si no hay datos previos.
 */
export function loadVaultLocally(userId?: string): CVVersion[] | null {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.versions) && parsed.versions.length > 0) {
      return parsed.versions as CVVersion[];
    }
  } catch (err) {
    console.warn('Error al leer la bóveda local:', err);
  }
  return null;
}

/**
 * Diagnóstico de soberanía: calcula el espacio utilizado y estado del almacenamiento
 */
export function getVaultDiagnostics(userId?: string): {
  isLocalOnly: boolean;
  totalVersions: number;
  lastSyncFormatted: string;
  storageBytesUsed: number;
} {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {
        isLocalOnly: true,
        totalVersions: 0,
        lastSyncFormatted: 'Sin respaldo local',
        storageBytesUsed: 0,
      };
    }
    const parsed = JSON.parse(raw);
    const dateStr = parsed.lastSyncedAt
      ? new Date(parsed.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : 'Reciente';

    return {
      isLocalOnly: true,
      totalVersions: Array.isArray(parsed.versions) ? parsed.versions.length : 0,
      lastSyncFormatted: dateStr,
      storageBytesUsed: new Blob([raw]).size,
    };
  } catch {
    return {
      isLocalOnly: true,
      totalVersions: 0,
      lastSyncFormatted: 'N/A',
      storageBytesUsed: 0,
    };
  }
}

/**
 * Descarga el archivo de respaldo completo en formato JSON abierto
 */
export function exportVaultBackupFile(versions: CVVersion[], identifier: string = 'mi-boveda'): void {
  const exportPayload = {
    title: 'MyJobsBot Sovereign CV Vault Backup',
    version: '1.2.26',
    generatedAt: new Date().toISOString(),
    owner: identifier,
    legalNotice: 'Propiedad exclusiva e inalienable del usuario. Cero extracción por terceros.',
    cvVersions: versions,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateSlug = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `myjobsbot-boveda-soberana-${dateSlug}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Valida y parsea un archivo de respaldo subido por el usuario
 */
export function parseAndValidateVaultBackup(jsonContent: string): CVVersion[] {
  const parsed = JSON.parse(jsonContent);

  // Soporta tanto formato directo array como objeto con propiedad cvVersions o versions
  let list: any[] = [];
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (Array.isArray(parsed.cvVersions)) {
    list = parsed.cvVersions;
  } else if (Array.isArray(parsed.versions)) {
    list = parsed.versions;
  } else {
    throw new Error('El archivo no contiene un catálogo de variantes de CV reconocible.');
  }

  // Validación básica de campos esenciales
  const validVersions: CVVersion[] = list.map((item, idx) => {
    if (!item.profile || !item.profile.fullName) {
      throw new Error(`La variante #${idx + 1} no tiene un perfil o nombre válido.`);
    }
    return {
      id: item.id || `restored-cv-${Date.now()}-${idx}`,
      label: item.label || `CV Restaurado #${idx + 1}`,
      targetRole: item.targetRole || item.profile.headline || 'General',
      createdAt: item.createdAt || new Date().toISOString(),
      isDefault: item.isDefault || idx === 0,
      profile: item.profile,
    };
  });

  return validVersions;
}

/**
 * Exporta al estándar internacional abierto JSON Resume (https://jsonresume.org)
 */
export function exportToJsonResume(version: CVVersion): void {
  const p = version.profile;
  const jsonResume = {
    basics: {
      name: p.fullName,
      label: p.headline,
      image: p.avatarUrl || '',
      email: p.email,
      phone: p.phone,
      url: p.linkedin || '',
      summary: p.summary,
      location: {
        address: p.location,
      },
    },
    work: (p.experiences || []).map((exp) => ({
      name: exp.company,
      position: exp.role,
      startDate: exp.period,
      summary: exp.location,
      highlights: exp.bullets || [],
    })),
    education: (p.education || []).map((edu) => ({
      institution: edu.institution,
      area: edu.degree,
      studyType: 'Degree',
      endDate: edu.year,
      courses: edu.details ? [edu.details] : [],
    })),
    skills: (p.skills || []).map((sk) => ({
      name: sk.name,
      level: `${sk.level}%`,
    })),
    languages: (p.languages || []).map((lang) => ({
      language: lang.name,
      fluency: lang.level,
    })),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonResume, null, 2));
  const downloadAnchor = document.createElement('a');
  const slug = version.targetRole.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `json-resume-standard-${slug}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Purgado seguro e irreversible de datos (Derecho al Olvido / GDPR)
 */
export function purgeAllUserData(userId?: string): void {
  try {
    const key = getStorageKey(userId);
    localStorage.removeItem(key);

    // Limpieza de claves auxiliares
    localStorage.removeItem('myjobsbot_session');
    localStorage.removeItem('myjobsbot_scroll_lead_dismissed');
    sessionStorage.clear();
  } catch (err) {
    console.error('Error al purgar datos locales:', err);
  }
}

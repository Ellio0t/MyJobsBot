import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  Lock,
  FileCode,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { CVVersion } from '../types';
import {
  exportVaultBackupFile,
  parseAndValidateVaultBackup,
  exportToJsonResume,
  purgeAllUserData,
  getVaultDiagnostics,
} from '../services/sovereigntyStorage';

interface SovereigntyVaultPanelProps {
  cvVersions: CVVersion[];
  activeCv: CVVersion;
  userId?: string;
  userEmail?: string;
  onRestoreVersions: (versions: CVVersion[]) => void;
  onPurgeComplete: () => void;
}

export const SovereigntyVaultPanel: React.FC<SovereigntyVaultPanelProps> = ({
  cvVersions,
  activeCv,
  userId,
  userEmail,
  onRestoreVersions,
  onPurgeComplete,
}) => {
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const diagnostics = getVaultDiagnostics(userId);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleExportBackup = () => {
    try {
      exportVaultBackupFile(cvVersions, userEmail || 'candidato-soberano');
      showNotification(`Bóveda exportada con éxito (${cvVersions.length} variantes incluidas).`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al exportar la bóveda.');
    }
  };

  const handleExportJsonResume = () => {
    try {
      exportToJsonResume(activeCv);
      showNotification(`CV exportado en estándar JSON Resume (${activeCv.label}).`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al exportar en formato JSON Resume.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const restored = parseAndValidateVaultBackup(content);
        onRestoreVersions(restored);
        showNotification(`¡Bóveda restaurada con éxito! ${restored.length} variantes recuperadas.`);
        setErrorMessage(null);
      } catch (err: any) {
        setErrorMessage(err?.message || 'El archivo no tiene un formato válido de respaldo.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePurgeEverything = () => {
    purgeAllUserData(userId);
    setShowPurgeConfirm(false);
    showNotification('Todos tus datos locales han sido borrados irreversiblemente.');
    setTimeout(() => {
      onPurgeComplete();
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* TOAST FLOTANTE */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-[#4ade80] text-xs font-montserrat font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-montserrat font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* BANNER PRINCIPAL DE SOBERANÍA Y CONFIANZA */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#12151c] border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-[#4ade80]/10 border border-emerald-500/20 dark:border-[#4ade80]/20 flex items-center justify-center text-emerald-600 dark:text-[#4ade80] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-montserrat font-black text-base text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                Bóveda de Soberanía y Portabilidad
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-[#4ade80] border border-emerald-500/30">
                  Zero Data Harvesting
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Tus variantes de CV, notas y datos de contacto te pertenecen exclusivamente a ti.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#181c25] border border-neutral-200 dark:border-[#262c3a] text-xs text-neutral-600 dark:text-neutral-300">
            <HardDrive className="w-3.5 h-3.5 text-emerald-500 dark:text-[#4ade80]" />
            <span className="font-montserrat font-bold text-[11px]">
              Local-First ({diagnostics.totalVersions} variantes · {Math.round(diagnostics.storageBytesUsed / 1024)} KB)
            </span>
          </div>
        </div>

        {/* INDICADOR DE SINCRONIZACIÓN INMEDIATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#161a23] border border-neutral-200 dark:border-[#222734]">
            <div className="flex items-center gap-2 text-xs font-montserrat font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              <Lock className="w-3.5 h-3.5 text-emerald-500 dark:text-[#4ade80]" />
              <span>Aislamiento de Datos</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Cero venta a brokers de datos o anunciantes externos. Tus borradores no se indexan públicamente.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#161a23] border border-neutral-200 dark:border-[#222734]">
            <div className="flex items-center gap-2 text-xs font-montserrat font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500 dark:text-[#4ade80]" />
              <span>Sincronización Inmediata</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Cada edición que realizas en CV Studio o con JoBOT se sella al instante en el almacenamiento persistente.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#161a23] border border-neutral-200 dark:border-[#222734]">
            <div className="flex items-center gap-2 text-xs font-montserrat font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              <FileCode className="w-3.5 h-3.5 text-emerald-500 dark:text-[#4ade80]" />
              <span>Portabilidad Abierta</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Exporta tus datos en formatos estándar (`.json` y JSON Resume) para usarlos en cualquier software libre.
            </p>
          </div>
        </div>
      </div>

      {/* HERRAMIENTAS DE PORTABILIDAD Y RESPALDO (ACCIONES DIRECTAS) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#12151c] border border-neutral-200 dark:border-[#252a36] shadow-sm space-y-4">
        <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Herramientas de Exportación y Respaldo
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* BOTÓN 1: EXPORTAR BÓVEDA COMPLETA */}
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-xl border border-neutral-200 dark:border-[#262c3a] bg-neutral-50 hover:bg-neutral-100 dark:bg-[#161a23] dark:hover:bg-[#1d222e] transition-all text-left flex flex-col justify-between gap-3 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#4ade80] flex items-center justify-center">
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-[#252a36] text-neutral-600 dark:text-neutral-300">
                .JSON
              </span>
            </div>
            <div>
              <div className="font-montserrat font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                Descargar Bóveda Completa
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Respalda todas tus variantes de CV ({cvVersions.length} versiones) en un único archivo JSON cifrado.
              </p>
            </div>
          </button>

          {/* BOTÓN 2: RESTAURAR O IMPORTAR BÓVEDA */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl border border-neutral-200 dark:border-[#262c3a] bg-neutral-50 hover:bg-neutral-100 dark:bg-[#161a23] dark:hover:bg-[#1d222e] transition-all text-left flex flex-col justify-between gap-3 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-[#252a36] text-neutral-600 dark:text-neutral-300">
                RESTAURAR
              </span>
            </div>
            <div>
              <div className="font-montserrat font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                Restaurar / Migrar Bóveda
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Carga un archivo de respaldo previo para sincronizar tus CVs en este navegador de inmediato.
              </p>
            </div>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json"
            className="hidden"
          />

          {/* BOTÓN 3: EXPORTAR AL ESTÁNDAR INTERNACIONAL JSON RESUME */}
          <button
            onClick={handleExportJsonResume}
            className="p-4 rounded-xl border border-neutral-200 dark:border-[#262c3a] bg-neutral-50 hover:bg-neutral-100 dark:bg-[#161a23] dark:hover:bg-[#1d222e] transition-all text-left flex flex-col justify-between gap-3 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-[#252a36] text-neutral-600 dark:text-neutral-300">
                JSON RESUME
              </span>
            </div>
            <div>
              <div className="font-montserrat font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                Exportar Estándar Global
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Exporta la versión activa ({activeCv.label}) al estándar oficial `jsonresume.org`.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* MANIFIESTO DE TRANSPARENCIA RADICAL (ANTI-ROBO DE DATOS) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-emerald-500/5 dark:bg-[#4ade80]/5 border border-emerald-500/20 dark:border-[#4ade80]/20 space-y-3">
        <h4 className="font-montserrat font-black text-xs uppercase tracking-wider text-emerald-700 dark:text-[#4ade80] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Manifiesto de Transparencia Radical: ¿Cómo nos sostenemos sin vender tus datos?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <div>
            <strong className="text-neutral-900 dark:text-white block mb-1">
              1. Tú no eres el producto
            </strong>
            A diferencia de otras redes corporativas, nosotros no cobramos a cazatalentos por espiar tus búsquedas de empleo ni vendemos tu número de teléfono o correo a centros de telemercadeo.
          </div>
          <div>
            <strong className="text-neutral-900 dark:text-white block mb-1">
              2. Modelo de Ingresos Honesto y Transparente
            </strong>
            Monetizamos mediante acuerdos oficiales de publicación con bolsas de trabajo certificadas (comisiones CPC/CPA cuando haces clic en postularte) y empresas que pagan por destacar ofertas VIP.
          </div>
          <div>
            <strong className="text-neutral-900 dark:text-white block mb-1">
              3. Salida Directa hacia las Empresas
            </strong>
            Cuando te postulas por correo o enlace directo, la postulación sale de tu propio cliente de correo o va al portal oficial de la empresa. No interceptamos tus cartas ni mensajes.
          </div>
          <div>
            <strong className="text-neutral-900 dark:text-white block mb-1">
              4. Derecho al Olvido Real (1 Clic)
            </strong>
            Si decides dejar de usar la plataforma, puedes purgar toda tu información con un solo clic. Cero retenciones forzosas ni registros fantasma.
          </div>
        </div>
      </div>

      {/* ZONA DE DERECHO AL OLVIDO / PURGADO IRREVERSIBLE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-montserrat font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Zona de Derecho al Olvido (GDPR / CCPA)
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Elimina irreversiblemente todas las variantes de CV, historiales locales y sesiones almacenadas en este dispositivo.
          </p>
        </div>

        <button
          onClick={() => setShowPurgeConfirm(true)}
          className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-montserrat font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
        >
          Purgar Mis Datos Locales
        </button>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE PURGADO */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12151c] max-w-md w-full rounded-2xl border border-neutral-300 dark:border-[#2f3545] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="font-montserrat font-extrabold text-base uppercase tracking-wider">
                ¿Confirmas el borrado total?
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Esta acción eliminará todas tus variantes de currículum ({cvVersions.length} versiones) y la memoria local en este navegador. Si no has descargado tu archivo de respaldo (.JSON), no podrás recuperarlos.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPurgeConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-montserrat font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1c222e] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handlePurgeEverything}
                className="px-4 py-2 rounded-xl text-xs font-montserrat font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm"
              >
                Sí, purgar todo ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  User,
  FileText,
  Briefcase,
  Wrench,
  GraduationCap,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { CVProfile, CVSkill, CVExperience } from '../types';

interface CvQuickEditorPanelProps {
  profile: CVProfile;
  onUpdateProfile: (updated: Partial<CVProfile>) => void;
  onClose?: () => void;
}

type EditorTab = 'basics' | 'summary' | 'skills' | 'experience' | 'education';

export const CvQuickEditorPanel: React.FC<CvQuickEditorPanelProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  const [currentTab, setCurrentTab] = useState<EditorTab>('basics');
  const [newSkillName, setNewSkillName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const notifyChange = (partial: Partial<CVProfile>) => {
    onUpdateProfile(partial);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const updatedSkills: CVSkill[] = [
      ...profile.skills,
      { name: newSkillName.trim(), level: 85 }
    ];

    notifyChange({ skills: updatedSkills });
    setNewSkillName('');
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = profile.skills.filter((_, i) => i !== index);
    notifyChange({ skills: updatedSkills });
  };

  const handleAddExperience = () => {
    const newExp: CVExperience = {
      id: `exp-${Date.now()}`,
      role: 'Nuevo Cargo Profesional',
      company: 'Empresa / Proyecto',
      location: 'Remoto LATAM',
      period: '2024 - Presente',
      bullets: [
        'Lideré la implementación de mejoras operativas aumentando la eficiencia en un 25%.',
        'Coordiné entregas técnicas con equipos multidisciplinarios.'
      ]
    };

    notifyChange({ experiences: [newExp, ...profile.experiences] });
  };

  const handleUpdateExperience = (id: string, field: keyof CVExperience, value: any) => {
    const updated = profile.experiences.map((exp) =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    notifyChange({ experiences: updated });
  };

  const handleRemoveExperience = (id: string) => {
    const updated = profile.experiences.filter((exp) => exp.id !== id);
    notifyChange({ experiences: updated });
  };

  return (
    <div className="cv-quick-editor-panel flex flex-col h-full bg-white dark:bg-[#12151c] text-neutral-900 dark:text-neutral-100 rounded-xl overflow-hidden shadow-xl border border-neutral-200 dark:border-[#252a36]">
      {/* CABECERA DEL EDITOR */}
      <div className="p-3.5 bg-neutral-100 dark:bg-[#171b25] border-b border-neutral-200 dark:border-[#242936] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-600 dark:text-[#4ade80]" />
          <h3 className="font-montserrat text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">
            Herramientas de Edición Directa
          </h3>
        </div>
        {saveSuccess && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-[#4ade80] flex items-center gap-1 animate-fade-in">
            <CheckCircle2 className="w-3 h-3" /> Sincronizado
          </span>
        )}
      </div>

      {/* PESTAÑAS DE EDICIÓN */}
      <div className="flex items-center gap-1 p-1.5 bg-neutral-50 dark:bg-[#141720] border-b border-neutral-200 dark:border-[#222736] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setCurrentTab('basics')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-montserrat font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
            currentTab === 'basics'
              ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709]'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Contacto
        </button>
        <button
          onClick={() => setCurrentTab('summary')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-montserrat font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
            currentTab === 'summary'
              ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709]'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setCurrentTab('skills')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-montserrat font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
            currentTab === 'skills'
              ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709]'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Skills ({profile.skills.length})
        </button>
        <button
          onClick={() => setCurrentTab('experience')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-montserrat font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
            currentTab === 'experience'
              ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709]'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Experiencia ({profile.experiences.length})
        </button>
        <button
          onClick={() => setCurrentTab('education')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-montserrat font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
            currentTab === 'education'
              ? 'bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709]'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Educación
        </button>
      </div>

      {/* CUERPO DEL EDITOR SEGÚN PESTAÑA */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
        {/* PESTAÑA 1: CONTACTO */}
        {currentTab === 'basics' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => notifyChange({ fullName: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                Titular Profesional
              </label>
              <input
                type="text"
                value={profile.headline}
                onChange={(e) => notifyChange({ headline: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => notifyChange({ email: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => notifyChange({ phone: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => notifyChange({ location: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Disponibilidad
                </label>
                <input
                  type="text"
                  value={profile.availability}
                  onChange={(e) => notifyChange({ availability: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                LinkedIn URL
              </label>
              <input
                type="text"
                value={profile.linkedin}
                onChange={(e) => notifyChange({ linkedin: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
        )}

        {/* PESTAÑA 2: RESUMEN EJECUTIVO */}
        {currentTab === 'summary' && (
          <div className="space-y-2">
            <label className="block text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Resumen Profesional / Pitch de Impacto
            </label>
            <textarea
              rows={9}
              value={profile.summary}
              onChange={(e) => notifyChange({ summary: e.target.value })}
              className="w-full p-3 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80] leading-relaxed"
              placeholder="Describe tus fortalezas clave y logros principales..."
            />
            <p className="text-[10px] text-neutral-400 leading-tight">
              Tip ATS: Incluye tus años de experiencia y las tecnologías principales en el primer párrafo.
            </p>
          </div>
        )}

        {/* PESTAÑA 3: HABILIDADES */}
        {currentTab === 'skills' && (
          <div className="space-y-3">
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Añadir habilidad (ej: Playwright, Excel, Python)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#181c25] border border-neutral-300 dark:border-[#2d3444] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-[#4ade80]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-[#111111] text-white dark:bg-[#4ade80] dark:text-[#070709] font-montserrat font-bold text-xs uppercase tracking-wider hover:opacity-90 cursor-pointer shrink-0"
              >
                + Añadir
              </button>
            </form>

            <div className="space-y-1.5">
              <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-500">
                Habilidades Activas en el CV:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-[300px] overflow-y-auto">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-neutral-100 dark:bg-[#1a202c] border border-neutral-200 dark:border-[#283142] text-neutral-800 dark:text-neutral-200"
                  >
                    <span>{skill.name}</span>
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-neutral-400 hover:text-red-500 text-xs cursor-pointer"
                      title="Eliminar habilidad"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: EXPERIENCIA */}
        {currentTab === 'experience' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-500">
                Puestos Laborales
              </span>
              <button
                onClick={handleAddExperience}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-[#4ade80] border border-emerald-500/25 text-[10px] font-montserrat font-bold uppercase tracking-wider cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Añadir Puesto
              </button>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {profile.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181c25] border border-neutral-200 dark:border-[#2a3142] space-y-2 relative"
                >
                  <div className="flex justify-between items-start gap-2">
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                      placeholder="Cargo / Puesto"
                      className="font-montserrat font-bold text-xs bg-transparent border-b border-transparent hover:border-neutral-400 focus:border-neutral-900 dark:focus:border-[#4ade80] outline-none flex-1"
                    />
                    <button
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="text-neutral-400 hover:text-red-500 p-0.5 cursor-pointer shrink-0"
                      title="Eliminar puesto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                      placeholder="Empresa"
                      className="px-2 py-1 rounded bg-white dark:bg-[#0e1117] border border-neutral-300 dark:border-[#282f40]"
                    />
                    <input
                      type="text"
                      value={exp.period}
                      onChange={(e) => handleUpdateExperience(exp.id, 'period', e.target.value)}
                      placeholder="Periodo (ej: 2023 - Presente)"
                      className="px-2 py-1 rounded bg-white dark:bg-[#0e1117] border border-neutral-300 dark:border-[#282f40]"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-montserrat font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                      Logros Cuantificados (Viñetas)
                    </label>
                    <textarea
                      rows={3}
                      value={exp.bullets.join('\n')}
                      onChange={(e) =>
                        handleUpdateExperience(
                          exp.id,
                          'bullets',
                          e.target.value.split('\n').filter((b) => b.trim() !== '')
                        )
                      }
                      className="w-full p-2 rounded bg-white dark:bg-[#0e1117] border border-neutral-300 dark:border-[#282f40] text-[11px] leading-relaxed outline-none"
                      placeholder="Una viñeta de logro por línea..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 5: EDUCACIÓN */}
        {currentTab === 'education' && (
          <div className="space-y-3">
            <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-neutral-500">
              Formación y Estudios
            </span>

            {profile.education.map((edu, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181c25] border border-neutral-200 dark:border-[#2a3142] space-y-2"
              >
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => {
                    const updated = [...profile.education];
                    updated[idx] = { ...updated[idx], degree: e.target.value };
                    notifyChange({ education: updated });
                  }}
                  placeholder="Título o Grado Académico"
                  className="w-full font-bold text-xs bg-transparent border-b border-transparent hover:border-neutral-400 focus:border-neutral-900 dark:focus:border-[#4ade80] outline-none"
                />

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...profile.education];
                      updated[idx] = { ...updated[idx], institution: e.target.value };
                      notifyChange({ education: updated });
                    }}
                    placeholder="Universidad o Institución"
                    className="px-2 py-1 rounded bg-white dark:bg-[#0e1117] border border-neutral-300 dark:border-[#282f40]"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => {
                      const updated = [...profile.education];
                      updated[idx] = { ...updated[idx], year: e.target.value };
                      notifyChange({ education: updated });
                    }}
                    placeholder="Año de egreso"
                    className="px-2 py-1 rounded bg-white dark:bg-[#0e1117] border border-neutral-300 dark:border-[#282f40]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

# 🎨 JobsBOT Brand & Design System: Regla Cromática 60-30-10
## Manual de Identidad Visual y Neuroventas Ratificado (v1.2.6+)

Este documento establece la arquitectura cromática oficial y las normas de aplicación visual de **JobsBOT**, aprobada tras la auditoría de neuroventas del 11 de noviembre de 2026.

---

### 1. Filosofía de Marca: Empatía de Candidato + Monetización B2B

La identidad visual de JobsBOT resuelve la tensión fundamental de las plataformas laborales:
1. **El Candidato busca un Aliado:** Viene agotado de la frialdad corporativa de LinkedIn e Indeed. Busca validación, rapidez y resultados positivos.
2. **La Empresa busca Estatus y Resultados:** Cuando una empresa paga por destacar una vacante o publicar una oferta, exige exclusividad y visibilidad premium.

Para satisfacer a ambos actores sin contradicción visual, se implementa la **Fórmula Híbrida Ratificada (Opción A)**.

---

### 2. Especificación de Tokens Cromáticos (Regla 60-30-10)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SISTEMA HÍBRIDO 60-30-10                        │
├────────────────────────┬──────────────────────┬────────────────────────┤
│ 60% LIENZO NEUTRO      │ 30% ESTRUCTURA       │ 10% MOTORES DE ACCIÓN  │
│ Fondo Carbón / Offwhite│ Pizarra Ejecutivo    │ Menta ATS + Oro B2B    │
│ #070709 / #12151c      │ #1e293b / #252a36    │ #4ade80   |  #f59e0b   │
└────────────────────────┴──────────────────────┴────────────────────────┘
```

#### A. 60% — Lienzo Neutro de Descanso Visual
- **Fondo General Oscuro:** `#070709` (Obsidiana Profundo).
- **Tarjetas y Superficies:** `#12151c` (Carbón Elevado con alto contraste).
- **Fondo Modo Claro:** `#f8fafc` / `#ffffff` (Lienzo editorial nítido).
- **Propósito:** Prevenir la fatiga ocular durante sesiones largas de postulación y revisión de CV.

#### B. 30% — Estructura y Confianza
- **Bordes y Delimitadores:** `#242935` (Modo oscuro) / `#e2e8f0` (Modo claro).
- **Tipografía Primaria:** `Montserrat` (Titulares y cifras de match con fuerza ejecutiva).
- **Tipografía Secundaria:** `Open Sans` (Cuerpo de texto, requisitos y descripciones legibles).
- **Propósito:** Brindar el peso y rigor institucional de un banco o consultora de talento internacional.

#### C. 10% — Acentos de Conversión Activa (Doble Motor)

##### 1. Motor de Éxito del Candidato: Verde Menta Neón (`#4ade80` / `#10b981`)
- **Uso Exclusivo:**
  - Isotipo del Robot (`ri-robot-3-line`) y logotipo oficial.
  - Píldora de estado: `✨ Búsqueda Inteligente`.
  - Porcentaje de Afinidad Algorítmica: `94% MATCH`.
  - Botón principal de subida y análisis de CV (`☁️ Subir mi CV`).
  - Radar en vivo y estado de vacantes activas.
- **Psicología de Ventas:** Representa el "Sí", la aprobación inmediata, el crecimiento personal y la liquidez financiera. Genera un pico de dopamina en el usuario tras los rechazos sufridos en otras plataformas.

##### 2. Motor de Monetización Empresarial: Ámbar Ejecutivo (`#f59e0b` / `#d97706`)
- **Uso Exclusivo:**
  - Botón B2B de cabecera: `👑 Publicar Oferta`.
  - Insignia de Vacantes Destacadas de Pago: `👑 Empresa Verificada (Prioridad TOP)`.
  - Bordes y halos de ofertas patrocinadas (Vía B de monetización).
  - Recomendaciones de certificaciones y cursos oficiales de upskilling (Vía C).
- **Psicología de Ventas:** Activa el gatillo mental de estatus, exclusividad, retorno de inversión y prioridad comercial. La empresa siente que está adquiriendo visibilidad VIP.

---

### 3. Reglas Estrictas de Aplicación (Governance)

1. **Prohibición de Monocromía:** Nunca teñir fondos completos de verde o de ámbar. Los acentos deben permanecer restringidos al 10% del área visual para preservar su impacto dopaminérgico.
2. **Inmutabilidad del Isotipo:** El logo de JobsBOT siempre utilizará el isotipo oficial `ri-robot-3-line` en `#4ade80` con brillo suave de 8px (`drop-shadow-[0_0_8px_rgba(74,222,128,0.25)]`).
3. **Compatibilidad ATS (@media print):** En la exportación a PDF para recursos humanos, todos los fondos oscuros se transforman en blanco absoluto (`#ffffff`) y los textos en negro neutro (`#111111`), preservando legibilidad perfecta sin consumo innecesario de tinta.

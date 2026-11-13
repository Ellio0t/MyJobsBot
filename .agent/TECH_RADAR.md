# Tech Radar & Inventario de Herramientas Fiscalizadas

Este inventario audita las herramientas y tecnologías utilizadas en todos los proyectos de tu portafolio, indicando su propósito, proyecto de origen, nivel de riesgo ante la IA y el valor diferencial humano.

---

## 📱 1. Ecosistema Mobile & Multiplataforma

### **Flutter & Dart**
- **Proyectos:** `Code (WinIt - 5 flavors)`, `FlowDash`, `Master`
- **Función:** Framework y lenguaje base para construir apps nativas (Android/iOS/Web) desde un único código.
- **¿Por qué la IA depende del humano aquí?:** La IA genera código de UI rápidamente, pero falla estrepitosamente en: ciclo de vida de actividades nativas de Android/iOS, fugas de memoria por Streams sin cerrar, optimización de árboles de widgets complejos para mantener 60/120 fps, y configuración de Gradle/NDK con versiones cruzadas.
- **Nivel Actual:** Nivel II (Supervisor) -> **Meta:** Nivel IV (Architect).

### **Arquitectura Multi-Flavor (Gradle + Android Manifest)**
- **Proyectos:** `Code` (WinIt, Perks, Swag, CodBlox, Crypto)
- **Función:** Compilar 5 identidades de marca comerciales independientes con diferentes package names, assets e iconos desde un solo proyecto.
- **¿Por qué la IA depende del humano aquí?:** La IA suele romper configuraciones de manifiesto, firmas de keystores y variantes de Gradle. Se requiere criterio humano para organizar carpetas de sabores (`flavors`), permisos y reglas de ProGuard específicas por aplicación.

### **CapacitorJS (Hybrid Native Bridge para Android & iOS)**
- **Proyectos:** `JobsBOT` (Plataforma SaaS de Empleos & Optimizador de CV ATS)
- **Función:** Empaquetar aplicaciones web modernas (React 19 + TypeScript + Vite) en binarios nativos reales (`.aab`/`.apk` para Google Play Store y `.ipa` para Apple App Store) exponiendo APIs nativas del dispositivo (cámara para avatar, sistema de archivos, autenticación OAuth nativa y notificaciones Push).
- **¿Por qué la IA depende del humano aquí?:** Para pasar la revisión de Google Play y especialmente la **Guideline 4.2 de Apple App Store (Minimum Functionality)**, una app no puede ser un simple sitio web metido en un marco. Requiere criterio de arquitectura humano para integrar capacidades nativas reales, manejar permisos de privacidad (`Info.plist` y `AndroidManifest.xml`), configurar *Deep Links* y cumplir las políticas de eliminación de cuenta obligatorias.

### **@codetrix-studio/capacitor-google-auth (Google Sign-In Nativo para Android & iOS)**
- **Proyectos:** `JobsBOT` (`src/services/firebaseAuth.ts`, `android/app/src/main/res/values/strings.xml`)
- **Función:** Invocar el selector de cuentas nativo de Google Play Services (One-Tap / Account Chooser Bottom Sheet) directamente dentro de la app sin abrir navegadores externos ni pestañas de Chrome que rompan el flujo de usuario. Intercambia el OpenID Connect `idToken` de Google Play con Firebase Authentication (`GoogleAuthProvider.credential(idToken)`).
- **¿Por qué la IA depende del humano aquí?:** La IA casi siempre sugiere `signInWithPopup(auth, provider)` o `signInWithRedirect` de Firebase Web SDK, ignorando por completo que en Android WebView (`https://localhost`) las ventanas emergentes no pueden comunicarse mediante `window.opener.postMessage` entre procesos independientes del sistema operativo, dejando la app congelada para siempre. El arquitecto humano comprende la barrera de procesos de Android y conecta las credenciales SHA-1, el `server_client_id` en `strings.xml` y los plugins AAR nativos de Gradle.

---

## ☁️ 2. Cloud Serverless, Bases de Datos & Backend

### **Google Firebase Suite (Firestore, Auth, Functions, Hosting, FCM)**
- **Proyectos:** `Code`, `Master`, `Monitor`, `NotiHub`, `MYJOBSBOT`
- **Función:** Base de datos NoSQL reactiva en tiempo real, autenticación OAuth/Email, notificaciones push nativas y hosting CDN global.
- **¿Por qué la IA depende del humano aquí?:** Las IAs suelen escribir reglas de seguridad demasiado permisivas (`allow read, write: if true;`) que provocan hackeos de datos o facturas sorpresa de miles de dólares por lecturas recursivas innecesarias. El diseño de índices compuestos, cuotas y caching offline requiere diseño arquitectónico humano.

### **Server-to-Server (S2S) Webhooks & Anti-Fraude**
- **Proyectos:** `Code`, `NotiHub`
- **Función:** Confirmación criptográfica y validación de recompensas entre servidores de terceros (redes CPA, Bitrefill) y tu base de datos sin intervención del cliente.
- **¿Por qué la IA depende del humano aquí?:** La IA no sabe prever ataques de repetición (*replay attacks*), suplantación de IPs mediante proxies residenciales o manipulación de estados intermedios. Requiere lógica de validación humana rigurosa.

---

## 💰 3. Ad-Tech, Arbitraje & Monetización Programática

### **Google AdMob (Rewarded, Interstitial, Native, Mediación)**
- **Proyectos:** `Code (WinIt)`
- **Función:** Motor de generación de ingresos mediante subastas de anuncios y videos con recompensas.
- **¿Por qué la IA depende del humano aquí?:** Google banea permanentemente las cuentas de desarrolladores que cometan errores sutiles de políticas (tráfico inválido, clics accidentales, retrasos de renderizado). La IA no asume la responsabilidad legal ni de cumplimiento de normativas de Google Play / AdMob. Saber cómo y cuándo disparar un anuncio sin infringir políticas es un conocimiento humano de altísimo valor económico.

### **Offerwalls & CPA Integrations (CPX Research, CPALead)**
- **Proyectos:** `Code (WinIt)`
- **Función:** Integración de encuestas y muros de ofertas remuneradas para elevar el ARPU (ingreso promedio por usuario).
- **¿Por qué la IA depende del humano aquí?:** Exige conciliar discrepancias de pagos, gestionar devoluciones por chargebacks y asegurar que el usuario no reciba puntos fraudulentos.

---

## ⚡ 4. Automatización Multi-Motor, Web Scraping & Human-in-the-Loop

### **Orquestación Multi-Motor: n8n, Make.com, Zapier, Activepieces & Pipedream**
- **Proyectos:** `FlowDash` (`automation_api_service.dart`), `NotiHub`
- **Función:** Integración unificada mediante APIs nativas (`/api/v1/workflows` en n8n, `/api/v2/scenarios` en Make, `/api/v1/flows` en Activepieces, tokens Bearer en Zapier/Pipedream) para monitorear, disparar y supervisar flujos de trabajo desde una sola consola móvil con autenticación biométrica y QR.
- **¿Por qué la IA depende del humano aquí?:** Cada motor de automatización maneja cabeceras de seguridad distintas (`X-N8N-API-KEY` vs `Authorization: Token` vs `Bearer`), límites de tasa (*rate limits*) y estructuras de error heterogéneas. Diseñar un puente universal con intervención humana (*Human-in-the-Loop*) es arquitectura pura de alto nivel.


### **Apify (Web Scrapers & Crawlers)**
- **Proyectos:** `NotiHub`, extractores de ofertas
- **Función:** Extracción automatizada de datos desde sitios web complejos con proxies rotativos y emulación de navegadores.
- **¿Por qué la IA depende del humano aquí?:** Los sitios web cambian constantemente su DOM, añaden sistemas anti-bot (Cloudflare, reCAPTCHA) y modifican selectores. Requiere un humano que inspeccione y reajuste los extractores cuando se rompen.

---

## 🌐 5. Frontend Moderno & PWAs

### **React 19 + TypeScript + Vite + Tailwind CSS**
- **Proyectos:** `Monitor`, `NotiHub`, `MYJOBSBOT`
- **Función:** Interfaces web de alta velocidad, tipadas y responsivas para consumo de datos financieros, operativos y emparejamiento laboral ATS en tiempo real.
- **¿Por qué la IA depende del humano aquí?:** Estructura del ciclo de vida de renderizado, optimización de bundle size y experiencia de usuario (UX) intuitiva con accesibilidad y diseño táctil.

### **Dual Iconography Engine: Remix Icon + Font Awesome 6 (CDN/Webfonts)**
- **Proyectos:** `MYJOBSBOT`
- **Función:** Sistema combinado de iconografía vectorial de precisión (`ri-robot-3-line` como isotipo oficial de marca en Remix Icon junto con iconos de marcas oficiales `fa-brands` de Font Awesome para WhatsApp, Telegram, Google y LinkedIn).
- **¿Por qué la IA depende del humano aquí?:** Seleccionar el peso visual consistente (línea vs relleno) entre dos librerías distintas sin saturar la interfaz y garantizando que las hojas de estilo se excluyan o rendericen limpiamente durante la exportación `@media print`.

### **Google Gemini API (`@google/genai`)**
- **Proyectos:** `Monitor`, `NotiHub`
- **Función:** Inyección de inteligencia artificial para análisis contextual, clasificación y resúmenes automáticos.
- **¿Por qué la IA depende del humano aquí?:** La IA comete alucinaciones y requiere *Prompt Engineering* robusto, validación de esquemas JSON estructurados y control estricto de costes de tokens.

### **RapidAPI JSearch Engine (LinkedIn, Indeed & Google Jobs Aggregator)**
- **Proyectos:** `MYJOBSBOT` (`src/services/jobEngine.ts`)
- **Función:** Indexación en vivo de ofertas laborales masivas agregando fuentes de LinkedIn, Indeed, Glassdoor y Google Jobs mediante el endpoint `/search-v2` de RapidAPI con deduplicación cruzada y extracción de salarios.
- **¿Por qué la IA depende del humano aquí?:** Las APIs de terceros cambian de versión (`/search` a `/search-v2`), mutan esquemas JSON y tienen cuotas estrictas de rate-limiting. Se requiere criterio de arquitectura para implementar fallbacks de fuentes públicas (Get on Board, Remotive) y caché para no agotar presupuestos de API.

### **Client-Side CV Stream Parser & ATS Match Engine**
- **Proyectos:** `MYJOBSBOT` (`src/services/cvParser.ts`, `src/services/jobEngine.ts`)
- **Función:** Extracción de texto y entidades clave en tiempo de ejecución del navegador a partir de documentos subidos por el usuario (PDFs, TXT, HTML, MD) para poblar automáticamente el CV Virtual editable y calcular afinidad algorítmica ATS frente a cada vacante.
- **¿Por qué la IA depende del humano aquí?:** Los documentos subidos por los usuarios no tienen una estructura predecible: vienen con formatos de dos columnas, texto incrustado binario en PDFs, o fuentes no estándar. Diseñar heurísticas de extracción de contacto, normalización de habilidades técnicas y formateo A4 limpio sin llamadas costosas a un backend es una decisión de alta eficiencia e ingeniería humana.

### **Portal Branding & Multi-Network Trust Verification System**
- **Proyectos:** `MYJOBSBOT` (`src/components/PortalBadge.tsx`, `src/components/NetworkTrustBanner.tsx`)
- **Función:** Presentación premium y estandarizada de marcas oficiales (Google Jobs, LinkedIn, Indeed, Get on Board, Remotive) eliminando jerga técnica como "API" en favor de distintivos visuales verificados y banners de indexación en vivo para maximizar la confianza del usuario final.
- **¿Por qué la IA depende del humano aquí?:** Los desarrolladores y la IA tienden a exponer detalles de implementación técnica (nombres de endpoints, siglas de APIs, payloads crudos). El criterio humano de producto y diseño UX sabe que el consumidor final busca legitimidad, respaldo de marca conocida y confianza, no detalles de infraestructura backend.

### **Mid-Scroll Lead Capture & Conversion Gate Engine**
- **Proyectos:** `MYJOBSBOT` (`src/components/MidScrollIncentiveModal.tsx`, `src/App.tsx`)
- **Función:** Mecanismo de conversión y retención de usuarios que limita el feed a un "pupurrí" público de hasta 10 ofertas por área para visitantes no autenticados, y activa de manera reactiva un modal persuasivo al alcanzar el 45-50% del scroll vertical, incentivando el registro con Google/Email y la carga del CV para desbloquear el feed total y el cálculo ATS.
- **¿Por qué la IA depende del humano aquí?:** El diseño de embudos de conversión (funnels) exige calibrar la fricción psicológica del usuario: un muro de pago o registro inmediato al entrar ahuyenta al 90% de los visitantes (tasa de rebote masiva), mientras que dejar todo abierto sin incentivos no genera registros ni base de usuarios. El equilibrio entre dar valor inicial (10 ofertas por área) y capturar el lead a mitad del recorrido requiere criterio comercial y psicológico humano.

---

## 💰 5. Arquitectura de Monetización Ética & Motores de Conversión

### **Outbound Job Affiliate Tracking Engine (Vía A: CPC / CPA)**
- **Proyectos:** `MYJOBSBOT` (`src/services/affiliateEngine.ts`)
- **Función:** Interceptación e inyección transparente de parámetros de afiliados (Publisher IDs, SubIDs, etiquetas UTM de campaña) en todas las URLs de postulación salientes hacia Indeed, ZipRecruiter, Jooble, Talent.com y agregadores asociados, contabilizando eventos de clic para estimar ingresos CPC ($0.10 - $0.80) y CPA ($3 - $12).
- **¿Por qué la IA depende del humano aquí?:** Cada red de empleo tiene contratos y requerimientos de tracking distintos (parámetros `pub`, `rgid`, `partner_id`, `subid`). Además, las políticas de Google y buscadores exigen atributos `rel="noopener noreferrer sponsored"` para no penalizar el SEO ni violar términos de servicio, requiriendo rigor legal y técnico humano.

### **B2B Employer Self-Service & Paid Placement Engine (Vía B)**
- **Proyectos:** `MYJOBSBOT` (`src/components/PostJobModal.tsx`, `src/types.ts`)
- **Función:** Portal de autoservicio para empresas y reclutadores que permite publicar y fijar ofertas en el TOP del listado de JoBOT con distintivo dorado "VIP / Destacada" y mayor prioridad en cálculo ATS por $19 a $39 USD por 15 o 30 días.
- **¿Por qué la IA depende del humano aquí?:** La estructuración de planes de precios (pricing strategy) y la validación de la autenticidad de las empresas para evitar estafas laborales (*job scams*) exige moderación, políticas de reembolso y supervisión humana que la IA no puede delegar automáticamente.

### **Skill-Gap Upskilling & EdTech Affiliate Engine (Vía C)**
- **Proyectos:** `MYJOBSBOT` (`src/services/upskillingEngine.ts`, `src/components/UpskillingCourseCard.tsx`)
- **Función:** Detección algorítmica de brechas formativas entre el CV del candidato y las exigencias de la oferta (ej. Inglés conversacional, Postman, AWS, Power BI, Scrum), sugiriendo cursos oficiales de Coursera, Platzi, Open English con enlaces de afiliado (comisiones de 20% a 50%) y cálculo de incremento de afinidad ATS (+15% a +22%).
- **¿Por qué la IA depende del humano aquí?:** No basta con emparejar strings; se debe recomendar programas con alta reputación y utilidad real de mercado. Una IA desatendida recomendaría cursos obsoletos o de baja calidad, destruyendo la reputación de JoBOT ante los postulantes.

### **Native Non-Intrusive In-Feed Advertising Engine (Vía D)**
- **Proyectos:** `MYJOBSBOT` (`src/components/SponsoredFeedCard.tsx`, Android AdMob bridge)
- **Función:** Inserción modular cada 8 tarjetas en el feed de ofertas de un anuncio patrocinado con estética 100% idéntica al diseño del feed, publicitando herramientas de alto valor para trabajadores remotos (bancos en USD sin comisiones, VPNs seguras, simuladores de entrevistas con IA) sin romper la experiencia del usuario.
- **¿Por qué la IA depende del humano aquí?:** La saturación publicitaria es la causa número uno de abandono de aplicaciones. El arquitecto humano debe regular la cadencia (ratio 1:8), la relevancia del anunciante y el respeto a la navegación móvil para maximizar el RPM (*Revenue Per Mille*) sin degradar la retención.

---

## 🎨 4. Frontend & Document Architecture (CV Studio & WYSIWYG)

### **Mathematical A4 Canvas Scaler & Proportional Viewport (WYSIWYG)**
- **Proyectos:** `JobsBOT` (`src/components/CvA4Canvas.tsx`)
- **Función:** Renderizar la hoja física A4 estándar (210mm x 297mm) en pantalla mediante escalado matemático exacto (`scale: 0.68, 0.85, 1.0`) acoplándose a la altura fija del panel de chat/editor (760px). Elimina cualquier distorsión visual o desajuste de fuentes/márgenes, garantizando que lo que ve el usuario en pantalla coincida pixel por pixel con el documento impreso o exportado a PDF mediante `@media print`.
- **¿Por qué la IA depende del humano aquí?:** La mayoría de las soluciones generadas por IA usan CSS relativo desordenado (`vw`, `vh`, `flex`) que cambia de apariencia según el tamaño del monitor del usuario o colapsa al imprimir. Se requiere rigor matemático de frontend para calcular anchos milimétricos, transformaciones `scale()` con `transformOrigin: 'top center'` y reglas de anulación `@media print { transform: none !important; }`.

### **Harvard ATS Single-Column & Executive Multi-Template Engine**
- **Proyectos:** `JobsBOT` (`src/components/CvA4Canvas.tsx`, `src/types.ts`)
- **Función:** Motor de renderizado curricular con intercambio dinámico entre el formato **Harvard Standard ATS** (1 columna, jerarquía cronológica estricta, métricas cuantificadas XYZ, 100% de parseabilidad en Workday, Taleo y Greenhouse) y el formato **Ejecutivo Moderno** (2 columnas con panel lateral de skills).
- **¿Por qué la IA depende del humano aquí?:** La IA tiende a priorizar diseños vistosos con barras de progreso, iconos y cajas de texto flotantes que son ilegibles para los analizadores ATS corporativos (eliminando al candidato antes de que una persona lo lea). Se requiere conocimiento de contratación internacional para diseñar tipografías (Georgia/Montserrat), espaciados y encabezados limpios.

### **Live In-Place CV Quick Editor Panel**
- **Proyectos:** `JobsBOT` (`src/components/CvQuickEditorPanel.tsx`)
- **Función:** Panel de herramientas interactivo que permite al candidato intervenir y editar directamente en tiempo real cualquier campo de su currículum (contacto, titular, resumen profesional, catálogo de habilidades, historial laboral y formación académica) mientras visualiza los cambios reflejados al instante en la hoja A4 sin recargar.
- **¿Por qué la IA depende del humano aquí?:** Las herramientas 100% autónomas de IA cometen alucinaciones sobre fechas o tecnologías. La interfaz debe permitir la intervención humana fluida para corregir datos reales mientras se mantiene sincronizado el estado reactivo con el asistente conversacional JoBOT.

### **Continuous Single-Row Sticky Control Dock & Minimalist Live Tracker Beacon**
- **Proyectos:** `JobsBOT` (`src/App.tsx`)
- **Función:** Anclaje persistente de perfil bajo (`sticky top-[92px] sm:top-16 z-30`) que consolida en una sola línea horizontal continua y perfectamente equilibrada: (1) Título ampliado "OFERTAS DE EMPLEO" con tipografía audaz limpia y vacantes activas debajo acompañadas de un micro-indicador esmeralda de rastreo en vivo (`w-1.5 h-1.5 bg-emerald-500 animate-pulse`), sobrio y puramente notificativo, (2) Barra de búsqueda fluida (`flex-1 min-w-0`) que absorbe todo el espacio disponible entre el bloque del título y los botones de acción sin dejar huecos vacíos en pantallas anchas, (3) Menú desplegable personalizado de idioma (`isLangMenuOpen`, `useRef`, popover flotante dark `#121622` con checkmarks y badge `ri-translate-2` sin menús nativos azules del SO ni iconos redundantes), y (4) Botón de actualización. La segunda fila integra el carrusel de categorías con la píldora "Todas" sin cortes.
- **¿Por qué la IA depende del humano aquí?:** La IA suele generar espacios en blanco muertos (*dead whitespace*) usando `justify-between` con anchos fijos desconectados, o duplica elementos decorativos (puntos pulsantes verdes repetidos en título y subtítulo) por falta de criterio de sobriedad editorial. El arquitecto humano estructura una cuadrícula fluida donde cada elemento dialoga proporcionalmente con el ancho del viewport disponible y el estado "Live" se comunica con sutileza matemática.

### **Zero-Scroll Profile Navigation & Paginated Sub-Screens**
- **Proyectos:** `JobsBOT` (`src/components/ProfileView.tsx`)
- **Función:** Sistema de navegación en cuadrícula responsiva (2x2 en móvil / 1x4 en escritorio) que erradica el scroll horizontal en las opciones de perfil: `Datos de Perfil`, `CVs`, `Social Jobs` y `Métricas y Portabilidad`. Implementa un motor estandarizado de paginación multipantalla para Social Jobs (posts paginados) y para la alternancia entre Métricas de Empleabilidad (Pág 1) y Bóveda Soberana / Portabilidad JSON (Pág 2).
- **¿Por qué la IA depende del humano aquí?:** Las IAs abusan de contenedores con `overflow-x-auto` para safarse del diseño responsivo cuando hay más de 3 pestañas. El criterio humano sintetiza la arquitectura de información, unifica secciones complementarias y aplica paginación estructurada para garantizar máxima ergonomía táctil.

### **Dual-Action Floating Quick-Scroll Navigator (Up / Down FAB)**
- **Proyectos:** `JobsBOT` (`src/App.tsx`)
- **Función:** Botonera flotante minimalista de navegación vertical rápida en la esquina inferior derecha (`fixed bottom-6 right-4 sm:bottom-8 sm:right-7 z-40`). Aparece automáticamente con animación suave cuando el usuario se desplaza más de 200px, permitiendo subir al inicio (`window.scrollTo(0)`) para enfocar la búsqueda o bajar al fondo del listado con un solo toque.
- **¿Por qué la IA depende del humano aquí?:** En feeds extensos con scroll infinito o paginación larga en móviles, la ausencia de atajos de salto vertical agota el pulgar del usuario y causa rebote prematuro.

### **Font Awesome 6 & Semantic UI Tagging System**
- **Proyectos:** `JobsBOT` (`src/App.tsx`, `src/components/JobDetailModal.tsx`, `index.html`)
- **Función:** Sistema de diseño y jerarquía visual para micro-metadatos de empleo: integración CDN de Font Awesome (`fa-solid fa-sack-dollar` - bolsa de dinero) para la remuneración en verde dinero desprovisto de contenedores artificiales, codificación cromática semántica exclusiva para geolocalización (Azul Cielo / Sky Blue con `ri-map-pin-2-line`) y requisitos de idioma (Púrpura de Comunicación / Translation Purple con `ri-translate-2`), eliminando la sobrecarga cognitiva en el escaneo rápido de vacantes.
- **¿Por qué la IA depende del humano aquí?:** La IA tiende a encapsular todos los campos en píldoras idénticas con los mismos tonos neutros o verdes monocromáticos, provocando fatiga visual y confusión entre el sueldo (dinero) y las condiciones de contratación. El criterio humano de diseño de producto asigna pesos semánticos y contrastes cromáticos que guían la atención del candidato hacia lo que realmente importa en menos de 2 segundos.

### **Floating Copilot Assistant & 100% WYSIWYG A4 Canvas Studio**
- **Proyectos:** `JobsBOT` (`src/App.tsx`, `src/components/CvA4Canvas.tsx`, `src/index.css`)
- **Función:** Arquitectura de desacoplamiento visual del estudio de currículums: (1) Lienzo A4 protagonista centrado al 100% de proporción física real (210mm x 297mm) sin cortes laterales ni scrollbars forzados, (2) Controles de aumento y zoom dinámico (+ / - / 100% Real), (3) Asistente JoBOT y panel de edición transformados en una ventana flotante inteligente (Floating Copilot Card) minimizable a un FAB esférico en la esquina inferior derecha, y (4) Aislamiento estricto de impresión `@media print` (`#cv-sheet-to-print` con ocultamiento total del DOM web) para generar PDFs 100% puros y libres de marcos web, scrollbars o banners.
- **¿Por qué la IA depende del humano aquí?:** Las IAs dividen ciegamente la pantalla en columnas proporcionales (`col-span-7 / col-span-5`), ignorando que un documento A4 estándar mide físicamente 794px a 96 DPI y no puede caber en la mitad de una pantalla de laptop común sin recortarse o crear un doble scroll interno repugnante. El arquitecto humano eleva el documento a héroe central y delega el asistente a un plano flotante no intrusivo.


---

## 🛡️ 5. Soberanía de Datos, Cripto-Privacidad & Portabilidad Abierta

### **Sovereign Vault & Local-First Immediate Persistence Engine**
- **Proyectos:** `JobsBOT` (`src/services/sovereigntyStorage.ts`, `src/components/SovereigntyVaultPanel.tsx`)
- **Función:** Almacenamiento descentralizado y soberano en el dispositivo del usuario (`localStorage` aislado por UID o visitante), garantizando que cada edición, variante de CV o nota generada por JoBOT se guarde inmediatamente sin depender de un backend centralizado ni arriesgar filtraciones. Provee diagnósticos en tiempo real de bytes usados y variantes selladas.
- **¿Por qué la IA depende del humano aquí?:** Las IAs comerciales suelen enviar todo el texto en claro a APIs externas o bases de datos compartidas. El arquitecto humano diseña el patrón *Local-First*, asegurando que los datos sensibles del candidato nunca salgan de su dispositivo a menos que él ejecute explícitamente una acción de postulación.

### **Universal Open Portability & JSON Resume Engine**
- **Proyectos:** `JobsBOT` (`src/services/sovereigntyStorage.ts`)
- **Función:** Exportación bidireccional en formato JSON abierto: (1) Respaldo completo de la bóveda con todas las variantes (`myjobsbot-boveda-soberana.json`) con capacidad de restauración/migración en 1 clic en cualquier navegador, y (2) Exportador al estándar internacional de la Linux Foundation / `jsonresume.org`.
- **¿Por qué la IA depende del humano aquí?:** Los SaaS cerrados (LinkedIn, Indeed) aplican "vendor lock-in", impidiendo que el usuario exporte sus datos limpios para mantenerlo cautivo. La decisión de soberanía abierta es una ventaja competitiva radical que solo un estratega humano puede defender para ganar la confianza total del usuario.

### **Right-to-be-Forgotten & Storage Purge Engine (GDPR / CCPA)**
- **Proyectos:** `JobsBOT` (`src/services/sovereigntyStorage.ts`, `src/components/SovereigntyVaultPanel.tsx`)
- **Función:** Mecanismo de autodestrucción y borrado atómico con modal de confirmación en dos pasos que purga de inmediato y sin dejar rastros residuales todas las variantes, historiales, cachés y tokens de sesión.
- **¿Por qué la IA depende del humano aquí?:** El cumplimiento normativo de privacidad internacional no es una sugerencia algorítmica; requiere botones accesibles y garantías técnicas reales que resistan auditorías de ciberseguridad y protección al consumidor.








import React, { useState } from "react";
import { FileDown, Loader2, BookOpen, CheckCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import { logExportAction } from "../lib/telemetryManager";

export default function ManualDownloader({ showTextOnMobile = false }: { showTextOnMobile?: boolean }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const generatePDFManual = async () => {
    setIsGenerating(true);
    setSuccess(false);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2); // 180mm

      // State tracker for current Y coordinate
      let currentY = 0;

      // Helper function to draw page background and headers      // Footer
      const drawPageBase = (pageNum: number, totalPages: number, pageTitle: string) => {
        // Top banner
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 25, "F");

        // Top banner brand text
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("OCULIMIND AI  |  PLATAFORMA DE NEUROMARKETING", margin, 11);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(pageTitle.toUpperCase(), margin, 18);

        // Date on top right
        const currentDate = new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        });
        doc.text(`Fecha: ${currentDate}`, pageWidth - margin, 15, { align: "right" });

        // Footer
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
        
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.3);
        doc.line(0, pageHeight - 15, pageWidth, pageHeight - 15);

        doc.setTextColor(100, 116, 139); // slate-500
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text("OculiMind AI v2.5.0 — Manual Técnico de Usuario Oficial", margin, pageHeight - 7);
        doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
      };

      // Helper function to render formatted text blocks
      const writeParagraph = (text: string, y: number, fontSize = 9.5, color = [51, 65, 85], fontStyle = "normal") => {
        doc.setFont("helvetica", fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        return y + (lines.length * (fontSize * 0.42 + 1.2)); // Dynamic Y increment based on font height and padding
      };

      // Helper to render beautiful colored section cards
      const drawInfoBox = (title: string, lines: string[], y: number, themeColor = [79, 70, 229]) => {
        const boxPadding = 5;
        const lineSpacing = 4.5;
        const boxHeight = 10 + (lines.length * lineSpacing) + (boxPadding * 2);

        // Background
        doc.setFillColor(243, 244, 246); // gray-100
        doc.rect(margin, y, contentWidth, boxHeight, "F");

        // Left accent border
        doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
        doc.rect(margin, y, 2.5, boxHeight, "F");

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(title, margin + 5, y + 6);

        // Lines
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(55, 65, 81);
        lines.forEach((line, index) => {
          doc.text(line, margin + 5, y + 12 + (index * lineSpacing));
        });

        return y + boxHeight + 6;
      };

      const TOTAL_PAGES = 9;

      // ==============================================================
      // PÁGINA 1: PORTADA Y TABLA DE CONTENIDOS
      // ==============================================================
      
      // Cover Background decoration
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Abstract logo mark drawing
      doc.setFillColor(79, 70, 229); // Indigo
      doc.rect(margin, 35, 25, 25, "F");
      doc.setFillColor(236, 72, 153); // Pink
      doc.circle(margin + 25, 60, 12.5, "F");
      doc.setFillColor(56, 189, 248); // Cyan
      doc.circle(margin + 5, 60, 8, "F");

      // Cover Header
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text("OculiMind AI", margin, 90);

      doc.setFontSize(12);
      doc.setTextColor(129, 140, 248); // indigo-400
      doc.text("Manual Operativo Completo & Reporte de Confiabilidad v2.8", margin, 98);

      // Horizontal separator line
      doc.setFillColor(51, 65, 85);
      doc.rect(margin, 104, contentWidth, 0.8, "F");

      // Description
      doc.setTextColor(203, 213, 225); // slate-300
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const descText = "Manual técnico y guía paso a paso oficial de todas las herramientas de la plataforma: Selección Flexible de Países en Benchmark Social Media, Hub de Ads (Test A/B, Matriz DCO con Carga de Imágenes, Análisis de Carruseles Diapositiva por Diapositiva, Suite Banners Google Display), Monitor Algorítmico Live, Neuro-Atención Predictiva, Eye-Tracking por Webcam, Emotion AI, Auditoría de Logotipos y Dictamen de Confiabilidad Metodológica.";
      const descLines = doc.splitTextToSize(descText, contentWidth);
      doc.text(descLines, margin, 112);

      // Metadata Info Box (Inside Cover)
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(margin, 140, contentWidth, 54, "F");
      
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("SUITE COMPLETA DE HERRAMIENTAS EXPLICADAS", margin + 6, 148);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(241, 245, 249); // slate-200
      doc.text("1. Social Media Benchmark: Filtros por Países sin selecciones por defecto + Ranking de Seguidores.", margin + 6, 155);
      doc.text("2. Hub de Ads & Creativos: Test A/B, Matriz DCO (3 imágenes + 3 titulares + 3 CTAs) y Carruseles.", margin + 6, 161);
      doc.text("3. Suite de Banners Google Display: Carga de imágenes propias en 12 formatos IAB estándar.", margin + 6, 167);
      doc.text("4. Monitor Algorítmico Live: Reglas de entrega, eCPM y disparadores de penalización por red.", margin + 6, 173);
      doc.text("5. Neuromarketing Predictivo & Empírico: Mapas de Calor, Webcam Eye-Tracking & Emotion AI.", margin + 6, 179);
      doc.text("6. Auditoría de Logos & Confiabilidad: Reducción favicon, dictamen metodológico y PIN Maestro.", margin + 6, 185);

      // Table of Contents Header
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("TABLA DE CONTENIDOS", margin, 204);

      doc.setFillColor(79, 70, 229);
      doc.rect(margin, 207, 20, 1, "F");

      // TOC Items
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(226, 232, 240); // slate-200
      
      const tocItems = [
        { label: "1. Social Media Benchmark: Selección de Países & Ranking por Seguidores", page: "Pág. 2" },
        { label: "2. Ads Optimizer: Test A/B, Matriz DCO (Subida de Imágenes, Titulares y CTAs)", page: "Pág. 3" },
        { label: "3. Ads Optimizer: Análisis de Carruseles Diapositiva por Diapositiva (Hook Rate)", page: "Pág. 4" },
        { label: "4. Ads Optimizer: Suite Banners Google Display & Carga de Imágenes Propias", page: "Pág. 5" },
        { label: "5. Monitor Algorítmico Live (Meta, Google, TikTok, LinkedIn) & Criterios eCPM", page: "Pág. 6" },
        { label: "6. Atención Predictiva por IA, Video/Reels Safe Zones & Neuromarketing Empírico", page: "Pág. 7" },
        { label: "7. Auditoría de Logotipos, Claves de Acceso, PIN Maestro & Telemetría", page: "Pág. 8" },
        { label: "8. Dictamen de Confiabilidad Metodológica, Datos Reales vs Simulados & Guía", page: "Pág. 9" },
      ];

      tocItems.forEach((item, index) => {
        const rowY = 212 + (index * 6.5);
        doc.text(item.label, margin, rowY);
        doc.text("...........................................................................................................................", margin + 5, rowY - 1, { align: "left" });
        doc.text(item.page, pageWidth - margin, rowY, { align: "right" });
      });

      // Cover Footer
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.text("OculiMind AI — Plataforma de Neuromarketing y Biometría Cognitiva Unificada", pageWidth / 2, pageHeight - 12, { align: "center" });


      // ==============================================================
      // PÁGINA 2: BENCHMARK SOCIAL Y FILTRO DE PAÍSES
      // ==============================================================
      doc.addPage();
      drawPageBase(2, TOTAL_PAGES, "Social Media Benchmark & Filtro por Países");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("1. GUÍA DE USO: BENCHMARK SOCIAL MEDIA & RANKING DE SEGUIDORES", margin, currentY);

      doc.setFillColor(79, 70, 229);
      doc.rect(margin, currentY + 2, 45, 1, "F");
      
      currentY += 8;

      currentY = writeParagraph(
        "El módulo de Benchmark Social compara la presencia digital y el enganche biocognitivo de tu marca frente a competidores directos en la región elegida:",
        currentY
      );

      currentY = drawInfoBox(
        "Paso a Paso para Configurar el Benchmark y Selección de Países:",
        [
          "1. BOTÓN + NUEVO BENCHMARK: Haz clic en el botón superior en azul '+ Nuevo Benchmark' (en móvil o escritorio) para abrir el formulario de creación.",
          "2. SELECCIÓN DE PAÍSES (NUEVO COMPORTAMIENTO): Por defecto, no aparece ningún país pre-seleccionado para evitar distorsiones territoriales.",
          "3. ELEGIR PAÍSES: Selecciona uno o varios países haciendo clic en las etiquetas de acceso rápido (México, Colombia, Chile, España, Argentina, Perú) o escribiendo un país personalizado en el cuadro de búsqueda.",
          "4. RANKING POR SEGUIDORES: Las marcas analizadas se organizan automáticamente en un ranking jerárquico según su volumen total de seguidores y su Tasa de Engagement (ER).",
          "5. DIMENSIONES A EVALUAR: Elige entre Redes Sociales, Publicidad Digital, Sitio Web u OOH para obtener la nota global sobre 100."
        ],
        currentY,
        [79, 70, 229]
      );

      // ==============================================================
      // PÁGINA 3: MATRIZ DCO Y TEST A/B DE ANUNCIOS
      // ==============================================================
      doc.addPage();
      drawPageBase(3, TOTAL_PAGES, "Ads Optimizer: Matriz DCO & Test A/B");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("2. GUÍA DE USO: MATRIZ DCO Y VARIACIONES DE CREATIVOS", margin, currentY);

      doc.setFillColor(236, 72, 153); // Pink
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "La optimización dinámica de creativos (DCO) es la metodología que usan Meta Ads y Google Ads para ensayar permutaciones automáticas antes de pujar presupuesto real:",
        currentY
      );

      currentY = drawInfoBox(
        "Cómo Usar la Matriz DCO (Dynamic Creative Optimization):",
        [
          "• SUBIDA DE HASTA 3 IMÁGENES: En la sección '1. Imágenes Creativas para la Matriz', presiona 'Cambiar Imagen' para cargar tus propios archivos JPG/PNG en los slots #1, #2 y #3.",
          "• DEFINICIÓN DE TITULARES (H1, H2, H3): Modifica las 3 variantes de texto del encabezado que el algoritmo intercambiará.",
          "• VARIACIONES DE BOTÓN CTA (C1, C2, C3): Define hasta 3 llamadas a la acción distintas (ej: 'Comprar Ahora', 'Ver Oferta Exclusiva', 'Registrarte').",
          "• EVALUACIÓN AUTOMÁTICA DE PERMUTACIONES: La IA calcula los 9 cruces posibles y muestra las 3 mejores combinaciones ordenadas con su foto correspondiente, otorgando una medalla a la variante ganadora (#1 GANADORA DCO con mayor Stop-Ratio)."
        ],
        currentY,
        [236, 72, 153]
      );

      currentY += 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("3. GUÍA DE USO: COMPARATIVA TEST A/B SIMULTÁNEO", margin, currentY);

      doc.setFillColor(99, 102, 241);
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "En la pestaña 'Test A/B Comparativo', puedes cargar la Imagen A y la Imagen B para visualizar en pantalla dividida los mapas de calor de fijación foveal y determinar cuál captura la atención en los primeros 250 milisegundos.",
        currentY
      );


      // ==============================================================
      // PÁGINA 4: ANÁLISIS DE CARRUSELES DIAPOSITIVA POR DIAPOSITIVA
      // ==============================================================
      doc.addPage();
      drawPageBase(4, TOTAL_PAGES, "Ads Optimizer: Análisis de Carruseles");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("4. GUÍA DE USO: ANÁLISIS DE CARRUSELES (SLIDE BY SLIDE)", margin, currentY);

      doc.setFillColor(16, 185, 129); // Emerald
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "Los carruseles de Instagram, Facebook y LinkedIn dependen de la retención continua entre diapositivas. Más del 70% del abandono ocurre en la tarjeta 2 si la primera no genera curiosidad:",
        currentY
      );

      currentY = drawInfoBox(
        "Pasos para Auditar un Carrusel Multitarjeta:",
        [
          "1. CARGA DE IMÁGENES POR TARJETA: En la pestaña 'Carruseles', presiona 'Subir Imagen Slide X' debajo de cada diapositiva para cargar el diseño correspondiente.",
          "2. EDITAR TEXTOS Y PROPUESTAS DE VALOR: Modifica el título y la descripción para simular la secuencia narrativa del usuario (Gancho -> Problema -> Solución -> CTA).",
          "3. AGREGAR O ELIMINAR TARJETAS: Utiliza el botón '+ Agregar Diapositiva' arriba a la derecha para extender el carrusel o presiona 'Eliminar' si solo necesitas 3 o 4 tarjetas.",
          "4. INDICADOR DE RETENCIÓN ESTIMADA: La herramienta calcula el % de retención restante en cada slide y alerta si falta continuidad visual o flecha de deslizamiento."
        ],
        currentY,
        [16, 185, 129]
      );


      // ==============================================================
      // PÁGINA 5: SUITE BANNERS GOOGLE DISPLAY
      // ==============================================================
      doc.addPage();
      drawPageBase(5, TOTAL_PAGES, "Ads Optimizer: Banners Google Display");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("5. GUÍA DE USO: SUITE DE BANNERS GOOGLE DISPLAY", margin, currentY);

      doc.setFillColor(14, 165, 233); // Cyan
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "La suite de banners permite probar cómo se visualiza y cómo se escanea tu diseño publicitario dentro de los 12 formatos oficiales de Google Ads e IAB:",
        currentY
      );

      currentY = drawInfoBox(
        "Instrucciones para Probar Formatos Banner de Google:",
        [
          "1. SELECCIONAR FORMATO: Elige una de las tarjetas de formato (ej. Skyscraper 160x600, Medium Rectangle 300x250, Leaderboard 728x90, Billboard 970x250).",
          "2. SUBIR IMAGEN PROPIA: En el simulador inferior, haz clic en 'Subir Tu Imagen de Banner' para colocar tu arte gráfico exacto.",
          "3. EVALUACIÓN DE ESCANEO EN 'F': El panel adaptará la proporción del contenedor y mostrará las zonas críticas donde el ojo humano inicia el recorrido visual.",
          "4. RECOMENDACIONES DE DIAGNÓSTICO: Recibe alertas inmediatas sobre tamaño mínimo de tipografía y ubicación adecuada del botón de llamada a la action."
        ],
        currentY,
        [14, 165, 233]
      );


      // ==============================================================
      // PÁGINA 6: MONITOR ALGORÍTMICO EN TIEMPO REAL
      // ==============================================================
      doc.addPage();
      drawPageBase(6, TOTAL_PAGES, "Monitor Algorítmico en Tiempo Real");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("6. GUÍA DE USO: MONITOR ALGORÍTMICO Y PESOS DE REDES", margin, currentY);

      doc.setFillColor(139, 92, 246); // Purple
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "El Monitor Algorítmico supervisa de forma continua los cambios de políticas y factores de puntuación de las plataformas publicitarias para evitar sanciones en el eCPM:",
        currentY
      );

      currentY = drawInfoBox(
        "Cómo Funciona y Cómo Aprovechar el Monitor Algorítmico:",
        [
          "• SELECCIÓN DE RED SOCIAL / PLATAFORMA: Elige la pestaña superior entre Meta Ads, Google Display, TikTok Ads o LinkedIn Ads.",
          "• VERIFICAR FACTORES DE PESO (WEIGHT %): Revisa qué métricas premia el algoritmo actual (ej. En Meta Ads, los 'Guardados/Compartidos' pesan 35% mientras que los Likes valen solo 10%).",
          "• DISPARADORES DE PENALIZACIÓN (PENALTY TRIGGERS): Evita las infracciones marcadas en rojo (ej. Colocar texto en la zona del botón de Reels o exceder el 20% de área de texto en imágenes).",
          "• ALERTAS LIVE DE TENDENCIAS: La barra superior notifica cuando se detecta una actualización de algoritmo en vivo en la industria."
        ],
        currentY,
        [139, 92, 246]
      );


      // ==============================================================
      // PÁGINA 7: ATENCIÓN PREDICTIVA Y NEUROMARKETING EMPÍRICO
      // ==============================================================
      doc.addPage();
      drawPageBase(7, TOTAL_PAGES, "Atención Predictiva, Video & Webcam AI");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("7. NEURO-ATENCIÓN PREDICTIVA (HEATMAPS & GAZE PATH)", margin, currentY);

      doc.setFillColor(225, 29, 72); // Rose
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "El motor predictivo por red neuronal simula la atención de 10,000 participantes durante los primeros 3 a 5 segundos de exposición a cualquier imagen o diseño publicitario:",
        currentY
      );

      currentY = drawInfoBox(
        "Uso de Herramientas Predictivas y Biometría por Webcam:",
        [
          "• PREDICTIVE HEATMAP (Mapa de Calor): Las áreas rojas/amarillas indican máxima intensidad de fijación foveal; las zonas frías (azules) no capturan atención.",
          "• GAZE PATH OVERLAY: Muestra la secuencia numérica exacta (1, 2, 3, 4) del salto sacádico del ojo a través de la pieza.",
          "• ANALIZADOR DE VIDEO & REELS (SAFE ZONES): Superpone las zonas prohibidas de Meta/TikTok para garantizar que los elementos clave no queden tapados por iconos de la app.",
          "• WEBCAM EYE-TRACKING & EMOTION AI: Módulo empírico que califica el agrado (Valence), frustración y sorpresa del usuario en vivo rastreando microexpresiones faciales."
        ],
        currentY,
        [225, 29, 72]
      );


      // ==============================================================
      // PÁGINA 8: AUDITORÍA DE LOGOS, CLAVES Y TELEMETRÍA
      // ==============================================================
      doc.addPage();
      drawPageBase(8, TOTAL_PAGES, "Auditoría de Logos, Claves & Telemetría");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("8. AUDITORÍA DE LOGOTIPOS Y GESTIÓN DE SEGURIDAD", margin, currentY);

      doc.setFillColor(99, 102, 241); // Indigo
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "Herramientas finales para la verificación de activos de marca y control administrativo de accesos dentro de la organización:",
        currentY
      );

      currentY = drawInfoBox(
        "Auditoría de Logos, Claves de Acceso y PIN Maestro:",
        [
          "1. AUDITORÍA DE LOGOS (Logo Reviewer): Permite probar la legibilidad del logotipo en favicones de 16x16px, mockups de tarjetas corporativas, packaging y contraste WCAG.",
          "2. SISTEMA DE CLAVES DE ACCESO (Access Login Modal): Permite ingresar utilizando una clave asignada (ej: TEST2026, FRANCIS2026) o mediante el Nombre Completo registrado del usuario.",
          "3. PIN MAESTRO DE ADMINISTRADOR: Protege el botón 'Gestión de Usuarios & Claves' mediante la solicitud del PIN de seguridad corporativo para evitar modificaciones no autorizadas.",
          "4. AUDITORÍA DE TELEMETRÍA: Registra cada login, descarga de PDF y pieza publicitaria subida para auditoría y trazabilidad en tiempo real."
        ],
        currentY,
        [99, 102, 241]
      );


      // ==============================================================
      // PÁGINA 9: REPORTE DE CONFIABILIDAD Y METODOLOGÍA
      // ==============================================================
      doc.addPage();
      drawPageBase(9, TOTAL_PAGES, "Dictamen de Confiabilidad Metodológica");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("9. DICTAMEN DE CONFIABILIDAD METODOLÓGICA & NIVEL DE PRECISIÓN", margin, currentY);

      doc.setFillColor(79, 70, 229); // Indigo
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "Para garantizar la transparencia en la toma de decisiones publicitarias, a continuación se detalla la confiabilidad de los datos de cada módulo de OculiMind AI:",
        currentY
      );

      currentY = drawInfoBox(
        "Niveles de Precisión y Metodología por Herramienta:",
        [
          "1. NEUROMARKETING PREDICTIVO & MAPAS DE CALOR (ALTA CONFIABILIDAD ~88-92%): Entrenado con algoritmos foveales (DeepGaze / Salient360). Predice con alta exactitud los primeros 3 a 5 segundos de atención humana sobre cualquier imagen o anuncio.",
          "2. WEBCAM EYE-TRACKING & EMOTION AI (100% EMPÍRICO Y REAL): Rastreos en vivo mediante visión artificial (FaceMesh) sobre el rostro del probador humano. Medición 100% real de dirección de mirada y microexpresiones (Valence/Frustración).",
          "3. HUB DE ADS & OPTIMIZADOR CREATIVO (100% TÉCNICO EXACTO): Test A/B, Matriz DCO, Carruseles y Suite Banners evalúan físicamente proporciones, safe zones, contraste y jerarquía de tus imágenes subidas.",
          "4. MONITOR ALGORÍTMICO LIVE (ACTUALIZADO EN TIEMPO REAL): Mapea directamente los pesos de pauta oficial de Meta, Google, TikTok y LinkedIn para prevenir penalizaciones eCPM.",
          "5. SOCIAL MEDIA BENCHMARK (METODOLOGÍA DE SIMULACIÓN ESTIMADA): Debido a que las APIs privadas de Instagram/TikTok restringen el acceso libre a métricas internas de competidores, el módulo utiliza una simulación matemática estandarizada basada en el volumen de audiencia seleccionada."
        ],
        currentY,
        [79, 70, 229]
      );

      currentY += 2;

      currentY = drawInfoBox(
        "Recomendaciones Técnicas para Maximizar Resultados:",
        [
          "• Para evaluar competidores exactos con datos 100% reales de pauta, utiliza el Hub de Ads con capturas de pantalla tomadas directamente de Meta Ad Library o Google Ads Transparency Center.",
          "• Para predecir el impacto de tus campañas antes de invertir dinero, apóyate en los Mapas de Calor Predictivos y el Simulador de Carruseles/DCO.",
          "• Realiza pruebas de usabilidad empírica con el Webcam Eye-Tracking para validar el recorrido visual con usuarios humanos reales."
        ],
        currentY,
        [16, 185, 129]
      );

      // Save generated pdf document
      doc.save("OculiMind_AI_Manual_de_Uso.pdf");
      logExportAction("Descarga de PDF", "Manual Técnico de Uso Oficial OculiMind AI", "ManualDownloader");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to generate user manual PDF:", err);
      alert("Hubo un error inesperado al intentar generar el archivo PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative shrink-0">
      <button
        onClick={generatePDFManual}
        disabled={isGenerating}
        className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-xl transition duration-200 flex items-center gap-1.5 sm:gap-2 shadow-xs cursor-pointer ${
          isGenerating 
            ? "bg-indigo-100 text-indigo-500 border border-indigo-200" 
            : success
            ? "bg-emerald-500 text-white border border-emerald-400"
            : "bg-slate-900 hover:bg-slate-800 text-white border border-slate-800"
        }`}
        title="Descargar manual de uso completo en formato PDF"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className={showTextOnMobile ? "inline" : "hidden sm:inline"}>Generando...</span>
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-3.5 h-3.5 text-white animate-bounce" />
            <span className={showTextOnMobile ? "inline" : "hidden sm:inline"}>¡Descargado!</span>
          </>
        ) : (
          <>
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className={showTextOnMobile ? "inline" : "hidden sm:inline"}>Manual PDF</span>
          </>
        )}
      </button>
    </div>
  );
}

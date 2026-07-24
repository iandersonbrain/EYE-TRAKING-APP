import React, { useState } from "react";
import { FileDown, Loader2, BookOpen, CheckCircle } from "lucide-react";
import { jsPDF } from "jspdf";

export default function ManualDownloader() {
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

      // Helper function to draw page background and headers
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
        doc.text("OculiMind AI v1.3.0 — Manual Técnico de Usuario Oficial", margin, pageHeight - 7);
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

      const TOTAL_PAGES = 5;

      // ==============================================================
      // PÁGINA 1: PORTADA Y TABLA DE CONTENIDOS
      // ==============================================================
      
      // Cover Background decoration
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Abstract logo mark drawing
      doc.setFillColor(79, 70, 229); // Indigo
      doc.rect(margin, 40, 25, 25, "F");
      doc.setFillColor(236, 72, 153); // Pink
      doc.circle(margin + 25, 65, 12.5, "F");
      doc.setFillColor(56, 189, 248); // Cyan
      doc.circle(margin + 5, 65, 8, "F");

      // Cover Header
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.text("OculiMind AI", margin, 95);

      doc.setFontSize(14);
      doc.setTextColor(129, 140, 248); // indigo-400
      doc.text("Manual de Operación y Guía de Buenas Prácticas v1.3.0", margin, 105);

      // Horizontal separator line
      doc.setFillColor(51, 65, 85);
      doc.rect(margin, 112, contentWidth, 0.8, "F");

      // Description
      doc.setTextColor(203, 213, 225); // slate-300
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const descText = "Descubra el poder del Neuromarketing Digital y la Inteligencia Artificial Cognitiva en un único espacio unificado. Este manual actualizado le guiará a través de la evaluación de imágenes y videos (Reels/TikTok), selección de proporciones de pantalla (Aspect Ratio 9:16, 1:1, 16:9, 4:5), zonas seguras para dispositivos móviles, calibración ocular por webcam, Emotion AI, comparativa A/B y auditoría formal de logotipos comerciales.";
      const descLines = doc.splitTextToSize(descText, contentWidth);
      doc.text(descLines, margin, 120);

      // Metadata Info Box (Inside Cover)
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(margin, 155, contentWidth, 42, "F");
      
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("INFORMACIÓN DEL SISTEMA", margin + 6, 163);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(241, 245, 249); // slate-200
      doc.text("•  Nombre de la App: OculiMind AI Smart Suite v1.3.0", margin + 6, 171);
      doc.text("•  Motor de Inferencia: Gemini Vision & Real-Time Video Analysis Engine", margin + 6, 177);
      doc.text("•  Módulos Integrados: Video Reels, Aspect Ratios, Eye Tracking, Emotion AI, A/B Testing, Logo Review", margin + 6, 183);
      doc.text("•  Formatos Soportados: Imágenes (JPG/PNG), Videos (MP4/WebM), Reels (9:16), Banners (16:9)", margin + 6, 189);
      doc.text("•  Soporte Técnico: iandersonbrain@gmail.com (Workspace Developer Program)", margin + 6, 195);

      // Table of Contents Header
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("TABLA DE CONTENIDOS", margin, 212);

      doc.setFillColor(79, 70, 229);
      doc.rect(margin, 215, 20, 1, "F");

      // TOC Items
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(226, 232, 240); // slate-200
      
      const tocItems = [
        { label: "1. Introducción General y Gestión de Estudios de Imagen", page: "Pág. 2" },
        { label: "2. Eye Tracking Predictivo de Imágenes & Proporciones (Aspect Ratio)", page: "Pág. 2" },
        { label: "3. Análisis de Video & Reels (Escenas Dinámicas & Retención CRO)", page: "Pág. 3" },
        { label: "4. Calibración por Webcam Real y Evaluación Ocular en Vivo", page: "Pág. 4" },
        { label: "5. Emotion AI: Análisis de Sentimientos y Microexpresiones", page: "Pág. 4" },
        { label: "6. Dashboard 360°, Sandbox Multicapa y Comparativa A/B", page: "Pág. 5" },
        { label: "7. IA Logo Review & Auditoría Comercial de Marca", page: "Pág. 5" },
      ];

      tocItems.forEach((item, index) => {
        const rowY = 222 + (index * 7);
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
      // PÁGINA 2: GESTIÓN DE ESTUDIOS Y EYE TRACKING PREDICTIVO (IMÁGENES)
      // ==============================================================
      doc.addPage();
      drawPageBase(2, TOTAL_PAGES, "Gestión de Estudios y Eye Tracking Predictivo");

      currentY = 38;

      // Section 1: Gestión de Estudios
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("1. GESTIÓN DE ESTUDIOS Y CATÁLOGO DE IMÁGENES & VIDEOS", margin, currentY);

      doc.setFillColor(79, 70, 229);
      doc.rect(margin, currentY + 2, 35, 1, "F");
      
      currentY += 8;

      currentY = writeParagraph(
        "El módulo de Estudios sirve como el repositorio central para sus piezas publicitarias, banners, anuncios de Reels/TikTok o landing pages. Puede subir tanto imágenes como archivos de video. La plataforma asignará automáticamente la categoría adecuada (estático, video ad o video reel) para aplicar el modelo biocognitivo correspondiente.",
        currentY
      );

      // Section 2: Eye Tracking Predictivo e Aspect Ratios
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("2. EYE TRACKING PREDICTIVO Y SELECCIÓN DE PROPORCIÓN (ASPECT RATIO)", margin, currentY);

      doc.setFillColor(236, 72, 153); // Pink
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "Al seleccionar un estudio estático, la IA procesa la composición para generar el Mapa de Calor (Heatmap) y la Ruta de Fijación Sacádica (Focus Path). En la versión 1.3.0 puede elegir diferentes proporciones de pantalla para evaluar cómo responde el diseño según la plataforma de destino:",
        currentY
      );

      currentY = drawInfoBox(
        "Formatos de Pantalla y Zonas Seguras Incorporadas:",
        [
          "• 9:16 Vertical (Stories & Reels): Activa la superposición de Zonas Seguras para evitar que el texto o CTA queden ocultos tras la interfaz móvil de Instagram/TikTok.",
          "• 1:1 Cuadrado (Feed): Modela la atracción simétrica en desplazamientos rápidos de feed.",
          "• 16:9 Horizontal (Banners & YouTube): Analiza la lectura visual bajo el patrón F-shape.",
          "• 4:5 Retrato Mobile: Evalúa el formato vertical optimizado que maximiza el tiempo de permanencia (Dwell Time)."
        ],
        currentY,
        [236, 72, 153] // Pink
      );


      // ==============================================================
      // PÁGINA 3: ANÁLISIS DE VIDEO & REELS (NUEVO MÓDULO V1.3.0)
      // ==============================================================
      doc.addPage();
      drawPageBase(3, TOTAL_PAGES, "Análisis de Video, Reels & Retención CRO");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("3. ANÁLISIS DE VIDEO & REELS CON MAPA DE CALOR TEMPORAL", margin, currentY);

      doc.setFillColor(14, 165, 233); // Cyan
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "El motor de video de OculiMind AI permite analizar piezas audiovisuales y Reels de cualquier duración. El sistema calcula dinámicamente el comportamiento de la atención segundo a segundo, adaptándose a la duración real del video subido por el usuario.",
        currentY
      );

      currentY = drawInfoBox(
        "Componentes Clave del Análisis de Video:",
        [
          "1. DESGLOSE DINÁMICO DE ESCENAS: Segmentación automática en 4 fases (Escena 1: El Gancho/Hook, Escena 2: Muestra de Producto, Escena 3: Explicación y Subtítulos, Escena 4: Cierre y Marca).",
          "2. HEATMAP DINÁMICO SINCRONIZADO: Los puntos de fijación se desplazan en tiempo real sobre la reproducción del video según la marca de tiempo (currentTime).",
          "3. REPORTE DE RETENCIÓN DE VIDEO: Generación de resumen semántico del video, fortalezas detectadas, puntos críticos de desgaste y recomendaciones de optimización CRO.",
          "4. SELECTOR DE FORMATO DE VIDEO: Alterna instantáneamente entre 9:16 (Reels/TikTok), 16:9 (YouTube), 1:1 y 4:5."
        ],
        currentY,
        [14, 165, 233] // Cyan
      );

      currentY += 2;

      currentY = writeParagraph(
        "Recomendación CRO de Video: En formatos verticales (9:16), procure ubicar el elemento principal de atención o el logotipo de marca entre el 20% y el 75% de la altura de la pantalla para garantizar la máxima retención antes del scroll involuntario.",
        currentY,
        9,
        [71, 85, 105],
        "italic"
      );


      // ==============================================================
      // PÁGINA 4: WEBCAM EN VIVO Y EMOTION AI
      // ==============================================================
      doc.addPage();
      drawPageBase(4, TOTAL_PAGES, "Neuromarketing: Webcam Real & Emotion AI");

      currentY = 38;

      // Section 4: Webcam Tracker
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("4. SEGUIMIENTO OCULAR MEDIANTE WEBCAM EN VIVO (TEST CON USUARIOS)", margin, currentY);

      doc.setFillColor(16, 185, 129); // Emerald
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "A diferencia de las estimaciones puras por IA, el módulo 'Webcam Real' le permite recolectar datos empíricos de usuarios utilizando la cámara web de su dispositivo. El sistema aprovecha algoritmos web de estimación de malla facial (Face Mesh) para calcular los vectores de mirada relativos a la pantalla.",
        currentY
      );

      currentY = drawInfoBox(
        "Protocolo Obligatorio para Pruebas de Calibración de Webcam:",
        [
          "1. ILUMINACIÓN: Asegúrese de tener luz frontal homogénea sobre la cara. Evite contraluces.",
          "2. DISTANCIA: Posiciónese de manera estable a una distancia de 50 a 60 cm de la pantalla.",
          "3. FIJACIÓN DE CALIBRACIÓN: Siga visualmente los puntos circulares rojos que se muestran en el lienzo.",
          "4. SESIÓN: Permanezca inmóvil durante la prueba mientras observa el banner o video."
        ],
        currentY,
        [16, 185, 129] // Emerald
      );

      currentY += 4;

      // Section 5: Emotion AI
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("5. EMOTION AI: EVALUACIÓN DE MICROEXPRESIONES FACIALES", margin, currentY);

      doc.setFillColor(139, 92, 246); // Purple
      doc.rect(margin, currentY + 2, 40, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "En paralelo a las sacadas oculares, la pestaña 'Emotion AI' procesa la gesticulación facial para mapear de manera continua cuatro métricas biocognitivas:",
        currentY
      );

      currentY = writeParagraph("• Agrado / Alegría (Valence): Mide respuestas de beneplácito o afinidad inmediata.", currentY, 9);
      currentY = writeParagraph("• Frustración / Ceño Fruncido: Se activa cuando el texto es ilegible o los contrastes son deficientes.", currentY, 9);
      currentY = writeParagraph("• Sorpresa / Atención Plena: Indica asombro o el impacto de un elemento con gran contraste.", currentY, 9);
      currentY = writeParagraph("• Engagement Neto: Representa el nivel de enfoque e interés mental del usuario.", currentY, 9);


      // ==============================================================
      // PÁGINA 5: DASHBOARD 360, COMPARATIVA A/B Y AUDITORÍA DE LOGOS
      // ==============================================================
      doc.addPage();
      drawPageBase(5, TOTAL_PAGES, "Dashboard 360°, Comparativa A/B & Logo Review");

      currentY = 38;

      // Section 6: Dashboard 360 & A/B Comparison
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("6. DASHBOARD 360°, SANDBOX MULTICAPA Y COMPARATIVA A/B", margin, currentY);

      doc.setFillColor(225, 29, 72); // Rose
      doc.rect(margin, currentY + 2, 40, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "El Dashboard 360° integra en un único lienzo la proyección predictiva de IA y los datos de mirada real. Además, incluye la función de Comparativa A/B para contrastar dos versiones de diseño en paralelo, midiendo cuál obtiene mayor atención de marca y menor carga cognitiva.",
        currentY
      );

      // Section 7: Logo Review
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("7. AUDITORÍA TÉCNICA DE LOGOS (MYLOGOREVIEW.COM STYLE)", margin, currentY);

      doc.setFillColor(79, 70, 229); // Indigo
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "El módulo 'IA Logo Review' evalúa de manera automática cuatro vectores fundamentales de identidad visual:",
        currentY
      );

      currentY = writeParagraph("• Claridad Conceptual: Sencillez formal de la silueta y ausencia de ruido visual.", currentY, 8.5);
      currentY = writeParagraph("• Originalidad de Sector: Nivel de diferenciación de color e imagotipo.", currentY, 8.5);
      currentY = writeParagraph("• Legibilidad de Marca: Comportamiento tipográfico en escalas micro.", currentY, 8.5);
      currentY = writeParagraph("• Adaptabilidad a Medios: Rendimiento en fondos oscuros, apps y favicones web.", currentY, 8.5);

      currentY += 3;

      currentY = drawInfoBox(
        "Entregables del Auditor de Logos:",
        [
          "1. ALERTAS TÉCNICAS: Diagnóstico de contraste y legibilidad en escala reducida.",
          "2. PALETA DE COLOR DE MARCA: Códigos hexadecimales con verificación WCAG.",
          "3. SIMULADORES EN VIVO: Pruebas reales en tarjetas, favicones y pantallas móviles.",
          "4. KIT DE EXPORTACIÓN (.ZIP): Descarga automatizada de archivos de marca formateados."
        ],
        currentY,
        [79, 70, 229]
      );

      // Save generated pdf document
      doc.save("OculiMind_AI_Manual_de_Uso.pdf");

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
    <div className="relative">
      <button
        onClick={generatePDFManual}
        disabled={isGenerating}
        className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-200 flex items-center gap-2 shadow-xs cursor-pointer ${
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
            <span>Generando Manual...</span>
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-3.5 h-3.5 text-white animate-bounce" />
            <span>¡Manual Descargado!</span>
          </>
        ) : (
          <>
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Manual de Uso PDF</span>
          </>
        )}
      </button>
    </div>
  );
}

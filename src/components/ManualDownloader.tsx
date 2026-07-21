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
        doc.text("OculiMind AI v1.2.0 — Manual Técnico de Usuario Oficial", margin, pageHeight - 7);
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

      const TOTAL_PAGES = 4;

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
      doc.text("Manual de Operación y Guía de Buenas Prácticas", margin, 105);

      // Horizontal separator line
      doc.setFillColor(51, 65, 85);
      doc.rect(margin, 112, contentWidth, 0.8, "F");

      // Description
      doc.setTextColor(203, 213, 225); // slate-300
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const descText = "Descubra el poder del Neuromarketing Digital y la Inteligencia Artificial Cognitiva en un único espacio unificado. Este manual le guiará a través de la calibración ocular en tiempo real, predicciones visuales automáticas por medio de modelos Gemini, análisis del sentimiento del usuario (Emotion AI) y auditoría formal de logotipos comerciales.";
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
      doc.text("•  Nombre de la App: OculiMind AI Smart Suite", margin + 6, 171);
      doc.text("•  Motor de Inferencia: Gemini 3.5 Flash & Vision Models", margin + 6, 177);
      doc.text("•  Módulos Integrados: Eye Tracking, Emotion Analytics, 360° Reports, Logo Review", margin + 6, 183);
      doc.text("•  Cumplimiento WCAG: Contraste optimizado, accesibilidad, exportaciones sin pérdida", margin + 6, 189);
      doc.text("•  Soporte Técnico: iandersonbrain@gmail.com (Workspace Developer Program)", margin + 6, 195);

      // Table of Contents Header
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("TABLA DE CONTENIDOS", margin, 215);

      doc.setFillColor(79, 70, 229);
      doc.rect(margin, 218, 20, 1, "F");

      // TOC Items
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(226, 232, 240); // slate-200
      
      const tocItems = [
        { label: "1. Introducción general y Flujo de Trabajo", page: "Pág. 1" },
        { label: "2. Gestión de Estudios de Imagen & Campañas", page: "Pág. 2" },
        { label: "3. Eye Tracking Predictivo con Modelos de IA", page: "Pág. 2" },
        { label: "4. Calibración de Webcam y Sesiones Oculares en Vivo", page: "Pág. 3" },
        { label: "5. Emotion AI: Lectura de Sentimientos Facial", page: "Pág. 3" },
        { label: "6. Dashboard de Análisis 360° y Métricas de Correlación", page: "Pág. 4" },
        { label: "7. IA Logo Review & Auditoría de Marca Integrada", page: "Pág. 4" },
      ];

      tocItems.forEach((item, index) => {
        const rowY = 226 + (index * 7);
        doc.text(item.label, margin, rowY);
        doc.text("...........................................................................................................................", margin + 5, rowY - 1, { align: "left" });
        doc.text(item.page, pageWidth - margin, rowY, { align: "right" });
      });

      // Cover Footer
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.text("OculiMind AI — Diseñado para Agencias, Diseñadores y Analistas de Conversión", pageWidth / 2, pageHeight - 12, { align: "center" });


      // ==============================================================
      // PÁGINA 2: GESTIÓN DE ESTUDIOS Y EYE TRACKING PREDICTIVO
      // ==============================================================
      doc.addPage();
      drawPageBase(2, TOTAL_PAGES, "Gestión de Estudios y Eye Tracking Predictivo");

      currentY = 38;

      // Section 1: Gestión de Estudios
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("1. GESTIÓN DE ESTUDIOS Y CATÁLOGO DE IMÁGENES", margin, currentY);

      doc.setFillColor(79, 70, 229);
      doc.rect(margin, currentY + 2, 35, 1, "F");
      
      currentY += 8;

      currentY = writeParagraph(
        "El módulo de Estudios sirve como el repositorio central para todas sus piezas publicitarias, mockups, landing pages o diseños de banners. Desde la pestaña 'Estudios' usted puede registrar nuevos estudios asociándoles un nombre, una descripción clara y cargando el archivo de imagen de origen. La plataforma creará automáticamente las bases de datos para albergar las previsualizaciones, mapas de calor futuros y análisis biocognitivos asociados.",
        currentY
      );

      // Fast facts block
      currentY = drawInfoBox(
        "Consejos de Configuración del Estudio:",
        [
          "1. Use resoluciones nativas (PNG o JPG) de máximo 1920x1080px para acelerar el renderizado.",
          "2. Asigne nombres descriptivos alineados a la campaña para facilitar el filtro posterior.",
          "3. Puede eliminar estudios obsoletos usando el botón de papelera en la barra lateral."
        ],
        currentY,
        [79, 70, 229] // Indigo
      );

      currentY += 4;

      // Section 2: Eye Tracking Predictivo
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("2. EYE TRACKING PREDICTIVO MEDIANTE INTELIGENCIA ARTIFICIAL", margin, currentY);

      doc.setFillColor(236, 72, 153); // Pink
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "Al presionar 'Iniciar Análisis Predictivo' o ingresar a la sección 'IA Predictiva', el sistema se conecta por medio de un proxy seguro con el modelo de visión artificial de Gemini. Este modelo procesa las características geométricas, contrastes, colores dominantes, rostros y textos contenidos en el estímulo visual para modelar un mapa probabilístico de atención primaria.",
        currentY
      );

      currentY = writeParagraph(
        "El mapa resultante representa las fijaciones del ojo humano durante los primeros 3 segundos de exposición, que es cuando se decide el nivel de engagement o rechazo involuntario.",
        currentY
      );

      // Features list inside a box
      currentY = drawInfoBox(
        "Visualizaciones Generadas en IA Predictiva:",
        [
          "• Mapa de Calor (Heatmap): Una capa con gradiente de temperatura (rojo = máxima atención).",
          "• Ruta de Fijación Sacádica (Focus Path): Puntos numerados que trazan la secuencia de atención.",
          "• Índice de Claridad Visual: Puntuación de 0 a 100 de qué tan limpio es el diseño.",
          "• Recomendación de Diseño: Análisis semántico automático sobre qué elementos corregir."
        ],
        currentY,
        [236, 72, 153] // Pink
      );


      // ==============================================================
      // PÁGINA 3: WEBCAM EN VIVO Y EMOTION AI
      // ==============================================================
      doc.addPage();
      drawPageBase(3, TOTAL_PAGES, "Neuromarketing: Webcam Real & Emotion AI");

      currentY = 38;

      // Section 3: Webcam Tracker
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("3. SEGUIMIENTO OCULAR MEDIANTE WEBCAM (TEST CON USUARIOS)", margin, currentY);

      doc.setFillColor(14, 165, 233); // Celeste Cyan
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "A diferencia de las estimaciones puras por IA, el módulo 'Webcam Real' le permite recolectar datos empíricos de usuarios de carne y hueso utilizando la cámara web de su dispositivo. El sistema aprovecha algoritmos web de estimación de malla facial (Face Mesh) para calcular los vectores de mirada relativos a la posición de la pantalla.",
        currentY
      );

      // User calibration instructions info box
      currentY = drawInfoBox(
        "Protocolo Obligatorio para Pruebas de Calibración de Webcam:",
        [
          "1. ILUMINACIÓN: Asegúrese de tener luz frontal homogénea sobre la cara. Evite contraluces intensos.",
          "2. DISTANCIA: Posiciónese de manera estable a una distancia aproximada de 50 a 60 cm de la pantalla.",
          "3. FIJACIÓN DE CALIBRACIÓN: Siga visualmente los puntos circulares rojos que se muestran en el lienzo.",
          "4. SESIÓN: Permanezca inmóvil durante los 10 segundos de la prueba mientras mira el banner."
        ],
        currentY,
        [14, 165, 233] // Cyan
      );

      currentY += 4;

      // Section 4: Emotion AI
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("4. EMOTION AI: EVALUACIÓN DE MICROEXPRESIONES FACIALES", margin, currentY);

      doc.setFillColor(16, 185, 129); // Emerald
      doc.rect(margin, currentY + 2, 40, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "En paralelo a las sacadas oculares, el sistema analiza el lenguaje no verbal del evaluado para extraer respuestas afectivas implícitas. La pestaña 'Emotion AI' procesa la gesticulación facial y el ceño para mapear de manera continua cuatro métricas clave de comportamiento biocognitivo:",
        currentY
      );

      // Emotion listing
      currentY = writeParagraph("• Agrado / Alegría (Valence): Mide respuestas de beneplácito, simpatía o afinidad inmediata hacia la propuesta visual.", currentY, 9.5);
      currentY = writeParagraph("• Frustración / Ceño Fruncido: Se activa cuando el texto es ilegible, los contrastes son bajos o existe sobrecarga de estímulos.", currentY, 9.5);
      currentY = writeParagraph("• Sorpresa / Atención Plena: Indica asombro, disrupción creativa o el impacto inicial de un elemento con gran contraste.", currentY, 9.5);
      currentY = writeParagraph("• Compromiso de Atención (Engagement): Representa el nivel de enfoque mental e interés neto del usuario por descifrar la pieza publicitaria.", currentY, 9.5);


      // ==============================================================
      // PÁGINA 4: DASHBOARD 360 Y AUDITORÍA DE LOGOS (MYLOGOREVIEW)
      // ==============================================================
      doc.addPage();
      drawPageBase(4, TOTAL_PAGES, "Dashboard 360° & Auditoría de Logotipos (IA)");

      currentY = 38;

      // Section 5: Dashboard 360
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("5. DASHBOARD 360° Y MÉTRICAS DE CORRELACIÓN", margin, currentY);

      doc.setFillColor(139, 92, 246); // Purple
      doc.rect(margin, currentY + 2, 40, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "El Dashboard 360° es el consolidador científico que correlaciona las predicciones matemáticas y el comportamiento empírico de los usuarios reales. Calcula automáticamente un 'Índice de Similitud' que mide el alineamiento entre la IA y las miradas humanas, y evalúa la 'Carga Cognitiva', informándole si su diseño requiere un esfuerzo innecesario de lectura o si comunica el mensaje de marca limpiamente en menos de 3 segundos.",
        currentY
      );

      currentY += 4;

      // Section 6: Logo Review
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("6. AUDITORÍA TÉCNICA DE LOGOS (MYLOGOREVIEW.COM STYLE)", margin, currentY);

      doc.setFillColor(79, 70, 229); // Indigo
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "El nuevo módulo 'IA Logo Review' realiza un escaneo de branding y legibilidad formal de su logotipo comercial. Al subir una imagen de marca, el motor cognitivo de OculiMind AI evalúa de manera automática cuatro vectores fundamentales de identidad visual:",
        currentY
      );

      // Logo parameters description
      currentY = writeParagraph("• Claridad Conceptual: Sencillez formal de la silueta. Evalúa si el logotipo no está sobrecargado de trazos o detalles.", currentY, 9);
      currentY = writeParagraph("• Originalidad de Sector: Mide si el esquema de color o icono se destaca o si peca de convencional en su categoría.", currentY, 9);
      currentY = writeParagraph("• Legibilidad de Marca: Garantiza que la tipografía principal sea legible en pantallas y que el espaciado no colapse.", currentY, 9);
      currentY = writeParagraph("• Adaptabilidad a Medios: Califica el comportamiento en fondos oscuros, firmas de correo, apps móviles y faviconos.", currentY, 9);

      currentY += 3;

      // Actionable outputs info box
      currentY = drawInfoBox(
        "Entregables Generados por el Auditor de Logos:",
        [
          "1. DETECCIÓN DE RIESGOS: Alertas de contraste, pérdidas de trazo o tipografía ilegible en escala micro.",
          "2. PALETA DE COLOR DE MARCA: Listado hexadecimal con recomendaciones de contraste WCAG.",
          "3. PREVISUALIZACIONES EN VIVO: Pruebas de visualización real en pestañas, tarjetas y móviles.",
          "4. KIT DE EXPORTACIÓN (.ZIP): Paquete descargable con archivos organizados y favicons para web."
        ],
        currentY,
        [79, 70, 229] // Indigo
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

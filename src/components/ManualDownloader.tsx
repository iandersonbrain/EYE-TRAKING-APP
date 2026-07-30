import React, { useState } from "react";
import { FileDown, Loader2, BookOpen, CheckCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import { logExportAction } from "../lib/telemetryManager";

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

      const TOTAL_PAGES = 7;

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
      doc.setFontSize(30);
      doc.text("OculiMind AI", margin, 90);

      doc.setFontSize(13);
      doc.setFontSize(13);
      doc.setTextColor(129, 140, 248); // indigo-400
      doc.text("Manual Técnico de Neuromarketing, Biometría & Social Benchmark v2.6", margin, 100);

      // Horizontal separator line
      doc.setFillColor(51, 65, 85);
      doc.rect(margin, 106, contentWidth, 0.8, "F");

      // Description
      doc.setTextColor(203, 213, 225); // slate-300
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const descText = "Guía operativa y técnica oficial para la evaluación bio-cognitiva de campañas publicitarias. Incluye parámetros estandarizados para Publicidad Exterior (OOH), Tiempos Biométricos (TTFF), Duración del Recorrido Visual, Zonas de Detención (Dwell Time), Benchmark Social Media con Ranking por Seguidores en RRSS, Gestión de Usuarios con Claves/Nombres, Meta Ads, Google Display Banners, Emotion AI y Auditoría de Logotipos.";
      const descLines = doc.splitTextToSize(descText, contentWidth);
      doc.text(descLines, margin, 114);

      // Metadata Info Box (Inside Cover)
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(margin, 142, contentWidth, 50, "F");
      
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("PARÁMETROS TÉCNICOS & CAPACIDADES INTEGRADAS", margin + 6, 150);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(241, 245, 249); // slate-200
      doc.text("•  Tiempos Biométricos: Medición del Tiempo de Reacción Visual (TTFF en ms) y Recorrido Ocular Total (seg).", margin + 6, 157);
      doc.text("•  Retención & Dwell Time: Identificación automatizada de la Zona de Mayor Detención y % de atención.", margin + 6, 163);
      doc.text("•  Benchmark RRSS & Ranking: Comparativa jerárquica por cantidad de seguidores y Tasa de Enganche (ER).", margin + 6, 169);
      doc.text("•  Gestión de Usuarios & Claves: Control de acceso con Nombre Completo o Clave (ej: TEST2026) y PIN Maestro.", margin + 6, 175);
      doc.text("•  Publicidad Exterior (OOH) & Digital: Reglas de 3s en movimiento, lectura en patrón F/Z y Safe Zones Meta/Google.", margin + 6, 181);

      // Table of Contents Header
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("TABLA DE CONTENIDOS", margin, 202);

      doc.setFillColor(79, 70, 229);
      doc.rect(margin, 205, 20, 1, "F");

      // TOC Items
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(226, 232, 240); // slate-200
      
      const tocItems = [
        { label: "1. Glosario Biométrico: Tiempos de Reacción, Recorrido Visual & Dwell Time", page: "Pág. 2" },
        { label: "2. Parámetros de Publicidad Exterior (OOH) & Sitios Web / Apps Móviles", page: "Pág. 3" },
        { label: "3. Análisis de Video, Reels & TikTok (Audio-Off, Safe Zones & Retención)", page: "Pág. 4" },
        { label: "4. Hub Meta Ads, Google Display & Benchmark RRSS (Ranking de Seguidores)", page: "Pág. 5" },
        { label: "5. Gestión de Usuarios, Claves de Acceso, PIN Maestro & Telemetría", page: "Pág. 6" },
        { label: "6. Neuromarketing Empírico (Webcam, Emotion AI) & Auditoría de Logos", page: "Pág. 7" },
      ];

      tocItems.forEach((item, index) => {
        const rowY = 212 + (index * 7);
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
      // PÁGINA 2: GLOSARIO TÉCNICO Y TIEMPOS BIOMÉTRICOS
      // ==============================================================
      doc.addPage();
      drawPageBase(2, TOTAL_PAGES, "Glosario Biométrico & Tiempos de Atención");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("1. CONCEPTOS TÉCNICOS DE MEDICIÓN Y BIOMETRÍA COGNITIVA", margin, currentY);

      doc.setFillColor(79, 70, 229);
      doc.rect(margin, currentY + 2, 45, 1, "F");
      
      currentY += 8;

      currentY = writeParagraph(
        "Para interpretar con precisión los dictámenes emitidos por OculiMind AI, es fundamental comprender las métricas biocognitivas clave utilizadas para calificar cada pieza publicitaria:",
        currentY
      );

      currentY = drawInfoBox(
        "Métricas Principales de Atención, Tiempos & Retención:",
        [
          "• TIEMPO DE REACCIÓN VISUAL (TTFF - Time to First Fixation): Tiempo medido en milisegundos (ms) que tarda el ojo en captar la primera fijación foveal en la pieza (óptimo: <250 ms).",
          "• DURACIÓN DEL RECORRIDO VISUAL: Tiempo total en segundos (s) estimado para completar la trayectoria sacádica de fijaciones a lo largo del lienzo.",
          "• ZONA DE MAYOR DETENCIÓN (Max Dwell Zone): Identificación de la zona (Titular, Producto, CTA) donde la mirada permanece estancada o enfocada por mayor tiempo con su % de atención.",
          "• STOP-RATIO (Tasa de Detención del Scroll): Porcentaje de usuarios que interrumpe el desplazamiento táctil del pulgar en el feed al detectar un elemento visual de alto impacto (>70% es Excelente).",
          "• HOOK RATE (Tasa de Enganche a 3s): Capacidad del creativo para retener la mirada del espectador durante los primeros 3 segundos clave de exposición.",
          "• ÍNDICE DE CARGA COGNITIVA (Cognitive Load): Cantidad de esfuerzo mental necesario para procesar la pieza. Valores superiores a 65% indican saturación visual y provocan rechazo."
        ],
        currentY,
        [79, 70, 229]
      );


      // ==============================================================
      // PÁGINA 3: PUBLICIDAD EXTERIOR (OOH) Y WEB / APPS
      // ==============================================================
      doc.addPage();
      drawPageBase(3, TOTAL_PAGES, "Parámetros OOH (Exterior) & Web / Apps");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("2. PARÁMETROS TÉCNICOS PARA PUBLICIDAD EXTERIOR (OOH)", margin, currentY);

      doc.setFillColor(225, 29, 72); // Rose
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "La evaluación de vallas publicitarias, mupis digitales y pantallas en vía pública exige criterios sumamente estrictos debido a la velocidad del espectador (vehicular o peatonal):",
        currentY
      );

      currentY = drawInfoBox(
        "Reglas de Oro para Vallas y Mupis Exteriores (OOH):",
        [
          "1. REGLA DE LOS 3 SEGUNDOS EN MOVIMIENTO: El conductor o peatón dispone de un lapso máximo de 1.5 a 3 segundos para asimilar el mensaje completo antes de perder línea de visión.",
          "2. MÁXIMO 2 ELEMENTOS FOCALES: La pieza NO debe contener más de 2 elementos dominantes (ej. Un producto llamativo + 1 titular corto de 4 a 6 palabras). Piezas con 3 o más elementos dispersos sufren un 80% de pérdida de recuerdo.",
          "3. LEGIBILIDAD A DISTANCIA Y CONTRASTE EXTREMO: El contraste tipográfico debe cumplir la norma WCAG AAA (mínimo 7:1) para ser comprensible a 50 metros de distancia bajo luz solar directa.",
          "4. ÍNDICE DE DESORDEN VISUAL (Clutter Index): Mide el ruido del fondo. Fondos complejos restan un 45% de efectividad a la fijación sobre la marca."
        ],
        currentY,
        [225, 29, 72]
      );

      currentY += 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("3. PARÁMETROS TÉCNICOS PARA PÁGINAS WEB Y APPS MÓVILES", margin, currentY);

      doc.setFillColor(16, 185, 129); // Emerald
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = drawInfoBox(
        "Criterios de Escaneo Visual en Interfaces Digitales:",
        [
          "• PATRÓN F-PATTERN Y Z-PATTERN: En escritorios, la vista escanea en forma de 'F'. El titular principal e isotipo deben residir en el margen superior izquierdo.",
          "• ZONA DEL PULGAR (Thumb Zone Accessibility): En pantallas móviles, los botones primarios de acción (CTA) deben situarse en el tercio inferior alcanzable de forma natural sin forzar la mano.",
          "• CONTRASTE DE BOTÓN CTA: El botón de conversión debe ser la zona con mayor peso lumínico o cromático del lienzo para activar el clic automático."
        ],
        currentY,
        [16, 185, 129]
      );


      // ==============================================================
      // PÁGINA 4: ANÁLISIS DE VIDEO, REELS & TIKTOK
      // ==============================================================
      doc.addPage();
      drawPageBase(4, TOTAL_PAGES, "Análisis de Video, Reels & TikTok");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("4. EVALUACIÓN DE VIDEOS, REELS Y TIKTOK", margin, currentY);

      doc.setFillColor(14, 165, 233); // Cyan
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "El módulo de video analiza dinámicamente el flujo audiovisual segundo a segundo, adaptando los requerimientos a la velocidad de consumo de redes sociales:",
        currentY
      );

      currentY = drawInfoBox(
        "Parámetros Clave para Formatos Audiovisuales Cortos (9:16):",
        [
          "1. COMPRENSIÓN CON AUDIO APAGADO (Audio-Off Ratio): Más del 75% de las reproducciones en plataformas sociales ocurren en silencio. El video DEBE incluir subtítulos dinámicos de gran tamaño o texto de apoyo contextual.",
          "2. ZONAS SEGURAS MÓVILES (Safe Zone Compliance): Verificación automatizada para evitar que texto, logos o botones queden tapados por el avatar de usuario, la descripción del post o la barra inferior de navegación.",
          "3. DENSIDAD DE CORTES (Ritmo de Edición): Videos con cambios de toma o movimiento cada 2 a 3 segundos mantienen una retención 2.4 veces mayor que tomas estáticas continuas.",
          "4. CURVA DE CAÍDA DE RETENCIÓN: Identificación exacta del segundo donde decae el interés para aplicar correcciones de edición o llamados a la acción tempranos."
        ],
        currentY,
        [14, 165, 233]
      );


      // ==============================================================
      // PÁGINA 5: HUB DE ADS & MONITOR ALGORÍTMICO EN TIEMPO REAL
      // ==============================================================
      doc.addPage();
      drawPageBase(5, TOTAL_PAGES, "Hub de Ads & Monitor Algorítmico Live");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("5. HUB DE ANUNCIOS META ADS, GOOGLE DISPLAY & MATRIZ DCO", margin, currentY);

      doc.setFillColor(139, 92, 246); // Purple
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "El módulo especializado en publicidad digital permite evaluar posts de Instagram, Facebook, LinkedIn y la suite completa de formatos estandarizados de Google Display Ads (Skyscraper, Leaderboard, Medium Rectangle, Billboard, etc.):",
        currentY
      );

      currentY = drawInfoBox(
        "Optimizaciones de Pauta, Creativos Dinámicos (DCO) & Benchmark RRSS:",
        [
          "• RANKING POR CANTIDAD DE SEGUIDORES (RRSS): Ordenamiento jerárquico automático de marcas competidoras y marca propia por volumen de comunidad y Tasa de Enganche (Engagement Rate - ER).",
          "• MATRIZ DCO (Dynamic Creative Optimization): Evalúa múltiples combinaciones de imágenes, titulares y botones CTA para determinar la variante con mayor probabilidad de conversión.",
          "• REGLA DEL 20% DE TEXTO EN META: Verifica que la cantidad de texto superpuesto no sobrepase el umbral que causa penalización en el costo por mil impresiones (eCPM).",
          "• SUITE GOOGLE DISPLAY IAB: Diagnóstico de legibilidad para los 12 formatos estandarizados de la red de display de Google."
        ],
        currentY,
        [139, 92, 246]
      );

      currentY += 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("6. MONITOR ALGORÍTMICO EN TIEMPO REAL (ACTUALIZACIÓN AUTOMÁTICA)", margin, currentY);

      doc.setFillColor(6, 182, 212); // Cyan
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "OculiMind AI cuenta con un sistema integrado de actualización algorítmica. Cuando plataformas como Instagram, Meta Ads o Google Display modifican sus reglas de entrega o formatos prioritarios, el motor recarga automáticamente sus pesos de ponderación (ej. Dando mayor peso a los Guardados/Compartidos sobre los Likes tradicionales).",
        currentY
      );


      // ==============================================================
      // PÁGINA 6: GESTIÓN DE USUARIOS Y CONTROL DE TELEMETRÍA
      // ==============================================================
      doc.addPage();
      drawPageBase(6, TOTAL_PAGES, "Gestión de Usuarios, Claves & Auditoría");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("7. SISTEMA DE GESTIÓN DE USUARIOS Y CLAVES DE ACCESO", margin, currentY);

      doc.setFillColor(99, 102, 241); // Indigo-500
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "OculiMind AI integra un robusto módulo de administración de claves y control de telemetría de uso para agencias, equipos de diseño y clientes corporativos:",
        currentY
      );

      currentY = drawInfoBox(
        "Funcionalidades de Control de Acceso y Claves Temporales:",
        [
          "• INGRESO FLEXIBLE POR CÓDIGO O NOMBRE: Los usuarios autorizados pueden iniciar sesión escribiendo su código asignado (ej: TEST2026, FRANCIS2026) o su nombre de usuario/empresa registrado (ej: Francis Añazco).",
          "• AUTENTICACIÓN POR PIN MAESTRO DE ADMINISTRADOR: El botón 'Gestión de Usuarios & Claves' requiere la introducción del PIN Maestro para usuarios sin rol admin, protegiendo las credenciales de la empresa.",
          "• ASIGNACIÓN DE EXPIRACIÓN Y LÍMITE DE USO: Es posible crear claves activas con límite de fecha y notas específicas por cliente.",
          "• TELEMETRÍA DE SESIONES Y AUDITORÍA EN TIEMPO REAL: Registro detallado de logins, tiempo en plataforma, materiales publicitarios subidos y reportes PDF exportados."
        ],
        currentY,
        [99, 102, 241]
      );


      // ==============================================================
      // PÁGINA 7: NEUROMARKETING EMPÍRICO Y AUDITORÍA DE LOGOS
      // ==============================================================
      doc.addPage();
      drawPageBase(7, TOTAL_PAGES, "Neuromarketing Empírico & Logo Review");

      currentY = 38;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("8. SEGUIMIENTO OCULAR POR WEBCAM Y EMOTION AI", margin, currentY);

      doc.setFillColor(16, 185, 129); // Emerald
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = writeParagraph(
        "Mediante la cámara web del dispositivo, el módulo empírico calcula los vectores de mirada (Face Mesh) y decodifica microexpresiones faciales para registrar Agrado (Valence), Ceño Fruncido (Frustración) y Sorpresa durante la sesión de prueba.",
        currentY
      );

      currentY += 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("9. AUDITORÍA TÉCNICA DE LOGOTIPOS Y MARCA", margin, currentY);

      doc.setFillColor(79, 70, 229); // Indigo
      doc.rect(margin, currentY + 2, 45, 1, "F");

      currentY += 8;

      currentY = drawInfoBox(
        "Entregables de la Auditoría de Marca:",
        [
          "1. EVALUACIÓN MICRO-ESCALA: Verificación de legibilidad en favicones de 16x16px y bordados.",
          "2. PALETA DE COLOR WCAG: Mapeo de códigos Hexadecimales y pruebas de contraste.",
          "3. SIMULADORES EN VIVO: Mockups instantáneos en apps, tarjetas y papelería corporativa.",
          "4. KIT DE ARCHIVOS DE MARCA: Generación y exportación de paquetes listos para producción."
        ],
        currentY,
        [79, 70, 229]
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

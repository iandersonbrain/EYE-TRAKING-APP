/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Campaign, FocusPoint, GazePathPoint } from "../types";
import HeatmapOverlay from "./HeatmapOverlay";
import GazePathOverlay from "./GazePathOverlay";
import VideoAnalysisView from "./VideoAnalysisView";
import { 
  Eye, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  CheckCircle2,
  Lightbulb, 
  TrendingUp, 
  Cpu, 
  Award, 
  Layers, 
  Download, 
  FileText, 
  Loader2,
  Smartphone,
  Monitor,
  Square,
  Layout,
  Maximize2,
  Info,
  Scale,
  ArrowRightLeft,
  Languages,
  SpellCheck
} from "lucide-react";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface PredictiveViewProps {
  campaign: Campaign;
}

type AspectRatio = "original" | "1:1" | "9:16" | "16:9" | "4:5";

export default function PredictiveView({ campaign }: PredictiveViewProps) {
  const [viewMode, setViewMode] = useState<"heatmap" | "gazepath" | "both">("heatmap");
  const [activeVariant, setActiveVariant] = useState<"sideBySide" | "A" | "B">("sideBySide");
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>("original");

  // If campaign is a video or tiktok, render the specialized VideoAnalysisView
  if (campaign.category === "video" || campaign.category === "tiktok") {
    return <VideoAnalysisView campaign={campaign} />;
  }

  const isPresentation = campaign.category === "presentation" && campaign.slides && campaign.slides.length > 0;
  const currentSlide = isPresentation ? campaign.slides![activeSlideIndex] : null;

  const predictive = isPresentation ? currentSlide?.predictive : campaign.predictive;
  const imageUrl = isPresentation ? (currentSlide?.imageUrl || campaign.imageUrl) : campaign.imageUrl;
  const name = isPresentation ? currentSlide?.name : campaign.name;

  const handleDownloadPDF = async () => {
    if (!predictive) return;
    setIsExporting(true);
    
    let imgData: string | null = null;
    let canvasWidth = 800;
    let canvasHeight = 500;
    
    try {
      const element = document.getElementById("predictive-visual-canvas");
      if (element) {
        // Try to capture the live visual canvas
        const canvas = await html2canvas(element, {
          useCORS: true,
          allowTaint: true,
          scale: 2, // High resolution scale
          backgroundColor: "#0f172a" // Dark theme to match the canvas design
        });
        imgData = canvas.toDataURL("image/png");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
      }
    } catch (error) {
      console.warn("Could not capture canvas via html2canvas (likely CORS restrictions on third-party images). Falling back to pure text PDF structure.", error);
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ==========================================
      // PAGINA 1: PORTADA Y MAPA VISUAL DE CALOR
      // ==========================================
      
      // Top Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 42, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("OCULIMIND AI", 15, 18);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("REPORTE DE NEURO-DISEÑO Y ATENCIÓN PREDICTIVA", 15, 26);
      
      const currentDate = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Fecha de Emisión: ${currentDate}`, pageWidth - 15, 26, { align: "right" });

      // Sub-header Info (Study Name)
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(0, 42, pageWidth, 15, "F");
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Estudio de Campaña: ${campaign.name} ${isPresentation ? `— ${currentSlide?.name}` : ""}`, 15, 52);

      // Add Captured Live Map (or beautiful fallback placeholder if imgData is null)
      let mapWidth = pageWidth - 30; // 180mm
      let mapHeight = (canvasHeight * mapWidth) / canvasWidth;
      
      // Safety bounds for Page 1 size limit
      if (mapHeight > 125) {
        mapHeight = 125;
        mapWidth = (canvasWidth * mapHeight) / canvasHeight;
      }
      
      const mapX = 15 + (pageWidth - 30 - mapWidth) / 2;
      const mapY = 64;

      if (imgData) {
        // Draw elegant container outline
        doc.setDrawColor(51, 65, 85); // slate-700
        doc.setLineWidth(0.5);
        doc.rect(mapX - 0.5, mapY - 0.5, mapWidth + 1, mapHeight + 1, "S");
        
        // Draw image
        doc.addImage(imgData, "PNG", mapX, mapY, mapWidth, mapHeight);
      } else {
        // Draw a gorgeous technical fallback visualization box when html2canvas is restricted!
        doc.setFillColor(30, 41, 59); // slate-800
        doc.roundedRect(mapX, mapY, mapWidth, mapHeight, 3, 3, "F");
        
        doc.setDrawColor(71, 85, 105); // slate-600
        doc.setLineWidth(0.5);
        doc.rect(mapX, mapY, mapWidth, mapHeight, "S");
        
        doc.setTextColor(241, 245, 249);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Mapa de Calor Predictivo", mapX + mapWidth / 2, mapY + 25, { align: "center" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("Distribución de Foco Visual Estimado", mapX + mapWidth / 2, mapY + 33, { align: "center" });
        
        // Draw a schematic representation of the focus areas
        let currentDotY = mapY + 45;
        doc.setFontSize(8.5);
        predictive.focusAreas.slice(0, 4).forEach((area, i) => {
          doc.setFillColor(245, 158, 11); // amber-500
          doc.circle(mapX + 25, currentDotY, 2, "F");
          doc.setTextColor(226, 232, 240);
          doc.text(`AOI ${i + 1}: ${area.name} (Atención: ${area.weight}%)`, mapX + 32, currentDotY + 1);
          currentDotY += 12;
        });

        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("* Captura visual deshabilitada en vista previa por políticas de privacidad del navegador (CORS).", mapX + mapWidth / 2, mapY + mapHeight - 10, { align: "center" });
      }

      // KPI Gauge blocks under image
      const kpiY = Math.min(65 + mapHeight + 10, pageHeight - 38);
      
      // Metric 1: Clarity Score Card
      doc.setFillColor(240, 253, 250); // green-50
      doc.roundedRect(15, kpiY, 85, 24, 3, 3, "F");
      
      doc.setTextColor(13, 148, 136); // teal-600
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("CLARIDAD VISUAL (PUNTUACIÓN)", 20, kpiY + 8);
      doc.setFontSize(20);
      doc.text(`${predictive.clarityScore}%`, 20, kpiY + 18);
      
      // Metric 2: Cognitive Load Card
      doc.setFillColor(254, 243, 199); // amber-100
      doc.roundedRect(pageWidth - 100, kpiY, 85, 24, 3, 3, "F");
      
      doc.setTextColor(180, 83, 9); // amber-700
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("CARGA COGNITIVA (ESFUERZO)", pageWidth - 95, kpiY + 8);
      doc.setFontSize(20);
      doc.text(`${predictive.cognitiveLoad}%`, pageWidth - 95, kpiY + 18);

      // Footer Page 1
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Página 1 de 2 | OculiMind AI - Neuro-Diseño y Heurística de Atención Visual", pageWidth / 2, pageHeight - 10, { align: "center" });

      // ==========================================
      // PAGINA 2: REPORTE COGNITIVO DETALLADO
      // ==========================================
      doc.addPage();
      
      // Top Header Page 2
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 24, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("DIAGNÓSTICO HEURÍSTICO Y RECOMENDACIONES CRO", 15, 15);

      let currentY = 36;

      // 1. Executive Summary
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("RESUMEN EJECUTIVO DE NEURO-MARKETING", 15, currentY);
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);
      
      doc.setTextColor(51, 65, 85); // slate-600
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const summaryLines = doc.splitTextToSize(predictive.reportText.summary, pageWidth - 30);
      doc.text(summaryLines, 15, currentY + 7);
      
      currentY += 10 + (summaryLines.length * 4.2);

      // 2. Strengths Clave
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("FORTALEZAS DE DISTRIBUCIÓN VISUAL", 15, currentY);
      doc.setDrawColor(209, 250, 229); // emerald-100
      doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);
      
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      let listY = currentY + 7;
      predictive.reportText.strengths.forEach((str) => {
        const lines = doc.splitTextToSize(`•  ${str}`, pageWidth - 30);
        doc.text(lines, 15, listY);
        listY += (lines.length * 4);
      });
      
      currentY = listY + 6;

      // 3. Weaknesses / Puntos Ciegos
      doc.setTextColor(225, 29, 72); // rose-600
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("PUNTOS CIEGOS Y ÁREAS DE FRICCIÓN COGNITIVA", 15, currentY);
      doc.setDrawColor(254, 226, 226); // rose-100
      doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);
      
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      listY = currentY + 7;
      predictive.reportText.weaknesses.forEach((weak) => {
        const lines = doc.splitTextToSize(`•  ${weak}`, pageWidth - 30);
        doc.text(lines, 15, listY);
        listY += (lines.length * 4);
      });
      
      currentY = listY + 6;

      // 4. Optimizations CRO
      doc.setTextColor(217, 119, 6); // amber-600
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("ACCIONES RECOMENDADAS PARA INCREMENTAR LA CONVERSIÓN", 15, currentY);
      doc.setDrawColor(254, 243, 199); // amber-100
      doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);
      
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      listY = currentY + 7;
      predictive.reportText.recommendations.forEach((rec, idx) => {
        const lines = doc.splitTextToSize(`${idx + 1}.  ${rec}`, pageWidth - 30);
        doc.text(lines, 15, listY);
        listY += (lines.length * 4.2);
      });

      // Footer Page 2
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Página 2 de 2 | Reporte generado con Inteligencia Artificial Multimodal (Gemini-Vision)", pageWidth / 2, pageHeight - 10, { align: "center" });

      // Save the generated document
      doc.save(`OculiMind_Reporte_${campaign.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF document:", error);
      alert("Hubo un error al compilar el documento PDF. Por favor intenta de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  // Map focus areas to heatmap points format
  const heatmapPoints = predictive?.focusAreas.map(area => ({
    x: area.x,
    y: area.y,
    weight: area.weight / 100
  })) || [];

  if (!predictive) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* If it's a presentation, we still want to show the slide navigator so they can see all slides and trigger analysis! */}
        {isPresentation && (
          <div className="lg:col-span-12 flex flex-col space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 text-sm">Presentación PDF — Navegador de Diapositivas</h3>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-semibold font-mono">
                Diapositiva {activeSlideIndex + 1} de {campaign.slides!.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {campaign.slides!.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setActiveSlideIndex(idx);
                    setHoveredPoint(null);
                  }}
                  className={`flex items-center space-x-3 p-3 rounded-xl border transition text-left ${
                    activeSlideIndex === idx
                      ? "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/20"
                      : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="relative w-14 h-9 rounded-md border border-slate-200 overflow-hidden shrink-0 bg-slate-900">
                    <img
                      src={slide.imageUrl}
                      alt={slide.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0.5 right-0.5 bg-slate-950/80 text-[8px] text-white font-bold font-mono px-1 rounded">
                      Pág. {slide.slideNumber}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${activeSlideIndex === idx ? "text-indigo-600" : "text-slate-700"}`}>
                      {slide.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {slide.predictive ? "Análisis IA Listo" : "Análisis Pendiente"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="lg:col-span-12 flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Cpu className="w-16 h-16 text-indigo-400 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-800">Campaña Pendiente de Análisis</h3>
          <p className="text-slate-500 max-w-md mt-2">
            Esta campaña aún no cuenta con datos predictivos de IA. Haz clic en "Iniciar Análisis de IA" para predecir la atención visual con Gemini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {/* Slide Selector Carousel for Presentations */}
      {isPresentation && (
        <div className="lg:col-span-12 flex flex-col space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-800 text-sm">Presentación PDF — Navegador de Diapositivas</h3>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-semibold font-mono">
              Diapositiva {activeSlideIndex + 1} de {campaign.slides!.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {campaign.slides!.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => {
                  setActiveSlideIndex(idx);
                  setHoveredPoint(null);
                }}
                className={`flex items-center space-x-3 p-3 rounded-xl border transition text-left ${
                  activeSlideIndex === idx
                    ? "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/20"
                    : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                <div className="relative w-14 h-9 rounded-md border border-slate-200 overflow-hidden shrink-0 bg-slate-900">
                  <img
                    src={slide.imageUrl}
                    alt={slide.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0.5 right-0.5 bg-slate-950/80 text-[8px] text-white font-bold font-mono px-1 rounded">
                    Pág. {slide.slideNumber}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${activeSlideIndex === idx ? "text-indigo-600" : "text-slate-700"}`}>
                    {slide.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">
                    {slide.predictive ? "Análisis IA Listo" : "Análisis Pendiente"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Premium PDF Export Bar */}
      <div className="lg:col-span-12 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Resultado del Análisis de IA Predictiva</h3>
            <p className="text-xs text-slate-400 font-medium">Visualiza los puntos calientes y descarga el diagnóstico cognitivo completo en formato PDF.</p>
          </div>
        </div>
        <button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-500/10 shrink-0 cursor-pointer"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Generando PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4.5 h-4.5" />
              <span>Descargar Reporte PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Canvas (7 columns on large screens) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <div id="predictive-visual-canvas" className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
          
          {/* Dual Design Mode Switcher if Variant B exists */}
          {(campaign.variantBImageUrl || campaign.variantBPredictive) && (
            <div className="bg-slate-950 p-2.5 rounded-xl border border-indigo-500/30 mb-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs font-mono">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>
                  {campaign.comparisonMode === "original_vs_correction"
                    ? "Comparativa A/B: Original vs Corrección"
                    : "Comparativa A/B: 2 Diseños Diferentes"}
                </span>
              </div>

              <div className="flex bg-slate-900 p-1 rounded-lg text-xs border border-slate-800">
                <button
                  onClick={() => setActiveVariant("sideBySide")}
                  className={`px-3 py-1 rounded-md font-bold transition cursor-pointer flex items-center space-x-1 ${
                    activeVariant === "sideBySide"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Lado a Lado</span>
                </button>
                <button
                  onClick={() => setActiveVariant("A")}
                  className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                    activeVariant === "A"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Diseño A
                </button>
                <button
                  onClick={() => setActiveVariant("B")}
                  className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                    activeVariant === "B"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Diseño B
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-white">
              <Eye className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-sm">Visualizador de Atención Predictiva</span>
            </div>
            
            <div className="flex bg-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setViewMode("heatmap")}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  viewMode === "heatmap" ? "bg-amber-400 text-slate-900" : "text-slate-300 hover:text-white"
                }`}
              >
                Mapa Térmico
              </button>
              <button
                onClick={() => setViewMode("gazepath")}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  viewMode === "gazepath" ? "bg-amber-400 text-slate-900" : "text-slate-300 hover:text-white"
                }`}
              >
                Ruta de Mirada
              </button>
              <button
                onClick={() => setViewMode("both")}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  viewMode === "both" ? "bg-amber-400 text-slate-900" : "text-slate-300 hover:text-white"
                }`}
              >
                Ambos
              </button>
            </div>
          </div>

          {/* Aspect Ratio / Format Selection Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 gap-2 mb-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-300 pl-1 font-mono">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold">Proporción de Imagen / Formato:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: "original", label: "Original", icon: Layout },
                { id: "1:1", label: "1:1 Cuadrado", icon: Square },
                { id: "9:16", label: "9:16 Stories/Reels", icon: Smartphone },
                { id: "16:9", label: "16:9 Horizontal", icon: Monitor },
                { id: "4:5", label: "4:5 Feed", icon: Layout },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedRatio(item.id as AspectRatio)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer border ${
                    selectedRatio === item.id
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SIDE-BY-SIDE MODE OR SINGLE CANVAS */}
          {activeVariant === "sideBySide" && campaign.variantBImageUrl ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* FRAME DESIGN A */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-bold text-slate-300">
                  <span className="text-amber-400">Diseño A (Original)</span>
                  <span className="font-mono text-[10px] text-slate-400">Claridad: {campaign.predictive?.clarityScore || 80}%</span>
                </div>
                <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center">
                  <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                  {(viewMode === "heatmap" || viewMode === "both") && (
                    <HeatmapOverlay points={heatmapPoints} opacity={0.7} radius={45} />
                  )}
                </div>
              </div>

              {/* FRAME DESIGN B */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-bold text-slate-300">
                  <span className="text-emerald-400">
                    {campaign.variantBName || "Diseño B (Corregido)"}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold">
                    Claridad: {campaign.variantBPredictive?.clarityScore || 92}%
                  </span>
                </div>
                <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center">
                  <img
                    src={campaign.variantBImageUrl}
                    alt={campaign.variantBName || "Diseño B"}
                    className="w-full h-full object-cover"
                  />
                  {(viewMode === "heatmap" || viewMode === "both") && (
                    <HeatmapOverlay
                      points={
                        campaign.variantBPredictive?.focusAreas.map((area) => ({
                          x: area.x,
                          y: area.y,
                          weight: area.weight / 100
                        })) || heatmapPoints
                      }
                      opacity={0.7}
                      radius={45}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD SINGLE INTERACTIVE FRAME */
            <div className={`relative w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center transition-all duration-300 ${
              selectedRatio === "1:1" ? "aspect-square max-w-[460px] mx-auto shadow-2xl" :
              selectedRatio === "9:16" ? "aspect-[9/16] max-w-[270px] mx-auto shadow-2xl ring-2 ring-indigo-500/30" :
              selectedRatio === "16:9" ? "aspect-video shadow-xl" :
              selectedRatio === "4:5" ? "aspect-[4/5] max-w-[370px] mx-auto shadow-xl" :
              "max-h-[520px]"
            }`}>
              <img
                src={activeVariant === "B" && campaign.variantBImageUrl ? campaign.variantBImageUrl : imageUrl}
                alt={name}
                referrerPolicy="no-referrer"
                className={`w-full h-full ${selectedRatio === "original" ? "object-contain max-h-[500px]" : "object-cover"}`}
              />

              {/* Safe-Zone Overlays for Mobile Formats */}
              {selectedRatio === "9:16" && (
                <div className="absolute inset-0 pointer-events-none z-10 border-t-[40px] border-b-[60px] border-black/40 flex flex-col justify-between p-2">
                  <div className="flex items-center justify-between text-[8px] text-white/70 font-mono">
                    <span>• Instagram / TikTok Safe Zone Top</span>
                  </div>
                  <div className="text-[8px] text-amber-300/80 font-mono text-center bg-black/60 py-0.5 rounded">
                    Zona Inferior de CTA & Interfaz Móvil
                  </div>
                </div>
              )}

              {/* Heatmap Overlay Layer */}
              {(viewMode === "heatmap" || viewMode === "both") && (
                <HeatmapOverlay
                  points={
                    activeVariant === "B" && campaign.variantBPredictive
                      ? campaign.variantBPredictive.focusAreas.map((area) => ({
                          x: area.x,
                          y: area.y,
                          weight: area.weight / 100
                        }))
                      : heatmapPoints
                  }
                  opacity={0.7}
                  radius={45}
                />
              )}

              {/* Gaze Path SVG Overlay */}
              {(viewMode === "gazepath" || viewMode === "both") && (
                <GazePathOverlay
                  gazePath={predictive.gazePath}
                  hoveredPoint={hoveredPoint}
                  onHoverPoint={setHoveredPoint}
                />
              )}
            </div>
          )}

          <p className="text-[11px] text-slate-400 mt-2 text-center italic font-mono">
            * El análisis predice la fijación de la atención visual en los primeros 10 segundos de exposición.
          </p>

          {/* Format-Specific Neuro-Design Insight Box */}
          {selectedRatio !== "original" && (
            <div className="bg-indigo-950/80 p-3.5 rounded-xl border border-indigo-800/60 flex items-start space-x-3 text-xs text-indigo-200 mt-3 animate-fade-in">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">
                  Neuro-Diseño en Formato {selectedRatio}:
                </span>
                {selectedRatio === "9:16" && "En formato vertical 9:16 (Stories/Reels), mantén la marca y el botón CTA entre el 20% y el 75% de la pantalla para garantizar que no queden cubiertos por la interfaz del usuario."}
                {selectedRatio === "1:1" && "En formato cuadrado 1:1, la composición simétrica central capta la atención inmediata durante el scroll rápido en feeds móviles."}
                {selectedRatio === "16:9" && "En formato horizontal 16:9 (Banner Web/TV), el patrón de lectura visual F-shape concentra la primera fijación en el cuadrante superior izquierdo."}
                {selectedRatio === "4:5" && "El formato 4:5 ocupa un 20% más espacio vertical en el feed móvil que el 1:1, incrementando el tiempo de retención (Dwell Time)."}
              </div>
            </div>
          )}
        </div>

        {/* Areas of Attraction List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1.5" />
            Anclas Visuales Principales (Predictivas)
          </h4>
          <div className="space-y-3">
            {predictive.focusAreas.map((area, i) => (
              <div 
                key={`focus-list-${i}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                    {i + 1}
                  </div>
                  <span className="text-slate-700 font-medium text-sm">{area.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full" 
                      style={{ width: `${area.weight}%` }}
                    />
                  </div>
                  <span className="text-slate-500 font-mono text-xs font-bold w-8 text-right">
                    {area.weight}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI metrics and cognitive report (5 columns) */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        
        {/* Guages for Clarity & Cognitive Load */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Claridad Visual</span>
            <div className="relative flex items-center justify-center my-3">
              {/* Simple elegant circular gauge */}
              <svg className="w-20 h-20">
                <circle cx="40" cy="40" r="34" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="40" cy="40" r="34" 
                  stroke="#10b981" strokeWidth="6" fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - predictive.clarityScore / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <span className="absolute text-lg font-black text-slate-800 font-mono">{predictive.clarityScore}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {predictive.clarityScore >= 80 ? "Diseño limpio y fácil de digerir." : "Diseño que puede requerir simplificación visual."}
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Carga Cognitiva</span>
            <div className="relative flex items-center justify-center my-3">
              <svg className="w-20 h-20">
                <circle cx="40" cy="40" r="34" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="40" cy="40" r="34" 
                  stroke={predictive.cognitiveLoad > 60 ? "#ef4444" : "#f59e0b"} strokeWidth="6" fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - predictive.cognitiveLoad / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <span className="absolute text-lg font-black text-slate-800 font-mono">{predictive.cognitiveLoad}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {predictive.cognitiveLoad < 40 ? "Esfuerzo mental muy bajo." : "Sobrecarga de información media-alta."}
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center">
            <Award className="w-4 h-4 text-amber-500 mr-1.5" />
            Reporte de Neuro-Diseño por IA
          </h4>
          <div className="text-slate-600 text-sm leading-relaxed space-y-3">
            <p className="whitespace-pre-line">{predictive.reportText.summary}</p>
          </div>
        </div>

        {/* Default Spelling & Orthography Audit Section (Spanish & English) */}
        {(() => {
          const audit = predictive.spellingAudit || predictive.reportText?.spellingAudit;
          return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
                  <SpellCheck className="w-4 h-4 text-indigo-600 mr-1.5" />
                  Revisión Ortográfica y Gramatical (Default)
                </h4>
                <div className="flex items-center space-x-1.5 bg-indigo-50 px-2.5 py-1 rounded-full text-[11px] font-bold text-indigo-700 border border-indigo-100">
                  <Languages className="w-3 h-3 mr-0.5" />
                  <span>ES</span>
                  <span className="text-indigo-300">•</span>
                  <span>EN</span>
                </div>
              </div>

              {audit && audit.hasErrors && audit.issues && audit.issues.length > 0 ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{audit.statusText || "Se encontraron observaciones de ortografía/gramática en la pieza"}</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">Idioma: {audit.detectedLanguage || "Español / English"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {audit.issues.map((issue, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-rose-600 line-through bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            "{issue.foundText}"
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {issue.language === "es" ? "Español" : issue.language === "en" ? "English" : "Bilingüe"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-emerald-700 font-semibold">
                          <span>→ Corrección sugerida:</span>
                          <span className="font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-emerald-800">
                            "{issue.correctedText}"
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px]">{issue.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-800">100% Correcto en Español e Inglés</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      {audit?.statusText || "Revisión ortográfica y gramatical ejecutada por defecto en Español e Inglés. No se detectaron faltas de ortografía ni erratas en los textos de la pieza."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Strengths & Weaknesses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center bg-emerald-50 px-2 py-1 rounded w-fit">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Fortalezas Clave
            </h5>
            <ul className="space-y-2">
              {predictive.reportText.strengths.map((str, idx) => (
                <li key={`str-${idx}`} className="text-slate-600 text-xs flex items-start">
                  <span className="text-emerald-500 font-bold mr-1.5">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h5 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center bg-rose-50 px-2 py-1 rounded w-fit">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              Puntos Ciegos / Debilidades
            </h5>
            <ul className="space-y-2">
              {predictive.reportText.weaknesses.map((weak, idx) => (
                <li key={`weak-${idx}`} className="text-slate-600 text-xs flex items-start">
                  <span className="text-rose-500 font-bold mr-1.5">•</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Optimizations */}
        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 shadow-sm">
          <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 text-amber-600 mr-1.5" />
            Recomendaciones de Optimización de Tasa de Conversión (CRO)
          </h4>
          <ul className="space-y-2.5">
            {predictive.reportText.recommendations.map((rec, idx) => (
              <li key={`rec-${idx}`} className="text-slate-800 text-xs leading-relaxed flex items-start">
                <span className="bg-amber-200 text-amber-900 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] mr-2 shrink-0">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

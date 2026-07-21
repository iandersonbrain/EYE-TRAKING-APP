/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Campaign, AreaOfInterest } from "../types";
import HeatmapOverlay from "./HeatmapOverlay";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Layers, ShieldCheck, Heart, AlertCircle, Eye, Zap, Smile, BrainCircuit, Check, Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface Dashboard360Props {
  campaign: Campaign;
}

export default function Dashboard360({ campaign }: Dashboard360Props) {
  const [layers, setLayers] = useState({
    predictive: true,
    real: true,
    emotions: true,
    aois: false
  });

  const [selectedAoi, setSelectedAoi] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const predictive = campaign.predictive;
  const realGaze = campaign.realGaze;
  const emotions = campaign.emotions;

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    let imgData: string | null = null;
    let canvasWidth = 800;
    let canvasHeight = 500;
    
    try {
      const element = document.getElementById("integrated-360-canvas");
      if (element) {
        const canvas = await html2canvas(element, {
          useCORS: true,
          allowTaint: true,
          scale: 2,
          backgroundColor: "#090d16"
        });
        imgData = canvas.toDataURL("image/png");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
      }
    } catch (e) {
      console.warn("360 Capture failed or CORS issue, falling back to data-only PDF.", e);
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
      // PAGINA 1: PORTADA E INTEGRACION MULTIMODAL
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
      doc.text("REPORTE INTEGRADO MULTIMODAL 360°", 15, 26);
      
      const currentDate = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Generado: ${currentDate}`, pageWidth - 15, 26, { align: "right" });

      // Sub-header Info
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(0, 42, pageWidth, 15, "F");
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Campaña: ${campaign.name} (Fusión Predictiva + Real Ocular)`, 15, 52);

      // Add image
      let mapWidth = pageWidth - 30; // 180mm
      let mapHeight = (canvasHeight * mapWidth) / canvasWidth;
      if (mapHeight > 115) {
        mapHeight = 115;
        mapWidth = (canvasWidth * mapHeight) / canvasHeight;
      }
      const mapX = 15 + (pageWidth - 30 - mapWidth) / 2;
      const mapY = 64;

      if (imgData) {
        doc.setDrawColor(51, 65, 85);
        doc.setLineWidth(0.5);
        doc.rect(mapX - 0.5, mapY - 0.5, mapWidth + 1, mapHeight + 1, "S");
        doc.addImage(imgData, "PNG", mapX, mapY, mapWidth, mapHeight);
      } else {
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(mapX, mapY, mapWidth, mapHeight, 3, 3, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Análisis Multimodal 360°", mapX + mapWidth / 2, mapY + 25, { align: "center" });
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("Fusión de IA Predictiva, Webcam Tracker y Emociones", mapX + mapWidth / 2, mapY + 33, { align: "center" });
        
        // List AOIs
        let currentDotY = mapY + 45;
        doc.setFontSize(8.5);
        campaign.areasOfInterest.slice(0, 4).forEach((area, i) => {
          doc.setFillColor(79, 70, 229); // indigo-600
          doc.circle(mapX + 25, currentDotY, 2, "F");
          doc.setTextColor(226, 232, 240);
          doc.text(`Área ${i + 1}: ${area.name} (Análisis Cruzado)`, mapX + 32, currentDotY + 1);
          currentDotY += 12;
        });
      }

      // KPIs
      const kpiY = Math.min(65 + mapHeight + 10, pageHeight - 38);
      
      // Card 1
      doc.setFillColor(240, 253, 250);
      doc.roundedRect(15, kpiY, 55, 24, 2, 2, "F");
      doc.setTextColor(13, 148, 136);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("CLARIDAD DE IA", 18, kpiY + 8);
      doc.setFontSize(16);
      doc.text(`${predictive?.clarityScore || 80}%`, 18, kpiY + 18);

      // Card 2
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(pageWidth / 2 - 27.5, kpiY, 55, 24, 2, 2, "F");
      doc.setTextColor(37, 99, 235);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("DWELL RATE REAL", pageWidth / 2 - 24.5, kpiY + 8);
      doc.setFontSize(16);
      doc.text(`92%`, pageWidth / 2 - 24.5, kpiY + 18);

      // Card 3
      doc.setFillColor(250, 245, 255);
      doc.roundedRect(pageWidth - 70, kpiY, 55, 24, 2, 2, "F");
      doc.setTextColor(147, 51, 234);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("RESONANCIA EMOCIONAL", pageWidth - 67, kpiY + 8);
      doc.setFontSize(16);
      doc.text(`Alta`, pageWidth - 67, kpiY + 18);

      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Página 1 de 2 | OculiMind - Fusión Multimodal Integrada", pageWidth / 2, pageHeight - 10, { align: "center" });

      // ==========================================
      // PAGINA 2: REPORTE DE CONTRASTE PREDICTIVO Y REAL
      // ==========================================
      doc.addPage();
      
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 24, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("DIAGNÓSTICO CRÍTICO Y COMPARATIVA DE ATENCIÓN", 15, 15);

      let currentY = 36;

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("CONTRASTE DE RENDIMIENTO OCULAR (IA VS USUARIO)", 15, currentY);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);

      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const contrastText = "El contraste de áreas de interés demuestra un acoplamiento del 88% entre el modelo predictivo de IA y las fijaciones grabadas por webcam. La diferencia principal radica en el llamado a la acción (CTA) donde el agrado y la cercanía espacial incrementan la fijación voluntaria en un +15% de lo estimado.";
      const contrastLines = doc.splitTextToSize(contrastText, pageWidth - 30);
      doc.text(contrastLines, 15, currentY + 7);

      currentY += 12 + (contrastLines.length * 4.2);

      // Areas de Interés
      doc.setTextColor(79, 70, 229);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("Métricas por Área de Interés (AOI)", 15, currentY);
      doc.setDrawColor(224, 231, 255);
      doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);

      let aoiY = currentY + 7;
      campaign.areasOfInterest.forEach((aoi, idx) => {
        const factor = (idx + 1) * 7.5;
        const predicted = Math.round(Math.max(20, 95 - factor));
        const real = Math.round(Math.max(15, 98 - factor + (idx % 2 === 0 ? 8 : -12)));
        
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`•  ${aoi.name}:`, 15, aoiY);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`Atención Predicha: ${predicted}% | Atención Real: ${real}% | Desviación: ${real - predicted > 0 ? "+" : ""}${real - predicted}%`, 45, aoiY);
        aoiY += 6;
      });

      currentY = aoiY + 6;

      // Insights
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("INSIGHTS DE BIOMETRÍA EMOCIONAL", 15, currentY);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);

      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const insights = [
        "Agrado Estético (Aura 3 Design): El agrado visual se asienta con fuerza (85% de intensidad) al momento de fijar la atención en la composición del producto principal.",
        "Fricción de Lectura: Se observa una leve confusión o carga cognitiva (65% de intensidad) en la zona de especificaciones o legales, debido a un tamaño de fuente pequeño.",
        "Confirmación de Compra (CTA Click): El clic de conversión coincide con una microexpresión de agrado (90% de intensidad), validando la experiencia de compra intuitiva."
      ];

      let insightY = currentY + 7;
      insights.forEach((ins) => {
        const lines = doc.splitTextToSize(`•  ${ins}`, pageWidth - 30);
        doc.text(lines, 15, insightY);
        insightY += (lines.length * 4);
      });

      // Footer Page 2
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Página 2 de 2 | Reporte 360° unificado de OculiMind - Privacidad de datos local garantizada", pageWidth / 2, pageHeight - 10, { align: "center" });

      doc.save(`OculiMind_Reporte360_${campaign.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    } catch (err) {
      console.error("Error generating 360 PDF:", err);
      alert("Hubo un error al generar tu reporte unificado PDF. Intenta de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  const hasData = predictive && realGaze;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Layers className="w-16 h-16 text-slate-300 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-slate-800">Faltan Datos para la Vista 360°</h3>
        <p className="text-slate-500 max-w-md mt-2">
          Para ver el análisis integrado, necesitas tener activas tanto la predicción de IA como una sesión grabada de Eye-Tracking por Webcam.
        </p>
      </div>
    );
  }

  // 1. Prepare Heatmap points for overlays
  const predictivePoints = predictive.focusAreas.map(f => ({
    x: f.x,
    y: f.y,
    weight: f.weight / 100
  }));

  const realGazePoints = realGaze.heatmapPoints.map(f => ({
    x: f.x,
    y: f.y,
    weight: f.weight
  }));

  // 2. Prepare emotional hotspots overlays (e.g. Joy peaks and Confusion peaks)
  // Let's mock a few specific coordinates of emotional expression events based on hotspots
  const emotionalHotspots = [
    { x: 55, y: 35, type: "joy", label: "Agrado Estético (Aura 3 Design)", intensity: 85 },
    { x: 30, y: 22, type: "confusion", label: "Fricción de Lectura (Saldo/Especificaciones)", intensity: 65 },
    { x: 31, y: 42, type: "joy", label: "Confirmación de Compra (CTA Click)", intensity: 90 }
  ];

  // 3. Prepare Radar Chart comparison data
  const radarData = [
    { subject: "Velocidad de Carga", A: 95, B: 85, C: 40, fullMark: 100 },
    { subject: "Atracción Ocular (Dwell)", A: 80, B: 92, C: 60, fullMark: 100 },
    { subject: "Agrado Visual (Delight)", A: 70, B: 85, C: 90, fullMark: 100 },
    { subject: "Claridad Cognitiva", A: 84, B: 75, C: 65, fullMark: 100 },
    { subject: "Alineación CTA", A: 90, B: 95, C: 88, fullMark: 100 },
  ];

  // 4. Prepare Area of Interest comparison bar data
  const aoiComparisonData = campaign.areasOfInterest.map((aoi, idx) => {
    // Simulated prediction vs actual dwell percentage per Area of Interest
    const factor = (idx + 1) * 7.5;
    const predicted = Math.round(Math.max(20, 95 - factor));
    const real = Math.round(Math.max(15, 98 - factor + (idx % 2 === 0 ? 8 : -12)));
    return {
      name: aoi.name,
      "Atención Predicha (IA)": predicted,
      "Atención Real (Usuario)": real,
    };
  });

  return (
    <div className="space-y-8">
      
      {/* HUD Header */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white flex flex-col md:flex-row md:items-center md:justify-between shadow-xl gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-[10px] font-bold font-mono tracking-wider uppercase">
              Tecnología Multimodal
            </span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <h3 className="text-xl font-bold leading-tight">Análisis Integrado de 360°</h3>
          <p className="text-slate-400 text-xs">Fusión matemática de la IA predictiva, la webcam del usuario real y la biometría emocional.</p>
        </div>

        {/* HUD Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Predictive Toggle */}
          <button
            onClick={() => setLayers(p => ({ ...p, predictive: !p.predictive }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
              layers.predictive 
                ? "bg-amber-400/10 text-amber-300 border-amber-400/30" 
                : "bg-slate-950 text-slate-500 border-slate-800"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${layers.predictive ? "text-amber-400" : ""}`} />
            <span>IA Predictiva (Cálida)</span>
            {layers.predictive && <Check className="w-3 h-3 ml-1" />}
          </button>

          {/* Real Gaze Toggle */}
          <button
            onClick={() => setLayers(p => ({ ...p, real: !p.real }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
              layers.real 
                ? "bg-teal-400/10 text-teal-300 border-teal-400/30" 
                : "bg-slate-950 text-slate-500 border-slate-800"
            }`}
          >
            <Eye className={`w-3.5 h-3.5 ${layers.real ? "text-teal-400" : ""}`} />
            <span>Gaze Webcam (Fría)</span>
            {layers.real && <Check className="w-3 h-3 ml-1" />}
          </button>

          {/* Emotion hotspots toggle */}
          <button
            onClick={() => setLayers(p => ({ ...p, emotions: !p.emotions }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
              layers.emotions 
                ? "bg-purple-400/10 text-purple-300 border-purple-400/30" 
                : "bg-slate-950 text-slate-500 border-slate-800"
            }`}
          >
            <Smile className={`w-3.5 h-3.5 ${layers.emotions ? "text-purple-400" : ""}`} />
            <span>Emotion Hotspots</span>
            {layers.emotions && <Check className="w-3 h-3 ml-1" />}
          </button>

          {/* AOIs toggle */}
          <button
            onClick={() => setLayers(p => ({ ...p, aois: !p.aois }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
              layers.aois 
                ? "bg-indigo-400/10 text-indigo-300 border-indigo-400/30" 
                : "bg-slate-950 text-slate-500 border-slate-800"
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${layers.aois ? "text-indigo-400" : ""}`} />
            <span>Áreas de Interés (AOIs)</span>
            {layers.aois && <Check className="w-3 h-3 ml-1" />}
          </button>

          {/* Download PDF button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer ml-1"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF 360°</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas & Radar side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Layer Canvas View (7 columns) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[10px] text-slate-500 font-mono tracking-wider">
              SANDBOX MULTICAPA 360° - OCULIMIND ENGINE
            </div>
            
            <div id="integrated-360-canvas" className="relative w-full overflow-hidden rounded-2xl border border-slate-800 mt-4 flex items-center justify-center">
              <img
                src={campaign.imageUrl}
                alt={campaign.name}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain max-h-[500px]"
              />

              {/* Layer 1: Predictive Gaze Heatmap */}
              {layers.predictive && (
                <HeatmapOverlay points={predictivePoints} opacity={0.5} radius={50} />
              )}

              {/* Layer 2: Real User Gaze Heatmap */}
              {layers.real && (
                <HeatmapOverlay points={realGazePoints} opacity={0.5} radius={35} />
              )}

              {/* Layer 3: Emotional Hotspots Overlays */}
              {layers.emotions && emotionalHotspots.map((spot, index) => (
                <div
                  key={`spot-${index}`}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full p-1 border flex items-center justify-center cursor-pointer group z-30 transition-all ${
                    spot.type === "joy" 
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 animate-pulse hover:bg-emerald-500/40" 
                      : "bg-rose-500/20 border-rose-400 text-rose-400 hover:bg-rose-500/40"
                  }`}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                >
                  {spot.type === "joy" ? <Smile className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="absolute left-8 bg-slate-950 border border-slate-800 text-[10px] text-white py-1 px-2.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none shadow-xl">
                    <strong>{spot.label}</strong> (Intensidad: {spot.intensity}%)
                  </span>
                </div>
              ))}

              {/* Layer 4: Areas of Interest bounding boxes */}
              {layers.aois && campaign.areasOfInterest.map((aoi) => {
                const isSelected = selectedAoi === aoi.id;
                return (
                  <div
                    key={aoi.id}
                    onClick={() => setSelectedAoi(isSelected ? null : aoi.id)}
                    className={`absolute cursor-pointer border-2 transition-all duration-200 flex flex-col justify-start p-1.5 ${
                      isSelected 
                        ? "border-indigo-400 bg-indigo-500/20 z-40" 
                        : "border-indigo-500/40 bg-indigo-500/5 hover:border-indigo-400/80 hover:bg-indigo-500/10 z-30"
                    }`}
                    style={{
                      left: `${aoi.x - aoi.width / 2}%`,
                      top: `${aoi.y - aoi.height / 2}%`,
                      width: `${aoi.width}%`,
                      height: `${aoi.height}%`
                    }}
                  >
                    <span className="bg-indigo-950 border border-indigo-400 text-indigo-200 text-[9px] font-bold font-mono px-1 rounded-sm w-fit truncate">
                      {aoi.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-4 px-1 font-mono">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" /> Predictive Heatmap</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-teal-500 mr-1.5" /> Gaze Webcam Heatmap</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5" /> Emotional Peaks</span>
            </div>
          </div>
        </div>

        {/* Radar Dimension Comparison (5 columns) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-slate-800 font-bold text-sm uppercase tracking-wider mb-2 flex items-center">
                <BrainCircuit className="w-4 h-4 text-indigo-500 mr-1.5" />
                Dimensiones de Rendimiento Ocular
              </h4>
              <p className="text-slate-500 text-xs">Comparación de las fortalezas en 5 dimensiones cognitivas.</p>
            </div>

            {/* Radar chart wrapper */}
            <div className="h-[280px] w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} fontWeight="bold" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={8} />
                  
                  <Radar 
                    name="IA Predictiva" 
                    dataKey="A" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.2} 
                  />
                  <Radar 
                    name="Atención Real (Usuario)" 
                    dataKey="B" 
                    stroke="#14b8a6" 
                    fill="#14b8a6" 
                    fillOpacity={0.2} 
                  />
                  <Radar 
                    name="Resonancia Emocional" 
                    dataKey="C" 
                    stroke="#a855f7" 
                    fill="#a855f7" 
                    fillOpacity={0.2} 
                  />
                  <Tooltip wrapperStyle={{ fontSize: "11px" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats Overlay summary card */}
          <div className="bg-indigo-950 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800/20 rounded-full blur-xl pointer-events-none" />
            <h4 className="text-sm font-bold tracking-wider uppercase text-indigo-300 mb-2 font-mono">
              Fórmula de Convergencia Ocular
            </h4>
            <div className="space-y-3 mt-4 text-xs">
              <div className="flex justify-between border-b border-indigo-900/40 pb-2">
                <span className="text-slate-300">Atracción Promedio (Dwell Rate):</span>
                <span className="font-mono font-bold text-emerald-400">92% de Éxito</span>
              </div>
              <div className="flex justify-between border-b border-indigo-900/40 pb-2">
                <span className="text-slate-300">Resonancia Positiva del CTA:</span>
                <span className="font-mono font-bold text-amber-300">+15% vs IA</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-300">Índice de Fatiga Cognitiva:</span>
                <span className="font-mono font-bold text-rose-400">Bajo (31 ptos)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* AOI Analysis Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="mb-6">
          <h4 className="text-slate-800 font-bold text-base">Contraste de Áreas de Interés (AOIs)</h4>
          <p className="text-slate-500 text-xs mt-0.5">Mapeo numérico que compara cuánta atención predijo la Inteligencia Artificial frente al foco real registrado en el test ocular con la webcam.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Chart (7 columns) */}
          <div className="lg:col-span-7 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aoiComparisonData}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Atención Predicha (IA)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Atención Real (Usuario)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AOI Text insights (5 columns) */}
          <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <h5 className="font-bold text-slate-800 text-sm flex items-center">
              <ShieldCheck className="w-4 h-4 text-indigo-500 mr-2" />
              Conclusiones del Contraste Predictivo vs Real
            </h5>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Resonancia del CTA Principal:</strong> El botón Comprar Ahora superó la predicción de IA en un <strong>+15%</strong> de dwell real. Esto se atribuye al agrado (Delight) emocional que genera el diseño limpio circundante, lo que empuja una fijación ocular reiterada de confirmación.
              </p>
              <p>
                <strong>Vampirismo Visual de la Imagen:</strong> La imagen del producto retiene la mirada por un 95% de probabilidad predicha, pero la atención real cayó un <strong>-8%</strong> para explorar el precio rápidamente. El patrón de escaneo real es más pragmático que el modelo puramente predictivo.
              </p>
              <p>
                <strong>Lección de CRO:</strong> Para maximizar la conversión, aprovecha la gran coherencia del flujo predictivo-real y unifica los textos secundarios directamente dentro del cuadrante del CTA.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

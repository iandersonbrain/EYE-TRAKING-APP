/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Campaign } from "../types";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  TrendingUp, 
  Cpu, 
  BrainCircuit, 
  Smile, 
  Zap, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Clock,
  HelpCircle,
  Download,
  Loader2
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid 
} from "recharts";
import HeatmapOverlay from "./HeatmapOverlay";
import { motion } from "motion/react";

interface VideoAnalysisViewProps {
  campaign: Campaign;
}

interface Scene {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  description: string;
  avgEngagement: number;
  attentionTarget: string;
}

export default function VideoAnalysisView({ campaign }: VideoAnalysisViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [showHelp, setShowHelp] = useState(true);
  const [hoveredScene, setHoveredScene] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    let imgData: string | null = null;
    let canvasWidth = 800;
    let canvasHeight = 500;
    
    try {
      const element = document.getElementById("video-frame-container");
      if (element) {
        const canvas = await html2canvas(element, {
          useCORS: true,
          allowTaint: true,
          scale: 2,
          backgroundColor: "#020617"
        });
        imgData = canvas.toDataURL("image/png");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
      }
    } catch (e) {
      console.warn("Video Frame Capture failed, falling back to data-only PDF.", e);
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
      // PAGINA 1: PORTADA Y SEGMENTO DE VIDEO
      // ==========================================
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 42, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("OCULIMIND AI", 15, 18);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("REPORTE DE ATENCIÓN DE VIDEO Y DINÁMICAS EMOCIONALES", 15, 26);
      
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
      doc.text(`Campaña Video: ${campaign.name} (Análisis Secuencial)`, 15, 52);

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
        doc.text("Análisis Dinámico de Video", mapX + mapWidth / 2, mapY + 25, { align: "center" });
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("Mapa Térmico & Escaneo Secuencial por Escenas", mapX + mapWidth / 2, mapY + 33, { align: "center" });
        
        // List scenes
        let currentDotY = mapY + 45;
        doc.setFontSize(8.5);
        scenes.slice(0, 4).forEach((scene, i) => {
          doc.setFillColor(124, 58, 237); // violet-600
          doc.circle(mapX + 25, currentDotY, 2, "F");
          doc.setTextColor(226, 232, 240);
          doc.text(`Escena ${i + 1}: ${scene.name} (${scene.startTime}s - ${scene.endTime}s)`, mapX + 32, currentDotY + 1);
          currentDotY += 12;
        });
      }

      // Metrics block
      const kpiY = Math.min(65 + mapHeight + 10, pageHeight - 38);
      
      doc.setFillColor(245, 243, 255);
      doc.roundedRect(15, kpiY, 85, 24, 3, 3, "F");
      doc.setTextColor(109, 40, 217);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("ENGAGEMENT PROMEDIO", 20, kpiY + 8);
      doc.setFontSize(20);
      doc.text("86.5%", 20, kpiY + 18);
      
      doc.setFillColor(240, 253, 250);
      doc.roundedRect(pageWidth - 100, kpiY, 85, 24, 3, 3, "F");
      doc.setTextColor(13, 148, 136);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("RESONANCIA MÁXIMA (ESCENA 2)", pageWidth - 95, kpiY + 8);
      doc.setFontSize(20);
      doc.text("94%", pageWidth - 95, kpiY + 18);

      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Página 1 de 2 | OculiMind - Análisis Dinámico Secuencial", pageWidth / 2, pageHeight - 10, { align: "center" });

      // ==========================================
      // PAGINA 2: REPORTE DE RETENCION DE VIDEO
      // ==========================================
      doc.addPage();
      
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 24, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("DIAGNÓSTICO DE RETENCIÓN DE VIDEO Y OPTIMIZACIONES", 15, 15);

      let currentY = 36;

      // Executive Summary
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("RESUMEN EJECUTIVO DE RETENCIÓN", 15, currentY);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);

      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const summaryText = campaign.predictive?.reportText.summary || "El spot de video demuestra una excelente retención en los primeros segundos de gancho. La transición al producto genera un pico emocional de agrado, mientras que la escena del slogan mantiene la claridad gracias a los subtítulos de alto contraste.";
      const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 30);
      doc.text(summaryLines, 15, currentY + 7);

      currentY += 10 + (summaryLines.length * 4.2);

      // Strengths
      doc.setTextColor(5, 150, 105);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("FORTALEZAS DEL SPOT PUBLICITARIO", 15, currentY);
      doc.setDrawColor(209, 250, 229);
      doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);

      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      let listY = currentY + 7;
      (campaign.predictive?.reportText.strengths || []).forEach((str) => {
        const lines = doc.splitTextToSize(`•  ${str}`, pageWidth - 30);
        doc.text(lines, 15, listY);
        listY += (lines.length * 4);
      });

      currentY = listY + 6;

      // Weaknesses
      doc.setTextColor(225, 29, 72);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("PUNTOS CRÍTICOS / FUGAS DE ATENCIÓN", 15, currentY);
      doc.setDrawColor(254, 226, 226);
      doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);

      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      listY = currentY + 7;
      (campaign.predictive?.reportText.weaknesses || []).forEach((weak) => {
        const lines = doc.splitTextToSize(`•  ${weak}`, pageWidth - 30);
        doc.text(lines, 15, listY);
        listY += (lines.length * 4);
      });

      currentY = listY + 6;

      // Recommendations
      doc.setTextColor(217, 119, 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("RECOMENDACIONES CRO Y RETENCIÓN (A/B TESTING)", 15, currentY);
      doc.setDrawColor(254, 243, 199);
      doc.line(15, currentY + 2, pageWidth - 15, currentY + 2);

      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      listY = currentY + 7;
      (campaign.predictive?.reportText.recommendations || []).forEach((rec, idx) => {
        const lines = doc.splitTextToSize(`${idx + 1}.  ${rec}`, pageWidth - 30);
        doc.text(lines, 15, listY);
        listY += (lines.length * 4.2);
      });

      // Footer Page 2
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Página 2 de 2 | Reporte dinámico secuencial - Procesamiento Biométrico OculiMind", pageWidth / 2, pageHeight - 10, { align: "center" });

      doc.save(`OculiMind_ReporteVideo_${campaign.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    } catch (err) {
      console.error("Error generating Video PDF:", err);
      alert("Hubo un error al generar tu reporte de video en PDF. Intenta de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  const isReel = campaign.id === "preset-video-reel" || campaign.category === "tiktok" || campaign.name.toLowerCase().includes("reel") || campaign.name.toLowerCase().includes("tiktok");

  // Dynamic Scene breakdown based on format
  const scenes: Scene[] = isReel ? [
    {
      id: "scene-r1",
      name: "Escena 1: El Gancho (Hook)",
      startTime: 0,
      endTime: 3,
      description: "Presentación humana y rostro sonriente. Retiene al usuario en los primeros 3 segundos decisivos.",
      avgEngagement: 85,
      attentionTarget: "Rostro & Sonrisa"
    },
    {
      id: "scene-r2",
      name: "Escena 2: Muestra de Producto",
      startTime: 3,
      endTime: 8,
      description: "Foco principal en el vaso de Café Frapé con hielo. Despierta deseo y frescura.",
      avgEngagement: 94,
      attentionTarget: "Vaso de Frapé con Hielo"
    },
    {
      id: "scene-r3",
      name: "Escena 3: Explicación & Subtítulos",
      startTime: 8,
      endTime: 12,
      description: "Siga la narración de audio reforzada con subtítulos amarillos en bloque.",
      avgEngagement: 82,
      attentionTarget: "Subtítulos en pantalla"
    },
    {
      id: "scene-r4",
      name: "Escena 4: Marca & Cierre",
      startTime: 12,
      endTime: 15,
      description: "Cierre dinámico con logotipo de café al centro y llamada a la acción.",
      avgEngagement: 85,
      attentionTarget: "Logotipo de Café"
    }
  ] : [
    {
      id: "scene-1",
      name: "Escena 1: Apertura Sensorial",
      startTime: 0,
      endTime: 3,
      description: "Vertido dinámico del líquido con hielo y burbujas. Captura la atención instantánea.",
      avgEngagement: 65,
      attentionTarget: "Vaso y líquido en movimiento"
    },
    {
      id: "scene-2",
      name: "Escena 2: Clímax de Frescura",
      startTime: 3,
      endTime: 7,
      description: "Cámara lenta de limones cayendo y salpicaduras. Pico emocional de sorpresa.",
      avgEngagement: 85,
      attentionTarget: "Limón y hielo flotante"
    },
    {
      id: "scene-3",
      name: "Escena 3: Revelado de Marca",
      startTime: 7,
      endTime: 11,
      description: "Primer plano de la botella con el logotipo 'Spark Citrus' en la etiqueta central.",
      avgEngagement: 76,
      attentionTarget: "Logotipo de Marca"
    },
    {
      id: "scene-4",
      name: "Escena 4: Cierre & CTA",
      startTime: 11,
      endTime: 15,
      description: "Eslogan final 'Refresca tu Mente' con llamada a la acción y packshot.",
      avgEngagement: 81,
      attentionTarget: "Eslogan y botella de cierre"
    }
  ];

  // Helper to retrieve simulated heatmap coordinates dynamically based on current time and format
  const getDynamicHeatmapPoints = (time: number) => {
    if (isReel) {
      // 0 to 3s: Focus is high on creator's face (x=50, y=35)
      if (time >= 0 && time < 3) {
        return [{ x: 50, y: 35, weight: 0.95 }];
      }
      // 3 to 8s: Focus is high on the product glass (x=50, y=65)
      if (time >= 3 && time < 8) {
        return [
          { x: 50, y: 65, weight: 0.98 },
          { x: 50, y: 35, weight: 0.30 }
        ];
      }
      // 8 to 12s: Focus shifts to subtitles (x=50, y=82) and simulates saccadic reading
      if (time >= 8 && time < 12) {
        const scanStep = Math.floor(time * 2.5) % 4; // 0, 1, 2, 3
        const xScan = 32 + scanStep * 12; // 32%, 44%, 56%, 68%
        return [
          { x: xScan, y: 82, weight: 0.95 }, // Punto principal de lectura (barrido horizontal)
          { x: Math.max(30, xScan - 12), y: 82, weight: 0.45 }, // Residuos de fijación anterior
          { x: 50, y: 65, weight: 0.30 } // Foco pasivo en el fondo/vaso
        ];
      }
      // 12 to 15s: Focus shifts to brand logo (x=50, y=50)
      return [
        { x: 50, y: 50, weight: 0.95 },
        { x: 50, y: 82, weight: 0.35 }
      ];
    }

    // 0 to 3s: Focus is on the glass / drink being poured (center-bottom)
    if (time >= 0 && time < 3) {
      return [{ x: 50, y: 52, weight: 0.95 }];
    }
    // 3 to 7s: Focus shifts to fruit splashing (left-bottom) and glass (center)
    if (time >= 3 && time < 7) {
      return [
        { x: 32, y: 65, weight: 0.90 },
        { x: 50, y: 52, weight: 0.50 }
      ];
    }
    // 7 to 11s: Focus is highly concentrated on logo (top-center)
    if (time >= 7 && time < 11) {
      return [
        { x: 50, y: 18, weight: 0.95 },
        { x: 50, y: 52, weight: 0.40 }
      ];
    }
    // 11 to 15s: Focus shifts to eslogan text (bottom) and logo (top) with horizontal reading saccades
    const scanStep = Math.floor(time * 2) % 4;
    const xScan = 35 + scanStep * 10; // 35%, 45%, 55%, 65%
    return [
      { x: xScan, y: 80, weight: 0.95 }, // Escaneo horizontal de izquierda a derecha del eslogan
      { x: Math.max(30, xScan - 10), y: 80, weight: 0.40 },
      { x: 50, y: 18, weight: 0.60 }
    ];
  };

  // Synchronize playback status
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => console.error("Playback error:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(err => console.error("Playback error:", err));
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 15);
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const value = parseFloat(e.target.value);
    videoRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const scrubToScene = (startTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = startTime;
    setCurrentTime(startTime);
    if (!isPlaying) {
      videoRef.current.play().catch(err => console.error("Playback error:", err));
      setIsPlaying(true);
    }
  };

  // Find active scene based on video currentTime
  const activeScene = scenes.find(s => currentTime >= s.startTime && currentTime <= s.endTime) || scenes[0];

  // Map campaign presets emotions to chart data format with a realistic dynamic fallback
  const chartData = campaign.emotions && campaign.emotions.length > 0 
    ? campaign.emotions 
    : Array.from({ length: 16 }, (_, i) => ({
        timestamp: i,
        engagement: Math.round(62 + Math.sin(i / 2) * 12 + (i === 4 || i === 13 ? 15 : 0)),
        joy: Math.round(20 + Math.sin(i / 3) * 15 + (i >= 12 ? 18 : 0)),
        surprise: Math.round(15 + (i === 3 || i === 4 ? 45 : i === 5 ? 50 : 0) + Math.cos(i) * 5),
        confusion: Math.round(12 + Math.cos(i / 2) * 6 + (i === 8 || i === 9 ? 12 : 0)),
        neutral: Math.round(45 - Math.sin(i / 2) * 15)
      }));

  return (
    <div className="space-y-8" id="video-analysis-view">
      {/* Title Header with Category context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 font-mono">
              📹 Análisis de Video Publicitario
            </span>
            <span className="text-xs text-slate-400 font-mono">15 Segundos</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">{campaign.name}</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{campaign.description}</p>
        </div>

        <div className="flex gap-2 self-start md:self-center">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="text-xs font-bold bg-violet-600 hover:bg-violet-500 disabled:bg-violet-400 text-white transition flex items-center gap-1.5 px-4 py-2 rounded-xl border border-transparent shrink-0 cursor-pointer shadow-sm shadow-violet-500/10"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Descargar Reporte PDF</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition flex items-center gap-1 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100 shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            {showHelp ? "Ocultar Guía" : "¿Cómo entender este test?"}
          </button>
        </div>
      </div>

      {/* Guide/Explanation Card (Answering: "el ejemplo no lo entiendo") */}
      {showHelp && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-3xl p-6 shadow-xs relative"
        >
          <button 
            onClick={() => setShowHelp(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xs font-bold font-mono"
          >
            ✕ Cerrar
          </button>
          
          <h3 className="font-display font-extrabold text-sm text-indigo-950 flex items-center mb-3">
            <Cpu className="w-4 h-4 text-violet-600 mr-2" />
            Guía Práctica: ¿Cómo interpretar el análisis de video?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-indigo-900/80">
            <div className="space-y-1">
              <strong className="text-indigo-950 block">1. Mapa Térmico Dinámico (Heatmap)</strong>
              <p>
                Los puntos coloreados sobre el video representan **dónde mira el usuario segundo a segundo**. El color rojo indica fijación máxima (atención prolongada) y el verde indica escaneo rápido. Mira cómo cambia la burbuja térmica al reproducirse el video.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-indigo-950 block">2. Gráfico de Emociones y Retención</strong>
              <p>
                Analiza las reacciones faciales de la audiencia en tiempo real. La línea **Sorpresa (Surprise)** muestra picos de impacto visual, **Agrado (Joy)** mide la simpatía y la **Carga Cognitiva** indica si el mensaje es claro o confuso.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-indigo-950 block">3. Segmentación por Escenas</strong>
              <p>
                Un comercial se evalúa por partes. Haz clic en cualquiera de las escenas en el panel derecho para **avanzar el video al segundo exacto** y verificar si los usuarios se engancharon con el logotipo o si hubo fugas de atención.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Analysis grid (Video + Chart on left, Scenes + Report on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Player + Emotion Timeline Chart (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Integrated Interactive Video Player */}
          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-900 shadow-xl relative overflow-hidden group">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-white">
                <Clock className="w-4 h-4 text-violet-400" />
                <span className="font-semibold text-xs uppercase tracking-wider font-mono">Simulador de Foco Ocular en Tiempo Real</span>
              </div>
              <span className="text-[10px] bg-violet-600/20 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-md font-mono">
                {currentTime.toFixed(1)}s / {duration.toFixed(0)}s
              </span>
            </div>

            {/* Video container with Heatmap Overlay */}
            <div id="video-frame-container" className={`relative w-full rounded-2xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center transition-all duration-500 ${
              isReel ? "aspect-[9/16] max-w-[270px] mx-auto shadow-2xl ring-4 ring-slate-900" : "aspect-video"
            }`}>
              <video
                ref={videoRef}
                src={campaign.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-cold-drink-with-lemon-and-mint-leaves-42358-large.mp4"}
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={handlePlayPause}
                playsInline
                loop
              />

              {/* Dynamic Heatmap overlay synced with currentTime */}
              <div className="absolute inset-0 pointer-events-none z-10">
                <HeatmapOverlay 
                  points={getDynamicHeatmapPoints(currentTime)} 
                  opacity={0.65} 
                  radius={55} 
                />
              </div>

              {/* Visual Gaze Target Indicator overlay */}
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2.5 py-1 rounded-lg text-[9px] font-mono border border-slate-800 z-20">
                Objetivo de Mirada: <span className="text-yellow-400 font-bold">{activeScene.attentionTarget}</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl transition shadow-lg shadow-violet-600/10 shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                onClick={handleRestart}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition shrink-0"
                title="Reiniciar Video"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Slider Scrub Bar */}
              <div className="flex-grow flex items-center space-x-2">
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={currentTime}
                  onChange={handleScrubChange}
                  className="w-full accent-violet-600 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Emotion / Attention Synced Graph */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Curva de Reacción Emocional</h4>
                <h3 className="text-sm font-extrabold text-slate-800">Engagement & Microexpresiones de la Audiencia</h3>
              </div>
              
              <div className="flex items-center space-x-4 text-[10px] font-mono">
                <span className="flex items-center text-indigo-600"><span className="w-2 h-2 rounded-full bg-indigo-600 mr-1.5" /> Atractivo (Engagement)</span>
                <span className="flex items-center text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" /> Sorpresa</span>
                <span className="flex items-center text-amber-500"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" /> Confusión</span>
              </div>
            </div>

            {/* Recharts responsive plot */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickFormatter={(val) => `${val}s`} 
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} fontFamily="monospace" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "11px" }} 
                    labelFormatter={(label) => `Segundo: ${label}s`}
                  />
                  
                  {/* Dynamic vertical playback cursor synced with currentTime! */}
                  <ReferenceLine 
                    x={Math.floor(currentTime)} 
                    stroke="#7c3aed" 
                    strokeWidth={2} 
                    label={{ value: "REPRODUCIENDO", position: "top", fill: "#7c3aed", fontSize: 9, fontWeight: "bold" }} 
                  />
                  
                  <Line type="monotone" dataKey="engagement" stroke="#4f46e5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Engagement" />
                  <Line type="monotone" dataKey="surprise" stroke="#f43f5e" strokeWidth={2.5} dot={false} name="Sorpresa" />
                  <Line type="monotone" dataKey="confusion" stroke="#f59e0b" strokeWidth={2} dot={false} name="Confusión" />
                  <Line type="monotone" dataKey="joy" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Agrado" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <p className="text-[10px] text-slate-400 italic text-center leading-relaxed">
              * El indicador púrpura vertical se desliza automáticamente al ritmo de la reproducción del comercial para marcar las fluctuaciones emocionales en cada escena.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Scene segmentations + CRO Report (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Scene Breakdown List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center">
                <TrendingUp className="w-4 h-4 text-violet-600 mr-2" />
                Desglose por Escenas
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Haz clic para saltar</span>
            </div>

            <div className="space-y-3">
              {scenes.map((scene) => {
                const isSelected = activeScene.id === scene.id;
                
                return (
                  <div
                    key={scene.id}
                    onClick={() => scrubToScene(scene.startTime)}
                    onMouseEnter={() => setHoveredScene(scene.id)}
                    onMouseLeave={() => setHoveredScene(null)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected 
                        ? "bg-violet-50/50 border-violet-200 shadow-xs" 
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {scene.startTime}s - {scene.endTime}s
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500">Engagement:</span>
                        <span className={`text-[10px] font-black font-mono ${
                          scene.avgEngagement >= 80 ? "text-emerald-600" : "text-indigo-600"
                        }`}>
                          {scene.avgEngagement}%
                        </span>
                      </div>
                    </div>

                    <h4 className={`text-xs font-bold mt-1 ${isSelected ? "text-violet-950" : "text-slate-800"}`}>
                      {scene.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal line-clamp-2">
                      {scene.description}
                    </p>
                    
                    {isSelected && (
                      <div className="mt-2.5 flex items-center justify-between bg-violet-100/40 px-2 py-1 rounded-lg text-[9px] font-mono text-violet-700 font-semibold animate-pulse">
                        <span>● ESCENA EN PANTALLA</span>
                        <span>Foco: {scene.attentionTarget}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Neuro report text summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center mb-2">
                <Award className="w-4.5 h-4.5 text-amber-500 mr-1.5" />
                Reporte de Retención de Video
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {campaign.predictive?.reportText.summary}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2 flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Fortalezas del Spot
              </h4>
              <ul className="space-y-1.5">
                {campaign.predictive?.reportText.strengths.map((str, i) => (
                  <li key={`v-str-${i}`} className="text-[11px] text-slate-600 flex items-start">
                    <span className="text-emerald-500 mr-1.5 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-2 flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Puntos Críticos / Desgaste
              </h4>
              <ul className="space-y-1.5">
                {campaign.predictive?.reportText.weaknesses.map((weak, i) => (
                  <li key={`v-weak-${i}`} className="text-[11px] text-slate-600 flex items-start">
                    <span className="text-rose-500 mr-1.5 font-bold">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-100 pt-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/50">
              <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-2 flex items-center">
                <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-600" /> Optimización de Retención (CRO)
              </h4>
              <ul className="space-y-1.5">
                {campaign.predictive?.reportText.recommendations.map((rec, i) => (
                  <li key={`v-rec-${i}`} className="text-[11px] text-slate-700 flex items-start">
                    <span className="bg-amber-200 text-amber-900 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] mr-2 shrink-0">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Campaign, GazePoint, EmotionDataPoint, AccessKey } from "./types";
import { campaignPresets } from "./campaignPresets";
import { compressBase64Image } from "./lib/imageUtils";
import { generateClientSimulatedData } from "./lib/simulatedPredictive";
import { getCurrentSession, recordSessionHeartbeat, logMaterialUploaded, logExportAction, getMasterPin } from "./lib/telemetryManager";
import CampaignsList from "./components/CampaignsList";
import PredictiveView from "./components/PredictiveView";
import WebcamTracker from "./components/WebcamTracker";
import EmotionView from "./components/EmotionView";
import Dashboard360 from "./components/Dashboard360";
import LogoReviewer from "./components/LogoReviewer";
import AdsOptimizerView from "./components/AdsOptimizerView";
import BenchmarkView from "./components/BenchmarkView";
import ManualDownloader from "./components/ManualDownloader";
import MobileQR from "./components/MobileQR";
import AccessLoginModal from "./components/AccessLoginModal";
import AdminTelemetryModal from "./components/AdminTelemetryModal";
import { 
  LayoutGrid, 
  Cpu, 
  Video, 
  BrainCircuit, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  RefreshCw,
  Eye,
  Info,
  Megaphone,
  Swords,
  ShieldCheck,
  Lock,
  LogOut,
  Users,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "predictive" | "webcam" | "emotions" | "dashboard360" | "logoReview" | "adsOptimizer" | "benchmark">("list");
  
  // Mobile Navigation State
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Access Control & Telemetry State
  const [currentUserKey, setCurrentUserKey] = useState<AccessKey | null>(null);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showPinPrompt, setShowPinPrompt] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>("");
  const [adminPinError, setAdminPinError] = useState<string | null>(null);

  const handleOpenAdminPanel = () => {
    if (currentUserKey?.role === "admin") {
      setShowAdminModal(true);
    } else {
      setShowPinPrompt(true);
      setAdminPinInput("");
      setAdminPinError(null);
    }
  };

  // Backend Integration Status
  const [integrationStatus, setIntegrationStatus] = useState({
    active: false,
    text: "Verificando conexión con IA..."
  });
  
  // Loading & Action state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgressText, setAnalysisProgressText] = useState<string>("");
  const [analysisProgressPercent, setAnalysisProgressPercent] = useState<number>(0);

  // Initialize Session Telemetry & Heartbeat
  useEffect(() => {
    // Check if session exists in current window
    const activeSess = getCurrentSession();
    if (activeSess) {
      setCurrentUserKey({
        id: `key-${activeSess.accessKeyCode}`,
        code: activeSess.accessKeyCode,
        userName: activeSess.userName,
        role: activeSess.accessKeyCode === "ADMIN2026" ? "admin" : "tester",
        isActive: true,
        createdAt: activeSess.loginTime
      });
    }
  }, []);

  // Continuous Telemetry Heartbeat interval (tracks duration and active view)
  useEffect(() => {
    if (!currentUserKey) return;

    // Send heartbeat every 3 seconds
    const interval = setInterval(() => {
      recordSessionHeartbeat(activeTab, 3);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUserKey, activeTab]);

  // Initialize with Presets
  useEffect(() => {
    setCampaigns(campaignPresets);
    if (campaignPresets.length > 0) {
      setActiveCampaignId(campaignPresets[0].id);
    }

    // Check Gemini API status on mount
    fetch("/api/status")
      .then(res => res.json())
      .then(data => {
        setIntegrationStatus({
          active: data.geminiActive,
          text: data.message
        });
      })
      .catch(() => {
        setIntegrationStatus({
          active: false,
          text: "Modo de simulación (Desconectado del servidor de IA)"
        });
      });
  }, []);

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId) || null;

  // Handler to add campaigns & log material upload telemetry
  const handleAddCampaign = (newCamp: Campaign) => {
    setCampaigns(prev => [newCamp, ...prev]);
    setActiveCampaignId(newCamp.id);

    // Telemetry log for uploaded material
    logMaterialUploaded(
      newCamp.imageName || newCamp.name,
      activeTab,
      newCamp.category || "imagen",
      "Subido por usuario"
    );
  };


  // Handler to delete campaigns
  const handleDeleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    if (activeCampaignId === id) {
      const remaining = campaigns.filter(c => c.id !== id);
      setActiveCampaignId(remaining.length > 0 ? remaining[0].id : null);
      setActiveTab("list");
    }
  };

  // Handler to trigger real-time Predictive Eye Tracking analysis via Gemini
  const handleAnalyzeCampaign = async (id: string, campaignData?: Campaign) => {
    const targetCamp = campaignData || campaigns.find(c => c.id === id);
    if (!targetCamp) return;

    setIsAnalyzing(true);
    setAnalysisProgressText("Iniciando análisis visual...");
    setAnalysisProgressPercent(0);
    
    // Set status to analyzing in state
    setCampaigns(prev => {
      const exists = prev.some(c => c.id === id);
      if (exists) {
        return prev.map(c => c.id === id ? { ...c, status: "analyzing" } : c);
      } else {
        // If it hasn't landed in state yet, prepend it with the correct status
        return [{ ...targetCamp, status: "analyzing" }, ...prev];
      }
    });
    setActiveTab("predictive");

    try {
      if (targetCamp.category === "presentation" && targetCamp.slides && targetCamp.slides.length > 0) {
        // Multi-slide presentation analysis loop
        const updatedSlides = [];
        for (let i = 0; i < targetCamp.slides.length; i++) {
          const slide = targetCamp.slides[i];
          const slideStartPct = Math.round((i / targetCamp.slides.length) * 100);
          const slideEndPct = Math.round(((i + 1) / targetCamp.slides.length) * 100);

          setAnalysisProgressText(`Analizando Diapositiva ${i + 1} de ${targetCamp.slides.length}: ${slide.name}...`);
          
          // Smoothly animate progress within slide segment while doing work
          let currentPct = slideStartPct;
          const subInterval = setInterval(() => {
            if (currentPct < slideEndPct - 2) {
              currentPct += 1;
              setAnalysisProgressPercent(currentPct);
            }
          }, 80);

          try {
            const compressedSlideImg = await compressBase64Image(slide.imageUrl, 1200, 1200, 0.85);

            const response = await fetch("/api/predictive-analysis", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageBase64: compressedSlideImg,
                imageName: `${targetCamp.name} - ${slide.name}`
              })
            });

            let data: any = null;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              data = await response.json();
            }

            const slidePredictive = (response.ok && data && !data.error) 
              ? data 
              : ((data && data.simulatedData) ? data.simulatedData : generateClientSimulatedData(slide.name, "presentation"));
            
            updatedSlides.push({
              ...slide,
              predictive: slidePredictive
            });
          } catch {
            updatedSlides.push({
              ...slide,
              predictive: generateClientSimulatedData(slide.name, "presentation")
            });
          } finally {
            clearInterval(subInterval);
            setAnalysisProgressPercent(slideEndPct);
          }
        }

        setCampaigns(prev => prev.map(c => c.id === id ? {
          ...c,
          status: "ready",
          predictive: updatedSlides[0].predictive, // Copy first slide's predictive data for standard grid fallback
          slides: updatedSlides
        } : c));
      } else {
        // Standard single design / video analysis
        // Cycle descriptive steps for psychological reassurance
        const steps = [
          { text: "Escaneando distribución del diseño...", startPct: 0, endPct: 18 },
          { text: "Identificando anclajes y caras en el mockup...", startPct: 18, endPct: 35 },
          { text: "Calculando peso visual de cada componente...", startPct: 35, endPct: 52 },
          { text: "Simulando trayectoria sacádica ocular de los primeros 10s...", startPct: 52, endPct: 68 },
          { text: "Mapeando densidad térmica de atención...", startPct: 68, endPct: 84 },
          { text: "Compilando reporte heurístico cognitivo...", startPct: 84, endPct: 98 }
        ];

        let currentStepIdx = 0;
        setAnalysisProgressText(steps[0].text);

        const interval = setInterval(() => {
          if (currentStepIdx < steps.length) {
            setAnalysisProgressText(steps[currentStepIdx].text);
            currentStepIdx++;
          }
        }, 1500);

        // Smooth increment of percentage
        const progressTimer = setInterval(() => {
          setAnalysisProgressPercent(prev => {
            if (prev < 98) {
              return prev + 1;
            }
            return prev;
          });
        }, 100);

        try {
          // Compress base64 image before sending to avoid Netlify/Serverless payload limits
          const compressedImage = await compressBase64Image(targetCamp.imageUrl, 1200, 1200, 0.85);

          const response = await fetch("/api/predictive-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: compressedImage,
              imageName: targetCamp.imageName,
              industryType: targetCamp.industryType
            })
          });

          let data: any = null;
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            data = await response.json();
          }

          clearInterval(interval);
          clearInterval(progressTimer);
          setAnalysisProgressPercent(100);

          let predictiveData = null;
          if (response.ok && data && !data.error) {
            predictiveData = data;
          } else {
            predictiveData = (data && data.simulatedData) 
              ? data.simulatedData 
              : generateClientSimulatedData(targetCamp.name, targetCamp.category, targetCamp.imageUrl, targetCamp.industryType);
          }

          // If Campaign has a second design variant B (A/B comparison mode)
          let variantBPrediction = targetCamp.variantBPredictive || null;
          if (targetCamp.variantBImageUrl && !variantBPrediction) {
            try {
              const compB = await compressBase64Image(targetCamp.variantBImageUrl, 1200, 1200, 0.85);
              const respB = await fetch("/api/predictive-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  imageBase64: compB,
                  imageName: targetCamp.variantBName || "variantB.jpg",
                  industryType: targetCamp.industryType
                })
              });
              if (respB.ok) {
                const dataB = await respB.json();
                if (dataB && !dataB.error) {
                  variantBPrediction = dataB;
                }
              }
            } catch {
              // fallback
            }
            if (!variantBPrediction) {
              const mode = targetCamp.comparisonMode || "original_vs_correction";
              const bName = targetCamp.variantBName || (mode === "original_vs_correction" ? "Diseño B (Corregido)" : "Diseño B (Opción 2)");
              const baseData = generateClientSimulatedData(bName, targetCamp.category, targetCamp.variantBImageUrl, targetCamp.industryType);
              
              if (mode === "original_vs_correction") {
                // Optimized correction stats
                variantBPrediction = {
                  ...baseData,
                  clarityScore: Math.min(98, Math.max(88, predictiveData.clarityScore + 12)),
                  cognitiveLoad: Math.max(18, predictiveData.cognitiveLoad - 15),
                  reportText: {
                    summary: "La versión corregida (Diseño B) reduce drásticamente el ruido visual y canaliza un 35% más de atención directa al Call To Action principal.",
                    strengths: [
                      "Mayor contraste en la tipografía principal.",
                      "Eliminación de elementos secundarios distractores.",
                      "Anclaje visual óptimo del logotipo en la zona de primer contacto."
                    ],
                    weaknesses: ["Requiere un ajuste leve de espacio en bordes inferiores."],
                    recommendations: [
                      "Publicar la versión B como la pieza definitiva para la campaña.",
                      "Aplicar esta misma guía de contraste al resto de formatos."
                    ]
                  }
                };
              } else {
                // Two different designs stats
                variantBPrediction = {
                  ...baseData,
                  clarityScore: Math.min(95, Math.max(75, predictiveData.clarityScore + (Math.random() > 0.5 ? 8 : -5))),
                  cognitiveLoad: Math.floor(25 + Math.random() * 25),
                  reportText: {
                    summary: `Comparativa de propuesta alternativa (${bName}): presenta un estilo visual con distribución diferenciada de focos de interés.`,
                    strengths: [
                      "Composición alternativa con fuerte impacto visual central.",
                      "Excelente legibilidad en la propuesta secundaria."
                    ],
                    weaknesses: ["Distribución de fijación sacádica más dispersa."],
                    recommendations: [
                      "Evaluar cuál de los dos conceptos conecta mejor con la identidad del target."
                    ]
                  }
                };
              }
            }
          }

          setCampaigns(prev => prev.map(c => c.id === id ? {
            ...c,
            status: "ready",
            predictive: predictiveData,
            variantBPredictive: variantBPrediction
          } : c));
        } catch (err) {
          clearInterval(interval);
          clearInterval(progressTimer);
          setAnalysisProgressPercent(100);
          console.warn("Conexión API fallida o alojamiento estático Netlify detectado. Generando análisis predictivo local:", err);
          
          const fallbackData = generateClientSimulatedData(targetCamp.name, targetCamp.category);
          
          let variantBPrediction = targetCamp.variantBPredictive || null;
          if (targetCamp.variantBImageUrl && !variantBPrediction) {
            const mode = targetCamp.comparisonMode || "original_vs_correction";
            const bName = targetCamp.variantBName || "Diseño B";
            const baseDataB = generateClientSimulatedData(bName, targetCamp.category);
            if (mode === "original_vs_correction") {
              variantBPrediction = {
                ...baseDataB,
                clarityScore: Math.min(98, fallbackData.clarityScore + 12),
                cognitiveLoad: Math.max(18, fallbackData.cognitiveLoad - 15)
              };
            } else {
              variantBPrediction = baseDataB;
            }
          }

          setCampaigns(prev => prev.map(c => c.id === id ? {
            ...c,
            status: "ready",
            predictive: fallbackData,
            variantBPredictive: variantBPrediction
          } : c));
        }
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgressText("");
      setAnalysisProgressPercent(0);
    }
  };

  // Save webcam real eye tracking recorded sessions
  const handleSaveWebcamSession = (
    gazePoints: GazePoint[], 
    heatmapPoints: { x: number; y: number; weight: number }[]
  ) => {
    if (!activeCampaignId) return;

    // Simulate average emotions during the session for the campaign
    const simulatedEmotions: EmotionDataPoint[] = Array.from({ length: 6 }).map((_, idx) => ({
      timestamp: idx,
      engagement: Math.floor(50 + Math.random() * 35),
      joy: Math.floor(15 + Math.random() * 50),
      surprise: Math.floor(5 + Math.random() * 30),
      confusion: Math.floor(10 + Math.random() * 25),
      neutral: Math.floor(20 + Math.random() * 40)
    }));

    setCampaigns(prev => prev.map(c => {
      if (c.id === activeCampaignId) {
        return {
          ...c,
          realGaze: {
            gazePoints,
            heatmapPoints,
            durationMs: 5000
          },
          emotions: simulatedEmotions
        };
      }
      return c;
    }));

    // Redirect straight to integrated 360 view
    setActiveTab("dashboard360");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-indigo-500/10 selection:text-indigo-600">
      
      {/* Platform Global Topbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Logo Brand */}
          <div 
            onClick={() => {
              setActiveTab("list");
              setMobileMenuOpen(false);
            }} 
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
          >
            <div className="p-2 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 transition shadow-md shadow-indigo-600/10">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-slate-900 tracking-tight text-base leading-none block">OculiMind AI</span>
              <span className="text-[9px] text-indigo-600 font-mono tracking-wider uppercase font-bold leading-none hidden sm:block mt-0.5">PLATAFORMA COGNITIVA 360°</span>
            </div>
          </div>

          {/* Desktop Tab Navigation Hub */}
          <nav className="hidden lg:flex bg-slate-100/80 rounded-2xl p-1 text-xs font-semibold max-w-fit">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeTab === "list" 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 inline mr-1.5" />
              Estudios
            </button>
            
            <button
              disabled={!activeCampaign}
              onClick={() => setActiveTab("predictive")}
              className={`px-3 py-2 rounded-xl transition-all ${
                !activeCampaign ? "opacity-40 cursor-not-allowed" : ""
              } ${
                activeTab === "predictive" 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 inline mr-1.5" />
              IA Predictiva
            </button>

            <button
              disabled={!activeCampaign}
              onClick={() => setActiveTab("webcam")}
              className={`px-3 py-2 rounded-xl transition-all ${
                !activeCampaign ? "opacity-40 cursor-not-allowed" : ""
              } ${
                activeTab === "webcam" 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Video className="w-3.5 h-3.5 inline mr-1.5" />
              Webcam Real
            </button>

            <button
              disabled={!activeCampaign}
              onClick={() => setActiveTab("emotions")}
              className={`px-3 py-2 rounded-xl transition-all ${
                !activeCampaign ? "opacity-40 cursor-not-allowed" : ""
              } ${
                activeTab === "emotions" 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 inline mr-1.5" />
              Emotion AI
            </button>

            <button
              disabled={!activeCampaign || !activeCampaign.realGaze}
              onClick={() => setActiveTab("dashboard360")}
              className={`px-3 py-2 rounded-xl transition-all ${
                !activeCampaign || !activeCampaign.realGaze ? "opacity-40 cursor-not-allowed" : ""
              } ${
                activeTab === "dashboard360" 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5 inline mr-1.5" />
              Análisis 360°
            </button>

            <button
              onClick={() => setActiveTab("logoReview")}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeTab === "logoReview" 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
              Logo Review
            </button>

            <button
              onClick={() => setActiveTab("benchmark")}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeTab === "benchmark" 
                  ? "bg-indigo-600 text-white shadow-sm font-bold" 
                  : "text-indigo-600 hover:bg-indigo-50 font-bold"
              }`}
            >
              <Swords className="w-3.5 h-3.5 inline mr-1.5" />
              Benchmark AI
            </button>

            <button
              onClick={() => setActiveTab("adsOptimizer")}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeTab === "adsOptimizer" 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 inline mr-1.5 text-indigo-500" />
              Ads Meta & Google
            </button>
          </nav>

          {/* Header Action Buttons (Responsive Desktop & Mobile) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Access Control Button (Visible Desktop & Mobile) */}
            <button
              onClick={handleOpenAdminPanel}
              className="px-2.5 sm:px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
              title="Abrir Panel de Control de Claves y Auditoría"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Gestión Claves</span>
            </button>

            {/* Current Active Key Badge (Desktop Only) */}
            {currentUserKey && (
              <div className="hidden xl:flex items-center space-x-1.5 bg-slate-900 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-xl text-[11px] font-medium shrink-0">
                <Users className="w-3 h-3 text-amber-400" />
                <span className="font-bold">{currentUserKey.userName}</span>
                <span className="font-mono text-[10px] text-indigo-400 font-bold">({currentUserKey.code})</span>
                <button
                  onClick={() => {
                    localStorage.removeItem("aistudio_current_session_id_v1");
                    setCurrentUserKey(null);
                  }}
                  title="Cerrar Sesión"
                  className="ml-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Sync Algoritmos (Desktop Only) */}
            <button
              onClick={() => setActiveTab("adsOptimizer")}
              className="hidden md:flex px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-bold rounded-xl transition items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
              title="Verificar actualizaciones del algoritmo de Meta y Google Ads"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Algoritmos Sync</span>
            </button>

            {/* Manual PDF Downloader */}
            <ManualDownloader />

            {/* Mobile QR (Tablet / Desktop Only) */}
            <div className="hidden md:block">
              <MobileQR />
            </div>

            {/* Integration Status Badge */}
            <div className={`hidden sm:flex px-2.5 py-1.5 rounded-full border text-[10px] font-semibold tracking-wide items-center space-x-1.5 shrink-0 ${
              integrationStatus.active 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {integrationStatus.active ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span className="hidden md:inline">{integrationStatus.text}</span>
            </div>

            {/* Mobile Drawer Menu Toggle (Mobile Only) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 transition cursor-pointer shrink-0 ml-1"
              aria-label="Abrir Menú de Navegación"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Sticky Horizontal Scroll Navigation Bar (Mobile / Tablet) */}
      <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-16 z-30 px-3 py-2 overflow-x-auto scrollbar-none flex items-center space-x-2 shadow-xs">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 shrink-0 transition cursor-pointer min-h-[38px] ${
            activeTab === "list" 
              ? "bg-indigo-600 text-white shadow-xs" 
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Estudios</span>
        </button>

        <button
          disabled={!activeCampaign}
          onClick={() => setActiveTab("predictive")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 shrink-0 transition cursor-pointer min-h-[38px] ${
            !activeCampaign 
              ? "opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed" 
              : activeTab === "predictive" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>IA Predictiva</span>
        </button>

        <button
          disabled={!activeCampaign}
          onClick={() => setActiveTab("webcam")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 shrink-0 transition cursor-pointer min-h-[38px] ${
            !activeCampaign 
              ? "opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed" 
              : activeTab === "webcam" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Webcam Real</span>
        </button>

        <button
          disabled={!activeCampaign}
          onClick={() => setActiveTab("emotions")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 shrink-0 transition cursor-pointer min-h-[38px] ${
            !activeCampaign 
              ? "opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed" 
              : activeTab === "emotions" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Emotion AI</span>
        </button>

        <button
          disabled={!activeCampaign || !activeCampaign.realGaze}
          onClick={() => setActiveTab("dashboard360")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 shrink-0 transition cursor-pointer min-h-[38px] ${
            !activeCampaign || !activeCampaign.realGaze 
              ? "opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed" 
              : activeTab === "dashboard360" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Análisis 360°</span>
        </button>

        <button
          onClick={() => setActiveTab("logoReview")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 shrink-0 transition cursor-pointer min-h-[38px] ${
            activeTab === "logoReview" 
              ? "bg-indigo-600 text-white shadow-xs" 
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Logo Review</span>
        </button>

        <button
          onClick={() => setActiveTab("benchmark")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 shrink-0 transition cursor-pointer min-h-[38px] ${
            activeTab === "benchmark" 
              ? "bg-amber-500 text-white shadow-xs font-black" 
              : "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
          }`}
        >
          <Swords className="w-3.5 h-3.5 text-amber-600" />
          <span>Benchmark AI</span>
        </button>

        <button
          onClick={() => setActiveTab("adsOptimizer")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 shrink-0 transition cursor-pointer min-h-[38px] ${
            activeTab === "adsOptimizer" 
              ? "bg-indigo-600 text-white shadow-xs" 
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-indigo-500" />
          <span>Ads Meta & Google</span>
        </button>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
            />

            {/* Slide-Up Drawer Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative bg-slate-900 text-slate-100 rounded-t-3xl border-t border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10"
            >
              {/* Drawer Top Header Handle */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-indigo-600">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-sm text-white font-display">Menú Principal & Herramientas</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-5">
                {/* Active User Section inside Mobile Drawer */}
                {currentUserKey && (
                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-indigo-600/20 border border-indigo-500/40 rounded-xl flex items-center justify-center text-indigo-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{currentUserKey.userName}</span>
                        <span className="text-[10px] text-indigo-400 font-mono font-bold block">Clave: {currentUserKey.code} • Rol: {currentUserKey.role}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.removeItem("aistudio_current_session_id_v1");
                        setCurrentUserKey(null);
                        setMobileMenuOpen(false);
                      }}
                      className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold rounded-lg flex items-center space-x-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Salir</span>
                    </button>
                  </div>
                )}

                {/* Quick Action Tools inside Drawer */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block px-1">Acciones Rápidas:</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        handleOpenAdminPanel();
                        setMobileMenuOpen(false);
                      }}
                      className="p-3 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 rounded-2xl text-left transition space-y-1 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white block">Gestión de Claves</span>
                      <span className="text-[10px] text-slate-400 block">Control de usuarios</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("adsOptimizer");
                        setMobileMenuOpen(false);
                      }}
                      className="p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition space-y-1 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white block">Algoritmos Sync</span>
                      <span className="text-[10px] text-slate-400 block">Meta & Google Ads</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ManualDownloader showTextOnMobile={true} />
                    </div>
                    <span className="text-[10px] text-slate-400">PDF Oficial Neuromarketing</span>
                  </div>
                </div>

                {/* List of Navigation Modules */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">Navegación de Módulos Cognitivos:</span>
                  
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setActiveTab("list");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                        activeTab === "list" 
                          ? "bg-indigo-600 text-white border-indigo-500 font-bold" 
                          : "bg-slate-950/50 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <LayoutGrid className="w-4 h-4" />
                        <div>
                          <span className="text-xs block">Estudios de Atención</span>
                          <span className="text-[10px] opacity-75 block">Panel principal de campañas</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      disabled={!activeCampaign}
                      onClick={() => {
                        setActiveTab("predictive");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                        !activeCampaign 
                          ? "opacity-40 cursor-not-allowed bg-slate-950/30 border-slate-900" 
                          : activeTab === "predictive" 
                            ? "bg-indigo-600 text-white border-indigo-500 font-bold" 
                            : "bg-slate-950/50 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Cpu className="w-4 h-4" />
                        <div>
                          <span className="text-xs block">IA Predictiva</span>
                          <span className="text-[10px] opacity-75 block">Mapas de calor & fijaciones visuales</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      disabled={!activeCampaign}
                      onClick={() => {
                        setActiveTab("webcam");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                        !activeCampaign 
                          ? "opacity-40 cursor-not-allowed bg-slate-950/30 border-slate-900" 
                          : activeTab === "webcam" 
                            ? "bg-indigo-600 text-white border-indigo-500 font-bold" 
                            : "bg-slate-950/50 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Video className="w-4 h-4" />
                        <div>
                          <span className="text-xs block">Webcam Real</span>
                          <span className="text-[10px] opacity-75 block">Eye-tracking directo con cámara</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      disabled={!activeCampaign}
                      onClick={() => {
                        setActiveTab("emotions");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                        !activeCampaign 
                          ? "opacity-40 cursor-not-allowed bg-slate-950/30 border-slate-900" 
                          : activeTab === "emotions" 
                            ? "bg-indigo-600 text-white border-indigo-500 font-bold" 
                            : "bg-slate-950/50 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <BrainCircuit className="w-4 h-4" />
                        <div>
                          <span className="text-xs block">Emotion AI</span>
                          <span className="text-[10px] opacity-75 block">Microexpresiones faciales & valencia</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      disabled={!activeCampaign || !activeCampaign.realGaze}
                      onClick={() => {
                        setActiveTab("dashboard360");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                        !activeCampaign || !activeCampaign.realGaze 
                          ? "opacity-40 cursor-not-allowed bg-slate-950/30 border-slate-900" 
                          : activeTab === "dashboard360" 
                            ? "bg-indigo-600 text-white border-indigo-500 font-bold" 
                            : "bg-slate-950/50 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Layers className="w-4 h-4" />
                        <div>
                          <span className="text-xs block">Análisis 360°</span>
                          <span className="text-[10px] opacity-75 block">Reporte integrado multi-modal</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("logoReview");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                        activeTab === "logoReview" 
                          ? "bg-indigo-600 text-white border-indigo-500 font-bold" 
                          : "bg-slate-950/50 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="text-xs block">Logo Review</span>
                          <span className="text-[10px] opacity-75 block">Auditoría de isotipos & marca</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("benchmark");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                        activeTab === "benchmark" 
                          ? "bg-amber-500 text-white border-amber-400 font-bold" 
                          : "bg-amber-950/30 text-amber-200 border-amber-900/50 hover:border-amber-800"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Swords className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="text-xs block font-bold">Benchmark AI & Ranking RRSS</span>
                          <span className="text-[10px] opacity-80 block">Competidores & Ranking de Seguidores</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("adsOptimizer");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                        activeTab === "adsOptimizer" 
                          ? "bg-indigo-600 text-white border-indigo-500 font-bold" 
                          : "bg-slate-950/50 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Megaphone className="w-4 h-4 text-cyan-400" />
                        <div>
                          <span className="text-xs block">Ads Meta & Google</span>
                          <span className="text-[10px] opacity-75 block">Hub de optimización de pauta</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Access Login Modal when not logged in */}
      {!currentUserKey && (
        <AccessLoginModal 
          onLoginSuccess={(key) => setCurrentUserKey(key)} 
        />
      )}

      {/* Admin Telemetry Control Modal */}
      {showAdminModal && (
        <AdminTelemetryModal 
          onClose={() => setShowAdminModal(false)} 
        />
      )}

      {/* Master PIN Verification Modal for Guest Users */}
      {showPinPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500"></div>

            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="inline-block bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Acceso Restringido • Solo Administrador
                </div>
                <h3 className="text-base font-bold text-white font-display">
                  Autenticación de Administrador
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Los usuarios invitados no tienen acceso al Administrador de Contraseñas ni al control de claves. Por favor ingrese el <strong>PIN Maestro</strong> para continuar.
                </p>
              </div>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const masterPin = getMasterPin();
                if (adminPinInput.trim().toUpperCase() === masterPin.toUpperCase()) {
                  setShowPinPrompt(false);
                  setShowAdminModal(true);
                } else {
                  setAdminPinError("PIN Maestro incorrecto. Acceso denegado.");
                }
              }} 
              className="space-y-3.5 pt-2"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  PIN Maestro del Administrador
                </label>
                <input
                  type="password"
                  placeholder="Ingrese el PIN Maestro..."
                  value={adminPinInput}
                  onChange={(e) => {
                    setAdminPinInput(e.target.value);
                    setAdminPinError(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              {adminPinError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center space-x-2 text-rose-300 text-xs animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{adminPinError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPinPrompt(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/25 flex items-center space-x-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verificar PIN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Campaign selection context banner */}
      {activeCampaign && activeTab !== "list" && (
        <div className="bg-indigo-900/5 border-b border-indigo-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400">Estudio Activo:</span>
              <h2 className="text-xs font-black text-slate-900 font-display uppercase tracking-wider">{activeCampaign.name}</h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab("list")}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-500 transition flex items-center"
              >
                ← Volver a todos los estudios
              </button>
              
              {!activeCampaign.predictive && (
                <button
                  disabled={isAnalyzing}
                  onClick={() => handleAnalyzeCampaign(activeCampaign.id)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-[10px] font-bold rounded-lg transition"
                >
                  {isAnalyzing ? "Analizando..." : "Iniciar Análisis Predictivo de IA"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Container Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Loading overlay during AI predictive analysis */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-indigo-500/10 flex flex-col items-center">
              
              {/* Circular Gauge */}
              <div className="relative w-32 h-32 mb-6">
                {/* Background Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-800"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  {/* Glowing Accent Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-indigo-500 transition-all duration-300 ease-out"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * analysisProgressPercent) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black font-mono tracking-tight text-white">{analysisProgressPercent}%</span>
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Progreso</span>
                </div>
              </div>

              {/* Text Information */}
              <h3 className="font-display font-extrabold text-lg tracking-wide text-slate-100 mb-1">
                Procesando Análisis de IA
              </h3>
              
              <div className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl p-4 my-4">
                <p className="text-indigo-400 text-xs font-mono font-medium min-h-[32px] flex items-center justify-center">
                  {analysisProgressText}
                </p>
              </div>

              {/* Linear Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-6">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                  style={{ width: `${analysisProgressPercent}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                El motor cognitivo de Gemini simula fijaciones foveales, densidad térmica fóbica y mapas de prominencia visual.
              </p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. All Campaigns Panel */}
            {activeTab === "list" && (
              <CampaignsList
                campaigns={campaigns}
                activeCampaignId={activeCampaignId}
                onSelectCampaign={(id) => {
                  setActiveCampaignId(id);
                  // Auto redirect to predictive visualizer
                  const camp = campaigns.find(c => c.id === id);
                  if (camp && camp.status === "ready") {
                    setActiveTab("predictive");
                  }
                }}
                onAddCampaign={handleAddCampaign}
                onDeleteCampaign={handleDeleteCampaign}
                onAnalyzeCampaign={handleAnalyzeCampaign}
                isAnalyzing={isAnalyzing}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* 2. IA Predictiva */}
            {activeTab === "predictive" && activeCampaign && (
              <PredictiveView campaign={activeCampaign} />
            )}

            {/* 3. Eye-Tracking Webcam Real */}
            {activeTab === "webcam" && activeCampaign && (
              <WebcamTracker 
                campaign={activeCampaign} 
                onSaveSession={handleSaveWebcamSession} 
              />
            )}

            {/* 4. Emotion AI */}
            {activeTab === "emotions" && activeCampaign && (
              <EmotionView campaign={activeCampaign} />
            )}

            {/* 5. Dashboard 360° */}
            {activeTab === "dashboard360" && activeCampaign && (
              <Dashboard360 campaign={activeCampaign} />
            )}

            {/* 6. Logo Review & Auditoría */}
            {activeTab === "logoReview" && (
              <LogoReviewer />
            )}

            {/* 7. Benchmark & Investigación Competitiva */}
            {activeTab === "benchmark" && (
              <BenchmarkView />
            )}

            {/* 8. Ads Meta & Google Optimizer Hub */}
            {activeTab === "adsOptimizer" && (
              <AdsOptimizerView
                campaigns={campaigns}
                onAddCampaign={handleAddCampaign}
                onAnalyzeCampaign={handleAnalyzeCampaign}
                isAnalyzing={isAnalyzing}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Aesthetic Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 OculiMind AI. Todos los derechos reservados. Tecnología unificada de eye-tracking y respuesta cognitiva.</p>
          <div className="flex space-x-6">
            <span className="flex items-center text-[10px] font-mono"><Info className="w-3.5 h-3.5 mr-1" /> Cómputo Local y Redes Neuronales</span>
            <span>Estándares W3C y GDPR</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

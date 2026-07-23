/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Campaign, GazePoint, EmotionDataPoint } from "./types";
import { campaignPresets } from "./campaignPresets";
import CampaignsList from "./components/CampaignsList";
import PredictiveView from "./components/PredictiveView";
import WebcamTracker from "./components/WebcamTracker";
import EmotionView from "./components/EmotionView";
import Dashboard360 from "./components/Dashboard360";
import LogoReviewer from "./components/LogoReviewer";
import ManualDownloader from "./components/ManualDownloader";
import MobileQR from "./components/MobileQR";
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
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "predictive" | "webcam" | "emotions" | "dashboard360" | "logoReview">("list");
  
  // Backend Integration Status
  const [integrationStatus, setIntegrationStatus] = useState({
    active: false,
    text: "Verificando conexión con IA..."
  });
  
  // Loading & Action state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgressText, setAnalysisProgressText] = useState<string>("");
  const [analysisProgressPercent, setAnalysisProgressPercent] = useState<number>(0);

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

  // Handler to add campaigns
  const handleAddCampaign = (newCamp: Campaign) => {
    setCampaigns(prev => [newCamp, ...prev]);
    setActiveCampaignId(newCamp.id);
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
            const response = await fetch("/api/predictive-analysis", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageBase64: slide.imageUrl,
                imageName: `${targetCamp.name} - ${slide.name}`
              })
            });

            const data = await response.json();
            const slidePredictive = (response.ok && !data.error) ? data : (data.simulatedData || data);
            
            updatedSlides.push({
              ...slide,
              predictive: slidePredictive
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
          const response = await fetch("/api/predictive-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: targetCamp.imageUrl,
              imageName: targetCamp.imageName
            })
          });

          const data = await response.json();
          clearInterval(interval);
          clearInterval(progressTimer);
          setAnalysisProgressPercent(100);

          if (response.ok && !data.error) {
            setCampaigns(prev => prev.map(c => c.id === id ? {
              ...c,
              status: "ready",
              predictive: data
            } : c));
          } else {
            // Fallback if failed
            setCampaigns(prev => prev.map(c => c.id === id ? {
              ...c,
              status: "ready",
              predictive: data.simulatedData || data
            } : c));
          }
        } catch (err) {
          clearInterval(interval);
          clearInterval(progressTimer);
          throw err;
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab("list")} 
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 transition shadow-md shadow-indigo-600/10">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-slate-900 tracking-tight text-base leading-none block">OculiMind AI</span>
              <span className="text-[9px] text-indigo-600 font-mono tracking-wider uppercase font-bold leading-none block mt-0.5">PLATAFORMA COGNITIVA 360°</span>
            </div>
          </div>

          {/* Tab Navigation Hub */}
          <nav className="hidden md:flex bg-slate-100/80 rounded-2xl p-1 text-xs font-semibold max-w-fit">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-xl transition-all ${
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
              className={`px-4 py-2 rounded-xl transition-all ${
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
              className={`px-4 py-2 rounded-xl transition-all ${
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
              className={`px-4 py-2 rounded-xl transition-all ${
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
              className={`px-4 py-2 rounded-xl transition-all ${
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
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "logoReview" 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
              Logo Review
            </button>
          </nav>

          {/* Integration Status Badge & Manual PDF Downloader & Mobile QR */}
          <div className="flex items-center space-x-3">
            <ManualDownloader />
            <MobileQR />
            <div className={`px-3 py-1.5 rounded-full border text-[10px] font-semibold tracking-wide flex items-center space-x-1.5 max-w-[200px] sm:max-w-none truncate ${
              integrationStatus.active 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {integrationStatus.active ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span className="truncate">{integrationStatus.text}</span>
            </div>
          </div>

        </div>
      </header>

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

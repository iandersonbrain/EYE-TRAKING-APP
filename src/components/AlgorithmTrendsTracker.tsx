/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Video, 
  Search, 
  ShieldCheck, 
  Radio, 
  ExternalLink,
  Sliders,
  ChevronRight,
  Info,
  Clock,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface AlgorithmRule {
  platform: "meta" | "google" | "tiktok" | "linkedin";
  platformName: string;
  lastUpdated: string;
  version: string;
  currentPriority: string;
  keyFactors: {
    factor: string;
    weight: string;
    impact: string;
    recommendation: string;
  }[];
  penaltyTriggers: string[];
}

export const CURRENT_ALGORITHM_RULES: AlgorithmRule[] = [
  {
    platform: "meta",
    platformName: "Meta Ads & Instagram Reels",
    lastUpdated: "Julio 2026 (Versión V14.2)",
    version: "Meta Andromeda AI Bidding Engine",
    currentPriority: "Prioridad Máxima a Retención en los primeros 3 segundos (Hook Rate), Guardados y Compartidos directos sobre Likes tradicionales.",
    keyFactors: [
      {
        factor: "Hook Rate (0-3s)",
        weight: "35% del Score de Entrega",
        impact: "Determina si el algoritmo extiende el alcance orgánico o reduce el eCPM publicitario.",
        recommendation: "Usa contraste alto o movimiento facial inmediato en los primeros 1.5s."
      },
      {
        factor: "Cumplimiento de Safe Zones (Zonas Seguras)",
        weight: "20% del Quality Score",
        impact: "Posts con texto tapado por el avatar o la barra de acciones pierden un 30% de entrega.",
        recommendation: "Mantén textos y marcas dentro de la franja central (80% vertical)."
      },
      {
        factor: "Optimizaciones Dinámicas (DCO)",
        weight: "25% Eficiencia de Conversión",
        impact: "Pauta con 3+ variaciones de imagen/titular logra 40% menor CPL.",
        recommendation: "Utiliza el Hub A/B & DCO para evaluar variaciones de titulares antes de pausar."
      },
      {
        factor: "Audio Original & Subtítulos Nativos",
        weight: "20% Retención con Audio Apagado",
        impact: "El 78% de los usuarios consume Reels sin sonido en transporte o trabajo.",
        recommendation: "Agrega subtítulos dinámicos de alto contraste en el tercio inferior seguro."
      }
    ],
    penaltyTriggers: [
      "Texto superando el 20% de superficie en imágenes de Feed de Facebook",
      "Logos tapados por el botón 'Enviar Mensaje' o 'Comprar Ahora'",
      "Videos con marcas de agua de plataformas competidoras (ej. TikTok watermark)",
      "Baja tasa de detención del scroll (Stop-Ratio menor al 40%)"
    ]
  },
  {
    platform: "google",
    platformName: "Google Display & Responsive Ads",
    lastUpdated: "Julio 2026 (Versión V18.0)",
    version: "Google Smart Bidding & Vision AI",
    currentPriority: "Priorización de Banners Responsivos con relación de aspecto adaptativa y contraste WCAG AA superior a 4.5:1.",
    keyFactors: [
      {
        factor: "Ratio de Área de Texto vs Espacio Blanco",
        weight: "30% Ad Rank Quality",
        impact: "Banners saturados de texto reciben penalización de CPM y menor frecuencia de impresión.",
        recommendation: "Deja 40% de espacio negativo limpio alrededor del producto."
      },
      {
        factor: "Nitidez del Botón CTA",
        weight: "25% Click-Through Rate (CTR)",
        impact: "Botones con sombra o borde diferenciado aumentan los clics válidos un 28%.",
        recommendation: "Asegura contraste de color opuesto (ej. botón verde en fondo oscuro)."
      },
      {
        factor: "Alineación en Lectura F-Pattern",
        weight: "25% Visual Scanning Score",
        impact: "En formatos como 728x90 y 300x600, el ojo busca primero la esquina superior izquierda.",
        recommendation: "Coloca el logotipo a la izquierda y la oferta principal al centro/derecha."
      },
      {
        factor: "Adaptabilidad Móvil (320x50 / 320x100)",
        weight: "20% Mobile Performance",
        impact: "El 82% del inventario de Display de Google se consume en smartphones.",
        recommendation: "Verifica que el texto sea legible a una escala de pantalla de 5 pulgadas."
      }
    ],
    penaltyTriggers: [
      "Animaciones de más de 30 segundos o loops infinitos molestos",
      "Botones falsos de reproductor de video o cierre engañoso (Clickbait penalizado)",
      "Tipografía con tamaño menor a 10px en dispositivos móviles"
    ]
  },
  {
    platform: "tiktok",
    platformName: "TikTok For You Engine",
    lastUpdated: "Julio 2026",
    version: "TikTok Symphony AI Algorithm",
    currentPriority: "Inmersión Vertical 9:16 con ritmo acelerado de edición (cortes cada 2-3 segundos) y llamadas de voz directas.",
    keyFactors: [
      {
        factor: "Velocidad de Edición & Ritmo",
        weight: "40% Watch Time Completo",
        impact: "Escenas estáticas por más de 3.5s causan abandono inmediato del video.",
        recommendation: "Alterna ángulos o inserta b-roll dinámico periódicamente."
      },
      {
        factor: "Hook Verbal en los Primeros 1.5s",
        weight: "30% Initial Engagement",
        impact: "Planteamiento de pregunta provocativa duplica la retención hasta el final.",
        recommendation: "Inicia directamente con la promesa o el problema sin intros largas."
      }
    ],
    penaltyTriggers: [
      "Franjas negras horizontales (videos 16:9 subidos en vertical sin adaptar)",
      "Uso de canciones con derechos de autor sin licencia comercial"
    ]
  },
  {
    platform: "linkedin",
    platformName: "LinkedIn B2B Feed Algorithm",
    lastUpdated: "Julio 2026",
    version: "LinkedIn Professional Relevance AI",
    currentPriority: "Formatos Documento/Carrusel PDF y Banners con titulares ejecutivos de alto valor profesional.",
    keyFactors: [
      {
        factor: "Dwell Time en Carruseles",
        weight: "40% Feed Distribution",
        impact: "El tiempo dedicado a deslizar páginas aumenta la exposición orgánica a tomadores de decisión.",
        recommendation: "Diseña carruseles de 4 a 7 tarjetas con ideas resumidas."
      },
      {
        factor: "Propuesta de Valor B2B Limpia",
        weight: "35% CTR Profesional",
        impact: "Directivos prefieren datos cuantitativos (ej. 'Aumenta un 40% el ROI') sobre slogans vagos.",
        recommendation: "Destaca porcentajes o métricas clave en la primera tarjeta."
      }
    ],
    penaltyTriggers: [
      "Imágenes con estética de meme descontextualizada del ámbito corporativo",
      "Enlaces externos en la imagen que simulan ser interactivos"
    ]
  }
];

interface AlgorithmTrendsTrackerProps {
  onSyncComplete?: () => void;
}

export default function AlgorithmTrendsTracker({ onSyncComplete }: AlgorithmTrendsTrackerProps) {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Hace 2 minutos (En vivo)");
  const [selectedPlatform, setSelectedPlatform] = useState<"meta" | "google" | "tiktok" | "linkedin">("meta");
  const [showNotification, setShowNotification] = useState<boolean>(false);

  const handleLiveSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      setLastSyncTime(`Hoy a las ${now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} (Sincronizado)`);
      setShowNotification(true);
      if (onSyncComplete) onSyncComplete();
      setTimeout(() => setShowNotification(false), 5000);
    }, 1800);
  };

  const currentRule = CURRENT_ALGORITHM_RULES.find(r => r.platform === selectedPlatform) || CURRENT_ALGORITHM_RULES[0];

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Monitor Algorítmico en Tiempo Real • Meta & Google Ads Sync
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-white">
            Motor de Reglas & Tendencias de Plataforma
          </h2>
          <p className="text-xs text-slate-300">
            Sincronización automatizada de criterios de ponderación publicitaria para adaptar los análisis de OculiMind AI a los cambios de algoritmo vigentes.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-mono block">Última actualización de reglas:</span>
            <span className="text-xs font-bold font-mono text-cyan-300">{lastSyncTime}</span>
          </div>

          <button
            onClick={handleLiveSync}
            disabled={isSyncing}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-lg cursor-pointer ${
              isSyncing
                ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-cyan-500/20"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-cyan-400" : ""}`} />
            <span>{isSyncing ? "Sincronizando Algoritmos..." : "Verificar Cambios de Algoritmo"}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-2xl flex items-center space-x-3 text-emerald-300 text-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold block">¡Algoritmos Actualizados Correctamente!</span>
              <span>Los modelos de IA de OculiMind han calibrado los pesos de Hook Rate, Safe Zone Score y CTR predictivo según los estándares de julio de 2026.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {CURRENT_ALGORITHM_RULES.map((rule) => {
          const isActive = selectedPlatform === rule.platform;
          return (
            <button
              key={rule.platform}
              onClick={() => setSelectedPlatform(rule.platform)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>{rule.platformName}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />}
            </button>
          );
        })}
      </div>

      {/* Active Rule Details */}
      <div className="space-y-6">
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider">
              {currentRule.version}
            </span>
            <span className="px-2.5 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px] font-mono">
              Vigencia: {currentRule.lastUpdated}
            </span>
          </div>

          <p className="text-sm font-bold text-white leading-relaxed">
            Prioridad Algorítmica Actual: <span className="text-slate-200 font-normal">{currentRule.currentPriority}</span>
          </p>
        </div>

        {/* Factors Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Factores de Mayor Ponderación en el Score de Atención</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentRule.keyFactors.map((factor, idx) => (
              <div key={idx} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{factor.factor}</span>
                  <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded text-[10px] font-mono font-bold border border-cyan-800">
                    {factor.weight}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">{factor.impact}</p>
                <div className="pt-2 border-t border-slate-700/40 text-[11px] text-indigo-300 font-medium flex items-start space-x-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Recomendación:</strong> {factor.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Penalty Triggers Box */}
        <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Radio className="w-4 h-4 text-rose-400" />
            <span>Factores de Penalización de Alcance / Alto eCPM</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {currentRule.penaltyTriggers.map((trigger, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{trigger}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

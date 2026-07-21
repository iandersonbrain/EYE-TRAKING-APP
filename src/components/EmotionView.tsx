/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Campaign, EmotionDataPoint } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { BrainCircuit, Smile, Flame, RefreshCw, AlertCircle, Sparkles, Activity } from "lucide-react";

interface EmotionViewProps {
  campaign: Campaign;
}

export default function EmotionView({ campaign }: EmotionViewProps) {
  const [activeTab, setActiveTab] = useState<"charts" | "metrics">("charts");
  const [timelineData, setTimelineData] = useState<EmotionDataPoint[]>([]);
  const [currentEmotions, setCurrentEmotions] = useState({
    engagement: 45,
    joy: 20,
    surprise: 15,
    confusion: 10,
    neutral: 55
  });

  const [activeFaceExpression, setActiveFaceExpression] = useState<string>("neutral");

  // Load preset campaign emotions or generate standard tracking loop
  useEffect(() => {
    if (campaign.emotions && campaign.emotions.length > 0) {
      setTimelineData(campaign.emotions);
      // set last recorded emotions as current
      const last = campaign.emotions[campaign.emotions.length - 1];
      setCurrentEmotions({
        engagement: last.engagement,
        joy: last.joy,
        surprise: last.surprise,
        confusion: last.confusion,
        neutral: last.neutral
      });
    } else {
      // Create rich simulated timeline of emotion capture
      const simulated: EmotionDataPoint[] = Array.from({ length: 10 }).map((_, idx) => {
        const time = idx;
        const confusion = idx === 3 || idx === 4 ? 45 : Math.floor(Math.random() * 15);
        const joy = idx === 6 || idx === 7 ? 65 : Math.floor(Math.random() * 20);
        const surprise = idx === 1 ? 55 : Math.floor(Math.random() * 10);
        const engagement = Math.floor(40 + Math.sin(idx * 0.8) * 30 + Math.random() * 15);
        
        return {
          timestamp: time,
          engagement: Math.min(Math.max(engagement, 0), 100),
          joy,
          surprise,
          confusion,
          neutral: Math.max(0, 100 - (joy + surprise + confusion))
        };
      });
      setTimelineData(simulated);
    }
  }, [campaign]);

  // Live dynamic telemetry sandbox loop
  useEffect(() => {
    const timer = setInterval(() => {
      // Add slight jitter to active metrics for high visual authenticity
      setCurrentEmotions(prev => {
        const delta = () => Math.floor((Math.random() - 0.5) * 8);
        const joyNew = Math.min(Math.max(prev.joy + delta(), 0), 100);
        const surpriseNew = Math.min(Math.max(prev.surprise + delta(), 0), 100);
        const confusionNew = Math.min(Math.max(prev.confusion + delta(), 0), 100);
        const engagementNew = Math.min(Math.max(prev.engagement + delta(), 0), 100);
        
        // Estimate face expression label
        if (joyNew > 40) setActiveFaceExpression("Alegre / Satisfecho");
        else if (surpriseNew > 40) setActiveFaceExpression("Sorprendido / Impactado");
        else if (confusionNew > 30) setActiveFaceExpression("Confundido / Analizando");
        else setActiveFaceExpression("Concentrado / Neutral");

        return {
          engagement: engagementNew,
          joy: joyNew,
          surprise: surpriseNew,
          confusion: confusionNew,
          neutral: Math.max(0, 100 - (joyNew + surpriseNew + confusionNew))
        };
      });
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  const selectExpression = (expType: "joy" | "surprise" | "confusion" | "concentrated") => {
    if (expType === "joy") {
      setCurrentEmotions({ engagement: 85, joy: 80, surprise: 15, confusion: 5, neutral: 10 });
      setActiveFaceExpression("Alegre / Satisfecho");
    } else if (expType === "surprise") {
      setCurrentEmotions({ engagement: 90, joy: 30, surprise: 85, confusion: 10, neutral: 5 });
      setActiveFaceExpression("Sorprendido / Impactado");
    } else if (expType === "confusion") {
      setCurrentEmotions({ engagement: 75, joy: 5, surprise: 10, confusion: 78, neutral: 15 });
      setActiveFaceExpression("Confundido / Analizando");
    } else {
      setCurrentEmotions({ engagement: 55, joy: 12, surprise: 8, confusion: 5, neutral: 80 });
      setActiveFaceExpression("Concentrado / Neutral");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Telemetry Hub panel (4 columns) */}
      <div className="lg:col-span-4 flex flex-col space-y-6">
        
        {/* Live facial vector box */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center space-x-2 mb-4">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <div>
              <h4 className="text-white font-bold text-sm">Biometría Emotion AI</h4>
              <p className="text-[9px] text-purple-400 font-mono">MICRO-EXPRESSION ENGINE</p>
            </div>
          </div>

          {/* Biometric Avatar */}
          <div className="aspect-square w-full max-w-[200px] mx-auto rounded-full border-2 border-dashed border-purple-500/30 flex flex-col items-center justify-center relative p-4 mb-4 bg-slate-950/40">
            {/* Pulsing visual circles */}
            <span className="absolute inset-2 rounded-full border border-purple-400/10 animate-ping opacity-40" />
            
            {/* Dynamic Facial Icon */}
            <div className="relative z-10 transition-transform duration-300">
              <Smile className={`w-20 h-20 transition-all ${
                activeFaceExpression.includes("Alegre") 
                  ? "text-emerald-400 scale-110" 
                  : activeFaceExpression.includes("Sorprendido") 
                    ? "text-amber-400 rotate-12"
                    : activeFaceExpression.includes("Confundido")
                      ? "text-rose-400 -rotate-6"
                      : "text-purple-400"
              }`} />
            </div>

            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-purple-500/20 px-3 py-1 rounded-full whitespace-nowrap">
              <span className="text-[10px] font-mono text-purple-300 font-bold tracking-wider uppercase">
                {activeFaceExpression}
              </span>
            </div>
          </div>

          {/* Sandbox Controls */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Simular Expresión del Rostro:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => selectExpression("joy")}
                className="py-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 rounded-lg text-xs font-semibold text-slate-300 transition"
              >
                Alegre 😄
              </button>
              <button
                onClick={() => selectExpression("surprise")}
                className="py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 rounded-lg text-xs font-semibold text-slate-300 transition"
              >
                Sorprendido 😲
              </button>
              <button
                onClick={() => selectExpression("confusion")}
                className="py-1.5 bg-slate-800 hover:bg-rose-500 hover:text-slate-950 rounded-lg text-xs font-semibold text-slate-300 transition"
              >
                Confundido 🤨
              </button>
              <button
                onClick={() => selectExpression("concentrated")}
                className="py-1.5 bg-slate-800 hover:bg-purple-500 hover:text-slate-950 rounded-lg text-xs font-semibold text-slate-300 transition"
              >
                Concentrado 😐
              </button>
            </div>
          </div>

        </div>

        {/* Real-time bar charts */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <Activity className="w-4 h-4 text-purple-500 mr-1.5" />
            Métricas de Atención Emocional
          </h4>

          <div className="space-y-3">
            {/* Engagement */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 flex items-center">
                  <Flame className="w-3.5 h-3.5 text-orange-500 mr-1" />
                  Engagement / Interés
                </span>
                <span className="text-slate-950 font-mono font-bold">{currentEmotions.engagement}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${currentEmotions.engagement}%` }}
                />
              </div>
            </div>

            {/* Joy */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">Delight / Agrado</span>
                <span className="text-slate-950 font-mono font-bold">{currentEmotions.joy}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${currentEmotions.joy}%` }}
                />
              </div>
            </div>

            {/* Surprise */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">Surprise / Impacto</span>
                <span className="text-slate-950 font-mono font-bold">{currentEmotions.surprise}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${currentEmotions.surprise}%` }}
                />
              </div>
            </div>

            {/* Confusion */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">Cognitive Clutter / Confusión</span>
                <span className="text-slate-950 font-mono font-bold">{currentEmotions.confusion}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${currentEmotions.confusion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Recharts Timeline panel (8 columns) */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        
        {/* Timeline Chart wrapper */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-slate-800 font-bold text-base leading-tight">Línea de Tiempo Emocional</h4>
                <p className="text-slate-500 text-xs mt-0.5">Sincronización del agrado, interés e impacto durante los segundos de visualización.</p>
              </div>

              <div className="flex bg-slate-100 rounded-lg p-1 text-xs">
                <button
                  onClick={() => setActiveTab("charts")}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === "charts" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Gráfico de Ondas
                </button>
                <button
                  onClick={() => setActiveTab("metrics")}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === "metrics" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Puntos Críticos
                </button>
              </div>
            </div>

            {activeTab === "charts" ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timelineData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorJoy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorConfusion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(val) => `${val}s`} 
                      stroke="#94a3b8"
                      fontSize={11}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`]}
                      labelFormatter={(label) => `Tiempo: ${label}s`}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9" }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    
                    <Area 
                      type="monotone" 
                      dataKey="engagement" 
                      name="Interés (Engagement)"
                      stroke="#f97316" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorEngagement)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="joy" 
                      name="Agrado (Delight)"
                      stroke="#34d399" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorJoy)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="confusion" 
                      name="Confusión (Clutter)"
                      stroke="#ef4444" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorConfusion)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                
                {/* Critical Moment 1 */}
                <div className="flex items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mr-4">
                    1.5s
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Punto de Agrado Máximo (Delight Peak)</h5>
                    <p className="text-slate-600 text-xs mt-1">
                      El usuario experimenta un aumento en su Delight del 65% al fijar la vista en el elemento estético central. Esto demuestra una conexión emocional positiva con el producto.
                    </p>
                  </div>
                </div>

                {/* Critical Moment 2 */}
                <div className="flex items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0 mr-4">
                    2.8s
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Shock de Atención (Surprise Spike)</h5>
                    <p className="text-slate-600 text-xs mt-1">
                      Se registra una micro-expresión de sorpresa (cejas elevadas) coincidiendo con la asimilación del precio destacado. Valida que el descuento o valor es disruptivo.
                    </p>
                  </div>
                </div>

                {/* Critical Moment 3 */}
                <div className="flex items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mr-4">
                    4.2s
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Fricción Cognitiva Detectada (Confusion Peak)</h5>
                    <p className="text-slate-600 text-xs mt-1">
                      La curva de confusión se eleva momentáneamente. Coincide con la zona de lectura del menú de especificaciones detalladas o textos pequeños. Sugiere simplificar la redacción.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
            <p className="text-xs text-purple-900 leading-relaxed font-medium">
              <strong>Insights de Emotion AI:</strong> Los usuarios conectan de inmediato con la estética general, pero desaceleran en la zona inferior de especificaciones. Simplificar la tipografía de soporte reducirá la confusión en un estimado de 25%.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

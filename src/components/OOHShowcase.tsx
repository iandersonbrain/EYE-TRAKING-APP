import React, { useState } from "react";
import { 
  Car, 
  Store, 
  Columns, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Flame, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  RefreshCw,
  Zap,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OOHShowcaseProps {
  onTestDesign?: (category: string) => void;
}

export default function OOHShowcase({ onTestDesign }: OOHShowcaseProps) {
  const [activeTab, setActiveTab] = useState<"fleet" | "window" | "column">("fleet");
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [designState, setDesignState] = useState<"before" | "after">("after");

  return (
    <section id="ooh-showcase" className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 my-8 shadow-2xl border border-slate-800 relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-mono font-bold tracking-wider uppercase mb-3">
              <Eye className="w-3.5 h-3.5 text-rose-400" />
              <span>Antes / Después con Eye-Tracking Predictivo</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white leading-tight">
              Casos de Uso: Publicidad Exterior (Validación OOH)
            </h2>
            
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Prueba cómo funciona la legibilidad, el contraste y la jerarquía de tus diseños en vehículos, vallas y vitrinas antes de la impresión.
            </p>
          </div>

          {/* Selector Tabs for 3 OOH Categories */}
          <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 shrink-0 self-start lg:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("fleet")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                activeTab === "fleet"
                  ? "bg-rose-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Vehículos & Flotas</span>
            </button>

            <button
              onClick={() => setActiveTab("window")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                activeTab === "window"
                  ? "bg-rose-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Vitrinas Comerciales</span>
            </button>

            <button
              onClick={() => setActiveTab("column")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                activeTab === "column"
                  ? "bg-rose-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Columns className="w-4 h-4" />
              <span>Columnas & Retail</span>
            </button>
          </div>
        </div>

        {/* Dynamic Display Area based on Active Tab */}
        <AnimatePresence mode="wait">
          {activeTab === "fleet" && (
            <motion.div
              key="fleet"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Left Column: Problem & Value Explanation */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Vehículos / Flotas (Car Wrapping)</h3>
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/50">
                        Atención estimada: 2 a 3 segundos
                      </span>
                    </div>
                  </div>

                  {/* Problem Card */}
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-rose-900/40 space-y-2">
                    <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>El Problema</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Un auto en movimiento solo da <strong>2 a 3 segundos de atención visual</strong> al conductor o peatón. Diseños cargados con fotos de stock y texto pequeño sufren de ceguera publicitaria; el número telefónico y la marca nunca se llegan a leer.
                    </p>
                  </div>

                  {/* Value Card */}
                  <div className="p-4 bg-indigo-950/60 rounded-xl border border-indigo-800/40 space-y-2">
                    <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>El Valor de OculiMind AI</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Analiza si el logotipo y el mensaje principal (ej. teléfono o beneficio clave) <strong>superan el mapa de calor y se leen a distancia</strong>, o si hay demasiado "ruido visual" en las líneas de la carrocería.
                    </p>
                  </div>
                </div>

                {/* Metrics comparison highlight */}
                <div className="pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">First Fixation (Teléfono)</span>
                    <span className={`text-sm font-black font-mono ${designState === 'after' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {designState === "after" ? "0.3 segundos (Inmediato)" : "1.9 segundos (Perdido)"}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Clarity Score</span>
                    <span className={`text-sm font-black font-mono ${designState === 'after' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {designState === "after" ? "94% (Óptimo)" : "42% (Saturado)"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onTestDesign && onTestDesign("keyvisual")}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Probar mi propio diseño de Car Wrapping</span>
                </button>
              </div>

              {/* Right Column: Interactive Visual Canvas with Before/After & Heatmap */}
              <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 relative">
                {/* Control Bar over Canvas */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  {/* Before / After Toggle */}
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setDesignState("before")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                        designState === "before"
                          ? "bg-rose-600/90 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Sin Optimizar (Saturado)</span>
                    </button>
                    <button
                      onClick={() => setDesignState("after")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                        designState === "after"
                          ? "bg-emerald-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Optimizado con OculiMind</span>
                    </button>
                  </div>

                  {/* Heatmap Toggle */}
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                      showHeatmap
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mapa de Calor: {showHeatmap ? "ON" : "OFF"}</span>
                  </button>
                </div>

                {/* Simulated Vehicle Graphic Box */}
                <div className="relative aspect-[16/9] w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  {/* Base Graphic Simulation: Car Silhouette and Wrapping */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
                    {/* Stylized Van / Vehicle Silhouette */}
                    <div className="relative w-full max-w-lg h-44 bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-2xl overflow-hidden flex flex-col justify-between p-4">
                      
                      {/* Vehicle Top Windows */}
                      <div className="flex space-x-2 h-10 border-b border-slate-700/60 pb-2">
                        <div className="w-1/4 bg-slate-900/80 rounded border border-slate-700" />
                        <div className="w-1/3 bg-slate-900/80 rounded border border-slate-700" />
                        <div className="w-1/3 bg-slate-900/80 rounded border border-slate-700" />
                      </div>

                      {/* Side Body Wrapping Content (Before vs After) */}
                      {designState === "before" ? (
                        /* BEFORE: Saturated, chaotic layout */
                        <div className="flex-1 flex items-center justify-between px-2 pt-2 text-slate-400 text-[10px] space-x-2 opacity-90">
                          <div className="space-y-1 w-1/3">
                            <div className="bg-pink-600/30 p-1 rounded text-[8px] text-pink-300 leading-tight">
                              ¡OFERTA DEL MES! 50% DSCTO
                            </div>
                            <div className="text-[7px] text-slate-400 leading-3">
                              Servicios de mantenimiento residencial e industrial express 24/7.
                            </div>
                            <div className="text-[7px] text-slate-500">
                              info@empresa-ejemplo-de-larguisimo-nombre.com
                            </div>
                          </div>
                          <div className="w-1/3 h-full bg-slate-700/50 rounded flex items-center justify-center text-[8px] text-slate-400 text-center p-1 border border-slate-600">
                            [Foto de stock sin contraste]
                          </div>
                          <div className="w-1/3 space-y-1 text-right">
                            <div className="text-[9px] font-bold text-slate-300">LOGO PEQUEÑO</div>
                            <div className="text-[7px] text-slate-400">Tel: +56 9 8877 6655</div>
                            <div className="text-[7px] text-slate-500">Síguenos en RRSS</div>
                          </div>
                        </div>
                      ) : (
                        /* AFTER: High contrast, uncluttered, focused on phone & brand */
                        <div className="flex-1 flex items-center justify-between px-4 pt-1">
                          <div className="space-y-0.5">
                            <span className="text-xs font-mono font-black text-rose-400 tracking-wider bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30 inline-block">
                              TEL: 800-400-900
                            </span>
                            <h4 className="text-base font-black text-white font-display tracking-tight leading-none mt-1">
                              EXPRESS REPARACIONES
                            </h4>
                            <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                              Servicio en 30 minutos
                            </p>
                          </div>

                          <div className="p-3 bg-rose-600 text-white rounded-xl shadow-lg border border-rose-400 font-black text-xs font-display text-center">
                            LOGOTIPO
                            <span className="block text-[8px] font-normal opacity-90">ALTO IMPACTO</span>
                          </div>
                        </div>
                      )}

                      {/* Wheels */}
                      <div className="flex justify-between px-8 -mb-7">
                        <div className="w-12 h-12 bg-slate-900 rounded-full border-4 border-slate-600 flex items-center justify-center">
                          <div className="w-4 h-4 bg-slate-700 rounded-full" />
                        </div>
                        <div className="w-12 h-12 bg-slate-900 rounded-full border-4 border-slate-600 flex items-center justify-center">
                          <div className="w-4 h-4 bg-slate-700 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HEATMAP OVERLAY LAYER */}
                  {showHeatmap && (
                    <div className="absolute inset-0 pointer-events-none z-20">
                      {designState === "before" ? (
                        /* Scattered, noisy heatmaps (failed attention) */
                        <>
                          <div className="absolute top-[35%] left-[25%] w-24 h-24 bg-rose-500/30 rounded-full blur-xl animate-pulse" />
                          <div className="absolute top-[40%] right-[30%] w-20 h-20 bg-amber-500/30 rounded-full blur-lg" />
                          <div className="absolute bottom-[20%] left-[45%] w-16 h-16 bg-yellow-500/20 rounded-full blur-md" />
                          <div className="absolute top-[15%] right-[10%] w-12 h-12 bg-blue-500/20 rounded-full blur-md" />
                          {/* Scattered gaze dots */}
                          <div className="absolute top-[40%] left-[28%] w-3 h-3 bg-rose-500 rounded-full border border-white shadow-xs" />
                          <div className="absolute top-[48%] right-[32%] w-3 h-3 bg-amber-500 rounded-full border border-white shadow-xs" />
                          <div className="absolute bottom-[25%] left-[48%] w-3 h-3 bg-yellow-400 rounded-full border border-white shadow-xs" />
                        </>
                      ) : (
                        /* Concentrated, high-efficiency heatmaps on key targets */
                        <>
                          {/* Phone Number Hotspot */}
                          <div className="absolute top-[42%] left-[22%] w-28 h-20 bg-rose-600/60 rounded-full blur-xl" />
                          <div className="absolute top-[46%] left-[24%] w-16 h-10 bg-yellow-400/80 rounded-full blur-md" />
                          
                          {/* Logo Hotspot */}
                          <div className="absolute top-[38%] right-[20%] w-24 h-20 bg-rose-600/55 rounded-full blur-xl" />
                          <div className="absolute top-[42%] right-[22%] w-12 h-10 bg-yellow-300/80 rounded-full blur-md" />

                          {/* Order Sequence Markers */}
                          <div className="absolute top-[42%] left-[20%] w-6 h-6 bg-rose-600 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md">
                            1
                          </div>
                          <div className="absolute top-[38%] right-[18%] w-6 h-6 bg-amber-500 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md">
                            2
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Badge Status on Image */}
                  <div className="absolute bottom-3 left-3 z-30">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border backdrop-blur-md ${
                      designState === "after"
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                        : "bg-rose-950/80 text-rose-300 border-rose-500/40"
                    }`}>
                      {designState === "after" ? "✓ Atención Focalizada en Teléfono & Logo" : "✕ Ruido Visual: Teléfono Ilegible"}
                    </span>
                  </div>
                </div>

                {/* Footer Insight Note */}
                <p className="text-[11px] text-slate-400 italic leading-snug">
                  *Un vehículo en movimiento requiere tipografías sans-serif de alto grosor y eliminar elementos decorativos que compitan con el dato de contacto.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "window" && (
            <motion.div
              key="window"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Left Column: Vitrinas Problem & Value */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Vitrinas y Cristales Comerciales</h3>
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/50">
                        Saturación de Transeúntes
                      </span>
                    </div>
                  </div>

                  {/* Problem Card */}
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-rose-900/40 space-y-2">
                    <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>El Problema</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Excesiva información promocional pegada en los vidrios (múltiples vinilos, horarios, descuentos y marcas secundarias) que <strong>satura la vista del transeúnte</strong> y opaca la oferta principal.
                    </p>
                  </div>

                  {/* Value Card */}
                  <div className="p-4 bg-indigo-950/60 rounded-xl border border-indigo-800/40 space-y-2">
                    <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>El Valor de OculiMind AI</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Mide el punto de impacto visual inicial (<strong>First Fixation</strong>) para asegurar que la oferta de gancho o el llamado a la acción capten la mirada de inmediato antes de que el peatón continúe su camino.
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Transeúntes Enganchados</span>
                    <span className={`text-sm font-black font-mono ${designState === 'after' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {designState === "after" ? "+140% Conversión" : "Solo 15% Retención"}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Ruido de Cristal</span>
                    <span className={`text-sm font-black font-mono ${designState === 'after' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {designState === "after" ? "-65% Carga Cognitiva" : "78% Carga Crítica"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onTestDesign && onTestDesign("keyvisual")}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Validar mi Vitrina Comercial</span>
                </button>
              </div>

              {/* Right Column: Visual Canvas for Window */}
              <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 relative">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setDesignState("before")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                        designState === "before"
                          ? "bg-rose-600/90 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Saturado de Vinilos</span>
                    </button>
                    <button
                      onClick={() => setDesignState("after")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                        designState === "after"
                          ? "bg-emerald-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Jerarquía Limpia</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                      showHeatmap
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mapa de Calor: {showHeatmap ? "ON" : "OFF"}</span>
                  </button>
                </div>

                {/* Window Graphic Simulation Box */}
                <div className="relative aspect-[16/9] w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
                  {/* Storefront Frame */}
                  <div className="relative w-full h-full bg-slate-950 border-4 border-slate-700 rounded-xl flex overflow-hidden shadow-2xl">
                    {/* Glass Reflection effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10" />

                    {designState === "before" ? (
                      /* Saturated Window with stickers everywhere */
                      <div className="w-full h-full grid grid-cols-3 gap-2 p-3 text-[8px] text-slate-300 relative">
                        <div className="bg-rose-900/40 border border-rose-500 p-2 rounded text-center">
                          ¡OFERTA! 20%
                        </div>
                        <div className="bg-amber-900/40 border border-amber-500 p-2 rounded text-center">
                          LIQUIDACIÓN DE TEMPORADA
                        </div>
                        <div className="bg-purple-900/40 border border-purple-500 p-2 rounded text-center">
                          ENVÍOS GRATIS
                        </div>
                        <div className="bg-blue-900/40 border border-blue-500 p-2 rounded text-center">
                          HORARIOS: 9AM - 8PM
                        </div>
                        <div className="bg-emerald-900/40 border border-emerald-500 p-2 rounded text-center font-bold">
                          MARCA PRINCIPAL (PEQUEÑA)
                        </div>
                        <div className="bg-slate-800/80 border border-slate-600 p-2 rounded text-center">
                          ACEPTAMOS TARJETAS
                        </div>
                      </div>
                    ) : (
                      /* Optimized Storefront Window */
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 relative z-0">
                        <div className="px-3 py-1 bg-rose-600 text-white font-mono text-[10px] font-black rounded-full uppercase tracking-wider">
                          NUEVA COLECCIÓN
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight font-display">
                          50% DE DESCUENTO
                        </h3>
                        <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">
                          SÓLO ESTE FIN DE SEMANA · ENTRADA LIBRE
                        </p>
                      </div>
                    )}

                    {/* Heatmaps */}
                    {showHeatmap && (
                      <div className="absolute inset-0 pointer-events-none z-20">
                        {designState === "before" ? (
                          <>
                            <div className="absolute top-[20%] left-[15%] w-16 h-16 bg-rose-500/30 rounded-full blur-md" />
                            <div className="absolute top-[20%] right-[15%] w-16 h-16 bg-amber-500/30 rounded-full blur-md" />
                            <div className="absolute bottom-[20%] left-[40%] w-16 h-16 bg-blue-500/30 rounded-full blur-md" />
                          </>
                        ) : (
                          <>
                            <div className="absolute top-[35%] left-[30%] w-44 h-24 bg-rose-600/60 rounded-full blur-xl" />
                            <div className="absolute top-[40%] left-[40%] w-20 h-12 bg-yellow-300/80 rounded-full blur-md" />
                            <div className="absolute top-[38%] left-[38%] w-6 h-6 bg-rose-600 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md">
                              1
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 z-30">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border backdrop-blur-md ${
                      designState === "after"
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                        : "bg-rose-950/80 text-rose-300 border-rose-500/40"
                    }`}>
                      {designState === "after" ? "✓ First Fixation Focada en el -50%" : "✕ Desviación Visual por Múltiples Stickers"}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic leading-snug">
                  *Las vitrinas con un único foco principal convierten hasta 2.4 veces más peatones que vidrios con más de 4 mensajes secundarios.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "column" && (
            <motion.div
              key="column"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Left Column: Columnas Problem & Value */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30">
                      <Columns className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Columnas y Espacios de Retail</h3>
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/50">
                        Superficies Curvas & Arquitectura
                      </span>
                    </div>
                  </div>

                  {/* Problem Card */}
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-rose-900/40 space-y-2">
                    <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>El Problema</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Superficies curvas o segmentadas en centros comerciales donde la <strong>deformación visual y los ángulos muertos</strong> arruinan la lectura continua del texto de la campaña.
                    </p>
                  </div>

                  {/* Value Card */}
                  <div className="p-4 bg-indigo-950/60 rounded-xl border border-indigo-800/40 space-y-2">
                    <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>El Valor de OculiMind AI</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Verifica la <strong>retentiva del mensaje tipográfico</strong> en espacios arquitectónicos complejos, garantizando que el punto focal no quede cortado por pliegues o sombras de la columna.
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Retención Tipográfica</span>
                    <span className={`text-sm font-black font-mono ${designState === 'after' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {designState === "after" ? "88% Lectura Completa" : "30% Cortado por Pliegue"}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Índice de Legibilidad</span>
                    <span className={`text-sm font-black font-mono ${designState === 'after' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {designState === "after" ? "95% Claridad" : "45% Deformación"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onTestDesign && onTestDesign("keyvisual")}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Validar Diseño de Columna / Retail</span>
                </button>
              </div>

              {/* Right Column: Column Visual Canvas */}
              <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 relative">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setDesignState("before")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                        designState === "before"
                          ? "bg-rose-600/90 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Texto Cortado por la Curva</span>
                    </button>
                    <button
                      onClick={() => setDesignState("after")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                        designState === "after"
                          ? "bg-emerald-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Composición Adaptada</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                      showHeatmap
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mapa de Calor: {showHeatmap ? "ON" : "OFF"}</span>
                  </button>
                </div>

                {/* Column Graphic Box */}
                <div className="relative aspect-[16/9] w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
                  {/* Retail Hallway + Column Simulation */}
                  <div className="relative w-full h-full bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden">
                    {/* Architectural Cylindrical Column */}
                    <div className="w-48 h-full bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 border-x-2 border-slate-700 shadow-2xl flex flex-col items-center justify-center p-4 text-center relative">
                      
                      {designState === "before" ? (
                        /* Text wrapping across edge - illegible */
                        <div className="space-y-2 opacity-80">
                          <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            GRAN LANZAMIENTO DE LA NUEVA...
                          </p>
                          <h4 className="text-lg font-black text-white leading-none break-all text-ellipsis overflow-hidden max-w-[120px]">
                            PERFUME LUXURY GOLD
                          </h4>
                          <p className="text-[8px] text-slate-500">
                            Disponible en tiendas departamentales...
                          </p>
                        </div>
                      ) : (
                        /* Text centered strictly within the optical front zone */
                        <div className="space-y-2 z-10">
                          <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                            NUEVO
                          </span>
                          <h4 className="text-xl font-black text-white font-display tracking-tight leading-tight">
                            LUXURY GOLD
                          </h4>
                          <p className="text-[10px] font-bold text-emerald-400">
                            Seducción & Elegancia
                          </p>
                        </div>
                      )}

                      {/* Heatmaps */}
                      {showHeatmap && (
                        <div className="absolute inset-0 pointer-events-none z-20">
                          {designState === "before" ? (
                            <>
                              <div className="absolute top-[30%] -left-4 w-12 h-16 bg-rose-500/40 rounded-full blur-md" />
                              <div className="absolute top-[40%] -right-4 w-12 h-16 bg-rose-500/40 rounded-full blur-md" />
                            </>
                          ) : (
                            <>
                              <div className="absolute top-[35%] left-[20%] w-28 h-20 bg-rose-600/60 rounded-full blur-xl" />
                              <div className="absolute top-[40%] left-[30%] w-12 h-10 bg-yellow-300/80 rounded-full blur-md" />
                              <div className="absolute top-[38%] left-[25%] w-6 h-6 bg-rose-600 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                1
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 z-30">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border backdrop-blur-md ${
                      designState === "after"
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                        : "bg-rose-950/80 text-rose-300 border-rose-500/40"
                    }`}>
                      {designState === "after" ? "✓ Mensaje Centrado en la Zona Foveal Directa" : "✕ Fuga de Atención por Deformación de Ángulo"}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic leading-snug">
                  *Las columnas arquitectónicas requieren mantener el logotipo y mensaje dentro de un margen central del 60% de la superficie visible para evitar pérdidas por distorsión periférica.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

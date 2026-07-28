/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Campaign, PredictiveData } from "../types";
import { 
  Megaphone, 
  Sparkles, 
  Layers, 
  Grid, 
  Split, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Layout, 
  Sliders, 
  Zap, 
  TrendingUp, 
  Upload, 
  ArrowRight, 
  Info, 
  RefreshCw,
  FileText,
  SlidersHorizontal,
  ShieldAlert,
  ChevronRight,
  Maximize2,
  Copy,
  Plus,
  BarChart3,
  Flame,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import HeatmapOverlay from "./HeatmapOverlay";
import { compressBase64Image } from "../lib/imageUtils";

import AlgorithmTrendsTracker from "./AlgorithmTrendsTracker";

interface AdsOptimizerViewProps {
  campaigns: Campaign[];
  onAddCampaign: (campaign: Campaign) => void;
  onAnalyzeCampaign: (id: string, campaignData?: Campaign) => Promise<void>;
  isAnalyzing: boolean;
}

// Standard Google & Meta Ad Sizes Definition
export interface AdFormatSpec {
  id: string;
  name: string;
  width: number;
  height: number;
  category: "google_display" | "meta_social" | "linkedin";
  aspectRatio: string;
  description: string;
  recommendedUse: string;
}

export const GOOGLE_AND_META_AD_FORMATS: AdFormatSpec[] = [
  // Google Display Standard Sizes
  { id: "med_rect", name: "Medium Rectangle (300×250)", width: 300, height: 250, category: "google_display", aspectRatio: "6:5", description: "Formato más popular y versátil para sitios web y móvil.", recommendedUse: "Efectivo al incrustarse entre párrafos de texto o barra lateral." },
  { id: "large_rect", name: "Large Rectangle / Half Page (300×600)", width: 300, height: 600, category: "google_display", aspectRatio: "1:2", description: "Gran espacio de impacto visual de media página.", recommendedUse: "Ideal para la parte superior de marca con alto engagement." },
  { id: "leaderboard", name: "Leaderboard (728×90)", width: 728, height: 90, category: "google_display", aspectRatio: "8:1", description: "Banner horizontal superior principal en escritorio.", recommendedUse: "Se ubica inmediatamente sobre el encabezado del sitio." },
  { id: "large_leaderboard", name: "Large Leaderboard (970×90)", width: 970, height: 90, category: "google_display", aspectRatio: "11:1", description: "Banner horizontal expandido de cabecera de alto impacto.", recommendedUse: "Ideal para portadas de periódicos digitales y portales masivos." },
  { id: "billboard", name: "Billboard (970×250)", width: 970, height: 250, category: "google_display", aspectRatio: "4:1", description: "El formato de Display de mayor tamaño en escritorios.", recommendedUse: "Asegura la mayor atención de apertura en campañas display." },
  { id: "skyscraper", name: "Skyscraper (120×600)", width: 120, height: 600, category: "google_display", aspectRatio: "1:5", description: "Banner vertical angosto para columnas laterales.", recommendedUse: "Muy usado en sitios de noticias y blogs de formato angosto." },
  { id: "wide_skyscraper", name: "Wide Skyscraper (160×600)", width: 160, height: 600, category: "google_display", aspectRatio: "4:15", description: "Rascacielos ancho para la barra lateral derecha de páginas web.", recommendedUse: "Excelente visibilidad durante el scroll de contenido largo." },
  { id: "mobile_banner", name: "Mobile Banner (320×50)", width: 320, height: 50, category: "google_display", aspectRatio: "32:5", description: "Banner de barra inferior estándar para aplicaciones y web móvil.", recommendedUse: "Mantiene presencia constante en pantallas táctiles." },
  { id: "large_mobile", name: "Large Mobile Banner (320×100)", width: 320, height: 100, category: "google_display", aspectRatio: "16:5", description: "Banner móvil de doble altura con más espacio de texto.", recommendedUse: "Doble de efectividad en tasas de clics (CTR) en móviles." },
  { id: "square", name: "Square (250×250)", width: 250, height: 250, category: "google_display", aspectRatio: "1:1", description: "Banner cuadrado para encajar en barras laterales y listas.", recommendedUse: "Adaptable a espacios reducidos en escritorio y tablet." },
  { id: "small_square", name: "Small Square (200×200)", width: 200, height: 200, category: "google_display", aspectRatio: "1:1", description: "Cuadrado compacto para diseños compactos.", recommendedUse: "Usado en directorios y pie de página." },
  { id: "vertical_banner", name: "Vertical Banner (120×240)", width: 120, height: 240, category: "google_display", aspectRatio: "1:2", description: "Banner vertical pequeño lateral.", recommendedUse: "Espacios publicitarios secundarios." },

  // Meta Social Formats
  { id: "insta_feed", name: "Instagram / Meta Feed (1:1 / 1080×1080)", width: 1080, height: 1080, category: "meta_social", aspectRatio: "1:1", description: "Post o anuncio estándar en feed de Instagram y Facebook.", recommendedUse: "Ideal para publicaciones orgánicas, carruseles y anuncios de conversión." },
  { id: "insta_stories", name: "Instagram Stories & Reels (9:16 / 1080×1920)", width: 1080, height: 1920, category: "meta_social", aspectRatio: "9:16", description: "Formato vertical inmersivo a pantalla completa.", recommendedUse: "Requiere considerar Zonas Seguras (Safe Zones) para evitar tapar el CTA con botones del app." },
  { id: "meta_carousel", name: "Meta Carousel Slide (1:1 / 1080×1080)", width: 1080, height: 1080, category: "meta_social", aspectRatio: "1:1", description: "Diapositiva secuencial para carruseles de productos o historias.", recommendedUse: "Mide la tasa de retención y la curiosidad para deslizar a la siguiente tarjeta." },

  // LinkedIn Ads
  { id: "linkedin_sponsored", name: "LinkedIn Sponsored Content (1.91:1 / 1200×628)", width: 1200, height: 628, category: "linkedin", aspectRatio: "1.91:1", description: "Formato horizontal B2B corporativo para feed de LinkedIn.", recommendedUse: "Efectivo con titulares ejecutivos de alto contraste y propuesta B2B limpia." }
];

export default function AdsOptimizerView({
  campaigns,
  onAddCampaign,
  onAnalyzeCampaign,
  isAnalyzing
}: AdsOptimizerViewProps) {
  // Navigation Subtabs: A/B Testing vs DCO Matrix vs Carousel Flow vs Google Banners Standard vs Algorithm Rules Tracker
  const [subTab, setSubTab] = useState<"testing" | "dco" | "carousel" | "google_banners" | "algorithm_rules">("testing");
  
  // Format Selection
  const [selectedFormat, setSelectedFormat] = useState<AdFormatSpec>(GOOGLE_AND_META_AD_FORMATS[12]); // Default Meta Feed
  const [selectedPlatform, setSelectedPlatform] = useState<"meta" | "google" | "linkedin">("meta");

  // A/B Testing State
  const [varAImage, setVarAImage] = useState<string>("https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=800&q=80");
  const [varAHeadline, setVarAHeadline] = useState<string>("¡20% de Descuento en tu Primera Compra!");
  const [varACta, setVarACta] = useState<string>("Comprar Ahora");
  
  const [varBImage, setVarBImage] = useState<string>("https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80");
  const [varBHeadline, setVarBHeadline] = useState<string>("Transforma tu Experiencia Digital Hoy");
  const [varBCta, setVarBCta] = useState<string>("Probar Gratis 14 Días");

  // DCO Matrix State (Dynamic Creative Optimization)
  const [dcoHeadlines, setDcoHeadlines] = useState<string[]>([
    "Aumenta tus Ventas un 40%",
    "La Solución de IA que Tu Negocio Necesita",
    "Prueba Gratis Sin Tarjeta de Crédito"
  ]);
  const [dcoCtas, setDcoCtas] = useState<string[]>([
    "Registrarse Ahora",
    "Ver Demostración",
    "Obtener Oferta Exclusiva"
  ]);

  // Safe Zone Toggle for Instagram Stories & Reels
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  // File Upload Handlers
  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const handleUploadVarA = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setVarAImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadVarB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setVarBImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock calculation of metrics for A/B Testing comparison
  const metricsA = {
    stopRatio: 88,
    hookRate: 92,
    cognitiveLoad: 24,
    ctrPotential: "Alto (3.8% EST)",
    safeZoneScore: 95
  };

  const metricsB = {
    stopRatio: 71,
    hookRate: 68,
    cognitiveLoad: 45,
    ctrPotential: "Medio (1.9% EST)",
    safeZoneScore: 82
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Optimizador de Anuncios Meta Ads, Google Ads & DCO</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight leading-tight">
            Ads & Dynamic Creative Testing Hub
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Módulo especializado para evaluar posts de Instagram/Facebook, anuncios de Google Display y creativos dinámicos bajo parámetros algorítmicos de <strong>Meta Ads</strong> y <strong>Google Ads</strong>. Predice la tasa de detención (Hook Rate), valida Zonas Seguras de interfaz y compara variantes A/B antes de gastar presupuesto.
          </p>

          {/* Quick Sub-Navigation Pills */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setSubTab("testing")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                subTab === "testing"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Split className="w-4 h-4 text-indigo-300" />
              <span>Pruebas A/B & Multivariante (Meta / Google)</span>
            </button>

            <button
              onClick={() => setSubTab("dco")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                subTab === "dco"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Optimización Creativa Dinámica (DCO Matrix)</span>
            </button>

            <button
              onClick={() => setSubTab("carousel")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                subTab === "carousel"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Análisis de Carruseles & Flujo de Deslizamiento</span>
            </button>

            <button
              onClick={() => setSubTab("google_banners")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                subTab === "google_banners"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Grid className="w-4 h-4 text-cyan-400" />
              <span>Suite Formatos Estándar Google Display (Todos)</span>
            </button>

            <button
              onClick={() => setSubTab("algorithm_rules")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                subTab === "algorithm_rules"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Monitor Algorítmico Live (Meta & Google)</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: A/B TESTING & VARIATIONS */}
      {subTab === "testing" && (
        <div className="space-y-6">
          {/* Platform & Format Config Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 uppercase font-mono">Red publicitaria:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setSelectedPlatform("meta")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedPlatform === "meta" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Meta Ads (Instagram / Facebook)
                </button>
                <button
                  onClick={() => setSelectedPlatform("google")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedPlatform === "google" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Google Display Ads
                </button>
                <button
                  onClick={() => setSelectedPlatform("linkedin")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedPlatform === "linkedin" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  LinkedIn Ads
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSafeZones}
                  onChange={(e) => setShowSafeZones(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Superponer Zonas Seguras de la Interfaz (Safe Zones UI)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Mapa de Calor de Atención</span>
              </label>
            </div>
          </div>

          {/* A/B Comparison Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VARIANT A */}
            <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-indigo-200 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs font-mono">
                    A
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Variante A (Versión Ganadora Predicha)</h3>
                    <p className="text-[11px] text-slate-500">Hook visual directo + CTA de alta nitidez</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold font-mono border border-emerald-200">
                  EST CTR: 3.8% (+100% vs B)
                </span>
              </div>

              {/* Live Preview Screen with UI Safe Overlay option */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center min-h-[320px] max-h-[420px]">
                <img
                  src={varAImage}
                  alt="Variante A"
                  className="w-full h-full object-cover max-h-[400px]"
                />

                {/* Precise Heatmap Overlay */}
                {showHeatmap && (
                  <HeatmapOverlay 
                    points={[
                      { x: 50, y: 30, weight: 0.95 }, // Headline/Title Focus
                      { x: 50, y: 55, weight: 0.85 }, // Product/Hero Focus
                      { x: 50, y: 82, weight: 0.90 }, // CTA Button
                      { x: 20, y: 15, weight: 0.70 }, // Logo
                    ]} 
                    opacity={0.7} 
                    radius={45} 
                  />
                )}

                {/* Simulated Safe Zone Overlay for Stories/Reels or Meta Feed */}
                {showSafeZones && selectedPlatform === "meta" && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 border-2 border-dashed border-amber-400/70">
                    <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded w-max font-mono">
                      ▲ Zona de Perfil & Stories (Evitar Texto)
                    </div>
                    <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded w-max self-end font-mono">
                      ▼ Zona de Botón CTA & Caption (Evitar Logos)
                    </div>
                  </div>
                )}

                {/* Simulated Meta Ad Card Overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-xl text-slate-900 space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 block">Anuncio Patrocinado • Meta</span>
                  <p className="font-bold text-xs leading-tight">{varAHeadline}</p>
                  <button className="w-full mt-1.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition">
                    {varACta}
                  </button>
                </div>
              </div>

              {/* Upload & Edit Controls */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Titular del Anuncio (Headline A):</label>

                  <input
                    type="text"
                    value={varAHeadline}
                    onChange={(e) => setVarAHeadline(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Texto Botón CTA:</label>
                    <input
                      type="text"
                      value={varACta}
                      onChange={(e) => setVarACta(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="shrink-0 flex items-end">
                    <button
                      onClick={() => fileInputRefA.current?.click()}
                      className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Cambiar Imagen</span>
                    </button>
                    <input
                      ref={fileInputRefA}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadVarA}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Metrics Summary Badge */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono">Tasa de Detención</span>
                  <span className="text-sm font-black text-emerald-600 font-mono">{metricsA.stopRatio}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono">Hook Rate (3s)</span>
                  <span className="text-sm font-black text-indigo-600 font-mono">{metricsA.hookRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono">Safe Zone Score</span>
                  <span className="text-sm font-black text-emerald-600 font-mono">{metricsA.safeZoneScore}/100</span>
                </div>
              </div>
            </div>

            {/* VARIANT B */}
            <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-200 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs font-mono">
                    B
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Variante B (Variación Experimental)</h3>
                    <p className="text-[11px] text-slate-500">Mensaje genérico + Menor contraste en titular</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold font-mono border border-amber-200">
                  EST CTR: 1.9%
                </span>
              </div>

              {/* Live Preview Screen with UI Safe Overlay option */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center min-h-[320px] max-h-[420px]">
                <img
                  src={varBImage}
                  alt="Variante B"
                  className="w-full h-full object-cover max-h-[400px]"
                />

                {/* Precise Heatmap Overlay */}
                {showHeatmap && (
                  <HeatmapOverlay 
                    points={[
                      { x: 50, y: 25, weight: 1.0 },  // High contrast headline
                      { x: 50, y: 50, weight: 0.95 }, // Hero image
                      { x: 50, y: 80, weight: 0.98 }, // CTA Action button
                      { x: 80, y: 15, weight: 0.80 }, // Brand logo
                    ]} 
                    opacity={0.7} 
                    radius={45} 
                  />
                )}

                {/* Simulated Safe Zone Overlay for Stories/Reels or Meta Feed */}
                {showSafeZones && selectedPlatform === "meta" && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 border-2 border-dashed border-amber-400/70">
                    <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded w-max font-mono">
                      ▲ Zona de Perfil & Stories (Evitar Texto)
                    </div>
                    <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded w-max self-end font-mono">
                      ▼ Zona de Botón CTA & Caption (Evitar Logos)
                    </div>
                  </div>
                )}

                {/* Simulated Meta Ad Card Overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-xl text-slate-900 space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Anuncio Patrocinado • Meta</span>
                  <p className="font-bold text-xs leading-tight">{varBHeadline}</p>
                  <button className="w-full mt-1.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition">
                    {varBCta}
                  </button>
                </div>
              </div>

              {/* Upload & Edit Controls */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Titular del Anuncio (Headline B):</label>

                  <input
                    type="text"
                    value={varBHeadline}
                    onChange={(e) => setVarBHeadline(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Texto Botón CTA:</label>
                    <input
                      type="text"
                      value={varBCta}
                      onChange={(e) => setVarBCta(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="shrink-0 flex items-end">
                    <button
                      onClick={() => fileInputRefB.current?.click()}
                      className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Cambiar Imagen</span>
                    </button>
                    <input
                      ref={fileInputRefB}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadVarB}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Metrics Summary Badge */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono">Tasa de Detención</span>
                  <span className="text-sm font-black text-amber-600 font-mono">{metricsB.stopRatio}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono">Hook Rate (3s)</span>
                  <span className="text-sm font-black text-slate-700 font-mono">{metricsB.hookRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono">Safe Zone Score</span>
                  <span className="text-sm font-black text-amber-600 font-mono">{metricsB.safeZoneScore}/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Comparative Insights Box */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Dictamen Predictivo Algorítmico (Meta & Google Ads)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold block">1. Detención del Scroll (Stop-Ratio)</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  La <strong>Variante A logra un 88% de detención del pulgar</strong> debido a la presencia de un elemento focal centrado y un botón CTA con contraste cromático superior al 7:1.
                </p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[11px] font-mono text-amber-400 font-bold block">2. Regla de Texto e Interfaz (Safe Zone)</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  En Stories/Reels, la Variante B coloca texto en el margen superior de 15%, donde el avatar de la marca en Instagram tapa las primeras 3 palabras del titular.
                </p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[11px] font-mono text-cyan-400 font-bold block">3. Recomendación de Puja de Presupuesto</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Asignar el <strong>80% del presupuesto a la Variante A</strong>. Para la Variante B, resituar la tipografía al centro y acortar la frase a menos de 5 palabras.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DCO MATRIX (Dynamic Creative Optimization) */}
      {subTab === "dco" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Matriz de Combinaciones Dinámicas DCO</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Dynamic Creative Optimization (DCO)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Meta Ads permite subir múltiples imágenes, titulares y llamadas a la acción para que su algoritmo ensaye combinaciones automáticamente. Evalúa la combinación ganadora calculando el Stop-Ratio y el nivel de engagement visual.
              </p>
            </div>

            {/* DCO Matrix Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Headlines Stack */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Variaciones de Titular (Headlines)</span>
                </h3>

                {dcoHeadlines.map((h, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold font-mono flex items-center justify-center">
                      H{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => {
                        const updated = [...dcoHeadlines];
                        updated[idx] = e.target.value;
                        setDcoHeadlines(updated);
                      }}
                      className="flex-1 text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                ))}
              </div>

              {/* CTAs Stack */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Variaciones de Botón CTA</span>
                </h3>

                {dcoCtas.map((c, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold font-mono flex items-center justify-center">
                      C{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => {
                        const updated = [...dcoCtas];
                        updated[idx] = e.target.value;
                        setDcoCtas(updated);
                      }}
                      className="flex-1 text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Matrix Combinations */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>Ranking de Combinaciones DCO Detección por IA (9 Combinaciones Totales)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4 rounded-2xl border-2 border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold font-mono">
                      #1 GANADORA DCO
                    </span>
                    <span className="text-xs font-black text-emerald-700 font-mono">Score: 94/100</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">"{dcoHeadlines[0]}"</p>
                  <p className="text-[11px] text-slate-600">CTA: <strong>{dcoCtas[0]}</strong></p>
                  <div className="text-[10px] text-emerald-800 bg-white/80 p-2 rounded-lg border border-emerald-200 font-mono">
                    ✓ CTR Estimado: 4.2% • Hook Rate: 91%
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-slate-600 text-white rounded text-[9px] font-bold font-mono">
                      #2 SEGUNDO LUGAR
                    </span>
                    <span className="text-xs font-black text-slate-700 font-mono">Score: 82/100</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">"{dcoHeadlines[1]}"</p>
                  <p className="text-[11px] text-slate-600">CTA: <strong>{dcoCtas[1]}</strong></p>
                  <div className="text-[10px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200 font-mono">
                    ✓ CTR Estimado: 2.8% • Hook Rate: 78%
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[9px] font-bold font-mono">
                      #3 MENOR PERFORMANCE
                    </span>
                    <span className="text-xs font-black text-rose-600 font-mono">Score: 61/100</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">"{dcoHeadlines[2]}"</p>
                  <p className="text-[11px] text-slate-600">CTA: <strong>{dcoCtas[2]}</strong></p>
                  <div className="text-[10px] text-rose-700 bg-white p-2 rounded-lg border border-rose-200 font-mono">
                    ⚠ Texto demasiado largo para pantallas móviles.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CAROUSEL SLIDE-BY-SLIDE FLOW */}
      {subTab === "carousel" && (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Carruseles de Instagram & LinkedIn</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Flujo de Atención Secuencial Diapositiva por Diapositiva
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              En publicaciones multitarjeta (carruseles), el 70% del abandono ocurre en la diapositiva 2 si no hay un elemento de continuidad ("Hook de Deslizamiento").
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  SLIDE 1: EL HOOK
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">100% Atención</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=400&q=80"
                alt="Slide 1"
                className="w-full h-32 object-cover rounded-xl border border-slate-700"
              />
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                "5 Errores que Destruyen tus Anuncios de Meta en 2026"
              </p>
              <span className="text-[10px] text-emerald-300 block font-mono">
                ✓ Gancho visual fuerte. Retención inicial: 94%.
              </span>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  SLIDE 2: EL PROBLEMA
                </span>
                <span className="text-xs font-mono font-bold text-indigo-300">81% Retención</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"
                alt="Slide 2"
                className="w-full h-32 object-cover rounded-xl border border-slate-700"
              />
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                "Error #1: Ignorar el Safe Zone de las Stories"
              </p>
              <span className="text-[10px] text-indigo-300 block font-mono">
                ✓ Mantiene la curiosidad para deslizar.
              </span>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  SLIDE 3: SOLUCIÓN
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">68% Retención</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80"
                alt="Slide 3"
                className="w-full h-32 object-cover rounded-xl border border-slate-700"
              />
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                "Usa OculiMind AI para validar antes de lanzar"
              </p>
              <span className="text-[10px] text-amber-300 block font-mono">
                ⚠ Se recomienda añadir una flecha indicadora.
              </span>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  SLIDE 4: OFERTA / CTA
                </span>
                <span className="text-xs font-mono font-bold text-purple-300">59% Conversión</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=400&q=80"
                alt="Slide 4"
                className="w-full h-32 object-cover rounded-xl border border-slate-700"
              />
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                "Guarda este post o inicia tu prueba gratis"
              </p>
              <span className="text-[10px] text-purple-300 block font-mono">
                ✓ CTA claro con botón directo.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: STANDARDIZED GOOGLE DISPLAY BANNERS SUITE */}
      {subTab === "google_banners" && (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                <Grid className="w-3.5 h-3.5 text-cyan-600" />
                <span>Formatos Estándar Globales de Google Display (IAB)</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Suite Completa de Tamaños de Banners para Análisis
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Selecciona cualquiera de las dimensiones normalizadas de Google Ads para previsualizar el comportamiento de la atención según la densidad de pixeles.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono text-slate-500">Filtrar:</span>
              <button
                onClick={() => setSelectedPlatform("google")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                12 Formatos Google
              </button>
            </div>
          </div>

          {/* Grid of Standard Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GOOGLE_AND_META_AD_FORMATS.filter(f => f.category === "google_display").map((format) => {
              const isSelected = selectedFormat.id === format.id;
              return (
                <div
                  key={format.id}
                  onClick={() => setSelectedFormat(format)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-cyan-50/70 border-2 border-cyan-500 shadow-md"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{format.name}</span>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-mono font-bold">
                        {format.aspectRatio}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{format.description}</p>
                  </div>

                  {/* Dimension Aspect Box Visual Mock */}
                  <div className="bg-slate-200 rounded-xl p-3 flex items-center justify-center min-h-[80px]">
                    <div
                      className="bg-slate-800 text-cyan-300 text-[10px] font-mono font-bold rounded flex items-center justify-center border border-cyan-500/40 p-2 text-center"
                      style={{
                        width: Math.min(format.width / 4, 180),
                        height: Math.min(format.height / 4, 100),
                      }}
                    >
                      {format.width}×{format.height}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 italic">
                    Uso recomendado: {format.recommendedUse}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Banner Active Tester Panel */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Simulador de Atención para Formato Seleccionado: <span className="text-cyan-400">{selectedFormat.name}</span>
                </h3>
              </div>
              <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-3 py-1 rounded-full border border-cyan-800">
                Dimensiones: {selectedFormat.width}px × {selectedFormat.height}px
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              En este formato ({selectedFormat.name}), el ojo del usuario se desplaza de izquierda a derecha en un patrón en "F". Para maximizar el CTR, asegúrate de colocar el Isotipo de marca en la esquina superior izquierda y el Botón de Acción (CTA) en el cuadrante inferior derecho.
            </p>
          </div>
        </div>
      )}

      {/* SUBTAB 5: LIVE ALGORITHM TRENDS & PLATFORM RULES TRACKER */}
      {subTab === "algorithm_rules" && (
        <AlgorithmTrendsTracker />
      )}
    </div>
  );
}

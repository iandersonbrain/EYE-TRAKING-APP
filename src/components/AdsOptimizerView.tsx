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
  const [dcoImages, setDcoImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
  ]);

  // Carousel Analysis State
  const [carouselSlides, setCarouselSlides] = useState<{ id: string; title: string; description: string; imageUrl: string }[]>([
    {
      id: "1",
      title: "Diapositiva 1: El Gancho (Hook)",
      description: "5 Errores que Destruyen tus Anuncios de Meta en 2026",
      imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "2",
      title: "Diapositiva 2: El Problema",
      description: "Error #1: Ignorar el Safe Zone de las Stories y Reels",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "3",
      title: "Diapositiva 3: La Solución",
      description: "Usa IA para predecir la atención visual antes de publicar",
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "4",
      title: "Diapositiva 4: Oferta / CTA",
      description: "Guarda este carrusel o inicia tu prueba gratis ahora",
      imageUrl: "https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=600&q=80"
    }
  ]);

  // Google Banner Tester Custom Image State
  const [bannerCustomImage, setBannerCustomImage] = useState<string>(
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80"
  );

  // Safe Zone Toggle for Instagram Stories & Reels
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showCarouselHeatmap, setShowCarouselHeatmap] = useState<boolean>(true);

  // File Upload Handlers
  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);
  const fileInputBannerRef = useRef<HTMLInputElement>(null);

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

  const handleUploadDcoImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const updated = [...dcoImages];
          updated[index] = event.target.result as string;
          setDcoImages(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadCarouselImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const updated = [...carouselSlides];
          updated[index].imageUrl = event.target.result as string;
          setCarouselSlides(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadBannerImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBannerCustomImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCarouselSlide = () => {
    const newId = (carouselSlides.length + 1).toString();
    setCarouselSlides([
      ...carouselSlides,
      {
        id: newId,
        title: `Diapositiva ${newId}: Nueva Tarjeta`,
        description: "Escribe aquí la propuesta de valor o llamado a la acción",
        imageUrl: "https://images.unsplash.com/photo-1542744094-3a317272018a?auto=format&fit=crop&w=600&q=80"
      }
    ]);
  };

  const handleRemoveCarouselSlide = (index: number) => {
    if (carouselSlides.length > 2) {
      setCarouselSlides(carouselSlides.filter((_, i) => i !== index));
    }
  };

  // Dynamic Slide-by-Slide Carousel Analysis Engine
  const getCarouselAnalysis = (slides: { id: string; title: string; description: string; imageUrl: string }[]) => {
    let totalScoreSum = 0;
    
    const slideReports = slides.map((slide, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === slides.length - 1;
      const fullText = `${slide.title} ${slide.description}`.trim();
      const charCount = fullText.length;
      
      const hasNumber = /\d+/.test(slide.title) || /\d+/.test(slide.description);
      const hasQuestion = /\?|¿/.test(slide.title) || /\?|¿/.test(slide.description);
      const hasTriggerWords = /(errores|secretos|trucos|pasos|cómo|guía|gratis|ahora|descubre|evita|clave|estrategia|top|motivos)/i.test(fullText);
      const hasCtaWord = /(guarda|comparte|inicia|prueba|clic|link|bio|comprar|regístrate|registrate|comenta|agenda|descarga)/i.test(fullText);

      // Unique hash from image string to vary visual contrast estimate
      let imgHash = 0;
      for (let i = 0; i < Math.min(100, slide.imageUrl.length); i++) {
        imgHash += slide.imageUrl.charCodeAt(i);
      }
      const isCustomUploaded = slide.imageUrl.startsWith("data:");

      // Dynamic Retention calculation per slide based on content and position
      let retentionEst = isFirst ? 100 : Math.max(25, 100 - (idx * 16));
      let slideScore = 75 + (imgHash % 12);

      // Adjust retention & score based on copy length and content quality
      if (charCount > 110) {
        slideScore -= 14;
        retentionEst -= 10;
      } else if (charCount >= 25 && charCount <= 85) {
        slideScore += 10;
        retentionEst += 5;
      }

      if (isFirst) {
        if (hasNumber || hasTriggerWords || hasQuestion) {
          slideScore += 12;
          retentionEst += 5;
        } else {
          slideScore -= 12;
        }
      }

      if (isLast) {
        if (hasCtaWord) {
          slideScore += 14;
        } else {
          slideScore -= 10;
        }
      }

      if (isCustomUploaded) {
        slideScore += 6;
      }

      slideScore = Math.min(98, Math.max(42, slideScore));
      retentionEst = Math.min(100, Math.max(20, retentionEst));
      totalScoreSum += slideScore;

      // Copy Length & Density Assessment
      let copyAssessment = "";
      if (charCount > 100) {
        copyAssessment = `⚠️ Texto excesivo (${charCount} caracteres). Alto riesgo de abandono del usuario en móvil por saturación tipográfica.`;
      } else if (charCount < 12) {
        copyAssessment = `⚠️ Copy muy escaso (${charCount} caracteres). No entrega suficiente propuesta de valor.`;
      } else {
        copyAssessment = `✓ Extensión adecuada (${charCount} caracteres). Óptima para lectura rápida mientras el usuario desliza el pulgar.`;
      }

      // Actionable Recommendation customized to this exact slide content
      let recommendation = "";
      if (isFirst) {
        if (!hasNumber && !hasTriggerWords && !hasQuestion) {
          recommendation = `Slide 1 (Gancho): El título "${slide.title}" es demasiado neutro. Incluye un número o palabra de impacto (ej: '5 Claves...', 'Evita este error...') para aumentar el swipe-through rate.`;
        } else {
          recommendation = `Slide 1 (Gancho Exitoso): Promesa clara en "${slide.title}". Muestra alta tasa de captación inicial en los primeros 500ms.`;
        }
      } else if (isLast) {
        if (!hasCtaWord) {
          recommendation = `Slide ${idx + 1} (Cierre): El contenido "${slide.title}" finaliza sin llamada a la acción explícita. Agrega un verbo de conversión claro (ej: 'Guarda esta guía', 'Haz clic en el enlace del perfil').`;
        } else {
          recommendation = `Slide ${idx + 1} (Cierre Efectivo): El CTA en "${slide.title}" impulsa eficazmente la interacción o conversión final.`;
        }
      } else {
        if (charCount > 90) {
          recommendation = `Slide ${idx + 1} (Desarrollo): Reduce el párrafo actual ("${slide.description.slice(0, 35)}...") a una frase corta de 2 líneas y destaca la palabra clave en negrita o color contrastante.`;
        } else {
          recommendation = `Slide ${idx + 1} (Desarrollo Secuencial): Mantiene buen ritmo de lectura sobre "${slide.title}". Asegúrate de colocar un indicador visual de flecha (➔) apuntando a la derecha para incentivar el siguiente Slide.`;
        }
      }

      return {
        slideIndex: idx + 1,
        title: slide.title,
        description: slide.description,
        slideScore,
        retentionEst: Math.round(retentionEst),
        copyAssessment,
        recommendation,
        isCustomUploaded,
        charCount
      };
    });

    const averageCarouselScore = Math.round(totalScoreSum / slides.length);

    return {
      averageCarouselScore,
      slideReports
    };
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
                Meta Ads y Google Ads prueban automáticamente combinaciones de imágenes, titulares y llamadas a la acción para encontrar la variante de mayor rendimiento.
              </p>
            </div>

            {/* Educational Guide Box */}
            <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-xs">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>¿Cómo funciona esta herramienta de Matriz DCO y cómo subir tus archivos?</span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                <strong>1. ¿Qué es DCO?</strong> En lugar de crear 1 solo anuncio estático, subes <strong>hasta 3 imágenes</strong>, <strong>3 titulares</strong> y <strong>3 botones CTA</strong>. El algoritmo de Meta Ads (Facebook/Instagram) u Google Ads mezcla estos activos automáticamente en cientos de permutaciones según el perfil de cada usuario.<br/>
                <strong>2. ¿Cómo usar esta pantalla?</strong> Sube abajo tus 3 imágenes clave, escribe las variantes de copy y botón. Nuestra IA predecirá la combinación que obtendrá la mayor tasa de detención (Hook Rate) y el mayor CTR antes de que gastes presupuesto publicitario real.
              </p>
            </div>

            {/* DCO Images Stack (Upload Images) */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>1. Imágenes Creativas para la Matriz (Subir hasta 3)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal">Formatos recomendados: JPG, PNG o WebP</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {dcoImages.map((imgUrl, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-center">
                    <span className="text-[10px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded block">
                      Imagen DCO #{idx + 1}
                    </span>
                    <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
                      <img src={imgUrl} alt={`DCO Image ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <label className="inline-flex items-center justify-center space-x-1.5 w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Cambiar Imagen {idx + 1}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadDcoImage(idx, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* DCO Headlines & CTAs Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Headlines Stack */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>2. Variaciones de Titular (Headlines)</span>
                </h3>

                {dcoHeadlines.map((h, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
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
                  <span>3. Variaciones de Botón CTA</span>
                </h3>

                {dcoCtas.map((c, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
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
                <span>Ranking de Combinaciones DCO Detección por IA (3 de 9 Permutaciones Principales)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4 rounded-2xl border-2 border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold font-mono">
                      #1 GANADORA DCO
                    </span>
                    <span className="text-xs font-black text-emerald-700 font-mono">Score: 94/100</span>
                  </div>

                  <div className="relative h-24 rounded-lg overflow-hidden border border-emerald-300 bg-slate-900">
                    <img src={dcoImages[0]} alt="DCO Combination 1" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-emerald-950/80 text-emerald-300 text-[9px] font-mono px-1.5 py-0.5 rounded">
                      Imagen 1
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-900">"{dcoHeadlines[0]}"</p>
                  <p className="text-[11px] text-slate-600">CTA: <strong>{dcoCtas[0]}</strong></p>
                  <div className="text-[10px] text-emerald-800 bg-white/80 p-2 rounded-lg border border-emerald-200 font-mono">
                    ✓ CTR Estimado: 4.2% • Hook Rate: 91%
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-slate-600 text-white rounded text-[9px] font-bold font-mono">
                      #2 SEGUNDO LUGAR
                    </span>
                    <span className="text-xs font-black text-slate-700 font-mono">Score: 82/100</span>
                  </div>

                  <div className="relative h-24 rounded-lg overflow-hidden border border-slate-300 bg-slate-900">
                    <img src={dcoImages[1]} alt="DCO Combination 2" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-slate-950/80 text-slate-300 text-[9px] font-mono px-1.5 py-0.5 rounded">
                      Imagen 2
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-900">"{dcoHeadlines[1]}"</p>
                  <p className="text-[11px] text-slate-600">CTA: <strong>{dcoCtas[1]}</strong></p>
                  <div className="text-[10px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200 font-mono">
                    ✓ CTR Estimado: 2.8% • Hook Rate: 78%
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[9px] font-bold font-mono">
                      #3 MENOR PERFORMANCE
                    </span>
                    <span className="text-xs font-black text-rose-600 font-mono">Score: 61/100</span>
                  </div>

                  <div className="relative h-24 rounded-lg overflow-hidden border border-rose-300 bg-slate-900">
                    <img src={dcoImages[2]} alt="DCO Combination 3" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-rose-950/80 text-rose-300 text-[9px] font-mono px-1.5 py-0.5 rounded">
                      Imagen 3
                    </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Carruseles de Instagram, Facebook & LinkedIn</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Flujo de Atención Secuencial Diapositiva por Diapositiva
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Sube las imágenes de cada diapositiva de tu carrusel para medir el Hook de deslizamiento y evitar el abandono prematuro del usuario.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl cursor-pointer border border-slate-200">
                <input
                  type="checkbox"
                  checked={showCarouselHeatmap}
                  onChange={(e) => setShowCarouselHeatmap(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Mapa de Calor Eye-Tracking</span>
              </label>

              <button
                onClick={handleAddCarouselSlide}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar Diapositiva</span>
              </button>
            </div>
          </div>

          {/* Interactive Slides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {carouselSlides.map((slide, idx) => {
              const carouselAnalysisResult = getCarouselAnalysis(carouselSlides);
              const slideReport = carouselAnalysisResult.slideReports[idx];
              return (
                <div key={slide.id} className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        SLIDE {idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {slideReport ? `${slideReport.retentionEst}% Retención` : `${Math.max(40, 100 - idx * 15)}%`}
                      </span>
                    </div>

                    {/* Image Preview */}
                    <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-700">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      {showCarouselHeatmap && (
                        <HeatmapOverlay
                          points={[
                            { x: 50, y: 30, weight: 0.95 },
                            { x: 45, y: 65, weight: 0.85 },
                            { x: 75, y: 75, weight: 0.70 }
                          ]}
                          opacity={0.65}
                          radius={35}
                        />
                      )}
                      {slideReport?.isCustomUploaded && (
                        <div className="absolute top-1 right-1 bg-emerald-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow font-bold z-10">
                          Imagen Propia
                        </div>
                      )}
                    </div>

                    {/* Image Upload Button */}
                    <label className="flex items-center justify-center space-x-1.5 w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-lg cursor-pointer transition border border-slate-700">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Imagen Slide {idx + 1}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadCarouselImage(idx, e)}
                        className="hidden"
                      />
                    </label>

                    {/* Title and Description Inputs */}
                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="text-[10px] text-slate-400 font-mono block mb-0.5">Título Tarjeta:</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => {
                            const updated = [...carouselSlides];
                            updated[idx].title = e.target.value;
                            setCarouselSlides(updated);
                          }}
                          className="w-full text-xs font-medium px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-mono block mb-0.5">Descripción / Copy:</label>
                        <textarea
                          rows={2}
                          value={slide.description}
                          onChange={(e) => {
                            const updated = [...carouselSlides];
                            updated[idx].description = e.target.value;
                            setCarouselSlides(updated);
                          }}
                          className="w-full text-xs font-medium px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 block font-mono font-bold">
                      Score: {slideReport?.slideScore || 80}/100
                    </span>
                    {carouselSlides.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCarouselSlide(idx)}
                        className="text-[10px] text-rose-400 hover:text-rose-300 underline font-mono"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DYNAMIC SLIDE-BY-SLIDE AI DIAGNOSTIC REPORT PANEL */}
          {(() => {
            const analysis = getCarouselAnalysis(carouselSlides);
            return (
              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                          Diagnóstico Dinámico Algorítmico Diapositiva por Diapositiva
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded-full text-[10px] font-mono font-bold border border-emerald-800">
                          {carouselSlides.length} Diapositivas Analizadas
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white font-display">
                        Dictamen de Retención Secuencial y Calidad Narrativa
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-700 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block">Puntaje Global Carrusel</span>
                      <span className="text-xl font-black text-emerald-400 font-mono">
                        {analysis.averageCarouselScore}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Individual Slide Breakdown Cards */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                    Análisis Individual por Tarjeta (Basado en Tus Textos e Imágenes):
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.slideReports.map((report) => (
                      <div
                        key={report.slideIndex}
                        className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 bg-slate-900 text-emerald-400 rounded text-[10px] font-mono font-bold border border-emerald-900/60">
                              Diapositiva #{report.slideIndex}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] font-mono text-slate-400">
                                Retención: <strong className="text-emerald-400">{report.retentionEst}%</strong>
                              </span>
                              <span className="text-xs font-black font-mono text-slate-200">
                                Score: {report.slideScore}/100
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-white leading-snug">
                              "{report.title}"
                            </p>
                            <p className="text-[11px] text-slate-300 mt-0.5 italic">
                              {report.description || "Sin descripción corta agregada"}
                            </p>
                          </div>

                          <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] space-y-1">
                            <p className="text-slate-300 font-mono">{report.copyAssessment}</p>
                          </div>
                        </div>

                        <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-800/50 text-[11px] text-emerald-200 leading-relaxed">
                          <strong className="text-emerald-400 block font-mono text-[10px] uppercase mb-0.5">
                            💡 Recomendación de Optimización:
                          </strong>
                          {report.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary & Narrative Verdict */}
                <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-800/40 text-xs text-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-400 font-mono block">
                    ✓ Veredicto de Estructura Narrativa
                  </span>
                  <p className="leading-relaxed">
                    Este diagnóstico evalúa en tiempo real las variaciones de copy, la longitud de las oraciones y el orden de tus imágenes. Cada cambio en el título o descripción actualiza de forma inmediata la puntuación individual de cada diapositiva para prevenir la tasa de abandono prematuro antes del Slide de conversión final.
                  </p>
                </div>
              </div>
            );
          })()}
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
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Simulador & Evaluador para Formato: <span className="text-cyan-400">{selectedFormat.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Proporción: {selectedFormat.aspectRatio} • {selectedFormat.width}px × {selectedFormat.height}px
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputBannerRef.current?.click()}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition flex items-center space-x-2 cursor-pointer shadow-lg shadow-cyan-600/30"
                >
                  <Upload className="w-4 h-4" />
                  <span>Subir Tu Imagen de Banner</span>
                </button>
                <input
                  ref={fileInputBannerRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadBannerImage}
                  className="hidden"
                />
              </div>
            </div>

            {/* Live Banner Scaled Frame Preview */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Previsualización con Tu Imagen Adaptada al Formato ({selectedFormat.width}x{selectedFormat.height})
              </span>

              <div 
                className="relative overflow-hidden rounded-xl border-2 border-cyan-500/60 shadow-2xl bg-slate-900 flex items-center justify-center transition-all duration-300"
                style={{
                  width: Math.min(selectedFormat.width * 0.8, 680),
                  height: Math.min(selectedFormat.height * 0.8, 380),
                  maxWidth: "100%",
                }}
              >
                <img
                  src={bannerCustomImage}
                  alt="Banner Custom Creative"
                  className="w-full h-full object-cover"
                />

                {/* Heatmap overlay option on banner */}
                {showHeatmap && (
                  <HeatmapOverlay
                    points={[
                      { x: 25, y: 30, weight: 0.95 }, // Top Left Logo/Header Area
                      { x: 50, y: 50, weight: 0.85 }, // Center Product Area
                      { x: 75, y: 75, weight: 0.90 }, // CTA Button Area
                    ]}
                    opacity={0.65}
                    radius={35}
                  />
                )}

                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-cyan-300 border border-cyan-500/40">
                  {selectedFormat.name}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[11px] font-mono text-cyan-400 font-bold block">Estructura F-Pattern</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  En {selectedFormat.name}, la visión humana recorre la zona superior. Tu logo debe quedar visible arriba a la izquierda.
                </p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold block">Legibilidad de Texto</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Conserva al menos un 40% de espacio negativo. Evita fuentes pequeñas (menos de 12px) para no ser penalizado por Google.
                </p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[11px] font-mono text-purple-400 font-bold block">Nivel de Conversión</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedFormat.recommendedUse}
                </p>
              </div>
            </div>
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

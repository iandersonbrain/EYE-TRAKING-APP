import React, { useState } from "react";
import { 
  BenchmarkData, 
  BenchmarkItem, 
  BenchmarkMode,
  BrandBenchmarkObjective,
  BrandResearchDimension,
  StrategicBrandBenchmarkData,
  StrategicBrandCompetitor,
  DimensionAnalysisResult
} from "../types";
import { defaultBenchmarkPresets } from "../lib/benchmarkPresets";
import { 
  Swords, 
  Grid3X3, 
  Trophy, 
  AlertCircle, 
  CheckCircle2, 
  SpellCheck, 
  Plus, 
  Trash2, 
  Upload, 
  Sparkles, 
  FileDown, 
  Info, 
  ArrowRight, 
  BrainCircuit, 
  Languages, 
  TrendingUp, 
  ShieldCheck, 
  Database, 
  Eye, 
  Layers,
  BarChart2,
  RefreshCw,
  Building2,
  Globe2,
  Share2,
  PieChart,
  DollarSign,
  Rocket,
  Search,
  Tag,
  Store,
  Check,
  CheckSquare,
  Square,
  Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";

const AVAILABLE_COUNTRIES = [
  "México",
  "Colombia",
  "Argentina",
  "Chile",
  "Perú",
  "España",
  "Estados Unidos",
  "Ecuador",
  "Costa Rica",
  "Uruguay",
  "Brasil",
  "Panamá",
  "República Dominicana",
  "Global (Multi-región)"
];

const AVAILABLE_INDUSTRIES = [
  "Farmacéutica, Salud & Dermocosmética",
  "Consumo Masivo / FMCG (Alimentos & Bebidas)",
  "Retail, Moda & E-Commerce",
  "Servicios Financieros, Banca & Fintech",
  "Tecnología, Apps & SaaS B2B/B2C",
  "Automotriz & Movilidad",
  "Educación & EdTech",
  "Belleza & Cuidado Personal",
  "Hospitalidad, Turismo & Gastronomía",
  "Inmobiliario, PropTech & Construcción",
  "Entretenimiento, Gaming & Medios",
  "Energía & Servicios Públicos",
  "Otra Industria / Producto Personalizado"
];

const RESEARCH_DIMENSIONS: Array<{ id: BrandResearchDimension; name: string; desc: string; icon: any }> = [
  {
    id: "social_media",
    name: "Redes Sociales & Estrategia de Contenido",
    desc: "Engagement, frecuencia de publicación, formatos clave y marcas competidoras líderes en RRSS",
    icon: Share2
  },
  {
    id: "brand_positioning",
    name: "Posicionamiento de Marca & Cuota de Mercado (% Market Share)",
    desc: "Porcentaje de participación estimado, percepión de marca y top-of-mind en consumidores",
    icon: PieChart
  },
  {
    id: "spend_vs_exposure",
    name: "Inversión Publicitaria vs Exposición Real (Share of Voice vs Spend)",
    desc: "Eficiencia de ROI publicitario: ¿Quién gasta más vs quién obtiene mayor alcance efectivo?",
    icon: DollarSign
  },
  {
    id: "product_launch",
    name: "Lanzamiento de Nuevo Producto & Océano Azul",
    desc: "Vacíos de mercado, propuesta de valor diferenciada y barreras de entrada para nuevos productos",
    icon: Rocket
  },
  {
    id: "seo_digital",
    name: "Posicionamiento SEO & Tráfico Digital",
    desc: "Volumen de visitas web, autoridad de dominio y palabras clave dominantes en la categoría",
    icon: Search
  },
  {
    id: "pricing_value",
    name: "Estrategia de Precios, Tiering & Empaquetado",
    desc: "Comparativa de bandas de precios (Económico, Mid-Tier, Premium) y propuestas de valor",
    icon: Tag
  },
  {
    id: "channels_distribution",
    name: "Canales de Distribución & Promociones",
    desc: "Presencia en farmacias, retail, e-commerce directo y estacionalidad de descuentos",
    icon: Store
  }
];

export default function BenchmarkView() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>(defaultBenchmarkPresets);
  const [activeBenchmarkId, setActiveBenchmarkId] = useState<string>(defaultBenchmarkPresets[0].id);
  const [activeMode, setActiveMode] = useState<BenchmarkMode>("duel");

  // New Benchmark Creation Drawer State
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newMode, setNewMode] = useState<BenchmarkMode>("strategic_brand");
  
  // State for Visual Duels & Grids
  const [newTitle, setNewTitle] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("Retail & FMCG");
  const [newSlots, setNewSlots] = useState<Array<{ name: string; brandType: 'own' | 'competitor'; imageUrl: string }>>([
    { name: "Mi Marca (Pieza A)", brandType: "own", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" },
    { name: "Competidor X (Pieza B)", brandType: "competitor", imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80" }
  ]);

  // State for Strategic Brand Benchmark
  const [brandTargetName, setBrandTargetName] = useState<string>("");
  const [productLineOrLaunch, setProductLineOrLaunch] = useState<string>("");
  const [brandObjective, setBrandObjective] = useState<BrandBenchmarkObjective>("new_product_launch");
  const [brandIndustry, setBrandIndustry] = useState<string>(AVAILABLE_INDUSTRIES[0]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["México", "Colombia", "Chile"]);
  const [customCountryInput, setCustomCountryInput] = useState<string>("");
  const [selectedDimensions, setSelectedDimensions] = useState<BrandResearchDimension[]>([
    "social_media",
    "brand_positioning",
    "spend_vs_exposure",
    "product_launch",
    "pricing_value"
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const activeBenchmark = benchmarks.find(b => b.id === activeBenchmarkId) || benchmarks[0];

  // Switch mode tabs
  const handleModeSwitch = (mode: BenchmarkMode) => {
    setActiveMode(mode);
    const matched = benchmarks.find(b => b.mode === mode);
    if (matched) {
      setActiveBenchmarkId(matched.id);
    }
  };

  // Toggle Country selection
  const handleToggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      if (selectedCountries.length > 1) {
        setSelectedCountries(selectedCountries.filter(c => c !== country));
      }
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const handleAddCustomCountry = () => {
    if (customCountryInput.trim() && !selectedCountries.includes(customCountryInput.trim())) {
      setSelectedCountries([...selectedCountries, customCountryInput.trim()]);
      setCustomCountryInput("");
    }
  };

  // Toggle Dimension selection
  const handleToggleDimension = (dim: BrandResearchDimension) => {
    if (selectedDimensions.includes(dim)) {
      if (selectedDimensions.length > 1) {
        setSelectedDimensions(selectedDimensions.filter(d => d !== dim));
      }
    } else {
      setSelectedDimensions([...selectedDimensions, dim]);
    }
  };

  const handleSelectAllDimensions = () => {
    if (selectedDimensions.length === RESEARCH_DIMENSIONS.length) {
      setSelectedDimensions(["social_media", "brand_positioning"]);
    } else {
      setSelectedDimensions(RESEARCH_DIMENSIONS.map(d => d.id));
    }
  };

  // Visual slots adjustment for creation
  const handleAddSlot = () => {
    if (newSlots.length >= 5) return;
    setNewSlots(prev => [
      ...prev,
      { 
        name: `Competidor ${String.fromCharCode(65 + prev.length - 1)}`, 
        brandType: "competitor", 
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" 
      }
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    if (newMode === "duel" && newSlots.length <= 2) return;
    if (newMode === "grid" && newSlots.length <= 3) return;
    setNewSlots(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const res = evt.target.result as string;
          setNewSlots(prev => {
            const updated = [...prev];
            updated[index].imageUrl = res;
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Execute Benchmark Creation (Visual or Strategic Brand)
  const handleRunBenchmark = async () => {
    setIsAnalyzing(true);

    try {
      await new Promise((r) => setTimeout(r, 2000));

      if (newMode === "strategic_brand") {
        const brandName = brandTargetName.trim() || "Marca Analizada";
        const isLaunch = brandObjective === "new_product_launch";
        const lineText = productLineOrLaunch.trim() 
          ? productLineOrLaunch.trim() 
          : (isLaunch ? "Lanzamiento de Nueva Línea de Producto" : "Análisis de Posicionamiento Global");

        // Generate dynamic realistic brand benchmark data
        const mainCompetitorName = "Competidor Líder A";
        const secondCompetitorName = "Competidor B (Mid-Tier)";
        const thirdCompetitorName = "Competidor C (Especializado)";

        const stratData: StrategicBrandBenchmarkData = {
          id: `strat-custom-${Date.now()}`,
          targetBrand: brandName,
          productLineOrLaunch: lineText,
          industry: brandIndustry,
          countries: selectedCountries,
          objective: brandObjective,
          selectedDimensions: selectedDimensions,
          createdAt: new Date().toISOString(),
          competitors: [
            {
              name: `${brandName} (${isLaunch ? 'Tu Lanzamiento' : 'Tu Marca'})`,
              isTargetBrand: true,
              marketSharePercent: isLaunch ? 6 : 28,
              shareOfVoicePercent: isLaunch ? 14 : 32,
              shareOfSpendPercent: isLaunch ? 12 : 28,
              estimatedMonthlyAdSpend: isLaunch ? "$30,000 USD" : "$95,000 USD",
              exposureEffectivenessScore: 91,
              socialFollowers: "85K",
              socialEngagementRate: "5.4%",
              topStrength: "Mensaje ágil de alta claridad, propuesta de valor directa y excelente respuesta en canales digitales.",
              keyVulnerability: isLaunch ? "Requiere acelerar la penetración en canal físico y construir confianza." : "Riesgo de presión competitiva en precios por parte de marcas masivas."
            },
            {
              name: mainCompetitorName,
              isTargetBrand: false,
              marketSharePercent: isLaunch ? 42 : 36,
              shareOfVoicePercent: 38,
              shareOfSpendPercent: 44,
              estimatedMonthlyAdSpend: "$140,000 USD",
              exposureEffectivenessScore: 72,
              socialFollowers: "850K",
              socialEngagementRate: "2.3%",
              topStrength: "Dominio de red de distribución tradicional y alto presupuesto publicitario masivo.",
              keyVulnerability: "Ineficiencia en conversión digital (ROI de pauta bajo) y comunicación rígida."
            },
            {
              name: secondCompetitorName,
              isTargetBrand: false,
              marketSharePercent: 28,
              shareOfVoicePercent: 26,
              shareOfSpendPercent: 24,
              estimatedMonthlyAdSpend: "$75,000 USD",
              exposureEffectivenessScore: 82,
              socialFollowers: "340K",
              socialEngagementRate: "3.7%",
              topStrength: "Excelente equilibrio calidad-precio en puntos de venta locales.",
              keyVulnerability: "Falta de innovación en empaques e ingredientes activos."
            },
            {
              name: thirdCompetitorName,
              isTargetBrand: false,
              marketSharePercent: 18,
              shareOfVoicePercent: 18,
              shareOfSpendPercent: 14,
              estimatedMonthlyAdSpend: "$40,000 USD",
              exposureEffectivenessScore: 89,
              socialFollowers: "190K",
              socialEngagementRate: "6.1%",
              topStrength: "Comunidad de nicho hiper-fiel con alta tasa de recomendación.",
              keyVulnerability: "Alcance limitado fuera de su canal online principal."
            }
          ],
          marketShareChart: [
            { brand: mainCompetitorName, share: isLaunch ? 42 : 36 },
            { brand: secondCompetitorName, share: 28 },
            { brand: thirdCompetitorName, share: 18 },
            { brand: `${brandName} (${isLaunch ? 'Tu Lanzamiento' : 'Tu Marca'})`, share: isLaunch ? 6 : 28, isTarget: true }
          ],
          spendVsExposureChart: [
            { brand: mainCompetitorName, shareOfSpend: 44, shareOfVoice: 38, roiIndex: 72 },
            { brand: secondCompetitorName, shareOfSpend: 24, shareOfVoice: 26, roiIndex: 82 },
            { brand: thirdCompetitorName, shareOfSpend: 14, shareOfVoice: 18, roiIndex: 89 },
            { brand: brandName, shareOfSpend: isLaunch ? 12 : 28, shareOfVoice: isLaunch ? 14 : 32, roiIndex: 91 }
          ],
          dimensionResults: selectedDimensions.map(dim => {
            const matchInfo = RESEARCH_DIMENSIONS.find(rd => rd.id === dim);
            return {
              id: dim,
              title: matchInfo?.name || dim,
              summary: `Análisis ejecutado para ${brandName} en ${selectedCountries.join(", ")} dentro del sector ${brandIndustry}.`,
              keyDataPoints: [
                `Líderes de categoría en ${selectedCountries[0]}: ${mainCompetitorName} concentra la mayor pauta pero muestra baja eficiencia de engagement.`,
                `Oportunidad en canales digitales: Formatos de video corto e influenciadores generan un 3.2x más de interacción que los anuncios tradicionales.`,
                `Comportamiento del consumidor local: El 68% de los compradores valora la transparencia en ingredientes/características del producto.`
              ],
              strategicAction: `Implementar campaña focalizada en ${selectedCountries.join(" y ")} destacando la propuesta de valor diferenciada de ${brandName}.`
            };
          }),
          blueOceanOpportunities: [
            `Estrategia 'Océano Azul': Posicionar ${brandName} en un espacio no saturado enfocado en ${lineText}.`,
            "Aprovechar la ineficiencia publicitaria del competidor principal ofreciendo mayor agilidad en mensajes digitales.",
            "Desarrollar kits promocionales o versiones de entrada para reducir la barrera de adopción en el consumidor."
          ],
          executiveSummary: `Benchmark estratégico completado para ${brandName} (${lineText}) en los mercados de ${selectedCountries.join(", ")}. Se identificó una alta oportunidad de captura de cuota de mercado aprovechando que los competidores tradicionales mantienen mensajes rígidos y baja tasa de engagement en medios digitales.`,
          strategicActionPlan: [
            `Fase 1: Activación de campaña en medios digitales prioritarios en ${selectedCountries.slice(0, 2).join(" y ")}.`,
            "Fase 2: Alianzas estratégicas con creadores de contenido y distribuidores locales.",
            "Fase 3: Expansión de la cobertura a la totalidad de los países seleccionados."
          ]
        };

        const created: BenchmarkData = {
          id: `bench-strat-${Date.now()}`,
          title: `Benchmark Estratégico: ${brandName} (${lineText})`,
          categoryName: brandIndustry,
          mode: "strategic_brand",
          createdAt: new Date().toISOString(),
          items: [],
          winnerId: "target-brand",
          categoryAverage: { clarity: 82, cognitiveLoad: 35, attentionHook: 84, neuroIndex: 85 },
          executiveSummary: stratData.executiveSummary,
          strategicRecommendations: stratData.strategicActionPlan,
          strategicBrandData: stratData
        };

        setBenchmarks(prev => [created, ...prev]);
        setActiveBenchmarkId(created.id);
        setActiveMode("strategic_brand");

      } else {
        // Handle Visual Duel or Grid Creation
        const titleText = newTitle.trim() || "Evaluación de Piezas Gráficas";
        const items: BenchmarkItem[] = newSlots.map((slot, idx) => {
          const isOwn = slot.brandType === "own";
          const clarity = isOwn ? Math.floor(Math.random() * 12) + 84 : Math.floor(Math.random() * 20) + 65;
          const cogLoad = isOwn ? Math.floor(Math.random() * 15) + 25 : Math.floor(Math.random() * 25) + 40;
          const hook3s = isOwn ? Math.floor(Math.random() * 10) + 85 : Math.floor(Math.random() * 20) + 68;
          const recall = isOwn ? Math.floor(Math.random() * 10) + 82 : Math.floor(Math.random() * 20) + 65;
          const neuroScore = Math.round((clarity * 0.35) + ((100 - cogLoad) * 0.25) + (hook3s * 0.25) + (recall * 0.15));

          return {
            id: `item-custom-${Date.now()}-${idx}`,
            name: slot.name || `Pieza ${idx + 1}`,
            brandType: slot.brandType,
            imageUrl: slot.imageUrl,
            clarityScore: clarity,
            cognitiveLoad: cogLoad,
            attentionHook3s: hook3s,
            brandRecallScore: recall,
            neuroScoreIndex: neuroScore,
            spellingErrorsCount: isOwn ? 0 : (idx % 2 === 0 ? 0 : 1),
            spellingStatus: isOwn ? "100% Sin faltas ortográficas" : "Verificación ortográfica ejecutada",
            strengths: isOwn 
              ? ["Excelente legibilidad y jerarquía de marca", "Mínima carga cognitiva en los primeros 2 segundos"]
              : ["Puntos de color de alto contraste", "Formato llamativo"],
            weaknesses: isOwn
              ? ["Posible refuerzo en el micro-copy inferior"]
              : ["Ruido visual que distrae del CTA principal", "Carga cognitiva elevada"],
            keyDifference: isOwn ? "Mayor retención y velocidad de lectura del mensaje" : "Dispersión de mirada en elementos secundarios"
          };
        });

        const sortedItems = [...items].sort((a, b) => b.neuroScoreIndex - a.neuroScoreIndex);
        const winner = sortedItems[0];

        const avgClarity = Math.round(items.reduce((s, i) => s + i.clarityScore, 0) / items.length);
        const avgCog = Math.round(items.reduce((s, i) => s + i.cognitiveLoad, 0) / items.length);
        const avgHook = Math.round(items.reduce((s, i) => s + i.attentionHook3s, 0) / items.length);
        const avgNeuro = Math.round(items.reduce((s, i) => s + i.neuroScoreIndex, 0) / items.length);

        const created: BenchmarkData = {
          id: `bench-custom-${Date.now()}`,
          title: titleText,
          categoryName: newCategory,
          mode: newMode,
          createdAt: new Date().toISOString(),
          items: sortedItems,
          winnerId: winner.id,
          headToHeadSummary: newMode === "duel"
            ? `${winner.name} supera a su competidor directo con un índice Neuro-Score de ${winner.neuroScoreIndex}/100 gracias a un menor nivel de carga cognitiva y mayor retención en el primer golpe de vista (3s).`
            : undefined,
          categoryAverage: {
            clarity: avgClarity,
            cognitiveLoad: avgCog,
            attentionHook: avgHook,
            neuroIndex: avgNeuro
          },
          executiveSummary: `Análisis de benchmark ejecutado con éxito para ${newSlots.length} piezas en la categoría ${newCategory}. Se confirma que la pieza líder (${winner.name}) captura la atención en los primeros 1.2s reduciendo la fricción cognitiva.`,
          strategicRecommendations: [
            `Optimizar el CTA de las piezas secundarias para acercarse al estándar de ${winner.name}.`,
            "Mantener la simplicidad tipográfica en los primeros 3 segundos de lectura.",
            "Verificar la ortografía y contraste en piezas secundarias antes del lanzamiento masivo."
          ]
        };

        setBenchmarks(prev => [created, ...prev]);
        setActiveBenchmarkId(created.id);
        setActiveMode(newMode);
      }

      setIsCreatingNew(false);
    } catch (e) {
      console.error(e);
      alert("Error al procesar el benchmark.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 25, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`INFORME DE BENCHMARK COMPETITIVO - AI STUDIO`, 15, 16);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(`Evaluación: ${activeBenchmark.title}`, 15, 38);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Categoría: ${activeBenchmark.categoryName} | Modalidad: ${
      activeBenchmark.mode === 'duel' ? 'Duelo 1 a 1 (Visual)' : activeBenchmark.mode === 'grid' ? 'Set Competitivo (Parrilla 3-5 piezas)' : 'Benchmark Estratégico de Marca & Mercado'
    }`, 15, 45);

    let yPos = 58;

    if (activeBenchmark.mode === "strategic_brand" && activeBenchmark.strategicBrandData) {
      const sb = activeBenchmark.strategicBrandData;
      doc.setFont("helvetica", "bold");
      doc.text(`MARCA OBJETIVO: ${sb.targetBrand} | INDUSTRIA: ${sb.industry}`, 15, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.text(`Mercados / Países: ${sb.countries.join(", ")}`, 15, yPos);
      yPos += 10;

      doc.setFont("helvetica", "bold");
      doc.text("TABLA DE COMPETIDORES & SHARE OF VOICE:", 15, yPos);
      yPos += 7;

      sb.competitors.forEach((c, idx) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`${idx + 1}. ${c.name} - Market Share: ${c.marketSharePercent}% | Share of Voice: ${c.shareOfVoicePercent}% | Pauta Est.: ${c.estimatedMonthlyAdSpend}`, 15, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
        doc.text(`   Fortaleza: ${c.topStrength}`, 15, yPos);
        yPos += 6;
      });

      yPos += 4;
      doc.setFont("helvetica", "bold");
      doc.text("RESUMEN EJECUTIVO Y PLAN DE ACCIÓN:", 15, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      const summaryLines = doc.splitTextToSize(sb.executiveSummary, pageWidth - 30);
      doc.text(summaryLines, 15, yPos);

    } else {
      doc.setFont("helvetica", "bold");
      doc.text("RESULTADOS Y MATRIZ COMPETITIVA:", 15, yPos);
      yPos += 8;

      activeBenchmark.items.forEach((item, idx) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${idx + 1}. ${item.name} (${item.brandType === 'own' ? 'Tu Marca' : 'Competidor'})`, 15, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`   - Claridad: ${item.clarityScore}/100 | Carga Cognitiva: ${item.cognitiveLoad}/100 | Hook 3s: ${item.attentionHook3s}/100 | Neuro-Score: ${item.neuroScoreIndex}/100`, 15, yPos);
        yPos += 7;
      });

      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("RESUMEN EJECUTIVO:", 15, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const summaryLines = doc.splitTextToSize(activeBenchmark.executiveSummary, pageWidth - 30);
      doc.text(summaryLines, 15, yPos);
    }

    doc.save(`Benchmark_${activeBenchmark.title.replace(/\s+/g, "_")}.pdf`);
  };

  const currentStratData = activeBenchmark?.strategicBrandData;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
              <span>Investigación & Benchmark Competitivo IA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display text-white">
              Benchmark de Marca, Mercado & Piezas
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Analiza marcas, empresas y productos en cualquier país e industria (Farmacéutica, FMCG, Retail, Fintech, SaaS, etc.) o realiza duelos de anuncios y empaques.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Benchmark</span>
            </button>
            
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-indigo-400" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Methodology Footer */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center space-x-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span><strong>Marcas & Empresas:</strong> Análisis de posicionamiento, cuota e inversión</span>
          </div>
          <div className="flex items-center space-x-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
            <Globe2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span><strong>Multi-País & Industria:</strong> Cobertura Latam, España, EE.UU. y Global</span>
          </div>
          <div className="flex items-center space-x-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
            <Rocket className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Lanzamiento de Producto:</strong> Océanos Azules y vacíos competitivos</span>
          </div>
        </div>
      </div>

      {/* Mode Selector & Preset Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          
          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => handleModeSwitch("strategic_brand")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeMode === "strategic_brand"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>Benchmark de Marca & Mercado</span>
            </button>

            <button
              onClick={() => handleModeSwitch("duel")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeMode === "duel"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Duelo Visual 1 a 1</span>
            </button>

            <button
              onClick={() => handleModeSwitch("grid")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeMode === "grid"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>Parrilla Visual (3-5 Piezas)</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Estudios disponibles en esta modalidad:
          </div>
        </div>

        {/* Preset Badges */}
        <div className="flex flex-wrap gap-2">
          {benchmarks
            .filter(b => b.mode === activeMode)
            .map(b => (
              <button
                key={b.id}
                onClick={() => setActiveBenchmarkId(b.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer border ${
                  activeBenchmarkId === b.id
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>{b.title}</span>
              </button>
            ))}
        </div>
      </div>

      {/* New Benchmark Creation Form Drawer */}
      <AnimatePresence>
        {isCreatingNew && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-6 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold font-display flex items-center text-indigo-300">
                  <Plus className="w-5 h-5 mr-2 text-indigo-400" />
                  Configurar Nuevo Benchmark
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Elige entre un análisis de marca/mercado por país o una comparativa neuro-atencional de piezas gráficas.
                </p>
              </div>

              <button 
                onClick={() => setIsCreatingNew(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1 bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
            </div>

            {/* Mode Selection Buttons in Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setNewMode("strategic_brand")}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start space-x-3 ${
                  newMode === "strategic_brand" 
                    ? "bg-indigo-600/30 border-indigo-400 text-white ring-2 ring-indigo-500/20" 
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs block text-white">Benchmark de Marca & Mercado</span>
                  <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                    Evalúa marcas, países, redes sociales, market share, inversión publicitaria vs exposición y lanzamientos.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNewMode("duel")}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start space-x-3 ${
                  newMode === "duel" 
                    ? "bg-indigo-600/30 border-indigo-400 text-white ring-2 ring-indigo-500/20" 
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Swords className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs block text-white">Duelo Visual 1 a 1</span>
                  <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                    Compara 2 anuncios, empaques o landing pages mediante mapa de eye-tracking y neuro-atención.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNewMode("grid")}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start space-x-3 ${
                  newMode === "grid" 
                    ? "bg-indigo-600/30 border-indigo-400 text-white ring-2 ring-indigo-500/20" 
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs block text-white">Set Competitivo (3-5 Piezas)</span>
                  <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                    Matriz comparativa de 3 a 5 diseños gráficos de tu marca contra competidores.
                  </span>
                </div>
              </button>
            </div>

            {/* FORM CASE A: STRATEGIC BRAND & MARKET BENCHMARK */}
            {newMode === "strategic_brand" && (
              <div className="space-y-6 pt-2 border-t border-slate-800">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nombre de la Marca o Empresa a Evaluar *
                    </label>
                    <input 
                      type="text"
                      placeholder="ej. Genomma Lab, Pfizer, Dermaglós, Bimbo, Tesla, NotCo..."
                      value={brandTargetName}
                      onChange={(e) => setBrandTargetName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Producto o Línea Específica (Opcional)
                    </label>
                    <input 
                      type="text"
                      placeholder="ej. Bloqueador Solar SPF50+, Bebida Proteica, App Móvil..."
                      value={productLineOrLaunch}
                      onChange={(e) => setProductLineOrLaunch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Objetivo de la Investigación
                    </label>
                    <select
                      value={brandObjective}
                      onChange={(e) => setBrandObjective(e.target.value as BrandBenchmarkObjective)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="new_product_launch">🚀 Lanzamiento de Nuevo Producto / Entrada a Mercado (Revisar Competencia & Océano Azul)</option>
                      <option value="existing_brand_audit">🏢 Auditoría de Marca / Empresa Existente en el Mercado</option>
                      <option value="competitive_landscape">📊 Mapeo General de Paisaje Competitivo & Inversión</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Industria o Categoría de Mercado
                    </label>
                    <select
                      value={brandIndustry}
                      onChange={(e) => setBrandIndustry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {AVAILABLE_INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Country / Market Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Países / Mercados Locales de Enfoque (Selecciona uno o varios)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_COUNTRIES.map((country) => {
                      const isSelected = selectedCountries.includes(country);
                      return (
                        <button
                          key={country}
                          type="button"
                          onClick={() => handleToggleCountry(country)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                            isSelected
                              ? "bg-indigo-600 border border-indigo-400 text-white"
                              : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Globe2 className="w-3 h-3" />
                          <span>{country}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Country */}
                  <div className="flex items-center space-x-2 pt-1 max-w-sm">
                    <input 
                      type="text"
                      placeholder="Agregar otro país..."
                      value={customCountryInput}
                      onChange={(e) => setCustomCountryInput(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCountry}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold rounded-xl"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>

                {/* Dimensions Multi-Select */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Dimensiones de Búsqueda y Evaluación a Incluir:
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAllDimensions}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      {selectedDimensions.length === RESEARCH_DIMENSIONS.length ? "Desmarcar Opcionales" : "Seleccionar Todas"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {RESEARCH_DIMENSIONS.map((dim) => {
                      const isChecked = selectedDimensions.includes(dim.id);
                      const IconComponent = dim.icon;
                      return (
                        <div 
                          key={dim.id}
                          onClick={() => handleToggleDimension(dim.id)}
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
                            isChecked
                              ? "bg-indigo-950/60 border-indigo-500 text-white"
                              : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="mt-0.5">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600 shrink-0" />
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <span className="font-bold text-xs flex items-center text-slate-200">
                              <IconComponent className="w-3.5 h-3.5 mr-1.5 text-indigo-400 shrink-0" />
                              {dim.name}
                            </span>
                            <p className="text-[11px] text-slate-400 leading-tight">
                              {dim.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* FORM CASE B: VISUAL DUEL / GRID */}
            {(newMode === "duel" || newMode === "grid") && (
              <div className="space-y-6 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Título del Estudio</label>
                    <input 
                      type="text"
                      placeholder="ej. Duelo de Anuncios Campaña Hot Sale 2026"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Categoría</label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Slots Upload */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Piezas a Comparar ({newSlots.length} de {newMode === "duel" ? "2" : "5"})
                    </span>
                    {newMode === "grid" && newSlots.length < 5 && (
                      <button
                        type="button"
                        onClick={handleAddSlot}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Pieza ({newSlots.length + 1})</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {newSlots.map((slot, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 relative group">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            Pieza #{idx + 1}
                          </span>
                          {((newMode === "duel" && newSlots.length > 2) || (newMode === "grid" && newSlots.length > 3)) && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(idx)}
                              className="text-slate-500 hover:text-rose-400 text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <input 
                          type="text"
                          value={slot.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewSlots(prev => {
                              const updated = [...prev];
                              updated[idx].name = val;
                              return updated;
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                        />

                        <select
                          value={slot.brandType}
                          onChange={(e) => {
                            const val = e.target.value as 'own' | 'competitor';
                            setNewSlots(prev => {
                              const updated = [...prev];
                              updated[idx].brandType = val;
                              return updated;
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                        >
                          <option value="own">Tu Marca</option>
                          <option value="competitor">Competidor</option>
                        </select>

                        <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                          {slot.imageUrl ? (
                            <img src={slot.imageUrl} alt={slot.name} className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="w-5 h-5 text-slate-600" />
                          )}
                          <label className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] font-bold text-white cursor-pointer">
                            <span>Cambiar Imagen</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(idx, e)} />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={handleRunBenchmark}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Ejecutando Investigación IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Ejecutar Benchmark Competitivo IA</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW DISPLAY MODE 1: STRATEGIC BRAND & MARKET BENCHMARK */}
      {activeBenchmark && activeBenchmark.mode === "strategic_brand" && currentStratData && (
        <div className="space-y-8">
          
          {/* Executive Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center">
                    <Rocket className="w-3 h-3 mr-1 text-amber-400" />
                    {currentStratData.objective === "new_product_launch" ? "Lanzamiento de Producto" : "Auditoría de Marca"}
                  </span>
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {currentStratData.industry}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                  {currentStratData.targetBrand}
                </h2>
                {currentStratData.productLineOrLaunch && (
                  <p className="text-xs text-indigo-200 font-medium">
                    {currentStratData.productLineOrLaunch}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-bold block mr-1">Mercados:</span>
                {currentStratData.countries.map(c => (
                  <span key={c} className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center">
                    <Globe2 className="w-3 h-3 mr-1 text-indigo-400" />
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
              <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px] block">
                Resumen Ejecutivo Estratégico
              </span>
              <p>{currentStratData.executiveSummary}</p>
            </div>
          </div>

          {/* Competitor Market Share & Share of Voice Matrix */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center">
                  <PieChart className="w-4 h-4 text-indigo-600 mr-2" />
                  Cuota de Mercado (Market Share) & Share of Voice
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparativa entre marcas competidoras líderes y tu posicionamiento proyectado.
                </p>
              </div>
            </div>

            {/* Table of Competitors */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Marca / Empresa</th>
                    <th className="py-3 px-3 text-center">Market Share (%)</th>
                    <th className="py-3 px-3 text-center">Share of Voice (%)</th>
                    <th className="py-3 px-3 text-center">Pauta Est. Mensual</th>
                    <th className="py-3 px-3 text-center">Eficiencia ROI</th>
                    <th className="py-3 px-3 text-center">Comunidad RRSS</th>
                    <th className="py-3 px-4">Principal Fortaleza</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {currentStratData.competitors.map((comp, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50 transition ${comp.isTargetBrand ? "bg-indigo-50/50 font-bold" : ""}`}>
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                        <span className="font-mono text-slate-400 text-[11px]">{idx + 1}.</span>
                        <span>{comp.name}</span>
                        {comp.isTargetBrand && (
                          <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ml-1">
                            Tu Marca
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-900">
                        {comp.marketSharePercent}%
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-indigo-700">
                        {comp.shareOfVoicePercent}%
                      </td>

                      <td className="py-3 px-3 text-center text-slate-700">
                        {comp.estimatedMonthlyAdSpend}
                      </td>

                      <td className="py-3 px-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          comp.exposureEffectivenessScore >= 85 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {comp.exposureEffectivenessScore}/100
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center text-slate-600 text-[11px]">
                        {comp.socialFollowers} ({comp.socialEngagementRate} ER)
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs text-[11px]">
                        {comp.topStrength}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visual Bars Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Distribución de Cuota de Mercado (%)
                </span>
                <div className="space-y-2">
                  {currentStratData.marketShareChart.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700 font-semibold">
                        <span>{item.brand}</span>
                        <span>{item.share}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.isTarget ? "bg-amber-500" : "bg-indigo-600"}`} 
                          style={{ width: `${item.share}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Eficiencia Publicitaria (Share of Voice vs Spend)
                </span>
                <div className="space-y-2">
                  {currentStratData.spendVsExposureChart.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700 font-semibold">
                        <span>{item.brand}</span>
                        <span className="text-indigo-700 font-bold">SOV: {item.shareOfVoice}% | Pauta: {item.shareOfSpend}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-indigo-600 h-full" style={{ width: `${item.shareOfVoice}%` }}></div>
                        <div className="bg-slate-400 h-full opacity-50" style={{ width: `${item.shareOfSpend}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Research Dimensions Deep Dive */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center">
              <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
              Dimensiones de Análisis Investigadas ({currentStratData.dimensionResults.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentStratData.dimensionResults.map((dimRes) => (
                <div key={dimRes.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                      {dimRes.title}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {dimRes.summary}
                    </p>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hallazgos Clave:</span>
                      <ul className="space-y-1">
                        {dimRes.keyDataPoints.map((kp, kIdx) => (
                          <li key={kIdx} className="flex items-start text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5 shrink-0 mt-0.5" />
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">Acción Recomendada:</span>
                    <p className="text-xs text-indigo-900 font-semibold mt-0.5">
                      {dimRes.strategicAction}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blue Ocean Opportunities (New Product Launch) */}
          {currentStratData.blueOceanOpportunities && currentStratData.blueOceanOpportunities.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-amber-300/60 space-y-3">
              <h4 className="text-sm font-bold text-amber-900 font-display flex items-center">
                <Rocket className="w-4 h-4 text-amber-600 mr-2" />
                Oportunidades de 'Océano Azul' para Lanzamiento de Producto
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {currentStratData.blueOceanOpportunities.map((bo, bIdx) => (
                  <div key={bIdx} className="bg-white p-3.5 rounded-2xl border border-amber-200 text-xs text-slate-800 space-y-1">
                    <span className="font-bold text-amber-800 block">Ventana #{bIdx + 1}</span>
                    <p>{bo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center">
              <TrendingUp className="w-4 h-4 text-indigo-600 mr-2" />
              Hoja de Ruta Estratégica de Implementación
            </h4>
            <div className="space-y-2">
              {currentStratData.strategicActionPlan.map((act, aIdx) => (
                <div key={aIdx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex items-center space-x-3 text-slate-800 font-medium">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    {aIdx + 1}
                  </span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW DISPLAY MODE 2 & 3: VISUAL DUEL OR VISUAL GRID */}
      {activeBenchmark && (activeBenchmark.mode === "duel" || activeBenchmark.mode === "grid") && (
        <div className="space-y-8">

          {/* MODE 1: Duelo 1 a 1 (Head-to-Head) */}
          {activeBenchmark.mode === "duel" && (
            <div className="space-y-6">
              
              {/* Winner Head-to-Head Hero Banner */}
              <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Ganador del Duelo Neuro-Atencional</span>
                  </div>
                  <h2 className="text-xl font-black font-display">
                    {activeBenchmark.items.find(i => i.id === activeBenchmark.winnerId)?.name || activeBenchmark.items[0]?.name}
                  </h2>
                  <p className="text-xs text-indigo-200 leading-relaxed">
                    {activeBenchmark.headToHeadSummary || activeBenchmark.executiveSummary}
                  </p>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-indigo-500/30 text-center shrink-0 min-w-[200px]">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">Neuro-Score Líder</span>
                  <span className="text-4xl font-black text-amber-400 font-display">
                    {activeBenchmark.items.find(i => i.id === activeBenchmark.winnerId)?.neuroScoreIndex || 90}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">/ 100 Puntos de Eficacia</span>
                </div>
              </div>

              {/* Side-by-Side Duel Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeBenchmark.items.slice(0, 2).map((item) => {
                  const isWinner = item.id === activeBenchmark.winnerId;
                  return (
                    <div 
                      key={item.id}
                      className={`bg-white rounded-3xl border p-6 space-y-5 transition-all shadow-sm ${
                        isWinner ? "border-indigo-400 ring-2 ring-indigo-500/20 shadow-md" : "border-slate-200"
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              item.brandType === "own" 
                                ? "bg-indigo-100 text-indigo-800" 
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {item.brandType === "own" ? "Tu Marca" : "Competidor Directo"}
                            </span>
                            {isWinner && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                                <Trophy className="w-3 h-3 mr-1 text-amber-600" /> Líder
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 font-semibold block">Neuro-Score</span>
                          <span className="text-xl font-black text-slate-900">{item.neuroScoreIndex}/100</span>
                        </div>
                      </div>

                      {/* Image Preview */}
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-950">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-semibold flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-indigo-400" />
                          <span>Vista de Eye-Tracking</span>
                        </div>
                      </div>

                      {/* Key Neuro Metrics */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Claridad Atencional</span>
                          <span className="text-lg font-black text-slate-800">{item.clarityScore}%</span>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.clarityScore}%` }}></div>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Carga Cognitiva</span>
                          <span className="text-lg font-black text-slate-800">{item.cognitiveLoad}%</span>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div className={`h-full rounded-full ${item.cognitiveLoad < 40 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${item.cognitiveLoad}%` }}></div>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hook Retención (3s)</span>
                          <span className="text-lg font-black text-slate-800">{item.attentionHook3s}%</span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Recordación Isotipo</span>
                          <span className="text-lg font-black text-slate-800">{item.brandRecallScore}%</span>
                        </div>
                      </div>

                      {/* Orthography Status */}
                      <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-xs flex items-center justify-between text-indigo-900">
                        <div className="flex items-center space-x-2">
                          <SpellCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-semibold">{item.spellingStatus || "Ortografía verificada"}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700">
                          <Languages className="w-3 h-3" />
                          <span>ES / EN</span>
                        </div>
                      </div>

                      {/* Strengths & Differences */}
                      <div className="space-y-2 pt-1 text-xs">
                        <span className="font-bold text-slate-800 block uppercase text-[10px] tracking-wider">Fortalezas de la pieza:</span>
                        <ul className="space-y-1">
                          {item.strengths.map((str, sIdx) => (
                            <li key={sIdx} className="flex items-start text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5 shrink-0 mt-0.5" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-2 border-t border-slate-100">
                          <span className="font-bold text-indigo-900 block text-[11px]">Diferencial Clave:</span>
                          <p className="text-slate-600 text-[11px] italic mt-0.5">{item.keyDifference}</p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* MODE 2: Parrilla / Set Competitivo (3 a 5 piezas) */}
          {activeBenchmark.mode === "grid" && (
            <div className="space-y-8">
              
              {/* Category Matrix Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display flex items-center">
                      <Grid3X3 className="w-4 h-4 text-indigo-600 mr-2" />
                      Matriz Competitiva de Neuro-Score ({activeBenchmark.items.length} Piezas)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Promedio de la categoría {activeBenchmark.categoryName}: Neuro-Score <strong>{activeBenchmark.categoryAverage.neuroIndex}/100</strong>
                    </p>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Pieza / Marca</th>
                        <th className="py-3 px-3">Tipo</th>
                        <th className="py-3 px-3 text-center">Claridad</th>
                        <th className="py-3 px-3 text-center">Carga Cognitiva</th>
                        <th className="py-3 px-3 text-center">Hook (3s)</th>
                        <th className="py-3 px-3 text-center">Recordación Marca</th>
                        <th className="py-3 px-3 text-center">Ortografía ES/EN</th>
                        <th className="py-3 px-4 text-right">Neuro-Score Index</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {activeBenchmark.items.map((item, idx) => {
                        const isWinner = item.id === activeBenchmark.winnerId;
                        return (
                          <tr key={item.id} className={`hover:bg-slate-50/80 transition ${isWinner ? "bg-amber-50/40" : ""}`}>
                            <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-3">
                              <span className="font-mono text-slate-400 text-[11px] w-4">{idx + 1}.</span>
                              <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                              <span className="truncate max-w-[180px] sm:max-w-none">{item.name}</span>
                              {isWinner && <Trophy className="w-4 h-4 text-amber-500 shrink-0 ml-1" />}
                            </td>

                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.brandType === "own" 
                                  ? "bg-indigo-100 text-indigo-800" 
                                  : "bg-slate-100 text-slate-600"
                              }`}>
                                {item.brandType === "own" ? "Tu Marca" : "Competidor"}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-center font-bold text-slate-800">
                              {item.clarityScore}%
                            </td>

                            <td className="py-3 px-3 text-center font-bold text-slate-800">
                              <span className={item.cognitiveLoad < 40 ? "text-emerald-700" : "text-amber-700"}>
                                {item.cognitiveLoad}%
                              </span>
                            </td>

                            <td className="py-3 px-3 text-center font-bold text-slate-800">
                              {item.attentionHook3s}%
                            </td>

                            <td className="py-3 px-3 text-center font-bold text-slate-800">
                              {item.brandRecallScore}%
                            </td>

                            <td className="py-3 px-3 text-center">
                              {item.spellingErrorsCount === 0 ? (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                                  100% Correcto
                                </span>
                              ) : (
                                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                                  {item.spellingErrorsCount} Errata
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <span className={`text-base font-black ${isWinner ? "text-amber-600 font-display" : "text-slate-900"}`}>
                                {item.neuroScoreIndex}/100
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cognitive Quadrant Positioning Map */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display flex items-center">
                    <BarChart2 className="w-4 h-4 text-indigo-600 mr-2" />
                    Mapa de Posicionamiento Neuro-Cognitivo
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Matriz de Claridad Visual (Eje Y) vs Carga Cognitiva (Eje X). Ubicación estratégica de cada pieza.
                  </p>
                </div>

                <div className="relative w-full aspect-video sm:aspect-[2/1] bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between overflow-hidden">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 border-slate-800 divide-x divide-y divide-slate-800/80 pointer-events-none">
                    <div className="p-3 text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
                      Cuadrante Dorado: Alta Claridad + Baja Carga (Líder)
                    </div>
                    <div className="p-3 text-[10px] font-bold text-amber-400/80 uppercase tracking-wider text-right">
                      Cuadrante Saturado: Alta Claridad + Alta Carga
                    </div>
                    <div className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-end">
                      Cuadrante Invisible: Baja Claridad + Baja Carga
                    </div>
                    <div className="p-3 text-[10px] font-bold text-rose-400/80 uppercase tracking-wider flex items-end justify-end">
                      Cuadrante de Riesgo: Baja Claridad + Alta Carga
                    </div>
                  </div>

                  {/* Plotted Items */}
                  {activeBenchmark.items.map((item) => {
                    const xPos = Math.min(90, Math.max(10, item.cognitiveLoad));
                    const yPos = Math.min(90, Math.max(10, 100 - item.clarityScore));
                    const isWinner = item.id === activeBenchmark.winnerId;

                    return (
                      <div 
                        key={item.id}
                        style={{ left: `${xPos}%`, top: `${yPos}%` }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 z-20 group cursor-pointer"
                      >
                        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg border ${
                          isWinner 
                            ? "bg-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-400/20" 
                            : item.brandType === "own"
                            ? "bg-indigo-600 text-white border-indigo-400"
                            : "bg-slate-800 text-slate-200 border-slate-700"
                        }`}>
                          <span className="truncate max-w-[110px]">{item.name}</span>
                          <span className="opacity-80">({item.neuroScoreIndex})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* Strategic Recommendations */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center">
              <TrendingUp className="w-4 h-4 text-indigo-600 mr-2" />
              Recomendaciones Estratégicas del Benchmark
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeBenchmark.executiveSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {activeBenchmark.strategicRecommendations.map((rec, rIdx) => (
                <div key={rIdx} className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs space-y-1">
                  <span className="font-bold text-indigo-900 block flex items-center">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 mr-1.5 shrink-0" />
                    Insight #{rIdx + 1}
                  </span>
                  <p className="text-slate-700 leading-normal">{rec}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

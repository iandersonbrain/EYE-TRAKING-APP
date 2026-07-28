/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AreaOfInterest {
  id: string;
  name: string;
  x: number;      // percentage 0-100
  y: number;      // percentage 0-100
  width: number;  // percentage 0-100
  height: number; // percentage 0-100
}

export interface FocusPoint {
  x: number;      // percentage 0-100
  y: number;      // percentage 0-100
  radius: number; // percentage 0-100
  weight: number; // attention level 0-100
  name: string;
}

export interface GazePathPoint {
  id: string;
  x: number;      // percentage 0-100
  y: number;      // percentage 0-100
  sequence: number;
  durationMs: number;
  label: string;
}

export interface SpellingIssue {
  foundText: string;     // Text found in design with typo
  correctedText: string; // Corrected spelling/grammar
  language: 'es' | 'en' | 'bilingual';
  explanation: string;   // Explanation of orthography/grammar issue
}

export interface SpellingAudit {
  hasErrors: boolean;
  detectedLanguage: string; // e.g., "Español", "English", "Español e Inglés"
  statusText: string;       // e.g., "Revisión ortográfica completada: Sin faltas detectadas"
  issues: SpellingIssue[];
}

export interface PredictiveData {
  clarityScore: number;     // 0-100
  cognitiveLoad: number;    // 0-100 (lower is better, less cognitive overload)
  focusAreas: FocusPoint[];
  gazePath: GazePathPoint[];
  spellingAudit?: SpellingAudit;
  reportText: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    spellingAudit?: SpellingAudit;
  };
}

export interface GazePoint {
  x: number;              // percentage 0-100
  y: number;              // percentage 0-100
  timestamp: number;      // ms from session start
  durationMs: number;     // fixation duration
}

export interface RealGazeSession {
  gazePoints: GazePoint[];
  heatmapPoints: { x: number; y: number; weight: number }[];
  durationMs: number;
}

export interface EmotionDataPoint {
  timestamp: number; // seconds
  engagement: number; // 0-100
  joy: number;        // 0-100
  surprise: number;   // 0-100
  confusion: number;  // 0-100
  neutral: number;    // 0-100
}

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  name: string;
  imageUrl: string;
  areasOfInterest: AreaOfInterest[];
  predictive?: PredictiveData;
  realGaze?: RealGazeSession;
  emotions?: EmotionDataPoint[];
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  imageName: string;
  imageUrl: string; // Base64 or preset URL
  isPreset: boolean;
  status: 'pending' | 'analyzing' | 'ready';
  areasOfInterest: AreaOfInterest[];
  category?: 'landing' | 'keyvisual' | 'fintech' | 'supermarket' | 'packaging' | 'video' | 'presentation' | 'tiktok' | 'banner' | 'poster' | 'ooh';
  videoUrl?: string;
  predictive?: PredictiveData;
  realGaze?: RealGazeSession;
  emotions?: EmotionDataPoint[];
  slides?: PresentationSlide[];
  comparisonMode?: 'single' | 'original_vs_correction' | 'two_different_designs';
  variantBName?: string;
  variantBImageUrl?: string;
  variantBPredictive?: PredictiveData;
}

export type BenchmarkMode = 'duel' | 'grid' | 'strategic_brand'; // Duelo 1 a 1 | Set Competitivo | Benchmark Estratégico de Marca & Mercado

export type BrandBenchmarkObjective = 'existing_brand_audit' | 'new_product_launch' | 'competitive_landscape';

export type BrandResearchDimension = 
  | 'social_media'         // Redes Sociales & Contenido
  | 'brand_positioning'    // Posicionamiento de Marca & Market Share
  | 'spend_vs_exposure'    // Inversión Publicitaria vs Exposición Real (SOV vs SOS)
  | 'product_launch'       // Estrategia de Lanzamiento de Nuevo Producto / Océano Azul
  | 'seo_digital'          // Posicionamiento SEO & Tráfico Digital
  | 'pricing_value'        // Estrategia de Precios & Empaquetado
  | 'channels_distribution'; // Canales de Distribución & Promociones

export interface StrategicBrandCompetitor {
  name: string;
  isTargetBrand?: boolean;
  marketSharePercent: number;
  shareOfVoicePercent: number;
  shareOfSpendPercent: number;
  estimatedMonthlyAdSpend: string;
  exposureEffectivenessScore: number; // 0-100 (Effiency ROI)
  socialFollowers: string;
  socialEngagementRate: string;
  topStrength: string;
  keyVulnerability: string;
}

export interface DimensionAnalysisResult {
  id: BrandResearchDimension;
  title: string;
  summary: string;
  keyDataPoints: string[];
  strategicAction: string;
  metricLabel?: string;
  metricValue?: string;
}

export interface StrategicBrandBenchmarkData {
  id: string;
  targetBrand: string;
  productLineOrLaunch?: string;
  industry: string;
  countries: string[];
  objective: BrandBenchmarkObjective;
  selectedDimensions: BrandResearchDimension[];
  createdAt: string;
  competitors: StrategicBrandCompetitor[];
  marketShareChart: Array<{ brand: string; share: number; isTarget?: boolean }>;
  spendVsExposureChart: Array<{ brand: string; shareOfSpend: number; shareOfVoice: number; roiIndex: number }>;
  dimensionResults: DimensionAnalysisResult[];
  blueOceanOpportunities?: string[];
  executiveSummary: string;
  strategicActionPlan: string[];
}

export interface BenchmarkItem {
  id: string;
  name: string;
  brandType: 'own' | 'competitor';
  imageUrl: string;
  clarityScore: number;
  cognitiveLoad: number;
  attentionHook3s: number;
  brandRecallScore: number;
  neuroScoreIndex: number;
  spellingErrorsCount: number;
  spellingStatus?: string;
  strengths: string[];
  weaknesses: string[];
  keyDifference: string;
}

export interface BenchmarkData {
  id: string;
  title: string;
  categoryName: string;
  mode: BenchmarkMode;
  items: BenchmarkItem[];
  winnerId: string;
  headToHeadSummary?: string;
  categoryAverage: {
    clarity: number;
    cognitiveLoad: number;
    attentionHook: number;
    neuroIndex: number;
  };
  executiveSummary: string;
  strategicRecommendations: string[];
  createdAt: string;
  // Optional strategic brand benchmark attached when mode === 'strategic_brand'
  strategicBrandData?: StrategicBrandBenchmarkData;
}

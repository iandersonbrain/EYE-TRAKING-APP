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

export interface PredictiveData {
  clarityScore: number;     // 0-100
  cognitiveLoad: number;    // 0-100 (lower is better, less cognitive overload)
  focusAreas: FocusPoint[];
  gazePath: GazePathPoint[];
  reportText: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
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
  category?: 'landing' | 'keyvisual' | 'fintech' | 'supermarket' | 'packaging' | 'video' | 'presentation' | 'tiktok' | 'banner';
  videoUrl?: string;
  predictive?: PredictiveData;
  realGaze?: RealGazeSession;
  emotions?: EmotionDataPoint[];
  slides?: PresentationSlide[];
}

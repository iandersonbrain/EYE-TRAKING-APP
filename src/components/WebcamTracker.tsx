/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Campaign, GazePoint } from "../types";
import { Camera, CameraOff, Sparkles, Check, Play, RotateCcw, Eye, ShieldCheck, HeartPulse } from "lucide-react";
import HeatmapOverlay from "./HeatmapOverlay";
import { calculateContentRect } from "../lib/overlayBounds";
import type { GazeData } from "webgazer";

interface WebcamTrackerProps {
  campaign: Campaign;
  onSaveSession: (gazePoints: GazePoint[], heatmapPoints: { x: number; y: number; weight: number }[]) => void;
}

// Each calibration point must be clicked several times so the underlying
// ridge-regression model (WebGazer) gets enough (screenX, screenY, eyeFeatures)
// samples per position. A single click per point is not enough data to fit
// a usable regression - this was one of the reasons tracking felt broken.
const CLICKS_PER_CALIB_POINT = 5;

const CALIBRATION_POINTS = [
  { id: "tl", x: 10, y: 10, label: "Arriba-Izquierda" },
  { id: "tr", x: 90, y: 10, label: "Arriba-Derecha" },
  { id: "c",  x: 50, y: 50, label: "Centro" },
  { id: "bl", x: 10, y: 90, label: "Abajo-Izquierda" },
  { id: "br", x: 90, y: 90, label: "Abajo-Derecha" }
];

// Simple exponential moving average smoother.
// Raw webcam-based gaze predictions are noisy frame-to-frame; without
// smoothing the reticle jitters wildly and the recorded heatmap is unusable.
function createSmoother(alpha = 0.35) {
  let sx: number | null = null;
  let sy: number | null = null;
  return (x: number, y: number) => {
    if (sx === null || sy === null) {
      sx = x; sy = y;
    } else {
      sx = sx + alpha * (x - sx);
      sy = sy + alpha * (y - sy);
    }
    return { x: sx, y: sy };
  };
}

export default function WebcamTracker({ campaign, onSaveSession }: WebcamTrackerProps) {
  const [useCamera, setUseCamera] = useState<boolean>(false); // Camera disabled by default
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stage, setStage] = useState<"intro" | "webcam" | "calibrating" | "ready-record" | "recording" | "completed">("intro");
  const [engineStatus, setEngineStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [engineError, setEngineError] = useState<string | null>(null);

  // Calibration state
  const [currentCalibIdx, setCurrentCalibIdx] = useState<number>(0);
  const [calibClickCounts, setCalibClickCounts] = useState<Record<string, number>>({});

  // Active Recording state
  const [countdown, setCountdown] = useState<number>(5); // 5s recording duration
  const [gazePoints, setGazePoints] = useState<GazePoint[]>([]);
  const [liveGaze, setLiveGaze] = useState<{ x: number; y: number } | null>(null);
  const [isHoveringAsset, setIsHoveringAsset] = useState<boolean>(false);

  const videoPlaceholderRef = useRef<HTMLDivElement | null>(null);
  const assetRef = useRef<HTMLDivElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sampleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Holds the dynamically-imported webgazer singleton once loaded.
  const webgazerRef = useRef<typeof import("webgazer").default | null>(null);
  const smootherRef = useRef(createSmoother());
  const stageRef = useRef(stage);
  const liveGazeRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { stageRef.current = stage; }, [stage]);
  useEffect(() => { liveGazeRef.current = liveGaze; }, [liveGaze]);

  // Converts a raw viewport-pixel gaze prediction from WebGazer into a
  // percentage position relative to the actual rendered content (the image),
  // accounting for letterboxing from object-fit: contain via overlayBounds.
  const mapViewportPointToAssetPercent = useCallback((clientX: number, clientY: number) => {
    const container = assetRef.current;
    if (!container) return null;
    const contentRect = calculateContentRect(container.firstElementChild as HTMLElement | null);
    const containerRect = container.getBoundingClientRect();
    const localX = clientX - containerRect.left;
    const localY = clientY - containerRect.top;
    if (contentRect.width <= 0 || contentRect.height <= 0) return null;
    const xPct = ((localX - contentRect.x) / contentRect.width) * 100;
    const yPct = ((localY - contentRect.y) / contentRect.height) * 100;
    return {
      x: Math.min(Math.max(xPct, 0), 100),
      y: Math.min(Math.max(yPct, 0), 100),
      insideAsset: localX >= contentRect.x && localX <= contentRect.x + contentRect.width &&
                   localY >= contentRect.y && localY <= contentRect.y + contentRect.height
    };
  }, []);

  // Tear down webgazer completely: stops the camera track, removes the
  // face-tracking video/canvas nodes it injects into the DOM, and clears
  // any calibration data cached in the browser (IndexedDB/localStorage)
  // from a previous session so stale calibration never silently degrades
  // the next one.
  const teardownWebgazer = useCallback(async () => {
    const wg = webgazerRef.current;
    if (!wg) return;
    try {
      wg.clearGazeListener();
      wg.end();
    } catch (e) {
      console.warn("Error stopping WebGazer:", e);
    }
    webgazerRef.current = null;
    setHasPermission(null);
    setEngineStatus("idle");
  }, []);

  // Boots the real face/eye-tracking engine and requests camera access.
  const requestCamera = async () => {
    setStage("webcam");
    setEngineStatus("loading");
    setEngineError(null);
    try {
      const mod = await import("webgazer");
      const webgazer = mod.default;
      webgazerRef.current = webgazer;

      // Don't let clicks anywhere in the rest of the app (nav buttons,
      // other tools, etc.) get recorded as bogus calibration samples -
      // only our explicit calibration dots should train the model.
      if (typeof webgazer.removeMouseEventListeners === "function") {
        webgazer.removeMouseEventListeners();
      }
      // Avoid loading a stale/garbage regression model saved from a
      // previous run in this browser - always start from a clean model.
      webgazer.saveDataAcrossSessions(false);
      webgazer.clearData();
      webgazer.setRegression("ridge");

      webgazer.showVideo(true);
      webgazer.showFaceOverlay(true);
      webgazer.showFaceFeedbackBox(true);
      webgazer.showPredictionPoints(false); // we draw our own reticle

      await webgazer.begin();

      // WebGazer inserts its video/canvas preview elements fixed to
      // document.body. Re-parent them into our own preview box so the
      // real camera feed + real face-tracking overlay show up inside
      // this component's UI instead of floating in a corner of the page.
      const wgContainer = document.getElementById("webgazerVideoContainer");
      if (wgContainer && videoPlaceholderRef.current) {
        wgContainer.style.position = "absolute";
        wgContainer.style.top = "0";
        wgContainer.style.left = "0";
        wgContainer.style.width = "100%";
        wgContainer.style.height = "100%";
        wgContainer.style.margin = "0";
        wgContainer.style.zIndex = "10";
        wgContainer.style.borderRadius = "1rem";
        wgContainer.style.overflow = "hidden";
        videoPlaceholderRef.current.appendChild(wgContainer);
      }
      const wgVideo = document.getElementById("webgazerVideoFeed") as HTMLVideoElement | null;
      if (wgVideo) {
        wgVideo.style.width = "100%";
        wgVideo.style.height = "100%";
        wgVideo.style.objectFit = "cover";
      }

      setHasPermission(true);
      setEngineStatus("ready");
    } catch (err) {
      console.error("WebGazer init / camera access failed:", err);
      setEngineStatus("error");
      setEngineError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Permiso de cámara denegado. Actívalo en la configuración del navegador para usar el eye-tracking real."
          : "No se pudo inicializar el motor de eye-tracking (revisa que la cámara no esté en uso por otra app)."
      );
      setHasPermission(false);
      setStage("intro");
      setUseCamera(false);
      await teardownWebgazer();
    }
  };

  const stopCamera = () => {
    teardownWebgazer();
  };

  // Ensure everything is released if the component unmounts mid-session.
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (sampleIntervalRef.current) clearInterval(sampleIntervalRef.current);
      teardownWebgazer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Calibration Point Clicks - now feeds REAL training data to
  // WebGazer's regression model instead of only advancing a UI step.
  const handleCalibrationClick = (ptId: string, event: React.MouseEvent) => {
    if (stage !== "calibrating") return;
    const wg = webgazerRef.current;
    if (!wg) return;

    // Record this exact click as a (screenX, screenY) training sample
    // paired with whatever the camera saw at this instant.
    wg.recordScreenPosition(event.clientX, event.clientY, "click");

    const doneForThisPoint = (calibClickCounts[ptId] || 0) + 1;
    setCalibClickCounts(prev => ({ ...prev, [ptId]: doneForThisPoint }));

    if (doneForThisPoint < CLICKS_PER_CALIB_POINT) {
      return; // stay on the same point, needs more samples
    }

    if (currentCalibIdx < CALIBRATION_POINTS.length - 1) {
      setCurrentCalibIdx(prev => prev + 1);
    } else {
      setStage("ready-record");
    }
  };

  // Start Calibration Procedure
  const startCalibration = () => {
    setStage("calibrating");
    setCurrentCalibIdx(0);
    setCalibClickCounts({});
  };

  // Cursor-mode fallback (camera OFF): kept as an explicitly-labeled
  // simulation for when the user has no webcam / declines camera access.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== "recording" || useCamera) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xRaw = ((e.clientX - rect.left) / rect.width) * 100;
    const yRaw = ((e.clientY - rect.top) / rect.height) * 100;
    const time = Date.now();
    const noiseX = Math.sin(time * 0.02) * 2.0 + (Math.random() < 0.08 ? (Math.random() - 0.5) * 8 : 0);
    const noiseY = Math.cos(time * 0.015) * 2.0 + (Math.random() < 0.08 ? (Math.random() - 0.5) * 8 : 0);
    const xSim = Math.min(Math.max(xRaw + noiseX, 0), 100);
    const ySim = Math.min(Math.max(yRaw + noiseY, 0), 100);
    setLiveGaze({ x: xSim, y: ySim });
  };

  // Start Gaze Recording Session
  const startRecording = () => {
    setStage("recording");
    setCountdown(5);
    setGazePoints([]);
    smootherRef.current = createSmoother();
    const sessionStart = Date.now();

    // Real gaze listener: WebGazer calls this on every processed webcam
    // frame with a viewport-pixel prediction. We smooth it and map it
    // into asset-relative percentage coordinates.
    if (useCamera && webgazerRef.current) {
      webgazerRef.current.setGazeListener((data: GazeData | null) => {
        if (!data || stageRef.current !== "recording") return;
        const smoothed = smootherRef.current(data.x, data.y);
        const mapped = mapViewportPointToAssetPercent(smoothed.x, smoothed.y);
        if (!mapped) return;
        setIsHoveringAsset(mapped.insideAsset);
        setLiveGaze({ x: mapped.x, y: mapped.y });
      });
    }

    recordingTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(recordingTimerRef.current!);
          if (sampleIntervalRef.current) clearInterval(sampleIntervalRef.current);
          if (useCamera && webgazerRef.current) {
            webgazerRef.current.clearGazeListener();
          }
          setStage("completed");
          setLiveGaze(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Sample the current (already smoothed) gaze point at a fixed rate
    // to build the fixation/heatmap dataset.
    sampleIntervalRef.current = setInterval(() => {
      if (stageRef.current !== "recording") return;
      const g = liveGazeRef.current;
      if (!g) return;
      setGazePoints(prev => [
        ...prev,
        {
          x: parseFloat(g.x.toFixed(1)),
          y: parseFloat(g.y.toFixed(1)),
          timestamp: Date.now() - sessionStart,
          durationMs: 150 + Math.floor(Math.random() * 100)
        }
      ]);
    }, 120);
  };

  // Compile final points and trigger Save back to Campaign parent
  const handleSaveAndCompile = () => {
    const weightMap: Record<string, number> = {};
    gazePoints.forEach(pt => {
      const key = `${Math.round(pt.x / 5) * 5},${Math.round(pt.y / 5) * 5}`;
      weightMap[key] = (weightMap[key] || 0) + 1;
    });
    const maxWeight = Math.max(...Object.values(weightMap), 1);
    const compiledHeatmap = Object.entries(weightMap).map(([key, val]) => {
      const [x, y] = key.split(",").map(Number);
      return { x, y, weight: parseFloat((val / maxWeight).toFixed(2)) };
    });
    onSaveSession(gazePoints, compiledHeatmap);
  };

  const activeCalibPoint = CALIBRATION_POINTS[currentCalibIdx];
  const activeCalibClicks = calibClickCounts[activeCalibPoint?.id] || 0;

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">

      {/* Left panel: webcam feed and instructions (4 columns) */}
      <div className="lg:col-span-4 bg-slate-950 p-6 border-r border-slate-800 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">Eye-Tracking Real</h3>
                <p className="text-[11px] text-teal-400 font-mono tracking-wider">MOTOR: WEBGAZER.JS</p>
              </div>
            </div>
          </div>

          {/* Camera Optional Toggle Button */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800/85">
            <div className="flex items-center space-x-2.5">
              {useCamera ? (
                <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                  <Camera className="w-4 h-4 animate-pulse" />
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-500">
                  <CameraOff className="w-4 h-4" />
                </div>
              )}
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Usar Cámara Web</span>
                <span className="text-[9px] text-slate-400 font-mono leading-none">
                  {useCamera ? "Activa (Eye-Tracking)" : "Desactivada (Por Cursor)"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (useCamera) {
                  stopCamera();
                  setUseCamera(false);
                  setStage("intro");
                } else {
                  setUseCamera(true);
                  requestCamera();
                }
              }}
              className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                useCamera ? "bg-teal-400" : "bg-slate-800"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  useCamera ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Video Container: now hosts WebGazer's REAL video + face overlay */}
          <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
            {useCamera && engineStatus === "loading" && (
              <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <Sparkles className="w-8 h-8 text-teal-400 mb-2 animate-spin" />
                <span className="text-xs font-bold text-slate-300">Cargando motor de tracking…</span>
              </div>
            )}
            {useCamera && engineStatus === "error" && (
              <div className="flex flex-col items-center justify-center text-center p-4 text-rose-400">
                <CameraOff className="w-8 h-8 mb-2" />
                <span className="text-xs font-bold">{engineError}</span>
              </div>
            )}
            {/* WebGazer's real video + face-tracking overlay get reparented here */}
            <div ref={videoPlaceholderRef} className="absolute inset-0" />
            {!useCamera && (
              <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <CameraOff className="w-9 h-9 text-slate-700 mb-2" />
                <span className="text-xs font-bold text-slate-400">Cámara Desactivada</span>
                <span className="text-[10px] text-slate-500 mt-1 max-w-[180px]">
                  Desactivada por defecto para tu privacidad. Puedes activarla usando el switch de arriba.
                </span>
              </div>
            )}
          </div>

          {/* Interactive Guides Based on Stage */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            {stage === "intro" && (
              <>
                {useCamera ? (
                  <>
                    <h4 className="text-slate-200 text-sm font-semibold flex items-center">
                      <ShieldCheck className="w-4 h-4 text-teal-400 mr-1.5" />
                      Consentimiento de Privacidad
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Para estimar el movimiento ocular, utilizaremos la webcam de manera local (WebGazer.js corre 100% en tu navegador). Ningún video se envía al servidor ni se almacena.
                    </p>
                    <button
                      onClick={requestCamera}
                      className="w-full mt-2 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-teal-400/10 flex items-center justify-center"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1.5" />
                      Activar Cámara Web
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="text-slate-200 text-sm font-semibold flex items-center">
                      <Eye className="w-4 h-4 text-indigo-400 mr-1.5" />
                      Seguimiento por Cursor
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      La cámara está desactivada. Recorre el diseño de la derecha con tu cursor de forma natural; grabaremos tus paradas de atención (simulado) para generar el mapa térmico.
                    </p>
                    <button
                      onClick={startRecording}
                      className="w-full mt-2 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-500/10 flex items-center justify-center"
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      Comenzar Grabación (5s)
                    </button>
                  </>
                )}
              </>
            )}

            {stage === "webcam" && (
              <>
                <h4 className="text-slate-200 text-sm font-semibold flex items-center">
                  <HeartPulse className="w-4 h-4 text-rose-400 mr-1.5" />
                  Paso 1: Calibrar Gaze
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {engineStatus === "ready"
                    ? <>La cámara está lista. Vamos a calibrar el modelo con 5 puntos ({CLICKS_PER_CALIB_POINT} clics cada uno) para asociar tu mirada con coordenadas de pantalla.</>
                    : "Preparando la cámara y el modelo de seguimiento ocular…"}
                </p>
                <button
                  onClick={startCalibration}
                  disabled={engineStatus !== "ready"}
                  className="w-full mt-2 py-2.5 bg-teal-400 hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Iniciar Calibración
                </button>
              </>
            )}

            {stage === "calibrating" && (
              <>
                <h4 className="text-slate-200 text-sm font-semibold flex items-center">
                  <Sparkles className="w-4 h-4 text-amber-400 mr-1.5 animate-spin" />
                  Calibrando Gaze...
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Mira atentamente el punto rojo y haz <span className="text-amber-400 font-bold">CLIC</span> sobre él {CLICKS_PER_CALIB_POINT} veces mientras lo miras fijo.
                </p>
                <div className="flex items-center space-x-1.5 mt-2">
                  {CALIBRATION_POINTS.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full ${
                        idx < currentCalibIdx
                          ? "bg-teal-400"
                          : idx === currentCalibIdx
                            ? "bg-amber-400 animate-pulse"
                            : "bg-slate-800"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 text-center pt-1 font-mono">
                  Punto {currentCalibIdx + 1} / 5 ({activeCalibPoint.label}) — clic {Math.min(activeCalibClicks + 1, CLICKS_PER_CALIB_POINT)}/{CLICKS_PER_CALIB_POINT}
                </p>
              </>
            )}

            {stage === "ready-record" && (
              <>
                <h4 className="text-slate-200 text-sm font-semibold flex items-center">
                  <Check className="w-4 h-4 text-emerald-400 mr-1.5" />
                  ¡Calibración Completa!
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  El modelo de regresión ha sido entrenado con tu mirada. Al hacer clic en iniciar, tendrás <span className="text-teal-400 font-bold">5 segundos</span> para mirar el diseño libremente.
                </p>
                <button
                  onClick={startRecording}
                  className="w-full mt-2 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Comenzar Sesión (5s)
                </button>
              </>
            )}

            {stage === "recording" && (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="text-rose-400 text-sm font-bold flex items-center">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full mr-2 animate-ping" />
                    Grabando Sesión...
                  </h4>
                  <span className="text-lg font-black font-mono text-white bg-slate-800 px-2 py-0.5 rounded">
                    {countdown}s
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Mira el diseño libremente en el lado derecho. Explóralo de forma natural.
                </p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-rose-400 transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdown / 5) * 100}%` }}
                  />
                </div>
              </>
            )}

            {stage === "completed" && (
              <>
                <h4 className="text-emerald-400 text-sm font-bold flex items-center">
                  <Check className="w-4 h-4 mr-1.5" />
                  Grabación Finalizada
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Se registraron <span className="text-emerald-400 font-mono font-bold">{gazePoints.length}</span> muestras de atención visual en los 5 segundos de prueba.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={handleSaveAndCompile}
                    className="py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    Guardar Sesión
                  </button>
                  <button
                    onClick={() => {
                      if (useCamera) {
                        startCalibration();
                      } else {
                        startRecording();
                      }
                    }}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition border border-slate-700 flex items-center justify-center"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {useCamera ? "Re-calibrar" : "Repetir"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-[10px] text-slate-600 font-mono leading-relaxed mt-6">
          STATUS: {engineStatus.toUpperCase()}<br />
          SENSORS: {useCamera ? "CAMERA_WEBGAZER_ACTIVE" : "CURSOR_SENSORS_ACTIVE"}<br />
          COMPILER: {useCamera ? "RIDGE_REGRESSION_LIVE" : "CURSOR_ATTENTION_SIM_V2"}
        </div>
      </div>

      {/* Right panel: tested asset image frame (8 columns) */}
      <div className="lg:col-span-8 bg-slate-900 p-6 flex items-center justify-center relative">

        {/* Gray overlay during calibration/intro - only blocked if using camera and not ready */}
        {useCamera && (stage === "intro" || stage === "webcam") && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-8 text-center">
            <Eye className="w-12 h-12 text-teal-400 mb-3 animate-pulse" />
            <h4 className="text-white font-bold text-lg">Área de Exposición Bloqueada</h4>
            <p className="text-slate-400 text-sm max-w-sm mt-1">
              Conecta tu cámara web e inicia la calibración para poder ver y explorar el diseño de prueba.
            </p>
          </div>
        )}

        {/* Calibration Overlay Frame */}
        {stage === "calibrating" && (
          <div className="absolute inset-0 bg-slate-950/90 z-40">
            {/* Calibration Dot */}
            <div
              onClick={(e) => handleCalibrationClick(activeCalibPoint.id, e)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${activeCalibPoint.x}%`, top: `${activeCalibPoint.y}%` }}
            >
              {/* Pulsing ring */}
              <span className="absolute -inset-4 rounded-full border-2 border-red-500 animate-ping opacity-75" />
              <div className="w-8 h-8 rounded-full bg-red-500 border-4 border-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
              </div>
              <span className="absolute top-10 left-1/2 transform -translate-x-1/2 text-[10px] text-red-400 font-bold tracking-wider uppercase font-mono whitespace-nowrap">
                Clic {Math.min(activeCalibClicks + 1, CLICKS_PER_CALIB_POINT)}/{CLICKS_PER_CALIB_POINT}
              </span>
            </div>

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center text-slate-400 text-xs font-mono">
              Mira fijamente y haz clic varias veces sobre el punto rojo.
            </div>
          </div>
        )}

        {/* Assets & Live Gaze Frame */}
        <div
          ref={assetRef}
          className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 w-full flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => !useCamera && setIsHoveringAsset(true)}
          onMouseLeave={() => !useCamera && setIsHoveringAsset(false)}
        >
          <img
            src={campaign.imageUrl}
            alt={campaign.name}
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain max-h-[500px]"
          />

          {/* Active recording countdown overlay */}
          {stage === "recording" && !isHoveringAsset && (
            <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 z-40">
              <span className="text-white text-base font-bold animate-bounce">
                {useCamera ? "Mira hacia el diseño" : "Pasa el cursor por aquí"}
              </span>
              <p className="text-slate-400 text-xs max-w-xs mt-1">
                {useCamera
                  ? "Explora el diseño con la mirada de forma natural. El eye-tracker está siguiendo tus ojos."
                  : "Coloca tu cursor sobre el diseño y recórrelo con la mirada."}
              </p>
            </div>
          )}

          {/* Draw Gaze Point Reticle during recording */}
          {stage === "recording" && liveGaze && isHoveringAsset && (
            <div
              className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-rose-400 bg-rose-400/20 z-50 pointer-events-none transition-all duration-75 ease-out flex items-center justify-center shadow-lg"
              style={{ left: `${liveGaze.x}%`, top: `${liveGaze.y}%` }}
            >
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <div className="absolute -inset-1.5 rounded-full border border-rose-300 opacity-60 animate-ping" />
            </div>
          )}

          {/* Real-time Heatmap Accumulation during Completed stage */}
          {stage === "completed" && gazePoints.length > 0 && (
            <HeatmapOverlay
              points={gazePoints.map(pt => ({ x: pt.x, y: pt.y, weight: 0.6 }))}
              opacity={0.8}
              radius={40}
            />
          )}
        </div>

      </div>

    </div>
  );
}

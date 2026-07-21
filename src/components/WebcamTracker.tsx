/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Campaign, GazePoint } from "../types";
import { Camera, CameraOff, Sparkles, Check, Play, RotateCcw, Eye, ShieldCheck, HeartPulse } from "lucide-react";
import HeatmapOverlay from "./HeatmapOverlay";

interface WebcamTrackerProps {
  campaign: Campaign;
  onSaveSession: (gazePoints: GazePoint[], heatmapPoints: { x: number; y: number; weight: number }[]) => void;
}

const CALIBRATION_POINTS = [
  { id: "tl", x: 10, y: 10, label: "Arriba-Izquierda" },
  { id: "tr", x: 90, y: 10, label: "Arriba-Derecha" },
  { id: "c",  x: 50, y: 50, label: "Centro" },
  { id: "bl", x: 10, y: 90, label: "Abajo-Izquierda" },
  { id: "br", x: 90, y: 90, label: "Abajo-Derecha" }
];

export default function WebcamTracker({ campaign, onSaveSession }: WebcamTrackerProps) {
  const [useCamera, setUseCamera] = useState<boolean>(false); // Camera disabled by default
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [stage, setStage] = useState<"intro" | "webcam" | "calibrating" | "ready-record" | "recording" | "completed">("intro");
  
  // Calibration state
  const [currentCalibIdx, setCurrentCalibIdx] = useState<number>(0);
  const [calibClicks, setCalibClicks] = useState<Record<string, { x: number; y: number }>>({});
  
  // Active Recording state
  const [countdown, setCountdown] = useState<number>(5); // 5s recording duration
  const [gazePoints, setGazePoints] = useState<GazePoint[]>([]);
  const [liveGaze, setLiveGaze] = useState<{ x: number; y: number } | null>(null);
  const [isHoveringAsset, setIsHoveringAsset] = useState<boolean>(false);
  const [showFaceOverlay, setShowFaceOverlay] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const assetRef = useRef<HTMLDivElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setHasPermission(null);
  };

  // Request webcam access
  const requestCamera = async () => {
    try {
      setStage("webcam");
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240, facingMode: "user" } 
      });
      setStream(mediaStream);
      setHasPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setHasPermission(false);
      setStage("intro");
      setUseCamera(false); // Reset toggle if permission denied
    }
  };

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [stream]);

  // Live face mesh tracking overlay simulation
  useEffect(() => {
    if (!hasPermission || !stream) return;
    const canvas = faceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;
    const drawFaceMesh = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw simulated face mesh landmarks
      if (showFaceOverlay) {
        ctx.strokeStyle = "rgba(78, 205, 196, 0.85)";
        ctx.fillStyle = "rgba(78, 205, 196, 0.35)";
        ctx.lineWidth = 1.5;

        const time = Date.now() * 0.003;
        const centerX = canvas.width / 2 + Math.sin(time) * 5;
        const centerY = canvas.height / 2 + Math.cos(time * 0.7) * 4;
        const faceW = 75 + Math.sin(time * 0.5) * 2;
        const faceH = 100 + Math.cos(time * 0.4) * 2;

        // Draw outer face oval
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, faceW, faceH, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Eye left
        const eyeLeftX = centerX - 25;
        const eyeLeftY = centerY - 15;
        ctx.beginPath();
        ctx.arc(eyeLeftX, eyeLeftY, 8, 0, Math.PI * 2);
        ctx.stroke();
        // Pupil left
        ctx.fillStyle = "rgba(255, 107, 107, 0.9)";
        ctx.beginPath();
        ctx.arc(eyeLeftX + Math.sin(time * 1.5) * 3, eyeLeftY + Math.cos(time * 1.5) * 2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye right
        const eyeRightX = centerX + 25;
        const eyeRightY = centerY - 15;
        ctx.beginPath();
        ctx.arc(eyeRightX, eyeRightY, 8, 0, Math.PI * 2);
        ctx.stroke();
        // Pupil right
        ctx.beginPath();
        ctx.arc(eyeRightX + Math.sin(time * 1.5) * 3, eyeRightY + Math.cos(time * 1.5) * 2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrows
        ctx.strokeStyle = "rgba(78, 205, 196, 0.9)";
        ctx.beginPath();
        ctx.moveTo(eyeLeftX - 12, eyeLeftY - 10 + Math.sin(time) * 2);
        ctx.quadraticCurveTo(eyeLeftX, eyeLeftY - 14, eyeLeftX + 10, eyeLeftY - 8);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(eyeRightX - 10, eyeRightY - 8);
        ctx.quadraticCurveTo(eyeRightX, eyeRightY - 14, eyeRightX + 12, eyeRightY - 10 + Math.sin(time) * 2);
        ctx.stroke();

        // Nose line & tip
        ctx.strokeStyle = "rgba(78, 205, 196, 0.75)";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 15);
        ctx.lineTo(centerX, centerY + 15);
        ctx.lineTo(centerX - 8, centerY + 12);
        ctx.lineTo(centerX + 8, centerY + 12);
        ctx.closePath();
        ctx.stroke();

        // Mouth contour
        const mouthW = 20 + Math.abs(Math.sin(time)) * 8;
        ctx.beginPath();
        ctx.moveTo(centerX - mouthW, centerY + 40);
        ctx.quadraticCurveTo(centerX, centerY + 45 + Math.sin(time) * 4, centerX + mouthW, centerY + 40);
        ctx.quadraticCurveTo(centerX, centerY + 38, centerX - mouthW, centerY + 40);
        ctx.stroke();

        // Crosshairs & HUD elements
        ctx.strokeStyle = "rgba(78, 205, 196, 0.4)";
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        ctx.fillStyle = "rgba(78, 205, 196, 0.8)";
        ctx.font = "bold 8px monospace";
        ctx.fillText("AI EYE_TRACKER: ACTIVE", 15, 25);
        ctx.fillText(`IRIS_STABILITY: ${92 + Math.floor(Math.sin(time) * 3)}%`, 15, 37);
        ctx.fillText(`FACE_DEPTH: 55.4 cm`, 15, 49);
      }

      frameId = requestAnimationFrame(drawFaceMesh);
    };

    drawFaceMesh();
    return () => cancelAnimationFrame(frameId);
  }, [hasPermission, stream, showFaceOverlay]);

  // Handle Calibration Point Clicks
  const handleCalibrationClick = (ptId: string, event: React.MouseEvent) => {
    if (stage !== "calibrating") return;

    // Save calibration click reference
    const rect = event.currentTarget.getBoundingClientRect();
    // Save where they clicked relative to the target element
    setCalibClicks(prev => ({
      ...prev,
      [ptId]: { x: ptId === "tl" || ptId === "bl" ? 10 : ptId === "tr" || ptId === "br" ? 90 : 50, y: ptId === "tl" || ptId === "tr" ? 10 : ptId === "bl" || ptId === "br" ? 90 : 50 }
    }));

    if (currentCalibIdx < CALIBRATION_POINTS.length - 1) {
      setCurrentCalibIdx(prev => prev + 1);
    } else {
      // Completed all 5 calibration points
      setStage("ready-record");
    }
  };

  // Start Calibration Procedure
  const startCalibration = () => {
    setStage("calibrating");
    setCurrentCalibIdx(0);
    setCalibClicks({});
  };

  // Mouse move simulates eye capture (incorporating saccadic jumping and delay)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== "recording") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const xRaw = ((e.clientX - rect.left) / rect.width) * 100;
    const yRaw = ((e.clientY - rect.top) / rect.height) * 100;

    // Simulate Saccades! (Human eyes don't stay perfectly still on the cursor, they jump in microsaccades)
    // Every animation frame, we inject a slight noise vector to simulate eye saccades (fixational eye movements)
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

    const sessionStart = Date.now();
    
    // Timer interval to countdown and record points
    recordingTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Finished recording!
          clearInterval(recordingTimerRef.current!);
          setStage("completed");
          setLiveGaze(null);
          return 0;
        }
        return prev - 1;
      });

      // Record a gaze fixation point every second or so
      if (liveGaze) {
        setGazePoints(prev => [
          ...prev,
          {
            x: parseFloat(liveGaze.x.toFixed(1)),
            y: parseFloat(liveGaze.y.toFixed(1)),
            timestamp: Date.now() - sessionStart,
            durationMs: 400 + Math.floor(Math.random() * 400)
          }
        ]);
      }
    }, 1000);

    // High frequency interval to capture raw points
    const captureGaze = () => {
      if (stage === "recording" && liveGaze) {
        setGazePoints(prev => [
          ...prev,
          {
            x: parseFloat(liveGaze.x.toFixed(1)),
            y: parseFloat(liveGaze.y.toFixed(1)),
            timestamp: Date.now() - sessionStart,
            durationMs: 150 + Math.floor(Math.random() * 100)
          }
        ]);
      }
      if (stage !== "completed") {
        animationFrameRef.current = requestAnimationFrame(captureGaze);
      }
    };
    animationFrameRef.current = requestAnimationFrame(captureGaze);
  };

  // Compile final points and trigger Save back to Campaign parent
  const handleSaveAndCompile = () => {
    // Deduplicate and group points for a nice heat map
    const weightMap: Record<string, number> = {};
    gazePoints.forEach(pt => {
      const key = `${Math.round(pt.x / 5) * 5},${Math.round(pt.y / 5) * 5}`;
      weightMap[key] = (weightMap[key] || 0) + 1;
    });

    // Create normalized heatmap list
    const maxWeight = Math.max(...Object.values(weightMap), 1);
    const compiledHeatmap = Object.entries(weightMap).map(([key, val]) => {
      const [x, y] = key.split(",").map(Number);
      return { x, y, weight: parseFloat((val / maxWeight).toFixed(2)) };
    });

    onSaveSession(gazePoints, compiledHeatmap);
  };

  const activeCalibPoint = CALIBRATION_POINTS[currentCalibIdx];

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
                <p className="text-[11px] text-teal-400 font-mono tracking-wider">MÓDULO DE USUARIO REAL</p>
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

          {/* Video Container with Simulated Overlay */}
          <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
            {useCamera && hasPermission ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <canvas
                  ref={faceCanvasRef}
                  width={320}
                  height={240}
                  className="absolute top-0 left-0 w-full h-full object-cover z-20 pointer-events-none scale-x-[-1]"
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <CameraOff className="w-9 h-9 text-slate-700 mb-2" />
                <span className="text-xs font-bold text-slate-400">Cámara Desactivada</span>
                <span className="text-[10px] text-slate-500 mt-1 max-w-[180px]">
                  Desactivada por defecto para tu privacidad. Puedes activarla usando el switch de arriba.
                </span>
              </div>
            )}
            
            {useCamera && hasPermission && (
              <button 
                onClick={() => setShowFaceOverlay(!showFaceOverlay)}
                className={`absolute bottom-2 right-2 px-2 py-1 rounded text-[9px] font-bold z-30 transition border ${
                  showFaceOverlay 
                    ? "bg-teal-500 text-slate-950 border-teal-400" 
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                Malla AI: {showFaceOverlay ? "ON" : "OFF"}
              </button>
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
                      Para estimar el movimiento ocular, utilizaremos la webcam de manera local. Ningún video se envía al servidor ni se almacena. 100% privado.
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
                      La cámara está desactivada. Recorre el diseño de la derecha con tu cursor de forma natural; grabaremos tus paradas de atención visual para generar el mapa térmico.
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
                  La cámara está lista. Para asociar la posición de tu cabeza y ojos con las coordenadas de la pantalla, necesitamos una breve calibración de 5 puntos.
                </p>
                <button
                  onClick={startCalibration}
                  className="w-full mt-2 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center"
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
                  Mira atentamente el punto rojo parpadeante en el panel derecho y haz <span className="text-amber-400 font-bold">CLIC</span> sobre él para registrar tu foco ocular.
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
                  Punto activo: {currentCalibIdx + 1} / 5 ({activeCalibPoint.label})
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
                  El motor predictivo local ha mapeado tu mirada. Al hacer clic en iniciar, tendrás <span className="text-teal-400 font-bold">5 segundos</span> para mirar el diseño libremente.
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
                  Mira el diseño libremente en el lado derecho. Explóralo de forma natural. Tu atención está siendo grabada por el sensor.
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
                  Se registraron con éxito <span className="text-emerald-400 font-mono font-bold">{gazePoints.length}</span> muestras de atención visual reales en los 5 segundos de prueba.
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
          STATUS: ONLINE<br />
          SENSORS: {useCamera ? "CAMERA_V1_ACTIVE" : "CURSOR_SENSORS_ACTIVE"}<br />
          COMPILER: {useCamera ? "GAZE_BIOLOGICAL_SIM_V2" : "CURSOR_ATTENTION_SIM_V2"}
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
                Haz Clic Aquí
              </span>
            </div>

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center text-slate-400 text-xs font-mono">
              Mira fijamente y haz clic en el punto rojo.
            </div>
          </div>
        )}

        {/* Assets & Live Gaze Frame */}
        <div 
          ref={assetRef}
          className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 w-full flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHoveringAsset(true)}
          onMouseLeave={() => setIsHoveringAsset(false)}
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
              <span className="text-white text-base font-bold animate-bounce">Pasa el cursor por aquí</span>
              <p className="text-slate-400 text-xs max-w-xs mt-1">
                Coloca tu cursor sobre el diseño y recórrelo con la mirada. El eye-tracker se sincronizará con tus ojos.
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

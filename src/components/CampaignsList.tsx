/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Campaign } from "../types";
import { campaignPresets } from "../campaignPresets";
import { Plus, Image as ImageIcon, Trash2, Calendar, FileText, ChevronRight, UploadCloud, Cpu, AlertCircle } from "lucide-react";

interface CampaignsListProps {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  onSelectCampaign: (id: string) => void;
  onAddCampaign: (campaign: Campaign) => void;
  onDeleteCampaign: (id: string) => void;
  onAnalyzeCampaign: (id: string, campaignData?: Campaign) => Promise<void>;
  isAnalyzing: boolean;
}

export default function CampaignsList({
  campaigns,
  activeCampaignId,
  onSelectCampaign,
  onAddCampaign,
  onDeleteCampaign,
  onAnalyzeCampaign,
  isAnalyzing
}: CampaignsListProps) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newCampaign, setNewCampaign] = useState({ name: "", description: "", category: "keyvisual" });
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [fileLoadProgress, setFileLoadProgress] = useState<number>(0);
  const [presentationSlides, setPresentationSlides] = useState<{ id: string; slideNumber: number; name: string; imageUrl: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getUploadInstructions = () => {
    const category = newCampaign.category;
    if (category === "video" || category === "tiktok") {
      return {
        title: "Arrastra un video de Reels/TikTok o miniatura de portada",
        subtitle: "Soporta videos o imágenes de hasta 30MB",
        accept: "video/*,image/*"
      };
    } else if (category === "presentation") {
      return {
        title: "Arrastra un archivo PDF o imagen de portada de la presentación",
        subtitle: "Soporta documentos PDF o imágenes de hasta 30MB",
        accept: ".pdf,image/*"
      };
    } else {
      return {
        title: "Arrastra una imagen de diseño o haz clic para buscar",
        subtitle: "Soporta PNG, JPG, WEBP de hasta 30MB",
        accept: "image/*"
      };
    }
  };

  // Handle multiple file upload for presentation slide decks
  const handleUploadMultipleFiles = async (files: File[]) => {
    const category = newCampaign.category;
    if (category !== "presentation") return;

    // If they uploaded a PDF, we fallback to standard single-file upload for PDF (with simulated slides)
    const pdfFile = files.find(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (pdfFile) {
      handleUploadFile(pdfFile);
      return;
    }

    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setError("Por favor, selecciona archivos de imagen válidos (PNG, JPG, WEBP) para tus diapositivas.");
      return;
    }

    setError(null);
    setIsFileLoading(true);
    setFileLoadProgress(0);

    const loadedSlidesList: { id: string; slideNumber: number; name: string; imageUrl: string }[] = [];
    
    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        setFileLoadProgress(Math.round((i / imageFiles.length) * 100));
        
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

        loadedSlidesList.push({
          id: `slide-${i + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          slideNumber: i + 1,
          name: `Diapositiva ${i + 1}: ${file.name.replace(/\.[^/.]+$/, "")}`,
          imageUrl: base64
        });
      }

      setFileLoadProgress(100);
      setIsFileLoading(false);
      setPresentationSlides(loadedSlidesList);
      if (loadedSlidesList.length > 0) {
        setSelectedImage(loadedSlidesList[0].imageUrl);
        setImageName(`${imageFiles.length} diapositivas cargadas`);
      }
    } catch (err) {
      console.error("Error loading multiple files:", err);
      setError("Hubo un error al procesar las imágenes de la presentación.");
      setIsFileLoading(false);
    }
  };

  // Handle adaptive file upload based on selected category (Images: 30MB, Video/PDF: 30MB)
  const handleUploadFile = (file: File) => {
    const category = newCampaign.category;

    if (category === "video" || category === "tiktok") {
      const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".webm") || file.name.endsWith(".mov") || file.name.endsWith(".mkv");
      const isImage = file.type.startsWith("image/");

      if (!isVideo && !isImage) {
        setError("Por favor, selecciona un archivo de video válido (MP4, WebM, MOV) o una imagen de portada.");
        return;
      }

      const maxVideoSize = 30 * 1024 * 1024; // 30MB
      if (file.size > maxVideoSize) {
        setError("El archivo es demasiado grande. El límite para videos es de 30MB.");
        return;
      }

      setError(null);
      setIsFileLoading(true);
      setFileLoadProgress(0);

      // Simulate a premium progress bar loading based on file size
      let progress = 0;
      const duration = Math.min(2000, Math.max(800, (file.size / (1024 * 1024)) * 250)); // 0.8s to 2s depending on size
      const intervalTime = 40;
      const step = (100 / (duration / intervalTime));

      const interval = setInterval(() => {
        progress += step;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setIsFileLoading(false);
          setImageName(file.name);
          
          if (isVideo) {
            // Create an object URL for local video playback
            const localVideoUrl = URL.createObjectURL(file);
            setVideoUrl(localVideoUrl);
            
            // Extract actual frame as image for thermal / predictive tracking analysis
            const video = document.createElement("video");
            video.src = localVideoUrl;
            video.muted = true;
            video.playsInline = true;
            
            video.onloadedmetadata = () => {
              video.currentTime = 0.5; // Seek to 0.5s to get a good frame
            };

            video.onseeked = () => {
              try {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 360;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const frameBase64 = canvas.toDataURL("image/jpeg", 0.85);
                  setSelectedImage(frameBase64);
                }
              } catch (err) {
                console.error("Error capturing video frame:", err);
                setSelectedImage(category === "tiktok"
                  ? "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80"
                  : "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80");
              }
            };

            video.onerror = () => {
              setSelectedImage(category === "tiktok"
                ? "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80"
                : "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80");
            };

            video.load();
          } else {
            // Image thumbnail
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                setSelectedImage(e.target.result as string);
              }
            };
            reader.readAsDataURL(file);
          }
        } else {
          setFileLoadProgress(Math.min(99, Math.round(progress)));
        }
      }, intervalTime);

    } else if (category === "presentation") {
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      const isImage = file.type.startsWith("image/");

      if (!isPdf && !isImage) {
        setError("Por favor, selecciona un documento PDF o una imagen de portada.");
        return;
      }

      const maxPdfSize = 30 * 1024 * 1024; // 30MB
      if (file.size > maxPdfSize) {
        setError("El archivo es demasiado grande. El límite para documentos PDF es de 30MB.");
        return;
      }

      setError(null);
      setIsFileLoading(true);
      setFileLoadProgress(0);

      let progress = 0;
      const duration = Math.min(2200, Math.max(900, (file.size / (1024 * 1024)) * 280)); // 0.9s to 2.2s depending on size
      const intervalTime = 40;
      const step = (100 / (duration / intervalTime));

      const interval = setInterval(() => {
        progress += step;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setIsFileLoading(false);
          setImageName(file.name);
          setPresentationSlides([]); // Reset multi-slide array since it's a single file upload

          if (isPdf) {
            // PDF uploaded. Use a premium high-quality PDF slides document template thumbnail
            setSelectedImage("https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80");
          } else {
            // Cover image
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                const base64 = e.target.result as string;
                setSelectedImage(base64);
                // Also initialize presentationSlides with this single image so they have their exact slide analyzed
                setPresentationSlides([{
                  id: `slide-1-${Date.now()}`,
                  slideNumber: 1,
                  name: `Diapositiva 1: ${file.name.replace(/\.[^/.]+$/, "")}`,
                  imageUrl: base64
                }]);
              }
            };
            reader.readAsDataURL(file);
          }
        } else {
          setFileLoadProgress(Math.min(99, Math.round(progress)));
        }
      }, intervalTime);

    } else {
      // Standard image mockup types
      if (!file.type.startsWith("image/")) {
        setError("Por favor, selecciona un archivo de imagen válido (PNG, JPG, WEBP).");
        return;
      }

      const maxImageSize = 30 * 1024 * 1024; // Increased from 8MB to 30MB
      if (file.size > maxImageSize) {
        setError("La imagen es demasiado grande. Sube una imagen menor de 30MB.");
        return;
      }

      setError(null);
      setIsFileLoading(true);
      setFileLoadProgress(0);

      let progress = 0;
      const duration = Math.min(1800, Math.max(700, (file.size / (1024 * 1024)) * 220)); // 0.7s to 1.8s depending on size
      const intervalTime = 40;
      const step = (100 / (duration / intervalTime));

      const interval = setInterval(() => {
        progress += step;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setIsFileLoading(false);
          setImageName(file.name);

          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setSelectedImage(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        } else {
          setFileLoadProgress(Math.min(99, Math.round(progress)));
        }
      }, intervalTime);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (newCampaign.category === "presentation") {
        handleUploadMultipleFiles(Array.from(e.dataTransfer.files));
      } else {
        handleUploadFile(e.dataTransfer.files[0]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (newCampaign.category === "presentation") {
        handleUploadMultipleFiles(Array.from(e.target.files));
      } else {
        handleUploadFile(e.target.files[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImageUrl = selectedImage;
    if ((newCampaign.category === "video" || newCampaign.category === "tiktok") && !finalImageUrl) {
      finalImageUrl = newCampaign.category === "tiktok"
        ? "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80"
        : "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80";
    }

    if (!newCampaign.name.trim() || !finalImageUrl) {
      setError("Por favor, introduce un nombre y selecciona un diseño para continuar.");
      return;
    }

    const createdCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: newCampaign.name,
      description: newCampaign.description || "Sin descripción proporcionada.",
      createdAt: new Date().toISOString(),
      imageName: imageName || ((newCampaign.category === "video" || newCampaign.category === "tiktok") ? "video_thumbnail.jpg" : "custom_upload.jpg"),
      imageUrl: finalImageUrl,
      isPreset: false,
      status: "pending",
      category: newCampaign.category as any,
      videoUrl: (newCampaign.category === "video" || newCampaign.category === "tiktok") ? (videoUrl.trim() || "https://assets.mixkit.co/videos/preview/mixkit-cold-drink-with-lemon-and-mint-leaves-42358-large.mp4") : undefined,
      areasOfInterest: [
        { id: "aoi-h1", name: "Zona Titular Superior", x: 50, y: 25, width: 60, height: 15 },
        { id: "aoi-cta", name: "Botón CTA Principal", x: 50, y: 70, width: 25, height: 8 },
        { id: "aoi-brand", name: "Área de Logotipo", x: 15, y: 10, width: 18, height: 6 }
      ]
    };

    if (newCampaign.category === "presentation") {
      const docLabel = imageName ? ` - ${imageName.replace(/\.pdf$/i, "")}` : "";
      
      if (presentationSlides.length > 0) {
        // If the user uploaded custom slides as images, use their actual slides!
        createdCampaign.slides = presentationSlides.map((slide, i) => ({
          id: slide.id,
          slideNumber: i + 1,
          name: slide.name,
          imageUrl: slide.imageUrl,
          areasOfInterest: [
            { id: `aoi-s${i+1}-1`, name: "Área de Interés de Diapositiva", x: 50, y: 40, width: 50, height: 15 }
          ]
        }));
      } else {
        // If they uploaded a PDF template
        createdCampaign.slides = [
          {
            id: `slide-1-${Date.now()}`,
            slideNumber: 1,
            name: `Diapositiva 1: Portada${docLabel}`,
            imageUrl: finalImageUrl,
            areasOfInterest: [
              { id: "aoi-s1-1", name: "Título de la Portada", x: 50, y: 35, width: 60, height: 15 },
              { id: "aoi-s1-2", name: "Subtítulo / Bajada de Texto", x: 50, y: 55, width: 50, height: 10 }
            ]
          },
          {
            id: `slide-2-${Date.now()}`,
            slideNumber: 2,
            name: `Diapositiva 2: Datos y Métricas (Ejemplo Demo)`,
            imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
            areasOfInterest: [
              { id: "aoi-s2-1", name: "Gráfico de Crecimiento", x: 50, y: 50, width: 45, height: 35 }
            ]
          }
        ];
      }
    }

    onAddCampaign(createdCampaign);
    
    // Reset form
    setNewCampaign({ name: "", description: "", category: "keyvisual" });
    setVideoUrl("");
    setSelectedImage(null);
    setImageName("");
    setPresentationSlides([]);
    setShowAddForm(false);

    // Auto-trigger Gemini analysis
    await onAnalyzeCampaign(createdCampaign.id, createdCampaign);
  };

  // Helper to load presets as campaign copies
  const handleLoadPreset = (preset: Campaign) => {
    const clone: Campaign = {
      ...preset,
      id: `camp-${preset.id}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isPreset: false // Make it a customizable user copy
    };
    onAddCampaign(clone);
  };

  const filteredCampaigns = campaigns.filter(camp => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "video") {
      return camp.category === "video" || camp.category === "tiktok";
    }
    return camp.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Add Campaign button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">Campañas de Estudio de Atención</h2>
          <p className="text-slate-500 text-xs mt-0.5">Sube tus diseños o mockups y analiza la jerarquía cognitiva de tu contenido publicitario o interfaces.</p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/15 flex items-center self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva Campaña
          </button>
        )}
      </div>

      {/* Upload/Add Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <Plus className="w-4 h-4 text-indigo-500 mr-2" />
              Crear Nueva Campaña de Test
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-medium"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Input fields (5 columns) */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre del Diseño / Campaña *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Landing de Smartwatch, Banner de Facebook"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Descripción u Objetivo del Test
                </label>
                <textarea
                  placeholder="Ej: Evaluar si el botón de registro tiene visibilidad suficiente o si el producto de la góndola destaca..."
                  rows={3}
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de Estudio / Formato de Imagen
                </label>
                <select
                  value={newCampaign.category}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer font-medium"
                >
                  <option value="keyvisual">Cartel / Póster / Keyvisual</option>
                  <option value="banner">Banner Publicitario / Anuncio Display 📢</option>
                  <option value="supermarket">Estante de Supermercado / Góndola (Planograma)</option>
                  <option value="packaging">Diseño de Etiquetas & Empaques (Forma, Colores, Logos)</option>
                  <option value="landing">Página Web / Landing Page</option>
                  <option value="fintech">Interfaz de Aplicación (App UX)</option>
                  <option value="video">Anuncio en Video / Comercial de TV 📹</option>
                  <option value="tiktok">Reels / TikTok / Shorts (Video Vertical 9:16) 📱</option>
                  <option value="presentation">Presentación Comercial / Reporte PDF 📄</option>
                </select>
              </div>

              {(newCampaign.category === "video" || newCampaign.category === "tiktok") && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    URL del Video MP4 (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder={newCampaign.category === "tiktok" ? "Dejar vacío para usar video demo vertical de Café Frapé..." : "Dejar vacío para usar video demo de refresco cítrico..."}
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  <p className="text-[10px] text-indigo-600 font-medium mt-1">
                    * Usaremos un video publicitario premium por defecto si no ingresas uno para simular los sensores.
                  </p>
                </div>
              )}
            </div>

            {/* Drag & Drop Upload Frame (7 columns) */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {(newCampaign.category === "video" || newCampaign.category === "tiktok")
                    ? "Archivo de Video o Miniatura *" 
                    : newCampaign.category === "presentation" 
                    ? "Documento PDF o Imagen de Portada *" 
                    : "Mockup de Diseño o Imagen de Campaña *"}
                </label>

                {isFileLoading ? (
                  <div className="aspect-video w-full rounded-2xl border-2 border-indigo-200 bg-indigo-50/20 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                    <div className="relative w-16 h-16 mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          className="stroke-indigo-100"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          className="stroke-indigo-600 transition-all duration-100 ease-out"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * fileLoadProgress) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-indigo-700">
                        {fileLoadProgress}%
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-800">Cargando y decodificando archivo...</span>
                    <span className="text-[10px] text-indigo-600 mt-1 font-mono font-medium animate-pulse">
                      {(newCampaign.category === "video" || newCampaign.category === "tiktok") 
                        ? "Procesando fragmentos de video..." 
                        : newCampaign.category === "presentation" 
                        ? "Analizando páginas PDF..." 
                        : "Preparando resolución de imagen..."}
                    </span>
                  </div>
                ) : selectedImage ? (
                  <div className="flex flex-col space-y-3 w-full">
                    <div className="relative aspect-video w-full rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={selectedImage}
                        alt="Selected mockup preview"
                        className="max-h-[180px] w-auto object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImageName("");
                          setPresentationSlides([]);
                          if (newCampaign.category === "video" || newCampaign.category === "tiktok") {
                            setVideoUrl("");
                          }
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-2.5 py-1 rounded text-[10px] font-mono max-w-[80%] truncate">
                        {imageName}
                      </div>
                    </div>
                    
                    {presentationSlides.length > 1 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Diapositivas de la Presentación ({presentationSlides.length})</span>
                        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
                          {presentationSlides.map((slide, idx) => (
                            <div 
                              key={slide.id} 
                              onClick={() => setSelectedImage(slide.imageUrl)}
                              className={`relative aspect-video rounded-lg border-2 overflow-hidden cursor-pointer transition w-24 shrink-0 ${
                                selectedImage === slide.imageUrl ? "border-indigo-600 scale-95 shadow-sm" : "border-slate-100 hover:border-slate-200"
                              }`}
                            >
                              <img src={slide.imageUrl} className="w-full h-full object-cover" />
                              <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 text-[8px] text-white py-0.5 px-1 truncate text-center font-medium">
                                Pág. {idx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`aspect-video w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition ${
                      isDragging 
                        ? "border-indigo-500 bg-indigo-50/50" 
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={getUploadInstructions().accept}
                      onChange={handleFileChange}
                      className="hidden"
                      multiple={newCampaign.category === "presentation"}
                    />
                    <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700">{getUploadInstructions().title}</span>
                    <span className="text-[10px] text-slate-400 mt-1">{getUploadInstructions().subtitle}</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center space-x-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 mt-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/15"
              >
                Crear Campaña e Iniciar Análisis Predictivo de IA
              </button>
            </div>

          </div>

          {/* Quick preset loading bar inside create form */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">O usa una plantilla de estudio preestablecida:</span>
            <div className="flex flex-wrap gap-2">
              {campaignPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadPreset(preset)}
                  className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-xs font-medium rounded-lg transition shadow-xs flex items-center"
                >
                  <Cpu className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                  {preset.name.split(":")[1] || preset.name}
                </button>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* Category Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit overflow-x-auto max-w-full space-x-1 border border-slate-200/40">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            selectedCategory === "all" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-950"
          }`}
        >
          Todos los Diseños
        </button>
        <button
          onClick={() => setSelectedCategory("keyvisual")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === "keyvisual" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-955"
          }`}
        >
          🖼️ Carteles & Keyvisuals
        </button>
        <button
          onClick={() => setSelectedCategory("banner")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === "banner" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-955"
          }`}
        >
          📢 Banners & Publicidad
        </button>
        <button
          onClick={() => setSelectedCategory("supermarket")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === "supermarket" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-955"
          }`}
        >
          🛒 Estantes & Góndolas
        </button>
        <button
          onClick={() => setSelectedCategory("packaging")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === "packaging" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-955"
          }`}
        >
          📦 Empaques & Etiquetas
        </button>
        <button
          onClick={() => setSelectedCategory("landing")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            selectedCategory === "landing" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-955"
          }`}
        >
          Web / Landings
        </button>
        <button
          onClick={() => setSelectedCategory("fintech")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            selectedCategory === "fintech" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-955"
          }`}
        >
          Interfaces de App
        </button>
        <button
          onClick={() => setSelectedCategory("video")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === "video" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-955"
          }`}
        >
          📹 Videos & Comerciales
        </button>
        <button
          onClick={() => setSelectedCategory("presentation")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === "presentation" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-955"
          }`}
        >
          📄 Presentaciones PDF
        </button>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-xs">
          <ImageIcon className="w-12 h-12 text-slate-300 mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No hay estudios en esta categoría</h4>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">
            Crea una nueva campaña o estudio de atención seleccionando esta categoría para ver los resultados predictivos o haz clic en "Todos los Diseños".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => {
            const isActive = camp.id === activeCampaignId;
            const pointsCount = camp.predictive?.focusAreas.length || 0;
            
            return (
              <div
                key={camp.id}
                onClick={() => onSelectCampaign(camp.id)}
                className={`bg-white rounded-3xl overflow-hidden border transition cursor-pointer flex flex-col justify-between ${
                  isActive 
                    ? "border-indigo-500 shadow-md ring-2 ring-indigo-500/5" 
                    : "border-slate-100 hover:border-slate-200 shadow-xs"
                }`}
              >
                <div>
                  {/* Thumbnail header */}
                  <div className="relative aspect-video w-full bg-slate-900 border-b border-slate-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={camp.imageUrl}
                      alt={camp.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Category Overlay Badge */}
                    {camp.category && (
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider uppercase font-mono z-20 shadow-sm text-white ${
                        camp.category === "supermarket" ? "bg-emerald-600" :
                        camp.category === "keyvisual" ? "bg-rose-600" :
                        camp.category === "landing" ? "bg-blue-600" :
                        camp.category === "packaging" ? "bg-amber-600" :
                        camp.category === "video" ? "bg-violet-600" :
                        camp.category === "tiktok" ? "bg-gradient-to-r from-purple-600 to-pink-500" :
                        camp.category === "presentation" ? "bg-indigo-600" :
                        "bg-cyan-600"
                      }`}>
                        {camp.category === "supermarket" ? "🛒 Góndola" :
                         camp.category === "keyvisual" ? "🖼️ Keyvisual" :
                         camp.category === "landing" ? "🌐 Web" :
                         camp.category === "packaging" ? "📦 Empaque" :
                         camp.category === "video" ? "📹 Video" :
                         camp.category === "tiktok" ? "📱 Reel / TikTok" :
                         camp.category === "presentation" ? "📄 Presentación PDF" :
                         "📱 App UX"}
                      </div>
                    )}

                    {/* Overlay indicators */}
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase font-mono z-20">
                      {camp.status === "ready" ? "Estudio Activo" : "Pendiente de IA"}
                    </div>

                    {camp.isPreset && (
                      <div className="absolute top-2 right-2 bg-indigo-500 text-white px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase font-mono z-20">
                        Preset Demo
                      </div>
                    )}
                  </div>

                  {/* Body details */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">{camp.name}</h3>
                    <p className="text-slate-500 text-xs line-clamp-2 h-8 leading-relaxed">{camp.description}</p>
                  </div>
                </div>

                {/* Bottom statistics and select action */}
                <div className="p-5 pt-0 border-t border-slate-50/80 mt-auto">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 py-3 font-mono">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {new Date(camp.createdAt).toLocaleDateString("es-ES")}
                    </span>
                    <span className="flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      {pointsCount > 0 ? `${pointsCount} Anclas` : "Sin Reporte"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Select button */}
                    <span className={`text-xs font-bold flex items-center transition ${
                      isActive ? "text-indigo-600" : "text-slate-700"
                    }`}>
                      Abrir Análisis
                      <ChevronRight className={`w-4 h-4 ml-0.5 transition-transform ${isActive ? "translate-x-1" : ""}`} />
                    </span>

                    {/* Delete button (except presets to avoid locking) */}
                    {!camp.isPreset && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCampaign(camp.id);
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                        title="Eliminar campaña"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

import React, { useState } from "react";
import { QrCode, Smartphone, X, Copy, Check, ExternalLink, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function MobileQR() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic URL: Default to current window location, fallback to shared URL if needed
  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://ais-pre-zdla3wo467eu2p6aoun7vy-612187174590.us-west2.run.app";
  
  // Clean URL to display (without protocol)
  const displayUrl = currentUrl.replace(/(^\w+:|^)\/\//, "");

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}&color=0f172a&bgcolor=ffffff&qzone=2`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <>
      <button
        id="btn-mobile-qr"
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 text-xs font-bold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-all duration-200 flex items-center gap-2 border border-indigo-100 cursor-pointer shadow-xs"
        title="Escanea para usar en tu móvil"
      >
        <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
        <span className="hidden md:inline">Acceso Móvil</span>
        <QrCode className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 z-10"
            >
              {/* Top Colored Bar Accent */}
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      OculiMind AI en tu Móvil
                    </h3>
                    <p className="text-xs text-slate-500">
                      Lleva la experiencia completa de neuromarketing a tu mano
                    </p>
                  </div>
                </div>

                {/* QR Container */}
                <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-100/80 mb-4">
                  <div className="relative bg-white p-4 rounded-xl shadow-md border border-slate-200/50 flex items-center justify-center">
                    <img
                      src={qrImageUrl}
                      alt="Código QR de OculiMind"
                      className="w-44 h-44 select-none object-contain"
                      referrerPolicy="no-referrer"
                    />
                    {/* Inner custom dot brand badge for extremely polished look */}
                    <div className="absolute w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center border-2 border-white shadow-xs">
                      <Smartphone className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Enlace detectado
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-600 break-all px-3 py-1 bg-white rounded-lg border border-slate-100 inline-block max-w-[280px] truncate">
                      {displayUrl}
                    </span>
                  </div>
                </div>

                {/* Mobile Features / Value Proposition */}
                <div className="space-y-2 mb-5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    ¿Qué puedes probar en el móvil?
                  </span>
                  
                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                    <p>
                      <strong>Auditoría de Logos en vivo:</strong> Toma fotos de marcas y logos directamente con tu cámara para auditarlos instantáneamente.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0" />
                    <p>
                      <strong>Emotion AI & Face Tracking:</strong> Calibra y evalúa tus microexpresiones con la cámara frontal de tu teléfono.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600">¡Enlace Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copiar Enlace</span>
                      </>
                    )}
                  </button>

                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition flex items-center justify-center gap-2 text-center"
                  >
                    <span>Abrir en Pestaña</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Security & Instructions Note */}
              <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] text-slate-500 leading-snug">
                  Asegúrate de permitir el acceso a la cámara frontal cuando el móvil te lo solicite para las funciones de seguimiento en vivo.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

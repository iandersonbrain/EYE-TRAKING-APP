import React, { useState } from "react";
import { AccessKey } from "../types";
import { validateAccessKey, startUserSession } from "../lib/telemetryManager";
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  CheckSquare, 
  Square, 
  EyeOff, 
  ShieldAlert, 
  X,
  FileCheck2
} from "lucide-react";

interface AccessLoginModalProps {
  onLoginSuccess: (key: AccessKey) => void;
}

export default function AccessLoginModal({ onLoginSuccess }: AccessLoginModalProps) {
  const [accessCode, setAccessCode] = useState<string>("");
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDemoInfo, setShowDemoInfo] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setErrorMsg("Por favor ingresa una clave de acceso.");
      return;
    }

    if (!acceptedTerms) {
      setErrorMsg("Debes aceptar los Términos, Condiciones y el Acuerdo de Confidencialidad para continuar.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = validateAccessKey(accessCode);
      if (!res.valid || !res.key) {
        setErrorMsg(res.reason || "Clave no válida.");
        setIsLoading(false);
        return;
      }

      // Start Telemetry Session
      await startUserSession(res.key, "dashboard");
      onLoginSuccess(res.key);
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error al verificar el acceso.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickKeyFill = (code: string) => {
    setAccessCode(code);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative max-h-[95vh] flex flex-col">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>

        <div className="p-6 sm:p-8 space-y-5 overflow-y-auto">
          {/* Top Lock Icon & Title */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Acceso Controlado & Entorno Privado</span>
              </div>
              <h2 className="text-2xl font-black text-white font-display">
                Neuro-Analytics AI
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ingresa tu clave de prueba asignada o PIN Maestro para acceder a la plataforma.
              </p>
            </div>
          </div>

          {/* DESTACADO: Compromiso de Uso Confidencial Pre-Lanzamiento */}
          <div className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl space-y-2 text-amber-200">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>COMPROMISO DE CONFIDENCIALIDAD (NDA)</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-100 font-medium">
              ⚠️ <strong>Uso Exclusivo Pre-Lanzamiento:</strong> Esta plataforma contiene algoritmos predictivos, modelos de atención visual y material tecnológico sujeto a secreto comercial. Queda estrictamente prohibida la copia, reproducción, captura o divulgación pública de estas herramientas a terceros antes de su lanzamiento oficial.
            </p>
            <div className="pt-1 flex items-center justify-between border-t border-amber-500/20">
              <span className="text-[10px] text-amber-300/80">Prohibida la difusión pública no autorizada.</span>
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-xs text-amber-300 hover:text-amber-200 font-bold underline flex items-center"
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                Ver Términos Completos
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center">
                  <Key className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  Clave de Acceso o Nombre Registrado
                </span>
                <button
                  type="button"
                  onClick={() => setShowDemoInfo(!showDemoInfo)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold underline flex items-center"
                >
                  <HelpCircle className="w-3 h-3 mr-1" />
                  ¿Ayuda con tu clave?
                </button>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Ej: TEST2026, FRANCIS2026 o Francis Añazco..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono tracking-wider"
                  autoFocus
                />
                <div className="absolute right-3 top-3 text-slate-500">
                  <Key className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                * Puedes ingresar utilizando el código asignado (ej: <code>NEURO2026</code>) o tu nombre completo (ej: <code>Francis Añazco</code>).
              </p>
            </div>

            {/* Checkbox Aceptación Términos */}
            <div className="flex items-start space-x-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setAcceptedTerms(!acceptedTerms);
                  setErrorMsg(null);
                }}
                className="mt-0.5 text-indigo-400 hover:text-indigo-300 transition shrink-0 cursor-pointer"
              >
                {acceptedTerms ? (
                  <CheckSquare className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-600" />
                )}
              </button>

              <label 
                onClick={() => {
                  setAcceptedTerms(!acceptedTerms);
                  setErrorMsg(null);
                }}
                className="text-xs text-slate-300 leading-normal cursor-pointer select-none"
              >
                Acepto los <button type="button" onClick={(e) => { e.stopPropagation(); setShowTermsModal(true); }} className="text-indigo-400 hover:underline font-bold">Términos, Condiciones y el Compromiso de Confidencialidad Pre-Lanzamiento</button> así como el registro de auditoría de mi sesión.
              </label>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start space-x-2 text-rose-300 text-xs animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Validando Acceso...</span>
              ) : (
                <>
                  <span>Aceptar Términos & Ingresar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Helper for Testing */}
          {showDemoInfo && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5 text-xs text-slate-300 animate-fadeIn">
              <div className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
                Información de Acceso de Evaluación:
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cada evaluador cuenta con una clave personal asignada. Para pruebas generales de usuario, puedes utilizar la clave de evaluador autorizada a continuación:
              </p>
              <button
                type="button"
                onClick={() => handleQuickKeyFill("NEURO2026")}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-white block">NEURO2026</span>
                  <span className="text-[10px] text-emerald-300 block">Clave Evaluador Invitado</span>
                </div>
                <span className="text-[11px] font-bold text-indigo-400 underline">Usar esta clave</span>
              </button>
            </div>
          )}

          {/* Notice */}
          <div className="pt-2 text-center text-[11px] text-slate-500 leading-relaxed border-t border-slate-800/60">
            <p>
              🔒 <strong>Privacidad & Auditoría:</strong> El acceso y las actividades durante la sesión son registradas exclusivamente con fines de telemetría interna y control de pruebas sin consumo de servidores externos.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DE TÉRMINOS, CONDICIONES Y NDA COMPLETO */}
      {showTermsModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">
                    Términos, Condiciones y Acuerdo de Confidencialidad
                  </h3>
                  <p className="text-[11px] text-amber-300 font-medium">
                    Compromiso de No Divulgación Pre-Lanzamiento
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Terms Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-300 leading-relaxed">
              
              {/* Highlight Box */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-amber-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-1.5" />
                  1. ACUERDO DE STRICTA CONFIDENCIALIDAD Y NO DIVULGACIÓN (NDA)
                </h4>
                <p>
                  El usuario evaluador reconoce expresamente que las herramientas, modelos neuronales, mapas de calor, simuladores de atención visual y código provistos en esta aplicación constituyen <strong>Propiedad Intelectual y Secreto Comercial no publicado</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[11px]">
                  <li><strong>Prohibición de Captura y Transmisión:</strong> Se prohíbe explícitamente tomar capturas de pantalla, grabaciones de video, realizar ingeniería inversa o compartir accesos con terceros no autorizados.</li>
                  <li><strong>Evitar Divulgación Pre-Lanzamiento:</strong> Queda estrictamente prohibida cualquier publicación, reseña en redes sociales, blogs o medios de comunicación antes del lanzamiento oficial de la plataforma.</li>
                  <li><strong>Uso Exclusivo de Evaluación:</strong> Las claves asignadas son personales e intransferibles y deben ser empleadas únicamente para la evaluación técnica autorizada.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between">
                  <span>2. MARCO LEGAL Y DERECHOS DE AUTOR</span>
                  <span className="text-[10px] text-indigo-400 font-mono font-semibold">LEY DE DERECHO DE AUTOR (VENEZUELA)</span>
                </h4>
                <p>
                  Todos los derechos sobre el software, código fuente, algoritmos predictivos, simuladores de atención visual (Eye-Tracking), modelos neuronales, diseño de interfaz y marcas registradas pertenecen en su totalidad a los creadores y desarrolladores de OculiMind / Neuro-Analytics AI.
                </p>

                <div className="p-3.5 bg-slate-950 border border-indigo-500/20 rounded-xl space-y-2 text-[11px] text-slate-300">
                  <div className="font-bold text-indigo-300 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Artículos Clave de la Ley sobre el Derecho de Autor (República Bolivariana de Venezuela):</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                    <li>
                      <strong>Artículo 2 (numeral 1):</strong> Protege expresamente los programas de computación (software, aplicaciones móviles y web) como obras del ingenio sujetas a protección intelectual de autor.
                    </li>
                    <li>
                      <strong>Artículo 5:</strong> Garantiza la titularidad originaria y los derechos morales y patrimoniales exclusivos de los creadores sobre el programa informático.
                    </li>
                    <li>
                      <strong>Artículos 23 y 40:</strong> Consagran los derechos exclusivos de uso, reproducción, comunicación pública, modificación, ingeniería inversa prohibida y distribución del software, sancionando la divulgación o copia no autorizada.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-1">
                  3. REGISTRO DE AUDITORÍA Y TELEMETRÍA DE SESIÓN
                </h4>
                <p>
                  Con el propósito de proteger la propiedad intelectual y llevar un control estricto de las pruebas pre-lanzamiento, la plataforma registra automáticamente:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-400">
                  <li>Identificación de la Clave de Acceso utilizada y hora de ingreso.</li>
                  <li>Tiempo de permanencia general y tiempo dedicado a cada herramienta específica.</li>
                  <li>Ubicación estimada por dirección IP y datos técnicos del dispositivo/navegador.</li>
                  <li>Archivos e imágenes cargadas temporalmente para análisis.</li>
                  <li>Informes PDF y materiales exportados durante la sesión.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-1">
                  4. RESPONSABILIDAD Y SANCIÓN POR INCUMPLIMIENTO
                </h4>
                <p>
                  Cualquier violación al compromiso de confidencialidad dará lugar a la revocación inmediata de la clave de acceso, así como a las acciones legales o contractuales pertinentes por daños a la propiedad intelectual y revelación no autorizada de secreto comercial.
                </p>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Al hacer clic en "Aceptar Términos" declaras haber leído este acuerdo.
              </span>
              <button
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                  setErrorMsg(null);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Entendido y Aceptar Términos</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}


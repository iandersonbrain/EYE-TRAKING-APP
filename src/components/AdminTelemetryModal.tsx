import React, { useState, useEffect } from "react";
import { AccessKey, UserSessionTelemetry } from "../types";
import { 
  getAccessKeys, 
  saveAccessKeys, 
  getTelemetrySessions, 
  saveTelemetrySessions, 
  getMasterPin, 
  setMasterPin,
  formatDuration 
} from "../lib/telemetryManager";
import { 
  ShieldCheck, 
  Key, 
  Users, 
  Clock, 
  Globe, 
  Smartphone, 
  Monitor, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  FileJson, 
  FileSpreadsheet, 
  RefreshCw, 
  X, 
  Sparkles, 
  Activity, 
  BarChart2, 
  KeyRound, 
  FolderDown, 
  Image as ImageIcon,
  Search,
  Eye
} from "lucide-react";

interface AdminTelemetryModalProps {
  onClose: () => void;
}

export default function AdminTelemetryModal({ onClose }: AdminTelemetryModalProps) {
  const [activeTab, setActiveTab] = useState<'keys' | 'sessions' | 'export'>("sessions");

  // State for keys
  const [keysList, setKeysList] = useState<AccessKey[]>([]);
  const [newUserName, setNewUserName] = useState<string>("");
  const [newKeyCode, setNewKeyCode] = useState<string>("");
  const [newKeyNotes, setNewKeyNotes] = useState<string>("");
  const [newKeyExpireDate, setNewKeyExpireDate] = useState<string>("");

  // Master Pin change
  const [masterPinInput, setMasterPinInput] = useState<string>("");
  const [masterPinMsg, setMasterPinMsg] = useState<string | null>(null);

  // State for session telemetry
  const [sessionsList, setSessionsList] = useState<UserSessionTelemetry[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<UserSessionTelemetry | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
    setMasterPinInput(getMasterPin());
  }, []);

  const refreshData = () => {
    setKeysList(getAccessKeys());
    const sess = getTelemetrySessions();
    setSessionsList(sess);
    if (sess.length > 0 && !selectedSession) {
      setSelectedSession(sess[0]);
    }
  };

  // Generate random 6-character code
  const handleAutoGenerateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "TEST-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewKeyCode(code);
  };

  // Add new access key
  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      alert("Por favor ingrese el Nombre de Usuario o Empresa.");
      return;
    }

    let codeToUse = newKeyCode.trim().toUpperCase();
    if (!codeToUse) {
      // Auto-generate based on user name + 2026 or random
      const cleanName = newUserName.trim().split(" ")[0].toUpperCase().replace(/[^A-Z0-9]/g, "");
      codeToUse = `${cleanName || "TEST"}2026`;
    }

    const created: AccessKey = {
      id: `key-${Date.now()}`,
      code: codeToUse,
      userName: newUserName.trim(),
      role: "tester",
      isActive: true,
      createdAt: new Date().toISOString(),
      expiresAt: newKeyExpireDate ? new Date(newKeyExpireDate).toISOString() : undefined,
      notes: newKeyNotes.trim() || undefined
    };

    const updated = [created, ...keysList];
    saveAccessKeys(updated);
    setKeysList(updated);

    // Reset form
    setNewUserName("");
    setNewKeyCode("");
    setNewKeyNotes("");
    setNewKeyExpireDate("");
    alert(`¡Clave y Usuario guardados exitosamente!\n\n• Usuario: ${created.userName}\n• Código de Clave: ${created.code}\n\nEl usuario podrá ingresar escribiendo el código "${created.code}" o su nombre "${created.userName}".`);
  };

  // Toggle Key Active Status
  const handleToggleKeyActive = (keyId: string) => {
    const updated = keysList.map(k => {
      if (k.id === keyId) {
        return { ...k, isActive: !k.isActive };
      }
      return k;
    });
    saveAccessKeys(updated);
    setKeysList(updated);
  };

  // Delete Key
  const handleDeleteKey = (keyId: string) => {
    if (confirm("¿Estás seguro de eliminar esta clave de acceso?")) {
      const updated = keysList.filter(k => k.id !== keyId);
      saveAccessKeys(updated);
      setKeysList(updated);
    }
  };

  // Save Master PIN
  const handleSaveMasterPin = () => {
    if (!masterPinInput.trim() || masterPinInput.trim().length < 4) {
      setMasterPinMsg("El PIN Maestro debe tener al menos 4 caracteres.");
      return;
    }
    setMasterPin(masterPinInput.trim());
    setMasterPinMsg("PIN Maestro actualizado correctamente.");
    refreshData();
    setTimeout(() => setMasterPinMsg(null), 3000);
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Export JSON
  const handleExportJSON = () => {
    const data = {
      keys: keysList,
      telemetrySessions: sessionsList,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Telemetry_Audit_Report_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = "ID Sesion,Usuario,Clave,Fecha Ingreso,Duracion Segundos,Duracion Formateada,Pais,Ciudad,IP,Dispositivo,Archivos Subidos,Descargas\n";
    
    sessionsList.forEach(s => {
      const userEscaped = `"${s.userName.replace(/"/g, '""')}"`;
      const countryEscaped = `"${(s.ipLocation?.country || "Desconocido").replace(/"/g, '""')}"`;
      const cityEscaped = `"${(s.ipLocation?.city || "Desconocido").replace(/"/g, '""')}"`;
      const deviceEscaped = `"${(s.deviceInfo.isMobile ? "Móvil" : "Desktop") + " - " + s.deviceInfo.platform}"`;

      csv += `${s.id},${userEscaped},${s.accessKeyCode},${s.loginTime},${s.totalDurationSeconds},${formatDuration(s.totalDurationSeconds)},${countryEscaped},${cityEscaped},${s.ipLocation?.ip || ""},${deviceEscaped},${s.materialsUploaded?.length || 0},${s.exportsAndDownloads?.length || 0}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Auditoria_Sesiones_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  // Clear All Telemetry History
  const handleClearHistory = () => {
    if (confirm("¿Estás seguro de reiniciar el historial de telemetría de sesiones? Las claves de acceso se mantendrán.")) {
      saveTelemetrySessions([]);
      setSessionsList([]);
      setSelectedSession(null);
    }
  };

  // Filtered Sessions
  const filteredSessions = sessionsList.filter(s => 
    s.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.accessKeyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.ipLocation?.country || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // KPIs
  const totalSessionsCount = sessionsList.length;
  const totalDurationSum = sessionsList.reduce((acc, s) => acc + s.totalDurationSeconds, 0);
  const avgDurationSeconds = totalSessionsCount > 0 ? Math.round(totalDurationSum / totalSessionsCount) : 0;
  const totalMaterialsUploaded = sessionsList.reduce((acc, s) => acc + (s.materialsUploaded?.length || 0), 0);
  const totalDownloadsLogged = sessionsList.reduce((acc, s) => acc + (s.exportsAndDownloads?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white font-display">
                  Control de Accesos, Auditoría & Telemetría
                </h2>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  PIN Maestro Activo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestión de claves de prueba, monitoreo de sesiones y registro detallado de uso en la app.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800/80 flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === "sessions"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-300" />
            <span>Auditoría de Sesiones ({sessionsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("keys")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === "keys"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Key className="w-4 h-4 text-amber-300" />
            <span>Claves de Acceso ({keysList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("export")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === "export"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FolderDown className="w-4 h-4 text-emerald-300" />
            <span>Respaldos & Exportación</span>
          </button>

          <div className="ml-auto flex items-center space-x-2">
            <button
              onClick={refreshData}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: SESSIONS AUDIT & TELEMETRY */}
          {activeTab === "sessions" && (
            <div className="space-y-6">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Sesiones Totales
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-white font-display">{totalSessionsCount}</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Duración Promedio
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-emerald-400 font-display">{formatDuration(avgDurationSeconds)}</span>
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Imágenes / Archivos
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-amber-400 font-display">{totalMaterialsUploaded}</span>
                    <Upload className="w-4 h-4 text-amber-400" />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Informes PDF / Descargas
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-cyan-400 font-display">{totalDownloadsLogged}</span>
                    <Download className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Estado Servidor
                  </span>
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-xs font-bold text-slate-200">Local Zero-Cost</span>
                  </div>
                </div>
              </div>

              {/* Master Session Viewer Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Session List Table (Left / 5 Cols) */}
                <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col h-[520px]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
                      <Activity className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                      Historial de Sesiones
                    </span>
                    <span className="text-[11px] text-slate-500">{filteredSessions.length} entradas</span>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input 
                      type="text"
                      placeholder="Buscar por usuario, clave o país..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {filteredSessions.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        No hay registros de sesiones. Los ingresos de usuarios aparecerán aquí en tiempo real.
                      </div>
                    ) : (
                      filteredSessions.map((sess) => {
                        const isSelected = selectedSession?.id === sess.id;
                        return (
                          <div
                            key={sess.id}
                            onClick={() => setSelectedSession(sess)}
                            className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                              isSelected
                                ? "bg-indigo-950/80 border-indigo-500/80 text-white"
                                : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white truncate max-w-[180px]">
                                {sess.userName}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                                {sess.accessKeyCode}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1 text-slate-500" />
                                {new Date(sess.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-emerald-400 font-bold">
                                {formatDuration(sess.totalDurationSeconds)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-slate-800/50">
                              <span className="flex items-center">
                                <Globe className="w-3 h-3 mr-1 text-cyan-400" />
                                {sess.ipLocation?.city || "Local"}, {sess.ipLocation?.country || "VPN"}
                              </span>
                              <span>
                                {sess.deviceInfo.isMobile ? "📱 Móvil" : "💻 Desktop"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Session Inspector Details (Right / 7 Cols) */}
                <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-5 h-[520px] overflow-y-auto">
                  {selectedSession ? (
                    <div className="space-y-5">
                      
                      {/* User Header */}
                      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                        <div>
                          <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-indigo-300 text-[10px] font-bold uppercase mb-1">
                            <Eye className="w-3 h-3 text-indigo-400" />
                            <span>Inspeccionando Sesión Activa</span>
                          </div>
                          <h3 className="text-lg font-bold text-white font-display">
                            {selectedSession.userName}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            Clave Utilizada: <strong className="text-indigo-300">{selectedSession.accessKeyCode}</strong> | ID: {selectedSession.id}
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="text-xs font-bold text-emerald-400 block bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                            Duración: {formatDuration(selectedSession.totalDurationSeconds)}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Ingreso: {new Date(selectedSession.loginTime).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Technical & Geo Metadata */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                            <Globe className="w-3 h-3 mr-1 text-cyan-400" /> Ubicación Estimada (IP)
                          </span>
                          <p className="font-bold text-white">
                            {selectedSession.ipLocation?.city || "Ciudad Local"}, {selectedSession.ipLocation?.country || "País Local"}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            IP: {selectedSession.ipLocation?.ip || "N/A"}
                          </p>
                        </div>

                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                            <Monitor className="w-3 h-3 mr-1 text-indigo-400" /> Dispositivo & Navegador
                          </span>
                          <p className="font-bold text-white">
                            {selectedSession.deviceInfo.isMobile ? "Móvil / Tablet" : "Escritorio / Laptop"} ({selectedSession.deviceInfo.platform})
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Res: {selectedSession.deviceInfo.screenResolution} | Idioma: {selectedSession.deviceInfo.language}
                          </p>
                        </div>
                      </div>

                      {/* Tool Usage Breakdown */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                          Herramientas Específicas Utilizadas y Tiempo en Cada Una
                        </span>
                        
                        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                          {Object.keys(selectedSession.toolsUsed || {}).length === 0 ? (
                            <p className="text-slate-500 text-xs">Sin registros de interacción de herramientas.</p>
                          ) : (
                            Object.entries(selectedSession.toolsUsed).map(([toolId, rawSec]) => {
                              const sec = Number(rawSec) || 0;
                              const percent = Math.min(100, Math.round((sec / Math.max(1, selectedSession.totalDurationSeconds)) * 100));
                              return (
                                <div key={toolId} className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-200 capitalize">
                                      {toolId === 'dashboard' ? 'Dashboard 360' :
                                       toolId === 'ads' ? 'Ads Optimizer (Campaña)' :
                                       toolId === 'benchmark' ? 'Benchmark Competitivo' :
                                       toolId === 'video' ? 'Análisis de Video & TikTok' :
                                       toolId === 'ooh' ? 'OOH & Vía Pública' :
                                       toolId === 'trends' ? 'Algoritmo & Tendencias' : toolId}
                                    </span>
                                    <span className="text-indigo-400 font-mono font-bold">
                                      {formatDuration(sec)} ({percent}%)
                                    </span>
                                  </div>

                                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                                      style={{ width: `${percent}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Materials Uploaded */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center justify-between">
                          <span className="flex items-center">
                            <ImageIcon className="w-3.5 h-3.5 mr-1 text-amber-400" />
                            Materiales Subidos por el Usuario ({selectedSession.materialsUploaded?.length || 0})
                          </span>
                        </span>

                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 max-h-32 overflow-y-auto space-y-1.5">
                          {(!selectedSession.materialsUploaded || selectedSession.materialsUploaded.length === 0) ? (
                            <p className="text-slate-500 text-xs">El usuario no ha subido imágenes ni materiales en esta sesión.</p>
                          ) : (
                            selectedSession.materialsUploaded.map((mat) => (
                              <div key={mat.id} className="flex items-center justify-between text-xs p-1.5 bg-slate-950 rounded-lg border border-slate-800/80">
                                <span className="text-slate-200 font-medium truncate max-w-[220px]">
                                  📷 {mat.fileName}
                                </span>
                                <span className="text-[10px] text-amber-400 font-mono">
                                  {mat.tool} • {new Date(mat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Exports & Downloads */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center justify-between">
                          <span className="flex items-center">
                            <FolderDown className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                            Informes Generados & Descargas ({selectedSession.exportsAndDownloads?.length || 0})
                          </span>
                        </span>

                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 max-h-32 overflow-y-auto space-y-1.5">
                          {(!selectedSession.exportsAndDownloads || selectedSession.exportsAndDownloads.length === 0) ? (
                            <p className="text-slate-500 text-xs">Sin exportaciones registradas en esta sesión.</p>
                          ) : (
                            selectedSession.exportsAndDownloads.map((act) => (
                              <div key={act.id} className="flex items-center justify-between text-xs p-1.5 bg-slate-950 rounded-lg border border-slate-800/80">
                                <span className="text-slate-200 font-medium truncate max-w-[260px]">
                                  📄 {act.action}: {act.details}
                                </span>
                                <span className="text-[10px] text-cyan-400 font-mono">
                                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                      Selecciona una sesión de la lista para inspeccionar sus detalles.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: ACCESS KEYS MANAGEMENT */}
          {activeTab === "keys" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form Create New Key (4 Cols) */}
                <div className="lg:col-span-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white font-display flex items-center">
                      <Plus className="w-4 h-4 mr-1.5 text-indigo-400" />
                      Crear Nueva Clave de Prueba
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Genera un acceso exclusivo para un cliente o evaluador específico.
                    </p>
                  </div>

                  <form onSubmit={handleCreateKey} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Nombre del Usuario o Empresa *
                      </label>
                      <input 
                        type="text"
                        placeholder="ej. Empresa Alfa / Juan Pérez"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">
                          Código de Clave de Acceso *
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoGenerateCode}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold"
                        >
                          ⚡ Auto-generar
                        </button>
                      </div>
                      <input 
                        type="text"
                        placeholder="ej. PRUEBA-2026"
                        value={newKeyCode}
                        onChange={(e) => setNewKeyCode(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Fecha de Expiración (Opcional)
                      </label>
                      <input 
                        type="date"
                        value={newKeyExpireDate}
                        onChange={(e) => setNewKeyExpireDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Notas Internas (Opcional)
                      </label>
                      <input 
                        type="text"
                        placeholder="ej. Usuario para demo comercial"
                        value={newKeyNotes}
                        onChange={(e) => setNewKeyNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Guardar Clave de Acceso</span>
                    </button>
                  </form>
                </div>

                {/* Keys List Table (8 Cols) */}
                <div className="lg:col-span-8 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white font-display flex items-center">
                        <Key className="w-4 h-4 mr-1.5 text-amber-400" />
                        Claves de Acceso Activas ({keysList.length})
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Puedes activar, desactivar o eliminar cualquier clave en cualquier momento.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="pb-2">Usuario / Asignación</th>
                          <th className="pb-2">Clave</th>
                          <th className="pb-2">Rol</th>
                          <th className="pb-2">Estado</th>
                          <th className="pb-2 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {keysList.map((k) => (
                          <tr key={k.id} className="hover:bg-slate-900/50 transition">
                            <td className="py-3 font-medium text-white">
                              {k.userName}
                              {k.notes && <span className="block text-[10px] text-slate-500">{k.notes}</span>}
                            </td>
                            <td className="py-3 font-mono font-bold text-indigo-300">
                              <span className="inline-flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                <span>{k.code}</span>
                                <button onClick={() => handleCopyCode(k.code)} className="text-slate-400 hover:text-white">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </span>
                              {copiedCode === k.code && <span className="text-[10px] text-emerald-400 ml-1">¡Copiado!</span>}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                k.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {k.role === 'admin' ? 'PIN Maestro' : 'Usuario Test'}
                              </span>
                            </td>
                            <td className="py-3">
                              {k.isActive ? (
                                <span className="inline-flex items-center text-emerald-400 font-bold text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Activa
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-rose-400 font-bold text-[11px]">
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Desactivada
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-right space-x-2">
                              {k.role !== 'admin' && (
                                <>
                                  <button
                                    onClick={() => handleToggleKeyActive(k.id)}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition"
                                  >
                                    {k.isActive ? "Desactivar" : "Activar"}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteKey(k.id)}
                                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                                  >
                                    <Trash2 className="w-4 h-4 inline" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Change Master PIN Section */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block flex items-center">
                      <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                      Configurar PIN Maestro del Administrador
                    </span>

                    <div className="flex items-center space-x-3 max-w-md">
                      <input 
                        type="text"
                        value={masterPinInput}
                        onChange={(e) => setMasterPinInput(e.target.value)}
                        placeholder="ej. ADMIN2026"
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500 flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleSaveMasterPin}
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition"
                      >
                        Actualizar PIN
                      </button>
                    </div>

                    {masterPinMsg && (
                      <p className="text-xs text-emerald-400 font-medium">{masterPinMsg}</p>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: EXPORT & BACKUPS */}
          {activeTab === "export" && (
            <div className="max-w-2xl mx-auto space-y-6 pt-4">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6 text-center">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
                  <FolderDown className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white font-display">
                    Exportar Registros de Auditoría
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Descarga el historial completo de accesos, tiempos de uso y descargas en formatos estandarizados para análisis offline.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={handleExportJSON}
                    className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl transition flex flex-col items-center justify-center space-y-2 cursor-pointer group"
                  >
                    <FileJson className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition" />
                    <span className="font-bold text-xs text-white">Exportar JSON Completo</span>
                    <span className="text-[10px] text-slate-500">Incluye estructura completa de sesiones y claves</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl transition flex flex-col items-center justify-center space-y-2 cursor-pointer group"
                  >
                    <FileSpreadsheet className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition" />
                    <span className="font-bold text-xs text-white">Exportar CSV (Excel / Sheets)</span>
                    <span className="text-[10px] text-slate-500">Formato matricial listo para tablas dinámicas</span>
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-800/80">
                  <button
                    onClick={handleClearHistory}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center space-x-2 mx-auto cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Reiniciar Historial de Telemetría</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

import { AccessKey, UserSessionTelemetry, MaterialLogItem, ActionLogItem } from "../types";

const ACCESS_KEYS_STORAGE_KEY = "aistudio_access_keys_v1";
const SESSIONS_STORAGE_KEY = "aistudio_telemetry_sessions_v1";
const CURRENT_SESSION_ID_KEY = "aistudio_current_session_id_v1";
const MASTER_PIN_STORAGE_KEY = "aistudio_master_pin_v1";

const DEFAULT_MASTER_PIN = "ADMIN2026";

const DEFAULT_ACCESS_KEYS: AccessKey[] = [
  {
    id: "key-master-admin",
    code: "ADMIN2026",
    userName: "Administrador Principal (Master)",
    role: "admin",
    isActive: true,
    createdAt: new Date().toISOString(),
    notes: "Clave Maestra para administración total y métricas"
  },
  {
    id: "key-demo-01",
    code: "NEURO2026",
    userName: "Usuario Demo VIP",
    role: "tester",
    isActive: true,
    createdAt: new Date().toISOString(),
    notes: "Clave asignada para pruebas generales"
  },
  {
    id: "key-demo-02",
    code: "TEST2026",
    userName: "Empresa Evaluadora A",
    role: "tester",
    isActive: true,
    createdAt: new Date().toISOString(),
    notes: "Acceso temporal para pruebas de cliente"
  }
];

// Helper to load access keys from localStorage
export function getAccessKeys(): AccessKey[] {
  try {
    const saved = localStorage.getItem(ACCESS_KEYS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading access keys", e);
  }
  return DEFAULT_ACCESS_KEYS;
}

export function saveAccessKeys(keys: AccessKey[]): void {
  try {
    localStorage.setItem(ACCESS_KEYS_STORAGE_KEY, JSON.stringify(keys));
  } catch (e) {
    console.error("Error saving access keys", e);
  }
}

export function getMasterPin(): string {
  try {
    const pin = localStorage.getItem(MASTER_PIN_STORAGE_KEY);
    if (pin) return pin;
  } catch (e) {
    console.error("Error reading master pin", e);
  }
  return DEFAULT_MASTER_PIN;
}

export function setMasterPin(newPin: string): void {
  try {
    localStorage.setItem(MASTER_PIN_STORAGE_KEY, newPin);
    // Also update master key in keys list
    const keys = getAccessKeys();
    const updatedKeys = keys.map(k => k.role === 'admin' ? { ...k, code: newPin } : k);
    saveAccessKeys(updatedKeys);
  } catch (e) {
    console.error("Error setting master pin", e);
  }
}

// Validate Key
export function validateAccessKey(inputCode: string): { valid: boolean; key?: AccessKey; reason?: string } {
  if (!inputCode || !inputCode.trim()) {
    return { valid: false, reason: "Por favor ingresa tu clave o nombre de usuario de acceso." };
  }

  const codeTrimmed = inputCode.trim();
  const codeUpper = codeTrimmed.toUpperCase();
  const masterPin = getMasterPin();

  if (codeUpper === masterPin.toUpperCase()) {
    return {
      valid: true,
      key: {
        id: "master-admin",
        code: masterPin,
        userName: "Administrador (Master)",
        role: "admin",
        isActive: true,
        createdAt: new Date().toISOString()
      }
    };
  }

  // Normalizer for accent and space insensitive search (e.g. "Francis Añazco" -> "francisanazco")
  const normalizeStr = (str: string) => 
    str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

  const normalizedInput = normalizeStr(codeTrimmed);

  const keys = getAccessKeys();
  const matchedKey = keys.find(k => {
    const normCode = normalizeStr(k.code);
    const normUser = normalizeStr(k.userName);
    return (
      k.code.trim().toUpperCase() === codeUpper ||
      normCode === normalizedInput ||
      normUser === normalizedInput ||
      k.userName.trim().toLowerCase() === codeTrimmed.toLowerCase() ||
      (normalizedInput.length >= 4 && normUser.includes(normalizedInput))
    );
  });

  if (!matchedKey) {
    return { valid: false, reason: `Clave o usuario "${codeTrimmed}" no encontrado. Verifique la clave asignada o ingrese el nombre exacto.` };
  }

  if (!matchedKey.isActive) {
    return { valid: false, reason: "Esta clave de acceso ha sido desactivada por el Administrador." };
  }

  if (matchedKey.expiresAt) {
    const expires = new Date(matchedKey.expiresAt).getTime();
    if (Date.now() > expires) {
      return { valid: false, reason: "Esta clave de acceso ha expirado." };
    }
  }

  return { valid: true, key: matchedKey };
}

// Session Telemetry Storage
export function getTelemetrySessions(): UserSessionTelemetry[] {
  try {
    const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading telemetry sessions", e);
  }
  return [];
}

export function saveTelemetrySessions(sessions: UserSessionTelemetry[]): void {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Error saving telemetry sessions", e);
  }
}

// Detect Device Info
export function getDeviceInfo() {
  const userAgent = navigator.userAgent || "Unknown";
  const platform = navigator.platform || "Unknown";
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  const language = navigator.language || "es-ES";

  return {
    userAgent,
    platform,
    isMobile,
    screenResolution,
    language
  };
}

// Fetch IP Location asynchronously with fallback
export async function fetchIpLocation(): Promise<{ ip?: string; country?: string; city?: string; region?: string; org?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 sec timeout
    
    // Try ipapi.co
    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data.ip || "Detectado por navegador",
        country: data.country_name || "Desconocido",
        city: data.city || "Desconocido",
        region: data.region || "Desconocido",
        org: data.org || ""
      };
    }
  } catch (e) {
    // Fallback info if IP fetch is blocked by CORS/Adblock
  }

  return {
    ip: "IP Local / Privada",
    country: "Local o VPN",
    city: "Detectado por Cliente",
    region: "Navegador"
  };
}

// Start a new session upon login
export async function startUserSession(key: AccessKey, initialTool: string = "dashboard"): Promise<UserSessionTelemetry> {
  const now = new Date().toISOString();
  const deviceInfo = getDeviceInfo();
  const ipLocation = await fetchIpLocation();

  const newSession: UserSessionTelemetry = {
    id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    accessKeyCode: key.code,
    userName: key.userName,
    loginTime: now,
    lastActiveTime: now,
    totalDurationSeconds: 1,
    ipLocation,
    deviceInfo,
    toolsUsed: { [initialTool]: 1 },
    materialsUploaded: [],
    exportsAndDownloads: []
  };

  const sessions = getTelemetrySessions();
  sessions.unshift(newSession); // Add newest at top
  saveTelemetrySessions(sessions);
  localStorage.setItem(CURRENT_SESSION_ID_KEY, newSession.id);

  return newSession;
}

export function getCurrentSessionId(): string | null {
  return localStorage.getItem(CURRENT_SESSION_ID_KEY);
}

export function getCurrentSession(): UserSessionTelemetry | null {
  const currentId = getCurrentSessionId();
  if (!currentId) return null;
  const sessions = getTelemetrySessions();
  return sessions.find(s => s.id === currentId) || null;
}

// Heartbeat & Tool Usage Updates
export function recordSessionHeartbeat(currentTool: string, deltaSeconds: number = 2): void {
  const currentId = getCurrentSessionId();
  if (!currentId) return;

  const sessions = getTelemetrySessions();
  const index = sessions.findIndex(s => s.id === currentId);
  if (index === -1) return;

  const session = sessions[index];
  session.lastActiveTime = new Date().toISOString();
  session.totalDurationSeconds += deltaSeconds;

  if (!session.toolsUsed) {
    session.toolsUsed = {};
  }

  session.toolsUsed[currentTool] = (session.toolsUsed[currentTool] || 0) + deltaSeconds;

  sessions[index] = session;
  saveTelemetrySessions(sessions);
}

// Log Material Uploaded (Images, Videos, Presentations)
export function logMaterialUploaded(fileName: string, tool: string, fileType: string, fileSize?: string): void {
  const currentId = getCurrentSessionId();
  if (!currentId) return;

  const sessions = getTelemetrySessions();
  const index = sessions.findIndex(s => s.id === currentId);
  if (index === -1) return;

  const item: MaterialLogItem = {
    id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    fileName,
    tool,
    fileType,
    fileSize
  };

  if (!sessions[index].materialsUploaded) {
    sessions[index].materialsUploaded = [];
  }

  sessions[index].materialsUploaded.unshift(item);
  saveTelemetrySessions(sessions);
}

// Log Export or Download Action
export function logExportAction(action: string, details: string, tool: string): void {
  const currentId = getCurrentSessionId();
  if (!currentId) return;

  const sessions = getTelemetrySessions();
  const index = sessions.findIndex(s => s.id === currentId);
  if (index === -1) return;

  const item: ActionLogItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    tool
  };

  if (!sessions[index].exportsAndDownloads) {
    sessions[index].exportsAndDownloads = [];
  }

  sessions[index].exportsAndDownloads.unshift(item);
  saveTelemetrySessions(sessions);
}

// Format duration helper (e.g. 125s -> "2m 5s")
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const remainingM = m % 60;
  return `${h}h ${remainingM}m`;
}

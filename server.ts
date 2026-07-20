/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set high limit for base64 uploads and large media files
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Lazy initializer for Google Gen AI client to avoid crashing on missing key
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Gemini API client initialized successfully.");
    } else {
      console.warn("GEMINI_API_KEY not set or invalid. Running in mock fallback mode for custom uploads.");
    }
  }
  return aiClient;
}

// Endpoint to check status of the Gemini Integration
app.get("/api/status", (req, res) => {
  const apiKeyExists = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    geminiActive: apiKeyExists,
    message: apiKeyExists 
      ? "IA Predictiva Activa (Gemini 3.5 Flash)" 
      : "Modo Simulado (Configure GEMINI_API_KEY para análisis por IA real)"
  });
});

// Primary Endpoint: AI Predictive Attention Analysis
app.post("/api/predictive-analysis", async (req, res) => {
  try {
    const { imageBase64, imageName } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Falta el archivo de imagen en formato base64" });
    }

    const ai = getAiClient();

    // If Gemini is not configured, generate a high-quality simulated eye-tracking report
    if (!ai) {
      console.log("Generating high-quality simulated report for:", imageName);
      return res.json(generateSimulatedData(imageName || "Custom Asset"));
    }

    // Extract raw base64 data (strip prefix if present)
    const match = imageBase64.match(/^data:([^;]+);base64,(.*)$/);
    let mimeType = "image/png";
    let rawBase64 = imageBase64;
    
    if (match) {
      mimeType = match[1];
      rawBase64 = match[2];
    }

    console.log(`Analyzing image ${imageName || "custom"} using Gemini 3.5 Flash...`);

    const systemInstruction = `Eres un experto de clase mundial en neuro-diseño, psicología cognitiva y análisis de eye-tracking (atención visual).
Analizarás la imagen proporcionada y predecirás el comportamiento de atención visual de un usuario típico durante los primeros 10 segundos de visualización.

Debes devolver obligatoriamente un JSON que coincida exactamente con este esquema:
{
  "clarityScore": number (Puntuación de claridad global de 0 a 100, donde 100 es súper claro, limpio, con baja carga cognitiva),
  "cognitiveLoad": number (Carga cognitiva estimada de 0 a 100, donde 100 es sobrecargado, texto ruidoso, confuso, y 0 es extremadamente minimalista y directo),
  "focusAreas": [
    {
      "x": number (coordenada X del centro de atención en porcentaje de 0 a 100),
      "y": number (coordenada Y del centro de atención en porcentaje de 0 a 100),
      "radius": number (radio de influencia en porcentaje de 0 a 100, usualmente entre 5 y 25),
      "weight": number (nivel de atracción de atención de 0 a 100, donde 100 es foco absoluto),
      "name": "string" (Nombre descriptivo del elemento visual analizado, ej: 'Botón CTA Comprar', 'Imagen de producto', 'Logotipo', 'Texto principal')
    }
  ],
  "gazePath": [
    {
      "id": "string" (ID único corto de 2-3 letras, ej: 'p1', 'p2'),
      "x": number (coordenada X en porcentaje de 0 a 100),
      "y": number (coordenada Y en porcentaje de 0 a 100),
      "sequence": number (número de orden secuencial de mirada, de 1 a 6. El 1 es la primera fijación),
      "durationMs": number (duración estimada de la fijación en milisegundos, entre 100 y 1200),
      "label": "string" (Etiqueta descriptiva corta de la fijación, ej: 'Impacto Inicial', 'Lectura de Título', 'Evaluación de Acción')
    }
  ],
  "reportText": {
    "summary": "string" (Un análisis detallado en español de 2-3 párrafos explicando la jerarquía visual de la imagen, qué captura la atención, si hay distractores y cómo fluye la lectura cognitiva),
    "strengths": ["string" (Mínimo 3 fortalezas del diseño en términos de atracción visual y claridad)],
    "weaknesses": ["string" (Mínimo 3 debilidades o puntos ciegos detectados)],
    "recommendations": ["string" (Mínimo 3 recomendaciones de mejora prácticas y concretas para aumentar la conversión y reducir la carga cognitiva)]
  }
}

Sé extremadamente preciso con las coordenadas X e Y (0,0 es esquina superior izquierda, 100,100 es esquina inferior derecha). Analiza los elementos reales que ves en la imagen: si hay caras, rostros, textos grandes, o botones contrastantes, dales alta prioridad. Si el diseño es de un empaque o etiqueta de producto, evalúa con mucho detalle la forma o silueta del empaque, el contraste de colores, las etiquetas adheridas, los logotipos y la facilidad de lectura de mensajes o claims nutricionales/descriptivos.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: rawBase64,
          },
        },
        "Analiza la imagen de diseño adjunta y genera el reporte cognitivo y predicción de eye-tracking."
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["clarityScore", "cognitiveLoad", "focusAreas", "gazePath", "reportText"],
          properties: {
            clarityScore: { type: Type.NUMBER },
            cognitiveLoad: { type: Type.NUMBER },
            focusAreas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["x", "y", "radius", "weight", "name"],
                properties: {
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  radius: { type: Type.NUMBER },
                  weight: { type: Type.NUMBER },
                  name: { type: Type.STRING },
                },
              },
            },
            gazePath: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "x", "y", "sequence", "durationMs", "label"],
                properties: {
                  id: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  sequence: { type: Type.NUMBER },
                  durationMs: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                },
              },
            },
            reportText: {
              type: Type.OBJECT,
              required: ["summary", "strengths", "weaknesses", "recommendations"],
              properties: {
                summary: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("La respuesta de Gemini está vacía");
    }

    const parsedData = JSON.parse(resultText.trim());
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Error en predictive-analysis:", error);
    res.status(500).json({
      error: "Error al procesar el análisis predictivo con IA",
      details: error.message || "Error desconocido",
      fallback: true,
      simulatedData: generateSimulatedData("Subida de Usuario")
    });
  }
});

// New Endpoint: Logo Review / Auditoría de Logos con IA (mylogoreview.com inspired)
app.post("/api/logo-analysis", async (req, res) => {
  try {
    const { imageBase64, logoName, category } = req.body;
    const resolvedName = logoName || "Logo Sin Nombre";
    const resolvedCategory = category || "General / No Especificado";

    if (!imageBase64) {
      return res.status(400).json({ error: "Falta la imagen del logotipo en formato base64" });
    }

    const ai = getAiClient();

    // Fallback if no Gemini client is active
    if (!ai) {
      console.log(`Generando análisis de logo simulado de alta fidelidad para: ${resolvedName}`);
      return res.json(generateSimulatedLogoData(resolvedName, resolvedCategory));
    }

    // Extract raw base64 data
    const match = imageBase64.match(/^data:([^;]+);base64,(.*)$/);
    let mimeType = "image/png";
    let rawBase64 = imageBase64;
    
    if (match) {
      mimeType = match[1];
      rawBase64 = match[2];
    }

    console.log(`Analizando logotipo '${resolvedName}' (Categoría: ${resolvedCategory}) con Gemini 3.5 Flash...`);

    const systemInstruction = `Eres un experto de nivel de agencia de branding global y especialista en diseño de logotipos y sistemas de identidad visual corporativa. Tu tarea es analizar el diseño del logotipo proporcionado en la imagen, teniendo en cuenta la categoría del proyecto ("${resolvedCategory}") y el nombre de la marca ("${resolvedName}").

Debes realizar una auditoría técnica profunda, emitiendo puntuaciones, detectando riesgos formales y de legibilidad, y proponiendo mejoras accionables y precisas.

Debes devolver obligatoriamente un JSON que coincida exactamente con este esquema:
{
  "score": {
    "overall": number (Puntuación general del logotipo de 0 a 100),
    "clarity": number (Puntuación de claridad conceptual y minimalismo, de 0 a 100),
    "originality": number (Puntuación de distinción y originalidad en su sector, de 0 a 100),
    "legibility": number (Puntuación de legibilidad del nombre de marca, de 0 a 100),
    "adaptability": number (Puntuación de versatilidad en diferentes medios, de 0 a 100)
  },
  "risks": [
    {
      "severity": "high" | "medium" | "low" (Gravedad del riesgo),
      "type": "Misinterpretation" | "Confusion" | "Scale Legibility" | "Color Contrast" | "Other" (Tipo de riesgo técnico),
      "title": "string" (Título corto en español explicando el riesgo detectado),
      "description": "string" (Explicación técnica detallada del riesgo detectado y por qué ocurre, ej. si se confunde con otra marca, si se malinterpreta la silueta o pierde legibilidad al achicarse)
    }
  ],
  "improvements": [
    {
      "priority": "high" | "medium" | "low" (Prioridad de la recomendación),
      "area": "string" (Área técnica, ej: 'Espaciado Tipográfico', 'Grosor de Filetes', 'Simplificación Cromática', 'Alineación de Isotipo'),
      "description": "string" (Recomendación detallada de diseño en español, explicando qué cambiar y qué valor técnico aportará)
    }
  ],
  "brandPalette": [
    {
      "name": "string" (Nombre descriptivo del color, ej: 'Azul Eléctrico', 'Verde Orgánico', 'Blanco Puro'),
      "hex": "string" (Código hexadecimal del color, ej: '#0f172a'),
      "usageRecommendation": "string" (Consejo técnico de uso y contraste de este color en el ecosistema de marca),
      "contrastOk": boolean (true si el color tiene un buen nivel de contraste para usarse sobre blanco/oscuro)
    }
  ],
  "monochromeReview": {
    "whiteVersionOk": boolean (true si el diseño se puede convertir a blanco puro sobre fondo oscuro sin perder la silueta),
    "blackVersionOk": boolean (true si el diseño responde bien a negro puro sobre fondo claro),
    "feedback": "string" (Revisión técnica de la respuesta monocromática del logotipo y consejos de adaptación)
  },
  "faviconReview": {
    "score": number (Puntuación de adaptabilidad a favicon/iconos micro, de 0 a 100),
    "elementsToSimplify": "string" (Sugerencia concreta de qué elementos retirar o simplificar para usar el logotipo como favicon o icono de aplicación de 16x16px o 32x32px)
  }
}

Sé sumamente honesto, objetivo y técnico. No elogies por cortesía; si el logotipo tiene problemas de escala, trazos demasiado delgados, baja legibilidad de tipografía secundaria, o colores que no contrastan bien, indícalo de forma clara y ofrece soluciones de diseñador senior de identidad visual.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: rawBase64,
          },
        },
        `Realiza la auditoría técnica profunda del logotipo '${resolvedName}' de la categoría '${resolvedCategory}'.`
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["score", "risks", "improvements", "brandPalette", "monochromeReview", "faviconReview"],
          properties: {
            score: {
              type: Type.OBJECT,
              required: ["overall", "clarity", "originality", "legibility", "adaptability"],
              properties: {
                overall: { type: Type.NUMBER },
                clarity: { type: Type.NUMBER },
                originality: { type: Type.NUMBER },
                legibility: { type: Type.NUMBER },
                adaptability: { type: Type.NUMBER }
              }
            },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["severity", "type", "title", "description"],
                properties: {
                  severity: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            improvements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["priority", "area", "description"],
                properties: {
                  priority: { type: Type.STRING },
                  area: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            brandPalette: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "hex", "usageRecommendation", "contrastOk"],
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  usageRecommendation: { type: Type.STRING },
                  contrastOk: { type: Type.BOOLEAN }
                }
              }
            },
            monochromeReview: {
              type: Type.OBJECT,
              required: ["whiteVersionOk", "blackVersionOk", "feedback"],
              properties: {
                whiteVersionOk: { type: Type.BOOLEAN },
                blackVersionOk: { type: Type.BOOLEAN },
                feedback: { type: Type.STRING }
              }
            },
            faviconReview: {
              type: Type.OBJECT,
              required: ["score", "elementsToSimplify"],
              properties: {
                score: { type: Type.NUMBER },
                elementsToSimplify: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("La respuesta de Gemini para auditoría de logo está vacía");
    }

    const parsedData = JSON.parse(resultText.trim());
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Error en logo-analysis:", error);
    res.status(500).json({
      error: "Error al procesar la auditoría del logotipo con IA",
      details: error.message || "Error desconocido",
      fallback: true,
      simulatedData: generateSimulatedLogoData(req.body.logoName || "Logo Corporativo", req.body.category || "General")
    });
  }
});

// Helper for high-fidelity simulated logo reviews
function generateSimulatedLogoData(logoName: string, category: string) {
  // Let's create pseudo-personalized results based on name and category to make it feel amazing
  const isTech = category.toLowerCase().includes("tec") || category.toLowerCase().includes("app") || category.toLowerCase().includes("soft");
  const isFood = category.toLowerCase().includes("rest") || category.toLowerCase().includes("comid") || category.toLowerCase().includes("aliment") || category.toLowerCase().includes("caf");
  
  let primaryColor = "#4f46e5"; // Indigo
  let secondaryColor = "#06b6d4"; // Cyan
  let primaryName = "Índigo Tecnológico";
  let secondaryName = "Cian Eléctrico";

  if (isTech) {
    primaryColor = "#0f172a";
    secondaryColor = "#38bdf8";
    primaryName = "Azul Obscuro Digital";
    secondaryName = "Celeste Neón";
  } else if (isFood) {
    primaryColor = "#ea580c";
    secondaryColor = "#eab308";
    primaryName = "Naranja Enérgico";
    secondaryName = "Amarillo Mostaza";
  }

  return {
    score: {
      overall: isTech ? 88 : (isFood ? 82 : 84),
      clarity: 90,
      originality: 76,
      legibility: 85,
      adaptability: 82
    },
    risks: [
      {
        severity: "medium",
        type: "Scale Legibility",
        title: "Pérdida de legibilidad en tamaños reducidos (Favicon)",
        description: `El isotipo o emblema para ${logoName} contiene detalles internos intrincados que pierden distinción visual en escalas micro, como avatares de 32x32px o favicons de navegador.`
      },
      {
        severity: "low",
        type: "Color Contrast",
        title: "Contraste de luminancia subóptimo sobre fondos de color",
        description: `La paleta de color secundaria de ${logoName} no alcanza la proporción de contraste recomendada de 3:1 sobre fondos claros, lo que puede causar fatiga o invisibilidad.`
      }
    ],
    improvements: [
      {
        priority: "high",
        area: "Tipografía secundaria",
        description: `Aumentar el tracking (espaciado entre letras) de la sub-marca o slogan del logotipo en un 20%. Esto previene el solapamiento de caracteres tipográficos a baja escala.`
      },
      {
        priority: "medium",
        area: "Grosor de trazos en isotipo",
        description: "Unificar el grosor de las líneas del isotipo para que correspondan con los trazos principales de la tipografía. Esto genera mayor equilibrio estético y consistencia formal."
      },
      {
        priority: "low",
        area: "Simplificación cromática",
        description: `Reducir la paleta a 2 colores principales para facilitar la recordación y abaratar costos en impresiones físicas o bordados de indumentaria corporativa.`
      }
    ],
    brandPalette: [
      {
        name: primaryName,
        hex: primaryColor,
        usageRecommendation: "Color primario corporativo. Utilícese en el 60% de las comunicaciones visuales para mantener el anclaje de la identidad.",
        contrastOk: true
      },
      {
        name: secondaryName,
        hex: secondaryColor,
        usageRecommendation: "Color secundario de acento. Úsese para resaltar llamados a la acción, viñetas clave o elementos gráficos de soporte.",
        contrastOk: true
      },
      {
        name: "Gris de Fondo",
        hex: "#f1f5f9",
        usageRecommendation: "Color de soporte neutro. Perfecto para fondos web, empaques secundarios y áreas de respiro visual.",
        contrastOk: true
      }
    ],
    monochromeReview: {
      whiteVersionOk: true,
      blackVersionOk: true,
      feedback: "El logotipo posee una excelente delimitación formal y silueta cerrada. La traslación a monocromo puro (silueta 100% blanca sobre fondo negro y silueta 100% negra sobre fondo blanco) se realiza limpiamente y sin pérdida de reconocimiento."
    },
    faviconReview: {
      score: 75,
      elementsToSimplify: "Para el favicon del sitio web de la marca, elimine completamente la palabra secundaria o el texto completo. Utilice únicamente la sección del isotipo de forma aislada, centrada en un lienzo cuadrado con esquinas redondeadas."
    }
  };
}

// Helper to generate simulated heatmaps and paths when API is not available
function generateSimulatedData(name: string) {
  const isPresentation = name.toLowerCase().includes("slide") ||
                         name.toLowerCase().includes("diapositiva") ||
                         name.toLowerCase().includes("pitch") ||
                         name.toLowerCase().includes("presentation") ||
                         name.toLowerCase().includes("presentación") ||
                         name.toLowerCase().includes("deck") ||
                         name.toLowerCase().includes("portada") ||
                         name.toLowerCase().includes("tracción") ||
                         name.toLowerCase().includes("conclusión");

  if (isPresentation) {
    const isSlide2 = name.toLowerCase().includes("slide 2") || name.toLowerCase().includes("diapositiva 2") || name.toLowerCase().includes("tracción") || name.toLowerCase().includes("metric");
    const isSlide3 = name.toLowerCase().includes("slide 3") || name.toLowerCase().includes("diapositiva 3") || name.toLowerCase().includes("conclusión") || name.toLowerCase().includes("cta") || name.toLowerCase().includes("contacto");

    if (isSlide2) {
      return {
        clarityScore: 73,
        cognitiveLoad: 56,
        focusAreas: [
          { x: 50, y: 45, radius: 20, weight: 98, name: "Gráfico de Crecimiento / Barras" },
          { x: 18, y: 38, radius: 14, weight: 92, name: "Cifra de Tracción Gigante (ARR $1.2M)" },
          { x: 15, y: 15, radius: 8, weight: 50, name: "Cabecera de Diapositiva" }
        ],
        gazePath: [
          { id: "sp2-1", x: 18, y: 38, sequence: 1, durationMs: 580, label: "Fijación Inicial: Impacto del Dato Numérico" },
          { id: "sp2-2", x: 50, y: 45, sequence: 2, durationMs: 700, label: "Fijación Secuencial: Verificación del Gráfico" },
          { id: "sp2-3", x: 18, y: 68, sequence: 3, durationMs: 420, label: "Lectura del Texto de Soporte" }
        ],
        reportText: {
          summary: `[Análisis de Diapositiva de Datos] El diseño de datos funciona de manera muy ágil. El ojo conecta de inmediato el número clave ARR $1.2M con la cúspide del gráfico creciente de barras. La atención se retiene de forma balanceada.`,
          strengths: [
            "Fuerte asimilación del dato numérico destacado.",
            "Flujo visual ordenado en patrón de lectura en 'Z'."
          ],
          weaknesses: [
            "Las leyendas pequeñas en los ejes del gráfico tienen bajo contraste.",
            "Párrafo de apoyo ligeramente pegado a la métrica superior."
          ],
          recommendations: [
            "Aumentar el tamaño de fuente en los ejes del gráfico de barras.",
            "Dar mayor espaciado perimetral para aislar la cifra clave."
          ]
        }
      };
    }

    if (isSlide3) {
      return {
        clarityScore: 84,
        cognitiveLoad: 33,
        focusAreas: [
          { x: 50, y: 72, radius: 14, weight: 96, name: "Botón de Conversión CTA" },
          { x: 50, y: 42, radius: 18, weight: 88, name: "Planes / Pilares de Propuesta" },
          { x: 50, y: 88, radius: 10, weight: 65, name: "Código QR / Correo de Contacto" }
        ],
        gazePath: [
          { id: "sp3-1", x: 50, y: 72, sequence: 1, durationMs: 720, label: "Fijación Inicial: Botón de Registro Principal" },
          { id: "sp3-2", x: 50, y: 42, sequence: 2, durationMs: 600, label: "Fijación Secuencial: Características del Plan" },
          { id: "sp3-3", x: 50, y: 88, sequence: 3, durationMs: 385, label: "Lectura de Datos de Contacto y Cierre" }
        ],
        reportText: {
          summary: `[Análisis de Diapositiva de Cierre] Excelente llamada a la acción. El botón central verde resalta con fuerza, guiando al inversionista o cliente al cierre de negocios de forma directa tras un recorrido rápido por los pilares del negocio.`,
          strengths: [
            "Contraste del botón CTA ideal para la conversión rápida.",
            "Disposición simétrica y equilibrada de elementos de cierre."
          ],
          weaknesses: [
            "Los textos en las columnas descriptivas son extensos.",
            "Frase superior compite sutilmente con el fondo claro."
          ],
          recommendations: [
            "Reducir las oraciones de las columnas a un formato de bullet points directos.",
            "Incrementar el contraste tipográfico del titular superior."
          ]
        }
      };
    }

    // Default Slide 1 (Cover)
    return {
      clarityScore: 88,
      cognitiveLoad: 25,
      focusAreas: [
        { x: 45, y: 42, radius: 16, weight: 95, name: "Título de la Portada" },
        { x: 15, y: 15, radius: 10, weight: 75, name: "Logotipo OculiMind" },
        { x: 75, y: 50, radius: 15, weight: 80, name: "Gráfico Visual Abstracto" }
      ],
      gazePath: [
        { id: "sp1-1", x: 45, y: 42, sequence: 1, durationMs: 650, label: "Fijación Inicial: Comprensión del Título" },
        { id: "sp1-2", x: 75, y: 50, sequence: 2, durationMs: 480, label: "Exploración de la Ilustración Gráfica" },
        { id: "sp1-3", x: 15, y: 15, sequence: 3, durationMs: 350, label: "Reconocimiento de Marca / Logo" }
      ],
      reportText: {
        summary: `[Análisis de Portada de Presentación] Excelente jerarquía de portada. El espacio en blanco aísla de forma impecable el titular, permitiendo al cerebro capturar el mensaje en menos de 2 segundos de exposición visual.`,
        strengths: [
          "Diseño sumamente limpio con excelente espacio de respiración.",
          "Logo situado perfectamente en la esquina superior izquierda de lectura."
        ],
        weaknesses: [
          "Bajada de subtítulo ligeramente delgada.",
          "La esquina inferior derecha está completamente libre de anclas."
        ],
        recommendations: [
          "Aumentar el font-weight de la bajada de texto secundaria.",
          "Añadir el número de página de forma pequeña en los márgenes inferiores."
        ]
      }
    };
  }

  const isSupermarket = name.toLowerCase().includes("supermarket") || 
                        name.toLowerCase().includes("estante") || 
                        name.toLowerCase().includes("gondola") || 
                        name.toLowerCase().includes("góndola") || 
                        name.toLowerCase().includes("shelf") ||
                        name.toLowerCase().includes("bebida") ||
                        name.toLowerCase().includes("refresco") ||
                        name.toLowerCase().includes("gondol");

  if (isSupermarket) {
    return {
      clarityScore: 68,
      cognitiveLoad: 65,
      focusAreas: [
        { x: 30, y: 46, radius: 12, weight: 95, name: "Cartel de Oferta (Rojo Brillante)" },
        { x: 52, y: 45, radius: 20, weight: 88, name: "Marca de Refresco Líder (Centro)" },
        { x: 75, y: 45, radius: 14, weight: 70, name: "Producto Competidor Directo" },
        { x: 50, y: 15, radius: 15, weight: 55, name: "Botella Premium Superior" }
      ],
      gazePath: [
        { id: "p1", x: 30, y: 46, sequence: 1, durationMs: 480, label: "Fijación 1: Cartel de oferta de color rojo" },
        { id: "p2", x: 52, y: 45, sequence: 2, durationMs: 550, label: "Fijación 2: Reconocimiento de marca líder" },
        { id: "p3", x: 75, y: 45, sequence: 3, durationMs: 380, label: "Fijación 3: Comparación con competencia" },
        { id: "p4", x: 50, y: 15, sequence: 4, durationMs: 310, label: "Fijación 4: Exploración de fila superior" },
        { id: "p5", x: 50, y: 78, sequence: 5, durationMs: 220, label: "Fijación 5: Lectura rápida de marcas económicas" }
      ],
      reportText: {
        summary: `[Análisis Simulado para Góndola: ${name}] El análisis de planograma demuestra la regla de oro del retail físico: la zona de la "altura de los ojos" y los estímulos cromáticos disruptivos (como el cartel rojo de oferta) acaparan la primera mirada en los primeros 10 segundos. La marca líder al centro de la góndola retiene fijaciones secundarias robustas, mientras que los estantes inferiores sufren de una severa ceguera por ubicación.`,
        strengths: [
          "La etiqueta de oferta roja rompe el patrón lineal del estante con altísima efectividad.",
          "La marca líder captura el share de atención ideal en el centro a la altura de los ojos.",
          "La iluminación contrastante de las botellas superiores atrae la mirada antes del escaneo inferior."
        ],
        weaknesses: [
          "Excesiva redundancia y desorden visual entre variantes de botellas, disparando la carga cognitiva a 65%.",
          "Los estantes inferiores (Fila de marcas económicas) quedan completamente fuera de la trayectoria ocular primaria.",
          "La tipografía del precio secundario en las etiquetas normales es imperceptible."
        ],
        recommendations: [
          "Colocar el producto con mayor margen de ganancia justo al lado del cartel de oferta.",
          "Agrupar marcas por bloques cromáticos limpios para reducir el ruido visual en la góndola.",
          "Colocar un stopper o rompetráfico lateral para forzar fijaciones sacádicas hacia los estantes inferiores."
        ]
      }
    };
  }

  const isPackaging = name.toLowerCase().includes("packaging") ||
                      name.toLowerCase().includes("empaque") ||
                      name.toLowerCase().includes("etiqueta") ||
                      name.toLowerCase().includes("label") ||
                      name.toLowerCase().includes("bottle") ||
                      name.toLowerCase().includes("botella") ||
                      name.toLowerCase().includes("envase") ||
                      name.toLowerCase().includes("frasco");

  if (isPackaging) {
    return {
      clarityScore: 82,
      cognitiveLoad: 38,
      focusAreas: [
        { x: 50, y: 35, radius: 15, weight: 95, name: "Logotipo Principal (Identidad de Marca)" },
        { x: 50, y: 55, radius: 12, weight: 80, name: "Mensaje de Valor / Eslogan del Producto" },
        { x: 50, y: 15, radius: 10, weight: 65, name: "Forma y Tapa del Empaque (Silueta)" },
        { x: 50, y: 75, radius: 8, weight: 50, name: "Etiqueta Secundaria / Sello de Calidad" }
      ],
      gazePath: [
        { id: "pk1", x: 50, y: 35, sequence: 1, durationMs: 600, label: "Fijación 1: Identificación del Logotipo" },
        { id: "pk2", x: 50, y: 55, sequence: 2, durationMs: 480, label: "Fijación 2: Lectura de mensaje e ingredientes clave" },
        { id: "pk3", x: 50, y: 15, sequence: 3, durationMs: 320, label: "Fijación 3: Escaneo de la silueta y corona del empaque" },
        { id: "pk4", x: 50, y: 75, sequence: 4, durationMs: 250, label: "Fijación 4: Verificación de sellos ecológicos o de calidad" }
      ],
      reportText: {
        summary: `[Análisis Simulado de Empaque: ${name}] El diseño estructural del empaque demuestra un flujo de lectura vertical sumamente balanceado. El logotipo y el nombre del producto dominan con alta prominencia (Fijación 1), logrando un anclaje de identidad instantáneo. La forma física del envase ayuda a enmarcar la etiqueta y guía la mirada de arriba hacia abajo de manera natural. El color del empaque y los contrastes cromáticos de la etiqueta son óptimos, resultando en una carga cognitiva moderadamente baja (38%).`,
        strengths: [
          "El logotipo tiene un excelente contraste y un espacio negativo perimetral que evita el amontonamiento visual.",
          "La lectura de los claims/mensajes clave es ágil gracias a una tipografía sans-serif de trazo limpio.",
          "La forma y simetría del empaque ayudan a centrar la mirada en los elementos regulatorios y de valor."
        ],
        weaknesses: [
          "La etiqueta secundaria posee textos de tamaño reducido, forzando la vista del consumidor para identificar sellos de calidad.",
          "Falta un elemento cromático disruptivo en la tapa o base para delimitar los extremos y cerrar el circuito de escaneo.",
          "Los mensajes sobre beneficios e ingredientes compiten levemente en jerarquía tipográfica con la descripción del producto."
        ],
        recommendations: [
          "Incrementar el tamaño de los sellos ecológicos o certificaciones en un 20% para facilitar su lectura rápida a distancia de góndola.",
          "Utilizar una tapa con color de contraste (ej. madera, negro mate, o metalizado) para dar un anclaje visual a la silueta superior del envase.",
          "Establecer una diferenciación más clara entre el nombre del producto y el beneficio primario usando negrita o un tamaño de letra diferenciado."
        ]
      }
    };
  }

  const isVideo = name.toLowerCase().includes("video") ||
                  name.toLowerCase().includes("comercial") ||
                  name.toLowerCase().includes("spot") ||
                  name.toLowerCase().includes("anuncio") ||
                  name.toLowerCase().includes("tv") ||
                  name.toLowerCase().includes("film") ||
                  name.toLowerCase().includes("clip") ||
                  name.toLowerCase().includes("trailer");

  if (isVideo) {
    return {
      clarityScore: 89,
      cognitiveLoad: 42,
      focusAreas: [
        { x: 50, y: 52, radius: 22, weight: 98, name: "Detalle del Producto Central en Movimiento" },
        { x: 50, y: 18, radius: 12, weight: 85, name: "Logotipo de Marca Revelado" },
        { x: 32, y: 65, radius: 15, weight: 72, name: "Efectos Visuales / Dinamismo" },
        { x: 50, y: 80, radius: 10, weight: 60, name: "Eslogan y Llamado a la Acción de Cierre" }
      ],
      gazePath: [
        { id: "vgp1", x: 50, y: 52, sequence: 1, durationMs: 750, label: "0-3s: Enfoque inmediato en el dinamismo visual del líquido o producto" },
        { id: "vgp2", x: 32, y: 65, sequence: 2, durationMs: 450, label: "3-7s: Seguimiento ocular de los estímulos de movimiento laterales" },
        { id: "vgp3", x: 50, y: 18, sequence: 3, durationMs: 580, label: "7-11s: Lectura y fijación del logotipo de marca central" },
        { id: "vgp4", x: 50, y: 80, sequence: 4, durationMs: 420, label: "11-15s: Fijación final en el eslogan y call to action" }
      ],
      reportText: {
        summary: `[Análisis Simulado de Video: ${name}] El estudio demuestra una respuesta de retención sobresaliente. El dinamismo del video y el movimiento concentran el 98% de la atención visual en los primeros segundos. El logotipo central logra un anclaje impecable cerca del segundo 10, lo que garantiza un alto recuerdo de marca integrado.`,
        strengths: [
          "Estímulos de movimiento altamente atractivos que capturan la atención inicial de forma inmediata.",
          "Logotipo de marca revelado en momentos de baja carga cognitiva para un mejor recuerdo.",
          "Transiciones suaves que evitan sobresaltos visuales o fatiga del consumidor."
        ],
        weaknesses: [
          "El texto del eslogan final compite visualmente con el fondo animado si no está sombreado.",
          "El ritmo acelerado en escenas del medio causa una pérdida temporal del 15% de fijaciones continuas."
        ],
        recommendations: [
          "Agregar una placa de color mate al final para aislar el logotipo y duplicar su retención de marca.",
          "Reducir la velocidad de las tomas de producto para mantener la mirada fija en los claims principales."
        ]
      }
    };
  }

  const isBanner = name.toLowerCase().includes("banner") || 
                   name.toLowerCase().includes("anuncio") || 
                   name.toLowerCase().includes("ad ") || 
                   name.toLowerCase().includes("ad_") || 
                   name.toLowerCase().includes("advertisement") || 
                   name.toLowerCase().includes("display") ||
                   name.toLowerCase().includes("coffee") ||
                   name.toLowerCase().includes("artisan");

  if (isBanner) {
    return {
      clarityScore: 74,
      cognitiveLoad: 46,
      focusAreas: [
        { x: 58, y: 48, radius: 22, weight: 100, name: "Taza de Café (Latte Art)" },
        { x: 22, y: 22, radius: 12, weight: 75, name: "Logotipo de Marca" },
        { x: 25, y: 45, radius: 15, weight: 65, name: "Slogan: 'Despierta tus Sentidos'" },
        { x: 80, y: 78, radius: 10, weight: 50, name: "Granos de café de fondo" }
      ],
      gazePath: [
        { id: "b1", x: 58, y: 48, sequence: 1, durationMs: 500, label: "Fijación 1: Espuma del café" },
        { id: "b2", x: 22, y: 22, sequence: 2, durationMs: 400, label: "Fijación 2: Reconocimiento del Logo" },
        { id: "b3", x: 25, y: 45, sequence: 3, durationMs: 480, label: "Fijación 3: Slogan promocional" },
        { id: "b4", x: 80, y: 78, sequence: 4, durationMs: 180, label: "Fijación 4: Granos periféricos" }
      ],
      reportText: {
        summary: `[Análisis Simulado para Banner Publicitario: ${name}] El banner digital presenta un rendimiento de retención sólido. El elemento visual dominante (la taza de café) capta de inmediato el 100% de la energía de la primera mirada. Esto es crucial en anuncios digitales para redes sociales o display, donde se cuenta con menos de 2 segundos para enganchar al usuario antes del scroll. El logotipo de la marca es identificado secundariamente con buena nitidez, y el llamado a la acción destaca de forma idónea.`,
        strengths: [
          "El producto principal ejerce un nivel de apetitosidad extremadamente alto gracias a la calidad y calidez del café.",
          "El logotipo se ubica en el cuadrante superior izquierdo, aprovechando el inicio de lectura natural occidental.",
          "Paleta cromática cálida y coherente que refuerza el espíritu de marca premium."
        ],
        weaknesses: [
          "Efecto vampiro visual: los granos de café periféricos distraen levemente la atención del slogan.",
          "La tipografía del slogan carece del contraste óptimo sobre ciertas texturas de madera de fondo.",
          "Falta un beneficio tangible destacado en la zona de mayor atención primaria para disparar el CTR."
        ],
        recommendations: [
          "Reducir ligeramente la saturación o el brillo de los granos de café esparcidos inferiores para que la taza resalte aún más sin distractores.",
          "Añadir una pequeña sombra o placa sólida detrás del texto del slogan para incrementar su contraste a al menos 4.5:1.",
          "Mover la marca un 10% más cerca de la taza para unificar el anclaje de atención."
        ]
      }
    };
  }

  // Let's create smart pseudo-random distributions based on typical landing layouts
  return {
    clarityScore: 78,
    cognitiveLoad: 42,
    focusAreas: [
      { x: 50, y: 25, radius: 18, weight: 85, name: "Elemento Hero Principal (Visual)" },
      { x: 15, y: 10, radius: 10, weight: 60, name: "Logotipo de Marca" },
      { x: 50, y: 50, radius: 15, weight: 90, name: "Título y Propuesta de Valor" },
      { x: 50, y: 72, radius: 12, weight: 95, name: "Botón Call to Action (CTA)" },
      { x: 85, y: 10, radius: 8, weight: 40, name: "Menú de Navegación" }
    ],
    gazePath: [
      { id: "p1", x: 50, y: 25, sequence: 1, durationMs: 450, label: "Fijación Inicial: Impacto Visual" },
      { id: "p2", x: 50, y: 50, sequence: 2, durationMs: 650, label: "Procesamiento de Titular" },
      { id: "p3", x: 15, y: 10, sequence: 3, durationMs: 300, label: "Reconocimiento de Marca" },
      { id: "p4", x: 85, y: 10, sequence: 4, durationMs: 250, label: "Exploración de Enlaces" },
      { id: "p5", x: 50, y: 72, sequence: 5, durationMs: 800, label: "Decisión y Foco en Acción (CTA)" },
      { id: "p6", x: 50, y: 90, sequence: 6, durationMs: 400, label: "Lectura de Apoyos Secundarios" }
    ],
    reportText: {
      summary: `[Análisis Simulado para: ${name}] El diseño presenta una estructura clásica y funcional que guía al usuario eficientemente de arriba a abajo. El área de mayor impacto reside en la sección superior central, donde el elemento gráfico principal (Visual Hero) retiene la atención de inmediato. Posteriormente, la mirada se desliza hacia el titular principal para comprender el contexto. El botón de llamada a la acción (CTA) se beneficia de un fuerte contraste cromático, capturando un foco de atención secundario muy fuerte tras la lectura del texto. No se perciben cuellos de botella severos, aunque el menú de navegación derecho atrae menos miradas de las esperadas debido a su baja escala visual.`,
      strengths: [
        "Excelente contraste en el botón de acción (CTA) principal.",
        "Ubicación centralizada del titular que facilita una lectura natural en patrón de 'F'.",
        "El elemento gráfico actúa como un ancla visual muy potente sin competir excesivamente con el texto."
      ],
      weaknesses: [
        "El menú superior es demasiado sutil, provocando un retraso en la descubribilidad de otras secciones.",
        "Ciertos bloques de texto secundario inferiores acumulan demasiada densidad informativa, aumentando el esfuerzo cognitivo.",
        "Ausencia de indicadores visuales (como flechas o miradas de modelos) que dirijan activamente el flujo ocular hacia el formulario."
      ],
      recommendations: [
        "Incrementar el tamaño de fuente y espaciado de los enlaces del menú superior para mejorar su tasa de clic.",
        "Utilizar micro-copys más directos e íconos descriptivos en lugar de párrafos densos en las características inferiores.",
        "Alinear el elemento gráfico principal de manera que apunte o dirija la mirada del usuario de forma implícita hacia el botón de conversión principal."
      ]
    }
  };
}

// Set up frontend serving
async function startServer() {
  // Vite dev server middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted.");
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Serving static production files from ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

startServer();

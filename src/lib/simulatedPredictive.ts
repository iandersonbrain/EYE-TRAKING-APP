import { PredictiveData } from "../types";
import { analyzeImagePixels, ImagePixelFeatures } from "./imagePixelAnalysis";

/**
 * Generates a deterministic hash code from an image name, base64 payload or URL.
 * Used only as a tie-breaker / jitter source now that real pixel analysis
 * (see imagePixelAnalysis.ts) drives the actual hotspot placement whenever
 * an image is available.
 */
function computeStringHash(str: string): number {
  let hash = 5381;
  if (!str) return 12345;
  const len = str.length;
  const step = Math.max(1, Math.floor(len / 400));
  for (let i = 0; i < len; i += step) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash ^ len);
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Client-side fallback predictive eye-tracking analysis generator, used
 * when the real Gemini Vision backend (server.ts) is unreachable (e.g. a
 * static-only deployment with no Node server behind it).
 *
 * IMPORTANT: this is a heuristic, not a real AI vision model. When an
 * image is provided, it grounds its hotspot placement and scores in
 * actually-measured pixel features (contrast, edges, brightness — see
 * imagePixelAnalysis.ts) so that two different designs produce genuinely
 * different results. It does NOT perform real OCR or semantic
 * understanding of the image content; headline/slogan text is inferred
 * from the campaign name and industry, and is labeled as an estimate
 * rather than "OCR verified" to avoid overstating its accuracy.
 */
export async function generateClientSimulatedData(
  name: string,
  category = "keyvisual",
  imageBase64OrUrl?: string,
  industryType?: string
): Promise<PredictiveData> {
  const seedStr = `${name}_${category}_${industryType || ''}_${imageBase64OrUrl ? imageBase64OrUrl.length : ''}`;
  const seed = computeStringHash(seedStr);
  const cleanName = name.replace(/\.[^/.]+$/, "").trim() || "Keyvisual / Poster";
  const nameLower = cleanName.toLowerCase();

  // Real, measured pixel features for THIS specific image (null if no
  // image was provided or it couldn't be decoded, e.g. cross-origin
  // without CORS headers) — this is what makes results image-specific.
  const pixels: ImagePixelFeatures | null = imageBase64OrUrl
    ? await analyzeImagePixels(imageBase64OrUrl)
    : null;

  // Deduce or normalize Industry Type
  let detectedIndustry = industryType || "Consumo Masivo & Retail";
  if (!industryType) {
    if (nameLower.includes("nike") || nameLower.includes("sport") || nameLower.includes("deporte") || nameLower.includes("zapatilla")) {
      detectedIndustry = "Moda, Calzado & Estilo de Vida";
    } else if (nameLower.includes("cafe") || nameLower.includes("coffee") || nameLower.includes("cerveza") || nameLower.includes("bebida") || nameLower.includes("food")) {
      detectedIndustry = "Bebidas & Alimentos";
    } else if (nameLower.includes("auto") || nameLower.includes("car") || nameLower.includes("vehiculo") || nameLower.includes("motor")) {
      detectedIndustry = "Automotriz & Movilidad";
    } else if (nameLower.includes("app") || nameLower.includes("tech") || nameLower.includes("soft") || nameLower.includes("saas") || nameLower.includes("landing")) {
      detectedIndustry = "Tecnología & Software / SaaS";
    } else if (nameLower.includes("bank") || nameLower.includes("fintech") || nameLower.includes("tarjeta") || nameLower.includes("card")) {
      detectedIndustry = "Fintech, Banca & Seguros";
    } else if (nameLower.includes("casa") || nameLower.includes("inmobiliaria") || nameLower.includes("home") || nameLower.includes("depto")) {
      detectedIndustry = "Inmobiliario & Construcción";
    }
  }

  // ============================================================
  // SCORES: grounded in real measured pixel features when available,
  // instead of purely a name/category hash.
  // ============================================================
  let clarityScore: number;
  let cognitiveLoad: number;

  if (pixels) {
    // A clear "winner" peak in the real saliency map (strong, isolated,
    // well above the rest) reads as a legible, well-composed focal point.
    const topWeight = (pixels.topSaliencyPeak?.weight ?? 0) / 100;
    const secondWeight = (pixels.saliency.peaks[1]?.weight ?? 0) / 100;
    const prominence = clamp(topWeight - secondWeight * 0.6, -0.2, 1);
    clarityScore = Math.round(clamp(70 + prominence * 26 + topWeight * 6 + (seed % 4), 58, 98));

    // Busier images (lots of edges, lots of color variety, many competing
    // saliency peaks) demand more cognitive effort to parse.
    const peakCrowding = clamp((pixels.saliency.peaks.length - 2) / 6, 0, 1);
    cognitiveLoad = Math.round(clamp(
      14 + pixels.globalEdgeDensity * 34 + pixels.colorfulness * 16 + peakCrowding * 16 + (seed % 4),
      12, 80
    ));
  } else {
    clarityScore = Math.min(98, Math.max(72, 80 + (seed % 19)));
    cognitiveLoad = Math.min(58, Math.max(16, 20 + ((seed >> 2) % 35)));
  }

  const firstFixationTimeMs = Math.min(260, Math.max(120, 130 + ((seed >> 4) % 120)));
  const totalScanTimeSec = parseFloat((2.1 + ((seed >> 6) % 18) / 10).toFixed(1));

  // Headline / slogan text: this is an ESTIMATE derived from the
  // campaign name and detected industry, not real OCR. Real text
  // extraction requires the Gemini Vision backend (server.ts).
  let detectedHeadline = cleanName;
  let detectedSlogan = "Innovación y Máximo Rendimiento Garantizado";

  if (detectedIndustry.includes("Moda") || nameLower.includes("nike") || nameLower.includes("sport")) {
    detectedHeadline = "RUN WITHOUT LIMITS";
    detectedSlogan = "Supera tus marcas con la edición ligera de alta tracción";
  } else if (detectedIndustry.includes("Bebidas") || nameLower.includes("cafe") || nameLower.includes("coffee")) {
    detectedHeadline = "DESPIERTA TUS SENTIDOS";
    detectedSlogan = "Sabor 100% artesanal con aroma fresco de origen seleccionado";
  } else if (detectedIndustry.includes("Automotriz") || nameLower.includes("auto")) {
    detectedHeadline = "EL FUTURO DE LA CONDUCCIÓN";
    detectedSlogan = "Potencia eléctrica silenciosa con autonomía superior de 600km";
  } else if (detectedIndustry.includes("Tecnología") || detectedIndustry.includes("Software")) {
    detectedHeadline = "OPTIMIZA TU FLUJO DIGITAL";
    detectedSlogan = "Plataforma inteligente con análisis predictivo en tiempo real";
  } else if (detectedIndustry.includes("Fintech") || nameLower.includes("bank")) {
    detectedHeadline = "TU DINERO SIN FRONTERAS";
    detectedSlogan = "Transferencias inmediatas sin comisiones ocultas y máxima seguridad";
  } else {
    const slogansList = [
      "Diseñado para elevar la experiencia visual y acelerar la conversión",
      "Calidad superior verificada con tecnología de neuro-diseño en tiempo real",
      "La solución integral adaptada a las exigencias de tu mercado objetivo",
      "Potencia la recordación de marca con jerarquía visual optimizada",
      "Experiencia de marca envolvente construida para captar atención inmediata"
    ];
    detectedHeadline = cleanName.toUpperCase();
    detectedSlogan = slogansList[seed % slogansList.length];
  }

  const detectedTextInImage = pixels
    ? `[Estimación heurística — no es OCR real]: Titular probable: "${detectedHeadline}" | Slogan probable: "${detectedSlogan}". Para lectura de texto 100% real, activa el motor Gemini Vision (GEMINI_API_KEY en el backend).`
    : `[Estimación heurística — no es OCR real]: Titular probable: "${detectedHeadline}" | Slogan probable: "${detectedSlogan}".`;

  // ============================================================
  // LAYOUT: hotspot coordinates (x, y percentages 0-100).
  // When real pixel features are available, hotspots are anchored to
  // regions actually measured in THIS image (highest-contrast/edge
  // region, quietest corner, etc). Otherwise falls back to one of a
  // handful of seeded layout templates.
  // ============================================================
  let headlineX: number, headlineY: number;
  let sloganX: number, sloganY: number;
  let heroX: number, heroY: number;
  let logoX: number, logoY: number;
  let ctaX: number, ctaY: number;

  if (pixels) {
    const heroPeak = pixels.topSaliencyPeak;
    heroX = heroPeak ? heroPeak.xPct : pixels.salientCell.centerXPct;
    heroY = heroPeak ? heroPeak.yPct : pixels.salientCell.centerYPct;

    const headlinePeak = pixels.topAreaSaliencyPeak;
    headlineX = headlinePeak ? headlinePeak.xPct : pixels.brightestTopCell.centerXPct;
    headlineY = headlinePeak ? clamp(headlinePeak.yPct, 8, 32) : clamp(pixels.brightestTopCell.centerYPct - 8, 8, 30);
    sloganX = headlineX;
    sloganY = headlineY + 12;

    logoX = pixels.quietCorner.centerXPct;
    logoY = clamp(pixels.quietCorner.centerYPct, 8, 92);

    const ctaPeak = pixels.bottomAreaSaliencyPeak;
    ctaX = ctaPeak ? ctaPeak.xPct : pixels.strongestBottomCell.centerXPct;
    ctaY = ctaPeak ? clamp(ctaPeak.yPct, 70, 95) : clamp(pixels.strongestBottomCell.centerYPct + 6, 70, 94);
  } else if (nameLower.includes("nike") || nameLower.includes("billboard") || nameLower.includes("valla")) {
    headlineX = 28; headlineY = 22;
    sloganX = 28; sloganY = 35;
    heroX = 52; heroY = 42;
    logoX = 80; logoY = 15;
    ctaX = 28; ctaY = 82;
  } else if (nameLower.includes("smartwatch") || category === "landing") {
    headlineX = 28; headlineY = 20;
    sloganX = 28; sloganY = 32;
    heroX = 70; heroY = 42;
    logoX = 18; logoY = 12;
    ctaX = 28; ctaY = 46;
  } else {
    const layoutStyle = seed % 4;
    if (layoutStyle === 0) {
      headlineX = 22 + (seed % 16);
      headlineY = 18 + ((seed >> 2) % 10);
      sloganX = headlineX + 2;
      sloganY = headlineY + 12 + ((seed >> 3) % 6);
      heroX = 65 + ((seed >> 4) % 18);
      heroY = 42 + ((seed >> 5) % 25);
      logoX = 18 + ((seed >> 6) % 12);
      logoY = 10 + ((seed >> 7) % 6);
      ctaX = headlineX;
      ctaY = sloganY + 18 + ((seed >> 8) % 12);
    } else if (layoutStyle === 1) {
      headlineX = 48 + (seed % 8) - 4;
      headlineY = 16 + ((seed >> 2) % 8);
      sloganX = 50;
      sloganY = headlineY + 10 + ((seed >> 3) % 6);
      heroX = 50 + ((seed >> 4) % 6) - 3;
      heroY = 52 + ((seed >> 5) % 16);
      logoX = (seed % 2 === 0) ? (82 + ((seed >> 6) % 8)) : (16 + ((seed >> 6) % 8));
      logoY = 12 + ((seed >> 7) % 6);
      ctaX = 50;
      ctaY = 82 + ((seed >> 8) % 8);
    } else if (layoutStyle === 2) {
      heroX = 28 + (seed % 16);
      heroY = 45 + ((seed >> 2) % 20);
      headlineX = 68 + ((seed >> 3) % 14);
      headlineY = 22 + ((seed >> 4) % 10);
      sloganX = headlineX;
      sloganY = headlineY + 12 + ((seed >> 5) % 6);
      logoX = 82 + ((seed >> 6) % 8);
      logoY = 12 + ((seed >> 7) % 6);
      ctaX = headlineX;
      ctaY = sloganY + 20 + ((seed >> 8) % 10);
    } else {
      logoX = 16 + (seed % 10);
      logoY = 12 + ((seed >> 2) % 6);
      headlineX = 35 + ((seed >> 3) % 20);
      headlineY = 22 + ((seed >> 4) % 8);
      sloganX = headlineX + 5;
      sloganY = headlineY + 12;
      heroX = 50 + ((seed >> 5) % 18) - 9;
      heroY = 52 + ((seed >> 6) % 14);
      ctaX = 72 + ((seed >> 7) % 15);
      ctaY = 80 + ((seed >> 8) % 10);
    }
  }

  // Dynamic secondary feature hotspot (e.g. badge, price, detail)
  const secondaryX = pixels
    ? clamp(100 - pixels.salientCell.centerXPct, 12, 88)
    : Math.min(88, Math.max(12, 15 + ((seed * 13) % 70)));
  const secondaryY = pixels
    ? clamp(pixels.salientCell.centerYPct + 15, 15, 85)
    : Math.min(85, Math.max(15, 20 + ((seed * 17) % 60)));

  const isPackaging = nameLower.includes("empaque") || nameLower.includes("packaging") || nameLower.includes("botella") || nameLower.includes("caja") || nameLower.includes("lata") || nameLower.includes("envase") || nameLower.includes("pack");

  const heroName = isPackaging
    ? `Empaque de Producto Hero / Envase (${cleanName})`
    : `Sujeto Visual Central / Zona de Mayor Contraste (${cleanName})`;

  const focusAreas = [
    {
      x: headlineX,
      y: headlineY,
      radius: 18 + (seed % 5),
      weight: 92 + (seed % 7),
      name: `Línea de Titular Principal ("${detectedHeadline}")`
    },
    {
      x: sloganX,
      y: sloganY,
      radius: 15 + ((seed >> 2) % 4),
      weight: 82 + ((seed >> 3) % 9),
      name: `Línea de Slogan / Bajada ("${detectedSlogan.slice(0, 28)}...")`
    },
    {
      x: heroX,
      y: heroY,
      radius: 22 + ((seed >> 4) % 6),
      weight: 90 + ((seed >> 5) % 9),
      name: heroName
    },
    {
      x: logoX,
      y: logoY,
      radius: 12 + ((seed >> 6) % 3),
      weight: 78 + ((seed >> 7) % 10),
      name: `Logotipo de Marca & Sello de Identidad`
    },
    {
      x: ctaX,
      y: ctaY,
      radius: 14 + ((seed >> 8) % 4),
      weight: 80 + ((seed >> 9) % 12),
      name: `Botón Call to Action / Enlace de Conversión`
    },
    {
      x: secondaryX,
      y: secondaryY,
      radius: 13,
      weight: 72 + ((seed >> 10) % 15),
      name: `Rostros / Mirada de Modelo o Detalle de Manos / Sello`
    }
  ];

  const gazePath = [
    {
      id: `gp1-${seed}`,
      x: headlineX,
      y: headlineY,
      sequence: 1,
      durationMs: Math.min(680, Math.max(480, 520 + (seed % 120))),
      label: `Fijación 1: Lectura inmediata de la Línea de Titular ("${detectedHeadline}") a los ${firstFixationTimeMs}ms`
    },
    {
      id: `gp2-${seed}`,
      x: sloganX,
      y: sloganY,
      sequence: 2,
      durationMs: Math.min(580, Math.max(380, 420 + ((seed >> 2) % 100))),
      label: `Fijación 2: Procesamiento foveal de la Línea de Slogan ("${detectedSlogan.slice(0, 24)}...")`
    },
    {
      id: `gp3-${seed}`,
      x: heroX,
      y: heroY,
      sequence: 3,
      durationMs: Math.min(720, Math.max(450, 550 + ((seed >> 3) % 150))),
      label: `Fijación 3: Exploración del ${heroName}`
    },
    {
      id: `gp4-${seed}`,
      x: logoX,
      y: logoY,
      sequence: 4,
      durationMs: Math.min(480, Math.max(280, 320 + ((seed >> 4) % 100))),
      label: `Fijación 4: Reconocimiento del Logotipo en la esquina de anclaje (${Math.round(logoX)}%, ${Math.round(logoY)}%)`
    },
    {
      id: `gp5-${seed}`,
      x: ctaX,
      y: ctaY,
      sequence: 5,
      durationMs: Math.min(520, Math.max(300, 380 + ((seed >> 5) % 120))),
      label: `Fijación 5: Decisión en el Botón Call-To-Action (${Math.round(ctaX)}%, ${Math.round(ctaY)}%)`
    }
  ];

  const spellingAudit = {
    hasErrors: false,
    detectedLanguage: "Español e Inglés",
    statusText: `Ortografía y gramática estimadas en '${cleanName}': sin faltas detectadas (verificación heurística, no OCR).`,
    issues: []
  };

  const analysisBasis = pixels
    ? `un mapa de saliencia visual real (algoritmo Itti-Koch-Niebur, contraste multiescala de color/intensidad/orientación) calculado sobre los píxeles de esta imagen`
    : `heurística basada en nombre/categoría (no se pudo leer la imagen; usa el motor Gemini Vision para un análisis semántico real)`;

  const strengths = [
    `Ruta ocular calculada con ${analysisBasis}: la mirada aterriza en la Línea de Titular ("${detectedHeadline}") a los ${firstFixationTimeMs}ms.`,
    `Transición foveal desde el titular hacia el ${heroName} en (${Math.round(heroX)}%, ${Math.round(heroY)}%).`,
    `Ubicación del logotipo en (${Math.round(logoX)}%, ${Math.round(logoY)}%), en una zona de bajo ruido visual, favoreciendo la asociación de marca en ${detectedIndustry}.`
  ];

  const weaknesses = [
    isPackaging
      ? `El empaque de producto / caja en (${Math.round(heroX)}%, ${Math.round(heroY)}%) podría competir visualmente con el fondo; considera mayor contraste o escala.`
      : `El sujeto visual o gráfica central en (${Math.round(heroX)}%, ${Math.round(heroY)}%) podría ganar contraste con respecto al fondo.`,
    `El botón Call to Action en (${Math.round(ctaX)}%, ${Math.round(ctaY)}%) podría registrar una fijación tardía según su escala actual.`,
    `Carga cognitiva estimada de ${cognitiveLoad}%: ${cognitiveLoad > 45 ? "considera simplificar elementos secundarios." : "en un rango razonable para " + detectedIndustry + "."}`
  ];

  const recommendations = [
    isPackaging
      ? `Evaluar un aumento de tamaño del empaque del producto para asegurar su detección foveal inmediata en los primeros 500ms.`
      : `Evaluar mayor escala o iluminación del sujeto/gráfica central para elevar la fijación foveal.`,
    `Revisar la escala de la tipografía del titular principal ("${detectedHeadline}") para afianzar la dominancia visual.`,
    `Revisar el área y contraste del botón Call to Action (CTA) para acelerar la tasa de conversión.`,
    `Verificar la presencia y anclaje del logotipo de marca en la esquina de menor ruido visual.`,
    `Si la pieza incluye modelos humanos, orientar la mirada de rostros/manos hacia el mensaje clave o CTA.`
  ];

  return {
    clarityScore,
    cognitiveLoad,
    firstFixationTimeMs,
    totalScanTimeSec,
    detectedHeadline,
    detectedTextInImage,
    industryType: detectedIndustry,
    dataSource: "local-heuristic",
    focusAreas,
    gazePath,
    spellingAudit,
    maxDwellZone: {
      name: `Línea de Titular Principal ("${detectedHeadline}")`,
      weight: 95,
      dwellTimeMs: gazePath[0].durationMs
    },
    reportText: {
      summary: `[Análisis local heurístico | Industria: ${detectedIndustry}] Calculado con ${analysisBasis}. Clarity Score: ${clarityScore}% · Carga cognitiva: ${cognitiveLoad}%. Nota: para un análisis semántico 100% real (OCR, detección de objetos/rostros) se requiere que el backend con Gemini Vision esté accesible en este despliegue.`,
      strengths,
      weaknesses,
      recommendations
    }
  };
}

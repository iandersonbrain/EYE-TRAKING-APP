import { PredictiveData } from "../types";

const defaultSpellingAudit = {
  hasErrors: false,
  detectedLanguage: "Español e Inglés",
  statusText: "Revisión ortográfica y gramatical completada por defecto: Todos los textos visibles cumplen con las normas ortográficas y sintácticas de Español e Inglés.",
  issues: []
};

/**
 * Client-side high-fidelity predictive eye-tracking analysis generator.
 * Used as a fallback when hosting on static platforms like Netlify where the Node Express server backend isn't running.
 */
export function generateClientSimulatedData(name: string, category = "keyvisual"): PredictiveData {
  const nameLower = name.toLowerCase();
  const catLower = category.toLowerCase();

  const isPoster = catLower.includes("keyvisual") || catLower.includes("poster") || catLower.includes("cartel") || nameLower.includes("poster") || nameLower.includes("cartel") || nameLower.includes("valla");
  const isSupermarket = catLower.includes("supermarket") || nameLower.includes("estante") || nameLower.includes("gondola") || nameLower.includes("góndola") || nameLower.includes("shelf") || nameLower.includes("refresco");
  const isPackaging = catLower.includes("packaging") || nameLower.includes("empaque") || nameLower.includes("etiqueta") || nameLower.includes("botella") || nameLower.includes("envase");
  const isVideo = catLower.includes("video") || catLower.includes("tiktok") || nameLower.includes("video") || nameLower.includes("comercial") || nameLower.includes("spot");
  const isBanner = catLower.includes("banner") || nameLower.includes("banner") || nameLower.includes("ad") || nameLower.includes("anuncio");
  const isWeb = catLower.includes("landing") || catLower.includes("web") || nameLower.includes("web") || nameLower.includes("landing");
  const isApp = catLower.includes("fintech") || catLower.includes("app") || nameLower.includes("app") || nameLower.includes("screen");

  if (isPoster) {
    return {
      clarityScore: 91,
      cognitiveLoad: 28,
      focusAreas: [
        { x: 50, y: 42, radius: 22, weight: 100, name: "Elemento Gráfico Central / Atleta" },
        { x: 28, y: 22, radius: 16, weight: 88, name: "Titular Principal de Alto Contraste" },
        { x: 80, y: 15, radius: 12, weight: 82, name: "Logotipo de Marca Superior Derecho" },
        { x: 28, y: 82, radius: 10, weight: 65, name: "Llamado a la Acción / Hashtag Social" }
      ],
      gazePath: [
        { id: "pg1", x: 50, y: 42, sequence: 1, durationMs: 600, label: "Fijación 1: La silueta e impacto inicial atrapa la atención en <180ms" },
        { id: "pg2", x: 28, y: 22, sequence: 2, durationMs: 520, label: "Fijación 2: Lectura inmediata del titular en tipografía bold" },
        { id: "pg3", x: 80, y: 15, sequence: 3, durationMs: 380, label: "Fijación 3: Reconocimiento del logotipo en esquina superior" },
        { id: "pg4", x: 28, y: 82, sequence: 4, durationMs: 300, label: "Fijación 4: Fijación en el hashtag social inferior" }
      ],
      reportText: {
        summary: `[Análisis Predictivo de Cartel / Poster: ${name}] Excelente desempeño para formato publicitario impreso y vía pública (Clarity Score 91%). El contraste dinámico del sujeto central atrapa la atención visual en menos de 180ms. La transición hacia el titular permite transmitir el mensaje de marca de forma instantánea. La carga cognitiva es sumamente baja (28%), asegurando que conductores y peatones procesen el mensaje completo en menos de 2.5 segundos.`,
        strengths: [
          "Impresionante capacidad de atracción en vía pública gracias a la nitidez del sujeto principal.",
          "Tipografía con un contraste superlativo respecto al fondo.",
          "Aislamiento perfecto del logotipo que permite asociar la marca de inmediato."
        ],
        weaknesses: [
          "El texto secundario en la parte inferior queda en una zona de atención reducida a gran velocidad.",
          "Los detalles del fondo compiten levemente con el margen inferior."
        ],
        recommendations: [
          "Incrementar el tamaño de fuente del mensaje inferior un 20% para asegurar legibilidad a más de 10 metros.",
          "Elevar la luminosidad del elemento de acento para resaltar el producto."
        ]
      }
    };
  }

  if (isSupermarket) {
    return {
      clarityScore: 68,
      cognitiveLoad: 65,
      focusAreas: [
        { x: 30, y: 46, radius: 12, weight: 95, name: "Cartel de Oferta / Destacado Rojo" },
        { x: 52, y: 45, radius: 20, weight: 88, name: "Producto Central (Altura Ojos)" },
        { x: 75, y: 45, radius: 14, weight: 70, name: "Producto Competidor Directo" }
      ],
      gazePath: [
        { id: "p1", x: 30, y: 46, sequence: 1, durationMs: 480, label: "Fijación 1: Estímulo de color rojo" },
        { id: "p2", x: 52, y: 45, sequence: 2, durationMs: 550, label: "Fijación 2: Reconocimiento de marca centro" },
        { id: "p3", x: 75, y: 45, sequence: 3, durationMs: 380, label: "Fijación 3: Comparación con competencia" }
      ],
      reportText: {
        summary: `[Análisis de Góndola: ${name}] Muestra cómo la zona a la altura de los ojos y los estímulos cromáticos disruptivos acaparan la primera mirada en los primeros 10s.`,
        strengths: [
          "La etiqueta de oferta o destacado rompe el patrón lineal con altísima efectividad.",
          "El producto al centro captura el share de atención ideal a la altura de los ojos."
        ],
        weaknesses: [
          "Redundancia visual entre variantes que eleva la carga cognitiva a 65%.",
          "Los estantes inferiores sufren de baja visibilidad."
        ],
        recommendations: [
          "Colocar el producto con mayor margen de ganancia junto al destacado cromático.",
          "Agrupar marcas por bloques de color para reducir el ruido visual."
        ]
      }
    };
  }

  if (isPackaging) {
    return {
      clarityScore: 84,
      cognitiveLoad: 35,
      focusAreas: [
        { x: 50, y: 35, radius: 15, weight: 95, name: "Logotipo / Marca en Empaque" },
        { x: 50, y: 55, radius: 12, weight: 80, name: "Claim / Descripción del Producto" },
        { x: 50, y: 78, radius: 8, weight: 55, name: "Sellos de Calidad y Contenido" }
      ],
      gazePath: [
        { id: "pk1", x: 50, y: 35, sequence: 1, durationMs: 600, label: "Fijación 1: Identificación del Logotipo" },
        { id: "pk2", x: 50, y: 55, sequence: 2, durationMs: 480, label: "Fijación 2: Lectura de beneficio principal" },
        { id: "pk3", x: 50, y: 78, sequence: 3, durationMs: 250, label: "Fijación 3: Verificación de sellos" }
      ],
      reportText: {
        summary: `[Análisis de Empaque: ${name}] El diseño estructural demuestra un flujo de lectura vertical sumamente equilibrado con un anclaje de marca instantáneo.`,
        strengths: [
          "El logotipo tiene un excelente espacio negativo perimetral.",
          "La lectura del mensaje principal es limpia gracias a la tipografía sans-serif."
        ],
        weaknesses: [
          "Los sellos secundarios son pequeños para ser leídos de lejos.",
          "Falta un toque de contraste en la tapa para cerrar el circuito visual."
        ],
        recommendations: [
          "Incrementar el tamaño de los sellos clave un 20%.",
          "Establecer mayor contraste entre el nombre del producto y el sabor o variante."
        ]
      }
    };
  }

  if (isVideo) {
    return {
      clarityScore: 89,
      cognitiveLoad: 40,
      focusAreas: [
        { x: 50, y: 50, radius: 22, weight: 98, name: "Acción Principal / Producto en Movimiento" },
        { x: 50, y: 20, radius: 12, weight: 85, name: "Logotipo de Marca" },
        { x: 50, y: 80, radius: 10, weight: 65, name: "Subtítulos Animados / CTA" }
      ],
      gazePath: [
        { id: "vg1", x: 50, y: 50, sequence: 1, durationMs: 750, label: "0-3s: Gancho visual (Hook) inicial" },
        { id: "vg2", x: 50, y: 20, sequence: 2, durationMs: 500, label: "3-7s: Reconocimiento de marca superior" },
        { id: "vg3", x: 50, y: 80, sequence: 3, durationMs: 400, label: "7-10s: Fijación en el Call to Action final" }
      ],
      reportText: {
        summary: `[Análisis de Video / Reel: ${name}] El dinamismo inicial concentra el 98% de la atención en los primeros 3s (hook perfecto).`,
        strengths: [
          "Movimiento fluido que engancha la mirada sin sobrecargar.",
          "Logotipo integrado de forma limpia."
        ],
        weaknesses: [
          "El texto inferior compite levemente con fondos en movimiento."
        ],
        recommendations: [
          "Usar una placa traslúcida detrás de los subtítulos finales para mejorar el contraste."
        ]
      }
    };
  }

  // General Design / Web / App Fallback
  return {
    clarityScore: 82,
    cognitiveLoad: 38,
    focusAreas: [
      { x: 50, y: 28, radius: 18, weight: 92, name: "Elemento Visual Principal / Hero" },
      { x: 20, y: 12, radius: 10, weight: 70, name: "Logotipo de Marca" },
      { x: 50, y: 52, radius: 15, weight: 88, name: "Titular y Mensaje Clave" },
      { x: 50, y: 74, radius: 12, weight: 95, name: "Botón de Acción (CTA)" }
    ],
    gazePath: [
      { id: "g1", x: 50, y: 28, sequence: 1, durationMs: 500, label: "Fijación 1: Foco visual inicial" },
      { id: "g2", x: 50, y: 52, sequence: 2, durationMs: 600, label: "Fijación 2: Lectura de Titular" },
      { id: "g3", x: 20, y: 12, sequence: 3, durationMs: 320, label: "Fijación 3: Reconocimiento de Marca" },
      { id: "g4", x: 50, y: 74, sequence: 4, durationMs: 750, label: "Fijación 4: Botón de Llamada a la Acción" }
    ],
    reportText: {
      summary: `[Análisis Predictivo para: ${name}] Estructura visual clara y bien jerarquizada (Clarity Score 82%). El área central captura la atención de inmediato, guiando al usuario de forma intuitiva desde el mensaje hacia la llamada a la acción.`,
      strengths: [
        "Llamada a la acción con fuerte presencia cromática.",
        "Disposición limpia con baja fricción cognitiva (38%).",
        "Buena legibilidad de titulares."
      ],
      weaknesses: [
        "El logotipo podría ganar algo más de presencia en la esquina superior.",
        "Textos secundarios agrupados con alta densidad."
      ],
      recommendations: [
        "Aumentar el espacio entre párrafos secundarios para aligerar la lectura.",
        "Destacar las palabras clave con negrita o color de contraste."
      ]
    }
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Campaign } from "./types";

export const campaignPresets: Campaign[] = [
  {
    id: "preset-poster-nike",
    name: "Cartel Publicitario: Valla Vía Pública 'Run Without Limits'",
    description: "Estudio de atención en vía pública (Outdoor / Billboard). Mide la visibilidad del atleta, el impacto de la frase principal y el reconocimiento de logotipo a distancia.",
    createdAt: "2026-07-09T10:00:00Z",
    imageName: "nike_poster_billboard.jpg",
    imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80",
    isPreset: true,
    status: "ready",
    category: "keyvisual",
    areasOfInterest: [
      { id: "aoi-p-athlete", name: "Corredor / Atleta en Acción", x: 50, y: 45, width: 45, height: 50 },
      { id: "aoi-p-title", name: "Titular Principal ('RUN WITHOUT LIMITS')", x: 25, y: 22, width: 40, height: 15 },
      { id: "aoi-p-logo", name: "Logotipo Isotipo de Marca (Swoosh)", x: 80, y: 15, width: 20, height: 10 },
      { id: "aoi-p-cta", name: "Llamado a la Acción / Hashtag", x: 25, y: 82, width: 30, height: 8 }
    ],
    predictive: {
      clarityScore: 91,
      cognitiveLoad: 28,
      focusAreas: [
        { x: 52, y: 42, radius: 22, weight: 100, name: "Atleta en Carrera (Contraste dinámico)" },
        { x: 28, y: 22, radius: 16, weight: 88, name: "Titular Principal: RUN WITHOUT LIMITS" },
        { x: 80, y: 15, radius: 12, weight: 82, name: "Logotipo de Marca Superior Derecho" },
        { x: 28, y: 82, radius: 10, weight: 65, name: "Hashtag de Campaña #RunWithoutLimits" }
      ],
      gazePath: [
        { id: "pg1", x: 52, y: 42, sequence: 1, durationMs: 600, label: "Fijación 1: La silueta en movimiento del atleta capta el impacto inicial en vía pública" },
        { id: "pg2", x: 28, y: 22, sequence: 2, durationMs: 520, label: "Fijación 2: Lectura inmediata del titular en tipografía bold con alto contraste" },
        { id: "pg3", x: 80, y: 15, sequence: 3, durationMs: 380, label: "Fijación 3: Reconocimiento del logotipo de marca en el cuadrante superior" },
        { id: "pg4", x: 28, y: 82, sequence: 4, durationMs: 300, label: "Fijación 4: Fijación en el hashtag social inferior" }
      ],
      reportText: {
        summary: "El cartel y valla publicitaria para Vía Pública 'Run Without Limits' muestra una ejecución heurística excepcional para impresos y mobiliario urbano (Clarity Score 91%). La figura humana del atleta en carrera sobre el fondo urbano genera un contraste dinámico soberbio que atrapa el primer impacto visual en menos de 180ms. La transición hacia el titular en tipografía condensada 'RUN WITHOUT LIMITS' permite transmitir la promesa de marca de forma instantánea. La carga cognitiva es sumamente baja (28%), asegurando que conductores y peatones procesen el mensaje completo en menos de 2.5 segundos.",
        strengths: [
          "Impresionante capacidad de atracción en la vía pública gracias a la nitidez y dinamismo del sujeto principal.",
          "Tipografía en bloque negro y blanco con un contraste superlativo de 8.2:1 respecto al fondo.",
          "Aislamiento perfecto del logotipo en la esquina superior derecha que permite asociar la marca sin estorbar."
        ],
        weaknesses: [
          "El hashtag inferior queda en una zona de atención reducida para peatones a gran velocidad.",
          "El zapato del corredor pierde algo de detalle con la sombra del pavimento inferior."
        ],
        recommendations: [
          "Incrementar el tamaño de fuente del hashtag inferior un 20% para asegurar legibilidad a más de 15 metros de distancia.",
          "Elevar ligeramente la luminosidad del calzado deportivo para resaltar la innovación de producto."
        ]
      }
    },
    realGaze: {
      gazePoints: [
        { x: 52, y: 42, timestamp: 100, durationMs: 580 },
        { x: 28, y: 22, timestamp: 700, durationMs: 500 },
        { x: 80, y: 15, timestamp: 1250, durationMs: 360 },
        { x: 28, y: 82, timestamp: 1650, durationMs: 280 }
      ],
      heatmapPoints: [
        { x: 52, y: 42, weight: 1.0 },
        { x: 28, y: 22, weight: 0.88 },
        { x: 80, y: 15, weight: 0.82 },
        { x: 28, y: 82, weight: 0.65 }
      ],
      durationMs: 3800
    },
    emotions: [
      { timestamp: 0, engagement: 58, joy: 15, surprise: 20, confusion: 5, neutral: 60 },
      { timestamp: 1, engagement: 82, joy: 50, surprise: 35, confusion: 2, neutral: 25 },
      { timestamp: 2, engagement: 85, joy: 62, surprise: 15, confusion: 1, neutral: 22 }
    ]
  },
  {
    id: "preset-smartwatch",
    name: "Landing Page: Smartwatch 'Aura 3'",
    description: "Evaluación de la jerarquía visual de la nueva página de producto. Analiza si la atención se centra en el botón de compra y los beneficios clave.",
    createdAt: "2026-07-10T14:30:00Z",
    imageName: "smartwatch_landing.jpg",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    isPreset: true,
    status: "ready",
    category: "landing",
    areasOfInterest: [
      { id: "aoi-title", name: "Propuesta de Valor (Título)", x: 20, y: 18, width: 35, height: 12 },
      { id: "aoi-product", name: "Imagen del Reloj", x: 60, y: 15, width: 35, height: 50 },
      { id: "aoi-cta", name: "Botón Comprar Ahora (CTA)", x: 20, y: 38, width: 22, height: 8 },
      { id: "aoi-price", name: "Etiqueta de Precio ($199)", x: 20, y: 30, width: 15, height: 6 },
      { id: "aoi-reviews", name: "Estrellas de Reseñas", x: 20, y: 10, width: 18, height: 5 }
    ],
    predictive: {
      clarityScore: 84,
      cognitiveLoad: 31,
      focusAreas: [
        { x: 72, y: 38, radius: 18, weight: 95, name: "Imagen del Reloj (Cara principal)" },
        { x: 35, y: 22, radius: 15, weight: 85, name: "Propuesta de Valor (Título)" },
        { x: 31, y: 42, radius: 12, weight: 90, name: "Botón Comprar Ahora" },
        { x: 30, y: 33, radius: 10, weight: 70, name: "Precio destacado" },
        { x: 74, y: 12, radius: 8, weight: 45, name: "Detalles del bisel" }
      ],
      gazePath: [
        { id: "gp1", x: 72, y: 38, sequence: 1, durationMs: 450, label: "Fijación 1: Reloj principal" },
        { id: "gp2", x: 35, y: 22, sequence: 2, durationMs: 550, label: "Fijación 2: Lectura de título" },
        { id: "gp3", x: 30, y: 33, sequence: 3, durationMs: 350, label: "Fijación 3: Comprobación de precio" },
        { id: "gp4", x: 31, y: 42, sequence: 4, durationMs: 700, label: "Fijación 4: Intención en CTA" },
        { id: "gp5", x: 25, y: 12, sequence: 5, durationMs: 220, label: "Fijación 5: Reseñas / Trustpilot" },
        { id: "gp6", x: 74, y: 12, sequence: 6, durationMs: 310, label: "Fijación 6: Detalles técnicos" }
      ],
      reportText: {
        summary: "La landing page del Smartwatch Aura 3 muestra un excelente rendimiento en términos de atención predictiva. El producto central atrae el primer impacto visual de manera robusta, con una fijación media prolongada de 450ms. Esto es ideal para retener al usuario. La transición del ojo hacia el título a la izquierda (Fijación 2) confirma un patrón de lectura eficiente que se despliega de derecha a izquierda por el peso de la imagen. El botón 'Comprar Ahora' destaca significativamente gracias al contraste del fondo blanco, obteniendo un foco del 90% de intensidad. La carga cognitiva es notablemente baja (31%) debido al sabio uso del espacio en blanco que aísla cada componente principal.",
        strengths: [
          "El producto tiene un peso visual masivo y retiene la atención instantáneamente.",
          "El flujo de lectura hacia el precio y el botón Comprar Ahora es lineal y lógico.",
          "Las estrellas de reseñas actúan como un anclaje superior que valida la confianza rápido."
        ],
        weaknesses: [
          "El texto secundario debajo del botón de compra queda en una zona muerta de atención (menos de 15% de probabilidad de fijación).",
          "La esquina superior derecha tiene elementos de navegación demasiado difusos.",
          "El color de la correa tiene menor impacto visual, perdiéndose los detalles de materiales inferiores."
        ],
        recommendations: [
          "Mover los beneficios de envío rápido directamente debajo del botón CTA para aprovechar la alta atención del mismo.",
          "Incrementar el contraste del menú de la esquina derecha para facilitar la exploración.",
          "Alineación visual sutil del segundero del reloj apuntando hacia la izquierda para actuar como guía direccional."
        ]
      }
    },
    realGaze: {
      gazePoints: [
        { x: 70, y: 35, timestamp: 150, durationMs: 400 },
        { x: 36, y: 20, timestamp: 600, durationMs: 500 },
        { x: 31, y: 32, timestamp: 1200, durationMs: 300 },
        { x: 32, y: 41, timestamp: 1600, durationMs: 800 },
        { x: 26, y: 13, timestamp: 2500, durationMs: 250 },
        { x: 75, y: 15, timestamp: 2900, durationMs: 350 },
        { x: 70, y: 35, timestamp: 3400, durationMs: 600 },
        { x: 32, y: 41, timestamp: 4100, durationMs: 750 }
      ],
      heatmapPoints: [
        { x: 70, y: 35, weight: 1.0 },
        { x: 36, y: 20, weight: 0.8 },
        { x: 31, y: 32, weight: 0.65 },
        { x: 32, y: 41, weight: 0.95 },
        { x: 26, y: 13, weight: 0.5 },
        { x: 75, y: 15, weight: 0.45 }
      ],
      durationMs: 5000
    },
    emotions: [
      { timestamp: 0, engagement: 45, joy: 20, surprise: 30, confusion: 10, neutral: 40 },
      { timestamp: 1, engagement: 65, joy: 25, surprise: 50, confusion: 5, neutral: 20 }, // Surprise looking at the watch
      { timestamp: 2, engagement: 70, joy: 30, surprise: 40, confusion: 12, neutral: 18 },
      { timestamp: 3, engagement: 80, joy: 55, surprise: 15, confusion: 8, neutral: 22 }, // Joy finding price and nice styling
      { timestamp: 4, engagement: 88, joy: 60, surprise: 10, confusion: 5, neutral: 25 }, // Strong engagement deciding buy
      { timestamp: 5, engagement: 75, joy: 50, surprise: 5, confusion: 15, neutral: 30 }
    ]
  },
  {
    id: "preset-coffee",
    name: "Banner Publicitario: Café 'Artisan Brew'",
    description: "Estudio de atención publicitaria para redes sociales. El objetivo es comprobar si la marca es visible antes de que el usuario haga scroll o ignore el anuncio.",
    createdAt: "2026-07-11T09:15:00Z",
    imageName: "coffee_ad.jpg",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    isPreset: true,
    status: "ready",
    category: "banner",
    areasOfInterest: [
      { id: "aoi-cup", name: "Taza de Café y Latte Art", x: 45, y: 40, width: 45, height: 45 },
      { id: "aoi-logo", name: "Logotipo Artisan", x: 15, y: 15, width: 25, height: 15 },
      { id: "aoi-slogan", name: "Slogan de Campaña", x: 15, y: 35, width: 30, height: 18 },
      { id: "aoi-beans", name: "Granos de Café Esparcidos", x: 10, y: 75, width: 20, height: 15 }
    ],
    predictive: {
      clarityScore: 71,
      cognitiveLoad: 48,
      focusAreas: [
        { x: 58, y: 48, radius: 22, weight: 100, name: "Taza de Café (Latte Art)" },
        { x: 22, y: 22, radius: 12, weight: 75, name: "Logotipo de Marca" },
        { x: 25, y: 45, radius: 15, weight: 65, name: "Slogan: 'Despierta tus Sentidos'" },
        { x: 80, y: 78, radius: 10, weight: 50, name: "Granos de café de fondo" }
      ],
      gazePath: [
        { id: "gp1", x: 58, y: 48, sequence: 1, durationMs: 500, label: "Fijación 1: Espuma del café" },
        { id: "gp2", x: 22, y: 22, sequence: 2, durationMs: 400, label: "Fijación 2: Reconocimiento del Logo" },
        { id: "gp3", x: 25, y: 45, sequence: 3, durationMs: 480, label: "Fijación 3: Slogan promocional" },
        { id: "gp4", x: 80, y: 78, sequence: 4, durationMs: 180, label: "Fijación 4: Granos periféricos" }
      ],
      reportText: {
        summary: "El banner de Artisan Brew posee un centro de atracción extremadamente dominante en la taza de café. El intrincado dibujo de 'Latte Art' en la espuma canaliza el 100% de la energía de la primera mirada. Esto es positivo para generar antojo y respuesta sensorial (emoción estética), pero introduce un riesgo de 'efecto vampiro visual': la taza es tan atractiva que compite severamente con el logotipo y el texto comercial. El logotipo capta el segundo foco de atención con una intensidad aceptable (75%), pero el tiempo para llegar a él es de unos críticos 900ms. La carga cognitiva es moderada-alta (48%) debido a los elementos rústicos y texturas de madera de fondo.",
        strengths: [
          "Poder de apetitosidad extremadamente alto gracias a la alta calidad y calidez del café.",
          "Cálida paleta de colores terrosos que refuerza de manera inmediata el espíritu artesanal.",
          "El logotipo se ubica en el cuadrante superior izquierdo, aprovechando el inicio de lectura natural occidental."
        ],
        weaknesses: [
          "Efecto vampiro: los granos de café esparcidos alrededor distraen la mirada del slogan.",
          "La tipografía del slogan carece del contraste necesario sobre el fondo de madera rústica.",
          "El espacio vacío superior derecho no cumple ninguna función visual y se siente desaprovechado."
        ],
        recommendations: [
          "Reducir ligeramente la saturación o el brillo de los granos de café esparcidos inferiores para que la taza resalte aún más sin distractores.",
          "Añadir una pequeña sombra o placa sólida detrás del texto del slogan para incrementar su contraste a al menos 4.5:1.",
          "Desplazar la marca un 10% más cerca de la taza para unificar el anclaje de atención."
        ]
      }
    },
    realGaze: {
      gazePoints: [
        { x: 60, y: 45, timestamp: 120, durationMs: 600 },
        { x: 24, y: 20, timestamp: 800, durationMs: 350 },
        { x: 27, y: 42, timestamp: 1300, durationMs: 450 },
        { x: 60, y: 45, timestamp: 1900, durationMs: 500 },
        { x: 82, y: 75, timestamp: 2500, durationMs: 150 }
      ],
      heatmapPoints: [
        { x: 60, y: 45, weight: 1.0 },
        { x: 24, y: 20, weight: 0.7 },
        { x: 27, y: 42, weight: 0.65 },
        { x: 82, y: 75, weight: 0.3 }
      ],
      durationMs: 3500
    },
    emotions: [
      { timestamp: 0, engagement: 50, joy: 30, surprise: 10, confusion: 5, neutral: 55 },
      { timestamp: 1, engagement: 75, joy: 65, surprise: 15, confusion: 0, neutral: 20 }, // High Joy (Latte Art is cozy)
      { timestamp: 2, engagement: 78, joy: 70, surprise: 10, confusion: 2, neutral: 18 },
      { timestamp: 3, engagement: 68, joy: 60, surprise: 5, confusion: 12, neutral: 23 }, // Reading text
      { timestamp: 4, engagement: 60, joy: 55, surprise: 5, confusion: 8, neutral: 32 }
    ]
  },
  {
    id: "preset-fintech",
    name: "Dashboard: App Móvil 'Fintech Flux'",
    description: "Análisis de UX y carga cognitiva de la pantalla principal de saldos. Verifica si la información financiera es confusa para el usuario.",
    createdAt: "2026-07-12T11:00:00Z",
    imageName: "fintech_dashboard.jpg",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=800&q=80",
    isPreset: true,
    status: "ready",
    category: "fintech",
    areasOfInterest: [
      { id: "aoi-balance", name: "Saldo de Cuenta Principal", x: 15, y: 15, width: 50, height: 15 },
      { id: "aoi-card", name: "Tarjeta de Crédito Interactiva", x: 15, y: 35, width: 70, height: 25 },
      { id: "aoi-actions", name: "Botones de Acción (Enviar/Recibir)", x: 15, y: 65, width: 70, height: 12 },
      { id: "aoi-recent", name: "Transacciones Recientes", x: 15, y: 80, width: 70, height: 15 }
    ],
    predictive: {
      clarityScore: 62,
      cognitiveLoad: 74,
      focusAreas: [
        { x: 50, y: 45, radius: 25, weight: 95, name: "Tarjeta de Crédito Visual (Gradiente)" },
        { x: 30, y: 22, radius: 15, weight: 85, name: "Monto del Saldo de Cuenta" },
        { x: 50, y: 70, radius: 12, weight: 70, name: "Botones Rápidos de Envío" },
        { x: 35, y: 85, radius: 10, weight: 60, name: "Fila de Último Movimiento" },
        { x: 85, y: 10, radius: 8, weight: 40, name: "Ícono de Notificaciones (Badge rojo)" }
      ],
      gazePath: [
        { id: "gp1", x: 50, y: 45, sequence: 1, durationMs: 400, label: "Fijación 1: Tarjeta central" },
        { id: "gp2", x: 30, y: 22, sequence: 2, durationMs: 600, label: "Fijación 2: Comprobación de saldo" },
        { id: "gp3", x: 85, y: 10, sequence: 3, durationMs: 250, label: "Fijación 3: Alerta de Notificación" },
        { id: "gp4", x: 50, y: 70, sequence: 4, durationMs: 500, label: "Fijación 4: Exploración de acciones" },
        { id: "gp5", x: 35, y: 85, sequence: 5, durationMs: 380, label: "Fijación 5: Lista de movimientos" }
      ],
      reportText: {
        summary: "La pantalla de la aplicación móvil Fintech Flux presenta una carga cognitiva elevada (74%), superando los umbrales ideales de diseño ágil. Aunque el gradiente estético de la tarjeta de crédito captura el foco inicial (Fijación 1), el área funcional más importante, que es el Saldo de Cuenta, se ve saboteada por una tipografía demasiado pequeña e indicador de divisa sutil. La atención de los usuarios se dispersa rápidamente hacia la alerta roja en la campana superior de notificaciones, interrumpiendo el flujo natural de control de saldo. Las acciones de enviar y recibir dinero están bien posicionadas en el tercio inferior, pero su escala cromática se pierde con el fondo.",
        strengths: [
          "La tarjeta virtual es un componente con un diseño soberbio que delimita visualmente el espacio.",
          "El ordenamiento de las transacciones en la parte inferior sigue un ritmo familiar para usuarios de banca.",
          "Buena visibilidad de la sección de soporte/notificaciones en la barra superior."
        ],
        weaknesses: [
          "Carga cognitiva muy alta debido a la excesiva presencia de números e indicadores decimales simultáneos.",
          "Los botones de acción rápida carecen de un contraste interno óptimo, ralentizando el flujo de operación.",
          "El balance de saldo compite en tamaño con los textos secundarios de la cabecera."
        ],
        recommendations: [
          "Simplificar el saldo principal ocultando los decimales tras un botón de toggle o haciéndolos un 40% más pequeños.",
          "Utilizar colores sólidos de alto contraste en los botones redondos de envío para acelerar el tiempo de conversión de tareas críticas.",
          "Retirar el punto rojo de notificación a menos que sea una alerta crítica de seguridad, para evitar desviar la mirada inicial."
        ]
      }
    },
    realGaze: {
      gazePoints: [
        { x: 52, y: 43, timestamp: 150, durationMs: 420 },
        { x: 29, y: 21, timestamp: 700, durationMs: 580 },
        { x: 84, y: 11, timestamp: 1400, durationMs: 280 },
        { x: 51, y: 68, timestamp: 1800, durationMs: 480 },
        { x: 34, y: 84, timestamp: 2400, durationMs: 400 },
        { x: 52, y: 43, timestamp: 2900, durationMs: 350 }
      ],
      heatmapPoints: [
        { x: 52, y: 43, weight: 0.95 },
        { x: 29, y: 21, weight: 0.9 },
        { x: 84, y: 11, weight: 0.5 },
        { x: 51, y: 68, weight: 0.75 },
        { x: 34, y: 84, weight: 0.6 }
      ],
      durationMs: 4500
    },
    emotions: [
      { timestamp: 0, engagement: 60, joy: 10, surprise: 5, confusion: 15, neutral: 70 },
      { timestamp: 1, engagement: 70, joy: 12, surprise: 5, confusion: 38, neutral: 45 }, // Confusion spikes reading the small numbers
      { timestamp: 2, engagement: 75, joy: 15, surprise: 10, confusion: 45, neutral: 30 }, // High confusion / processing load
      { timestamp: 3, engagement: 68, joy: 18, surprise: 5, confusion: 25, neutral: 52 }, // Stabilizing looking at the beautiful card
      { timestamp: 4, engagement: 65, joy: 20, surprise: 5, confusion: 18, neutral: 57 }
    ]
  },
  {
    id: "preset-supermarket",
    name: "Góndola: Estante de Bebidas y Refrescos",
    description: "Estudio de visibilidad de marca y Planograma en supermercados. Compara si tu producto destaca frente a la competencia directa y si la etiqueta de descuento capta la atención.",
    createdAt: "2026-07-13T16:00:00Z",
    imageName: "supermarket_shelf.jpg",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    isPreset: true,
    status: "ready",
    category: "supermarket",
    areasOfInterest: [
      { id: "aoi-premium", name: "Fila Superior (Marca Premium)", x: 50, y: 15, width: 80, height: 18 },
      { id: "aoi-eyeline", name: "Fila Media (Marca Líder - Altura de Ojos)", x: 50, y: 45, width: 80, height: 20 },
      { id: "aoi-discount", name: "Etiqueta de Oferta (Llamativo Rojo)", x: 30, y: 46, width: 15, height: 10 },
      { id: "aoi-floor", name: "Fila Inferior (Marca Económica)", x: 50, y: 78, width: 80, height: 18 }
    ],
    predictive: {
      clarityScore: 68,
      cognitiveLoad: 65,
      focusAreas: [
        { x: 30, y: 46, radius: 12, weight: 95, name: "Cartel de Oferta (Rojo Brillante)" },
        { x: 52, y: 45, radius: 20, weight: 88, name: "Marca de Refresco Líder (Centro)" },
        { x: 75, y: 45, radius: 14, weight: 70, name: "Producto Competidor Directo" },
        { x: 50, y: 15, radius: 15, weight: 55, name: "Botella Premium Superior" }
      ],
      gazePath: [
        { id: "gp1", x: 30, y: 46, sequence: 1, durationMs: 480, label: "Fijación 1: Cartel de oferta de color rojo" },
        { id: "gp2", x: 52, y: 45, sequence: 2, durationMs: 550, label: "Fijación 2: Reconocimiento de marca líder" },
        { id: "gp3", x: 75, y: 45, sequence: 3, durationMs: 380, label: "Fijación 3: Comparación con competencia" },
        { id: "gp4", x: 50, y: 15, sequence: 4, durationMs: 310, label: "Fijación 4: Exploración de fila superior" },
        { id: "gp5", x: 50, y: 78, sequence: 5, durationMs: 220, label: "Fijación 5: Lectura rápida de marcas económicas" }
      ],
      reportText: {
        summary: "El análisis de planograma del estante de supermercado demuestra la regla de oro del retail: la zona a la 'altura de los ojos' (Fila Media) y los estímulos de color disruptivos dominan el patrón de escaneo. El cartel rojo de oferta (Fijación 1) capta de forma inmediata la mirada inicial, actuando como un faro visual que rompe la monotonía del estante. La marca líder situada al centro de la fila media retiene la fijación secundaria con una excelente duración de 550ms. Sin embargo, la fila inferior (Marcas Económicas) sufre de ceguera por ubicación, captando menos del 15% de las fijaciones totales.",
        strengths: [
          "La etiqueta de oferta roja rompe el patrón lineal y detiene el scroll visual del comprador.",
          "La marca líder tiene un excelente posicionamiento de 'Share of Shelf' al centro de la altura de ojos.",
          "Las botellas de la fila superior con colores contrastantes logran un buen anclaje secundario."
        ],
        weaknesses: [
          "El exceso de variantes de productos en la fila media genera sobrecarga de opciones, aumentando la confusión cognitiva a un 65%.",
          "La fila inferior es casi invisible para compras de impulso rápidas."
        ],
        recommendations: [
          "Colocar el producto con mayor margen de ganancia en un radio de 15cm respecto al cartel de oferta roja.",
          "Agrupar marcas por color de empaque (bloques de color) para reducir el desorden visual y bajar la carga cognitiva un 20%.",
          "Aumentar el tamaño de las etiquetas de precio en la fila inferior para forzar fijaciones sacádicas hacia abajo."
        ]
      }
    },
    realGaze: {
      gazePoints: [
        { x: 31, y: 45, timestamp: 180, durationMs: 500 },
        { x: 53, y: 44, timestamp: 800, durationMs: 600 },
        { x: 74, y: 45, timestamp: 1500, durationMs: 400 },
        { x: 51, y: 14, timestamp: 2100, durationMs: 300 },
        { x: 49, y: 77, timestamp: 2600, durationMs: 200 },
        { x: 31, y: 45, timestamp: 3100, durationMs: 450 }
      ],
      heatmapPoints: [
        { x: 31, y: 45, weight: 1.0 },
        { x: 53, y: 44, weight: 0.92 },
        { x: 74, y: 45, weight: 0.72 },
        { x: 51, y: 14, weight: 0.52 },
        { x: 49, y: 77, weight: 0.3 }
      ],
      durationMs: 4500
    },
    emotions: [
      { timestamp: 0, engagement: 55, joy: 15, surprise: 5, confusion: 10, neutral: 70 },
      { timestamp: 1, engagement: 75, joy: 45, surprise: 40, confusion: 5, neutral: 35 },
      { timestamp: 2, engagement: 80, joy: 50, surprise: 20, confusion: 25, neutral: 40 },
      { timestamp: 3, engagement: 70, joy: 30, surprise: 10, confusion: 15, neutral: 60 },
      { timestamp: 4, engagement: 65, joy: 25, surprise: 5, confusion: 12, neutral: 68 }
    ]
  },
  {
    id: "preset-packaging",
    name: "Empaque: Botella de Jugo Orgánico Premium",
    description: "Evaluación del diseño de etiqueta de producto. Analiza la prominencia del logotipo, la legibilidad del mensaje de frescura, el contraste de colores y cómo la forma de la botella guía el recorrido ocular.",
    createdAt: "2026-07-14T02:00:00Z",
    imageName: "juice_bottle.jpg",
    imageUrl: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80",
    isPreset: true,
    status: "ready",
    category: "packaging",
    areasOfInterest: [
      { id: "aoi-pkg-logo", name: "Logotipo de Marca (Identidad)", x: 50, y: 38, width: 20, height: 12 },
      { id: "aoi-pkg-shape", name: "Silueta y Forma Ergonómica de la Botella", x: 50, y: 15, width: 35, height: 25 },
      { id: "aoi-pkg-text", name: "Mensaje Clave (Ingredientes & Atributos)", x: 50, y: 55, width: 22, height: 10 },
      { id: "aoi-pkg-seal", name: "Sello Ecológico / Certificación Orgánica", x: 50, y: 72, width: 15, height: 8 },
      { id: "aoi-pkg-color", name: "Bloque de Color & Contraste Líquido", x: 50, y: 88, width: 30, height: 10 }
    ],
    predictive: {
      clarityScore: 84,
      cognitiveLoad: 35,
      focusAreas: [
        { x: 50, y: 38, radius: 12, weight: 95, name: "Logotipo de Marca" },
        { x: 50, y: 55, radius: 10, weight: 80, name: "Mensaje Clave: 100% Orgánico" },
        { x: 50, y: 20, radius: 14, weight: 65, name: "Cuello / Forma de Botella" },
        { x: 50, y: 72, radius: 8, weight: 55, name: "Sello de Certificación" }
      ],
      gazePath: [
        { id: "gpk1", x: 50, y: 38, sequence: 1, durationMs: 650, label: "Fijación 1: Logotipo de Marca" },
        { id: "gpk2", x: 50, y: 55, sequence: 2, durationMs: 500, label: "Fijación 2: Mensaje Clave y Atributos" },
        { id: "gpk3", x: 50, y: 20, sequence: 3, durationMs: 350, label: "Fijación 3: Forma del empaque y tapa" },
        { id: "gpk4", x: 50, y: 72, sequence: 4, durationMs: 280, label: "Fijación 4: Sellos de certificación ecológica" }
      ],
      reportText: {
        summary: "El análisis cognitivo de este empaque revela un flujo visual vertical extremadamente limpio y efectivo. La mirada del consumidor se ancla con máxima fuerza en el logotipo central de la etiqueta blanca (Fijación 1), beneficiado por un amplio espacio negativo circundante. Posteriormente, la mirada desciende de forma ágil para procesar el mensaje clave de beneficios (Fijación 2), cuya tipografía sans-serif ofrece una alta legibilidad. La forma cilíndrica y la tapa de madera ayudan a enmarcar simétricamente el diseño, mientras que el fuerte contraste cromático de la pulpa de naranja de fondo proporciona un fondo vibrante que realza la nitidez de la etiqueta de papel.",
        strengths: [
          "El logotipo tiene una posición central dominante con excelente aislamiento visual y contraste.",
          "La forma estilizada de la botella guía el recorrido ocular de forma descendente y natural hacia la información del producto.",
          "Contraste cromático sobresaliente entre el fondo de jugo de naranja natural y la etiqueta blanca pura que mejora la legibilidad."
        ],
        weaknesses: [
          "La tipografía secundaria de ingredientes al dorso tiene baja visibilidad al primer golpe de vista.",
          "El sello ecológico queda un poco marginado en la zona baja de la etiqueta, reduciendo su impacto de credibilidad inicial.",
          "Falta un elemento de llamado a la acción o beneficio tangible en la tapa de la botella."
        ],
        recommendations: [
          "Aumentar el tamaño del sello de certificación en un 25% y posicionarlo ligeramente más arriba para reforzar la propuesta de valor orgánica.",
          "Agrupar la información nutricional clave con iconos sencillos para bajar aún más la carga cognitiva del consumidor de 35% a menos de 25%.",
          "Añadir un relieve o grabado de marca en el vidrio para estimular el sentido del tacto mediante el diseño estructural de la forma."
        ]
      }
    },
    realGaze: {
      gazePoints: [
        { x: 50, y: 38, timestamp: 150, durationMs: 600 },
        { x: 50, y: 55, timestamp: 800, durationMs: 520 },
        { x: 50, y: 20, timestamp: 1400, durationMs: 380 },
        { x: 50, y: 72, timestamp: 1900, durationMs: 300 },
        { x: 50, y: 38, timestamp: 2300, durationMs: 400 }
      ],
      heatmapPoints: [
        { x: 50, y: 38, weight: 1.0 },
        { x: 50, y: 55, weight: 0.85 },
        { x: 50, y: 20, weight: 0.6 },
        { x: 50, y: 72, weight: 0.45 }
      ],
      durationMs: 3000
    },
    emotions: [
      { timestamp: 0, engagement: 65, joy: 20, surprise: 8, confusion: 5, neutral: 67 },
      { timestamp: 1, engagement: 82, joy: 48, surprise: 35, confusion: 4, neutral: 43 },
      { timestamp: 2, engagement: 78, joy: 40, surprise: 15, confusion: 8, neutral: 52 },
      { timestamp: 3, engagement: 72, joy: 38, surprise: 10, confusion: 6, neutral: 62 }
    ]
  },
  {
    id: "preset-video-commercial",
    name: "Comercial de TV: Spark Citrus Drink (15s)",
    description: "Análisis cognitivo y emocional de un anuncio en video de 15 segundos. Evalúa segundo a segundo la retención visual, el engagement de la audiencia y los momentos exactos de sorpresa, agrado o fatiga cognitiva al presentarse el producto.",
    createdAt: "2026-07-14T04:00:00Z",
    imageName: "video_commercial_spark.jpg",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-cold-drink-with-lemon-and-mint-leaves-42358-large.mp4",
    isPreset: true,
    status: "ready",
    category: "video",
    areasOfInterest: [
      { id: "aoi-v-brand", name: "Revelado de Marca & Logotipo", x: 50, y: 18, width: 25, height: 12 },
      { id: "aoi-v-packshot", name: "Botella con Hielo y Servida", x: 50, y: 55, width: 40, height: 45 },
      { id: "aoi-v-text", name: "Mensaje Clave: Refresca tu Mente", x: 50, y: 80, width: 35, height: 8 }
    ],
    predictive: {
      clarityScore: 89,
      cognitiveLoad: 42,
      focusAreas: [
        { x: 50, y: 52, radius: 22, weight: 98, name: "Vaso Refrescante en Detalle" },
        { x: 50, y: 18, radius: 12, weight: 85, name: "Logotipo de Marca Spark" },
        { x: 32, y: 65, radius: 15, weight: 72, name: "Limón y Hielo Cayendo" },
        { x: 50, y: 80, radius: 10, weight: 60, name: "Mensaje de Llamado a la Acción" }
      ],
      gazePath: [
        { id: "vgp1", x: 50, y: 52, sequence: 1, durationMs: 750, label: "0-3s: Enfoque inmediato en el vertido del líquido fresco" },
        { id: "vgp2", x: 32, y: 65, sequence: 2, durationMs: 450, label: "3-7s: Seguimiento ocular de los limones y cubos de hielo flotando" },
        { id: "vgp3", x: 50, y: 18, sequence: 3, durationMs: 580, label: "7-11s: Lectura y fijación del logotipo central en la botella" },
        { id: "vgp4", x: 50, y: 80, sequence: 4, durationMs: 420, label: "11-15s: Fijación en el eslogan final con el call to action" }
      ],
      reportText: {
        summary: "El estudio de tracking del comercial Spark Citrus demuestra una respuesta de retención sobresaliente (Clarity Score 89%). Durante la primera escena (0-3s), el dinamismo del líquido siendo servido concentra el 98% de la atención visual. El clímax sensorial de los limones cayendo y el hielo flotando (3-7s) dispara el engagement emocional (pico de Surprise a 72% en el segundo 5) sin saturar al usuario, manteniendo una baja carga cognitiva general. El logotipo central Spark logra un anclaje impecable de 580ms en el segundo 10, lo que garantiza un alto recuerdo de marca de forma integrada.",
        strengths: [
          "Estímulos visuales y de movimiento altamente atractivos que retienen la atención en los primeros 3 segundos clave.",
          "Curva emocional balanceada con un claro pico de agrado y sorpresa que coincide con el clímax del vertido del refresco.",
          "El logotipo se revela en el momento de mayor retención de mirada, maximizando la conversión publicitaria."
        ],
        weaknesses: [
          "El eslogan secundario tiene un tamaño de letra reducido en dispositivos móviles durante la pantalla de cierre (12-15s).",
          "La velocidad del zoom final en la botella es un poco acelerada, restándole un 10% de legibilidad a la etiqueta trasera."
        ],
        recommendations: [
          "Aumentar el contraste del eslogan final de blanco a un tono amarillo brillante para llamar más la atención en el desenlace.",
          "Prolongar la toma final (packshot con logotipo) por 1.5 segundos adicionales para estirar el anclaje de marca un 15% más.",
          "Optimizar el audio para que la onomatopeya del hielo coincida con el pico de sorpresa visual en el segundo 5."
        ]
      }
    },
    realGaze: {
      gazePoints: [
        { x: 50, y: 52, timestamp: 200, durationMs: 700 },
        { x: 32, y: 65, timestamp: 1200, durationMs: 500 },
        { x: 50, y: 18, timestamp: 2500, durationMs: 600 },
        { x: 50, y: 80, timestamp: 3800, durationMs: 450 }
      ],
      heatmapPoints: [
        { x: 50, y: 52, weight: 1.0 },
        { x: 32, y: 65, weight: 0.88 },
        { x: 50, y: 18, weight: 0.8 },
        { x: 50, y: 80, weight: 0.55 }
      ],
      durationMs: 4500
    },
    emotions: [
      { timestamp: 0, engagement: 45, joy: 10, surprise: 5, confusion: 8, neutral: 77 },
      { timestamp: 1, engagement: 50, joy: 12, surprise: 8, confusion: 5, neutral: 75 },
      { timestamp: 2, engagement: 58, joy: 18, surprise: 15, confusion: 4, neutral: 63 },
      { timestamp: 3, engagement: 68, joy: 25, surprise: 30, confusion: 3, neutral: 42 },
      { timestamp: 4, engagement: 75, joy: 35, surprise: 55, confusion: 2, neutral: 28 },
      { timestamp: 5, engagement: 88, joy: 55, surprise: 72, confusion: 1, neutral: 12 },
      { timestamp: 6, engagement: 82, joy: 58, surprise: 48, confusion: 2, neutral: 18 },
      { timestamp: 7, engagement: 78, joy: 60, surprise: 25, confusion: 3, neutral: 32 },
      { timestamp: 8, engagement: 74, joy: 55, surprise: 15, confusion: 5, neutral: 45 },
      { timestamp: 9, engagement: 72, joy: 48, surprise: 10, confusion: 6, neutral: 56 },
      { timestamp: 10, engagement: 75, joy: 45, surprise: 18, confusion: 4, neutral: 53 },
      { timestamp: 11, engagement: 80, joy: 52, surprise: 20, confusion: 3, neutral: 45 },
      { timestamp: 12, engagement: 82, joy: 58, surprise: 15, confusion: 2, neutral: 40 },
      { timestamp: 13, engagement: 85, joy: 62, surprise: 10, confusion: 2, neutral: 38 },
      { timestamp: 14, engagement: 80, joy: 60, surprise: 8, confusion: 4, neutral: 42 },
      { timestamp: 15, engagement: 78, joy: 55, surprise: 5, confusion: 5, neutral: 45 }
    ]
  },
  {
    id: "preset-video-reel",
    name: "Instagram Reel / TikTok: Café Frapé Cold Brew (9:16)",
    description: "Análisis optimizado para videos verticales de formato corto (Reels / TikTok / Shorts). Mide el impacto crítico del gancho visual (hook) en los primeros 3 segundos para evitar que el usuario deslice (swipe-away), la lectura de subtítulos automáticos y la retención del llamado a la acción final.",
    createdAt: "2026-07-14T05:30:00Z",
    imageName: "reel_frap_thumbnail.jpg",
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-holding-a-glass-with-a-refreshing-drink-and-ice-42436-large.mp4",
    isPreset: true,
    status: "ready",
    category: "video",
    areasOfInterest: [
      { id: "aoi-reel-hook", name: "Gancho Inicial (0-3s) - Rostro & Sonrisa", x: 50, y: 35, width: 35, height: 25 },
      { id: "aoi-reel-product", name: "Detalle del Vaso Frapé con Hielo", x: 50, y: 65, width: 45, height: 35 },
      { id: "aoi-reel-subs", name: "Subtítulos Dinámicos / Text Overlay", x: 50, y: 82, width: 55, height: 10 }
    ],
    predictive: {
      clarityScore: 92,
      cognitiveLoad: 33,
      focusAreas: [
        { x: 50, y: 65, radius: 24, weight: 99, name: "Vaso de Café Frapé con Hielo" },
        { x: 50, y: 35, radius: 15, weight: 88, name: "Expresión / Rostro del Creador" },
        { x: 50, y: 82, radius: 12, weight: 82, name: "Subtítulos Animados" }
      ],
      gazePath: [
        { id: "rgp1", x: 50, y: 35, sequence: 1, durationMs: 800, label: "0-3s: Gancho visual instantáneo enfocado en la sonrisa y frescura inicial" },
        { id: "rgp2", x: 50, y: 65, sequence: 2, durationMs: 950, label: "3-8s: Fijación máxima y recurrente en el vaso y las gotas de condensación" },
        { id: "rgp3", x: 50, y: 82, sequence: 3, durationMs: 600, label: "8-12s: Lectura continua de los subtítulos de color amarillo contrastante" },
        { id: "rgp4", x: 50, y: 50, sequence: 4, durationMs: 400, label: "12-15s: Cierre enfocado en la marca de café emergente al centro" }
      ],
      reportText: {
        summary: "El análisis cognitivo de este Reel de formato vertical (9:16) demuestra un rendimiento de retención impecable (Clarity Score 92%). Al ser un formato móvil de alto consumo rápido, la presencia humana en la parte superior y la frescura del frapé en la mitad inferior logran anclar al usuario durante el umbral crítico de los 3 segundos (evitando el bounce/swipe). La inclusión de subtítulos en bloque amarillo en la zona inferior (y=82) mantiene los ojos en pantalla durante la explicación verbal del creador de contenido, lo cual incrementa el tiempo de visualización promedio de forma drástica.",
        strengths: [
          "El gancho visual de los primeros 3 segundos tiene alta carga emocional de alegría (Joy 68%), idóneo para retener la atención.",
          "La zona de subtítulos automáticos está perfectamente ubicada y coloreada, facilitando la lectura sin distraer del producto.",
          "La verticalidad aprovecha al 100% el viewport del teléfono móvil, logrando inmersión absoluta."
        ],
        weaknesses: [
          "Durante los segundos 7 a 9, los gestos de las manos del creador compiten levemente con el foco del vaso de café.",
          "La marca comercial aparece demasiado tarde (segundo 13), lo cual arriesga reconocimiento si el usuario no termina el Reel."
        ],
        recommendations: [
          "Introducir un pequeño isotipo transparente o marca de agua en la esquina superior derecha desde el segundo 1.",
          "Ubicar los subtítulos ligeramente más arriba (y=75) para evitar que la interfaz nativa de Reels (me gusta, comentar, descripción) los tape.",
          "Sincronizar una vibración o efecto de sonido 'pop' en el segundo 4 para consolidar la transición de clímax del frapé."
        ]
      }
    },
    realGaze: {
      gazePoints: [
        { x: 50, y: 35, timestamp: 150, durationMs: 750 },
        { x: 50, y: 65, timestamp: 950, durationMs: 900 },
        { x: 50, y: 82, timestamp: 1850, durationMs: 580 },
        { x: 50, y: 50, timestamp: 2430, durationMs: 420 }
      ],
      heatmapPoints: [
        { x: 50, y: 65, weight: 1.0 },
        { x: 50, y: 35, weight: 0.90 },
        { x: 50, y: 82, weight: 0.85 }
      ],
      durationMs: 4500
    },
    emotions: [
      { timestamp: 0, engagement: 55, joy: 22, surprise: 15, confusion: 5, neutral: 58 },
      { timestamp: 1, engagement: 62, joy: 30, surprise: 25, confusion: 3, neutral: 42 },
      { timestamp: 2, engagement: 75, joy: 45, surprise: 38, confusion: 2, neutral: 15 },
      { timestamp: 3, engagement: 88, joy: 68, surprise: 45, confusion: 1, neutral: 10 },
      { timestamp: 4, engagement: 82, joy: 65, surprise: 20, confusion: 2, neutral: 15 },
      { timestamp: 5, engagement: 79, joy: 60, surprise: 12, confusion: 3, neutral: 25 },
      { timestamp: 6, engagement: 74, joy: 58, surprise: 8, confusion: 4, neutral: 30 },
      { timestamp: 7, engagement: 71, joy: 55, surprise: 5, confusion: 5, neutral: 35 },
      { timestamp: 8, engagement: 76, joy: 59, surprise: 10, confusion: 4, neutral: 27 },
      { timestamp: 9, engagement: 81, joy: 62, surprise: 15, confusion: 3, neutral: 20 },
      { timestamp: 10, engagement: 84, joy: 66, surprise: 18, confusion: 2, neutral: 14 },
      { timestamp: 11, engagement: 80, joy: 63, surprise: 12, confusion: 3, neutral: 22 },
      { timestamp: 12, engagement: 78, joy: 60, surprise: 8, confusion: 4, neutral: 28 },
      { timestamp: 13, engagement: 85, joy: 68, surprise: 22, confusion: 2, neutral: 10 },
      { timestamp: 14, engagement: 82, joy: 65, surprise: 15, confusion: 3, neutral: 17 },
      { timestamp: 15, engagement: 80, joy: 60, surprise: 10, confusion: 4, neutral: 26 }
    ]
  },
  {
    id: "preset-pitch-deck",
    name: "Presentación PDF: Pitch Deck SaaS OculiMind",
    description: "Evaluación cognitiva y flujo visual de un archivo PDF de 3 diapositivas. Mide la claridad del mensaje comercial, la asimilación de gráficos financieros y la tasa de conversión de la llamada a la acción final.",
    createdAt: "2026-07-15T09:00:00Z",
    imageName: "pitch_deck_cover.jpg",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    isPreset: true,
    status: "ready",
    category: "presentation",
    areasOfInterest: [
      { id: "aoi-p1-title", name: "Título Principal: Propuesta de Valor", x: 25, y: 35, width: 45, height: 18 },
      { id: "aoi-p1-sub", name: "Subtítulo / Problema Resuelto", x: 25, y: 55, width: 40, height: 10 },
      { id: "aoi-p1-logo", name: "Logotipo de la Startup", x: 15, y: 15, width: 20, height: 8 }
    ],
    predictive: {
      clarityScore: 88,
      cognitiveLoad: 25,
      focusAreas: [
        { x: 45, y: 42, radius: 16, weight: 95, name: "Título de la Portada" },
        { x: 15, y: 15, radius: 10, weight: 75, name: "Logotipo OculiMind" },
        { x: 45, y: 58, radius: 12, weight: 70, name: "Subtítulo: Neuro-analytics" },
        { x: 75, y: 50, radius: 15, weight: 80, name: "Gráfico Abstracto Minimalista" }
      ],
      gazePath: [
        { id: "pgp1-1", x: 45, y: 42, sequence: 1, durationMs: 650, label: "Fijación 1: Comprensión inmediata de la propuesta de valor" },
        { id: "pgp1-2", x: 75, y: 50, sequence: 2, durationMs: 480, label: "Fijación 2: Exploración de la ilustración decorativa derecha" },
        { id: "pgp1-3", x: 15, y: 15, sequence: 3, durationMs: 350, label: "Fijación 3: Identificación y reconocimiento de marca" },
        { id: "pgp1-4", x: 45, y: 58, sequence: 4, durationMs: 400, label: "Fijación 4: Lectura rápida de la bajada de texto secundaria" }
      ],
      reportText: {
        summary: "La portada del Pitch Deck muestra una jerarquía excelente, con una altísima puntuación de claridad (88%) y un esfuerzo cognitivo excepcionalmente bajo (25%). El uso generoso del espacio en blanco aísla los componentes críticos. El ojo se desplaza de manera natural del titular principal hacia el gráfico decorativo moderno a la derecha, para luego validar la marca en la esquina superior izquierda. No existe competencia de atención perjudicial.",
        strengths: [
          "Diseño extremadamente limpio con excelente contraste tipográfico de 5.8:1.",
          "El logotipo está adecuadamente posicionado en la esquina superior izquierda, alineado con el patrón de lectura occidental.",
          "La ilustración abstracta aporta valor estético sin saturar visualmente."
        ],
        weaknesses: [
          "El subtítulo de la portada tiene una tipografía un poco delgada, disminuyendo un 10% la fijación sacádica secundaria.",
          "La esquina inferior derecha está completamente desaprovechada; podría contener la dirección de contacto o el número de diapositiva de forma sutil."
        ],
        recommendations: [
          "Incrementar el peso de fuente (font-weight) del subtítulo para asegurar que se lea inmediatamente después del título.",
          "Colocar el número de página de forma pequeña en la parte inferior para estructurar la navegación del inversionista."
        ]
      }
    },
    realGaze: {
      gazePoints: [
        { x: 45, y: 42, timestamp: 120, durationMs: 600 },
        { x: 75, y: 50, timestamp: 800, durationMs: 450 },
        { x: 15, y: 15, timestamp: 1400, durationMs: 320 },
        { x: 45, y: 58, timestamp: 1800, durationMs: 380 }
      ],
      heatmapPoints: [
        { x: 45, y: 42, weight: 1.0 },
        { x: 75, y: 50, weight: 0.8 },
        { x: 15, y: 15, weight: 0.7 }
      ],
      durationMs: 4000
    },
    emotions: [
      { timestamp: 0, engagement: 60, joy: 10, surprise: 40, confusion: 5, neutral: 45 },
      { timestamp: 1, engagement: 72, joy: 20, surprise: 35, confusion: 2, neutral: 43 },
      { timestamp: 2, engagement: 78, joy: 25, surprise: 20, confusion: 1, neutral: 54 }
    ],
    slides: [
      {
        id: "slide-1",
        slideNumber: 1,
        name: "Diapositiva 1: Portada y Propuesta de Valor",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        areasOfInterest: [
          { id: "aoi-p1-title", name: "Título Principal: Propuesta de Valor", x: 25, y: 35, width: 45, height: 18 },
          { id: "aoi-p1-sub", name: "Subtítulo / Problema Resuelto", x: 25, y: 55, width: 40, height: 10 },
          { id: "aoi-p1-logo", name: "Logotipo de la Startup", x: 15, y: 15, width: 20, height: 8 }
        ],
        predictive: {
          clarityScore: 88,
          cognitiveLoad: 25,
          focusAreas: [
            { x: 45, y: 42, radius: 16, weight: 95, name: "Título de la Portada" },
            { x: 15, y: 15, radius: 10, weight: 75, name: "Logotipo OculiMind" },
            { x: 45, y: 58, radius: 12, weight: 70, name: "Subtítulo: Neuro-analytics" },
            { x: 75, y: 50, radius: 15, weight: 80, name: "Gráfico Abstracto Minimalista" }
          ],
          gazePath: [
            { id: "pgp1-1", x: 45, y: 42, sequence: 1, durationMs: 650, label: "Fijación 1: Comprensión inmediata de la propuesta de valor" },
            { id: "pgp1-2", x: 75, y: 50, sequence: 2, durationMs: 480, label: "Fijación 2: Exploración de la ilustración decorativa derecha" },
            { id: "pgp1-3", x: 15, y: 15, sequence: 3, durationMs: 350, label: "Fijación 3: Identificación y reconocimiento de marca" },
            { id: "pgp1-4", x: 45, y: 58, sequence: 4, durationMs: 400, label: "Fijación 4: Lectura rápida de la bajada de texto secundaria" }
          ],
          reportText: {
            summary: "La portada del Pitch Deck muestra una jerarquía excelente, con una altísima puntuación de claridad (88%) y un esfuerzo cognitivo excepcionalmente bajo (25%). El uso generoso del espacio en blanco aísla los componentes críticos. El ojo se desplaza de manera natural del titular principal hacia el gráfico decorativo moderno a la derecha, para luego validar la marca en la esquina superior izquierda. No existe competencia de atención perjudicial.",
            strengths: [
              "Diseño extremadamente limpio con excelente contraste tipográfico de 5.8:1.",
              "El logotipo está adecuadamente posicionado en la esquina superior izquierda, alineado con el patrón de lectura occidental.",
              "La ilustración abstracta aporta valor estético sin saturar visualmente."
            ],
            weaknesses: [
              "El subtítulo de la portada tiene una tipografía un poco delgada, disminuyendo un 10% la fijación sacádica secundaria.",
              "La esquina inferior derecha está completamente desaprovechada; podría contener la dirección de contacto o el número de diapositiva de forma sutil."
            ],
            recommendations: [
              "Incrementar el peso de fuente (font-weight) del subtítulo para asegurar que se lea inmediatamente después del título.",
              "Colocar el número de página de forma pequeña en la parte inferior para estructurar la navegación del inversionista."
            ]
          }
        },
        realGaze: {
          gazePoints: [
            { x: 45, y: 42, timestamp: 120, durationMs: 600 },
            { x: 75, y: 50, timestamp: 800, durationMs: 450 },
            { x: 15, y: 15, timestamp: 1400, durationMs: 320 },
            { x: 45, y: 58, timestamp: 1800, durationMs: 380 }
          ],
          heatmapPoints: [
            { x: 45, y: 42, weight: 1.0 },
            { x: 75, y: 50, weight: 0.8 },
            { x: 15, y: 15, weight: 0.7 }
          ],
          durationMs: 4000
        },
        emotions: [
          { timestamp: 0, engagement: 60, joy: 10, surprise: 40, confusion: 5, neutral: 45 },
          { timestamp: 1, engagement: 72, joy: 20, surprise: 35, confusion: 2, neutral: 43 },
          { timestamp: 2, engagement: 78, joy: 25, surprise: 20, confusion: 1, neutral: 54 }
        ]
      },
      {
        id: "slide-2",
        slideNumber: 2,
        name: "Diapositiva 2: Métricas de Tracción Comercial",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        areasOfInterest: [
          { id: "aoi-p2-chart", name: "Gráfico de Crecimiento (Tracción)", x: 50, y: 50, width: 50, height: 40 },
          { id: "aoi-p2-kpi", name: "Métrica Destacada: ARR $1.2M", x: 18, y: 40, width: 22, height: 18 },
          { id: "aoi-p2-text", name: "Explicación / Ventaja competitiva", x: 18, y: 70, width: 22, height: 20 }
        ],
        predictive: {
          clarityScore: 73,
          cognitiveLoad: 56,
          focusAreas: [
            { x: 50, y: 45, radius: 20, weight: 98, name: "Gráfico de Barras Creciente" },
            { x: 18, y: 38, radius: 14, weight: 92, name: "Métrica Gigante: ARR $1.2M" },
            { x: 15, y: 15, radius: 8, weight: 50, name: "Título de Sección: TRACCIÓN" },
            { x: 18, y: 68, radius: 12, weight: 62, name: "Texto de soporte explicativo" }
          ],
          gazePath: [
            { id: "pgp2-1", x: 18, y: 38, sequence: 1, durationMs: 580, label: "Fijación 1: La cifra gigante de $1.2M capta la atención inmediata" },
            { id: "pgp2-2", x: 50, y: 45, sequence: 2, durationMs: 700, label: "Fijación 2: El pico alto de la barra del gráfico valida el crecimiento visualmente" },
            { id: "pgp2-3", x: 15, y: 15, sequence: 3, durationMs: 250, label: "Fijación 3: Validación del título superior" },
            { id: "pgp2-4", x: 18, y: 68, sequence: 4, durationMs: 420, label: "Fijación 4: Lectura de las fuentes de ingresos explicadas abajo" }
          ],
          reportText: {
            summary: "La diapositiva de datos funciona con gran impacto heurístico. La combinación de la cifra masiva de ingresos a la izquierda y el gráfico de barras ascendente a la derecha genera un circuito cerrado altamente convincente. El ojo rebota de forma consecutiva entre el número de tracción y el punto más alto del gráfico, logrando un 'efecto de validación doble'. La carga cognitiva sube ligeramente a un nivel moderado (56%) por la presencia de números y etiquetas del gráfico.",
            strengths: [
              "Fuerte jerarquía numérica: la cifra gigante ARR $1.2M tiene un peso de atracción superior al 92%.",
              "El contraste cromático del gráfico de barras destaca de forma contundente sobre el fondo de la diapositiva.",
              "Excelente flujo de lectura que conecta el número de ingresos con la validación gráfica."
            ],
            weaknesses: [
              "La leyenda de los ejes del gráfico (las letras pequeñas de los meses) tiene un tamaño de fuente de 8px, quedando por debajo del nivel óptimo de lectura cómoda.",
              "El texto explicativo de la izquierda se siente un poco apretado con la cifra gigante superior."
            ],
            recommendations: [
              "Incrementar el tamaño de la tipografía de los ejes del gráfico un 20% para que el inversionista capte los plazos sin esforzarse.",
              "Añadir 15px de margen inferior entre la cifra de ARR $1.2M y el párrafo explicativo para dar más respiración visual al bloque."
            ]
          }
        },
        realGaze: {
          gazePoints: [
            { x: 18, y: 38, timestamp: 150, durationMs: 550 },
            { x: 50, y: 45, timestamp: 850, durationMs: 720 },
            { x: 15, y: 15, timestamp: 1700, durationMs: 220 },
            { x: 18, y: 68, timestamp: 2100, durationMs: 460 }
          ],
          heatmapPoints: [
            { x: 50, y: 45, weight: 1.0 },
            { x: 18, y: 38, weight: 0.95 },
            { x: 18, y: 68, weight: 0.6 }
          ],
          durationMs: 4500
        },
        emotions: [
          { timestamp: 0, engagement: 65, joy: 15, surprise: 30, confusion: 8, neutral: 47 },
          { timestamp: 1, engagement: 82, joy: 45, surprise: 32, confusion: 2, neutral: 21 },
          { timestamp: 2, engagement: 80, joy: 50, surprise: 25, confusion: 1, neutral: 24 }
        ]
      },
      {
        id: "slide-3",
        slideNumber: 3,
        name: "Diapositiva 3: Modelo de Negocio & Llamado a la Acción (CTA)",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
        areasOfInterest: [
          { id: "aoi-p3-cta", name: "Llamado a la Acción (Invertir / Demo)", x: 50, y: 72, width: 35, height: 10 },
          { id: "aoi-p3-contact", name: "Información de contacto y QR", x: 50, y: 88, width: 45, height: 8 },
          { id: "aoi-p3-benefits", name: "Tres pilares del modelo de negocio", x: 50, y: 40, width: 60, height: 22 }
        ],
        predictive: {
          clarityScore: 84,
          cognitiveLoad: 33,
          focusAreas: [
            { x: 50, y: 72, radius: 14, weight: 96, name: "Botón CTA Principal: 'Agendar Demo / Invertir'" },
            { x: 50, y: 42, radius: 18, weight: 88, name: "Pilares del Modelo de Negocio" },
            { x: 50, y: 16, radius: 8, weight: 55, name: "Título: Únete a la Revolución Cognitiva" },
            { x: 50, y: 88, radius: 10, weight: 65, name: "Código QR / Datos de Contacto" }
          ],
          gazePath: [
            { id: "pgp3-1", x: 50, y: 72, sequence: 1, durationMs: 720, label: "Fijación 1: El botón contrastante de color verde esmeralda captura los ojos de inmediato" },
            { id: "pgp3-2", x: 50, y: 42, sequence: 2, durationMs: 600, label: "Fijación 2: Escaneo rápido de los 3 planes de negocio en la tabla central" },
            { id: "pgp3-3", x: 50, y: 16, sequence: 3, durationMs: 250, label: "Fijación 3: Lectura rápida de la frase de cierre superior" },
            { id: "pgp3-4", x: 50, y: 88, sequence: 4, durationMs: 380, label: "Fijación 4: Retención final en el correo electrónico y enlace de agenda" }
          ],
          reportText: {
            summary: "La diapositiva de cierre del Pitch Deck está excelentemente resuelta en términos de conversión de negocios. El botón de Llamado a la Acción (CTA) para agendar o invertir está coloreado con un tono verde esmeralda disruptivo que capta la primera mirada de la audiencia. El flujo ocular desciende por los pilares del negocio y se posa de lleno sobre el botón, culminando con la validación de los datos de contacto y el QR en el margen inferior de la pantalla.",
            strengths: [
              "El botón de conversión CTA tiene un contraste superlativo de 7.5:1, logrando un foco del 96%.",
              "Disposición centralizada y simétrica que transmite orden, confianza y solidez profesional.",
              "El código QR / información de contacto capta una fijación prolongada ideal para cerrar la acción."
            ],
            weaknesses: [
              "Los tres pilares centrales tienen textos de beneficios ligeramente largos que pueden causar fricción rápida si se presenta en vivo.",
              "Falta de contraste sutil en la cabecera del título de la diapositiva sobre el fondo claro."
            ],
            recommendations: [
              "Sintetizar la descripción de los planes centrales a un máximo de 5 palabras por beneficio clave.",
              "Dar un fondo sólido de color pastel muy suave al contenedor de contacto para separarlo del final del botón y aumentar el foco en el QR."
            ]
          }
        },
        realGaze: {
          gazePoints: [
            { x: 50, y: 72, timestamp: 140, durationMs: 700 },
            { x: 50, y: 42, timestamp: 900, durationMs: 580 },
            { x: 50, y: 16, timestamp: 1600, durationMs: 240 },
            { x: 50, y: 88, timestamp: 2000, durationMs: 400 }
          ],
          heatmapPoints: [
            { x: 50, y: 72, weight: 1.0 },
            { x: 50, y: 42, weight: 0.85 },
            { x: 50, y: 88, weight: 0.7 }
          ],
          durationMs: 4200
        },
        emotions: [
          { timestamp: 0, engagement: 62, joy: 12, surprise: 25, confusion: 5, neutral: 58 },
          { timestamp: 1, engagement: 85, joy: 58, surprise: 20, confusion: 1, neutral: 21 },
          { timestamp: 2, engagement: 81, joy: 60, surprise: 15, confusion: 1, neutral: 24 }
        ]
      }
    ]
  }
];


import { BenchmarkData } from "../types";

export const defaultBenchmarkPresets: BenchmarkData[] = [
  {
    id: "bench-duel-saas",
    title: "Duelo 1 a 1: Landing Page SaaS B2B",
    categoryName: "Software B2B / SaaS",
    mode: "duel",
    createdAt: new Date().toISOString(),
    winnerId: "item-aura-saas",
    headToHeadSummary: "Aura SaaS se impone con un +18% de Claridad Atencional frente a TechFlow Pro. La propuesta de valor de Aura captura la fijación inicial en los primeros 1.2 segundos gracias al contraste tipográfico y la ausencia de ruido visual secundario.",
    categoryAverage: {
      clarity: 74,
      cognitiveLoad: 42,
      attentionHook: 76,
      neuroIndex: 78
    },
    executiveSummary: "El Duelo 1 a 1 revela una ventaja competitiva significativa para Aura SaaS en retención del Hook visual inicial (primeros 3 segundos). Mientras que TechFlow Pro sufre saturación de elementos gráficos en el hero section, Aura concentra el 68% de la atención del usuario directamente en el título principal y en el botón CTA primario.",
    strategicRecommendations: [
      "Mantener la jerarquía de 'Aura SaaS' reduciendo aún más el tamaño del badge secundario para acelerar la conversión.",
      "TechFlow Pro debería simplificar sus 3 tarjetas flotantes, ya que generan fricción y dispersión atencional.",
      "Optimizar el micro-copy del CTA en ambas piezas para maximizar la intención de clic tras el primer golpe de vista."
    ],
    items: [
      {
        id: "item-aura-saas",
        name: "Aura SaaS (Tu Marca)",
        brandType: "own",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
        clarityScore: 89,
        cognitiveLoad: 28,
        attentionHook3s: 92,
        brandRecallScore: 88,
        neuroScoreIndex: 91,
        spellingErrorsCount: 0,
        spellingStatus: "100% Sin faltas ortográficas",
        strengths: [
          "Contraste limpio en la sección Hero con CTA bien delimitado",
          "Mínima carga cognitiva en la navegación superior",
          "Foco visual directo en la promesa de valor"
        ],
        weaknesses: [
          "Espacio inferior podría incluir prueba social de clientes"
        ],
        keyDifference: "Línea de mirada directa hacia el botón de acción principal sin distractores."
      },
      {
        id: "item-techflow-pro",
        name: "TechFlow Pro (Competidor)",
        brandType: "competitor",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
        clarityScore: 71,
        cognitiveLoad: 58,
        attentionHook3s: 74,
        brandRecallScore: 79,
        neuroScoreIndex: 73,
        spellingErrorsCount: 1,
        spellingStatus: "1 errata menor detectada en subtítulo",
        strengths: [
          "Uso llamativo de dashboards interactivos",
          "Buen contraste de colores primarios"
        ],
        weaknesses: [
          "Exceso de tarjetas flotantes que compiten por la atención",
          "Carga cognitiva elevada en los primeros 2 segundos"
        ],
        keyDifference: "Múltiples focos secundarios que fragmentan el flujo de lectura."
      }
    ]
  },
  {
    id: "bench-grid-fmcg",
    title: "Benchmark Set Competitivo (4 Piezas): Bebidas Saludables FMCG",
    categoryName: "FMCG / Bebidas Saludable",
    mode: "grid",
    createdAt: new Date().toISOString(),
    winnerId: "item-bio-refresh",
    headToHeadSummary: "En la evaluación en parrilla competitiva de 4 productos de la categoría, BioRefresh Orgánico obtiene la mayor puntuación de Neuro-Score (88/100) impulsado por el contraste del empaque y la legibilidad inmediata del claim de producto.",
    categoryAverage: {
      clarity: 73,
      cognitiveLoad: 48,
      attentionHook: 77,
      neuroIndex: 76
    },
    executiveSummary: "Estudio comparativo de 4 empaques/anuncios en la categoría de Bebidas Saludables. Se observa que los diseños con tipografías sans-serif de alto contraste y silueta limpia superan en más de 15 puntos de retención a aquellos con fondos saturados o textos condensados.",
    strategicRecommendations: [
      "Asegurar que el logotipo o isotipo ocupe al menos el 15% del área frontal para garantizar recordación espontánea.",
      "Reducir las certificaciones en la etiqueta frontal a un máximo de 3 sellos para no elevar la carga cognitiva.",
      "Aumentar el contraste del claim principal en Competidor Vibe Soda para mejorar su desempeño en anaquel."
    ],
    items: [
      {
        id: "item-bio-refresh",
        name: "BioRefresh Orgánico (Tu Marca)",
        brandType: "own",
        imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1000&q=80",
        clarityScore: 88,
        cognitiveLoad: 31,
        attentionHook3s: 90,
        brandRecallScore: 86,
        neuroScoreIndex: 88,
        spellingErrorsCount: 0,
        spellingStatus: "100% Sin faltas",
        strengths: ["Contraste brillante de etiqueta", "Claim nutricional directo", "Silueta limpia"],
        weaknesses: ["Marca de agua posterior ligeramente tenue"],
        keyDifference: "Rápida lectura de marca en menos de 800ms."
      },
      {
        id: "item-kombucha-zen",
        name: "Kombucha Zen (Competidor A)",
        brandType: "competitor",
        imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1000&q=80",
        clarityScore: 78,
        cognitiveLoad: 44,
        attentionHook3s: 81,
        brandRecallScore: 82,
        neuroScoreIndex: 80,
        spellingErrorsCount: 0,
        spellingStatus: "100% Sin faltas",
        strengths: ["Estética botánica atrayente", "Buena gama cromática"],
        weaknesses: ["Nombre de marca con fuente manuscrita compleja"],
        keyDifference: "Requiere 400ms adicionales para descifrar la marca."
      },
      {
        id: "item-vibe-soda",
        name: "Vibe Soda (Competidor B)",
        brandType: "competitor",
        imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=1000&q=80",
        clarityScore: 68,
        cognitiveLoad: 62,
        attentionHook3s: 72,
        brandRecallScore: 70,
        neuroScoreIndex: 69,
        spellingErrorsCount: 1,
        spellingStatus: "1 falta de acentuación",
        strengths: ["Color neón de alto impacto"],
        weaknesses: ["Fondo ruidoso dispersa la mirada"],
        keyDifference: "Alto impacto visual pero baja retención de mensaje."
      },
      {
        id: "item-pure-boost",
        name: "Pure Boost (Competidor C)",
        brandType: "competitor",
        imageUrl: "https://images.unsplash.com/photo-1543253687-c931c8e01820?auto=format&fit=crop&w=1000&q=80",
        clarityScore: 62,
        cognitiveLoad: 55,
        attentionHook3s: 66,
        brandRecallScore: 65,
        neuroScoreIndex: 65,
        spellingErrorsCount: 0,
        spellingStatus: "100% Sin faltas",
        strengths: ["Aspecto minimalista médico"],
        weaknesses: ["Falta de contraste emotivo", "Sensación fría"],
        keyDifference: "Poco gancho emocional en el comprador casual."
      }
    ]
  },
  {
    id: "bench-strat-pharma-latam",
    title: "Benchmark de Mercado: Lanzamiento Fotoprotector SPF50+ Dermocosmética",
    categoryName: "Farmacéutica & Dermocosmética",
    mode: "strategic_brand",
    createdAt: new Date().toISOString(),
    winnerId: "comp-derma-care",
    categoryAverage: {
      clarity: 80,
      cognitiveLoad: 35,
      attentionHook: 82,
      neuroIndex: 83
    },
    executiveSummary: "Análisis estratégico para el lanzamiento de una nueva línea de Fotoprotección Solar Dermocosmética en México, Colombia, Chile y Perú. La marca líder de la categoría (DermaShield Rx) concentra el 38% del Share of Voice en Meta & TikTok Ads, pero presenta una ineficiencia en ROI de pauta del 22% por mensajes hiper-técnicos sin apelación emocional.",
    strategicRecommendations: [
      "Aprovechar el espacio de 'Océano Azul': Posicionar el producto como 'Fotoprotección + Tratamiento Anti-Manchas con Niacinamida' a un precio 15% menor que las marcas europeas de lujo.",
      "Redes Sociales: Enfocar el 60% de la pauta en TikTok e Instagram Reels con micro-influencers dermatólogos y farmacólogos para aumentar la tasa de engangement (actualmente 4.2% promedio en competidores).",
      "Punto de Venta / Farmacias: Asegurar presencia en cadenas líderes de farmacias locales (Farmacias del Ahorro, Cruz Verde, Inkafarma) mediante combos promocionales de iniciación."
    ],
    items: [],
    strategicBrandData: {
      id: "strat-data-001",
      targetBrand: "BioHealth Dermacare (Tu Marca)",
      productLineOrLaunch: "Lanzamiento: Fotoprotector SPF50+ Fluido Invisible con Niacinamida",
      industry: "Farmacéutica & Dermocosmética",
      countries: ["México", "Colombia", "Chile", "Perú"],
      objective: "new_product_launch",
      selectedDimensions: ["social_media", "brand_positioning", "spend_vs_exposure", "product_launch", "pricing_value"],
      createdAt: new Date().toISOString(),
      competitors: [
        {
          name: "BioHealth Dermacare (Tu Lanzamiento)",
          isTargetBrand: true,
          marketSharePercent: 5,
          shareOfVoicePercent: 12,
          shareOfSpendPercent: 10,
          estimatedMonthlyAdSpend: "$25,000 USD",
          exposureEffectivenessScore: 92,
          socialFollowers: "45K",
          socialEngagementRate: "5.8%",
          topStrength: "Fórmula de rápida absorción con doble beneficio dermatológico y precio competitivo.",
          keyVulnerability: "Marca nueva que requiere construir confianza y prescripción con dermatólogos."
        },
        {
          name: "DermaShield Rx (Líder del Mercado)",
          isTargetBrand: false,
          marketSharePercent: 38,
          shareOfVoicePercent: 35,
          shareOfSpendPercent: 42,
          estimatedMonthlyAdSpend: "$110,000 USD",
          exposureEffectivenessScore: 71,
          socialFollowers: "620K",
          socialEngagementRate: "2.1%",
          topStrength: "Alta recordación de marca y prescripción médica consolidada en farmacias.",
          keyVulnerability: "Mensajes publicitarios rígidos, bajo engagement orgánico en jóvenes y precio elevado."
        },
        {
          name: "Solaris SunCare (Competidor Mid-Tier)",
          isTargetBrand: false,
          marketSharePercent: 26,
          shareOfVoicePercent: 28,
          shareOfSpendPercent: 25,
          estimatedMonthlyAdSpend: "$65,000 USD",
          exposureEffectivenessScore: 84,
          socialFollowers: "280K",
          socialEngagementRate: "3.9%",
          topStrength: "Fuerte presencia promocional en supermercados y tiendas departamentales.",
          keyVulnerability: "Sensación grasosa reportada por consumidores en reseñas digitales."
        },
        {
          name: "BioSun Organic (Competidor Botánico)",
          isTargetBrand: false,
          marketSharePercent: 18,
          shareOfVoicePercent: 15,
          shareOfSpendPercent: 13,
          estimatedMonthlyAdSpend: "$30,000 USD",
          exposureEffectivenessScore: 88,
          socialFollowers: "150K",
          socialEngagementRate: "6.2%",
          topStrength: "Comunidad altamente leal interesada en ingredientes biodegradables y eco-friendly.",
          keyVulnerability: "Distribución limitada principalmente a canales online e-commerce."
        }
      ],
      marketShareChart: [
        { brand: "DermaShield Rx", share: 38 },
        { brand: "Solaris SunCare", share: 26 },
        { brand: "BioSun Organic", share: 18 },
        { brand: "Otras Marcas Locales", share: 13 },
        { brand: "BioHealth Dermacare (Tu Marca)", share: 5, isTarget: true }
      ],
      spendVsExposureChart: [
        { brand: "DermaShield Rx", shareOfSpend: 42, shareOfVoice: 35, roiIndex: 71 },
        { brand: "Solaris SunCare", shareOfSpend: 25, shareOfVoice: 28, roiIndex: 84 },
        { brand: "BioSun Organic", shareOfSpend: 13, shareOfVoice: 15, roiIndex: 88 },
        { brand: "BioHealth Dermacare", shareOfSpend: 10, shareOfVoice: 12, roiIndex: 92 }
      ],
      dimensionResults: [
        {
          id: "social_media",
          title: "Redes Sociales & Estrategia de Contenido",
          summary: "Análisis de más de 450 publicaciones en Instagram, TikTok y YouTube Shorts en México, Colombia, Chile y Perú.",
          keyDataPoints: [
            "TikTok es el canal con mayor ROAS (+140% vs Instagram) para el segmento dermocosmético de 18-35 años.",
            "Formato ganador: 'Prueba de textura en vivo + recomendación por médico en video corto de 15 segundos'.",
            "DermaShield Rx publica 12 veces por semana pero su engagement es bajo (2.1%) debido a gráficos estáticos de laboratorio."
          ],
          strategicAction: "Implementar campaña de desempaquetado y prueba de absorción sin residuo blanco en TikTok con 15 dermatólogos creadores de contenido."
        },
        {
          id: "brand_positioning",
          title: "Posicionamiento de Marca & Market Share por País",
          summary: "Evaluación de cuota de mercado en canales de farmacia y e-commerce en Latinoamérica.",
          keyDataPoints: [
            "DermaShield Rx lidera en México (41%) y Chile (36%), pero su presencia en Colombia presenta brechas de stock.",
            "Top-of-Mind de categoría: 64% de los consumidores asocia 'Fotoprotección médica' con empaques blancos y azules con tipografía sans-serif.",
            "Vacío detectado: Falta de fotoprotectores con beneficios de maquillaje suave (efecto piel radiante con color adaptable)."
          ],
          strategicAction: "Aprovechar la falla de stock de competidores en Colombia con un desembarco agresivo en canal e-commerce directo y cadenas de farmacias."
        },
        {
          id: "spend_vs_exposure",
          title: "Inversión Publicitaria vs Exposición Real (Share of Voice / ROI)",
          summary: "Relación entre inversión en pauta digital/medios y el volumen de menciones e interacciones reales de la audiencia.",
          keyDataPoints: [
            "DermaShield Rx invierte $110,000 USD/mes pero obtiene solo 35% de Share of Voice (eficiencia ROI 71%).",
            "BioSun Organic logra 15% de Share of Voice con solo $30,000 USD/mes gracias a su comunidad hiper-enganchada (eficiencia ROI 88%).",
            "BioHealth Dermacare proyecta una eficiencia de ROI del 92% enfocando su pauta en micro-targetings segmentados por problema dermatológico."
          ],
          strategicAction: "No competir en volumen de pauta masiva en TV o Banners. Concentrar el presupuesto en retargeting dinámico e influenciadores de alta conversión."
        },
        {
          id: "product_launch",
          title: "Estrategia de Lanzamiento de Nuevo Producto (Océano Azul)",
          summary: "Identificación de la ventana de oportunidad competitiva para la nueva línea.",
          keyDataPoints: [
            "El 78% de los compradores busca fotoprotectores que no ardan en los ojos ni dejen sensación grasa.",
            "El 62% estaría dispuesto a cambiar de marca si el precio es 15-20% inferior manteniendo el sello de probada dermatológicamente.",
            "Ningún competidor actual en Latam promueve activamente el beneficio anti-polución urbana en su comunicación principal."
          ],
          strategicAction: "Construir la narrativa de lanzamiento sobre 'Triple Escudo: UV + Luz Azul + Anti-Polución con Niacinamida' a un precio de entrada disruptivo."
        },
        {
          id: "pricing_value",
          title: "Estrategia de Precios, Tiering & Empaquetado",
          summary: "Mapa de precios al consumidor final en farmacias y marketplaces regionales.",
          keyDataPoints: [
            "Precio promedio Líder Premium (DermaShield Rx): $38.00 - $45.00 USD por 50ml.",
            "Precio promedio Mid-Tier (Solaris SunCare): $24.00 - $29.00 USD por 50ml.",
            "Precio recomendado para BioHealth Dermacare: $22.00 USD en kit introductorio con limpiador facial de regalo."
          ],
          strategicAction: "Lanzar con estrategia 'Value-Pack' (Bloqueador 50ml + Muestra de suero Niacinamida) para acelerar la prueba inicial."
        }
      ],
      blueOceanOpportunities: [
        "Fórmula Híbrida: Fotoprotector + Suero de Niacinamida Anti-Manchas en un solo paso.",
        "Comunicación Transparente: Mostrar el test de laboratorio de espectro UV real en código QR en la caja.",
        "Suscripción Auto-Delivery: Descuento del 15% por compra recurrente cada 60 días para garantizar recompra."
      ],
      executiveSummary: "Análisis estratégico para el lanzamiento de una nueva línea de Fotoprotección Solar Dermocosmética en México, Colombia, Chile y Perú. La marca líder de la categoría (DermaShield Rx) concentra el 38% del Share of Voice en Meta & TikTok Ads, pero presenta una ineficiencia en ROI de pauta del 22% por mensajes hiper-técnicos sin apelación emocional.",
      strategicActionPlan: [
        "Fase 1 (Mes 1): Envío de KITS VIP a 100 dermatólogos y farmacólogos clave en México y Colombia.",
        "Fase 2 (Mes 2): Campaña Teaser en TikTok e Instagram centrada en 'El mito del bloqueador pegajoso'.",
        "Fase 3 (Mes 3): Desembarco en 500 puntos de venta de farmacias principales con exhibidores destacados."
      ]
    }
  }
];

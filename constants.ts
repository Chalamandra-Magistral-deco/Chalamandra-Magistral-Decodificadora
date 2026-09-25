
// --- TYPES ---

export interface PedagogyDetails {
  Tipo: string;
  Disrupción: string;
  Aplicación: string;
  Valor_SRAP: string;
}

export interface Pedagogy {
  id: number;
  title: string;
  emoji: string;
  details: PedagogyDetails;
  scores: number[];
}

export interface PortfolioItem {
  id: number;
  title: string;
  icon: string;
  anecdote: string;
  methodology: string;
  insight: string;
}

export interface AboutProfile {
  name: string;
  alias: string;
  role: string;
  tagline: string;
  bio: string[];
  philosophy: {
    title: string;
    content: string;
  };
  skills: string[];
}

export interface ProjectItem {
  id: number;
  title: string;
  clientType: string;
  role: string;
  challenge: string;
  solution: string;
  impact: string;
  tags: string[];
  status: "Deployed" | "In Progress" | "Confidential";
}

// --- DATA ---

export const ABOUT_DATA: AboutProfile = {
  name: "Danna Brasdefer",
  alias: "Chalamandra Magistral DecoX™",
  role: "Hybrid Decoder & Symbolic Strategist",
  tagline: "El caos no es ruido; son datos encriptados esperando traducción.",
  bio: [
    "Danna opera en la intersección donde la calle se encuentra con la academia, y donde la intuición se valida con datos. Como decodificadora híbrida, su especialidad es traducir la complejidad sistémica y el desorden emocional en estructuras operativas claras.",
    "Fundadora de Mandala Vivo Studio, ha desarrollado la metodología SRAP para transformar la narrativa personal en capital estratégico. Su enfoque no busca eliminar el caos, sino cartografiarlo para encontrar las rutas de mayor impacto (El Flow del Malandro).",
    "Su identidad 'Chalamandra' representa la adaptabilidad radical: la capacidad de regenerarse y cambiar de piel (arquetipos) sin perder la esencia central."
  ],
  philosophy: {
    title: "La Filosofía DecoX",
    content: "No hackeamos las reglas, hackeamos los incentivos. En un mundo saturado de información, el verdadero poder no es tener más datos, sino tener la mejor narrativa para interpretarlos. La estética es ética; la forma en que presentamos una idea determina su capacidad de supervivencia en la mente del otro."
  },
  skills: [
    "Decodificación Simbólica",
    "Ciberseguridad Humana",
    "Storytelling de Datos",
    "Diseño de Rituales Corporativos",
    "Cartografía del Caos"
  ]
};

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 1,
    title: "Protocolo Neón: Rebranding Cultural",
    clientType: "Festival de Arte Independiente",
    role: "Lead Strategist & Storyteller",
    challenge: "La marca sufría de un 'Laberinto de Mensajes'. Baja asistencia y confusión sobre su valor único.",
    solution: "Aplicamos un 'Story Flip'. Reencuadramos el caos logístico como una narrativa de resistencia underground ('La Falla en el Sistema').",
    impact: "+35% venta de boletos. Creación del 'Manual de Narrativa de Guerrilla'.",
    tags: ["Storytelling", "Crisis Mgmt", "Rebranding"],
    status: "Deployed"
  },
  {
    id: 2,
    title: "Escudo Humano Digital",
    clientType: "Tech Startup (Fintech)",
    role: "Consultora de Ciberseguridad Humana",
    challenge: "Fuga de ideas y fricción interna. El equipo técnico no se hablaba con el equipo creativo.",
    solution: "Implementación de 'Rituales de Cierre' y auditoría de flujos de comunicación bajo el arquetipo 'La Chola' (Lealtad y Límites).",
    impact: "Reducción del 20% en fricción operativa. 0 incidentes de pérdida de datos en 6 meses.",
    tags: ["Human Ops", "Culture Design", "Security"],
    status: "Deployed"
  },
  {
    id: 3,
    title: "Dashboard Oráculo V1",
    clientType: "ONG de Impacto Social",
    role: "Data Visualization Architect",
    challenge: "Exceso de datos ('Data Swamp'), parálisis por análisis en la junta directiva.",
    solution: "Diseño de un dashboard minimalista enfocado en solo 3 KPIs narrativos. Transformamos reportes de 50 páginas en 1 visualización.",
    impact: "Tiempo de toma de decisiones reducido de 3h a 15min. Financiamiento asegurado.",
    tags: ["Data Viz", "UI/UX", "Strategy"],
    status: "Deployed"
  },
  {
    id: 4,
    title: "Sistema Operativo SRAP (SaaS)",
    clientType: "Mandala Vivo Studio (Interno)",
    role: "Product Owner",
    challenge: "Escalar la metodología de consultoría 1:1 a un producto digital automatizado.",
    solution: "Gamificación del proceso de consultoría. Creación de la 'Chalamandra QuantumMind Interface'.",
    impact: "Prototipo funcional activo. Validación de mercado en curso.",
    tags: ["Product Dev", "React", "Gamification"],
    status: "In Progress"
  }
];

export const PEDAGOGIES_DATA: Pedagogy[] = [
  {
    id: 0,
    title: "Pensamiento Multicolor",
    emoji: "🎨",
    details: {
      Tipo: "Alquimia Mental de Perspectivas",
      Disrupción: "Desmantela la rigidez lineal para navegar una situación desde seis ópticas simultáneas.",
      Aplicación: "Activación multidimensional del insight, negociaciones complejas.",
      Valor_SRAP: "La mente, al igual que un prisma, revela la verdad solo al descomponer la luz."
    },
    scores: [5, 4, 3]
  },
  {
    id: 1,
    title: "Design Thinking",
    emoji: "💡",
    details: {
      Tipo: "Cartografía Empática",
      Disrupción: "Coloca la empatía en el centro exacto del proceso de innovación.",
      Aplicación: "Creación de soluciones ancladas en la necesidad real.",
      Valor_SRAP: "El método se curva ante la emoción, uniendo intuición con funcionalidad."
    },
    scores: [3, 5, 5]
  },
  {
    id: 2,
    title: "LEGO® Serious Play",
    emoji: "🧱",
    details: {
      Tipo: "Arquitectura de Manos",
      Disrupción: "Otorga a las manos el estatus de mente.",
      Aplicación: "Modelado de identidades organizacionales, visiones estratégicas.",
      Valor_SRAP: "La materia despierta la conciencia. El cuerpo piensa antes de que la voz hable."
    },
    scores: [5, 5, 4]
  },
  {
    id: 3,
    title: "World Café",
    emoji: "☕",
    details: {
      Tipo: "Ecosistema de Ideas",
      Disrupción: "Convierte el espacio en un campo de fertilización cruzada.",
      Aplicación: "Co-creación masiva, diagnóstico comunitario.",
      Valor_SRAP: "El saber no reside en un solo punto, sino en el eco entre diálogos."
    },
    scores: [2, 3, 5]
  },
  {
    id: 4,
    title: "Método Disney",
    emoji: "🏰",
    details: {
      Tipo: "Trilogía del Creador",
      Disrupción: "Canaliza la creatividad a través de roles puros: Soñador, Realista, Crítico.",
      Aplicación: "Diseño de proyectos con alma, storytelling de alto impacto.",
      Valor_SRAP: "La mente se convierte en escenografía."
    },
    scores: [4, 5, 2]
  },
  {
    id: 5,
    title: "1-2-4-Todos",
    emoji: "👥",
    details: {
      Tipo: "Geometría de la Voz",
      Disrupción: "Garantiza que la voz más pequeña se amplifique.",
      Aplicación: "Recolección rápida de ideas, inclusión radical.",
      Valor_SRAP: "La partícula individual se fusiona en la onda colectiva."
    },
    scores: [1, 2, 5]
  },
  {
    id: 6,
    title: "Open Space",
    emoji: "🌀",
    details: {
      Tipo: "Emergencia Consciente",
      Disrupción: "El grupo diseña su propio orden y temario.",
      Aplicación: "Laboratorios de innovación, cumbres de propósito.",
      Valor_SRAP: "Cuando existe un propósito, el caos es la metodología."
    },
    scores: [2, 4, 5]
  },
  {
    id: 7,
    title: "Gamestorming",
    emoji: "🎲",
    details: {
      Tipo: "Ritual Lúdico Estratégico",
      Disrupción: "Introduce la ligereza del juego como motor de estrategia.",
      Aplicación: "Deshielo de equipos, liberación creativa.",
      Valor_SRAP: "Jugar es el permiso más elevado para pensar."
    },
    scores: [3, 5, 4]
  },
  {
    id: 8,
    title: "Mapa Simbólico",
    emoji: "🗺️",
    details: {
      Tipo: "Iconografía del Proceso",
      Disrupción: "Sustituye la linealidad del texto por representación gráfica.",
      Aplicación: "Exposición de sistemas complejos, meditación visual.",
      Valor_SRAP: "La forma es la que enseña."
    },
    scores: [5, 4, 2]
  },
  {
    id: 9,
    title: "Aprendizaje Experiencial",
    emoji: "🌱",
    details: {
      Tipo: "Conocimiento Vivo",
      Disrupción: "El entorno y la acción se convierten en la fuente del saber.",
      Aplicación: "Inmersiones artísticas, simulaciones de alta fidelidad.",
      Valor_SRAP: "La experiencia es el conocimiento que no se olvida."
    },
    scores: [3, 4, 3]
  }
];

export const PORTFOLIO_DATA: PortfolioItem[] = [
  {
    id: 1,
    title: "El Messi del Malandro",
    icon: "⚽💥",
    anecdote: "En la cancha de concreto del barrio, Jorge no corría detrás del balón; se paraba en el centro del terreno con los brazos cruzados y nos decía: 'En la calle y en el negocio, la jugada no la hace el que patea más fuerte, sino el que sabe dónde va a rebotar el balón tres segundos antes de que toque el suelo.' Jorge transformaba la bronca en táctica pura. Nos enseñó a mapear cada movimiento de la vida como un partido de liguilla: quién conduce el ritmo, quién remata sin dudar, quién es la muralla inamovible que aguanta los golpes y quién enlaza las partes divididas para que la estrategia funcione.",
    methodology: "Cartografía mental + metáfora deportiva callejera.",
    insight: "Convertir su lógica en metáfora me permitió entrar en su juego. (Insight: Quien controla el encuadre controla el significado.)"
  },
  {
    id: 2,
    title: "El Kit del Malandro",
    icon: "🛠️💎",
    anecdote: "Una noche de llovizna, sentados en las escaleras del callejón, Jorge abrió su vieja mochila desgastada y sacó sus cosas una por una: una llave oxidada, una cinta negra, una lámpara sorda y una navaja sin filo. 'Mira morra,' me dijo mirándome a los ojos, 'en la calle no sobrevive el más fuerte ni el más letrado. Sobrevive el que trae su kit calibrado a la mano. Cada herramienta tiene su momento: hay momentos para soltar la bomba de verdad, momentos para ponerse los lentes oscuros y hacerse el ciego, y momentos para ponerle corazón y venda a las heridas del equipo. Si sales al barrio con la mochila vacía, te comen vivo.'",
    methodology: "Gamificación + Design Thinking.",
    insight: "Su dureza era autoprotección. (Insight: Los problemas cambian, los patrones riman.)"
  },
  {
    id: 3,
    title: "Los 6 Sombreros",
    icon: "🎩🌈",
    anecdote: "Cuando la tensión explotó en la esquina por un malentendido de dinero y lealtad, los gritos ya estaban por convertirse en empujones. En lugar de sacar los puños, Jorge sacó seis gorras de colores del maletero de su coche y las aventó a la mesa de plástico. 'A ver, cabrones,' gritó con voz firme, 'aquí nadie se va a partir la madre hasta que todos se pongan el sombrero que les toca. Tú dame datos fríos con la gorra blanca, tú desahoga tu rabia con la roja, tú dime el peor escenario con la negra, y tú búscale la salida creativa con la verde.' Ver a los tipos más duros del barrio cambiando de perspectiva a través de gorras imaginarias transformó una pelea violenta en una sesión de negociación estratégica impecable.",
    methodology: "Pensamiento lateral + role play callejero.",
    insight: "Cambiar el marco hizo que la tensión se volviera colaboración. (Insight: Sostén dos ideas opuestas hasta parir una tercera.)"
  },
  {
    id: 4,
    title: "Cartografía del Caos",
    icon: "🗺️💀",
    anecdote: "Durante semanas, el proyecto estuvo sumergido en un silencio tóxico, mensajes cifrados de madrugada y llamadas no contestadas. Me sentía atrapada en un laberinto sin salida donde cualquier paso en falso detonaba una mina. Jorge agarró una pluma sobre una servilleta grasosa en la fonda y dibujó un mapa del barrio: 'El caos no es un monstruo invencible; es solo un territorio que no has dibujado. Tienes zonas rojas de peligro donde no debes meterte solo, zonas verdes de seguridad donde puedes respirar con tus aliados, y rutas azules de escape cuando el ambiente se ponga espeso. Dibuja el terreno antes de dar el paso.'",
    methodology: "Cartografía emocional + mapa estilo videojuego callejero.",
    insight: "El verdadero caos era la falta de mapa. La cartografía permite anticipar y pivotar."
  },
  {
    id: 5,
    title: "El Pastelote Emocional",
    icon: "🎂😂",
    anecdote: "Tras una discusión intensa que dejó al equipo en silencio total por tres días, Jorge apareció de la nada en el taller cargando un pastel gigante de chocolate con una vela encendida. Sin decir una sola palabra solemnemente dura, partió el pastel en rebanadas chuecas y dijo: 'En el barrio, si te tragas la rabia entera te empachas y mueres. Hay que picar el pastelote emocional en rebanadas: un pedazo de encabronamiento para reírnos, un pedazo de miedo para estar alerta, y una rebanada grande de alegría porque seguimos vivos.' Procesar el conflicto con humor negro y chocolate nos devolvió la fluidez operativa inmediatamente.",
    methodology: "Gestalt + metáfora sensorial callejera.",
    insight: "Procesar emociones con humor permite liberar el barrio interior sin heridas."
  },
  {
    id: 6,
    title: "Ritual Herramienta Rota",
    icon: "🛠️🕯️",
    anecdote: "Se nos rompió la herramienta principal a mitad del trabajo más crítico del año; la frustración nos tenía al borde del colapso. Jorge detuvo todo, recogió los pedazos de metal fracturado con sus manos grasosas, los colocó al centro de una tabla de madera y encendió tres veladoras de San Judas. 'Las herramientas no se rompen por mala suerte, morra,' dijo en voz baja. 'Se rompen porque cumplieron su ciclo y te dieron todo lo que tenían. No le tengas coraje a lo que se rompió; ríndele tributo, aprende la lección que dejó su falla y usa el metal viejo para forjar la herramienta que sigue.' Ese ritual transformó el luto por la pérdida en maestría.",
    methodology: "Ritualización + cierre simbólico estilo barrio.",
    insight: "Lo roto también enseña si lo honras. La pérdida es una lección de maestría."
  },
  {
    id: 7,
    title: "El Mapa de la Trampa",
    icon: "🎲🕵️‍♀️",
    anecdote: "Sentía que cada decisión que tomaba en el negocio me llevaba directo a una trampa: clientes que no pagaban, colaboradores que saboteaban en silencio y ofertas que parecían oro pero eran veneno. Jorge me hizo sentarme y dibujar un tablero de serpientes y escaleras sobre una tabla de triplay. 'Toda calle tiene sus trampas invisibles, mija,' explicó mientras tiraba dos dados de madera. 'Las trampas no están ahí para destruirte; están ahí para probar si aprendiste a leer los patrones. Si caes en la trampa, pagas la multa, te sacudes el polvo y vuelves a tirar los dados. Reconocer la trampa desde antes es lo que te permite desbloquear el siguiente nivel.'",
    methodology: "Game design + cartografía simbólica street adventure.",
    insight: "Muchas trampas eran internas: miedos y bloqueos. Reconocerlos = desbloquear niveles."
  },
  {
    id: 8,
    title: "El Hackeo del 1%",
    icon: "🔥🧠",
    anecdote: "Veía a decenas de creativos y consultores talentosos regalando todo su trabajo en redes sociales hasta quedar exhaustos y en la quiebra. Hablando con Jorge mientras ajustábamos una máquina, entendí la regla de oro: 'En la calle, nadie respeta lo que le regalas sin esfuerzo. Si les regalas la comida, no valoran la cocina.' Así nació el Chalamandra Funnel: regalas la historia que engancha y conmueve (la Historia Gratis que construye comunidad), pero vendes la metodología exacta que estructura y resuelve la vida (la Metodología Pagada). No hackeas a la gente; hackeas los incentivos del sistema.",
    methodology: "Modelo 'Historia Gratis, Metodología Pagada' (Chalamandra Funnel).",
    insight: "No hackeas reglas, hackeas incentivos. El contenido que vende sin vender."
  },
  {
    id: 9,
    title: "La Ciberseeridad",
    icon: "👁️👾",
    anecdote: "Cuando los servidores cayeron y la plataforma principal colapsó en medio de una presentación con inversionistas, el equipo entero estaba entrando en pánico. Sin embargo, nos sentamos a tomar café tranquilos porque días antes habíamos previsto la falla analizando la fricción humana del código. 'El bug nunca es un error casual,' decía Jorge mientras daba un sorbo a su taza; 'el bug es un oráculo que te muestra exactamente dónde le duele la estructura al sistema. Si escuchas las grietas antes de que se rompa la pared, el colapso solo es un descanso programado.'",
    methodology: "Análisis Predictivo de Vulnerabilidades + Intuición Digital.",
    insight: "El bug no es un error, es un oráculo que te dice dónde duele la estructura."
  }
];

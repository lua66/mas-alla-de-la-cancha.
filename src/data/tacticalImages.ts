export interface TacticalImageOption {
  id: string;
  name: string;
  description: string;
  path: string;
  category: string;
  tags: string[];
}

export const TACTICAL_IMAGE_GALLERY: TacticalImageOption[] = [
  {
    id: 'coach-board-timeout',
    name: 'Pizarra en Tiempo Muerto',
    description: 'Manos de la entrenadora dibujando jugadas en la pizarra con rotulador en pleno partido.',
    path: '/assets/coach_tactics_board_1792831347508.jpg',
    category: 'Táctica',
    tags: ['pizarra', 'timeout', 'sistemas', 'estrategia', 'jugadas', 'tiempo muerto']
  },
  {
    id: 'drill-training-whistle',
    name: 'Entrenamiento con Silbato',
    description: 'Entrenadora dirigiendo con silbato una intensa sesión de defensa en pista de parqué.',
    path: '/assets/basketball_drill_training_1792831347584.jpg',
    category: 'Entrenamiento',
    tags: ['entrenamiento', 'defensa', 'ejercicios', 'formacion', 'cantera', 'intensidad', 'silbato']
  },
  {
    id: 'timeout-huddle',
    name: 'Piña y Banquillo',
    description: 'Jugadores concentrados en corro alrededor de la pizarra en un final de cuarto ajustado.',
    path: '/assets/game_timeout_huddle_1792831347076.jpg',
    category: 'Vestuario',
    tags: ['liderazgo', 'vestuario', 'comunicacion', 'banquillo', 'presion', 'finales']
  },
  {
    id: 'hero-tactics-clipboard',
    name: 'Pizarra Táctica y Balón',
    description: 'Pizarra clásica de entrenador con clip, rotulador y balón oficial de baloncesto.',
    path: '/assets/hero_basketball_tactics_1792680998647.jpg',
    category: 'Táctica',
    tags: ['pizarra', 'criterio', 'tactica', 'baloncesto', 'balon']
  },
  {
    id: 'pick-and-roll-court',
    name: 'Pick & Roll en Parqué',
    description: 'Balón de baloncesto sobre parqué con líneas de zona y tiro libre.',
    path: '/assets/article_pick_and_roll_1792680999088.jpg',
    category: 'Ataque',
    tags: ['pick and roll', 'bloqueo', 'ataque', 'espacio', 'spacing', 'tiro']
  },
  {
    id: 'defense-transition',
    name: 'Transición y Balance',
    description: 'Jugadoras esprintando en transición en la pista de baloncesto.',
    path: '/assets/article_defense_transition_1792681001204.jpg',
    category: 'Defensa',
    tags: ['balance defensivo', 'transicion', 'contraataque', 'defensa', 'carrera']
  },
  {
    id: 'fundamentals-notebook',
    name: 'Fundamentos y Libreta',
    description: 'Cuaderno de notas técnicas de baloncesto, esquemas y conceptos.',
    path: '/assets/article_fundamentals_coaching_1792680999886.jpg',
    category: 'Fundamentos',
    tags: ['fundamentos', 'pase', 'bote', 'metodologia', 'cuaderno']
  },
  {
    id: 'tactical-board-bench',
    name: 'Banquillo y Cancha',
    description: 'Pizarra táctica de pizarra negra con silbato y balón en el banquillo.',
    path: '/assets/og_share_card_1792757298461.jpg',
    category: 'General',
    tags: ['banquillo', 'cancha', 'partido', 'pizarra']
  }
];

export const getMatchingImageForArticle = (title: string, category: string, content?: string): string => {
  const text = `${title} ${category} ${content || ''}`.toLowerCase();

  if (text.includes('tiempo muerto') || text.includes('final') || text.includes('huddle') || text.includes('vestuario') || text.includes('liderazgo') || text.includes('ego')) {
    return '/assets/game_timeout_huddle_1792831347076.jpg';
  }
  if (text.includes('ejercicio') || text.includes('entrenamiento') || text.includes('drill') || text.includes('cantera') || text.includes('formacion') || text.includes('practica')) {
    return '/assets/basketball_drill_training_1792831347584.jpg';
  }
  if (text.includes('balance') || text.includes('transicion') || text.includes('contraataque') || text.includes('recuperacion') || text.includes('carrera')) {
    return '/assets/article_defense_transition_1792681001204.jpg';
  }
  if (text.includes('pick') || text.includes('bloqueo') || text.includes('espacio') || text.includes('spacing') || text.includes('tiro') || text.includes('ataque')) {
    return '/assets/article_pick_and_roll_1792680999088.jpg';
  }
  if (text.includes('pase') || text.includes('bote') || text.includes('fundamento') || text.includes('metodologia') || text.includes('tecnica')) {
    return '/assets/article_fundamentals_coaching_1792680999886.jpg';
  }
  if (text.includes('pizarra') || text.includes('sistema') || text.includes('jugada') || text.includes('defensiva') || text.includes('zona')) {
    return '/assets/coach_tactics_board_1792831347508.jpg';
  }

  // Default fallback image
  return '/assets/hero_basketball_tactics_1792680998647.jpg';
};

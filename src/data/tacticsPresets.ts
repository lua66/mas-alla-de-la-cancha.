import { TacticalPlay, PlayerToken } from '../types/tactics';

export const DEFAULT_HALF_COURT_PLAYERS: PlayerToken[] = [
  // 5 Offensive players
  { id: 'off-1', type: 'offense', label: '1', x: 400, y: 150, roleName: 'Base (Point Guard)' },
  { id: 'off-2', type: 'offense', label: '2', x: 640, y: 320, roleName: 'Escolta / Tirador (Corner)' },
  { id: 'off-3', type: 'offense', label: '3', x: 160, y: 260, roleName: 'Alero (Wing)' },
  { id: 'off-4', type: 'offense', label: '4', x: 570, y: 200, roleName: 'Ala-Pívot (Slot)' },
  { id: 'off-5', type: 'offense', label: '5', x: 340, y: 250, roleName: 'Pívot (High Post / Elbow)' },
  
  // 5 Defensive players
  { id: 'def-1', type: 'defense', label: 'X1', x: 400, y: 190, roleName: 'Defensor del Base' },
  { id: 'def-2', type: 'defense', label: 'X2', x: 610, y: 330, roleName: 'Defensor de Esquina' },
  { id: 'def-3', type: 'defense', label: 'X3', x: 190, y: 275, roleName: 'Defensor de Alero' },
  { id: 'def-4', type: 'defense', label: 'X4', x: 540, y: 220, roleName: 'Defensor de Ala-Pívot' },
  { id: 'def-5', type: 'defense', label: 'X5', x: 360, y: 275, roleName: 'Defensor de Pívot' },

  // Ball
  { id: 'ball-1', type: 'ball', label: '🏀', x: 420, y: 155, roleName: 'Balón de Juego' }
];

export const DEFAULT_FULL_COURT_PLAYERS: PlayerToken[] = [
  { id: 'off-1', type: 'offense', label: '1', x: 360, y: 260, roleName: 'Base' },
  { id: 'off-2', type: 'offense', label: '2', x: 480, y: 120, roleName: 'Escolta' },
  { id: 'off-3', type: 'offense', label: '3', x: 480, y: 400, roleName: 'Alero' },
  { id: 'off-4', type: 'offense', label: '4', x: 200, y: 260, roleName: 'Sacador' },
  { id: 'off-5', type: 'offense', label: '5', x: 620, y: 260, roleName: 'Pívot' },

  { id: 'def-1', type: 'defense', label: 'X1', x: 320, y: 260, roleName: 'Presión al Base' },
  { id: 'def-2', type: 'defense', label: 'X2', x: 440, y: 130, roleName: 'Defensa Línea de Pase' },
  { id: 'def-3', type: 'defense', label: 'X3', x: 440, y: 390, roleName: 'Defensa Línea de Pase' },
  { id: 'def-4', type: 'defense', label: 'X4', x: 220, y: 240, roleName: 'Presión al Saque' },
  { id: 'def-5', type: 'defense', label: 'X5', x: 590, y: 260, roleName: 'Último Hombre (Safety)' },

  { id: 'ball-1', type: 'ball', label: '🏀', x: 200, y: 275, roleName: 'Balón de Juego' }
];

export const DEFAULT_BLANK_PLAY: TacticalPlay = {
  id: 'play-clean-board',
  title: 'Pizarra en Blanco (Nueva Jugada)',
  category: 'Ataque por Conceptos',
  courtType: 'half',
  concept: 'Diseño táctico libre',
  notes: '',
  players: DEFAULT_HALF_COURT_PLAYERS,
  lines: [],
  author: 'Coach Leyanis Horta',
  createdAt: '2026-10-25',
  isPreset: false
};

export const INITIAL_PRESET_PLAYS: TacticalPlay[] = [
  DEFAULT_BLANK_PLAY
];

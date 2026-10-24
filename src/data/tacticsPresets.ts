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

export const INITIAL_PRESET_PLAYS: TacticalPlay[] = [
  {
    id: 'preset-pick-and-roll',
    title: 'Bloqueo Directo Lateral (Side Pick & Roll)',
    category: 'Ataque por Conceptos',
    courtType: 'half',
    concept: 'Ataque con lectura de ayudas',
    notes: 'El base (1) ataca el codo libre tras bloqueo directo de (5). El tirador (2) clava los pies en la esquina contraria para castigar si su defensor X2 ayuda en la pintura. Si X4 salta al trap, el pase de escape va a (4).',
    isPreset: true,
    createdAt: '2026-10-20',
    players: [
      { id: 'off-1', type: 'offense', label: '1', x: 420, y: 170, roleName: 'Base (Manejador)' },
      { id: 'off-5', type: 'offense', label: '5', x: 380, y: 185, roleName: 'Pívot (Bloqueador)' },
      { id: 'off-2', type: 'offense', label: '2', x: 680, y: 400, roleName: 'Tirador (Corner Débil)' },
      { id: 'off-3', type: 'offense', label: '3', x: 140, y: 290, roleName: 'Alero Fuerte' },
      { id: 'off-4', type: 'offense', label: '4', x: 590, y: 160, roleName: 'Ala-Pívot (Spacing)' },
      { id: 'def-1', type: 'defense', label: 'X1', x: 410, y: 205, roleName: 'Defensa de 1' },
      { id: 'def-5', type: 'defense', label: 'X5', x: 360, y: 225, roleName: 'Defensa de 5 (Drop)' },
      { id: 'def-2', type: 'defense', label: 'X2', x: 620, y: 380, roleName: 'Defensa de 2' },
      { id: 'def-3', type: 'defense', label: 'X3', x: 180, y: 280, roleName: 'Defensa de 3' },
      { id: 'def-4', type: 'defense', label: 'X4', x: 550, y: 180, roleName: 'Defensa de 4' },
      { id: 'ball-1', type: 'ball', label: '🏀', x: 435, y: 180, roleName: 'Balón' }
    ],
    lines: [
      {
        id: 'l-1',
        type: 'screen',
        color: '#E11D48',
        points: [{ x: 380, y: 185 }, { x: 405, y: 200 }],
        description: 'Bloqueo legal de 5 sobre X1'
      },
      {
        id: 'l-2',
        type: 'dribble',
        color: '#EA580C',
        points: [{ x: 420, y: 170 }, { x: 470, y: 240 }, { x: 450, y: 310 }],
        description: 'Penetración del base atacando el aro'
      },
      {
        id: 'l-3',
        type: 'cut',
        color: '#0284C7',
        points: [{ x: 380, y: 185 }, { x: 390, y: 340 }],
        description: 'Continuación rodando hacia canasta (Roll)'
      },
      {
        id: 'l-4',
        type: 'pass',
        color: '#F59E0B',
        points: [{ x: 450, y: 310 }, { x: 670, y: 395 }],
        description: 'Pase doblado a la esquina para triple liberado'
      }
    ]
  },
  {
    id: 'preset-balance-defensivo',
    title: 'Organización del Balance Defensivo',
    category: 'Táctica Defensiva',
    courtType: 'full',
    concept: 'Transición defensiva innegociable',
    notes: 'Regla de oro de Coach Leyanis: el balanceador primario (1) esprinta de espaldas a defender la canasta propia (Safety). (2) hostiga el primer pase de salida. (3) y (4) repliegan por el carril central.',
    isPreset: true,
    createdAt: '2026-10-18',
    players: [
      { id: 'off-1', type: 'offense', label: '1', x: 260, y: 260, roleName: 'Safety (Protege aro propio)' },
      { id: 'off-2', type: 'offense', label: '2', x: 660, y: 260, roleName: 'Presión al reboteador' },
      { id: 'off-3', type: 'offense', label: '3', x: 460, y: 180, roleName: 'Carril central repliegue' },
      { id: 'off-4', type: 'offense', label: '4', x: 460, y: 340, roleName: 'Carril central repliegue' },
      { id: 'off-5', type: 'offense', label: '5', x: 690, y: 210, roleName: 'Rebote de ataque' },
      { id: 'def-1', type: 'defense', label: 'R1', x: 630, y: 120, roleName: 'Base rival' },
      { id: 'def-2', type: 'defense', label: 'R2', x: 630, y: 400, roleName: 'Escolta rival' },
      { id: 'def-3', type: 'defense', label: 'R3', x: 530, y: 190, roleName: 'Alero rival' },
      { id: 'def-4', type: 'defense', label: 'R4', x: 530, y: 330, roleName: 'Ala-pívot rival' },
      { id: 'def-5', type: 'defense', label: 'R5', x: 710, y: 260, roleName: 'Pívot rival con rebote' },
      { id: 'ball-1', type: 'ball', label: '🏀', x: 710, y: 245, roleName: 'Balón rival' }
    ],
    lines: [
      {
        id: 'l-b1',
        type: 'cut',
        color: '#0284C7',
        points: [{ x: 260, y: 260 }, { x: 120, y: 260 }],
        description: 'Esprint a la pintura propia'
      },
      {
        id: 'l-b2',
        type: 'cut',
        color: '#0284C7',
        points: [{ x: 460, y: 180 }, { x: 300, y: 220 }],
        description: 'Recuperación embudo central'
      },
      {
        id: 'l-b3',
        type: 'cut',
        color: '#0284C7',
        points: [{ x: 460, y: 340 }, { x: 300, y: 300 }],
        description: 'Recuperación embudo central'
      }
    ]
  },
  {
    id: 'preset-4-out-1-in',
    title: 'Estructura 4 Abiertos y 1 Interior (4-Out 1-In)',
    category: 'Ataque por Conceptos',
    courtType: 'half',
    concept: 'Espaciamiento geométrico y cortes directos',
    notes: 'Máxima separación. El balón circula con pases rápidos. Cuando el pívot (5) recibe en poste medio, genera un 2v1 si cortan los aleros por la espalda de la defensa (Backdoor cut).',
    isPreset: true,
    createdAt: '2026-10-15',
    players: [
      { id: 'off-1', type: 'offense', label: '1', x: 400, y: 110, roleName: 'Base (Top)' },
      { id: 'off-2', type: 'offense', label: '2', x: 190, y: 190, roleName: 'Alero Izquierdo' },
      { id: 'off-3', type: 'offense', label: '3', x: 610, y: 190, roleName: 'Alero Derecho' },
      { id: 'off-4', type: 'offense', label: '4', x: 150, y: 390, roleName: 'Córner Izquierdo' },
      { id: 'off-5', type: 'offense', label: '5', x: 400, y: 290, roleName: 'Poste Interior' },
      { id: 'def-1', type: 'defense', label: 'X1', x: 400, y: 145, roleName: 'Defensor 1' },
      { id: 'def-2', type: 'defense', label: 'X2', x: 230, y: 210, roleName: 'Defensor 2' },
      { id: 'def-3', type: 'defense', label: 'X3', x: 570, y: 210, roleName: 'Defensor 3' },
      { id: 'def-4', type: 'defense', label: 'X4', x: 190, y: 380, roleName: 'Defensor 4' },
      { id: 'def-5', type: 'defense', label: 'X5', x: 400, y: 320, roleName: 'Defensor 5' },
      { id: 'ball-1', type: 'ball', label: '🏀', x: 420, y: 110, roleName: 'Balón' }
    ],
    lines: [
      {
        id: 'l-4o1',
        type: 'pass',
        color: '#F59E0B',
        points: [{ x: 400, y: 110 }, { x: 190, y: 190 }],
        description: 'Pase a 45 grados'
      },
      {
        id: 'l-4o2',
        type: 'pass',
        color: '#F59E0B',
        points: [{ x: 190, y: 190 }, { x: 400, y: 290 }],
        description: 'Entrada al poste interior'
      },
      {
        id: 'l-4o3',
        type: 'cut',
        color: '#0284C7',
        points: [{ x: 150, y: 390 }, { x: 380, y: 430 }],
        description: 'Corte por línea de fondo (Baseline cut)'
      }
    ]
  },
  {
    id: 'preset-zona-23',
    title: 'Ataque contra Defensa en Zona 2-3',
    category: 'Lectura Táctica',
    courtType: 'half',
    concept: 'Sobrecarga y flash al tiro libre',
    notes: 'No abusar del bote contra defensas zonales. La clave es el flash del atacante (4) al centro de la bombilla para forzar a colapsar a los dos defensores de arriba.',
    isPreset: true,
    createdAt: '2026-10-10',
    players: [
      { id: 'off-1', type: 'offense', label: '1', x: 340, y: 120, roleName: 'Base en Cabecera' },
      { id: 'off-2', type: 'offense', label: '2', x: 590, y: 180, roleName: 'Escolta Sobrecarga' },
      { id: 'off-3', type: 'offense', label: '3', x: 670, y: 410, roleName: 'Tirador de Esquina' },
      { id: 'off-4', type: 'offense', label: '4', x: 400, y: 250, roleName: 'Flash a Tiro Libre' },
      { id: 'off-5', type: 'offense', label: '5', x: 480, y: 370, roleName: 'Poste Corto' },
      { id: 'def-1', type: 'defense', label: 'Z1', x: 330, y: 180, roleName: 'Zona Arriba Izq.' },
      { id: 'def-2', type: 'defense', label: 'Z2', x: 470, y: 180, roleName: 'Zona Arriba Dcha.' },
      { id: 'def-3', type: 'defense', label: 'Z3', x: 220, y: 340, roleName: 'Zona Abajo Izq.' },
      { id: 'def-4', type: 'defense', label: 'Z4', x: 400, y: 370, roleName: 'Zona Centro' },
      { id: 'def-5', type: 'defense', label: 'Z5', x: 580, y: 340, roleName: 'Zona Abajo Dcha.' },
      { id: 'ball-1', type: 'ball', label: '🏀', x: 360, y: 125, roleName: 'Balón' }
    ],
    lines: [
      {
        id: 'l-z1',
        type: 'pass',
        color: '#F59E0B',
        points: [{ x: 340, y: 120 }, { x: 590, y: 180 }],
        description: 'Inversión de balón'
      },
      {
        id: 'l-z2',
        type: 'pass',
        color: '#F59E0B',
        points: [{ x: 590, y: 180 }, { x: 400, y: 250 }],
        description: 'Pase al corazón de la zona'
      },
      {
        id: 'l-z3',
        type: 'pass',
        color: '#F59E0B',
        points: [{ x: 400, y: 250 }, { x: 660, y: 405 }],
        description: 'Pase a la esquina desprotegida'
      }
    ]
  },
  {
    id: 'preset-horns-action',
    title: 'Disposición de Cuernos (Horns Action)',
    category: 'Ataque por Conceptos',
    courtType: 'half',
    concept: 'Doble bloqueo en cabecera con lectura libre',
    notes: 'Los interiores (4) y (5) se sitúan en ambos codos de la bombilla. Los aleros (2) y (3) se anclan en las esquinas. El base elige qué lado atacar; el interior opuesto se abre (Pop) al triple.',
    isPreset: true,
    createdAt: '2026-10-08',
    players: [
      { id: 'off-1', type: 'offense', label: '1', x: 400, y: 120, roleName: 'Base Central' },
      { id: 'off-4', type: 'offense', label: '4', x: 310, y: 240, roleName: 'Poste Alto Izquierdo' },
      { id: 'off-5', type: 'offense', label: '5', x: 490, y: 240, roleName: 'Poste Alto Derecho' },
      { id: 'off-2', type: 'offense', label: '2', x: 120, y: 420, roleName: 'Corner Izquierdo' },
      { id: 'off-3', type: 'offense', label: '3', x: 680, y: 420, roleName: 'Corner Derecho' },
      { id: 'def-1', type: 'defense', label: 'X1', x: 400, y: 160, roleName: 'Defensor 1' },
      { id: 'def-4', type: 'defense', label: 'X4', x: 310, y: 270, roleName: 'Defensor 4' },
      { id: 'def-5', type: 'defense', label: 'X5', x: 490, y: 270, roleName: 'Defensor 5' },
      { id: 'def-2', type: 'defense', label: 'X2', x: 160, y: 410, roleName: 'Defensor 2' },
      { id: 'def-3', type: 'defense', label: 'X3', x: 640, y: 410, roleName: 'Defensor 3' },
      { id: 'ball-1', type: 'ball', label: '🏀', x: 420, y: 120, roleName: 'Balón' }
    ],
    lines: [
      {
        id: 'l-h1',
        type: 'screen',
        color: '#E11D48',
        points: [{ x: 490, y: 240 }, { x: 420, y: 170 }],
        description: 'Bloqueo ciego directo de 5'
      },
      {
        id: 'l-h2',
        type: 'dribble',
        color: '#EA580C',
        points: [{ x: 400, y: 120 }, { x: 470, y: 180 }, { x: 530, y: 260 }],
        description: 'Penetración por el hombro de 5'
      },
      {
        id: 'l-h3',
        type: 'cut',
        color: '#0284C7',
        points: [{ x: 310, y: 240 }, { x: 330, y: 140 }],
        description: 'Reemplazo (Pop) de 4 a la cabecera'
      }
    ]
  }
];

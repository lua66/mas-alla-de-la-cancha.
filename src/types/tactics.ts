export type CourtType = 'half' | 'full';
export type CourtTheme = 'hardwood' | 'whiteboard' | 'slate';
export type TacticalTool = 'select' | 'pass' | 'cut' | 'screen' | 'dribble' | 'shot' | 'pen' | 'eraser';

export interface PlayerToken {
  id: string;
  type: 'offense' | 'defense' | 'ball' | 'cone';
  label: string; // '1', '2', 'X1', '🏀', etc.
  x: number; // 0 - 800 SVG coordinates
  y: number; // 0 - 520 SVG coordinates
  roleName?: string;
}

export interface TacticalLine {
  id: string;
  type: 'pass' | 'cut' | 'screen' | 'dribble' | 'shot' | 'freehand';
  color: string;
  points: { x: number; y: number }[];
  description?: string;
}

export interface TacticalPlay {
  id: string;
  title: string;
  category: string;
  courtType: CourtType;
  concept: string;
  notes: string;
  players: PlayerToken[];
  lines: TacticalLine[];
  author?: string;
  createdAt: string;
  isPreset?: boolean;
}

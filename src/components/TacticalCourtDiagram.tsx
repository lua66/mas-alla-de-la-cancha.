import React, { useState } from 'react';
import { Play, RotateCcw, Shield, Sparkles } from 'lucide-react';

type PlayPreset = 'pick_and_roll' | 'balance_defensivo' | 'cuatro_abiertos' | 'zona_23';

export const TacticalCourtDiagram: React.FC = () => {
  const [activePlay, setActivePlay] = useState<PlayPreset>('pick_and_roll');

  const plays: Record<PlayPreset, {
    title: string;
    concept: string;
    description: string;
    offense: { num: number; x: number; y: number; label: string }[];
    defense: { label: string; x: number; y: number }[];
    lines: { x1: number; y1: number; x2: number; y2: number; type: 'pass' | 'cut' | 'screen' | 'dribble' }[];
  }> = {
    pick_and_roll: {
      title: 'Bloqueo Directo Lateral (Side Pick & Roll)',
      concept: 'Ataque por Conceptos',
      description: 'El base (1) ataca el codo libre tras bloqueo de (5). El tirador (2) clava los pies en la esquina contraria para castigar la ayuda de X2.',
      offense: [
        { num: 1, x: 260, y: 150, label: 'Base' },
        { num: 5, x: 245, y: 135, label: 'Pívot' },
        { num: 2, x: 420, y: 220, label: 'Tirador (Corner)' },
        { num: 3, x: 80, y: 190, label: 'Alero' },
        { num: 4, x: 380, y: 110, label: 'Ala-Pívot (Pop/Spaced)' }
      ],
      defense: [
        { label: 'X1', x: 250, y: 165 },
        { label: 'X5', x: 230, y: 150 },
        { label: 'X2', x: 390, y: 210 },
        { label: 'X3', x: 100, y: 175 },
        { label: 'X4', x: 350, y: 120 }
      ],
      lines: [
        { x1: 245, y1: 135, x2: 255, y2: 160, type: 'screen' },
        { x1: 260, y1: 150, x2: 240, y2: 210, type: 'dribble' },
        { x1: 245, y1: 135, x2: 250, y2: 240, type: 'cut' },
        { x1: 240, y1: 210, x2: 410, y2: 220, type: 'pass' }
      ]
    },
    balance_defensivo: {
      title: 'Disposición del Balance Defensivo',
      concept: 'Táctica Defensiva',
      description: 'El base (1) esprinta de espaldas protegiendo el aro (Safety). (2) hostiga el primer pase de salida. (3) y (4) repliegan por el carril central.',
      offense: [
        { num: 1, x: 250, y: 100, label: 'Safety (Atrás)' },
        { num: 2, x: 250, y: 260, label: 'Presión al saque' },
        { num: 3, x: 170, y: 180, label: 'Recupera eje' },
        { num: 4, x: 330, y: 180, label: 'Recupera eje' },
        { num: 5, x: 250, y: 230, label: 'Cierre rebote' }
      ],
      defense: [
        { label: 'R1', x: 270, y: 270 },
        { label: 'R2', x: 230, y: 270 },
        { label: 'R3', x: 120, y: 200 },
        { label: 'R4', x: 380, y: 200 },
        { label: 'R5', x: 250, y: 290 }
      ],
      lines: [
        { x1: 250, y1: 180, x2: 250, y2: 80, type: 'cut' },
        { x1: 170, y1: 220, x2: 200, y2: 130, type: 'cut' },
        { x1: 330, y1: 220, x2: 300, y2: 130, type: 'cut' }
      ]
    },
    cuatro_abiertos: {
      title: 'Estructura 4 Abiertos y 1 Interior (4-Out 1-In)',
      concept: 'Fundamentos de Ataque',
      description: 'Máximo espaciamiento geométrico. El balón circula con pases rápidos buscando invertir el lado débil para atacar por penetración o tiro liberado.',
      offense: [
        { num: 1, x: 250, y: 80, label: 'Base (Top)' },
        { num: 2, x: 100, y: 140, label: 'Alero Izquierdo' },
        { num: 3, x: 400, y: 140, label: 'Alero Derecho' },
        { num: 4, x: 120, y: 240, label: 'Córner Izquierdo' },
        { num: 5, x: 250, y: 200, label: 'Poste Bajo/Medio' }
      ],
      defense: [
        { label: 'X1', x: 250, y: 105 },
        { label: 'X2', x: 125, y: 155 },
        { label: 'X3', x: 375, y: 155 },
        { label: 'X4', x: 140, y: 235 },
        { label: 'X5', x: 250, y: 215 }
      ],
      lines: [
        { x1: 250, y1: 80, x2: 105, y2: 135, type: 'pass' },
        { x1: 100, y1: 140, x2: 115, y2: 235, type: 'pass' },
        { x1: 250, y1: 200, x2: 250, y2: 250, type: 'cut' }
      ]
    },
    zona_23: {
      title: 'Ataque contra Defensa en Zona 2-3',
      concept: 'Lectura Táctica',
      description: 'Sobrecarga de lado con flash al tiro libre (4). Triángulo en poste bajo y esquina para obligar a rotar a los tres hombres de la segunda línea.',
      offense: [
        { num: 1, x: 220, y: 90, label: 'Base' },
        { num: 2, x: 380, y: 140, label: 'Escolta' },
        { num: 3, x: 420, y: 240, label: 'Esquina' },
        { num: 4, x: 250, y: 180, label: 'Flash Tiro Libre' },
        { num: 5, x: 300, y: 240, label: 'Poste Corto' }
      ],
      defense: [
        { label: 'Z1', x: 200, y: 120 },
        { label: 'Z2', x: 300, y: 120 },
        { label: 'Z3', x: 140, y: 220 },
        { label: 'Z4', x: 250, y: 220 },
        { label: 'Z5', x: 360, y: 220 }
      ],
      lines: [
        { x1: 220, y1: 90, x2: 375, y2: 135, type: 'pass' },
        { x1: 380, y1: 140, x2: 260, y2: 175, type: 'pass' },
        { x1: 250, y1: 180, x2: 410, y2: 235, type: 'pass' }
      ]
    }
  };

  const current = plays[activePlay];

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 p-5 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-500 font-medium">
            Pizarra Táctica Interactiva
          </span>
          <h4 className="text-base font-serif font-semibold text-stone-900 dark:text-stone-100">
            {current.title}
          </h4>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-lg">
          {(Object.keys(plays) as PlayPreset[]).map(key => (
            <button
              key={key}
              onClick={() => setActivePlay(key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activePlay === key
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {key === 'pick_and_roll' && 'Pick & Roll'}
              {key === 'balance_defensivo' && 'Balance Def.'}
              {key === 'cuatro_abiertos' && '4 Abiertos'}
              {key === 'zona_23' && 'Contra Zona'}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Court & Visual Diagram */}
      <div className="mt-4 flex flex-col lg:flex-row gap-5 items-center">
        <div className="w-full max-w-[480px] bg-[#1E293B] dark:bg-[#0F172A] p-3 rounded-lg shadow-inner overflow-hidden flex flex-col items-center">
          <svg
            viewBox="0 0 500 320"
            className="w-full h-auto select-none font-sans"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
          >
            {/* Court Floor */}
            <rect x="10" y="10" width="480" height="300" rx="8" fill="#1E293B" stroke="#334155" strokeWidth="2" />

            {/* Baseline and sidelines */}
            <rect x="25" y="25" width="450" height="270" fill="none" stroke="#64748B" strokeWidth="2" />

            {/* Key / Paint area */}
            <rect x="190" y="195" width="120" height="100" fill="#253347" stroke="#94A3B8" strokeWidth="2" />
            {/* Free throw circle */}
            <path d="M 190 195 A 60 60 0 0 1 310 195" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="6,4" />
            <path d="M 190 195 A 60 60 0 0 0 310 195" fill="none" stroke="#94A3B8" strokeWidth="2" />

            {/* Restricted area arc under basket */}
            <path d="M 225 295 A 25 25 0 0 1 275 295" fill="none" stroke="#94A3B8" strokeWidth="1.5" />

            {/* Three point line */}
            <path
              d="M 55 295 L 55 240 A 195 195 0 0 1 445 240 L 445 295"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="2"
            />

            {/* Backboard and basket ring */}
            <line x1="220" y1="285" x2="280" y2="285" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="250" cy="275" r="9" fill="none" stroke="#EA580C" strokeWidth="2.5" />
            <line x1="250" y1="285" x2="250" y2="282" stroke="#CBD5E1" strokeWidth="2" />

            {/* Tactical connecting lines (passes, cuts, screens) */}
            {current.lines.map((line, idx) => {
              if (line.type === 'pass') {
                return (
                  <g key={`line-${idx}`}>
                    <line
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />
                    <circle cx={line.x2} cy={line.y2} r="3" fill="#F59E0B" />
                  </g>
                );
              } else if (line.type === 'cut') {
                return (
                  <g key={`line-${idx}`}>
                    <line
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke="#38BDF8"
                      strokeWidth="2.5"
                    />
                    <polygon
                      points={`${line.x2},${line.y2} ${line.x2 - 5},${line.y2 - 6} ${line.x2 + 5},${line.y2 - 6}`}
                      fill="#38BDF8"
                    />
                  </g>
                );
              } else if (line.type === 'screen') {
                return (
                  <g key={`line-${idx}`}>
                    <line
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke="#F43F5E"
                      strokeWidth="2"
                    />
                    <line
                      x1={line.x2 - 8}
                      y1={line.y2}
                      x2={line.x2 + 8}
                      y2={line.y2}
                      stroke="#F43F5E"
                      strokeWidth="3.5"
                    />
                  </g>
                );
              } else if (line.type === 'dribble') {
                return (
                  <line
                    key={`line-${idx}`}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#F97316"
                    strokeWidth="2.5"
                    strokeDasharray="3,3"
                  />
                );
              }
              return null;
            })}

            {/* Defensive players (X / Red circles) */}
            {current.defense.map((def, idx) => (
              <g key={`def-${idx}`} className="transition-all duration-300">
                <circle cx={def.x} cy={def.y} r="12" fill="#BE123C" stroke="#FDA4AF" strokeWidth="1.5" />
                <text
                  x={def.x}
                  y={def.y + 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {def.label}
                </text>
              </g>
            ))}

            {/* Offensive players (Numbered orange circles) */}
            {current.offense.map(off => (
              <g key={`off-${off.num}`} className="transition-all duration-300">
                <circle cx={off.x} cy={off.y} r="13" fill="#EA580C" stroke="#FED7AA" strokeWidth="2" />
                <text
                  x={off.x}
                  y={off.y + 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {off.num}
                </text>
              </g>
            ))}
          </svg>

          {/* SVG Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-[11px] text-stone-300">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
              Ataque (1-5)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
              Defensa (X)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 border-b-2 border-dashed border-amber-400 inline-block"></span>
              Pase
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 border-b-2 border-sky-400 inline-block"></span>
              Corte / Desplazamiento
            </span>
          </div>
        </div>

        {/* Coach Analysis description */}
        <div className="flex-1 space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
              Apunte del Cuaderno Técnico:
            </p>
            <p className="text-sm text-stone-700 dark:text-stone-300 mt-1 leading-relaxed">
              {current.description}
            </p>
          </div>

          <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
            <p className="font-semibold text-stone-800 dark:text-stone-200">
              Posiciones y cometidos en esta pizarra:
            </p>
            <ul className="space-y-1 pl-2">
              {current.offense.map(o => (
                <li key={o.num} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0">
                    {o.num}
                  </span>
                  <span><strong>{o.label}:</strong> Ubicación táctica coordinada para garantizar líneas de pase abiertas.</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

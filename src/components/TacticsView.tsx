import React from 'react';
import { TacticalCourtDiagram } from './TacticalCourtDiagram';
import { Shield, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

export const TacticsView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400 font-semibold">
          Cuaderno de Táctica & Pizarra
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white tracking-tight mt-1">
          La Pizarra de la Entrenadora
        </h1>
        <p className="text-sm text-stone-700 dark:text-stone-200 mt-2 font-serif max-w-2xl">
          Sistemas, lecturas y disposiciones espaciales analizadas al milímetro para aplicar en tus entrenamientos y preparar partidos.
        </p>
      </div>

      {/* Main Interactive Diagram Component */}
      <div className="mb-10">
        <TacticalCourtDiagram />
      </div>

      {/* Tactical Methodological Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1C1A18] p-6 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 mb-3">
            <Shield className="w-5 h-5" />
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
              Criterio en la Defensa de Bloqueos
            </h3>
          </div>
          <p className="text-xs text-stone-700 dark:text-stone-200 leading-relaxed font-serif mb-3">
            No existe una defensa mágica para el Pick & Roll. Si juegas <strong>Drop</strong> contra un tirador de élite, te meterá 25 puntos; si juegas <strong>Show agresivo</strong> o <strong>Trap</strong> con pívots lentos, te descoserán a pases al rol del continuador.
          </p>
          <div className="p-3 bg-stone-50 dark:bg-stone-900/90 rounded-lg text-xs text-stone-800 dark:text-stone-100 space-y-1.5 border border-stone-200/60 dark:border-stone-800">
            <p><strong>Regla 1:</strong> El defensor del base debe pasar por delante si el atacante tira con más del 35% en triples.</p>
            <p><strong>Regla 2:</strong> La primera ayuda siempre sale del lado débil, nunca del hombre que marca al tirador de esquina.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1A18] p-6 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 mb-3">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
              La Filosofía del Espaciamiento (Spacing)
            </h3>
          </div>
          <p className="text-xs text-stone-700 dark:text-stone-200 leading-relaxed font-serif mb-3">
            En el baloncesto moderno, <strong>el espacio es tiempo de tiro</strong>. Cuanto más abierta esté la defensa rival, más metros debe recorrer una ayuda defensiva para llegar a puntear el tiro.
          </p>
          <div className="p-3 bg-stone-50 dark:bg-stone-900/90 rounded-lg text-xs text-stone-800 dark:text-stone-100 space-y-1.5 border border-stone-200/60 dark:border-stone-800">
            <p><strong>Regla 1:</strong> Las esquinas (corners) no se abandonan hasta que el balón entre en la pintura.</p>
            <p><strong>Regla 2:</strong> Si el balón se invierte de lado, el lado débil debe cortar en 'flash' o reemplazar la cabecera.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Lock, ArrowUp } from 'lucide-react';
import { SocialIconsRow } from './SocialLinks';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigate: (view: 'home' | 'categories' | 'tactics' | 'about' | 'archive') => void;
  authorName: string;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onNavigate, authorName }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 border-t border-stone-200 dark:border-stone-800 bg-[#F4F1EA] dark:bg-[#11100F] text-stone-600 dark:text-stone-400 py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-300/60 dark:border-stone-800/80">
          
          {/* Brand & Mission Statement */}
          <div className="text-center sm:text-left">
            <span className="font-serif font-bold text-lg text-stone-900 dark:text-white">
              Pizarra & Criterio
            </span>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 max-w-md">
              Cuaderno de criterios y pizarra táctica de baloncesto. Análisis técnico para entrenadores, árbitros y formadores deportivos.
            </p>
          </div>

          {/* Quick links & Back to top */}
          <div className="flex items-center gap-6 text-xs font-medium">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer text-stone-700 dark:text-stone-200"
            >
              Artículos
            </button>
            <button
              onClick={() => onNavigate('categories')}
              className="hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer text-stone-700 dark:text-stone-200"
            >
              Categorías
            </button>
            <button
              onClick={() => onNavigate('tactics')}
              className="hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer text-stone-700 dark:text-stone-200"
            >
              Pizarra
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer text-stone-700 dark:text-stone-200"
            >
              La Autora
            </button>
            <button
              onClick={scrollToTop}
              title="Volver arriba"
              className="p-2 rounded-lg bg-stone-200/70 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom bar with discreet author access and social channels */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-600 dark:text-stone-300">
          <p>© {new Date().getFullYear()} Pizarra & Criterio — Dirigido por {authorName}. Todos los derechos reservados.</p>

          <div className="flex items-center gap-2">
            <SocialIconsRow size="sm" variant="subtle" />
          </div>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors py-1 px-2 rounded hover:bg-stone-200/50 dark:hover:bg-stone-800 cursor-pointer"
          >
            <Lock className="w-3 h-3 text-stone-400 dark:text-stone-400" />
            <span>Acceso al Escritorio Blogger</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

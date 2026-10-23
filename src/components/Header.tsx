import React from 'react';
import { Search, Moon, Sun, Lock, BookOpen, PenTool } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'categories' | 'tactics' | 'about' | 'archive' | 'admin' | 'article';
  onNavigate: (view: 'home' | 'categories' | 'tactics' | 'about' | 'archive') => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  blogTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAdmin,
  isAdmin,
  isDarkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  blogTitle
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#141210]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark (Single element, no badges) */}
        <button
          onClick={() => onNavigate('home')}
          className="text-left group flex items-center gap-3 shrink-0 focus:outline-hidden"
        >
          {/* Subtle basketball motif icon */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15 15 0 0 1 0 20" />
              <path d="M12 2a15 15 0 0 0 0 20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-serif font-bold tracking-tight text-stone-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors whitespace-nowrap">
              {blogTitle}
            </span>
            <span className="hidden sm:block text-[11px] font-sans text-stone-600 dark:text-stone-300 tracking-wide">
              Cuaderno de Baloncesto & Criterio Técnico
            </span>
          </div>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-700 dark:text-stone-200">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer ${
              currentView === 'home' || currentView === 'article'
                ? 'text-amber-800 dark:text-amber-400 font-semibold border-b-2 border-amber-700 pb-0.5'
                : ''
            }`}
          >
            Artículos
          </button>
          <button
            onClick={() => onNavigate('categories')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer ${
              currentView === 'categories'
                ? 'text-amber-800 dark:text-amber-400 font-semibold border-b-2 border-amber-700 pb-0.5'
                : ''
            }`}
          >
            Categorías
          </button>
          <button
            onClick={() => onNavigate('tactics')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer ${
              currentView === 'tactics'
                ? 'text-amber-800 dark:text-amber-400 font-semibold border-b-2 border-amber-700 pb-0.5'
                : ''
            }`}
          >
            Pizarra Táctica
          </button>
          <button
            onClick={() => onNavigate('archive')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer ${
              currentView === 'archive'
                ? 'text-amber-800 dark:text-amber-400 font-semibold border-b-2 border-amber-700 pb-0.5'
                : ''
            }`}
          >
            Archivo
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer ${
              currentView === 'about'
                ? 'text-amber-800 dark:text-amber-400 font-semibold border-b-2 border-amber-700 pb-0.5'
                : ''
            }`}
          >
            La Entrenadora
          </button>
        </nav>

        {/* Zone 3: Search bar & Utilities (Dark mode & Author Backoffice ONLY if authenticated) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick search input */}
          <div className="relative hidden sm:block w-44 md:w-52">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar criterio o táctica..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-600 focus:bg-white dark:focus:bg-stone-900 transition-colors"
            />
          </div>

          {/* Dark Mode toggle */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Activar modo claro' : 'Activar modo nocturno'}
            aria-label="Alternar tema visual"
            className="p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors focus:outline-hidden cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>

          {/* Author Access: ONLY visible if already verified/authenticated as Leyanis */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              title="Ir a mi Escritorio Blogger"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-900 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-950/60 hover:bg-amber-200/80 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 transition-colors whitespace-nowrap focus:outline-hidden cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden lg:inline">Escritorio Blogger</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

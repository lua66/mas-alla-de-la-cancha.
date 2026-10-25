import React, { useState } from 'react';
import { Search, Moon, Sun, Lock, BookOpen, PenTool, Menu, X, LayoutGrid, Award, Folder, Calendar } from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleNavClick = (view: 'home' | 'categories' | 'tactics' | 'about' | 'archive') => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#141210]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors w-full">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Wordmark (Responsive, won't overflow on small Android screens) */}
          <button
            onClick={() => handleNavClick('home')}
            className="text-left group flex items-center gap-2 sm:gap-3 min-w-0 shrink focus:outline-hidden cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-none stroke-current stroke-2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15 15 0 0 1 0 20" />
                <path d="M12 2a15 15 0 0 0 0 20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-serif font-bold tracking-tight text-stone-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors truncate block max-w-[150px] xs:max-w-[210px] sm:max-w-none">
                {blogTitle}
              </span>
              <span className="hidden sm:block text-[11px] font-sans text-stone-600 dark:text-stone-300 tracking-wide truncate">
                Cuaderno de Baloncesto & Criterio Técnico
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-stone-700 dark:text-stone-200">
            <button
              onClick={() => handleNavClick('home')}
              className={`transition-colors whitespace-nowrap hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer ${
                currentView === 'home' || currentView === 'article'
                  ? 'text-amber-800 dark:text-amber-400 font-semibold border-b-2 border-amber-700 pb-0.5'
                  : ''
              }`}
            >
              Artículos
            </button>
            <button
              onClick={() => handleNavClick('tactics')}
              className={`transition-colors whitespace-nowrap hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer ${
                currentView === 'tactics'
                  ? 'text-amber-800 dark:text-amber-400 font-semibold border-b-2 border-amber-700 pb-0.5'
                  : ''
              }`}
            >
              Pizarra Táctica
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`transition-colors whitespace-nowrap hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer ${
                currentView === 'about'
                  ? 'text-amber-800 dark:text-amber-400 font-semibold border-b-2 border-amber-700 pb-0.5'
                  : ''
              }`}
            >
              La Entrenadora
            </button>
            <button
              onClick={() => handleNavClick('categories')}
              className={`transition-colors whitespace-nowrap hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer ${
                currentView === 'categories'
                  ? 'text-amber-800 dark:text-amber-400 font-semibold border-b-2 border-amber-700 pb-0.5'
                  : ''
              }`}
            >
              Categorías
            </button>
            <button
              onClick={() => handleNavClick('archive')}
              className={`transition-colors whitespace-nowrap hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer ${
                currentView === 'archive'
                  ? 'text-amber-800 dark:text-amber-400 font-semibold border-b-2 border-amber-700 pb-0.5'
                  : ''
              }`}
            >
              Archivo
            </button>
          </nav>

          {/* Right Action Icons & Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Desktop search bar */}
            <div className="relative hidden md:block w-36 lg:w-48">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar táctica..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full text-xs pl-7 pr-2.5 py-1.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-600 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              />
            </div>

            {/* Mobile search toggle icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Abrir buscador"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Activar modo claro' : 'Activar modo nocturno'}
              aria-label="Alternar tema visual"
              className="p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors focus:outline-hidden cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            {/* Author Access (if authenticated) */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                title="Ir a mi Escritorio Blogger"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-amber-900 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-950/60 hover:bg-amber-200/80 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 transition-colors whitespace-nowrap focus:outline-hidden cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="hidden xl:inline">Escritorio</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Button (Crucial for Android & small phones) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors focus:outline-hidden cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {isMobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 pt-1 border-t border-stone-200/60 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 animate-fade-in">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Buscar artículos o táctica..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-700"
              />
            </div>
          </div>
        )}

        {/* Mobile Slide-down Drawer Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden px-4 py-4 space-y-1.5 border-t border-stone-200 dark:border-stone-800 bg-white/98 dark:bg-[#161412]/98 shadow-lg animate-fade-in text-sm font-medium">
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                currentView === 'home' || currentView === 'article'
                  ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                  : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Artículos del Cuaderno</span>
            </button>

            <button
              onClick={() => handleNavClick('tactics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                currentView === 'tactics'
                  ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                  : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Pizarra Táctica Interactiva</span>
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                currentView === 'about'
                  ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                  : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Sobre la Entrenadora (Leyanis Horta)</span>
            </button>

            <button
              onClick={() => handleNavClick('categories')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                currentView === 'categories'
                  ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                  : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Folder className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Categorías Temáticas</span>
            </button>

            <button
              onClick={() => handleNavClick('archive')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                currentView === 'archive'
                  ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                  : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Archivo Histórico</span>
            </button>
          </nav>
        )}
      </header>

      {/* STICKY BOTTOM MOBILE NAVIGATION BAR (Optimized for Xiaomi 360-430px & MIUI/HyperOS gesture pill) */}
      <nav 
        aria-label="Navegación móvil"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/98 dark:bg-[#141210]/98 backdrop-blur-md border-t border-stone-200/90 dark:border-stone-800 pb-[max(env(safe-area-inset-bottom,0px),8px)] pt-1.5 px-2 shadow-lg"
      >
        <div className="grid grid-cols-4 items-center justify-around gap-1 max-w-md mx-auto">
          
          <button
            onClick={() => handleNavClick('home')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 cursor-pointer touch-manipulation ${
              currentView === 'home' || currentView === 'article'
                ? 'text-amber-800 dark:text-amber-400 font-bold bg-amber-500/10'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5 shrink-0" />
            <span className="text-[10px] leading-tight">Artículos</span>
          </button>

          <button
            onClick={() => handleNavClick('tactics')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 cursor-pointer touch-manipulation ${
              currentView === 'tactics'
                ? 'text-amber-800 dark:text-amber-400 font-bold bg-amber-500/10'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <LayoutGrid className="w-5 h-5 mb-0.5 shrink-0" />
            <span className="text-[10px] leading-tight">Pizarra</span>
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 cursor-pointer touch-manipulation ${
              currentView === 'about'
                ? 'text-amber-800 dark:text-amber-400 font-bold bg-amber-500/10'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Award className="w-5 h-5 mb-0.5 shrink-0" />
            <span className="text-[10px] leading-tight">Sobre Mí</span>
          </button>

          <button
            onClick={() => handleNavClick('categories')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 cursor-pointer touch-manipulation ${
              currentView === 'categories'
                ? 'text-amber-800 dark:text-amber-400 font-bold bg-amber-500/10'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Folder className="w-5 h-5 mb-0.5 shrink-0" />
            <span className="text-[10px] leading-tight">Categorías</span>
          </button>

        </div>
      </nav>
    </>
  );
};

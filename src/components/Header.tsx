import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  Moon,
  Sun,
  PenTool,
  Menu,
  X,
  BookOpen,
  LayoutGrid,
  Award,
  Folder,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Article } from '../types/blog';

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
  articles?: Article[];
  onSelectArticle?: (article: Article) => void;
}

const POPULAR_TACTICAL_TOPICS = [
  'Pick & Roll',
  'Defensa Zonal',
  'Balance Defensivo',
  'Tiro',
  'Cantera',
  'Pase Extra'
];

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAdmin,
  isAdmin,
  isDarkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  blogTitle,
  articles = [],
  onSelectArticle
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDesktopSearchFocused, setIsDesktopSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const desktopSearchContainerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Close desktop predictive dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopSearchContainerRef.current &&
        !desktopSearchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDesktopSearchFocused(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter published articles
  const publishedArticles = useMemo(() => {
    return articles.filter(a => a.status === 'published');
  }, [articles]);

  // Real-time scored search results
  const predictiveResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // When empty, return latest featured or published articles as quick suggestions
      return publishedArticles.slice(0, 4);
    }

    const queryWords = q.split(/\s+/).filter(Boolean);

    const scored = publishedArticles
      .map(article => {
        let score = 0;
        const titleLower = article.title.toLowerCase();
        const categoryLower = article.category.toLowerCase();
        const excerptLower = article.excerpt.toLowerCase();
        const tagsLower = article.tags.map(t => t.toLowerCase()).join(' ');

        // Title matches (highest weight)
        if (titleLower === q) score += 100;
        else if (titleLower.startsWith(q)) score += 60;
        else if (titleLower.includes(q)) score += 40;

        // Word-level title match
        queryWords.forEach(word => {
          if (titleLower.includes(word)) score += 15;
          if (categoryLower.includes(word)) score += 12;
          if (tagsLower.includes(word)) score += 10;
          if (excerptLower.includes(word)) score += 6;
        });

        // Category match
        if (categoryLower.includes(q)) score += 30;

        // Tag match
        if (tagsLower.includes(q)) score += 25;

        // Excerpt match
        if (excerptLower.includes(q)) score += 15;

        return { article, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 5).map(item => item.article);
  }, [publishedArticles, searchQuery]);

  // Reset selectedIndex when results or query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery, isMobileSearchOpen, isDesktopSearchFocused]);

  // Highlight matching query text in title or snippets
  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query || !query.trim()) return text;
    const trimmed = query.trim();
    // Escape regex characters
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span
          key={i}
          className="bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-300 font-semibold px-0.5 rounded-xs"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  }, []);

  const handleNavClick = (view: 'home' | 'categories' | 'tactics' | 'about' | 'archive') => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setIsDesktopSearchFocused(false);
  };

  const handleSelectArticleResult = (article: Article) => {
    if (onSelectArticle) {
      onSelectArticle(article);
    }
    setIsDesktopSearchFocused(false);
    setIsMobileSearchOpen(false);
    setSelectedIndex(-1);
  };

  const handleApplyTopicFilter = (topic: string) => {
    onSearchChange(topic);
    if (currentView !== 'home' && currentView !== 'archive') {
      onNavigate('home');
    }
  };

  // Keyboard navigation inside predictive search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < predictiveResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev > 0 ? prev - 1 : predictiveResults.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && predictiveResults[selectedIndex]) {
        handleSelectArticleResult(predictiveResults[selectedIndex]);
      } else {
        // Submit search query directly to home view
        if (currentView !== 'home' && currentView !== 'archive') {
          onNavigate('home');
        }
        setIsDesktopSearchFocused(false);
        setIsMobileSearchOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsDesktopSearchFocused(false);
      setIsMobileSearchOpen(false);
      setSelectedIndex(-1);
      desktopInputRef.current?.blur();
    }
  };

  const isPredictiveOpen =
    isDesktopSearchFocused &&
    (searchQuery.trim().length > 0 || predictiveResults.length > 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#141210]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors w-full">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Wordmark */}
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

          {/* Right Action Icons & Real-time Predictive Search */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Desktop Real-time Predictive Search Container */}
            <div
              ref={desktopSearchContainerRef}
              className="relative hidden md:block w-48 lg:w-64 focus-within:w-60 lg:focus-within:w-80 transition-all duration-200"
            >
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-2.5 pointer-events-none" />
                <input
                  ref={desktopInputRef}
                  type="text"
                  placeholder="Buscar táctica o jugada..."
                  value={searchQuery}
                  onFocus={() => setIsDesktopSearchFocused(true)}
                  onChange={e => {
                    onSearchChange(e.target.value);
                    setIsDesktopSearchFocused(true);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 focus:bg-white dark:focus:bg-stone-900 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange('');
                      desktopInputRef.current?.focus();
                    }}
                    className="absolute right-2 p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Desktop Predictive Dropdown Floating Panel */}
              {isPredictiveOpen && (
                <div className="absolute right-0 top-full mt-2 w-84 lg:w-96 bg-white dark:bg-[#181615] rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden z-50 text-xs">
                  
                  {/* Results Header */}
                  <div className="px-3.5 py-2 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900/60">
                    <span className="font-semibold text-[11px] text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      {searchQuery.trim()
                        ? `${predictiveResults.length} ${predictiveResults.length === 1 ? 'coincidencia táctica' : 'coincidencias tácticas'}`
                        : 'Sugerencias tácticas'}
                    </span>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500">
                      ↑↓ Navegar · Enter elegir
                    </span>
                  </div>

                  {/* Quick Tactical Topic Pills */}
                  {(!searchQuery.trim() || predictiveResults.length === 0) && (
                    <div className="p-3 bg-stone-50/50 dark:bg-stone-900/30 border-b border-stone-100 dark:border-stone-800/60">
                      <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-amber-600" />
                        Temas tácticos frecuentes:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_TACTICAL_TOPICS.map(topic => (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => handleApplyTopicFilter(topic)}
                            className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950/80 hover:text-amber-900 dark:hover:text-amber-300 text-[11px] text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                          >
                            #{topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Predictive Results List */}
                  {predictiveResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/60">
                      {predictiveResults.map((article, index) => {
                        const isSelected = selectedIndex === index;
                        return (
                          <button
                            key={article.id}
                            type="button"
                            onClick={() => handleSelectArticleResult(article)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`w-full p-3 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-l-2 border-amber-600'
                                : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'
                            }`}
                          >
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className="w-13 h-13 rounded-lg object-cover shrink-0 border border-stone-200 dark:border-stone-700 mt-0.5"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 truncate max-w-[140px]">
                                  {article.category}
                                </span>
                                <span className="text-[10px] text-stone-400 dark:text-stone-500 flex items-center gap-0.5 ml-auto shrink-0">
                                  <Clock className="w-2.5 h-2.5" />
                                  ~{article.readTimeMinutes}m
                                </span>
                              </div>
                              <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-1 leading-snug">
                                {highlightMatch(article.title, searchQuery)}
                              </h4>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                                {highlightMatch(article.excerpt, searchQuery)}
                              </p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0 self-center" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-stone-500 dark:text-stone-400">
                      <p className="text-xs">No se encontraron artículos con ese criterio.</p>
                      <p className="text-[11px] text-stone-400 mt-1">
                        Prueba con términos como "defensa", "bloqueo", "balón" o "tiro".
                      </p>
                    </div>
                  )}

                  {/* Dropdown Footer Action */}
                  <div className="p-2.5 bg-stone-50 dark:bg-stone-900/80 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentView !== 'home' && currentView !== 'archive') {
                          onNavigate('home');
                        }
                        setIsDesktopSearchFocused(false);
                      }}
                      className="text-amber-800 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver resultados en el cuaderno</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSearchChange('');
                        setIsDesktopSearchFocused(false);
                      }}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 text-[10px]"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile search toggle icon */}
            <button
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                setIsMobileMenuOpen(false);
                setTimeout(() => mobileInputRef.current?.focus(), 100);
              }}
              className="md:hidden p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Abrir buscador predictivo"
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

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsMobileSearchOpen(false);
              }}
              className="md:hidden p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors focus:outline-hidden cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE REAL-TIME PREDICTIVE SEARCH DRAWER (Responsive for Xiaomi 360-430px) */}
        {isMobileSearchOpen && (
          <div className="md:hidden px-3.5 pb-4 pt-2 border-t border-stone-200/80 dark:border-stone-800 bg-[#FAF8F5] dark:bg-[#161412] shadow-xl animate-fade-in max-h-[85vh] overflow-y-auto">
            
            {/* Search Input Box */}
            <div className="relative w-full flex items-center mb-3">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Buscar por jugada, defensa, tiro..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-xs pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-600"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="absolute right-2.5 text-[11px] font-semibold text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                >
                  Cerrar
                </button>
              )}
            </div>

            {/* Quick Filter Tags on Mobile */}
            <div className="mb-3">
              <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                Temas tácticos directos:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TACTICAL_TOPICS.map(topic => (
                  <button
                    key={`m-${topic}`}
                    type="button"
                    onClick={() => handleApplyTopicFilter(topic)}
                    className="px-2.5 py-1 rounded-lg bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium active:scale-95 transition-transform"
                  >
                    #{topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Predictive Results List */}
            {predictiveResults.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-medium px-1">
                  <span>
                    {searchQuery.trim()
                      ? `Resultados en tiempo real (${predictiveResults.length})`
                      : 'Artículos tácticos destacados'}
                  </span>
                  <span>Toca para abrir</span>
                </div>

                <div className="space-y-1.5 divide-y divide-stone-200/60 dark:divide-stone-800/80">
                  {predictiveResults.map(article => (
                    <button
                      key={`m-art-${article.id}`}
                      type="button"
                      onClick={() => handleSelectArticleResult(article)}
                      className="w-full pt-2 pb-2 text-left flex items-start gap-3 active:bg-amber-50 dark:active:bg-amber-950/30 rounded-lg transition-colors cursor-pointer"
                    >
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 border border-stone-200 dark:border-stone-700"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
                          {article.category}
                        </span>
                        <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
                          {highlightMatch(article.title, searchQuery)}
                        </h4>
                        <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-1">
                          <Clock className="w-2.5 h-2.5" />
                          Lectura de {article.readTimeMinutes} min
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 self-center" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-500">
                No se encontraron artículos con "{searchQuery}".
              </div>
            )}
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

      {/* STICKY BOTTOM MOBILE NAVIGATION BAR (Optimized for Xiaomi 360-430px & MIUI gesture pill) */}
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

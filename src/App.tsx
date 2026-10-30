import React, { useState, useEffect, useCallback } from 'react';
import { Article, Comment, Subscriber, BlogSettings } from './types/blog';
import { storageService } from './services/storageService';
import { updatePageSeo } from './services/seoService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetail } from './components/ArticleDetail';
import { Sidebar } from './components/Sidebar';
import { AdminPanel } from './components/AdminPanel';
import { CategoriesView } from './components/CategoriesView';
import { TacticsView } from './components/TacticsView';
import { ArchiveView } from './components/ArchiveView';
import { AboutView } from './components/AboutView';
import { AuthModal } from './components/AuthModal';
import { X, Search } from 'lucide-react';

type ViewType = 'home' | 'categories' | 'tactics' | 'about' | 'archive' | 'admin' | 'article';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('basket_blog_theme');
      return saved ? saved === 'dark' : false;
    } catch {
      return false;
    }
  });

  // Author Authentication State (Blogger protected admin)
  const [isAuthorAuthenticated, setIsAuthorAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('basket_author_session_v2') === 'authenticated';
    } catch {
      return false;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // App data state loaded from storageService (persistent)
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [settings, setSettings] = useState<BlogSettings>(storageService.getSettings());
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Navigation & View state
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Helper: map a view and optional article to an indexable URL path
  const getUrlPath = (view: ViewType, article: Article | null): string => {
    switch (view) {
      case 'tactics':
        return '/pizarra';
      case 'about':
        return '/sobre-mi';
      case 'categories':
        return '/categorias';
      case 'archive':
        return '/archivo';
      case 'admin':
        return '/admin';
      case 'article':
        return article ? `/articulo/${article.slug || article.id}` : '/';
      case 'home':
      default:
        return '/';
    }
  };

  // Helper: parse browser window.location.pathname into view + article
  const parseRouteFromLocation = useCallback((articleList: Article[]): { view: ViewType; article: Article | null } => {
    if (typeof window === 'undefined') return { view: 'home', article: null };
    const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';

    if (pathname === '/pizarra' || pathname === '/tactica') {
      return { view: 'tactics', article: null };
    }
    if (pathname === '/sobre-mi' || pathname === '/sobre-la-entrenadora' || pathname === '/la-entrenadora') {
      return { view: 'about', article: null };
    }
    if (pathname === '/categorias' || pathname === '/categoria') {
      return { view: 'categories', article: null };
    }
    if (pathname === '/archivo' || pathname === '/buscar') {
      return { view: 'archive', article: null };
    }
    if (pathname === '/admin' || pathname === '/escritorio') {
      return { view: 'admin', article: null };
    }
    if (pathname.startsWith('/articulo/')) {
      const slug = pathname.replace('/articulo/', '');
      const found = articleList.find(a => a.slug.toLowerCase() === slug || a.id.toLowerCase() === slug);
      if (found) {
        return { view: 'article', article: found };
      }
    }
    return { view: 'home', article: null };
  }, []);

  // Helper: Synchronize document title, meta description, and canonical URL
  const syncSeoForView = useCallback((view: ViewType, article: Article | null, currentSettings: BlogSettings) => {
    switch (view) {
      case 'tactics':
        updatePageSeo({
          title: 'Pizarra Táctica de Baloncesto — Diseñador & Pizarra Interactiva | Coach Leyanis Horta',
          description: 'Pizarra táctica interactiva de baloncesto: diseña y dibuja sistemas, cortes, bloqueos directos, pases y defensas. Exporta jugadas en alta resolución.',
          canonicalPath: '/pizarra',
          keywords: 'pizarra táctica baloncesto, diseñar jugadas, playbook baloncesto, táctica interactiva, Coach Leyanis Horta'
        });
        break;
      case 'about':
        updatePageSeo({
          title: 'Sobre la Entrenadora — Coach Leyanis Horta | 20 Temporadas en Banquillos',
          description: 'Licenciada en Educación Física y Deporte con más de 20 temporadas dirigiendo banquillos desde Cuba hasta Barcelona. Conoce la trayectoria de la Coach Leyanis Horta.',
          canonicalPath: '/sobre-mi',
          keywords: 'Leyanis Horta, Coach Yanis, entrenadora de baloncesto, Cuba, Barcelona baloncesto, biografía deportiva'
        });
        break;
      case 'categories':
        updatePageSeo({
          title: 'Categorías Tácticas & Formativas — Pizarra & Criterio',
          description: 'Explora todos los artículos clasificados por táctica defensiva, ataque por conceptos, desarrollo de fundamentos, gestión de vestuario y preparación física.',
          canonicalPath: '/categorias',
          keywords: 'categorías baloncesto, táctica defensiva, ataque por conceptos, dirección de vestuario'
        });
        break;
      case 'archive':
        updatePageSeo({
          title: 'Archivo Histórico del Cuaderno — Pizarra & Criterio | Coach Leyanis Horta',
          description: 'Buscador y archivo cronológico de todos los artículos, esquemas tácticos y reflexiones de baloncesto publicados en el blog.',
          canonicalPath: '/archivo',
          keywords: 'archivo baloncesto, buscador táctico, biblioteca de baloncesto'
        });
        break;
      case 'admin':
        updatePageSeo({
          title: 'Escritorio Blogger — Coach Leyanis Horta',
          description: 'Panel privado de redacción y gestión de artículos del blog.',
          canonicalPath: '/admin'
        });
        break;
      case 'article':
        if (article) {
          updatePageSeo({
            title: `${article.title} — Pizarra & Criterio | Coach Leyanis Horta`,
            description: article.excerpt || article.title,
            canonicalPath: `/articulo/${article.slug || article.id}`,
            ogImage: article.coverImage,
            ogType: 'article',
            publishedTime: article.publishedAt,
            authorName: article.author,
            keywords: `${article.tags.join(', ')}, ${article.category}, baloncesto, táctica`
          });
        }
        break;
      case 'home':
      default:
        updatePageSeo({
          title: `${currentSettings.blogTitle} — Blog de Baloncesto | Coach Leyanis Horta`,
          description: currentSettings.blogSubtitle || 'Blog personal y cuaderno táctico de la entrenadora Leyanis Horta, licenciada en deporte con 20 temporadas en banquillos desde Cuba hasta Barcelona.',
          canonicalPath: '/',
          keywords: 'baloncesto, táctica baloncesto, entrenadora de baloncesto, Leyanis Horta, CoachMind Basketball, pick and roll, defensa de cambios'
        });
        break;
    }
  }, []);

  // Main navigation action with HTML5 history pushState
  const navigateTo = useCallback((view: ViewType, article: Article | null = null, pushHistory = true) => {
    setCurrentView(view);
    setSelectedArticle(article);

    if (article && view === 'article') {
      storageService.incrementViews(article.id);
      setArticles(storageService.getArticles());
    }

    const newPath = getUrlPath(view, article);
    if (pushHistory && typeof window !== 'undefined' && window.location.pathname !== newPath) {
      window.history.pushState({ view, articleId: article?.id }, '', newPath);
    }

    syncSeoForView(view, article, settings);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [settings, syncSeoForView]);

  // Load initial data from storage and resolve initial URL
  useEffect(() => {
    const loadedArticles = storageService.getArticles();
    const loadedComments = storageService.getComments();
    const loadedSubscribers = storageService.getSubscribers();
    const loadedSettings = storageService.getSettings();
    const loadedBookmarks = storageService.getBookmarks();

    setArticles(loadedArticles);
    setComments(loadedComments);
    setSubscribers(loadedSubscribers);
    setSettings(loadedSettings);
    setBookmarks(loadedBookmarks);

    // Initial multi-page URL route handling (for direct link entries or Googlebot crawl)
    const initialRoute = parseRouteFromLocation(loadedArticles);
    setCurrentView(initialRoute.view);
    setSelectedArticle(initialRoute.article);
    syncSeoForView(initialRoute.view, initialRoute.article, loadedSettings);
  }, [parseRouteFromLocation, syncSeoForView]);

  // Listen to browser Back / Forward events (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRouteFromLocation(articles);
      setCurrentView(route.view);
      setSelectedArticle(route.article);
      syncSeoForView(route.view, route.article, settings);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [articles, parseRouteFromLocation, settings, syncSeoForView]);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('basket_blog_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('basket_blog_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Author Authentication actions
  const handleOpenAdminRequest = () => {
    if (isAuthorAuthenticated) {
      setCurrentView('admin');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthorAuthenticated(true);
    navigateTo('admin', null, true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('basket_author_session_v2');
    } catch {
      // ignore
    }
    setIsAuthorAuthenticated(false);
    navigateTo('home', null, true);
  };

  // Shortcut for Coach Leyanis: Alt + L to quickly open the private author login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        handleOpenAdminRequest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthorAuthenticated]);

  // Article selection & view count
  const handleSelectArticle = (article: Article) => {
    navigateTo('article', article, true);
  };

  const handleBackToArticles = () => {
    navigateTo('home', null, true);
  };

  // Comments
  const handleAddComment = (commentData: {
    articleId: string;
    articleTitle: string;
    authorName: string;
    authorRole?: string;
    email: string;
    text: string;
  }) => {
    const newComment = storageService.addComment(commentData);
    setComments(storageService.getComments());
    return newComment;
  };

  const handleUpdateCommentStatus = (id: string, status: 'approved' | 'pending' | 'spam') => {
    storageService.updateCommentStatus(id, status);
    setComments(storageService.getComments());
  };

  const handleDeleteComment = (id: string) => {
    storageService.deleteComment(id);
    setComments(storageService.getComments());
  };

  // Articles CRUD
  const handleSaveArticle = (articleData: Partial<Article> & { title: string; content: string; category: string }) => {
    const saved = storageService.saveArticle(articleData);
    setArticles(storageService.getArticles());
    return saved;
  };

  const handleDeleteArticle = (id: string) => {
    storageService.deleteArticle(id);
    setArticles(storageService.getArticles());
    if (selectedArticle?.id === id) {
      setSelectedArticle(null);
      setCurrentView('home');
    }
  };

  const handleLikeArticle = (id: string) => {
    storageService.toggleLike(id);
    setArticles(storageService.getArticles());
  };

  const handleToggleBookmark = (id: string) => {
    storageService.toggleBookmark(id);
    setBookmarks(storageService.getBookmarks());
  };

  // Subscribers
  const handleSubscribe = async (email: string, frequency: 'semanal' | 'mensual') => {
    const res = await storageService.addSubscriber(email, frequency);
    if (res.success) {
      setSubscribers(storageService.getSubscribers());
    }
    return res;
  };

  const handleDeleteSubscriber = (id: string) => {
    storageService.deleteSubscriber(id);
    setSubscribers(storageService.getSubscribers());
  };

  // Settings
  const handleSaveSettings = (newSettings: BlogSettings) => {
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Data management
  const handleResetAllData = () => {
    storageService.resetAllData();
    setArticles(storageService.getArticles());
    setComments(storageService.getComments());
    setSubscribers(storageService.getSubscribers());
    setSettings(storageService.getSettings());
    setBookmarks([]);
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pizarra_criterio_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonStr: string) => {
    const success = storageService.importBackupJson(jsonStr);
    if (success) {
      setArticles(storageService.getArticles());
      setComments(storageService.getComments());
      setSubscribers(storageService.getSubscribers());
      setSettings(storageService.getSettings());
    }
    return success;
  };

  // Calculate comments count map for performance
  const commentsCountMap = comments.reduce<Record<string, number>>((acc, comm) => {
    if (comm.status === 'approved') {
      acc[comm.articleId] = (acc[comm.articleId] || 0) + 1;
    }
    return acc;
  }, {});

  // Published articles filter
  const publishedArticles = articles.filter(a => a.status === 'published');

  // Filtered by Search, Category, or Tag
  const displayArticles = publishedArticles.filter(art => {
    if (selectedCategory && art.category !== selectedCategory) {
      return false;
    }
    if (selectedTag && !art.tags.includes(selectedTag)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q) ||
        art.tags.some(t => t.toLowerCase().includes(q)) ||
        art.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Featured Lead Story
  const featuredArticle = displayArticles.find(a => a.featured) || displayArticles[0];
  const regularArticles = displayArticles.filter(a => a.id !== featuredArticle?.id);

  // If in admin mode, show the full Blogger CMS dashboard
  if (currentView === 'admin') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <AdminPanel
          articles={articles}
          comments={comments}
          subscribers={subscribers}
          settings={settings}
          onSaveArticle={handleSaveArticle}
          onDeleteArticle={handleDeleteArticle}
          onUpdateCommentStatus={handleUpdateCommentStatus}
          onDeleteComment={handleDeleteComment}
          onDeleteSubscriber={handleDeleteSubscriber}
          onSaveSettings={handleSaveSettings}
          onResetAllData={handleResetAllData}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onExitAdmin={() => navigateTo('home', null, true)}
          onLogout={handleLogout}
          onPreviewArticle={(art) => {
            navigateTo('article', art, true);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors w-full max-w-full overflow-x-hidden pb-16 md:pb-0 ${isDarkMode ? 'dark bg-[#121110] text-stone-100' : 'bg-[#FAF8F5] text-stone-900'}`}>
      
      {/* 3-Zone Clean Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          navigateTo(view, null, true);
        }}
        onOpenAdmin={handleOpenAdminRequest}
        isAdmin={isAuthorAuthenticated}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentView !== 'home' && currentView !== 'archive') {
            navigateTo('home', null, true);
          }
        }}
        blogTitle={settings.blogTitle}
        articles={articles}
        onSelectArticle={(art) => {
          navigateTo('article', art, true);
        }}
      />

      {/* Main Public Content Area */}
      <main className="flex-1">
        
        {/* VIEW 1: FULL ARTICLE READER */}
        {currentView === 'article' && selectedArticle && (
          <ArticleDetail
            article={selectedArticle}
            comments={comments.filter(c => c.articleId === selectedArticle.id && c.status === 'approved')}
            onBack={handleBackToArticles}
            onCategoryClick={(cat) => {
              setSelectedCategory(cat);
              setSelectedTag(null);
              navigateTo('home', null, true);
            }}
            onTagClick={(tag) => {
              setSelectedTag(tag);
              setSelectedCategory(null);
              navigateTo('home', null, true);
            }}
            onAddComment={handleAddComment}
            isBookmarked={bookmarks.includes(selectedArticle.id)}
            onToggleBookmark={handleToggleBookmark}
            onLike={handleLikeArticle}
          />
        )}

        {/* VIEW 2: CATEGORIES BREAKDOWN */}
        {currentView === 'categories' && (
          <CategoriesView
            articles={articles}
            commentsCountMap={commentsCountMap}
            onSelectArticle={handleSelectArticle}
            onTagClick={(tag) => {
              setSelectedTag(tag);
              setSelectedCategory(null);
              navigateTo('home', null, true);
            }}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {/* VIEW 3: TACTICS BOARD */}
        {currentView === 'tactics' && <TacticsView />}

        {/* VIEW 4: ARCHIVE & SEARCH */}
        {currentView === 'archive' && (
          <ArchiveView
            articles={articles}
            onSelectArticle={handleSelectArticle}
            onCategoryClick={(cat) => {
              setSelectedCategory(cat);
              navigateTo('home', null, true);
            }}
            onTagClick={(tag) => {
              setSelectedTag(tag);
              navigateTo('home', null, true);
            }}
          />
        )}

        {/* VIEW 5: ABOUT THE COACH */}
        {currentView === 'about' && (
          <AboutView
            settings={settings}
            onNavigateHome={() => navigateTo('home', null, true)}
          />
        )}

        {/* VIEW 6: CLEAN HOME / BLOGGER FRONT PAGE */}
        {currentView === 'home' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            
            {/* Fresh and Clean Hero Banner (No aggressive CTAs, serene editorial tone) */}
            <div className="mb-10 pb-6 border-b border-stone-200/90 dark:border-stone-800">
              <span className="text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400 font-semibold">
                Cuaderno de Criterios & Metodología de Baloncesto
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 dark:text-white tracking-tight mt-1.5 leading-tight">
                {settings.blogTitle}
              </h1>
              <p className="text-sm sm:text-base text-stone-700 dark:text-stone-200 mt-2 max-w-2xl font-serif leading-relaxed">
                {settings.blogSubtitle}
              </p>
            </div>

            {/* Active filter chip indicator if user filtered by tag, category, or search */}
            {(selectedCategory || selectedTag || searchQuery) && (
              <div className="mb-6 p-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200/70 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-stone-600 dark:text-stone-300">Filtrando por:</span>
                  {selectedCategory && (
                    <span className="font-semibold text-amber-900 dark:text-amber-300">
                      Categoría: {selectedCategory}
                    </span>
                  )}
                  {selectedTag && (
                    <span className="font-semibold text-amber-900 dark:text-amber-300">
                      Etiqueta: #{selectedTag}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="font-semibold text-amber-900 dark:text-amber-300">
                      Búsqueda: &ldquo;{searchQuery}&rdquo;
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedTag(null);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1 text-stone-700 dark:text-stone-200 hover:text-amber-800 dark:hover:text-amber-300 font-medium cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Quitar filtros</span>
                </button>
              </div>
            )}

            {/* Two Column Layout (Main Articles 70% / Sidebar 30%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Main Content Column (8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Featured Story (Lead Article) if available */}
                {featuredArticle && !selectedCategory && !selectedTag && !searchQuery && (
                  <div
                    onClick={() => handleSelectArticle(featuredArticle)}
                    className="group bg-white dark:bg-[#1C1A18] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                  >
                    <div className="relative aspect-16/9 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <picture>
                        <source srcSet={featuredArticle.coverImage.replace(/\.jpg$/, '.webp')} type="image/webp" />
                        <img
                          src={featuredArticle.coverImage}
                          alt={featuredArticle.title}
                          width="1200"
                          height="675"
                          fetchPriority="high"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
                        />
                      </picture>
                    </div>

                    <div className="p-6 sm:p-8">
                      {/* Zero-Pill Unboxed Metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-3">
                        <span className="font-semibold text-amber-800 dark:text-amber-400">
                          {featuredArticle.category}
                        </span>
                        <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
                        <span className="text-stone-600 dark:text-stone-300">{featuredArticle.publishedAt}</span>
                        <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
                        <span className="text-stone-600 dark:text-stone-300">{featuredArticle.readTimeMinutes} min de lectura</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors leading-tight mb-3">
                        {featuredArticle.title}
                      </h2>

                      <p className="text-stone-700 dark:text-stone-200 text-sm sm:text-base leading-relaxed font-serif mb-5 line-clamp-3">
                        {featuredArticle.excerpt}
                      </p>

                      <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                        <div className="flex flex-wrap gap-2">
                          {featuredArticle.tags.map(tag => (
                            <span key={tag} className="text-stone-600 dark:text-stone-300">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <span className="font-medium text-amber-800 dark:text-amber-400">
                          Leer artículo completo →
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section Title */}
                <div className="pt-2 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                    {selectedCategory || selectedTag || searchQuery
                      ? 'Resultados del Cuaderno'
                      : 'Artículos Recientes de Pizarra'}
                  </h3>
                  <span className="text-xs text-stone-600 dark:text-stone-400 font-mono">
                    {displayArticles.length} {displayArticles.length === 1 ? 'entrada' : 'entradas'}
                  </span>
                </div>

                {/* Regular Articles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {(!selectedCategory && !selectedTag && !searchQuery
                    ? regularArticles
                    : displayArticles
                  ).map(art => (
                    <ArticleCard
                      key={art.id}
                      article={art}
                      commentCount={commentsCountMap[art.id] || 0}
                      onSelect={handleSelectArticle}
                      onTagClick={(tag) => {
                        setSelectedTag(tag);
                        setSelectedCategory(null);
                      }}
                      onCategoryClick={(cat) => {
                        setSelectedCategory(cat);
                        setSelectedTag(null);
                      }}
                      isBookmarked={bookmarks.includes(art.id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>

                {displayArticles.length === 0 && (
                  <div className="text-center py-16 bg-white dark:bg-[#1A1816] rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-8">
                    <p className="font-serif text-stone-600 dark:text-stone-300 text-base mb-2">
                      No hay artículos que coincidan con tu búsqueda.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedTag(null);
                        setSearchQuery('');
                      }}
                      className="text-xs text-amber-800 dark:text-amber-400 font-medium hover:underline"
                    >
                      Restablecer todos los filtros
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar Column (4 cols) */}
              <div className="lg:col-span-4">
                <Sidebar
                  settings={settings}
                  articles={articles}
                  selectedCategory={selectedCategory}
                  selectedTag={selectedTag}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setSelectedTag(null);
                  }}
                  onSelectTag={(tag) => {
                    setSelectedTag(tag);
                    setSelectedCategory(null);
                  }}
                  onSubscribe={handleSubscribe}
                  onSelectArchiveMonth={() => {
                    navigateTo('archive', null, true);
                  }}
                  subscriberCount={subscribers.length}
                />
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer with Weekly Tactical Digest Subscription */}
      <Footer
        onOpenAdmin={handleOpenAdminRequest}
        onNavigate={(view) => {
          navigateTo(view, null, true);
        }}
        authorName={settings.authorName}
        onSubscribe={handleSubscribe}
        subscriberCount={subscribers.length}
      />

      {/* Blogger Author Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        correctPin="1234"
        authorName={settings.authorName}
      />
    </div>
  );
}

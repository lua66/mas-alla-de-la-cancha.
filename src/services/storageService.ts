import { Article, Comment, Subscriber, BlogSettings } from '../types/blog';
import { INITIAL_ARTICLES, INITIAL_COMMENTS, INITIAL_SUBSCRIBERS, INITIAL_SETTINGS } from '../data/initialData';

const STORAGE_KEYS = {
  ARTICLES: 'basket_blog_articles_v2',
  COMMENTS: 'basket_blog_comments_v2',
  SUBSCRIBERS: 'basket_blog_subscribers_v2',
  SETTINGS: 'basket_blog_settings_v2',
  BOOKMARKS: 'basket_blog_bookmarks_v2',
  THEME: 'basket_blog_theme_v2',
  TEXT_SIZE: 'basket_blog_text_size_v2'
};

export const storageService = {
  // Articles
  getArticles(): Article[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      if (stored) {
        const parsed: Article[] = JSON.parse(stored);
        let updated = false;
        parsed.forEach(art => {
          if (art.coverImage && (art.coverImage.includes('article_defense_transition') || art.coverImage.includes('coach_leyanis_tactics') || art.coverImage.includes('coach_blonde_tactics') || art.coverImage.includes('coach_horta_sese'))) {
            art.coverImage = '/assets/coach_horta_avatar.jpg';
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading articles from localStorage', e);
    }
    // Initialize if empty
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES));
    return INITIAL_ARTICLES;
  },

  getArticleById(id: string): Article | undefined {
    const list = this.getArticles();
    return list.find(a => a.id === id || a.slug === id);
  },

  saveArticle(article: Partial<Article> & { title: string; content: string; category: string }): Article {
    const articles = this.getArticles();
    const isNew = !article.id;

    const slug = article.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const readTimeMinutes = Math.max(1, Math.ceil(article.content.split(/\s+/).length / 180));

    let savedArticle: Article;

    if (isNew) {
      savedArticle = {
        id: 'art-' + Date.now(),
        slug: slug || 'entrada-' + Date.now(),
        title: article.title.trim(),
        excerpt: article.excerpt?.trim() || article.content.substring(0, 160) + '...',
        content: article.content,
        category: article.category.trim() || 'Criterio General',
        tags: article.tags || ['Baloncesto', 'Táctica'],
        author: article.author || 'Coach Leyanis Horta',
        authorRole: article.authorRole || 'Licenciada en Deporte & Entrenadora',
        publishedAt: article.publishedAt || new Date().toISOString().split('T')[0],
        readTimeMinutes,
        coverImage: article.coverImage || '/src/assets/images/hero_basketball_tactics_1792680998647.jpg',
        status: article.status || 'published',
        viewsCount: 1,
        likesCount: 0,
        featured: article.featured || false
      };
      articles.unshift(savedArticle);
    } else {
      const index = articles.findIndex(a => a.id === article.id);
      if (index === -1) {
        throw new Error('Artículo no encontrado para actualizar');
      }
      savedArticle = {
        ...articles[index],
        ...article,
        readTimeMinutes,
        slug: slug || articles[index].slug
      } as Article;
      articles[index] = savedArticle;
    }

    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    return savedArticle;
  },

  deleteArticle(id: string): void {
    const articles = this.getArticles().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));

    // Also delete associated comments
    const comments = this.getComments().filter(c => c.articleId !== id);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  },

  incrementViews(id: string): void {
    const articles = this.getArticles();
    const item = articles.find(a => a.id === id);
    if (item) {
      item.viewsCount = (item.viewsCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    }
  },

  toggleLike(id: string): number {
    const articles = this.getArticles();
    const item = articles.find(a => a.id === id);
    if (item) {
      item.likesCount = (item.likesCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
      return item.likesCount;
    }
    return 0;
  },

  // Comments
  getComments(): Comment[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading comments', e);
    }
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
    return INITIAL_COMMENTS;
  },

  getCommentsForArticle(articleId: string): Comment[] {
    return this.getComments().filter(c => c.articleId === articleId && c.status === 'approved');
  },

  addComment(commentData: {
    articleId: string;
    articleTitle: string;
    authorName: string;
    authorRole?: string;
    email: string;
    text: string;
  }): Comment {
    const comments = this.getComments();
    const newComment: Comment = {
      id: 'comm-' + Date.now(),
      articleId: commentData.articleId,
      articleTitle: commentData.articleTitle,
      authorName: commentData.authorName.trim(),
      authorRole: commentData.authorRole?.trim() || 'Entrenador / Lector',
      email: commentData.email.trim(),
      text: commentData.text.trim(),
      createdAt: new Date().toISOString(),
      status: 'approved' // auto-approved for instant satisfaction, manageable in admin
    };
    comments.unshift(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    return newComment;
  },

  updateCommentStatus(id: string, status: 'approved' | 'pending' | 'spam'): void {
    const comments = this.getComments();
    const item = comments.find(c => c.id === id);
    if (item) {
      item.status = status;
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    }
  },

  deleteComment(id: string): void {
    const comments = this.getComments().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  },

  // Subscribers
  getSubscribers(): Subscriber[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading subscribers', e);
    }
    localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(INITIAL_SUBSCRIBERS));
    return INITIAL_SUBSCRIBERS;
  },

  async addSubscriber(email: string, frequency: 'semanal' | 'mensual' = 'semanal'): Promise<{ success: boolean; message: string; syncedToSheet?: boolean }> {
    const cleaned = email.trim().toLowerCase();
    if (!cleaned || !cleaned.includes('@')) {
      return { success: false, message: 'Por favor, introduce un correo electrónico válido.' };
    }
    const list = this.getSubscribers();
    if (list.some(s => s.email.toLowerCase() === cleaned)) {
      return { success: true, message: '¡Ya estás suscrito al cuaderno táctico! Recibirás los próximos análisis.', syncedToSheet: true };
    }
    const newSub: Subscriber = {
      id: 'sub-' + Date.now(),
      email: cleaned,
      frequency,
      subscribedAt: new Date().toISOString().split('T')[0]
    };
    list.unshift(newSub);
    localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(list));

    const settings = this.getSettings();
    const webhookUrl = settings.googleSheetWebhookUrl || "https://script.google.com/macros/s/AKfycbyAp_IwzOCSC2ANFgRDIegbQlsqa_t-VUGP6URVGzbZZ5wK6BjPwJpwRl8IRZrfTMF9/exec";
    let syncedToSheet = false;

    // 1. Try server proxy endpoint first for reliable execution and redirect follow
    try {
      const res = await fetch('/api/subscribers/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleaned,
          frequency,
          subscribedAt: newSub.subscribedAt,
          source: 'Sidebar - Formulario de Suscripción',
          webhookUrl
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          syncedToSheet = true;
        }
      }
    } catch (e) {
      console.warn('Proxy Google Sheet sync failed, falling back to direct request', e);
    }

    // 2. Direct client fallback with urlencoded data in case proxy is unreachable
    if (!syncedToSheet && webhookUrl.startsWith('http')) {
      try {
        const params = new URLSearchParams();
        params.append('email', cleaned);
        params.append('frequency', frequency);
        params.append('subscribedAt', newSub.subscribedAt);
        params.append('source', 'Sidebar - Formulario de Suscripción');

        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });
        syncedToSheet = true;
      } catch (directErr) {
        console.warn('Direct browser webhook failed', directErr);
      }
    }

    return {
      success: true,
      syncedToSheet,
      message: syncedToSheet 
        ? '¡Gracias por suscribirte! Tu correo se ha guardado en el blog y sincronizado con tu hoja de cálculo en Google Sheets.'
        : '¡Gracias por suscribirte! Te avisaremos de cada nuevo artículo de pizarra.'
    };
  },

  deleteSubscriber(id: string): void {
    const list = this.getSubscribers().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(list));
  },

  exportSubscribersCsv(): string {
    const list = this.getSubscribers();
    const rows = [
      ['Email', 'Frecuencia', 'Fecha de Suscripcion', 'Origen'],
      ...list.map(s => [s.email, s.frequency, s.subscribedAt, 'Pizarra & Criterio'])
    ];
    return rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  },

  // Settings
  getSettings(): BlogSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        let changed = false;
        if (!parsed.googleSheetWebhookUrl) {
          parsed.googleSheetWebhookUrl = INITIAL_SETTINGS.googleSheetWebhookUrl;
          changed = true;
        }
        if (!parsed.authorAvatar || parsed.authorAvatar !== INITIAL_SETTINGS.authorAvatar) {
          parsed.authorAvatar = INITIAL_SETTINGS.authorAvatar;
          changed = true;
        }
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading settings', e);
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  },

  saveSettings(settings: BlogSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Bookmarks
  getBookmarks(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  toggleBookmark(articleId: string): boolean {
    const list = this.getBookmarks();
    const index = list.indexOf(articleId);
    let isBookmarked = false;
    if (index === -1) {
      list.push(articleId);
      isBookmarked = true;
    } else {
      list.splice(index, 1);
      isBookmarked = false;
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
    return isBookmarked;
  },

  // Reset to default
  resetAllData(): void {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES));
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
    localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(INITIAL_SUBSCRIBERS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
  },

  // Export full backup
  exportBackupJson(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      articles: this.getArticles(),
      comments: this.getComments(),
      subscribers: this.getSubscribers()
    };
    return JSON.stringify(data, null, 2);
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.articles && Array.isArray(data.articles)) {
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(data.articles));
      }
      if (data.comments && Array.isArray(data.comments)) {
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(data.comments));
      }
      if (data.subscribers && Array.isArray(data.subscribers)) {
        localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(data.subscribers));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON', e);
      return false;
    }
  }
};

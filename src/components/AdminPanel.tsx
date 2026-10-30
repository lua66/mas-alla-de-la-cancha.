import React, { useState, useRef } from 'react';
import { Article, Comment, Subscriber, BlogSettings } from '../types/blog';
import { storageService } from '../services/storageService';
import { AiArticleModal } from './AiArticleModal';
import { TACTICAL_IMAGE_GALLERY } from '../data/tacticalImages';
import { compressImageFile, formatFileSize } from '../utils/imageUtils';
import {
  FileText,
  PlusCircle,
  MessageSquare,
  Users,
  Settings,
  Eye,
  LogOut,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  RotateCcw,
  Tag,
  Folder,
  Image as ImageIcon,
  Save,
  Clock,
  Sparkles,
  FileSpreadsheet,
  Copy,
  ExternalLink,
  HelpCircle,
  Send,
  Loader2,
  UploadCloud,
  ImagePlus
} from 'lucide-react';

interface AdminPanelProps {
  articles: Article[];
  comments: Comment[];
  subscribers: Subscriber[];
  settings: BlogSettings;
  onSaveArticle: (article: Partial<Article> & { title: string; content: string; category: string }) => Article;
  onDeleteArticle: (id: string) => void;
  onUpdateCommentStatus: (id: string, status: 'approved' | 'pending' | 'spam') => void;
  onDeleteComment: (id: string) => void;
  onDeleteSubscriber: (id: string) => void;
  onSaveSettings: (settings: BlogSettings) => void;
  onResetAllData: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
  onExitAdmin: () => void;
  onLogout?: () => void;
  onPreviewArticle: (article: Article) => void;
}

type AdminTab = 'posts' | 'editor' | 'comments' | 'subscribers' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  articles,
  comments,
  subscribers,
  settings,
  onSaveArticle,
  onDeleteArticle,
  onUpdateCommentStatus,
  onDeleteComment,
  onDeleteSubscriber,
  onSaveSettings,
  onResetAllData,
  onExportBackup,
  onImportBackup,
  onExitAdmin,
  onLogout,
  onPreviewArticle
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('posts');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Editor State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // Custom User Uploaded Images State & Refs
  const [customImages, setCustomImages] = useState<string[]>(() => storageService.getCustomImages());
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const result = await compressImageFile(file, 1200, 0.82);
      setCoverImage(result.dataUrl);
      const updatedList = storageService.addCustomImage(result.dataUrl);
      setCustomImages(updatedList);
      showNotification(`¡Imagen "${file.name}" optimizada y asignada como portada! (${formatFileSize(result.compressedSize)})`);
    } catch (err: any) {
      console.error('Error al subir imagen', err);
      showNotification(err.message || 'Error al procesar la imagen.', 'error');
    } finally {
      setIsUploadingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveCustomImage = (imgUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storageService.removeCustomImage(imgUrl);
    setCustomImages(updated);
    if (coverImage === imgUrl) {
      setCoverImage(updated[0] || TACTICAL_IMAGE_GALLERY[0].path);
    }
    showNotification('Imagen eliminada de tus fotos subidas.');
  };

  const handleInlineContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingInline(true);
    try {
      const result = await compressImageFile(file, 1000, 0.80);
      const updated = storageService.addCustomImage(result.dataUrl);
      setCustomImages(updated);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const markdownImage = `\n\n![${cleanName}](${result.dataUrl})\n\n`;
      setContent(prev => prev + markdownImage);
      showNotification(`¡Foto "${file.name}" insertada dentro del artículo! (${formatFileSize(result.compressedSize)})`);
    } catch (err: any) {
      showNotification(err.message || 'Error al procesar la imagen.', 'error');
    } finally {
      setIsUploadingInline(false);
      if (e.target) e.target.value = '';
    }
  };

  // Settings State
  const [tempSettings, setTempSettings] = useState<BlogSettings>(settings);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const handleTestWebhook = async () => {
    const url = tempSettings.googleSheetWebhookUrl?.trim();
    if (!url || !url.startsWith('http')) {
      showNotification('Pega primero la URL de tu Google Apps Script (que empiece por https://script.google.com/...)', 'error');
      return;
    }
    setIsTestingWebhook(true);
    try {
      const res = await fetch('/api/subscribers/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'prueba.suscriptor@baloncesto.es',
          frequency: 'semanal',
          subscribedAt: new Date().toISOString().split('T')[0],
          source: 'Prueba desde Panel de Administración',
          webhookUrl: url
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('¡Prueba exitosa! Se ha insertado una fila de prueba en tu Google Sheet.');
      } else {
        showNotification(`Aviso: ${data.error || 'Respuesta inesperada de Google'}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error al conectar con la URL. Revisa que esté bien escrita.', 'error');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // AI Assistant Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleLoadAiArticleIntoEditor = (articleData: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    coverImage: string;
    status: 'published' | 'draft';
  }) => {
    setEditingArticleId(null);
    setTitle(articleData.title);
    setExcerpt(articleData.excerpt);
    setContent(articleData.content);
    setCategory(articleData.category);
    setTagsStr(articleData.tags.join(', '));
    setCoverImage(articleData.coverImage);
    setStatus(articleData.status);
    setCurrentTab('editor');
    showNotification('¡Artículo generado con IA cargado en el editor! Puedes retocarlo y guardarlo.');
  };

  const handlePublishAiArticleDirectly = (articleData: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    coverImage: string;
    status: 'published';
  }) => {
    const saved = onSaveArticle({
      title: articleData.title,
      excerpt: articleData.excerpt,
      content: articleData.content,
      category: articleData.category,
      tags: articleData.tags,
      coverImage: articleData.coverImage,
      status: 'published',
      author: settings.authorName,
      authorRole: settings.authorRole
    });
    setCurrentTab('posts');
    showNotification(`¡Artículo "${saved.title}" publicado con éxito en el cuaderno!`);
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportSubscribersCsv = () => {
    const csvContent = storageService.exportSubscribersCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `suscriptores_pizarra_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Archivo CSV descargado. Puedes importarlo directamente en Google Sheets.');
  };

  const handleNewArticle = () => {
    setEditingArticleId(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory('Táctica Defensiva');
    setTagsStr('');
    setCoverImage('/assets/coach_horta_avatar.jpg');
    setStatus('published');
    setCurrentTab('editor');
  };

  const handleEditArticle = (art: Article) => {
    setEditingArticleId(art.id);
    setTitle(art.title);
    setExcerpt(art.excerpt);
    setContent(art.content);
    setCategory(art.category);
    setTagsStr(art.tags.join(', '));
    setCoverImage(art.coverImage);
    setStatus(art.status);
    setCurrentTab('editor');
  };

  const handleSaveArticle = (saveAsStatus: 'published' | 'draft') => {
    if (!title.trim()) {
      showNotification('Por favor, indica un título para la entrada.', 'error');
      return;
    }
    if (!content.trim()) {
      showNotification('El contenido de la entrada no puede estar vacío.', 'error');
      return;
    }

    const tags = tagsStr
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const saved = onSaveArticle({
      id: editingArticleId || undefined,
      title,
      excerpt,
      content,
      category: category || 'General',
      tags: tags.length > 0 ? tags : [category || 'General'],
      coverImage: coverImage || '/assets/coach_horta_avatar.jpg',
      status: saveAsStatus
    });

    showNotification(
      saveAsStatus === 'published'
        ? '¡Entrada publicada con éxito! Ya está visible en el blog público.'
        : 'Borrador guardado en la base interna.'
    );

    setEditingArticleId(null);
    setCurrentTab('posts');
  };

  const insertSnippet = (prefix: string, suffix: string = '') => {
    setContent(prev => prev + '\n' + prefix + 'Texto destacado' + suffix);
  };

  const filteredArticles = articles.filter(a => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-[#F4F2EE] dark:bg-[#0F0E0D] text-stone-900 dark:text-stone-100 flex flex-col font-sans">
      
      {/* Top Bar Blogger Style */}
      <header className="bg-white dark:bg-[#1A1816] border-b border-stone-200 dark:border-stone-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center font-serif font-black text-sm shadow-xs">
            B
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 leading-none">
              {settings.blogTitle}
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Escritorio de Autor Blogger · {settings.authorName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-800 hover:bg-amber-900 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Blog Público</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Cerrar sesión de autora"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Layout: Sidebar & Content Area */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        
        {/* Left Navigation Menu (Blogger Sidebar) */}
        <aside className="w-60 shrink-0 hidden md:flex flex-col gap-1.5">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="w-full mb-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 hover:from-amber-800 hover:to-orange-700 text-white font-semibold text-xs shadow-md shadow-amber-900/10 transition-all cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
            <span>Crear Artículo con IA</span>
          </button>

          <button
            onClick={handleNewArticle}
            className="w-full mb-3 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>Nueva Entrada Manual</span>
          </button>

          <button
            onClick={() => setCurrentTab('posts')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'posts'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-700" />
            <span>Entradas ({articles.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('comments')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'comments'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-amber-700" />
              <span>Comentarios</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 font-mono">
              {comments.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('subscribers')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'subscribers'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-amber-700" />
              <span>Suscriptores</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 font-mono">
              {subscribers.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'settings'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-700" />
            <span>Configuración</span>
          </button>

          <div className="mt-8 pt-4 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400">
            <p className="font-semibold text-stone-800 dark:text-stone-300">Modo Base Interna</p>
            <p className="mt-1 leading-relaxed">
              Tus artículos se guardan en la memoria persistente del navegador y solo se hacen públicos al pulsar <strong>Publicar</strong>.
            </p>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 bg-white dark:bg-[#1A1816] rounded-xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-7 shadow-xs overflow-y-auto">
          
          {/* Notifications */}
          {notification && (
            <div
              className={`mb-5 p-3 rounded-lg text-xs flex items-center gap-2 ${
                notification.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200'
              }`}
            >
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{notification.message}</span>
            </div>
          )}

          {/* TAB 1: LIST POSTS */}
          {currentTab === 'posts' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    Entradas del Cuaderno
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Gestiona, edita y publica tus criterios de baloncesto.
                  </p>
                </div>

                {/* Filter segments */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-lg text-xs">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        filterStatus === 'all'
                          ? 'bg-white dark:bg-stone-700 shadow-xs font-semibold text-stone-900 dark:text-stone-100'
                          : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      Todas ({articles.length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('published')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        filterStatus === 'published'
                          ? 'bg-white dark:bg-stone-700 shadow-xs font-semibold text-stone-900 dark:text-stone-100'
                          : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      Publicadas ({articles.filter(a => a.status === 'published').length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('draft')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        filterStatus === 'draft'
                          ? 'bg-white dark:bg-stone-700 shadow-xs font-semibold text-stone-900 dark:text-stone-100'
                          : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      Borradores ({articles.filter(a => a.status === 'draft').length})
                    </button>
                  </div>

                  <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Crear con IA</span>
                  </button>

                  <button
                    onClick={handleNewArticle}
                    className="md:hidden p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700"
                    title="Nueva Entrada Manual"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-700" />
                  </button>
                </div>
              </div>

              {/* Table / List */}
              <div className="space-y-3">
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-12 text-stone-500 text-sm">
                    No hay entradas que coincidan con el filtro seleccionado.
                  </div>
                ) : (
                  filteredArticles.map(art => {
                    const artComments = comments.filter(c => c.articleId === art.id);
                    return (
                      <div
                        key={art.id}
                        className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                art.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {art.status === 'published' ? 'Publicado' : 'Borrador'}
                            </span>
                            <span className="text-stone-400">·</span>
                            <span className="text-stone-500 dark:text-stone-400 font-medium">
                              {art.category}
                            </span>
                            <span className="text-stone-400">·</span>
                            <span className="text-stone-400">{art.publishedAt}</span>
                          </div>

                          <h3
                            onClick={() => handleEditArticle(art)}
                            className="font-serif font-bold text-stone-900 dark:text-stone-100 hover:text-amber-800 dark:hover:text-amber-400 cursor-pointer truncate text-base"
                          >
                            {art.title}
                          </h3>

                          <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 mt-1.5">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {artComments.length} comentarios
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {art.viewsCount || 0} lecturas
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onPreviewArticle(art)}
                            title="Ver en vista lector"
                            className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditArticle(art)}
                            title="Editar entrada"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar definitivamente "${art.title}"?`)) {
                                onDeleteArticle(art.id);
                                showNotification('Entrada eliminada.');
                              }
                            }}
                            title="Eliminar"
                            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ARTICLE WRITING & EDITING (BLOGGER POST EDITOR) */}
          {currentTab === 'editor' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    {editingArticleId ? 'Editar Entrada de Baloncesto' : 'Redactar Nueva Entrada'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Escribe tu criterio táctico con tranquilidad. Puedes guardarlo en borrador o publicarlo directamente.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-xs font-semibold border border-amber-300 dark:border-amber-800 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Redactar con IA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveArticle('draft')}
                    className="px-3.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Guardar Borrador
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveArticle('published')}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Publicar Entrada</span>
                  </button>
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Título de la entrada *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Defendiendo el bloqueo ciego en finales apretados..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-base sm:text-lg font-serif font-bold px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-700"
                />
              </div>

              {/* Category and Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-700"
                  >
                    <option value="Táctica Defensiva">Táctica Defensiva</option>
                    <option value="Ataque por Conceptos">Ataque por Conceptos</option>
                    <option value="Desarrollo de Fundamentos">Desarrollo de Fundamentos</option>
                    <option value="Gestión de Vestuario">Gestión de Vestuario</option>
                    <option value="Preparación Física">Preparación Física</option>
                    <option value="Reglamento y Arbitraje">Reglamento y Arbitraje</option>
                    <option value="Criterio General">Criterio General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Etiquetas (separadas por comas)
                  </label>
                  <input
                    type="text"
                    placeholder="Escribe tus etiquetas (ej: Transición, Rebote)"
                    value={tagsStr}
                    onChange={e => setTagsStr(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-700"
                  />
                </div>
              </div>

              {/* Cover Image Selector & Local Upload from Computer */}
              <div className="bg-stone-50/80 dark:bg-stone-900/40 p-4 sm:p-5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <span>Imagen de Portada del Artículo</span>
                    </label>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Sube fotos desde tu computadora o teléfono para que cada artículo tenga su propia imagen original.
                    </p>
                  </div>

                  {/* Upload button from computer */}
                  <div>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingCover}
                      onClick={() => coverFileInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 py-2.5 bg-amber-700 hover:bg-amber-800 active:scale-98 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      title="Selecciona una imagen desde tu equipo (JPG, PNG, WebP)"
                    >
                      {isUploadingCover ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                          <span>Procesando imagen...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>Subir imagen desde mi computadora</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Active Cover Image Preview Card */}
                {coverImage && (
                  <div className="relative aspect-21/9 sm:aspect-16/7 max-h-56 w-full rounded-xl overflow-hidden border-2 border-amber-600/70 dark:border-amber-500/70 shadow-sm bg-stone-200 dark:bg-stone-800 group">
                    <img
                      src={coverImage}
                      alt="Portada seleccionada"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end justify-between p-3.5 sm:p-4">
                      <div className="text-white text-xs font-medium drop-shadow-md">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 uppercase tracking-wider shadow-xs">
                          {coverImage.startsWith('data:') ? '✓ Tu Foto Personalizada' : '✓ Imagen de Portada Activa'}
                        </span>
                        <p className="text-[11px] text-stone-200 mt-1 line-clamp-1">
                          Esta imagen se mostrará en la cabecera del artículo y en la tarjeta de inicio.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Cambiar por otra foto de tu equipo"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Cambiar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCoverImage('')}
                          className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white text-xs transition-colors cursor-pointer shadow-xs"
                          title="Quitar imagen de portada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mis Fotos Subidas (Saved personal library) */}
                {customImages.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-amber-600" />
                        <span>Mis Fotos Subidas ({customImages.length}):</span>
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Haz clic en una para usarla
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {customImages.map((imgUrl, i) => {
                        const isSelected = coverImage === imgUrl;
                        return (
                          <div
                            key={i}
                            onClick={() => setCoverImage(imgUrl)}
                            className={`group relative aspect-16/10 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-amber-600 ring-2 ring-amber-500/40 scale-102 shadow-sm'
                                : 'border-stone-200 dark:border-stone-700 hover:border-amber-400 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Foto subida ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-1 left-1 bg-amber-600 text-white rounded-full p-0.5 shadow-xs">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleRemoveCustomImage(imgUrl, e)}
                              title="Eliminar de mi lista de fotos"
                              className="absolute top-1 right-1 p-1 rounded bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Galería Oficial Predeterminada del Blog */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                  <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    O selecciona una de la Galería Oficial Predeterminada:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TACTICAL_IMAGE_GALLERY.map(img => {
                      const isSelected = coverImage === img.path;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setCoverImage(img.path)}
                          className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-xs ring-1 ring-amber-500/30'
                              : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                          }`}
                        >
                          <img
                            src={img.path}
                            alt={img.name}
                            className="w-9 h-7 object-cover rounded-sm shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold truncate text-stone-800 dark:text-stone-200">
                              {img.name}
                            </div>
                            <div className="text-[9px] text-stone-500 truncate">
                              {img.category}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Custom URL */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="O escribe una URL / enlace web externo de imagen..."
                    value={coverImage.startsWith('data:') ? '' : coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-700 font-mono"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Resumen previo (Extracto que aparece en la portada)
                </label>
                <textarea
                  rows={2}
                  placeholder="Una o dos frases que sinteticen la idea principal del artículo..."
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-700"
                />
              </div>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-100 dark:bg-stone-800/90 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
                <span className="text-[11px] font-medium text-stone-500 mr-1">Herramientas:</span>
                <button
                  type="button"
                  onClick={() => insertSnippet('## ')}
                  className="px-2 py-1 rounded bg-white dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold"
                  title="Añadir Título de sección"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('### ')}
                  className="px-2 py-1 rounded bg-white dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-semibold"
                  title="Añadir Subtítulo"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('**', '**')}
                  className="px-2 py-1 rounded bg-white dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold"
                  title="Negrita"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('*', '*')}
                  className="px-2 py-1 rounded bg-white dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-stone-200 italic"
                  title="Cursiva"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('> ')}
                  className="px-2 py-1 rounded bg-white dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-stone-200"
                  title="Cita o frase del entrenador"
                >
                  Cita &ldquo;&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('* ')}
                  className="px-2 py-1 rounded bg-white dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-stone-200"
                  title="Lista de puntos"
                >
                  • Lista
                </button>
                <div className="h-4 w-px bg-stone-300 dark:bg-stone-600 mx-1" />
                <input
                  type="file"
                  ref={inlineFileInputRef}
                  onChange={handleInlineContentImageUpload}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => inlineFileInputRef.current?.click()}
                  disabled={isUploadingInline}
                  className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 flex items-center gap-1 font-semibold cursor-pointer shadow-xs transition-colors"
                  title="Subir una foto desde tu computadora e insertarla directamente en el texto del artículo"
                >
                  <ImagePlus className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                  <span>{isUploadingInline ? 'Procesando foto...' : 'Insertar foto en el texto'}</span>
                </button>
              </div>

              {/* Full Content Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Cuerpo del Artículo *
                  </label>
                  <span className="text-[11px] text-stone-400">
                    {content.split(/\s+/).filter(Boolean).length} palabras · aprox.{' '}
                    {Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 180))} min de lectura
                  </span>
                </div>
                <textarea
                  rows={14}
                  placeholder="Escribe aquí tu análisis técnico, reflexiones de partido o consejos para otros entrenadores..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-serif leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setCurrentTab('posts')}
                  className="text-xs text-stone-600 dark:text-stone-400 hover:underline"
                >
                  ← Volver sin guardar
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSaveArticle('draft')}
                    className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 transition-colors"
                  >
                    Guardar Borrador
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveArticle('published')}
                    className="px-5 py-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Publicar Entrada
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMENTS MODERATION */}
          {currentTab === 'comments' && (
            <div>
              <div className="pb-5 mb-5 border-b border-stone-200 dark:border-stone-800">
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  Moderación de Comentarios ({comments.length})
                </h2>
                <p className="text-xs text-stone-500">
                  Revisa las intervenciones de los lectores y entrenadores. Puedes aprobarlos, marcarlos como spam o eliminarlos.
                </p>
              </div>

              <div className="space-y-3">
                {comments.length === 0 ? (
                  <div className="text-center py-12 text-stone-500 text-sm">
                    No hay comentarios para moderar.
                  </div>
                ) : (
                  comments.map(c => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col gap-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {c.authorName}
                          </span>
                          <span className="text-stone-400">({c.email})</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            {c.authorRole}
                          </span>
                        </div>
                        <span className="text-stone-400">
                          En: <strong>{c.articleTitle}</strong>
                        </span>
                      </div>

                      <p className="text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed bg-stone-50 dark:bg-stone-900/60 p-3 rounded-lg">
                        {c.text}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                        <span className="text-stone-400">
                          {new Date(c.createdAt).toLocaleString('es-ES')}
                        </span>

                        <div className="flex items-center gap-2">
                          {c.status !== 'approved' && (
                            <button
                              onClick={() => {
                                onUpdateCommentStatus(c.id, 'approved');
                                showNotification('Comentario aprobado.');
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-medium hover:bg-emerald-200"
                            >
                              Aprobar
                            </button>
                          )}
                          {c.status !== 'spam' && (
                            <button
                              onClick={() => {
                                onUpdateCommentStatus(c.id, 'spam');
                                showNotification('Comentario marcado como spam.');
                              }}
                              className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200"
                            >
                              Marcar Spam
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onDeleteComment(c.id);
                              showNotification('Comentario eliminado.');
                            }}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SUBSCRIBERS */}
          {currentTab === 'subscribers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-700" />
                    <span>Suscriptores al Boletín ({subscribers.length})</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Lista de entrenadores y aficionados suscritos por correo electrónico.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleExportSubscribersCsv}
                    title="Descargar archivo CSV compatible con Google Sheets y Excel"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Exportar a Google Sheets (CSV)</span>
                  </button>

                  <button
                    onClick={onExportBackup}
                    title="Exportar respaldo completo de datos"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup JSON</span>
                  </button>
                </div>
              </div>

              {/* Subscribers Table */}
              <div className="overflow-x-auto bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 uppercase tracking-wider font-mono">
                    <tr>
                      <th className="p-3">Correo Electrónico</th>
                      <th className="p-3">Frecuencia</th>
                      <th className="p-3">Fecha de Suscripción</th>
                      <th className="p-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-stone-500">
                          Aún no hay suscriptores registrados.
                        </td>
                      </tr>
                    ) : (
                      subscribers.map(s => (
                        <tr key={s.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                          <td className="p-3 font-medium text-stone-900 dark:text-stone-100">{s.email}</td>
                          <td className="p-3 capitalize">{s.frequency}</td>
                          <td className="p-3 text-stone-500">{s.subscribedAt}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                onDeleteSubscriber(s.id);
                                showNotification('Suscriptor eliminado.');
                              }}
                              className="text-rose-600 hover:underline cursor-pointer"
                            >
                              Dar de baja
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Google Sheets Integration Guide Card */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-stone-900/90 border border-emerald-200 dark:border-emerald-900/50 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                      ¿Cómo recibir las suscripciones en Google Sheets?
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                      Tienes dos opciones muy sencillas para gestionar tu lista en las hojas de cálculo de Google:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Option 1: CSV Export */}
                  <div className="p-4 rounded-xl bg-white dark:bg-stone-800/80 border border-emerald-100 dark:border-stone-700/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block mb-1">
                      Opción 1: Exportación Rápida (Sin programar)
                    </span>
                    <ol className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5 list-decimal ml-4">
                      <li>Haz clic arriba en <strong>«Exportar a Google Sheets (CSV)»</strong>.</li>
                      <li>Abre tu <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 underline font-medium">Google Sheets nuevo</a>.</li>
                      <li>Ve a <strong>Archivo &gt; Importar &gt; Subir</strong> y arrastra el archivo descargado.</li>
                      <li>¡Listo! Tendrás todas las columnas con emails, frecuencia y fecha ordenados al instante.</li>
                    </ol>
                  </div>

                  {/* Option 2: Automatic Webhook */}
                  <div className="p-4 rounded-xl bg-white dark:bg-stone-800/80 border border-emerald-100 dark:border-stone-700/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block mb-1">
                      Opción 2: Automático en Tiempo Real (Apps Script)
                    </span>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed mb-2">
                      Para que cada nuevo suscriptor se añada <strong>al instante</strong> como una fila en tu Google Sheet:
                    </p>
                    <ol className="text-xs text-stone-700 dark:text-stone-300 space-y-1 list-decimal ml-4">
                      <li>En tu Google Sheet ve a <strong>Extensiones &gt; Apps Script</strong>.</li>
                      <li>Pega el código de abajo y pulsa <strong>Implementar &gt; Nueva implementación (Aplicación Web, Acceso: Cualquiera)</strong>.</li>
                      <li>Pega la URL resultante en la pestaña <strong>Configuración</strong> de este panel.</li>
                    </ol>
                  </div>
                </div>

                {/* Google Apps Script code snippet */}
                <div className="rounded-xl bg-stone-900 text-stone-200 p-3.5 border border-stone-800 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] text-amber-400 font-semibold">
                      Código para Google Apps Script (Código.gs):
                    </span>
                    <button
                      onClick={() => {
                        const code = `function doPost(e) {\\n  try {\\n    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();\\n    if (sheet.getLastRow() === 0) {\\n      sheet.appendRow(["Fecha y Hora", "Correo Electrónico", "Frecuencia", "Origen"]);\\n      var h = sheet.getRange(1, 1, 1, 4);\\n      h.setFontWeight("bold");\\n      h.setBackground("#1b4332");\\n      h.setFontColor("#ffffff");\\n      sheet.setColumnWidth(1, 180);\\n      sheet.setColumnWidth(2, 260);\\n      sheet.setColumnWidth(3, 130);\\n      sheet.setColumnWidth(4, 200);\\n    }\\n    var data = {};\\n    if (e && e.postData && e.postData.contents) {\\n      try { data = JSON.parse(e.postData.contents); } catch (err) { data = { email: e.postData.contents }; }\\n    } else if (e && e.parameter) {\\n      data = e.parameter;\\n    }\\n    var email = data.email || "correo@ejemplo.com";\\n    var frequency = data.frequency || "semanal";\\n    var source = data.source || "Blog Pizarra & Criterio";\\n    var now = Utilities.formatDate(new Date(), "GMT+1", "yyyy-MM-dd HH:mm:ss");\\n    sheet.appendRow([now, email, frequency, source]);\\n    return ContentService.createTextOutput("OK");\\n  } catch (error) {\\n    return ContentService.createTextOutput("Error: " + error.toString());\\n  }\\n}\\n\\nfunction doGet(e) {\\n  return ContentService.createTextOutput("¡Webhook activo y listo para recibir suscriptores del blog!");\\n}`;
                        navigator.clipboard.writeText(code);
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2500);
                      }}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 cursor-pointer font-sans"
                    >
                      {copiedScript ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? '¡Código Copiado al Portapapeles!' : 'Copiar Código'}</span>
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] leading-relaxed overflow-x-auto text-stone-300">
{`function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Fecha y Hora", "Correo Electrónico", "Frecuencia", "Origen"]);
      var h = sheet.getRange(1, 1, 1, 4);
      h.setFontWeight("bold");
      h.setBackground("#1b4332");
      h.setFontColor("#ffffff");
      sheet.setColumnWidth(1, 180);
      sheet.setColumnWidth(2, 260);
      sheet.setColumnWidth(3, 130);
      sheet.setColumnWidth(4, 200);
    }
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (err) { data = { email: e.postData.contents }; }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    var email = data.email || "correo@ejemplo.com";
    var frequency = data.frequency || "semanal";
    var source = data.source || "Blog Pizarra & Criterio";
    var now = Utilities.formatDate(new Date(), "GMT+1", "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([now, email, frequency, source]);
    return ContentService.createTextOutput("OK");
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString());
  }
}

function doGet(e) {
  return ContentService.createTextOutput("¡Webhook activo y listo para recibir suscriptores del blog!");
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BLOG SETTINGS */}
          {currentTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  Configuración del Blog & Autor
                </h2>
                <p className="text-xs text-stone-500">
                  Personaliza la identidad visual y los datos del entrenador titular.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Título Principal del Blog
                  </label>
                  <input
                    type="text"
                    value={tempSettings.blogTitle}
                    onChange={e => setTempSettings({ ...tempSettings, blogTitle: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Subtítulo / Lema de la Pizarra
                  </label>
                  <input
                    type="text"
                    value={tempSettings.blogSubtitle}
                    onChange={e => setTempSettings({ ...tempSettings, blogSubtitle: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Nombre del Entrenador
                    </label>
                    <input
                      type="text"
                      value={tempSettings.authorName}
                      onChange={e => setTempSettings({ ...tempSettings, authorName: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Temporadas de Experiencia
                    </label>
                    <input
                      type="number"
                      value={tempSettings.yearsOfExperience}
                      onChange={e => setTempSettings({ ...tempSettings, yearsOfExperience: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Titulación / Cargo
                  </label>
                  <input
                    type="text"
                    value={tempSettings.authorRole}
                    onChange={e => setTempSettings({ ...tempSettings, authorRole: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Biografía y Filosofía de Juego
                  </label>
                  <textarea
                    rows={4}
                    value={tempSettings.authorBio}
                    onChange={e => setTempSettings({ ...tempSettings, authorBio: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-serif"
                  />
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-stone-900/80 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <span>URL Webhook de Google Sheets (Opcional)</span>
                    </label>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      Sincronización en vivo
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      value={tempSettings.googleSheetWebhookUrl || ''}
                      onChange={e => setTempSettings({ ...tempSettings, googleSheetWebhookUrl: e.target.value })}
                      className="flex-1 px-3 py-2 text-xs rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleTestWebhook}
                      disabled={isTestingWebhook}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                      title="Enviar una fila de prueba a tu Google Sheet para comprobar que funciona"
                    >
                      {isTestingWebhook ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Probando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Probar Conexión</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    Pega aquí la URL de tu Aplicación Web de Google Apps Script (tienes el código y la guía paso a paso en la pestaña <strong>Suscriptores</strong>). Al pulsar «Probar Conexión» se enviará un registro de prueba a tu hoja de cálculo.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onSaveSettings(tempSettings);
                      showNotification('Configuración del blog guardada correctamente.');
                    }}
                    className="px-5 py-2.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs"
                  >
                    Guardar Cambios de Configuración
                  </button>
                </div>
              </div>

              {/* Data Backup & Factory Reset */}
              <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-4">
                <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                  Copia de Seguridad y Restauración
                </h3>
                <p className="text-xs text-stone-500">
                  Puedes descargar todos tus artículos y comentarios en un archivo JSON para tener tu copia local segura.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={onExportBackup}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Backup (JSON)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('¿Restablecer los artículos tácticos de demostración originales?')) {
                        onResetAllData();
                        showNotification('Datos restablecidos.');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-900 text-xs font-medium"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restablecer Datos Iniciales</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* AI Article Creator Modal */}
      <AiArticleModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onLoadIntoEditor={handleLoadAiArticleIntoEditor}
        onPublishDirectly={handlePublishAiArticleDirectly}
      />
    </div>
  );
};

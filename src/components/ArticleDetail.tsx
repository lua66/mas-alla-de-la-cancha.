import React, { useState } from 'react';
import { Article, Comment } from '../types/blog';
import { ArrowLeft, Clock, MessageSquare, ThumbsUp, Bookmark, Share2, ZoomIn, ZoomOut, Send, CheckCircle2 } from 'lucide-react';
import { TacticalCourtDiagram } from './TacticalCourtDiagram';
import { SocialIconsRow, ArticleShareBar } from './SocialLinks';

interface ArticleDetailProps {
  article: Article;
  comments: Comment[];
  onBack: () => void;
  onCategoryClick: (category: string) => void;
  onTagClick: (tag: string) => void;
  onAddComment: (commentData: {
    articleId: string;
    articleTitle: string;
    authorName: string;
    authorRole?: string;
    email: string;
    text: string;
  }) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onLike: (id: string) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  comments,
  onBack,
  onCategoryClick,
  onTagClick,
  onAddComment,
  isBookmarked,
  onToggleBookmark,
  onLike
}) => {
  // Comment form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [copyLinkNotice, setCopyLinkNotice] = useState(false);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !commentText.trim()) return;

    onAddComment({
      articleId: article.id,
      articleTitle: article.title,
      authorName: name,
      authorRole: role || 'Entrenador / Lector',
      email: email,
      text: commentText
    });

    setName('');
    setRole('');
    setEmail('');
    setCommentText('');
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 5000);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopyLinkNotice(true);
      setTimeout(() => setCopyLinkNotice(false), 3000);
    }
  };

  const handleLikeClick = () => {
    if (!hasLiked) {
      onLike(article.id);
      setHasLiked(true);
    }
  };

  // Render markdown-like sections cleanly with high-contrast text in dark mode
  const renderFormattedContent = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white mt-8 mb-4 pt-4 border-t border-stone-200/60 dark:border-stone-800">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl sm:text-2xl font-serif font-semibold text-stone-900 dark:text-stone-100 mt-6 mb-3">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="my-6 p-4 sm:p-5 bg-amber-50/70 dark:bg-stone-900/90 rounded-xl border border-amber-300 dark:border-amber-700/60 text-stone-900 dark:text-amber-100 font-serif italic text-lg sm:text-xl leading-relaxed">
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const itemContent = trimmed.substring(2);
        return (
          <li key={idx} className="ml-5 list-disc text-stone-800 dark:text-stone-100 my-2 pl-1 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemContent) }} />
          </li>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const itemContent = trimmed.replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="ml-5 list-decimal text-stone-800 dark:text-stone-100 my-2 pl-1 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemContent) }} />
          </li>
        );
      }
      if (trimmed === '') {
        return <div key={idx} className="h-3" />;
      }
      return (
        <p key={idx} className="text-stone-800 dark:text-stone-100 my-4 leading-relaxed font-serif">
          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
        </p>
      );
    });
  };

  const formatInlineMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-stone-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-stone-900 dark:text-stone-100">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-sm text-stone-900 dark:text-stone-100">$1</code>');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Prominent 'Volver al índice' button */}
      <div className="pb-6 mb-8 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          title="Volver al índice de artículos del cuaderno"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-900 dark:text-stone-100 bg-white dark:bg-[#1C1A18] border-2 border-stone-300 dark:border-stone-700 shadow-xs hover:border-amber-700 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-900 dark:hover:text-amber-300 transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700 dark:text-amber-400 transition-transform group-hover:-translate-x-1" />
          <span>Volver al índice</span>
        </button>

        <span className="text-xs text-stone-500 dark:text-stone-400 font-serif italic hidden sm:inline">
          Pizarra & Criterio · Cuaderno de Baloncesto
        </span>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        {/* Category & Date & Read time */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-4">
          <button
            onClick={() => onCategoryClick(article.category)}
            className="font-medium text-amber-800 dark:text-amber-400 hover:underline"
          >
            {article.category}
          </button>
          <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
          <span>Publicado el {article.publishedAt}</span>
          <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            {article.readTimeMinutes} min de lectura
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight leading-tight mb-5">
          {article.title}
        </h1>

        {/* Author Byline */}
        <div className="flex items-center justify-between gap-4 py-4 border-y border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-amber-800 text-white flex items-center justify-center font-serif text-base font-bold shadow-xs">
              {article.author
                .replace(/^Coach\s+/i, '')
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('') || 'LH'}
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {article.author}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {article.authorRole}
              </p>
            </div>
          </div>

          {/* Social/Reading action controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                hasLiked
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{article.likesCount + (hasLiked ? 1 : 0)}</span>
            </button>

            <button
              onClick={() => onToggleBookmark(article.id)}
              title={isBookmarked ? 'Guardado' : 'Guardar'}
              className="p-2 rounded-lg bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 mx-1 hidden sm:block" />

            {/* Social network symbols (Instagram, Facebook, LinkedIn, Mail) */}
            <div className="hidden sm:flex items-center">
              <SocialIconsRow size="sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Featured Cover Image */}
      {article.coverImage && (
        <div className="mb-8 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm">
          <img
            src={article.coverImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full max-h-[460px] object-cover"
          />
          <div className="p-2.5 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 font-serif italic text-center">
            Pizarra técnica y detalles de juego analizados en pista por {article.author}
          </div>
        </div>
      )}

      {/* Article Body */}
      <div className="prose dark:prose-invert max-w-none text-lg sm:text-xl leading-relaxed font-serif text-stone-800 dark:text-stone-100">
        {renderFormattedContent(article.content)}
      </div>

      {/* Embedded Tactical Whiteboard Feature */}
      <div className="my-10">
        <TacticalCourtDiagram />
      </div>

      {/* Tags section */}
      <div className="pt-6 pb-8 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-2">
        <span className="text-xs text-stone-600 dark:text-stone-300 font-medium mr-1">
          Etiquetas del tema:
        </span>
        {article.tags.map(tag => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className="text-xs px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-950 dark:hover:text-amber-200 transition-colors cursor-pointer"
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Social Network Share & Connect Bar */}
      <div className="my-8">
        <ArticleShareBar articleTitle={article.title} />
      </div>

      {/* Comments Section */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-700 dark:text-amber-500" />
              <span>Criterios y Comentarios ({comments.length})</span>
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
              Espacio abierto al debate constructivo entre entrenadores, árbitros y jugadores.
            </p>
          </div>
        </div>

        {/* Existing Comments List */}
        <div className="space-y-4 mb-10">
          {comments.length === 0 ? (
            <div className="p-8 text-center bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
              <p className="text-stone-600 dark:text-stone-300 text-sm font-serif">
                Aún no hay comentarios en este artículo. Sé el primer entrenador en dejar tu visión.
              </p>
            </div>
          ) : (
            comments.map(c => (
              <div
                key={c.id}
                className="p-5 rounded-xl bg-white dark:bg-[#1A1816] border border-stone-200/80 dark:border-stone-800 shadow-xs"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-stone-900 dark:text-white">
                      {c.authorName}
                    </span>
                    <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
                    <span className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                      {c.authorRole}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400 dark:text-stone-400">
                    {new Date(c.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-stone-800 dark:text-stone-100 text-sm leading-relaxed font-serif">
                  {c.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <div className="bg-stone-50 dark:bg-stone-900/80 p-6 sm:p-7 rounded-xl border border-stone-200 dark:border-stone-800">
          <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white mb-1">
            Deja tu criterio sobre la jugada
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 mb-5">
            Tu opinión aporta riqueza al análisis táctico. No se publicará tu correo electrónico.
          </p>

          {submittedSuccess && (
            <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>¡Comentario publicado con éxito! Gracias por sumar al cuaderno de baloncesto.</span>
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-800 dark:text-stone-200 mb-1">
                  Nombre y Apellidos *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Manolo García"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-800 dark:text-stone-200 mb-1">
                  Tu Rol o Club (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Entrenador Junior / Aficionado"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-800 dark:text-stone-200 mb-1">
                Correo Electrónico (No será visible) *
              </label>
              <input
                type="email"
                required
                placeholder="tu.correo@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-800 dark:text-stone-200 mb-1">
                Comentario o Criterio Táctico *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Escribe aquí tu análisis, acuerdo o matiz sobre el tema expuesto..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-1 focus:ring-amber-600 font-sans"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-sm font-medium transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Publicar Comentario</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Bottom return to index button */}
      <div className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 flex justify-center">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-[#1C1A18] border border-stone-300 dark:border-stone-700 shadow-2xs hover:border-amber-600 dark:hover:border-amber-500 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700 dark:text-amber-400 transition-transform group-hover:-translate-x-1" />
          <span>Volver al índice de artículos</span>
        </button>
      </div>
    </div>
  );
};

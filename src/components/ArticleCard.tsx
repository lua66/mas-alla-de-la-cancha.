import React, { useState } from 'react';
import { Article } from '../types/blog';
import { MessageSquare, Clock, ArrowRight, Bookmark } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  commentCount: number;
  onSelect: (article: Article) => void;
  onTagClick?: (tag: string) => void;
  onCategoryClick?: (category: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  commentCount,
  onSelect,
  onTagClick,
  onCategoryClick,
  isBookmarked,
  onToggleBookmark
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="group bg-white dark:bg-[#1C1A18] rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      
      {/* Cover Image container */}
      <div
        onClick={() => onSelect(article)}
        className="relative aspect-16/9 w-full bg-stone-100 dark:bg-stone-800 cursor-pointer overflow-hidden"
      >
        {!imageError && article.coverImage ? (
          <picture>
            {article.coverImage.endsWith('.jpg') && (
              <source srcSet={article.coverImage.replace(/\.jpg$/, '.webp')} type="image/webp" />
            )}
            <img
              src={article.coverImage}
              alt={article.title}
              width="640"
              height="360"
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          </picture>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-800/10 to-stone-800/20 text-stone-400">
            <svg viewBox="0 0 24 24" className="w-12 h-12 stroke-current stroke-1 fill-none mb-2 text-amber-700/60">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15 15 0 0 1 0 20" />
              <path d="M12 2a15 15 0 0 0 0 20" />
              <path d="M2 12h20" />
            </svg>
            <span className="text-xs font-serif italic text-stone-500">Pizarra & Criterio</span>
          </div>
        )}

        {/* Subtle bookmark button in corner */}
        {onToggleBookmark && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article.id);
            }}
            title={isBookmarked ? 'Guardado en lectura' : 'Guardar para leer después'}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/60 backdrop-blur-xs text-white hover:bg-stone-900/90 transition-colors"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Zero-Pill Unboxed Metadata */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-2.5">
            <button
              onClick={() => onCategoryClick?.(article.category)}
              className="font-semibold text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
            >
              {article.category}
            </button>
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
            <span className="text-stone-600 dark:text-stone-300">{article.publishedAt}</span>
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
            <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
              <Clock className="w-3 h-3 text-stone-400 dark:text-stone-400" />
              {article.readTimeMinutes} min
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(article)}
            className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors leading-snug cursor-pointer mb-2.5 line-clamp-2"
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-stone-700 dark:text-stone-200 text-sm leading-relaxed line-clamp-3 mb-4">
            {article.excerpt}
          </p>
        </div>

        {/* Footer info: tags & comments count */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 text-xs">
          {/* Subtle text tags */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {article.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="text-[11px] text-stone-600 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-300 hover:underline transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Comments count */}
          <button
            onClick={() => onSelect(article)}
            className="flex items-center gap-1 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span className="font-medium">{commentCount}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

import React, { useState } from 'react';
import { Article, BlogSettings } from '../types/blog';
import { Mail, Calendar, Folder, Tag, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SocialIconsRow } from './SocialLinks';

interface SidebarProps {
  settings: BlogSettings;
  articles: Article[];
  selectedCategory: string | null;
  selectedTag: string | null;
  onSelectCategory: (category: string | null) => void;
  onSelectTag: (tag: string | null) => void;
  onSubscribe: (email: string, frequency: 'semanal' | 'mensual') => { success: boolean; message: string };
  onSelectArchiveMonth?: (monthYear: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  articles,
  selectedCategory,
  selectedTag,
  onSelectCategory,
  onSelectTag,
  onSubscribe,
  onSelectArchiveMonth
}) => {
  // Newsletter state
  const [subEmail, setSubEmail] = useState('');
  const [subFreq, setSubFreq] = useState<'semanal' | 'mensual'>('semanal');
  const [subFeedback, setSubFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Archive accordion state
  const [isArchiveOpen, setIsArchiveOpen] = useState(true);

  // Calculate categories with counts
  const categoryCounts = articles.reduce<Record<string, number>>((acc, art) => {
    if (art.status === 'published') {
      acc[art.category] = (acc[art.category] || 0) + 1;
    }
    return acc;
  }, {});

  // Calculate unique tags
  const allTags = Array.from(
    new Set(
      articles
        .filter(a => a.status === 'published')
        .flatMap(a => a.tags)
    )
  );

  // Group archive by Year - Month
  const archiveGroups = articles
    .filter(a => a.status === 'published')
    .reduce<Record<string, { label: string; count: number }>>((acc, art) => {
      const date = new Date(art.publishedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      
      if (!acc[key]) {
        acc[key] = { label: capitalized, count: 0 };
      }
      acc[key].count++;
      return acc;
    }, {});

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    const result = onSubscribe(subEmail, subFreq);
    setSubFeedback(result);
    if (result.success) {
      setSubEmail('');
    }
  };

  return (
    <aside className="w-full space-y-7">
      
      {/* 1. Author Profile Widget (Classic Blogger Style) */}
      <div className="bg-white dark:bg-[#1C1A18] p-6 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-700/40 shrink-0">
            <img
              src={settings.authorAvatar}
              alt={settings.authorName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
              {settings.authorName}
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-tight mt-0.5">
              {settings.authorRole}
            </p>
          </div>
        </div>

        <p className="text-xs text-stone-700 dark:text-stone-200 leading-relaxed font-serif mb-4">
          {settings.authorBio}
        </p>

        {/* Social Network symbols */}
        <div className="mb-4 pt-2">
          <SocialIconsRow size="sm" variant="outline" />
        </div>

        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-300">
          <span>Experiencia: {settings.yearsOfExperience} temporadas</span>
          <span className="font-semibold text-stone-800 dark:text-amber-400">De Cuba a Barcelona</span>
        </div>
      </div>

      {/* 2. Categories Widget */}
      <div className="bg-white dark:bg-[#1C1A18] p-6 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-700 dark:text-amber-500" />
            <span>Categorías del Blog</span>
          </h3>
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-[11px] text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          )}
        </div>

        <div className="space-y-1">
          {Object.entries(categoryCounts).map(([cat, count]) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(isSelected ? null : cat)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                    : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80'
                }`}
              >
                <span>{cat}</span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Newsletter Subscription Widget */}
      <div className="bg-gradient-to-br from-amber-50/80 to-stone-100/90 dark:from-[#1E1C1A] dark:to-[#171513] p-6 rounded-xl border border-amber-200/80 dark:border-amber-900/40 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-400">
          <Mail className="w-4 h-4" />
          <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
            Boletín por Correo
          </h3>
        </div>

        <p className="text-xs text-stone-700 dark:text-stone-200 leading-relaxed mb-4">
          Recibe en tu correo cada nuevo artículo de táctica y análisis técnico en cuanto se publique.
        </p>

        {subFeedback ? (
          <div className="p-3 bg-white dark:bg-stone-800 rounded-lg border border-amber-300 dark:border-amber-700/60 text-xs text-stone-800 dark:text-stone-100 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{subFeedback.message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribeSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="tu-correo@ejemplo.com"
              value={subEmail}
              onChange={e => setSubEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-1 focus:ring-amber-700"
            />

            <div className="flex items-center justify-between text-[11px] text-stone-700 dark:text-stone-300 px-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="freq"
                  value="semanal"
                  checked={subFreq === 'semanal'}
                  onChange={() => setSubFreq('semanal')}
                  className="text-amber-700 focus:ring-amber-700"
                />
                Semanal
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="freq"
                  value="mensual"
                  checked={subFreq === 'mensual'}
                  onChange={() => setSubFreq('mensual')}
                  className="text-amber-700 focus:ring-amber-700"
                />
                Resumen mensual
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              Suscribirme al Boletín
            </button>
          </form>
        )}
      </div>

      {/* 4. Tag Cloud Widget */}
      <div className="bg-white dark:bg-[#1C1A18] p-6 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-700 dark:text-amber-500" />
            <span>Etiquetas</span>
          </h3>
          {selectedTag && (
            <button
              onClick={() => onSelectTag(null)}
              className="text-[11px] text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Limpiar filtro
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {allTags.map(tag => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-800 text-white font-medium'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Classic Blogger Archive Widget */}
      <div className="bg-white dark:bg-[#1C1A18] p-6 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <button
          onClick={() => setIsArchiveOpen(!isArchiveOpen)}
          className="w-full flex items-center justify-between text-left font-serif font-bold text-sm text-stone-900 dark:text-white cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-500" />
            <span>Archivo del Blog</span>
          </span>
          {isArchiveOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
        </button>

        {isArchiveOpen && (
          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
            {Object.entries(archiveGroups).map(([key, item]) => (
              <button
                key={key}
                onClick={() => onSelectArchiveMonth?.(key)}
                className="w-full flex items-center justify-between py-1 px-2 rounded text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-left cursor-pointer"
              >
                <span>{item.label}</span>
                <span className="font-mono text-stone-400 dark:text-stone-400">({item.count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

    </aside>
  );
};

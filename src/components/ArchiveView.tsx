import React, { useState } from 'react';
import { Article } from '../types/blog';
import { Search, Calendar, Folder, Clock, ArrowRight } from 'lucide-react';

interface ArchiveViewProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onCategoryClick: (category: string) => void;
  onTagClick: (tag: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  articles,
  onSelectArticle,
  onCategoryClick,
  onTagClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const published = articles.filter(a => a.status === 'published');

  // Extract years
  const availableYears = Array.from(
    new Set(published.map(a => new Date(a.publishedAt).getFullYear().toString()))
  ).sort().reverse();

  // Filter
  const filtered = published.filter(art => {
    const matchesYear =
      selectedYear === 'all' ||
      new Date(art.publishedAt).getFullYear().toString() === selectedYear;

    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      art.title.toLowerCase().includes(query) ||
      art.excerpt.toLowerCase().includes(query) ||
      art.content.toLowerCase().includes(query) ||
      art.category.toLowerCase().includes(query) ||
      art.tags.some(t => t.toLowerCase().includes(query));

    return matchesYear && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white tracking-tight">
          Archivo Histórico de Artículos
        </h1>
        <p className="text-sm text-stone-700 dark:text-stone-200 mt-2 font-serif">
          Encuentra fácilmente cualquier criterio táctico, análisis o reflexión del cuaderno por fecha, categoría o término clave.
        </p>
      </div>

      {/* Filter and Search Bar Box */}
      <div className="bg-white dark:bg-[#1C1A18] p-5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-xs mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search input */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por título, concepto táctico, jugador..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-1 focus:ring-amber-700"
          />
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-700 font-mono"
          >
            <option value="all">Todos los años ({published.length})</option>
            {availableYears.map(yr => (
              <option key={yr} value={yr}>
                Año {yr} ({published.filter(a => new Date(a.publishedAt).getFullYear().toString() === yr).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-stone-600 dark:text-stone-300 mb-4 flex items-center justify-between">
        <span>Mostrando {filtered.length} {filtered.length === 1 ? 'artículo' : 'artículos'} archivados</span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>

      {/* Archive Chronological Listing */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 font-serif text-sm">
            No se encontraron artículos con los criterios seleccionados. Prueba con otros términos como &quot;defensa&quot;, &quot;pase&quot; o &quot;Pick&quot;.
          </div>
        ) : (
          filtered.map(art => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="group p-5 bg-white dark:bg-[#1C1A18] rounded-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-700/80 shadow-xs transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-1.5">
                  <span className="font-mono text-stone-600 dark:text-stone-300">{art.publishedAt}</span>
                  <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
                  <span className="text-amber-800 dark:text-amber-400 font-medium">{art.category}</span>
                  <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
                  <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                    <Clock className="w-3 h-3 text-stone-400 dark:text-stone-400" />
                    {art.readTimeMinutes} min
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-stone-700 dark:text-stone-200 line-clamp-2 mt-1 font-serif leading-relaxed">
                  {art.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {art.tags.map(t => (
                    <span key={t} className="text-[11px] text-stone-500 dark:text-stone-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hidden sm:flex items-center text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

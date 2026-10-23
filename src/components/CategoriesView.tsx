import React from 'react';
import { Article } from '../types/blog';
import { ArticleCard } from './ArticleCard';
import { Shield, Sparkles, Users, Award, BookOpen, Compass } from 'lucide-react';

interface CategoriesViewProps {
  articles: Article[];
  commentsCountMap: Record<string, number>;
  onSelectArticle: (article: Article) => void;
  onTagClick: (tag: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

const CATEGORY_METADATA: Record<string, { desc: string; icon: any }> = {
  'Táctica Defensiva': {
    desc: 'Normas innegociables, balance defensivo, defensa de bloqueos, presión a toda pista y conceptos de ayudas.',
    icon: Shield
  },
  'Ataque por Conceptos': {
    desc: 'Espaciamiento (spacing), lectura del bloqueo directo e indirecto, juego por conceptos y toma de decisiones.',
    icon: Compass
  },
  'Desarrollo de Fundamentos': {
    desc: 'Técnica individual en categorías de cantera: bote útil, pase extra, paradas, pivotes y tiro en suspensión.',
    icon: Sparkles
  },
  'Gestión de Vestuario': {
    desc: 'Liderazgo desde la soledad del banquillo, psicología del jugador, reparto de roles y cohesión de grupo.',
    icon: Users
  },
  'Preparación Física': {
    desc: 'Prevención de lesiones, cargas de entrenamiento durante la temporada y pliometría aplicada al salto y desplazamiento.',
    icon: Award
  },
  'Reglamento y Arbitraje': {
    desc: 'Interpretaciones reglamentarias de la FIBA: pasos de salida, faltas antideportivas y relación árbitro-entrenador.',
    icon: BookOpen
  }
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  articles,
  commentsCountMap,
  onSelectArticle,
  onTagClick,
  selectedCategory,
  onSelectCategory
}) => {
  const publishedArticles = articles.filter(a => a.status === 'published');
  
  // Get all unique categories present in published articles
  const categoriesPresent = Array.from(new Set(publishedArticles.map(a => a.category)));

  const filteredArticles = selectedCategory
    ? publishedArticles.filter(a => a.category === selectedCategory)
    : publishedArticles;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white tracking-tight">
          Índice de Categorías Técnicas
        </h1>
        <p className="text-sm text-stone-700 dark:text-stone-200 mt-2 max-w-2xl font-serif">
          Todos los criterios y análisis organizados por áreas de conocimiento técnico y táctico para facilitar la consulta a entrenadores y clubes.
        </p>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {categoriesPresent.map(cat => {
          const meta = CATEGORY_METADATA[cat] || {
            desc: 'Reflexiones y criterios prácticos sobre este aspecto del juego.',
            icon: BookOpen
          };
          const Icon = meta.icon;
          const count = publishedArticles.filter(a => a.category === cat).length;
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(isSelected ? null : cat)}
              className={`text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 shadow-xs'
                  : 'bg-white dark:bg-[#1C1A18] border-stone-200/80 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-amber-700 dark:text-amber-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  {count} {count === 1 ? 'artículo' : 'artículos'}
                </span>
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white mb-1">
                {cat}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {meta.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filtered Articles Title */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-200 dark:border-stone-800">
        <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
          {selectedCategory ? `Artículos en: ${selectedCategory}` : 'Todos los Artículos Clasificados'}
        </h2>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
          >
            Mostrar todas las categorías
          </button>
        )}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            commentCount={commentsCountMap[article.id] || 0}
            onSelect={onSelectArticle}
            onTagClick={onTagClick}
            onCategoryClick={onSelectCategory}
          />
        ))}
      </div>
    </div>
  );
};

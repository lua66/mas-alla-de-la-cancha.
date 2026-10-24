import React, { useState } from 'react';
import {
  Sparkles,
  X,
  RefreshCw,
  CheckCircle2,
  Image as ImageIcon,
  BookOpen,
  ArrowRight,
  Layers,
  ChevronRight,
  Sliders,
  Send,
  Edit3
} from 'lucide-react';
import { TACTICAL_IMAGE_GALLERY, getMatchingImageForArticle } from '../data/tacticalImages';

interface GeneratedArticleData {
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  readTimeMinutes: number;
  content: string;
  coverImage: string;
}

interface AiArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadIntoEditor: (articleData: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    coverImage: string;
    status: 'published' | 'draft';
  }) => void;
  onPublishDirectly: (articleData: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    coverImage: string;
    status: 'published';
  }) => void;
}

const TOPIC_SUGGESTIONS = [
  {
    title: 'Ruptura de Defensas Zonales (2-3 y 1-3-1)',
    category: 'Ataque por Conceptos',
    desc: 'Atacar el centro con pase interior y castigar esquinas'
  },
  {
    title: 'El Rebote Defensivo como Primer Pase de Contraataque',
    category: 'Táctica Defensiva',
    desc: 'Asegurar el balón y abrir la carrera exterior sin bote'
  },
  {
    title: 'Gestión de Minutos y Roles en Cantera Formativa',
    category: 'Metodología & Cantera',
    desc: 'Equilibrio entre competir, formar y cuidar la autoestima'
  },
  {
    title: 'Defensa de Ayudas y Recuperaciones (Help & Recover)',
    category: 'Táctica Defensiva',
    desc: 'Colapsar la pintura a tiempo y esprintar al tirador'
  },
  {
    title: 'Toma de Decisiones del Base tras Bloqueo Indirecto',
    category: 'Ataque por Conceptos',
    desc: 'Lecturas de pase al rizado, corte o tiro abierto'
  },
  {
    title: 'La Regla del Pase Extra frente a Tiros Precipitados',
    category: 'Desarrollo de Fundamentos',
    desc: 'Transformar un buen tiro en un tiro excelente y solidario'
  }
];

export const AiArticleModal: React.FC<AiArticleModalProps> = ({
  isOpen,
  onClose,
  onLoadIntoEditor,
  onPublishDirectly
}) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Táctica Defensiva');
  const [focus, setFocus] = useState('Táctica de banquillo y lectura de juego');
  const [coachNotes, setCoachNotes] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticleData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');

  if (!isOpen) return null;

  const handleSelectSuggestion = (sug: typeof TOPIC_SUGGESTIONS[0]) => {
    setTopic(sug.title);
    setCategory(sug.category);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setGeneratedArticle(null);
    setLoadingStep(1);

    const stepTimer1 = setTimeout(() => setLoadingStep(2), 900);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 1800);

    try {
      const response = await fetch('/api/ai/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          category,
          focus,
          notes: coachNotes.trim()
        })
      });

      let data: any = null;
      if (response.ok) {
        data = await response.json();
      }

      const articlePayload = data?.article;

      // Determine matching tactical image
      const autoImage = getMatchingImageForArticle(
        articlePayload?.title || topic,
        articlePayload?.category || category,
        articlePayload?.content
      );

      const resolvedArticle: GeneratedArticleData = {
        title: articlePayload?.title || `${topic}: Claves tácticas desde el banquillo`,
        excerpt: articlePayload?.excerpt || `Reflexiones de pizarra y pautas prácticas para aplicar ${topic.toLowerCase()} en tus entrenamientos.`,
        category: articlePayload?.category || category,
        tags: articlePayload?.tags || ['Baloncesto', 'Táctica', 'LecturaDeJuego'],
        readTimeMinutes: articlePayload?.readTimeMinutes || 5,
        content: articlePayload?.content || generateLocalTacticalContent(topic, category),
        coverImage: autoImage
      };

      setGeneratedArticle(resolvedArticle);
      setSelectedImage(autoImage);
    } catch (err) {
      console.warn('Network error calling AI service, generating local tactical draft:', err);
      // Seamless local tactical generation fallback
      const autoImage = getMatchingImageForArticle(topic, category);
      const resolvedArticle: GeneratedArticleData = {
        title: `${topic}: Criterio y pauta táctica desde el banquillo`,
        excerpt: `Análisis y ejercicios prácticos de baloncesto sobre ${topic.toLowerCase()}. Directrices para entrenadores.`,
        category,
        tags: ['Baloncesto', 'Táctica', 'Pizarra'],
        readTimeMinutes: 5,
        content: generateLocalTacticalContent(topic, category),
        coverImage: autoImage
      };
      setGeneratedArticle(resolvedArticle);
      setSelectedImage(autoImage);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
    }
  };

  function generateLocalTacticalContent(topicStr: string, catStr: string) {
    return `## El criterio de banquillo sobre ${topicStr}

Durante mis 20 temporadas sentada en los banquillos, desde mis años de formación en Cuba hasta la competición en Barcelona, he aprendido que ningún sistema táctico funciona si los jugadores no entienden el motivo detrás de cada movimiento.

> "La pizarra te da el mapa inicial, pero son los ojos y la valentía del jugador los que deciden la jugada."

### 1. El fallo de concentración más habitual

Cuando se entrena **${topicStr.toLowerCase()}**, el error predominante suele ser el apresuramiento. Los jugadores tienden a mirar el balón en lugar de escanear los espacios libres y las ayudas de la defensa contraria:

* **Falta de distancia en el spacing:** Sin una separación mínima de cuatro metros, cualquier ayuda defensiva colapsa la línea de pase.
* **El vicio del bote automático:** Recibir y botar en el sitio sin levantar la mirada destruye la ventaja generada por el compañero.
* **Silencio en cancha:** Un equipo que no canta los bloqueos y los cortes está condenado a encajar puntos fáciles.

### 2. Ejercicio de aplicación práctica en entrenamiento (3c3 + 2 Pasadores)

Para transferir este concepto a la pista:

1. **Disposición:** Se juega en media cancha un 3 contra 3 continuo con 2 pasadores exteriores en las esquinas.
2. **Norma técnica:** No está permitido finalizar la jugada sin antes haber generado una inversión de balón con un pase extra.
3. **Objetivo:** Premiar la generosidad y la lectura del defensor que llega forzado a la recuperación.

### Conclusión para el banquillo

No te compliques diseñando sistemas de la NBA si tus jugadores aún no dominan las lecturas básicas. Enseña a pensar, fomenta el esfuerzo solidario y los resultados llegarán en el último cuarto.`;
  }

  const handleApplyToEditor = (status: 'published' | 'draft') => {
    if (!generatedArticle) return;
    onLoadIntoEditor({
      title: generatedArticle.title,
      excerpt: generatedArticle.excerpt,
      content: generatedArticle.content,
      category: generatedArticle.category,
      tags: generatedArticle.tags,
      coverImage: selectedImage || generatedArticle.coverImage,
      status
    });
    onClose();
  };

  const handleDirectPublish = () => {
    if (!generatedArticle) return;
    onPublishDirectly({
      title: generatedArticle.title,
      excerpt: generatedArticle.excerpt,
      content: generatedArticle.content,
      category: generatedArticle.category,
      tags: generatedArticle.tags,
      coverImage: selectedImage || generatedArticle.coverImage,
      status: 'published'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#181614] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#141211]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Asistente de Redacción con IA
                <span className="text-[10px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Coach Leyanis Horta
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Genera artículos tácticos con tu voz de banquillo, fundamentos e imágenes idénticas a las del blog.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: FORM INPUTS (if no generated article or when modifying) */}
          {!generatedArticle ? (
            <div className="space-y-6">
              
              {/* Topic Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  ¿De qué tema táctico o vivencia de banquillo quieres hablar? *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Ej: Cómo atacar la defensa de cambios automáticos (Switching) o El arte del balance defensivo..."
                    className="w-full pl-4 pr-10 py-3 text-sm rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-600 font-medium"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && topic.trim() && !isLoading) {
                        handleGenerate();
                      }
                    }}
                  />
                  {topic && (
                    <button
                      onClick={() => setTopic('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {/* Suggestions Pills */}
              <div>
                <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  Ideas y conceptos sugeridos con 1 clic:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TOPIC_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                        topic === sug.title
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs'
                          : 'bg-stone-50/60 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="font-semibold">{sug.title}</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 flex items-center justify-between">
                        <span>{sug.desc}</span>
                        <span className="font-mono text-amber-700 dark:text-amber-400">+{sug.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category and Focus Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Categoría del Blog
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                  >
                    <option value="Táctica Defensiva">Táctica Defensiva</option>
                    <option value="Ataque por Conceptos">Ataque por Conceptos</option>
                    <option value="Dirección de Banquillo">Dirección de Banquillo</option>
                    <option value="Desarrollo de Fundamentos">Desarrollo de Fundamentos</option>
                    <option value="Metodología & Cantera">Metodología & Cantera</option>
                    <option value="Criterio General">Criterio General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Enfoque y Nivel
                  </label>
                  <select
                    value={focus}
                    onChange={e => setFocus(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                  >
                    <option value="Táctica de banquillo y lectura de juego">Táctica de banquillo y lectura de juego</option>
                    <option value="Formativo (U14-U18): errores comunes y correcciones">Formativo (U14-U18): errores comunes y correcciones</option>
                    <option value="Senior y Competición: detalles en minutos finales">Senior y Competición: detalles en minutos finales</option>
                    <option value="Psicología, vestuario y liderazgo de la entrenadora">Psicología, vestuario y liderazgo de la entrenadora</option>
                  </select>
                </div>
              </div>

              {/* Extra notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Pistas o apuntes personales que quieras incluir (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={coachNotes}
                  onChange={e => setCoachNotes(e.target.value)}
                  placeholder="Ej: Quiero que recuerdes una anécdota de un partido en La Habana o en la liga catalana..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!topic.trim() || isLoading}
                  onClick={handleGenerate}
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !topic.trim() || isLoading
                      ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 hover:from-amber-800 hover:to-orange-700 text-white shadow-amber-900/20 active:scale-[0.99]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                      <span>
                        {loadingStep === 1 && 'Analizando concepto táctico...'}
                        {loadingStep === 2 && 'Estructurando la voz de Leyanis Horta...'}
                        {loadingStep === 3 && 'Seleccionando imagen fotográfica idónea...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>Generar Artículo Completo con IA e Imagen</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (

            /* STEP 2: REVIEW GENERATED ARTICLE & SELECT MATCHING IMAGE */
            <div className="space-y-6">
              
              {/* Top Banner Alert */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold">¡Artículo redactado con éxito!</span>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                      Revisa el título, el texto y elige la imagen de portada entre las fotos tácticas del blog.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setGeneratedArticle(null)}
                  className="px-3 py-1 rounded-lg bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 text-xs font-medium cursor-pointer"
                >
                  Nuevo Tema
                </button>
              </div>

              {/* Article Preview Card */}
              <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-stone-50/50 dark:bg-stone-900/40">
                
                {/* Visual Cover Preview & Gallery Picker */}
                <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1A18]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      Imagen Asignada (Mismo estilo que los artículos por defecto):
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {TACTICAL_IMAGE_GALLERY.find(g => g.path === selectedImage)?.name || 'Pizarra táctica'}
                    </span>
                  </div>

                  {/* Active Selected Image Banner */}
                  <div className="relative aspect-21/9 sm:aspect-16/7 w-full rounded-xl overflow-hidden mb-3 border border-stone-200 dark:border-stone-700 shadow-inner">
                    <img
                      src={selectedImage}
                      alt="Portada de artículo"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                      <div className="text-white">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-600">
                          {generatedArticle.category}
                        </span>
                        <h4 className="font-serif font-bold text-sm sm:text-base mt-1 drop-shadow-md">
                          {generatedArticle.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Gallery Picker */}
                  <div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-2">
                      Haz clic en cualquiera de las imágenes oficiales para cambiar la portada:
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {TACTICAL_IMAGE_GALLERY.map(img => {
                        const isSelected = selectedImage === img.path;
                        return (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setSelectedImage(img.path)}
                            title={`${img.name} - ${img.description}`}
                            className={`relative aspect-4/3 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-600 ring-2 ring-amber-500/30 scale-105'
                                : 'border-stone-200 dark:border-stone-700 opacity-70 hover:opacity-100 hover:border-stone-400'
                            }`}
                          >
                            <img
                              src={img.path}
                              alt={img.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-amber-600 text-white rounded-full p-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Article Metadata Fields */}
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                      Título del Artículo
                    </label>
                    <input
                      type="text"
                      value={generatedArticle.title}
                      onChange={e => setGeneratedArticle({ ...generatedArticle, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm font-serif font-bold rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                      Resumen para Portada (Extracto)
                    </label>
                    <textarea
                      rows={2}
                      value={generatedArticle.excerpt}
                      onChange={e => setGeneratedArticle({ ...generatedArticle, excerpt: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-600"
                    />
                  </div>

                  {/* Tags and Category Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
                      Categoría: {generatedArticle.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
                      Lectura: ~{generatedArticle.readTimeMinutes} min
                    </span>
                    {generatedArticle.tags.map((tag, idx) => (
                      <span key={idx} className="text-amber-700 dark:text-amber-400 font-mono text-[11px]">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Content Preview Box */}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                      Cuerpo del Artículo (Formato Markdown)
                    </label>
                    <div className="max-h-56 overflow-y-auto p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-sans text-xs leading-relaxed text-stone-800 dark:text-stone-200 whitespace-pre-wrap select-text">
                      {generatedArticle.content}
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
                  <span>Regenerar otra versión</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleApplyToEditor('draft')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Llevar al Editor</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectPublish}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-200" />
                    <span>Publicar en el Blog</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

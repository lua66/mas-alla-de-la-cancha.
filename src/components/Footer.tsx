import React, { useState } from 'react';
import {
  Lock,
  ArrowUp,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Send
} from 'lucide-react';
import { SocialIconsRow } from './SocialLinks';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigate: (view: 'home' | 'categories' | 'tactics' | 'about' | 'archive') => void;
  authorName: string;
  onSubscribe?: (
    email: string,
    frequency: 'semanal' | 'mensual'
  ) => Promise<{ success: boolean; message: string; syncedToSheet?: boolean }> | { success: boolean; message: string; syncedToSheet?: boolean };
  subscriberCount?: number;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onNavigate,
  authorName,
  onSubscribe,
  subscriberCount = 0
}) => {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'semanal' | 'mensual'>('semanal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
    syncedToSheet?: boolean;
  } | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    if (!onSubscribe) {
      setFeedback({
        success: true,
        message: '¡Registro simulado con éxito en la base local!'
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await onSubscribe(email, frequency);
      setFeedback(res);
      if (res.success) {
        setEmail('');
      }
    } catch {
      setFeedback({
        success: false,
        message: 'Ocurrió un error al procesar el registro. Inténtalo de nuevo.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="mt-20 border-t border-stone-200 dark:border-stone-800 bg-[#F4F1EA] dark:bg-[#11100F] text-stone-600 dark:text-stone-400 pt-12 pb-10 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* WEEKLY TACTICAL DIGEST SUBSCRIPTION CARD */}
        <div className="mb-12 bg-white dark:bg-[#1A1816] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Heading and value propositions */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Resumen Semanal de Contenidos Tácticos</span>
              </div>
              
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-white leading-tight">
                Recibe cada lunes el análisis de pizarra y vivencias de banquillo
              </h3>
              
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl">
                Un boletín pensado para entrenadores, formadores y apasionados del baloncesto: desgloses de jugadas, táctica defensiva, ejercicios para entrenamientos y reflexiones de la <strong className="text-stone-800 dark:text-stone-100 font-semibold">{authorName}</strong>.
              </p>

              {/* Tactical Value Points */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-stone-600 dark:text-stone-300">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>1 resumen semanal sin rodeos</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Base de datos local segura (cero spam)</span>
                </span>
                {subscriberCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-mono text-stone-700 dark:text-stone-300">
                    {subscriberCount} {subscriberCount === 1 ? 'entrenador registrado' : 'entrenadores registrados'}
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Subscription Form */}
            <div className="lg:col-span-5 bg-stone-50 dark:bg-[#151413] p-5 rounded-xl border border-stone-200/80 dark:border-stone-800/80">
              {feedback ? (
                <div
                  className={`p-4 rounded-xl text-xs flex flex-col gap-2 ${
                    feedback.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-stone-800 dark:text-stone-100'
                      : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {feedback.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold text-xs leading-snug">{feedback.message}</p>
                      {feedback.success && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                          Tu email ha quedado almacenado en la base de datos local de suscriptores del blog.
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeedback(null)}
                    className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 hover:underline self-end mt-1 cursor-pointer"
                  >
                    {feedback.success ? 'Registrar otro correo' : 'Reintentar'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubscribeSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                      <span>Tu correo electrónico</span>
                      <span className="text-[10px] text-stone-400">Entrega cada lunes</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        disabled={isSubmitting}
                        placeholder="ejemplo@entrenador.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-600 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Frequency toggle */}
                  <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 px-1 pt-0.5">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="footerFreq"
                        value="semanal"
                        disabled={isSubmitting}
                        checked={frequency === 'semanal'}
                        onChange={() => setFrequency('semanal')}
                        className="text-amber-700 focus:ring-amber-700"
                      />
                      <span>Resumen semanal</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="footerFreq"
                        value="mensual"
                        disabled={isSubmitting}
                        checked={frequency === 'mensual'}
                        onChange={() => setFrequency('mensual')}
                        className="text-amber-700 focus:ring-amber-700"
                      />
                      <span>Resumen mensual</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-amber-800 hover:bg-amber-900 disabled:bg-amber-800/60 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando en base de datos...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Suscribirme al Resumen Táctico</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-stone-400 dark:text-stone-500">
                    Guardado en la base de datos local temporal. Baja voluntaria en cualquier momento.
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* Brand & Mission Statement Navigation Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-300/60 dark:border-stone-800/80">
          
          <div className="text-center sm:text-left">
            <span className="font-serif font-bold text-lg text-stone-900 dark:text-white">
              Pizarra & Criterio
            </span>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 max-w-md">
              Cuaderno de criterios y pizarra táctica de baloncesto. Análisis técnico para entrenadores, árbitros y formadores deportivos.
            </p>
          </div>

          {/* Quick links & Back to top */}
          <div className="flex items-center gap-6 text-xs font-medium">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer text-stone-700 dark:text-stone-200"
            >
              Artículos
            </button>
            <button
              onClick={() => onNavigate('categories')}
              className="hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer text-stone-700 dark:text-stone-200"
            >
              Categorías
            </button>
            <button
              onClick={() => onNavigate('tactics')}
              className="hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer text-stone-700 dark:text-stone-200"
            >
              Pizarra
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer text-stone-700 dark:text-stone-200"
            >
              La Autora
            </button>
            <button
              onClick={scrollToTop}
              title="Volver arriba"
              className="p-2 rounded-lg bg-stone-200/70 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom bar with discreet author access and social channels */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-600 dark:text-stone-300">
          <p>© {new Date().getFullYear()} Pizarra & Criterio — Dirigido por {authorName}. Todos los derechos reservados.</p>

          <div className="flex items-center gap-2">
            <SocialIconsRow size="sm" variant="subtle" />
          </div>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors py-1 px-2 rounded hover:bg-stone-200/50 dark:hover:bg-stone-800 cursor-pointer"
          >
            <Lock className="w-3 h-3 text-stone-400 dark:text-stone-400" />
            <span>Acceso al Escritorio Blogger</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

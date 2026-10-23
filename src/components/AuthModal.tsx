import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
  authorName: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
  authorName
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === correctPin.trim()) {
      setError('');
      if (rememberMe) {
        localStorage.setItem('basket_author_session_v2', 'authenticated');
      }
      onSuccess();
      onClose();
    } else {
      setError('Clave de acceso incorrecta. Solo la entrenadora titular tiene permisos de publicación.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-[#1C1A18] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-7 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-xl bg-amber-700 text-white flex items-center justify-center shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white leading-tight">
              Acceso al Panel Blogger
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Escritorio privado de {authorName}
            </p>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-serif mb-5 bg-stone-50 dark:bg-stone-900/60 p-3.5 rounded-lg border border-stone-200/60 dark:border-stone-800">
          Solo la autora puede entrar al panel de administración para redactar, publicar y gestionar entradas o comentarios. Si quieres tener una web así puedes ponerte en contacto con la autora.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                Clave de Seguridad / PIN de Acceso
              </label>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPin ? 'text' : 'password'}
                autoFocus
                required
                placeholder="Introduce tu clave o PIN..."
                value={pin}
                onChange={e => {
                  setPin(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-700 font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-stone-300 text-amber-700 focus:ring-amber-700"
              />
              <span>Mantener sesión iniciada en este equipo</span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Entrar al Escritorio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

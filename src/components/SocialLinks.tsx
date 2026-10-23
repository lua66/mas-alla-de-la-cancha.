import React, { useState } from 'react';
import { Mail, Check, Link as LinkIcon, Share2 } from 'lucide-react';

export const SOCIAL_URLS = {
  instagram: 'https://www.instagram.com/coachmindbasketball/',
  facebook: 'https://www.facebook.com/profile.php?id=61595672764092&locale=es_ES',
  linkedin: 'https://www.linkedin.com/in/coachmind-basketball-yanis/',
  email: 'coachmindbasketball@gmail.com',
};

// Reusable SVG for Facebook
export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// Reusable SVG for Instagram
export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

// Reusable SVG for LinkedIn
export const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

interface SocialIconsRowProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'subtle' | 'pill' | 'outline';
  showLabels?: boolean;
}

export const SocialIconsRow: React.FC<SocialIconsRowProps> = ({
  size = 'md',
  variant = 'outline',
  showLabels = false
}) => {
  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const baseButtonClasses =
    variant === 'subtle'
      ? 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition-colors'
      : 'rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 hover:border-amber-400 dark:hover:border-amber-600 hover:text-amber-800 dark:hover:text-amber-300 transition-all shadow-2xs';

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Redes sociales y contacto">
      {/* Instagram */}
      <a
        href={SOCIAL_URLS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        title="Instagram de CoachMind Basketball"
        aria-label="Instagram de CoachMind Basketball"
        className={`flex items-center gap-1.5 ${baseButtonClasses} ${buttonSizeClasses[size]} group cursor-pointer hover:text-pink-600 dark:hover:text-pink-400`}
      >
        <InstagramIcon className={`${iconSizeClasses[size]} transition-transform group-hover:scale-110`} />
        {showLabels && <span className="text-xs font-medium">Instagram</span>}
      </a>

      {/* Facebook */}
      <a
        href={SOCIAL_URLS.facebook}
        target="_blank"
        rel="noopener noreferrer"
        title="Facebook de CoachMind Basketball"
        aria-label="Facebook de CoachMind Basketball"
        className={`flex items-center gap-1.5 ${baseButtonClasses} ${buttonSizeClasses[size]} group cursor-pointer hover:text-blue-600 dark:hover:text-blue-400`}
      >
        <FacebookIcon className={`${iconSizeClasses[size]} transition-transform group-hover:scale-110`} />
        {showLabels && <span className="text-xs font-medium">Facebook</span>}
      </a>

      {/* LinkedIn */}
      <a
        href={SOCIAL_URLS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        title="LinkedIn de CoachMind Basketball - Yanis"
        aria-label="LinkedIn de CoachMind Basketball - Yanis"
        className={`flex items-center gap-1.5 ${baseButtonClasses} ${buttonSizeClasses[size]} group cursor-pointer hover:text-sky-700 dark:hover:text-sky-400`}
      >
        <LinkedinIcon className={`${iconSizeClasses[size]} transition-transform group-hover:scale-110`} />
        {showLabels && <span className="text-xs font-medium">LinkedIn</span>}
      </a>

      {/* Email Contact */}
      <a
        href={`mailto:${SOCIAL_URLS.email}?subject=Contacto%20desde%20Pizarra%20y%20Criterio`}
        title="Escribir al correo de CoachMind Basketball"
        aria-label="Escribir correo a CoachMind Basketball"
        className={`flex items-center gap-1.5 ${baseButtonClasses} ${buttonSizeClasses[size]} group cursor-pointer hover:text-amber-700 dark:hover:text-amber-400`}
      >
        <Mail className={`${iconSizeClasses[size]} transition-transform group-hover:scale-110`} />
        {showLabels && <span className="text-xs font-medium">Correo</span>}
      </a>
    </div>
  );
};

interface ArticleShareBarProps {
  articleTitle: string;
  articleUrl?: string;
}

export const ArticleShareBar: React.FC<ArticleShareBarProps> = ({
  articleTitle,
  articleUrl = typeof window !== 'undefined' ? window.location.href : ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const mailtoUrl = `mailto:${SOCIAL_URLS.email}?subject=${encodeURIComponent(
    `Comentario sobre: ${articleTitle}`
  )}&body=${encodeURIComponent(
    `Hola Leyanis,\n\nTe escribo tras leer tu artículo "${articleTitle}" en Pizarra y Criterio:\n\n${articleUrl}`
  )}`;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-stone-900/70 border border-amber-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 text-center sm:text-left">
        <div className="w-8 h-8 rounded-lg bg-amber-800 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Share2 className="w-4 h-4" />
        </div>
        <div>
          <span className="font-serif font-bold text-sm text-stone-900 dark:text-white block">
            Comparte este artículo y conecta con la entrenadora
          </span>
          <span className="text-xs text-stone-600 dark:text-stone-300">
            Sigue los análisis y reflexiones de CoachMind en nuestras redes
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Instagram */}
        <a
          href={SOCIAL_URLS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram de CoachMind Basketball"
          aria-label="Instagram de CoachMind Basketball"
          className="p-2.5 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-300 transition-colors shadow-2xs group cursor-pointer"
        >
          <InstagramIcon className="w-4 h-4 transition-transform group-hover:scale-115" />
        </a>

        {/* Facebook */}
        <a
          href={SOCIAL_URLS.facebook}
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook de CoachMind Basketball"
          aria-label="Facebook de CoachMind Basketball"
          className="p-2.5 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors shadow-2xs group cursor-pointer"
        >
          <FacebookIcon className="w-4 h-4 transition-transform group-hover:scale-115" />
        </a>

        {/* LinkedIn */}
        <a
          href={SOCIAL_URLS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn de CoachMind Basketball - Yanis"
          aria-label="LinkedIn de CoachMind Basketball - Yanis"
          className="p-2.5 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:text-sky-700 dark:hover:text-sky-400 hover:border-sky-300 transition-colors shadow-2xs group cursor-pointer"
        >
          <LinkedinIcon className="w-4 h-4 transition-transform group-hover:scale-115" />
        </a>

        {/* Email */}
        <a
          href={mailtoUrl}
          title="Enviar correo a CoachMind Basketball"
          aria-label="Enviar correo a CoachMind Basketball"
          className="p-2.5 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:text-amber-800 dark:hover:text-amber-400 hover:border-amber-300 transition-colors shadow-2xs group cursor-pointer"
        >
          <Mail className="w-4 h-4 transition-transform group-hover:scale-115" />
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          title="Copiar enlace del artículo"
          aria-label="Copiar enlace del artículo"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">¡Copiado!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5 text-stone-500" />
              <span>Copiar enlace</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

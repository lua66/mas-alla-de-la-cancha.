import React from 'react';
import { BlogSettings } from '../types/blog';
import { Award, BookOpen, Globe, Sparkles } from 'lucide-react';
import { SocialIconsRow } from './SocialLinks';

interface AboutViewProps {
  settings: BlogSettings;
  onNavigateHome: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ settings, onNavigateHome }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Bio Presentation */}
      <div className="bg-white dark:bg-[#1C1A18] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-10 shadow-xs mb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 pb-8 border-b border-stone-200 dark:border-stone-800">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-amber-700/40 shrink-0 shadow-sm">
            <picture>
              <source srcSet={settings.authorAvatar.replace(/\.jpg$/, '.webp')} type="image/webp" />
              <img
                src={settings.authorAvatar}
                alt={settings.authorName}
                width="144"
                height="144"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </picture>
          </div>

          <div className="text-center sm:text-left">
            <span className="text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400 font-semibold">
              La Autora del Cuaderno
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white mt-1">
              {settings.authorName}
            </h1>
            <p className="text-sm text-stone-700 dark:text-stone-200 font-medium mt-1">
              {settings.authorRole}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5">
              {settings.yearsOfExperience} temporadas en los banquillos · De Cuba a Barcelona
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                Licenciada en Cultura Física y Deporte
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                Cuba & Barcelona, España
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                Dirección Técnica & Formación
              </span>
            </div>

            {/* CoachMind Basketball Social Channels */}
            <div className="mt-4 flex items-center justify-center sm:justify-start gap-3">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Canales CoachMind:</span>
              <SocialIconsRow size="sm" variant="outline" />
            </div>
          </div>
        </div>

        {/* Philosophy Essay */}
        <div className="mt-8 space-y-5 text-stone-800 dark:text-stone-100 font-serif leading-relaxed text-base sm:text-lg">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white not-italic">
            Una trayectoria forjada entre dos orillas del baloncesto
          </h2>
          
          <p>
            Son ya <strong>20 temporadas sentada en los banquillos</strong>. Dos décadas de silbato al cuello, pizarras gastadas y cientos de partidos dirigidos desde mis primeros pasos formativos y competitivos en Cuba hasta consolidar mi labor técnica en el exigente baloncesto de Barcelona y Cataluña.
          </p>

          <p>
            Esa doble vivencia me ha dado una perspectiva muy singular: en Cuba aprendí el valor de la <em>intensidad física pura</em>, el hambre competitiva, el compromiso defensivo de no dar un solo balón por perdido y la pasión visceral por el juego; en Barcelona y el baloncesto europeo he profundizado en la <em>riqueza táctica del espaciamiento</em>, la lectura de juego por conceptos y la precisión quirúrgica del pase extra.
          </p>

          <div className="p-5 bg-amber-50/70 dark:bg-stone-900/90 rounded-xl border border-amber-300 dark:border-amber-700/60 not-italic">
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white mb-2">
              Los Tres Pilares Innegociables en mi Pizarra:
            </h3>
            <ul className="space-y-2 text-sm text-stone-800 dark:text-stone-100">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-800 dark:text-amber-400">1.</span>
                <span><strong>La intensidad defensiva no se negocia:</strong> El balance defensivo, la presión sobre el balón y el esfuerzo en el lado débil son el pulso y la identidad de cualquier equipo con aspiraciones.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-800 dark:text-amber-400">2.</span>
                <span><strong>El pase extra genera ventajas reales:</strong> Jugar por conceptos sin balón supera a cualquier sistema rígido dibujado en la pizarra si los jugadores leen los espacios y respetan la geometría.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-800 dark:text-amber-400">3.</span>
                <span><strong>Pedagogía deportiva y honestidad en el vestuario:</strong> Como licenciada en deporte, entiendo que entrenar es educar. La exigencia deportiva jamás está reñida con el respeto humano hacia cada jugador.</span>
              </li>
            </ul>
          </div>

          <p>
            Este cuaderno digital nace como un punto de encuentro limpio, sin artificios comerciales, para compartir reflexiones tácticas sinceras entre entrenadores y amantes del buen baloncesto.
          </p>
        </div>
      </div>
    </div>
  );
};

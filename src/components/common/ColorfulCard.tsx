import React from 'react';
import { LucideIcon } from 'lucide-react';

export type CardColor = 'red' | 'teal' | 'purple' | 'blue' | 'orange' | 'pink' | 'green' | 'yellow';

interface ColorfulCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  color?: CardColor;
  icon: LucideIcon;
  onClick?: () => void;
  count?: number | string;
  countLabel?: string;
  actionText?: string;
}

const colorStyles: Record<CardColor, { bg: string; text: string; subText: string; watermark: string; badgeBg: string; badgeText: string; btnBg: string }> = {
  red: {
    bg: 'bg-red-800 dark:bg-red-900 border-red-700',
    text: 'text-white',
    subText: 'text-red-100',
    watermark: 'text-red-600/30 dark:text-red-950/50',
    badgeBg: 'bg-red-950/40',
    badgeText: 'text-amber-200',
    btnBg: 'bg-amber-400 hover:bg-amber-300 text-red-950',
  },
  teal: {
    bg: 'bg-teal-800 dark:bg-teal-900 border-teal-700',
    text: 'text-white',
    subText: 'text-teal-100',
    watermark: 'text-teal-600/30 dark:text-teal-950/50',
    badgeBg: 'bg-teal-950/40',
    badgeText: 'text-teal-200',
    btnBg: 'bg-teal-100 hover:bg-white text-teal-950',
  },
  purple: {
    bg: 'bg-purple-800 dark:bg-purple-900 border-purple-700',
    text: 'text-white',
    subText: 'text-purple-100',
    watermark: 'text-purple-600/30 dark:text-purple-950/50',
    badgeBg: 'bg-purple-950/40',
    badgeText: 'text-purple-200',
    btnBg: 'bg-amber-300 hover:bg-amber-200 text-purple-950',
  },
  blue: {
    bg: 'bg-blue-800 dark:bg-blue-900 border-blue-700',
    text: 'text-white',
    subText: 'text-blue-100',
    watermark: 'text-blue-600/30 dark:text-blue-950/50',
    badgeBg: 'bg-blue-950/40',
    badgeText: 'text-blue-200',
    btnBg: 'bg-blue-100 hover:bg-white text-blue-950',
  },
  orange: {
    bg: 'bg-amber-700 dark:bg-amber-800 border-amber-600',
    text: 'text-white',
    subText: 'text-amber-100',
    watermark: 'text-amber-500/30 dark:text-amber-950/50',
    badgeBg: 'bg-amber-950/40',
    badgeText: 'text-amber-200',
    btnBg: 'bg-white hover:bg-amber-50 text-amber-950',
  },
  pink: {
    bg: 'bg-pink-800 dark:bg-pink-900 border-pink-700',
    text: 'text-white',
    subText: 'text-pink-100',
    watermark: 'text-pink-600/30 dark:text-pink-950/50',
    badgeBg: 'bg-pink-950/40',
    badgeText: 'text-pink-200',
    btnBg: 'bg-pink-100 hover:bg-white text-pink-950',
  },
  green: {
    bg: 'bg-emerald-800 dark:bg-emerald-900 border-emerald-700',
    text: 'text-white',
    subText: 'text-emerald-100',
    watermark: 'text-emerald-600/30 dark:text-emerald-950/50',
    badgeBg: 'bg-emerald-950/40',
    badgeText: 'text-emerald-200',
    btnBg: 'bg-amber-300 hover:bg-amber-200 text-emerald-950',
  },
  yellow: {
    bg: 'bg-amber-500 dark:bg-amber-600 border-amber-400',
    text: 'text-slate-950',
    subText: 'text-slate-900',
    watermark: 'text-amber-600/30 dark:text-amber-800/40',
    badgeBg: 'bg-amber-700/30',
    badgeText: 'text-slate-950 font-bold',
    btnBg: 'bg-red-900 hover:bg-red-800 text-amber-300',
  }
};

export const COLOR_PALETTE: CardColor[] = ['red', 'teal', 'purple', 'blue', 'orange', 'pink', 'green', 'yellow'];

export const ColorfulCard: React.FC<ColorfulCardProps> = ({
  title,
  subtitle,
  badge,
  color = 'red',
  icon: Icon,
  onClick,
  count,
  countLabel = 'materials',
  actionText = 'Explore'
}) => {
  const styles = colorStyles[color] || colorStyles.red;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col justify-between min-h-[170px] ${styles.bg}`}
    >
      {/* Educational Icon Watermark in Background */}
      <Icon className={`absolute -right-4 -bottom-4 w-28 h-28 pointer-events-none transform -rotate-12 transition-transform duration-300 group-hover:scale-110 ${styles.watermark}`} />

      {/* Card Content Top */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-xs">
            <Icon className={`w-5 h-5 ${styles.text}`} />
          </div>
          {badge && (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs ${styles.badgeBg} ${styles.badgeText}`}>
              {badge}
            </span>
          )}
        </div>

        <h3 className={`text-lg sm:text-xl font-black tracking-tight line-clamp-1 ${styles.text}`}>
          {title}
        </h3>
        {subtitle && (
          <p className={`text-xs mt-1 line-clamp-2 ${styles.subText}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Card Content Bottom */}
      <div className="relative z-10 mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
        <div>
          {count !== undefined ? (
            <span className={`text-xs font-semibold ${styles.subText}`}>
              <strong className={styles.text}>{count}</strong> {countLabel}
            </span>
          ) : (
            <span className={`text-xs ${styles.subText}`}>Curriculum Aligned</span>
          )}
        </div>

        <button 
          type="button"
          className={`text-xs font-bold px-3 py-1.5 rounded-md shadow-xs transition-colors flex items-center space-x-1 cursor-pointer ${styles.btnBg}`}
        >
          <span>{actionText}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

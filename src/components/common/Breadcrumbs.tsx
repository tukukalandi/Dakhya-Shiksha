import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, showBackButton = true }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 sm:px-6 bg-amber-50/70 dark:bg-slate-900/60 border-b border-amber-200/60 dark:border-slate-800 text-xs sm:text-sm">
      <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none">
        <Link 
          to="/" 
          className="text-red-800 dark:text-amber-400 hover:text-red-950 dark:hover:text-amber-300 font-medium flex items-center space-x-1"
          title="Go to Home"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="sr-only">Home</span>
        </Link>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {isLast || !item.to ? (
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="text-red-800 dark:text-amber-400 hover:text-red-950 dark:hover:text-amber-300 font-medium truncate max-w-[150px] sm:max-w-xs hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {showBackButton && (
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1 px-3 py-1 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-slate-700 text-red-800 dark:text-amber-300 text-xs font-semibold rounded border border-amber-300/70 dark:border-slate-700 shadow-2xs transition cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('back')}</span>
        </button>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Sparkles, ChevronLeft, ChevronRight, GraduationCap, Award, FolderCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const HeroSlider: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const slides = [
    {
      title: t('heroTitle1'),
      subtitle: t('heroSubtitle1'),
      bgGradient: 'from-red-900 via-red-950 to-slate-950',
      badge: 'NCERT & State Syllabus',
      icon: BookOpen,
      btnLabel: t('browseMaterials'),
      btnTarget: '/study-materials'
    },
    {
      title: t('heroTitle2'),
      subtitle: t('heroSubtitle2'),
      bgGradient: 'from-amber-900 via-red-950 to-slate-950',
      badge: 'Classes 1 to 10 Complete',
      icon: GraduationCap,
      btnLabel: t('exploreClasses'),
      btnTarget: '/classes'
    },
    {
      title: t('heroTitle3'),
      subtitle: t('heroSubtitle3'),
      bgGradient: 'from-red-950 via-amber-950 to-slate-950',
      badge: 'Olympiad & Competitive Prep',
      icon: Award,
      btnLabel: t('olympiad'),
      btnTarget: '/olympiad'
    }
  ];

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/study-materials?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/study-materials');
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${slide.bgGradient} text-white py-14 sm:py-20 px-4 sm:px-6 transition-all duration-700 border-b-4 border-amber-400`}>
      {/* Decorative Stamp Texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{slide.badge}</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white max-w-4xl mx-auto drop-shadow-sm min-h-[72px] sm:min-h-[84px] flex items-center justify-center">
          {slide.title}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl mx-auto mt-3 mb-8 leading-relaxed">
          {slide.subtitle}
        </p>

        {/* Search Box */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8">
          <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-1.5 border-2 border-amber-400">
            <Search className="w-5 h-5 text-red-900 dark:text-amber-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full px-3 py-2.5 text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs sm:text-sm rounded-lg shadow-md transition-colors shrink-0 cursor-pointer"
            >
              {t('search')}
            </button>
          </div>
        </form>

        {/* Action Buttons & Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#all-files-repository"
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-sm rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center space-x-2 cursor-pointer"
          >
            <FolderCheck className="w-4 h-4 text-red-900" />
            <span>Browse All Available Files</span>
          </a>

          <button
            onClick={() => navigate(slide.btnTarget)}
            className="px-5 py-2.5 bg-red-950/90 hover:bg-red-900 border border-amber-400/50 text-amber-300 font-bold text-sm rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Icon className="w-4 h-4 text-amber-400" />
            <span>{slide.btnLabel}</span>
          </button>

          <button
            onClick={() => navigate('/video-corner')}
            className="px-5 py-2.5 bg-red-950/70 hover:bg-red-900/90 border border-amber-400/30 text-amber-200 font-medium text-sm rounded-lg transition-colors cursor-pointer"
          >
            {t('videoCorner')}
          </button>
        </div>

        {/* Slider Indicator Dots & Controls */}
        <div className="flex items-center justify-center space-x-3 mt-8">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="p-1.5 rounded-full bg-red-950/70 hover:bg-red-900 text-amber-300 transition cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-amber-400/40'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="p-1.5 rounded-full bg-red-950/70 hover:bg-red-900 text-amber-300 transition cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

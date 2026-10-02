import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  Filter, 
  Play, 
  Layers, 
  CheckCircle2, 
  BookOpen, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Quiz } from '../../types';
import { fetchQuizzes } from '../../lib/firebase';
import { normalizeClass, normalizeSubject, normalizeText } from '../../lib/utils';

export const QuizzesPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const classFilter = searchParams.get('class') || '';
  const subjectFilter = searchParams.get('subject') || '';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    fetchQuizzes()
      .then(data => setQuizzes(data))
      .finally(() => setLoading(false));
  }, []);

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val);
    else next.delete(key);
    setSearchParams(next);
  };

  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach(q => {
      if (q.classLevel) set.add(normalizeClass(q.classLevel));
    });
    const standard = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => `Class ${c}`);
    return Array.from(new Set([...standard, ...Array.from(set)]));
  }, [quizzes]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach(q => {
      if (q.subject) set.add(normalizeSubject(q.subject));
    });
    return Array.from(set).sort();
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      if (!q.isPublished) return false;

      if (classFilter && normalizeClass(q.classLevel) !== normalizeClass(classFilter)) {
        return false;
      }
      if (subjectFilter && normalizeSubject(q.subject) !== normalizeSubject(subjectFilter)) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = normalizeText(searchQuery);
        const inTitle = normalizeText(q.title).includes(query);
        const inChap = normalizeText(q.chapter).includes(query);
        const inTopic = normalizeText(q.topic).includes(query);
        if (!inTitle && !inChap && !inTopic) return false;
      }

      return true;
    });
  }, [quizzes, classFilter, subjectFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs items={[{ label: t('quiz') }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-red-900 via-red-950 to-slate-900 text-white rounded-2xl p-6 sm:p-10 mb-8 shadow-lg border-b-4 border-amber-400">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive Self-Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t('interactiveQuizzes')}
            </h1>
            <p className="text-sm text-amber-100/90 mt-2 leading-relaxed">
              {t('quizzesSubtitle')}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs mb-8 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search quizzes by title, chapter or topic..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-red-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={classFilter}
              onChange={(e) => updateParam('class', e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden"
            >
              <option value="">All Classes</option>
              {availableClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={subjectFilter}
              onChange={(e) => updateParam('subject', e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden"
            >
              <option value="">All Subjects</option>
              {availableSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {(classFilter || subjectFilter || searchQuery) && (
              <button
                onClick={() => setSearchParams(new URLSearchParams())}
                className="text-xs text-red-700 dark:text-amber-400 font-bold hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quizzes List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
            <span>{t('loading')}</span>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t('noQuizzesFound')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No published interactive quizzes match your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map(quiz => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between border-t-4 border-t-amber-500"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-400">
                      {quiz.classLevel}
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                      {quiz.subject}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {quiz.title}
                  </h3>

                  {quiz.chapter && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span className="font-semibold text-slate-500">Chapter:</span> {quiz.chapter}
                    </div>
                  )}

                  {quiz.topic && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                      <span className="font-semibold text-slate-500">{t('topic')}:</span> {quiz.topic}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Self-Graded Quiz
                  </span>
                  <button
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-red-950" />
                    <span>{t('startQuiz')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

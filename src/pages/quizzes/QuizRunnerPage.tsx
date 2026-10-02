import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize2, Minimize2, RotateCcw, AlertCircle, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Quiz } from '../../types';
import { fetchQuizzes } from '../../lib/firebase';

export const QuizRunnerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);

  useEffect(() => {
    fetchQuizzes().then(list => {
      const found = list.find(q => q.id === id);
      setQuiz(found || null);
      setLoading(false);
    });
  }, [id]);

  const handleResetQuiz = () => {
    setIframeKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
        <span className="text-slate-500">{t('loading')}</span>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Quiz Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">This interactive quiz may have been removed or unpublished.</p>
          <button
            onClick={() => navigate('/quizzes')}
            className="px-4 py-2 bg-red-900 text-amber-300 font-bold text-xs rounded-lg hover:bg-red-800 transition"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Quiz Top Action Bar */}
      <div className="bg-red-950 text-white px-4 py-3 border-b-2 border-amber-400 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => navigate('/quizzes')}
            className="p-1.5 rounded-lg bg-red-900/80 hover:bg-red-800 text-amber-300 transition cursor-pointer"
            title="Back to Quizzes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold truncate text-white">
              {quiz.title}
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-300/90 truncate">
              {quiz.classLevel} • {quiz.subject} {quiz.chapter ? `• ${quiz.chapter}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleResetQuiz}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-red-900/80 hover:bg-red-800 text-amber-200 text-xs font-semibold border border-red-800 transition cursor-pointer"
            title="Restart Quiz"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-red-950 text-xs font-bold transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Isolated Sandboxed Iframe Container */}
      <div className="flex-1 p-2 sm:p-4 bg-slate-200 dark:bg-slate-900 flex justify-center items-center">
        <div className="w-full h-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden border border-slate-300 dark:border-slate-800 flex flex-col">
          <iframe
            key={iframeKey}
            srcDoc={quiz.htmlContent}
            title={quiz.title}
            sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
            className="w-full h-full border-0 min-h-[600px] flex-1 bg-white"
          />
        </div>
      </div>
    </div>
  );
};

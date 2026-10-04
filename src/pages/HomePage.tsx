import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Play, 
  HelpCircle, 
  Award, 
  BookOpen, 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  FileCheck2, 
  HardDrive
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { HeroSlider } from '../components/home/HeroSlider';
import { BrowseByClassSection } from '../components/home/BrowseByClassSection';
import { RecentMaterialsSection } from '../components/home/RecentMaterialsSection';
import { StudyMaterial, Video, Quiz } from '../types';
import { fetchStudyMaterials, fetchVideos, fetchQuizzes, subscribeMaterialsUpdate } from '../lib/firebase';
import { createSlug } from '../lib/utils';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([fetchStudyMaterials(), fetchVideos(), fetchQuizzes()]).then(([mats, vids, qzs]) => {
      setMaterials(mats);
      setVideos(vids);
      setQuizzes(qzs);
      setLoading(false);
    });

    const unsubscribe = subscribeMaterialsUpdate((updated) => {
      setMaterials(updated);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* 1. Hero Section Slider */}
      <HeroSlider />

      {/* 2. Browse by Class 1-10 (Strict Flow: Class -> Subject -> Material Type -> Files) */}
      <BrowseByClassSection materials={materials} />

      {/* 3. India Post Shiksha Trust & Open Learning Banner */}
      <section className="bg-red-900 text-white py-12 px-4 sm:px-6 border-y-4 border-amber-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-red-950 flex items-center justify-center shrink-0 font-bold shadow-md">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Verified NCERT Syllabi</h3>
              <p className="text-xs text-amber-100/80 mt-1 leading-relaxed">
                Standard curriculum aligned with CBSE, CISCE, and state education boards for Classes 1 to 10.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-red-950 flex items-center justify-center shrink-0 font-bold shadow-md">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Secure Google Drive Sync</h3>
              <p className="text-xs text-amber-100/80 mt-1 leading-relaxed">
                High-speed cloud file repositories for instant viewing and offline PDF document downloading.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-red-950 flex items-center justify-center shrink-0 font-bold shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Interactive Assessment</h3>
              <p className="text-xs text-amber-100/80 mt-1 leading-relaxed">
                Sandboxed HTML self-graded quizzes and chapter mastery tests for self-directed progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Latest Uploaded Study Materials Cards */}
      <RecentMaterialsSection materials={materials} />

      {/* 5. Video Corner Highlight */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Play className="w-3.5 h-3.5 fill-red-800 dark:fill-amber-400" />
              <span>Video Academy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Video Lessons
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Concept explanations, laboratory demonstrations, and Olympiad problem walkthroughs.
            </p>
          </div>

          <Link
            to="/video-corner"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-900 hover:bg-red-800 text-amber-300 text-xs font-bold transition shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <span>Browse All Videos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.slice(0, 3).map((video) => (
            <div
              key={video.id}
              onClick={() => navigate(`/video-corner/${createSlug(video.classOrExam)}/${createSlug(video.subject)}/${createSlug(video.chapter)}/${video.id}`)}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img
                  src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-900/90 text-amber-300 flex items-center justify-center group-hover:scale-110 shadow-lg border border-amber-400">
                    <Play className="w-5 h-5 ml-0.5 fill-amber-300" />
                  </div>
                </div>
                {video.duration && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-amber-200 text-[10px] font-mono">
                    {video.duration}
                  </span>
                )}
              </div>
              <div className="p-4">
                <span className="text-[10px] font-bold text-red-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                  {video.classOrExam} • {video.subject}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-800 dark:group-hover:text-amber-400 transition-colors">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Interactive Quizzes Highlight */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 bg-amber-50/60 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-200/60 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Self-Assessment</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('interactiveQuizzes')}
              </h2>
            </div>
            <Link
              to="/quizzes"
              className="inline-flex items-center space-x-1 text-xs font-bold text-red-800 dark:text-amber-400 hover:underline"
            >
              <span>View All Quizzes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.slice(0, 3).map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-300">
                    {quiz.classLevel} • {quiz.subject}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 mb-1 line-clamp-2">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-4">
                    {quiz.chapter ? `Chapter: ${quiz.chapter}` : 'General practice questions'}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-red-950 text-xs font-bold rounded-lg transition text-center cursor-pointer"
                >
                  {t('startQuiz')} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

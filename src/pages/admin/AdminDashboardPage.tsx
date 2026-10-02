import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Video, 
  HelpCircle, 
  Eye, 
  Download, 
  Layers, 
  Award, 
  PlusCircle, 
  Sparkles, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { StudyMaterial, Video as VideoType, Quiz } from '../../types';
import { 
  fetchStudyMaterials, 
  fetchVideos, 
  fetchQuizzes, 
  seedDemoData, 
  removeDemoData 
} from '../../lib/firebase';
import { normalizeClass, normalizeSubject, formatDate } from '../../lib/utils';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string>('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [m, v, q] = await Promise.all([
        fetchStudyMaterials(),
        fetchVideos(),
        fetchQuizzes()
      ]);
      setMaterials(m);
      setVideos(v);
      setQuizzes(q);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSeedDemo = async () => {
    setActionMessage('Seeding curriculum demo materials, videos and quizzes...');
    await seedDemoData();
    await loadAllData();
    setActionMessage('Demo datasets successfully seeded!');
    setTimeout(() => setActionMessage(''), 3500);
  };

  const handleClearDemo = async () => {
    if (window.confirm('Are you sure you want to remove all demo records? Custom records will be kept.')) {
      setActionMessage('Removing demo records...');
      await removeDemoData();
      await loadAllData();
      setActionMessage('Demo records removed successfully!');
      setTimeout(() => setActionMessage(''), 3500);
    }
  };

  // Metrics computation per Section 31
  const totalMaterials = materials.length;
  const publishedMaterials = materials.filter(m => m.isPublished).length;
  const draftMaterials = totalMaterials - publishedMaterials;
  
  const classesCovered = new Set(materials.map(m => normalizeClass(m.classLevel))).size;
  const subjectsCovered = new Set(materials.map(m => normalizeSubject(m.subject))).size;
  
  const olympiadMaterials = materials.filter(
    m => (m.examType || '').toLowerCase().includes('olympiad') || (m.title || '').toLowerCase().includes('olympiad')
  ).length;

  const totalViews = materials.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
  const totalDownloads = materials.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);
  const totalVideos = videos.length;
  const totalQuizzes = quizzes.length;

  const stats = [
    { title: 'Total Materials', value: totalMaterials, icon: FileText, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900' },
    { title: 'Published Materials', value: publishedMaterials, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900' },
    { title: 'Draft Materials', value: draftMaterials, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900' },
    { title: 'Classes Covered', value: `${classesCovered} / 10`, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900' },
    { title: 'Subjects', value: subjectsCovered, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900' },
    { title: 'Olympiad Materials', value: olympiadMaterials, icon: Award, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900' },
    { title: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900' },
    { title: 'Total Downloads', value: totalDownloads.toLocaleString(), icon: Download, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900' },
    { title: 'Total Videos', value: totalVideos, icon: Video, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900' },
    { title: 'Total Quizzes', value: totalQuizzes, icon: HelpCircle, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Portal Control Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time curriculum statistics, content repository sync, and quick publishing actions.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/study-materials/add"
            className="px-4 py-2 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Study Material</span>
          </Link>

          <button
            onClick={handleSeedDemo}
            className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-300 dark:border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
            title="Seed NCERT & Olympiad Demo Data"
          >
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Seed Demo Data</span>
          </button>

          <button
            onClick={handleClearDemo}
            className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-red-700 dark:bg-slate-800 dark:text-red-400 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
            title="Remove Demo Data Records"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Demo Data</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* 10 Dashboard Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between shadow-2xs ${s.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider line-clamp-1">
                  {s.title}
                </span>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {s.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Materials & Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Study Materials */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-red-800 dark:text-amber-400" />
              <span>Recent Study Materials</span>
            </h3>
            <Link to="/admin/study-materials" className="text-xs font-bold text-red-800 dark:text-amber-400 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {materials.slice(0, 5).map(m => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="min-w-0 pr-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {m.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {m.classLevel} • {m.subject} • {m.materialType}
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                    m.isPublished ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {m.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <Link
                    to={`/admin/study-materials/edit/${m.id}`}
                    className="text-xs font-bold text-red-800 dark:text-amber-400 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Videos & Quizzes */}
        <div className="space-y-6">
          {/* Recent Videos */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Video className="w-4 h-4 text-red-800 dark:text-amber-400" />
                <span>Recent Video Lessons</span>
              </h3>
              <Link to="/admin/videos" className="text-xs font-bold text-red-800 dark:text-amber-400 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-2.5">
              {videos.slice(0, 3).map(v => (
                <div
                  key={v.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {v.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {v.classOrExam} • {v.subject} • {v.chapter}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 shrink-0">
                    {v.duration || 'Video'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Quizzes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-red-800 dark:text-amber-400" />
                <span>Recent Quizzes</span>
              </h3>
              <Link to="/admin/quizzes" className="text-xs font-bold text-red-800 dark:text-amber-400 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-2.5">
              {quizzes.slice(0, 3).map(q => (
                <div
                  key={q.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {q.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {q.classLevel} • {q.subject}
                    </p>
                  </div>
                  <Link
                    to={`/quiz/${q.id}`}
                    target="_blank"
                    className="text-[10px] font-bold text-red-800 dark:text-amber-400 hover:underline shrink-0"
                  >
                    Test Run →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

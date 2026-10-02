import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Video as VideoIcon, 
  Play, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { ColorfulCard, CardColor, COLOR_PALETTE } from '../../components/common/ColorfulCard';
import { Video } from '../../types';
import { fetchVideos } from '../../lib/firebase';
import { createSlug } from '../../lib/utils';

export const VideoCornerPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchVideos()
      .then(data => setVideos(data))
      .finally(() => setLoading(false));
  }, []);

  // Filter only published/active videos
  const activeVideos = useMemo(() => {
    return videos.filter(v => v.status === 'published' || v.status === 'active');
  }, [videos]);

  // Section 25: Show only categories/classes that actually contain videos!
  const categoryGroups = useMemo(() => {
    const classSet = new Map<string, number>();
    const compSet = new Map<string, number>();
    const olySet = new Map<string, number>();

    activeVideos.forEach(v => {
      const cat = (v.categoryType || '').toLowerCase();
      const entity = v.classOrExam || 'General';

      if (cat.includes('olympiad')) {
        olySet.set(entity, (olySet.get(entity) || 0) + 1);
      } else if (cat.includes('competitive')) {
        compSet.set(entity, (compSet.get(entity) || 0) + 1);
      } else {
        // Standard School Class
        classSet.set(entity, (classSet.get(entity) || 0) + 1);
      }
    });

    return {
      classes: Array.from(classSet.entries()).map(([name, count]) => ({ name, count })),
      competitive: Array.from(compSet.entries()).map(([name, count]) => ({ name, count })),
      olympiad: Array.from(olySet.entries()).map(([name, count]) => ({ name, count }))
    };
  }, [activeVideos]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs items={[{ label: t('videoCorner') }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-red-900 via-red-950 to-slate-900 text-white rounded-2xl p-6 sm:p-10 mb-10 shadow-lg border-b-4 border-amber-400">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-400/30">
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Dakshya Video Academy</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t('videoCornerTitle')}
            </h1>
            <p className="text-sm text-amber-100/90 mt-2 leading-relaxed">
              {t('videoCornerSubtitle')}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
            <span>{t('loading')}</span>
          </div>
        ) : activeVideos.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <VideoIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t('noVideosFound')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New video lessons and masterclasses will be uploaded shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* School Classes with Videos */}
            {categoryGroups.classes.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <GraduationCap className="w-5 h-5 text-red-800 dark:text-amber-400" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    School Class Lessons
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {categoryGroups.classes.map((group, idx) => {
                    const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
                    const slug = createSlug(group.name);
                    return (
                      <ColorfulCard
                        key={group.name}
                        title={group.name}
                        subtitle="Chapter video explanations and exercises"
                        badge="School Course"
                        color={color}
                        icon={GraduationCap}
                        count={group.count}
                        countLabel={t('videos')}
                        actionText="View Subjects"
                        onClick={() => navigate(`/video-corner/${slug}`)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Olympiad Section with Videos */}
            {categoryGroups.olympiad.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Award className="w-5 h-5 text-red-800 dark:text-amber-400" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('olympiadExams')}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {categoryGroups.olympiad.map((group, idx) => {
                    const color = COLOR_PALETTE[(idx + 2) % COLOR_PALETTE.length];
                    const slug = createSlug(group.name);
                    return (
                      <ColorfulCard
                        key={group.name}
                        title={group.name}
                        subtitle="IMO, NSO, IEO speed techniques & tips"
                        badge="Olympiad"
                        color={color}
                        icon={Award}
                        count={group.count}
                        countLabel={t('videos')}
                        actionText="View Subjects"
                        onClick={() => navigate(`/video-corner/${slug}`)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Competitive Exams with Videos */}
            {categoryGroups.competitive.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <BookOpen className="w-5 h-5 text-red-800 dark:text-amber-400" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('competitiveExams')}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {categoryGroups.competitive.map((group, idx) => {
                    const color = COLOR_PALETTE[(idx + 4) % COLOR_PALETTE.length];
                    const slug = createSlug(group.name);
                    return (
                      <ColorfulCard
                        key={group.name}
                        title={group.name}
                        subtitle="TET, SSC, Railway & State assessments"
                        badge="Competitive"
                        color={color}
                        icon={Sparkles}
                        count={group.count}
                        countLabel={t('videos')}
                        actionText="View Subjects"
                        onClick={() => navigate(`/video-corner/${slug}`)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

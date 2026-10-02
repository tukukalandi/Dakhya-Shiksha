import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Video as VideoIcon, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { ColorfulCard, CardColor, COLOR_PALETTE } from '../../components/common/ColorfulCard';
import { Video } from '../../types';
import { fetchVideos } from '../../lib/firebase';
import { createSlug, normalizeSubject } from '../../lib/utils';

export const VideoCategorySubjectsPage: React.FC = () => {
  const { catSlug } = useParams<{ catSlug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchVideos()
      .then(data => setVideos(data))
      .finally(() => setLoading(false));
  }, []);

  // Match videos belonging to this category/class
  const categoryVideos = useMemo(() => {
    return videos.filter(v => {
      if (v.status !== 'published' && v.status !== 'active') return false;
      const slugMatch = createSlug(v.classOrExam) === catSlug;
      return slugMatch;
    });
  }, [videos, catSlug]);

  const categoryName = categoryVideos[0]?.classOrExam || (catSlug || '').replace(/-/g, ' ');

  // Distinct subjects containing videos
  const subjectsWithVideos = useMemo(() => {
    const map = new Map<string, number>();
    categoryVideos.forEach(v => {
      const s = normalizeSubject(v.subject);
      map.set(s, (map.get(s) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [categoryVideos]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs
        items={[
          { label: t('videoCorner'), to: '/video-corner' },
          { label: categoryName }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-md bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            Step 1 of 3: Video Subject
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {categoryName} — Available Subjects
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Choose a subject to browse chapter-wise video lectures and tutorials.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
            <span>{t('loading')}</span>
          </div>
        ) : subjectsWithVideos.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <VideoIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t('noVideosFound')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No subjects currently have active video lectures for this section.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {subjectsWithVideos.map((item, idx) => {
              const color: CardColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
              const subjSlug = createSlug(item.name);

              return (
                <ColorfulCard
                  key={item.name}
                  title={item.name}
                  subtitle={`Video lectures and problem-solving modules`}
                  badge={categoryName}
                  color={color}
                  icon={BookOpen}
                  count={item.count}
                  countLabel={t('videos')}
                  actionText="View Chapters"
                  onClick={() => navigate(`/video-corner/${catSlug}/${subjSlug}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

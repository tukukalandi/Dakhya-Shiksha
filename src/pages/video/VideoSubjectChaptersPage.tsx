import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, Video as VideoIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { ColorfulCard, CardColor, COLOR_PALETTE } from '../../components/common/ColorfulCard';
import { Video } from '../../types';
import { fetchVideos } from '../../lib/firebase';
import { createSlug, normalizeSubject } from '../../lib/utils';

export const VideoSubjectChaptersPage: React.FC = () => {
  const { catSlug, subjectSlug } = useParams<{ catSlug: string; subjectSlug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchVideos()
      .then(data => setVideos(data))
      .finally(() => setLoading(false));
  }, []);

  const rawSubject = (subjectSlug || '').replace(/-/g, ' ');
  const formattedSubject = normalizeSubject(rawSubject);

  // Filter matching category + subject
  const matchingVideos = useMemo(() => {
    return videos.filter(v => {
      if (v.status !== 'published' && v.status !== 'active') return false;
      const catMatch = createSlug(v.classOrExam) === catSlug;
      const subjMatch = normalizeSubject(v.subject) === formattedSubject;
      return catMatch && subjMatch;
    });
  }, [videos, catSlug, formattedSubject]);

  const categoryName = matchingVideos[0]?.classOrExam || (catSlug || '').replace(/-/g, ' ');

  // Distinct chapters grouping
  const chaptersWithVideos = useMemo(() => {
    const map = new Map<string, number>();
    matchingVideos.forEach(v => {
      const ch = v.chapter.trim();
      map.set(ch, (map.get(ch) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [matchingVideos]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs
        items={[
          { label: t('videoCorner'), to: '/video-corner' },
          { label: categoryName, to: `/video-corner/${catSlug}` },
          { label: formattedSubject }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            Step 2 of 3: Chapter Selection
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {categoryName} &gt; {formattedSubject} — Chapters
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Select an educational chapter to watch video classes and concept animations.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
            <span>{t('loading')}</span>
          </div>
        ) : chaptersWithVideos.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <VideoIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t('noVideosFound')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No chapters currently have active video lectures under this subject.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {chaptersWithVideos.map((ch, idx) => {
              const color: CardColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
              const chapterSlug = createSlug(ch.name);

              return (
                <ColorfulCard
                  key={ch.name}
                  title={ch.name}
                  subtitle="Detailed video lessons, concept walkthroughs and solved examples"
                  badge="Chapter"
                  color={color}
                  icon={Layers}
                  count={ch.count}
                  countLabel={t('videos')}
                  actionText="Watch Videos"
                  onClick={() => navigate(`/video-corner/${catSlug}/${subjectSlug}/${chapterSlug}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

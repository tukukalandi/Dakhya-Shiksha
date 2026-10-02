import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Clock, Video as VideoIcon, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Video } from '../../types';
import { fetchVideos } from '../../lib/firebase';
import { createSlug, normalizeSubject, formatDate } from '../../lib/utils';

export const VideoChapterVideosPage: React.FC = () => {
  const { catSlug, subjectSlug, chapterSlug } = useParams<{ catSlug: string; subjectSlug: string; chapterSlug: string }>();
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

  // Grouping invariant: categoryType/classOrExam + subject + chapter
  const matchingVideos = useMemo(() => {
    return videos.filter(v => {
      if (v.status !== 'published' && v.status !== 'active') return false;
      const catMatch = createSlug(v.classOrExam) === catSlug;
      const subjMatch = normalizeSubject(v.subject) === formattedSubject;
      const chMatch = createSlug(v.chapter) === chapterSlug;
      return catMatch && subjMatch && chMatch;
    });
  }, [videos, catSlug, formattedSubject, chapterSlug]);

  const categoryName = matchingVideos[0]?.classOrExam || (catSlug || '').replace(/-/g, ' ');
  const chapterName = matchingVideos[0]?.chapter || (chapterSlug || '').replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs
        items={[
          { label: t('videoCorner'), to: '/video-corner' },
          { label: categoryName, to: `/video-corner/${catSlug}` },
          { label: formattedSubject, to: `/video-corner/${catSlug}/${subjectSlug}` },
          { label: chapterName }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            Step 3 of 3: Video Lessons
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {categoryName} &gt; {formattedSubject} &gt; {chapterName}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            All video episodes and explanations for this chapter ({matchingVideos.length} {t('videos')} available).
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
            <span>{t('loading')}</span>
          </div>
        ) : matchingVideos.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <VideoIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t('noVideosFound')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No videos currently listed for this chapter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingVideos.map((video, idx) => (
              <div
                key={video.id}
                onClick={() => navigate(`/video-corner/${catSlug}/${subjectSlug}/${chapterSlug}/${video.id}`)}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-900/90 text-amber-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-800 transition-all shadow-lg border-2 border-amber-400">
                      <Play className="w-5 h-5 ml-0.5 fill-amber-300" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-amber-200 text-[10px] font-mono font-bold flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{video.duration}</span>
                    </span>
                  )}

                  {/* Episode Number */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-red-950/80 text-amber-300 text-[10px] font-bold">
                    Part {idx + 1}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-800 dark:group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[120px]">{video.uploadedBy || 'Faculty'}</span>
                    </div>

                    <span className="font-bold text-red-800 dark:text-amber-400 group-hover:underline">
                      {t('watchVideo')} →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Clock, 
  User, 
  Calendar, 
  Share2, 
  Check, 
  AlertCircle,
  Video as VideoIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Video } from '../../types';
import { fetchVideos } from '../../lib/firebase';
import { createSlug, normalizeSubject, getYouTubeEmbedUrl, formatDate } from '../../lib/utils';

export const VideoPlayerPage: React.FC = () => {
  const { catSlug, subjectSlug, chapterSlug, videoId } = useParams<{
    catSlug?: string;
    subjectSlug?: string;
    chapterSlug?: string;
    videoId: string;
  }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetchVideos()
      .then(data => setVideos(data))
      .finally(() => setLoading(false));
  }, []);

  const currentVideo = useMemo(() => {
    return videos.find(v => v.id === videoId);
  }, [videos, videoId]);

  // Sibling videos in same chapter
  const chapterVideos = useMemo(() => {
    if (!currentVideo) return [];
    return videos.filter(
      v =>
        createSlug(v.classOrExam) === createSlug(currentVideo.classOrExam) &&
        normalizeSubject(v.subject) === normalizeSubject(currentVideo.subject) &&
        createSlug(v.chapter) === createSlug(currentVideo.chapter) &&
        (v.status === 'published' || v.status === 'active')
    );
  }, [videos, currentVideo]);

  // Determine prev and next videos
  const currentIndex = chapterVideos.findIndex(v => v.id === videoId);
  const prevVideo = currentIndex > 0 ? chapterVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex >= 0 && currentIndex < chapterVideos.length - 1 ? chapterVideos[currentIndex + 1] : null;

  // Other related videos from same subject
  const relatedVideos = useMemo(() => {
    if (!currentVideo) return [];
    return videos
      .filter(
        v =>
          normalizeSubject(v.subject) === normalizeSubject(currentVideo.subject) &&
          v.id !== videoId &&
          (v.status === 'published' || v.status === 'active')
      )
      .slice(0, 4);
  }, [videos, currentVideo, videoId]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
        <span className="text-slate-500">{t('loading')}</span>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Video Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">This video may have been removed or unpublished.</p>
          <button
            onClick={() => navigate('/video-corner')}
            className="px-4 py-2 bg-red-900 text-amber-300 font-bold text-xs rounded-lg hover:bg-red-800 transition"
          >
            Back to Video Corner
          </button>
        </div>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(currentVideo.videoUrl);
  const derivedCatSlug = catSlug || createSlug(currentVideo.classOrExam);
  const derivedSubjSlug = subjectSlug || createSlug(currentVideo.subject);
  const derivedChapSlug = chapterSlug || createSlug(currentVideo.chapter);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs
        items={[
          { label: t('videoCorner'), to: '/video-corner' },
          { label: currentVideo.classOrExam, to: `/video-corner/${derivedCatSlug}` },
          { label: currentVideo.subject, to: `/video-corner/${derivedCatSlug}/${derivedSubjSlug}` },
          { label: currentVideo.chapter, to: `/video-corner/${derivedCatSlug}/${derivedSubjSlug}/${derivedChapSlug}` },
          { label: currentVideo.title }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video & Details (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Frame */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video border-2 border-red-900/40 relative">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <video
                  src={currentVideo.videoUrl}
                  controls
                  poster={currentVideo.thumbnailUrl}
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Video Controls (Prev, Next, Back to Chapter) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => navigate(`/video-corner/${derivedCatSlug}/${derivedSubjSlug}/${derivedChapSlug}`)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('backToChapter')}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  disabled={!prevVideo}
                  onClick={() => prevVideo && navigate(`/video-corner/${derivedCatSlug}/${derivedSubjSlug}/${derivedChapSlug}/${prevVideo.id}`)}
                  className={`inline-flex items-center space-x-1 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    prevVideo
                      ? 'bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-amber-300 hover:bg-red-100 border border-red-200 dark:border-red-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('previousVideo')}</span>
                </button>

                <button
                  disabled={!nextVideo}
                  onClick={() => nextVideo && navigate(`/video-corner/${derivedCatSlug}/${derivedSubjSlug}/${derivedChapSlug}/${nextVideo.id}`)}
                  className={`inline-flex items-center space-x-1 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    nextVideo
                      ? 'bg-red-900 text-amber-300 hover:bg-red-800 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{t('nextVideo')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Metadata Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-400 text-xs font-bold">
                    {currentVideo.classOrExam}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-300 text-xs font-bold">
                    {currentVideo.subject}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                    {currentVideo.chapter}
                  </span>
                </div>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                {currentVideo.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{currentVideo.uploadedBy || 'Faculty'}</span>
                </span>
                {currentVideo.duration && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Duration: {currentVideo.duration}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(currentVideo.createdAt)}</span>
                </span>
              </div>

              {currentVideo.description && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Lesson Description
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {currentVideo.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Chapter Episodes & Related (1 column) */}
          <div className="space-y-6">
            {/* Current Chapter Series Playlist */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                Chapter Playlist ({chapterVideos.length} Videos)
              </h3>
              <div className="space-y-2.5">
                {chapterVideos.map((vid, idx) => {
                  const isPlaying = vid.id === videoId;
                  return (
                    <div
                      key={vid.id}
                      onClick={() => !isPlaying && navigate(`/video-corner/${derivedCatSlug}/${derivedSubjSlug}/${derivedChapSlug}/${vid.id}`)}
                      className={`p-2.5 rounded-xl border flex items-center space-x-3 transition cursor-pointer ${
                        isPlaying
                          ? 'bg-red-50 dark:bg-red-950/40 border-red-600 text-red-900 dark:text-amber-300 shadow-2xs'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 text-xs font-bold">
                        {isPlaying ? <Play className="w-3.5 h-3.5 fill-red-800 text-red-800 dark:text-amber-300" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{vid.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{vid.duration || 'Video lesson'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Related Videos in Subject */}
            {relatedVideos.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  {t('relatedVideos')}
                </h3>
                <div className="space-y-3">
                  {relatedVideos.map(vid => (
                    <div
                      key={vid.id}
                      onClick={() => navigate(`/video-corner/${createSlug(vid.classOrExam)}/${createSlug(vid.subject)}/${createSlug(vid.chapter)}/${vid.id}`)}
                      className="group flex space-x-3 cursor-pointer"
                    >
                      <div className="w-20 h-14 rounded-lg bg-slate-800 shrink-0 overflow-hidden relative">
                        <img
                          src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80'}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-red-700 dark:group-hover:text-amber-400 line-clamp-2">
                          {vid.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{vid.chapter}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

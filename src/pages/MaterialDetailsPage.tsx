import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  ExternalLink, 
  Eye, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  Languages, 
  Layers, 
  Share2, 
  Check, 
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { StudyMaterial } from '../types';
import { fetchStudyMaterials, incrementMaterialCounter } from '../lib/firebase';
import { 
  normalizeClass, 
  normalizeSubject, 
  normalizeMaterialType, 
  formatDate, 
  getDrivePreviewUrl,
  createSlug 
} from '../lib/utils';

export const MaterialDetailsPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetchStudyMaterials().then(list => {
      // Find either by exact ID or by slug of title
      const found = list.find(m => m.id === idOrSlug || createSlug(m.title) === idOrSlug);
      setMaterial(found || null);
      if (found) {
        incrementMaterialCounter(found.id, 'view');
      }
      setLoading(false);
    });
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
        <span className="text-slate-500">{t('loading')}</span>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {t('materialUnavailable')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            The requested study material may have been moved, updated, or unpublished.
          </p>
          <button
            onClick={() => navigate('/study-materials')}
            className="px-5 py-2.5 bg-red-900 text-amber-300 font-bold text-xs rounded-lg hover:bg-red-800 transition cursor-pointer"
          >
            {t('browseMaterials')}
          </button>
        </div>
      </div>
    );
  }

  // Dynamic Exam/Chapter label per Section 9 & 10
  const isNcertBook = normalizeMaterialType(material.materialType) === 'NCERT Book';
  const isSchoolOrOlympiad = material.examType === 'School Examination' || material.examType === 'Olympiad Exam';
  const dynamicExamLabel = isNcertBook 
    ? t('chapterNo') 
    : isSchoolOrOlympiad 
    ? 'Chapter Name / Chapter No.' 
    : t('examName');

  const driveUrl = material.googleDriveUrl || getDrivePreviewUrl(material.googleDriveUrl, material.googleDriveFileId);

  const handleDownloadClick = () => {
    incrementMaterialCounter(material.id, 'download');
    if (material.fileDataUrl || (driveUrl && (driveUrl.startsWith('data:') || driveUrl.startsWith('blob:')))) {
      const link = document.createElement('a');
      link.href = material.fileDataUrl || driveUrl;
      link.download = material.fileName || `${material.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    if (driveUrl) {
      window.open(driveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs
        items={[
          { label: t('studyMaterials'), to: '/study-materials' },
          { label: material.classLevel, to: `/class/${material.classLevel.replace(/\D/g, '')}` },
          { label: material.subject, to: `/class/${material.classLevel.replace(/\D/g, '')}/${createSlug(material.subject)}` },
          { label: material.title }
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Top Decorative Banner */}
          <div className="bg-gradient-to-r from-red-900 via-red-950 to-slate-950 p-6 sm:p-10 text-white relative">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-red-950 uppercase tracking-wider">
                {material.classLevel}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs text-white">
                {material.subject}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-800/80 text-amber-200 border border-red-700">
                {normalizeMaterialType(material.materialType)}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-snug drop-shadow-sm mb-3">
              {material.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-amber-200/90 mt-4">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Updated: {formatDate(material.updatedAt || material.createdAt)}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>{material.viewCount || 0} {t('views')}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{material.downloadCount || 0} {t('downloads')}</span>
              </span>
            </div>
          </div>

          {/* Main Details Body */}
          <div className="p-6 sm:p-10">
            {/* Download CTA Bar */}
            <div className="bg-amber-50 dark:bg-slate-800/80 border-2 border-amber-300 dark:border-slate-700 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Ready to Study?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Direct Google Drive access. High-resolution PDF document format.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleShareClick}
                  className="px-4 py-3 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-600 transition flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? 'Link Copied!' : 'Share'}</span>
                </button>

                {driveUrl ? (
                  <button
                    onClick={handleDownloadClick}
                    className="flex-1 sm:flex-none px-7 py-3.5 bg-red-900 hover:bg-red-800 text-amber-300 font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('viewDownload')}</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1 text-amber-400" />
                  </button>
                ) : (
                  <div className="text-xs font-bold text-red-700 bg-red-100 px-4 py-2.5 rounded-lg">
                    {t('materialUnavailable')}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {material.description && (
              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Overview & Description
                </h2>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {material.description}
                </div>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-medium">{t('class')}</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{material.classLevel}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-medium">{t('subjects')}</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{material.subject}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Category</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {normalizeMaterialType(material.materialType)}
                </p>
              </div>

              {material.examType && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">{t('examType')}</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{material.examType}</p>
                </div>
              )}

              {material.examName && (
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-slate-800/70 border border-amber-200/60 dark:border-slate-700">
                  <span className="text-xs text-red-900 dark:text-amber-400 font-bold">{dynamicExamLabel}</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{material.examName}</p>
                </div>
              )}

              {material.academicYear && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">{t('academicYear')}</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{material.academicYear}</p>
                </div>
              )}

              {material.language && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">{t('language')}</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{material.language}</p>
                </div>
              )}

              {material.fileName && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Original File</span>
                  <p className="text-sm font-mono text-slate-800 dark:text-slate-200 mt-0.5 truncate">{material.fileName}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {material.tags && material.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Keywords & Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {material.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-amber-400 text-xs font-medium rounded-full border border-red-100 dark:border-red-900"
                    >
                      #{tag}
                    </span>
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  ExternalLink, 
  Search, 
  Filter, 
  Layers, 
  BookOpen, 
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { StudyMaterial } from '../types';
import { fetchStudyMaterials, incrementMaterialCounter } from '../lib/firebase';
import { 
  normalizeClass, 
  normalizeSubject, 
  normalizeMaterialType, 
  createSlug, 
  formatDate,
  getDrivePreviewUrl,
  isOlympiadMaterial 
} from '../lib/utils';

export const MaterialFilesListPage: React.FC = () => {
  const { classNum, subjectSlug, typeSlug } = useParams<{ classNum: string; subjectSlug: string; typeSlug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const formattedClass = normalizeClass(classNum || '5');
  const classDigits = formattedClass.replace(/\D/g, '');
  const rawSubject = (subjectSlug || '').replace(/-/g, ' ');
  const formattedSubject = normalizeSubject(rawSubject);
  const rawType = (typeSlug || '').replace(/-/g, ' ');
  const formattedType = normalizeMaterialType(rawType);

  useEffect(() => {
    fetchStudyMaterials()
      .then(data => setMaterials(data))
      .finally(() => setLoading(false));
  }, []);

  // Strict normalization matching: Class + Subject + Material Type (excluding Olympiad)
  const matchingFiles = materials.filter(m => {
    if (!m.isPublished) return false;
    if (isOlympiadMaterial(m)) return false; // Strictly only show in Olympiad section
    const classMatch = normalizeClass(m.classLevel) === formattedClass;
    const subjectMatch =
      formattedSubject === 'All Subjects' ||
      normalizeSubject(m.subject) === formattedSubject;
    // CRITICAL: normalizeMaterialType handles 'Chapter' and 'NCERT Book' identically
    const typeMatch = normalizeMaterialType(m.materialType) === formattedType;

    if (!classMatch || !subjectMatch || !typeMatch) return false;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const titleMatch = m.title.toLowerCase().includes(q);
      const examNameMatch = (m.examName || '').toLowerCase().includes(q);
      const descMatch = (m.description || '').toLowerCase().includes(q);
      return titleMatch || examNameMatch || descMatch;
    }

    return true;
  });

  const getDynamicExamLabel = (material: StudyMaterial): string => {
    if (normalizeMaterialType(material.materialType) === 'NCERT Book') {
      return t('chapterNo');
    }
    if (material.examType === 'School Examination' || material.examType === 'Olympiad Exam') {
      return 'Chapter Name / Chapter No.';
    }
    return t('examName');
  };

  const handleOpenDrive = (e: React.MouseEvent, material: StudyMaterial) => {
    e.stopPropagation();
    incrementMaterialCounter(material.id, 'download');
    const driveUrl = material.googleDriveUrl || getDrivePreviewUrl(material.googleDriveUrl, material.googleDriveFileId);
    window.open(driveUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Breadcrumbs
        items={[
          { label: t('classes'), to: '/classes' },
          { label: formattedClass, to: `/class/${classDigits}` },
          { label: formattedSubject, to: `/class/${classDigits}/${subjectSlug}` },
          { label: formattedType }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-block px-3 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              Step 3 of 3: Study Material Files
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formattedClass} &gt; {formattedSubject} &gt; {formattedType}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Verified, curriculum-aligned educational files ready for online viewing and Google Drive download.
            </p>
          </div>

          {/* Quick in-page Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter these files..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-hidden focus:border-red-600 text-slate-800 dark:text-slate-100 shadow-2xs"
            />
          </div>
        </div>

        {/* Files Grid or Empty State */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
            <span>{t('loading')}</span>
          </div>
        ) : matchingFiles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t('noMaterialsFound')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              No published files found under {formattedClass} {formattedSubject} for {formattedType}. 
              You can check other subjects or view our full library.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate(`/class/${classDigits}/${subjectSlug}`)}
                className="px-4 py-2 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-lg transition cursor-pointer"
              >
                Other {formattedSubject} Categories
              </button>
              <Link
                to="/study-materials"
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg transition"
              >
                All Study Materials
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingFiles.map((file) => {
              const dynamicLabel = getDynamicExamLabel(file);

              return (
                <div
                  key={file.id}
                  onClick={() => {
                    incrementMaterialCounter(file.id, 'view');
                    navigate(`/material/${file.id}`);
                  }}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between cursor-pointer border-t-4 border-t-red-800"
                >
                  <div className="p-5">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-amber-400">
                        {file.classLevel} • {file.subject}
                      </span>
                      {file.academicYear && (
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {file.academicYear}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-800 dark:group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                      {file.title}
                    </h3>

                    {/* Description */}
                    {file.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                        {file.description}
                      </p>
                    )}

                    {/* Dynamic Chapter / Exam field */}
                    {file.examName && (
                      <div className="bg-amber-50 dark:bg-slate-800/80 rounded-lg p-2.5 text-xs text-amber-950 dark:text-amber-300 border border-amber-200/60 dark:border-slate-700/60 mb-3">
                        <span className="font-bold text-red-900 dark:text-amber-400 mr-1.5">
                          {dynamicLabel}:
                        </span>
                        <span>{file.examName}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {file.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer with Drive action */}
                  <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{file.viewCount || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>{file.downloadCount || 0}</span>
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleOpenDrive(e, file)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-red-950 text-xs font-black rounded-md shadow-xs transition cursor-pointer"
                      title="Open Google Drive File"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t('viewOnline')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

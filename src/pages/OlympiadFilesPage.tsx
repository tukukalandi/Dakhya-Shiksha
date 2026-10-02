import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Award, 
  Download, 
  Eye, 
  Search, 
  FileText, 
  AlertCircle, 
  Layers, 
  ExternalLink,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { StudyMaterial } from '../types';
import { fetchStudyMaterials, incrementMaterialCounter } from '../lib/firebase';
import { 
  normalizeClass, 
  normalizeSubject, 
  normalizeMaterialType, 
  normalizeText,
  formatDate,
  getDrivePreviewUrl,
  createSlug 
} from '../lib/utils';

export const OlympiadFilesPage: React.FC = () => {
  const { classNum, subjectSlug, typeSlug } = useParams<{ 
    classNum: string; 
    subjectSlug: string; 
    typeSlug?: string; 
  }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const formattedClass = normalizeClass(classNum || '5');
  const classDigits = formattedClass.replace(/\D/g, '') || '5';

  const rawType = (typeSlug || '').replace(/-/g, ' ');
  const formattedType = normalizeMaterialType(rawType);

  useEffect(() => {
    fetchStudyMaterials().then(data => {
      setMaterials(data);
      setLoading(false);
    });
  }, []);

  // Readable subject name
  const subjectDisplayNames: Record<string, string> = {
    'mathematics': 'Mathematics Olympiad (IMO)',
    'science': 'Science Olympiad (NSO)',
    'english': 'English Olympiad (IEO)',
    'computer': 'Cyber & Computer Olympiad (NCO)',
    'reasoning': 'Logical Reasoning & Mental Ability',
    'general-knowledge': 'General Knowledge Olympiad (SKGKO)',
    'all-subjects': 'All Olympiad Subjects'
  };

  const currentSubjectName = subjectDisplayNames[subjectSlug || 'all-subjects'] || (subjectSlug || '').replace(/-/g, ' ');

  // Matcher for subject
  const matchesSubject = (m: StudyMaterial, slug: string): boolean => {
    if (slug === 'all-subjects') return true;
    const s = normalizeSubject(m.subject);
    const title = m.title.toLowerCase();
    const tags = (m.tags || []).map(t => t.toLowerCase());

    if (slug === 'mathematics') {
      return s === 'Mathematics' || s === 'Math' || title.includes('imo') || title.includes('math') || tags.some(t => t.includes('imo') || t.includes('math'));
    }
    if (slug === 'science') {
      return s === 'Science' || title.includes('nso') || title.includes('science') || tags.some(t => t.includes('nso') || t.includes('science'));
    }
    if (slug === 'english') {
      return s === 'English' || title.includes('ieo') || title.includes('english') || tags.some(t => t.includes('ieo') || t.includes('english'));
    }
    if (slug === 'computer') {
      return s === 'Computer' || title.includes('nco') || title.includes('cyber') || title.includes('computer');
    }
    if (slug === 'reasoning') {
      return s === 'Reasoning' || title.includes('reasoning') || title.includes('mental ability') || title.includes('logic');
    }
    if (slug === 'general-knowledge') {
      return s === 'General Knowledge' || title.includes('gk') || title.includes('skgko');
    }
    return s.toLowerCase() === slug.toLowerCase();
  };

  // Filter materials for this Class, Subject, and Material Type
  const matchingFiles = useMemo(() => {
    return materials.filter(m => {
      if (!m.isPublished) return false;
      const classMatch = normalizeClass(m.classLevel) === formattedClass;
      if (!classMatch) return false;

      const isOlyExam = normalizeText(m.examType).includes('olympiad');
      const inTitle = normalizeText(m.title).includes('olympiad') || 
                      normalizeText(m.title).includes('imo') || 
                      normalizeText(m.title).includes('nso') || 
                      normalizeText(m.title).includes('ieo') ||
                      normalizeText(m.title).includes('nco');
      const inTags = (m.tags || []).some(tag => normalizeText(tag).includes('olympiad'));
      
      const isOly = isOlyExam || inTitle || inTags;
      if (!isOly) return false;

      const subjMatch = matchesSubject(m, subjectSlug || 'all-subjects');
      if (!subjMatch) return false;

      // Material Type matching (if provided)
      if (typeSlug && typeSlug !== 'all-types') {
        const typeMatch = normalizeMaterialType(m.materialType) === formattedType;
        if (!typeMatch) return false;
      }

      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const inTitleQ = m.title.toLowerCase().includes(q);
        const inExamQ = (m.examName || '').toLowerCase().includes(q);
        const inDescQ = (m.description || '').toLowerCase().includes(q);
        return inTitleQ || inExamQ || inDescQ;
      }

      return true;
    });
  }, [materials, formattedClass, subjectSlug, typeSlug, formattedType, searchFilter]);

  const handleOpenDrive = (e: React.MouseEvent, material: StudyMaterial) => {
    e.stopPropagation();
    incrementMaterialCounter(material.id, 'download');
    const driveUrl = material.googleDriveUrl || getDrivePreviewUrl(material.googleDriveUrl, material.googleDriveFileId);
    window.open(driveUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs
        items={[
          { label: t('olympiad'), to: '/olympiad' },
          { label: formattedClass, to: `/olympiad/${classDigits}` },
          { label: currentSubjectName, to: `/olympiad/${classDigits}/${subjectSlug}` },
          { label: formattedType || 'Uploaded Files' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-block px-3 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              Step 4 of 4: Uploaded Olympiad Files
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formattedClass} &gt; {currentSubjectName} {formattedType ? `&gt; ${formattedType}` : ''}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Official Olympiad question papers, solved mock tests, worksheets, and level 1 & 2 preparation guides.
            </p>
          </div>

          {/* Search inside these files */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search Olympiad files..."
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
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No Olympiad Files Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              No uploaded files found under {formattedClass} {currentSubjectName} {formattedType ? `for ${formattedType}` : ''}.
              You can check other material types or explore another subject.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate(`/olympiad/${classDigits}/${subjectSlug}`)}
                className="px-4 py-2 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-lg transition cursor-pointer"
              >
                Other {currentSubjectName} Material Types
              </button>
              <button
                onClick={() => navigate(`/olympiad/${classDigits}`)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg transition cursor-pointer"
              >
                All {formattedClass} Subjects
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => {
                  incrementMaterialCounter(file.id, 'view');
                  navigate(`/material/${file.id}`);
                }}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between cursor-pointer border-t-4 border-t-amber-500"
              >
                <div className="p-5">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
                      {file.classLevel} • {file.subject}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {normalizeMaterialType(file.materialType)}
                    </span>
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

                  {/* Exam / Chapter identifier */}
                  {file.examName && (
                    <div className="bg-amber-50/80 dark:bg-slate-800/80 rounded-lg p-2.5 text-xs text-amber-950 dark:text-amber-300 border border-amber-200/80 dark:border-slate-700/60 mb-3">
                      <span className="font-bold text-red-900 dark:text-amber-400 mr-1.5">
                        Olympiad Track:
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
                    <span>View in Drive</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Download, 
  Eye, 
  Layers, 
  Calendar, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { StudyMaterial } from '../types';
import { fetchStudyMaterials, incrementMaterialCounter, subscribeMaterialsUpdate } from '../lib/firebase';
import { 
  normalizeClass, 
  normalizeSubject, 
  normalizeMaterialType, 
  normalizeText,
  formatDate,
  getDrivePreviewUrl,
  createSlug,
  isOlympiadMaterial
} from '../lib/utils';

export const StudyMaterialsPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters from URL query state
  const classFilter = searchParams.get('class') || '';
  const subjectFilter = searchParams.get('subject') || '';
  const typeFilter = searchParams.get('type') || '';
  const examFilter = searchParams.get('exam') || '';
  const yearFilter = searchParams.get('year') || '';
  const langFilter = searchParams.get('lang') || '';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    fetchStudyMaterials()
      .then(data => {
        setMaterials(data);
        setLoading(false);
      });

    const unsubscribe = subscribeMaterialsUpdate((updated) => {
      setMaterials(updated);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Derive unique options for filter dropdowns
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    materials.forEach(m => {
      if (m.classLevel) set.add(normalizeClass(m.classLevel));
    });
    // Ensure 1-10 are available in order
    const ordered = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => `Class ${c}`);
    return Array.from(new Set([...ordered, ...Array.from(set)]));
  }, [materials]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    materials.filter(m => !isOlympiadMaterial(m)).forEach(m => {
      if (m.subject) set.add(normalizeSubject(m.subject));
    });
    return Array.from(set).sort();
  }, [materials]);

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    materials.forEach(m => {
      if (m.materialType) set.add(normalizeMaterialType(m.materialType));
    });
    const standard = [
      'NCERT Book',
      'Study Notes',
      'Question Papers',
      'Previous Year Papers',
      'Model Papers',
      'Worksheets',
      'Revision Notes',
      'Important Questions',
      'Mock Tests',
      'Solutions'
    ];
    return Array.from(new Set([...standard, ...Array.from(set)]));
  }, [materials]);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    materials.forEach(m => {
      if (m.academicYear) set.add(m.academicYear);
    });
    return Array.from(set).sort().reverse();
  }, [materials]);

  // Normalized Multi-filtering
  const filteredMaterials = useMemo(() => {
    return materials.filter(item => {
      if (!item.isPublished) return false;

      // Olympiad materials only show in Olympiad section unless explicitly filtered
      if (isOlympiadMaterial(item) && examFilter !== 'Olympiad Exam' && !searchQuery.toLowerCase().includes('olympiad')) {
        return false;
      }

      // Class Filter
      if (classFilter && normalizeClass(item.classLevel) !== normalizeClass(classFilter)) {
        return false;
      }

      // Subject Filter (Class 5 Math never matches Science)
      if (subjectFilter && normalizeSubject(item.subject) !== normalizeSubject(subjectFilter)) {
        return false;
      }

      // Material Type Filter (handles Chapter == NCERT Book)
      if (typeFilter && normalizeMaterialType(item.materialType) !== normalizeMaterialType(typeFilter)) {
        return false;
      }

      // Exam Filter
      if (examFilter && normalizeText(item.examType) !== normalizeText(examFilter)) {
        return false;
      }

      // Year Filter
      if (yearFilter && item.academicYear !== yearFilter) {
        return false;
      }

      // Language Filter
      if (langFilter && normalizeText(item.language) !== normalizeText(langFilter)) {
        return false;
      }

      // Text Query: title, description, chapter, topic, tags
      if (searchQuery.trim()) {
        const q = normalizeText(searchQuery);
        const inTitle = normalizeText(item.title).includes(q);
        const inDesc = normalizeText(item.description).includes(q);
        const inExam = normalizeText(item.examName).includes(q);
        const inClass = normalizeText(item.classLevel).includes(q);
        const inSubject = normalizeText(item.subject).includes(q);
        const inTags = (item.tags || []).some(t => normalizeText(t).includes(q));

        if (!inTitle && !inDesc && !inExam && !inClass && !inSubject && !inTags) {
          return false;
        }
      }

      return true;
    });
  }, [materials, classFilter, subjectFilter, typeFilter, examFilter, yearFilter, langFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs items={[{ label: t('studyMaterials') }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-md bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            Dakshya Study Repository
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('studyMaterials')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Search and filter NCERT books, question papers, solutions, and notes across all classes and subjects.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs mb-8">
          {/* Main Search input */}
          <div className="relative mb-4">
            <Search className="w-5 h-5 text-red-800 dark:text-amber-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search by title, subject, chapter, or keyword..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-red-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {/* Class */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {t('class')}
              </label>
              <select
                value={classFilter}
                onChange={(e) => updateParam('class', e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden"
              >
                <option value="">All Classes</option>
                {availableClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {t('subjects')}
              </label>
              <select
                value={subjectFilter}
                onChange={(e) => updateParam('subject', e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden"
              >
                <option value="">All Subjects</option>
                {availableSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Material Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={typeFilter}
                onChange={(e) => updateParam('type', e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden"
              >
                <option value="">All Categories</option>
                {availableTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Exam Type
              </label>
              <select
                value={examFilter}
                onChange={(e) => updateParam('exam', e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden"
              >
                <option value="">All Exams</option>
                <option value="School Examination">School Examination</option>
                <option value="Olympiad Exam">Olympiad Exam</option>
                <option value="Board Examination">Board Examination</option>
                <option value="Competitive Exam">Competitive Exam</option>
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Year
              </label>
              <select
                value={yearFilter}
                onChange={(e) => updateParam('year', e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden"
              >
                <option value="">All Years</option>
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Language
              </label>
              <select
                value={langFilter}
                onChange={(e) => updateParam('lang', e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden"
              >
                <option value="">All Languages</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Odia">Odia</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges & Reset Button */}
          {(classFilter || subjectFilter || typeFilter || examFilter || yearFilter || langFilter || searchQuery) && (
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-400">Active Filters:</span>
                {classFilter && (
                  <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-300 font-semibold">
                    Class: {classFilter}
                  </span>
                )}
                {subjectFilter && (
                  <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-300 font-semibold">
                    Subject: {subjectFilter}
                  </span>
                )}
                {typeFilter && (
                  <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-300 font-semibold">
                    Type: {typeFilter}
                  </span>
                )}
                {searchQuery && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-300 font-semibold">
                    Query: "{searchQuery}"
                  </span>
                )}
              </div>

              <button
                onClick={clearAllFilters}
                className="inline-flex items-center space-x-1 text-xs text-red-700 dark:text-amber-400 hover:underline font-bold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('resetFilters')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500 font-medium">
          <span>Showing <strong>{filteredMaterials.length}</strong> study materials</span>
        </div>

        {/* Materials Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
            <span>{t('loading')}</span>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t('noMaterialsFound')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Try adjusting or resetting your filter criteria to discover more materials.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-red-900 text-amber-300 font-bold text-xs rounded-lg hover:bg-red-800 transition cursor-pointer"
            >
              {t('resetFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map(mat => (
              <div
                key={mat.id}
                onClick={() => {
                  incrementMaterialCounter(mat.id, 'view');
                  navigate(`/material/${mat.id}`);
                }}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between cursor-pointer border-t-4 border-t-red-800"
              >
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-amber-400">
                      {mat.classLevel} • {mat.subject}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {normalizeMaterialType(mat.materialType)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-800 dark:group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                    {mat.title}
                  </h3>

                  {mat.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                      {mat.description}
                    </p>
                  )}

                  {mat.examName && (
                    <div className="bg-amber-50 dark:bg-slate-800/80 rounded-lg p-2 text-xs text-amber-950 dark:text-amber-300 border border-amber-200/60 dark:border-slate-700/60 mb-2">
                      <span className="font-bold text-red-900 dark:text-amber-400 mr-1.5">
                        {normalizeMaterialType(mat.materialType) === 'NCERT Book' ? t('chapterNo') : 'Chapter / Exam'}:
                      </span>
                      <span>{mat.examName}</span>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{mat.viewCount || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>{mat.downloadCount || 0}</span>
                    </span>
                  </div>

                  <span className="text-xs font-black text-red-800 dark:text-amber-400 group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

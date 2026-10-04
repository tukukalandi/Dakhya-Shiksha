import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Eye, 
  Search, 
  Filter, 
  RotateCcw, 
  FolderCheck,
  LayoutGrid, 
  List, 
  CheckCircle2, 
  ArrowRight,
  HardDrive,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { StudyMaterial } from '../../types';
import { 
  normalizeClass, 
  normalizeSubject, 
  normalizeMaterialType, 
  formatDate, 
  getDrivePreviewUrl, 
  createSlug 
} from '../../lib/utils';
import { incrementMaterialCounter } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';

interface RecentMaterialsSectionProps {
  materials: StudyMaterial[];
}

export const RecentMaterialsSection: React.FC<RecentMaterialsSectionProps> = ({ materials }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Filters & display state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Include all published files or materials that have content
  const allAvailableMaterials = useMemo(() => {
    return materials
      .filter(m => m.isPublished !== false)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [materials]);

  // Extract distinct subjects and types for dropdowns
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    allAvailableMaterials.forEach(m => {
      if (m.subject) subs.add(m.subject);
    });
    return Array.from(subs).sort();
  }, [allAvailableMaterials]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    allAvailableMaterials.forEach(m => {
      if (m.materialType) types.add(normalizeMaterialType(m.materialType));
    });
    return Array.from(types).sort();
  }, [allAvailableMaterials]);

  // Filtered materials based on user search and dropdowns
  const filteredMaterials = useMemo(() => {
    return allAvailableMaterials.filter(mat => {
      // 1. Class filter
      if (selectedClass !== 'all') {
        const normalized = normalizeClass(mat.classLevel);
        if (normalized !== `Class ${selectedClass}`) return false;
      }

      // 2. Subject filter
      if (selectedSubject !== 'all') {
        if (mat.subject?.toLowerCase() !== selectedSubject.toLowerCase()) return false;
      }

      // 3. Material type filter
      if (selectedType !== 'all') {
        if (normalizeMaterialType(mat.materialType).toLowerCase() !== selectedType.toLowerCase()) return false;
      }

      // 4. Search query matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (mat.title || '').toLowerCase().includes(q);
        const fileMatch = (mat.fileName || '').toLowerCase().includes(q);
        const descMatch = (mat.description || '').toLowerCase().includes(q);
        const subMatch = (mat.subject || '').toLowerCase().includes(q);
        const examMatch = (mat.examName || '').toLowerCase().includes(q);
        const classMatch = (mat.classLevel || '').toLowerCase().includes(q);
        const tagMatch = (mat.tags || []).some(t => t.toLowerCase().includes(q));

        if (!titleMatch && !fileMatch && !descMatch && !subMatch && !examMatch && !classMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allAvailableMaterials, selectedClass, selectedSubject, selectedType, searchQuery]);

  const handleDownload = (e: React.MouseEvent, material: StudyMaterial) => {
    e.stopPropagation();
    incrementMaterialCounter(material.id, 'download');

    const driveUrl = material.googleDriveUrl || getDrivePreviewUrl(material.googleDriveUrl, material.googleDriveFileId);
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClass('all');
    setSelectedSubject('all');
    setSelectedType('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedClass !== 'all' || selectedSubject !== 'all' || selectedType !== 'all';

  return (
    <section id="all-files-repository" className="py-14 sm:py-20 px-4 sm:px-6 bg-white dark:bg-slate-950 transition-colors border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-red-200 dark:border-red-900">
              <FolderCheck className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
              <span>Complete Study Repository • All Files Open</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              All Available Files & Study Materials
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Browse, view, and directly download every study document, textbook, chapter notes, worksheet, and MDP project uploaded to the portal.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'grid'
                    ? 'bg-red-900 text-amber-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'table'
                    ? 'bg-red-900 text-amber-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Directory List Table View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Directory List</span>
              </button>
            </div>

            <Link
              to="/study-materials"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <span>Advanced Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all files by title, file name, subject, or chapter..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-red-700 focus:ring-1 focus:ring-red-700 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Subject Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700 shadow-2xs cursor-pointer"
              >
                <option value="all">All Subjects ({availableSubjects.length})</option>
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Material Type Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700 shadow-2xs cursor-pointer"
              >
                <option value="all">All Material Types ({availableTypes.length})</option>
                {availableTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Reset Filters Button */}
            <div className="lg:col-span-1 flex items-center justify-end">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full py-2.5 px-3 bg-red-100 dark:bg-red-950/80 hover:bg-red-200 text-red-900 dark:text-amber-300 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              ) : (
                <div className="w-full py-2.5 text-center text-xs font-semibold text-slate-400">
                  {filteredMaterials.length} Files
                </div>
              )}
            </div>
          </div>

          {/* Quick Class Filter Tabs */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>Class:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedClass('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedClass === 'all'
                  ? 'bg-red-900 text-amber-300 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All Classes ({allAvailableMaterials.length})
            </button>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => {
              const count = allAvailableMaterials.filter(m => normalizeClass(m.classLevel) === `Class ${c}`).length;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedClass(String(c))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedClass === String(c)
                      ? 'bg-red-900 text-amber-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Class {c} <span className="opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Showing <strong className="text-slate-900 dark:text-white font-black">{filteredMaterials.length}</strong> available files in portal
            </span>
          </div>

          {filteredMaterials.length !== allAvailableMaterials.length && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-red-800 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              Clear filters to view all {allAvailableMaterials.length} files
            </button>
          )}
        </div>

        {/* Empty state */}
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No matching study files found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Try adjusting your search keyword, class, or subject filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW - Visual cards for all available files */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((mat) => {
              const hasDrive = Boolean(mat.googleDriveUrl || mat.googleDriveFileId);

              return (
                <div
                  key={mat.id}
                  onClick={() => navigate(`/material/${mat.id}`)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900 rounded-2xl p-5 shadow-xs hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-red-900 text-amber-300">
                        {mat.classLevel}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
                        {mat.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {normalizeMaterialType(mat.materialType)}
                      </span>
                      {hasDrive && (
                        <span className="ml-auto inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          <HardDrive className="w-3 h-3" />
                          <span>Drive File</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-800 dark:group-hover:text-amber-400 transition-colors mb-2">
                      {mat.title}
                    </h3>

                    {/* Dynamic Exam / Chapter Subtitle */}
                    {mat.examName && (
                      <p className="text-xs text-red-800 dark:text-amber-400 font-medium line-clamp-1 mb-2">
                        {mat.examName}
                      </p>
                    )}

                    {/* Description preview */}
                    {mat.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {mat.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer with Direct Download */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                      <FileText className="w-3.5 h-3.5 shrink-0 text-red-800 dark:text-amber-400" />
                      <span className="truncate font-medium">{mat.fileName || `${mat.title}.pdf`}</span>
                      {mat.fileSize && <span className="shrink-0 font-normal">({mat.fileSize})</span>}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => handleDownload(e, mat)}
                        className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-amber-300 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        title="Download file directly"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/material/${mat.id}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
                        title="View Document Details & Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE / DIRECTORY LIST VIEW - Scannable list of all files */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    <th className="py-3 px-4">Document / File Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredMaterials.map((mat) => {
                    return (
                      <tr 
                        key={mat.id}
                        onClick={() => navigate(`/material/${mat.id}`)}
                        className="hover:bg-red-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-start space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white group-hover:text-red-800 dark:group-hover:text-amber-400 transition-colors truncate max-w-xs sm:max-w-md">
                                {mat.title}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs sm:max-w-md">
                                {mat.fileName || `${mat.title}.pdf`}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-900 text-amber-300">
                            {mat.classLevel}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-300">
                          {mat.subject}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {normalizeMaterialType(mat.materialType)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-medium">
                          {mat.fileSize || 'Standard PDF'}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={(e) => handleDownload(e, mat)}
                              className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/material/${mat.id}`);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
                              title="View Document Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

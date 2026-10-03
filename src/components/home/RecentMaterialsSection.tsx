import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Eye, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  FolderCheck,
  Layers
} from 'lucide-react';
import { StudyMaterial } from '../../types';
import { 
  normalizeClass, 
  normalizeSubject, 
  normalizeMaterialType, 
  formatDate, 
  getDrivePreviewUrl, 
  createSlug,
  isOlympiadMaterial 
} from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';

interface RecentMaterialsSectionProps {
  materials: StudyMaterial[];
}

export const RecentMaterialsSection: React.FC<RecentMaterialsSectionProps> = ({ materials }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Filter out unpublished and Olympiad materials (Olympiad has its own section)
  const eligibleMaterials = useMemo(() => {
    return materials
      .filter(m => m.isPublished && !isOlympiadMaterial(m))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [materials]);

  // Apply class filter if selected
  const displayedMaterials = useMemo(() => {
    if (selectedClass === 'all') {
      return eligibleMaterials.slice(0, 6);
    }
    return eligibleMaterials
      .filter(m => normalizeClass(m.classLevel) === `Class ${selectedClass}`)
      .slice(0, 6);
  }, [eligibleMaterials, selectedClass]);

  const handleDownload = (e: React.MouseEvent, material: StudyMaterial) => {
    e.stopPropagation();
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

  if (eligibleMaterials.length === 0) {
    return null;
  }

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white dark:bg-slate-950 transition-colors border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200 dark:border-emerald-900">
              <FolderCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Repository Updates</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Latest Uploaded Study Materials
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Newly uploaded NCERT textbooks, chapter solution guides, worksheets, and project files ready for instant viewing and offline download.
            </p>
          </div>

          <Link
            to="/study-materials"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-amber-300 text-xs font-bold transition shadow-xs self-start md:self-auto cursor-pointer"
          >
            <span>View All Repository</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Class Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          <button
            onClick={() => setSelectedClass('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              selectedClass === 'all'
                ? 'bg-red-900 text-amber-300 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Classes ({eligibleMaterials.length})
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => {
            const count = eligibleMaterials.filter(m => normalizeClass(m.classLevel) === `Class ${c}`).length;
            if (count === 0 && selectedClass !== String(c)) return null;
            return (
              <button
                key={c}
                onClick={() => setSelectedClass(String(c))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedClass === String(c)
                    ? 'bg-red-900 text-amber-300 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Class {c} ({count})
              </button>
            );
          })}
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedMaterials.map((mat) => {
            const classDigits = (mat.classLevel || '').replace(/\D/g, '') || '5';
            const subjectSlug = createSlug(mat.subject);
            const typeSlug = createSlug(mat.materialType);

            return (
              <div
                key={mat.id}
                onClick={() => navigate(`/material/${mat.id}`)}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
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

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 truncate max-w-[180px]">
                    <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{mat.fileName || 'Verified File'}</span>
                    {mat.fileSize && <span className="shrink-0">• {mat.fileSize}</span>}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleDownload(e, mat)}
                      className="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-900 dark:text-amber-300 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      title="Direct Download / View"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                    <span className="p-1.5 text-slate-400 hover:text-red-800 dark:hover:text-amber-300 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

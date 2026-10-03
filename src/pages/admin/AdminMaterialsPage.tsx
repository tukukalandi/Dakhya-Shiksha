import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { StudyMaterial } from '../../types';
import { 
  fetchStudyMaterials, 
  deleteStudyMaterialDoc, 
  saveStudyMaterialDoc,
  subscribeMaterialsUpdate
} from '../../lib/firebase';
import { 
  normalizeClass, 
  normalizeSubject, 
  normalizeMaterialType, 
  formatDate 
} from '../../lib/utils';

export const AdminMaterialsPage: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    // Instant load (0ms from cache)
    fetchStudyMaterials().then(data => {
      setMaterials(data);
      setLoading(false);
    });

    const unsubscribe = subscribeMaterialsUpdate((updated) => {
      setMaterials(updated);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleTogglePublish = async (material: StudyMaterial) => {
    const updated = {
      ...material,
      isPublished: !material.isPublished,
      updatedAt: new Date().toISOString()
    };
    await saveStudyMaterialDoc(updated);
    setMaterials(prev => prev.map(m => m.id === material.id ? updated : m));
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteStudyMaterialDoc(id);
      setMaterials(prev => prev.filter(m => m.id !== id));
    }
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      if (classFilter && normalizeClass(m.classLevel) !== normalizeClass(classFilter)) {
        return false;
      }
      if (statusFilter === 'published' && !m.isPublished) return false;
      if (statusFilter === 'draft' && m.isPublished) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = m.title.toLowerCase().includes(q);
        const inSubj = (m.subject || '').toLowerCase().includes(q);
        const inCode = (m.code || '').toLowerCase().includes(q);
        const inType = (m.materialType || '').toLowerCase().includes(q);
        if (!inTitle && !inSubj && !inCode && !inType) return false;
      }

      return true;
    });
  }, [materials, search, classFilter, statusFilter]);

  const totalPages = Math.ceil(filteredMaterials.length / pageSize) || 1;
  const paginatedMaterials = filteredMaterials.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Study Materials Repository
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage, publish, edit and preview NCERT books, question papers, and study guides.
          </p>
        </div>

        <Link
          to="/admin/study-materials/add"
          className="px-4 py-2 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Study Material</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by title, subject, code..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="">All Classes</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
              <option key={c} value={`Class ${c}`}>Class {c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {(search || classFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setClassFilter('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
              className="text-xs font-bold text-red-700 dark:text-amber-400 hover:underline px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-3">Class</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Exam Type</th>
                <th className="py-3 px-3">Academic Year</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading study materials...
                  </td>
                </tr>
              ) : paginatedMaterials.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No study materials found matching filters.
                  </td>
                </tr>
              ) : (
                paginatedMaterials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 dark:text-white truncate" title={mat.title}>
                        {mat.title}
                      </p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                        {mat.code && <span className="font-mono text-amber-600 dark:text-amber-400">{mat.code}</span>}
                        {mat.examName && <span>• {mat.examName}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {mat.classLevel}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {mat.subject}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {normalizeMaterialType(mat.materialType)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {mat.examType || 'General'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {mat.academicYear || '—'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(mat)}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          mat.isPublished
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {mat.isPublished ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{mat.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {formatDate(mat.updatedAt || mat.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Link
                          to={`/material/${mat.id}`}
                          target="_blank"
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          title="Preview Material Page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/admin/study-materials/edit/${mat.id}`}
                          className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          title="Edit Material"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(mat.id, mat.title)}
                          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 hover:text-red-800 dark:text-red-400 cursor-pointer"
                          title="Delete Material"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {paginatedMaterials.length} of {filteredMaterials.length} materials
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded disabled:opacity-40 font-bold"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded disabled:opacity-40 font-bold"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Play, 
  CheckCircle2, 
  XCircle, 
  X, 
  Save, 
  AlertCircle,
  Video as VideoIcon
} from 'lucide-react';
import { Video } from '../../types';
import { 
  fetchVideos, 
  saveVideoDoc, 
  deleteVideoDoc 
} from '../../lib/firebase';
import { 
  createSlug, 
  getYouTubeEmbedUrl, 
  formatDate,
  normalizeSubject 
} from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const AdminVideosPage: React.FC = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<Partial<Video>>({
    categoryType: 'Class',
    classOrExam: 'Class 5',
    subject: 'Mathematics',
    chapter: 'Fractions',
    title: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '',
    description: '',
    status: 'published'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchVideos();
      setVideos(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setFormData({
      categoryType: 'Class',
      classOrExam: 'Class 5',
      subject: 'Mathematics',
      chapter: '',
      title: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: '',
      description: '',
      status: 'published'
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (video: Video) => {
    setFormData(video);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryType) {
      setError('Category is required.');
      return;
    }
    if (!formData.classOrExam?.trim()) {
      setError('Class / Exam is required.');
      return;
    }
    if (!formData.subject?.trim()) {
      setError('Subject is required.');
      return;
    }
    if (!formData.chapter?.trim()) {
      setError('Chapter is required.');
      return;
    }
    if (!formData.title?.trim()) {
      setError('Video title is required.');
      return;
    }
    if (!formData.videoUrl?.trim()) {
      setError('Video URL is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const now = new Date().toISOString();
      const videoDoc: Video = {
        id: formData.id || `vid-${Date.now()}`,
        categoryType: formData.categoryType,
        classOrExam: formData.classOrExam.trim(),
        subject: formData.subject.trim(),
        chapter: formData.chapter.trim(),
        title: formData.title.trim(),
        videoUrl: formData.videoUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl?.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        duration: formData.duration?.trim() || '15:00',
        description: formData.description?.trim() || '',
        status: formData.status || 'published',
        createdAt: formData.createdAt || now,
        updatedAt: now,
        uploadedBy: formData.uploadedBy || user?.email || 'Faculty Admin',
        isDemo: formData.isDemo || false
      };

      await saveVideoDoc(videoDoc);
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to save video.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete video "${title}"?`)) {
      await deleteVideoDoc(id);
      setVideos(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleToggleStatus = async (video: Video) => {
    const nextStatus = video.status === 'published' || video.status === 'active' ? 'disabled' : 'published';
    const updated = { ...video, status: nextStatus as any, updatedAt: new Date().toISOString() };
    await saveVideoDoc(updated);
    setVideos(prev => prev.map(v => v.id === video.id ? updated : v));
  };

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      if (categoryFilter && v.categoryType !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = v.title.toLowerCase().includes(q);
        const inClass = v.classOrExam.toLowerCase().includes(q);
        const inSubj = v.subject.toLowerCase().includes(q);
        const inChap = v.chapter.toLowerCase().includes(q);
        if (!inTitle && !inClass && !inSubj && !inChap) return false;
      }
      return true;
    });
  }, [videos, search, categoryFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Video Corner Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload, edit, categorize and organize chapter-wise video lectures and tutorials.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Video</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject, chapter..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="">All Categories</option>
            <option value="Class">School Class</option>
            <option value="Olympiad">Olympiad</option>
            <option value="Competitive Exams">Competitive Exams</option>
          </select>

          {(search || categoryFilter) && (
            <button
              onClick={() => { setSearch(''); setCategoryFilter(''); }}
              className="text-xs font-bold text-red-700 dark:text-amber-400 hover:underline px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Video Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Class / Exam</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Chapter</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading video lessons...
                  </td>
                </tr>
              ) : filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No videos found. Click "Add New Video" to publish one.
                  </td>
                </tr>
              ) : (
                filteredVideos.map(video => (
                  <tr key={video.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 dark:text-white truncate" title={video.title}>
                        {video.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono truncate block max-w-xs">
                        {video.videoUrl}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {video.categoryType}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {video.classOrExam}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {video.subject}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium">
                      {video.chapter}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {video.duration || '—'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(video)}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          video.status === 'published' || video.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {video.status === 'published' || video.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Enabled</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setPreviewVideo(video)}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                          title="Preview Video"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(video)}
                          className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-600 hover:text-blue-800 dark:text-blue-400 cursor-pointer"
                          title="Edit Video"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(video.id, video.title)}
                          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 hover:text-red-800 dark:text-red-400 cursor-pointer"
                          title="Delete Video"
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
      </div>

      {/* Add / Edit Video Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {formData.id ? 'Edit Video Details' : 'Add New Educational Video'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-900 text-red-800 dark:text-red-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Category Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category Type *
                  </label>
                  <select
                    value={formData.categoryType || 'Class'}
                    onChange={(e) => setFormData({ ...formData, categoryType: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="Class">School Class</option>
                    <option value="Olympiad">Olympiad</option>
                    <option value="Competitive Exams">Competitive Exams</option>
                  </select>
                </div>

                {/* Class or Exam */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class / Exam *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.classOrExam || ''}
                    onChange={(e) => setFormData({ ...formData, classOrExam: e.target.value })}
                    placeholder="e.g. Class 5, TET, Olympiad Class 5"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Mathematics, Science"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                {/* Chapter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Chapter Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.chapter || ''}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    placeholder="e.g. Fractions, Matter"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Video Title *
                </label>
                <input
                  required
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Class 5 Mathematics: Fractions Part 1"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Video URL (YouTube or MP4/WebM) *
                </label>
                <input
                  required
                  type="url"
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 15:30"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden font-mono"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || 'published'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="published">Published</option>
                    <option value="disabled">Disabled / Draft</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Thumbnail Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.thumbnailUrl || ''}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lesson Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief synopsis of what is taught in this episode..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-4 bg-slate-800 flex items-center justify-between text-white">
              <h3 className="text-sm font-bold truncate pr-4">{previewVideo.title}</h3>
              <button onClick={() => setPreviewVideo(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              {getYouTubeEmbedUrl(previewVideo.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(previewVideo.videoUrl)!}
                  title={previewVideo.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <video src={previewVideo.videoUrl} controls className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

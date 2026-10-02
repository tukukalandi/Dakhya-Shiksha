import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Code, 
  Upload, 
  X, 
  Save, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Quiz } from '../../types';
import { fetchQuizzes, saveQuizDoc, deleteQuizDoc } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../lib/utils';

export const AdminQuizzesPage: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const defaultHtmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; background: #fff8f8; padding: 24px; color: #1e293b; }
    .quiz-card { background: white; border-radius: 12px; padding: 24px; max-width: 600px; margin: auto; border-top: 5px solid #991b1b; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    h2 { color: #991b1b; margin-top: 0; }
    .q-box { margin-bottom: 20px; }
    .btn { display: block; width: 100%; text-align: left; padding: 10px; margin: 6px 0; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; cursor: pointer; }
    .btn:hover { background: #fee2e2; }
    .correct { background: #dcfce7 !important; border-color: #22c55e !important; color: #15803d; font-weight: bold; }
    .wrong { background: #fee2e2 !important; border-color: #ef4444 !important; color: #991b1b; }
  </style>
</head>
<body>
  <div class="quiz-card">
    <h2>Chapter Assessment Quiz</h2>
    <div class="q-box">
      <p><strong>1. Sample Question: What is the primary concept?</strong></p>
      <button class="btn" onclick="check(this, true)">Option A (Correct)</button>
      <button class="btn" onclick="check(this, false)">Option B</button>
      <button class="btn" onclick="check(this, false)">Option C</button>
    </div>
  </div>
  <script>
    function check(btn, ok) {
      btn.parentElement.querySelectorAll('button').forEach(b => b.disabled = true);
      btn.className = ok ? 'btn correct' : 'btn wrong';
    }
  </script>
</body>
</html>`;

  const [formData, setFormData] = useState<Partial<Quiz>>({
    title: '',
    classLevel: 'Class 5',
    subject: 'Math',
    chapter: '',
    topic: '',
    htmlContent: defaultHtmlTemplate,
    isPublished: true
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchQuizzes();
      setQuizzes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setFormData({
      title: '',
      classLevel: 'Class 5',
      subject: 'Math',
      chapter: '',
      topic: '',
      htmlContent: defaultHtmlTemplate,
      isPublished: true
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (quiz: Quiz) => {
    setFormData(quiz);
    setError('');
    setModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setFormData(prev => ({
            ...prev,
            htmlContent: text,
            title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
          }));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setError('Title is required.');
      return;
    }
    if (!formData.classLevel) {
      setError('Class is required.');
      return;
    }
    if (!formData.subject?.trim()) {
      setError('Subject is required.');
      return;
    }
    if (!formData.htmlContent?.trim()) {
      setError('HTML Quiz code is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const now = new Date().toISOString();
      const quizDoc: Quiz = {
        id: formData.id || `quiz-${Date.now()}`,
        title: formData.title.trim(),
        classLevel: formData.classLevel,
        subject: formData.subject.trim(),
        chapter: formData.chapter?.trim() || '',
        topic: formData.topic?.trim() || '',
        htmlContent: formData.htmlContent,
        isPublished: formData.isPublished ?? true,
        createdAt: formData.createdAt || now,
        updatedAt: now,
        uploadedBy: formData.uploadedBy || user?.email || 'Quiz Admin',
        isDemo: formData.isDemo || false
      };

      await saveQuizDoc(quizDoc);
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete quiz "${title}"?`)) {
      await deleteQuizDoc(id);
      setQuizzes(prev => prev.filter(q => q.id !== id));
    }
  };

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const inTitle = q.title.toLowerCase().includes(query);
        const inClass = q.classLevel.toLowerCase().includes(query);
        const inSubj = q.subject.toLowerCase().includes(query);
        const inChap = (q.chapter || '').toLowerCase().includes(query);
        if (!inTitle && !inClass && !inSubj && !inChap) return false;
      }
      return true;
    });
  }, [quizzes, search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Interactive Quiz Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload HTML quiz files or live edit code. Sandboxed for complete layout safety.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Quiz</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes by title, class, topic..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Quiz Title</th>
                <th className="py-3 px-3">Class</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Chapter</th>
                <th className="py-3 px-3">Topic</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading quizzes...
                  </td>
                </tr>
              ) : filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No quizzes found. Click "Add New Quiz" to upload or create one.
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map(quiz => (
                  <tr key={quiz.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {quiz.title}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {quiz.classLevel}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {quiz.subject}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {quiz.chapter || '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {quiz.topic || '—'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        quiz.isPublished ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {formatDate(quiz.updatedAt || quiz.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setPreviewQuiz(quiz)}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                          title="Preview HTML Quiz"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(quiz)}
                          className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-600 hover:text-blue-800 dark:text-blue-400 cursor-pointer"
                          title="Edit Quiz & Source Code"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(quiz.id, quiz.title)}
                          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 hover:text-red-800 dark:text-red-400 cursor-pointer"
                          title="Delete Quiz"
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

      {/* Add / Edit Quiz Modal with HTML Code Editor */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {formData.id ? 'Edit Quiz & HTML Code' : 'Upload or Create HTML Quiz'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quiz Title *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Class 5 Mathematics: Fractions Interactive Quiz"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                {/* Class */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class Level *
                  </label>
                  <select
                    value={formData.classLevel || 'Class 5'}
                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                      <option key={c} value={`Class ${c}`}>Class {c}</option>
                    ))}
                  </select>
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
                    placeholder="e.g. Math, Science, English"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                {/* Chapter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Chapter Name
                  </label>
                  <input
                    type="text"
                    value={formData.chapter || ''}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    placeholder="e.g. Fractions, Matter"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={formData.topic || ''}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Equivalent fractions"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Upload HTML File Input */}
              <div className="bg-amber-50/70 dark:bg-slate-800/80 p-3 rounded-xl border border-amber-300/80 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Upload HTML File (Automatic Source Extraction)
                  </span>
                </div>
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-red-950 hover:file:bg-amber-300 cursor-pointer"
                />
              </div>

              {/* HTML Code Editor (Section 28) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    HTML Source Code (Live Code Editor) *
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Sandboxed in safe iframe
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={formData.htmlContent || ''}
                  onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                  placeholder="<!DOCTYPE html><html>...</html>"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl focus:outline-hidden focus:border-red-700 leading-relaxed"
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
                  <span>{saving ? 'Saving...' : 'Save & Publish Quiz'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HTML Quiz Sandbox Preview Modal (Section 29) */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-3 bg-red-950 text-white flex items-center justify-between border-b-2 border-amber-400">
              <span className="text-xs font-bold truncate">Sandbox Preview: {previewQuiz.title}</span>
              <button onClick={() => setPreviewQuiz(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                srcDoc={previewQuiz.htmlContent}
                title="Preview"
                sandbox="allow-scripts allow-forms allow-same-origin"
                className="w-full h-full border-0 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  CheckCircle2, 
  ExternalLink, 
  HelpCircle, 
  Layers, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { StudyMaterial } from '../../types';
import { 
  fetchStudyMaterials, 
  saveStudyMaterialDoc 
} from '../../lib/firebase';
import { 
  extractDriveFileId, 
  normalizeMaterialType, 
  normalizeSubject, 
  normalizeClass 
} from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const AdminMaterialFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Partial<StudyMaterial>>({
    title: '',
    description: '',
    classLevel: 'Class 5',
    subject: 'Math',
    examType: 'School Examination',
    examName: '',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: '',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    googleDriveFileId: '',
    thumbnailUrl: '',
    tags: [],
    isPublished: true,
  });

  const [tagInput, setTagInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(isEditing);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isEditing && id) {
      fetchStudyMaterials().then(list => {
        const found = list.find(m => m.id === id);
        if (found) {
          setFormData(found);
          setTagInput((found.tags || []).join(', '));
        } else {
          setError('Study material not found.');
        }
        setLoading(false);
      });
    }
  }, [isEditing, id]);

  // Section 9 & 10 Dynamic Label computation:
  // For NCERT Book: label must be "Chapter No."
  // When Exam Type is "School Examination" or "Olympiad Exam": label must be "Chapter Name / Chapter No."
  // Otherwise retain: "Exam Name"
  const getDynamicFieldLabel = () => {
    const normType = normalizeMaterialType(formData.materialType);
    if (normType === 'NCERT Book') {
      return 'Chapter No.';
    }
    if (formData.examType === 'School Examination' || formData.examType === 'Olympiad Exam') {
      return 'Chapter Name / Chapter No.';
    }
    return 'Exam Name';
  };

  const getDynamicFieldPlaceholder = () => {
    const normType = normalizeMaterialType(formData.materialType);
    if (normType === 'NCERT Book') {
      return 'e.g., Chapter 1, Chapter 2, 1, 2...';
    }
    if (formData.examType === 'School Examination' || formData.examType === 'Olympiad Exam') {
      return 'e.g., Chapter 1: Fractions, Term Assessment...';
    }
    return 'e.g., Annual Board Exam 2026';
  };

  const handleDriveUrlChange = (url: string) => {
    const extracted = extractDriveFileId(url);
    setFormData(prev => ({
      ...prev,
      googleDriveUrl: url,
      googleDriveFileId: extracted || prev.googleDriveFileId
    }));
  };

  const handleSubmit = async (publishStatus: boolean) => {
    if (!formData.title?.trim()) {
      setError('Please provide a material title.');
      return;
    }
    if (!formData.classLevel) {
      setError('Please select a target class.');
      return;
    }
    if (!formData.subject) {
      setError('Please select a subject.');
      return;
    }
    if (!formData.googleDriveUrl?.trim()) {
      setError('Please provide a valid Google Drive URL.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const parsedTags = tagInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const now = new Date().toISOString();
      const materialDoc: StudyMaterial = {
        id: formData.id || `mat-${Date.now()}`,
        code: formData.code || `MAT-${formData.classLevel?.replace(/\s+/g, '')}-${formData.subject?.toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        classLevel: formData.classLevel,
        subject: formData.subject,
        examType: formData.examType || 'School Examination',
        examName: formData.examName?.trim() || '',
        materialType: normalizeMaterialType(formData.materialType) || 'NCERT Book',
        academicYear: formData.academicYear || '2025-2026',
        language: formData.language || 'English',
        fileName: formData.fileName?.trim() || `${formData.title.trim()}.pdf`,
        googleDriveUrl: formData.googleDriveUrl.trim(),
        googleDriveFileId: formData.googleDriveFileId?.trim() || extractDriveFileId(formData.googleDriveUrl),
        thumbnailUrl: formData.thumbnailUrl?.trim() || '',
        uploadedBy: formData.uploadedBy || user?.email || 'Administrator',
        createdAt: formData.createdAt || now,
        updatedAt: now,
        isPublished: publishStatus,
        downloadCount: formData.downloadCount || 0,
        viewCount: formData.viewCount || 0,
        tags: parsedTags,
        isDemo: formData.isDemo || false
      };

      await saveStudyMaterialDoc(materialDoc);
      navigate('/admin/study-materials');
    } catch (err: any) {
      setError(err?.message || 'Failed to save material.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto mb-2" />
        <span>Loading study material details...</span>
      </div>
    );
  }

  const dynamicLabel = getDynamicFieldLabel();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/study-materials')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-800 dark:hover:text-amber-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Materials</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(true)}
            className="px-5 py-2 bg-red-900 hover:bg-red-800 text-amber-300 text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Update & Publish' : 'Publish Material'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isEditing ? 'Edit Study Material' : 'Add New Study Material'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in metadata, curriculum classification and Google Drive repository storage link.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-900 text-red-800 dark:text-red-300 text-xs rounded-xl flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(true); }} className="space-y-8">
          {/* SECTION 1: Basic Information */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-red-800 dark:text-amber-400 mb-4 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-800 dark:bg-amber-400"></span>
              <span>1. Basic Curriculum Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Material Title *
                </label>
                <input
                  required
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Class 5 Mathematics Chapter 1 Shapes and Angles (NCERT Book)"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700"
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
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
                <select
                  value={formData.subject || 'Math'}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Math">Math (Mathematics)</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="TWAU">TWAU</option>
                  <option value="Science">Science</option>
                  <option value="Odia">Odia</option>
                  <option value="Social Science">Social Science</option>
                  <option value="Computer">Computer</option>
                  <option value="General Knowledge">General Knowledge</option>
                  <option value="Reasoning">Reasoning</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Multi Disciplinary Project (MDP)">Multi Disciplinary Project (MDP)</option>
                  <option value="Project Based Learning (PBL)">Project Based Learning (PBL)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Material Type (Includes NCERT Book, with legacy 'Chapter' mapping) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Material Type / Category *
                </label>
                <select
                  value={normalizeMaterialType(formData.materialType) || 'NCERT Book'}
                  onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="NCERT Book">NCERT Book (Official Textbook Chapters)</option>
                  <option value="Study Notes">Study Notes</option>
                  <option value="Chapter Notes">Chapter Notes</option>
                  <option value="Question Papers">Question Papers</option>
                  <option value="Previous Year Papers">Previous Year Papers</option>
                  <option value="Model Papers">Model Papers</option>
                  <option value="Practice Papers">Practice Papers</option>
                  <option value="Sample Papers">Sample Papers</option>
                  <option value="Mock Tests">Mock Tests</option>
                  <option value="Worksheets">Worksheets</option>
                  <option value="Answer Keys">Answer Keys</option>
                  <option value="Solutions">Solutions</option>
                  <option value="Revision Notes">Revision Notes</option>
                  <option value="Important Questions">Important Questions</option>
                  <option value="Syllabus">Syllabus</option>
                </select>
              </div>

              {/* Exam Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Type
                </label>
                <select
                  value={formData.examType || 'School Examination'}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="School Examination">School Examination</option>
                  <option value="Olympiad Exam">Olympiad Exam</option>
                  <option value="Board Examination">Board Examination</option>
                  <option value="Competitive Exam">Competitive Exam</option>
                  <option value="General Curriculum">General Curriculum</option>
                </select>
              </div>

              {/* Dynamic Field: Chapter No. / Chapter Name / Exam Name */}
              <div className="md:col-span-2 bg-amber-50/70 dark:bg-slate-800/80 p-3.5 rounded-xl border border-amber-300 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-red-950 dark:text-amber-300">
                    {dynamicLabel}
                  </label>
                  <span className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
                    (Auto-adapted according to Category & Exam selection)
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.examName || ''}
                  onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                  placeholder={getDynamicFieldPlaceholder()}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700"
                />
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Year
                </label>
                <select
                  value={formData.academicYear || '2025-2026'}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="2026-2027">2026–2027</option>
                  <option value="2025-2026">2025–2026</option>
                  <option value="2024-2025">2024–2025</option>
                  <option value="2023-2024">2023–2024</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Medium / Language
                </label>
                <select
                  value={formData.language || 'English'}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                  <option value="Bilingual">Bilingual</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Overview & Chapter Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key concepts covered in this chapter, question patterns, formulas or learning objectives..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Google Drive & File Information */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-black uppercase tracking-wider text-red-800 dark:text-amber-400 mb-4 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-800 dark:bg-amber-400"></span>
              <span>2. Google Drive Storage & File Information</span>
            </h2>

            {/* Folder helper notice */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
              <div>
                <span className="font-bold">Official Repository Folder: </span>
                <span className="text-[11px] text-blue-700 dark:text-blue-300">Dakshya Shiksha Cloud Drive</span>
              </div>
              <a
                href="https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[11px] transition"
              >
                <span>Open Drive Folder</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Google Drive URL */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Drive URL *
                </label>
                <input
                  required
                  type="url"
                  value={formData.googleDriveUrl || ''}
                  onChange={(e) => handleDriveUrlChange(e.target.value)}
                  placeholder="https://drive.google.com/file/d/FILE_ID/view or shared link"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700 font-mono"
                />
              </div>

              {/* Google Drive File ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Drive File ID (Auto-extracted)
                </label>
                <input
                  type="text"
                  value={formData.googleDriveFileId || ''}
                  onChange={(e) => setFormData({ ...formData, googleDriveFileId: e.target.value })}
                  placeholder="e.g. 1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden font-mono"
                />
              </div>

              {/* Original File Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Display File Name
                </label>
                <input
                  type="text"
                  value={formData.fileName || ''}
                  onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                  placeholder="e.g. Class_5_Math_Chapter_1.pdf"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden font-mono"
                />
              </div>

              {/* Thumbnail URL */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cover Image / Thumbnail URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.thumbnailUrl || ''}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... or uploaded preview image"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Additional Metadata & Tags */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-black uppercase tracking-wider text-red-800 dark:text-amber-400 mb-4 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-800 dark:bg-amber-400"></span>
              <span>3. Publishing & Search Tags</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Math, Class 5, NCERT Book, Fractions, Shapes, Exam Prep"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Status Radio */}
              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="publishStatus"
                    checked={formData.isPublished === true}
                    onChange={() => setFormData({ ...formData, isPublished: true })}
                    className="text-red-700 focus:ring-red-700"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Published (Visible on Public Website)
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="publishStatus"
                    checked={formData.isPublished === false}
                    onChange={() => setFormData({ ...formData, isPublished: false })}
                    className="text-red-700 focus:ring-red-700"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Draft (Admin Only)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/study-materials')}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-red-900 hover:bg-red-800 text-amber-300 font-black text-xs rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Study Material'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  UploadCloud,
  FileCheck,
  Trash2,
  Paperclip,
  Link2,
  FolderCheck,
  Check
} from 'lucide-react';
import { StudyMaterial } from '../../types';
import { 
  fetchStudyMaterials, 
  saveStudyMaterialDoc,
  getCachedDriveAccessToken
} from '../../lib/firebase';
import { 
  uploadFileToGoogleDrive, 
  connectGoogleDrive, 
  OFFICIAL_REPO_FOLDER_ID, 
  OFFICIAL_REPO_FOLDER_URL 
} from '../../lib/googleDrive';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    fileSize: '',
    fileDataUrl: '',
    googleDriveUrl: OFFICIAL_REPO_FOLDER_URL,
    googleDriveFileId: OFFICIAL_REPO_FOLDER_ID,
    thumbnailUrl: '',
    tags: [],
    isPublished: true,
  });

  const [uploadMode, setUploadMode] = useState<'upload' | 'drive'>('upload');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [driveConnecting, setDriveConnecting] = useState<boolean>(false);
  const [driveConnected, setDriveConnected] = useState<boolean>(Boolean(getCachedDriveAccessToken()));
  const [driveUploadStatus, setDriveUploadStatus] = useState<string>('');

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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleConnectDrive = async () => {
    setDriveConnecting(true);
    setError('');
    setDriveUploadStatus('Connecting to Google Drive...');
    try {
      await connectGoogleDrive();
      setDriveConnected(true);
      setDriveUploadStatus('Google Drive connected! Ready to upload files.');
    } catch (err: any) {
      setError(err?.message || 'Google Drive connection failed.');
      setDriveUploadStatus('');
    } finally {
      setDriveConnecting(false);
    }
  };

  const handleFileSelected = (file?: File | null) => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(15);
    setDriveUploadStatus('Reading file...');

    const cleanFileName = file.name;
    const formattedSize = formatFileSize(file.size);

    // Auto-generate title if empty
    let newTitle = formData.title || '';
    if (!newTitle.trim()) {
      newTitle = cleanFileName
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .trim();
    }

    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 40);
        setUploadProgress(percent);
      }
    };

    reader.onload = async () => {
      const dataUrl = reader.result as string;

      setFormData(prev => ({
        ...prev,
        fileName: cleanFileName,
        fileSize: formattedSize,
        fileDataUrl: dataUrl,
        title: newTitle,
        googleDriveUrl: prev.googleDriveUrl || OFFICIAL_REPO_FOLDER_URL,
        googleDriveFileId: prev.googleDriveFileId || OFFICIAL_REPO_FOLDER_ID
      }));

      // Check if user has active Google Drive connection to upload directly
      const token = getCachedDriveAccessToken();
      if (token) {
        setDriveUploadStatus('Uploading directly to Google Drive folder 1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO...');
        try {
          const driveResult = await uploadFileToGoogleDrive(file, cleanFileName, OFFICIAL_REPO_FOLDER_ID, (pct) => {
            setUploadProgress(40 + Math.round(pct * 0.6));
          });

          setFormData(prev => ({
            ...prev,
            googleDriveUrl: driveResult.webViewLink,
            googleDriveFileId: driveResult.fileId
          }));
          setDriveUploadStatus(`Uploaded to Google Drive (ID: ${driveResult.fileId})`);
        } catch (err: any) {
          console.warn('Drive upload error:', err);
          setDriveUploadStatus('File stored locally & linked to Drive folder.');
        }
      } else {
        setDriveUploadStatus('File ready. Connect Google Drive below to upload to cloud folder.');
      }

      setUploadProgress(100);
      setIsUploading(false);
    };

    reader.onerror = () => {
      setIsUploading(false);
      setError('Unable to read selected file. Please select a valid document.');
    };

    reader.readAsDataURL(file);
  };

  const handleSyncToDrive = async () => {
    if (!formData.fileDataUrl || !formData.fileName) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError('');
    setDriveUploadStatus('Uploading to Google Drive folder 1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO...');
    try {
      const res = await fetch(formData.fileDataUrl);
      const blob = await res.blob();
      const driveResult = await uploadFileToGoogleDrive(blob, formData.fileName, OFFICIAL_REPO_FOLDER_ID, (pct) => {
        setUploadProgress(pct);
      });
      setDriveConnected(true);
      setFormData(prev => ({
        ...prev,
        googleDriveUrl: driveResult.webViewLink,
        googleDriveFileId: driveResult.fileId
      }));
      setDriveUploadStatus(`Uploaded to Google Drive folder! (File ID: ${driveResult.fileId})`);
    } catch (err: any) {
      setError(err?.message || 'Google Drive upload error.');
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      fileName: '',
      fileSize: '',
      fileDataUrl: ''
    }));
    setDriveUploadStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDriveUrlChange = (url: string) => {
    const extracted = extractDriveFileId(url);
    setFormData(prev => ({
      ...prev,
      googleDriveUrl: url,
      googleDriveFileId: extracted || prev.googleDriveFileId
    }));
  };

  const handleConnectDefaultFolder = () => {
    setFormData(prev => ({
      ...prev,
      googleDriveUrl: OFFICIAL_REPO_FOLDER_URL,
      googleDriveFileId: OFFICIAL_REPO_FOLDER_ID
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
    if (!formData.googleDriveUrl?.trim() && !formData.fileDataUrl) {
      setError('Please either upload a file or connect a Google Drive link.');
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
      const finalDriveUrl = formData.googleDriveUrl?.trim() || OFFICIAL_REPO_FOLDER_URL;
      const finalDriveId = formData.googleDriveFileId?.trim() || extractDriveFileId(finalDriveUrl) || OFFICIAL_REPO_FOLDER_ID;

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
        fileSize: formData.fileSize || '',
        fileDataUrl: (formData.fileDataUrl && formData.fileDataUrl.length < 25000) ? formData.fileDataUrl : undefined,
        googleDriveUrl: finalDriveUrl,
        googleDriveFileId: finalDriveId,
        thumbnailUrl: formData.thumbnailUrl?.trim() || '',
        uploadedBy: formData.uploadedBy || user?.email || 'Administrator',
        createdAt: formData.createdAt || now,
        updatedAt: now,
        isPublished: publishStatus,
        downloadCount: formData.downloadCount || 0,
        viewCount: formData.viewCount || 0,
        tags: parsedTags,
        isDemo: false
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

          {/* SECTION 2: Google Drive Storage & File Information */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-800 dark:text-amber-400 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-800 dark:bg-amber-400"></span>
                <span>2. Upload File & Cloud Storage Connection</span>
              </h2>

              {/* Mode Toggle */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setUploadMode('upload')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    uploadMode === 'upload'
                      ? 'bg-red-900 text-amber-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('drive')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    uploadMode === 'drive'
                      ? 'bg-red-900 text-amber-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Connect Drive</span>
                </button>
              </div>
            </div>

            {/* Google Drive Account Connection Banner */}
            <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${driveConnected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}>
                  <FolderCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>Google Drive Integration</span>
                    {driveConnected ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Connected
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        Ready to Connect
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Designated Folder ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{OFFICIAL_REPO_FOLDER_ID}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-auto">
                {!driveConnected ? (
                  <button
                    type="button"
                    disabled={driveConnecting}
                    onClick={handleConnectDrive}
                    className="px-3.5 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-600 transition flex items-center space-x-2 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{driveConnecting ? 'Connecting...' : 'Connect Google Drive'}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <Check className="w-3.5 h-3.5" />
                    <span>Drive Connected</span>
                  </span>
                )}
                <a
                  href={OFFICIAL_REPO_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-xs"
                >
                  <span>Open Folder</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {uploadMode === 'upload' ? (
              <div className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFileSelected(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDragOver
                      ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-red-500 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.epub,.txt,.zip,image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelected(e.target.files[0]);
                      }
                    }}
                  />

                  {formData.fileName && (formData.fileDataUrl || formData.googleDriveUrl) ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                        {formData.fileName}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mb-3 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>File uploaded & linked to repository folder</span>
                        {formData.fileSize && <span>({formData.fileSize})</span>}
                      </div>

                      {driveUploadStatus && (
                        <div className="mb-3 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 text-[11px] font-medium">
                          {driveUploadStatus}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {!driveConnected ? (
                          <button
                            type="button"
                            onClick={handleConnectDrive}
                            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-red-950 text-xs font-bold rounded-lg transition cursor-pointer flex items-center space-x-1"
                          >
                            <span>Connect Drive & Sync</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSyncToDrive}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center space-x-1"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Upload to Drive Folder</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer"
                        >
                          Change File
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="px-3 py-1.5 bg-red-100 dark:bg-red-950 hover:bg-red-200 text-red-800 dark:text-red-300 text-xs font-bold rounded-lg transition cursor-pointer flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-400 flex items-center justify-center mb-3">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                        Click to upload or drag and drop your file
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                        PDF, Word (.docx), PPT, Worksheets, Images up to 25MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-4 py-2 bg-red-900 hover:bg-red-800 text-amber-300 text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Select File From Device</span>
                      </button>
                    </div>
                  )}

                  {isUploading && (
                    <div className="mt-4 max-w-xs mx-auto">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-red-700 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {driveUploadStatus || `Uploading file (${uploadProgress}%)...`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Google Drive URL *
                  </label>
                  <input
                    required
                    type="url"
                    value={formData.googleDriveUrl || ''}
                    onChange={(e) => handleDriveUrlChange(e.target.value)}
                    placeholder="https://drive.google.com/file/d/FILE_ID/view or folder link"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Paste a shared Google Drive link. The file ID will be automatically detected.
                  </p>
                </div>
              </div>
            )}

            {/* Common Details: Display File Name, Drive ID & Thumbnail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Drive File / Folder ID
                </label>
                <input
                  type="text"
                  value={formData.googleDriveFileId || ''}
                  onChange={(e) => setFormData({ ...formData, googleDriveFileId: e.target.value })}
                  placeholder="e.g. 1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cover Image / Thumbnail URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.thumbnailUrl || ''}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... or uploaded cover image"
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

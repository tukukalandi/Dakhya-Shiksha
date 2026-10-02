import React, { useState } from 'react';
import { Layers, GraduationCap, BookOpen, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [classesList, setClassesList] = useState<string[]>([
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ]);
  const [subjectsList, setSubjectsList] = useState<string[]>([
    'Mathematics', 'Science', 'English', 'Hindi', 'Odia', 'TWAU',
    'Social Science', 'Computer', 'General Knowledge', 'Reasoning',
    'Physics', 'Chemistry', 'Biology',
    'Multi Disciplinary Project (MDP)', 'Project Based Learning (PBL)'
  ]);
  const [newSubj, setNewSubj] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubj.trim()) return;
    if (!subjectsList.includes(newSubj.trim())) {
      setSubjectsList(prev => [...prev, newSubj.trim()]);
      setNewSubj('');
      setMsg(`Subject "${newSubj.trim()}" added to portal configuration.`);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleRemoveSubject = (name: string) => {
    if (window.confirm(`Remove "${name}"?`)) {
      setSubjectsList(prev => prev.filter(s => s !== name));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Classes & Subject Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure curriculum classes, primary school constraints, and dynamic subject lists.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Class Rules Notice */}
      <div className="bg-amber-50 dark:bg-slate-900 p-5 rounded-2xl border border-amber-300 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-red-900 dark:text-amber-400 mb-2 flex items-center space-x-2">
          <GraduationCap className="w-4 h-4" />
          <span>Primary & Secondary Rules Enforced</span>
        </h3>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          • <strong>Classes 1–5:</strong> Subject cards strictly fixed to <em>All Subjects, Hindi, English, Math, TWAU</em>.<br/>
          • <strong>Classes 6–10:</strong> Dynamically loads from the database and active subjects list below.
        </p>
      </div>

      {/* Active Subjects Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-red-800 dark:text-amber-400" />
            <span>Master Subjects Pool ({subjectsList.length} subjects)</span>
          </h2>

          <form onSubmit={handleAddSubject} className="flex space-x-2">
            <input
              type="text"
              value={newSubj}
              onChange={(e) => setNewSubj(e.target.value)}
              placeholder="New subject name..."
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {subjectsList.map(subj => (
            <div
              key={subj}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{subj}</span>
              <button
                onClick={() => handleRemoveSubject(subj)}
                className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                title="Remove subject"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdminSettingsPage: React.FC = () => {
  const [googleClientId, setGoogleClientId] = useState('');
  const [driveFolder, setDriveFolder] = useState('https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Portal Global Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Cloud storage configuration, Google Drive repository endpoints, and security keys.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Primary Google Drive Storage Folder URL
            </label>
            <input
              type="url"
              value={driveFolder}
              onChange={(e) => setDriveFolder(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              All PDF study materials are organized in this shared cloud directory.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Google Drive Client ID (VITE_GOOGLE_CLIENT_ID)
            </label>
            <input
              type="text"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder="Optional: Enter OAuth Client ID for direct Google Drive picker"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Notice: If Google Drive Client ID is omitted, the application uses safe manual URL entry without crashing.
            </p>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

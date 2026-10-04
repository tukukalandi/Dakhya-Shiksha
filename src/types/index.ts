export type Language = 'en' | 'hi' | 'or';
export type Theme = 'light' | 'dark';

export interface StudyMaterial {
  id: string;
  code?: string;
  title: string;
  description?: string;
  classLevel: string; // e.g. "Class 5"
  subject: string; // e.g. "Math"
  examType?: string; // "School Examination", "Olympiad Exam", "Board Exam", "Competitive", etc.
  examName?: string; // dynamic label: Chapter Name / Chapter No. for School/Olympiad, or Chapter No. for NCERT Book
  materialType: string; // "NCERT Book", "Study Notes", "Chapter Notes", "Question Papers", etc.
  academicYear?: string; // e.g. "2025-2026", "2026-2027"
  language?: string; // "English", "Hindi", "Odia", "Bilingual"
  fileName?: string;
  googleDriveUrl: string;
  googleDriveFileId?: string;
  thumbnailUrl?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  downloadCount: number;
  viewCount: number;
  tags?: string[];
  isDemo?: boolean;
}

export interface Video {
  id: string;
  categoryType: string; // "Class", "Competitive Exams", "Olympiad"
  classOrExam: string; // e.g. "Class 5", "TET", "SSC CGL", "Olympiad Class 5"
  subject: string; // e.g. "Mathematics"
  chapter: string; // e.g. "Fractions"
  title: string;
  videoUrl: string; // YouTube URL or direct MP4/WebM URL
  thumbnailUrl?: string;
  duration?: string;
  description?: string;
  status: 'published' | 'draft' | 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
  uploadedBy?: string;
  isDemo?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  classLevel: string;
  subject: string;
  chapter?: string;
  topic?: string;
  htmlContent: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: string;
  isDemo?: boolean;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  isActive: boolean;
  role: 'super_admin' | 'admin' | 'editor';
  createdAt: string;
}

export interface ConfigItem {
  id: string;
  name: string;
  code?: string;
  order?: number;
  classLevel?: string;
  isActive?: boolean;
}

export interface AdminStats {
  totalMaterials: number;
  publishedMaterials: number;
  draftMaterials: number;
  classesCount: number;
  subjectsCount: number;
  olympiadMaterials: number;
  totalViews: number;
  totalDownloads: number;
  totalVideos: number;
  totalQuizzes: number;
  recentMaterials: StudyMaterial[];
  recentVideos: Video[];
  recentQuizzes: Quiz[];
}

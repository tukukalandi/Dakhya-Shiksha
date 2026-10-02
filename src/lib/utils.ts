export function normalizeText(value?: string | null): string {
  if (!value) return '';
  return value.trim().toLowerCase();
}

export function normalizeClass(value?: string | null): string {
  if (!value) return '';
  const clean = value.trim();
  const match = clean.match(/\b([1-9]|10)\b/i);
  if (match) {
    return `Class ${match[1]}`;
  }
  return clean;
}

export function normalizeSubject(value?: string | null): string {
  if (!value) return '';
  const clean = value.trim();
  const lower = clean.toLowerCase();
  
  if (lower === 'math' || lower === 'maths' || lower === 'mathematics') {
    return 'Mathematics';
  }
  if (lower === 'sci' || lower === 'science') {
    return 'Science';
  }
  if (lower === 'eng' || lower === 'english') {
    return 'English';
  }
  if (lower === 'hin' || lower === 'hindi') {
    return 'Hindi';
  }
  if (lower === 'odia' || lower === 'oriya') {
    return 'Odia';
  }
  if (lower === 'twau') {
    return 'TWAU';
  }
  if (lower === 'all' || lower === 'all subjects') {
    return 'All Subjects';
  }
  if (
    lower === 'multi disciplinary project' ||
    lower === 'multi disciplinary project(mdp)' ||
    lower === 'multi disciplinary project (mdp)' ||
    lower === 'multi disciplinary project mdp' ||
    lower === 'mdp'
  ) {
    return 'Multi Disciplinary Project (MDP)';
  }
  if (
    lower === 'project based learning' ||
    lower === 'project based learning(pbl)' ||
    lower === 'project based learning (pbl)' ||
    lower === 'project based learning pbl' ||
    lower === 'pbl'
  ) {
    return 'Project Based Learning (PBL)';
  }
  return clean;
}

/**
 * Normalizes material types.
 * CRITICAL REQUIREMENT: "Chapter" must seamlessly be treated as "NCERT Book"
 */
export function normalizeMaterialType(value?: string | null): string {
  if (!value) return '';
  const clean = value.trim();
  const lower = clean.toLowerCase();
  
  if (lower === 'chapter' || lower === 'chapters' || lower === 'ncert book' || lower === 'ncert books' || lower === 'ncert') {
    return 'NCERT Book';
  }
  if (lower === 'notes' || lower === 'study notes') {
    return 'Study Notes';
  }
  if (lower === 'chapter notes') {
    return 'Chapter Notes';
  }
  if (lower === 'question paper' || lower === 'question papers') {
    return 'Question Papers';
  }
  if (lower === 'previous year paper' || lower === 'previous year papers' || lower === 'pyq') {
    return 'Previous Year Papers';
  }
  if (lower === 'model paper' || lower === 'model papers') {
    return 'Model Papers';
  }
  if (lower === 'practice paper' || lower === 'practice papers') {
    return 'Practice Papers';
  }
  if (lower === 'sample paper' || lower === 'sample papers') {
    return 'Sample Papers';
  }
  if (lower === 'mock test' || lower === 'mock tests') {
    return 'Mock Tests';
  }
  if (lower === 'worksheet' || lower === 'worksheets') {
    return 'Worksheets';
  }
  if (lower === 'answer key' || lower === 'answer keys') {
    return 'Answer Keys';
  }
  if (lower === 'solution' || lower === 'solutions') {
    return 'Solutions';
  }
  if (lower === 'revision note' || lower === 'revision notes') {
    return 'Revision Notes';
  }
  if (lower === 'important questions' || lower === 'important question') {
    return 'Important Questions';
  }
  if (lower === 'syllabus') {
    return 'Syllabus';
  }
  return clean;
}

export function createSlug(text?: string | null): string {
  if (!text) return 'item';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || 'item';
}

export function extractDriveFileId(url?: string): string {
  if (!url) return '';
  // match /d/FILE_ID or id=FILE_ID
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : '';
}

export function getDrivePreviewUrl(url?: string, fileId?: string): string {
  const id = fileId || extractDriveFileId(url);
  if (id) {
    return `https://drive.google.com/file/d/${id}/preview`;
  }
  return url || '';
}

export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
  }
  return null;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Checks whether a study material belongs exclusively to Olympiad.
 * Olympiad materials must ONLY show in the Olympiad section, and never under regular class study materials.
 */
export function isOlympiadMaterial(m?: {
  examType?: string | null;
  examName?: string | null;
  title?: string | null;
  tags?: string[] | null;
} | null): boolean {
  if (!m) return false;
  const isOlyExam = normalizeText(m.examType).includes('olympiad');
  const inTitle = normalizeText(m.title).includes('olympiad') || 
                  normalizeText(m.title).includes('imo') || 
                  normalizeText(m.title).includes('nso') || 
                  normalizeText(m.title).includes('ieo') ||
                  normalizeText(m.title).includes('nco');
  const inExamName = normalizeText(m.examName).includes('olympiad') ||
                     normalizeText(m.examName).includes('imo') ||
                     normalizeText(m.examName).includes('nso') ||
                     normalizeText(m.examName).includes('ieo') ||
                     normalizeText(m.examName).includes('nco');
  const inTags = (m.tags || []).some(tag => normalizeText(tag).includes('olympiad'));
  return isOlyExam || inTitle || inExamName || inTags;
}


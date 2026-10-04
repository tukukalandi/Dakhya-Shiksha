import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where,
  increment
} from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';
import { StudyMaterial, Video, Quiz, AdminUser } from '../types';

// Support both firebase-applet-config.json and Vercel/Netlify environment variables
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || rawConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection on boot per Skill requirement
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline or connecting.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const PRIMARY_ADMIN_EMAIL = 'tukukalandi@gmail.com';

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL.toLowerCase();
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function logoutUser() {
  return fbSignOut(auth);
}

// Initial demo seed datasets to satisfy Requirement 46
export const INITIAL_DEMO_MATERIALS: StudyMaterial[] = [
  {
    id: 'demo-mat-1',
    code: 'MAT-C5-MATH-01',
    title: 'Class 5 Mathematics Chapter 1 - Shapes and Angles (NCERT Book)',
    description: 'Complete NCERT chapter book with illustrated questions and angle concepts.',
    classLevel: 'Class 5',
    subject: 'Math',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_5_Math_Chapter_1.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 342,
    viewCount: 1205,
    tags: ['Math', 'Class 5', 'NCERT Book', 'Shapes', 'Angles'],
    isDemo: true
  },
  {
    id: 'demo-mat-2',
    code: 'MAT-C5-MATH-02',
    title: 'Class 5 Mathematics Model Paper & Sample Evaluation',
    description: 'Comprehensive annual practice model paper with complete marking scheme.',
    classLevel: 'Class 5',
    subject: 'Math',
    examType: 'School Examination',
    examName: 'Term Assessment',
    materialType: 'Model Papers',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_5_Math_Model_Paper_2026.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 418,
    viewCount: 1540,
    tags: ['Math', 'Class 5', 'Model Paper', 'Exam Practice'],
    isDemo: true
  },
  {
    id: 'demo-mat-3',
    code: 'MAT-C5-HIN-01',
    title: 'Class 5 Hindi - Rimjhim Chapter 1 Raakh Ki Rassi (NCERT Book)',
    description: 'Original NCERT textbook chapter with word meanings and exercise answers.',
    classLevel: 'Class 5',
    subject: 'Hindi',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'Hindi',
    fileName: 'Class_5_Hindi_Rimjhim_Ch1.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 189,
    viewCount: 650,
    tags: ['Hindi', 'Class 5', 'Rimjhim', 'NCERT Book'],
    isDemo: true
  },
  {
    id: 'demo-mat-4',
    code: 'MAT-C5-ENG-01',
    title: 'Class 5 English Marigold - Ice-Cream Man (Study Notes & Worksheet)',
    description: 'Detailed poem summary, vocabulary bank, comprehension questions and grammar worksheet.',
    classLevel: 'Class 5',
    subject: 'English',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'Worksheets',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_5_English_Worksheet_IceCreamMan.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 275,
    viewCount: 890,
    tags: ['English', 'Class 5', 'Marigold', 'Worksheets'],
    isDemo: true
  },
  {
    id: 'demo-mat-5',
    code: 'MAT-C6-SCI-01',
    title: 'Class 6 Science Notes - Components of Food',
    description: 'High-yield revision notes covering carbohydrates, proteins, fats, vitamins and balanced diet.',
    classLevel: 'Class 6',
    subject: 'Science',
    examType: 'School Examination',
    examName: 'Chapter 2',
    materialType: 'Study Notes',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_6_Science_Components_of_Food.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 520,
    viewCount: 1980,
    tags: ['Science', 'Class 6', 'Study Notes', 'Nutrition'],
    isDemo: true
  },
  {
    id: 'demo-mat-6',
    code: 'MAT-C7-ENG-01',
    title: 'Class 7 English Worksheet - Three Questions by Leo Tolstoy',
    description: 'Reading comprehension passages, character sketches and grammar practice sheets.',
    classLevel: 'Class 7',
    subject: 'English',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'Worksheets',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_7_English_Three_Questions.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 310,
    viewCount: 1120,
    tags: ['English', 'Class 7', 'Worksheets'],
    isDemo: true
  },
  {
    id: 'demo-mat-7',
    code: 'MAT-C8-MATH-01',
    title: 'Class 8 Mathematics Previous Year Paper & Solved Bank',
    description: 'Previous 5-year consolidated board/school annual exam questions with step-by-step solutions.',
    classLevel: 'Class 8',
    subject: 'Mathematics',
    examType: 'School Examination',
    examName: 'Annual Board Prep',
    materialType: 'Previous Year Papers',
    academicYear: '2024-2025',
    language: 'English',
    fileName: 'Class_8_Math_Previous_Years.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 680,
    viewCount: 2450,
    tags: ['Mathematics', 'Class 8', 'Previous Year Papers', 'Solutions'],
    isDemo: true
  },
  {
    id: 'demo-mat-8',
    code: 'MAT-C9-SCI-01',
    title: 'Class 9 Science Revision Notes - Matter in Our Surroundings',
    description: 'Concise summary charts, boiling vs evaporation, states of matter and latent heat calculations.',
    classLevel: 'Class 9',
    subject: 'Science',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'Revision Notes',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_9_Science_Revision_Notes.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 890,
    viewCount: 3100,
    tags: ['Science', 'Class 9', 'Revision Notes', 'Matter'],
    isDemo: true
  },
  {
    id: 'demo-mat-9',
    code: 'MAT-C10-MATH-01',
    title: 'Class 10 Mathematics Important Questions & NCERT Solutions',
    description: 'Top recurring standard and basic math questions for Real Numbers, Polynomials & Quadratic Equations.',
    classLevel: 'Class 10',
    subject: 'Mathematics',
    examType: 'School Examination',
    examName: 'Chapters 1-4',
    materialType: 'Important Questions',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_10_Math_Important_Questions.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 1420,
    viewCount: 5200,
    tags: ['Mathematics', 'Class 10', 'Important Questions', 'Board Exam'],
    isDemo: true
  },
  {
    id: 'demo-mat-10',
    code: 'MAT-OLY-MATH-01',
    title: 'International Mathematics Olympiad (IMO) - Level 1 & 2 Practice Book',
    description: 'Advanced logical reasoning, number theory, geometry and mental mathematics drills.',
    classLevel: 'Class 5',
    subject: 'Math',
    examType: 'Olympiad Exam',
    examName: 'IMO Level 1',
    materialType: 'Mock Tests',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'IMO_Class_5_Mock_Test.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 540,
    viewCount: 1780,
    tags: ['Olympiad', 'Mathematics', 'Class 5', 'Mock Tests'],
    isDemo: true
  },
  {
    id: 'demo-mat-11',
    code: 'MAT-OLY-SCI-01',
    title: 'Class 5 National Science Olympiad (NSO) Solved Question Paper',
    description: 'Complete syllabus coverage for Class 5 NSO science with detailed explanations and answer key.',
    classLevel: 'Class 5',
    subject: 'Science',
    examType: 'Olympiad Exam',
    examName: 'NSO Level 1',
    materialType: 'Question Papers',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'NSO_Class_5_Solved_Paper.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 410,
    viewCount: 1320,
    tags: ['Olympiad', 'Science', 'Class 5', 'NSO', 'Question Papers'],
    isDemo: true
  },
  {
    id: 'demo-mat-12',
    code: 'MAT-OLY-ENG-01',
    title: 'Class 5 International English Olympiad (IEO) Workbook & Vocabulary',
    description: 'Grammar exercises, reading comprehension passages, idioms and verbal reasoning.',
    classLevel: 'Class 5',
    subject: 'English',
    examType: 'Olympiad Exam',
    examName: 'IEO Level 1',
    materialType: 'Worksheets',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'IEO_Class_5_Workbook.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 320,
    viewCount: 980,
    tags: ['Olympiad', 'English', 'Class 5', 'IEO', 'Worksheets'],
    isDemo: true
  },
  {
    id: 'demo-mat-13',
    code: 'MAT-OLY-REAS-01',
    title: 'Class 5 Olympiad Logical Reasoning Practice Workbook',
    description: 'Patterns, analogies, blood relations, directions and visual reasoning puzzles.',
    classLevel: 'Class 5',
    subject: 'Reasoning',
    examType: 'Olympiad Exam',
    examName: 'Mental Ability',
    materialType: 'Practice Papers',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Reasoning_Class_5_Olympiad.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 460,
    viewCount: 1450,
    tags: ['Olympiad', 'Reasoning', 'Class 5', 'Practice Papers'],
    isDemo: true
  },
  {
    id: 'demo-mat-14',
    code: 'MAT-OLY-C1-MATH-01',
    title: 'Class 1 International Mathematics Olympiad (IMO) Activity Sheets',
    description: 'Counting, patterns, shapes, basic addition & subtraction picture puzzles for young learners.',
    classLevel: 'Class 1',
    subject: 'Math',
    examType: 'Olympiad Exam',
    examName: 'IMO Level 1',
    materialType: 'Worksheets',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_1_IMO_Worksheets.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 280,
    viewCount: 890,
    tags: ['Olympiad', 'Mathematics', 'Class 1', 'IMO'],
    isDemo: true
  },
  {
    id: 'demo-mat-15',
    code: 'MAT-OLY-C2-SCI-01',
    title: 'Class 2 National Science Olympiad (NSO) Illustrated Handbook',
    description: 'Plants, animals, human body and environmental science Olympiad preparation sheets.',
    classLevel: 'Class 2',
    subject: 'Science',
    examType: 'Olympiad Exam',
    examName: 'NSO Level 1',
    materialType: 'Study Notes',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_2_NSO_Handbook.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 240,
    viewCount: 780,
    tags: ['Olympiad', 'Science', 'Class 2', 'NSO'],
    isDemo: true
  },
  {
    id: 'demo-mat-16',
    code: 'MAT-OLY-C6-MATH-01',
    title: 'Class 6 Mathematics Olympiad (IMO) Advanced Problem Set',
    description: 'Integers, fractions, decimals, algebra, ratio & proportion Olympiad level problems with solutions.',
    classLevel: 'Class 6',
    subject: 'Mathematics',
    examType: 'Olympiad Exam',
    examName: 'IMO Level 1 & 2',
    materialType: 'Practice Papers',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_6_IMO_Advanced.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 650,
    viewCount: 2100,
    tags: ['Olympiad', 'Mathematics', 'Class 6', 'IMO'],
    isDemo: true
  },
  {
    id: 'demo-mat-17',
    code: 'MAT-OLY-C8-SCI-01',
    title: 'Class 8 National Science Olympiad (NSO) Mock Examination Paper',
    description: 'Cell structure, reproduction, force & pressure, sound, and light Olympiad challenge test.',
    classLevel: 'Class 8',
    subject: 'Science',
    examType: 'Olympiad Exam',
    examName: 'NSO Level 1',
    materialType: 'Mock Tests',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_8_NSO_Mock_Test.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 780,
    viewCount: 2650,
    tags: ['Olympiad', 'Science', 'Class 8', 'NSO'],
    isDemo: true
  },
  {
    id: 'demo-mat-18',
    code: 'MAT-OLY-C10-MATH-01',
    title: 'Class 10 International Mathematics Olympiad (IMO) High-Order Challenge',
    description: 'Quadratic equations, circles, trigonometry, coordinate geometry and combinatorics drills.',
    classLevel: 'Class 10',
    subject: 'Mathematics',
    examType: 'Olympiad Exam',
    examName: 'IMO Level 2',
    materialType: 'Important Questions',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_10_IMO_HighOrder.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 1120,
    viewCount: 3900,
    tags: ['Olympiad', 'Mathematics', 'Class 10', 'IMO'],
    isDemo: true
  },
  {
    id: 'demo-mat-19',
    code: 'MAT-OLY-C4-SCI-01',
    title: 'Class 4 Science Olympiad (NSO) Chapter Notes - Plants, Animals & Human Body',
    description: 'Concise chapter revision notes, diagrams, scientific facts and memory maps for Class 4 NSO aspirants.',
    classLevel: 'Class 4',
    subject: 'Science',
    examType: 'Olympiad Exam',
    examName: 'NSO Chapter Notes',
    materialType: 'Chapter Notes',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_4_NSO_Chapter_Notes.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 395,
    viewCount: 1250,
    tags: ['Olympiad', 'Science', 'Class 4', 'NSO', 'Chapter Notes'],
    isDemo: true
  },
  {
    id: 'demo-mat-20',
    code: 'MAT-OLY-C4-SCI-02',
    title: 'Class 4 National Science Olympiad (NSO) Official Question Paper & Solutions',
    description: 'Original Olympiad level question paper covering scientific reasoning, life science and physical science with answer keys.',
    classLevel: 'Class 4',
    subject: 'Science',
    examType: 'Olympiad Exam',
    examName: 'NSO Level 1 Paper',
    materialType: 'Question Papers',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_4_NSO_Question_Paper.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 480,
    viewCount: 1650,
    tags: ['Olympiad', 'Science', 'Class 4', 'NSO', 'Question Papers'],
    isDemo: true
  },
  {
    id: 'demo-mat-21',
    code: 'MAT-MDP-C5-01',
    title: 'Class 5 Multi Disciplinary Project (MDP) - Theme: Water Conservation & Community Living',
    description: 'Art-integrated holistic project linking EVS, Math data handling, Hindi poetry and English descriptive writing.',
    classLevel: 'Class 5',
    subject: 'Multi Disciplinary Project (MDP)',
    examType: 'School Examination',
    examName: 'Annual Term MDP Guidelines',
    materialType: 'Study Notes',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_5_MDP_Water_Conservation.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'Curriculum Coordinator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 512,
    viewCount: 1820,
    tags: ['MDP', 'Multi Disciplinary Project', 'Class 5', 'Study Notes'],
    isDemo: true
  },
  {
    id: 'demo-mat-22',
    code: 'MAT-PBL-C5-01',
    title: 'Class 5 Project Based Learning (PBL) - Solar Energy & Eco-Friendly School Garden',
    description: 'Hands-on scientific inquiry project: designing school models, observing plant growth and documenting ecological balance.',
    classLevel: 'Class 5',
    subject: 'Project Based Learning (PBL)',
    examType: 'School Examination',
    examName: 'Experiential PBL Portfolio Guide',
    materialType: 'Study Notes',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_5_PBL_School_Garden.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'Curriculum Coordinator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 640,
    viewCount: 2190,
    tags: ['PBL', 'Project Based Learning', 'Class 5', 'Study Notes'],
    isDemo: true
  },
  {
    id: 'demo-mat-23',
    code: 'MAT-MDP-C5-SOL',
    title: 'Class 5 Multi Disciplinary Project (MDP) - Model Solutions, Answers & Art Integrated File',
    description: 'Complete solved project logbook, model drawings, answers to thematic questions and rubrics evaluation.',
    classLevel: 'Class 5',
    subject: 'Multi Disciplinary Project (MDP)',
    examType: 'School Examination',
    examName: 'MDP Model Solutions',
    materialType: 'Solutions',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_5_MDP_Solved_Portfolio.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'Curriculum Coordinator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 730,
    viewCount: 2450,
    tags: ['MDP', 'Multi Disciplinary Project', 'Class 5', 'Solutions'],
    isDemo: true
  },
  {
    id: 'demo-mat-24',
    code: 'MAT-PBL-C5-SOL',
    title: 'Class 5 Project Based Learning (PBL) - Solved Project Logbook & Observation Explanations',
    description: 'Fully worked out problem-solving investigation logbook, experimental data charts and research write-up.',
    classLevel: 'Class 5',
    subject: 'Project Based Learning (PBL)',
    examType: 'School Examination',
    examName: 'PBL Completed Solutions',
    materialType: 'Solutions',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_5_PBL_Solved_Logbook.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'Curriculum Coordinator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 820,
    viewCount: 2900,
    tags: ['PBL', 'Project Based Learning', 'Class 5', 'Solutions'],
    isDemo: true
  },
  // Class 1 Materials
  {
    id: 'demo-mat-c1-math',
    code: 'MAT-C1-MATH-01',
    title: 'Class 1 Mathematics - Math-Magic Chapter 1 Shapes and Space (NCERT Book)',
    description: 'Foundational shapes, spatial concepts, inside-outside, and counting activities for Class 1 learners.',
    classLevel: 'Class 1',
    subject: 'Math',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_1_Math_Chapter_1_Shapes_and_Space.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 195,
    viewCount: 620,
    tags: ['Math', 'Class 1', 'NCERT Book', 'Shapes'],
    isDemo: true
  },
  {
    id: 'demo-mat-c1-eng',
    code: 'MAT-C1-ENG-01',
    title: 'Class 1 English - Marigold Unit 1 A Happy Child (NCERT Book)',
    description: 'Illustrated rhyming poem, phonics sounds, and coloring comprehension worksheets.',
    classLevel: 'Class 1',
    subject: 'English',
    examType: 'School Examination',
    examName: 'Unit 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_1_English_Marigold_Unit_1.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 160,
    viewCount: 510,
    tags: ['English', 'Class 1', 'Marigold', 'NCERT Book'],
    isDemo: true
  },
  {
    id: 'demo-mat-c1-hin',
    code: 'MAT-C1-HIN-01',
    title: 'Class 1 Hindi - Rimjhim Chapter 1 Jhula (NCERT Book)',
    description: 'Complete NCERT chapter with Hindi varnamala exercises, picture stories and poetry recitation.',
    classLevel: 'Class 1',
    subject: 'Hindi',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'Hindi',
    fileName: 'Class_1_Hindi_Rimjhim_Ch1.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 140,
    viewCount: 470,
    tags: ['Hindi', 'Class 1', 'Rimjhim', 'NCERT Book'],
    isDemo: true
  },
  // Class 2 Materials
  {
    id: 'demo-mat-c2-math',
    code: 'MAT-C2-MATH-01',
    title: 'Class 2 Mathematics - Math-Magic Chapter 1 What is Long, What is Round? (NCERT Book)',
    description: 'Fun exploration of shapes, rolling and sliding objects, and building towers with blocks.',
    classLevel: 'Class 2',
    subject: 'Math',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_2_Math_Chapter_1.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 220,
    viewCount: 710,
    tags: ['Math', 'Class 2', 'NCERT Book', 'Shapes'],
    isDemo: true
  },
  {
    id: 'demo-mat-c2-eng',
    code: 'MAT-C2-ENG-01',
    title: 'Class 2 English - Marigold Unit 1 First Day at School (NCERT Book)',
    description: 'Poem and Haldi\'s Adventure story with reading practice, new vocabulary and grammar exercises.',
    classLevel: 'Class 2',
    subject: 'English',
    examType: 'School Examination',
    examName: 'Unit 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_2_English_Marigold_Unit_1.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 180,
    viewCount: 590,
    tags: ['English', 'Class 2', 'Marigold', 'NCERT Book'],
    isDemo: true
  },
  {
    id: 'demo-mat-c2-hin',
    code: 'MAT-C2-HIN-01',
    title: 'Class 2 Hindi - Rimjhim Chapter 1 Oont Chala (NCERT Book)',
    description: 'Camel poem and desert animals picture comprehension with workbook practice questions.',
    classLevel: 'Class 2',
    subject: 'Hindi',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'Hindi',
    fileName: 'Class_2_Hindi_Rimjhim_Ch1.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 155,
    viewCount: 540,
    tags: ['Hindi', 'Class 2', 'Rimjhim', 'NCERT Book'],
    isDemo: true
  },
  // Class 3 Materials
  {
    id: 'demo-mat-c3-math',
    code: 'MAT-C3-MATH-01',
    title: 'Class 3 Mathematics - Math-Magic Chapter 1 Where to Look From (NCERT Book)',
    description: 'Top view, side view, front view, dot grid patterns and symmetry for Class 3.',
    classLevel: 'Class 3',
    subject: 'Math',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_3_Math_Chapter_1.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 260,
    viewCount: 820,
    tags: ['Math', 'Class 3', 'NCERT Book', 'Symmetry'],
    isDemo: true
  },
  {
    id: 'demo-mat-c3-eng',
    code: 'MAT-C3-ENG-01',
    title: 'Class 3 English - Marigold Unit 1 Good Morning & The Magic Garden (NCERT Book)',
    description: 'Poem and story of flowers and fairies with exercises, word power and comprehension.',
    classLevel: 'Class 3',
    subject: 'English',
    examType: 'School Examination',
    examName: 'Unit 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_3_English_Marigold_Unit_1.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 210,
    viewCount: 680,
    tags: ['English', 'Class 3', 'Marigold', 'NCERT Book'],
    isDemo: true
  },
  {
    id: 'demo-mat-c3-twau',
    code: 'MAT-C3-TWAU-01',
    title: 'Class 3 Environmental Studies (TWAU) - Chapter 1 Poonam\'s Day Out (NCERT Book)',
    description: 'Observing animals, birds and insects around our homes with environmental activities.',
    classLevel: 'Class 3',
    subject: 'TWAU',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_3_EVS_Poonams_Day_Out.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 240,
    viewCount: 790,
    tags: ['TWAU', 'EVS', 'Class 3', 'NCERT Book'],
    isDemo: true
  },
  // Class 4 Materials
  {
    id: 'demo-mat-c4-math',
    code: 'MAT-C4-MATH-01',
    title: 'Class 4 Mathematics - Math-Magic Chapter 1 Building with Bricks (NCERT Book)',
    description: 'Brick patterns, wall designs, 3D shapes, architectural patterns and area estimation.',
    classLevel: 'Class 4',
    subject: 'Math',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_4_Math_Chapter_1.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 310,
    viewCount: 950,
    tags: ['Math', 'Class 4', 'NCERT Book', 'Bricks'],
    isDemo: true
  },
  {
    id: 'demo-mat-c4-eng',
    code: 'MAT-C4-ENG-01',
    title: 'Class 4 English - Marigold Unit 1 Wake Up! & Neha\'s Alarm Clock (NCERT Book)',
    description: 'Nature morning poem, story of a little girl and her cheerful birds with question bank.',
    classLevel: 'Class 4',
    subject: 'English',
    examType: 'School Examination',
    examName: 'Unit 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_4_English_Marigold_Unit_1.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 270,
    viewCount: 880,
    tags: ['English', 'Class 4', 'Marigold', 'NCERT Book'],
    isDemo: true
  },
  {
    id: 'demo-mat-c4-twau',
    code: 'MAT-C4-TWAU-01',
    title: 'Class 4 Environmental Studies (TWAU) - Chapter 1 Going to School (NCERT Book)',
    description: 'Bridges, bamboo carts, vallam and camel carts across India with environmental project notes.',
    classLevel: 'Class 4',
    subject: 'TWAU',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_4_EVS_Going_to_School.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 330,
    viewCount: 1040,
    tags: ['TWAU', 'EVS', 'Class 4', 'NCERT Book'],
    isDemo: true
  },
  // Class 6 Additional Materials
  {
    id: 'demo-mat-c6-math',
    code: 'MAT-C6-MATH-01',
    title: 'Class 6 Mathematics Chapter 1 - Knowing Our Numbers (NCERT Book)',
    description: 'Place value system, large numbers, estimation, brackets and roman numerals with solutions.',
    classLevel: 'Class 6',
    subject: 'Mathematics',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_6_Math_Knowing_Our_Numbers.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 450,
    viewCount: 1580,
    tags: ['Mathematics', 'Class 6', 'NCERT Book', 'Numbers'],
    isDemo: true
  },
  {
    id: 'demo-mat-c6-eng',
    code: 'MAT-C6-ENG-01',
    title: 'Class 6 English - Honeysuckle Chapter 1 Who Did Patrick\'s Homework? (NCERT Book)',
    description: 'Illustrated story of Patrick and the elf, vocabulary exercises and grammar worksheets.',
    classLevel: 'Class 6',
    subject: 'English',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_6_English_Honeysuckle_Ch1.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 380,
    viewCount: 1220,
    tags: ['English', 'Class 6', 'Honeysuckle', 'NCERT Book'],
    isDemo: true
  },
  // Class 7 Additional Materials
  {
    id: 'demo-mat-c7-math',
    code: 'MAT-C7-MATH-01',
    title: 'Class 7 Mathematics Chapter 1 - Integers (NCERT Book)',
    description: 'Addition, subtraction, multiplication, and division of integers on the number line.',
    classLevel: 'Class 7',
    subject: 'Mathematics',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_7_Math_Integers.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 510,
    viewCount: 1690,
    tags: ['Mathematics', 'Class 7', 'NCERT Book', 'Integers'],
    isDemo: true
  },
  {
    id: 'demo-mat-c7-sci',
    code: 'MAT-C7-SCI-01',
    title: 'Class 7 Science Chapter 1 - Nutrition in Plants (NCERT Book)',
    description: 'Autotrophic and heterotrophic nutrition, photosynthesis, parasitic and saprotrophic modes.',
    classLevel: 'Class 7',
    subject: 'Science',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_7_Science_Nutrition_in_Plants.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 470,
    viewCount: 1530,
    tags: ['Science', 'Class 7', 'NCERT Book', 'Biology'],
    isDemo: true
  },
  // Class 8 Additional Materials
  {
    id: 'demo-mat-c8-sci',
    code: 'MAT-C8-SCI-01',
    title: 'Class 8 Science Chapter 1 - Crop Production and Management (NCERT Book)',
    description: 'Agricultural practices, soil preparation, sowing, irrigation, weed removal and crop storage.',
    classLevel: 'Class 8',
    subject: 'Science',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_8_Science_Crop_Production.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 590,
    viewCount: 1980,
    tags: ['Science', 'Class 8', 'NCERT Book', 'Agriculture'],
    isDemo: true
  },
  // Class 9 Additional Materials
  {
    id: 'demo-mat-c9-math',
    code: 'MAT-C9-MATH-01',
    title: 'Class 9 Mathematics Chapter 1 - Number Systems (NCERT Book)',
    description: 'Rational and irrational numbers, real numbers, laws of exponents, and decimal expansions.',
    classLevel: 'Class 9',
    subject: 'Mathematics',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_9_Math_Number_Systems.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 820,
    viewCount: 2750,
    tags: ['Mathematics', 'Class 9', 'NCERT Book', 'Number Systems'],
    isDemo: true
  },
  // Class 10 Additional Materials
  {
    id: 'demo-mat-c10-sci',
    code: 'MAT-C10-SCI-01',
    title: 'Class 10 Science Chapter 1 - Chemical Reactions and Equations (NCERT Book)',
    description: 'Balancing chemical equations, types of chemical reactions, corrosion, and rancidity.',
    classLevel: 'Class 10',
    subject: 'Science',
    examType: 'School Examination',
    examName: 'Chapter 1',
    materialType: 'NCERT Book',
    academicYear: '2025-2026',
    language: 'English',
    fileName: 'Class_10_Science_Chemical_Reactions.pdf',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    uploadedBy: 'System Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    downloadCount: 1350,
    viewCount: 4600,
    tags: ['Science', 'Class 10', 'NCERT Book', 'Chemistry'],
    isDemo: true
  }
];

export const INITIAL_DEMO_VIDEOS: Video[] = [
  {
    id: 'demo-vid-1',
    categoryType: 'Class',
    classOrExam: 'Class 5',
    subject: 'Mathematics',
    chapter: 'Fractions',
    title: 'Class 5 Mathematics: Understanding Fractions & Visual Models (Part 1)',
    videoUrl: 'https://www.youtube.com/watch?v=n0FZhQ_GkKw',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
    duration: '14:20',
    description: 'Clear graphical introduction to proper, improper and mixed fractions for Class 5 pupils.',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    uploadedBy: 'Faculty Team',
    isDemo: true
  },
  {
    id: 'demo-vid-2',
    categoryType: 'Class',
    classOrExam: 'Class 5',
    subject: 'Mathematics',
    chapter: 'Fractions',
    title: 'Class 5 Mathematics: Adding & Subtracting Like Fractions (Part 2)',
    videoUrl: 'https://www.youtube.com/watch?v=52ZlXsFUNGw',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    duration: '16:45',
    description: 'Step-by-step arithmetic operations on fractions with fun animations and worksheet problems.',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    uploadedBy: 'Faculty Team',
    isDemo: true
  },
  {
    id: 'demo-vid-3',
    categoryType: 'Class',
    classOrExam: 'Class 6',
    subject: 'Science',
    chapter: 'Matter',
    title: 'Class 6 Science: Matter and Its States - Solid, Liquid & Gas',
    videoUrl: 'https://www.youtube.com/watch?v=wclY8F-UoTE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    duration: '18:10',
    description: 'Experimental demonstrations showing molecular packing and properties of matter.',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    uploadedBy: 'Faculty Team',
    isDemo: true
  },
  {
    id: 'demo-vid-4',
    categoryType: 'Olympiad',
    classOrExam: 'Olympiad Class 5',
    subject: 'Mathematics',
    chapter: 'Fractions',
    title: 'Olympiad Class 5: Advanced Fraction Tricky Puzzles & Speed Maths',
    videoUrl: 'https://www.youtube.com/watch?v=al83CWwA-80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    duration: '22:15',
    description: 'IMO Olympiad level critical thinking tricks for Class 5 mathematics competitors.',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    uploadedBy: 'Olympiad Mentor',
    isDemo: true
  },
  {
    id: 'demo-vid-5',
    categoryType: 'Competitive Exams',
    classOrExam: 'TET',
    subject: 'Reasoning',
    chapter: 'Logical Deduction',
    title: 'TET Exam Preparation: Reasoning & Pattern Analysis Masterclass',
    videoUrl: 'https://www.youtube.com/watch?v=9_5k8G_B8vQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    duration: '28:40',
    description: 'Complete guide to solving teaching aptitude and reasoning questions for state & central TET.',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    uploadedBy: 'Teacher Educator',
    isDemo: true
  }
];

export const INITIAL_DEMO_QUIZZES: Quiz[] = [
  {
    id: 'demo-quiz-1',
    title: 'Class 5 Mathematics: Fractions Interactive Mastery Quiz',
    classLevel: 'Class 5',
    subject: 'Math',
    chapter: 'Fractions',
    topic: 'Equivalent Fractions & Simplification',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Fractions Mastery Quiz</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff8f8; color: #1e293b; padding: 24px; margin: 0; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); max-width: 600px; margin: 0 auto; border-top: 5px solid #991b1b; }
    h2 { color: #991b1b; margin-top: 0; font-size: 20px; }
    .q-box { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px dashed #e2e8f0; }
    .q-text { font-weight: 600; margin-bottom: 12px; }
    .option-btn { display: block; width: 100%; text-align: left; padding: 10px 14px; margin-bottom: 8px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; font-size: 15px; cursor: pointer; transition: all 0.2s; }
    .option-btn:hover { background: #fee2e2; border-color: #ef4444; }
    .option-btn.correct { background: #dcfce7; border-color: #22c55e; color: #15803d; font-weight: bold; }
    .option-btn.wrong { background: #fee2e2; border-color: #ef4444; color: #b91c1c; }
    .score-badge { display: inline-block; padding: 6px 14px; background: #fef3c7; color: #92400e; border-radius: 20px; font-weight: bold; margin-bottom: 16px; font-size: 14px; }
    .feedback { font-size: 13px; margin-top: 6px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <span class="score-badge">Class 5 Mathematics Assessment</span>
    <h2>Fractions & Operations Mini-Quiz</h2>
    
    <div class="q-box" id="q1">
      <div class="q-text">1. Which fraction is equivalent to 1/2?</div>
      <button class="option-btn" onclick="check(1, this, false)">A) 2/5</button>
      <button class="option-btn" onclick="check(1, this, true)">B) 4/8</button>
      <button class="option-btn" onclick="check(1, this, false)">C) 3/7</button>
      <button class="option-btn" onclick="check(1, this, false)">D) 5/9</button>
      <div class="feedback" id="fb1"></div>
    </div>

    <div class="q-box" id="q2">
      <div class="q-text">2. What type of fraction is 7/4?</div>
      <button class="option-btn" onclick="check(2, this, false)">A) Proper Fraction</button>
      <button class="option-btn" onclick="check(2, this, true)">B) Improper Fraction</button>
      <button class="option-btn" onclick="check(2, this, false)">C) Unit Fraction</button>
      <button class="option-btn" onclick="check(2, this, false)">D) Decimal Fraction</button>
      <div class="feedback" id="fb2"></div>
    </div>

    <div class="q-box" id="q3">
      <div class="q-text">3. 1/5 + 2/5 = ?</div>
      <button class="option-btn" onclick="check(3, this, false)">A) 3/10</button>
      <button class="option-btn" onclick="check(3, this, true)">B) 3/5</button>
      <button class="option-btn" onclick="check(3, this, false)">C) 2/25</button>
      <button class="option-btn" onclick="check(3, this, false)">D) 1/5</button>
      <div class="feedback" id="fb3"></div>
    </div>
  </div>

  <script>
    function check(qNum, btn, isCorrect) {
      var parent = btn.parentElement;
      var buttons = parent.querySelectorAll('.option-btn');
      buttons.forEach(function(b) { b.disabled = true; });
      var fb = document.getElementById('fb' + qNum);
      if (isCorrect) {
        btn.classList.add('correct');
        fb.style.color = '#15803d';
        fb.textContent = '✓ Correct! Excellent mathematical understanding.';
      } else {
        btn.classList.add('wrong');
        fb.style.color = '#b91c1c';
        fb.textContent = '✗ Incorrect. Review the chapter notes and try again!';
      }
    }
  </script>
</body>
</html>`,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    uploadedBy: 'Math Teacher',
    isDemo: true
  },
  {
    id: 'demo-quiz-2',
    title: 'Class 6 Science: Components of Food & Nutrients Quiz',
    classLevel: 'Class 6',
    subject: 'Science',
    chapter: 'Components of Food',
    topic: 'Vitamins, Minerals & Deficiency Diseases',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Food & Nutrients Quiz</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f0fdf4; color: #0f172a; padding: 24px; margin: 0; }
    .card { background: white; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; border-top: 5px solid #16a34a; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    h2 { color: #166534; margin-top: 0; }
    .q-text { font-weight: 600; margin: 16px 0 8px; }
    button { display: block; width: 100%; text-align: left; padding: 10px; margin-bottom: 6px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; cursor: pointer; }
    button.correct { background: #bbf7d0; border-color: #22c55e; }
    button.wrong { background: #fecaca; border-color: #ef4444; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Science Challenge: Food & Health</h2>
    <div>
      <div class="q-text">1. Which nutrient provides instant energy to our body?</div>
      <button onclick="ans(this, true)">Carbohydrates / Glucose</button>
      <button onclick="ans(this, false)">Proteins</button>
      <button onclick="ans(this, false)">Calcium</button>
      <button onclick="ans(this, false)">Roughage</button>
    </div>
    <div>
      <div class="q-text">2. Scurvy is caused by deficiency of which vitamin?</div>
      <button onclick="ans(this, false)">Vitamin A</button>
      <button onclick="ans(this, false)">Vitamin B</button>
      <button onclick="ans(this, true)">Vitamin C</button>
      <button onclick="ans(this, false)">Vitamin D</button>
    </div>
  </div>
  <script>
    function ans(btn, ok) {
      btn.parentElement.querySelectorAll('button').forEach(b => b.disabled = true);
      btn.className = ok ? 'correct' : 'wrong';
    }
  </script>
</body>
</html>`,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    uploadedBy: 'Science Faculty',
    isDemo: true
  }
];

// In-memory / local cache to guarantee fast rendering and zero blank screens
const LOCAL_STORAGE_MATERIALS_KEY = 'dakshya_shiksha_materials_v5';
const LOCAL_STORAGE_VIDEOS_KEY = 'dakshya_shiksha_videos_v1';
const LOCAL_STORAGE_QUIZZES_KEY = 'dakshya_shiksha_quizzes_v1';

function getStoredOrDemo<T>(key: string, initial: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return initial;
}

function saveToLocalStorage<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota ignore
  }
}

// Data fetchers with dual sync (Firestore + Local fallback)
export async function fetchStudyMaterials(): Promise<StudyMaterial[]> {
  try {
    const q = collection(db, 'studyMaterials');
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const list: StudyMaterial[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as StudyMaterial);
      });
      saveToLocalStorage(LOCAL_STORAGE_MATERIALS_KEY, list);
      return list;
    } else {
      console.log('Firestore studyMaterials collection is empty. Populating initial repository...');
      try {
        await seedDemoData();
      } catch (e) {
        console.warn('Auto-seed notice:', e);
      }
      return INITIAL_DEMO_MATERIALS;
    }
  } catch (error) {
    console.warn('Firestore fetchStudyMaterials falling back to local cache/demo:', error);
  }
  return getStoredOrDemo(LOCAL_STORAGE_MATERIALS_KEY, INITIAL_DEMO_MATERIALS);
}

export async function fetchVideos(): Promise<Video[]> {
  try {
    const q = collection(db, 'videos');
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const list: Video[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Video);
      });
      saveToLocalStorage(LOCAL_STORAGE_VIDEOS_KEY, list);
      return list;
    }
  } catch (error) {
    console.warn('Firestore fetchVideos falling back to local cache/demo:', error);
  }
  return getStoredOrDemo(LOCAL_STORAGE_VIDEOS_KEY, INITIAL_DEMO_VIDEOS);
}

export async function fetchQuizzes(): Promise<Quiz[]> {
  try {
    const q = collection(db, 'quizzes');
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const list: Quiz[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Quiz);
      });
      saveToLocalStorage(LOCAL_STORAGE_QUIZZES_KEY, list);
      return list;
    }
  } catch (error) {
    console.warn('Firestore fetchQuizzes falling back to local cache/demo:', error);
  }
  return getStoredOrDemo(LOCAL_STORAGE_QUIZZES_KEY, INITIAL_DEMO_QUIZZES);
}

// Material Operations
export async function saveStudyMaterialDoc(material: StudyMaterial): Promise<void> {
  const path = `studyMaterials/${material.id}`;
  try {
    const docRef = doc(db, 'studyMaterials', material.id);
    await setDoc(docRef, material, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }

  // Update local copy
  const existing = await fetchStudyMaterials();
  const index = existing.findIndex(m => m.id === material.id);
  if (index >= 0) {
    existing[index] = material;
  } else {
    existing.unshift(material);
  }
  saveToLocalStorage(LOCAL_STORAGE_MATERIALS_KEY, existing);
}

export async function deleteStudyMaterialDoc(materialId: string): Promise<void> {
  const path = `studyMaterials/${materialId}`;
  try {
    const docRef = doc(db, 'studyMaterials', materialId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }

  const existing = await fetchStudyMaterials();
  const updated = existing.filter(m => m.id !== materialId);
  saveToLocalStorage(LOCAL_STORAGE_MATERIALS_KEY, updated);
}

// Counters increment
export async function incrementMaterialCounter(materialId: string, type: 'view' | 'download'): Promise<void> {
  try {
    const docRef = doc(db, 'studyMaterials', materialId);
    await updateDoc(docRef, {
      [type === 'view' ? 'viewCount' : 'downloadCount']: increment(1)
    });
  } catch {
    // Non-critical if offline or permission denied
  }

  const existing = await fetchStudyMaterials();
  const mat = existing.find(m => m.id === materialId);
  if (mat) {
    if (type === 'view') mat.viewCount = (mat.viewCount || 0) + 1;
    if (type === 'download') mat.downloadCount = (mat.downloadCount || 0) + 1;
    saveToLocalStorage(LOCAL_STORAGE_MATERIALS_KEY, existing);
  }
}

// Video Operations
export async function saveVideoDoc(video: Video): Promise<void> {
  const path = `videos/${video.id}`;
  try {
    const docRef = doc(db, 'videos', video.id);
    await setDoc(docRef, video, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }

  const existing = await fetchVideos();
  const index = existing.findIndex(v => v.id === video.id);
  if (index >= 0) {
    existing[index] = video;
  } else {
    existing.unshift(video);
  }
  saveToLocalStorage(LOCAL_STORAGE_VIDEOS_KEY, existing);
}

export async function deleteVideoDoc(videoId: string): Promise<void> {
  const path = `videos/${videoId}`;
  try {
    const docRef = doc(db, 'videos', videoId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }

  const existing = await fetchVideos();
  const updated = existing.filter(v => v.id !== videoId);
  saveToLocalStorage(LOCAL_STORAGE_VIDEOS_KEY, updated);
}

// Quiz Operations
export async function saveQuizDoc(quiz: Quiz): Promise<void> {
  const path = `quizzes/${quiz.id}`;
  try {
    const docRef = doc(db, 'quizzes', quiz.id);
    await setDoc(docRef, quiz, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }

  const existing = await fetchQuizzes();
  const index = existing.findIndex(q => q.id === quiz.id);
  if (index >= 0) {
    existing[index] = quiz;
  } else {
    existing.unshift(quiz);
  }
  saveToLocalStorage(LOCAL_STORAGE_QUIZZES_KEY, existing);
}

export async function deleteQuizDoc(quizId: string): Promise<void> {
  const path = `quizzes/${quizId}`;
  try {
    const docRef = doc(db, 'quizzes', quizId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }

  const existing = await fetchQuizzes();
  const updated = existing.filter(q => q.id !== quizId);
  saveToLocalStorage(LOCAL_STORAGE_QUIZZES_KEY, updated);
}

// Demo Data Seeding & Clearing
export async function seedDemoData(): Promise<void> {
  for (const m of INITIAL_DEMO_MATERIALS) {
    try {
      await setDoc(doc(db, 'studyMaterials', m.id), m);
    } catch {
      // ignore
    }
  }
  for (const v of INITIAL_DEMO_VIDEOS) {
    try {
      await setDoc(doc(db, 'videos', v.id), v);
    } catch {
      // ignore
    }
  }
  for (const q of INITIAL_DEMO_QUIZZES) {
    try {
      await setDoc(doc(db, 'quizzes', q.id), q);
    } catch {
      // ignore
    }
  }
  saveToLocalStorage(LOCAL_STORAGE_MATERIALS_KEY, INITIAL_DEMO_MATERIALS);
  saveToLocalStorage(LOCAL_STORAGE_VIDEOS_KEY, INITIAL_DEMO_VIDEOS);
  saveToLocalStorage(LOCAL_STORAGE_QUIZZES_KEY, INITIAL_DEMO_QUIZZES);
}

export async function removeDemoData(): Promise<void> {
  const mats = await fetchStudyMaterials();
  for (const m of mats) {
    if (m.isDemo) {
      try {
        await deleteDoc(doc(db, 'studyMaterials', m.id));
      } catch {
        // ignore
      }
    }
  }
  const vids = await fetchVideos();
  for (const v of vids) {
    if (v.isDemo) {
      try {
        await deleteDoc(doc(db, 'videos', v.id));
      } catch {
        // ignore
      }
    }
  }
  const quizzes = await fetchQuizzes();
  for (const q of quizzes) {
    if (q.isDemo) {
      try {
        await deleteDoc(doc(db, 'quizzes', q.id));
      } catch {
        // ignore
      }
    }
  }

  saveToLocalStorage(LOCAL_STORAGE_MATERIALS_KEY, mats.filter(m => !m.isDemo));
  saveToLocalStorage(LOCAL_STORAGE_VIDEOS_KEY, vids.filter(v => !v.isDemo));
  saveToLocalStorage(LOCAL_STORAGE_QUIZZES_KEY, quizzes.filter(q => !q.isDemo));
}

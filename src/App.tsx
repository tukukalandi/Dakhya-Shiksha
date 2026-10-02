import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

import { PublicLayout } from './components/common/PublicLayout';
import { HomePage } from './pages/HomePage';
import { ClassesPage } from './pages/ClassesPage';
import { ClassSubjectsPage } from './pages/ClassSubjectsPage';
import { SubjectMaterialTypesPage } from './pages/SubjectMaterialTypesPage';
import { MaterialFilesListPage } from './pages/MaterialFilesListPage';
import { MaterialDetailsPage } from './pages/MaterialDetailsPage';
import { StudyMaterialsPage } from './pages/StudyMaterialsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { OlympiadPage } from './pages/OlympiadPage';
import { OlympiadSubjectsPage } from './pages/OlympiadSubjectsPage';
import { OlympiadMaterialTypesPage } from './pages/OlympiadMaterialTypesPage';
import { OlympiadFilesPage } from './pages/OlympiadFilesPage';
import { AboutPage, ContactPage } from './pages/StaticPages';

// Video Corner Pages
import { VideoCornerPage } from './pages/video/VideoCornerPage';
import { VideoCategorySubjectsPage } from './pages/video/VideoCategorySubjectsPage';
import { VideoSubjectChaptersPage } from './pages/video/VideoSubjectChaptersPage';
import { VideoChapterVideosPage } from './pages/video/VideoChapterVideosPage';
import { VideoPlayerPage } from './pages/video/VideoPlayerPage';

// Quiz Pages
import { QuizzesPage } from './pages/quizzes/QuizzesPage';
import { QuizRunnerPage } from './pages/quizzes/QuizRunnerPage';

// Admin Portal Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMaterialsPage } from './pages/admin/AdminMaterialsPage';
import { AdminMaterialFormPage } from './pages/admin/AdminMaterialFormPage';
import { AdminVideosPage } from './pages/admin/AdminVideosPage';
import { AdminQuizzesPage } from './pages/admin/AdminQuizzesPage';
import { AdminCategoriesPage, AdminSettingsPage } from './pages/admin/AdminCategoriesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Standalone Quiz Runner (Isolated Full-Page Viewport) */}
              <Route path="/quiz/:id" element={<QuizRunnerPage />} />

              {/* Admin Portal Authentication */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Dedicated Admin Portal Routes with Independent Layout */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="study-materials" element={<AdminMaterialsPage />} />
                <Route path="study-materials/add" element={<AdminMaterialFormPage />} />
                <Route path="study-materials/edit/:id" element={<AdminMaterialFormPage />} />
                <Route path="videos" element={<AdminVideosPage />} />
                <Route path="quizzes" element={<AdminQuizzesPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="admins" element={<AdminUsersPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Public Website Routes wrapped in PublicLayout */}
              <Route element={<PublicLayout />}>
                {/* Home */}
                <Route path="/" element={<HomePage />} />

                {/* Study Material Flow: Class -> Subject -> Material Type -> Files -> Details */}
                <Route path="/classes" element={<ClassesPage />} />
                <Route path="/class/:classNum" element={<ClassSubjectsPage />} />
                <Route path="/class/:classNum/:subjectSlug" element={<SubjectMaterialTypesPage />} />
                <Route path="/class/:classNum/:subjectSlug/:typeSlug" element={<MaterialFilesListPage />} />
                <Route path="/material/:idOrSlug" element={<MaterialDetailsPage />} />
                <Route path="/study-materials" element={<StudyMaterialsPage />} />
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/olympiad" element={<OlympiadPage />} />
                <Route path="/olympiad/:classNum" element={<OlympiadSubjectsPage />} />
                <Route path="/olympiad/:classNum/:subjectSlug" element={<OlympiadMaterialTypesPage />} />
                <Route path="/olympiad/:classNum/:subjectSlug/:typeSlug" element={<OlympiadFilesPage />} />

                {/* Video Corner Hierarchy: Video Corner -> Category -> Subject -> Chapter -> Video */}
                <Route path="/video-corner" element={<VideoCornerPage />} />
                <Route path="/video-corner/:catSlug" element={<VideoCategorySubjectsPage />} />
                <Route path="/video-corner/:catSlug/:subjectSlug" element={<VideoSubjectChaptersPage />} />
                <Route path="/video-corner/:catSlug/:subjectSlug/:chapterSlug" element={<VideoChapterVideosPage />} />
                <Route path="/video-corner/:catSlug/:subjectSlug/:chapterSlug/:videoId" element={<VideoPlayerPage />} />
                <Route path="/video/:videoId" element={<VideoPlayerPage />} />

                {/* Public Quiz Listing */}
                <Route path="/quizzes" element={<QuizzesPage />} />

                {/* Information Pages */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy-policy" element={<AboutPage />} />
                <Route path="/terms" element={<AboutPage />} />

                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopUtilityBar } from './TopUtilityBar';
import { Header } from './Header';
import { Footer } from './Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Top Utility Bar with Live Clock, Language Dropdown & Theme Toggle */}
      <TopUtilityBar />

      {/* 2. Main India Post Inspired Header */}
      <Header />

      {/* 3. Page Content */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* 4. Educational Footer */}
      <Footer />
    </div>
  );
};

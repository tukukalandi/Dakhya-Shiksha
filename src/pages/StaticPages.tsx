import React from 'react';
import { GraduationCap, ShieldCheck, Heart, Mail, MapPin, Globe, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs items={[{ label: t('about') }]} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-12 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-400 p-2 flex items-center justify-center text-red-950 shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                About {t('brandName')}
              </h1>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{t('brandSubtitle')}</p>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
            <p>
              <strong>{t('brandName')}</strong> is a dedicated open-access educational repository and interactive learning network inspired by the reliability and nationwide reach of India Post's communication ethos. Our mission is to bridge the educational resource gap by providing high-quality, syllabus-aligned study materials directly to students, teachers, and parents across India.
            </p>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4">Our Vision & Core Objectives</h3>
            <ul className="space-y-2 list-none pl-0">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Universal Access:</strong> Ensure every pupil in Classes 1–10 has instant access to NCERT textbook chapters, worksheets, and model evaluation papers.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Olympiad & Competitive Readiness:</strong> Offer curated problem banks for IMO, NSO, IEO, and competitive foundation assessments.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Interactive Self-Testing:</strong> Provide safe, sandboxed HTML quizzes for instant concept reinforcement.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Multilingual Inclusivity:</strong> Serve students in English, Hindi (हिन्दी), and Odia (ଓଡ଼ିଆ).</span>
              </li>
            </ul>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4">Curriculum Alignment</h3>
            <p>
              All materials hosted on this portal adhere to the National Curriculum Framework (NCF) formulated by NCERT and recognized by the Central Board of Secondary Education (CBSE) and State School Examination Boards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs items={[{ label: t('contact') }]} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
            {t('contact')} Us
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-8">
            Have questions about study materials, question papers or educational videos? Send us a message.
          </p>

          {submitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl p-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">Message Received!</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                Thank you for contacting Dakshya Shiksha. Our academic support desk will get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700"
                  placeholder="Material inquiry, feedback or report an error"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-red-700"
                  placeholder="Describe your inquiry in detail..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

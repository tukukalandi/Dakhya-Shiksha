import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  Calculator,
  Microscope,
  Compass,
  Layers,
  BrainCircuit,
  FileText,
  Video as VideoIcon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ColorfulCard, CardColor, COLOR_PALETTE } from '../components/common/ColorfulCard';
import { StudyMaterial } from '../types';
import { fetchStudyMaterials } from '../lib/firebase';
import { normalizeClass, normalizeText } from '../lib/utils';

const classIcons = [
  Sparkles,
  BookOpen,
  Compass,
  Calculator,
  Layers,
  Microscope,
  BrainCircuit,
  FileText,
  Award,
  GraduationCap
];

export const OlympiadPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStudyMaterials().then((mats) => {
      setMaterials(mats);
      setLoading(false);
    });
  }, []);

  const classes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Helper to count Olympiad materials for a given class
  const getOlympiadCountForClass = (classNum: number): number => {
    const targetClass = `Class ${classNum}`;
    return materials.filter(m => {
      if (!m.isPublished) return false;
      const classMatches = normalizeClass(m.classLevel) === targetClass;
      if (!classMatches) return false;

      const isOlyExam = normalizeText(m.examType).includes('olympiad');
      const inTitle = normalizeText(m.title).includes('olympiad') || 
                      normalizeText(m.title).includes('imo') || 
                      normalizeText(m.title).includes('nso') || 
                      normalizeText(m.title).includes('ieo') ||
                      normalizeText(m.title).includes('nco');
      const inTags = (m.tags || []).some(tag => normalizeText(tag).includes('olympiad'));
      return isOlyExam || inTitle || inTags;
    }).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs items={[{ label: t('olympiad') }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-red-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 sm:p-10 mb-10 shadow-lg border-b-4 border-amber-400">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-400/30">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Competitive Excellence</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t('olympiadTitle')}
            </h1>
            <p className="text-sm text-amber-100/90 mt-2 leading-relaxed">
              Step 1 of 4: Select your Class below to access subject-wise Olympiad workbooks, previous year solved papers, and mock challenges.
            </p>
          </div>
        </div>

        {/* Classes 1-10 Cards Section */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-block px-3 py-1 rounded-md bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                Select Your Class
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Olympiad Preparation by Class (Classes 1–10)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click on any class card to view available Olympiad subjects (Mathematics, Science, English, Cyber, Reasoning).
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
              <span>{t('loading')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {classes.map((clsNum, idx) => {
                const count = getOlympiadCountForClass(clsNum);
                const color: CardColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
                const Icon = classIcons[idx] || Award;

                return (
                  <ColorfulCard
                    key={clsNum}
                    title={`Class ${clsNum}`}
                    subtitle={`IMO, NSO, IEO, NCO & Reasoning Workbooks`}
                    badge="Olympiad Prep"
                    color={color}
                    icon={Icon}
                    count={count}
                    countLabel="Olympiad files"
                    actionText="Select Class"
                    onClick={() => {
                      navigate(`/olympiad/${clsNum}`);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Links to Olympiad Videos */}
        <div className="bg-amber-50 dark:bg-slate-900 border-2 border-amber-300/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-red-900 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
              <VideoIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Looking for Olympiad Video Lessons?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Watch speed tricks, mental arithmetic shortcuts, and difficult past problem walkthroughs in the Video Corner.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/video-corner')}
            className="px-6 py-3 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <span>Go to Olympiad Videos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

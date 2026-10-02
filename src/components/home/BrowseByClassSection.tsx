import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  FileText, 
  Layers, 
  Compass, 
  BrainCircuit, 
  Award, 
  Calculator, 
  Microscope,
  LucideIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ColorfulCard, CardColor, COLOR_PALETTE } from '../common/ColorfulCard';
import { StudyMaterial } from '../../types';
import { normalizeClass, isOlympiadMaterial } from '../../lib/utils';

interface BrowseByClassSectionProps {
  materials: StudyMaterial[];
}

const classIcons: Record<number, LucideIcon> = {
  1: Sparkles,
  2: BookOpen,
  3: Compass,
  4: Calculator,
  5: Layers,
  6: Microscope,
  7: BrainCircuit,
  8: FileText,
  9: Award,
  10: GraduationCap
};

export const BrowseByClassSection: React.FC<BrowseByClassSectionProps> = ({ materials }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const classes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Count materials per class using normalized matching (strictly excluding Olympiad)
  const getMaterialCountForClass = (classNum: number): number => {
    const target = `Class ${classNum}`;
    return materials.filter(m => 
      normalizeClass(m.classLevel) === target && 
      m.isPublished && 
      !isOlympiadMaterial(m)
    ).length;
  };

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900/60 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 border border-red-200 dark:border-red-900">
            <GraduationCap className="w-3.5 h-3.5 text-red-700 dark:text-amber-400" />
            <span>Structured School Curriculum</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('studyMaterialsByClass')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {t('classesSubtitle')}
          </p>
        </div>

        {/* Classes 1-10 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {classes.map((clsNum, idx) => {
            const count = getMaterialCountForClass(clsNum);
            const color: CardColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
            const Icon = classIcons[clsNum] || GraduationCap;

            return (
              <ColorfulCard
                key={clsNum}
                title={`Class ${clsNum}`}
                subtitle={`NCERT Textbooks, Question Papers & Notes`}
                badge={`Grade ${clsNum}`}
                color={color}
                icon={Icon}
                count={count}
                countLabel={t('materialsCount')}
                actionText={t('explore')}
                onClick={() => {
                  // Direct navigation flow: Class -> Subject -> Material Type -> Files
                  navigate(`/class/${clsNum}`);
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

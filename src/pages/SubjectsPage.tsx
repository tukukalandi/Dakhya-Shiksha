import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Microscope, 
  Languages, 
  BookOpen, 
  Globe, 
  Laptop, 
  HelpCircle, 
  BrainCircuit, 
  Atom,
  Layers,
  Compass,
  FolderKanban,
  Rocket
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ColorfulCard, CardColor, COLOR_PALETTE } from '../components/common/ColorfulCard';
import { StudyMaterial } from '../types';
import { fetchStudyMaterials } from '../lib/firebase';
import { normalizeSubject, isOlympiadMaterial } from '../lib/utils';

export const SubjectsPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStudyMaterials().then(data => {
      setMaterials(data);
      setLoading(false);
    });
  }, []);

  const subjects = [
    { name: 'Mathematics', desc: 'Arithmetic, algebra, geometry, trigonometry and data handling', icon: Calculator },
    { name: 'Science', desc: 'Physics, chemistry, biology, environmental sciences and experiments', icon: Microscope },
    { name: 'English', desc: 'Marigold, Honeycomb, First Flight literature, poetry and grammar', icon: BookOpen },
    { name: 'Hindi', desc: 'Rimjhim, Vasant, Kshitij prose, poetry and grammar exercises', icon: Languages },
    { name: 'Odia', desc: 'State board Odia literature, sahitya and bhasha worksheets', icon: Languages },
    { name: 'TWAU', desc: 'The World Around Us - EVS integrated sciences for primary grades', icon: Compass },
    { name: 'Social Science', desc: 'History, geography, political science and democratic economics', icon: Globe },
    { name: 'Computer', desc: 'Computer science, coding logic, IT applications and digital literacy', icon: Laptop },
    { name: 'General Knowledge', desc: 'National affairs, world discoveries, flora, fauna and quiz banks', icon: HelpCircle },
    { name: 'Reasoning', desc: 'Mental ability tests, patterns, analogies and logical deductions', icon: BrainCircuit },
    { name: 'Multi Disciplinary Project (MDP)', desc: 'Interdisciplinary theme tasks, art-integrated activities & student portfolios', icon: FolderKanban },
    { name: 'Project Based Learning (PBL)', desc: 'Hands-on inquiry-based learning, practical experiments and real-world investigations', icon: Rocket }
  ];

  const getCount = (subjName: string) => {
    const target = normalizeSubject(subjName);
    return materials.filter(m => 
      normalizeSubject(m.subject) === target && 
      m.isPublished && 
      !isOlympiadMaterial(m)
    ).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs items={[{ label: t('subjects') }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-md bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            Curriculum Disciplines
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore by Subject
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Browse NCERT textbooks, chapter summaries, solutions and question papers across all subjects.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {subjects.map((subj, idx) => {
            const count = getCount(subj.name);
            const color: CardColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
            const Icon = subj.icon;

            return (
              <ColorfulCard
                key={subj.name}
                title={subj.name}
                subtitle={subj.desc}
                badge="Subject"
                color={color}
                icon={Icon}
                count={count}
                countLabel={t('materialsCount')}
                actionText="View Materials"
                onClick={() => {
                  navigate(`/study-materials?subject=${encodeURIComponent(subj.name)}`);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

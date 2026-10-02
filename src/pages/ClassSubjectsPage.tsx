import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Calculator, 
  Layers, 
  Languages, 
  Microscope, 
  Globe, 
  Laptop, 
  HelpCircle, 
  BrainCircuit, 
  Compass, 
  Atom, 
  FileText,
  FolderKanban,
  Rocket,
  LucideIcon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ColorfulCard, CardColor, COLOR_PALETTE } from '../components/common/ColorfulCard';
import { StudyMaterial } from '../types';
import { fetchStudyMaterials } from '../lib/firebase';
import { normalizeClass, normalizeSubject, createSlug, isOlympiadMaterial } from '../lib/utils';

const subjectIcons: Record<string, LucideIcon> = {
  'All Subjects': Layers,
  'Hindi': Languages,
  'English': BookOpen,
  'Math': Calculator,
  'Mathematics': Calculator,
  'TWAU': Compass,
  'Science': Microscope,
  'Odia': Languages,
  'Social Science': Globe,
  'Computer': Laptop,
  'General Knowledge': HelpCircle,
  'Reasoning': BrainCircuit,
  'Physics': Atom,
  'Chemistry': Microscope,
  'Biology': Atom,
  'Multi Disciplinary Project (MDP)': FolderKanban,
  'Multi Disciplinary Project(MDP)': FolderKanban,
  'Project Based Learning (PBL)': Rocket,
  'Project Based Learning(PBL)': Rocket,
  'Other': FileText
};

export const ClassSubjectsPage: React.FC = () => {
  const { classNum } = useParams<{ classNum: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const formattedClass = normalizeClass(classNum || '5');
  const classDigits = formattedClass.replace(/\D/g, '');
  const classNumber = parseInt(classDigits || '5', 10);

  useEffect(() => {
    fetchStudyMaterials()
      .then(data => setMaterials(data))
      .finally(() => setLoading(false));
  }, []);

  // Determine subjects strictly based on Requirement 7
  let subjectsToShow: { name: string; subtitle: string }[] = [];

  if (classNumber >= 1 && classNumber <= 5) {
    // Classes 1–5 Subjects including MDP & PBL
    subjectsToShow = [
      { name: 'All Subjects', subtitle: 'Curated comprehensive combined materials' },
      { name: 'Hindi', subtitle: 'Rimjhim textbooks, grammar and worksheets' },
      { name: 'English', subtitle: 'Marigold literature, phonics and stories' },
      { name: 'Math', subtitle: 'Math-Magic arithmetic, geometry and puzzles' },
      { name: 'TWAU', subtitle: 'The World Around Us (Environmental Studies)' },
      { name: 'Multi Disciplinary Project (MDP)', subtitle: 'Theme-based holistic projects & art integrated tasks' },
      { name: 'Project Based Learning (PBL)', subtitle: 'Hands-on inquiry learning, real-world problems & experiments' }
    ];
  } else {
    // Classes 6–10: Dynamically derived from available materials or standard curriculum pool
    const classMaterials = materials.filter(
      m => normalizeClass(m.classLevel) === formattedClass && m.isPublished && !isOlympiadMaterial(m)
    );
    const existingSubjects = new Set(
      classMaterials.map(m => normalizeSubject(m.subject)).filter(Boolean)
    );

    // Default core subjects for middle/secondary schools including MDP & PBL
    const defaultPool = [
      'Mathematics',
      'Science',
      'English',
      'Hindi',
      'Odia',
      'Social Science',
      'Computer',
      'General Knowledge',
      'Reasoning',
      'Multi Disciplinary Project (MDP)',
      'Project Based Learning (PBL)'
    ];

    if (classNumber >= 9) {
      defaultPool.push('Physics', 'Chemistry', 'Biology');
    }

    // Merge existing and defaults without duplicates
    const combined = Array.from(new Set([...Array.from(existingSubjects), ...defaultPool]));
    subjectsToShow = combined.map(subj => {
      let subDesc = 'Syllabus notes, NCERT chapters & exam papers';
      if (subj === 'Multi Disciplinary Project (MDP)') {
        subDesc = 'Theme-based holistic projects & art integrated tasks';
      } else if (subj === 'Project Based Learning (PBL)') {
        subDesc = 'Hands-on inquiry learning, real-world problems & experiments';
      }
      return {
        name: subj,
        subtitle: subDesc
      };
    });
  }

  // Count files for class + subject (strictly excluding Olympiad)
  const getSubjectCount = (subjectName: string): number => {
    if (subjectName === 'All Subjects') {
      return materials.filter(
        m => normalizeClass(m.classLevel) === formattedClass && m.isPublished && !isOlympiadMaterial(m)
      ).length;
    }
    const normTarget = normalizeSubject(subjectName);
    return materials.filter(
      m =>
        normalizeClass(m.classLevel) === formattedClass &&
        normalizeSubject(m.subject) === normTarget &&
        m.isPublished &&
        !isOlympiadMaterial(m)
    ).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Breadcrumbs
        items={[
          { label: t('classes'), to: '/classes' },
          { label: formattedClass }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-md bg-red-100 dark:bg-red-950 text-red-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            Step 1 of 3: Subject Selection
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formattedClass} — {t('selectSubject')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Choose a subject to view available NCERT books, question papers, worksheets, and study notes.
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {subjectsToShow.map((subject, idx) => {
            const count = getSubjectCount(subject.name);
            const color: CardColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
            const Icon = subjectIcons[subject.name] || BookOpen;

            return (
              <ColorfulCard
                key={subject.name}
                title={subject.name}
                subtitle={subject.subtitle}
                badge={formattedClass}
                color={color}
                icon={Icon}
                count={count}
                countLabel={t('materialsCount')}
                actionText="Select Subject"
                onClick={() => {
                  // Direct navigation flow: Class -> Subject -> Material Type
                  const slug = createSlug(subject.name);
                  navigate(`/class/${classDigits}/${slug}`);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

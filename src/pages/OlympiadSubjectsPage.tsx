import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Microscope, 
  Languages, 
  Laptop, 
  BrainCircuit, 
  HelpCircle, 
  Award,
  Layers,
  LucideIcon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ColorfulCard, CardColor, COLOR_PALETTE } from '../components/common/ColorfulCard';
import { StudyMaterial } from '../types';
import { fetchStudyMaterials } from '../lib/firebase';
import { normalizeClass, normalizeSubject, normalizeText, createSlug } from '../lib/utils';

interface OlympiadSubjectDef {
  name: string;
  slug: string;
  code: string;
  desc: string;
  icon: LucideIcon;
  subjectMatcher: (subject: string, title: string, tags?: string[]) => boolean;
}

export const OlympiadSubjectsPage: React.FC = () => {
  const { classNum } = useParams<{ classNum: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const formattedClass = normalizeClass(classNum || '5');
  const classDigits = formattedClass.replace(/\D/g, '') || '5';

  useEffect(() => {
    fetchStudyMaterials().then(data => {
      setMaterials(data);
      setLoading(false);
    });
  }, []);

  const olympiadSubjectDefs: OlympiadSubjectDef[] = [
    {
      name: 'Mathematics Olympiad (IMO)',
      slug: 'mathematics',
      code: 'IMO',
      desc: 'International Mathematics Olympiad question papers, speed math & level 1-2 tests',
      icon: Calculator,
      subjectMatcher: (subj, title, tags = []) => {
        const s = normalizeSubject(subj);
        const t = title.toLowerCase();
        return s === 'Mathematics' || s === 'Math' || t.includes('imo') || t.includes('math') || tags.some(tag => tag.toLowerCase().includes('imo'));
      }
    },
    {
      name: 'Science Olympiad (NSO)',
      slug: 'science',
      code: 'NSO',
      desc: 'National Science Olympiad physics, chemistry, biology & scientific reasoning',
      icon: Microscope,
      subjectMatcher: (subj, title, tags = []) => {
        const s = normalizeSubject(subj);
        const t = title.toLowerCase();
        return s === 'Science' || t.includes('nso') || t.includes('science') || tags.some(tag => tag.toLowerCase().includes('nso'));
      }
    },
    {
      name: 'English Olympiad (IEO)',
      slug: 'english',
      code: 'IEO',
      desc: 'International English Olympiad grammar, comprehension, vocabulary and verbal challenge',
      icon: Languages,
      subjectMatcher: (subj, title, tags = []) => {
        const s = normalizeSubject(subj);
        const t = title.toLowerCase();
        return s === 'English' || t.includes('ieo') || t.includes('english') || tags.some(tag => tag.toLowerCase().includes('ieo'));
      }
    },
    {
      name: 'Cyber & Computer Olympiad (NCO)',
      slug: 'computer',
      code: 'NCO',
      desc: 'National Cyber Olympiad algorithms, hardware, networking, coding logic & cyber safety',
      icon: Laptop,
      subjectMatcher: (subj, title, tags = []) => {
        const s = normalizeSubject(subj);
        const t = title.toLowerCase();
        return s === 'Computer' || t.includes('nco') || t.includes('cyber') || t.includes('computer');
      }
    },
    {
      name: 'Logical Reasoning & Mental Ability',
      slug: 'reasoning',
      code: 'REASONING',
      desc: 'Analogy, series completion, coding-decoding, blood relations and pictorial logic',
      icon: BrainCircuit,
      subjectMatcher: (subj, title, tags = []) => {
        const s = normalizeSubject(subj);
        const t = title.toLowerCase();
        return s === 'Reasoning' || t.includes('reasoning') || t.includes('mental ability') || t.includes('logic');
      }
    },
    {
      name: 'General Knowledge Olympiad (SKGKO)',
      slug: 'general-knowledge',
      code: 'SKGKO',
      desc: 'Current affairs, world geography, history, inventions, flora & fauna facts',
      icon: HelpCircle,
      subjectMatcher: (subj, title, tags = []) => {
        const s = normalizeSubject(subj);
        const t = title.toLowerCase();
        return s === 'General Knowledge' || t.includes('gk') || t.includes('skgko');
      }
    },
    {
      name: 'All Olympiad Subjects',
      slug: 'all-subjects',
      code: 'ALL',
      desc: 'Combined Olympiad model question papers, sample practice books and revision sheets',
      icon: Layers,
      subjectMatcher: () => true
    }
  ];

  // Filter materials for this class that are Olympiad materials
  const classOlympiadMaterials = materials.filter(m => {
    if (!m.isPublished) return false;
    const classMatch = normalizeClass(m.classLevel) === formattedClass;
    if (!classMatch) return false;

    const isOlyExam = normalizeText(m.examType).includes('olympiad');
    const inTitle = normalizeText(m.title).includes('olympiad') || 
                    normalizeText(m.title).includes('imo') || 
                    normalizeText(m.title).includes('nso') || 
                    normalizeText(m.title).includes('ieo') ||
                    normalizeText(m.title).includes('nco');
    const inTags = (m.tags || []).some(tag => normalizeText(tag).includes('olympiad'));
    return isOlyExam || inTitle || inTags;
  });

  const getSubjectCount = (subDef: OlympiadSubjectDef): number => {
    if (subDef.slug === 'all-subjects') {
      return classOlympiadMaterials.length;
    }
    return classOlympiadMaterials.filter(m => subDef.subjectMatcher(m.subject, m.title, m.tags)).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs
        items={[
          { label: t('olympiad'), to: '/olympiad' },
          { label: formattedClass }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            Step 2 of 4: Select Olympiad Subject
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formattedClass} Olympiad Subjects
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Choose a subject to view available Material Types (Mock Tests, Previous Year Papers, Practice Sheets) for {formattedClass}.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
            <span>{t('loading')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {olympiadSubjectDefs.map((subDef, idx) => {
              const count = getSubjectCount(subDef);
              const color: CardColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
              const Icon = subDef.icon;

              return (
                <ColorfulCard
                  key={subDef.slug}
                  title={subDef.name}
                  subtitle={subDef.desc}
                  badge={subDef.code}
                  color={color}
                  icon={Icon}
                  count={count}
                  countLabel="uploaded files"
                  actionText="Select Subject"
                  onClick={() => {
                    navigate(`/olympiad/${classDigits}/${subDef.slug}`);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

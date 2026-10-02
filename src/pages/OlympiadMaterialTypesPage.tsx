import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Award, 
  Sparkles, 
  FileSpreadsheet, 
  Layers, 
  FileText, 
  HelpCircle, 
  BookOpen, 
  Bookmark, 
  FileCode,
  BookMarked,
  FileQuestion,
  LucideIcon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ColorfulCard, CardColor, COLOR_PALETTE } from '../components/common/ColorfulCard';
import { StudyMaterial } from '../types';
import { fetchStudyMaterials } from '../lib/firebase';
import { 
  normalizeClass, 
  normalizeSubject, 
  normalizeMaterialType, 
  normalizeText, 
  createSlug 
} from '../lib/utils';

const typeIcons: Record<string, LucideIcon> = {
  'Mock Tests': CheckCircle2,
  'Question Papers': FileQuestion,
  'Previous Year Papers': Award,
  'Model Papers': Sparkles,
  'Practice Papers': FileSpreadsheet,
  'Worksheets': Layers,
  'Study Notes': FileText,
  'Chapter Notes': Bookmark,
  'Important Questions': HelpCircle,
  'Solutions': BookOpen,
  'NCERT Book': BookMarked,
  'Syllabus': FileCode,
  'Other': FileText
};

export const OlympiadMaterialTypesPage: React.FC = () => {
  const { classNum, subjectSlug } = useParams<{ classNum: string; subjectSlug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const formattedClass = normalizeClass(classNum || '5');
  const classDigits = formattedClass.replace(/\D/g, '') || '5';

  const subjectDisplayNames: Record<string, string> = {
    'mathematics': 'Mathematics Olympiad (IMO)',
    'science': 'Science Olympiad (NSO)',
    'english': 'English Olympiad (IEO)',
    'computer': 'Cyber & Computer Olympiad (NCO)',
    'reasoning': 'Logical Reasoning & Mental Ability',
    'general-knowledge': 'General Knowledge Olympiad (SKGKO)',
    'all-subjects': 'All Olympiad Subjects'
  };

  const currentSubjectName = subjectDisplayNames[subjectSlug || 'all-subjects'] || (subjectSlug || '').replace(/-/g, ' ');

  useEffect(() => {
    fetchStudyMaterials().then(data => {
      setMaterials(data);
      setLoading(false);
    });
  }, []);

  // Standard Olympiad material categories
  const olympiadMaterialTypes = [
    { name: 'Mock Tests', desc: 'Full length timed Olympiad Level 1 & 2 mock challenge papers' },
    { name: 'Question Papers', desc: 'Official and sample question papers for Olympiad Level 1 & 2 tests' },
    { name: 'Previous Year Papers', desc: 'Previous 5-year solved Olympiad question papers with answer keys' },
    { name: 'Model Papers', desc: 'Sample question papers based on latest Olympiad marking scheme' },
    { name: 'Practice Papers', desc: 'Speed mathematics, logical puzzles and daily challenge sets' },
    { name: 'Worksheets', desc: 'Topic-wise exercises, multiple choice questions and fill-ups' },
    { name: 'Study Notes', desc: 'Concept handbooks, formulas, short tricks and revision summaries' },
    { name: 'Chapter Notes', desc: 'Chapter-wise key points, diagrams, formulas and concept summaries' },
    { name: 'Important Questions', desc: 'High-frequency Olympiad questions and recurring concepts' },
    { name: 'Solutions', desc: 'Step-by-step detailed explanations for complex Olympiad questions' },
    { name: 'NCERT Book', desc: 'Standard foundation textbook chapters and syllabus guides' },
    { name: 'Syllabus', desc: 'Official Olympiad curriculum, chapter weightage and exam pattern' }
  ];

  // Subject matching logic
  const matchesSubject = (m: StudyMaterial, slug: string): boolean => {
    if (slug === 'all-subjects') return true;
    const s = normalizeSubject(m.subject);
    const title = m.title.toLowerCase();
    const tags = (m.tags || []).map(t => t.toLowerCase());

    if (slug === 'mathematics') {
      return s === 'Mathematics' || s === 'Math' || title.includes('imo') || title.includes('math') || tags.some(t => t.includes('imo') || t.includes('math'));
    }
    if (slug === 'science') {
      return s === 'Science' || title.includes('nso') || title.includes('science') || tags.some(t => t.includes('nso') || t.includes('science'));
    }
    if (slug === 'english') {
      return s === 'English' || title.includes('ieo') || title.includes('english') || tags.some(t => t.includes('ieo') || t.includes('english'));
    }
    if (slug === 'computer') {
      return s === 'Computer' || title.includes('nco') || title.includes('cyber') || title.includes('computer');
    }
    if (slug === 'reasoning') {
      return s === 'Reasoning' || title.includes('reasoning') || title.includes('mental ability') || title.includes('logic');
    }
    if (slug === 'general-knowledge') {
      return s === 'General Knowledge' || title.includes('gk') || title.includes('skgko');
    }
    return s.toLowerCase() === slug.toLowerCase();
  };

  // Filter materials for this Class and Subject
  const matchingOlympiadMaterials = materials.filter(m => {
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
    
    if (!(isOlyExam || inTitle || inTags)) return false;

    return matchesSubject(m, subjectSlug || 'all-subjects');
  });

  const getTypeCount = (typeName: string): number => {
    const target = normalizeMaterialType(typeName);
    return matchingOlympiadMaterials.filter(
      m => normalizeMaterialType(m.materialType) === target
    ).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs
        items={[
          { label: t('olympiad'), to: '/olympiad' },
          { label: formattedClass, to: `/olympiad/${classDigits}` },
          { label: currentSubjectName }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            Step 3 of 4: Select Material Type
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formattedClass} &gt; {currentSubjectName} — Material Types
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Choose a resource category (Mock Tests, Previous Year Papers, Practice Sheets) to view uploaded files.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mr-3" />
            <span>{t('loading')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {olympiadMaterialTypes.map((item, idx) => {
              const count = getTypeCount(item.name);
              const color: CardColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
              const Icon = typeIcons[item.name] || FileText;

              return (
                <ColorfulCard
                  key={item.name}
                  title={item.name}
                  subtitle={item.desc}
                  badge={`${count} Files`}
                  color={color}
                  icon={Icon}
                  count={count}
                  countLabel="uploaded files"
                  actionText="View Files"
                  onClick={() => {
                    const typeSlug = createSlug(item.name);
                    navigate(`/olympiad/${classDigits}/${subjectSlug}/${typeSlug}`);
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

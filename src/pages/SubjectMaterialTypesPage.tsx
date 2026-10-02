import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookMarked, 
  FileText, 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Award, 
  FileSpreadsheet, 
  Bookmark, 
  FileCode,
  BookOpen,
  LucideIcon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ColorfulCard, CardColor, COLOR_PALETTE } from '../components/common/ColorfulCard';
import { StudyMaterial } from '../types';
import { fetchStudyMaterials } from '../lib/firebase';
import { normalizeClass, normalizeSubject, normalizeMaterialType, createSlug, isOlympiadMaterial } from '../lib/utils';

const typeIcons: Record<string, LucideIcon> = {
  'NCERT Book': BookMarked,
  'Study Notes': FileText,
  'Chapter Notes': Bookmark,
  'Question Papers': HelpCircle,
  'Previous Year Papers': Award,
  'Model Papers': Sparkles,
  'Practice Papers': FileSpreadsheet,
  'Sample Papers': FileText,
  'Mock Tests': CheckCircle2,
  'Worksheets': Layers,
  'Answer Keys': CheckCircle2,
  'Solutions': BookOpen,
  'Revision Notes': Bookmark,
  'Important Questions': HelpCircle,
  'Syllabus': FileCode,
  'Other': FileText
};

export const SubjectMaterialTypesPage: React.FC = () => {
  const { classNum, subjectSlug } = useParams<{ classNum: string; subjectSlug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const formattedClass = normalizeClass(classNum || '5');
  const classDigits = formattedClass.replace(/\D/g, '');

  // Reverse slug to readable subject name
  const rawSubject = (subjectSlug || '').replace(/-/g, ' ');
  const formattedSubject = normalizeSubject(rawSubject);

  useEffect(() => {
    fetchStudyMaterials()
      .then(data => setMaterials(data))
      .finally(() => setLoading(false));
  }, []);

  // Standard Material Types pool as specified in Section 8
  const baseMaterialTypes = [
    'NCERT Book',
    'Study Notes',
    'Chapter Notes',
    'Question Papers',
    'Previous Year Papers',
    'Model Papers',
    'Practice Papers',
    'Sample Papers',
    'Mock Tests',
    'Worksheets',
    'Answer Keys',
    'Solutions',
    'Revision Notes',
    'Important Questions',
    'Syllabus'
  ];

  // Check if selected subject is PBL or MDP
  const isPblOrMdp = 
    formattedSubject === 'Multi Disciplinary Project (MDP)' ||
    formattedSubject === 'Project Based Learning (PBL)' ||
    formattedSubject.toLowerCase().includes('multi disciplinary project') ||
    formattedSubject.toLowerCase().includes('project based learning') ||
    formattedSubject.toLowerCase() === 'mdp' ||
    formattedSubject.toLowerCase() === 'pbl' ||
    (subjectSlug || '').toLowerCase().includes('mdp') ||
    (subjectSlug || '').toLowerCase().includes('pbl');

  // If PBL or MDP is selected, show strictly only two material types: Study Notes and Solutions
  const activeMaterialTypes = isPblOrMdp
    ? ['Study Notes', 'Solutions']
    : baseMaterialTypes;

  // Filter materials for this Class and Subject (strictly excluding Olympiad)
  const matchingMaterials = materials.filter(m => {
    const classMatch = normalizeClass(m.classLevel) === formattedClass;
    const subjMatch =
      formattedSubject === 'All Subjects' ||
      normalizeSubject(m.subject) === formattedSubject;
    return classMatch && subjMatch && m.isPublished && !isOlympiadMaterial(m);
  });

  // Material count per type (seamlessly including legacy 'Chapter' under 'NCERT Book')
  const getTypeCount = (type: string): number => {
    const target = normalizeMaterialType(type);
    return matchingMaterials.filter(
      m => normalizeMaterialType(m.materialType) === target
    ).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Breadcrumbs
        items={[
          { label: t('classes'), to: '/classes' },
          { label: formattedClass, to: `/class/${classDigits}` },
          { label: formattedSubject }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            Step 2 of 3: Material Category
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formattedClass} &gt; {formattedSubject} — {t('selectMaterialType')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Choose a resource category to view and download study materials from Google Drive.
          </p>
        </div>

        {/* Material Types Grid */}
        <div className={`grid gap-5 ${isPblOrMdp ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
          {activeMaterialTypes.map((type, idx) => {
            const count = getTypeCount(type);
            const color: CardColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
            const Icon = typeIcons[type] || FileText;

            let cardSubtitle = `Original verified ${type} for ${formattedClass} ${formattedSubject}`;
            if (isPblOrMdp) {
              if (type === 'Study Notes') {
                cardSubtitle = `Project themes, background concepts, activity guidelines and worksheets`;
              } else if (type === 'Solutions') {
                cardSubtitle = `Solved model project files, complete answers and sample submissions`;
              }
            }

            return (
              <ColorfulCard
                key={type}
                title={type}
                subtitle={cardSubtitle}
                badge={`${count} Files`}
                color={color}
                icon={Icon}
                count={count}
                countLabel={t('materialsCount')}
                actionText="View Files"
                onClick={() => {
                  // Direct navigation flow: Class -> Subject -> Material Type -> Files
                  const typeSlug = createSlug(type);
                  navigate(`/class/${classDigits}/${subjectSlug}/${typeSlug}`);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { BrowseByClassSection } from '../components/home/BrowseByClassSection';
import { StudyMaterial } from '../types';
import { fetchStudyMaterials } from '../lib/firebase';

export const ClassesPage: React.FC = () => {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);

  useEffect(() => {
    fetchStudyMaterials().then(setMaterials);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Breadcrumbs items={[{ label: t('classes') }]} />
      <BrowseByClassSection materials={materials} />
    </div>
  );
};

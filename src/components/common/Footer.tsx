import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Mail, 
  MapPin, 
  Heart, 
  BookOpen, 
  Layers, 
  Video, 
  HelpCircle, 
  Award,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-red-950 text-slate-300 border-t-4 border-amber-400 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-amber-400 p-1 flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-red-950" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">{t('brandName')}</h3>
                <p className="text-xs text-amber-300 font-medium">{t('brandSubtitle')}</p>
              </div>
            </div>
            
            <p className="text-xs leading-relaxed text-slate-300 max-w-sm">
              {t('footerAboutText')}
            </p>

            <div className="pt-2 text-xs space-y-1.5 text-slate-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Dak Bhawan / State Educational Division, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>support@dakshyashiksha.edu.in</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3 border-b border-red-800/80 pb-1">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-amber-300 transition flex items-center space-x-1">
                  <span>{t('home')}</span>
                </Link>
              </li>
              <li>
                <Link to="/study-materials" className="hover:text-amber-300 transition">
                  {t('studyMaterials')}
                </Link>
              </li>
              <li>
                <Link to="/video-corner" className="hover:text-amber-300 transition">
                  {t('videoCorner')}
                </Link>
              </li>
              <li>
                <Link to="/quizzes" className="hover:text-amber-300 transition">
                  {t('quiz')}
                </Link>
              </li>
              <li>
                <Link to="/olympiad" className="hover:text-amber-300 transition">
                  {t('olympiad')}
                </Link>
              </li>
              <li>
                <Link to="/subjects" className="hover:text-amber-300 transition">
                  {t('subjects')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Browse Classes */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3 border-b border-red-800/80 pb-1">
              {t('classes')} 1–10
            </h4>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => (
                <Link
                  key={cls}
                  to={`/class/${cls}`}
                  className="hover:text-amber-300 transition hover:underline"
                >
                  Class {cls}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Resources & Storage */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3 border-b border-red-800/80 pb-1">
              Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition flex items-center space-x-1"
                >
                  <span>Google Drive Repository</span>
                  <ExternalLink className="w-3 h-3 text-amber-400" />
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-300 transition">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-300 transition">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-amber-300 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-300 transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Copyright */}
        <div className="mt-10 pt-6 border-t border-red-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 {t('brandName')} Portal. {t('allRightsReserved')}</p>
          <p className="flex items-center space-x-1 text-slate-400">
            <span>India Post Inspired Learning Initiative</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

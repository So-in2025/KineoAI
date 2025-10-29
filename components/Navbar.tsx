import React from 'react';
import { Page } from '../App';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userCredits: number;
}

const NavItem: React.FC<{
  label: string;
  page: Page;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}> = ({ label, page, currentPage, onNavigate }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => onNavigate(page)}
      className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'text-cyan-400'
          : 'text-slate-300 hover:text-white'
      }`}
    >
      {label}
      {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-cyan-400 rounded-full"></span>}
    </button>
  );
};

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, userCredits }) => {
  const { t } = useTranslation();
  return (
    <nav className="bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 text-white font-bold text-xl cursor-pointer group transition-transform duration-300 hover:scale-105" 
              onClick={() => onNavigate('home')}
            >
              Kineo<span className="text-cyan-400 group-hover:animate-pulse">AI</span>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavItem label={t('navbar.home')} page="home" currentPage={currentPage} onNavigate={onNavigate} />
              <NavItem label={t('navbar.generator')} page="generator" currentPage={currentPage} onNavigate={onNavigate} />
              <NavItem label={t('navbar.studio')} page="studio" currentPage={currentPage} onNavigate={onNavigate} />
            </div>
          </div>
           <div className="flex items-center">
             <div className="hidden sm:flex items-center bg-slate-800/50 border border-slate-700 rounded-full px-3 py-1 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="m12 1.5-9 5.2v10.3l9 5.2 9-5.2V6.7Z"></path><path d="m12 1.5 9 5.2"></path><path d="M3 6.7 12 12"></path><path d="m21 6.7-9 5.2"></path><path d="M12 22.5V12"></path></svg>
                <span className="ml-2 font-medium text-slate-300">{userCredits}</span>
                <span className="ml-1 text-slate-400">{t('navbar.credits')}</span>
             </div>
             <LanguageSwitcher />
           </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
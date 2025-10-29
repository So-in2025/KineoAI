import React from 'react';
import { Page } from '../../App';
import { useTranslation } from '../../hooks/useTranslation';

interface HomePageProps {
    onNavigate: (page: Page) => void;
}

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactElement }> = ({ title, description, icon }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 transform hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-cyan-500 text-white mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="mt-2 text-slate-400">{description}</p>
        </div>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-scale">
        <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
                {t('home.title.part1')} <span className="text-cyan-400">{t('home.title.part2')}</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
                {t('home.subtitle')}
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <button
                    onClick={() => onNavigate('generator')}
                    className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800 animate-pulse hover:animate-none"
                >
                    <span className="relative px-8 py-3 transition-all ease-in duration-75 bg-slate-900 rounded-md group-hover:bg-opacity-0">
                        {t('home.createButton')} 🔥
                    </span>
                </button>
            </div>
        </div>

        <div className="mt-24">
            <h2 className="text-3xl font-bold text-center text-white">{t('home.howItWorks.title')}</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
                <FeatureCard 
                    title={t('home.howItWorks.card1.title')}
                    description={t('home.howItWorks.card1.description')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>}
                />
                <FeatureCard 
                    title={t('home.howItWorks.card2.title')}
                    description={t('home.howItWorks.card2.description')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>}
                />
                <FeatureCard 
                    title={t('home.howItWorks.card3.title')}
                    description={t('home.howItWorks.card3.description')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
                />
            </div>
        </div>
    </div>
  );
};

export default HomePage;
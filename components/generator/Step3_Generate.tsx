
import React, { useState, useEffect } from 'react';
import { Shot } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface Step3GenerateProps {
    isLoading: boolean;
    onGenerate: () => void;
    onBack: () => void;
    imageFile: File | null;
    shots: Shot[];
    userCredits: number;
    error: string | null;
    setError: (error: string | null) => void;
    generatingShotIndex: number | null;
}

const Step3Generate: React.FC<Step3GenerateProps> = ({ isLoading, onGenerate, onBack, imageFile, shots, userCredits, error, setError, generatingShotIndex }) => {
    const { t } = useTranslation();
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const loadingMessages = t('generator.loadingMessages', { returnObjects: true }) as string[];

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isLoading) {
            interval = setInterval(() => {
                setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading, loadingMessages.length]);

    const handleGenerateClick = () => {
        if (userCredits < shots.length) {
            setError(t('generator.errors.outOfCreditsMultiple', { required: shots.length, available: userCredits }));
            return;
        }
        setError(null);
        onGenerate();
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in-scale">
                <div className="w-24 h-24 animate-cinematic-spinner"></div>
                <div className="mt-8 text-center">
                  {generatingShotIndex !== null && (
                    <p className="text-2xl text-white font-bold mb-2">
                        {t('generator.generatingShot', { current: generatingShotIndex + 1, total: shots.length })}
                    </p>
                  )}
                  <p className="text-lg text-slate-300 font-semibold transition-opacity duration-500">
                      {loadingMessages[currentMessageIndex]}
                  </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="text-center bg-slate-800/50 border border-slate-700 p-8 rounded-lg animate-fade-in-scale">
            <h3 className="text-2xl font-bold text-white mb-2">{t('generator.readyToDirectTitle')}</h3>
            <p className="text-slate-400 mb-6">{t('generator.readyToDirectSubtitle', { count: shots.length })}</p>
            
            {error && <p className="mb-4 text-red-400 text-center bg-red-500/10 p-3 rounded-lg border border-red-500/30">{error}</p>}
                  
            {userCredits < shots.length && (
                <p className="mb-4 text-yellow-400 text-center bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30">
                    {t('generator.errors.outOfCreditsMultiple', { required: shots.length, available: userCredits })}
                </p>
            )}

            <div className="pt-4 flex justify-between items-center">
                 <button
                    onClick={onBack}
                    className="bg-slate-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-600 transition-all duration-300"
                >
                    {t('common.back')}
                </button>
                <button
                    onClick={handleGenerateClick}
                    disabled={!imageFile || shots.length === 0 || userCredits < shots.length}
                    className="bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {userCredits >= shots.length ? t('generator.generateButtonCta', { credits: shots.length }) : t('generator.errors.outOfCreditsButton')}
                </button>
            </div>
        </div>
    );
};

export default Step3Generate;

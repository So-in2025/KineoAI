import React, { useState } from 'react';
import { Shot } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Spinner from '../Spinner';
import { generateStoryboardImage } from '../../services/geminiService';
import { fileToBase64 } from '../pages/GeneratorPage';

interface Step2ScriptAndStoryboardProps {
    imageFile: File | null;
    shots: Shot[];
    setShots: (shots: Shot[]) => void;
    onBack: () => void;
    onNext: () => void;
}

const Step2ScriptAndStoryboard: React.FC<Step2ScriptAndStoryboardProps> = ({ imageFile, shots, setShots, onBack, onNext }) => {
    const { t } = useTranslation();
    const [generatingStoryboardShotId, setGeneratingStoryboardShotId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleShotChange = (id: string, field: 'visuals' | 'vo', value: string) => {
      setShots(shots.map(shot => shot.id === id ? { ...shot, [field]: value } : shot));
    };

    const addShot = () => {
        const newShot: Shot = { id: `shot-${new Date().getTime()}`, visuals: t('generator.newSceneDefaultText'), vo: '' };
        setShots([...shots, newShot]);
    };
    
    const removeShot = (id: string) => {
        setShots(shots.filter(shot => shot.id !== id));
    };

    const handleGenerateShotStoryboard = async (shotId: string) => {
        if (!imageFile) {
          setError(t('generator.errors.uploadPhoto'));
          return;
        }
        const shot = shots.find(s => s.id === shotId);
        if (!shot || !shot.visuals.trim()) {
          setError(t('generator.errors.fillAllShots'));
          return;
        }

        setGeneratingStoryboardShotId(shotId);
        setError(null);
        
        try {
          const imageBase64 = await fileToBase64(imageFile);
          const generatedImageBase64 = await generateStoryboardImage(shot.visuals, imageBase64);
          setShots(shots.map(s => s.id === shotId ? { ...s, storyboardImage: generatedImageBase64 } : s));
        } catch (e: any) {
          console.error(e);
          setError(t('generator.errors.storyboardGenerationFailed'));
        } finally {
          setGeneratingStoryboardShotId(null);
        }
    };
    
    const canProceed = shots.every(shot => shot.visuals.trim() !== '');

    return (
        <div className="space-y-6 animate-fade-in-scale">
            <h3 className="text-xl font-semibold text-white">{t('generator.shotComposer.title')}</h3>
            {shots.map((shot, index) => (
                <div key={shot.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                   <div className="flex items-start space-x-4">
                        <div className="flex-grow space-y-3">
                            <label className="block text-sm font-medium text-cyan-400">{t('generator.shotComposer.visualsLabel')}</label>
                            <textarea
                                value={shot.visuals}
                                onChange={(e) => handleShotChange(shot.id, 'visuals', e.target.value)}
                                rows={3}
                                className="w-full bg-slate-800 text-slate-300 border-2 border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                placeholder={t('generator.shotComposer.visualsPlaceholder', { shotNumber: index + 1 })}
                            />
                            <label className="block text-sm font-medium text-cyan-400">{t('generator.shotComposer.voLabel')}</label>
                            <textarea
                                value={shot.vo}
                                onChange={(e) => handleShotChange(shot.id, 'vo', e.target.value)}
                                rows={2}
                                className="w-full bg-slate-800 text-slate-300 border-2 border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                placeholder={t('generator.shotComposer.voPlaceholder')}
                            />
                        </div>
                        <button onClick={() => removeShot(shot.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2 mt-1 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                    <div className="mt-4 border-t border-slate-700 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-cyan-400">{t('generator.shotComposer.storyboardLabel')}</h4>
                        <button
                          onClick={() => handleGenerateShotStoryboard(shot.id)}
                          disabled={generatingStoryboardShotId !== null || !imageFile}
                          className="flex items-center justify-center text-xs bg-slate-700 text-cyan-300 font-semibold py-1 px-3 rounded-full hover:bg-slate-600 transition-colors duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                        >
                          {generatingStoryboardShotId === shot.id ? (
                            <>
                              <Spinner className="w-4 h-4 mr-1" />
                              {t('generator.shotComposer.generatingStoryboardButton')}
                            </>
                          ) : (
                            t('generator.shotComposer.generateStoryboardButton')
                          )}
                        </button>
                      </div>
                      <div className="aspect-video bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center relative overflow-hidden">
                        {generatingStoryboardShotId === shot.id && <Spinner />}
                        {shot.storyboardImage && generatingStoryboardShotId !== shot.id && (
                          <img src={`data:image/png;base64,${shot.storyboardImage}`} alt={`Storyboard for shot ${index + 1}`} className="w-full h-full object-cover" />
                        )}
                        {!shot.storyboardImage && generatingStoryboardShotId !== shot.id && (
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        )}
                      </div>
                    </div>
                </div>
            ))}
             <button onClick={addShot} className="w-full text-cyan-400 border-2 border-dashed border-slate-600 hover:border-cyan-400 hover:bg-slate-800 transition-all duration-300 rounded-lg py-3 font-semibold">
                {t('generator.shotComposer.addShotButton')}
            </button>
            {error && <p className="text-red-400 text-center bg-red-500/10 p-3 rounded-lg border border-red-500/30">{error}</p>}

             <div className="pt-4 flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-600 transition-all duration-300"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!canProceed}
                    className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-all duration-300 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Step2ScriptAndStoryboard;

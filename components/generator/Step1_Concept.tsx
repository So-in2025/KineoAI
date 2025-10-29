import React, { useState } from 'react';
import { AspectRatio, ProjectType, Shot } from '../../types';
import FileUpload from '../FileUpload';
import AspectRatioSelector from '../AspectRatioSelector';
import { useTranslation } from '../../hooks/useTranslation';
import Spinner from '../Spinner';
import { generateScriptFromIdea } from '../../services/geminiService';
import { fileToBase64, parseGeneratedPrompt } from '../pages/GeneratorPage';

interface Step1ConceptProps {
    imageFile: File | null;
    setImageFile: (file: File | null) => void;
    imagePreview: string | null;
    setImagePreview: (url: string | null) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    projects: ProjectType[];
    selectedProjectId: string;
    setSelectedProjectId: (id: string) => void;
    centralIdea: string;
    setCentralIdea: (idea: string) => void;
    setShots: (shots: Shot[]) => void;
    onNext: () => void;
}

const Step1Concept: React.FC<Step1ConceptProps> = (props) => {
    const { 
        imageFile, setImageFile, imagePreview, setImagePreview,
        aspectRatio, setAspectRatio,
        projects, selectedProjectId, setSelectedProjectId,
        centralIdea, setCentralIdea,
        setShots, onNext
    } = props;
    
    const { t } = useTranslation();
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleGenerateScript = async () => {
        if (!imageFile) {
          setError(t('generator.errors.uploadPhoto'));
          return;
        }
        if (!centralIdea.trim()) {
          setError(t('generator.errors.ideaMissing'));
          return;
        }

        setIsGeneratingScript(true);
        setError(null);

        try {
          const imageBase64 = await fileToBase64(imageFile);
          const generatedScript = await generateScriptFromIdea(centralIdea, imageBase64);
          setShots(parseGeneratedPrompt(generatedScript));
        } catch (e: any) {
          console.error(e);
          const errorMessage = e.message || t('generator.errors.unknownError');
          setError(`${t('generator.errors.scriptGenerationFailed')}: ${errorMessage}`);
        } finally {
          setIsGeneratingScript(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-scale">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <FileUpload onFileSelect={handleFileSelect} previewUrl={imagePreview} />
                <AspectRatioSelector selected={aspectRatio} onSelect={setAspectRatio} />
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white">{t('generator.projectLink.title')}</h3>
                <p className="text-sm text-slate-400 mt-1 mb-4">{t('generator.projectLink.subtitle')}</p>
                 <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-slate-800 text-slate-300 border-2 border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    disabled={projects.length === 0}
                >
                    <option value="">{t('generator.projectLink.noProjectSelected')}</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.projectName} ({p.clientName})</option>
                    ))}
                </select>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white">{t('generator.aiCoDirector.title')}</h3>
                <p className="text-sm text-slate-400 mt-1 mb-4">{t('generator.aiCoDirector.subtitle')}</p>
                <div className="space-y-4">
                    <textarea
                        value={centralIdea}
                        onChange={(e) => setCentralIdea(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-800 text-slate-300 border-2 border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                        placeholder={t('generator.aiCoDirector.ideaPlaceholder')}
                    />
                    <button
                        onClick={handleGenerateScript}
                        disabled={isGeneratingScript || !imageFile || !centralIdea}
                        className="w-full flex items-center justify-center bg-slate-700 text-cyan-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                        {isGeneratingScript ? (
                            <>
                                <Spinner className="w-5 h-5 mr-2" />
                                {t('generator.aiCoDirector.generatingButton')}
                            </>
                        ) : (
                            t('generator.aiCoDirector.generateButton')
                        )}
                    </button>
                </div>
            </div>
            {error && <p className="text-red-400 text-center bg-red-500/10 p-3 rounded-lg border border-red-500/30">{error}</p>}

            <div className="pt-4 text-right">
                <button
                    onClick={onNext}
                    disabled={!imageFile}
                    className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-all duration-300 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Step1Concept;

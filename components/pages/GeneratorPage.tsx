
import React, { useState, useEffect, useCallback } from 'react';
import { AspectRatio, GeneratedVideoType, Shot, ProjectType, User } from '../../types';
import Header from '../Header';
import AssetPickerModal from '../AssetPickerModal';
import { useTranslation } from '../../hooks/useTranslation';
import { generateVideoFromImage } from '../../services/geminiService';
import GeneratorStepper from '../generator/GeneratorStepper';
import Step1Concept from '../generator/Step1_Concept';
import Step2ScriptAndStoryboard from '../generator/Step2_ScriptAndStoryboard';
import Step3Generate from '../generator/Step3_Generate';
import Step4PostProduction from '../generator/Step4_PostProduction';


// Helper to convert a file to a base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const parseGeneratedPrompt = (prompt: string): Shot[] => {
    const shotRegex = /Shot \d+:.*?(?=(Shot \d+:|$))/gs;
    const shots = prompt.match(shotRegex);
    return shots ? shots.map((s, index) => ({ id: `shot-${index + 1}`, visuals: s.trim(), vo: '' })) : [{ id: 'shot-1', visuals: prompt, vo: '' }];
}

interface GeneratorPageProps {
    onVideoGenerated: (video: GeneratedVideoType) => void;
    onVideoUpdated: (video: GeneratedVideoType) => void;
    onEditComplete: () => void;
    videoToEdit?: GeneratedVideoType | null;
    projects: ProjectType[];
    userCredits: number;
    onConsumeCredit: () => void;
    user: User;
    videos: GeneratedVideoType[];
    preselectedProjectId?: string | null;
}

const GeneratorPage: React.FC<GeneratorPageProps> = (props) => {
  const { 
    onVideoGenerated, projects, userCredits, onConsumeCredit, user, videos, 
    videoToEdit, onVideoUpdated, onEditComplete, preselectedProjectId
  } = props;
  
  const { t, language } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [centralIdea, setCentralIdea] = useState('');
  
  // Step 2 State
  const [shots, setShots] = useState<Shot[]>([]);
  
  // Step 3 State
  const [generatingShotIndex, setGeneratingShotIndex] = useState<number | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<Omit<GeneratedVideoType, 'id'> | null>(null);

  // Step 4 State
  const [voiceoverAudio, setVoiceoverAudio] = useState<string | null>(null); // base64
  const [musicTrack, setMusicTrack] = useState('');
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [voVolume, setVoVolume] = useState(1);
  const [textOverlay, setTextOverlay] = useState({ content: '', position: 'bottom-center' });
  const [showLogoOverlay, setShowLogoOverlay] = useState(false);

  // Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerAssetType, setPickerAssetType] = useState<'audio' | null>(null);
  
  // Pre-select project ID
  useEffect(() => {
    if(preselectedProjectId) {
      setSelectedProjectId(preselectedProjectId);
    }
  }, [preselectedProjectId]);

  // Handle Edit Mode
  useEffect(() => {
    if (videoToEdit) {
        setCurrentStep(4);
        const videoDataForPost = {
            shots: videoToEdit.shots,
            imagePreview: videoToEdit.imagePreview,
            projectId: videoToEdit.projectId,
            projectName: videoToEdit.projectName,
            clientName: videoToEdit.clientName,
        };
        setGeneratedVideo(videoDataForPost);
        setImagePreview(videoToEdit.imagePreview);
        setShots(videoToEdit.shots);
        setVoiceoverAudio(videoToEdit.voiceoverAudio || null);
        setMusicTrack(videoToEdit.musicTrack || '');
        setMusicVolume(videoToEdit.musicVolume ?? 0.5);
        setVoVolume(videoToEdit.voVolume ?? 1);
        setTextOverlay(videoToEdit.textOverlay || { content: '', position: 'bottom-center' });
        setShowLogoOverlay(videoToEdit.showLogoOverlay || false);
    } else {
        setCurrentStep(1);
        setImageFile(null);
        setImagePreview(null);
        setGeneratedVideo(null);
        setVoiceoverAudio(null);
        setMusicTrack('');
    }
  }, [videoToEdit]);

  useEffect(() => {
    if (!videoToEdit) {
      setShots(parseGeneratedPrompt(t('generator.initialPrompt')));
    }
  }, [t, language, videoToEdit]);
  
  // Universal API Key Check
  useEffect(() => {
    const storedApiKey = localStorage.getItem('kineo-api-key');
    if (storedApiKey) {
        setApiKeyReady(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
        localStorage.setItem('kineo-api-key', apiKey.trim());
        setApiKeyReady(true);
        setError(null);
    } else {
        setError(t('generator.errors.apiKeyMissing'));
    }
  };

  const handleApiError = useCallback((errorMessage: string) => {
    const genericError = `${t('generator.errors.generationFailed')}: ${errorMessage}`;
    // Intelligent error handling: if key is invalid, clear it and prompt user again.
    if (errorMessage.includes("API key not valid") || errorMessage.includes("permission")) {
        setError(t('generator.errors.apiKeyInvalid'));
        localStorage.removeItem('kineo-api-key');
        setApiKeyReady(false);
    } else {
        setError(genericError);
    }
  }, [t]);

  const handleGenerateVideo = useCallback(async () => {
    if (userCredits < shots.length) { // Check if enough credits for all shots
        setError(`You need ${shots.length} credits to generate all shots, but you only have ${userCredits}.`);
        return;
    }
    if (!imageFile || !imagePreview) {
        setError(t('generator.errors.uploadPhoto'));
        return;
    }
    if (shots.some(s => !s.visuals.trim())) {
        setError(t('generator.errors.fillAllShots'));
        return;
    }

    setIsLoading(true);
    setError(null);
    const updatedShots = [...shots];

    try {
        const imageBase64 = await fileToBase64(imageFile);
        for (let i = 0; i < updatedShots.length; i++) {
            setGeneratingShotIndex(i);
            const shot = updatedShots[i];
            const generatedUrl = await generateVideoFromImage(shot.visuals, imageBase64, aspectRatio);
            updatedShots[i] = { ...shot, url: generatedUrl };
            setShots(updatedShots);
            onConsumeCredit();
        }
        
        const selectedProject = projects.find(p => p.id === selectedProjectId);
        const newVideoData = {
            shots: updatedShots,
            imagePreview,
            projectId: selectedProject?.id,
            projectName: selectedProject?.projectName,
            clientName: selectedProject?.clientName,
        };

        setGeneratedVideo(newVideoData);
        setCurrentStep(4);

    } catch (e: any) {
        console.error(e);
        handleApiError(e.message || t('generator.errors.unknownError'));
    } finally {
        setIsLoading(false);
        setGeneratingShotIndex(null);
    }
  }, [imageFile, imagePreview, shots, aspectRatio, t, projects, selectedProjectId, userCredits, onConsumeCredit, handleApiError]);
  
  const handleReshootShot = useCallback(async (shotId: string) => {
    if (userCredits <= 0) {
      alert(t('generator.errors.outOfCredits'));
      return null;
    }
    if (!imageFile && !imagePreview) {
      alert(t('generator.errors.uploadPhoto'));
      return null;
    }

    const shotToReshoot = shots.find(s => s.id === shotId);
    if (!shotToReshoot) return null;

    setError(null);

    try {
      const imageBase64 = imageFile ? await fileToBase64(imageFile) : imagePreview!.split(',')[1];
      const generatedUrl = await generateVideoFromImage(shotToReshoot.visuals, imageBase64, aspectRatio);
      
      const updatedShots = shots.map(s => s.id === shotId ? { ...s, url: generatedUrl } : s);
      setShots(updatedShots);
      onConsumeCredit();
      return generatedUrl;

    } catch (e: any) {
      console.error(e);
      handleApiError(e.message || t('generator.errors.unknownError'));
      return null;
    }
  }, [imageFile, imagePreview, shots, aspectRatio, t, userCredits, onConsumeCredit, handleApiError]);

  const handleOpenPicker = (type: 'audio') => {
    setPickerAssetType(type);
    setIsPickerOpen(true);
  };
  
  const handleSelectAsset = (asset: { type: 'audio', data: string }) => {
    if (asset.type === 'audio') {
        setVoiceoverAudio(asset.data);
    }
    setIsPickerOpen(false);
  };

  const handleSave = () => {
    if (!generatedVideo) return;
    
    const finalVideoData = {
      ...generatedVideo,
      shots: shots, // Use the latest shots array which may have been reordered
      voiceoverAudio: voiceoverAudio || undefined,
      musicTrack,
      musicVolume,
      voVolume,
      textOverlay: textOverlay.content ? textOverlay : undefined,
      showLogoOverlay,
    };

    if (videoToEdit) {
      onVideoUpdated({ ...finalVideoData, id: videoToEdit.id });
    } else {
      onVideoGenerated({ ...finalVideoData, id: new Date().toISOString() });
    }
    onEditComplete();
  };

  const renderContent = () => {
    if (videoToEdit && generatedVideo) {
        return <Step4PostProduction
                    generatedVideo={generatedVideo}
                    user={user}
                    voiceoverAudio={voiceoverAudio}
                    setVoiceoverAudio={setVoiceoverAudio}
                    shots={shots}
                    setShots={setShots}
                    musicTrack={musicTrack}
                    setMusicTrack={setMusicTrack}
                    musicVolume={musicVolume}
                    setMusicVolume={setMusicVolume}
                    voVolume={voVolume}
                    setVoVolume={setVoVolume}
                    textOverlay={textOverlay}
                    setTextOverlay={setTextOverlay}
                    showLogoOverlay={showLogoOverlay}
                    setShowLogoOverlay={setShowLogoOverlay}
                    handleSave={handleSave}
                    handleOpenPicker={handleOpenPicker}
                    videos={videos}
                    isEditing={true}
                    onReshootShot={handleReshootShot}
                />;
    }

    switch (currentStep) {
        case 1:
            return <Step1Concept 
                      imageFile={imageFile}
                      setImageFile={setImageFile}
                      imagePreview={imagePreview}
                      setImagePreview={setImagePreview}
                      aspectRatio={aspectRatio}
                      setAspectRatio={setAspectRatio}
                      projects={projects}
                      selectedProjectId={selectedProjectId}
                      setSelectedProjectId={setSelectedProjectId}
                      centralIdea={centralIdea}
                      setCentralIdea={setCentralIdea}
                      setShots={setShots}
                      onNext={() => setCurrentStep(2)}
                   />;
        case 2:
            return <Step2ScriptAndStoryboard
                      imageFile={imageFile}
                      shots={shots}
                      setShots={setShots}
                      onBack={() => setCurrentStep(1)}
                      onNext={() => setCurrentStep(3)}
                   />;
        case 3:
            return <Step3Generate
                      isLoading={isLoading}
                      onGenerate={handleGenerateVideo}
                      onBack={() => setCurrentStep(2)}
                      imageFile={imageFile}
                      shots={shots}
                      userCredits={userCredits}
                      error={error}
                      setError={setError}
                      generatingShotIndex={generatingShotIndex}
                   />;
        case 4:
            if (generatedVideo) {
              return <Step4PostProduction
                        generatedVideo={generatedVideo}
                        user={user}
                        voiceoverAudio={voiceoverAudio}
                        setVoiceoverAudio={setVoiceoverAudio}
                        shots={shots}
                        setShots={setShots}
                        musicTrack={musicTrack}
                        setMusicTrack={setMusicTrack}
                        musicVolume={musicVolume}
                        setMusicVolume={setMusicVolume}
                        voVolume={voVolume}
                        setVoVolume={setVoVolume}
                        textOverlay={textOverlay}
                        setTextOverlay={setTextOverlay}
                        showLogoOverlay={showLogoOverlay}
                        setShowLogoOverlay={setShowLogoOverlay}
                        handleSave={handleSave}
                        handleOpenPicker={handleOpenPicker}
                        videos={videos}
                        isEditing={false}
                        onReshootShot={handleReshootShot}
                     />;
            }
            setCurrentStep(3); 
            return null;
        default:
            return <div>Invalid Step</div>;
    }
  }
  
  const renderApiKeyScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-4 animate-fade-in-scale">
        <Header title={t('generator.apiKeyScreen.title')} subtitle={t('generator.apiKeyScreen.subtitle')}/>
        <div className="bg-slate-800 p-8 rounded-lg shadow-2xl max-w-lg mt-4 border border-slate-700 w-full">
            <p className="text-sm text-slate-400 mb-4">
              {t('generator.apiKeyScreen.getYourKey.prefix')}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">
                {t('generator.apiKeyScreen.getYourKey.link')}
              </a>
              .
            </p>
            <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t('generator.apiKeyScreen.inputPlaceholder')}
                className="w-full bg-slate-900 text-slate-300 border-2 border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors mb-4"
            />
            {error && <p className="mb-4 text-red-400 text-sm">{error}</p>}
            <button
                onClick={handleSaveApiKey}
                className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
            >
                {t('generator.apiKeyScreen.saveButton')}
            </button>
            <p className="text-xs text-slate-500 mt-4">
                {t('generator.apiKeyScreen.billingInfo.prefix')} <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-400">{t('generator.apiKeyScreen.billingInfo.link')}</a>.
            </p>
        </div>
    </div>
  );

  if (!apiKeyReady) {
    return renderApiKeyScreen();
  }
  
  return (
    <>
      <AssetPickerModal 
        isOpen={isPickerOpen}
        assetType={pickerAssetType}
        videos={videos}
        onClose={() => setIsPickerOpen(false)}
        onSelectAsset={handleSelectAsset}
      />
      <div className="p-4 sm:p-6 lg:p-8 animate-fade-in-scale">
        <div className="max-w-5xl mx-auto">
          <Header title={t('generator.header.title')} subtitle={t('generator.header.subtitle')}/>

          <div className="mt-8">
            {!videoToEdit && <GeneratorStepper currentStep={currentStep} />}
            <div className="mt-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GeneratorPage;
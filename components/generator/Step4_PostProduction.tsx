
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GeneratedVideoType, Shot, User, GeneratedVideoType as Video } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Spinner from '../Spinner';
import { generateVoiceoverAudio } from '../../services/geminiService';


const createWavFile = (base64String: string): string => {
  const binaryString = window.atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const blob = new Blob([bytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

interface Step4PostProductionProps {
    generatedVideo: Omit<Video, 'id'>;
    user: User;
    voiceoverAudio: string | null;
    setVoiceoverAudio: (audio: string | null) => void;
    shots: Shot[];
    setShots: (shots: Shot[]) => void;
    musicTrack: string;
    setMusicTrack: (track: string) => void;
    musicVolume: number;
    setMusicVolume: (volume: number) => void;
    voVolume: number;
    setVoVolume: (volume: number) => void;
    textOverlay: { content: string, position: string };
    setTextOverlay: (overlay: { content: string, position: string }) => void;
    showLogoOverlay: boolean;
    setShowLogoOverlay: (show: boolean) => void;
    handleSave: () => void;
    handleOpenPicker: (type: 'audio') => void;
    videos: GeneratedVideoType[];
    isEditing: boolean;
    onReshootShot: (shotId: string) => Promise<string | null>;
}

const Step4PostProduction: React.FC<Step4PostProductionProps> = (props) => {
    const { 
        generatedVideo, user, voiceoverAudio, setVoiceoverAudio, shots, setShots,
        musicTrack, setMusicTrack, musicVolume, setMusicVolume, voVolume, setVoVolume,
        textOverlay, setTextOverlay, showLogoOverlay, setShowLogoOverlay,
        handleSave, handleOpenPicker, isEditing, onReshootShot,
    } = props;
    
    const { t } = useTranslation();
    const [isGeneratingVo, setIsGeneratingVo] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reshootingShotId, setReshootingShotId] = useState<string | null>(null);
    
    // Playback state
    const [currentPlayingIndex, setCurrentPlayingIndex] = useState(0);
    const mainVideoRef = useRef<HTMLVideoElement>(null);
    
    // Drag and Drop state
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const musicAudioRef = useRef<HTMLAudioElement>(null);
    const voiceoverAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
      if (musicAudioRef.current) musicAudioRef.current.volume = musicVolume;
    }, [musicVolume]);
    
    useEffect(() => {
      if (voiceoverAudioRef.current) voiceoverAudioRef.current.volume = voVolume;
    }, [voVolume]);

    // Update main video player source when current shot changes
    useEffect(() => {
        if (mainVideoRef.current && shots[currentPlayingIndex]?.url) {
            mainVideoRef.current.src = shots[currentPlayingIndex].url!;
            mainVideoRef.current.play().catch(e => console.error("Playback failed", e));
        }
    }, [currentPlayingIndex, shots]);

    const handleVideoEnded = () => {
        setCurrentPlayingIndex(prevIndex => (prevIndex + 1) % shots.length);
    };

    const getOverlayPositionClass = () => {
      switch(textOverlay.position) {
          case 'top-left': return 'top-4 left-4';
          case 'top-center': return 'top-4 left-1/2 -translate-x-1/2';
          case 'top-right': return 'top-4 right-4 text-right';
          case 'bottom-left': return 'bottom-4 left-4';
          case 'bottom-center': return 'bottom-4 left-1/2 -translate-x-1/2';
          case 'bottom-right': return 'bottom-4 right-4 text-right';
          default: return 'bottom-4 left-1/2 -translate-x-1/2';
      }
    };
    
    const handleGenerateVo = async () => {
        const voiceoverScript = shots.map(s => s.vo).filter(Boolean).join('\n\n');
        if (!voiceoverScript.trim()) {
          setError(t('generator.errors.voScriptMissing'));
          return;
        }
        setIsGeneratingVo(true);
        setError(null);
        setVoiceoverAudio(null);
        try {
          const audioBase64 = await generateVoiceoverAudio(voiceoverScript);
          setVoiceoverAudio(audioBase64);
        } catch(e: any) {
          setError(t('generator.errors.voGenerationFailed'));
        } finally {
          setIsGeneratingVo(false);
        }
    };
    
    const handleReshoot = async (shotId: string) => {
      setReshootingShotId(shotId);
      await onReshootShot(shotId);
      setReshootingShotId(null);
    };
    
    const handleDragEnd = () => {
      if (dragItem.current !== null && dragOverItem.current !== null) {
        const newShots = [...shots];
        const draggedItemContent = newShots.splice(dragItem.current, 1)[0];
        newShots.splice(dragOverItem.current, 0, draggedItemContent);
        setShots(newShots);
      }
      dragItem.current = null;
      dragOverItem.current = null;
    };

    const voiceoverAudioUrl = voiceoverAudio ? createWavFile(voiceoverAudio) : null;

    return (
        <div className="space-y-8 mt-4 animate-fade-in-scale">
            <div>
                <h3 className="text-2xl font-bold text-center text-white">{t('generator.postProduction.title')}</h3>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden mt-4 border-2 border-slate-700">
                    <video
                        key={shots[currentPlayingIndex]?.id}
                        ref={mainVideoRef}
                        className="w-full h-full object-contain"
                        onEnded={handleVideoEnded}
                        controls
                        poster={generatedVideo.imagePreview}
                    >
                        {t('videoModal.videoNotSupported')}
                    </video>
                     {textOverlay.content && (
                          <div className={`absolute p-4 text-white text-2xl font-bold text-shadow [text-shadow:0_2px_4px_rgba(0,0,0,0.7)] ${getOverlayPositionClass()}`}>
                              {textOverlay.content}
                          </div>
                      )}
                      {showLogoOverlay && user.logo && (
                          <img src={user.logo} alt="Studio Logo" className="absolute bottom-4 right-4 h-12 w-auto opacity-80" />
                      )}
                </div>
            </div>

            {/* Timeline Editor */}
            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">{t('generator.postProduction.timeline.title')}</h3>
              <div className="flex space-x-2 overflow-x-auto pb-4">
                {shots.map((shot, index) => (
                  <div 
                    key={shot.id}
                    draggable
                    onDragStart={() => dragItem.current = index}
                    onDragEnter={() => dragOverItem.current = index}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`flex-shrink-0 w-48 bg-slate-800 p-2 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all ${currentPlayingIndex === index ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' : 'border-slate-600'}`}
                  >
                    <div className="relative aspect-video rounded-md overflow-hidden bg-slate-900">
                      {shot.url ? (
                        <video src={shot.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                        </div>
                      )}
                      {reshootingShotId === shot.id && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><Spinner/></div>
                      )}
                      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full font-bold">{t('generator.postProduction.timeline.shot')} {index + 1}</div>
                    </div>
                    <div className="mt-2">
                        <textarea
                            value={shot.visuals}
                            onChange={(e) => setShots(shots.map(s => s.id === shot.id ? {...s, visuals: e.target.value} : s))}
                            rows={2}
                            className="w-full bg-slate-700/50 text-slate-300 border border-slate-600 rounded-md p-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                         <button 
                            onClick={() => handleReshoot(shot.id)}
                            disabled={reshootingShotId !== null}
                            className="w-full mt-1 bg-slate-700 text-cyan-300 text-xs font-bold py-1 px-2 rounded hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500"
                          >
                           {t('generator.postProduction.timeline.reshootButton')}
                         </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-slate-800/50 border border-slate-700 p-6 rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold text-white">{t('generator.results.voTitle')}</h3>
                  {voiceoverAudioUrl ? (
                    <div className="mt-2 space-y-3">
                       <audio ref={voiceoverAudioRef} controls src={voiceoverAudioUrl} className="w-full" onVolumeChange={e => setVoVolume((e.target as HTMLAudioElement).volume)}></audio>
                    </div>
                  ) : <p className="text-sm text-slate-400 mt-1">{t('generator.results.voSubtitle')}</p>}

                  <div className="flex space-x-2">
                    <button onClick={handleGenerateVo} disabled={isGeneratingVo} className="w-full flex items-center justify-center bg-slate-700 text-cyan-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">
                        {isGeneratingVo ? <Spinner className="w-5 h-5" /> : t('generator.results.generateVoButton')}
                    </button>
                  </div>
                  {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              </div>

               <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold text-white">{t('generator.postProduction.soundtrack.title')}</h3>
                  <select value={musicTrack} onChange={e => setMusicTrack(e.target.value)} className="w-full bg-slate-800 text-slate-300 border-2 border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                    <option value="">{t('generator.postProduction.soundtrack.noMusic')}</option>
                    <option value="/sounds/epic.mp3">{t('generator.postProduction.soundtrack.epic')}</option>
                    <option value="/sounds/inspiring.mp3">{t('generator.postProduction.soundtrack.inspiring')}</option>
                    <option value="/sounds/ambient.mp3">{t('generator.postProduction.soundtrack.ambient')}</option>
                  </select>
                  {musicTrack && <audio ref={musicAudioRef} src={musicTrack} autoPlay loop />}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-400">{t('generator.postProduction.soundtrack.musicVolume')}</label>
                      <input type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={e => setMusicVolume(parseFloat(e.target.value))} className="w-full" />
                    </div>
                     <div className="space-y-2">
                      <label className="text-sm text-slate-400">{t('generator.postProduction.soundtrack.voVolume')}</label>
                      <input type="range" min="0" max="1" step="0.01" value={voVolume} onChange={e => setVoVolume(parseFloat(e.target.value))} className="w-full" />
                    </div>
                  </div>
               </div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-white">{t('generator.postProduction.overlays.title')}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-400">{t('generator.postProduction.overlays.textLabel')}</label>
                      <input type="text" value={textOverlay.content} onChange={e => setTextOverlay({...textOverlay, content: e.target.value})} placeholder={t('generator.postProduction.overlays.textPlaceholder')} className="mt-1 w-full bg-slate-800 text-slate-300 border-2 border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">{t('generator.postProduction.overlays.positionLabel')}</label>
                       <select value={textOverlay.position} onChange={e => setTextOverlay({...textOverlay, position: e.target.value})} className="mt-1 w-full bg-slate-800 text-slate-300 border-2 border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors">
                        <option value="bottom-center">{t('generator.postProduction.overlays.positions.bottomCenter')}</option>
                        <option value="top-left">{t('generator.postProduction.overlays.positions.topLeft')}</option>
                        <option value="top-center">{t('generator.postProduction.overlays.positions.topCenter')}</option>
                        <option value="top-right">{t('generator.postProduction.overlays.positions.topRight')}</option>
                        <option value="bottom-left">{t('generator.postProduction.overlays.positions.bottomLeft')}</option>
                        <option value="bottom-right">{t('generator.postProduction.overlays.positions.bottomRight')}</option>
                      </select>
                    </div>
                </div>
                 <div className="flex items-center">
                    <input type="checkbox" id="logo-overlay" checked={showLogoOverlay} onChange={e => setShowLogoOverlay(e.target.checked)} disabled={!user.logo} className="h-4 w-4 rounded border-slate-500 text-cyan-600 focus:ring-cyan-500 disabled:opacity-50"/>
                    <label htmlFor="logo-overlay" className="ml-2 block text-sm text-slate-300 disabled:opacity-50">{t('generator.postProduction.overlays.showLogo')}</label>
                 </div>
             </div>

             <div className="pt-4 text-center">
              <button
                  onClick={handleSave}
                  className="w-full md:w-auto bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
              >
                  {isEditing ? t('generator.postProduction.saveChangesButton') : t('generator.postProduction.saveButton')}
              </button>
          </div>
        </div>
    );
};

export default Step4PostProduction;

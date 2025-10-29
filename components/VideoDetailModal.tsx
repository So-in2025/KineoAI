

import React, { useEffect, useState, useMemo } from 'react';
import { GeneratedVideoType, ProjectType, Shot } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { getPerformanceAnalysis, generateTextOverlayVariations } from '../../services/geminiService';
import Spinner from './Spinner';

interface VideoDetailModalProps {
  video: GeneratedVideoType;
  onClose: () => void;
  projects: ProjectType[];
  onToggleStatus: (id: string) => void;
  onDeleteVideo: (id: string) => void;
  onStartEdit: (video: GeneratedVideoType) => void;
  onUpdateVideo: (video: GeneratedVideoType) => void;
  onAddVideoVariations: (originalVideo: GeneratedVideoType, variations: string[]) => void;
}

const RetentionChart: React.FC<{ data: number[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  const width = 300;
  const height = 150;
  const padding = 20;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
    const y = height - (value / 100) * (height - 2 * padding) - padding;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height-padding} ${points} ${width-padding},${height-padding}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Y-axis labels */}
      <text x={padding - 5} y={padding + 5} fill="#94a3b8" fontSize="10" textAnchor="end">100%</text>
      <text x={padding - 5} y={height - padding} fill="#94a3b8" fontSize="10" textAnchor="end">0%</text>
      
      {/* Grid lines */}
      <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#475569" strokeWidth="0.5" />
      <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" strokeWidth="0.5" />
      
      {/* Area fill */}
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#chartGradient)" />

      {/* Line */}
      <polyline
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
};

const InfoBlock: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
    <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-1">{label}</h4>
        <div className="text-slate-300 text-sm bg-slate-800 p-2 rounded-md">{value}</div>
    </div>
);

const PerfStat: React.FC<{ label: string; value: string; unit?: string }> = ({ label, value, unit }) => (
  <div className="bg-slate-800 p-3 rounded-md text-center">
    <p className="text-xs text-slate-400">{label}</p>
    <p className="text-xl font-bold text-white">
      {value}
      {unit && <span className="text-sm font-normal text-slate-300 ml-1">{unit}</span>}
    </p>
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
      active
        ? 'border-cyan-400 text-cyan-300'
        : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
    }`}
  >
    {children}
  </button>
);


const VideoDetailModal: React.FC<VideoDetailModalProps> = ({ video, onClose, projects, onToggleStatus, onDeleteVideo, onStartEdit, onUpdateVideo, onAddVideoVariations }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // State for new note
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTime, setNewNoteTime] = useState('');

  // State for AI Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // State for Variations
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [variationError, setVariationError] = useState<string | null>(null);

  const linkedProject = useMemo(() => {
    return video.projectId ? projects.find(p => p.id === video.projectId) : null;
  }, [video, projects]);

  const fullPrompt = useMemo(() => {
    return video.shots.map(s => s.visuals).join('\n\n');
  }, [video.shots]);

  const storyboardImages = useMemo(() => {
      return video.shots.map(s => s.storyboardImage).filter((img): img is string => !!img);
  }, [video.shots]);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?presentation=${video.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    onStartEdit(video);
    onClose();
  };

  const handleMarkComplete = () => {
    if (linkedProject) {
      onToggleStatus(linkedProject.id);
      onClose(); // Close modal after action
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this video and its assets permanently?")) {
      onDeleteVideo(video.id);
      onClose();
    }
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteText.trim() === '' || newNoteTime.trim() === '') return;

    const newNote = {
      id: new Date().toISOString(),
      time: parseFloat(newNoteTime),
      text: newNoteText,
    };

    const updatedVideo = {
      ...video,
      notes: [...(video.notes || []), newNote],
    };

    onUpdateVideo(updatedVideo);
    setNewNoteText('');
    setNewNoteTime('');
  };

  const handleGetAnalysis = async () => {
    if (!video.analytics) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const analysisText = await getPerformanceAnalysis(video.shots, video.analytics);
      const updatedVideo = {
        ...video,
        analytics: {
          ...video.analytics,
          aiAnalysis: analysisText,
        },
      };
      onUpdateVideo(updatedVideo);
    } catch (e: any) {
      console.error("Analysis failed:", e);
      setAnalysisError(t('analytics.aiAnalysis.error'));
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleGenerateVariations = async () => {
    if (!video.textOverlay?.content) return;
    setIsGeneratingVariations(true);
    setVariationError(null);
    try {
      const variations = await generateTextOverlayVariations(video.textOverlay.content);
      onAddVideoVariations(video, variations);
      onClose(); // Close modal after successful generation
    } catch (e: any) {
      console.error("Variation generation failed:", e);
      setVariationError(t('analytics.variations.error'));
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  // The main video to play is the first shot's URL, if available
  const displayVideoUrl = video.shots.find(s => s.url)?.url;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-scale"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center">
              {video.projectName || t('videoModal.title')}
              {video.isVariation && (
                <span className="ml-2 text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/50" title={`Variation of original ad`}>
                  A/B Test
                </span>
              )}
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3 flex-shrink-0">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {displayVideoUrl ? (
                      <video
                          className="w-full h-full object-contain"
                          src={displayVideoUrl}
                          controls
                          autoPlay
                          loop
                          poster={video.imagePreview}
                      >
                          {t('videoModal.videoNotSupported')}
                      </video>
                    ) : (
                      <img src={video.imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    )}
                </div>
                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
                    <button 
                        onClick={handleShare}
                        className="w-full bg-slate-700 text-cyan-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        {copied ? t('videoModal.shareLink.copied') : t('videoModal.shareLink.copyButton')}
                    </button>
                    
                    <button
                        onClick={handleEdit}
                        className="w-full bg-slate-700 text-cyan-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300 flex items-center justify-center"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                       {t('videoModal.editButton')}
                    </button>

                    {linkedProject && linkedProject.status === 'in-progress' && (
                        <button
                            onClick={handleMarkComplete}
                            className="w-full bg-green-600/20 text-green-300 border border-green-500/50 font-bold py-2 px-4 rounded-lg hover:bg-green-600/40 transition-colors duration-300 flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            {t('videoModal.markCompleteButton')}
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        className="w-full bg-red-600/20 text-red-300 border border-red-500/50 font-bold py-2 px-4 rounded-lg hover:bg-red-600/40 transition-colors duration-300 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        {t('videoModal.deleteButton')}
                    </button>
                 </div>
            </div>
            <div className="md:w-1/3 flex flex-col">
              <div className="border-b border-slate-700 mb-4">
                  <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')}>{t('videoModal.tabs.details')}</TabButton>
                  <TabButton active={activeTab === 'assets'} onClick={() => setActiveTab('assets')}>{t('videoModal.tabs.assets')}</TabButton>
                  <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>{t('videoModal.tabs.notes')}</TabButton>
                  <TabButton active={activeTab === 'performance'} onClick={() => setActiveTab('performance')}>{t('videoModal.tabs.performance')}</TabButton>
              </div>

              {activeTab === 'details' && (
                  <div className="space-y-4 animate-fade-in-scale">
                      <InfoBlock 
                          label={t('videoModal.fullPrompt')} 
                          value={<div className="whitespace-pre-wrap max-h-40 overflow-y-auto">{fullPrompt}</div>} 
                      />
                       {(video.musicTrack || video.textOverlay) && (
                           <div>
                              <h3 className="text-md font-semibold text-cyan-400 mb-2">{t('videoModal.postProduction.title')}</h3>
                              <div className="space-y-3">
                                  {video.musicTrack && (
                                      <InfoBlock label={t('videoModal.postProduction.music')} value={video.musicTrack.split('/').pop()?.replace('.mp3','')} />
                                  )}
                                  {video.textOverlay && (
                                      <InfoBlock label={t('videoModal.postProduction.textOverlay')} value={video.textOverlay.content} />
                                  )}
                              </div>
                           </div>
                       )}
                       {video.textOverlay && (
                          <div className="pt-4 border-t border-slate-700">
                             <h4 className="text-sm font-semibold text-cyan-400 mb-2">{t('analytics.variations.title')}</h4>
                             <button onClick={handleGenerateVariations} disabled={isGeneratingVariations} className="w-full flex items-center justify-center bg-slate-700 text-cyan-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300 disabled:opacity-50">
                                {isGeneratingVariations ? (
                                  <>
                                    <Spinner className="w-5 h-5 mr-2" />
                                    {t('analytics.variations.loading')}
                                  </>
                                ) : (
                                  t('analytics.variations.button')
                                )}
                              </button>
                              {variationError && <p className="text-red-400 text-xs mt-2 text-center">{variationError}</p>}
                          </div>
                       )}
                  </div>
              )}

              {activeTab === 'assets' && (
                  <div className="space-y-4 animate-fade-in-scale">
                      {storyboardImages.length > 0 ? (
                        <div>
                            <h4 className="text-sm font-semibold text-cyan-400 mb-1">{t('videoModal.assets.storyboard')}</h4>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {storyboardImages.map((img, index) => (
                                    <img key={index} src={`data:image/png;base64,${img}`} alt={`Storyboard shot ${index + 1}`} className="rounded-lg border-2 border-slate-700 aspect-video object-cover" />
                                ))}
                            </div>
                        </div>
                      ) : (
                          <InfoBlock label={t('videoModal.assets.storyboard')} value={t('videoModal.assets.notGenerated')} />
                      )}
                       {video.voiceoverAudio ? (
                          <div>
                              <h4 className="text-sm font-semibold text-cyan-400 mb-1">{t('videoModal.assets.voiceover')}</h4>
                              <audio controls src={`data:audio/wav;base64,${video.voiceoverAudio}`} className="w-full"></audio>
                          </div>
                      ) : (
                          <InfoBlock label={t('videoModal.assets.voiceover')} value={t('videoModal.assets.notGenerated')} />
                      )}
                  </div>
              )}
               {activeTab === 'notes' && (
                  <div className="space-y-4 animate-fade-in-scale">
                      <h4 className="text-sm font-semibold text-cyan-400 mb-1">{t('videoModal.notes.title')}</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                         {(video.notes && video.notes.length > 0) ? video.notes.map(note => (
                            <div key={note.id} className="bg-slate-800 p-2 rounded-md text-sm">
                                <span className="font-bold text-cyan-400">@{note.time}s:</span>
                                <p className="text-slate-300 whitespace-pre-wrap">{note.text}</p>
                            </div>
                         )) : <p className="text-slate-500 text-xs text-center py-4">{t('videoModal.notes.noNotes')}</p>}
                      </div>
                      <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-700">
                         <input 
                            type="number"
                            value={newNoteTime}
                            onChange={e => setNewNoteTime(e.target.value)}
                            placeholder={t('videoModal.notes.timestampPlaceholder')}
                            className="w-full bg-slate-800 text-slate-300 border-2 border-slate-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            step="0.1"
                            required
                         />
                         <textarea
                            value={newNoteText}
                            onChange={e => setNewNoteText(e.target.value)}
                            placeholder={t('videoModal.notes.commentPlaceholder')}
                            rows={2}
                            className="w-full bg-slate-800 text-slate-300 border-2 border-slate-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            required
                         ></textarea>
                         <button type="submit" className="w-full bg-slate-700 text-cyan-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300 text-sm">
                            {t('videoModal.notes.saveNoteButton')}
                         </button>
                      </form>
                  </div>
              )}
              {activeTab === 'performance' && video.analytics && (
                <div className="space-y-4 animate-fade-in-scale">
                    <div className="grid grid-cols-3 gap-2">
                      <PerfStat label={t('analytics.kpi.views')} value={video.analytics.views.toLocaleString()} />
                      <PerfStat label={t('analytics.kpi.ctr')} value={video.analytics.ctr.toFixed(2)} unit="%" />
                      <PerfStat label={t('analytics.kpi.cpa')} value={`$${video.analytics.cpa.toFixed(2)}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-cyan-400 mb-2">{t('analytics.retention.title')}</h4>
                      <div className="bg-slate-800 p-2 rounded-md">
                        <RetentionChart data={video.analytics.retentionData} />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-700">
                      <h4 className="text-sm font-semibold text-cyan-400 mb-2">{t('analytics.aiAnalysis.title')}</h4>
                       {video.analytics.aiAnalysis ? (
                          <div className="text-sm text-slate-300 bg-slate-800 p-3 rounded-md whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {video.analytics.aiAnalysis}
                          </div>
                        ) : (
                          <button onClick={handleGetAnalysis} disabled={isAnalyzing} className="w-full flex items-center justify-center bg-slate-700 text-cyan-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300 disabled:opacity-50">
                            {isAnalyzing ? (
                              <>
                                <Spinner className="w-5 h-5 mr-2" />
                                {t('analytics.aiAnalysis.loading')}
                              </>
                            ) : (
                               t('analytics.aiAnalysis.button')
                            )}
                          </button>
                        )}
                        {analysisError && <p className="text-red-400 text-xs mt-2 text-center">{analysisError}</p>}
                    </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailModal;
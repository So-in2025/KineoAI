
import React, { useRef, useMemo } from 'react';
import { GeneratedVideoType, User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface PresentationPageProps {
  video: GeneratedVideoType;
  user: User;
}

const PresentationPage: React.FC<PresentationPageProps> = ({ video, user }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  const fullPrompt = useMemo(() => {
    return video.shots.map(s => s.visuals).join('\n\n');
  }, [video.shots]);

  const displayVideoUrl = video.shots.find(s => s.url)?.url;

  const handleNoteClick = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };
  
  return (
    <div className="main-content bg-slate-900 text-white selection:bg-cyan-500 selection:text-white">
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl animate-fade-in-scale">
          <header className="text-center mb-8">
            {user.logo ? (
              <img src={user.logo} alt="Studio Logo" className="mx-auto h-16 w-auto object-contain mb-4" />
            ) : (
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {video.projectName || t('presentationPage.title')}
              </h1>
            )}
            
            {video.clientName && (
                <p className="mt-2 text-lg text-slate-400">{video.clientName} - {video.projectName}</p>
            )}
          </header>
          
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                <div className="aspect-video bg-black">
                    {displayVideoUrl ? (
                      <video
                          ref={videoRef}
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
                <div className="p-6">
                    <h2 className="text-md font-semibold text-cyan-400 mb-2">{t('presentationPage.promptHeader')}</h2>
                    <div className="bg-slate-800 p-4 rounded-lg text-slate-300 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {fullPrompt}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl p-6 h-full">
                    <h2 className="text-md font-semibold text-cyan-400 mb-4">{t('presentationPage.notesHeader')}</h2>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {(video.notes && video.notes.length > 0) ? video.notes.map(note => (
                            <div key={note.id} className="bg-slate-800 p-3 rounded-lg">
                                <button onClick={() => handleNoteClick(note.time)} className="font-bold text-cyan-400 hover:underline">
                                    @{note.time}s
                                </button>
                                <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap">{note.text}</p>
                            </div>
                        )) : <p className="text-slate-500 text-sm text-center py-8">{t('videoModal.notes.noNotes')}</p>}
                    </div>
                </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PresentationPage;

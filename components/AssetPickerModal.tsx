
import React from 'react';
import { GeneratedVideoType } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface AssetPickerModalProps {
  isOpen: boolean;
  assetType: 'storyboard' | 'audio' | null;
  videos: GeneratedVideoType[];
  onClose: () => void;
  onSelectAsset: (asset: { type: 'storyboard' | 'audio', data: string }) => void;
}

const AssetPickerModal: React.FC<AssetPickerModalProps> = ({ isOpen, assetType, videos, onClose, onSelectAsset }) => {
    const { t } = useTranslation();
    if (!isOpen || !assetType) return null;

    const assets = videos.filter(v => 
      assetType === 'storyboard' 
        ? v.shots.some(s => s.storyboardImage) 
        : v.voiceoverAudio
    );

    const getFirstStoryboard = (video: GeneratedVideoType) => {
        return video.shots.find(s => s.storyboardImage)?.storyboardImage;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-scale"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white">{t('assetPicker.title')}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                    {assets.length === 0 ? (
                         <div className="text-center py-16 text-slate-500">
                            No {assetType === 'storyboard' ? 'storyboards' : 'audio tracks'} found in your Vault.
                        </div>
                    ) : (
                        <div className={`grid gap-4 ${assetType === 'storyboard' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
                            {assets.map(video => {
                                const storyboardImage = assetType === 'storyboard' ? getFirstStoryboard(video) : null;
                                return (
                                <div key={video.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                    {assetType === 'storyboard' && storyboardImage && (
                                        <img src={`data:image/png;base64,${storyboardImage}`} alt="Storyboard" className="w-full h-auto object-cover rounded-md aspect-square" />
                                    )}
                                    {assetType === 'audio' && video.voiceoverAudio && (
                                        <audio controls src={`data:audio/wav;base64,${video.voiceoverAudio}`} className="w-full"></audio>
                                    )}
                                    <p className="text-xs text-slate-400 truncate mt-2">{video.projectName || 'Unassigned'}</p>
                                    <button 
                                        onClick={() => onSelectAsset({ type: assetType, data: (assetType === 'storyboard' ? storyboardImage! : video.voiceoverAudio)! })}
                                        className="w-full mt-2 bg-cyan-500 text-white font-bold py-1 px-3 rounded-md hover:bg-cyan-600 transition-colors text-sm"
                                    >
                                        {t('assetPicker.selectButton')}
                                    </button>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetPickerModal;

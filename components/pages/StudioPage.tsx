import React, { useState, useMemo } from 'react';
import { ProjectType, GeneratedVideoType, User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Header from '../Header';
import { Page } from '../../App';
import VideoDetailModal from '../VideoDetailModal';

interface StudioPageProps {
  projects: ProjectType[];
  videos: GeneratedVideoType[];
  onAddProject: (project: Omit<ProjectType, 'id'>) => void;
  onToggleProjectStatus: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onDeleteVideo: (id: string) => void;
  onStartEdit: (video: GeneratedVideoType) => void;
  onUpdateVideo: (video: GeneratedVideoType) => void;
  onAddVideoVariations: (originalVideo: GeneratedVideoType, variations: string[]) => void;
  user: User;
  onSetUserLogo: (logo: string) => void;
  onNavigate: (page: Page) => void;
  viewingProjectId: string | null;
  setViewingProjectId: (id: string | null) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement }> = ({ title, value, icon }) => (
  <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg flex items-center space-x-4">
    <div className="bg-slate-700 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const ProjectCard: React.FC<{project: ProjectType, videoCount: number, latestVideo?: GeneratedVideoType, onClick: () => void}> = ({project, videoCount, latestVideo, onClick}) => {
  const { t } = useTranslation();
  return (
    <div onClick={onClick} className="cursor-pointer bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-700 group transition-all duration-300 hover:shadow-cyan-500/20 hover:border-slate-600 hover:-translate-y-1 relative">
      <div className="aspect-video relative bg-slate-900">
          {latestVideo ? (
              <img src={latestVideo.imagePreview} alt="Video thumbnail" className="w-full h-full object-cover" />
          ) : (
              <div className="w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
          )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
           <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{videoCount} {t('studio.projectCard.videos')}</div>
      </div>
      <div className="p-4">
          <p className="text-sm font-semibold text-white truncate">{project.projectName}</p>
          <div className="flex justify-between items-center mt-1">
             <p className="text-xs text-slate-400 truncate">{project.clientName}</p>
             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'completed' ? 'bg-green-100/10 text-green-300' : 'bg-yellow-100/10 text-yellow-300'}`}>
                {project.status === 'completed' ? t('studio.projectStatus.completed') : t('studio.projectStatus.inProgress')}
            </span>
          </div>
      </div>
  </div>
  );
};

const StudioPage: React.FC<StudioPageProps> = (props) => {
  const { 
    projects, videos, onAddProject, onToggleProjectStatus, onDeleteProject, onDeleteVideo, onStartEdit, onUpdateVideo,
    onAddVideoVariations, user, onSetUserLogo, onNavigate, viewingProjectId, setViewingProjectId 
  } = props;
  
  const { t } = useTranslation();
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideoType | null>(null);
  const [viewMode, setViewMode] = useState<'gallery' | 'performance'>('gallery');

  const stats = useMemo(() => {
    const totalRevenue = projects.reduce((acc, p) => acc + p.price, 0);
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    return { totalRevenue, completedProjects, totalVideos: videos.length };
  }, [projects, videos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientName && projectName && price) {
      onAddProject({ clientName, projectName, price: parseFloat(price), status: 'in-progress' });
      setClientName('');
      setProjectName('');
      setPrice('');
    }
  };

  const getVideosForProject = (projectId: string | null) => {
    if (!projectId) return [];
    return videos
      .filter(v => v.projectId === projectId)
      .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm(t('studio.projectList.deleteConfirmation'))) {
      onDeleteProject(id);
    }
  };

  const handleDeleteVideoConfirm = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation(); // Prevent modal from opening
    if (window.confirm(t('studio.deleteVideoConfirmation'))) {
        onDeleteVideo(videoId);
    }
  };
  
  const projectStats = useMemo(() => {
    const projectVideos = getVideosForProject(viewingProjectId);
    if (projectVideos.length === 0) return { totalViews: 0, avgCtr: 0, avgCpa: 0 };

    const totalViews = projectVideos.reduce((sum, v) => sum + (v.analytics?.views || 0), 0);
    const totalCtr = projectVideos.reduce((sum, v) => sum + (v.analytics?.ctr || 0), 0);
    const totalCpa = projectVideos.reduce((sum, v) => sum + (v.analytics?.cpa || 0), 0);
    
    return {
      totalViews,
      avgCtr: totalCtr / projectVideos.length,
      avgCpa: totalCpa / projectVideos.length,
    };
  }, [viewingProjectId, videos]);


  const renderProjectListView = () => (
    <>
      <Header title={t('studio.header.title')} subtitle={t('studio.header.subtitle')} />
       <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title={t('studio.stats.totalRevenue')} value={`$${stats.totalRevenue.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
          <StatCard title={t('studio.stats.completedProjects')} value={stats.completedProjects} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard title={t('studio.stats.totalVideos')} value={stats.totalVideos} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-yellow-400"><path d="M16 16l-4-4-4 4M12 12V4" /><path d="M20 12v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4" /></svg>} />
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-semibold text-white mb-4">{t('studio.projectList.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => {
            const projectVideos = getVideosForProject(project.id);
            return (
              <ProjectCard 
                key={project.id}
                project={project}
                videoCount={projectVideos.length}
                latestVideo={projectVideos[0]}
                onClick={() => setViewingProjectId(project.id)}
              />
            )
          })}
          {/* Add New Project Card */}
          <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-cyan-400 hover:bg-slate-800 transition-colors duration-300">
             <h3 className="text-lg font-semibold text-white mb-4">{t('studio.addProject.title')}</h3>
             <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder={t('studio.addProject.clientName')} className="w-full bg-slate-800 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-sm p-2" required />
                  <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder={t('studio.addProject.projectName')} className="w-full bg-slate-800 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-sm p-2" required />
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder={t('studio.addProject.price')} className="w-full bg-slate-800 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-sm p-2" min="0" step="0.01" required />
                  <button type="submit" className="w-full bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors duration-300">{t('studio.addProject.addButton')}</button>
              </form>
          </div>
        </div>
      </div>
    </>
  );

  const renderProjectDetailView = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      setViewingProjectId(null); // Project not found, go back to list
      return null;
    }
    const projectVideos = getVideosForProject(projectId);

    return (
      <>
        <div className="mb-8">
          <button onClick={() => setViewingProjectId(null)} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            {t('studio.projectDetail.backToStudio')}
          </button>
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">{project.projectName}</h2>
              <p className="mt-1 text-sm text-slate-400">{project.clientName} - ${project.price.toFixed(2)}</p>
            </div>
             <div className="mt-4 flex md:mt-0 md:ml-4 items-center gap-4">
                <div className="p-1 bg-slate-800 rounded-lg flex gap-1">
                    <button onClick={() => setViewMode('gallery')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'gallery' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}>{t('studio.viewModes.gallery')}</button>
                    <button onClick={() => setViewMode('performance')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'performance' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}>{t('studio.viewModes.performance')}</button>
                </div>
                <button
                    onClick={() => onNavigate('generator')}
                    className="w-full bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors duration-300"
                >
                    {t('studio.projectDetail.createVideo')}
                </button>
            </div>
          </div>
        </div>

        {viewMode === 'gallery' && (projectVideos.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-scale">
                {projectVideos.map((video) => (
                    <div key={video.id} onClick={() => setSelectedVideo(video)} className="cursor-pointer bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-700 group transition-all duration-300 hover:shadow-cyan-500/20 hover:border-slate-600 hover:-translate-y-1 relative">
                        <div className="aspect-video relative">
                            <img src={video.imagePreview} alt="Video thumbnail" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="bg-slate-100 text-slate-900 font-bold py-2 px-4 rounded-full text-sm">
                                    {t('studio.viewDetailsButton')}
                                </span>
                            </div>
                            {video.isVariation && (
                              <div className="absolute top-2 left-2" title="A/B Test Variation">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300 drop-shadow-lg h-5 w-5 bg-black/30 rounded-full p-0.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                              </div>
                            )}
                        </div>
                        <div className="p-4 flex justify-between items-start">
                           <div>
                              <p className="text-sm font-semibold text-white truncate">{video.projectName || t('studio.unassignedProject')}</p>
                              <p className="text-xs text-slate-400 truncate">{video.clientName || ' '}</p>
                           </div>
                           <button onClick={(e) => handleDeleteVideoConfirm(e, video.id)} className="text-slate-500 hover:text-red-400 p-1 rounded-full hover:bg-slate-700/50 transition-colors z-10 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                           </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
          <div className="text-center py-16 rounded-lg border-2 border-dashed border-slate-700">
            <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2-2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">{t('studio.noAssets.title')}</h3>
            <p className="mt-1 text-sm text-slate-400">{t('studio.noAssets.subtitle')}</p>
          </div>
        ))}

        {viewMode === 'performance' && (
           <div className="animate-fade-in-scale space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title={t('analytics.project.totalViews')} value={projectStats.totalViews.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-cyan-400"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>} />
              <StatCard title={t('analytics.project.avgCtr')} value={`${projectStats.avgCtr.toFixed(2)}%`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-400"><polyline points="22 12 16 12 14 15 10 9 8 12 2 12"/><polyline points="16 6 22 12 16 18"/></svg>} />
              <StatCard title={t('analytics.project.avgCpa')} value={`$${projectStats.avgCpa.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-yellow-400"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} />
            </div>
            <div className="space-y-4">
              {projectVideos.map(video => (
                 <div key={video.id} onClick={() => setSelectedVideo(video)} className="cursor-pointer bg-slate-800/50 border border-slate-700 p-4 rounded-lg grid grid-cols-12 items-center gap-4 hover:bg-slate-800 transition-colors">
                    <div className="col-span-3 md:col-span-2">
                       <img src={video.imagePreview} alt="thumbnail" className="aspect-video w-full rounded-md object-cover" />
                    </div>
                    <div className="col-span-9 md:col-span-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                       <div><p className="text-xs text-slate-400">{t('analytics.kpi.views')}</p><p className="font-bold text-lg text-white">{video.analytics?.views.toLocaleString()}</p></div>
                       <div><p className="text-xs text-slate-400">{t('analytics.kpi.ctr')}</p><p className="font-bold text-lg text-white">{video.analytics?.ctr.toFixed(2)}%</p></div>
                       <div><p className="text-xs text-slate-400">{t('analytics.kpi.cpa')}</p><p className="font-bold text-lg text-white">${video.analytics?.cpa.toFixed(2)}</p></div>
                       <div className="hidden md:block"><p className="text-xs text-slate-400">{t('analytics.retention.peak')}</p><p className="font-bold text-lg text-white">{Math.max(...(video.analytics?.retentionData || [0]))}%</p></div>
                    </div>
                 </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-scale">
        {viewingProjectId ? renderProjectDetailView(viewingProjectId) : renderProjectListView()}
      </div>
      {selectedVideo && (
        <VideoDetailModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
          projects={projects}
          onToggleStatus={onToggleProjectStatus}
          onDeleteVideo={onDeleteVideo}
          onStartEdit={onStartEdit}
          onUpdateVideo={onUpdateVideo}
          onAddVideoVariations={onAddVideoVariations}
        />
      )}
    </>
  );
};

export default StudioPage;
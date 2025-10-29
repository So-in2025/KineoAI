import React, { useState, useCallback, useEffect } from 'react';
import { GeneratedVideoType, ProjectType, User, VideoAnalytics } from './types';
import { LanguageProvider, useTranslation } from './hooks/useTranslation';

import Navbar from './components/Navbar';
import HomePage from './components/pages/HomePage';
import GeneratorPage from './components/pages/GeneratorPage';
import StudioPage from './components/pages/StudioPage';
import PresentationPage from './components/pages/PresentationPage';
import BillingPage from './components/pages/BillingPage';
import AccountPage from './components/pages/AccountPage';
import ConversationalAssistant from './components/ConversationalAssistant';

export type Page = 'home' | 'generator' | 'studio' | 'billing' | 'account';

const generateMockAnalytics = (): VideoAnalytics => {
  const views = Math.floor(Math.random() * 95000) + 5000; // 5k to 100k
  const ctr = Math.random() * 3 + 1; // 1% to 4%
  const cpa = Math.random() * 40 + 5; // $5 to $45

  // Simulate audience drop-off
  let lastRetention = 100;
  const retentionData = Array.from({ length: 10 }, (_, i) => {
    if (i === 0) return 100;
    const dropOff = Math.random() * (10 - i) + 2; // Bigger drop-off at the start
    lastRetention = Math.max(0, lastRetention - dropOff);
    return Math.round(lastRetention);
  });

  return {
    views,
    ctr: parseFloat(ctr.toFixed(2)),
    cpa: parseFloat(cpa.toFixed(2)),
    retentionData,
  };
};

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [videoToEdit, setVideoToEdit] = useState<GeneratedVideoType | null>(null);
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);
  const { t } = useTranslation();
  
  const [userCredits, setUserCredits] = useState(() => {
    const savedCredits = localStorage.getItem('kineo-credits');
    return savedCredits ? parseInt(savedCredits, 10) : 10;
  });
  
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideoType[]>(() => {
    try {
      const savedVideos = localStorage.getItem('kineo-videos');
      const parsedVideos = savedVideos ? JSON.parse(savedVideos) : [];
      // Ensure all videos have analytics data
      return parsedVideos.map((video: GeneratedVideoType) => ({
        ...video,
        analytics: video.analytics || generateMockAnalytics(),
      }));
    } catch (error) {
      console.error("Failed to parse videos from localStorage", error);
      return [];
    }
  });

  const [projects, setProjects] = useState<ProjectType[]>(() => {
    try {
      const savedProjects = localStorage.getItem('kineo-projects');
      return savedProjects ? JSON.parse(savedProjects) : [];
    } catch (error) {
      console.error("Failed to parse projects from localStorage", error);
      return [];
    }
  });
  
  const [user, setUser] = useState<User>(() => {
    try {
      const savedUser = localStorage.getItem('kineo-user');
      return savedUser ? JSON.parse(savedUser) : {};
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('kineo-credits', userCredits.toString());
  }, [userCredits]);

  useEffect(() => {
    try {
      localStorage.setItem('kineo-videos', JSON.stringify(generatedVideos));
    } catch (error) {
      console.error("Failed to save videos to localStorage", error);
    }
  }, [generatedVideos]);

  useEffect(() => {
    try {
      localStorage.setItem('kineo-projects', JSON.stringify(projects));
    } catch (error) {
      console.error("Failed to save projects to localStorage", error);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('kineo-user', JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  }, [user]);


  const handleAddVideo = useCallback((video: GeneratedVideoType) => {
    const videoWithAnalytics = {
      ...video,
      analytics: generateMockAnalytics(),
    };
    setGeneratedVideos(prevVideos => [videoWithAnalytics, ...prevVideos]);
    alert("Video and assets saved to The Studio!"); // Simple feedback
    setCurrentPage('studio');
    if (video.projectId) {
      setViewingProjectId(video.projectId);
    } else {
      setViewingProjectId(null);
    }
  }, []);
  
  const handleUpdateVideo = useCallback((updatedVideo: GeneratedVideoType) => {
    setGeneratedVideos(prevVideos => 
      prevVideos.map(v => v.id === updatedVideo.id ? updatedVideo : v)
    );
    // Don't show alert for simple updates like adding notes
    // alert("Video updated successfully!");
  }, []);

  const handleAddVideoVariations = useCallback((originalVideo: GeneratedVideoType, variations: string[]) => {
    const newVariationVideos = variations.map((text, index) => {
      const newVideo: GeneratedVideoType = {
        ...originalVideo,
        id: `${originalVideo.id}-var-${index}-${Date.now()}`,
        textOverlay: { ...originalVideo.textOverlay!, content: text },
        isVariation: true,
        variationOf: originalVideo.id,
        analytics: generateMockAnalytics(), // Give it its own analytics
      };
      return newVideo;
    });

    setGeneratedVideos(prevVideos => [...newVariationVideos, ...prevVideos]);
    alert(`${variations.length} new video variations have been added to the project for A/B testing!`);
    setCurrentPage('studio');
    if (originalVideo.projectId) {
      setViewingProjectId(originalVideo.projectId);
    }
  }, []);

  const handleStartEdit = useCallback((video: GeneratedVideoType) => {
    setVideoToEdit(video);
    setCurrentPage('generator');
  }, []);

  const handleEditComplete = useCallback(() => {
    setVideoToEdit(null);
  }, []);

  const handleConsumeCredit = useCallback(() => {
    setUserCredits(prev => (prev > 0 ? prev - 1 : 0));
  }, []);

  const handleAddCredits = useCallback((amount: number) => {
    setUserCredits(prev => prev + amount);
    setCurrentPage('studio');
  }, []);

  const handleAddProject = useCallback((project: Omit<ProjectType, 'id'>) => {
    const newProject = { ...project, id: new Date().toISOString() };
    setProjects(prevProjects => [...prevProjects, newProject]);
    // Go to the newly created project's detail view
    setViewingProjectId(newProject.id);
    return t('assistant.response.projectCreated', { projectName: newProject.projectName });
  }, [t]);

  const handleStartVideoForProject = useCallback((projectName: string) => {
    const project = projects.find(p => p.projectName.toLowerCase() === projectName.toLowerCase());
    if (project) {
        setViewingProjectId(project.id);
        setCurrentPage('generator');
        return t('assistant.response.startingVideo', { projectName: project.projectName });
    }
    return `Project "${projectName}" not found.`;
  }, [projects, t]);

  const handleToggleProjectStatus = useCallback((id: string) => {
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === id ? { ...p, status: p.status === 'in-progress' ? 'completed' : 'in-progress' } : p
      )
    );
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
    // Also remove link from videos
    setGeneratedVideos(prevVideos => 
      prevVideos.map(v => v.projectId === id ? { ...v, projectId: undefined, projectName: undefined, clientName: undefined } : v)
    );
    setViewingProjectId(null); // Go back to project list
  }, []);
  
  const handleDeleteVideo = useCallback((id: string) => {
    setGeneratedVideos(prevVideos => prevVideos.filter(v => v.id !== id));
  }, []);

  const handleSetUserLogo = useCallback((logo: string) => {
    setUser(prevUser => ({ ...prevUser, logo }));
  }, []);

  const handleNavigate = (page: Page) => {
    if (page === 'studio') {
      setViewingProjectId(null); // Always go to project list view when clicking navbar
    }
    setCurrentPage(page);
    return t('assistant.response.navigating', { page });
  };

  // Presentation Page Logic
  const presentationVideoId = new URLSearchParams(window.location.search).get('presentation');
  if (presentationVideoId) {
    const videoToShow = generatedVideos.find(v => v.id === presentationVideoId);
    if (videoToShow) {
      return <PresentationPage video={videoToShow} user={user} />;
    }
  }
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'generator':
        return <GeneratorPage 
                  onVideoGenerated={handleAddVideo} 
                  projects={projects} 
                  userCredits={userCredits} 
                  onConsumeCredit={handleConsumeCredit} 
                  user={user} 
                  videos={generatedVideos}
                  videoToEdit={videoToEdit}
                  onVideoUpdated={handleUpdateVideo}
                  onEditComplete={handleEditComplete}
                  preselectedProjectId={viewingProjectId}
                />;
      case 'studio':
          return <StudioPage
                    projects={projects}
                    videos={generatedVideos}
                    onAddProject={handleAddProject}
                    onToggleProjectStatus={handleToggleProjectStatus}
                    onDeleteProject={handleDeleteProject}
                    onDeleteVideo={handleDeleteVideo}
                    onStartEdit={handleStartEdit}
                    onUpdateVideo={handleUpdateVideo}
                    onAddVideoVariations={handleAddVideoVariations}
                    user={user}
                    onSetUserLogo={handleSetUserLogo}
                    onNavigate={handleNavigate}
                    viewingProjectId={viewingProjectId}
                    setViewingProjectId={setViewingProjectId}
                 />;
      case 'billing':
        return <BillingPage onAddCredits={handleAddCredits} />;
      case 'account':
        return <AccountPage user={user} onSetUserLogo={handleSetUserLogo} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
      <div className="main-content bg-slate-900 text-white selection:bg-cyan-500 selection:text-white">
        <div className="relative z-10 min-h-full flex flex-col">
          <Navbar 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            userCredits={userCredits}
          />
          <main className="flex-grow">
            {renderPage()}
          </main>
          <footer className="flex-shrink-0 text-center p-4 mt-8 border-t border-slate-800/50">
            <p className="text-slate-500 text-sm">Kineo AI &copy; 2024. Your AI Cinematic Ad Studio.</p>
          </footer>
        </div>
        <ConversationalAssistant 
          onNavigate={handleNavigate}
          onAddProject={handleAddProject}
          onStartVideoForProject={handleStartVideoForProject}
        />
      </div>
  );
};


const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App;
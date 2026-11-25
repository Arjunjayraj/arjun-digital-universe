import { useEffect, useState } from 'react';
import type { AppView, IslandId } from './data/portfolioData';
import { SanctuaryHomeView } from './views/SanctuaryHomeView';
import { World3DView } from './views/World3DView';
import { ProjectGalleryView } from './views/ProjectGalleryView';
import { ContactPortalView } from './views/ContactPortalView';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('sanctuary');
  const [worldInitialIsland, setWorldInitialIsland] = useState<IslandId | null>(
    null
  );
  const [contactInitialSubject, setContactInitialSubject] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeView]);

  const handleEnterWorld = (initialIsland: IslandId | null = null) => {
    setWorldInitialIsland(initialIsland);
    setActiveView('world');
  };

  const handleNavigateView = (view: AppView, projectTitle?: string) => {
    if (view === 'contact' && projectTitle) {
      setContactInitialSubject(projectTitle);
    } else if (view !== 'contact') {
      setContactInitialSubject('');
    }
    setActiveView(view);
  };

  if (activeView === 'world') {
    return (
      <World3DView
        initialIsland={worldInitialIsland}
        onExitWorld={() => setActiveView('sanctuary')}
        onNavigateView={(view) => handleNavigateView(view)}
      />
    );
  }

  if (activeView === 'gallery') {
    return (
      <ProjectGalleryView
        onBack={() => setActiveView('sanctuary')}
        onDiscussProject={(title) => handleNavigateView('contact', title)}
      />
    );
  }

  if (activeView === 'contact') {
    return (
      <ContactPortalView
        onBack={() => setActiveView('sanctuary')}
        initialSubject={contactInitialSubject}
      />
    );
  }

  return (
    <SanctuaryHomeView
      onEnterWorld={handleEnterWorld}
      onNavigateView={handleNavigateView}
    />
  );
}

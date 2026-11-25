import { useState } from 'react';
import { PROJECTS, type ProjectItem } from '../data/portfolioData';
import { ProjectModelViewer } from '../components/ProjectModelViewer';

interface ProjectGalleryViewProps {
  onBack: () => void;
  onDiscussProject: (projectTitle: string) => void;
}

type FilterOption = 'All' | 'Featured' | 'Cloud & AI' | 'Web & UI/UX';

export function ProjectGalleryView({
  onBack,
  onDiscussProject,
}: ProjectGalleryViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [selectedProject, setSelectedProject] = useState<ProjectItem>(
    PROJECTS[0]
  );

  const filters: FilterOption[] = ['All', 'Featured', 'Cloud & AI', 'Web & UI/UX'];
  const visibleProjects = PROJECTS.filter((p) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Featured') return p.featured;
    return p.filterGroup === activeFilter;
  });

  return (
    <div className="min-h-screen w-full sky-backdrop flex flex-col">
      {/* Sticky Glass Header */}
      <header className="sticky top-0 z-20 aether-glass border-b border-champagne-gold/30 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-surface-container-low border border-champagne-gold/40 flex items-center justify-center text-on-surface hover:bg-primary-container transition-colors cursor-pointer shrink-0"
              aria-label="Back to Sanctuary"
            >
              <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">
                arrow_back
              </span>
            </button>
            <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">
              museum
            </span>
            <div className="flex flex-col">
              <h1 className="font-headline text-2xl font-semibold text-on-surface leading-tight">
                The Project Gallery
              </h1>
              <span className="font-label text-xs text-on-surface-variant">
                Aether — Arjun Jayraj
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {filters.map((f) => {
              const isActive = activeFilter === f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-full font-label text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-low/80 text-on-surface border-outline-variant/60 hover:bg-primary-container'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content: Gallery Grid + Live 3D Artifact Inspector */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Project Cards Grid (7 cols) */}
        <section
          aria-label="Project Collection"
          className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch"
        >
          {visibleProjects.map((proj) => {
            const isSelected = selectedProject && selectedProject.id === proj.id;
            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => setSelectedProject(proj)}
                className={`h-full text-left p-6 rounded-md aether-glass border transition-colors flex flex-col justify-between gap-4 cursor-pointer ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/40'
                    : 'border-champagne-gold/35 hover:border-primary'
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs font-label text-primary">
                    <span>
                      {proj.category}
                      {proj.featured ? ' · Featured' : ''}
                    </span>
                  </div>
                  <h2 className="font-headline text-2xl font-semibold text-on-surface">
                    {proj.title}
                  </h2>
                  <p className="font-body text-sm text-on-surface-variant text-pretty">
                    {proj.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-outline-variant/30 font-label text-xs text-on-surface-variant">
                  {proj.stack.slice(0, 3).join(' · ')}
                </div>
              </button>
            );
          })}
        </section>

        {/* Right: Live 3D Artifact Inspector (5 cols) */}
        {selectedProject && (
          <aside
            aria-label="Selected Project Inspector"
            className="lg:col-span-5 lg:sticky lg:top-24 aether-glass rounded-lg border border-champagne-gold/45 p-6 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <span className="font-label text-xs text-primary uppercase tracking-wider">
                {selectedProject.category}
              </span>
              <h2 className="font-headline text-[28px] leading-tight font-semibold text-on-surface">
                {selectedProject.title}
              </h2>
            </div>

            <ProjectModelViewer project={selectedProject} />

            <div className="flex flex-col gap-1">
              <h3 className="font-title text-base font-bold text-on-surface">
                Architecture & Craft
              </h3>
              <p className="font-body text-sm text-on-surface-variant text-pretty">
                {selectedProject.architecture}
              </p>
            </div>

            <ul className="flex flex-col gap-1.5">
              {selectedProject.highlights.map((hl) => (
                <li
                  key={hl}
                  className="flex items-start gap-2 font-body text-sm text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-primary text-base shrink-0" aria-hidden="true">
                    auto_awesome
                  </span>
                  <span>{hl}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2 pt-1">
              {selectedProject.liveUrl && (
                <a
                  href={selectedProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-full bg-primary text-on-primary font-label text-sm font-bold hover:bg-on-primary-container transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    open_in_new
                  </span>
                  <span>Visit Live Project</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => onDiscussProject(selectedProject.title)}
                className={`w-full py-2.5 rounded-full font-label text-sm font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedProject.liveUrl
                    ? 'bg-surface-container-low border border-champagne-gold/50 text-on-surface hover:bg-primary-container'
                    : 'bg-primary text-on-primary hover:bg-on-primary-container'
                }`}
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  send
                </span>
                <span>Discuss Similar Project</span>
              </button>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}

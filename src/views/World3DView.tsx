import { useEffect, useState } from 'react';
import { ISLANDS, type AppView, type IslandId } from '../data/portfolioData';
import { AetherWorldCanvas } from '../components/AetherWorldCanvas';
import { IslandPanelContent } from '../components/IslandPanelContent';

interface World3DViewProps {
  initialIsland: IslandId | null;
  onExitWorld: () => void;
  onNavigateView: (view: AppView) => void;
}

export function World3DView({
  initialIsland,
  onExitWorld,
  onNavigateView,
}: World3DViewProps) {
  const [sceneReady, setSceneReady] = useState(false);
  const [entered, setEntered] = useState(true);
  const [activeIslandId, setActiveIslandId] = useState<IslandId | null>(
    initialIsland
  );
  const [hoveredIslandId, setHoveredIslandId] = useState<IslandId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => {
    try {
      return (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (!entered) {
        if (ev.key === 'Enter') setEntered(true);
        return;
      }
      const tag = (document.activeElement?.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (ev.key === 'Escape') {
        if (mobileMenuOpen) setMobileMenuOpen(false);
        else if (activeIslandId) setActiveIslandId(null);
      } else if (ev.key === 'h' || ev.key === 'H') {
        setDockCollapsed((v) => !v);
      } else {
        const num = parseInt(ev.key, 10);
        if (num >= 1 && num <= 6) {
          setActiveIslandId(ISLANDS[num - 1].id);
        } else if (ev.key === '0') {
          setActiveIslandId(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [entered, activeIslandId, mobileMenuOpen]);

  const activeIsland = ISLANDS.find((i) => i.id === activeIslandId) || null;
  const hoveredIsland = ISLANDS.find((i) => i.id === hoveredIslandId) || null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden sky-backdrop flex flex-col justify-between">
      <AetherWorldCanvas
        entered={entered}
        activeIslandId={activeIslandId}
        onSelectIsland={(id) => setActiveIslandId(id)}
        reducedMotion={reducedMotion}
        onSceneReady={() => setSceneReady(true)}
        onHoverIsland={(id) => setHoveredIslandId(id)}
      />

      {!sceneReady && (
        <div className="fixed inset-0 z-50 bg-surface flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-champagne-gold/30 border-t-primary animate-spin" />
          <span className="font-label text-xs uppercase tracking-widest text-primary">
            Awakening Aether...
          </span>
        </div>
      )}

      {/* TOP HUD */}
      <header className="relative z-20 w-full p-4 sm:p-6 flex items-center justify-between gap-4 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onExitWorld}
            className="aether-hud-surface inline-flex items-center gap-2 px-4 py-2 rounded-full border border-champagne-gold/40 hover:border-primary transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">
              arrow_back
            </span>
            <span className="font-headline text-base text-on-surface font-semibold tracking-wide">
              AETHER
            </span>
            <span className="hidden sm:inline font-label text-xs text-on-surface-variant">
              — Sanctuary Overview
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {activeIslandId && (
            <button
              type="button"
              onClick={() => setActiveIslandId(null)}
              className="aether-hud-surface inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-champagne-gold/40 text-on-surface font-label text-xs font-bold hover:bg-primary-container transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">
                public
              </span>
              <span>Return to Sky</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setReducedMotion((v) => !v)}
            aria-pressed={reducedMotion}
            title={reducedMotion ? 'Enable Ambient Motion' : 'Reduce Motion'}
            className="aether-hud-surface inline-flex items-center justify-center w-10 h-10 rounded-full border border-outline-variant/60 text-on-surface hover:border-champagne-gold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">
              {reducedMotion ? 'pause_circle' : 'motion_photos_on'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle World Map Menu"
            className="lg:hidden aether-hud-surface inline-flex items-center justify-center w-10 h-10 rounded-full border border-champagne-gold/40 text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* HOVER TOOLTIP OR INTERACTION HINT */}
      {hoveredIsland && !activeIsland ? (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="aether-hud-surface px-4 py-1.5 rounded-full border border-champagne-gold/50 flex items-center gap-2">
            <span className="font-label text-xs font-bold text-primary tabular-nums">
              {hoveredIsland.number}
            </span>
            <span className="font-headline text-base font-semibold text-on-surface">
              {hoveredIsland.name}
            </span>
            <span className="font-body text-sm text-on-surface-variant hidden sm:inline">
              — Click to explore
            </span>
          </div>
        </div>
      ) : (
        !activeIsland && (
          <div className="hidden md:block fixed top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="aether-hud-surface px-4 py-1.5 rounded-full border border-champagne-gold/35 font-label text-xs text-on-surface-variant">
              Drag to orbit · Scroll to zoom · Click any floating island
            </div>
          </div>
        )
      )}

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <nav
          aria-label="Island Locations"
          className="lg:hidden fixed inset-x-4 top-20 z-30 aether-hud-surface rounded-lg border border-champagne-gold/40 p-4 flex flex-col gap-1"
        >
          {ISLANDS.map((isl) => (
            <button
              key={isl.id}
              type="button"
              onClick={() => {
                setActiveIslandId(isl.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                activeIslandId === isl.id
                  ? 'bg-primary text-on-primary'
                  : 'hover:bg-primary-container/60 text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg" aria-hidden="true">
                  {isl.icon}
                </span>
                <span className="font-body text-sm font-bold">{isl.name}</span>
              </div>
              <span className="font-label text-xs opacity-75 tabular-nums">
                {isl.number}
              </span>
            </button>
          ))}
        </nav>
      )}

      {/* ACTIVE ISLAND INFORMATION DRAWER */}
      {activeIsland && (
        <aside
          aria-label={`${activeIsland.name} Details`}
          className="fixed z-30 bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:top-20 sm:bottom-24 sm:w-[440px] aether-hud-surface rounded-lg border border-champagne-gold/45 flex flex-col overflow-hidden pointer-events-auto"
        >
          <header className="p-5 border-b border-outline-variant/40 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-label text-on-surface-variant">
                <span className="font-bold text-primary tabular-nums">
                  Location {activeIsland.number}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeIsland.subtitle}</span>
              </div>
              <h2 className="font-headline text-3xl font-semibold text-on-surface">
                {activeIsland.name}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close island panel"
              onClick={() => setActiveIslandId(null)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface-container text-on-surface hover:bg-primary-container transition-colors shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">
                close
              </span>
            </button>
          </header>

          <div className="p-5 overflow-y-auto aether-scroll flex-1 max-h-[55vh] sm:max-h-none">
            <p className="font-body text-sm text-on-surface-variant mb-4 pb-4 border-b border-outline-variant/30 text-pretty">
              {activeIsland.summary}
            </p>
            <IslandPanelContent
              islandId={activeIsland.id}
              onNavigate={(id) => setActiveIslandId(id)}
              onOpenFullGallery={() => onNavigateView('gallery')}
              onOpenFullContact={() => onNavigateView('contact')}
              reducedMotion={reducedMotion}
            />
          </div>

          <footer className="px-5 py-3 border-t border-outline-variant/40 bg-surface-container-low flex items-center justify-between gap-2">
            {(() => {
              const idx = ISLANDS.findIndex((i) => i.id === activeIsland.id);
              const prevIsl = ISLANDS[(idx - 1 + ISLANDS.length) % ISLANDS.length];
              const nextIsl = ISLANDS[(idx + 1) % ISLANDS.length];
              return (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveIslandId(prevIsl.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary-container/50 transition-colors font-label text-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">
                      arrow_back
                    </span>
                    <span>{prevIsl.shortName}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIslandId(nextIsl.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-primary hover:bg-primary-container/60 transition-colors font-label text-xs font-bold cursor-pointer"
                  >
                    <span>{nextIsl.shortName}</span>
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">
                      arrow_forward
                    </span>
                  </button>
                </>
              );
            })()}
          </footer>
        </aside>
      )}

      {/* COLLAPSIBLE BOTTOM ISLAND WAYPOINT DOCK */}
      <nav
        aria-label="World Island Navigation"
        className="relative z-20 w-full p-4 sm:p-5 flex flex-col items-center justify-center gap-2 pointer-events-none"
      >
        <button
          type="button"
          onClick={() => setDockCollapsed((v) => !v)}
          className="hidden lg:inline-flex pointer-events-auto aether-hud-surface items-center gap-1 px-3 py-1 rounded-full border border-champagne-gold/35 font-label text-xs text-on-surface-variant hover:text-primary cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            {dockCollapsed ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
          </span>
          <span>{dockCollapsed ? 'Show Islands' : 'Hide Controls'}</span>
        </button>

        {!dockCollapsed && (
          <div className="aether-hud-surface pointer-events-auto hidden lg:flex items-center gap-1 p-1.5 rounded-full border border-champagne-gold/35">
            {ISLANDS.map((isl) => {
              const isActive = activeIslandId === isl.id;
              return (
                <button
                  key={isl.id}
                  aria-pressed={isActive}
                  type="button"
                  onClick={() => setActiveIslandId(isActive ? null : isl.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface hover:bg-primary-container/70'
                  }`}
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    {isl.icon}
                  </span>
                  <span className="font-label text-xs font-bold">
                    {isl.shortName}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {!activeIsland && (
          <div className="lg:hidden aether-hud-surface pointer-events-auto px-4 py-1.5 rounded-full border border-champagne-gold/35 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">
              touch_app
            </span>
            <span className="font-label text-xs text-on-surface">
              Tap any island or open menu
            </span>
          </div>
        )}
      </nav>
    </div>
  );
}

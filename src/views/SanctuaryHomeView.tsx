import { useEffect, useState, type FormEvent } from 'react';
import {
  ACHIEVEMENTS_PANEL_LIST,
  ARTWORK,
  LIBRARY_TOPICS,
  TECH_STACK_LIST,
  type AppView,
  type IslandId,
} from '../data/portfolioData';
import { ResilientImage } from '../components/ResilientImage';

interface SanctuaryHomeViewProps {
  onEnterWorld: (initialIsland?: IslandId | null) => void;
  onNavigateView: (view: AppView, projectTitle?: string) => void;
}

export function SanctuaryHomeView({
  onEnterWorld,
  onNavigateView,
}: SanctuaryHomeViewProps) {
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [msgName, setMsgName] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        if (aboutModalOpen) setAboutModalOpen(false);
        else if (mobileNavOpen) setMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aboutModalOpen, mobileNavOpen]);

  const scrollTo = (id: string) => {
    setMobileNavOpen(false);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleQuickSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    setMsgSent(true);
  };

  return (
    <div className="min-h-screen w-full bg-surface text-on-surface flex flex-col">
      {/* 1. TOP HERO + EDITORIAL SIDEBAR SPLIT */}
      <section
        id="top"
        className="w-full grid grid-cols-1 lg:grid-cols-12 border-b border-outline-variant/40 items-stretch"
      >
        {/* Left 8 cols: Castle Sky Panorama */}
        <div className="lg:col-span-8 relative min-h-[540px] sm:min-h-[620px] flex flex-col justify-between overflow-hidden">
          <ResilientImage
            src={ARTWORK.heroCastle}
            alt="Floating ivory castle above clouds with waterfalls and arched bridge"
            className="absolute inset-0 w-full h-full object-cover object-right"
            fallbackLabel="Aether — Floating Sanctuary"
          />
          <div className="hero-scrim absolute inset-0" />

          {/* Clean 3-Zone Top Bar */}
          <header className="relative z-20 px-6 sm:px-8 py-5 flex items-center justify-between gap-8">
            <a
              href="#top"
              className="inline-flex items-center gap-2 text-on-surface whitespace-nowrap shrink-0"
            >
              <span
                className="material-symbols-outlined text-champagne-gold text-xl"
                aria-hidden="true"
              >
                spark
              </span>
              <span className="font-headline text-lg tracking-widest uppercase font-semibold">
                ARJUN JAYRAJ
              </span>
            </a>

            <nav
              aria-label="Primary Navigation"
              className="hidden md:flex items-center gap-6"
            >
              {[
                { label: 'Home', id: 'island-home' },
                { label: 'Skills', id: 'island-garden' },
                { label: 'Projects', id: 'island-gallery' },
                { label: 'Achievements', id: 'island-achievements' },
                { label: 'Contact', id: 'island-contact' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className="font-body text-sm font-bold text-on-surface hover:text-primary hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onEnterWorld(null)}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-wider hover:bg-on-primary-container transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  public
                </span>
                <span>3D World</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileNavOpen((v) => !v)}
                aria-label="Toggle Navigation Menu"
                className="md:hidden ivory-card w-10 h-10 rounded-full border border-champagne-gold/40 inline-flex items-center justify-center text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">
                  {mobileNavOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </header>

          {mobileNavOpen && (
            <nav
              aria-label="Mobile Navigation"
              className="md:hidden relative z-20 mx-6 ivory-card rounded-md border border-champagne-gold/40 p-2 grid grid-cols-2 gap-1"
            >
              {[
                { label: 'Home', id: 'island-home' },
                { label: 'Skills', id: 'island-garden' },
                { label: 'Projects', id: 'island-gallery' },
                { label: 'Achievements', id: 'island-achievements' },
                { label: 'Library', id: 'island-library' },
                { label: 'Contact', id: 'island-contact' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className="px-3 py-2 rounded-xl text-left font-body text-sm text-on-surface hover:bg-primary-container cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* Hero Typography & CTA */}
          <div className="relative z-10 px-6 sm:px-8 py-8 flex flex-col items-start gap-4 max-w-xl">
            <h1 className="font-display text-4xl sm:text-[56px] sm:leading-[64px] text-on-surface tracking-tight uppercase font-medium text-balance">
              ARJUN JAYRAJ
            </h1>
            <p className="font-headline text-2xl italic text-on-surface font-semibold">
              Exploring Ideas. Building Possibilities.
            </p>
            <p className="font-body text-base text-on-surface">
              Cloud Computing Student · Aspiring DevOps Engineer · Technology
              Enthusiast
            </p>
            <button
              type="button"
              onClick={() => onEnterWorld(null)}
              className="mt-1 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-surface-container-high/95 border border-champagne-gold/60 text-on-surface font-label text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>ENTER MY WORLD</span>
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Bottom-left scroll hint */}
          <button
            type="button"
            onClick={() => scrollTo('explore-strip')}
            className="relative z-10 px-6 sm:px-8 pb-6 inline-flex items-center gap-1.5 font-label text-xs font-medium text-on-surface hover:text-primary self-start cursor-pointer"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              south
            </span>
            <span>Scroll to explore</span>
          </button>
        </div>

        {/* Right 4 cols: Ivory Editorial Overview Panel */}
        <aside className="lg:col-span-4 bg-surface p-8 flex flex-col justify-center gap-6 border-t lg:border-t-0 lg:border-l border-outline-variant/40">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-champagne-gold text-2xl shrink-0"
                aria-hidden="true"
              >
                spark
              </span>
              <h2 className="font-headline text-[28px] leading-[34px] font-semibold text-on-surface text-balance">
                A Whole New World of Your Portfolio
              </h2>
            </div>
            <p className="font-body text-sm text-on-surface-variant text-pretty">
              Not just a website, but an immersive 3D world. Explore different
              islands, discover your journey, and experience the story of Arjun
              Jayraj.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              {
                icon: 'public',
                title: 'Interactive 3D World',
                desc: 'Rotate, zoom and explore the floating islands.',
              },
              {
                icon: 'auto_awesome',
                title: 'Beautiful & Elegant Design',
                desc: 'Aesthetic, calm and premium visual experience.',
              },
              {
                icon: 'layers',
                title: 'All Your Details',
                desc: 'Projects, skills, achievements, education and more.',
              },
              {
                icon: 'devices',
                title: 'Smooth & Responsive',
                desc: 'Works perfectly on all devices.',
              },
            ].map((feat) => (
              <div key={feat.title} className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant/60 flex items-center justify-center shrink-0 text-primary">
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    {feat.icon}
                  </span>
                </span>
                <div className="flex flex-col">
                  <span className="font-title text-base font-bold text-on-surface">
                    {feat.title}
                  </span>
                  <span className="font-body text-sm text-on-surface-variant">
                    {feat.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* 2. EXPLORE THE ISLANDS PANORAMIC STRIP */}
      <section
        id="explore-strip"
        className="w-full relative overflow-hidden border-b border-outline-variant/40 bg-surface"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-3 p-8 flex flex-col justify-center gap-2 bg-surface z-10">
            <span
              className="material-symbols-outlined text-champagne-gold text-2xl"
              aria-hidden="true"
            >
              spark
            </span>
            <h2 className="font-headline text-[28px] leading-tight font-semibold text-on-surface">
              Explore The Islands
            </h2>
            <p className="font-body text-sm text-on-surface-variant text-pretty">
              Each island represents a part of my journey. Click to discover
              more.
            </p>
          </div>

          <div className="lg:col-span-9 relative min-h-[260px] flex flex-col justify-end p-6 overflow-hidden">
            <ResilientImage
              src={ARTWORK.islandsPanorama}
              alt="Panoramic view of six interconnected floating islands"
              className="absolute inset-0 w-full h-full object-cover"
              fallbackLabel="Six Interconnected Floating Islands"
            />
            <div className="relative z-10 flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-12">
              {[
                { id: 'island-home', icon: 'castle', title: 'The Home' },
                { id: 'island-garden', icon: 'eco', title: 'Knowledge Garden' },
                { id: 'island-gallery', icon: 'museum', title: 'Project Gallery' },
                { id: 'island-achievements', icon: 'trophy', title: 'Achievements' },
                { id: 'island-library', icon: 'menu_book', title: 'The Library' },
                { id: 'island-contact', icon: 'mail', title: 'Contact Portal' },
              ].map((isl) => (
                <button
                  key={isl.id}
                  type="button"
                  onClick={() => scrollTo(isl.id)}
                  className="ivory-card px-4 py-1.5 rounded-full border border-champagne-gold/45 hover:border-primary transition-colors inline-flex items-center gap-1.5 text-on-surface whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-base shrink-0" aria-hidden="true">
                    {isl.icon}
                  </span>
                  <span className="font-title text-xs font-bold text-on-surface">
                    {isl.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIX FANTASY SANCTUARY PANELS (2x3 GRID) */}
      <main className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-surface p-1">
        {/* PANEL 1: THE HOME */}
        <article
          id="island-home"
          className="relative min-h-[380px] rounded-sm overflow-hidden flex flex-col justify-between p-6"
        >
          <ResilientImage
            src={ARTWORK.homeVista}
            alt="Sky terrace overlooking floating castles"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="panel-scrim absolute inset-0" />
          <header className="relative z-10 ivory-card self-start px-4 py-1.5 rounded-full border border-champagne-gold/40 flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">
              castle
            </span>
            <h2 className="font-headline text-2xl font-semibold">The Home</h2>
          </header>

          <div className="relative z-10 ivory-card self-end w-full sm:w-72 p-6 rounded-md border border-champagne-gold/40 flex flex-col gap-2">
            <h3 className="font-headline text-lg font-bold text-on-surface">
              Hi, I'm Arjun Jayraj
            </h3>
            <p className="font-body text-sm text-on-surface-variant text-pretty">
              BCA Cloud Computing Student at Kristu Jayanti University,
              Bengaluru. Passionate about cloud technologies, DevOps,
              cybersecurity and building real-world digital solutions.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAboutModalOpen(true)}
                className="px-4 py-1.5 rounded-full bg-surface-container-low border border-outline-variant text-on-surface font-label text-xs font-bold hover:bg-primary hover:text-on-primary transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Learn More</span>
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  arrow_forward
                </span>
              </button>
              <button
                type="button"
                onClick={() => onEnterWorld('home')}
                className="px-3 py-1.5 rounded-full text-primary font-label text-xs font-bold hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore in 3D
              </button>
            </div>
          </div>
        </article>

        {/* PANEL 2: KNOWLEDGE GARDEN */}
        <article
          id="island-garden"
          className="relative min-h-[380px] rounded-sm overflow-hidden flex flex-col justify-between p-6"
        >
          <ResilientImage
            src={ARTWORK.knowledgeGarden}
            alt="Lush floating botanical garden"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="panel-scrim absolute inset-0" />
          <header className="relative z-10 ivory-card self-start px-4 py-1.5 rounded-full border border-champagne-gold/40 flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">
              eco
            </span>
            <h2 className="font-headline text-2xl font-semibold">
              Knowledge Garden
            </h2>
          </header>

          <div className="relative z-10 flex flex-col sm:flex-row items-end justify-between gap-3">
            <div className="hidden sm:flex flex-wrap gap-1.5 max-w-[140px] pb-1">
              {['AWS', 'Linux', 'Docker', 'Python', 'Git', 'SQL'].map((orb) => (
                <button
                  key={orb}
                  type="button"
                  onClick={() => onEnterWorld('garden')}
                  className="ivory-card px-2.5 py-1 rounded-full border border-champagne-gold/50 font-label text-xs font-bold text-on-surface shadow-sm hover:border-primary transition-colors cursor-pointer"
                >
                  {orb}
                </button>
              ))}
            </div>

            <div className="ivory-card w-full sm:w-64 p-4 rounded-md border border-champagne-gold/40 flex flex-col gap-1">
              <h3 className="font-headline text-lg font-bold text-on-surface mb-1">
                My Tech Stack
              </h3>
              {TECH_STACK_LIST.map((sk) => (
                <div
                  key={sk}
                  className="flex items-center gap-1.5 font-body text-sm text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-champagne-gold text-xs" aria-hidden="true">
                    spark
                  </span>
                  <span>{sk}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* PANEL 3: PROJECT GALLERY */}
        <article
          id="island-gallery"
          className="relative min-h-[380px] rounded-sm overflow-hidden flex flex-col justify-between p-6"
        >
          <ResilientImage
            src={ARTWORK.projectGallery}
            alt="Glass dome museum pavilion"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="panel-scrim absolute inset-0" />
          <header className="relative z-10 ivory-card self-start px-4 py-1.5 rounded-full border border-champagne-gold/40 flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">
              museum
            </span>
            <h2 className="font-headline text-2xl font-semibold">
              Project Gallery
            </h2>
          </header>

          <div className="relative z-10 flex flex-col sm:flex-row items-end justify-between gap-3">
            <div className="hidden sm:flex flex-col gap-1.5 max-w-[140px] pb-1">
              {['CareerPilot AI', 'FindKart', 'My Portfolio'].map((holo) => (
                <button
                  key={holo}
                  type="button"
                  onClick={() => onNavigateView('gallery')}
                  className="ivory-card px-3 py-1 rounded-xl border border-powder-blue text-left font-label text-xs font-bold text-on-surface hover:border-primary transition-colors cursor-pointer whitespace-nowrap"
                >
                  {holo}
                </button>
              ))}
            </div>

            <div className="ivory-card w-full sm:w-64 p-4 rounded-md border border-champagne-gold/40 flex flex-col gap-2">
              <h3 className="font-headline text-lg font-bold text-on-surface">
                Featured Projects
              </h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { name: 'CareerPilot AI' },
                  {
                    name: 'FindCart',
                    url: 'https://findkart-hackahon.netlify.app/',
                  },
                  {
                    name: 'Personal Portfolio',
                    url: 'https://jayraj-folio-spark.lovable.app/',
                  },
                  { name: 'ShelfSync (Hackathon)' },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between gap-1 font-body text-sm text-on-surface"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-champagne-gold text-xs" aria-hidden="true">
                        spark
                      </span>
                      <span>{p.name}</span>
                    </span>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${p.name}`}
                        className="text-primary hover:text-on-primary-container"
                      >
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">
                          open_in_new
                        </span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onNavigateView('gallery')}
                className="self-start px-4 py-1.5 rounded-full bg-primary text-on-primary font-label text-xs font-bold hover:bg-on-primary-container transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>View All Projects</span>
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </article>

        {/* PANEL 4: HALL OF ACHIEVEMENTS */}
        <article
          id="island-achievements"
          className="relative min-h-[380px] rounded-sm overflow-hidden flex flex-col justify-between p-6"
        >
          <ResilientImage
            src={ARTWORK.hallAchievements}
            alt="Sunlit marble colonnade hall with golden trophy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="panel-scrim absolute inset-0" />
          <header className="relative z-10 ivory-card self-start px-4 py-1.5 rounded-full border border-champagne-gold/40 flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">
              trophy
            </span>
            <h2 className="font-headline text-2xl font-semibold">
              Hall of Achievements
            </h2>
          </header>

          <div className="relative z-10 ivory-card self-end w-full sm:w-80 p-5 rounded-md border border-champagne-gold/40 flex flex-col gap-1.5">
            {ACHIEVEMENTS_PANEL_LIST.map((ach) => (
              <div
                key={ach}
                className="flex items-center gap-1.5 font-body text-sm text-on-surface"
              >
                <span className="material-symbols-outlined text-champagne-gold text-xs shrink-0" aria-hidden="true">
                  spark
                </span>
                <span>{ach}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onEnterWorld('achievements')}
              className="self-start mt-1 font-label text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Hall & Testimonials</span>
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                arrow_forward
              </span>
            </button>
          </div>
        </article>

        {/* PANEL 5: THE LIBRARY */}
        <article
          id="island-library"
          className="relative min-h-[380px] rounded-sm overflow-hidden flex flex-col justify-between p-6"
        >
          <ResilientImage
            src={ARTWORK.library}
            alt="Sunlit grand fantasy library"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="panel-scrim absolute inset-0" />
          <header className="relative z-10 ivory-card self-start px-4 py-1.5 rounded-full border border-champagne-gold/40 flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">
              menu_book
            </span>
            <h2 className="font-headline text-2xl font-semibold">
              The Library
            </h2>
          </header>

          <div className="relative z-10 ivory-card self-end w-full sm:w-72 p-6 rounded-md border border-champagne-gold/40 flex flex-col gap-1.5">
            <h3 className="font-headline text-lg font-bold text-on-surface">
              My Journey
            </h3>
            <div className="font-body text-sm font-bold text-primary mb-1">
              BCA – Cloud Computing (KJU, 2025 – 2028)
            </div>
            {LIBRARY_TOPICS.map((topic) => (
              <div
                key={topic}
                className="flex items-center gap-1.5 font-body text-sm text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-champagne-gold text-xs" aria-hidden="true">
                  spark
                </span>
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </article>

        {/* PANEL 6: CONTACT PORTAL */}
        <article
          id="island-contact"
          className="relative min-h-[380px] rounded-sm overflow-hidden flex flex-col justify-between p-6"
        >
          <ResilientImage
            src={ARTWORK.contactPortal}
            alt="Luminous stone and gold archway portal"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="panel-scrim absolute inset-0" />
          <header className="relative z-10 w-full flex items-center justify-between gap-2">
            <div className="ivory-card px-4 py-1.5 rounded-full border border-champagne-gold/40 flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">
                auto_awesome
              </span>
              <h2 className="font-headline text-2xl font-semibold">
                Contact Portal
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateView('contact')}
              className="ivory-card px-3.5 py-1.5 rounded-full border border-champagne-gold/50 font-label text-xs font-bold text-primary hover:bg-primary hover:text-on-primary transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Open Full Portal
            </button>
          </header>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
            <div className="ivory-card p-4 rounded-md border border-champagne-gold/40 flex flex-col gap-2">
              <a
                href="https://www.linkedin.com/in/arjun-jayraj-cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col hover:text-primary"
              >
                <span className="font-title text-sm font-bold text-on-surface">
                  LinkedIn
                </span>
                <span className="font-label text-xs text-on-surface-variant truncate">
                  in/arjun-jayraj-cloud
                </span>
              </a>
              <a
                href="mailto:arjunarkmma@gmail.com"
                className="flex flex-col hover:text-primary"
              >
                <span className="font-title text-sm font-bold text-on-surface">
                  Email
                </span>
                <span className="font-label text-xs text-on-surface-variant truncate">
                  arjunarkmma@gmail.com
                </span>
              </a>
              <a
                href="tel:+919035299301"
                className="flex flex-col hover:text-primary"
              >
                <span className="font-title text-sm font-bold text-on-surface">
                  Phone
                </span>
                <span className="font-label text-xs text-on-surface-variant tabular-nums">
                  +91 9035299301
                </span>
              </a>
            </div>

            <div className="ivory-card p-4 rounded-md border border-champagne-gold/40 flex flex-col gap-1.5">
              <h3 className="font-headline text-base font-bold text-on-surface">
                Send a Message
              </h3>
              {msgSent ? (
                <div className="flex flex-col gap-2 py-2">
                  <p className="font-body text-sm text-secondary">
                    Thank you! Your message has been sent.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMsgSent(false);
                      setMsgBody('');
                    }}
                    className="self-start font-label text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Send another note
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleQuickSubmit}
                  className="flex flex-col gap-1.5"
                >
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={msgName}
                    onChange={(ev) => setMsgName(ev.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-sm bg-surface-container-low border border-outline-variant text-sm focus:outline-none focus:border-primary"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={msgEmail}
                    onChange={(ev) => setMsgEmail(ev.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-sm bg-surface-container-low border border-outline-variant text-sm focus:outline-none focus:border-primary"
                  />
                  <textarea
                    rows={2}
                    required
                    placeholder="Message"
                    value={msgBody}
                    onChange={(ev) => setMsgBody(ev.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-sm bg-surface-container-low border border-outline-variant text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-full bg-primary text-on-primary font-label text-xs font-bold hover:bg-on-primary-container transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Send Message</span>
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">
                      arrow_forward
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </article>
      </main>

      {/* 4. FOOTER */}
      <footer className="w-full bg-surface border-t border-outline-variant/40 px-6 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <a
              href="https://www.linkedin.com/in/arjun-jayraj-cloud"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-8 h-8 rounded-full border border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                person
              </span>
            </a>
            <a
              href="mailto:arjunarkmma@gmail.com"
              aria-label="Email"
              className="w-8 h-8 rounded-full border border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                mail
              </span>
            </a>
            <a
              href="https://findkart-hackahon.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FindKart Live"
              className="w-8 h-8 rounded-full border border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                link
              </span>
            </a>
          </div>

          <div className="flex items-center gap-1.5 font-headline text-lg tracking-widest uppercase text-on-surface font-semibold">
            <span>ARJUN JAYRAJ</span>
            <span
              className="material-symbols-outlined text-champagne-gold text-base"
              aria-hidden="true"
            >
              spark
            </span>
          </div>

          <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant">
            DREAM · LEARN · BUILD · GROW
          </span>
        </div>
      </footer>

      {/* ABOUT DETAIL MODAL */}
      {aboutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Arjun Jayraj Profile"
          className="fixed inset-0 z-50 bg-on-surface/35 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-2xl bg-surface rounded-lg border border-champagne-gold/50 p-8 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <header className="flex items-start justify-between gap-4 border-b border-outline-variant/40 pb-4">
              <div>
                <span className="font-label text-xs text-primary uppercase tracking-wider">
                  The Home — Profile
                </span>
                <h2 className="font-headline text-3xl font-semibold text-on-surface">
                  Arjun Jayraj
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAboutModalOpen(false)}
                aria-label="Close modal"
                className="w-9 h-9 rounded-full bg-surface-container text-on-surface hover:bg-primary-container inline-flex items-center justify-center shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">
                  close
                </span>
              </button>
            </header>

            <p className="font-body text-base text-on-surface text-pretty">
              BCA Cloud Computing Student at Kristu Jayanti University,
              Bengaluru (2025 – 2028) and Cloud Engineer & Web Developer with 2+
              years of experience crafting scalable infrastructure and modern
              web applications.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { v: '2+', l: 'Years Exp.' },
                { v: '15+', l: 'Projects' },
                { v: '10+', l: 'Happy Clients' },
              ].map((s) => (
                <div
                  key={s.l}
                  className="p-4 rounded-xl bg-surface-container-low border border-champagne-gold/30 text-center"
                >
                  <div className="font-headline text-2xl font-semibold text-primary tabular-nums">
                    {s.v}
                  </div>
                  <div className="font-label text-xs text-on-surface-variant">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="mailto:arjunarkmma@gmail.com?subject=CV%20Request%20%E2%80%94%20Arjun%20Jayraj"
                className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label text-sm font-bold hover:bg-on-primary-container transition-colors"
              >
                Request CV via Email
              </a>
              <button
                type="button"
                onClick={() => {
                  setAboutModalOpen(false);
                  onEnterWorld('home');
                }}
                className="px-6 py-2.5 rounded-full bg-surface-container-low border border-champagne-gold/50 text-on-surface font-label text-sm font-bold hover:bg-primary-container transition-colors cursor-pointer"
              >
                Visit Home Island in 3D
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

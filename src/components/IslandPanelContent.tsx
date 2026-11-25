import { useEffect, useState } from 'react';
import {
  ACHIEVEMENTS,
  EXPERTISE_BARS,
  PROJECTS,
  SKILLS_ORBIT,
  TESTIMONIALS,
  type IslandId,
  type ProjectItem,
} from '../data/portfolioData';
import { ProjectModelViewer } from './ProjectModelViewer';

interface IslandPanelContentProps {
  islandId: IslandId;
  onNavigate: (id: IslandId) => void;
  onOpenFullGallery: () => void;
  onOpenFullContact: () => void;
  reducedMotion: boolean;
}

export function IslandPanelContent({
  islandId,
  onNavigate,
  onOpenFullGallery,
  onOpenFullContact,
  reducedMotion,
}: IslandPanelContentProps) {
  const [formSent, setFormSent] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderMsg, setSenderMsg] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null
  );

  useEffect(() => {
    setSelectedProject(null);
  }, [islandId]);

  if (islandId === 'home') {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="font-body text-base text-on-surface leading-relaxed text-pretty">
            Hello! I’m Arjun Jayraj—a passionate Cloud Engineer and Web
            Developer based in Bangalore, India, with expertise in creating
            scalable cloud solutions and serene, memorable digital experiences.
          </p>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed text-pretty">
            With over 2 years of experience, my approach combines technical
            precision in cloud infrastructure and DevOps automation with
            timeless design principles.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { val: '2+', label: 'Years Exp.' },
            { val: '15+', label: 'Projects' },
            { val: '10+', label: 'Happy Clients' },
          ].map((m) => (
            <div
              key={m.label}
              className="p-3 rounded-md bg-surface-container-low border border-champagne-gold/30 text-center"
            >
              <div className="font-headline text-2xl font-semibold text-primary tabular-nums">
                {m.val}
              </div>
              <div className="font-label text-xs text-on-surface-variant">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-title text-base font-bold text-on-surface">
            What I Craft
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              {
                title: 'Web Development',
                desc: 'Responsive, high-performance web apps with modern architectures.',
              },
              {
                title: 'Cloud Solutions',
                desc: 'Scalable AWS & Azure infrastructure built for security and efficiency.',
              },
              {
                title: 'UI / UX Design',
                desc: 'Intuitive, accessible interfaces with calm visual clarity.',
              },
              {
                title: 'DevOps',
                desc: 'CI/CD pipelines, containerization, and reliable automation.',
              },
            ].map((s) => (
              <div
                key={s.title}
                className="p-3 rounded-xl bg-surface-container/70 border border-outline-variant/50 flex flex-col gap-1"
              >
                <span className="font-title text-sm font-bold text-on-surface">
                  {s.title}
                </span>
                <span className="font-body text-xs text-on-surface-variant">
                  {s.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        <a
          href="mailto:arjunarkmma@gmail.com?subject=CV%20Request%20%E2%80%94%20Arjun%20Jayraj"
          className="w-full py-2.5 rounded-full bg-primary text-on-primary font-label text-sm font-bold hover:bg-on-primary-container transition-colors inline-flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            description
          </span>
          <span>Request CV</span>
        </a>
      </div>
    );
  }

  if (islandId === 'garden') {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h3 className="font-title text-base font-bold text-on-surface">
            Orbiting Cloud & DevOps Disciplines
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {SKILLS_ORBIT.map((sk) => (
              <div
                key={sk.name}
                className="p-3 rounded-xl bg-secondary-container/45 border border-sage-green flex flex-col gap-0.5"
              >
                <span className="font-title text-sm font-bold text-on-secondary-container">
                  {sk.name}
                </span>
                <span className="font-label text-xs text-secondary">
                  {sk.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-title text-base font-bold text-on-surface">
            Core Proficiency
          </h3>
          <div className="flex flex-col gap-2.5">
            {EXPERTISE_BARS.map((bar) => (
              <div key={bar.label} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm font-bold text-on-surface">
                    {bar.label}
                  </span>
                  <span className="font-label text-xs font-medium text-primary tabular-nums">
                    {bar.pct}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (islandId === 'gallery') {
    if (selectedProject) {
      return (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setSelectedProject(null)}
            className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/60 text-on-surface font-label text-xs hover:bg-primary-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-primary" aria-hidden="true">
              arrow_back
            </span>
            <span>All Gallery Projects</span>
          </button>

          <div className="p-4 rounded-md bg-powder-blue/45 border border-champagne-gold/45 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 text-xs text-primary font-label">
              <span className="uppercase tracking-wider">
                {selectedProject.category}
              </span>
              {selectedProject.featured && (
                <span className="font-bold text-on-primary-container">
                  · Featured
                </span>
              )}
            </div>
            <h3 className="font-headline text-2xl font-semibold text-on-surface">
              {selectedProject.title}
            </h3>
            <p className="font-body text-sm text-on-surface-variant text-pretty">
              {selectedProject.description}
            </p>
          </div>

          <ProjectModelViewer
            project={selectedProject}
            reducedMotion={reducedMotion}
            heightClass="h-44"
          />

          <div className="flex flex-col gap-1">
            <h4 className="font-title text-sm font-bold text-on-surface">
              Architecture & Craft
            </h4>
            <p className="font-body text-sm text-on-surface-variant text-pretty">
              {selectedProject.architecture}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="font-title text-sm font-bold text-on-surface">
              Key Highlights
            </h4>
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
          </div>

          <div className="text-xs font-label text-on-surface-variant">
            {selectedProject.stack.join(' · ')}
          </div>

          <div className="flex flex-col gap-2">
            {selectedProject.liveUrl && (
              <a
                href={selectedProject.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-full bg-primary text-on-primary font-label text-sm font-bold hover:bg-on-primary-container transition-colors inline-flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  open_in_new
                </span>
                <span>Visit Live Project</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className={`w-full py-2.5 rounded-full font-label text-sm font-bold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer ${
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
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onOpenFullGallery}
          className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary font-label text-xs font-bold hover:bg-on-primary-container transition-colors cursor-pointer"
        >
          <span>Open Full Project Gallery</span>
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            arrow_forward
          </span>
        </button>

        {PROJECTS.map((proj) => (
          <button
            key={proj.id}
            type="button"
            onClick={() => setSelectedProject(proj)}
            className={`w-full text-left p-3.5 rounded-md bg-surface-container-low border transition-colors flex flex-col gap-1 cursor-pointer ${
              proj.featured
                ? 'border-champagne-gold'
                : 'border-outline-variant/60'
            } hover:bg-primary-container/45 hover:border-primary`}
          >
            <div className="w-full flex items-center justify-between gap-2">
              <h3 className="font-title text-base font-bold text-on-surface">
                {proj.title}
              </h3>
              <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">
                arrow_forward
              </span>
            </div>
            <span className="font-label text-xs text-primary">
              {proj.category}
              {proj.featured ? ' · Featured' : ''}
            </span>
            <p className="font-body text-sm text-on-surface-variant text-pretty">
              {proj.description}
            </p>
            <span className="pt-1 font-label text-xs font-bold text-primary inline-flex items-center gap-1">
              <span>Inspect Hologram & Architecture</span>
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                open_in_full
              </span>
            </span>
          </button>
        ))}
      </div>
    );
  }

  if (islandId === 'achievements') {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          {ACHIEVEMENTS.map((ach) => (
            <div
              key={ach.title}
              className="p-3.5 rounded-md bg-dusty-blush/45 border border-champagne-gold/30 flex flex-col gap-1"
            >
              <span className="font-label text-xs text-primary uppercase tracking-wider">
                {ach.tag}
              </span>
              <h3 className="font-title text-base font-bold text-on-surface">
                {ach.title}
              </h3>
              <p className="font-body text-sm text-on-surface-variant text-pretty">
                {ach.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <h3 className="font-title text-base font-bold text-on-surface">
            Client Voices
          </h3>
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.author}
              className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/50 flex flex-col gap-1"
            >
              <p className="font-body text-sm italic text-on-surface text-pretty">
                “{t.quote}”
              </p>
              <footer className="font-label text-xs text-primary">
                {t.author} — {t.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    );
  }

  if (islandId === 'library') {
    return (
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-md bg-soft-lavender/45 border border-champagne-gold/30 flex flex-col gap-1">
          <span className="font-label text-xs text-primary uppercase tracking-wider">
            Academic Focus · 2025 – 2028
          </span>
          <h3 className="font-title text-base font-bold text-on-surface">
            BCA – Cloud Computing (Kristu Jayanti University)
          </h3>
          <p className="font-body text-sm text-on-surface-variant text-pretty">
            Deepening foundational expertise in distributed cloud architectures,
            Linux administration, networking protocols, and database systems.
          </p>
        </div>

        <div className="p-4 rounded-md bg-surface-container-low border border-outline-variant/60 flex flex-col gap-1">
          <span className="font-label text-xs text-secondary uppercase tracking-wider">
            Career Direction
          </span>
          <h3 className="font-title text-base font-bold text-on-surface">
            Aspiring DevOps & Cloud Engineer
          </h3>
          <p className="font-body text-sm text-on-surface-variant text-pretty">
            Bridging software development and resilient cloud
            operations—automating deployments with Docker, Git workflows, and
            CI/CD pipelines on AWS and Azure.
          </p>
        </div>

        <div className="p-4 rounded-md bg-powder-blue/45 border border-outline-variant/50 flex flex-col gap-1">
          <span className="font-label text-xs text-on-surface uppercase tracking-wider">
            Philosophy
          </span>
          <p className="font-body text-sm text-on-surface-variant text-pretty">
            “Exploring Ideas. Building Possibilities.” — Continuous learning
            keeps craft sharp, grounded, and ready for real-world scale.
          </p>
        </div>
      </div>
    );
  }

  if (islandId === 'contact') {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onOpenFullContact}
          className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary font-label text-xs font-bold hover:bg-on-primary-container transition-colors cursor-pointer"
        >
          <span>Open Full Contact Portal</span>
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            arrow_forward
          </span>
        </button>

        <div className="grid grid-cols-1 gap-2">
          <a
            href="mailto:arjunarkmma@gmail.com"
            className="p-3 rounded-xl bg-surface-container-low border border-champagne-gold/40 hover:bg-primary-container/50 transition-colors flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              mail
            </span>
            <div className="flex flex-col">
              <span className="font-label text-xs text-on-surface-variant">
                Email
              </span>
              <span className="font-body text-sm font-bold text-on-surface">
                arjunarkmma@gmail.com
              </span>
            </div>
          </a>

          <a
            href="tel:+919035299301"
            className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 hover:bg-primary-container/50 transition-colors flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              call
            </span>
            <div className="flex flex-col">
              <span className="font-label text-xs text-on-surface-variant">
                Phone
              </span>
              <span className="font-body text-sm font-bold text-on-surface tabular-nums">
                +91 9035299301
              </span>
            </div>
          </a>

          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              location_on
            </span>
            <div className="flex flex-col">
              <span className="font-label text-xs text-on-surface-variant">
                Location
              </span>
              <span className="font-body text-sm font-bold text-on-surface">
                Bangalore, India
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="https://www.linkedin.com/in/arjun-jayraj-cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary font-label text-xs font-bold hover:bg-on-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              open_in_new
            </span>
            <span>LinkedIn</span>
          </a>
          <a
            href="mailto:arjunarkmma@gmail.com?subject=GitHub%20%26%20Portfolio%20Inquiry"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container-low border border-champagne-gold/50 text-on-surface font-label text-xs font-bold hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-primary" aria-hidden="true">
              code
            </span>
            <span>Request GitHub</span>
          </a>
        </div>

        {formSent ? (
          <div className="p-4 rounded-md bg-secondary-container text-on-secondary-container border border-sage-green flex flex-col gap-1">
            <span className="font-title text-base font-bold">
              Message Sent Across the Sky
            </span>
            <p className="font-body text-sm">
              Thank you for reaching out. Arjun will respond to{' '}
              {senderEmail || 'your inbox'} shortly.
            </p>
          </div>
        ) : (
          <form
            className="flex flex-col gap-2 pt-3 border-t border-outline-variant/50"
            onSubmit={(ev) => {
              ev.preventDefault();
              setFormSent(true);
            }}
          >
            <h3 className="font-title text-base font-bold text-on-surface">
              Send a Direct Message
            </h3>
            <input
              type="text"
              required
              placeholder="Your Name"
              value={senderName}
              onChange={(ev) => setSenderName(ev.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface font-body text-sm focus:outline-none focus:border-primary"
            />
            <input
              type="email"
              required
              placeholder="Your Email"
              value={senderEmail}
              onChange={(ev) => setSenderEmail(ev.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface font-body text-sm focus:outline-none focus:border-primary"
            />
            <textarea
              rows={3}
              required
              placeholder="Share your idea or opportunity..."
              value={senderMsg}
              onChange={(ev) => setSenderMsg(ev.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface font-body text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-primary text-on-primary font-label text-sm font-bold hover:bg-on-primary-container transition-colors cursor-pointer"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    );
  }

  return null;
}

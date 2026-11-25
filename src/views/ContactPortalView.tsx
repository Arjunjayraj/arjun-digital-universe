import { useState, type FormEvent } from 'react';
import { PortalCanvas } from '../components/PortalCanvas';

interface ContactPortalViewProps {
  onBack: () => void;
  initialSubject?: string;
}

export function ContactPortalView({
  onBack,
  initialSubject = '',
}: ContactPortalViewProps) {
  const topics = [
    'Cloud & DevOps',
    'Web Development',
    'UI/UX Design',
    'Collaboration',
  ];
  const [selectedTopic, setSelectedTopic] = useState('Cloud & DevOps');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(
    initialSubject ? `Inquiry regarding ${initialSubject}` : ''
  );
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
  };

  const mailtoHref =
    'mailto:arjunarkmma@gmail.com?subject=' +
    encodeURIComponent(`[${selectedTopic}] ${subject || 'Portfolio Inquiry'}`) +
    '&body=' +
    encodeURIComponent(`From: ${name} (${email})\n\n${message}`);

  return (
    <div className="min-h-screen w-full sky-backdrop-warm flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 aether-glass border-b border-champagne-gold/30 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
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
              auto_awesome
            </span>
            <div className="flex flex-col">
              <h1 className="font-headline text-2xl font-semibold text-on-surface leading-tight">
                The Contact Portal
              </h1>
              <span className="font-label text-xs text-on-surface-variant">
                Aether — Arjun Jayraj
              </span>
            </div>
          </div>

          <span className="font-label text-xs font-medium text-on-secondary-container">
            Bangalore, India
          </span>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Portal & Direct Channels (5 cols) */}
        <section
          aria-label="Direct Contact Channels"
          className="lg:col-span-5 flex flex-col gap-4"
        >
          <div className="aether-glass rounded-lg border border-champagne-gold/40 p-6 flex flex-col gap-4">
            <PortalCanvas />

            <div className="flex flex-col gap-1">
              <h2 className="font-headline text-2xl font-semibold text-on-surface">
                Let’s Work Together
              </h2>
              <p className="font-body text-sm text-on-surface-variant text-pretty">
                Have a cloud architecture, DevOps automation, or web development
                idea in mind? Reach out through the portal or connect directly
                below.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href="mailto:arjunarkmma@gmail.com"
                className="p-4 rounded-xl bg-surface-container-low/90 border border-champagne-gold/35 hover:border-primary transition-colors flex items-center gap-3"
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
                className="p-4 rounded-xl bg-surface-container-low/90 border border-outline-variant/60 hover:border-primary transition-colors flex items-center gap-3"
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

              <a
                href="https://www.linkedin.com/in/arjun-jayraj-cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-surface-container-low/90 border border-outline-variant/60 hover:border-primary transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">
                    person
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label text-xs text-on-surface-variant">
                      LinkedIn
                    </span>
                    <span className="font-body text-sm font-bold text-on-surface">
                      arjun-jayraj-cloud
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">
                  open_in_new
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Right: Interactive Inquiry Form (7 cols) */}
        <section
          aria-label="Interactive Inquiry Form"
          className="lg:col-span-7 aether-glass rounded-lg border border-champagne-gold/45 p-6 sm:p-8 flex flex-col gap-6"
        >
          {submitted ? (
            <div className="flex flex-col gap-4 py-6">
              <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                  check_circle
                </span>
              </div>
              <h2 className="font-headline text-[28px] font-semibold text-on-surface">
                Message Sent Across the Sky
              </h2>
              <p className="font-body text-base text-on-surface-variant text-pretty">
                Thank you, {name || 'friend'}. Your {selectedTopic} inquiry is
                ready. You can also launch it in your email client or send
                another note.
              </p>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-1">
                <span className="font-label text-xs font-bold text-primary">
                  {selectedTopic}
                  {subject ? ` — ${subject}` : ''}
                </span>
                <p className="font-body text-sm text-on-surface">{message}</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={mailtoHref}
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label text-sm font-bold hover:bg-on-primary-container transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    mail
                  </span>
                  <span>Open in Email Client</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setSubject('');
                    setMessage('');
                  }}
                  className="px-6 py-2.5 rounded-full bg-surface-container-low border border-outline-variant text-on-surface font-label text-sm font-bold hover:bg-primary-container transition-colors cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h2 className="font-headline text-[28px] font-semibold text-on-surface">
                  Send a Direct Inquiry
                </h2>
                <p className="font-body text-sm text-on-surface-variant">
                  Choose a focus area and share your project or collaboration
                  details.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-label text-xs font-medium text-on-surface-variant">
                  Inquiry Focus
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {topics.map((topic) => {
                    const isSelected = selectedTopic === topic;
                    return (
                      <button
                        key={topic}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedTopic(topic)}
                        className={`px-4 py-1.5 rounded-full font-label text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface-container-low text-on-surface border-outline-variant/60 hover:bg-primary-container'
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="font-label text-xs font-medium text-on-surface">
                    Your Name
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface font-body text-sm focus:outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-label text-xs font-medium text-on-surface">
                    Email Address
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface font-body text-sm focus:outline-none focus:border-primary"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-label text-xs font-medium text-on-surface">
                  Subject / Project Scope
                </span>
                <input
                  type="text"
                  required
                  placeholder="AWS Cloud Architecture & Web Platform"
                  value={subject}
                  onChange={(ev) => setSubject(ev.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface font-body text-sm focus:outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-label text-xs font-medium text-on-surface">
                  Message
                </span>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your timeline, goals, or how we can collaborate..."
                  value={message}
                  onChange={(ev) => setMessage(ev.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface font-body text-sm focus:outline-none focus:border-primary"
                />
              </label>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-wider hover:bg-on-primary-container transition-colors inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  send
                </span>
                <span>Send Message</span>
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

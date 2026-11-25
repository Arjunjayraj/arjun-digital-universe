export type IslandId =
  | 'home'
  | 'garden'
  | 'gallery'
  | 'achievements'
  | 'library'
  | 'contact';

export type AppView = 'sanctuary' | 'world' | 'gallery' | 'contact';

export interface IslandMeta {
  id: IslandId;
  number: string;
  name: string;
  shortName: string;
  subtitle: string;
  icon: string;
  accentClass: string;
  position: [number, number, number];
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  summary: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  filterGroup: 'Cloud & AI' | 'Web & UI/UX';
  featured: boolean;
  liveUrl?: string;
  stack: string[];
  description: string;
  architecture: string;
  highlights: string[];
}

export const ARTWORK = {
  heroCastle: '/src/assets/images/hero_castle_world_1795581399196.jpg',
  islandsPanorama: '/src/assets/images/islands_panorama_1795581399703.jpg',
  homeVista: '/src/assets/images/island_home_vista_1795581400360.jpg',
  knowledgeGarden: '/src/assets/images/island_knowledge_garden_1795581400205.jpg',
  projectGallery: '/src/assets/images/island_project_gallery_1795581400257.jpg',
  hallAchievements: '/src/assets/images/island_hall_achievements_1795581401367.jpg',
  library: '/src/assets/images/island_library_1795581401965.jpg',
  contactPortal: '/src/assets/images/island_contact_portal_1795581402007.jpg',
} as const;

export const ISLANDS: IslandMeta[] = [
  {
    id: 'home',
    number: '01',
    name: 'The Home',
    shortName: 'The Home',
    subtitle: 'Central Sanctuary & Profile',
    icon: 'castle',
    accentClass: 'bg-primary-container text-on-primary-container',
    position: [0, 2.6, -2.5],
    cameraPos: [0, 7.6, 12.5],
    cameraTarget: [0, 4.8, -2.5],
    summary:
      'A central ivory sanctuary suspended above the clouds—home to Arjun Jayraj’s journey as a Cloud Computing Student, Web Developer, and Aspiring DevOps Engineer.',
  },
  {
    id: 'garden',
    number: '02',
    name: 'The Knowledge Garden',
    shortName: 'Knowledge Garden',
    subtitle: 'Floating Skills & Cloud Craft',
    icon: 'eco',
    accentClass: 'bg-secondary-container text-on-secondary-container',
    position: [12.5, 1.4, -3.5],
    cameraPos: [12.5, 6.0, 8.0],
    cameraTarget: [12.5, 2.5, -3.5],
    summary:
      'A living sky terrace where core cloud, DevOps, and software engineering disciplines orbit like luminous crystals.',
  },
  {
    id: 'gallery',
    number: '03',
    name: 'The Project Gallery',
    shortName: 'Project Gallery',
    subtitle: 'Glass Museum of Creations',
    icon: 'museum',
    accentClass: 'bg-powder-blue text-on-surface',
    position: [-12.5, 2.2, -5.0],
    cameraPos: [-12.5, 6.8, 6.8],
    cameraTarget: [-12.5, 3.4, -5.0],
    summary:
      'A translucent crystal pavilion housing holographic showcases of CareerPilot AI, FindKart, and cloud-native web applications.',
  },
  {
    id: 'achievements',
    number: '04',
    name: 'The Hall of Achievements',
    shortName: 'Achievements',
    subtitle: 'NCC, Sports & Recognitions',
    icon: 'trophy',
    accentClass: 'bg-dusty-blush text-on-surface',
    position: [8.8, -1.0, 9.5],
    cameraPos: [8.8, 3.4, 20.0],
    cameraTarget: [8.8, 0.6, 9.5],
    summary:
      'A grand colonnade honoring discipline, leadership, athletics, hackathons, and client trust earned along the way.',
  },
  {
    id: 'library',
    number: '05',
    name: 'The Library',
    shortName: 'The Library',
    subtitle: 'Education & Career Horizon',
    icon: 'menu_book',
    accentClass: 'bg-soft-lavender text-on-surface',
    position: [-8.2, -1.2, 9.2],
    cameraPos: [-8.2, 3.4, 19.6],
    cameraTarget: [-8.2, 0.5, 9.2],
    summary:
      'An elevated architectural rotunda dedicated to continuous learning, cloud systems study, and DevOps engineering aspirations.',
  },
  {
    id: 'contact',
    number: '06',
    name: 'The Contact Portal',
    shortName: 'Contact Portal',
    subtitle: 'Gateway to Collaborate',
    icon: 'auto_awesome',
    accentClass: 'bg-primary-container text-on-primary-container',
    position: [-14.2, 0.4, 2.8],
    cameraPos: [-14.2, 4.6, 13.8],
    cameraTarget: [-14.2, 1.6, 2.8],
    summary:
      'A luminous champagne-gold archway opening direct channels to collaborate on cloud, DevOps, and web projects.',
  },
];

export const OVERVIEW_CAMERA = {
  pos: [0, 11.2, 36.5] as [number, number, number],
  target: [0, 2.0, 0.5] as [number, number, number],
};

export const INTRO_CAMERA = {
  pos: [0, 8.0, 26] as [number, number, number],
  target: [0, 3.2, -1.0] as [number, number, number],
};

export const SKILLS_ORBIT = [
  { name: 'AWS', category: 'Cloud Platform' },
  { name: 'Linux', category: 'Systems & Shell' },
  { name: 'Docker', category: 'Containers' },
  { name: 'Python', category: 'Automation' },
  { name: 'Git', category: 'Version Control' },
  { name: 'Networking', category: 'Infrastructure' },
  { name: 'SQL', category: 'Databases' },
  { name: 'Cloud Computing', category: 'Architecture' },
];

export const TECH_STACK_LIST = [
  'AWS (EC2, S3, IAM)',
  'Linux / Ubuntu',
  'Docker',
  'Python',
  'JavaScript',
  'Git / GitHub',
  'Networking (DNS, IP, Subnet)',
  'SQL / MongoDB',
  'Cloud & Security',
];

export const EXPERTISE_BARS = [
  { label: 'HTML / CSS', pct: 95 },
  { label: 'JavaScript', pct: 90 },
  { label: 'React / Next.js', pct: 88 },
  { label: 'AWS / Cloud', pct: 85 },
  { label: 'UI / UX Design', pct: 82 },
  { label: 'DevOps / CI/CD', pct: 78 },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'careerpilot',
    title: 'CareerPilot AI',
    category: 'AI & Cloud Architecture',
    filterGroup: 'Cloud & AI',
    featured: true,
    stack: ['React', 'Cloud APIs', 'AI Guidance', 'AWS'],
    description:
      'Intelligent career navigation platform pairing AI-driven guidance with scalable cloud architecture and a serene user interface.',
    architecture:
      'Built with a modular React frontend, serverless cloud endpoints, and structured prompt orchestration for personalized learning roadmaps.',
    highlights: [
      'AI-assisted skill gap mapping and role recommendations',
      'Responsive, distraction-free editorial interface',
      'Cloud-native deployment ready for high concurrency',
    ],
  },
  {
    id: 'findcart',
    title: 'FindKart (FindCart)',
    category: 'Smart Commerce Web App',
    filterGroup: 'Web & UI/UX',
    featured: true,
    liveUrl: 'https://findkart-hackahon.netlify.app/',
    stack: ['React', 'JavaScript', 'Tailwind CSS', 'Netlify'],
    description:
      'Smart everyday shopping across India—electronics, fashion, home essentials, and curated daily deals delivered fast with Cash on Delivery.',
    architecture:
      'Hackathon-built e-commerce web app featuring 256-bit encrypted authentication, saved addresses, order management, and a fast responsive cart.',
    highlights: [
      '100% Genuine verified sellers & Cash on Delivery at doorstep',
      'Fast dispatch coverage across 19,000+ pin codes',
      'Secure sign-in, saved addresses, and persistent cart',
    ],
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce Platform',
    category: 'Web Development',
    filterGroup: 'Web & UI/UX',
    featured: false,
    stack: ['HTML/CSS', 'JavaScript', 'React', 'SQL'],
    description:
      'Responsive full-stack storefront built with modern web technologies, clean product merchandising, and high-performance rendering.',
    architecture:
      'Structured storefront architecture with clean state management and relational catalog modeling.',
    highlights: [
      'Conversion-focused product detail pages',
      'Accessible navigation and checkout clarity',
    ],
  },
  {
    id: 'cloud-migration',
    title: 'Cloud Migration',
    category: 'Cloud Solutions',
    filterGroup: 'Cloud & AI',
    featured: false,
    stack: ['AWS', 'Azure', 'Linux', 'Networking'],
    description:
      'Scalable infrastructure migration onto AWS and Azure, optimizing reliability, security posture, and operational cost-efficiency.',
    architecture:
      'Multi-tier VPC networking, automated instance provisioning, and monitored backup/recovery workflows.',
    highlights: [
      'Completed on schedule and within budget',
      'Improved uptime and infrastructure resilience',
    ],
  },
  {
    id: 'dashboard-analytics',
    title: 'Dashboard Analytics',
    category: 'Web App',
    filterGroup: 'Web & UI/UX',
    featured: false,
    stack: ['React', 'Next.js', 'SQL', 'UI/UX'],
    description:
      'Interactive telemetry and business analytics interface turning complex metrics into clear, actionable visual views.',
    architecture:
      'Modular data visualization grid with clean typographic hierarchy and tabular numeric alignment.',
    highlights: [
      'At-a-glance KPI summaries and trend views',
      'Responsive across desktop and tablet',
    ],
  },
  {
    id: 'mobile-brand',
    title: 'Mobile App UI',
    category: 'UI/UX Design',
    filterGroup: 'Web & UI/UX',
    featured: false,
    stack: ['UI/UX Design', 'Design Systems', 'Prototyping'],
    description:
      'Human-centered mobile interface systems and cohesive visual identities crafted for usability and accessibility.',
    architecture:
      'Tokenized color, typography, and spacing systems ensuring visual harmony across every screen.',
    highlights: [
      'Accessible contrast and clear touch targets',
      'Cohesive brand voice and visual language',
    ],
  },
  {
    id: 'portfolio-website',
    title: 'Portfolio Website',
    category: 'Web Development',
    filterGroup: 'Web & UI/UX',
    featured: false,
    liveUrl: 'https://jayraj-folio-spark.lovable.app/',
    stack: ['React', 'Three.js', 'Tailwind CSS', 'UI/UX'],
    description:
      'Personal portfolio showcasing cloud engineering, DevOps automation, and modern web craftsmanship.',
    architecture:
      'Evolved from a clean editorial web portfolio into Aether—an interactive 3D floating island sanctuary.',
    highlights: [
      'Authentic bio, skills, projects, and client testimonials',
      'Responsive across desktop, tablet, and mobile',
    ],
  },
];

export const ACHIEVEMENTS_PANEL_LIST = [
  'Two-time National & State MMA Champion',
  'District-level MMA Champion',
  'National-level BJJ Achievement',
  'NCC C Certificate – Grade A',
  'All India Inter-University Nationals',
  'Unstop Campus Champion',
  'Hackathons & Tech Events',
];

export const ACHIEVEMENTS = [
  {
    title: 'NCC Journey & Grade A',
    tag: 'Leadership & Discipline',
    description:
      'NCC C Certificate (Grade A) training instilling resilience, teamwork, ceremonial discipline, and community leadership.',
  },
  {
    title: 'National & State Athletics',
    tag: 'Combat Sports & Spirit',
    description:
      'Two-time National & State MMA Champion, District-level MMA Champion, National-level BJJ Achievement, and All India Inter-University Nationals.',
  },
  {
    title: 'Hackathons & Campus Recognition',
    tag: 'Innovation',
    description:
      'Unstop Campus Champion and hands-on problem solver in technical hackathons—prototyping cloud-native and AI-assisted applications.',
  },
];

export const TESTIMONIALS = [
  {
    quote:
      'Delivered exceptional work on our cloud migration project. His expertise and professionalism exceeded our expectations. The project was completed on time and within budget.',
    author: 'Sarah Johnson',
    role: 'CEO, TechStart',
  },
  {
    quote:
      'The website built for us increased our conversions by 150%. The attention to detail and understanding of user experience is remarkable.',
    author: 'Michael Chen',
    role: 'Product Manager, InnovateCo',
  },
  {
    quote:
      'Working together was a pleasure. He understood our vision and brought it to life beautifully. The creative approach combined with technical skills is truly impressive.',
    author: 'Emily Davis',
    role: 'Creative Director, DesignHub',
  },
];

export const LIBRARY_TOPICS = [
  'Cloud Computing',
  'Programming',
  'Computer Networks',
  'Linux',
  'Database Management',
];

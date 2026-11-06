export interface Project {
  id: string;
  slug: string;
  titleLines: string[];
  category: string;
  year: string;
  services: string[];
  role: string;
  tools: string[];
  summary: string;
  overview: string;
  highlights: string[];
  cover: string;
  externalUrl?: string;
  badge?: string;
  stats: { label: string; value: string }[];
}

export const PROJECTS: Project[] = [
  {
    id: '01',
    slug: 'ledgesoft',
    titleLines: ['LEDGE', 'SOFT'],
    category: 'CONSTRUCTION FINANCIAL OS',
    year: '2025—2026',
    badge: 'LIVE · v0.1g',
    services: ['Financial Intelligence', 'Full-Stack Architecture', 'Multi-User RBAC'],
    role: 'Lead Architect & Solo Developer',
    tools: ['Python', 'Flask', 'SQLite', 'REST APIs', 'Chart.js', 'Excel Engine'],
    summary: 'A complete financial intelligence platform built for small-to-midsize construction companies in Tirunelveli. Replaces 50,000 INR/year ERPs with straightforward, robust project tracking.',
    overview: 'LedgeSoft was born from a real need: a local civil construction firm was losing track of material costs, site advances, subcontractor disbursements, and stage invoicing across multiple active sites. Traditional enterprise software was bloated and prohibitively expensive. LedgeSoft provides a fast, zero-nonsense financial cockpit with automated P&L statements, multi-tier user role permissions, audit logging, and single-click Excel exports.',
    highlights: [
      'Comprehensive Project P&L engine with live cashflow visualization',
      '15 REST API endpoints with granular authorization',
      '8 relational database tables with foreign key constraints & automated backups',
      'Multi-user RBAC separating Site Supervisors, Accountants, and Managing Directors',
      'One-click multi-format Excel ledger reporting for tax readiness'
    ],
    cover: '/projects/ledgesoft.jpg',
    externalUrl: 'https://ajay-sharitra.github.io/ledgesoft.html',
    stats: [
      { label: 'SAVINGS VS ERP', value: '95%' },
      { label: 'REST APIS', value: '15' },
      { label: 'DEPLOYMENT', value: 'LOCAL / CLOUD' }
    ]
  },
  {
    id: '02',
    slug: 'heroquarters',
    titleLines: ['HERO', 'QUARTERS'],
    category: 'TEAM WORKFLOW OS',
    year: '2025—2026',
    badge: 'CLOSED BETA',
    services: ['Workflow Automation', 'UI/UX Design', 'Task Orchestration'],
    role: 'Product Designer & Developer',
    tools: ['Python', 'Flask', 'SQLite', 'TailwindCSS', 'WebSockets', 'Canvas'],
    summary: "A comic-book-noir themed workflow management system — small teams' command center for mission briefings, villain tracking, and operational momentum.",
    overview: "Most project management tools feel like cold corporate spreadsheets that teams dread opening every morning. Hero Quarters reimagines daily operations through an engaging superhero operations theme: tasks are 'Missions', bugs and blockers are 'Villains', and team members are 'Heroes & Sidekicks' with customized clearance levels and gadgets. Underneath the stylized interface lies a high-performance workflow engine with automated state transitions and real-time status dashboards.",
    highlights: [
      'Interactive Mission Board with drag-and-drop state transitions',
      'Villain Dossier: severity-based blocker tracking and mitigation timelines',
      'Secret Lair Dashboard: team velocity, mission clearance percentages, and alerts',
      'Granular HQ clearance levels for sensitive client deliverables',
      'Instant command dispatch and daily operational briefings'
    ],
    cover: '/projects/heroquarters.jpg',
    externalUrl: 'https://ajay-sharitra.github.io/heroquarters-site.html',
    stats: [
      { label: 'STATUS', value: 'CLOSED BETA' },
      { label: 'ENGAGEMENT', value: '3.4X' },
      { label: 'STACK', value: 'FLASK + SQLITE' }
    ]
  },
  {
    id: '03',
    slug: 'daysoft',
    titleLines: ['DAY', 'SOFT'],
    category: 'OFFLINE DESKTOP LEDGER',
    year: '2024—2025',
    badge: 'LIVE · DESKTOP',
    services: ['Desktop Engineering', 'Offline-First Systems', 'Data Integrity'],
    role: 'System Architect & Software Developer',
    tools: ['Python', 'PySide6 / Qt', 'SQLite', 'Local Encrypted DB'],
    summary: 'A fast, offline-first native desktop daybook for working professionals and local proprietorships who demand 100% data privacy and zero cloud dependence.',
    overview: 'In tier-2 and tier-3 towns, reliable broadband cannot be a mandatory dependency for daily store bookkeeping. Day Soft was engineered in PySide6 to deliver an instantaneous, native desktop financial journal. It requires no internet connection, incurs zero subscription fees, and stores all transactions in an encrypted local database with automated daily snapshots to external drives.',
    highlights: [
      'Zero-latency native desktop GUI optimized for rapid keyboard data entry',
      'Double-entry balance verification and real-time ledger search',
      'Automated daily backup daemon to USB and secondary local storage',
      'Encrypted SQLite storage ensuring complete financial secrecy',
      'Lightweight memory footprint (< 45MB RAM during heavy usage)'
    ],
    cover: '/projects/daysoft.jpg',
    externalUrl: 'https://ajay-sharitra.github.io/',
    stats: [
      { label: 'LATENCY', value: '< 2MS' },
      { label: 'INTERNET NEEDED', value: '0%' },
      { label: 'PLATFORM', value: 'WINDOWS / LINUX' }
    ]
  },
  {
    id: '04',
    slug: 'shoptrack',
    titleLines: ['SHOP', 'TRACK'],
    category: 'RETAIL INVENTORY & POS',
    year: '2026',
    badge: 'IN DESIGN',
    services: ['Retail Tech', 'Bilingual UI', 'Hardware Integration'],
    role: 'Product Lead & Technical Architect',
    tools: ['TypeScript', 'SQLite', 'ESC/POS', 'Bilingual Engine'],
    summary: 'Dead-simple inventory management and rapid point-of-sale billing tailored for neighbourhood kirana stores, grocery merchants, and petty shops.',
    overview: 'India has over 63 million small businesses, the vast majority of which manage inventory on paper notes. ShopTrack provides a touch-friendly, bilingual (Tamil & English) interface with barcode scanner support, low-stock alerts, thermal receipt printing, and quick credit accounting (Udhar / Khata tracking) for regular neighbourhood customers.',
    highlights: [
      'Native Tamil & English localized interface with large tactile buttons',
      'ESC/POS USB and Bluetooth thermal printer integration',
      'Neighbourhood credit (Khata) ledger with automated WhatsApp payment nudges',
      'Low-stock alerts with supplier reorder sheets',
      'Instant barcode scanning and offline inventory reconciliation'
    ],
    cover: '/projects/shoptrack.jpg',
    externalUrl: 'https://ajay-sharitra.github.io/',
    stats: [
      { label: 'MARKET SIZE', value: '63M+ SHOPS' },
      { label: 'LANGUAGES', value: 'TAMIL & EN' },
      { label: 'PRINTER SUPPORT', value: 'THERMAL 58/80MM' }
    ]
  },
  {
    id: '05',
    slug: 'tailordesk',
    titleLines: ['TAILOR', 'DESK'],
    category: 'ARTISAN ORDER SYSTEM',
    year: '2026',
    badge: 'PLANNED',
    services: ['Artisan Workflows', 'Measurement Engine', 'Order Lifecycle'],
    role: 'Lead Architect',
    tools: ['Python', 'FastAPI', 'SQLite', 'PWA / Mobile Web'],
    summary: 'A digital order and measurement book for tailors and bespoke garment ateliers, eliminating lost registers and disputed delivery dates.',
    overview: 'Custom tailoring in India is an artisanal craft where customer measurements and garment delivery deadlines are frequently lost in physical registers. TailorDesk digitizes client profiles, precise anatomical measurements, fabric swatch references, urgent delivery timelines, and automatic customer notification alerts upon garment completion.',
    highlights: [
      'Comprehensive bespoke anatomical measurement schema with diagram presets',
      'Urgency-based delivery timeline calendar with bottleneck indicators',
      'Fabric swatch and styling photo attachments per garment order',
      'Direct WhatsApp notification trigger: "Your garment is ready for trial"',
      'Deposit and balance payment reconciliation'
    ],
    cover: '/projects/tailordesk.jpg',
    externalUrl: 'https://ajay-sharitra.github.io/',
    stats: [
      { label: 'TIMELINE', value: 'Q3 2026' },
      { label: 'FOCUS', value: 'BESPOKE TAILORS' },
      { label: 'CHANNELS', value: 'WHATSAPP INTEGRATED' }
    ]
  }
];

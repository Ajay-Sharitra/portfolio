export interface ExperienceItem {
  period: string;
  role: string;
  organization: string;
  location: string;
  description: string;
  highlights: string[];
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export const PROFILE = {
  name: 'AJAY SHARITRA .B',
  title: 'NETWORK ENGINEER · SOFTWARE DEVELOPER',
  location: 'Tirunelveli, Tamil Nadu, India',
  timezone: 'Asia/Kolkata',
  cityCode: 'TIRUNELVELI, IN',
  availability: 'OPEN FOR DIRECT CONTRACTS & ARCHITECTURE',
  yearsExperience: '3+ Years in IT',
  credentials: ['CCNA Certified (Cisco ID Verified)', 'B.E. Computer Science & Engineering'],
  
  tagline: 'Building Software for Real People. Real Work.',
  manifestoQuote: "Technology reached the boardrooms of Mumbai and Bangalore. It's time it reached the tea shop in Tirunelveli.",
  
  bio: [
    "I am a Network Engineer and Software Developer based in Tirunelveli, Tamil Nadu. Rather than building speculative venture-backed startups or another layer of corporate abstraction, I run a grounded, neighbourhood software practice delivering high-utility tools for small businesses, contractors, retailers, and educational tutors.",
    "My dual background bridges low-level network infrastructure (Cisco routing, switching, LAN architecture, firewall configuration) and pragmatic software engineering (Python, Flask, PySide6, TypeScript, SQLite, embedded POS devices). Whether provisioning an office network or deploying a custom financial ledger, I engineer tools that are robust, honest, and built to outlast trends."
  ],

  stats: [
    { label: 'YEARS IN IT', value: '3+' },
    { label: 'NETWORKING', value: 'CCNA' },
    { label: 'PRODUCTS LIVE', value: '03' },
    { label: 'VC CAPITAL', value: '₹0 BOOTSTRAPPED' }
  ],

  layers: [
    {
      num: '01',
      title: 'Software Products',
      subtitle: 'Focused One-Time Licensed Tools',
      description: 'Custom-built applications addressing specific industry gaps without monthly recurring traps. Tailored for contractors, retailers, and small businesses.',
      examples: ['LedgeSoft (Construction P&L)', 'Hero Quarters (Team Workflow)', 'Day Soft (Offline Ledger)', 'ShopTrack (Kirana POS)']
    },
    {
      num: '02',
      title: 'Network & IT Infrastructure',
      subtitle: 'Hands-on Engineering for Local Enterprises',
      description: 'End-to-end network design, Wi-Fi heatmapping, structured cabling, router & switch setup, secure remote access, and on-premise hardware diagnostics.',
      examples: ['Office LAN / WAN Deployment', 'Cisco Switch & VLAN Config', 'Firewall & VPN Security', 'Hardware Diagnostics']
    },
    {
      num: '03',
      title: 'Annual Maintenance (AMC)',
      subtitle: 'Predictable, On-Call Partnership',
      description: 'Reliable yearly maintenance agreements covering automated data backups, emergency on-call technical visits, and priority WhatsApp troubleshooting.',
      examples: ['Automated Local/Offsite Backups', 'Quarterly Health Audits', 'Guaranteed < 2hr WhatsApp Response', 'Firmware & OS Patches']
    }
  ],

  skills: [
    {
      title: 'NETWORKING & INFRASTRUCTURE',
      skills: ['Cisco CCNA', 'VLANs & Subnetting', 'Routing Protocols (OSPF/EIGRP)', 'Switching & Spanning Tree', 'Network Security', 'Wi-Fi Architecture', 'Linux Server Admin']
    },
    {
      title: 'SOFTWARE & SYSTEMS',
      skills: ['Python 3', 'Flask / FastAPI', 'PySide6 / Qt Desktop', 'SQLite & PostgreSQL', 'TypeScript / JavaScript', 'React & TailwindCSS', 'RESTful API Architecture', 'ESC/POS Hardware Integration']
    },
    {
      title: 'PHILOSOPHY & PRACTICES',
      skills: ['Offline-First Systems', 'Zero-Bloat UI Design', 'RBAC Security Models', 'Local Data Sovereignty', 'Bilingual Software Localization', 'Direct Technical Client Support']
    }
  ],

  contacts: {
    email: 'ajaysharitra@gmail.com',
    primaryPhone: '+91 94880 01018',
    secondaryPhone: '+91 89401 49854',
    whatsappUrl: 'https://wa.me/919488001018?text=Hello%20Ajay,%20I%20am%20reaching%20out%20regarding%20your%20software%20and%20networking%20services.',
    github: 'https://github.com/ajay-sharitra',
    portfolioUrl: 'https://ajay-sharitra.github.io/',
    address: 'Tirunelveli, Tamil Nadu — 627001, India'
  }
};

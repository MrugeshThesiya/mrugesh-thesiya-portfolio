export interface Link {
  label: string
  href: string
  handle: string
}

/** The deployment. Drives canonical, og:url, JSON-LD, sitemap and absolute asset paths. */
export const SITE_URL = 'https://mrugesh.pages.dev/'

export const github = 'https://github.com/MrugeshThesiya'

export interface Resume {
  /** The single positioning this portfolio is written for. */
  label: string
  file: string
  description: string
}

/** The one resume, sitting in `public/`. It is the source of truth for skills,
// dates and claims — the copy on the page is written to match it. */
export const resume: Resume = {
  label: 'Product-minded Software Engineer',
  file: '/Mrugesh_Thesiya_Resume.pdf',
  description: 'Full-stack TypeScript, discovery, architecture, deployment and production ownership.',
}

export interface System {
  id: string
  name: string
  /** Live link, when there is one to show. */
  url?: string
  status: string
  /** Omitted when the resume gives no dates for the project. */
  period?: string
  role: string
  /** The problem it replaced, not the feature list. */
  summary: string
  /** What it does today. */
  highlights: readonly string[]
  stack: readonly string[]
}

/** Projects from the resume, in the order it lists them. */
export const systems: readonly System[] = [
  {
    id: 'pdeu-portal',
    name: 'PDEU Management Portal',
    url: 'https://portal.pdpu.ac.in',
    status: 'In production',
    period: 'May 2024 — Present',
    role: 'Product Owner and Developer',
    summary:
      'One product that replaced manual submission and tracking for industrial training and for minor, major and comprehensive projects.',
    highlights: [
      'Team and mentor allocation, submissions with deadlines, evaluation and grading, training applications, document uploads and status reports in one workflow',
      'Used by 450+ students and 40+ faculty, owned from requirements through deployment and support',
      'Requirements gathering, demos and feedback rounds run directly with faculty, administrators and students; their bug reports and feature requests are triaged and shipped',
      'Sign-in integrated with the campus LDAP directory with the university IT department; role-based access for SuperAdmin, faculty and mentors',
      'Rebuilt the original Next.js app on React and Node.js in a pnpm and Turborepo monorepo, with self-hosted Appwrite and Docker, deployed on the university’s own server',
    ],
    stack: ['TypeScript', 'React', 'Node.js', 'Express', 'Appwrite (self-hosted)', 'LDAP', 'Docker'],
  },
  {
    id: 'vajra',
    name: 'Vajra — Sandbox for AI Coding Agents',
    status: 'Open source, Apache 2.0',
    role: 'Builder',
    summary:
      'An open-source sandbox that confines AI CLI agents to a single project, so they can work on code without reaching secrets elsewhere on the machine.',
    highlights: [
      'Confines AI CLI agents (Claude Code, Codex, OpenCode) to a single project',
      'Native core written in Rust and exposed to Node through napi-rs, enforcing filesystem confinement with Landlock on Linux and Seatbelt on macOS',
      'Hides .env files from file listings and automatically redacts secret values in agent output',
      'CLI for multi-agent task execution with developer, master and worker roles and per-file permissions, across five packages in one monorepo',
    ],
    stack: ['Rust', 'TypeScript', 'napi-rs', 'pnpm', 'Turborepo'],
  },
  {
    id: 'open-elective',
    name: 'Open Elective Choice Filling System',
    status: 'Built for PDEU',
    role: 'Designer and Developer',
    summary:
      'A system that collects open elective choices from every student of a PDEU school in one pass, run department by department.',
    highlights: [
      'Go backend with a React front end for students and coordinators',
      'REST API with request validation: students can submit only electives offered to their department, with no duplicate or conflicting choices',
      'Go concurrency primitives and safe writes, so choices are never lost or overwritten during a filling window',
      'Coordinator controls for electives, seat limits and filling windows per department, with export of the collected choices for allocation',
      'Authenticated access with role checks, containerized with Docker for deployment',
    ],
    stack: ['Go', 'React', 'REST APIs', 'Docker'],
  },
]

export interface Role {
  id: string
  title: string
  org: string
  url: string
  period: string
  place: string
  summary: string
  responsibilities: readonly string[]
}

export const wdc: Role = {
  id: 'wdc',
  title: 'Committee Lead',
  org: 'Web Development Committee, PDEU',
  url: 'https://wdc-guides.pages.dev/guides/',
  period: 'July 2024 — Present',
  place: 'Gandhinagar, India',
  summary:
    'I lead a team of student developers building production software for the university under faculty mentorship, and I teach a weekly engineering session.',
  responsibilities: [
    'Lead a team of student developers building production software for the university under faculty mentorship',
    'Teach a weekly engineering session to 60+ students on AI coding agents and context engineering, learning with AI, and backend architecture, authentication, databases and infrastructure',
    'Write and publish the session guides at wdc-guides.pages.dev',
  ],
}

export const internship = {
  org: 'Pandit Deendayal Energy University (PDEU)',
  title: 'Tech Intern',
  period: 'May 2024 — July 2024',
  place: 'Hybrid',
  summary:
    'Scoped and built the first version of the project submission portal with faculty stakeholders in Next.js and Appwrite; it grew into the production portal.',
} as const

export const education = {
  org: 'Pandit Deendayal Energy University (PDEU)',
  url: 'https://pdeu.ac.in/',
  place: 'Gandhinagar, India',
  degree: 'B.Tech. Computer Science and Engineering',
  cgpa: '9.44',
  period: 'July 2023 — Present',
} as const

export const contact = {
  email: 'thesiyamrugesh@gmail.com',
} as const

/**
 * Skill groups, lifted from the resume's Skills section so the site can never
 * drift from what is written on it.
 */
export const skills = [
  {
    label: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Go', 'Python', 'Java'],
  },
  {
    label: 'Web',
    items: ['React.js', 'Next.js', 'Node.js', 'Express.js', 'Astro', 'Tailwind CSS', 'REST APIs'],
  },
  {
    label: 'Data and auth',
    items: ['Appwrite (self-hosted)', 'MySQL', 'LDAP', 'Role-based access control'],
  },
  {
    label: 'Infrastructure',
    items: ['Docker', 'Nginx', 'PM2', 'Git', 'Linux servers', 'AWS', 'DigitalOcean'],
  },
  {
    label: 'AI-assisted development',
    items: ['Claude Code and other coding agents', 'Context engineering', 'Agent sandboxing'],
  },
] as const

export const currently = {
  looking: 'Product-minded Software Engineer exploring full-time roles',
  // TODO(mrugesh): confirm start availability, whether you are open to onsite/travel work,
  // and your preferred location.
  availability: 'Open to start with notice',
  based: 'Based in Gujarat, India · open to relocation and onsite work',
} as const

export const site = {
  name: 'Mrugesh Thesiya',
  firstName: 'Mrugesh',
  email: contact.email,
  portfolio: SITE_URL,
  social: [
    { label: 'GitHub', href: github, handle: '@MrugeshThesiya' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/mrugeshthesiya/',
      handle: 'in/mrugeshthesiya',
    },
    { label: 'X', href: 'https://x.com/MrugeshThesiya', handle: '@MrugeshThesiya' },
  ] satisfies Link[],
  about: [
    'I am a B.Tech Computer Science and Engineering student at PDEU, with a CGPA of 9.44.',
    'I took PDEU’s management portal from a first requirements conversation to production. It now serves 450+ students and 40+ faculty, and I still own its support, roadmap and deployment.',
    'I am also building Vajra, an open-source sandbox that keeps AI coding agents inside a single project, and I work with those agents daily to ship faster.',
    'I lead the Web Development Committee at PDEU and teach a weekly engineering session to 60+ students, because explaining a technical decision clearly is part of shipping it.',
  ],
} as const

// TODO(mrugesh): confirm the `currently` lines before deploying — availability,
// location and relocation are the first things a recruiter asks about.

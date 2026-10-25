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
  url: string
  status: string
  period: string
  role: string
  /** The problem it replaced, not the feature list. */
  summary: string
  /** What it does today. */
  highlights: readonly string[]
  stack: readonly string[]
}

/**
 * The two production systems. Both live at portal.pdpu.ac.in; they are separate
 * products with separate owners on the university side, so they are listed apart.
 */
export const systems: readonly System[] = [
  {
    id: 'project-management',
    name: 'Minor and Major/Comprehensive Project Management System',
    url: 'https://portal.pdpu.ac.in',
    status: 'In production',
    period: 'May 2024 — Present',
    role: 'Product Owner and Developer',
    summary:
      'The system PDEU uses to run minor, major and comprehensive projects end to end — replacing a manual process with one tracked workflow, from team formation through final evaluation.',
    highlights: [
      'Team and mentor allocation: students form teams and are matched with faculty mentors, with mentor details available throughout',
      'Project submissions, guidelines and deadlines in one place, with evaluation and grading workflows for faculty',
      'Role-based access for SuperAdmin, faculty and mentors; sign-in bound to the campus LDAP directory, set up with the university IT department',
      'Requirements gathered directly from faculty and administrators, refined through regular demos and feedback rounds with faculty and students',
    ],
    stack: [
      'TypeScript',
      'React',
      'Node.js',
      'Express',
      'Appwrite (self-hosted)',
      'LDAP',
      'Docker',
    ],
  },
  {
    id: 'industrial-training',
    name: 'Industrial Training Management System',
    url: 'https://portal.pdpu.ac.in',
    status: 'In production',
    period: 'May 2026 — Present',
    role: 'Product Owner and Developer',
    summary:
      'The system PDEU uses to manage students’ industrial training, replacing a manual process with one tracked workflow.',
    highlights: [
      'Student applications: training details and supporting documents submitted through the portal instead of by hand',
      'Document uploads handled in the system, so coordinators review everything in one place',
      'Status tracking and reports for coordinators, showing where each student’s training stands',
      'First point of contact for students and faculty: triage bug reports and feature requests, and ship the fixes',
    ],
    stack: [
      'TypeScript',
      'React',
      'Node.js',
      'Express',
      'Appwrite (self-hosted)',
      'LDAP',
      'Docker',
    ],
  },
]

export interface Session {
  number: string
  title: string
  summary: string
}

export interface Role {
  id: string
  title: string
  org: string
  url: string
  period: string
  place: string
  summary: string
  responsibilities: readonly string[]
  sessions?: readonly Session[]
}

export const wdc: Role = {
  id: 'wdc',
  title: 'Committee Lead',
  org: 'Web Development Committee, PDEU',
  url: 'https://wdc-guides.pages.dev/guides/',
  period: 'July 2024 — Present',
  place: 'Gandhinagar, India',
  summary:
    'I lead a committee of student developers building production software for the university under faculty mentorship, and I run the weekly Practical Software Engineering session.',
  responsibilities: [
    'Lead a committee of student developers building production software for the university under faculty mentorship',
    'Teach a weekly Practical Software Engineering session to 60+ students',
    'Write and publish the session guides at wdc-guides.pages.dev, so the material stays usable after each session',
    'Work under faculty mentorship from Dr. Hiren Kumar Thakkar',
  ],
  sessions: [
    {
      number: '01',
      title: 'OpenCode CLI & Context Engineering',
      summary:
        'Using coding agents properly, and treating context as the thing that actually decides the output.',
    },
    {
      number: '02',
      title: 'Learning with AI',
      summary:
        'Using AI tools to actually learn a subject faster, instead of outsourcing the learning.',
    },
    {
      number: '03',
      title: 'The Real Backend',
      summary:
        'Backend architecture, authentication, databases and infrastructure — the parts that decide whether software survives contact with users.',
    },
  ],
}

export const internship = {
  org: 'Pandit Deendayal Energy University (PDEU)',
  title: 'Tech Intern',
  period: 'May 2024 — July 2024',
  place: 'Hybrid',
  summary:
    'Scoped and built the first version of the university’s project submission portal with faculty stakeholders; the work continued past the internship.',
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
 * Skill groups, lifted from the resume so the site can never
 * drift from what is written on it.
 */
export const skills = [
  {
    label: 'Working with users',
    items: [
      'Requirements gathering',
      'Stakeholder demos',
      'User support',
      'Technical teaching and writing',
    ],
  },
  {
    label: 'Product',
    items: [
      'User interviews and discovery',
      'Requirements and specs',
      'User flows',
      'Roadmap prioritisation',
      'Usage tracking',
      'Stakeholder management',
    ],
  },
  {
    label: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'Java'],
  },
  {
    label: 'Frameworks',
    items: ['React.js', 'Next.js', 'Node.js', 'Express.js', 'Astro', 'Tailwind CSS'],
  },
  {
    label: 'Data and auth',
    items: [
      'MySQL',
      'Appwrite (self-hosted)',
      'LDAP',
      'REST APIs',
      'Role-based access control',
    ],
  },
  {
    label: 'Infrastructure',
    items: ['Docker', 'Nginx', 'PM2', 'Git', 'Linux servers', 'AWS', 'DigitalOcean'],
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
    'I am a B.Tech Computer Science and Engineering student at PDEU, in my seventh semester, with a CGPA of 9.44.',
    'I took two university systems — one for minor, major and comprehensive projects, one for industrial training — from first requirements conversation to production, and they now serve 450+ students and 40+ faculty. I still own their support, roadmap and deployment.',
    'I lead the Web Development Committee at PDEU and teach a weekly Practical Software Engineering session to 60+ students, because explaining a technical decision clearly is part of shipping it.',
  ],
} as const

// TODO(mrugesh): confirm the `currently` lines before deploying — availability,
// location and relocation are the first things a recruiter asks about.

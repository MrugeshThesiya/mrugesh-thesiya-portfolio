export interface Link {
  label: string
  href: string
  handle: string
}

export interface Project {
  id: string
  name: string
  url: string
  /** One line, the thing itself. */
  tagline: string
  /** What it actually does. */
  summary: string
  /** The stack, in the order it matters. */
  stack: readonly string[]
  /** The parts worth naming. */
  highlights: readonly string[]
}

export const github = 'https://github.com/MrugeshThesiya'

export const projects: readonly Project[] = [
  {
    id: 'pdeu-portal',
    name: 'PDEU Submission Portal',
    url: 'https://portal.pdpu.ac.in',
    tagline: 'Minor project management for PDEU',
    summary:
      'A full-stack portal for Pandit Deendayal Energy University, for running minor projects end to end — submissions, guidelines and faculty mentors in one place. Sign-in is bound to the university’s own LDAP directory rather than a second password store, and the administrative side carries role-based access on top of faculty and mentor records.',
    stack: ['TypeScript', 'React', 'Node', 'LDAP'],
    highlights: [
      'Auth resolved against the university LDAP directory',
      'Mentor records with name, email and contact throughout',
      'SuperAdmin roles and faculty assignment',
      'pnpm + Turborepo monorepo, TypeScript end to end',
    ],
  },
  {
    id: 'techyez',
    name: 'Techyez',
    url: 'https://techyez.com',
    tagline: 'Computer science, shown rather than described',
    summary:
      'A learning platform for infrastructure and distributed-systems concepts — reverse proxies, load balancers, CDNs, round robin, database sharding, ACID. Each one ships twice: as a written explanation and as an interactive simulation you can push on.',
    stack: ['TypeScript', 'Astro', 'React', 'Tailwind'],
    highlights: [
      'Astro with React islands and MDX content collections',
      'Eight infrastructure concepts as explainers and simulations',
      'Built under Code Kalakaars',
    ],
  },
]

export const site = {
  name: 'Mrugesh Thesiya',
  firstName: 'Mrugesh',
  email: 'thesiyamrugesh@gmail.com',
  navLinks: [
    { label: 'The Gates', href: '#gates' },
    { label: '16-bit', href: '#bus' },
    { label: 'Build Log', href: '#roadmap' },
    { label: 'About', href: '#about' },
  ],
  social: [
    {
      label: 'GitHub',
      href: github,
      handle: '@MrugeshThesiya',
    },
    { label: 'X', href: 'https://x.com/MrugeshThesiya', handle: '@MrugeshThesiya' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/mrugeshthesiya/',
      handle: 'in/mrugeshthesiya',
    },
  ] satisfies Link[],
  /** The focus. Edit these to change how you present yourself. */
  focus: [
    { label: 'TypeScript', detail: 'Primary language, end to end' },
    { label: 'Software for hardware', detail: 'Where the two meet' },
  ],
  /** Replace with your own words — this is the part I cannot infer. */
  about: [
    'I write TypeScript, and I like the problems that show up where software meets hardware — the ones where a line of code has to be true about a physical thing. This project is the clearest example I can offer: a computer assembled from first principles, gate by gate, in TypeScript, running in the browser rather than on a breadboard.',
    'The constraint I set myself is that nothing is skipped. There is one primitive, and every gate above it is that primitive wired to itself a few more times. No shortcuts, no imports from a library, no pretending a gate is magic. If a gate has a NAND count, it is because I counted them.',
  ],
} as const

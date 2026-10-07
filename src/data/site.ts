export interface Link {
  label: string
  href: string
  handle: string
}

export interface CaseStudy {
  /** The messy real situation, not the feature list. */
  problem: string
  /** What you could not change, and had to design around. */
  constraints: readonly string[]
  /** The calls you made, and why. */
  decisions: readonly string[]
  /** Where it landed. */
  outcome: readonly string[]
}

export interface Project {
  id: string
  name: string
  url: string
  /** One line, the thing itself. */
  tagline: string
  /** The number that says who it is for. */
  metric: string
  /** What it actually does. */
  summary: string
  /** How the work actually went. */
  caseStudy: CaseStudy
  /** The stack, in the order it matters. */
  stack: readonly string[]
}

export const github = 'https://github.com/MrugeshThesiya'

export const projects: readonly Project[] = [
  {
    id: 'pdeu-portal',
    name: 'PDEU Portal',
    url: 'https://portal.pdpu.ac.in',
    tagline: 'Submissions, mentor assignment and industrial training, in production',
    metric: '450+ students · 40+ faculty',
    summary:
      'The portal Pandit Deendayal Energy University uses to run minor projects end to end — submissions, guidelines and faculty mentor assignment — and to manage industrial training for 7th-semester students. I scoped it with faculty during an internship, took it to production, and still own its support, roadmap and deployment.',
    caseStudy: {
      // TODO(mrugesh): what did this look like before the portal existed? Email, forms,
      // shared sheets? Name the old process and the pain it caused, then the outcome
      // numbers below (hours of admin time saved, submission-window turnaround, volume).
      problem:
        'Faculty and administrators at PDEU need one place to see what has been submitted, by whom, and who is supervising it — across minor projects and 7th-semester industrial training. The requirements were not written down anywhere: they came out of conversations with faculty.',
      constraints: [
        'The university IT department owns identity, so sign-in had to be bound to their directory rather than run as a second password store',
        'The university owns the server, so deployment had to fit their infrastructure and their release tolerance',
        'Students, mentors, faculty and SuperAdmins all need different views of the same submission',
        'Real users mid-semester means a bad release lands during a submission window, so it has to be shipped safely',
      ],
      decisions: [
        'Gathered requirements directly from faculty and administrators, then refined them through demos and feedback rounds instead of writing a spec up front',
        'Bound sign-in to the campus LDAP directory with the university IT department, so identity stays theirs and there is no second set of passwords',
        'Built role-based access across SuperAdmin, faculty and mentor, so one system serves every side of the workflow',
        'Migrated from Next.js and Appwrite to a MERN stack in a pnpm + Turborepo monorepo, TypeScript end to end',
        'Dockerized and deployed on the university’s own server, keeping operations with the people who own it',
      ],
      outcome: [
        'Live at portal.pdpu.ac.in, in production with 450+ students and 40+ faculty',
        'Handles minor project submissions, guidelines and mentor assignment, plus industrial training for 7th-semester students',
        'I am still the first point of contact: bug reports and feature requests get triaged by me and shipped as fixes',
      ],
    },
    stack: ['TypeScript', 'React', 'Node', 'Express', 'MongoDB', 'LDAP', 'Docker'],
  },
]

/** Hidden from the page for now. Add `vajraProject` back to `projects` to show it. */
export const vajraProject: Project = {
  id: 'vajra',
  name: 'Vajra',
  url: 'https://github.com/codekalakaars/vajra',
  tagline: 'A multi-agent coding harness for AI agents',
  summary:
    'My attempt at a harness that runs several AI coding agents in parallel on one codebase and keeps them from colliding: a master plan fans out to workers, file locks decide who touches what, and every change stays attributed. Each worker is also confined to its own task, so an agent works on the code without reaching secrets elsewhere on the machine. Open source, Apache 2.0.',
  caseStudy: {
    // TODO(mrugesh): add adoption evidence — who runs it, what task it last shipped for,
    // and a 60-90s screen recording of a parallel run at the Visit link.
    problem:
      'Running more than one AI coding agent on the same repository does not work. They overwrite each other’s files, race on git and installs, and one worker crashing fails every task in flight. On top of that, an agent CLI has the whole filesystem, so an agent pointed at one project can read secrets that have nothing to do with it.',
    constraints: [
      'Agent CLIs are separate processes with their own tools, so they cannot share a runtime or coordinate through memory',
      'Filesystem confinement has to be enforced by the OS (Landlock, Seatbelt) — not by asking the model to behave',
      'Workers share one working tree, so coordination must be lock-based, and hold-and-wait invites deadlock',
      'Windows has no equivalent of Landlock or Seatbelt, so the sandbox has to refuse rather than pretend',
    ],
    decisions: [
      'Native Rust core exposed to Node through napi-rs, keeping primitives fast while the CLI stays TypeScript',
      'File locks acquired all-or-nothing across a task’s whole path set, which removes the deadlock instead of managing it',
      'Change history keyed per task, with baselines captured only after a worker holds its locks, so every diff is attributable and rollback stays scoped',
      'Per-task sandbox scope rather than per-session, so one worker’s permissions cannot leak into a peer',
      'Provider retries with full jitter, so N workers do not retry in lockstep and stampede the same rate limit',
      'Output events carry an agent label through every renderer, so interleaved parallel output stays attributable',
    ],
    outcome: [
      'Open source under Apache 2.0 — 230 commits across five packages: core, sandbox, protocol, cli, agent-core',
      'A master agent produces a plan for confirmation, then developer, master and worker roles execute it with up to maxWorkers in parallel',
      'Confines OpenCode, Claude Code and Codex to the task; project .env files stay out of listings and the summary index, and secret values are replaced with [REDACTED:KEY] in agent output',
      'CI runs the core on Linux, macOS and Windows',
    ],
  },
  metric: 'Rust core · 5 packages',
  stack: ['Rust', 'TypeScript', 'napi-rs', 'pnpm', 'Turborepo'],
}

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
  summary: string
  /** Concrete things done under this role. */
  responsibilities: readonly string[]
  sessions?: readonly Session[]
}

export const wdc: Role = {
  id: 'wdc',
  title: 'Committee Lead',
  org: 'Web Development Committee @ PDEU',
  url: 'https://wdc-guides.pages.dev',
  summary:
    'I lead the Web Development Committee at PDEU, where the goal is narrow on purpose: get students building real software rather than finishing exercises. The committee runs production projects with faculty mentors, and I run the weekly practical sessions for 60+ students.',
  responsibilities: [
    'Lead a committee of developers on production projects for the university',
    'Teach a weekly Practical Software Engineering session to 60+ students',
    'Write the session guides the committee publishes at wdc-guides.pages.dev',
    'Work under faculty mentorship from Dr. Hiren Kumar Thakkar',
  ],
  sessions: [
    {
      number: '01',
      title: 'OpenCode CLI & Context Engineering',
      summary: 'Using coding agents properly, and treating context as the thing that actually decides the output.',
    },
    {
      number: '02',
      title: 'Learning with AI',
      summary: 'Using AI tools to actually learn a subject faster, instead of outsourcing the learning.',
    },
    {
      number: '03',
      title: 'The Real Backend',
      summary: 'Backend architecture, authentication, databases and infrastructure — the parts that decide whether software survives contact with users.',
    },
  ],
}

export const roles: readonly Role[] = [wdc]

export const currently = {
  looking: 'Looking for forward deployed and solutions engineering roles',
  // TODO(mrugesh): confirm start availability, location/relocation and whether you are
  // open to onsite or travel work — FDE hiring filters hard on this.
  availability: 'Open to start with notice',
  based: 'Based in Gujarat, India · open to relocation and onsite work',
} as const

export const site = {
  name: 'Mrugesh Thesiya',
  firstName: 'Mrugesh',
  email: 'thesiyamrugesh@gmail.com',
  navLinks: [
    { label: 'Work', href: '#work' },
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
    { label: 'Customer discovery', detail: 'Requirements from faculty and admins, refined through demos' },
    { label: 'Full-stack delivery', detail: 'React to Dockerized Node, TypeScript end to end' },
    { label: 'Production ownership', detail: 'Deploy, support, roadmap — still mine after launch' },
    { label: 'Explaining clearly', detail: 'Teaching 60+ students, writing the guides' },
    { label: 'Systems depth', detail: 'Linux, Docker, LDAP, deployment and auth' },
  ],
  about: [
    'The PDEU portal started as a conversation with faculty about what they needed, and it is now used by 450+ students and 40+ faculty for minor projects and industrial training. I still answer its bug reports, run its roadmap and deploy it.',
    'I also like knowing how things work underneath, so I am comfortable in the layer a stack sits on — Linux, Docker, the LDAP directory the university runs — rather than only in the code I wrote.',
    'I lead the Web Development Committee at PDEU and teach a weekly Practical Software Engineering session, because explaining a technical decision clearly is part of shipping it.',
  ],
} as const

import { github, SITE_URL, type ResumeId } from './site.ts'

export type RoleId = 'engineering' | 'solutions' | 'product'

export type ContentBlock =
  | { kind: 'prose'; text: readonly string[] }
  | { kind: 'bullets'; items: readonly string[] }
  | {
      kind: 'steps'
      /** `list` reads as a case study; `rail` reads as a repeatable method. */
      variant?: 'list' | 'rail'
      items: readonly { title: string; text?: string; bullets?: readonly string[] }[]
    }
  | { kind: 'journey'; steps: readonly { actor: string; action: string; detail: string }[] }
  | {
      kind: 'matrix'
      columns: readonly string[]
      rows: readonly (readonly string[])[]
    }
  | { kind: 'links'; items: readonly { label: string; href: string; note?: string }[] }
  | { kind: 'note'; text: readonly string[] }

export interface RoleSection {
  id: string
  eyebrow: string
  title: string
  lede?: string
  blocks: readonly ContentBlock[]
}

export interface RoleTrack {
  id: RoleId
  path: string
  navLabel: string
  label: string
  /** Browser tab title for this route. */
  pageTitle: string
  pageDescription: string
  card: { blurb: string; points: readonly string[] }
  hero: { eyebrow: string; muted: string; strong: string; lede: string }
  /** Key in `resumeByRole`. */
  resumeId: ResumeId
  sections: readonly RoleSection[]
}

const SYSTEM_LINKS = [
  { label: 'Both systems (live)', href: 'https://portal.pdpu.ac.in', note: 'In production' },
  {
    label: 'Session guides',
    href: 'https://wdc-guides.pages.dev/guides/',
    note: 'Written for the committee',
  },
  { label: 'GitHub', href: github, note: 'Profile and open source' },
  { label: 'Portfolio', href: SITE_URL, note: 'This site' },
]

const engineering: RoleTrack = {
  id: 'engineering',
  path: '/engineering',
  navLabel: 'Engineering',
  label: 'Development Engineer',
  pageTitle: 'Development Engineer',
  pageDescription:
    'Full-stack TypeScript across two production university systems: React, Node.js, Express, self-hosted Appwrite, LDAP and Docker — deployed and maintained by Mrugesh Thesiya.',
  card: {
    blurb: 'Build and ship software.',
    points: [
      'Full-stack TypeScript, React to Dockerised Node',
      'Architecture, deployment, debugging and maintenance',
      'Two systems in production, both still mine',
    ],
  },
  hero: {
    eyebrow: 'Development Engineer',
    muted: 'I build it, deploy it,',
    strong: 'debug it, keep it running',
    lede: 'Full-stack TypeScript across two systems in production at PDEU — React front ends, Node.js and Express services, self-hosted Appwrite for auth, database and storage, LDAP for campus identity, Docker on the university’s own servers. Together they serve 450+ students and 40+ faculty.',
  },
  resumeId: 'engineering',
  sections: [
    {
      id: 'capabilities',
      eyebrow: 'Capabilities',
      title: 'What can be handed to me',
      blocks: [
        {
          kind: 'bullets',
          items: [
            'Application architecture — reorganised an early Next.js build into a React and Node.js codebase in a pnpm and Turborepo monorepo, TypeScript end to end',
            'API design and integration — REST APIs with role-based access control, and a self-hosted Appwrite backend for auth, database and storage',
            'Authentication — sign-in bound to the campus LDAP directory, set up with the university IT department',
            'Deployment and operations — Dockerised and deployed on the university’s own server behind Nginx, with PM2 supervising the Node process',
            'Debugging and maintenance — first point of contact for both systems: triage the report, reproduce it, ship the fix',
            'Data modelling — team and mentor allocation, submission and evaluation states, training applications and their documents',
          ],
        },
      ],
    },
    {
      id: 'case-study',
      eyebrow: 'Case study',
      title: 'Two systems, taken to production and kept there',
      lede: 'Written from the work itself: what existed, what I built, what got in the way, and what can be checked.',
      blocks: [
        {
          kind: 'steps',
          items: [
            {
              title: 'Problem and context',
              text: 'PDEU ran two processes by hand. Students formed project teams and were matched with mentors through correspondence, and industrial training records were collected and tracked separately. Nobody had one place to see what had been submitted, by whom, and who was supervising it. The requirements were never written down — they came out of conversations with faculty during a Tech Internship in 2024.',
            },
            {
              title: 'Users and requirements',
              bullets: [
                'Students forming teams, submitting minor, major and comprehensive projects, and applying for industrial training',
                'Faculty and mentors supervising submissions and running evaluation and grading',
                'Coordinators reviewing training applications and seeing where each student stands',
                'SuperAdmins who need the whole picture at once',
                'University IT, who own identity and would not accept a second password store',
                'Requirements gathered directly from faculty and administrators, then refined through demo and feedback rounds with both faculty and students',
              ],
            },
            {
              title: 'Architecture and technology choices',
              bullets: [
                'Started on Next.js; migrated to a React and Node.js stack in a pnpm and Turborepo monorepo, TypeScript end to end',
                'Self-hosted Appwrite for auth, database and storage, so the university holds its own data',
                'Sign-in bound to the campus LDAP directory, set up with the university IT department',
                'Role-based access across SuperAdmin, faculty and mentors, so one system serves every side',
                'REST APIs between the React front end and the Node.js and Express services',
                'Containerised with Docker and deployed on the university’s own server, behind Nginx, with PM2 supervising the Node process',
              ],
            },
            {
              title: 'My technical contributions',
              bullets: [
                'Scoped the first version with faculty stakeholders during the internship, and kept owning it afterwards',
                'Designed the data model and the role boundaries for both systems',
                'Wrote the application: React front ends, Node.js and Express services, REST APIs',
                'Integrated LDAP sign-in with the university IT department',
                'Built team and mentor allocation, submissions with guidelines and deadlines, and evaluation and grading',
                'Built the industrial training workflow: student applications, document uploads, coordinator review, status tracking and reports',
                'Re-platformed the original Next.js build into a React and Node.js monorepo',
                'Containerised and deployed both systems onto the university’s own server',
              ],
            },
            {
              title: 'Implementation challenges and how I addressed them',
              bullets: [
                'Identity could not be duplicated → bound sign-in to the campus LDAP directory instead of building a second password store',
                'Several audiences needed different views → role-based access rather than several partial systems',
                'The university owns the server and its release tolerance → containerised the app to fit their infrastructure rather than pushing a hosting model on them',
                'The codebase outgrew a single project → moved it to a pnpm and Turborepo monorepo with TypeScript end to end',
                'Requirements kept shifting as people saw demos → refined them through regular demo and feedback rounds instead of freezing a spec nobody would read',
              ],
            },
            {
              title: 'Deployment and maintenance',
              bullets: [
                'Dockerised and deployed on the university’s own server, behind Nginx, with PM2 supervising the Node process',
                'Both systems live at portal.pdpu.ac.in',
                'Changes are demoed to faculty before rollout, and usage is tracked after each release to catch problems early',
                'I am the first point of contact: bug reports and feature requests are triaged by me and shipped as fixes',
              ],
            },
            {
              title: 'Verified impact and lessons learned',
              bullets: [
                'Both systems in production — project management since May 2024, industrial training since May 2026',
                'Serving 450+ students and 40+ faculty; both replaced manual processes',
                'Lesson: requirements that were never written down are still real requirements — demos were what made them testable',
                'Lesson: the deployment target is a stakeholder. Fitting the university’s own server mattered more than picking the more convenient host',
                'Lesson: owning something after launch is a different skill from building it, and most of the work',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'source',
      eyebrow: 'Source and demos',
      title: 'Where to look next',
      blocks: [
        { kind: 'links', items: SYSTEM_LINKS },
        {
          kind: 'note',
          text: [
            'The source for the university systems is not public — it belongs to the university, and there is no public demo because both sit behind campus sign-in. I can walk through the architecture, the code and the trade-offs on a call or a screen share.',
          ],
        },
      ],
    },
  ],
}

const solutions: RoleTrack = {
  id: 'solutions',
  path: '/solutions',
  navLabel: 'Solutions',
  label: 'Solutions Engineer',
  pageTitle: 'Solutions Engineer',
  pageDescription:
    'Technical discovery, system integration, deployment and support: Mrugesh Thesiya took two university systems from requirements to production on the university’s own infrastructure, LDAP sign-in included.',
  card: {
    blurb: 'Turn complex requirements into working solutions.',
    points: [
      'Discovery with faculty, then specs and user flows',
      'Integrated campus LDAP with the university IT department',
      'Deployed where they operate, and stayed on support',
    ],
  },
  hero: {
    eyebrow: 'Solutions Engineer',
    muted: 'Requirements in their words,',
    strong: 'a running system back',
    lede: 'Two university systems taken from discovery to production on the university’s own infrastructure, including campus LDAP sign-in built with the IT department. I turn what people describe into something they can use, then explain it back. Together they serve 450+ students and 40+ faculty.',
  },
  resumeId: 'solutions',
  sections: [
    {
      id: 'approach',
      eyebrow: 'Approach',
      title: 'How I take a requirement to a running system',
      blocks: [
        {
          kind: 'steps',
          variant: 'rail',
          items: [
            {
              title: 'Hear it in their words',
              text: 'Faculty and administrators described what they needed in conversations, not tickets. I wrote down the workflow they described and showed it back as a demo within days.',
            },
            {
              title: 'Turn it into something checkable',
              text: 'Needs became specs and user flows before a line of code, so a vague ask became a concrete path a faculty member could confirm or correct.',
            },
            {
              title: 'Check the constraints before choosing anything',
              text: 'Who owns identity? Who owns the server? What is the release tolerance? On this project the answers came from the university IT department, and they decided the architecture.',
            },
            {
              title: 'Integrate with what already exists',
              text: 'The campus LDAP directory was already the source of truth for identity. The right answer was to integrate with it, not to compete with it.',
            },
            {
              title: 'Prove it on every build',
              text: 'Each build was demoed to faculty and students for feedback, and changes were demoed to faculty again before rollout.',
            },
            {
              title: 'Deploy where they operate, then stay on it',
              text: 'Containerised and deployed onto the university’s own server. I track usage after each release to catch problems early, and I am the first-line support contact when something breaks.',
            },
          ],
        },
      ],
    },
    {
      id: 'case-study',
      eyebrow: 'Case study',
      title: 'From requirements conversation to production',
      lede: 'The same two systems, told as a problem-solving journey rather than an engineering build.',
      blocks: [
        {
          kind: 'steps',
          items: [
            {
              title: 'Who needed the solution?',
              text: 'Faculty and administrators at PDEU who had to track minor, major and comprehensive projects and students’ industrial training across students and mentors — and the students whose work was in that process. University IT was a stakeholder too, because they own identity.',
            },
            {
              title: 'What problems and constraints existed?',
              bullets: [
                'No single place to see what had been submitted, by whom, and who was supervising it',
                'Requirements existed as conversations, not documents',
                'Identity belongs to the university IT department — a second password store was not acceptable',
                'The university owns the server, and a bad release mid-semester lands during a submission window',
                'Several audiences, one system',
              ],
            },
            {
              title: 'How were the requirements understood?',
              bullets: [
                'Ran technical discovery with faculty and administrators during the internship',
                'Turned their needs into specs and user flows, then demoed each build to them for feedback',
                'Iterated with both faculty and students rather than treating the first version as final',
              ],
            },
            {
              title: 'Why was the proposed architecture appropriate?',
              bullets: [
                'LDAP integration: identity stays with IT, so there is no second password store to secure or reset — access and configuration were agreed with them',
                'Self-hosted Appwrite: the university holds its own auth, database and storage',
                'React and Node.js in a pnpm and Turborepo monorepo, TypeScript end to end: one language across the stack and room to grow past a single app',
                'Docker on the university’s own server: fits their infrastructure and their release tolerance instead of fighting it',
                'Role-based access: one system serves admins, faculty and mentors rather than several partial tools',
              ],
            },
            {
              title: 'How was the solution implemented and deployed?',
              bullets: [
                'React front end, Node.js and Express services over REST APIs, Appwrite for auth, database and storage',
                'LDAP sign-in configured with the university IT department',
                'Containerised with Docker and deployed on university infrastructure; Nginx in front, PM2 supervising the Node process',
                'Both systems live at portal.pdpu.ac.in',
              ],
            },
            {
              title: 'What challenges were resolved?',
              bullets: [
                'Identity duplication → integrated with the campus LDAP directory alongside university IT',
                'Differing views → role-based access for SuperAdmin, faculty and mentors',
                'Outgrew a single project → migrated the original Next.js build to a React and Node.js monorepo',
                'Moving requirements → demo and feedback rounds instead of a frozen spec',
                'Hosting fit → containerised to match the university’s own infrastructure',
              ],
            },
            {
              title: 'What outcomes can be verified?',
              bullets: [
                'Both systems in production — project management since May 2024, industrial training since May 2026',
                'Serving 450+ students and 40+ faculty; both replaced manual processes',
                'Usage tracked after each release to catch problems early, and changes demoed to faculty before rollout',
                'I remain first-line technical support: triage, reproduce, ship the fix',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'communication',
      eyebrow: 'Communication',
      title: 'Explaining it to a room, not just to a ticket',
      blocks: [
        {
          kind: 'bullets',
          items: [
            'Deliver a weekly Practical Software Engineering session to 60+ students, covering coding agents, backend architecture, authentication, databases and infrastructure for a mixed-skill audience',
            'Write and publish the technical guides for each session at wdc-guides.pages.dev, so the material stays usable afterwards',
            'Lead a committee of student developers building production software under faculty mentorship',
            'Coordinated with university IT on campus LDAP sign-in — agreeing access and configuration with a team I do not report to',
          ],
        },
      ],
    },
    {
      id: 'honesty',
      eyebrow: 'Scope',
      title: 'What I am not claiming',
      blocks: [
        {
          kind: 'note',
          text: [
            'I have not worked in enterprise sales or presales, and I have not sold to external customers. My customer-facing work has been inside one organisation: discovery and demos with faculty and administrators, and coordination with the university IT department.',
            'There is no public demo and no public source for the university systems — both are used inside the university. What I can show on a call is how the requirements were gathered, how the LDAP integration was agreed, and how the deployment is wired.',
          ],
        },
        { kind: 'links', items: SYSTEM_LINKS },
      ],
    },
  ],
}

const product: RoleTrack = {
  id: 'product',
  path: '/product',
  navLabel: 'Product',
  label: 'Product Manager',
  pageTitle: 'Product Manager',
  pageDescription:
    'Product owner and developer on two university systems serving 450+ students and 40+ faculty: discovery, specs, roadmap prioritisation, release validation and usage tracking.',
  card: {
    blurb: 'Identify problems and prioritise what to build.',
    points: [
      'Discovery with users, then specs and user flows',
      'Owns the roadmap from real requests and bug reports',
      'Validates releases through demos and usage tracking',
    ],
  },
  hero: {
    eyebrow: 'Product Manager',
    muted: 'I scope it, prioritise it,',
    strong: 'and I can build it too',
    lede: 'Product owner and developer on two university systems serving 450+ students and 40+ faculty. I ran the discovery, wrote the specs and user flows, set the roadmap from real requests, validated releases through demos — and shipped the product myself.',
  },
  resumeId: 'product',
  sections: [
    {
      id: 'approach',
      eyebrow: 'Approach',
      title: 'How I work a product',
      blocks: [
        {
          kind: 'steps',
          variant: 'rail',
          items: [
            {
              title: 'Start with the people, not the backlog',
              text: 'Discovery with faculty and administrators to define the problem before anyone writes a spec.',
            },
            {
              title: 'Write it down so it can be argued with',
              text: 'Specs and user flows before each build, so scope is explicit and a disagreement happens on paper rather than in code.',
            },
            {
              title: 'Decide what ships next',
              text: 'Feature requests and bug reports come in from students and faculty. I prioritise them and decide what goes out.',
            },
            {
              title: 'Validate before rollout',
              text: 'Releases are validated through demos and feedback rounds with faculty and students, and changes are demoed to faculty before rollout.',
            },
            {
              title: 'Measure after, then feed it back in',
              text: 'Track usage to judge adoption and find gaps, then put what it shows back into the next round of prioritisation.',
            },
          ],
        },
      ],
    },
    {
      id: 'case-study',
      eyebrow: 'Case study',
      title: 'Two products, told as product work',
      lede: 'The technical implementation is the differentiator here: I know what it costs to turn a requirement into shipped software, because I did it.',
      blocks: [
        {
          kind: 'steps',
          items: [
            {
              title: 'Problem statement',
              text: 'Two university processes were run by hand. Project teams and mentor matches were arranged through correspondence, and industrial training records were collected and tracked separately. Nobody could see, in one place, what had been submitted, by whom, and who was supervising it.',
            },
            {
              title: 'Target users and their needs',
              bullets: [
                'Students: form a team, get a mentor, submit projects against the right guidelines and deadlines, and apply for industrial training with their documents in one place',
                'Faculty and mentors: see what their students submitted, and evaluate and grade without hunting through correspondence',
                'Coordinators: review training applications and see where each student stands',
                'SuperAdmins: the whole picture across every role',
                'University IT: identity stays under their control',
              ],
            },
            {
              title: 'Existing pain points and available evidence',
              bullets: [
                'Pain points were identified in discovery sessions with faculty and administrators during the internship — not from recorded interviews or analytics. I do not have pre-launch research artefacts and I am not inventing any',
                'What exists: the set of conversations the first version was built from, and usage tracked after each release since launch',
                'The recurring signals were the same on both systems — no single view of submissions, guidelines and deadlines living outside the submission, and training documents collected by hand',
              ],
            },
            {
              title: 'Requirements and feature scope',
              bullets: [
                'Team formation and mentor allocation, with mentor details available throughout',
                'Project submissions with guidelines and deadlines in one place',
                'Evaluation and grading workflows for faculty',
                'Role-based access across SuperAdmin, faculty and mentors',
                'Industrial training applications with supporting document uploads',
                'Coordinator review, status tracking and reports',
                'Sign-in bound to the campus LDAP directory',
              ],
            },
            {
              title: 'Engineering constraints and product trade-offs',
              bullets: [
                'Identity belongs to university IT → auth had to integrate with LDAP rather than ship a password system, and that constrains account recovery forever',
                'Self-hosted Appwrite → the university keeps its data, and it means we operate the database rather than a vendor',
                'The university owns the server → deployment, release cadence and monitoring are bounded by their infrastructure and tolerance',
                'A bad release mid-semester lands during a submission window → release timing is a product decision, not only an engineering one',
                'One system, several audiences → role-based access costs more up front and saves us from several divergent tools',
                'Re-platforming from Next.js to React and Node.js in a monorepo → paid scope pause for room to grow',
              ],
            },
            {
              title: 'Results and lessons learned',
              bullets: [
                'Both systems in production — project management since May 2024, industrial training since May 2026',
                'Serving 450+ students and 40+ faculty; both replaced manual processes',
                'Usage tracked after each release to judge adoption and find gaps',
                'Lesson: specs written before the build earned their keep as a disagreement surface more than as a document',
                'Lesson: a roadmap is mostly other people’s requests — the skill is ordering them, not generating them',
                'Lesson: shipping it yourself removes the gap between what was specified and what got built',
              ],
            },
            {
              title: 'Future opportunities',
              text: 'Recommendations, not a committed roadmap.',
              bullets: [
                'Deeper reporting for coordinators on training outcomes',
                'Visibility for faculty into where submissions stall before the deadline',
                'Self-serve admin tooling, so SuperAdmins depend less on me for routine changes',
                'A clearer status model for students, so "where does my submission stand" answers itself',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'prioritisation',
      eyebrow: 'Artifact',
      title: 'Prioritisation, laid out',
      lede: 'Retrospective — an ordering I would defend today, reconstructed from the constraints we actually worked under. This is not a recorded prioritisation document from the project.',
      blocks: [
        {
          kind: 'matrix',
          columns: ['Item', 'User value', 'Effort', 'Where it landed'],
          rows: [
            [
              'LDAP sign-in with university IT',
              'Blocking — nobody gets in without it',
              'High',
              'Agreed with IT before the rest',
            ],
            [
              'Role-based access',
              'High — every audience depends on it',
              'Medium',
              'Early; it shapes everything else',
            ],
            [
              'Submissions, guidelines and deadlines',
              'High — the core job to be done',
              'Medium',
              'First version',
            ],
            [
              'Team and mentor allocation',
              'High — replaces the manual process',
              'Medium',
              'First version',
            ],
            [
              'Evaluation and grading for faculty',
              'High — the faculty-side payoff',
              'Medium-high',
              'Once submission was working',
            ],
            [
              'Training applications and document uploads',
              'High for coordinators',
              'Medium',
              'Second system, May 2026',
            ],
            [
              'Status tracking and reports',
              'Medium — visibility, not the core job',
              'Low-medium',
              'Alongside the training workflow',
            ],
            [
              'Self-service account recovery',
              'Medium',
              'Low',
              'Not built — LDAP owns credentials, so it is IT’s job',
            ],
          ],
        },
      ],
    },
    {
      id: 'journeys',
      eyebrow: 'Artifact',
      title: 'The two flows the product is built around',
      lede: 'Reconstructed from the requirements the systems were built from. This is not a recorded usability study.',
      blocks: [
        {
          kind: 'journey',
          steps: [
            {
              actor: 'Student',
              action: 'Signs in',
              detail: 'Through the campus LDAP directory, so there is no separate password to manage.',
            },
            {
              actor: 'Student',
              action: 'Finds their project',
              detail: 'Team formation and mentor assignment are visible throughout, with mentor details attached.',
            },
            {
              actor: 'Student',
              action: 'Reads guidelines and deadline',
              detail: 'They live with the submission instead of in a separate mail thread.',
            },
            {
              actor: 'Student',
              action: 'Submits',
              detail: 'The submission lands in one tracked workflow rather than an inbox.',
            },
            {
              actor: 'Faculty / mentor',
              action: 'Reviews and evaluates',
              detail: 'Role-based access shows their own students’ work, with evaluation and grading in the same place.',
            },
            {
              actor: 'SuperAdmin',
              action: 'Sees everything',
              detail: 'One view across roles, instead of assembling it by hand.',
            },
          ],
        },
        {
          kind: 'journey',
          steps: [
            {
              actor: 'Student',
              action: 'Applies for training',
              detail: 'Training details and supporting documents submitted through the portal instead of by hand.',
            },
            {
              actor: 'Coordinator',
              action: 'Reviews',
              detail: 'Everything arrives in one place, with no separate collection step.',
            },
            {
              actor: 'Coordinator',
              action: 'Tracks status',
              detail: 'Where each student’s training stands, without chasing them.',
            },
            {
              actor: 'Coordinator',
              action: 'Runs reports',
              detail: 'Reporting on the state of every student’s training.',
            },
            {
              actor: 'Student / faculty',
              action: 'Raises a problem',
              detail: 'First point of contact is me: triage, reproduce, ship the fix.',
            },
          ],
        },
      ],
    },
  ],
}

export const roleTracks: readonly RoleTrack[] = [engineering, solutions, product]

export const roleById: Record<RoleId, RoleTrack> = {
  engineering,
  solutions,
  product,
}

export const isRoleId = (value: string): value is RoleId =>
  value === 'engineering' || value === 'solutions' || value === 'product'

export interface Link {
  label: string
  href: string
  handle: string
}

export const github = 'https://github.com/MrugeshThesiya'

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

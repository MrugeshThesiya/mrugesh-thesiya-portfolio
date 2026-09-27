/**
 * The build log.
 *
 * This file is the only place chapter progress lives. The hero progress bar, the
 * nav counter and the roadmap all read from it, so completing a chapter is a
 * one-word edit: flip its `status` to 'complete'.
 *
 * Scope: one bit, then sixteen. The next layer — memory, then a CPU — is not
 * started yet and lives in `nextUp` below rather than as fake chapters.
 */

export type MilestoneStatus = 'complete' | 'active' | 'planned'

export interface Milestone {
  id: string
  chapter: number
  title: string
  status: MilestoneStatus
  /** One line on what this chapter is. */
  summary: string
  /** The TypeScript it produced. */
  builds: string[]
  /** The gate this chapter corresponds to, for the visualizer. */
  gateId: 'nand' | 'not' | 'and' | 'or' | 'xor'
}

export interface Phase {
  id: string
  index: number
  title: string
  blurb: string
  /** Chapter numbers covered by this phase. */
  chapters: number[]
}

export const PHASES: readonly Phase[] = [
  {
    id: 'primitive',
    index: 1,
    title: 'The Primitive',
    blurb: 'One gate. If everything else can be built from it, nothing else is a given.',
    chapters: [1],
  },
  {
    id: 'basic-gates',
    index: 2,
    title: 'Basic Gates',
    blurb: 'Four derived gates, each one a NAND wired a different way.',
    chapters: [2, 3, 4, 5],
  },
  {
    id: 'bus',
    index: 3,
    title: 'The 16-bit Layer',
    blurb:
      'No new idea, just a new width — and the first place the cost of a gate starts to matter.',
    chapters: [6, 7, 8, 9, 10],
  },
]

export const MILESTONES: readonly Milestone[] = [
  {
    id: 'nand',
    chapter: 1,
    title: 'Nand',
    status: 'complete',
    gateId: 'nand',
    summary:
      'The only primitive. Out is low in exactly one case — when both inputs are high. Nothing in this project is a given except this gate.',
    builds: ['nand(a, b): Bit', 'The basis for all four gates below'],
  },
  {
    id: 'not',
    chapter: 2,
    title: 'Not',
    status: 'complete',
    gateId: 'not',
    summary: 'Tie both inputs of a NAND to the same wire and the output is the inverse.',
    builds: ['not(x): Bit', 'nand(x, x) — one gate, no extra parts'],
  },
  {
    id: 'and',
    chapter: 3,
    title: 'And',
    status: 'complete',
    gateId: 'and',
    summary: 'A NAND is an inverted AND, so undo the inversion. The inverter is a NAND.',
    builds: ['and(a, b): Bit', 'not(nand(a, b)) — two gates'],
  },
  {
    id: 'or',
    chapter: 4,
    title: 'Or',
    status: 'complete',
    gateId: 'or',
    summary: "De Morgan's law: an OR is a NAND with both inputs inverted first.",
    builds: ['or(a, b): Bit', 'nand(not(a), not(b)) — three gates'],
  },
  {
    id: 'xor',
    chapter: 5,
    title: 'Xor',
    status: 'complete',
    gateId: 'xor',
    summary:
      'High exactly when the inputs disagree. The first gate that cannot be done in two — four of them are needed.',
    builds: ['xor(a, b): Bit', 'The gate arithmetic is actually made of'],
  },
  {
    id: 'not16',
    chapter: 6,
    title: 'Not16',
    status: 'complete',
    gateId: 'nand',
    summary:
      'Sixteen inversions on sixteen wires. Nothing new happens at this width — which is the whole point of the bus.',
    builds: ['not16(a): Word', '16 NANDs'],
  },
  {
    id: 'and16',
    chapter: 7,
    title: 'And16',
    status: 'complete',
    gateId: 'nand',
    summary: 'Bitwise AND with no carry between positions. Each bit looks only at the bit opposite it.',
    builds: ['and16(a, b): Word', '32 NANDs'],
  },
  {
    id: 'or16',
    chapter: 8,
    title: 'Or16',
    status: 'complete',
    gateId: 'nand',
    summary: 'The mirror of And16, and the first bus gate whose cost jumps to three NANDs per bit.',
    builds: ['or16(a, b): Word', '48 NANDs'],
  },
  {
    id: 'mux16',
    chapter: 9,
    title: 'Mux16',
    status: 'complete',
    gateId: 'nand',
    summary:
      'A select line picks a whole bus — the first gate here that is told what to do rather than what it is.',
    builds: ['mux16(a, b, sel): Word', '64 NANDs', 'sel ? b : a was the shortcut I did not take'],
  },
  {
    id: 'add16',
    chapter: 10,
    title: 'Add16',
    status: 'complete',
    gateId: 'nand',
    summary:
      'The first arithmetic in the project. Sixteen full adders in a row, each carrying its spare into the next.',
    builds: ['add16(a, b): Word', '231 NANDs', 'the hardware cost of one addition'],
  },
]

export const COMPLETED = MILESTONES.filter((m) => m.status === 'complete')
export const TOTAL = MILESTONES.length
export const PROGRESS = { done: COMPLETED.length, total: TOTAL }
export const PERCENT = Math.round((PROGRESS.done / PROGRESS.total) * 100)

export const latestCompleted = (): Milestone | undefined =>
  [...MILESTONES].reverse().find((m) => m.status === 'complete')

/** Not started yet. Kept out of the chapter list so the count stays honest. */
export const nextUp = {
  title: 'Memory — the first state',
  items: ['Bit', 'Register', 'PC', 'the point where a circuit stops being a pure function'],
}

export const milestonesByPhase = (): { phase: Phase; items: Milestone[] }[] =>
  PHASES.map((phase) => ({
    phase,
    items: MILESTONES.filter((m) => phase.chapters.includes(m.chapter)),
  }))

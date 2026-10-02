/**
 * The build log.
 *
 * This file is the only place chapter progress lives. The hero progress bar, the
 * nav counter and the roadmap all read from it, so completing a chapter is a
 * one-word edit: flip its `status` to 'complete'.
 *
 * Scope: the whole machine. One bit, then sixteen, then arithmetic, then memory,
 * then a processor, then a compiler, then a screen, then a program that draws on
 * it. Twenty-one chapters, all of them built and running.
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
  {
    id: 'state',
    index: 4,
    title: 'The First State',
    blurb:
      'Up to here every gate was a function of its inputs. Memory is where a circuit stops being pure.',
    chapters: [11, 12, 13],
  },
  {
    id: 'arithmetic',
    index: 5,
    title: 'Arithmetic',
    blurb:
      'One circuit and six switches, giving 21 expressions from two inputs — and four that are impossible.',
    chapters: [14, 15],
  },
  {
    id: 'processor',
    index: 6,
    title: 'The Processor',
    blurb:
      'Three registers and one ALU. Assembled from the pieces above, which is the whole claim of the project.',
    chapters: [16, 17, 18],
  },
  {
    id: 'memory',
    index: 7,
    title: 'Memory',
    blurb:
      'Six rungs of the same pattern, and the first place a hierarchy starts to cost something.',
    chapters: [19],
  },
  {
    id: 'language',
    index: 8,
    title: 'Giving It a Language',
    blurb:
      'An assembler, a screen, a font, and a program that draws. The machine reads its own instructions now.',
    chapters: [20, 21],
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
  {
    id: 'bit',
    chapter: 11,
    title: 'Bit',
    status: 'complete',
    gateId: 'nand',
    summary:
      'The first thing that remembers. A Bit has to answer two questions at once: what does it hold now, and what will it hold after the clock.',
    builds: ['bit(in, load, state): { out, next }', 'a register is sixteen of these'],
  },
  {
    id: 'register',
    chapter: 12,
    title: 'Register',
    status: 'complete',
    gateId: 'nand',
    summary:
      'Sixteen Bits side by side. Holds a value across steps unless something loads it — and the A and D registers of the CPU are both this.',
    builds: ['register(in, load, state): { out, next }', 'no clock object: both values are returned'],
  },
  {
    id: 'pc',
    chapter: 13,
    title: 'PC',
    status: 'complete',
    gateId: 'nand',
    summary:
      'A register that increments, and can be loaded with an address instead. That is the entire program counter.',
    builds: ['pc(load, in, state): { out, next }', 'the third register of the machine'],
  },
  {
    id: 'alu',
    chapter: 14,
    title: 'ALU',
    status: 'complete',
    gateId: 'nand',
    summary:
      'Six control bits and two inputs produce 21 expressions. Every entry was derived from the six evaluation rules, not copied from a reference.',
    builds: ['alu(x, y, flags): Word', '21 computable expressions', '6 expressions impossible, and why'],
  },
  {
    id: 'unreachable',
    chapter: 15,
    title: 'The Absences',
    status: 'complete',
    gateId: 'nand',
    summary:
      'An operand can only ever be 0, an input, or its complement — and all-ones is −1. So 1, D+1, A+1, −D, A−M and XOR cannot be computed at all.',
    builds: ['1, D+1, A+1, -D, -A, A-M: absent', 'D-1 and A-1 work, because -1 is reachable'],
  },
  {
    id: 'cpu',
    chapter: 16,
    title: 'CPU',
    status: 'complete',
    gateId: 'nand',
    summary:
      'Three registers and one ALU. The seven comp bits are the ALU\'s six flags plus the choice of A or M, handed straight over rather than translated.',
    builds: ['cpu(inM, instruction, state): CpuResult', 'all seven jumps, no special cases'],
  },
  {
    id: 'assembler',
    chapter: 17,
    title: 'Assembler',
    status: 'complete',
    gateId: 'nand',
    summary:
      'Text into machine code in two passes: one writes down where every label sits, the other fills in the numbers.',
    builds: ['assemble(source): { code, symbols }', 'dest=comp, resolved by shape', 'R0-R15 predefined'],
  },
  {
    id: 'ram',
    chapter: 18,
    title: 'RAM8 — RAM16K',
    status: 'complete',
    gateId: 'nand',
    summary:
      'Eight registers and a decoder. Every rung is the rung below it eight times over, except the last, which is four times over because 16384 = 4 x 4096.',
    builds: ['ram8 / ram64 / ram512 / ram4k / ram16k', '16384 words at 0x0000', 'out reads before the write'],
  },
  {
    id: 'screen',
    chapter: 19,
    title: 'Screen',
    status: 'complete',
    gateId: 'nand',
    summary:
      '8192 words at 0x4000, mapped to 512 x 256 pixels. There is no framebuffer and no copy step — a pixel is a bit in a word.',
    builds: ['512 x 256, 16 pixels per word', 'a run of pixels is a number', 'the map was drawn before the font'],
  },
  {
    id: 'font',
    chapter: 20,
    title: 'Font',
    status: 'complete',
    gateId: 'nand',
    summary:
      'Every printable ASCII character as seven rows of five pixels in an eight-by-eight cell, with the right margin and the baseline gap left empty.',
    builds: ['95 glyphs, 0x20 to 0x7E', 'spacing lives in the data', '36px advance at 4x'],
  },
  {
    id: 'program',
    chapter: 21,
    title: 'Hello world',
    status: 'complete',
    gateId: 'nand',
    summary:
      'A compiler that emits the assembly which writes the text. 12,161 instructions, no loops, because counting up would need a +1 this ALU cannot compute.',
    builds: ['compileDraw(text, scale)', 'runs on the machine, in the page', '12,161 instructions'],
  },
]

export const COMPLETED = MILESTONES.filter((m) => m.status === 'complete')
export const TOTAL = MILESTONES.length
export const PROGRESS = { done: COMPLETED.length, total: TOTAL }
export const PERCENT = Math.round((PROGRESS.done / PROGRESS.total) * 100)

export const latestCompleted = (): Milestone | undefined =>
  [...MILESTONES].reverse().find((m) => m.status === 'complete')

/** What would come next, if it were built. Kept out of the count so it stays honest. */
export const nextUp = {
  title: 'Keyboard, and a word editor',
  items: [
    'the 0x6000 word, driven by real key events',
    'scrolling text, which needs a cursor and a newline',
    'a monospace font with real descenders',
    'the thing I actually want: a machine that types back',
  ],
}

export const milestonesByPhase = (): { phase: Phase; items: Milestone[] }[] =>
  PHASES.map((phase) => ({
    phase,
    items: MILESTONES.filter((m) => phase.chapters.includes(m.chapter)),
  }))

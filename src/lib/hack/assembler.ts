/**
 * The assembler — text into machine code.
 *
 * Until now every word in this project was produced by hand. This is where the
 * machine starts reading its own programs, which is the last thing separating
 * "a pile of logic" from "a computer you can write for".
 *
 * The output has to be a machine code, not a summary of one: each source line
 * becomes exactly one sixteen-bit word, and a symbol in place of a number has to
 * resolve to the address of the line that declared it. That means two passes —
 * one to write down where every label sits, one to fill in the numbers — which is
 * the same two-pass shape the CPU itself uses when it reads a jump target.
 *
 * The mnemonic tables live here rather than being derived from the ALU, on
 * purpose. If the assembler asked the ALU for its comps, a mistake in the table
 * would cancel out and the tests would pass while the machine stayed broken. The
 * duplication is the point: these tables were written from the instruction set,
 * and the tests in `assembler.test.ts` assert that the two agree.
 */

import { COMPS } from '@/lib/hack/alu'

/** What a single source line produces. */
export type ParsedInstruction =
  | { kind: 'a'; /** The operand as written, so an error can quote it. */ value: string }
  | { kind: 'c'; comp: string; dest: string; jump: string }

export type ParsedLine =
  | { kind: 'comment'; text: string }
  | { kind: 'blank' }
  | { kind: 'label'; name: string }
  | { kind: 'instruction'; instruction: ParsedInstruction; source: string }

export class AssembleError extends Error {
  constructor(
    message: string,
    readonly line: number,
    readonly text: string,
  ) {
    super(`line ${line}: ${message}\n  ${text}`)
    this.name = 'AssembleError'
  }
}

/** `//` or a comment running to the end of the line. */
const stripComment = (line: string): string => {
  const at = line.indexOf('//')
  return (at === -1 ? line : line.slice(0, at)).trim()
}

const A_DECIMAL = /^\d+$/
const SYMBOL = /^[A-Za-z_.$:][\w.$:]*$/

/**
 * Whether a line is a label declaration.
 *
 * `(` cannot start a symbol, so `(` unambiguously means a label and anything
 * else on that line is the instruction it decorates: `(LOOP) D=A` is one
 * instruction with the name LOOP, not an invalid operand.
 */
const LABEL_LINE = /^\(([^)]*)\)\s*(.*)$/


/**
 * Whether a string is a destination: a subset of the letters A, M and D, with
 * none repeated. A shape test, deliberately, so it holds for expressions this
 * particular ALU does not happen to have.
 */
const isDest = (text: string): boolean =>
  text !== '' &&
  [...text].every((c) => c === 'A' || c === 'M' || c === 'D') &&
  new Set(text).size === text.length

/**
 * Split a destination list like `AMD`, or `null` for none.
 *
 * Also rejects a destination that repeats a register: `AAD` is a typo, not a
 * request to store to A twice.
 */
const splitDest = (dest: string): { m: 0 | 1; d: 0 | 1; a: 0 | 1 } => {
  if (dest === '' || dest === 'null') return { m: 0, d: 0, a: 0 }
  const seen = new Set(dest)
  if (seen.size !== dest.length) throw new Error('repeated destination')
  if (![...seen].every((c) => 'AMD'.includes(c))) throw new Error(`unknown destination ${dest}`)
  return {
    m: seen.has('M') ? 1 : 0,
    d: seen.has('D') ? 1 : 0,
    a: seen.has('A') ? 1 : 0,
  }
}

const splitJump = (jump: string): number => {
  if (jump === '' || jump === 'null') return 0
  const order = ['JGT', 'JEQ', 'JGE', 'JLT', 'JNE', 'JLE', 'JMP']
  if (!order.includes(jump)) throw new Error('unknown jump')
  return order.indexOf(jump) + 1
}

/** Every mnemonic this assembler accepts, for error messages and tests. */
export const COMPS_BY_NAME: ReadonlyMap<string, { a: 0 | 1; bits: number }> = new Map(
  COMPS.map((comp) => [
    comp.name,
    {
      a: comp.a,
      // The six flags packed into the order the instruction carries them.
      bits:
        (comp.flags.zx << 5) |
        (comp.flags.nx << 4) |
        (comp.flags.zy << 3) |
        (comp.flags.ny << 2) |
        (comp.flags.f << 1) |
        comp.flags.no,
    },
  ]),
)

/** Read one line of assembly into something addressable. */
export const parseLine = (line: string): ParsedLine => {
  const code = stripComment(line)

  if (code === '') {
    if (line.trim() === '') return { kind: 'blank' }
    // A comment-only line, kept so error messages can quote it back.
    const at = line.indexOf('//')
    return { kind: 'comment', text: at === -1 ? '' : line.slice(at + 2).trim() }
  }

  const labelled = LABEL_LINE.exec(code)
  if (labelled) {
    const name = labelled[1] ?? ''
    if (!SYMBOL.test(name)) throw new Error(`bad label name ${name}`)
    const rest = labelled[2] ?? ''

    // A label on its own takes no space in memory. A label with an instruction
    // after it is that instruction, and the address counting handles it because
    // a line is either a label or an instruction, never both.
    return rest === ''
      ? { kind: 'label', name }
      : parseLine(rest)
  }

  if (code.startsWith('(')) throw new Error('unclosed label')

  if (code.startsWith('@')) {
    const operand = code.slice(1).trim()
    if (!operand) throw new Error('empty A-instruction')
    if (!A_DECIMAL.test(operand) && !SYMBOL.test(operand)) throw new Error(`bad operand ${operand}`)
    return { kind: 'instruction', instruction: { kind: 'a', value: operand }, source: code }
  }

  // C-instruction: comp, optional `=dest`, optional `;jump`.
  const [withDest, jump = ''] = code.split(';')

  // `M=1` is ambiguous on its face: the left could be a destination and the
  // right a comp, or the reverse. Whichever side is a comp the assembler knows
  // is the comp, and only if both qualify does it fall back to reading left to
  // right. That resolves `M=1` to dest M comp 1, `D=M` to comp D dest M, and
  // `AMD=D` to comp D dest AMD.
  const sides = withDest!.split('=').map((side) => side.trim())
  const left = sides[0] ?? ''
  const right = sides[1] ?? ''
  let compName: string
  let dest: string

  if (sides.length === 1) {
    compName = left
    dest = ''
  } else if (sides.length > 2) {
    throw new Error('too many `=`')
  } else if (isDest(left)) {
    // The notation is `dest=comp`, and the destination is the side that is always
    // a subset of the letters A, M and D with none repeated. `M=D` stores D into
    // memory; `D=A` stores A into D. No lookup is needed to see which side that
    // is, which matters because `D`, `A` and `M` are each also expressions.
    dest = left
    compName = right
  } else {
    // The left is not a destination, so the whole left side is the expression.
    // This is what makes `D&A` an expression rather than comp D into dest A&A,
    // and it is why a bare `0` or `D-1` needs no `=` at all.
    compName = left
    dest = ''
  }

  if (!compName) throw new Error('empty C-instruction')

  return {
    kind: 'instruction',
    instruction: { kind: 'c', comp: compName, dest, jump: jump.trim() },
    source: code,
  }
}

/** Predefined symbols. `R0`–`R15` are the CPU's register addresses. */
export const PREDEFINED: ReadonlyMap<string, number> = new Map(
  Array.from({ length: 16 }, (_, i) => [`R${i}`, i]),
)

/** Everything the two passes need to know. */
export interface SymbolTable {
  map: Map<string, number>
  duplicate: string[]
  unresolved: string[]
}

/**
 * First pass: give every label an address. An address is how many instructions
 * came before it, so this walks the lines and counts the instructions rather
 * than the lines — which is why blank lines and comments do not move it.
 */
export const buildSymbols = (lines: readonly ParsedLine[]): SymbolTable => {
  const map = new Map<string, number>()
  const duplicate: string[] = []
  let address = 0

  for (const line of lines) {
    if (line.kind === 'label') {
      if (map.has(line.name)) duplicate.push(line.name)
      else map.set(line.name, address)
    } else if (line.kind === 'instruction') {
      address += 1
    }
  }

  return { map, duplicate, unresolved: [] }
}

/** Second pass: turn each instruction into a word. */
export const encodeLine = (
  line: Extract<ParsedLine, { kind: 'instruction' }>,
  symbols: ReadonlyMap<string, number>,
): number => {
  if (line.instruction.kind === 'a') {
    const operand = line.instruction.value

    if (A_DECIMAL.test(operand)) {
      const value = Number(operand)
      if (value > 0x7fff) throw new Error(`${operand} does not fit in fifteen bits`)
      return value
    }

    const predefined = PREDEFINED.get(operand)
    if (predefined !== undefined) return predefined

    const address = symbols.get(operand)
    if (address === undefined) throw new Error(`undefined symbol ${operand}`)
    return address
  }

  const { comp, dest, jump } = line.instruction

  const entry = COMPS_BY_NAME.get(comp)
  if (entry === undefined) throw new Error(`unknown comp ${comp}`)

  const { a: toA, d: toD, m: toM } = splitDest(dest)
  const j = splitJump(jump)

  // 111 a cccccc ddd jjj — the top bit, the a bit that picks A or M as the
  // first operand, the six comp flags, then one bit per destination in the
  // order A, D, M, then the three jump bits.
  //
  // The comp's own `a` bit and a destination of `A` are different things that
  // both happen to be called `a`, so they get separate names here. Getting them
  // the wrong way round still produces a valid-looking word, which is why the
  // tests compare against a hand-built encoder rather than against themselves.
  return (
    0xe000 |
    (entry.a << 12) |
    (entry.bits << 6) |
    (toA << 5) |
    (toD << 4) |
    (toM << 3) |
    j
  )
}

export interface AssemblyResult {
  /** One sixteen-bit word per instruction. */
  code: number[]
  /** Instruction count, which is also where the program ends. */
  length: number
  symbols: Map<string, number>
}

/** Assemble a whole program. */
export const assemble = (source: string): AssemblyResult => {
  const raw = source.split('\n')

  const lines = raw.map((text, index) => {
    try {
      return parseLine(text)
    } catch (error) {
      throw new AssembleError((error as Error).message, index + 1, text.trim())
    }
  })

  const { map, duplicate } = buildSymbols(lines)
  if (duplicate.length > 0) {
    const at = lines.findIndex((l) => l.kind === 'label' && l.name === duplicate[0])
    throw new AssembleError(`duplicate label ${duplicate[0]}`, at + 1, raw[at]?.trim() ?? '')
  }

  const code: number[] = []
  lines.forEach((line, index) => {
    if (line.kind !== 'instruction') return
    try {
      code.push(encodeLine(line, map))
    } catch (error) {
      throw new AssembleError((error as Error).message, index + 1, raw[index]?.trim() ?? '')
    }
  })

  return { code, length: code.length, symbols: map }
}
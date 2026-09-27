/**
 * The gate catalogue.
 *
 * Each entry pairs a gate with the exact TypeScript that implements it. The
 * `source` fields are `?raw` imports, so the code shown in the visualizer is
 * the same file the browser is executing — it cannot drift from the simulation.
 *
 * Truth tables are generated from `evaluate` rather than written by hand, so a
 * table can never disagree with the gate it describes.
 */

import nandSource from '@/lib/nand.ts?raw'
import andSource from '@/lib/gates/and.ts?raw'
import notSource from '@/lib/gates/not.ts?raw'
import orSource from '@/lib/gates/or.ts?raw'
import xorSource from '@/lib/gates/xor.ts?raw'

import { nand, type Bit } from '@/lib/nand'
import { and } from '@/lib/gates/and'
import { not } from '@/lib/gates/not'
import { or } from '@/lib/gates/or'
import { xor } from '@/lib/gates/xor'

export type GateId = 'nand' | 'not' | 'and' | 'or' | 'xor'

export interface GateDef {
  id: GateId
  /** Display name, matching the chapter title. */
  name: string
  /** How many input bits the gate takes. */
  arity: 1 | 2
  /** How many NANDs it costs to build. Undefined for the primitive itself. */
  nandCount?: number
  /** The wiring, in one line. */
  formula: string
  /** A follow-up line for formulas that need a temporary. */
  formulaNote?: string
  /** One or two sentences on how it works. */
  summary: string
  evaluate: (args: Bit[]) => Bit
  source: string
  /** Source file name, shown above the code. */
  file: string
}

export const GATES: readonly GateDef[] = [
  {
    id: 'nand',
    name: 'Nand',
    arity: 2,
    formula: 'out = Nand(a, b)',
    summary:
      'The primitive. Out is low in exactly one case — when both inputs are high. It is the only gate in this project that is not built from something else.',
    evaluate: ([a = 0, b = 0]) => nand(a, b),
    source: nandSource,
    file: 'nand.ts',
  },
  {
    id: 'not',
    name: 'Not',
    arity: 1,
    nandCount: 1,
    formula: 'out = Nand(x, x)',
    summary:
      'Tie both inputs of a NAND to the same wire and the output is the inverse. The cheapest gate there is — and the reason one NAND is enough to start.',
    evaluate: ([x = 0]) => not(x),
    source: notSource,
    file: 'not.ts',
  },
  {
    id: 'and',
    name: 'And',
    arity: 2,
    nandCount: 2,
    formula: 'out = Not(Nand(a, b))',
    summary:
      'A NAND is an inverted AND, so undo the inversion. The inverter is itself a NAND, so this is two of them in a row.',
    evaluate: ([a = 0, b = 0]) => and(a, b),
    source: andSource,
    file: 'and.ts',
  },
  {
    id: 'or',
    name: 'Or',
    arity: 2,
    nandCount: 3,
    formula: 'out = Nand(Not(a), Not(b))',
    summary:
      "De Morgan's law: an OR is a NAND with both inputs inverted first. Two of the three gates here are the Not above.",
    evaluate: ([a = 0, b = 0]) => or(a, b),
    source: orSource,
    file: 'or.ts',
  },
  {
    id: 'xor',
    name: 'Xor',
    arity: 2,
    nandCount: 4,
    formula: 'out = Nand(Nand(a, n), Nand(b, n))',
    formulaNote: 'where n = Nand(a, b)',
    summary:
      'High exactly when the inputs disagree. The first NAND spots both inputs being high, the next two compare each input against that, and the last combines them.',
    evaluate: ([a = 0, b = 0]) => xor(a, b),
    source: xorSource,
    file: 'xor.ts',
  },
]

export const GATE_BY_ID = Object.fromEntries(GATES.map((g) => [g.id, g])) as Record<
  GateId,
  GateDef
>

/** Input labels for the truth table, one per input bit. */
export const inputLabels = (gate: GateDef): readonly string[] =>
  gate.arity === 1 ? ['X'] : ['A', 'B']

/** A row of inputs followed by the output. */
export type GateRow = readonly Bit[]

const BINARY: readonly Bit[] = [0, 1]

/** Every row of a gate's truth table, computed by running the gate. */
export const rowsFor = (gate: GateDef): readonly GateRow[] =>
  gate.arity === 1
    ? BINARY.map((x) => [x, gate.evaluate([x])] as const)
    : BINARY.flatMap((a) => BINARY.map((b) => [a, b, gate.evaluate([a, b])] as const))

/** The all-low input combination, used to reset the playground. */
export const zeroInputs = (gate: GateDef): Bit[] => new Array<Bit>(gate.arity).fill(0)

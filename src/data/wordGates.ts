/**
 * The 16-bit catalogue.
 *
 * Same shape as the gate catalogue: each entry pairs a bus gate with the exact
 * TypeScript implementing it, imported with `?raw` so the code shown in the
 * browser is the file the browser is running.
 *
 * `nandCount` is the hardware cost for *this* implementation, counted from the
 * gates it actually calls rather than from an optimal design.
 */

import and16Source from '@/lib/bus/and16.ts?raw'
import add16Source from '@/lib/bus/add16.ts?raw'
import mux16Source from '@/lib/bus/mux16.ts?raw'
import not16Source from '@/lib/bus/not16.ts?raw'
import or16Source from '@/lib/bus/or16.ts?raw'

import { and16 } from '@/lib/bus/and16'
import { add16 } from '@/lib/bus/add16'
import { mux16 } from '@/lib/bus/mux16'
import { not16 } from '@/lib/bus/not16'
import { or16 } from '@/lib/bus/or16'
import { fromNumber, type Bit, type Word } from '@/lib/bus'

export type WordGateId = 'not16' | 'and16' | 'or16' | 'mux16' | 'add16'

export interface WordGateDef {
  id: WordGateId
  name: string
  /** How many 16-bit inputs the gate takes. */
  words: number
  /** How many single-bit inputs it takes, such as a select line. */
  bits: number
  /** NANDs consumed by this implementation. */
  nandCount: number
  formula: string
  summary: string
  /** (words, bits) => result */
  evaluate: (words: Word[], bits: Bit[]) => Word
  source: string
  file: string
  /** The pair of words the playground opens with. */
  defaults: readonly number[]
}

export const WORD_GATES: readonly WordGateDef[] = [
  {
    id: 'not16',
    name: 'Not16',
    words: 1,
    bits: 0,
    nandCount: 16,
    formula: 'out = Not16(a)',
    summary:
      'Sixteen independent inversions on sixteen wires. Nothing new happens at this width — that is the point. Everything above one bit is repetition.',
    evaluate: ([a]) => not16(a ?? fromNumber(0)),
    source: not16Source,
    file: 'not16.ts',
    defaults: [0xa3f0],
  },
  {
    id: 'and16',
    name: 'And16',
    words: 2,
    bits: 0,
    nandCount: 32,
    formula: 'out = And16(a, b)',
    summary:
      'Bitwise AND with no carry between positions. Each bit only ever looks at the bit opposite it, so 32 NANDs cover the whole word.',
    evaluate: ([a, b]) => and16(a ?? fromNumber(0), b ?? fromNumber(0)),
    source: and16Source,
    file: 'and16.ts',
    defaults: [0xff0f, 0x0ff0],
  },
  {
    id: 'or16',
    name: 'Or16',
    words: 2,
    bits: 0,
    nandCount: 48,
    formula: 'out = Or16(a, b)',
    summary:
      'The mirror of And16, and the first bus gate whose cost jumps. An OR has to invert both of its inputs before the NAND, so three NANDs per bit.',
    evaluate: ([a, b]) => or16(a ?? fromNumber(0), b ?? fromNumber(0)),
    source: or16Source,
    file: 'or16.ts',
    defaults: [0xff0f, 0x0ff0],
  },
  {
    id: 'mux16',
    name: 'Mux16',
    words: 2,
    bits: 1,
    nandCount: 64,
    formula: 'out = sel ? b : a',
    summary:
      'A single select line picks a whole bus. The first gate here that is told what to do rather than just what it is — and the first one where the obvious TypeScript shortcut would have hidden four gates per bit.',
    evaluate: ([a, b], [sel]) => mux16(a ?? fromNumber(0), b ?? fromNumber(0), sel ?? 0),
    source: mux16Source,
    file: 'mux16.ts',
    defaults: [0x1234, 0xabcd],
  },
  {
    id: 'add16',
    name: 'Add16',
    words: 2,
    bits: 0,
    nandCount: 231,
    formula: 'out = a + b   (mod 2^16)',
    summary:
      'The first arithmetic in the project. Sixteen full adders in a row, each carrying its spare into the next. Try 0x0002 and 0xFFFF — the carry out of the top bit is dropped, which is exactly how a sixteen-bit machine behaves.',
    evaluate: ([a, b]) => add16(a ?? fromNumber(0), b ?? fromNumber(0)),
    source: add16Source,
    file: 'add16.ts',
    defaults: [0x0002, 0xffff],
  },
]

export const WORD_GATE_BY_ID = Object.fromEntries(WORD_GATES.map((g) => [g.id, g])) as Record<
  WordGateId,
  WordGateDef
>

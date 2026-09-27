/**
 * Add16 — the first arithmetic in the project.
 *
 * Adding two words means adding one column of bits at a time and carrying the
 * spare into the next column. Each column is a full adder, and the carry out
 * of column n becomes the carry in of column n+1 — which is what "ripple" means.
 *
 * A full adder, in the gates already built:
 *
 *     half   = Xor(a, b)
 *     sum    = Xor(half, carryIn)
 *     carry  = Or( And(a, b), And(half, carryIn) )
 *
 * The lowest column has no carry coming in, so it is a plain half adder and
 * skips the second Xor and the second And entirely. Add that up — 6 gates for
 * the first column, 15 for each of the other fifteen — and this file is the
 * hardware cost of one addition: 231 NANDs.
 *
 * The carry out of the top bit is dropped. That is not a bug, it is how a
 * sixteen-bit machine behaves: `0xFFFF + 0x0002` gives `0x0001`.
 */

import { and } from '@/lib/gates/and'
import { or } from '@/lib/gates/or'
import { xor } from '@/lib/gates/xor'
import { WORD_WIDTH, type Bit, type Word } from '@/lib/bus'

/** The lowest column: nothing to carry in, so two gates fewer. */
const halfAdder = (a: Bit, b: Bit): { sum: Bit; carry: Bit } => ({
  sum: xor(a, b),
  carry: and(a, b),
})

/** Every other column: three bits in, a sum and a carry out. */
const fullAdder = (a: Bit, b: Bit, carryIn: Bit): { sum: Bit; carry: Bit } => {
  const half = xor(a, b)
  return { sum: xor(half, carryIn), carry: or(and(a, b), and(half, carryIn)) }
}

export const add16 = (a: Word, b: Word): Word => {
  const out: Bit[] = []

  const first = halfAdder(a[0] ?? 0, b[0] ?? 0)
  out.push(first.sum)
  let carry: Bit = first.carry

  for (let i = 1; i < WORD_WIDTH; i++) {
    const column = fullAdder(a[i] ?? 0, b[i] ?? 0, carry)
    out.push(column.sum)
    carry = column.carry
  }

  return out
}

/**
 * mux8way16 — pick one of eight buses.
 *
 * The A register of the CPU has more sources than a four-way mux can handle:
 * a value from an instruction, the program counter, a word out of RAM, the ALU
 * result, and the data input. Eight is enough, and two cascaded four-way muxes
 * cover it.
 */

import { mux4way16 } from '@/lib/hack/mux4way16'
import { mux16 } from '@/lib/bus/mux16'
import type { Bit, Word } from '@/lib/bus'

export const mux8way16 = (
  buses: readonly Word[],
  sel: readonly [Bit, Bit, Bit],
): Word => {
  const [a, b, c, d, e, f, g, h] = buses as readonly [Word, Word, Word, Word, Word, Word, Word, Word]

  const low = mux4way16(a, b, c, d, [sel[0], sel[1]])
  const high = mux4way16(e, f, g, h, [sel[0], sel[1]])

  return mux16(low, high, sel[2])
}
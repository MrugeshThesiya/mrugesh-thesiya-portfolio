/**
 * mux4way16 — pick one of four buses.
 *
 * Two cascaded two-way muxes: the low select bit chooses within the first pair,
 * the high bit chooses which pair survives. Sixteen bits wide, so this is sixteen
 * of the one-bit mux from mux.ts.
 */

import { mux16 } from '@/lib/bus/mux16'
import type { Bit, Word } from '@/lib/bus'

export const mux4way16 = (a: Word, b: Word, c: Word, d: Word, sel: readonly [Bit, Bit]): Word => {
  const low = mux16(a, b, sel[0])
  const high = mux16(c, d, sel[0])
  return mux16(low, high, sel[1])
}
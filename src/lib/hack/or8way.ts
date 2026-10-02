/**
 * OR over eight bits.
 *
 * Needed because a later chip — the 8-way multiplexer that picks which of eight
 * registers the A register reads — has to reject a jump destination if *any* of
 * its three jump bits are low. That is an 8-way OR.
 */

import { or } from '@/lib/gates/or'
import type { Bit } from '@/lib/nand'

export const or8way = (bits: readonly Bit[]): Bit => {
  let out: Bit = 0
  for (const bit of bits) out = or(out, bit)
  return out
}
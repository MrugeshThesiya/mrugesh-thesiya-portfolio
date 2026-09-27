/**
 * XOR — built from four NANDs.
 *
 * Out is high exactly when the two inputs disagree. The first NAND notices
 * that both inputs were high; the next two compare each input against that
 * notice, and the last NAND combines them. If both inputs match, the middle
 * stage fires and the output is pulled low.
 *
 * This is the gate that arithmetic is actually made of, and it is the first
 * one that cannot be done in two.
 */

import { nand, type Bit } from '@/lib/nand'

export const xor = (a: Bit, b: Bit): Bit => {
  const both = nand(a, b)
  return nand(nand(a, both), nand(b, both))
}

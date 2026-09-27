/**
 * NOT — built from one NAND.
 *
 * Tie both inputs of a NAND to the same wire and AND of a bit with itself
 * collapses to that bit, so the NAND's inversion is left standing on its own.
 * One gate, no extra parts.
 */

import { nand, type Bit } from '@/lib/nand'

export const not = (x: Bit): Bit => nand(x, x)

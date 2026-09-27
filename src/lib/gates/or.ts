/**
 * OR — built from three NANDs.
 *
 * De Morgan's law: an OR is a NAND whose inputs have both been inverted first.
 * So invert `a`, invert `b`, and NAND the two results. Two of those three
 * gates are just the NOT above.
 */

import { nand, type Bit } from '@/lib/nand'
import { not } from '@/lib/gates/not'

export const or = (a: Bit, b: Bit): Bit => nand(not(a), not(b))

/**
 * AND — built from two NANDs.
 *
 * A NAND is an inverted AND, so all you have to do is undo the inversion.
 * `not` above is itself a NAND with its inputs tied together, which means
 * AND is a NAND feeding a NAND.
 */

import { nand, type Bit } from '@/lib/nand'
import { not } from '@/lib/gates/not'

export const and = (a: Bit, b: Bit): Bit => not(nand(a, b))

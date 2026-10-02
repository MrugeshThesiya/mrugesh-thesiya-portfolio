/**
 * Mux16 — a sixteen-bit choice.
 *
 * `sel` decides which bus comes out the other side, for all sixteen bits at
 * once. This is the first gate here that is not bitwise: it is the first one
 * that has to be *told* what to do.
 *
 * A one-bit mux is four NANDs — invert the select, NAND each input against
 * whichever line should suppress it, then NAND the two survivors together. The
 * alternative, `sel ? b : a`, would be one line of TypeScript and zero gates,
 * which is exactly the shortcut this project refuses to take.
 */

import { mux } from '@/lib/mux'
import { WORD_WIDTH, type Bit, type Word } from '@/lib/bus'

export const mux16 = (a: Word, b: Word, sel: Bit): Word => {
  const out: Bit[] = []
  for (let i = 0; i < WORD_WIDTH; i++) out.push(mux(a[i] ?? 0, b[i] ?? 0, sel))
  return out
}

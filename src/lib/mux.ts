/**
 * A one-bit mux — the first chip that is *told* what to do rather than what it
 * is. `sel` picks which of two inputs reaches the output.
 *
 * Four NANDs: invert the select, NAND each input against whichever line should
 * suppress it, then NAND the two survivors together. One of them is therefore
 * held high and passes its partner straight through.
 *
 * The obvious TypeScript would be `sel ? b : a`, which is one line and zero
 * gates. That is exactly the shortcut this project refuses.
 */

import { not } from '@/lib/gates/not'
import { nand, type Bit } from '@/lib/nand'

export const mux = (a: Bit, b: Bit, sel: Bit): Bit => {
  const nsel = not(sel)
  return nand(nand(a, nsel), nand(b, sel))
}
/**
 * Bit — the first thing in this project that remembers.
 *
 * Everything so far has been combinational: a function of its inputs and
 * nothing else. This is the line in the sand. A Bit has state, so it has to
 * answer two questions at once — what does it hold *now* (for anything reading
 * it during this step), and what will it hold *after* the clock (for the next).
 *
 * There is no clock object here. A synchronous chip is modelled by returning
 * both values and letting the caller latch every `next` at the same instant,
 * which is exactly what an edge-triggered register does and far easier to test.
 */

import { mux } from '@/lib/mux'
import type { Bit } from '@/lib/nand'

export interface BitState {
  value: Bit
}

export interface BitResult {
  /** What the rest of the machine reads this step. */
  out: Bit
  /** What gets latched when the clock ticks. */
  next: Bit
}

export const bit = (inValue: Bit, load: Bit, state: BitState): BitResult => {
  const next = mux(state.value, inValue, load)
  return { out: state.value, next }
}

export const initialBit = (value: Bit = 0): BitState => ({ value })

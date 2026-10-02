/**
 * RAM8 — eight words that remember.
 *
 * Memory is where the machine stops being arithmetic and starts being a
 * computer. Up to here every gate was a function of its inputs; from here on
 * something has to survive the clock, or there is nowhere to put a variable.
 *
 * Structurally it is eight registers and a decoder. The decoder decides which
 * register is selected; every register sees the same data on its input, and
 * only the selected one is told to load it. That is why `load` alone is enough
 * to describe a write — the address already picked the victim.
 *
 * One deliberate detail: `out` reads the value *before* the write. A register
 * changes on the clock edge, so during the cycle in which memory is being
 * written, whatever is reading it still sees the old contents. Returning the
 * new value here would let a program read back a write it had not finished.
 */

import { addressToNumber } from '@/lib/hack/decoder'
import { initialWord } from '@/lib/hack/register'
import type { Bit, Word } from '@/lib/bus'

export const RAM8_WORDS = 8
export const RAM8_ADDRESS_BITS = 3

export type Ram8State = readonly Word[]

export interface Ram8Result {
  /** What a read returns this step. */
  out: Word
  /** What gets latched when the clock ticks. */
  next: Ram8State
}

/**
 * A blank RAM8. Every word is its own array rather than eight references to one
 * shared zero, so that a caller who reaches into `next` cannot corrupt every
 * cell at once.
 */
export const initialRam8 = (): Ram8State =>
  Array.from({ length: RAM8_WORDS }, () => initialWord())

export const ram8 = (
  inValue: Word,
  load: Bit,
  address: readonly Bit[],
  state: Ram8State,
): Ram8Result => {
  const index = addressToNumber(address, RAM8_ADDRESS_BITS)
  const out = state[index] ?? initialWord()

  if (load !== 1) return { out, next: state }

  const next = state.slice()
  next[index] = inValue
  return { out, next }
}
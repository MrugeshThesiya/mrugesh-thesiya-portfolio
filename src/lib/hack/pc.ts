/**
 * PC — the program counter. The only clock in the machine.
 *
 * Three controls, in priority order: `reset` wins, then `load` (a taken jump),
 * then `inc` (the ordinary "next instruction"). Anything else holds, which is
 * what makes an infinite loop possible and therefore anything else possible.
 */

import { mux16 } from '@/lib/bus/mux16'
import { WORD_WIDTH, toNumber, fromNumber, type Bit, type Word } from '@/lib/bus'

export interface PcResult {
  out: Word
  next: Word
}

export const pc = (inValue: Word, load: Bit, inc: Bit, reset: Bit, state: Word): PcResult => {
  const stepped = fromNumber((toNumber(state) + 1) & 0xffff)

  const afterInc = mux16(state, stepped, inc)
  const afterLoad = mux16(afterInc, inValue, load)
  const next = mux16(afterLoad, fromNumber(0), reset)

  return { out: state, next }
}

export const PC_WIDTH = WORD_WIDTH

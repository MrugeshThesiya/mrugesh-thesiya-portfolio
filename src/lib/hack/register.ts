/**
 * Register — sixteen Bits side by side.
 *
 * Holds a value across steps unless something loads it. The A and D registers of
 * the CPU are both this, and so is every temporary the CPU needs.
 */

import { bit, initialBit, type BitResult } from '@/lib/hack/bit'
import { WORD_WIDTH, type Bit, type Word } from '@/lib/bus'

export interface RegisterResult {
  out: Word
  next: Word
}

export const register = (inValue: Word, load: Bit, state: Word): RegisterResult => {
  const bits: BitResult[] = []
  const next: Bit[] = []

  for (let i = 0; i < WORD_WIDTH; i++) {
    const cell = bit(inValue[i] ?? 0, load, initialBit(state[i] ?? 0))
    bits.push(cell)
    next.push(cell.next)
  }

  return { out: state, next }
}

export const initialWord = (value: Bit = 0): Word => new Array<Bit>(WORD_WIDTH).fill(value)

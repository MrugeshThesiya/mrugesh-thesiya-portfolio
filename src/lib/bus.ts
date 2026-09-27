/**
 * A bus: sixteen bits travelling together.
 *
 * Everything above one bit is just this — sixteen wires, side by side, each one
 * carrying a single 0 or 1. Nothing here adds a new kind of operation; it adds
 * a width. A `Word` is kept as sixteen separate bits rather than a number
 * because that is what it is, and because the gates below then read as sixteen
 * independent one-bit gates wired in a row.
 *
 * Converting to and from a number is a display convenience, not part of any
 * gate. A real machine moves sixteen wires, not a sixteen-bit integer.
 */

import type { Bit } from '@/lib/nand'

export const WORD_WIDTH = 16

/** Sixteen bits, index 0 being the least significant. */
export type Word = readonly Bit[]

export type { Bit }

const FULL_MASK = (1 << WORD_WIDTH) - 1

/** Normalises anything into a sixteen-bit word, right-aligned. */
export function word(bits: readonly number[]): Word {
  const out: Bit[] = new Array<Bit>(WORD_WIDTH).fill(0)
  for (let i = 0; i < Math.min(bits.length, WORD_WIDTH); i++) {
    out[i] = bits[i] === 1 ? 1 : 0
  }
  return out
}

export function fromNumber(value: number): Word {
  return word(Array.from({ length: WORD_WIDTH }, (_, i) => (value >> i) & 1))
}

export function toNumber(value: Word): number {
  return value.reduce<number>((acc, bit, i) => acc | (bit << i), 0) & FULL_MASK
}

export function toBinary(value: Word): string {
  return value
    .slice()
    .reverse()
    .join('')
}

export function toHex(value: Word): string {
  return toNumber(value).toString(16).toUpperCase().padStart(4, '0')
}

/**
 * The sixteen bits grouped into four nibbles, in storage order: group 0 holds
 * bits 0–3, which is the least significant nibble. Callers rendering this for
 * reading should walk the groups in reverse.
 */
export function toNibbles(value: Word): Bit[][] {
  const out: Bit[][] = []
  for (let group = 0; group < WORD_WIDTH / 4; group++) {
    const nibble: Bit[] = []
    for (let i = 0; i < 4; i++) nibble.push(value[group * 4 + i] ?? 0)
    out.push(nibble)
  }
  return out
}

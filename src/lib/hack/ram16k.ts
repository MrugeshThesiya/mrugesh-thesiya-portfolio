/**
 * ram16k — the memory the machine actually boots with.
 *
 * 0x0000–0x3FFF, sixteen thousand words, and the screen sits immediately above
 * it at 0x4000. This is the data region of the Hack machine, and it is the last
 * rung of the hierarchy.
 *
 * Four ram4ks composed the honest way: 4 x 8 x 8 x 8 words.
 *
 * Every earlier rung was exactly eight times the one below it — 8, 64, 512,
 * 4096 — and this one is not, because 16384 = 4 x 4096 rather than 8 x 4096.
 * So this level has four children and two selector bits instead of eight and
 * three. Forcing the ratio to stay eight would have meant building a 32K chip
 * and throwing half of it away, which would be a lie about the size.
 */

import { addressToNumber, decoder2 } from '@/lib/hack/decoder'
import { initialRam4k, RAM4K_ADDRESS_BITS, RAM4K_WORDS, ram4k } from '@/lib/hack/ram4k'
import { initialRam8 } from '@/lib/hack/ram8'
import { initialRam64 } from '@/lib/hack/ram64'
import { initialRam512 } from '@/lib/hack/ram512'
import { initialWord } from '@/lib/hack/register'
import type { Bit, Word } from '@/lib/bus'

export const RAM16K_WORDS = RAM4K_WORDS * 4 // 16384
export const RAM16K_ADDRESS_BITS = RAM4K_ADDRESS_BITS + 2 // 14, because 16384 = 2**14

export type Ram16kState = readonly (readonly (readonly (readonly (readonly Word[])[])[])[])[]

export interface Ram16kResult {
  out: Word
  next: Ram16kState
}

export const RAM16K_BANKS = 4

export const initialRam16k = (): Ram16kState =>
  Array.from({ length: RAM16K_BANKS }, () => initialRam4k())

export const ram16k = (
  inValue: Word,
  load: Bit,
  address: readonly Bit[],
  state: Ram16kState,
): Ram16kResult => {
  const childAddress = address.slice(0, RAM4K_ADDRESS_BITS)
  const bankLoad = decoder2([address[12] ?? 0, address[13] ?? 0])
  const selected = addressToNumber([address[12] ?? 0, address[13] ?? 0], 2)

  const children = state.map((child, i) =>
    ram4k(inValue, load === 1 && bankLoad[i] === 1 ? 1 : 0, childAddress, child ?? initialRam4k()),
  )

  const out = children[selected]?.out ?? initialWord()

  if (load === 1) {
    const stored = state.slice()
    children.forEach((child, i) => {
      if (bankLoad[i] === 1) stored[i] = child.next
    })
    return { out, next: stored }
  }

  return { out, next: state }
}

/**
 * The five nesting levels of an address: the bank, then four groups of eight,
 * then the word inside the innermost group of eight.
 */
const pathOf = (address: number): [number, number, number, number, number] => [
  Math.floor(address / RAM4K_WORDS),
  Math.floor(Math.floor(address % RAM4K_WORDS) / 512),
  Math.floor(Math.floor(address % 512) / 64),
  Math.floor(Math.floor(address % 64) / 8),
  address % 8,
]

/** Word at a flat address, for tests and for loading a program. */
export const ram16kRead = (state: Ram16kState, address: number): Word => {
  const [a, b, c, d, e] = pathOf(address)
  return state[a]?.[b]?.[c]?.[d]?.[e] ?? initialWord()
}

/**
 * Replace the word at a flat address, returning a new state. Copies only the
 * four arrays along that one path, which is what makes a write cheap without
 * making memory flat.
 */
export const ram16kWrite = (state: Ram16kState, address: number, value: Word): Ram16kState => {
  const [a, b, c, d, e] = pathOf(address)

  const next = state.slice()
  const level0 = (next[a] ?? initialRam4k()).slice()
  const level1 = (level0[b] ?? initialRam512()).slice()
  const level2 = (level1[c] ?? initialRam64()).slice()
  const level3 = (level2[d] ?? initialRam8()).slice()

  level3[e] = value
  level2[d] = level3
  level1[c] = level2
  level0[b] = level1
  next[a] = level0

  return next
}
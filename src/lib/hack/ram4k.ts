/**
 * ram4k — the fourth rung.
 *
 * Eight ram512s, ten address bits. By now the pattern is the whole story of
 * memory in a computer: address the low bits inward, decode the next three into
 * a one-of-eight, and repeat until there are enough words.
 *
 * Four thousand and ninety-six words is small enough that composing it honestly
 * costs nothing, so it is composed honestly: 8 arrays of 8 banks of 8 words.
 */

import { addressToNumber, decoder3 } from '@/lib/hack/decoder'
import { initialRam512, RAM512_ADDRESS_BITS, RAM512_WORDS, ram512 } from '@/lib/hack/ram512'
import { initialWord } from '@/lib/hack/register'
import type { Bit, Word } from '@/lib/bus'

export const RAM4K_WORDS = RAM512_WORDS * 8 // 4096
export const RAM4K_ADDRESS_BITS = RAM512_ADDRESS_BITS + 3 // 12, because 4096 = 2**12

export type Ram4kState = readonly (readonly (readonly (readonly Word[])[])[])[]

export interface Ram4kResult {
  out: Word
  next: Ram4kState
}

export const initialRam4k = (): Ram4kState =>
  Array.from({ length: 8 }, () => initialRam512())

export const ram4k = (
  inValue: Word,
  load: Bit,
  address: readonly Bit[],
  state: Ram4kState,
): Ram4kResult => {
  // The low bits select a word inside the child; the three above them pick it.
  const childAddress = address.slice(0, RAM512_ADDRESS_BITS)
  // ram4k is twelve bits: the ram512 inside it uses bits 0-8, so this chip's
  // own three bits are 9, 10 and 11.
  const bankLoad = decoder3([address[9] ?? 0, address[10] ?? 0, address[11] ?? 0])
  const selected = addressToNumber([address[9] ?? 0, address[10] ?? 0, address[11] ?? 0], 3)

  const children = state.map((child, i) =>
    ram512(inValue, load === 1 && bankLoad[i] === 1 ? 1 : 0, childAddress, child ?? initialRam512()),
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

/**
 * ram512 — the third rung.
 *
 * Eight ram64s with nine address bits. Nothing new happens here; that is the
 * point of a hierarchy. Each rung is the rung below it eight times over, and
 * the only question worth asking at every level is which bit of the address
 * moved up a level.
 */

import { addressToNumber, decoder3 } from '@/lib/hack/decoder'
import { initialRam64, RAM64_ADDRESS_BITS, RAM64_WORDS, ram64 } from '@/lib/hack/ram64'
import { initialWord } from '@/lib/hack/register'
import type { Bit, Word } from '@/lib/bus'

export const RAM512_WORDS = RAM64_WORDS * 8 // 512
export const RAM512_ADDRESS_BITS = RAM64_ADDRESS_BITS + 3 // 9

export type Ram512State = readonly (readonly (readonly Word[])[])[]

export interface Ram512Result {
  out: Word
  next: Ram512State
}

export const initialRam512 = (): Ram512State =>
  Array.from({ length: 8 }, () => initialRam64())

export const ram512 = (
  inValue: Word,
  load: Bit,
  address: readonly Bit[],
  state: Ram512State,
): Ram512Result => {
  // The low bits select a word inside the child; the three above them pick it.
  const childAddress = address.slice(0, RAM64_ADDRESS_BITS)
  // This chip's own three bits are the ones above the child's address, not the
  // first three: ram512 is nine bits, so the ram64 inside it uses bits 0-5.
  const bankLoad = decoder3([address[6] ?? 0, address[7] ?? 0, address[8] ?? 0])
  const selected = addressToNumber([address[6] ?? 0, address[7] ?? 0, address[8] ?? 0], 3)

  const children = state.map((child, i) =>
    ram64(inValue, load === 1 && bankLoad[i] === 1 ? 1 : 0, childAddress, child ?? initialRam64()),
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

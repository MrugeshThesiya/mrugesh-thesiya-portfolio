/**
 * ram64 — eight RAM8s, stacked.
 *
 * The only difference from ram8 is how many address bits are used: six instead
 * of three. The low three bits pick a word inside one of the eight banks, and a
 * decoder turns the high three bits into eight load signals — so a write reaches
 * exactly one bank, and that bank is told to store, while the other seven hear
 * `load` go low and hold on to what they have.
 *
 * Adding a level is the entire memory hierarchy. ram64k does this once more.
 */

import { addressToNumber, decoder3 } from '@/lib/hack/decoder'
import { initialRam8, ram8, RAM8_ADDRESS_BITS, RAM8_WORDS } from '@/lib/hack/ram8'
import { initialWord } from '@/lib/hack/register'
import type { Bit, Word } from '@/lib/bus'

export const RAM64_WORDS = RAM8_WORDS ** 2
export const RAM64_ADDRESS_BITS = RAM8_ADDRESS_BITS + 3

export type Ram64State = readonly (readonly Word[])[]

export interface Ram64Result {
  out: Word
  next: Ram64State
}

export const initialRam64 = (): Ram64State =>
  Array.from({ length: RAM8_WORDS }, () => initialRam8())

export const ram64 = (
  inValue: Word,
  load: Bit,
  address: readonly Bit[],
  state: Ram64State,
): Ram64Result => {
  // The low three bits pick a word inside the bank; the three above pick the bank.
  const bankAddress = address.slice(0, RAM8_ADDRESS_BITS)
  // Which of the eight banks this address names, as a number rather than as
  // one-hot lines, so that `out` can be taken from the right one.
  const selected = addressToNumber([address[3] ?? 0, address[4] ?? 0, address[5] ?? 0], 3)

  // One high line per bank, so only the addressed bank is told to store.
  const bankLoad = decoder3([address[3] ?? 0, address[4] ?? 0, address[5] ?? 0])

  let next: (readonly Word[])[] | undefined

  const banks = state.map((bank, i) =>
    ram8(inValue, load === 1 && bankLoad[i] === 1 ? 1 : 0, bankAddress, bank ?? initialRam8()),
  )

  const out = banks[selected]?.out ?? initialWord()

  if (load === 1) {
    const stored = state.slice()
    banks.forEach((bank, i) => {
      // Only the selected bank changed; the rest are the same arrays as before.
      if (bankLoad[i] === 1) stored[i] = bank.next
    })
    next = stored
  }

  return { out, next: next ?? state }
}
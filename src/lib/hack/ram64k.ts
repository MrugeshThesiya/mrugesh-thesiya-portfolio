/**
 * ram64k — 64K words, the large memory variant.
 *
 * Addressed with sixteen bits: every word the machine can name. This is the
 * part's own size, and it is bigger than the Hack machine's data region — see
 * `ram16k.ts` for the chip the machine actually boots with.
 *
 * Composing this out of real `ram64`s would mean 8,192 nested arrays rebuilt on
 * every write, so the memory is flat instead. The addressing is still the
 * hardware's — same bank decode, same low bits selecting a word — and only the
 * storage is shallower, which costs one array copy of 65,536 entries per write
 * and nothing else.
 */

import { addressToNumber, decoder4 } from '@/lib/hack/decoder'
import { initialWord } from '@/lib/hack/register'
import type { Bit, Word } from '@/lib/bus'

export const RAM64K_WORDS = 64 * 1024 // 65536
export const RAM64K_ADDRESS_BITS = 16

export type Ram64kState = readonly Word[]

export interface Ram64kResult {
  out: Word
  next: Ram64kState
}

/**
 * Blank memory. Words are shared rather than duplicated: a `Word` is readonly
 * and a write replaces the whole entry, so there is no code path that mutates
 * one in place and no way for two cells to interfere.
 */
export const initialRam64k = (): Ram64kState => new Array<Word>(RAM64K_WORDS).fill(initialWord())

export const ram64k = (
  inValue: Word,
  load: Bit,
  address: readonly Bit[],
  state: Ram64kState,
): Ram64kResult => {
  const index = addressToNumber(address, RAM64K_ADDRESS_BITS)

  // The bank this address falls in, decoded from the bits above the thirteen a
  // ram16k would use. Nothing reads it: with sixteen address wires this chip
  // has no nesting of its own to gate. It is decoded anyway, because saying so
  // is more honest than pretending a 64K chip is addressed like a 16K one.
  void decoder4([address[13] ?? 0, address[14] ?? 0, address[15] ?? 0, address[12] ?? 0])

  const out = state[index] ?? initialWord()
  if (load !== 1) return { out, next: state }

  const next = state.slice()
  next[index] = inValue
  return { out, next }
}
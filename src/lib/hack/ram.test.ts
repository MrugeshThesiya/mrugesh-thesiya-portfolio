import { describe, expect, it } from 'vitest'

import { addressToNumber, decoder3 } from '@/lib/hack/decoder'
import { initialRam8, RAM8_WORDS, ram8 } from '@/lib/hack/ram8'
import { initialRam64, RAM64_WORDS, ram64, type Ram64State } from '@/lib/hack/ram64'
import { initialRam512, RAM512_WORDS, ram512 } from '@/lib/hack/ram512'
import { initialRam4k, RAM4K_WORDS, ram4k } from '@/lib/hack/ram4k'
import { initialRam16k, RAM16K_WORDS, ram16k, ram16kRead, ram16kWrite } from '@/lib/hack/ram16k'
import { initialRam64k, RAM64K_WORDS, ram64k } from '@/lib/hack/ram64k'
import { initialWord } from '@/lib/hack/register'
import { SCREEN_BASE, SCREEN_WORDS } from '@/lib/hack/screen'
import { fromNumber, toNumber, type Bit, type Word } from '@/lib/bus'

/** An address bus built from a number, low bit first. */
const addr = (value: number, width: number): Bit[] =>
  Array.from({ length: width }, (_, b) => ((value >> b) & 1) as Bit)

describe('decoder3', () => {
  it('lights exactly one line for every address', () => {
    for (let i = 0; i < 8; i++) {
      const address = addr(i, 3)
      const out = decoder3([address[0], address[1], address[2]] as [Bit, Bit, Bit])
      expect(out.reduce<number>((a, b) => a + b, 0)).toBe(1)
      expect(out[i]).toBe(1)
    }
  })

  it('decodes in the same order the mux selects, so the two agree', () => {
    for (let i = 0; i < 8; i++) {
      const address = addr(i, 3)
      expect(decoder3([address[0], address[1], address[2]] as [Bit, Bit, Bit])[i]).toBe(1)
      expect(addressToNumber(address, 3)).toBe(i)
    }
  })

  it('reads an address low bit first', () => {
    expect(addressToNumber(addr(1, 3), 3)).toBe(1)
    expect(addressToNumber(addr(2, 3), 3)).toBe(2)
    expect(addressToNumber(addr(4, 3), 3)).toBe(4)
  })

  it('ignores address bits above the ones it was asked for', () => {
    // Six-bit bus 0b111001: the low three bits read 001, all six read the word.
    const address = addr(0b111001, 6)
    expect(addressToNumber(address, 3)).toBe(1)
    expect(addressToNumber(address, 6)).toBe(0b111001)
  })
})

/**
 * One set of questions asked of every rung, because a hierarchy is only
 * correct if the same pattern holds all the way down. `read` is per-rung
 * because only the nesting differs; the behaviour under test does not.
 */
interface Chip {
  name: string
  words: number
  bits: number
  blank: () => unknown
  store: (inValue: Word, load: Bit, address: readonly Bit[], state: unknown) => { out: Word; next: unknown }
  read: (state: unknown, address: number) => number
}

const hierarchy = (chip: Chip) => {
  describe(chip.name, () => {
    it(`holds ${chip.words} words on ${chip.bits} address bits`, () => {
      expect(chip.words).toBe(2 ** chip.bits)
    })

    it('starts blank', () => {
      const state = chip.blank()
      expect(chip.read(state, 0)).toBe(0)
      expect(chip.read(state, chip.words - 1)).toBe(0)
    })

    it('stores and reads back, in every bank and at both ends', () => {
      // One word per bank, plus both ends of the range.
      const samples = [...new Set([0, 1, chip.words - 1, ...Array.from({ length: 8 }, (_, i) => i * Math.floor(chip.words / 8))])]
      // The stored value has to fit in sixteen bits, and i + 1 does not for the
      // last word of a 64K chip. 0x5a5a keeps the pattern visible in the dump.
      const valueAt = (i: number): number => 0x5a5a + (i % 0x1000)

      let state = chip.blank()
      samples.forEach((i) => {
        state = chip.store(fromNumber(valueAt(i)), 1, addr(i, chip.bits), state).next
      })
      samples.forEach((i) => expect(chip.read(state, i)).toBe(valueAt(i)))
    })

it('writes only the addressed word', () => {
      // Seven seeded words, deliberately excluding the target, so a write that
      // leaks into a neighbour shows up instead of being masked.
      const target = chip.words - 1
      const victims = [0, 1, 2, 3, 4, 5, 6].filter((i) => i !== target)
      let state = chip.blank()
      victims.forEach((i, n) => {
        state = chip.store(fromNumber(n + 1), 1, addr(i, chip.bits), state).next
      })

      const { next } = chip.store(fromNumber(0xffff), 1, addr(target, chip.bits), state)
      expect(chip.read(next, target)).toBe(0xffff)
      victims.forEach((i, n) => expect(chip.read(next, i)).toBe(n + 1))
    })

    it('does not store when load is low', () => {
      const { next } = chip.store(fromNumber(0xbeef), 0, addr(0, chip.bits), chip.blank())
      expect(chip.read(next, 0)).toBe(0)
    })

    it('reads the old value during the cycle it writes', () => {
      const seeded = chip.store(fromNumber(0x1111), 1, addr(3, chip.bits), chip.blank()).next
      const { out } = chip.store(fromNumber(0x2222), 1, addr(3, chip.bits), seeded)
      expect(toNumber(out)).toBe(0x1111)
    })

    it('keeps a word intact, bit for bit', () => {
      const { next } = chip.store(fromNumber(0xbeef), 1, addr(1, chip.bits), chip.blank())
      expect(chip.read(next, 1)).toBe(0xbeef)
    })

    it('does not mutate the state it was given', () => {
      const state = chip.blank()
      chip.store(fromNumber(1), 1, addr(5, chip.bits), state)
      expect(chip.read(state, 5)).toBe(0)
    })
  })
}

const readRam8 = (state: unknown, i: number): number =>
  toNumber((state as readonly Word[])[i] ?? initialWord())

/**
 * Read a flat address by walking down to a ram8 and asking it for the word.
 *
 * One reader for every rung, which is the point: rather than hardcoding a path
 * per chip, it asks each node how many children it has and how wide a word
 * range each child covers. That handles a top level of eight and a top level of
 * four without either being special-cased, and handles a flat chip too.
 */
const readNested = (words: number) => (state: unknown, address: number): number => {
  let node = state as readonly unknown[]
  let span = words

  // Keep descending until the range under this node is exactly one ram8. `span`
  // is how many words the whole node covers, so dividing it by the number of
  // children gives the size of each child, and the address picks the child.
  while (span > 8) {
    const childSpan = span / node.length
    node = (node[Math.floor(address / childSpan) % node.length] ?? []) as readonly unknown[]
    span = childSpan
  }

  // Below a ram8 the range is eight words, so only the low three bits pick one.
  // A flat chip like ram64k never descends at all, and the whole address applies.
  const index = span === 8 ? address % 8 : address
  return toNumber((node[index] as Word | undefined) ?? initialWord())
}

/** Read a flat address out of a ram8. */
const read64 = (state: Ram64State, i: number): number =>
  toNumber(state[Math.floor(i / 8)]?.[i % 8] ?? initialWord())

hierarchy({
  name: 'ram8',
  words: RAM8_WORDS,
  bits: 3,
  blank: () => initialRam8(),
  store: (i, l, a, s) => ram8(i, l, a, s as never),
  read: readRam8,
})

hierarchy({
  name: 'ram64',
  words: RAM64_WORDS,
  bits: 6,
  blank: () => initialRam64(),
  store: (i, l, a, s) => ram64(i, l, a, s as never),
  read: (s, i) => read64(s as Ram64State, i),
})

hierarchy({
  name: 'ram512',
  words: RAM512_WORDS,
  bits: 9,
  blank: () => initialRam512(),
  store: (i, l, a, s) => ram512(i, l, a, s as never),
  read: readNested(RAM512_WORDS),
})

hierarchy({
  name: 'ram4k',
  words: RAM4K_WORDS,
  bits: 12,
  blank: () => initialRam4k(),
  store: (i, l, a, s) => ram4k(i, l, a, s as never),
  read: readNested(RAM4K_WORDS),
})

hierarchy({
  name: 'ram16k',
  words: RAM16K_WORDS,
  bits: 14,
  blank: () => initialRam16k(),
  store: (i, l, a, s) => ram16k(i, l, a, s as never),
  read: readNested(RAM16K_WORDS),
})

hierarchy({
  name: 'ram64k',
  words: RAM64K_WORDS,
  bits: 16,
  blank: () => initialRam64k(),
  store: (i, l, a, s) => ram64k(i, l, a, s as never),
  read: (s, i) => toNumber((s as readonly Word[])[i] ?? initialWord()),
})

describe('ram64k is flat, unlike every other rung', () => {
  it('holds words directly, with no nesting', () => {
    // Every other chip nests, so this is the one place where a word is not
    // eight words deep. Worth stating outright, because it is a deviation.
    const state = initialRam64k()
    expect(state.length).toBe(65536)
    expect(Array.isArray(state[0])).toBe(true)
    expect(typeof (state[0] as readonly Bit[] | undefined)?.[0]).toBe('number')
  })
})

describe('ram64 specifically', () => {
  it('writes into one bank and leaves the other seven byte-identical', () => {
    let state = initialRam64()
    for (const i of [0, 8, 40, 63]) {
      state = ram64(fromNumber(i + 1), 1, addr(i, 6), state).next
    }
    const before = state.slice()
    const { next } = ram64(fromNumber(999), 1, addr(40, 6), state)

    expect(read64(next, 40)).toBe(999)
    for (const bank of [0, 1, 2, 3, 4, 6, 7]) {
      expect(next[bank]).toBe(before[bank])
    }
  })

  it('uses the high bits for the bank and the low bits for the word', () => {
    let state = initialRam64()
    state = ram64(fromNumber(7), 1, addr(8, 6), state).next
    state = ram64(fromNumber(9), 1, addr(1, 6), state).next
    expect(read64(state, 8)).toBe(7)
    expect(read64(state, 1)).toBe(9)
  })
})

describe('the data region of the machine', () => {
  it('is sixteen thousand words, ending at 0x3FFF', () => {
    expect(RAM16K_WORDS).toBe(16384)
    expect(SCREEN_BASE).toBe(RAM16K_WORDS)
  })

  it('has the screen sitting immediately above it', () => {
    expect(RAM16K_WORDS + SCREEN_WORDS).toBe(0x6000)
  })

  it('holds a program and leaves its neighbours alone', () => {
    let state = initialRam16k()
    for (const [k, v] of Object.entries({ 0: 0x1234, 1: 0xe3b0, 2: 0x0002, 3: 0x0000 })) {
      state = ram16kWrite(state, Number(k), fromNumber(v))
    }

    expect(toNumber(ram16kRead(state, 0))).toBe(0x1234)
    expect(toNumber(ram16kRead(state, 1))).toBe(0xe3b0)
    expect(toNumber(ram16kRead(state, 2))).toBe(0x0002)
    expect(toNumber(ram16kRead(state, 3))).toBe(0x0000)
    expect(toNumber(ram16kRead(state, 4))).toBe(0)
  })

  it('can hold the screen region too, when asked', () => {
    let state = ram16kWrite(initialRam16k(), 0, fromNumber(0x1234))
    state = ram16kWrite(state, SCREEN_BASE, fromNumber(0x00ff))

    expect(toNumber(ram16kRead(state, 0))).toBe(0x1234)
    expect(toNumber(ram16kRead(state, SCREEN_BASE))).toBe(0x00ff)
    expect(toNumber(ram16kRead(state, SCREEN_BASE + 1))).toBe(0)
  })

  it('copies only the arrays along one path when writing', () => {
    const state = initialRam16k()
    const written = ram16kWrite(state, 1234, fromNumber(7))
    // Banks 1, 2 and 3 are the very same arrays, not copies.
    expect(written[1]).toBe(state[1])
    expect(written[2]).toBe(state[2])
    expect(written[3]).toBe(state[3])
    // Bank 0 was touched, so it is a new array.
    expect(written[0]).not.toBe(state[0])
    expect(toNumber(ram16kRead(written, 1234))).toBe(7)
  })

  it('writes through the chip into the same place the helper does', () => {
    const viaChip = ram16k(fromNumber(0xbeef), 1, addr(1234, 13), initialRam16k()).next
    expect(toNumber(ram16kRead(viaChip, 1234))).toBe(0xbeef)
    expect(toNumber(ram16kRead(ram16kWrite(initialRam16k(), 1234, fromNumber(0xbeef)), 1234))).toBe(0xbeef)
  })
})
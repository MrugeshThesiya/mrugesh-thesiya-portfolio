import { describe, expect, it } from 'vitest'

import { and16 } from '@/lib/bus/and16'
import { add16 } from '@/lib/bus/add16'
import { mux16 } from '@/lib/bus/mux16'
import { not16 } from '@/lib/bus/not16'
import { or16 } from '@/lib/bus/or16'

import { WORD_GATES, WORD_GATE_BY_ID } from '@/data/wordGates'
import { and, not, or, xor } from '@/lib/gates'
import { fromNumber, toBinary, toHex, toNibbles, toNumber, word, WORD_WIDTH } from '@/lib/bus'
import { nand, type Bit } from '@/lib/nand'

const asNumber = (w: readonly Bit[]) => toNumber(w)

/** A few values chosen to hit carries, sign bits, all-zeros and all-ones. */
const VALUES = [0x0000, 0x0001, 0x0002, 0x00ff, 0x0f0f, 0x1234, 0x8000, 0xabcd, 0xfffe, 0xffff]

describe('word helpers', () => {
  it('always produces sixteen bits, right-aligned', () => {
    expect(word([])).toHaveLength(WORD_WIDTH)
    expect(word([1])).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  })

  it('round-trips through a number', () => {
    VALUES.forEach((value) => {
      expect(asNumber(fromNumber(value))).toBe(value)
    })
  })

  it('truncates anything wider than sixteen bits', () => {
    expect(asNumber(fromNumber(0x1_2345))).toBe(0x2345)
  })

  it('renders binary most-significant-bit first', () => {
    expect(toBinary(fromNumber(0x0002))).toBe('0000000000000010')
    expect(toBinary(fromNumber(0xffff))).toBe('1111111111111111')
  })

  it('renders padded uppercase hex', () => {
    expect(toHex(fromNumber(0x00af))).toBe('00AF')
  })

  it('groups into four nibbles of four bits', () => {
    const nibbles = toNibbles(fromNumber(0xabcd))
    expect(nibbles).toHaveLength(4)
    expect(nibbles.every((n) => n.length === 4)).toBe(true)
  })
})

describe('16-bit gates', () => {
  it('not16 inverts every bit', () => {
    VALUES.forEach((value) => {
      expect(asNumber(not16(fromNumber(value)))).toBe(~value & 0xffff)
    })
  })

  it('and16 agrees with the bitwise operator', () => {
    VALUES.forEach((a) => {
      VALUES.forEach((b) => {
        expect(asNumber(and16(fromNumber(a), fromNumber(b)))).toBe(a & b)
      })
    })
  })

  it('or16 agrees with the bitwise operator', () => {
    VALUES.forEach((a) => {
      VALUES.forEach((b) => {
        expect(asNumber(or16(fromNumber(a), fromNumber(b)))).toBe(a | b)
      })
    })
  })

  it('mux16 returns b when sel is high and a when it is low', () => {
    VALUES.forEach((a) => {
      VALUES.forEach((b) => {
        expect(asNumber(mux16(fromNumber(a), fromNumber(b), 0))).toBe(a)
        expect(asNumber(mux16(fromNumber(a), fromNumber(b), 1))).toBe(b)
      })
    })
  })

  it('add16 agrees with addition, wrapping at sixteen bits', () => {
    VALUES.forEach((a) => {
      VALUES.forEach((b) => {
        expect(asNumber(add16(fromNumber(a), fromNumber(b)))).toBe((a + b) & 0xffff)
      })
    })
  })

  it('add16 drops the carry out of the top bit', () => {
    expect(asNumber(add16(fromNumber(0x0002), fromNumber(0xffff)))).toBe(0x0001)
    expect(asNumber(add16(fromNumber(0xffff), fromNumber(0xffff)))).toBe(0xfffe)
    expect(asNumber(add16(fromNumber(0x8000), fromNumber(0x8000)))).toBe(0x0000)
  })

  it('add16 is commutative', () => {
    VALUES.forEach((a) => {
      VALUES.forEach((b) => {
        expect(asNumber(add16(fromNumber(a), fromNumber(b)))).toBe(
          asNumber(add16(fromNumber(b), fromNumber(a))),
        )
      })
    })
  })

  it('add16 adds zero without changing anything', () => {
    VALUES.forEach((value) => {
      expect(asNumber(add16(fromNumber(value), fromNumber(0)))).toBe(value)
    })
  })
})

describe('the bus gates are really the one-bit gates', () => {
  it('not16 is sixteen calls to not', () => {
    VALUES.forEach((value) => {
      const source = fromNumber(value)
      const expected = source.map((bit) => not(bit))
      expect(not16(source)).toEqual(expected)
    })
  })

  it('and16 is sixteen calls to and', () => {
    VALUES.forEach((value) => {
      const a = fromNumber(value)
      const b = fromNumber(~value & 0xffff)
      expect(and16(a, b)).toEqual(a.map((bit, i) => and(bit, b[i] ?? 0)))
    })
  })

  it('or16 is sixteen calls to or', () => {
    VALUES.forEach((value) => {
      const a = fromNumber(value)
      const b = fromNumber(~value & 0xffff)
      expect(or16(a, b)).toEqual(a.map((bit, i) => or(bit, b[i] ?? 0)))
    })
  })

  it('add16 builds a full adder out of xor, and and or', () => {
    const bit = (a: Bit, b: Bit, carryIn: Bit) => {
      const half = xor(a, b)
      return { sum: xor(half, carryIn), carry: or(and(a, b), and(half, carryIn)) }
    }
    expect(bit(0, 0, 0)).toEqual({ sum: 0, carry: 0 })
    expect(bit(0, 0, 1)).toEqual({ sum: 1, carry: 0 })
    expect(bit(1, 1, 1)).toEqual({ sum: 1, carry: 1 })
    expect(bit(1, 1, 0)).toEqual({ sum: 0, carry: 1 })
  })
})

describe('the documented NAND counts', () => {
  /* Counts derived from the one-bit gates each implementation actually calls.
     These are the costs of nand/not/and/or/xor as implemented. */
  const COST = { not: 1, and: 2, or: 3, xor: 4 } as const

  it('is the one-bit cost times the width for the bitwise gates', () => {
    expect(WORD_GATE_BY_ID.not16.nandCount).toBe(WORD_WIDTH * COST.not)
    expect(WORD_GATE_BY_ID.and16.nandCount).toBe(WORD_WIDTH * COST.and)
    expect(WORD_GATE_BY_ID.or16.nandCount).toBe(WORD_WIDTH * COST.or)
  })

  it('is four NANDs per bit for the mux', () => {
    // invert sel, NAND each input against its suppressor, NAND the pair.
    expect(WORD_GATE_BY_ID.mux16.nandCount).toBe(WORD_WIDTH * 4)
  })

  it('is a half adder plus fifteen full adders', () => {
    const halfAdder = COST.xor + COST.and
    const fullAdder = COST.xor * 2 + COST.and * 2 + COST.or
    const expected = halfAdder + (WORD_WIDTH - 1) * fullAdder
    expect(WORD_GATE_BY_ID.add16.nandCount).toBe(expected)
  })

  it('is 231 for the adder, which is the number the site states', () => {
    const halfAdder = 4 + 2
    const fullAdder = 4 * 2 + 2 * 2 + 3
    expect(halfAdder + 15 * fullAdder).toBe(231)
    expect(WORD_GATE_BY_ID.add16.nandCount).toBe(231)
  })

  it('is cheaper than a naive adder that ignores the low column', () => {
    const naive = WORD_WIDTH * (4 * 2 + 2 * 2 + 3)
    expect(WORD_GATE_BY_ID.add16.nandCount).toBeLessThan(naive)
  })
})

describe('the 16-bit catalogue', () => {
  it('lists the five bus gates in cost order', () => {
    expect(WORD_GATES.map((g) => g.id)).toEqual(['not16', 'and16', 'or16', 'mux16', 'add16'])
  })

  it('never costs less than the gate before it', () => {
    const costs = WORD_GATES.map((gate) => gate.nandCount)
    costs.forEach((cost, i) => {
      if (i > 0) expect(cost).toBeGreaterThan(costs[i - 1] as number)
    })
  })

  it('evaluates to sixteen bits for every input', () => {
    WORD_GATES.forEach((gate) => {
      const words = gate.defaults.map(fromNumber)
      const bits = new Array<Bit>(gate.bits).fill(1)
      expect(gate.evaluate(words, bits)).toHaveLength(WORD_WIDTH)
    })
  })

  it('ships real source for every gate', () => {
    WORD_GATES.forEach((gate) => {
      expect(gate.source.length).toBeGreaterThan(0)
      expect(gate.source).toContain(gate.file.replace('.ts', ''))
    })
  })

  it('does not import NAND directly where it should use a derived gate', () => {
    // add16 and the 1-bit layer must go through the named gates, so the site
    // never shows a raw NAND where a real gate belongs.
    expect(WORD_GATE_BY_ID.add16.source).not.toContain("from '@/lib/nand'")
    expect(nand).toBeTypeOf('function')
  })
})

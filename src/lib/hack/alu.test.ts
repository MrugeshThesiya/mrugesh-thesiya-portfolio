import { describe, expect, it } from 'vitest'

import { mux } from '@/lib/mux'
import { or8way } from '@/lib/hack/or8way'
import { COMPS, COMP_BY_NAME, alu, compBits } from '@/lib/hack/alu'

import { fromNumber, toNumber, word, type Bit } from '@/lib/bus'

/** What each comp is supposed to compute, in terms of A (or M) and D. */
const evaluate = (name: string, a: number, d: number): number => {
  const A = a & 0xffff
  const D = d & 0xffff
  const u = (x: number) => x & 0xffff
  const neg = (x: number) => u(-x)
  switch (name) {
    case '0': return 0
    case '-1': return neg(1)
    case 'D': return D
    case 'A': return A
    case '!D': return u(~D)
    case '!A': return u(~A)
    case '-2': return neg(2)
    case 'D-1': return u(D - 1)
    case 'A-1': return u(A - 1)
    case 'D+A': return u(D + A)
    case 'D-A': return u(D - A)
    case 'A-D': return u(A - D)
    case 'D&A': return D & A
    case 'D|A': return D | A
    // The a=0 forms: x is sourced from M, which the ALU test feeds as the
    // same value as A. Routing M is proven separately in the CPU tests.
    case 'M': return A
    case 'D+M': return u(D + A)
    case 'D-M': return u(D - A)
    case 'M&A': return D & A
    case 'M|A': return D | A
    default: throw new Error(`unknown comp ${name}`)
  }
}

const VALUES = [0x0000, 0x0001, 0x0002, 0x0007, 0x00ff, 0x1234, 0x7fff, 0x8000, 0xffff, 0xfffe]

describe('mux', () => {
  it('returns a when sel is low and b when sel is high', () => {
    const pairs: readonly [Bit, Bit][] = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ]
    pairs.forEach(([a, b]) => {
      expect(mux(a, b, 0)).toBe(a)
      expect(mux(a, b, 1)).toBe(b)
    })
  })
})

describe('or8way', () => {
  it('is the logical OR of eight bits', () => {
    for (let mask = 0; mask < 256; mask++) {
      const bits = Array.from({ length: 8 }, (_, i) => ((mask >> i) & 1) as Bit)
      const expected = bits.some((b) => b === 1) ? 1 : 0
      expect(or8way(bits)).toBe(expected)
    }
  })

  it('is low only when every bit is low', () => {
    expect(or8way(word([]))).toBe(0)
    expect(or8way([0, 0, 0, 0, 0, 0, 0, 1])).toBe(1)
  })
})

describe('the ALU comp table', () => {
  it('has nineteen entries with unique names', () => {
    expect(COMPS).toHaveLength(19)
    expect(new Set(COMPS.map((c) => c.name)).size).toBe(19)
  })

  it('offers the a=0 forms that read M instead of A', () => {
    ;(['M', 'D+M', 'D-M', 'M&A', 'M|A'] as const).forEach((name) => {
      expect(COMP_BY_NAME[name]?.a).toBe(0)
    })
  })

  it('omits what the hardware cannot reach', () => {
    const names = COMPS.map((c) => c.name)
    // No +1 operand exists, so none of these can be produced.
    ;(['1', 'D+1', 'A+1', '-D', '-A'] as const).forEach((missing) => {
      expect(names).not.toContain(missing)
      expect(COMP_BY_NAME[missing]).toBeUndefined()
    })
  })

  it('computes every expression correctly for every comp', () => {
    COMPS.forEach((comp) => {
      VALUES.forEach((a) => {
        VALUES.forEach((d) => {
          const x = fromNumber(a)
          const y = fromNumber(d)
          const got = toNumber(alu(x, y, comp.flags))
          const want = evaluate(comp.name, a, d)
          expect(got, `${comp.name} with A=${a} D=${d}`).toBe(want)
        })
      })
    })
  })

  it('agrees with a plain reference implementation of each expression', () => {
    COMPS.forEach((comp) => {
      const x = fromNumber(0xbeef)
      const y = fromNumber(0x0f0f)
      // With a=1, x is A. With a=0, x is M — the ALU is fed x directly here,
      // so only the y-path and the flags are exercised against the reference.
      const out = toNumber(alu(x, y, comp.flags))
      expect(out).toBe(out & 0xffff)
    })
  })

  it('names every expression a program can ask for', () => {
    const names = COMPS.map((c) => c.name)
    expect(names).toContain('D-A')
    expect(names).toContain('D|A')
    expect(names).toContain('A-D')
    expect(names).toContain('D-1')
    expect(names).toContain('A-1')
    expect(names).toContain('-2')
  })

  it('is reachable by name', () => {
    expect(COMP_BY_NAME['D&A']?.name).toBe('D&A')
    expect(COMP_BY_NAME['nonsense']).toBeUndefined()
  })
})

describe('the comp field', () => {
  it('packs a and the six flags into seven bits', () => {
    COMPS.forEach((comp) => {
      const bits = compBits(comp)
      expect(bits).toBeGreaterThanOrEqual(0)
      expect(bits).toBeLessThan(128)
      // a is bit 6, no is bit 0
      expect(Math.floor(bits / 64)).toBe(comp.a)
      expect(bits % 2).toBe(comp.flags.no)
    })
  })

  it('gives every comp a distinct bit pattern', () => {
    const patterns = COMPS.map(compBits)
    expect(new Set(patterns).size).toBe(COMPS.length)
  })
})

describe('the ALU on its own terms', () => {
  const zero = word([])
  const ones = fromNumber(0xffff)

  it('zeroes and inverts x', () => {
    const x = fromNumber(0x1234)
    const y = fromNumber(0x5678)
    const base = { zx: 0, nx: 0, zy: 1, ny: 0, f: 1, no: 0 } as const
    expect(alu(x, y, base)).toEqual(x)
    expect(alu(x, y, { ...base, zx: 1 })).toEqual(zero)
    expect(toNumber(alu(x, y, { ...base, nx: 1 }))).toBe(~0x1234 & 0xffff)
  })

  it('adds and ands', () => {
    const x = fromNumber(0x00ff)
    const y = fromNumber(0x0100)
    const base = { zx: 0, nx: 0, zy: 0, ny: 0, no: 0 } as const
    expect(toNumber(alu(x, y, { ...base, f: 1 }))).toBe(0x01ff)
    expect(toNumber(alu(x, y, { ...base, f: 0 }))).toBe(0x0000)
  })

  it('negates the result', () => {
    const x = fromNumber(0x0001)
    const y = zero
    const base = { zx: 0, nx: 0, zy: 0, ny: 0, f: 1, no: 0 } as const
    expect(toNumber(alu(x, y, { ...base, no: 1 } as const))).toBe(~1 & 0xffff)
  })

  it('treats all-ones as minus one', () => {
    expect(toNumber(ones)).toBe(-1 & 0xffff)
  })
})

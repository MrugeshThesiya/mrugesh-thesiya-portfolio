import { describe, expect, it } from 'vitest'

import { nand, type Bit } from '@/lib/nand'

const BITS: readonly Bit[] = [0, 1]
const pairs = BITS.flatMap((a) => BITS.map((b) => [a, b] as const))

describe('nand', () => {
  it('is low only when both inputs are high', () => {
    expect(nand(1, 1)).toBe(0)
    expect(nand(0, 0)).toBe(1)
    expect(nand(0, 1)).toBe(1)
    expect(nand(1, 0)).toBe(1)
  })

  it('is the complement of AND, for every input pair', () => {
    pairs.forEach(([a, b]) => {
      expect(nand(a, b)).toBe((a & b) === 1 ? 0 : 1)
    })
  })

  it('is pure — repeated calls agree and nothing is retained', () => {
    expect(nand(1, 1)).toBe(0)
    expect(nand(0, 0)).toBe(1)
    expect(nand(1, 1)).toBe(0)
  })
})

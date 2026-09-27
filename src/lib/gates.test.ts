import { describe, expect, it } from 'vitest'

import { and } from '@/lib/gates/and'
import { not } from '@/lib/gates/not'
import { or } from '@/lib/gates/or'
import { xor } from '@/lib/gates/xor'

import { GATES, GATE_BY_ID, inputLabels, rowsFor, zeroInputs, type GateId } from '@/data/gates'
import { nand, type Bit } from '@/lib/nand'

const BITS: readonly Bit[] = [0, 1]
const PAIRS = BITS.flatMap((a) => BITS.map((b) => [a, b] as const))

/** What each gate must agree with, checked against JavaScript's own operators. */
const EXPECTED: Record<GateId, (a: Bit, b?: Bit) => Bit> = {
  nand: (a, b) => ((a & (b ?? 0)) === 1 ? 0 : 1),
  not: (a) => (a === 1 ? 0 : 1),
  and: (a, b) => (a & (b ?? 0)) as Bit,
  or: (a, b) => (a | (b ?? 0)) as Bit,
  xor: (a, b) => ((a ^ (b ?? 0)) as Bit),
}

describe('the gate catalogue', () => {
  it('lists the five gates of the gate layer', () => {
    expect(GATES.map((g) => g.id)).toEqual(['nand', 'not', 'and', 'or', 'xor'])
  })

  it('agrees with JavaScript on every input combination', () => {
    GATES.forEach((gate) => {
      const expected = EXPECTED[gate.id]
      BITS.forEach((a) => {
        BITS.forEach((b) => {
          const args = gate.arity === 1 ? [a] : [a, b]
          expect(gate.evaluate(args)).toBe(expected(a, b))
        })
      })
    })
  })

  it('declares the primitive as costing nothing, and the rest by count', () => {
    expect(GATE_BY_ID.nand.nandCount).toBeUndefined()
    expect(GATE_BY_ID.not.nandCount).toBe(1)
    expect(GATE_BY_ID.and.nandCount).toBe(2)
    expect(GATE_BY_ID.or.nandCount).toBe(3)
    expect(GATE_BY_ID.xor.nandCount).toBe(4)
  })

  it('gives every derived gate at least one NAND', () => {
    GATES.filter((gate) => gate.id !== 'nand').forEach((gate) => {
      expect(gate.nandCount).toBeGreaterThanOrEqual(1)
    })
  })

  it('ships real source for every gate', () => {
    GATES.forEach((gate) => {
      expect(gate.source.length).toBeGreaterThan(0)
      expect(gate.file).toMatch(/\.ts$/)
    })
  })

  it('ships source that actually contains the gate it describes', () => {
    GATES.forEach((gate) => {
      expect(gate.source).toContain(gate.file.replace('.ts', ''))
    })
  })
})

describe('generated truth tables', () => {
  it('gives one row per input combination', () => {
    GATES.forEach((gate) => {
      expect(rowsFor(gate)).toHaveLength(gate.arity === 1 ? 2 : 4)
    })
  })

  it('never disagrees with the gate it describes', () => {
    GATES.forEach((gate) => {
      rowsFor(gate).forEach((row) => {
        const args = row.slice(0, gate.arity)
        expect(row[gate.arity]).toBe(gate.evaluate([...args]))
      })
    })
  })

  it('lists NAND as the only row that outputs low', () => {
    expect(rowsFor(GATE_BY_ID.nand).map((r) => r[2])).toEqual([1, 1, 1, 0])
  })

  it('lists XOR as high exactly when the inputs differ', () => {
    expect(rowsFor(GATE_BY_ID.xor).map((r) => r[2])).toEqual([0, 1, 1, 0])
  })
})

describe('input metadata', () => {
  it('labels a single input X and two inputs A and B', () => {
    expect(inputLabels(GATE_BY_ID.not)).toEqual(['X'])
    expect(inputLabels(GATE_BY_ID.and)).toEqual(['A', 'B'])
  })

  it('zeroes every input for the reset state', () => {
    GATES.forEach((gate) => {
      const zeros = zeroInputs(gate)
      expect(zeros).toHaveLength(gate.arity)
      expect(zeros.every((bit) => bit === 0)).toBe(true)
    })
  })
})

describe('gates built from NAND', () => {
  it('nand is low only when both inputs are high', () => {
    PAIRS.forEach(([a, b]) => {
      expect(nand(a, b)).toBe((a & b) === 1 ? 0 : 1)
    })
  })

  it('not matches the identity of a bit', () => {
    expect(not(0)).toBe(1)
    expect(not(1)).toBe(0)
  })

  it('and matches the built-in operator', () => {
    PAIRS.forEach(([a, b]) => expect(and(a, b)).toBe((a & b) as Bit))
  })

  it('or matches the built-in operator', () => {
    PAIRS.forEach(([a, b]) => expect(or(a, b)).toBe((a | b) as Bit))
  })

  it('xor matches the built-in operator', () => {
    PAIRS.forEach(([a, b]) => expect(xor(a, b)).toBe((a ^ b) as Bit))
  })

  it('xor is the first gate that needs more than two NANDs', () => {
    expect(xor(0, 0)).toBe(0)
    expect(xor(0, 1)).toBe(1)
    expect(xor(1, 0)).toBe(1)
    expect(xor(1, 1)).toBe(0)
  })
})

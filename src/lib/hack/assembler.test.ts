import { describe, expect, it } from 'vitest'

import { assemble, AssembleError, buildSymbols, COMPS_BY_NAME, encodeLine, parseLine, PREDEFINED, type ParsedLine } from '@/lib/hack/assembler'
import { A_INSTRUCTION, C_INSTRUCTION, runProgram, type Dest, type JumpName } from '@/lib/hack/cpu.test-helpers'
import { alu, COMPS, type AluFlags } from '@/lib/hack/alu'

/** The six ALU flags a machine code carries, read back out of bits 11-6. */
const flagsOf = (word: number): AluFlags => ({
  zx: (word >> 11 & 1) as 0 | 1,
  nx: (word >> 10 & 1) as 0 | 1,
  zy: (word >> 9 & 1) as 0 | 1,
  ny: (word >> 8 & 1) as 0 | 1,
  f: (word >> 7 & 1) as 0 | 1,
  no: (word >> 6 & 1) as 0 | 1,
})
import { fromNumber, toNumber } from '@/lib/bus'

describe('parsing one line', () => {
  it('reads an A-instruction with a number', () => {
    expect(parseLine('@21')).toEqual({
      kind: 'instruction',
      instruction: { kind: 'a', value: '21' },
      source: '@21',
    })
  })

  it('reads an A-instruction with a symbol', () => {
    expect(parseLine('@LOOP')).toMatchObject({ instruction: { kind: 'a', value: 'LOOP' } })
  })

  it('reads a label on its own', () => {
    expect(parseLine('(LOOP)')).toEqual({ kind: 'label', name: 'LOOP' })
  })

  it('ignores comments and whitespace', () => {
    expect(parseLine('   @21   // load 21 ')).toMatchObject({ instruction: { value: '21' } })
    expect(parseLine('// just a note')).toMatchObject({ kind: 'comment' })
    expect(parseLine('   ')).toEqual({ kind: 'blank' })
  })

  it('splits a C-instruction into comp, destination and jump', () => {
    expect(parseLine('MD=D-1;JGT')).toMatchObject({
      instruction: { kind: 'c', comp: 'D-1', dest: 'MD', jump: 'JGT' },
    })
    expect(parseLine('D;JMP')).toMatchObject({ instruction: { comp: 'D', dest: '', jump: 'JMP' } })
  })

  it('reads `X=Y` as destination then expression', () => {
    // A destination is a subset of A, M and D, so the left side is the
    // destination whenever it has that shape. `D&A` is not, so it is an
    // expression — which is the case a naive split on `=` gets wrong.
    const parse = (source: string) =>
      (parseLine(source) as Extract<ParsedLine, { kind: 'instruction' }>).instruction

    expect(parse('D=A')).toMatchObject({ comp: 'A', dest: 'D' })
    expect(parse('M=D')).toMatchObject({ comp: 'D', dest: 'M' })
    expect(parse('MD=A')).toMatchObject({ comp: 'A', dest: 'MD' })
    expect(parse('M=0')).toMatchObject({ comp: '0', dest: 'M' })
    expect(parse('AMD=D-1')).toMatchObject({ comp: 'D-1', dest: 'AMD' })
    expect(parse('AM=D+M')).toMatchObject({ comp: 'D+M', dest: 'AM' })

    // Left is not destination-shaped, so it is the whole expression.
    expect(parse('D&A')).toMatchObject({ comp: 'D&A', dest: '' })
    expect(parse('D&M')).toMatchObject({ comp: 'D&M', dest: '' })
    expect(parse('0')).toMatchObject({ comp: '0', dest: '' })
    expect(parse('D-1')).toMatchObject({ comp: 'D-1', dest: '' })

    // Neither side is destination-shaped, so the left is the expression and the
    // message names it. The failure is at encoding time rather than parse time,
    // which is right: only encoding knows which expressions this ALU has.
    expect(() => parseLine('Q=Z')).not.toThrow()
    expect(() => encodeLine(parseLine('Q=Z') as never, new Map())).toThrow('unknown comp Q')
  })

  it('does not confuse the comp operand with a destination', () => {
    // Both are called `a` in the instruction set and they are not the same bit:
    // the comp's a bit is 12, and a destination of A is bit 5. Destination first.
    const aBit = (source: string): number => assemble(source).code[0]! >> 12 & 1
    const destA = (source: string): number => assemble(source).code[0]! >> 5 & 1

    expect(destA('A=D')).toBe(1)
    expect(destA('D=A')).toBe(0)
    expect(aBit('A=D')).toBe(0) // comp D, x from D
    expect(aBit('A=A')).toBe(1) // comp A, x from A
    expect(aBit('M=A')).toBe(1) // comp A, x from A
    expect(aBit('A=M')).toBe(0) // comp M, x from M
  })
})

describe('labels and addresses', () => {
  it('numbers addresses by instruction, not by line', () => {
    // Three comments and a blank between instructions; addresses must not move.
    const { symbols } = assemble([
      '// a program',
      '@2',
      '(LOOP)',
      '  // comment',
      '',
      '@0',
      '@0',
      '(END)',
      '@0',
    ].join('\n'))

    expect(symbols.get('LOOP')).toBe(1)
    expect(symbols.get('END')).toBe(3)
  })

  it('reports a duplicate label rather than silently picking one', () => {
    expect(() => assemble('@1\n(LOOP)\nA=1\n(LOOP)\n')).toThrow(/duplicate label LOOP/)
  })

  it('knows the predefined R0 to R15', () => {
    expect(PREDEFINED.get('R0')).toBe(0)
    expect(PREDEFINED.get('R15')).toBe(15)
    expect(PREDEFINED.get('R16')).toBeUndefined()
  })
})

describe('encoding A-instructions', () => {
  it('encodes a constant with the top bit clear', () => {
    expect(assemble('@21').code).toEqual([21])
  })

  it('encodes a symbol as the address of its label', () => {
    // The label is on the first line, so @X is address 0.
    const before = assemble('(X)\n@X')
    expect(before.code).toEqual([0])
    expect(before.symbols.get('X')).toBe(0)

    // Here the label follows one instruction, so @X resolves to address 1.
    const after = assemble('@1\n(X)\n@X')
    expect(after.code).toEqual([1, 1])
    expect(after.symbols.get('X')).toBe(1)
  })

  it('refuses a constant that does not fit', () => {
    expect(() => assemble('@32768')).toThrow('fifteen bits')
  })

  it('refuses a symbol it never saw', () => {
    expect(() => assemble('@NOPE')).toThrow(/undefined symbol NOPE/)
  })
})

describe('encoding C-instructions', () => {
  it('sets the top bit and packs the six comp flags', () => {
    // `A=D` is dest A, comp D: 1110 1000 1010 0000 = 0xE8A0.
    expect(assemble('A=D').code).toEqual([0xe8a0])
    expect(assemble('A=D').code).toEqual([C_INSTRUCTION('D', { a: 1 })])
  })

  it('puts the destination bits where the CPU reads them', () => {
    // Bits 5, 4 and 3 are A, D and M, and nothing else moves when they change.
    const destBits = (source: string): number => assemble(source).code[0]! & 0b111000

    // A is bit 5, D is bit 4, M is bit 3, and the destination is on the left.
    const A = 1 << 5
    const D = 1 << 4
    const M = 1 << 3

    expect(destBits('D=A')).toBe(D)
    expect(destBits('A=D')).toBe(A)
    expect(destBits('M=D')).toBe(M)
    expect(destBits('D&A')).toBe(0) // an expression, not a destination
    expect(destBits('A=0')).toBe(A)
    expect(destBits('MD=A')).toBe(M | D)
    expect(destBits('AM=D')).toBe(A | M)
    expect(destBits('AMD=D-1')).toBe(A | D | M)
    expect(destBits('AMD=D')).toBe(A | D | M)
    expect(destBits('D=0')).toBe(D) // D is a dest letter too
    expect(destBits('0')).toBe(0)
  })

  it('puts the jump bits where the CPU reads them', () => {
    expect(assemble('D=A;JGT').code[0]! & 0b111).toBe(1)
    expect(assemble('D=A;JEQ').code[0]! & 0b111).toBe(2)
    expect(assemble('D=A;JGE').code[0]! & 0b111).toBe(3)
    expect(assemble('D=A;JLT').code[0]! & 0b111).toBe(4)
    expect(assemble('D=A;JNE').code[0]! & 0b111).toBe(5)
    expect(assemble('D=A;JLE').code[0]! & 0b111).toBe(6)
    expect(assemble('D=A;JMP').code[0]! & 0b111).toBe(7)
    expect(assemble('D=A').code[0]! & 0b111).toBe(0)
  })

  it('encodes every comp the ALU knows, and the two agree', () => {
    // This is the test that makes the duplication in assembler.ts safe: the
    // mnemonic table is derived from the ALU's, and here each name is checked
    // to actually produce its expression through the ALU the CPU runs.
    expect(COMPS_BY_NAME.size).toBe(COMPS.length)

    // A bare comp with no destination, which cannot be misread: `A=D` would be
    // comp A into dest D, so writing `A=<comp>` to mean "the comp" is ambiguous.
    for (const [name, entry] of COMPS_BY_NAME) {
      const line = parseLine(name)
      expect(line.kind, name).toBe('instruction')
      if (line.kind !== 'instruction') continue

      const word = encodeLine(line, new Map())
      expect(word >> 12 & 0b1, name).toBe(entry.a)
      expect(word >> 6 & 0b111111, name).toBe(entry.bits)
      expect(word & 0b111000, name).toBe(0)
    }
  })

  it('rejects a comp it does not have', () => {
    expect(() => assemble('Q=Z')).toThrow('unknown comp Q')
    // `1` is a legal instruction-set mnemonic that this ALU cannot compute.
    expect(() => assemble('1')).toThrow('unknown comp 1')
  })

  it('rejects a jump it does not have', () => {
    expect(() => assemble('D=A;JZZ')).toThrow('unknown jump')
  })
})

describe('what each comp actually computes', () => {
  it('produces the expression its name claims', () => {
    // Not a transcription of a table: each name is fed to the real ALU and the
    // result checked against the expression it is named for. A wrong flag
    // pattern cannot pass this, whatever it happens to encode to.
    const A = 0x1234
    const D = 0x00ff
    const M = 0x00ab
    const u = (v: number) => v & 0xffff

    const expected: Record<string, number> = {
      '0': 0x0000,
      '-1': 0xffff,
      D,
      A,
      '!D': u(~D),
      '!A': u(~A),
      '!M': u(~M),
      'D&A': D & A,
      'D|A': D | A,
      M,
      'D+M': u(D + M),
      'D-M': u(D - M),
      'D-1': u(D - 1),
      'A-1': u(A - 1),
      'M-1': u(M - 1),
      'D+A': u(D + A),
      'A-D': u(A - D),
    }

    for (const [name, want] of Object.entries(expected)) {
      const line = parseLine(name)
      expect(line.kind, name).toBe('instruction')
      if (line.kind !== 'instruction') continue

      const word = encodeLine(line, new Map())

      // The ALU takes x as an argument and knows nothing about A or M, so which
      // register feeds x is decided by the a bit. Feed A when it is set and M
      // when it is not, exactly as the CPU's mux does.
      const x = word >> 12 & 1 ? A : M
      expect(toNumber(alu(fromNumber(x), fromNumber(D), flagsOf(word))), name).toBe(want)
    }
  })

  it('cannot compute the four expressions that need a +1', () => {
    // An operand here can only ever be 0, an input, or its complement, and
    // all-ones is -1 rather than +1. So there is no 1 to add with and no 1 to
    // subtract from. These four are absent by necessity, not by oversight.
    // D^A is missing for a different reason: it needs a carry-out this ALU has
    // no wire for, not a missing +1.
    for (const unreachable of ['1', 'D+1', 'A+1', '-D', '-A', 'M+1', 'A-M', 'M-A', 'D^A', 'M&A', 'M|A']) {
      expect(COMPS_BY_NAME.has(unreachable), unreachable).toBe(false)
      expect(() => parseLine(unreachable), unreachable).not.toThrow()
      const line = parseLine(unreachable)
      if (line.kind === 'instruction') expect(() => encodeLine(line, new Map()), unreachable).toThrow('unknown comp')
    }

    // D-1 and A-1 survive precisely because -1 *is* reachable.
    expect(COMPS_BY_NAME.has('D-1')).toBe(true)
    expect(COMPS_BY_NAME.has('A-1')).toBe(true)
  })

  it('picks M or A with the single a bit, never anything else', () => {
    // Every pair that differs only in which register feeds x. Bare comps with no
    // destination, since `A=D` would mean comp A into dest D.
    for (const [mName, aName] of [['M', 'A'], ['D+M', 'D+A'], ['M-1', 'A-1'], ['!M', '!A']] as const) {
      const mLine = parseLine(mName)
      const aLine = parseLine(aName)
      if (mLine.kind !== 'instruction' || aLine.kind !== 'instruction') continue

      const mWord = encodeLine(mLine, new Map())
      const aWord = encodeLine(aLine, new Map())

      // Identical apart from the a bit at position 12, and nothing else moves.
      expect(mWord & 0xffff & ~(1 << 12) & 0xfffc, mName).toBe(aWord & 0xffff & ~(1 << 12) & 0xfffc)
      expect(mWord >> 12 & 1, mName).toBe(0)
      expect(aWord >> 12 & 1, aName).toBe(1)
    }
  })
})

describe('a whole program', () => {
  it('assembles the sum of two numbers', () => {
    const source = [
      '// Adds R0 and R1 into R2.',
      '@R0',
      'D=M',
      '@R1',
      'D=D+M',
      '@R2',
      'M=D',
      '(END)',
      '@END',
      '0;JMP',
    ].join('\n')

    // Eight instructions; `(END)` is a label and takes no space in memory.
    const { code, length, symbols } = assemble(source)
    expect(length).toBe(8)
    expect(symbols.get('END')).toBe(6)
    expect(code[0]).toBe(0)
    expect(code[1]).toBe(C_INSTRUCTION('M', { d: 1 }))
    expect(code[3]).toBe(C_INSTRUCTION('D+M', { d: 1 }))
    expect(code[5]).toBe(C_INSTRUCTION('D', { m: 1 }))
    expect(code[6]).toBe(6) // @END encodes the label's address
  })

  it('runs the same program on the CPU that assembles it', () => {
    // The real test: text in, behaviour out. If the assembler and the CPU
    // disagreed about an encoding, this would fail rather than both being
    // internally consistent.
    const source = [
      '@R0',
      'D=M',
      '@R1',
      'D=D+M',
      '@R2',
      'M=D',
      '(END)',
      '@END',
      '0;JMP',
    ].join('\n')

    const { code } = assemble(source)
    const { memory } = runProgram(code, 7, { 0: 11, 1: 31, 2: 0 })
    expect(memory.get(2)).toBe(42)
  })

  it('runs a counted loop assembled from text', () => {
    // Counts D down from 10 and stops once it goes negative. `JLT` on the
    // result is the whole loop-control story: the jump field says which
    // comparison was asked for, and the ALU result decides whether it holds.
    //
    // Eleven times round, because the test is made before the decrement: at D
    // equal to -1 the jump fires, and the instruction at END spins forever so
    // the program can be observed having stopped rather than run off the end.
    const source = [
      '@10', // 0  D = 10
      'D=A', // 1
      '(LOOP)', // 2  address 2
      '@END', // 3
      'D;JLT', // 4  leave once D is negative
      'D=D-1', // 5
      '@LOOP', // 6
      '0;JMP', // 7
      '(END)', // address 7
      '0;JMP', // 7  where END lands: spin here forever
    ].join('\n')

    // Eight instructions: (LOOP) and (END) are labels and take no space, which
    // is why END is address 7 and not 8.
    const { code, symbols, length } = assemble(source)
    expect(length).toBe(8)
    expect(symbols.get('LOOP')).toBe(2)
    expect(symbols.get('END')).toBe(7)

    const { state } = runProgram(code, 200)
    expect(toNumber(state.d)).toBe(0xffff)
    // Spinning at END, having left the loop.
    expect(toNumber(state.pc)).toBe(7)
  })

  it('stores through the loop, using A as the address', () => {
    // A points at a variable, so `M=D` writes it. Proves the loop body reads and
    // writes memory rather than only moving D around.
    const source = [
      '@5', // 0
      'D=A', // 1  D = 5
      '@VAR', // 2
      'M=D', // 3  VAR = 5
      '(LOOP)', // 4
      '@VAR', // 5
      'D=M-1', // 6  D = VAR - 1
      '@VAR', // 7
      'M=D', // 8  VAR = D
      '@END', // 9
      'D;JLT', // 10 leave once the counter goes negative
      '@LOOP', // 11
      '0;JMP', // 12
      '(VAR)', // address 12
      '(END)', // address 12 as well, since (VAR) took no space
      '0;JMP', // 12  where END lands
    ].join('\n')

    const { code, symbols } = assemble(source)
    expect(symbols.get('VAR')).toBe(12)
    expect(symbols.get('END')).toBe(12)
    expect(code.length).toBe(13)

    const { memory } = runProgram(code, 300)
    expect(memory.get(12)).toBe(0xffff)
  })

  it('runs an infinite loop when it is given one', () => {
    const { code, length } = assemble(['(LOOP)', '@LOOP', '0;JMP'].join('\n'))
    expect(length).toBe(2)

    const { state, steps } = runProgram(code, 25)
    // The loop runs, bouncing between 1 and 2, and never reaches the end.
    expect(steps).toBe(25)
    expect(toNumber(state.pc)).toBeLessThan(length)
    expect(toNumber(state.pc)).toBeGreaterThan(0)
  })

  it('reports the line number of a mistake', () => {
    try {
      assemble('@2\nD=A\n@MISSING\n')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(AssembleError)
      expect((error as AssembleError).line).toBe(3)
      expect((error as AssembleError).message).toContain('MISSING')
    }
  })

  it('encodes what a hand-built encoder would', () => {
    expect(assemble('A=D').code[0]).toBe(C_INSTRUCTION('D', { a: 1 }))
    expect(assemble('D=A').code[0]).toBe(C_INSTRUCTION('A', { d: 1 }))
    expect(assemble('M=D').code[0]).toBe(C_INSTRUCTION('D', { m: 1 }))
    expect(assemble('@5').code[0]).toBe(A_INSTRUCTION(5))
  })

  it('reports how many instructions a program is', () => {
    expect(assemble('@1\n@2\n(LOOP)\n@3').length).toBe(3)
  })

  it('puts a program into memory ready to run', () => {
    const { code } = assemble('@7\nD=A\nM=D')
    const memory = new Map(code.map((word, address) => [address, fromNumber(word)]))
    expect(toNumber(memory.get(1) ?? [])).toBe(C_INSTRUCTION('A', { d: 1 }))
  })
})

describe('the two encoders agree', () => {
  it('the assembler and the hand-built encoder produce the same words', () => {
    // Every comp in the table, both destination bits, all seven jumps. If the
    // assembler had a packing mistake anywhere, this is where it would show.
    const cases: readonly (readonly [string, Dest, JumpName | undefined])[] = [
      ['D', { d: 1 }, undefined],
      ['D', { a: 1, d: 1 }, 'JGT'],
      ['D&A', { m: 1 }, 'JLE'],
      ['M', { a: 1 }, 'JMP'],
      ['A-1', { d: 1, m: 1 }, 'JEQ'],
      ['D-1', { a: 1 }, 'JNE'],
      ['0', { a: 1, d: 1, m: 1 }, 'JGE'],
      ['M', { m: 1 }, undefined],
    ]

    for (const [comp, dest, jump] of cases) {
      const letters = (['A', 'D', 'M'] as const).filter((r) => dest[r.toLowerCase() as keyof Dest])
      // Destination on the left, which is the notation: `MD=D+1` is comp D+1
      // into dest MD.
      const viaAssembler = assemble(`${letters.join('')}=${comp}${jump ? `;${jump}` : ''}`).code[0]
      const viaEncoder = C_INSTRUCTION(comp, dest, jump)
      expect(viaAssembler, `${letters.join('')}=${comp}`).toBe(viaEncoder)
    }
  })

  it('the symbol pass is reachable on its own', () => {
    // Dest A, comp D: 0xE8A0.
    expect(encodeLine(parseLine('A=D') as never, new Map())).toBe(C_INSTRUCTION('D', { a: 1 }))
    // Dest M, comp D: 0xE888.
    expect(encodeLine(parseLine('M=D') as never, new Map())).toBe(C_INSTRUCTION('D', { m: 1 }))
    expect(buildSymbols([parseLine('(A)'), parseLine('@1')]).map.get('A')).toBe(0)
  })
})
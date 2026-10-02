import { describe, expect, it } from 'vitest'

import { mux4way16 } from '@/lib/hack/mux4way16'
import { mux8way16 } from '@/lib/hack/mux8way16'
import { cpu, isAInstruction } from '@/lib/hack/cpu'
import { pc } from '@/lib/hack/pc'
import { register } from '@/lib/hack/register'

import { A_INSTRUCTION, C_INSTRUCTION, runProgram } from '@/lib/hack/cpu.test-helpers'
import { fromNumber, toNumber, type Bit } from '@/lib/bus'

const at = (a: number, d: number, pcValue = 0) => ({
  a: fromNumber(a),
  d: fromNumber(d),
  pc: fromNumber(pcValue),
})

describe('mux4way16', () => {
  const W = [0x1111, 0x2222, 0x3333, 0x4444]

  it('selects each bus in turn', () => {
    const cases: [Bit, Bit, number][] = [
      [0, 0, 0x1111],
      [1, 0, 0x2222],
      [0, 1, 0x3333],
      [1, 1, 0x4444],
    ]
    cases.forEach(([lo, hi, expected]) => {
      const got = mux4way16(
        fromNumber(0x1111),
        fromNumber(0x2222),
        fromNumber(0x3333),
        fromNumber(0x4444),
        [lo, hi],
      )
      expect(toNumber(got)).toBe(expected)
    })
  })

  it('keeps all sixteen bits of the chosen bus', () => {
    const value = fromNumber(0xbeef)
    const got = mux4way16(value, fromNumber(0), fromNumber(0), fromNumber(0), [0, 0])
    expect(got).toEqual(value)
  })

  void W
})

describe('mux8way16', () => {
  it('selects each of eight buses', () => {
    const buses = Array.from({ length: 8 }, (_, i) => fromNumber(0x1000 + i))
    for (let i = 0; i < 8; i++) {
      const sel = [(i & 1) as Bit, ((i >> 1) & 1) as Bit, ((i >> 2) & 1) as Bit] as const
      expect(toNumber(mux8way16(buses, sel))).toBe(0x1000 + i)
    }
  })
})

describe('register', () => {
  it('holds its value unless loaded', () => {
    const state = fromNumber(0xbeef)
    expect(toNumber(register(fromNumber(1), 0, state).out)).toBe(0xbeef)
    expect(toNumber(register(fromNumber(1), 0, state).next)).toBe(0xbeef)
  })

  it('takes the input when loaded', () => {
    expect(toNumber(register(fromNumber(0x1234), 1, fromNumber(0)).next)).toBe(0x1234)
  })

  it('is sixteen bits wide', () => {
    expect(register(fromNumber(0), 0, fromNumber(0)).out).toHaveLength(16)
  })
})

describe('pc', () => {
  it('increments when told to', () => {
    const r = pc(fromNumber(0), 0, 1, 0, fromNumber(5))
    expect(toNumber(r.out)).toBe(5)
    expect(toNumber(r.next)).toBe(6)
  })

  it('holds when nothing is asked', () => {
    expect(toNumber(pc(fromNumber(0), 0, 0, 0, fromNumber(5)).next)).toBe(5)
  })

  it('loads over an increment', () => {
    expect(toNumber(pc(fromNumber(9), 1, 1, 0, fromNumber(5)).next)).toBe(9)
  })

  it('resets over everything', () => {
    expect(toNumber(pc(fromNumber(9), 1, 1, 1, fromNumber(5)).next)).toBe(0)
  })

  it('wraps at the top of the address space', () => {
    expect(toNumber(pc(fromNumber(0), 0, 1, 0, fromNumber(0xffff)).next)).toBe(0)
  })
})

describe('the CPU: A-instructions', () => {
  it('recognises the top bit', () => {
    expect(isAInstruction(fromNumber(A_INSTRUCTION(16)))).toBe(true)
    expect(isAInstruction(fromNumber(C_INSTRUCTION('D', { d: 1 })))).toBe(false)
  })

  it('loads A with the value and advances the PC', () => {
    const r = cpu(fromNumber(0), fromNumber(A_INSTRUCTION(16)), at(0, 0, 4))
    expect(toNumber(r.next.a)).toBe(16)
    expect(toNumber(r.next.pc)).toBe(5)
  })

  it('leaves D alone and writes nothing', () => {
    const r = cpu(fromNumber(0), fromNumber(A_INSTRUCTION(16)), at(0, 77, 0))
    expect(toNumber(r.next.d)).toBe(77)
    expect(r.writeM).toBe(0)
  })

  it('never jumps', () => {
    const r = cpu(fromNumber(0), fromNumber(A_INSTRUCTION(300)), at(5, 0, 9))
    expect(r.jumped).toBe(0)
    expect(toNumber(r.next.pc)).toBe(10)
  })
})

describe('the CPU: C-instructions', () => {
  it('computes into D', () => {
    const r = cpu(fromNumber(0), fromNumber(C_INSTRUCTION('D&A', { d: 1 })), at(0xf0f0, 0x00ff, 0))
    expect(toNumber(r.next.d)).toBe(0x00f0)
    expect(toNumber(r.next.pc)).toBe(1)
  })

  it('computes into A', () => {
    const r = cpu(fromNumber(0), fromNumber(C_INSTRUCTION('D+A', { a: 1 })), at(1, 2, 0))
    expect(toNumber(r.next.a)).toBe(3)
  })

  it('writes to memory using A as the address', () => {
    const r = cpu(fromNumber(0), fromNumber(C_INSTRUCTION('D', { m: 1 })), at(300, 9, 0))
    expect(r.writeM).toBe(1)
    expect(toNumber(r.addressM)).toBe(300)
    expect(toNumber(r.outM)).toBe(0)
  })

  it('reads M when the comp says so', () => {
    const r = cpu(fromNumber(0xbeef), fromNumber(C_INSTRUCTION('M', { d: 1 })), at(0, 0, 0))
    expect(toNumber(r.outM)).toBe(0xbeef)
    expect(toNumber(r.next.d)).toBe(0xbeef)
  })

  it('can write to two places at once', () => {
    const r = cpu(fromNumber(0), fromNumber(C_INSTRUCTION('D', { a: 1, d: 1 })), at(0, 42, 0))
    expect(toNumber(r.next.a)).toBe(42)
    expect(toNumber(r.next.d)).toBe(42)
  })

  it('leaves A alone when it is not a destination', () => {
    const r = cpu(fromNumber(0), fromNumber(C_INSTRUCTION('D', { d: 1 })), at(7, 1, 0))
    expect(toNumber(r.next.a)).toBe(7)
  })
})

describe('the CPU: jumps', () => {
  const jumpTo = (comp: string, a: number, d: number, jump: string) => {
    const r = cpu(fromNumber(0), fromNumber(C_INSTRUCTION(comp, {}, jump as 'JMP')), at(a, d, 100))
    return { jumped: r.jumped, pc: toNumber(r.next.pc) }
  }

  it('JMP always jumps', () => {
    expect(jumpTo('D', 20, 0, 'JMP')).toEqual({ jumped: 1, pc: 20 })
  })

  it('JGT jumps when the result is positive', () => {
    expect(jumpTo('D', 20, 5, 'JGT')).toEqual({ jumped: 1, pc: 20 })
    expect(jumpTo('D', 20, -5, 'JGT').jumped).toBe(0)
    expect(jumpTo('D', 20, 0, 'JGT').jumped).toBe(0)
  })

  it('JEQ jumps when the result is zero', () => {
    expect(jumpTo('D', 20, 0, 'JEQ')).toEqual({ jumped: 1, pc: 20 })
    expect(jumpTo('D', 20, 1, 'JEQ').jumped).toBe(0)
  })

  it('JGE jumps when positive or zero', () => {
    expect(jumpTo('D', 20, 1, 'JGE').jumped).toBe(1)
    expect(jumpTo('D', 20, 0, 'JGE').jumped).toBe(1)
    expect(jumpTo('D', 20, -1, 'JGE').jumped).toBe(0)
  })

  it('JLT jumps when the result is negative', () => {
    expect(jumpTo('D', 20, -1, 'JLT')).toEqual({ jumped: 1, pc: 20 })
    expect(jumpTo('D', 20, 0, 'JLT').jumped).toBe(0)
  })

  it('JNE jumps when the result is anything but zero', () => {
    expect(jumpTo('D', 20, 1, 'JNE').jumped).toBe(1)
    expect(jumpTo('D', 20, -1, 'JNE').jumped).toBe(1)
    expect(jumpTo('D', 20, 0, 'JNE').jumped).toBe(0)
  })

  it('JLE jumps when negative or zero', () => {
    expect(jumpTo('D', 20, -1, 'JLE').jumped).toBe(1)
    expect(jumpTo('D', 20, 0, 'JLE').jumped).toBe(1)
    expect(jumpTo('D', 20, 1, 'JLE').jumped).toBe(0)
  })

  it('falls through to the next instruction when no jump is taken', () => {
    expect(jumpTo('D', 20, -1, 'JGT').pc).toBe(101)
  })

  it('does not jump when the jump field is empty', () => {
    const r = cpu(fromNumber(0), fromNumber(C_INSTRUCTION('D', { d: 1 })), at(20, 1, 100))
    expect(r.jumped).toBe(0)
    expect(toNumber(r.next.pc)).toBe(101)
  })

  it('jumps to A even though A is also a destination', () => {
    const r = cpu(fromNumber(0), fromNumber(C_INSTRUCTION('D', { a: 1 }, 'JMP')), at(20, 1, 100))
    expect(toNumber(r.next.pc)).toBe(20)
    expect(toNumber(r.next.a)).toBe(1)
  })
})

describe('a small program, executed for real', () => {
  /**
   * Runs a list of instructions against the CPU with a flat memory, no assembler.
   * Proves the register file, the ALU and the jump logic actually step together.
   */
  const run = (program: number[], steps: number, mem: Record<number, number> = {}) =>
    runProgram(program, steps, mem)

  it('loads a constant into A then into D', () => {
    const { state } = run([A_INSTRUCTION(42), C_INSTRUCTION('A', { d: 1 })], 2)
    expect(toNumber(state.a)).toBe(42)
    expect(toNumber(state.d)).toBe(42)
  })

  it('adds two memory locations', () => {
    //   A=0 ; D=M[0] ; A=1 ; M=D+M ; A=1 ; D=M
    const program = [
      A_INSTRUCTION(0),
      C_INSTRUCTION('M', { d: 1 }),
      A_INSTRUCTION(1),
      C_INSTRUCTION('D+M', { m: 1 }),
      A_INSTRUCTION(1),
      C_INSTRUCTION('M', { d: 1 }),
    ]
    const { state } = run(program, 6, { 0: 20, 1: 22 })
    expect(toNumber(state.d)).toBe(42)
  })

  it('counts down in a loop until it reaches zero', () => {
    //   0  @10       A = 10
    //   1  D=A       D = 10
    //   2  @7        A = 7, so a taken jump lands on the trampoline
    //   3  D=D-1     D--                     <- loop head
    //   4  D;JGT     keep going while D > 0
    //   5  @20       A = 20, the exit
    //   6  0;JMP     goto 20
    //   7  @3        A = 3
    //   8  0;JMP     goto 3                  <- trampoline, loops back
    const program = [
      A_INSTRUCTION(10),
      C_INSTRUCTION('A', { d: 1 }),
      A_INSTRUCTION(7),
      C_INSTRUCTION('D-1', { d: 1 }),
      C_INSTRUCTION('D', {}, 'JGT'),
      A_INSTRUCTION(20),
      C_INSTRUCTION('A', {}, 'JMP'),
      A_INSTRUCTION(3),
      C_INSTRUCTION('A', {}, 'JMP'),
    ]

    const { state } = run(program, 60, {})

    // Ten decrements, from 10 down to 0. Once out of the loop the PC keeps
    // marching through empty memory, so D is what proves the loop terminated.
    expect(toNumber(state.d)).toBe(0)
  })
})

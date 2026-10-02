/**
 * Test helpers: an instruction encoder written independently of the assembler,
 * and a small runner that steps a list of words through the real CPU.
 *
 * This is deliberately *not* shared with the assembler. If both used one
 * encoder, a mistake in it would be invisible: the assembler would produce the
 * wrong word and the CPU would read the wrong word and the tests would still
 * agree with each other. Two implementations, cross-checked against the
 * published instruction encodings, is what makes either one trustworthy.
 */

import { cpu, initialCpu } from '@/lib/hack/cpu'
import { COMPS, compBits } from '@/lib/hack/alu'
import { fromNumber, toNumber, type Word } from '@/lib/bus'

/** An A-instruction is just its fifteen-bit value. */
export const A_INSTRUCTION = (value: number): number => value & 0x7fff

export type JumpName = 'JGT' | 'JEQ' | 'JGE' | 'JLT' | 'JNE' | 'JLE' | 'JMP'

const JUMPS: Record<JumpName, number> = {
  JGT: 0b001,
  JEQ: 0b010,
  JGE: 0b011,
  JLT: 0b100,
  JNE: 0b101,
  JLE: 0b110,
  JMP: 0b111,
}

export interface Dest {
  a?: 1
  d?: 1
  m?: 1
}

/** 111 a cccccc ddd jjj, built from the comp table's bit order. */
export const C_INSTRUCTION = (compName: string, dest: Dest, jump?: JumpName): number => {
  const comp = COMPS.find((c) => c.name === compName)
  if (!comp) throw new Error(`unknown comp ${compName}`)

  let word = 0xe000 | (compBits(comp) << 6)
  if (dest.a) word |= 1 << 5
  if (dest.d) word |= 1 << 4
  if (dest.m) word |= 1 << 3
  if (jump) word |= JUMPS[jump]
  return word & 0xffff
}

export interface RunResult {
  state: ReturnType<typeof initialCpu>
  memory: Map<number, number>
  steps: number
}

/**
 * Step a flat program through the real CPU. Memory is a `Map` rather than the
 * RAM hierarchy, because what is under test here is the CPU, not addressing.
 */
export const runProgram = (
  program: readonly number[],
  steps: number,
  initial: Record<number, number> = {},
): RunResult => {
  const memory = new Map<number, number>(
    Object.entries(initial).map(([k, v]) => [Number(k), v]),
  )
  let state = initialCpu()
  let taken = 0

  for (let i = 0; i < steps; i++) {
    const memoryWord: Word = fromNumber(memory.get(toNumber(state.a)) ?? 0)
    const instruction = fromNumber(program[toNumber(state.pc)] ?? 0)

    const r = cpu(memoryWord, instruction, state)
    if (r.writeM) memory.set(toNumber(r.addressM), toNumber(r.aluOut))

    state = r.next
    taken = i + 1

    // The next instruction must exist in memory before it can be fetched.
    memory.set(toNumber(state.pc), memory.get(toNumber(state.pc)) ?? 0)
  }

  return { state, memory, steps: taken }
}
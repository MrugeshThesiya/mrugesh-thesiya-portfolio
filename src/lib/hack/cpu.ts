/**
 * CPU — the machine.
 *
 * Three registers: A and D hold values, PC holds an address. One ALU does all
 * the arithmetic. That is the entire processor; everything else in a computer
 * is memory hanging off it.
 *
 * Instructions are sixteen bits, and the top bit decides how to read them:
 *
 *     0vvvvvvvvvvvvvvv     A-instruction  — A ← v, nothing else changes
 *     111accccccdddjjj     C-instruction  — ALU into A and/or D and/or M,
 *                                            optionally jumping to A
 *
 * The seven comp bits (a cccccc) are exactly the ALU's six flags plus the
 * choice between A and M for the first operand, so the decoder does not
 * translate anything — it hands the bits straight to the ALU that
 * interprets them. That is deliberate: one source of truth.
 *
 * Like the registers, this returns both what the machine reads this step and
 * what gets latched when the clock ticks.
 */

import { alu, type AluFlags } from '@/lib/hack/alu'
import { or8way } from '@/lib/hack/or8way'
import { not } from '@/lib/gates/not'
import { and } from '@/lib/gates/and'
import { mux16 } from '@/lib/bus/mux16'
import { fromNumber, toNumber, type Bit, type Word } from '@/lib/bus'

export interface CpuState {
  a: Word
  d: Word
  pc: Word
}

export interface CpuResult {
  /** Value read from memory this step. */
  outM: Word
  /** Whether memory should be written. */
  writeM: Bit
  /** Address presented to memory. */
  addressM: Word
  /** The ALU result for this step. */
  aluOut: Word
  /** Registers to latch on the next tick. */
  next: CpuState
  /** True when this instruction took a jump. */
  jumped: Bit
}

export const initialCpu = (): CpuState => ({ a: fromNumber(0), d: fromNumber(0), pc: fromNumber(0) })

/** Bit `i` of a word, counting from the least significant. */
const bit = (value: Word, i: number): Bit => ((toNumber(value) >> i) & 1) as Bit

export const isAInstruction = (instruction: Word): boolean => bit(instruction, 15) === 0

export const cpu = (inM: Word, instruction: Word, state: CpuState): CpuResult => {
  const pcNext = (toNumber(state.pc) + 1) & 0xffff

  if (isAInstruction(instruction)) {
    // A ← the value in the low fifteen bits. D is untouched, nothing is written.
    return {
      outM: inM,
      writeM: 0,
      addressM: state.a,
      aluOut: fromNumber(0),
      next: { a: instruction, d: state.d, pc: fromNumber(pcNext) },
      jumped: 0,
    }
  }

  // ---- C-instruction ----
  const a = bit(instruction, 12)
  const flags: AluFlags = {
    zx: bit(instruction, 11),
    nx: bit(instruction, 10),
    zy: bit(instruction, 9),
    ny: bit(instruction, 8),
    f: bit(instruction, 7),
    no: bit(instruction, 6),
  }

  const loadA = bit(instruction, 5)
  const loadD = bit(instruction, 4)
  const writeM = bit(instruction, 3)

  // x is A or M depending on the a bit; y is always D.
  const x = mux16(inM, state.a, a)
  const out = alu(x, state.d, flags)

  // Two separate things, and conflating them is the classic CPU bug.
  //
  // The jump *field* says which comparison is being requested. The ALU *result*
  // decides whether that comparison holds. A requested-and-true jump happens; a
  // requested-but-false one falls through, and so does an empty field.
  const j1 = bit(instruction, 2)
  const j2 = bit(instruction, 1)
  const j3 = bit(instruction, 0)

  // Three facts about the result, derived from the result and nothing else.
  const sign = bit(out, 15) // bit 15 set means the result is negative
  const nonZero = or8way(out) // any bit set means non-zero
  const positive = and(not(sign), nonZero)
  const zero = not(nonZero)

  // [requested by the instruction, holds for the result]
  const pairs: readonly (readonly [Bit, Bit])[] = [
    [and(not(j1), and(not(j2), j3)), positive], // 001  JGT  out > 0
    [and(not(j1), and(j2, not(j3))), zero], // 010  JEQ  out == 0
    [and(not(j1), and(j2, j3)), not(sign)], // 011  JGE  out >= 0
    [and(j1, and(not(j2), not(j3))), sign], // 100  JLT  out < 0
    [and(j1, and(not(j2), j3)), nonZero], // 101  JNE  out != 0
    [and(j1, and(j2, not(j3))), not(positive)], // 110  JLE  out <= 0
    [and(j1, and(j2, j3)), 1], // 111  JMP  always
  ]

  const jumped = or8way(pairs.map(([requested, holds]) => and(requested, holds)))

  return {
    outM: inM,
    writeM,
    addressM: state.a,
    aluOut: out,
    next: {
      a: mux16(state.a, out, loadA),
      d: mux16(state.d, out, loadD),
      pc: mux16(fromNumber(pcNext), state.a, jumped),
    },
    jumped,
  }
}

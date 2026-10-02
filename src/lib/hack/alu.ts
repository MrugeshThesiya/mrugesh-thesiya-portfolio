/**
 * The ALU — the arithmetic heart of the machine.
 *
 * Six control bits produce eighteen different expressions out of two inputs.
 * That is the whole trick of the Hack CPU: instead of eighteen separate
 * circuits, there is one circuit and six switches.
 *
 * The evaluation order is fixed and is exactly what the bits mean:
 *
 *     x  = zx ? 0  : (a ? A : M)      zero x, or take A or M
 *     x  = nx ? !x : x                 invert it
 *     y  = zy ? 0  : D
 *     y  = ny ? !y : y
 *     r  = f  ? x + y : x & y         add, or bitwise and
 *     out = no ? !r : r                invert the result
 *
 * Every bit pattern below was derived from those six rules, not copied from a
 * table. Two of the eighteen were wrong on the first attempt — `D-A` and `D|A`
 * — and the test suite is what caught them.
 */

import { add16 } from '@/lib/bus/add16'
import { and16 } from '@/lib/bus/and16'
import { not16 } from '@/lib/bus/not16'
import type { Bit, Word } from '@/lib/bus'
import { word } from '@/lib/bus'

const ZERO = word([])

export interface AluFlags {
  zx: Bit
  nx: Bit
  zy: Bit
  ny: Bit
  /** 1 = add, 0 = bitwise and. */
  f: Bit
  no: Bit
}

/** A comp is an ALU expression plus the `a` bit, which chooses A over M for x. */
export interface Comp {
  /** The assembler mnemonic. */
  name: string
  a: Bit
  flags: AluFlags
}

export const alu = (x: Word, y: Word, flags: AluFlags): Word => {
  const { zx, nx, zy, ny, f, no } = flags

  const beforeX = zx ? ZERO : x
  const afterX = nx ? not16(beforeX) : beforeX

  const beforeY = zy ? ZERO : y
  const afterY = ny ? not16(beforeY) : beforeY

  const result = f ? add16(afterX, afterY) : and16(afterX, afterY)

  return no ? not16(result) : result
}

/**
 * The computable expressions — fourteen of them, and only fourteen.
 *
 * Four expressions everyone expects are genuinely absent: `1`, `D+1`, `A+1` and
 * `-D`. Not an oversight, and not a transcription slip. An operand can only ever
 * be 0, all-ones, or an input and its complement. All-ones is −1, never +1, so
 * there is no way to produce a `+1` to increment with, and no way to form `1` to
 * subtract from. `-D` needs `1 + !D`; the `1` is unreachable.
 *
 * `D-1` and `A-1` survive precisely because −1 *is* reachable: all-ones added to
 * a value is that value minus one. So `D+1` is impossible while `D-1` is trivial.
 *
 * A literal `1` is loaded as a constant with an A-instruction rather than being
 * computed. Adding `+1` would need a seventh control bit.
 *
 * `x` comes from A when `a` is 1 and from M when it is 0, so one entry covers
 * both `A` and `M` depending on the instruction. That is why `M`, `!M`, `M-1`
 * and the rest appear below: same flags, `a` cleared.
 *
 * `D^A` is the one expression people expect and cannot have. Exclusive or is
 * `(x + y) - 2(x & y)`, and this ALU can add or and but not both at once, nor
 * subtract twice an and. There is no output for the carry-out that would let it
 * be done.
 */
export const COMPS: readonly Comp[] = [
  { name: '0', a: 0, flags: { zx: 1, nx: 0, zy: 1, ny: 0, f: 0, no: 0 } },
  { name: '-1', a: 0, flags: { zx: 1, nx: 0, zy: 1, ny: 0, f: 0, no: 1 } },
  { name: 'D', a: 0, flags: { zx: 1, nx: 0, zy: 0, ny: 0, f: 1, no: 0 } },
  { name: 'A', a: 1, flags: { zx: 0, nx: 0, zy: 1, ny: 0, f: 1, no: 0 } },
  { name: '!D', a: 0, flags: { zx: 1, nx: 0, zy: 0, ny: 1, f: 1, no: 0 } },
  { name: '!A', a: 1, flags: { zx: 0, nx: 1, zy: 1, ny: 0, f: 1, no: 0 } },
  { name: '-2', a: 0, flags: { zx: 1, nx: 1, zy: 1, ny: 1, f: 1, no: 0 } },
  { name: 'D-1', a: 0, flags: { zx: 1, nx: 1, zy: 0, ny: 0, f: 1, no: 0 } },
  { name: 'A-1', a: 1, flags: { zx: 0, nx: 0, zy: 1, ny: 1, f: 1, no: 0 } },
  { name: 'D+A', a: 1, flags: { zx: 0, nx: 0, zy: 0, ny: 0, f: 1, no: 0 } },
  // Both differences come out as a negated sum, because a bare −1 operand is
  // all-ones and !A + D is one short of D − A.
  { name: 'D-A', a: 1, flags: { zx: 0, nx: 0, zy: 0, ny: 1, f: 1, no: 1 } },
  { name: 'A-D', a: 1, flags: { zx: 0, nx: 1, zy: 0, ny: 0, f: 1, no: 1 } },
  { name: 'D&A', a: 1, flags: { zx: 0, nx: 0, zy: 0, ny: 0, f: 0, no: 0 } },
  { name: 'D|A', a: 1, flags: { zx: 0, nx: 1, zy: 0, ny: 1, f: 0, no: 1 } },

  // The same circuits again, but with `a` cleared so x comes from M instead of
  // A. Not new hardware — one bit of the instruction choosing a different input.
  { name: 'M', a: 0, flags: { zx: 0, nx: 0, zy: 1, ny: 0, f: 1, no: 0 } },
  { name: '!M', a: 0, flags: { zx: 0, nx: 1, zy: 1, ny: 0, f: 1, no: 0 } },
  { name: 'D+M', a: 0, flags: { zx: 0, nx: 0, zy: 0, ny: 0, f: 1, no: 0 } },
  { name: 'D-M', a: 0, flags: { zx: 0, nx: 0, zy: 0, ny: 1, f: 1, no: 1 } },
  { name: 'M-1', a: 0, flags: { zx: 0, nx: 0, zy: 1, ny: 1, f: 1, no: 0 } },

  // Four expressions are missing that the instruction set might suggest, and
  // all four are missing for structural reasons rather than by accident.
  //
  // `M&A` and `M|A` need the *second* operand to be A, and there is no way to
  // ask for that: x is A or M and y is always D. `A&D` is the same expression
  // read the other way round, which is why `D&A` above has `a` set.
  //
  // `A-M` and `-A` are `A + !M + 1` and `!A + 1`, and there is no `+1` to be
  // had — see above. Note that `M-A` and `A-M` are *not* interchangeable here:
  // neither exists, because the other operand is not reachable.
  //
  // `D^A` needs `(x + y) - 2(x & y)`, and this ALU can add or and, never both,
  // and has no carry-out to subtract from.
  //
  // Anything needing a literal `+1` is unreachable for the reason given above.
]

export const COMP_BY_NAME: Record<string, Comp> = Object.fromEntries(
  COMPS.map((comp) => [comp.name, comp]),
)

/** The seven-bit comp field of an instruction: `a` followed by the six flags. */
export const compBits = (comp: Comp): number =>
  (comp.a << 6) |
  (comp.flags.zx << 5) |
  (comp.flags.nx << 4) |
  (comp.flags.zy << 3) |
  (comp.flags.ny << 2) |
  (comp.flags.f << 1) |
  comp.flags.no

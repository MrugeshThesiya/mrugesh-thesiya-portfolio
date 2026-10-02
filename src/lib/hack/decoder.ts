/**
 * decoder3 — three address bits, eight one-hot outputs.
 *
 * Every level of RAM needs to turn one address into "which of my eight
 * children does this belong to". That is the job of a decoder: exactly one
 * output goes high, and it is the one the address names.
 *
 * It is the inverse of mux8way16, and it is genuinely gates rather than a
 * lookup table, because a decoder is nothing but an AND of literals — for
 * output i, AND together whichever of each bit and its inverse the index
 * selects. Three NOT gates and eight three-input ANDs, and two gates per AND.
 */

import { and } from '@/lib/gates/and'
import { not } from '@/lib/gates/not'
import type { Bit } from '@/lib/nand'

export type OneHot8 = readonly [Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit]

export const decoder3 = (address: readonly [Bit, Bit, Bit]): OneHot8 => {
  const [a, b, c] = address

  const complements: readonly Bit[] = [not(a), not(b), not(c)]
  const originals: readonly Bit[] = [a, b, c]

  const lines: Bit[] = []
  for (let line = 0; line < 8; line++) {
    const literals: Bit[] = []
    for (let bit = 0; bit < 3; bit++) {
      const pick = ((line >> bit) & 1) === 1
      literals.push(pick ? (originals[bit] ?? 0) : (complements[bit] ?? 0))
    }
    // AND all three literals together, lowest bit first, as addressToNumber reads them.
    lines.push(and(and(literals[0] ?? 0, literals[1] ?? 0), literals[2] ?? 0))
  }

  return lines as unknown as OneHot8
}

/**
 * decoder2 — two address bits, four one-hot outputs. The same idea as decoder3,
 * needed only because 16384 = 4 x 4096 rather than 8 x 4096, so the top level
 * of the machine's memory has four banks instead of eight.
 */
export const decoder2 = (address: readonly [Bit, Bit]): readonly [Bit, Bit, Bit, Bit] => {
  const [a, b] = address
  return [and(not(a), not(b)), and(a, not(b)), and(not(a), b), and(a, b)]
}

/**
 * decoder4 — four address bits, sixteen one-hot outputs. Present so that a chip
 * which can name sixteen banks has a way to say which one it meant, even when
 * nothing currently reads the answer.
 */
export const decoder4 = (address: readonly [Bit, Bit, Bit, Bit]): readonly Bit[] => {
  const low = decoder3([address[0], address[1], address[2]])
  return low.flatMap<Bit>((line) => [and(line, address[3]), and(line, not(address[3]))])
}

/** The three address bits of a word, low three bits first. */
export const address3 = (address: readonly Bit[]): readonly [Bit, Bit, Bit] => [
  address[0] ?? 0,
  address[1] ?? 0,
  address[2] ?? 0,
]

/** Read those three bits back as a number. */
export const address3ToNumber = (address: readonly [Bit, Bit, Bit]): number =>
  address[0] + address[1] * 2 + address[2] * 4

/**
 * The low `count` bits of an address, and those bits as a number. RAM gets
 * taller as it gets wider: ram8 addresses three bits, ram64 six, ram64k nine.
 * Everything else about them is identical, so the arithmetic lives here.
 */
export const addressToNumber = (address: readonly Bit[], count: number): number => {
  let value = 0
  for (let i = 0; i < count; i++) value += (address[i] ?? 0) * 2 ** i
  return value
}
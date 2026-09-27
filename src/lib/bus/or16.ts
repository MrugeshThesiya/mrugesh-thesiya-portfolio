/**
 * Or16 — sixteen ORs in a row.
 *
 * The mirror of And16: still bitwise, still no carrying, three NANDs per bit
 * because an OR needs both of its inputs inverted before the NAND.
 */

import { or } from '@/lib/gates/or'
import { WORD_WIDTH, type Bit, type Word } from '@/lib/bus'

export const or16 = (a: Word, b: Word): Word => {
  const out: Bit[] = []
  for (let i = 0; i < WORD_WIDTH; i++) out.push(or(a[i] ?? 0, b[i] ?? 0))
  return out
}

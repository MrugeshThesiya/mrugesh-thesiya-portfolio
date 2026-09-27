/**
 * And16 — sixteen ANDs in a row.
 *
 * Bitwise AND with no carrying between positions. Each bit looks only at the
 * bit sitting opposite it on the other bus, so this is two NANDs per bit.
 */

import { and } from '@/lib/gates/and'
import { WORD_WIDTH, type Bit, type Word } from '@/lib/bus'

export const and16 = (a: Word, b: Word): Word => {
  const out: Bit[] = []
  for (let i = 0; i < WORD_WIDTH; i++) out.push(and(a[i] ?? 0, b[i] ?? 0))
  return out
}

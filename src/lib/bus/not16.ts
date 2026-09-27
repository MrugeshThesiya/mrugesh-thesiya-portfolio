/**
 * Not16 — sixteen NOTs in a row.
 *
 * Nothing new happens here. The bus just widens: sixteen independent bits, each
 * inverted on its own wire. Sixteen NANDs cover the whole word.
 */

import { not } from '@/lib/gates/not'
import { WORD_WIDTH, type Bit, type Word } from '@/lib/bus'

export const not16 = (w: Word): Word => {
  const out: Bit[] = []
  for (let i = 0; i < WORD_WIDTH; i++) out.push(not(w[i] ?? 0))
  return out
}

/**
 * A compiler that emits assembly, and the program it emits.
 *
 * The machine has no drawing instruction. There is no blitter, no framebuffer,
 * no `drawGlyph` in hardware — a pixel is a bit in a word, and the only way to
 * change one is to execute arithmetic. Drawing text here means writing a program
 * whose whole job is to work out where each bit goes and store it there.
 *
 * This is where the separate modules meet. `compileDraw` emits assembly, the
 * Computer assembles it and runs it, and pixels appear. Once `run` is called
 * nothing outside the machine is involved — the picture in the test output was
 * put there by sixteen-bit arithmetic and nothing else.
 *
 * ## How a run of pixels becomes one addition
 *
 * A glyph is five columns of ink, seven rows tall. At scale `n` each column
 * becomes `n` pixels wide and each row `n` pixels tall, so one line of a glyph is
 * `5n` pixels across. A screen word is sixteen wide, so those pixels do not fit
 * neatly inside one: a run starting at bit `b` is the number
 *
 *     run = ((1 << n) - 1) << b
 *
 * and that number may be entirely inside one word or spill over into the next.
 * Either way it *is* a number, and adding it to the word puts those pixels there.
 * A run that crosses a boundary is two numbers, so it is two additions. That is
 * the whole trick, and it is why the scale is cheap.
 *
 * ## What the compiler knows and what the machine knows
 *
 * The compiler works out which word and which bits each run lands on, because a
 * screen is a fixed size and a program knows where it is drawing — that is what
 * any compiler does. What is *not* baked in is the glyph. Every bitmap is read out
 * of RAM while the machine runs, and every screen word is read, added to, and
 * written back while the machine runs. Read-modify-write rather than assignment,
 * so a word shared with a neighbouring glyph keeps what was already in it.
 *
 * ## The missing ALU, and why the generated code has no loops
 *
 * There is no `+1`. An operand can only ever be 0, an input, or its complement,
 * and all-ones is −1 rather than +1, so `A+1` cannot be computed at all. The
 * obvious way to write this program is a loop over characters and rows, counting
 * up — and every increment in it would have to be `M[reg] = M[reg] + M[ONE]`,
 * six instructions where two would do. So the compiler unrolls instead.
 *
 * The generated code therefore contains no loops whatsoever, and that is a direct
 * consequence of the six-flag ALU: the missing increment made unrolling cheaper
 * than looping. There is no shifter and no multiply either, which is why every
 * bit pattern below is a literal the compiler worked out rather than something the
 * machine computes at run time.
 */

import { FONT } from '@/lib/hack/font'

/** Where the generated program keeps its glyph table. */
export const DATA = {
  /** Seven bitmap words per distinct character. */
  FONT: 64,
} as const

/** Columns of ink in a glyph. */
const GLYPH_COLUMNS = 5
/** Rows of ink in a glyph. */
const GLYPH_ROWS = 7
/** Rows in the machine's glyph cell, including the clear one under the baseline. */
const GLYPH_CELL_ROWS = 8
/** Unscaled cells from one glyph's origin to the next. */
const GLYPH_PITCH = 9

const SCREEN_BASE = 0x4000
const WORDS_PER_ROW = 32
const SCREEN_WIDTH = 512
const SCREEN_HEIGHT = 256
const WORD_MASK = 0xffff

/**
 * Emit code that puts `value` into D.
 *
 * An A-instruction carries only fifteen bits, so a literal above 0x7FFF cannot be
 * loaded directly — and a run of pixels starting at bit 12 or higher is exactly
 * that. The way round it is that all-ones *is* −1, so complementing is available:
 * `0xFFFF - value` is at most 0x7FFF, and `D=!A` turns it back. Complementing is
 * one of the five operations the six control bits can express, so this costs two
 * instructions and nothing else.
 */
const loadConstant = (value: number): string[] =>
  value <= 0x7fff
    ? [`@${value}`, 'D=A']
    : [`@${WORD_MASK - value}`, 'D=!A']

export interface CompiledProgram {
  /** The assembly, ready for `assemble`. */
  source: string
  /** Every word the program reads as data, by address. */
  data: ReadonlyMap<number, number>
  /** Address of the final instruction, for running until the machine stops. */
  haltAddress: number
  /** The distinct characters the program can draw. */
  characters: readonly string[]
  /** Where the text landed. */
  origin: { x: number; y: number; width: number; height: number }
  /** How many instructions the program is. */
  length: number
}

/**
 * Compile a program that draws `text`, centred on the screen at `scale`.
 *
 * A character with no glyph in the font is drawn blank rather than rejected: a
 * missing letter is not worth failing a build over, and the caller can see it in
 * the output.
 */
export const compileDraw = (text: string, scale = 4): CompiledProgram => {
  const advance = GLYPH_PITCH * scale
  const blockHeight = GLYPH_CELL_ROWS * scale
  const width = text.length * advance - scale

  const originX = Math.floor((SCREEN_WIDTH - width) / 2)
  const originY = Math.floor((SCREEN_HEIGHT - blockHeight) / 2)

  const characters = [...new Set(text.split(''))].sort()
  const slotOf = new Map(characters.map((character, slot) => [character, slot]))

  const data = new Map<number, number>()
  const out: string[] = []

  // A label takes no space in memory, so an instruction's address is simply how
  // many instructions precede it. Tracking that as a counter is what makes the
  // halt address exact, and it has to skip label lines too — `(HALT)` occupies
  // no word, only the `0;JMP` after it does.
  const LABEL_ONLY = /^\([A-Za-z_.$:][\w.$:]*\)$/

  let address = 0
  const emit = (...lines: string[]): void => {
    for (const line of lines) {
      out.push(line)
      const text = line.trim()
      if (text === '' || text.startsWith('//') || LABEL_ONLY.test(text)) continue
      address += 1
    }
  }

  // ---- the glyph table, loaded into RAM ----
  emit(
    `// Draw ${JSON.stringify(text)} on the screen.`,
    '// Generated by compileDraw. This machine has no drawing instruction:',
    '// every pixel below is sixteen-bit arithmetic writing bits into a word.',
    '',
    `// The glyph table: ${GLYPH_ROWS} words per character, ${GLYPH_COLUMNS} columns of ink.`,
  )

  characters.forEach((character, slot) => {
    const rows = FONT.get(character) ?? FONT.get(' ') ?? []
    for (let row = 0; row < GLYPH_ROWS; row++) {
      const at = DATA.FONT + slot * GLYPH_CELL_ROWS + row
      const value = rows[row] ?? 0
      data.set(at, value)
      emit(
        `// '${character}' row ${row} = 0b${(value & 0b11111).toString(2).padStart(GLYPH_COLUMNS, '0')}`,
        ...loadConstant(value),
        `@${at}`,
        'M=D',
      )
    }
  })

  emit(
    '',
    `// ${width}px wide, from x=${originX} y=${originY}, at ${scale}x.`,
    '// A run of pixels is a number; adding it to a screen word puts those pixels',
    '// in that word. A run crossing a word boundary is two numbers, so two adds.',
    '// There are no loops in this program. Counting up would need +1, which this',
    '// ALU cannot compute, so the loop was unrolled away instead.',
  )

  let nextLabel = 0

  text.split('').forEach((character, index) => {
    const slot = slotOf.get(character) ?? 0
    const glyphX = originX + index * advance

    emit('', `// '${character}', x=${glyphX}`)

    for (let row = 0; row < GLYPH_ROWS; row++) {
      const glyphAt = DATA.FONT + slot * GLYPH_CELL_ROWS + row

      for (let column = 0; column < GLYPH_COLUMNS; column++) {
        const x = glyphX + column * scale
        const wordIndex = x >> 4
        const bit = x & 15

        // The pixels one column covers, split across the two words it touches.
        const pattern = (1 << scale) - 1
        const here = (pattern << bit) & WORD_MASK
        const spill = (pattern << bit) >>> 16

        // One test per column, covering all `scale` rows it is scaled into.
      //
      // Three details in these six instructions, each of which drew a wrong
      // picture before it was got right.
      //
      // `D=M` rather than `M=D` next: the second operand of a C-instruction is
      // always read from memory at whatever address A holds, so `D=M` brings the
      // glyph row into D. `M=D` would read memory[A] but write it to M[A], which
      // is the same word and so happens to look right — for the wrong reason.
      //
      // `D&M` rather than `D&A`, for the same reason: the `a` bit chooses between
      // the A register and memory at A, and here A must stay holding the glyph
      // row's address so that M reaches it.
      //
      // `D=D&M` rather than `D&M`. Without a destination the ALU computes the
      // answer and discards it, so D keeps the column mask, the following JEQ sees
      // a non-zero mask, and no column is ever skipped.
      const skip = `SKIP${nextLabel++}`
      emit(
        `// line ${row}, column ${column}: bit ${bit} onwards`,
        ...loadConstant(1 << column), // D = the column mask
        `@${glyphAt}`, // A = where the glyph row lives
        'D=D&M', // D = memory[A] & D, the column mask
        `@${skip}`,
        'D;JEQ',
      )

        for (let destRow = 0; destRow < scale; destRow++) {
          const y = originY + row * scale + destRow
          const word = SCREEN_BASE + y * WORDS_PER_ROW + wordIndex

          // `D=D+M`, not `D=D+A`. The `a` bit decides whether x comes from the A
          // register or from memory at A, and here A must hold the *address* so
          // that M reaches the screen word. Writing `D=D+A` adds the A register
          // itself — which after the load holds the address, so the word came out
          // as address + mask.
          if (here !== 0) {
            emit(...loadConstant(here), `@${word}`, 'D=D+M', `@${word}`, 'M=D')
          }
          if (spill !== 0) {
            emit(...loadConstant(spill), `@${word + 1}`, 'D=D+M', `@${word + 1}`, 'M=D')
          }
        }

        emit(`(${skip})`)
      }
    }
  })

  emit('', '// Finished. Spin, so a stopped machine can be seen to have stopped.')
  const haltAddress = address
  emit('(HALT)', '0;JMP')

  const source = out.join('\n')

  return {
    source,
    data,
    haltAddress,
    characters,
    origin: { x: originX, y: originY, width, height: blockHeight },
    length: address,
  }
}
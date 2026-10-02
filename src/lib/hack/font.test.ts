import { describe, expect, it } from 'vitest'

import { CHARACTERS, FONT, FONT_CELL_HEIGHT, FONT_GLYPH_WIDTH, glyphFor } from '@/lib/hack/font'
import {
  CHAR_ADVANCE,
  GLYPH_HEIGHT,
  GLYPH_PITCH,
  GLYPH_WIDTH,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  TEXT_SCALE,
  blankScreen,
  drawGlyph,
  isPixelSet,
  placeText,
} from '@/lib/hack/screen'

describe('the font', () => {
  it('has a glyph for every printable ASCII character', () => {
    const printable = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i))
    const missing = printable.filter((c) => !FONT.has(c))
    expect(missing).toEqual([])
  })

  it('has exactly one glyph per character', () => {
    expect(FONT.size).toBe(CHARACTERS.length)
  })

  it('draws every glyph as seven rows of five pixels inside an eight-by-eight cell', () => {
    for (const [character, rows] of FONT) {
      expect(rows.length, character).toBe(GLYPH_HEIGHT)
      for (const [index, row] of rows.entries()) {
        expect(row, `${character} row ${index}`).toBeGreaterThanOrEqual(0)
        expect(row, `${character} row ${index}`).toBeLessThan(1 << GLYPH_WIDTH)
      }
    }
  })

  it('leaves the right margin and the bottom row clear', () => {
    // Five columns of glyph in an eight-wide cell: bits 5, 6 and 7 must be zero
    // in every row, and row 7 unused in every glyph. This is the whole reason
    // letters do not run into each other.
    for (const [character, rows] of FONT) {
      for (const row of rows) {
        expect(row & ~((1 << FONT_GLYPH_WIDTH) - 1), character).toBe(0)
      }
      expect(rows[FONT_CELL_HEIGHT - 1], character).toBe(0)
    }
  })

  it('gives a blank cell for anything it does not have', () => {
    const blank = glyphFor(' ')
    expect(blank.every((row) => row === 0)).toBe(true)
    expect(glyphFor('\u00e9')).toEqual(blank)
  })

  it('gives a space no ink at all', () => {
    expect(glyphFor(' ').every((row) => row === 0)).toBe(true)
  })

  it('draws something for every letter and digit', () => {
    const letters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', ...'abcdefghijklmnopqrstuvwxyz', ...'0123456789']
    for (const character of letters) {
      const inked = glyphFor(character).filter((row) => row !== 0).length
      expect(inked, character).toBeGreaterThan(2)
    }
  })
})

describe('the glyph cell and the screen agree', () => {
  it('draws at the scale and pitch the layout was computed for', () => {
    expect(GLYPH_WIDTH).toBe(8)
    expect(GLYPH_HEIGHT).toBe(8)
    expect(GLYPH_PITCH).toBe(9)
    expect(CHAR_ADVANCE).toBe(36)
    expect(TEXT_SCALE).toBe(4)
  })

  it('inks exactly the pixels the glyph names, and no others', () => {
    // A glyph with two pixels set: the top-left and the third column, third row.
    const glyph = [0b00001, 0, 0b00100, 0, 0, 0, 0, 0]
    const screen = blankScreen()

    drawGlyph(screen, glyph, 0, 0, 1)

    expect(isPixelSet(screen, 0, 0)).toBe(true)
    expect(isPixelSet(screen, 1, 0)).toBe(false)
    expect(isPixelSet(screen, 2, 2)).toBe(true)
    expect(isPixelSet(screen, 3, 2)).toBe(false)
    expect(isPixelSet(screen, 0, 6)).toBe(false)
  })

  it('scales a glyph into a filled block', () => {
    const screen = blankScreen()
    drawGlyph(screen, [0b00001, 0, 0, 0, 0, 0, 0, 0], 10, 10, TEXT_SCALE)

    for (let y = 0; y < TEXT_SCALE; y++) {
      for (let x = 0; x < TEXT_SCALE; x++) {
        expect(isPixelSet(screen, 10 + x, 10 + y)).toBe(true)
      }
    }
    // The gap to the right of the glyph is part of the cell.
    expect(isPixelSet(screen, 10 + TEXT_SCALE + GLYPH_WIDTH * TEXT_SCALE, 10)).toBe(false)
  })

  it('draws every letter inside the screen', () => {
    for (const character of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
      const screen = blankScreen()
      drawGlyph(screen, glyphFor(character), 0, 0, TEXT_SCALE)
      const inked = countInk(screen)
      expect(inked, character).toBeGreaterThan(0)
      expect(inked, character).toBeLessThan(SCREEN_WIDTH * SCREEN_HEIGHT)
    }
  })
})

describe('"Hello world" fits the screen', () => {
  const text = 'Hello world'

  it('is 392 pixels wide at the chosen scale', () => {
    expect(text.length * CHAR_ADVANCE - TEXT_SCALE).toBe(392)
    expect(392).toBeLessThan(SCREEN_WIDTH)
  })

  it('is 32 pixels tall and centred', () => {
    // The cell is eight rows, so at 4x a line of text is 32 pixels tall and sits
    // 112 pixels down the middle of a 256-pixel screen.
    expect(FONT_CELL_HEIGHT * TEXT_SCALE).toBe(32)
    expect((FONT_CELL_HEIGHT - 1) * TEXT_SCALE).toBe(28) // the letters alone
    expect(placeText(text).y).toBe(112)
    expect(placeText(text).y * 2 + 32).toBe(SCREEN_HEIGHT)
  })

  it('lands entirely inside the screen when drawn', () => {
    const { x, y } = placeText(text)
    const lastGlyph = x + (text.length - 1) * CHAR_ADVANCE

    expect(x).toBeGreaterThanOrEqual(0)
    expect(y).toBeGreaterThanOrEqual(0)
    expect(lastGlyph + GLYPH_WIDTH * TEXT_SCALE).toBeLessThanOrEqual(SCREEN_WIDTH)
    expect(y + GLYPH_HEIGHT * TEXT_SCALE).toBeLessThanOrEqual(SCREEN_HEIGHT)
  })
})

const countInk = (screen: number[]): number =>
  screen.reduce((total, word) => {
    let bits = word
    while (bits !== 0) {
      total += bits & 1
      bits >>>= 1
    }
    return total
  }, 0)
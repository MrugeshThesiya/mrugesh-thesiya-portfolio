import { describe, expect, it } from 'vitest'

import {
  CHAR_ADVANCE,
  GLYPH_HEIGHT,
  GLYPH_PITCH,
  GLYPH_WIDTH,
  SCREEN_BASE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SCREEN_WORDS,
  TEXT_SCALE,
  WORDS_PER_ROW,
  addressOfPixel,
  bitOfPixel,
  blankScreen,
  drawGlyph,
  isPixelSet,
  placeText,
  setPixel,
} from '@/lib/hack/screen'

describe('the memory map', () => {
  it('is exactly 8192 words for 512 x 256 pixels', () => {
    expect(SCREEN_WORDS).toBe(SCREEN_WIDTH * SCREEN_HEIGHT / 16)
    expect(WORDS_PER_ROW).toBe(32)
  })

  it('puts the screen at 0x4000', () => {
    expect(SCREEN_BASE).toBe(0x4000)
  })

  it('packs sixteen pixels into every word, in order', () => {
    // 32 whole words per row, no gaps.
    for (let x = 0; x < SCREEN_WIDTH; x++) {
      expect(addressOfPixel(x, 7) - SCREEN_BASE).toBe(7 * 32 + (x >> 4))
      expect(bitOfPixel(x)).toBe(x & 15)
    }
  })

  it('keeps the last pixel of the last row inside the screen', () => {
    const last = addressOfPixel(SCREEN_WIDTH - 1, SCREEN_HEIGHT - 1)
    expect(last - SCREEN_BASE).toBe(SCREEN_WORDS - 1)
  })
})

describe('drawing pixels', () => {
  it('starts blank', () => {
    expect(blankScreen().every((w) => w === 0)).toBe(true)
  })

  it('sets one pixel without touching the other fifteen in its word', () => {
    const screen = blankScreen()
    setPixel(screen, 0, 0)
    expect(screen[0]).toBe(1)

    setPixel(screen, 1, 0)
    expect(screen[0]).toBe(3)

    setPixel(screen, 15, 0)
    // Bits 0, 1 and 15 of the same word, and nothing in the next one.
    expect(screen[0]).toBe(0b1000_0000_0000_0011)
    expect(screen[1]).toBe(0)
  })

  it('writes into the right word for a row further down', () => {
    const screen = blankScreen()
    setPixel(screen, 0, 5)
    expect(screen[5 * 32]).toBe(1)
  })

  it('ignores coordinates off the screen instead of corrupting memory', () => {
    const screen = blankScreen()
    setPixel(screen, -1, 0)
    setPixel(screen, 0, -1)
    setPixel(screen, SCREEN_WIDTH, 0)
    setPixel(screen, 0, SCREEN_HEIGHT)
    expect(screen.every((w) => w === 0)).toBe(true)
  })

  it('reads back what it wrote', () => {
    const screen = blankScreen()
    setPixel(screen, 123, 45)
    expect(isPixelSet(screen, 123, 45)).toBe(true)
    expect(isPixelSet(screen, 122, 45)).toBe(false)
  })
})

describe('the glyph cell, decided before any font exists', () => {
  it('is eight by eight', () => {
    expect(GLYPH_WIDTH).toBe(8)
    expect(GLYPH_HEIGHT).toBe(8)
  })

  it('advances by one blank column between glyphs', () => {
    expect(GLYPH_PITCH).toBe(9)
  })

  it('scales text four times, so a character advances 36 pixels', () => {
    expect(TEXT_SCALE).toBe(4)
    expect(CHAR_ADVANCE).toBe(36)
  })
})

describe('laying out "Hello world"', () => {
  const text = 'Hello world'

  it('fits on the screen at the chosen scale', () => {
    const width = text.length * CHAR_ADVANCE - TEXT_SCALE
    expect(width).toBe(392)
    expect(width).toBeLessThan(SCREEN_WIDTH)
    expect(GLYPH_HEIGHT * TEXT_SCALE).toBeLessThan(SCREEN_HEIGHT)
  })

  it('centres the run', () => {
    const { x, y } = placeText(text)
    expect(x).toBe(60)
    expect(y).toBe(112)
  })

  it('keeps the last glyph on screen', () => {
    const { x } = placeText(text)
    const lastGlyphStart = x + (text.length - 1) * CHAR_ADVANCE
    expect(lastGlyphStart + GLYPH_WIDTH * TEXT_SCALE).toBeLessThanOrEqual(SCREEN_WIDTH)
  })

  it('moves with the scale if the scale changes', () => {
    const big = placeText(text, 8)
    expect(big.x).toBeLessThan(placeText(text, 4).x)
  })
})

describe('blitting a glyph', () => {
  // A single pixel in the top-left corner of the cell.
  const dot = [1, 0, 0, 0, 0, 0, 0, 0]

  it('scales one set bit into a filled square', () => {
    const screen = blankScreen()
    drawGlyph(screen, dot, 0, 0, 4)
    // 4x4 pixels on.
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) expect(isPixelSet(screen, x, y)).toBe(true)
    // and nothing to its right.
    expect(isPixelSet(screen, 4, 0)).toBe(false)
    expect(isPixelSet(screen, 0, 4)).toBe(false)
  })

  it('leaves the screen untouched for an empty glyph', () => {
    const screen = blankScreen()
    drawGlyph(screen, [0, 0, 0, 0, 0, 0, 0, 0], 10, 10, 4)
    expect(screen.every((w) => w === 0)).toBe(true)
  })

  it('overlaps safely, setting rather than assigning', () => {
    const screen = blankScreen()
    setPixel(screen, 1, 1)
    drawGlyph(screen, dot, 0, 0, 4)
    expect(isPixelSet(screen, 1, 1)).toBe(true)
  })

  it('places two glyphs side by side without touching', () => {
    const screen = blankScreen()
    drawGlyph(screen, dot, 0, 0, 4)
    drawGlyph(screen, dot, CHAR_ADVANCE, 0, 4)
    expect(isPixelSet(screen, 0, 0)).toBe(true)
    expect(isPixelSet(screen, CHAR_ADVANCE, 0)).toBe(true)
    expect(isPixelSet(screen, CHAR_ADVANCE - 1, 0)).toBe(false)
  })
})

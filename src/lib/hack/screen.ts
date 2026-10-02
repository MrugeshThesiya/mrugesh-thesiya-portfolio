/**
 * The screen, and the layout decided on top of it.
 *
 * Everything about a display in this machine follows from one fact: memory is
 * memory. There is no framebuffer, no graphics card and no driver. The last
 * 8K words of the address space *are* the screen.
 *
 *     0x0000 - 0x3FFF   RAM16K     16384 words of ordinary memory
 *     0x4000 - 0x5FFF   Screen       8192 words, mapped to 512 x 256 pixels
 *     0x6000            Keyboard   one word, updated by the outside world
 *     0x6001 - 0x7FFF   unused
 *
 * A word holds sixteen pixels, so a scanline is thirty-two words wide and the
 * whole picture is 256 of them:
 *
 *     word offset = y * 32 + (x / 16)      bit = x % 16
 *
 * Writing "one" to a pixel is therefore one OR — never an assignment, or you
 * would erase the fifteen pixels sharing that word.
 */

/** Word address where the picture begins. */
export const SCREEN_BASE = 0x4000
/** Where the keyboard reports its single word. */
export const KEYBOARD = 0x6000

export const SCREEN_WORDS = 8192
export const SCREEN_WIDTH = 512
export const SCREEN_HEIGHT = 256
export const WORDS_PER_ROW = SCREEN_WIDTH / 16

/** Address of the word holding pixel x of row y, in absolute memory. */
export const addressOfPixel = (x: number, y: number): number =>
  SCREEN_BASE + y * WORDS_PER_ROW + (x >> 4)

/** Which bit of that word holds the pixel. */
export const bitOfPixel = (x: number): number => x & 15

/** A blank screen: every pixel off. */
export const blankScreen = (): number[] => new Array<number>(SCREEN_WORDS).fill(0)

/** Set one pixel on, leaving the fifteen that share its word alone. */
export const setPixel = (screen: number[], x: number, y: number): void => {
  if (x < 0 || x >= SCREEN_WIDTH || y < 0 || y >= SCREEN_HEIGHT) return
  const index = y * WORDS_PER_ROW + (x >> 4)
  screen[index] = ((screen[index] ?? 0) | (1 << bitOfPixel(x))) & 0xffff
}

export const isPixelSet = (screen: number[], x: number, y: number): boolean =>
  (((screen[y * WORDS_PER_ROW + (x >> 4)] ?? 0) >> bitOfPixel(x)) & 1) === 1

/* ------------------------------------------------------------------ *
 * The glyph cell, decided before a single glyph is drawn.
 * ------------------------------------------------------------------ */

/**
 * A glyph is 8 rows of 8 bits. Choosing the cell before authoring the font is
 * what makes the font drawable at all — the alternative is drawing letters and
 * then discovering they do not fit the grid.
 */
export const GLYPH_WIDTH = 8
export const GLYPH_HEIGHT = 8
export type Glyph = readonly number[]

/** Every glyph is this wide, whether or not it uses all eight columns. */
export const GLYPH_PITCH = GLYPH_WIDTH + 1

/**
 * The scale chosen for a single line of text.
 *
 * At 4x an 8x8 cell becomes 32x32 with a 4px gap, so one character advances
 * 36px. "Hello world" is eleven characters: 11 * 36 - 4 = 392px of a 512px
 * screen, centred at x = 60, y = 112. Fits, with room to spare, and stays
 * legible at one pixel per gate.
 */
export const TEXT_SCALE = 4
export const CHAR_ADVANCE = GLYPH_PITCH * TEXT_SCALE // 36

/**
 * Where a run of text sits on the screen. Computed from the numbers above
 * rather than typed in, so changing the scale moves the text with it.
 */
export interface TextPlacement {
  x: number
  y: number
}

export const placeText = (text: string, scale: number = TEXT_SCALE): TextPlacement => {
  const advance = GLYPH_PITCH * scale
  const width = text.length * advance - scale
  const height = GLYPH_HEIGHT * scale
  return {
    x: Math.max(0, Math.floor((SCREEN_WIDTH - width) / 2)),
    y: Math.max(0, Math.floor((SCREEN_HEIGHT - height) / 2)),
  }
}

/** Blit one scaled glyph onto the screen. */
export const drawGlyph = (
  screen: number[],
  glyph: Glyph,
  atX: number,
  atY: number,
  scale: number = TEXT_SCALE,
): void => {
  for (let row = 0; row < GLYPH_HEIGHT; row++) {
    const bits = glyph[row] ?? 0
    for (let col = 0; col < GLYPH_WIDTH; col++) {
      if (((bits >> col) & 1) !== 1) continue
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          setPixel(screen, atX + col * scale + dx, atY + row * scale + dy)
        }
      }
    }
  }
}

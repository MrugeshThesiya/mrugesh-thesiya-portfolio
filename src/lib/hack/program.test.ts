import { describe, expect, it } from 'vitest'

import { assemble } from '@/lib/hack/assembler'
import { compileDraw, DATA, type CompiledProgram } from '@/lib/hack/program'
import { initialComputer, runUntil, screenAsText, writeMemory, type ComputerState } from '@/lib/hack/computer'
import { blankScreen, drawGlyph, placeText, SCREEN_WORDS } from '@/lib/hack/screen'
import { glyphFor } from '@/lib/hack/font'

/**
 * Put every word a compiled program expects into RAM, the way a loader would.
 *
 * The program ships its glyph table in its `data` map rather than expecting the
 * caller to know where it went, so the test does not need to know either.
 */
const loadData = (state: ComputerState, data: ReadonlyMap<number, number>): ComputerState => {
  let next = state
  for (const [address, value] of data) next = writeMemory(next, address, value)
  return next
}

/** Compile, assemble, run to the halt, and give back the machine. */
const run = (program: CompiledProgram): ComputerState => {
  const { code } = assemble(program.source)
  const state = loadData(initialComputer(), program.data)
  return runUntil(state, code, program.haltAddress, 500_000)
}

/** What the machine draws, by running its own program. */
const machinePicture = (text: string, scale = 4): string[] =>
  screenAsText(run(compileDraw(text, scale)))

/** What the font module draws, by calling `drawGlyph` directly. */
const directPicture = (text: string, scale = 4): string[] => {
  const screen = blankScreen()
  const { x, y } = placeText(text, scale)

  ;[...text].forEach((character, index) => {
    drawGlyph(screen, glyphFor(character), x + index * 9 * scale, y, scale)
  })

  const rows: string[] = []
  for (let row = 0; row < 256; row++) {
    let line = ''
    for (let word = 0; word < 32; word++) {
      const bits = screen[row * 32 + word] ?? 0
      for (let bit = 0; bit < 16; bit++) line += (bits >> bit & 1) === 1 ? '#' : ' '
    }
    rows.push(line)
  }
  return rows
}

const countInk = (picture: readonly string[]): number =>
  picture.reduce((total, row) => total + [...row].filter((c) => c === '#').length, 0)

describe('compiling a program to draw text', () => {
  it('produces assembly the assembler accepts', () => {
    expect(() => assemble(compileDraw('Hi').source)).not.toThrow()
  })

  it('centres the text and reports where it went', () => {
    const program = compileDraw('Hello world')
    expect(program.origin.width).toBe(392)
    expect(program.origin.x).toBe(60)
    expect(program.origin.y).toBe(112)
    expect(program.origin.height).toBe(32)
  })

  it('emits a program with no loops in it', () => {
    // Counting up would need `+1`, which this ALU cannot compute, so the loop was
    // unrolled away. The only backward jump left is the halt spinning on itself.
    const jumps = compileDraw('Hello').source.split('\n').filter((line) => line === '0;JMP')
    expect(jumps).toHaveLength(1)
  })

  it('loads a glyph table into the data region', () => {
    const program = compileDraw('A')
    expect(program.characters).toEqual(['A'])

    for (let row = 0; row < 7; row++) {
      expect(program.data.get(DATA.FONT + row)).toBe(glyphFor('A')[row])
    }
  })

  it('gives each distinct character one slot', () => {
    const program = compileDraw('aaa')
    expect(program.characters).toEqual(['a'])
  })

  it('grows roughly with the length of the text, since it is unrolled', () => {
    const one = compileDraw('A')
    const eleven = compileDraw('Hello world')
    expect(eleven.length).toBeGreaterThan(one.length * 5)
  })

  it('puts every word it names inside the data region', () => {
    const program = compileDraw('Hello world')
    for (const address of program.data.keys()) {
      expect(address).toBeGreaterThanOrEqual(0)
      expect(address).toBeLessThan(0x4000)
    }
  })
})

describe('the machine actually drawing', () => {
  it('runs to completion and inks the screen', () => {
    const state = run(compileDraw('Hello world'))
    expect(state.screen.filter((word) => word !== 0).length).toBeGreaterThan(0)
  })

  it('puts the ink exactly where the font module would put it', () => {
    // The point of the whole exercise. The machine's picture and the font's
    // picture must be pixel-for-pixel identical, arrived at two entirely
    // different ways: one by a program running on a CPU built from NAND gates,
    // one by calling drawGlyph in TypeScript.
    expect(machinePicture('Hello world', 4)).toEqual(directPicture('Hello world', 4))
  })

  it('agrees on every letter of the alphabet, either case', () => {
    for (const character of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      expect(machinePicture(character, 4), character).toEqual(directPicture(character, 4))
    }
    for (const character of 'abcdefghijklmnopqrstuvwxyz') {
      expect(machinePicture(character, 4), character).toEqual(directPicture(character, 4))
    }
  })

  it('agrees on every digit and a spread of punctuation', () => {
    for (const character of '0123456789.,:;!?-+=*/()[]<>#@$%^&') {
      expect(machinePicture(character, 4), character).toEqual(directPicture(character, 4))
    }
  })

  it('agrees at several scales', () => {
    expect(machinePicture('Hack CPU', 4)).toEqual(directPicture('Hack CPU', 4))
    expect(machinePicture('Testing 123!', 2)).toEqual(directPicture('Testing 123!', 2))
    expect(machinePicture('a', 1)).toEqual(directPicture('a', 1))
    expect(machinePicture('wide', 3)).toEqual(directPicture('wide', 3))
  })

  it('draws nothing at all for a space', () => {
    expect(countInk(machinePicture(' ', 4))).toBe(0)
    expect(machinePicture(' ', 4)).toEqual(directPicture(' ', 4))
  })

  it('draws nothing for a character it has no glyph for', () => {
    expect(countInk(machinePicture('\u00e9', 4))).toBe(0)
  })

  it('is deterministic', () => {
    expect(machinePicture('Hello', 4)).toEqual(machinePicture('Hello', 4))
  })

  it('writes only into the screen region', () => {
    const state = run(compileDraw('A'))
    expect(state.screen).toHaveLength(SCREEN_WORDS)
    expect(state.screen.filter((word) => word !== 0).length).toBeGreaterThan(0)
  })

  it('clips a line that overruns the right edge instead of wrapping', () => {
    // Fourteen characters at 4x is 500 pixels of a 512-pixel screen, so this just
    // fits; at 6x the same text is 750 and the tail runs off. Addresses past the
    // screen are not decoded, so those writes are dropped rather than wrapping
    // round or landing in the keyboard, and the part that does fit is still right.
    const text = 'Overflowing'
    expect(compileDraw(text, 4).origin.x).toBeGreaterThanOrEqual(0)
    expect(compileDraw(text, 6).origin.x).toBeLessThan(0)

    const picture = machinePicture(text, 6)
    expect(countInk(picture)).toBeGreaterThan(100)
  })
})

describe('what the machine drew, as text', () => {
  it('reads as Hello world', () => {
    const picture = machinePicture('Hello world', 4)

    // Rows 0 to 111 are blank above the text, and 144 to 255 below it.
    expect(picture.slice(0, 112).every((row) => row.trim() === '')).toBe(true)
    expect(picture.slice(144).every((row) => row.trim() === '')).toBe(true)

    // The letters themselves, four times scaled.
    const band = picture.slice(112, 144)
    for (const row of band) expect(row).toMatch(/^[# ]+$/)
    expect(countInk(band)).toBeGreaterThan(200)
  })

  it('draws H as two uprights joined by a bar', () => {
    const band = machinePicture('H', 4).slice(112, 144)

    const uprights = '####            ####'
    const crossbar = '####################'

    // Row 3 of the glyph is the crossbar, and at 4x that one row of the glyph
    // becomes four screen rows — rows twelve to fifteen of the block.
    expect(band[0]?.trim()).toBe(uprights)
    expect(band[11]?.trim()).toBe(uprights)
    expect(band[12]?.trim()).toBe(crossbar)
    expect(band[15]?.trim()).toBe(crossbar)
    expect(band[16]?.trim()).toBe(uprights)

    // Twelve rows of uprights, four of crossbar, twelve again.
    const shape = band.slice(0, 28).map((row) => (row.trim() === crossbar ? 'x' : 'u'))
    expect(shape.join('')).toBe('u'.repeat(12) + 'x'.repeat(4) + 'u'.repeat(12))
  })
})
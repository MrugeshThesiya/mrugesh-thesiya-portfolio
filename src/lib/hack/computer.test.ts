import { describe, expect, it } from 'vitest'

import { assemble } from '@/lib/hack/assembler'
import {
  ADDRESS_SPACE,
  isKeyboard,
  isRam,
  isScreen,
  initialComputer,
  readMemory,
  run,
  runUntil,
  screenAsText,
  step,
  writeMemory,
  type ComputerState,
} from '@/lib/hack/computer'
import { C_INSTRUCTION } from '@/lib/hack/cpu.test-helpers'
import {
  KEYBOARD,
  SCREEN_BASE,
  SCREEN_WORDS,
  addressOfPixel,
  bitOfPixel,
  isPixelSet,
} from '@/lib/hack/screen'
import { toNumber } from '@/lib/bus'

/** A machine with some data in it, for tests about memory rather than programs. */
const withWord = (state: ComputerState, address: number, value: number): ComputerState =>
  writeMemory(state, address, value)

describe('the memory map', () => {
  it('splits the address space into three regions and a hole', () => {
    expect(ADDRESS_SPACE).toBe(0x8000)
    expect(isRam(0x0000)).toBe(true)
    expect(isRam(0x3fff)).toBe(true)

    expect(isScreen(SCREEN_BASE)).toBe(true)
    expect(isScreen(0x5fff)).toBe(true)

    expect(isKeyboard(KEYBOARD)).toBe(true)
    expect(KEYBOARD).toBe(0x6000)

    // Above the keyboard nothing is decoded.
    expect(isRam(0x6001)).toBe(false)
    expect(isScreen(0x6001)).toBe(false)
    expect(isKeyboard(0x6001)).toBe(false)
  })

  it('leaves no gap and no overlap between RAM and the screen', () => {
    expect(SCREEN_BASE).toBe(0x4000)
    expect(SCREEN_BASE + SCREEN_WORDS).toBe(0x6000)
    expect(KEYBOARD).toBe(SCREEN_BASE + SCREEN_WORDS)
  })

  it('reads an address in no region as zero rather than failing', () => {
    const state = initialComputer()
    expect(readMemory(state, 0x7000)).toBe(0)
  })
})

describe('reading and writing memory', () => {
  it('stores and returns a word in the data region', () => {
    const state = withWord(initialComputer(), 1234, 0xbeef)
    expect(readMemory(state, 1234)).toBe(0xbeef)
  })

  it('stores and returns a word in the screen region', () => {
    const state = withWord(initialComputer(), SCREEN_BASE + 5, 0x0ff0)
    expect(readMemory(state, SCREEN_BASE + 5)).toBe(0x0ff0)
    expect(state.screen[5]).toBe(0x0ff0)
  })

  it('keeps RAM and the screen apart', () => {
    let state = withWord(initialComputer(), 10, 0x1111)
    state = withMemory(state, SCREEN_BASE + 10, 0x2222)

    expect(readMemory(state, 10)).toBe(0x1111)
    expect(readMemory(state, SCREEN_BASE + 10)).toBe(0x2222)
  })

  it('ignores a write to the keyboard, because a key does not move', () => {
    const state = initialComputer(7)
    expect(readMemory(state, KEYBOARD)).toBe(7)
    expect(readMemory(writeMemory(state, KEYBOARD, 99), KEYBOARD)).toBe(7)
  })

  it('ignores a write to an undecoded address', () => {
    expect(writeMemory(initialComputer(), 0x7000, 99)).toEqual(initialComputer())
  })

  it('does not mutate the state it was given', () => {
    const state = initialComputer()
    writeMemory(state, 100, 0x1234)
    expect(readMemory(state, 100)).toBe(0)
  })
})

/** Write a screen word directly, for tests about pixels rather than programs. */
const withMemory = (state: ComputerState, address: number, value: number): ComputerState =>
  writeMemory(state, address, value)

describe('one instruction', () => {
  it('advances the program counter', () => {
    const program = [C_INSTRUCTION('D', { a: 1 })]
    const { state } = step(initialComputer(), program)
    expect(toNumber(state.cpu.pc)).toBe(1)
  })

  it('fetches an instruction from the program, not from memory', () => {
    // 0x1234 in RAM must not be mistaken for an instruction.
    const state = withWord(initialComputer(), 0, 0x1234)
    const program = [C_INSTRUCTION('D', { a: 1 })]
    expect(toNumber(step(state, program).state.cpu.a)).toBe(0)
  })

  it('reads its data operand from memory', () => {
    // @0 ; D=M
    const program = assemble('@0\nD=M').code
    const state = withWord(initialComputer(), 0, 0xabcd)

    expect(toNumber(run(state, program, 2).cpu.d)).toBe(0xabcd)
  })

  it('writes to memory only when told to', () => {
    const store = assemble('@9\nM=D').code
    const noStore = assemble('@9\nD=A').code

    expect(toNumber(run(initialComputer(), store, 2).cpu.d)).toBe(0)
    expect(readMemory(run(initialComputer(), store, 2), 9)).toBe(0)

    // The second program never writes, so address 9 stays clear.
    run(initialComputer(), noStore, 2)
    expect(readMemory(initialComputer(), 9)).toBe(0)
  })

  it('puts the ALU result in A and in D', () => {
    const program = assemble('@7\nD=A').code
    const state = run(initialComputer(), program, 2)
    expect(toNumber(state.cpu.a)).toBe(7)
    expect(toNumber(state.cpu.d)).toBe(7)
  })
})

describe('programs running on the whole machine', () => {
  it('adds two memory locations', () => {
    const program = assemble('@R0\nD=M\n@R1\nD=D+M\n@R2\nM=D').code

    let state = initialComputer()
    state = withWord(state, 0, 20)
    state = withWord(state, 1, 22)
    state = run(state, program, 6)

    expect(readMemory(state, 2)).toBe(42)
  })

  it('takes a jump that holds, and falls through one that does not', () => {
    // If RAM[0] is below 3, skip the store. Two runs, because a jump that always
    // fires and a jump that never fires are equally broken and equally easy to
    // mistake for one another.
    const program = [
      '@0', // 0
      'D=M', // 1  D = RAM[0]
      '@3', // 2
      'D=D-A', // 3  D = RAM[0] - 3
      '@END', // 4
      'D;JLT', // 5  leave if RAM[0] was below 3
      '@1', // 6
      'M=D', // 7  RAM[1] = RAM[0] - 3
      '(END)', // 8
      '0;JMP', // 8  spin here, so a stopped machine is observable
    ].join('\n')

    const { code, symbols } = assemble(program)
    const end = symbols.get('END')!
    expect(end).toBe(8)

    // RAM[0] = 7, so the comparison is 4 and the jump does not fire.
    const fellThrough = runUntil(withWord(initialComputer(), 0, 7), code, end, 100)
    expect(readMemory(fellThrough, 1)).toBe(4)
    expect(toNumber(fellThrough.cpu.pc)).toBe(end)

    // RAM[0] = 1, so the comparison goes negative and the jump fires, and the
    // store never happens.
    const jumped = runUntil(withWord(initialComputer(), 0, 1), code, end, 100)
    expect(readMemory(jumped, 1)).toBe(0)
    expect(toNumber(jumped.cpu.pc)).toBe(end)
  })

  it('counts with D-1, which is reachable, where D+1 would not be', () => {
    // Ten decrements from 10 land on zero. This is what the missing `+1` costs
    // in practice: counting up needs a constant of -1 to subtract, and counting
    // down is free because all-ones *is* -1.
    const program = [
      '@10', // 0
      'D=A', // 1  D = 10
      '(LOOP)', // 2
      'D=D-1', // 2  count down
      '@END', // 3
      'D;JLT', // 4  leave once D has gone negative
      '@LOOP', // 5
      '0;JMP', // 6
      '(END)', // 7
      '0;JMP', // 7  spin, so a stopped machine can be seen
    ].join('\n')

    const { code, symbols } = assemble(program)
    const state = runUntil(initialComputer(), code, symbols.get('END')!, 200)

    // Eleven decrements take D from 10 down to -1, and then it stops.
    expect(toNumber(state.cpu.d)).toBe(0xffff)
    expect(toNumber(state.cpu.pc)).toBe(symbols.get('END'))

    // Counting up would need the unreachable `D+1`. Subtracting a constant of -1
    // is the way round it, and it costs one extra instruction and one word.
    const upward = assemble('@5\nD=A\n@3\nD=D-A').code
    const counted = run(initialComputer(), upward, 4)
    expect(toNumber(counted.cpu.d)).toBe(2)
  })

  it('halts at a label instead of running away', () => {
    const program = assemble('@7\n(A)\n@0\n0;JMP').code
    const state = runUntil(initialComputer(), program, 1, 20)
    expect(toNumber(state.cpu.pc)).toBe(1)
  })
})

describe('the screen is memory', () => {
  it('writes pixels into words and reads them back as pixels', () => {
    const state = withMemory(initialComputer(), SCREEN_BASE, 0b1010)
    const screen = state.screen as number[]

    expect(isPixelSet(screen, 0, 0)).toBe(false)
    expect(isPixelSet(screen, 1, 0)).toBe(true)
    expect(isPixelSet(screen, 2, 0)).toBe(false)
    expect(isPixelSet(screen, 3, 0)).toBe(true)
  })

  it('puts every pixel where the screen map says it goes', () => {
    // Word 0 of the screen is the first sixteen pixels of the first row, and
    // pixel x lives in bit x of it.
    const state = withMemory(initialComputer(), SCREEN_BASE, 0b1)
    expect(isPixelSet(state.screen as number[], 0, 0)).toBe(true)

    // Row 1 starts 32 words further on.
    expect(addressOfPixel(0, 1) - SCREEN_BASE).toBe(32)
    expect(bitOfPixel(7)).toBe(7)

    // The last pixel of the last row is the last word, last bit.
    expect(addressOfPixel(511, 255) - SCREEN_BASE).toBe(SCREEN_WORDS - 1)
    expect(bitOfPixel(511)).toBe(15)
  })

  it('renders as a picture, one string per row', () => {
    const state = withMemory(initialComputer(), SCREEN_BASE + 5, 0b101)
    const picture = screenAsText(state)

    expect(picture).toHaveLength(256)
    expect(picture[0]).toHaveLength(512)

    // Word 5 covers pixels 80 to 95, and bit 0 is the leftmost of them, so
    // 0b101 puts ink at 80 and 82.
    expect(picture[0]?.slice(80, 96)).toBe('# #             ')
    expect(picture[1]).toBe(' '.repeat(512))
  })
})
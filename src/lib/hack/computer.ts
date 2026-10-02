/**
 * The Computer — the whole machine in one box.
 *
 * Five parts that already exist and were each tested alone:
 *
 *     a CPU         three registers and one ALU
 *     a RAM16K      16384 words of data
 *     a screen      8192 words, 512 x 256 pixels
 *     a keyboard    one word
 *     a ROM         the program, held separately
 *
 * The only thing this file adds is a memory map. Address space is one flat run
 * of 32768 words, and the hardware decides what each range of it means:
 *
 *     0x0000 - 0x3FFF   RAM16K    the data region
 *     0x4000 - 0x5FFF   Screen     8192 words, 512 x 256 pixels
 *     0x6000            Keyboard   one word
 *     0x6001 - 0x7FFF   unused
 *
 * The screen is memory. There is no framebuffer, no graphics card, no driver and
 * no copy step: a program writes a word at 0x4123 and that *is* sixteen pixels.
 * Which means the CPU can draw letters by doing arithmetic and nothing else,
 * once there is a program telling it where each bit goes.
 *
 * The screen's 8192 words are held as their own flat array rather than addressed
 * through the RAM chip, for the same reason the decode lives here and not in the
 * chip: deciding *which* storage an address means is the machine's job. A RAM
 * chip asked about an address past its last word would be answering a question it
 * was never built to answer.
 *
 * The program lives outside memory, as it does on real hardware. The CPU has a
 * ROM input, and that is the entire mechanism by which instructions differ from
 * data: the address bus is consulted once, at the top of the machine.
 */

import { cpu, initialCpu, type CpuState } from '@/lib/hack/cpu'
import { initialRam16k, ram16kRead, ram16kWrite, type Ram16kState } from '@/lib/hack/ram16k'
import { KEYBOARD, SCREEN_BASE, SCREEN_WORDS, blankScreen } from '@/lib/hack/screen'
import { toNumber } from '@/lib/bus'

export { KEYBOARD, SCREEN_BASE, SCREEN_WORDS }

/** Total addressable words, including the ranges the machine does not use. */
export const ADDRESS_SPACE = 0x8000

export interface ComputerState {
  cpu: CpuState
  /** The data region, 0x0000 to 0x3FFF. */
  ram: Ram16kState
  /** The screen's own words, 0x4000 to 0x5FFF. */
  screen: readonly number[]
  /** What the keyboard last reported, at 0x6000. */
  keyboard: number
  /** The instruction executed by the last step, for anyone watching. */
  instruction: number
}

export interface StepResult {
  state: ComputerState
  /** True when the instruction just executed asked for a memory write. */
  wroteMemory: boolean
  /** True when it jumped. */
  jumped: 0 | 1
}

/** A machine with nothing in memory and no keyboard input. */
export const initialComputer = (keyboard = 0): ComputerState => ({
  cpu: initialCpu(),
  ram: initialRam16k(),
  screen: blankScreen(),
  keyboard,
  instruction: 0,
})

export const isRam = (address: number): boolean => address < SCREEN_BASE

export const isScreen = (address: number): boolean =>
  address >= SCREEN_BASE && address < SCREEN_BASE + SCREEN_WORDS

export const isKeyboard = (address: number): boolean => address === KEYBOARD

/**
 * Sixteen bits of a value, low bit first.
 *
 * Allocated per call rather than shared, because a chip must not be handed the
 * same array twice in one expression and quietly alias.
 */
const bits = (value: number) =>
  Array.from({ length: 16 }, (_, bit) => ((value >> bit) & 1) as 0 | 1)

/**
 * Read one word, wherever it lives.
 *
 * An address in no region at all reads as zero rather than raising. On real
 * hardware an undecoded address is an open bus, and zero is the closest thing to
 * that which does not stop the program.
 */
export const readMemory = (state: ComputerState, address: number): number => {
  if (isScreen(address)) return state.screen[address - SCREEN_BASE] ?? 0
  if (isKeyboard(address)) return state.keyboard
  if (isRam(address)) return toNumber(ram16kRead(state.ram, address))
  return 0
}

/** Write one word, wherever it lives. The keyboard and unused space ignore writes. */
export const writeMemory = (state: ComputerState, address: number, value: number): ComputerState => {
  if (isScreen(address)) {
    const screen = state.screen.slice()
    screen[address - SCREEN_BASE] = value
    return { ...state, screen }
  }

  if (isRam(address)) {
    return { ...state, ram: ram16kWrite(state.ram, address, bits(value)) }
  }

  return state
}

/** The instruction the CPU would fetch at an address, zero past the end. */
export const instructionAt = (program: readonly number[], address: number): number =>
  program[address] ?? 0

/**
 * Execute one instruction.
 *
 * The order is the machine's, and it matters. The instruction comes from the
 * program, the data operand from memory, the CPU decides everything in one go,
 * and only then does the write land. That is why a program cannot read back a
 * value it has just written: the write happens at the clock edge, after the read
 * this same instruction already did.
 */
export const step = (state: ComputerState, program: readonly number[]): StepResult => {
  const instruction = instructionAt(program, toNumber(state.cpu.pc))
  const inM = bits(readMemory(state, toNumber(state.cpu.a)))

  const result = cpu(inM, bits(instruction), state.cpu)

  let next: ComputerState = { ...state, cpu: result.next, instruction }
  if (result.writeM === 1) {
    next = writeMemory(next, toNumber(result.addressM), toNumber(result.aluOut))
  }

  return { state: next, wroteMemory: result.writeM === 1, jumped: result.jumped }
}

/** Run a fixed number of instructions. */
export const run = (
  state: ComputerState,
  program: readonly number[],
  steps: number,
): ComputerState => {
  let current = state
  for (let i = 0; i < steps; i++) current = step(current, program).state
  return current
}

/**
 * Run until the program reaches an address, or the step budget runs out.
 *
 * Returning the state either way means a program with a bug is still
 * observable rather than hanging, which matters when the only way to see what a
 * program did is to run it.
 */
export const runUntil = (
  state: ComputerState,
  program: readonly number[],
  haltAddress: number,
  maxSteps = 1_000_000,
): ComputerState => {
  let current = state
  let steps = 0

  while (steps < maxSteps && toNumber(current.cpu.pc) !== haltAddress) {
    current = step(current, program).state
    steps += 1
  }

  return current
}

/** The screen as a picture: one string of '#' and ' ' per row, top row first. */
export const screenAsText = (state: ComputerState): string[] => {
  const rows: string[] = []
  for (let y = 0; y < 256; y++) {
    let line = ''
    for (let word = 0; word < 32; word++) {
      const bits = state.screen[y * 32 + word] ?? 0
      for (let bit = 0; bit < 16; bit++) line += (bits >> bit & 1) === 1 ? '#' : ' '
    }
    rows.push(line)
  }
  return rows
}
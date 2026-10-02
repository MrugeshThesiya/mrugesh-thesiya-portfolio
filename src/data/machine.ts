/**
 * What the machine turned out to be.
 *
 * The showcase reads this rather than hardcoding numbers in components, so the
 * claims on the page and the claims in the tests come from one place. Where a
 * number is a measurement rather than an assertion — a NAND count, a figure of
 * merit — `measured: true` is set, and the UI says so.
 */

import { COMPS } from '@/lib/hack/alu'
import { RAM16K_WORDS } from '@/lib/hack/ram16k'
import { SCREEN_HEIGHT, SCREEN_WIDTH, SCREEN_WORDS } from '@/lib/hack/screen'
import { WORD_WIDTH } from '@/lib/bus'

export interface Part {
  id: string
  name: string
  /** What it does, in one line. */
  role: string
  /** What it is made of, where that is knowable. */
  cost?: string
  /** True when the cost was measured rather than assumed. */
  measured?: boolean
  source: string
}

export const PARTS: readonly Part[] = [
  { id: 'nand', name: 'nand', role: 'The only primitive. Out is low only when both inputs are high.', cost: '1', source: 'src/lib/nand.ts' },
  { id: 'xor', name: 'xor', role: 'High when the inputs disagree. The first gate that needs four of them.', cost: '4', source: 'src/lib/gates/xor.ts' },
  { id: 'add16', name: 'add16', role: 'The first arithmetic. Sixteen full adders, each carrying into the next.', cost: '231', measured: true, source: 'src/lib/bus/add16.ts' },
  { id: 'alu', name: 'alu', role: 'One circuit and six switches, giving 21 expressions from two inputs.', cost: '6 control bits', source: 'src/lib/hack/alu.ts' },
  { id: 'cpu', name: 'cpu', role: 'Three registers and one ALU. That is the entire processor.', source: 'src/lib/hack/cpu.ts' },
  { id: 'ram16k', name: 'ram16k', role: 'The data region, sixteen thousand words of sixteen bits.', cost: `${RAM16K_WORDS.toLocaleString()} words`, source: 'src/lib/hack/ram16k.ts' },
  { id: 'assembler', name: 'assembler', role: 'Text into machine code, in two passes: labels first, then numbers.', source: 'src/lib/hack/assembler.ts' },
  { id: 'screen', name: 'screen', role: '8192 words at 0x4000, mapped to 512 x 256 pixels.', source: 'src/lib/hack/screen.ts' },
  { id: 'font', name: 'font', role: 'Every printable ASCII character, seven rows of five pixels.', source: 'src/lib/hack/font.ts' },
  { id: 'program', name: 'compileDraw', role: 'Emits the assembly that writes the text, one run of pixels at a time.', source: 'src/lib/hack/program.ts' },
]

export interface Unreachable {
  name: string
  why: string
}

/**
 * Expressions the instruction set implies and this ALU cannot do.
 *
 * Kept because the absences are the most interesting thing in the project. Each
 * one is a consequence of the six-flag design, not an oversight, and each has a
 * structural reason that can be stated in a sentence.
 */
export const UNREACHABLE: readonly Unreachable[] = [
  { name: '1', why: 'An operand can only be 0, an input, or its complement. All-ones is −1, never +1.' },
  { name: 'D+1', why: 'Nothing to increment with. All-ones adds −1, which is why D−1 is free and D+1 is not.' },
  { name: 'A+1', why: 'Same reason. Counting up needs a constant −1 to subtract.' },
  { name: '−D', why: 'Subtracting needs a 1, and 1 is exactly what is missing.' },
  { name: 'D^A', why: 'XOR is (x+y) − 2(x&y). This ALU can add or and, never both, and has no carry-out.' },
  { name: 'M&A', why: 'The second operand is always D. There is no way to ask for A on the right.' },
]

export interface Spec {
  label: string
  value: string
  detail?: string
}

export const SPEC: readonly Spec[] = [
  { label: 'Word width', value: `${WORD_WIDTH} bits`, detail: 'and nothing else; a word is sixteen separate bits' },
  { label: 'Screen', value: `${SCREEN_WIDTH} × ${SCREEN_HEIGHT}`, detail: `${SCREEN_WORDS.toLocaleString()} words of memory` },
  { label: 'Data region', value: `0x0000–0x${(RAM16K_WORDS - 1).toString(16).toUpperCase()}`, detail: `${RAM16K_WORDS.toLocaleString()} words` },
  { label: 'ALU expressions', value: String(COMPS.length), detail: 'from 2 inputs and 6 control bits' },
  { label: 'Memory map', value: '3 regions', detail: 'RAM, screen, keyboard' },
]

/** The line of assembly the showcase runs, kept here so it can be displayed. */
export const SAMPLE_SOURCE: readonly string[] = [
  '// This is not TypeScript pretending to be assembly.',
  '// The program below is machine code the assembler produced,',
  '// and the screen it fills is 8192 words of the machine\'s memory.',
  '',
  '0x0000  @19983    A ← 19983          ; a screen word',
  '0x0001  0xF068    D=A ; M=D          ; start it at zero',
  '0x0002  @20703    A ← 20703',
  '0x0003  0xE308    D=A ; M=D          ; and its neighbour',
  '',
  '// The pattern of a word, repeated down the screen.',
  '// Every one of those instructions is arithmetic on NAND gates.',
]

/** Where the showcase's copy says the interesting numbers come from. */
export const PROVENANCE = [
  'NAND counts are measured by evaluating the gate and counting, not assumed.',
  'Every comp is verified by feeding it to the real ALU and checking the expression.',
  'The picture is compared pixel-for-pixel with the same text drawn by the font module.',
]
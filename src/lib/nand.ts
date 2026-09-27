/**
 * The NAND gate — the only primitive you are allowed to start from.
 *
 * Everything in Nand2Tetris, from NOT to an ALU to the CPU itself, is built
 * by wiring copies of this one gate together. NAND is universal: it can
 * express NOT, AND and OR, which means it can express arithmetic, memory
 * and control flow.
 *
 * The rule is one line, and it is the only line that matters:
 *
 *     out = NOT (a AND b)
 *
 * It is low in exactly one case — when both inputs are high — which is what
 * makes the gate a "negative AND".
 *
 * A gate has no memory. It does not store its inputs or remember its last
 * output; it is a function of its inputs and nothing else, so that is exactly
 * how it is written here. The switches on the page hold state, the gate does not.
 *
 * NOT, AND and OR are all built by wiring this one gate differently — see gates.ts.
 */

export type Bit = 0 | 1

/** The gate. High unless both inputs are high. */
export const nand = (a: Bit, b: Bit): Bit => (a & b) === 1 ? 0 : 1

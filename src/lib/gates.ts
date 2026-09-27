/**
 * The gate layer.
 *
 * One primitive (`nand`) and the four gates derived from it. There is nothing
 * else in here — every function below is `nand` calls wired together, which is
 * the whole argument of the project.
 */

export { nand, type Bit } from '@/lib/nand'
export { not } from '@/lib/gates/not'
export { and } from '@/lib/gates/and'
export { or } from '@/lib/gates/or'
export { xor } from '@/lib/gates/xor'

/**
 * The showcase: the machine, running, in the page.
 *
 * This is the thing the whole project exists to make possible. It assembles a
 * program, steps a CPU built out of NAND gates, and paints the resulting
 * 512 x 256 screen. Nothing is pre-rendered and nothing is faked — every pixel
 * on the canvas is a bit the machine wrote into its own memory.
 *
 * A canvas rather than DOM nodes, because 131,072 pixels as elements would be
 * absurd and 131,072 characters of text would have to be re-laid-out on every
 * frame. The frame is written through one `putImageData` of a 512 x 256 buffer,
 * which is a single memcpy — as opposed to a `fillRect` per lit pixel, which at
 * the end of the run would be about eight thousand draw calls every frame and
 * would saturate the main thread.
 *
 * It steps in batches on an animation frame rather than one instruction per
 * frame, because the program that draws a line of text is about twelve thousand
 * instructions long. One per frame would take four minutes; in batches it takes
 * a second or two.
 *
 * The machine lives in a ref rather than in state because it changes tens of
 * thousands of times per second and React has no business re-rendering for each
 * of those. Only the three numbers a reader cares about — status, instruction
 * count, and whether the run has finished — are state.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, RotateCcw, Square } from 'lucide-react'

import { assemble } from '@/lib/hack/assembler'
import { compileDraw } from '@/lib/hack/program'
import { initialComputer, step, type ComputerState } from '@/lib/hack/computer'
import { ram16kWrite } from '@/lib/hack/ram16k'
import { SCREEN_BASE, SCREEN_HEIGHT, SCREEN_WIDTH, SCREEN_WORDS } from '@/lib/hack/screen'
import { toNumber } from '@/lib/bus'

const TEXT = 'Hello world'
const SCALE = 4

/**
 * Instructions per frame.
 *
 * The whole program is around twelve thousand and the machine runs them in about
 * a hundred milliseconds, which is far too fast to see anything. One hundred and
 * fifty a frame stretches the run out to something like a second and a half,
 * which is slow enough that the letters visibly appear — and fast enough that
 * nobody waits.
 */
const BATCH = 150

/**
 * A black-and-white image buffer the size of the screen.
 *
 * One byte per pixel rather than four, so setting a pixel is a single store and
 * the whole thing packs into the canvas's RGBA buffer without arithmetic.
 */
const newBuffer = (): Uint8Array => new Uint8Array(SCREEN_WIDTH * SCREEN_HEIGHT)

type Status = 'idle' | 'running' | 'done'

/** Built once, at module load: compiling and assembling is not free. */
const DRAWING = compileDraw(TEXT, SCALE)
const PROGRAM = assemble(DRAWING.source).code

void newBuffer

/**
 * A machine with its glyph table loaded and nothing executed.
 *
 * The glyph table is eight words per distinct character and eleven characters
 * are distinct in "Hello world", so this is under a hundred writes. Loading it
 * through `writeMemory` would be honest but wasteful, since each write copies the
 * screen; writing the words straight into RAM is the same result for a fraction
 * of the cost, and the RAM chip is the thing that owns that storage anyway.
 */
const poweredOn = (): ComputerState => {
  const blank = initialComputer()
  let ram = blank.ram

  for (const [address, value] of DRAWING.data) {
    ram = ram16kWrite(ram, address, wordBits(value))
  }

  return { ...blank, ram }
}

/** Sixteen bits of a value, low bit first — the shape every chip here expects. */
const wordBits = (value: number) =>
  Array.from({ length: 16 }, (_, bit) => ((value >> bit) & 1) as 0 | 1)

export function ComputerScreen() {
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const frame = useRef<number | null>(null)
  const machine = useRef<ComputerState>(poweredOn())

  const [status, setStatus] = useState<Status>('idle')
  const [steps, setSteps] = useState(0)

  /**
   * Copy the machine's screen words into the canvas.
   *
   * Word 0 of the screen is the first sixteen pixels of the top row, and bit 0
   * is the leftmost — the same mapping screen.ts defines.
   */
  const paint = useCallback((state: ComputerState) => {
    const context = canvas.current?.getContext('2d')
    if (!context) return

    const image = context.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT)
    const pixels = image.data

    for (let index = 0; index < SCREEN_WORDS; index++) {
      const word = state.screen[index] ?? 0
      if (word === 0) continue

      const top = Math.floor(index / 32) * SCREEN_WIDTH
      const left = (index % 32) * 16

      for (let bit = 0; bit < 16; bit++) {
        if (((word >> bit) & 1) !== 1) continue
        const at = (top + left + bit) * 4
        pixels[at] = 255
        pixels[at + 1] = 255
        pixels[at + 2] = 255
        pixels[at + 3] = 255
      }
    }

    context.putImageData(image, 0, 0)
  }, [])

  // A blank screen on first paint. No setState needed, because nothing changed.
  useEffect(() => {
    paint(machine.current)
  }, [paint])

  useEffect(() => {
    if (status !== 'running') return

    const tick = () => {
      let taken = 0

      for (let i = 0; i < BATCH; i++) {
        if (toNumber(machine.current.cpu.pc) >= DRAWING.haltAddress) break
        machine.current = step(machine.current, PROGRAM).state
        taken += 1
      }

      paint(machine.current)
      setSteps((previous) => previous + taken)

      if (toNumber(machine.current.cpu.pc) >= DRAWING.haltAddress) {
        paint(machine.current)
        setStatus('done')
        return
      }

      frame.current = window.requestAnimationFrame(tick)
    }

    frame.current = window.requestAnimationFrame(tick)
    return () => {
      if (frame.current !== null) window.cancelAnimationFrame(frame.current)
    }
  }, [status, paint])

  const start = () => {
    if (status === 'done') {
      machine.current = poweredOn()
      paint(machine.current)
      setSteps(0)
    }
    setStatus('running')
  }

  const reset = () => {
    machine.current = poweredOn()
    paint(machine.current)
    setSteps(0)
    setStatus('idle')
  }

  const finished = status === 'done'

  return (
    <div className="border border-line-strong bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
        <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
          <span
            className={`size-1.5 ${status === 'idle' ? 'bg-dim' : 'bg-ink'}`}
            aria-hidden="true"
          />
          {status === 'idle' && 'Powered on · screen blank'}
          {status === 'running' && `Running · ${steps.toLocaleString()} instructions`}
          {finished && `Halted · ${steps.toLocaleString()} instructions`}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={start}
            disabled={status === 'running'}
            className="inline-flex items-center gap-2 border border-line-strong px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] text-ink uppercase transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {finished ? (
              <RotateCcw className="size-3" strokeWidth={2} aria-hidden="true" />
            ) : (
              <Play className="size-3" strokeWidth={2} aria-hidden="true" />
            )}
            {finished ? 'Again' : 'Run'}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={status === 'idle'}
            className="inline-flex items-center gap-2 border border-line-strong px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] text-muted uppercase transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Square className="size-3" strokeWidth={2} aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      <div className="bg-black p-4 sm:p-6">
        <canvas
          ref={canvas}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          role="img"
          aria-label={`The machine's screen: ${SCREEN_WIDTH} by ${SCREEN_HEIGHT} pixels, written by the computer into words at ${SCREEN_BASE}.`}
          className="mx-auto block w-full max-w-4xl border border-white/10 [image-rendering:pixelated]"
        />
      </div>

      <dl className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
        <Metric label="Program" value={`${DRAWING.length.toLocaleString()} instr.`} />
        <Metric label="Text" value={TEXT} />
        <Metric label="At" value={`${SCREEN_BASE} and up`} />
        <Metric label="Origin" value={`${DRAWING.origin.x}, ${DRAWING.origin.y}`} />
      </dl>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-5 py-4">
      <dt className="font-mono text-[10px] tracking-[0.14em] text-dim uppercase">{label}</dt>
      <dd className="mt-2 font-mono text-[13px] text-ink">{value}</dd>
    </div>
  )
}
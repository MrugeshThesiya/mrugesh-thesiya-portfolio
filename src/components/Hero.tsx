import { ArrowDown, ArrowRight } from 'lucide-react'

import { Container } from '@/components/Container'
import { GATES } from '@/data/gates'
import { WORD_GATES } from '@/data/wordGates'
import { PROGRESS } from '@/data/milestones'

/** What exists so far, grouped by width — one bit, then sixteen of it. */
const LAYERS = [
  { label: '1 bit', gates: GATES.map((gate) => gate.name) },
  { label: '16 bit', gates: WORD_GATES.map((gate) => gate.name) },
] as const

export function Hero() {

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-14 sm:pt-44 sm:pb-28">
      <div className="grid-bg grid-bg-fade pointer-events-none absolute inset-0 opacity-60" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 8%, rgb(255 255 255 / 0.055), transparent 70%)',
        }}
      />

      <Container className="relative">
        <p className="eyebrow mb-8 flex items-center gap-3">
          <span className="inline-block size-1.5 bg-ink" aria-hidden="true" />
          TypeScript · software for hardware
        </p>

        <h1 className="max-w-5xl text-[clamp(2.5rem,8vw,5.25rem)] leading-[0.95] font-medium tracking-[-0.045em] text-balance">
          <span className="block text-muted">Welcome to</span>
          <span className="mt-1 block">Mrugesh Thesiya&rsquo;s Portfolio</span>
        </h1>

        <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-muted sm:text-lg">
          I&rsquo;m a <span className="text-ink">TypeScript developer</span> who likes{' '}
          <span className="text-ink">software for hardware</span> — the seam where the two meet. So
          I&rsquo;m proving it instead of claiming it: a computer assembled from first principles,
          with every gate written in TypeScript and running in your browser.
        </p>

        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          It starts with the one gate everything else is made of, then widens. Five one-bit gates
          — <span className="text-ink">Nand, Not, And, Or, Xor</span> — and five sixteen-bit ones,
          every one built out of NAND and nothing else. The adder is the interesting one:{' '}
          <span className="text-ink">231 gates</span> for a single addition.
        </p>

        <div className="mt-10 max-w-lg">
          <div className="flex items-baseline justify-between gap-4">
            <span className="eyebrow">Built so far</span>
            <span className="font-mono text-xs text-muted">
              {PROGRESS.done} of {PROGRESS.total} chapters
            </span>
          </div>
          <div className="mt-3.5 flex flex-col gap-2">
            {LAYERS.map((layer) => (
              <div key={layer.label} className="flex items-baseline gap-3">
                <span className="w-11 shrink-0 font-mono text-[10px] tracking-[0.12em] text-dim uppercase">
                  {layer.label}
                </span>
                <ul className="flex flex-wrap gap-1.5">
                  {layer.gates.map((gate) => (
                    <li
                      key={gate}
                      className="border border-line px-2 py-0.5 font-mono text-[11px] text-dim"
                    >
                      {gate}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href="#gates"
            className="group inline-flex items-center gap-2.5 text-sm text-ink transition-colors"
          >
            <span className="border border-line-strong px-4 py-2.5 transition-colors group-hover:border-ink">
              Open the visualizer
            </span>
            <ArrowDown
              className="size-4 text-dim transition-transform group-hover:translate-y-0.5"
              strokeWidth={1.5}
            />
          </a>
          <a
            href="#about"
            className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
          >
            About the project
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </a>
        </div>
      </Container>
    </section>
  )
}

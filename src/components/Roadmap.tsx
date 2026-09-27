import { Check } from 'lucide-react'

import { Section } from '@/components/Section'
import { PROGRESS, TOTAL, milestonesByPhase, nextUp, type Milestone } from '@/data/milestones'

const pad = (value: number) => String(value).padStart(2, '0')

function ChapterRow({ item }: { item: Milestone }) {
  return (
    <li className="border border-line-strong bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-baseline gap-4">
          <span className="font-mono text-[11px] tabular-nums text-ink">{pad(item.chapter)}</span>
          <div className="min-w-0">
            <p className="font-mono text-[13px] text-ink">{item.title}.ts</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.summary}</p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-ink uppercase">
          <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />
          Done
        </span>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p className="eyebrow">TypeScript</p>
        <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
          {item.builds.map((build) => (
            <li key={build} className="font-mono text-[11.5px] text-muted">
              <span className="mr-1.5 text-dim" aria-hidden="true">
                —
              </span>
              {build}
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export function Roadmap() {
  const groups = milestonesByPhase()

  return (
    <Section
      id="roadmap"
      eyebrow="Build log"
      title={`${TOTAL} chapters, all of them built`}
      lede={
        <>
          One primitive, four gates, then sixteen of each. Every layer is the layer below it repeated
          across more wires, and every line is running in the visualizers above.{' '}
          <span className="text-ink">
            {PROGRESS.done} of {PROGRESS.total} complete
          </span>
          .
        </>
      }
    >
      <div className="border-b border-line">
        {groups.map(({ phase, items }) => (
          <div
            key={phase.id}
            className="grid gap-5 border-t border-line py-8 sm:grid-cols-[15rem_1fr] sm:gap-10"
          >
            <div>
              <p className="eyebrow">Phase {pad(phase.index)}</p>
              <h3 className="mt-3 text-lg font-medium tracking-[-0.02em]">{phase.title}</h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-dim">{phase.blurb}</p>
            </div>

            <ul className="grid gap-3">
              {items.map((item) => (
                <ChapterRow key={item.id} item={item} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 border border-dashed border-line p-6">
        <p className="eyebrow">Next up — not started</p>
        <h3 className="mt-3 text-lg font-medium tracking-[-0.02em]">{nextUp.title}</h3>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
          {nextUp.items.map((item) => (
            <li key={item} className="font-mono text-[11.5px] text-dim">
              <span className="mr-1.5 text-dim" aria-hidden="true">
                —
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

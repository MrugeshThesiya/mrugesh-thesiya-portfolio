import { ArrowUpRight } from 'lucide-react'

import { Section } from '@/components/Section'
import { Systems } from '@/components/Systems'
import { wdc } from '@/data/site'

export function Work() {
  return (
    <Section
      id="work"
      eyebrow="Work"
      title="Two systems in production"
      lede={
        <>
          Both live at portal.pdpu.ac.in, both replaced a manual process, and both are still mine to
          support, extend and deploy.
        </>
      }
    >
      <Systems />

      <article className="mt-6 border border-line p-6 sm:p-9">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h3 className="text-xl font-medium tracking-[-0.02em]">{wdc.title}</h3>
          <span className="font-mono text-[11px] tracking-[0.1em] text-ink uppercase">
            60+ students
          </span>
        </div>
        <p className="mt-1.5 text-sm text-dim">
          {wdc.org} · {wdc.period} · {wdc.place}
        </p>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">{wdc.summary}</p>
        <ul className="mt-6 max-w-2xl space-y-2.5 text-[14px] leading-relaxed text-muted">
          {wdc.responsibilities.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2.5 h-px w-3 shrink-0 bg-line-strong" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <a
          href={wdc.url}
          target="_blank"
          rel="noreferrer"
          className="group mt-7 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          Read the guides
          <ArrowUpRight
            className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        </a>
      </article>
    </Section>
  )
}

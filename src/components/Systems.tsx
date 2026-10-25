import { ArrowUpRight } from 'lucide-react'

import { systems, type System } from '@/data/site'

function SystemCard({ system, index }: { system: System; index: number }) {
  return (
    <article className="bg-bg p-6 sm:p-9">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <span className="font-mono text-[11px] tracking-[0.18em] text-dim">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="font-mono text-[11px] tracking-[0.1em] text-ink uppercase">
          {system.status}
        </span>
      </div>

      <h3 className="mt-4 text-xl leading-snug font-medium tracking-[-0.02em] text-balance">
        {system.name}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px] text-dim">
        {system.period ? (
          <>
            <span>{system.period}</span>
            <span aria-hidden="true">·</span>
          </>
        ) : null}
        <span>{system.role}</span>
      </div>

      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">{system.summary}</p>

      <ul className="mt-6 max-w-2xl space-y-2.5 text-[14px] leading-relaxed text-muted">
        {system.highlights.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2.5 h-px w-3 shrink-0 bg-line-strong" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <ul className="flex flex-wrap gap-1.5">
          {system.stack.map((tech) => (
            <li
              key={tech}
              className="border border-line px-2 py-0.5 font-mono text-[11px] text-dim"
            >
              {tech}
            </li>
          ))}
        </ul>
        {system.url ? (
          <a
            href={system.url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
          >
            Visit
            <ArrowUpRight
              className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </a>
        ) : null}
      </div>
    </article>
  )
}

export function Systems({ items = systems }: { items?: readonly System[] }) {
  return (
    <div className="grid gap-px border border-line bg-line">
      {items.map((system, index) => (
        <SystemCard key={system.id} system={system} index={index} />
      ))}
    </div>
  )
}

import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { roleTracks } from '@/data/roles'

export function RoleCards() {
  return (
    <ul className="grid gap-px border border-line bg-line md:grid-cols-3">
      {roleTracks.map((track, index) => (
        <li key={track.id}>
          <Link
            to={track.path}
            className="group flex h-full flex-col bg-bg p-6 transition-colors hover:bg-surface sm:p-7"
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-[11px] tracking-[0.18em] text-dim">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-[10px] tracking-[0.16em] text-dim uppercase transition-colors group-hover:text-ink">
                {track.navLabel}
              </span>
            </div>

            <h3 className="mt-5 text-lg leading-snug font-medium tracking-[-0.02em] text-balance">
              {track.label}
            </h3>
            <p className="mt-2 text-[15px] leading-snug text-ink">{track.card.blurb}</p>

            <ul className="mt-5 space-y-2 text-[13.5px] leading-relaxed text-muted">
              {track.card.points.map((point) => (
                <li key={point} className="flex gap-2.5">
                  <span className="mt-2 h-px w-2.5 shrink-0 bg-line-strong" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>

            <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm text-muted transition-colors group-hover:text-ink">
              Open this track
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

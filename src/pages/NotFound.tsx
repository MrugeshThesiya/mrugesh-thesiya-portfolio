import { Link } from 'react-router-dom'

import { Container } from '@/components/Container'
import { roleTracks } from '@/data/roles'

export default function NotFound() {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-28 sm:pt-48 sm:pb-36">
      <div className="grid-bg grid-bg-fade pointer-events-none absolute inset-0 opacity-50" />

      <Container className="relative">
        <p className="eyebrow">404</p>

        <h1 className="mt-6 max-w-3xl text-[clamp(2rem,6vw,3.5rem)] leading-[1.02] font-medium tracking-[-0.04em] text-balance">
          This page does not exist
        </h1>

        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
          The link may be old, or typed by hand. One of the three tracks below is almost certainly
          what you were after.
        </p>

        <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-3">
          {roleTracks.map((track) => (
            <li key={track.id}>
              <Link
                to={track.path}
                className="group flex h-full flex-col bg-bg p-5 transition-colors hover:bg-surface"
              >
                <span className="font-mono text-[10px] tracking-[0.16em] text-dim uppercase">
                  {track.navLabel}
                </span>
                <span className="mt-3 text-[15px] font-medium text-ink">{track.label}</span>
                <span className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                  {track.card.blurb}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 border border-line-strong px-4 py-2.5 text-sm text-ink transition-colors hover:border-ink"
        >
          Back to the homepage
        </Link>
      </Container>
    </section>
  )
}

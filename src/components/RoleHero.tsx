import { ArrowRight } from 'lucide-react'

import { Container } from '@/components/Container'
import { ResumeDownload } from '@/components/ResumeDownload'
import type { RoleTrack } from '@/data/roles'
import { resumeByRole, site } from '@/data/site'

export function RoleHero({ track }: { track: RoleTrack }) {
  const resume = resumeByRole[track.resumeId]

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-14 sm:pt-44 sm:pb-20">
      <div className="grid-bg grid-bg-fade pointer-events-none absolute inset-0 opacity-60" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 8%, rgb(255 255 255 / 0.055), transparent 70%)',
        }}
      />

      <Container className="relative">
        <p className="eyebrow mb-8 flex items-center gap-3">
          <span className="inline-block size-1.5 bg-ink" aria-hidden="true" />
          {site.name} · {track.hero.eyebrow}
        </p>

        <h1 className="max-w-5xl text-[clamp(2.25rem,7vw,4.5rem)] leading-[0.98] font-medium tracking-[-0.04em] text-balance">
          <span className="block text-muted">{track.hero.muted}</span>
          <span className="mt-1 block">{track.hero.strong}</span>
        </h1>

        <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">
          {track.hero.lede}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          {resume ? <ResumeDownload resume={resume} /> : null}
          <a
            href="/#roles"
            className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
          >
            Compare the three tracks
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

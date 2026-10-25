import { ArrowDown } from 'lucide-react'

import { Container } from '@/components/Container'
import { ResumeDownload } from '@/components/ResumeDownload'
import { resume, site } from '@/data/site'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-16 sm:pt-44 sm:pb-24">
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
          {site.name} · Product-minded Software Engineer · B.Tech CSE at PDEU
        </p>

        <h1 className="max-w-5xl text-[clamp(2.5rem,8vw,5.25rem)] leading-[0.95] font-medium tracking-[-0.045em] text-balance">
          <span className="block text-muted">I turn conversations</span>
          <span className="mt-1 block">into production software</span>
        </h1>

        <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-lg">
          <span className="text-ink">
            I took PDEU’s management portal from first requirements conversation to production.
          </span>{' '}
          It now serves 450+ students and 40+ faculty, and I still own its support, roadmap and
          deployment — talking to users, building, deploying and supporting, not one of those in
          isolation.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href="#work"
            className="group inline-flex items-center gap-2.5 text-sm text-ink transition-colors"
          >
            <span className="border border-line-strong px-4 py-2.5 transition-colors group-hover:border-ink">
              See the work
            </span>
            <ArrowDown
              className="size-4 text-dim transition-transform group-hover:translate-y-0.5"
              strokeWidth={1.5}
            />
          </a>
          <ResumeDownload resume={resume} />
        </div>
      </Container>
    </section>
  )
}

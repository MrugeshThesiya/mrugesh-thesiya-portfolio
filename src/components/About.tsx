import { ArrowUpRight } from 'lucide-react'

import { Section } from '@/components/Section'
import { PROGRESS, TOTAL } from '@/data/milestones'
import { site } from '@/data/site'

export function About() {
  return (
    <Section
      id="about"
      eyebrow="About"
      title="TypeScript, pointed at hardware"
      lede={
        <>
          Two things I care about, and one project where they meet. Everything claimed on this page
          is demonstrated on it.
        </>
      }
    >
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <div className="space-y-5 text-[15px] leading-relaxed text-muted">
            {site.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="text-muted">
              That is {PROGRESS.done} of {TOTAL} chapters, all of them built and all of them shown
              above with the code that runs them.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {site.focus.map((item) => (
              <div key={item.label} className="border border-line px-4 py-3">
                <p className="font-mono text-[12.5px] text-ink">{item.label}</p>
                <p className="mt-1 text-[12px] text-dim">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow">Elsewhere</p>
          <ul className="mt-4 border-t border-line">
            {site.social.map((link) => (
              <li key={link.label} className="border-b border-line">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-4 py-4 transition-colors"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm text-ink">{link.label}</span>
                    <span className="truncate font-mono text-[11.5px] text-dim">
                      {link.handle}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-dim transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                    strokeWidth={1.5}
                  />
                </a>
              </li>
            ))}
            <li className="border-b border-line">
              <a
                href={`mailto:${site.email}`}
                className="group flex items-center justify-between gap-4 py-4 transition-colors"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm text-ink">Email</span>
                  <span className="truncate font-mono text-[11.5px] text-dim">{site.email}</span>
                </span>
                <ArrowUpRight
                  className="size-4 shrink-0 text-dim transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  strokeWidth={1.5}
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Section>
  )
}

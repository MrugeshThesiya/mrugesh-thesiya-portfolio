import { Section } from '@/components/Section'
import { currently, site } from '@/data/site'

export function About() {
  return (
    <Section
      id="about"
      eyebrow="About"
      title="Discovery, deployment, and everything after"
      lede={<>Shipping to real users, understanding the system underneath, and explaining both clearly.</>}
    >
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="space-y-5 text-[15px] leading-relaxed text-muted">
          {site.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="border-t border-line pt-6 lg:border-t-0 lg:pt-0">
          <p className="eyebrow mb-4">Currently</p>
          <ul className="space-y-2.5 text-[14px] leading-relaxed text-muted">
            <li className="flex gap-3">
              <span className="mt-2.5 h-px w-3 shrink-0 bg-line-strong" aria-hidden="true" />
              <span className="text-ink">{currently.looking}</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2.5 h-px w-3 shrink-0 bg-line-strong" aria-hidden="true" />
              {currently.availability}
            </li>
            <li className="flex gap-3">
              <span className="mt-2.5 h-px w-3 shrink-0 bg-line-strong" aria-hidden="true" />
              {currently.based}
            </li>
          </ul>
        </div>
      </div>
    </Section>
  )
}

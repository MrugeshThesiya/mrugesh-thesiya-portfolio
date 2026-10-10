import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Section } from '@/components/Section'
import { contact, currently, site } from '@/data/site'

export function About() {
  return (
    <Section
      id="about"
      eyebrow="About"
      title="Discovery, deployment, and everything after"
      lede={<>Shipping to real users, understanding the system underneath, and explaining both clearly.</>}
    >
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <div className="space-y-5 text-[15px] leading-relaxed text-muted">
            {site.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 border-t border-line pt-6">
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

          <div className="mt-8 border-t border-line pt-6">
            <p className="eyebrow mb-4">Get in touch</p>
            <a
              href={`mailto:${contact.email}`}
              className="text-[15px] break-all text-ink transition-opacity hover:opacity-70"
            >
              {contact.email}
            </a>
            <span className="mx-3 text-dim" aria-hidden="true">
              ·
            </span>
            <a
              href={contact.phoneHref}
              className="font-mono text-[13px] text-muted transition-colors hover:text-ink"
            >
              {contact.phone}
            </a>
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
              <Link
                to="/engineering"
                className="group flex items-center justify-between gap-4 py-4 transition-colors"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm text-ink">Development Engineer</span>
                  <span className="truncate font-mono text-[11.5px] text-dim">/engineering</span>
                </span>
                <ArrowUpRight
                  className="size-4 shrink-0 text-dim transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  strokeWidth={1.5}
                />
              </Link>
            </li>
            <li className="border-b border-line">
              <Link
                to="/solutions"
                className="group flex items-center justify-between gap-4 py-4 transition-colors"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm text-ink">Solutions Engineer</span>
                  <span className="truncate font-mono text-[11.5px] text-dim">/solutions</span>
                </span>
                <ArrowUpRight
                  className="size-4 shrink-0 text-dim transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  strokeWidth={1.5}
                />
              </Link>
            </li>
            <li className="border-b border-line">
              <Link
                to="/product"
                className="group flex items-center justify-between gap-4 py-4 transition-colors"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm text-ink">Product Manager</span>
                  <span className="truncate font-mono text-[11.5px] text-dim">/product</span>
                </span>
                <ArrowUpRight
                  className="size-4 shrink-0 text-dim transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  strokeWidth={1.5}
                />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </Section>
  )
}

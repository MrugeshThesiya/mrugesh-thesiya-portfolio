import { ArrowUp } from 'lucide-react'

import { Container } from '@/components/Container'
import { resume, site } from '@/data/site'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line py-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr] sm:items-end">
          <div>
            <p className="eyebrow">Resumes</p>
            <a
              href={resume.file}
              download
              className="mt-4 block text-[clamp(1.25rem,3vw,1.75rem)] leading-tight font-medium tracking-[-0.03em] transition-opacity hover:opacity-70"
            >
              {resume.label} resume
            </a>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted">
              {resume.description}
            </p>
          </div>

          <div className="sm:text-right">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
              {site.social.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] tracking-[0.14em] text-dim uppercase transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#top"
              className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-dim uppercase transition-colors hover:text-ink sm:float-right"
            >
              Back to top
              <ArrowUp className="size-3" strokeWidth={1.75} />
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-6 font-mono text-[11px] text-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            {year} {site.name}
          </p>
        </div>
      </Container>
    </footer>
  )
}

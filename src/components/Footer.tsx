import { ArrowUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Container } from '@/components/Container'
import { roleTracks } from '@/data/roles'
import { contact, resumes, site } from '@/data/site'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line py-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr] sm:items-end">
          <div>
            <p className="eyebrow">Get in touch</p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-4 block text-[clamp(1.5rem,4vw,2.25rem)] leading-tight font-medium tracking-[-0.03em] break-all transition-opacity hover:opacity-70"
            >
              {contact.email}
            </a>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted">
              Open to development, solutions engineering and product management roles. Happy to walk
              through either system.
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

        <div className="mt-14 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
          <div>
            <p className="eyebrow">Tracks</p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {roleTracks.map((track) => (
                <li key={track.id}>
                  <Link
                    to={track.path}
                    className="font-mono text-[11px] tracking-[0.14em] text-dim uppercase transition-colors hover:text-ink"
                  >
                    {track.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Resumes</p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {resumes.map((resume) => (
                <li key={resume.id}>
                  <a
                    href={resume.file}
                    download
                    className="font-mono text-[11px] tracking-[0.14em] text-dim uppercase transition-colors hover:text-ink"
                  >
                    {resume.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-6 font-mono text-[11px] text-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            {year} {site.name}
          </p>
          <p>{contact.phone}</p>
        </div>
      </Container>
    </footer>
  )
}

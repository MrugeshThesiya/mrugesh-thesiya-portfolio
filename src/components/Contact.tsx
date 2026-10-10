import { Section } from '@/components/Section'
import { contact, resumes, site } from '@/data/site'

export function Contact({ note }: { note?: string }) {
  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Talk through any of it"
      lede={note ?? 'Happy to walk through the systems, the architecture, or the trade-offs behind them.'}
    >
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <a
            href={`mailto:${contact.email}`}
            className="block text-[clamp(1.375rem,4vw,2rem)] leading-tight font-medium tracking-[-0.03em] break-all transition-opacity hover:opacity-70"
          >
            {contact.email}
          </a>
          <a
            href={contact.phoneHref}
            className="mt-3 block font-mono text-[13px] text-muted transition-colors hover:text-ink"
          >
            {contact.phone}
          </a>

          <div className="mt-8 flex flex-wrap gap-3">
            {resumes.map((resume) => (
              <a
                key={resume.id}
                href={resume.file}
                download
                className="border border-line px-3 py-2 font-mono text-[11.5px] text-dim transition-colors hover:border-ink hover:text-ink"
              >
                {resume.label} resume
              </a>
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
                  className="group flex items-center justify-between gap-4 py-3.5 transition-colors"
                >
                  <span className="text-sm text-ink">{link.label}</span>
                  <span className="truncate font-mono text-[11.5px] text-dim">{link.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

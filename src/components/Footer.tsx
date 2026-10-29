import { ArrowUp } from 'lucide-react'

import { Container } from '@/components/Container'
import { site } from '@/data/site'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line py-10">
      <Container className="flex items-center justify-between gap-4 font-mono text-[11px] text-dim">
        <p>
          © {year} {site.name}
        </p>
        <a
          href="#top"
          className="inline-flex min-h-11 items-center gap-2 tracking-[0.14em] uppercase transition-colors hover:text-ink"
        >
          Back to top
          <ArrowUp className="size-3" strokeWidth={1.75} />
        </a>
      </Container>
    </footer>
  )
}

import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Container } from '@/components/Container'
import { github, site } from '@/data/site'

const links = [
  { label: 'Work', href: '#work' },
  { label: 'Background', href: '#experience' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      data-scrolled={scrolled || open ? '' : undefined}
      className="fixed inset-x-0 top-0 z-50 border-b border-transparent transition-colors duration-300 supports-[backdrop-filter]:bg-bg/70 data-scrolled:border-line data-scrolled:bg-bg/80 data-scrolled:backdrop-blur-md"
    >
      <Container className="flex h-16 items-center justify-between gap-4 sm:gap-6">
        <a
          href="#top"
          className="group flex shrink-0 items-center gap-3"
          aria-label={`${site.name} — back to top`}
        >
          <span className="grid size-7 place-items-center border border-line-strong font-mono text-[11px] tracking-tight text-ink transition-colors group-hover:border-ink">
            MT
          </span>
          <span className="hidden text-sm tracking-[-0.01em] text-muted transition-colors group-hover:text-ink sm:block">
            {site.name}
          </span>
        </a>

        <nav aria-label="Primary" className="min-w-0">
          <ul className="flex items-center gap-3 sm:gap-5 md:gap-7">
            {links.map((link) => (
              <li key={link.label} className="hidden sm:block">
                <a
                  href={link.href}
                  className="font-mono text-[10px] tracking-[0.1em] whitespace-nowrap text-dim uppercase transition-colors hover:text-ink sm:text-[11px] sm:tracking-[0.14em]"
                >
                  {link.label}
                </a>
              </li>
            ))}

            <li className="hidden md:block">
              <a
                href={github}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] tracking-[0.14em] text-dim uppercase transition-colors hover:text-ink"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          className="-mr-2 grid size-11 place-items-center text-muted transition-colors hover:text-ink sm:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X className="size-5" strokeWidth={1.5} />
          ) : (
            <Menu className="size-5" strokeWidth={1.5} />
          )}
        </button>
      </Container>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="border-t border-line bg-bg/95 backdrop-blur-md sm:hidden"
        >
          <Container>
            <ul className="py-2">
              {[...links, { label: 'GitHub', href: github }].map((link) => (
                <li key={link.label} className="border-b border-line last:border-b-0">
                  <a
                    href={link.href}
                    {...(link.href === github ? { target: '_blank', rel: 'noreferrer' } : {})}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center font-mono text-[12px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      ) : null}
    </header>
  )
}

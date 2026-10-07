import { useEffect, useState } from 'react'

import { Container } from '@/components/Container'
import { github, site } from '@/data/site'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-line bg-bg/80 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <Container className="flex h-16 items-center justify-between gap-6">
        <a href="#top" className="group flex items-center gap-3">
          <span className="grid size-7 place-items-center border border-line-strong font-mono text-[11px] tracking-tight text-ink transition-colors group-hover:border-ink">
            MT
          </span>
          <span className="hidden text-sm tracking-[-0.01em] text-muted transition-colors group-hover:text-ink sm:block">
            {site.name}
          </span>
        </a>

        <nav className="flex items-center gap-4 sm:gap-8">
          <ul className="flex items-center gap-4 sm:gap-7">
            {site.navLinks.map((link, index) => (
              <li key={link.href} className={index < 2 ? '' : 'hidden sm:block'}>
                <a
                  href={link.href}
                  className="font-mono text-[10px] tracking-[0.1em] whitespace-nowrap text-dim uppercase transition-colors hover:text-ink sm:text-[11px] sm:tracking-[0.14em]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <span className="hidden h-4 w-px bg-line md:block" />
          <a
            href={github}
            target="_blank"
            rel="noreferrer"
            className="hidden font-mono text-[11px] tracking-[0.14em] text-dim uppercase transition-colors hover:text-ink md:block"
          >
            GitHub
          </a>
        </nav>
      </Container>
    </header>
  )
}

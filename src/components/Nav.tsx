import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { Container } from '@/components/Container'
import { roleTracks } from '@/data/roles'
import { github, site } from '@/data/site'

const secondaryLinks = [
  { label: 'Work', to: '/#work' },
  { label: 'Contact', to: '/#contact' },
]

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
      data-scrolled={scrolled ? '' : undefined}
      className="fixed inset-x-0 top-0 z-50 border-b border-transparent transition-colors duration-300 supports-[backdrop-filter]:bg-bg/70 data-scrolled:border-line data-scrolled:bg-bg/80 data-scrolled:backdrop-blur-md"
    >
      <Container className="flex h-16 items-center justify-between gap-4 sm:gap-6">
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-3"
          aria-label={`${site.name} — home`}
        >
          <span className="grid size-7 place-items-center border border-line-strong font-mono text-[11px] tracking-tight text-ink transition-colors group-hover:border-ink">
            MT
          </span>
          <span className="hidden text-sm tracking-[-0.01em] text-muted transition-colors group-hover:text-ink sm:block">
            {site.name}
          </span>
        </Link>

        <nav aria-label="Primary" className="min-w-0">
          <ul className="flex items-center gap-3 sm:gap-5 md:gap-7">
            {roleTracks.map((track) => (
              <li key={track.id}>
                <NavLink
                  to={track.path}
                  className={({ isActive }) =>
                    `font-mono text-[10px] tracking-[0.1em] whitespace-nowrap uppercase transition-colors sm:text-[11px] sm:tracking-[0.14em] ${
                      isActive ? 'text-ink' : 'text-dim hover:text-ink'
                    }`
                  }
                >
                  {track.navLabel}
                </NavLink>
              </li>
            ))}

            <li aria-hidden="true" className="hidden h-4 w-px bg-line md:block" />

            {secondaryLinks.map((link) => (
              <li key={link.label} className="hidden sm:block">
                <Link
                  to={link.to}
                  className="font-mono text-[10px] tracking-[0.1em] whitespace-nowrap text-dim uppercase transition-colors hover:text-ink sm:text-[11px] sm:tracking-[0.14em]"
                >
                  {link.label}
                </Link>
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
      </Container>
    </header>
  )
}

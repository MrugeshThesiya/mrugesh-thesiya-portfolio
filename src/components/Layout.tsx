import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { roleById } from '@/data/roles'
import { site } from '@/data/site'

const HOME_TITLE = `${site.name} — Development, Solutions & Product`
const HOME_DESCRIPTION =
  'Portfolio of Mrugesh Thesiya, B.Tech Computer Science and Engineering student at PDEU. Two university systems in production serving 450+ students and 40+ faculty. Choose a development, solutions or product view.'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function titleFor(pathname: string) {
  if (pathname === '/') return HOME_TITLE
  const track = Object.values(roleById).find((role) => role.path === pathname)
  if (track) return `${track.pageTitle} — ${site.name}`
  return `Page not found — ${site.name}`
}

function descriptionFor(pathname: string) {
  if (pathname === '/') return HOME_DESCRIPTION
  const track = Object.values(roleById).find((role) => role.path === pathname)
  if (track) return track.pageDescription
  return 'This page does not exist.'
}

/**
 * Every route shares the shell. This owns the three things a client-side
 * navigation would otherwise get wrong: where the scroll lands, who has focus,
 * and what the tab says.
 */
export function Layout() {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)

  const { pathname, hash } = location

  useEffect(() => {
    document.title = titleFor(pathname)
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', descriptionFor(pathname))
  }, [pathname])

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        requestAnimationFrame(() =>
          target.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'start',
          }),
        )
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:border focus:border-ink focus:bg-bg focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" ref={mainRef} tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

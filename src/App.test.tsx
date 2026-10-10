import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from '@/App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('home', () => {
  it('introduces the candidate and offers all three tracks', () => {
    renderAt('/')

    expect(
      screen.getByRole('heading', { level: 1, name: /turn conversations/i }),
    ).toBeInTheDocument()
    const hero = document.getElementById('top') as HTMLElement
    expect(
      within(hero).getByText(/450\+ students and 40\+ faculty/),
    ).toBeInTheDocument()
    expect(screen.getByText('Three tracks, one candidate')).toBeInTheDocument()

    const intro = screen.getByText('Three tracks, one candidate').parentElement as HTMLElement
    const links = within(intro).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/engineering',
      '/solutions',
      '/product',
    ])
  })

  it('shows the shipped work and the general resume download', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { name: 'Two systems in production' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Minor and Major\/Comprehensive Project Management/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Industrial Training Management System' }),
    ).toBeInTheDocument()

    const resume = screen.getByRole('link', { name: /Download the Development Engineer resume/i })
    expect(resume).toHaveAttribute('href', '/Mrugesh_Thesiya_Resume.pdf')
    expect(resume).toHaveAttribute('download')
  })

  it('links every profile and contact method', () => {
    renderAt('/')

    expect(screen.getAllByRole('link', { name: 'GitHub' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'LinkedIn' }).length).toBeGreaterThan(0)

    const emails = screen.getAllByRole('link', { name: 'thesiyamrugesh@gmail.com' })
    expect(emails.length).toBeGreaterThan(0)
    expect(emails[0]).toHaveAttribute('href', 'mailto:thesiyamrugesh@gmail.com')
  })
})

describe('role tracks', () => {
  const cases = [
    {
      path: '/engineering',
      heading: /debug it, keep it running/i,
      resume: '/Mrugesh_Thesiya_Resume.pdf',
      unique: 'What can be handed to me',
    },
    {
      path: '/solutions',
      heading: /a running system back/i,
      resume: '/Mrugesh_Thesiya_Resume_Solutions_Engineer.pdf',
      unique: 'What I am not claiming',
    },
    {
      path: '/product',
      heading: /and I can build it too/i,
      resume: '/Mrugesh_Thesiya_Resume_APM.pdf',
      unique: 'Prioritisation, laid out',
    },
  ]

  for (const { path, heading, resume, unique } of cases) {
    it(`${path} renders its own hero, case study and resume`, () => {
      const { container } = renderAt(path)

      expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
      expect(screen.getByText(unique)).toBeInTheDocument()

      const downloads = screen.getAllByRole('link', { name: /Download the .* resume/i })
      expect(downloads.length).toBeGreaterThan(0)
      for (const download of downloads) {
        expect(download).toHaveAttribute('href', resume)
        expect(download).toHaveAttribute('download')
      }

      // Exactly one h1 — the role hero, never a leftover homepage heading.
      expect(container.querySelectorAll('h1')).toHaveLength(1)

      const nav = screen.getByRole('navigation', { name: 'Primary' })
      const current = within(nav)
        .getAllByRole('link')
        .find((link) => link.getAttribute('aria-current') === 'page')
      expect(current?.getAttribute('href')).toBe(path)

      for (const label of ['Engineering', 'Solutions', 'Product']) {
        expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument()
      }
    })
  }

  it('gives each track genuinely different content', () => {
    const engineering = renderAt('/engineering')
    const engineeringText = engineering.container.textContent ?? ''
    expect(engineeringText).toContain('My technical contributions')
    engineering.unmount()

    const product = renderAt('/product')
    const productText = product.container.textContent ?? ''
    expect(productText).toContain('Prioritisation, laid out')
    expect(productText).toContain('Future opportunities')
    expect(productText).not.toContain('My technical contributions')
    product.unmount()

    const solutions = renderAt('/solutions')
    expect(solutions.container.textContent).toContain('What I am not claiming')
  })
})

describe('routing', () => {
  it('renders the not-found page for an unknown route', () => {
    renderAt('/does-not-exist')
    expect(screen.getByRole('heading', { name: /does not exist/i })).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /Development Engineer/ }).length,
    ).toBeGreaterThan(0)
  })

  it('keeps the brand, skip link and track navigation reachable', () => {
    renderAt('/product')

    expect(screen.getByRole('link', { name: /— home$/ })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
    expect(screen.getAllByRole('link', { name: 'Development Engineer' }).length).toBeGreaterThan(0)
  })
})

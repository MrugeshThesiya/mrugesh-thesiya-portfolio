import { render, screen } from '@testing-library/react'

import App from '@/App'

describe('single-identity portfolio', () => {
  it('leads with the Product-minded Software Engineer identity', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: /turn conversations/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/Product-minded Software Engineer/).length).toBeGreaterThan(0)
    expect(screen.queryByText('Three tracks, one candidate')).not.toBeInTheDocument()
  })

  it('renders one page with work, background, about, skills and a single contact section', () => {
    const { container } = render(<App />)

    expect(screen.getByRole('heading', { name: 'Three projects' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'PDEU Management Portal' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Vajra — Sandbox for AI Coding Agents' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Open Elective Choice Filling System' }),
    ).toBeInTheDocument()

    // Exactly one h1 and exactly one contact section — no duplicates.
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(container.querySelectorAll('section#contact')).toHaveLength(1)
  })

  it('links the single resume everywhere it appears', () => {
    render(<App />)

    const downloads = screen.getAllByRole('link', { name: /Download the resume/i })
    expect(downloads.length).toBeGreaterThan(0)
    for (const download of downloads) {
      expect(download).toHaveAttribute('href', '/Mrugesh_Thesiya_Resume.pdf')
      expect(download).toHaveAttribute('download')
    }
  })

  it('links every profile and contact method', () => {
    render(<App />)

    expect(screen.getAllByRole('link', { name: 'GitHub' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'LinkedIn' }).length).toBeGreaterThan(0)

    const emails = screen.getAllByRole('link', { name: 'thesiyamrugesh@gmail.com' })
    expect(emails.length).toBeGreaterThan(0)
    expect(emails[0]).toHaveAttribute('href', 'mailto:thesiyamrugesh@gmail.com')

    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
  })
})

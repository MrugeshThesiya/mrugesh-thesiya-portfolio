import { render, screen } from '@testing-library/react'

import App from '@/App'

describe('App', () => {
  it('shows the shipped work with its numbers', () => {
    render(<App />)
    expect(screen.getByText('PDEU Portal')).toBeInTheDocument()
    expect(screen.getByText('450+ students · 40+ faculty')).toBeInTheDocument()
  })
})

import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom implements neither scrolling API; the layout calls both on navigation.
const stub = (target: object, key: string, value: unknown) =>
  Object.defineProperty(target, key, { value, writable: true, configurable: true })

stub(Element.prototype, 'scrollIntoView', vi.fn())
stub(window, 'scrollTo', vi.fn())

if (typeof window.matchMedia !== 'function') {
  stub(
    window,
    'matchMedia',
    (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as MediaQueryList,
  )
}

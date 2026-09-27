import { useEffect, useRef, useState, type RefObject } from 'react'

const canObserve = () => typeof IntersectionObserver !== 'undefined'

/** Content must never be able to stay hidden, whatever the observer does. */
const FALLBACK_MS = 2000

/**
 * Reveals an element once it scrolls into view. Returns the ref to attach and
 * whether it has been revealed yet, so the caller can stagger children.
 * Falls back to "always visible" where IntersectionObserver is unavailable.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(): {
  ref: RefObject<T | null>
  revealed: boolean
} {
  const ref = useRef<T>(null)
  const [revealed, setRevealed] = useState(!canObserve())

  useEffect(() => {
    const node = ref.current
    if (!node || !canObserve()) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)

    const failsafe = window.setTimeout(() => {
      setRevealed(true)
      observer.disconnect()
    }, FALLBACK_MS)

    return () => {
      window.clearTimeout(failsafe)
      observer.disconnect()
    }
  }, [])

  return { ref, revealed }
}

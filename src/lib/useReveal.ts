import { useEffect, useRef, useState, type RefObject } from 'react'

const canObserve = () => typeof IntersectionObserver !== 'undefined'

/**
 * Reveals an element once it scrolls into view. Returns the ref to attach and
 * whether it has been revealed yet, so the caller can stagger children.
 *
 * No hidden start state and no timeout: `[data-reveal]` carries no styles until
 * it flips to 'in', so a missing or slow observer can delay the rise but can
 * never hide or offset content. A timer here would force every section open at
 * once and cancel the effect for the rest of the session.
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
      { threshold: 0, rootMargin: '0px 0px -5% 0px' },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return { ref, revealed }
}

import type { ReactNode } from 'react'

import { Container } from '@/components/Container'
import { useReveal } from '@/lib/useReveal'

export function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  lede?: ReactNode
  children?: ReactNode
}) {
  const { ref, revealed } = useReveal<HTMLElement>()

  return (
    <section
      id={id}
      ref={ref}
      data-reveal={revealed ? 'in' : 'out'}
      className="border-t border-line py-16 sm:py-28"
    >
      <Container>
        <header className="mb-12 max-w-2xl sm:mb-16">
          <p className="eyebrow mb-5">{eyebrow}</p>
          <h2 className="text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">
            {title}
          </h2>
          {lede ? (
            <div className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              {lede}
            </div>
          ) : null}
        </header>
        {children}
      </Container>
    </section>
  )
}

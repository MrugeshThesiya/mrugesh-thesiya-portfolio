import { About } from '@/components/About'
import { Contact } from '@/components/Contact'
import { Experience } from '@/components/Experience'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { Nav } from '@/components/Nav'
import { Section } from '@/components/Section'
import { Skills } from '@/components/Skills'
import { Work } from '@/components/Work'

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:border focus:border-ink focus:bg-bg focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="outline-none">
        <Hero />
        <Work />
        <Experience />
        <About />
        <Section
          id="skills"
          eyebrow="Skills"
          title="What I work with, grouped the way I use it"
          lede={<>Pulled from the resume, so this list and the PDF never drift apart.</>}
        >
          <Skills />
        </Section>
        <Contact />
      </main>
      <Footer />
    </>
  )
}

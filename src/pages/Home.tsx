import { About } from '@/components/About'
import { Contact } from '@/components/Contact'
import { Experience } from '@/components/Experience'
import { Hero } from '@/components/Hero'
import { Section } from '@/components/Section'
import { Skills } from '@/components/Skills'
import { Work } from '@/components/Work'

export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Experience />
      <About />
      <Section
        id="skills"
        eyebrow="Skills"
        title="What I work with, grouped the way I use it"
        lede={<>Pulled from the three resumes, so this list and the PDFs never drift apart.</>}
      >
        <Skills />
      </Section>
      <Contact note="Whichever track you opened — this is the fastest way to reach me." />
    </>
  )
}

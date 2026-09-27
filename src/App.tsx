import { About } from '@/components/About'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { Nav } from '@/components/Nav'
import { Roadmap } from '@/components/Roadmap'
import { GateVisualizer } from '@/components/gates/GateVisualizer'
import { WordLab } from '@/components/word/WordLab'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <GateVisualizer />
        <WordLab />
        <Roadmap />
        <About />
      </main>
      <Footer />
    </>
  )
}

import { About } from '@/components/About'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { Nav } from '@/components/Nav'
import { Work } from '@/components/Work'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
      </main>
      <Footer />
    </>
  )
}

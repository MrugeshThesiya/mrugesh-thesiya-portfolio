import { Section } from '@/components/Section'
import { Systems } from '@/components/Systems'

export function Work() {
  return (
    <Section
      id="work"
      eyebrow="Work"
      title="Three projects"
      lede={
        <>
          The PDEU portal is in production and still mine to support, extend and deploy. Vajra and
          the open elective system are the other two.
        </>
      }
    >
      <Systems />
    </Section>
  )
}

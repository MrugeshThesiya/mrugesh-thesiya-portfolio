import { Section } from '@/components/Section'
import { education, internship } from '@/data/site'

function Entry({
  eyebrow,
  title,
  meta,
  body,
}: {
  eyebrow: string
  title: string
  meta: readonly string[]
  body: string
}) {
  return (
    <div className="border border-line p-5 sm:p-7">
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="mt-4 text-lg leading-snug font-medium tracking-[-0.02em] text-balance">
        {title}
      </h3>
      <p className="mt-2 font-mono text-[11.5px] text-dim">{meta.join(' · ')}</p>
      <p className="mt-4 text-[14.5px] leading-relaxed text-muted">{body}</p>
    </div>
  )
}

export function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="Background"
      title="Where this came from"
      lede={<>The internship that started it, and the degree still running alongside it.</>}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Entry
          eyebrow="Internship"
          title={internship.title}
          meta={[internship.org, internship.place, internship.period]}
          body={internship.summary}
        />
        <Entry
          eyebrow="Education"
          title={education.degree}
          meta={[education.org, education.place, education.period]}
          body={`CGPA ${education.cgpa} — computer science and engineering coursework taken alongside building and running the university’s production portal.`}
        />
      </div>
    </Section>
  )
}

import { ArrowUpRight } from 'lucide-react'

import { Section } from '@/components/Section'
import { education, internship, wdc } from '@/data/site'

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
      title="Experience and education"
      lede={<>Leading the committee, the internship that started it, and the degree running alongside.</>}
    >
      <article className="border border-line p-5 sm:p-9">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h3 className="text-xl font-medium tracking-[-0.02em]">{wdc.title}</h3>
          <span className="font-mono text-[11px] tracking-[0.1em] text-ink uppercase">
            60+ students
          </span>
        </div>
        <p className="mt-1.5 text-sm text-dim">
          {wdc.org} · {wdc.period} · {wdc.place}
        </p>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">{wdc.summary}</p>
        <ul className="mt-6 max-w-2xl space-y-2.5 text-[14px] leading-relaxed text-muted">
          {wdc.responsibilities.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2.5 h-px w-3 shrink-0 bg-line-strong" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <a
          href={wdc.url}
          target="_blank"
          rel="noreferrer"
          className="group mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          Read the guides<span className="sr-only"> (opens in a new tab)</span>
          <ArrowUpRight
            className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        </a>
      </article>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
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

import { ArrowUpRight } from 'lucide-react'

import { Section } from '@/components/Section'
import { projects, wdc, type CaseStudy } from '@/data/site'

const caseStudySections: readonly { label: string; key: keyof Omit<CaseStudy, 'problem'> }[] = [
  { label: 'Constraints', key: 'constraints' },
  { label: 'Decisions', key: 'decisions' },
  { label: 'Outcome', key: 'outcome' },
]

function CaseStudyBlock({ study }: { study: CaseStudy }) {
  return (
    <div className="mt-8 border-t border-line">
      <div className="border-b border-line py-5">
        <p className="eyebrow mb-2.5">Problem</p>
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted">{study.problem}</p>
      </div>

      {caseStudySections.map(({ label, key }) => (
        <div key={label} className="border-b border-line py-5">
          <p className="eyebrow mb-2.5">{label}</p>
          <ul className="max-w-2xl space-y-2.5 text-[14px] leading-relaxed text-muted">
            {study[key].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2.5 h-px w-3 shrink-0 bg-line-strong" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function Work() {
  return (
    <Section
      id="work"
      eyebrow="Work"
      title="Software people actually use"
      lede={
        <>
          Shipped to real users, with the requirements, the support and the deployment that come
          with that.
        </>
      }
    >
      <div className="grid gap-px border border-line bg-line">
        {projects.map((project) => (
          <article key={project.id} className="bg-bg p-6 sm:p-9">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h3 className="text-xl font-medium tracking-[-0.02em]">{project.name}</h3>
              <span className="font-mono text-[11px] tracking-[0.1em] text-ink uppercase">
                {project.metric}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-dim">{project.tagline}</p>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">
              {project.summary}
            </p>
            <CaseStudyBlock study={project.caseStudy} />
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <ul className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <li key={tech} className="border border-line px-2 py-0.5 font-mono text-[11px] text-dim">
                    {tech}
                  </li>
                ))}
              </ul>
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
              >
                Visit
                <ArrowUpRight
                  className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
              </a>
            </div>
          </article>
        ))}

        <article className="bg-bg p-6 sm:p-9">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h3 className="text-xl font-medium tracking-[-0.02em]">{wdc.title}</h3>
            <span className="font-mono text-[11px] tracking-[0.1em] text-ink uppercase">
              60+ students
            </span>
          </div>
          <p className="mt-1.5 text-sm text-dim">{wdc.org}</p>
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
            className="group mt-7 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
          >
            Read the guides
            <ArrowUpRight
              className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </a>
        </article>
      </div>
    </Section>
  )
}

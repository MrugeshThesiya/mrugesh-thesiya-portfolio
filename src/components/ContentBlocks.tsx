import { ArrowUpRight } from 'lucide-react'

import type { ContentBlock } from '@/data/roles'

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="max-w-2xl space-y-2.5 text-[14px] leading-relaxed text-muted">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2.5 h-px w-3 shrink-0 bg-line-strong" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  )
}

/** Numbered sequence, read top to bottom. Used for case studies. */
function StepsList({
  items,
}: {
  items: readonly { title: string; text?: string; bullets?: readonly string[] }[]
}) {
  return (
    <ol className="border-t border-line">
      {items.map((item, index) => (
        <li
          key={item.title}
          className="grid gap-3 border-b border-line py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-8 sm:py-8"
        >
          <span className="font-mono text-[11px] tracking-[0.18em] text-dim">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="text-[17px] leading-snug font-medium tracking-[-0.015em] text-ink">
              {item.title}
            </h3>
            {item.text ? (
              <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-muted">{item.text}</p>
            ) : null}
            {item.bullets ? <div className="mt-4">{<Bullets items={item.bullets} />}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Numbered tiles in a grid. Used for the "how I work" process, to read as a method. */
function StepsRail({
  items,
}: {
  items: readonly { title: string; text?: string; bullets?: readonly string[] }[]
}) {
  return (
    <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <div key={item.title} className="bg-bg p-5 sm:p-6">
          <p className="font-mono text-[11px] tracking-[0.18em] text-dim">
            {String(index + 1).padStart(2, '0')}
          </p>
          <h3 className="mt-4 text-[15px] leading-snug font-medium tracking-[-0.015em] text-ink">
            {item.title}
          </h3>
          {item.text ? (
            <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{item.text}</p>
          ) : null}
          {item.bullets ? (
            <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-muted">
              {item.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2.5">
                  <span className="mt-2 h-px w-2.5 shrink-0 bg-line-strong" aria-hidden="true" />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function Journey({ steps }: { steps: readonly { actor: string; action: string; detail: string }[] }) {
  return (
    <ol className="grid gap-px border border-line bg-line">
      {steps.map((step, index) => (
        <li
          key={`${step.actor}-${step.action}`}
          className="grid gap-2 bg-bg p-5 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-6 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.18em] text-dim uppercase">
              {step.actor}
            </span>
            {index < steps.length - 1 ? (
              <span className="hidden h-px flex-1 bg-line sm:block" aria-hidden="true" />
            ) : null}
          </div>
          <div>
            <p className="text-[15px] leading-snug font-medium text-ink">{step.action}</p>
            <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Matrix({
  columns,
  rows,
}: {
  columns: readonly string[]
  rows: readonly (readonly string[])[]
}) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[46rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="eyebrow px-4 py-3 font-normal sm:px-5"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-line align-top last:border-b-0">
              {row.map((cell, index) => (
                <td
                  key={`${row[0]}-${index}`}
                  className={`px-4 py-3.5 text-[13.5px] leading-relaxed sm:px-5 ${
                    index === 0 ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LinkList({ items }: { items: readonly { label: string; href: string; note?: string }[] }) {
  return (
    <ul className="max-w-2xl border-t border-line">
      {items.map((item) => {
        const external = item.href.startsWith('http')
        return (
          <li key={item.label} className="border-b border-line">
            <a
              href={item.href}
              {...(external ? { target: '_blank', rel: 'noreferrer' } : null)}
              className="group flex items-center justify-between gap-4 py-4 transition-colors"
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-sm text-ink">{item.label}</span>
                {item.note ? (
                  <span className="truncate font-mono text-[11.5px] text-dim">{item.note}</span>
                ) : null}
              </span>
              <ArrowUpRight
                className="size-4 shrink-0 text-dim transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                strokeWidth={1.5}
              />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

function Note({ text }: { text: readonly string[] }) {
  return (
    <div className="max-w-2xl border-l-2 border-line-strong bg-surface px-5 py-4">
      <div className="space-y-3">
        {text.map((paragraph) => (
          <p key={paragraph} className="text-[14px] leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}

export function ContentBlocks({ blocks }: { blocks: readonly ContentBlock[] }) {
  return (
    <div className="space-y-10">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'prose':
            return (
              <div key={index} className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-muted">
                {block.text.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )
          case 'bullets':
            return <Bullets key={index} items={block.items} />
          case 'steps':
            return block.variant === 'rail' ? (
              <StepsRail key={index} items={block.items} />
            ) : (
              <StepsList key={index} items={block.items} />
            )
          case 'journey':
            return <Journey key={index} steps={block.steps} />
          case 'matrix':
            return <Matrix key={index} columns={block.columns} rows={block.rows} />
          case 'links':
            return <LinkList key={index} items={block.items} />
          case 'note':
            return <Note key={index} text={block.text} />
          default:
            return null
        }
      })}
    </div>
  )
}

import { skills } from '@/data/site'

const smSpan = { 1: '', 2: 'sm:col-span-2' } as const
const lgSpan = { 1: '', 2: 'lg:col-span-2', 3: 'lg:col-span-3' } as const

export function Skills({ groups }: { groups?: readonly string[] }) {
  const shown = groups ? skills.filter((group) => groups.includes(group.label)) : skills

  // The grid shows its `bg-line` gap through any empty cell, so the last group
  // widens to fill whatever its row has left at each breakpoint.
  const lastSm = (2 - ((shown.length - 1) % 2)) as 1 | 2
  const lastLg = (3 - ((shown.length - 1) % 3)) as 1 | 2 | 3

  return (
    <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((group, index) => (
        <div
          key={group.label}
          className={`bg-bg p-5 sm:p-6 ${
            index === shown.length - 1 ? `${smSpan[lastSm]} ${lgSpan[lastLg]}` : ''
          }`}
        >
          <p className="eyebrow">{group.label}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {group.items.map((item) => (
              <li
                key={item}
                className="border border-line px-2 py-1 font-mono text-[11.5px] text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

import { skills } from '@/data/site'

export function Skills({ groups }: { groups?: readonly string[] }) {
  const shown = groups ? skills.filter((group) => groups.includes(group.label)) : skills

  return (
    <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((group) => (
        <div key={group.label} className="bg-bg p-5 sm:p-6">
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

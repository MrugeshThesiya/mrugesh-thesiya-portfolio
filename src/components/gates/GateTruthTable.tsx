import type { GateDef, GateRow } from '@/data/gates'
import { inputLabels } from '@/data/gates'
import type { Bit } from '@/lib/nand'

export function GateTruthTable({
  gate,
  rows,
  inputs,
  onSelect,
}: {
  gate: GateDef
  rows: readonly GateRow[]
  inputs: readonly Bit[]
  onSelect: (args: Bit[]) => void
}) {
  const labels = inputLabels(gate)

  return (
    <div className="flex h-full flex-col border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="eyebrow">Truth table</p>
        <p className="font-mono text-[11px] text-dim">select a row</p>
      </div>

      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          {gate.name} truth table. Select a row to drive the inputs to that combination.
        </caption>
        <thead>
          <tr className="border-b border-line">
            {labels.map((label) => (
              <th key={label} scope="col" className="eyebrow py-3 pl-5 text-left font-normal">
                {label}
              </th>
            ))}
            <th scope="col" className="eyebrow py-3 pl-5 text-left font-normal">
              Out
            </th>
            <th scope="col" className="w-12 py-3">
              <span className="sr-only">Set inputs</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const args = row.slice(0, gate.arity)
            const out = row[gate.arity] ?? 0
            const isActive = args.every((value, i) => value === inputs[i])

            return (
              <tr
                key={row.join('')}
                aria-current={isActive ? 'true' : undefined}
                className={`border-b border-line transition-colors last:border-b-0 ${
                  isActive ? 'bg-ink/[0.04]' : ''
                }`}
              >
                {args.map((value, i) => (
                  <td
                    key={i}
                    className={`py-3 pl-5 font-mono tabular-nums ${
                      isActive ? 'text-ink' : 'text-muted'
                    }`}
                  >
                    {value}
                  </td>
                ))}
                <td
                  className={`py-3 pl-5 font-mono tabular-nums ${
                    out === 1 ? 'text-ink' : 'text-dim line-through decoration-1'
                  }`}
                >
                  {out}
                </td>
                <td className="py-2 pr-2 text-right">
                  <button
                    type="button"
                    onClick={() => onSelect([...args])}
                    aria-label={`Set inputs to ${args.join(', ')}`}
                    aria-pressed={isActive}
                    className={`grid size-7 place-items-center rounded-full transition-colors hover:bg-ink/10 hover:text-ink focus-visible:text-ink ${
                      isActive ? 'text-ink' : 'text-dim'
                    }`}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="size-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
                    </svg>
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

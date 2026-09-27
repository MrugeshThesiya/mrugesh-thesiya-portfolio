import { toHex, type Bit, type Word } from '@/lib/bus'

const flip = (value: Bit): Bit => (value === 1 ? 0 : 1)

function Cell({
  value,
  index,
  onToggle,
}: {
  value: Bit
  index: number
  onToggle?: (index: number) => void
}) {
  const className = `grid h-8 w-8 place-items-center border font-mono text-[12px] tabular-nums transition-colors ${
    value === 1
      ? 'border-ink bg-ink text-bg'
      : 'border-line-strong text-dim'
  } ${onToggle ? 'cursor-pointer hover:border-ink' : ''}`

  if (!onToggle) {
    return <span className={className}>{value}</span>
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value === 1}
      aria-label={`Bit ${index}`}
      onClick={() => onToggle(index)}
      className={className}
    >
      {value}
    </button>
  )
}

/**
 * Sixteen bits, grouped four at a time. Each group of four is one hex digit,
 * so the strip reads as a hex number as well as a set of wires.
 */
export function WordStrip({
  label,
  value,
  onChange,
}: {
  label: string
  value: Word
  onChange?: (next: Word) => void
}) {
  const toggle = (index: number) => {
    if (!onChange) return
    const next: Bit[] = value.slice()
    next[index] = flip(next[index] ?? 0)
    onChange(next)
  }

  return (
    <div className="border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-4">
        <span className="eyebrow">{label}</span>
        <span className="font-mono text-[11px] text-dim">0x{toHex(value)}</span>
      </div>

      {/* Two hex digits per row, so the sixteen bits always read as a balanced
          2x2 grid of nibbles instead of wrapping at an arbitrary point. */}
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        {[3, 2, 1, 0].map((group) => (
          <div key={group} className="flex gap-1">
            {[3, 2, 1, 0].map((offset) => {
              const index = group * 4 + offset
              return (
                <Cell
                  key={offset}
                  value={value[index] ?? 0}
                  index={index}
                  {...(onChange ? { onToggle: toggle } : {})}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

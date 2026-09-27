import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'

import { Section } from '@/components/Section'
import { GateSource } from '@/components/gates/GateSource'
import { GateTruthTable } from '@/components/gates/GateTruthTable'
import { GATES, GATE_BY_ID, inputLabels, rowsFor, zeroInputs, type GateDef, type GateId } from '@/data/gates'
import type { Bit } from '@/lib/nand'

const flip = (value: Bit): Bit => (value === 1 ? 0 : 1)

/** The primitive is not built from anything, so it is labelled as such. */
const costLabel = (gate: GateDef): string => {
  if (gate.nandCount === undefined) return 'Primitive'
  return gate.nandCount === 1 ? '1 Nand' : `${gate.nandCount} Nands`
}

export function GateVisualizer() {
  const [id, setId] = useState<GateId>('nand')
  const [inputs, setInputs] = useState<Bit[]>(() => zeroInputs(GATE_BY_ID.nand))

  const gate = GATE_BY_ID[id]
  const labels = inputLabels(gate)
  const rows = useMemo(() => rowsFor(gate), [gate])
  const out = gate.evaluate(inputs)

  const selectGate = (next: GateId) => {
    setId(next)
    setInputs(zeroInputs(GATE_BY_ID[next]))
  }

  const toggleInput = (index: number) =>
    setInputs((current) => current.map((bit, i) => (i === index ? flip(bit) : bit)))

  const atDefaults = inputs.every((bit) => bit === 0)

  return (
    <Section
      id="gates"
      eyebrow="The visualizer"
      title="Five gates, one primitive, all in TypeScript"
      lede={
        <>
          Every gate here is a <span className="text-ink">nand</span> call wired to other{' '}
          <span className="text-ink">nand</span> calls. Pick one to see its truth table and the exact
          TypeScript behind it — the code shown is the file your browser is running.
        </>
      }
    >
      {/* ---- Gate selector ---- */}
      <div
        role="group"
        aria-label="Choose a gate"
        className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5"
      >
        {GATES.map((item) => {
          const active = item.id === id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectGate(item.id)}
              aria-pressed={active}
              className={`flex flex-col items-start gap-2 px-4 py-3.5 text-left transition-colors ${
                active ? 'bg-ink text-bg' : 'bg-surface hover:bg-surface-2'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="font-mono text-[13px]">{item.name}</span>
                {!active ? (
                  <Check className="size-3 text-dim" strokeWidth={2.5} aria-hidden="true" />
                ) : null}
              </span>
              <span
                className={`font-mono text-[10px] tracking-[0.12em] uppercase ${
                  active ? 'text-bg/60' : 'text-dim'
                }`}
              >
                {costLabel(item)}
              </span>
            </button>
          )
        })}
      </div>

      {/* ---- Playground + truth table ---- */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="eyebrow">Inputs → output</p>
              {!atDefaults ? (
                <button
                  type="button"
                  onClick={() => setInputs(zeroInputs(gate))}
                  className="font-mono text-[11px] tracking-[0.1em] text-dim uppercase transition-colors hover:text-ink"
                >
                  Reset
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 px-5 py-6">
              {inputs.map((value, index) => (
                <button
                  key={labels[index]}
                  type="button"
                  role="switch"
                  aria-checked={value === 1}
                  aria-label={`${gate.name} input ${labels[index]}`}
                  onClick={() => toggleInput(index)}
                  className={`grid size-11 place-items-center border font-mono text-sm transition-all ${
                    value === 1
                      ? 'border-ink bg-ink text-bg'
                      : 'border-line-strong text-dim hover:border-ink hover:text-ink'
                  }`}
                >
                  {value}
                </button>
              ))}

              <span className="px-1 font-mono text-muted" aria-hidden="true">
                →
              </span>

              <span
                className={`grid size-11 place-items-center border font-mono text-sm ${
                  out === 1 ? 'border-ink bg-ink text-bg' : 'border-line-strong text-dim'
                }`}
                aria-label={`Output ${out}`}
              >
                {out}
              </span>
            </div>

            <div className="border-t border-line px-5 py-4">
              <p className="eyebrow mb-2.5">Rule</p>
              <p className="font-mono text-[12.5px] break-words text-ink">{gate.formula}</p>
              {gate.formulaNote ? (
                <p className="mt-1.5 font-mono text-[11.5px] text-dim">{gate.formulaNote}</p>
              ) : null}
            </div>
          </div>

          <div className="border border-line bg-surface p-5">
            <p className="eyebrow">Built from</p>
            {gate.nandCount === undefined ? (
              <p className="mt-3 font-mono text-[12.5px] text-ink">
                Nothing. This is where the project starts.
              </p>
            ) : (
              <div className="mt-3.5 flex items-center gap-2">
                {Array.from({ length: gate.nandCount }, (_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="grid h-8 w-11 place-items-center border border-line-strong font-mono text-[9px] tracking-[0.08em] text-dim uppercase"
                  >
                    Nand
                  </span>
                ))}
                <span className="ml-1 font-mono text-[11px] text-muted">
                  {gate.nandCount === 1 ? '1 gate' : `${gate.nandCount} gates`}
                </span>
              </div>
            )}
            <p className="mt-4 text-[13px] leading-relaxed text-muted">{gate.summary}</p>
          </div>
        </div>

        <GateTruthTable gate={gate} rows={rows} inputs={inputs} onSelect={setInputs} />
      </div>

      {/* ---- TypeScript ---- */}
      <div className="mt-6">
        <GateSource source={gate.source} file={gate.file} />
      </div>

      {/* Toggling a switch changes no visible text, so the new state is
          announced here rather than left to be inferred. */}
      <p className="sr-only" role="status" aria-live="polite">
        {gate.name}: {labels.map((label, i) => `${label} is ${inputs[i] ?? 0}`).join(', ')}, output
        is {out}.
      </p>
    </Section>
  )
}

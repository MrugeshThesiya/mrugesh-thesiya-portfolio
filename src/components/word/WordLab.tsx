import { useState } from 'react'

import { Section } from '@/components/Section'
import { GateSource } from '@/components/gates/GateSource'
import { WordStrip } from '@/components/word/WordStrip'
import {
  WORD_GATES,
  WORD_GATE_BY_ID,
  type WordGateId,
} from '@/data/wordGates'
import { fromNumber, toBinary, toHex, type Bit, type Word } from '@/lib/bus'

const CASES: readonly { label: string; a: number; b: number }[] = [
  { label: 'Zero', a: 0x0000, b: 0x0000 },
  { label: 'Alternating', a: 0xa5a5, b: 0x5a5a },
  { label: 'All ones', a: 0xffff, b: 0xffff },
  { label: 'Carry', a: 0x0002, b: 0xffff },
]

export function WordLab() {
  const [id, setId] = useState<WordGateId>('add16')
  const gate = WORD_GATE_BY_ID[id]

  const [words, setWords] = useState<Word[]>(() => gate.defaults.map(fromNumber))
  const [bits, setBits] = useState<Bit[]>(() => new Array<Bit>(gate.bits).fill(0))

  const select = (next: WordGateId) => {
    setId(next)
    setWords(WORD_GATE_BY_ID[next].defaults.map(fromNumber))
    setBits(new Array<Bit>(WORD_GATE_BY_ID[next].bits).fill(0))
  }

  const setWord = (index: number, next: Word) =>
    setWords((current) => current.map((word, i) => (i === index ? next : word)))

  const applyCase = (testCase: (typeof CASES)[number]) => {
    setWords((current) =>
      current.map((_, i) => fromNumber(i === 0 ? testCase.a : testCase.b)),
    )
  }

  const out = gate.evaluate(words, bits)
  const labels = ['A', 'B']

  return (
    <Section
      id="bus"
      eyebrow="Chapters 06–10 — The 16-bit layer"
      title="Sixteen bits at a time"
      lede={
        <>
          Nothing above one bit is a new idea. Every gate here is the one-bit version repeated across
          sixteen wires — but the cost starts to tell a story, from{' '}
          <span className="text-ink">16 NANDs</span> to <span className="text-ink">231</span> for a
          single addition. There is no truth table for a bus, so this is a playground instead: set
          the bits, read the result, read the code.
        </>
      }
    >
      {/* ---- Selector ---- */}
      <div
        role="group"
        aria-label="Choose a 16-bit gate"
        className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5"
      >
        {WORD_GATES.map((item) => {
          const active = item.id === id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => select(item.id)}
              aria-pressed={active}
              className={`flex flex-col items-start gap-2 px-4 py-3.5 text-left transition-colors ${
                active ? 'bg-ink text-bg' : 'bg-surface hover:bg-surface-2'
              }`}
            >
              <span className="font-mono text-[13px]">{item.name}</span>
              <span
                className={`font-mono text-[10px] tracking-[0.12em] uppercase ${
                  active ? 'text-bg/60' : 'text-dim'
                }`}
              >
                {item.nandCount} Nands
              </span>
            </button>
          )
        })}
      </div>

      {/* ---- Playground ---- */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {words.map((value, index) => (
            <WordStrip
              key={index}
              label={labels[index] ?? `Word ${index + 1}`}
              value={value}
              onChange={(next) => setWord(index, next)}
            />
          ))}

          {gate.bits > 0 ? (
            <div className="flex items-center gap-3 border border-line bg-surface px-5 py-4">
              {bits.map((bit, index) => (
                <button
                  key={index}
                  type="button"
                  role="switch"
                  aria-checked={bit === 1}
                  aria-label="Select line"
                  onClick={() =>
                    setBits((current) =>
                      current.map((value, i) => (i === index ? (value === 1 ? 0 : 1) : value)),
                    )
                  }
                  className={`grid size-9 place-items-center border font-mono text-sm transition-colors ${
                    bit === 1
                      ? 'border-ink bg-ink text-bg'
                      : 'border-line-strong text-dim hover:border-ink'
                  }`}
                >
                  {bit}
                </button>
              ))}
              <span className="font-mono text-[11px] text-dim">sel</span>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-1">Try</span>
            {CASES.map((testCase) => (
              <button
                key={testCase.label}
                type="button"
                onClick={() => applyCase(testCase)}
                className="border border-line px-2.5 py-1 font-mono text-[11px] text-dim transition-colors hover:border-ink hover:text-ink"
              >
                {testCase.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <WordStrip label="Out" value={out} />

          <div className="border border-line bg-surface p-5">
            <p className="eyebrow">{gate.name}</p>
            <p className="mt-3 font-mono text-[12.5px] break-words text-ink">{gate.formula}</p>
            <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
              <span className="font-mono text-[11px] text-dim">result</span>
              <span className="font-mono text-[12.5px] text-ink">
                0x{toHex(out)} <span className="text-dim">= 0b{toBinary(out)}</span>
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-muted">{gate.summary}</p>
          </div>

          <div className="flex items-center justify-between gap-4 border border-line bg-surface px-5 py-4">
            <span className="eyebrow">Hardware cost</span>
            <span className="font-mono text-[12.5px] text-ink">
              {gate.nandCount} NAND{gate.nandCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <GateSource source={gate.source} file={gate.file} />
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {gate.name}: output is 0x{toHex(out)}.
      </p>
    </Section>
  )
}

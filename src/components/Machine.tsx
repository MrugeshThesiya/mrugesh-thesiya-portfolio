import { Container } from '@/components/Container'
import { Section } from '@/components/Section'
import { ComputerScreen } from '@/components/machine/ComputerScreen'
import { PARTS, PROVENANCE, SAMPLE_SOURCE, SPEC, UNREACHABLE } from '@/data/machine'

export function Machine() {
  return (
    <Section
      id="machine"
      eyebrow="The machine"
      title="It runs"
      lede={
        <>
          One program, assembled into machine code, executed by a processor built from the NAND gate
          above — and the pixels below are what it wrote into its own memory. Press{' '}
          <span className="text-ink">Run</span> and watch it happen.
        </>
      }
    >
      <ComputerScreen />

      <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        <div className="min-w-0">
          <p className="eyebrow">Memory map</p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            Memory is one flat run of 32,768 words, and the hardware decides what each range means.
            The screen <span className="text-ink">is</span> memory: there is no framebuffer, no
            graphics card and no copy step. A program writes a word at 0x4123 and that is sixteen
            pixels.
          </p>

          <dl className="mt-6 divide-y divide-line border border-line">
            <Row
              code="0x0000–0x3FFF"
              name="RAM16K"
              detail="16,384 words of data"
            />
            <Row code="0x4000–0x5FFF" name="Screen" detail="8,192 words → 512 × 256 pixels" />
            <Row code="0x6000" name="Keyboard" detail="one word" />
            <Row code="0x6001–0x7FFF" name="unused" detail="reads as zero" />
          </dl>
        </div>

        <div className="min-w-0">
          <p className="eyebrow">What it cannot do</p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            The instruction set implies expressions this ALU has no way to compute. These are not
            oversights — each is a consequence of there being six control bits, and each has a reason
            short enough to state. They are also the most interesting thing in the project.
          </p>

          <ul className="mt-6 divide-y divide-line border border-line">
            {UNREACHABLE.map((item) => (
              <li key={item.name} className="px-5 py-4">
                <p className="font-mono text-[13px] text-ink">{item.name}</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">{item.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <div className="min-w-0">
          <p className="eyebrow">The program</p>
          <pre className="mt-3 overflow-x-auto border border-line bg-surface p-5 font-mono text-[11.5px] leading-[1.75] text-muted">
            {SAMPLE_SOURCE.map((line, i) => (
              <div key={line + i} className={line.startsWith('//') ? 'text-dim' : undefined}>
                {line === '' ? ' ' : line}
              </div>
            ))}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-dim">
            Every one of those instructions is arithmetic on NAND gates. The full program that draws{' '}
            <span className="text-ink">Hello world</span> is 12,161 of them, and it contains no loops
            — counting up would need a <span className="text-ink">+1</span> this ALU cannot compute,
            so the loop was unrolled away instead.
          </p>
        </div>

        <div className="min-w-0">
          <p className="eyebrow">What is in it</p>
          <ul className="mt-3 divide-y divide-line border border-line">
            {PARTS.map((part) => (
              <li key={part.id} className="px-5 py-3.5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[12.5px] text-ink">{part.name}</span>
                  {part.cost ? (
                    <span className="shrink-0 font-mono text-[11px] text-dim">
                      {part.cost}
                      {part.measured ? ' · measured' : ''}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">{part.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Container className="mt-14 max-w-none px-0">
        <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-5">
          {SPEC.map((item) => (
            <div key={item.label} className="bg-surface px-5 py-5">
              <dt className="font-mono text-[10px] tracking-[0.14em] text-dim uppercase">
                {item.label}
              </dt>
              <dd className="mt-2.5 font-mono text-[15px] text-ink">{item.value}</dd>
              {item.detail ? (
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-dim">{item.detail}</p>
              ) : null}
            </div>
          ))}
        </dl>

        <ul className="mt-6 flex flex-col gap-2">
          {PROVENANCE.map((line) => (
            <li key={line} className="flex items-start gap-3 text-[12.5px] leading-relaxed text-dim">
              <span className="mt-[0.45rem] inline-block size-1 shrink-0 bg-dim" aria-hidden="true" />
              {line}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}

function Row({ code, name, detail }: { code: string; name: string; detail: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-3.5">
      <span className="font-mono text-[11.5px] text-ink">{code}</span>
      <span className="font-mono text-[12px] text-muted">{name}</span>
      <span className="text-[12px] text-dim">{detail}</span>
    </div>
  )
}
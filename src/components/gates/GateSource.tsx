import { useMemo } from 'react'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { TOKEN_CLASS, tokenize } from '@/lib/highlight'

export function GateSource({ source, file }: { source: string; file: string }) {
  const [copied, setCopied] = useState(false)
  const tokens = useMemo(() => tokenize(source, 'ts'), [source])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="border border-line bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5">
        <span className="font-mono text-[11px] tracking-[0.1em] text-dim">{file}</span>
        <button
          type="button"
          onClick={() => void copy()}
          className="flex items-center gap-1.5 px-2 py-1 font-mono text-[11px] tracking-[0.1em] text-dim uppercase transition-colors hover:text-ink"
        >
          {copied ? (
            <Check className="size-3" strokeWidth={2} />
          ) : (
            <Copy className="size-3" strokeWidth={1.75} />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="overflow-auto">
        <pre className="px-4 py-4 font-mono text-[12.5px] leading-[1.7]">
          <code>
            {tokens.map((token, index) => (
              <span key={index} className={TOKEN_CLASS[token.kind]}>
                {token.text}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}

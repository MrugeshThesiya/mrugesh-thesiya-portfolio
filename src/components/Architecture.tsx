import { ArrowDown } from 'lucide-react'

interface Layer {
  label: string
  boxes: readonly string[]
  className?: string
}

const layers: readonly Layer[] = [
  {
    label: 'People',
    boxes: ['Students', 'Faculty & mentors', 'Coordinators', 'SuperAdmins'],
    className: 'sm:grid-cols-2 lg:grid-cols-4',
  },
  {
    label: 'Front end',
    boxes: ['React + TypeScript single-page app'],
    className: 'sm:grid-cols-1',
  },
  {
    label: 'Edge & server',
    boxes: ['Nginx', 'PM2 supervising Node.js + Express', 'Docker container'],
    className: 'sm:grid-cols-3',
  },
  {
    label: 'Data & identity',
    boxes: [
      'Appwrite (self-hosted) — auth, database, storage',
      'Campus LDAP directory — agreed with university IT',
    ],
    className: 'sm:grid-cols-2',
  },
]

function Connector() {
  return (
    <div className="flex flex-col items-center py-3" aria-hidden="true">
      <span className="h-4 w-px bg-line-strong" />
      <ArrowDown className="-mt-px size-3 text-dim" strokeWidth={1.5} />
    </div>
  )
}

/**
 * Built from markup, not an image: it stays legible at any width, survives being
 * selected or read aloud, and can never drift out of sync with the text around it.
 */
export function Architecture() {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[7.5rem_1fr] sm:gap-8">
        <p className="eyebrow sm:pt-5">Flow</p>
        <p className="max-w-2xl text-[14px] leading-relaxed text-muted">
          One request, top to bottom: a person signs in through the campus directory, the React app
          calls the Node services over REST, and both the data and the identity stay on the
          university&rsquo;s side.
        </p>
      </div>

      <ol className="mt-8">
        {layers.map((layer, index) => (
          <li key={layer.label}>
            <div className="grid gap-4 sm:grid-cols-[7.5rem_1fr] sm:gap-8">
              <p className="eyebrow sm:pt-5">{layer.label}</p>
              <div>
                <div className={`grid gap-px border border-line bg-line ${layer.className ?? ''}`}>
                  {layer.boxes.map((box) => (
                    <div
                      key={box}
                      className="bg-bg px-4 py-4 text-[13.5px] leading-snug text-ink sm:px-5"
                    >
                      {box}
                    </div>
                  ))}
                </div>
                {index < layers.length - 1 ? <Connector /> : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

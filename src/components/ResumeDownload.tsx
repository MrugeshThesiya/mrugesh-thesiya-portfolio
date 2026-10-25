import { Download } from 'lucide-react'

import type { Resume } from '@/data/site'

export function ResumeDownload({
  resume,
  className = '',
}: {
  resume: Resume
  className?: string
}) {
  return (
    <a
      href={resume.file}
      download
      className={`group inline-flex items-center gap-2.5 border border-line-strong px-4 py-2.5 text-sm text-ink transition-colors hover:border-ink ${className}`}
    >
      <Download className="size-4 text-dim transition-colors group-hover:text-ink" strokeWidth={1.5} />
      Download the resume
      <span className="sr-only"> as a PDF</span>
    </a>
  )
}

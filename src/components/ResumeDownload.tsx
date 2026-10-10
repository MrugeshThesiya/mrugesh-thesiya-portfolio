import { Download } from 'lucide-react'

import { resumeByRole, type Resume, type ResumeId } from '@/data/site'

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
      Download the {resume.label} resume
      <span className="sr-only"> as a PDF</span>
    </a>
  )
}

export function ResumePanel({ resumeId }: { resumeId: ResumeId }) {
  const resume = resumeByRole[resumeId]

  return (
    <div className="flex flex-col gap-5 border border-line bg-surface px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-6">
      <div className="min-w-0">
        <p className="eyebrow">Resume</p>
        <p className="mt-2.5 text-[15px] font-medium text-ink">{resume.label}</p>
        <p className="mt-1 max-w-xl text-[13.5px] leading-relaxed text-muted">
          {resume.description}
        </p>
      </div>
      <ResumeDownload resume={resume} className="shrink-0 self-start sm:self-auto" />
    </div>
  )
}

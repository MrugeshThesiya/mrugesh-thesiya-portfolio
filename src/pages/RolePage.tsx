import type { ReactNode } from 'react'

import { Contact } from '@/components/Contact'
import { ContentBlocks } from '@/components/ContentBlocks'
import { ResumePanel } from '@/components/ResumeDownload'
import { RoleHero } from '@/components/RoleHero'
import { Section } from '@/components/Section'
import type { RoleTrack } from '@/data/roles'

/**
 * The shared skeleton every track runs on: hero, its own sections, its own
 * resume, then contact. What makes each track feel different lives in the data
 * and in `extras` — the page supplies the pieces only that track needs.
 */
export function RolePage({
  track,
  extras,
}: {
  track: RoleTrack
  extras?: Record<string, ReactNode>
}) {
  return (
    <>
      <RoleHero track={track} />

      {track.sections.map((section) => (
        <Section
          key={section.id}
          id={section.id}
          eyebrow={section.eyebrow}
          title={section.title}
          lede={section.lede}
        >
          <ContentBlocks blocks={section.blocks} />
          {extras?.[section.id] ? (
            <div className="mt-14 border-t border-line pt-10">{extras[section.id]}</div>
          ) : null}
        </Section>
      ))}

      <Section
        id="resume"
        eyebrow="Resume"
        title={`The ${track.label} resume`}
        lede="Written for this track, so it matches what you just read. Every claim on the site is on it too."
      >
        <ResumePanel resumeId={track.resumeId} />
      </Section>

      <Contact />
    </>
  )
}

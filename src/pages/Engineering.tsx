import { Architecture } from '@/components/Architecture'
import { Skills } from '@/components/Skills'
import { roleById } from '@/data/roles'
import { RolePage } from '@/pages/RolePage'

export default function Engineering() {
  return (
    <RolePage
      track={roleById.engineering}
      extras={{
        capabilities: (
          <div>
            <p className="eyebrow mb-5">Stack</p>
            <Skills
              groups={['Languages', 'Frameworks', 'Data and auth', 'Infrastructure']}
            />
          </div>
        ),
        'case-study': (
          <div>
            <p className="eyebrow mb-5">Architecture</p>
            <Architecture />
          </div>
        ),
      }}
    />
  )
}

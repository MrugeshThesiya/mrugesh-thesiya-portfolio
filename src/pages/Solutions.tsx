import { Systems } from '@/components/Systems'
import { roleById } from '@/data/roles'
import { RolePage } from '@/pages/RolePage'

export default function Solutions() {
  return (
    <RolePage
      track={roleById.solutions}
      extras={{
        approach: (
          <div>
            <p className="eyebrow mb-5">What those steps produced</p>
            <Systems />
          </div>
        ),
      }}
    />
  )
}

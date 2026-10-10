import { Systems } from '@/components/Systems'
import { roleById } from '@/data/roles'
import { RolePage } from '@/pages/RolePage'

export default function Product() {
  return (
    <RolePage
      track={roleById.product}
      extras={{
        approach: (
          <div>
            <p className="eyebrow mb-5">The products that method produced</p>
            <Systems />
          </div>
        ),
      }}
    />
  )
}

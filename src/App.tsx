import { Route, Routes } from 'react-router-dom'

import { Layout } from '@/components/Layout'
import Engineering from '@/pages/Engineering'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import Product from '@/pages/Product'
import Solutions from '@/pages/Solutions'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="engineering" element={<Engineering />} />
        <Route path="solutions" element={<Solutions />} />
        <Route path="product" element={<Product />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

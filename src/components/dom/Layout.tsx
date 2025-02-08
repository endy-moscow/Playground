'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

const Layout = ({ children }) => {
  const ref = useRef()

  return (
    <div ref={ref} className='relative size-full touch-auto overflow-auto'>
      {children}
      <Scene
        className='pointer-events-none fixed left-0 top-0 h-screen w-screen'
        eventSource={ref}
        eventPrefix='client'
      />
    </div>
  )
}

export { Layout }

'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef } from 'react'
import { PerspectiveCamera, View as ViewImpl } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'

export const Common = () => {
  return (
    <Suspense fallback={null}>
      <color attach='background' args={['#000000']} />
      <ambientLight intensity={5} color='#000000' />
      <PerspectiveCamera makeDefault fov={20} position={[0, 0, 0]} rotation={[Math.PI * -0.02, Math.PI * -0.02, 0]} />
    </Suspense>
  )
}

interface ViewProps {
  children: React.ReactNode
  className?: string
  [key: string]: any
}

const View = forwardRef<HTMLDivElement, ViewProps>(({ children, ...props }, ref) => {
  const localRef = useRef(null)
  useImperativeHandle(ref, () => localRef.current)

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        <ViewImpl track={localRef}>{children}</ViewImpl>
      </Three>
    </>
  )
})

View.displayName = 'View'

export { View }

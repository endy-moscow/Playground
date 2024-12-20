'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef } from 'react'
import { PerspectiveCamera, View as ViewImpl } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'


export const Common = ({ color }) => (
  <Suspense fallback={null}>
    {color && <color attach='background' args={[color]} />}
    <ambientLight intensity={2} />
    <pointLight position={[0, 0, 100]} intensity={700} color='#E72487' decay={1} />
    <PerspectiveCamera makeDefault fov={40} position={[0, 0, 0]} />
  </Suspense>
)

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
        <ViewImpl track={localRef}>
          {children}

        </ViewImpl>
      </Three>
    </>
  )
})
View.displayName = 'View'

export { View }

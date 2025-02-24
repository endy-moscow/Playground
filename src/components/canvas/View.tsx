'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef, useEffect, useState } from 'react'
import { PerspectiveCamera, View as ViewImpl } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'
import { Leva, useControls } from 'leva'
import { motion, animate } from 'framer-motion'

export const Common = ({ color: bgColorProp }) => {
  const [animatedIntensity, setAnimatedIntensity] = useState(0)

  useEffect(() => {
    const controls = animate(0, 5, {
      duration: 1.6,
      onUpdate: (value) => setAnimatedIntensity(value),
    })

    return () => controls.stop()
  }, [])

  const { pointLightIntensity, pointLightPosition, cameraFov, cameraPosition, backgroundColor } = useControls(
    'Scene Settings',
    {
      pointLightIntensity: { value: 0, min: 0, max: 10000, step: 50 },
      pointLightPosition: { value: [0, 0, -300] },
      cameraFov: { value: 70, min: 10, max: 100, step: 1 },
      cameraPosition: { value: [0, 0, 0] },
      backgroundColor: { value: bgColorProp || '#000000' },
    },
  )

  return (
    <Suspense fallback={null}>
      <color attach='background' args={[backgroundColor]} />
      <ambientLight intensity={animatedIntensity} color={'#ffffff'} />
      <PerspectiveCamera makeDefault fov={cameraFov} position={cameraPosition} />
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
      <Leva collapsed={false} />
      <div ref={localRef} {...props} />
      <Three>
        <ViewImpl track={localRef}>{children}</ViewImpl>
      </Three>
    </>
  )
})
View.displayName = 'View'

export { View }

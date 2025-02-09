'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef, useEffect } from 'react'
import { PerspectiveCamera, View as ViewImpl, Fisheye, SpotLight } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'
import { Leva, useControls } from 'leva'

export const Common = ({ color: bgColorProp }) => {
  const {
    ambientIntensity,
    pointLightIntensity,
    pointLightPosition,
    pointLightColor,

    cameraFov,
    cameraPosition,
    backgroundColor,
  } = useControls('Scene Settings', {
    ambientIntensity: { value: 3, min: 0, max: 5, step: 0.1 },
    pointLightIntensity: { value: 1, min: 0, max: 10000, step: 50 },
    pointLightPosition: { value: [0, 0, -300] },
    pointLightColor: { value: '#E72487' },

    cameraFov: { value: 35, min: 10, max: 100, step: 1 },
    cameraPosition: { value: [0, 0, 0] },
    backgroundColor: { value: bgColorProp || '#333' },
  })

  return (
    <Suspense fallback={null}>
      <color attach='background' args={[backgroundColor]} />
      <ambientLight intensity={ambientIntensity} color={pointLightColor} />
      <pointLight position={pointLightPosition} intensity={pointLightIntensity} color={pointLightColor} decay={1} />
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

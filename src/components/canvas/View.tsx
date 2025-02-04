'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef, useEffect } from 'react'
import { PerspectiveCamera, View as ViewImpl, Fisheye } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'
import { Leva, useControls } from 'leva'

export const Common = ({ color: bgColorProp }) => {
  const {
    ambientIntensity,
    pointLightIntensity,
    pointLightPosition,
    pointLightColor,
    secondPointLightIntensity,
    secondPointLightPosition,
    secondPointLightColor,
    cameraFov,
    cameraPosition,
    backgroundColor,
  } = useControls('Scene Settings', {
    ambientIntensity: { value: 0.1, min: 0, max: 5, step: 0.1 },
    pointLightIntensity: { value: 1000, min: 0, max: 10000, step: 50 },
    pointLightPosition: { value: [200, 0, -1000] },
    pointLightColor: { value: '#E72487' },
    secondPointLightIntensity: { value: 500, min: 0, max: 10000, step: 50 },
    secondPointLightPosition: { value: [0, 0, -900] },
    secondPointLightColor: { value: '#E72487' },
    cameraFov: { value: 70, min: 10, max: 100, step: 1 },
    cameraPosition: { value: [0, 0, 0] },
    backgroundColor: { value: bgColorProp || '#E72487' },
  })

  return (
    <Suspense fallback={null}>
      <color attach='background' args={[backgroundColor]} />
      <ambientLight intensity={ambientIntensity} color={pointLightColor} />
      <pointLight position={pointLightPosition} intensity={pointLightIntensity} color={pointLightColor} decay={1} />
      <pointLight
        position={secondPointLightPosition}
        intensity={secondPointLightIntensity}
        color={secondPointLightColor}
        decay={1}
      />
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
        <Fisheye zoom={0}>
          <ViewImpl track={localRef}>{children}</ViewImpl>
        </Fisheye>
      </Three>
    </>
  )
})
View.displayName = 'View'

export { View }

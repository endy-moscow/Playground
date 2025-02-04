'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef } from 'react'
import { PerspectiveCamera, View as ViewImpl } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'
import { Leva, useControls } from 'leva' // импортируем Leva и useControls

export const Common = ({ color: bgColorProp }) => {
  // Добавляем параметры для света, камеры и фона через Leva
  const {
    ambientIntensity,
    pointLightIntensity,
    pointLightPosition,
    pointLightColor,
    cameraFov,
    cameraPosition,
    backgroundColor,
  } = useControls('Scene Settings', {
    ambientIntensity: { value: 5, min: 0, max: 5, step: 0.1 },
    pointLightIntensity: { value: 5, min: 0, max: 10000, step: 100 },
    pointLightPosition: { value: [-1, 1, -2000] },
    pointLightColor: { value: '#ffffff' },
    cameraFov: { value: 40, min: 10, max: 100, step: 1 },
    cameraPosition: { value: [0, 0, 0] },
    backgroundColor: { value: bgColorProp || '#000000' },
  })

  return (
    <Suspense fallback={null}>
      <color attach='background' args={[backgroundColor]} />
      <ambientLight intensity={ambientIntensity} />
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
      {/* Добавляем панель Leva */}
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

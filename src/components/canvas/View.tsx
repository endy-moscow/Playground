'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef } from 'react'
import { PerspectiveCamera, View as ViewImpl, CameraShake, Effects } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'

export const Common = () => {
  const shakeConfig = {
    maxYaw: 0.05, // Max amount camera can yaw in either direction
    maxPitch: 0.05, // Max amount camera can pitch in either direction
    maxRoll: 0.01, // Max amount camera can roll in either direction
    yawFrequency: 0.1, // Frequency of the yaw rotation
    pitchFrequency: 0.1, // Frequency of the pitch rotation
    rollFrequency: 0.1, // Frequency of the roll rotation
    intensity: 0.4, // initial intensity of the shake
    decay: false, // should the intensity decay over time
    decayRate: 0.65, // if decay = true this is the rate at which intensity will reduce at
    controls: undefined, // if using orbit controls, pass a ref here so we can update the rotation
  }

  return (
    <Suspense fallback={null}>
      <color attach='background' args={['#000000']} />
      <ambientLight intensity={5} color='#000000' />
      <PerspectiveCamera makeDefault fov={35} position={[0, 0, 0]} rotation={[0, 0, 0]} />
      {/* <CameraShake {...shakeConfig} /> */}
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

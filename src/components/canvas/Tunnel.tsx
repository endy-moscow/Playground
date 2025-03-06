import React, { useRef } from 'react'
import { Tube } from '@react-three/drei'
import * as THREE from 'three'

interface TunnelProps {
  curve: THREE.CatmullRomCurve3
  radius: number
  segments: number
  material: THREE.Material
  position: [number, number, number]
  renderOrder?: number
}

// Компонент туннеля, который можно переиспользовать с разными материалами и параметрами
export const Tunnel: React.FC<TunnelProps> = ({ curve, radius, segments, material, position, renderOrder = 0 }) => {
  const tunnelRef = useRef<THREE.Mesh>(null)

  return (
    <Tube ref={tunnelRef} args={[curve, segments, radius, 36, false]} position={position} renderOrder={renderOrder}>
      <primitive object={material} attach='material' />
    </Tube>
  )
}

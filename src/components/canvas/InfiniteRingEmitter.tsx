'use client'

import React, { useRef, useMemo } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import { TextureLoader } from 'three'

const InfiniteRingEmitter = () => {
  const tunnelRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree() // используем камеру для отладки

  // Управление настройками через Leva
  const {
    tunnelRadius,
    tunnelLength,
    segments,
    tunnelSpeed,
    textureRepeat,
    autoRotateSpeed,
    curveAmplitudeStart,
    curveAmplitudeEnd,
    curveTwists,
    positionZ,
  } = useControls({
    tunnelRadius: { value: 10, min: 10, max: 100, step: 1 },
    tunnelLength: { value: 1000, min: 500, max: 2000, step: 10 },
    segments: { value: 300, min: 100, max: 1000, step: 10 },
    tunnelSpeed: { value: { x: 0.1, y: 0 }, joystick: 'invertY' },
    textureRepeat: { value: { x: 1, y: 1.5 }, joystick: 'invertY' },
    autoRotateSpeed: { value: 0.1, min: 0.1, max: 2, step: 0.01 },
    curveAmplitudeStart: { value: 0, min: 0, max: 100, step: 1 },
    curveAmplitudeEnd: { value: 64, min: 0, max: 100, step: 1 },
    curveTwists: { value: 1, min: 1, max: 10, step: 1 },
    positionZ: { value: -999, min: -2000, max: 0, step: 10 },
  })

  // Создаем кривую тоннеля
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      Array.from({ length: segments }, (_, i) => {
        const progress = i / segments
        const angle = progress * Math.PI * curveTwists
        const amplitude = (1 - progress) * curveAmplitudeEnd + progress * curveAmplitudeStart
        return new THREE.Vector3(
          Math.sin(angle) * amplitude,
          Math.cos(angle) * amplitude,
          i * (tunnelLength / segments),
        )
      }),
    )
  }, [segments, curveTwists, curveAmplitudeStart, curveAmplitudeEnd, tunnelLength])

  // Загрузка текстуры
  const texture = useLoader(TextureLoader, '/img/texture.png')
  texture.wrapS = THREE.MirroredRepeatWrapping
  texture.wrapT = THREE.MirroredRepeatWrapping
  texture.repeat.set(textureRepeat.x, textureRepeat.y)

  // Анимация тоннеля
  useFrame((_, delta) => {
    if (tunnelRef.current) {
      const material = tunnelRef.current.material as THREE.MeshStandardMaterial
      if (material?.map) {
        material.map.offset.x -= tunnelSpeed.x * delta
        material.map.offset.y -= tunnelSpeed.y * delta
      }
      tunnelRef.current.rotation.z += autoRotateSpeed * delta
    }
  })

  // Для отладки можно переместить камеру, чтобы точно видеть тоннель
  // Например: camera.position.set(0, 0, 1500)

  return (
    <mesh ref={tunnelRef} position={[0, 0, positionZ]}>
      <tubeGeometry args={[curve, segments, tunnelRadius, 36, true]} />
      <meshStandardMaterial side={THREE.BackSide} map={texture} />
    </mesh>
  )
}

export default InfiniteRingEmitter

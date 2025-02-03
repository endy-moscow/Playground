//InfiniteRingEmitter.tsx
import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import usePostProcess from '@/templates/hooks/usePostprocess'

const InfiniteRingEmitter = () => {
  // Добавляем настройки через Leva
  const {
    TUNNEL_RADIUS,
    TUNNEL_LENGTH,
    SEGMENTS,
    'TUNNEL_SPEED X': TUNNEL_SPEED_X,
    'TUNNEL_SPEED Y': TUNNEL_SPEED_Y,
    'TEXTURE_REPEAT X': TEXTURE_REPEAT_X,
    'TEXTURE_REPEAT Y': TEXTURE_REPEAT_Y,
    AUTO_ROTATE_SPEED,
    BOOST_ROTATE_MULTIPLIER,
    CURVE_AMPLITUDE_START,
    CURVE_AMPLITUDE_END,
    CURVE_TWISTS,
    POSITION_Z,
  } = useControls('InfiniteTunnel', {
    TUNNEL_RADIUS: { value: 24, min: 1, max: 200, step: 1 },
    TUNNEL_LENGTH: { value: 2000, min: 500, max: 5000, step: 100 },
    SEGMENTS: { value: 30, min: 2, max: 100, step: 1 },
    'TUNNEL_SPEED X': { value: 0.6, min: 0, max: 1, step: 0.01 },
    'TUNNEL_SPEED Y': { value: 0, min: 0, max: 1, step: 0.01 },
    'TEXTURE_REPEAT X': { value: 1, min: 0, max: 1, step: 0.01 },
    'TEXTURE_REPEAT Y': { value: 1, min: 0.1, max: 15, step: 0.1 },
    AUTO_ROTATE_SPEED: { value: 0.1, min: 0, max: 2, step: 0.01 },
    BOOST_ROTATE_MULTIPLIER: { value: 2, min: 1, max: 10, step: 1 },
    CURVE_AMPLITUDE_START: { value: 0, min: 0, max: 200, step: 1 },
    CURVE_AMPLITUDE_END: { value: 50, min: 0, max: 200, step: 1 },
    CURVE_TWISTS: { value: 1, min: 0, max: 5, step: 1 },
    POSITION_Z: { value: -1800, min: -5000, max: 0, step: 50 },
  })

  const tunnelRef = useRef<THREE.Mesh<THREE.TubeGeometry, THREE.MeshStandardMaterial>>(null)
  const { size } = useThree()
  const texture = useLoader(TextureLoader, '/img/texture.png') // Path to texture
  const [hovered, setHovered] = useState(false)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 }) // Mouse position
  const [rotationBoost, setRotationBoost] = useState(1)

  useCursor(hovered, 'pointer', 'auto')
  // const postprocess = usePostProcess()

  // Texture settings
  texture.wrapS = THREE.MirroredRepeatWrapping
  texture.wrapT = THREE.MirroredRepeatWrapping
  texture.repeat.set(TEXTURE_REPEAT_X, TEXTURE_REPEAT_Y)

  // Mouse event handlers
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX / size.width
      const y = event.clientY / size.height
      setMouse({ x, y })
    }

    const handlePointerDown = () => {
      setRotationBoost(BOOST_ROTATE_MULTIPLIER)
    }

    const handlePointerUp = () => {
      setRotationBoost(1)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [size, BOOST_ROTATE_MULTIPLIER])

  // Animation frame updates
  useFrame((_, delta) => {
    if (tunnelRef.current?.material?.map) {
      tunnelRef.current.material.map.offset.x -= TUNNEL_SPEED_X * delta
      tunnelRef.current.material.map.offset.y -= TUNNEL_SPEED_Y * delta
    }

    // Rotate tube automatically
    if (tunnelRef.current) {
      tunnelRef.current.rotation.z += AUTO_ROTATE_SPEED * rotationBoost * delta
    }
  })

  // Create curve with smooth amplitude transitions
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: SEGMENTS }, (_, i) => {
      const progress = i / SEGMENTS
      const angle = progress * Math.PI * CURVE_TWISTS
      const amplitude = (1 - progress) * CURVE_AMPLITUDE_END + progress * CURVE_AMPLITUDE_START

      return new THREE.Vector3(
        Math.sin(angle) * amplitude, // Bend X
        Math.cos(angle) * amplitude, // Bend Y
        i * (TUNNEL_LENGTH / SEGMENTS), // Length Z
      )
    }),
  )

  return (
    <mesh
      ref={tunnelRef}
      position={[0, 0, POSITION_Z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <tubeGeometry args={[curve, SEGMENTS, TUNNEL_RADIUS, 36, true]} />
      <meshStandardMaterial side={THREE.BackSide} map={texture} />
    </mesh>
  )
}

export default InfiniteRingEmitter

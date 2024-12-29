//InfiniteRingEmitter.tsx
import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import usePostProcess from '@/templates/hooks/usePostprocess'

const InfiniteRingEmitter = () => {
  const tunnelRef = useRef<THREE.Mesh<THREE.TubeGeometry, THREE.MeshStandardMaterial>>(null)
  const { size } = useThree()
  const texture = useLoader(TextureLoader, '/img/example.jpg') // Path to texture
  const [hovered, setHovered] = useState(false)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 }) // Mouse position
  const [rotationBoost, setRotationBoost] = useState(1)

  const TUNNEL_RADIUS = 24
  const TUNNEL_LENGTH = 2000
  const SEGMENTS = 30
  const TUNNEL_SPEED = { x: 0.1, y: 0.07 }
  const TEXTURE_REPEAT = { x: 0.01, y: 7 }
  const AUTO_ROTATE_SPEED = 0.1
  const BOOST_ROTATE_MULTIPLIER = 2
  const CURVE_AMPLITUDE_START = 0
  const CURVE_AMPLITUDE_END = 64
  const CURVE_TWISTS = 1
  const POSITION_Z = -1800

  useCursor(hovered, 'pointer', 'auto')
  const postprocess = usePostProcess()

  // Texture settings
  texture.wrapS = THREE.MirroredRepeatWrapping
  texture.wrapT = THREE.MirroredRepeatWrapping
  texture.repeat.set(TEXTURE_REPEAT.x, TEXTURE_REPEAT.y)

  // Mouse event handlers
  useEffect(() => {
    const handleMouseMove = (event) => {
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
      tunnelRef.current.material.map.offset.x -= TUNNEL_SPEED.x * delta // Move texture X
      tunnelRef.current.material.map.offset.y -= TUNNEL_SPEED.y * delta // Move texture Y
    }

    // Rotate tube automatically
    if (tunnelRef.current) {
      tunnelRef.current.rotation.z += AUTO_ROTATE_SPEED * rotationBoost * delta
    }
  })

  // Create curve with smooth amplitude transitions
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: SEGMENTS }, (_, i) => {
      const progress = i / SEGMENTS // Progress from 0 to 1
      const angle = progress * Math.PI * CURVE_TWISTS // Twists in the tube
      const amplitude =
        (1 - progress) * CURVE_AMPLITUDE_END + // Decrease amplitude closer to camera
        progress * CURVE_AMPLITUDE_START // Increase amplitude farther away
      return new THREE.Vector3(
        Math.sin(angle) * amplitude, // Bend X
        Math.cos(angle) * amplitude, // Bend Y
        i * (TUNNEL_LENGTH / SEGMENTS), // Length Z
      )
    }),
  )

  return (
    <>
      <mesh
        ref={tunnelRef}
        position={[0, 0, POSITION_Z]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <tubeGeometry args={[curve, SEGMENTS, TUNNEL_RADIUS, 36, true]} />
        <meshStandardMaterial side={THREE.BackSide} map={texture} />
      </mesh>
    </>
  )
}

export default InfiniteRingEmitter

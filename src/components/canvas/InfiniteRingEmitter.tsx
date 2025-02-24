import React, { useRef, useMemo } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import { TextureLoader } from 'three'

const InfiniteRingEmitter = () => {
  const tunnelRef = useRef<THREE.Mesh>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const { size } = useThree()

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
    particleCount,
    particleRandomOffset,
    particleSpeed,
    particleSize,
  } = useControls({
    tunnelRadius: { value: 10, min: 10, max: 100, step: 1 },
    tunnelLength: { value: 1000, min: 500, max: 2000, step: 10 },
    segments: { value: 300, min: 100, max: 1000, step: 10 },
    tunnelSpeed: { value: { x: 1, y: 0.01 }, joystick: 'invertY' },
    textureRepeat: { value: { x: 1, y: 1 }, joystick: 'invertY' },
    autoRotateSpeed: { value: 0, min: 0, max: 2, step: 0.01 },
    curveAmplitudeStart: { value: 0, min: 0, max: 100, step: 1 },
    curveAmplitudeEnd: { value: 64, min: 0, max: 100, step: 1 },
    curveTwists: { value: 1, min: 1, max: 10, step: 1 },
    positionZ: { value: -999, min: -2000, max: 0, step: 10 },
    particleCount: { value: 200, min: 200, max: 5000, step: 100 },
    particleRandomOffset: { value: 10, min: 0, max: 10, step: 0.1 },
    particleSpeed: { value: 0.24, min: 0, max: 1, step: 0.1 },
    particleSize: { value: 0.02, min: 0.1, max: 5, step: 0.1 },
  })

  const texture = useLoader(TextureLoader, '/img/texture.png')
  texture.wrapS = THREE.MirroredRepeatWrapping
  texture.wrapT = THREE.MirroredRepeatWrapping
  texture.repeat.set(textureRepeat.x, textureRepeat.y)

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

  const positions = useMemo(() => new Float32Array(particleCount * 3), [particleCount])

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount
      const point = curve.getPoint(t)

      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * particleRandomOffset,
        (Math.random() - 0.5) * particleRandomOffset,
        (Math.random() - 0.5) * particleRandomOffset,
      )

      const idx = i * 3
      positions[idx] = point.x + offset.x
      positions[idx + 1] = point.y + offset.y
      positions[idx + 2] = point.z + offset.z

      temp.push({
        t,
        offset,
        speed: Math.random() * particleSpeed,
      })
    }
    return temp
  }, [particleCount, curve, particleRandomOffset, positions, particleSpeed])

  useFrame((_, delta) => {
    if (tunnelRef.current) {
      const material = tunnelRef.current.material as THREE.MeshStandardMaterial
      if (material?.map) {
        material.map.offset.x -= tunnelSpeed.x * delta
        material.map.offset.y -= tunnelSpeed.y * delta
      }
      tunnelRef.current.rotation.z += autoRotateSpeed * delta
    }

    if (pointsRef.current) {
      const positionAttribute = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute

      particles.forEach((particle, i) => {
        particle.t += particle.speed * delta
        if (particle.t > 1) particle.t -= 1

        const point = curve.getPoint(particle.t)
        const idx = i * 3
        positionAttribute.array[idx] = point.x + particle.offset.x
        positionAttribute.array[idx + 1] = point.y + particle.offset.y
        positionAttribute.array[idx + 2] = point.z + particle.offset.z
      })

      positionAttribute.needsUpdate = true
      pointsRef.current.geometry.computeBoundingSphere()
    }
  })

  return (
    <>
      <mesh ref={tunnelRef} position={[0, 0, positionZ]}>
        <tubeGeometry args={[curve, segments, tunnelRadius, 36, true]} />
        <meshStandardMaterial side={THREE.BackSide} map={texture} />
      </mesh>

      <points ref={pointsRef} position={[0, 0, positionZ]}>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes-position'
            count={particleCount}
            array={positions}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
        </bufferGeometry>
        <pointsMaterial
          size={particleSize}
          sizeAttenuation={true}
          color='white'
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={true}
        />
      </points>
    </>
  )
}

export default InfiniteRingEmitter

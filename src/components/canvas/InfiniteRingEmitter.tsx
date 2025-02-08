import React, { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import { TextureLoader } from 'three'

const InfiniteRingEmitter = () => {
  const tunnelRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  // Настройки через Leva
  const {
    TUNNEL_RADIUS,
    TUNNEL_LENGTH,
    SEGMENTS,
    TUNNEL_SPEED,
    TEXTURE_REPEAT,
    AUTO_ROTATE_SPEED,
    CURVE_AMPLITUDE_START,
    CURVE_AMPLITUDE_END,
    CURVE_TWISTS,
    POSITION_Z,
    particleCount,
    particleSpeed,
    particleSize,
  } = useControls({
    TUNNEL_RADIUS: { value: 10, min: 1, max: 100 },
    TUNNEL_LENGTH: { value: 1050, min: 500, max: 6000 },
    SEGMENTS: { value: 300, min: 100, max: 1000 },
    TUNNEL_SPEED: { value: { x: 0.24, y: 0 } },
    TEXTURE_REPEAT: { value: { x: 1, y: 1.5 } },
    AUTO_ROTATE_SPEED: { value: 0.1, min: 0.1, max: 2 },
    CURVE_AMPLITUDE_START: { value: 0, min: 0, max: 100 },
    CURVE_AMPLITUDE_END: { value: 64, min: 0, max: 100 },
    CURVE_TWISTS: { value: 1, min: 1, max: 10 },
    POSITION_Z: { value: -999, min: -2000, max: 0 },
    particleCount: { value: 1000, min: 100, max: 5000 },
    particleSpeed: { value: 100, min: 10, max: 500 },
    particleSize: { value: 2, min: 0.1, max: 5 },
  })

  // Создание кривой туннеля
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      Array.from({ length: SEGMENTS }, (_, i) => {
        const progress = i / SEGMENTS
        const angle = progress * Math.PI * CURVE_TWISTS
        const amplitude = (1 - progress) * CURVE_AMPLITUDE_END + (progress * CURVE_AMPLITUDE_START) / 1.1
        return new THREE.Vector3(
          Math.sin(angle) * amplitude,
          Math.cos(angle) * amplitude,
          i * (TUNNEL_LENGTH / SEGMENTS),
        )
      }),
    )
  }, [SEGMENTS, CURVE_TWISTS, CURVE_AMPLITUDE_START, CURVE_AMPLITUDE_END, TUNNEL_LENGTH])

  // Загрузка текстуры
  const texture = useLoader(TextureLoader, '/img/texture.png')
  texture.wrapS = THREE.MirroredRepeatWrapping
  texture.wrapT = THREE.MirroredRepeatWrapping
  texture.repeat.set(TEXTURE_REPEAT.x, TEXTURE_REPEAT.y)

  // Инициализация параметров для частиц
  const [params, offsets] = useMemo(() => {
    const pArray = new Float32Array(particleCount)
    const oArray = new Float32Array(particleCount * 2)
    for (let i = 0; i < particleCount; i++) {
      pArray[i] = Math.random() // Случайное распределение в диапазоне [0, 1]
      oArray[i * 2] = (Math.random() - 0.5) * (TUNNEL_RADIUS * 0.3)
      oArray[i * 2 + 1] = (Math.random() - 0.5) * (TUNNEL_RADIUS * 0.3)
    }
    return [pArray, oArray]
  }, [particleCount, TUNNEL_RADIUS])

  // Вычисление начальных позиций частиц
  const positions = useMemo(() => {
    const posArray = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const pt = curve.getPoint(params[i])
      posArray[i * 3] = pt.x + offsets[i * 2]
      posArray[i * 3 + 1] = pt.y + offsets[i * 2 + 1]
      posArray[i * 3 + 2] = pt.z
    }
    return posArray
  }, [curve, params, offsets, particleCount])

  // Анимация на каждом кадре
  useFrame((_, delta) => {
    // Анимация туннеля
    const mat = tunnelRef.current?.material as THREE.MeshStandardMaterial
    if (mat?.map) {
      mat.map.offset.x -= TUNNEL_SPEED.x * delta
      mat.map.offset.y -= TUNNEL_SPEED.y * delta
    }
    if (tunnelRef.current) {
      tunnelRef.current.rotation.z += AUTO_ROTATE_SPEED * delta
    }

    // Обновление позиции для частиц
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position
      for (let i = 0; i < particleCount; i++) {
        params[i] += (particleSpeed * delta) / 120
        if (params[i] > 1) {
          params[i] -= 1 // Обеспечение диапазона [0, 1]
        }
        const pt = curve.getPoint(params[i])
        posAttr.array[i * 3] = pt.x + offsets[i * 2]
        posAttr.array[i * 3 + 1] = pt.y + offsets[i * 2 + 1]
        posAttr.array[i * 3 + 2] = pt.z
      }
      posAttr.needsUpdate = true
    }
  })

  return (
    <>
      {/* Туннель */}
      <mesh ref={tunnelRef} position={[0, 0, POSITION_Z]}>
        <tubeGeometry args={[curve, SEGMENTS, TUNNEL_RADIUS, 36, true]} />
        <meshStandardMaterial side={THREE.BackSide} map={texture} />
      </mesh>

      {/* Частицы. Обратите внимание: используем элемент <bufferAttribute>, а не <BufferAttribute> */}
      <points ref={particlesRef}>
        <bufferGeometry key={particleCount}>
          <bufferAttribute attach='attributes-position' count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={particleSize}
          color='white'
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  )
}

export default InfiniteRingEmitter

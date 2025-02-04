import React, { useRef, useMemo } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import { TextureLoader } from 'three'

const InfiniteRingEmitter = () => {
  const tunnelRef = useRef<THREE.Mesh>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const { size } = useThree()

  // Управление настройками через Leva для трубы и частиц
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
    PARTICLE_COUNT,
    PARTICLE_RANDOM_OFFSET,
    // Новый параметр скорости движения частиц
    PARTICLE_SPEED,
  } = useControls({
    TUNNEL_RADIUS: { value: 10, min: 10, max: 100, step: 1 },
    TUNNEL_LENGTH: { value: 1000, min: 500, max: 2000, step: 10 },
    SEGMENTS: { value: 300, min: 100, max: 1000, step: 10 },
    TUNNEL_SPEED: { value: { x: 0.1, y: 0 }, joystick: 'invertY' },
    TEXTURE_REPEAT: { value: { x: 1, y: 1.5 }, joystick: 'invertY' },
    AUTO_ROTATE_SPEED: { value: 0.1, min: 0.1, max: 2, step: 0.01 },
    CURVE_AMPLITUDE_START: { value: 0, min: 0, max: 100, step: 1 },
    CURVE_AMPLITUDE_END: { value: 64, min: 0, max: 100, step: 1 },
    CURVE_TWISTS: { value: 1, min: 1, max: 10, step: 1 },
    POSITION_Z: { value: -999, min: -2000, max: 0, step: 10 },
    PARTICLE_COUNT: { value: 1000, min: 100, max: 5000, step: 100 },
    PARTICLE_RANDOM_OFFSET: { value: 2, min: 0, max: 5, step: 0.1 },
    PARTICLE_SPEED: { value: 0.05, min: 0, max: 0.5, step: 0.01 },
  })

  // Загрузка и настройка текстуры для трубы
  const texture = useLoader(TextureLoader, '/img/texture.png')
  texture.wrapS = THREE.MirroredRepeatWrapping
  texture.wrapT = THREE.MirroredRepeatWrapping
  texture.repeat.set(TEXTURE_REPEAT.x, TEXTURE_REPEAT.y)

  // Создаем кривую
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      Array.from({ length: SEGMENTS }, (_, i) => {
        const progress = i / SEGMENTS
        const angle = progress * Math.PI * CURVE_TWISTS
        const amplitude = (1 - progress) * CURVE_AMPLITUDE_END + progress * CURVE_AMPLITUDE_START
        return new THREE.Vector3(
          Math.sin(angle) * amplitude,
          Math.cos(angle) * amplitude,
          i * (TUNNEL_LENGTH / SEGMENTS),
        )
      }),
    )
  }, [SEGMENTS, CURVE_TWISTS, CURVE_AMPLITUDE_START, CURVE_AMPLITUDE_END, TUNNEL_LENGTH])

  // Для анимации движения частиц по кривой храним их t-параметры
  const particleData = useMemo(() => {
    const data = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Начальное t и случайный оффсет
      const t = i / PARTICLE_COUNT
      data.push({ t })
    }
    return data
  }, [PARTICLE_COUNT])

  // Вычисляем позиции частиц
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    particleData.forEach((p, i) => {
      const point = curve.getPoint(p.t)
      positions[i * 3] = point.x + (Math.random() - 0.5) * PARTICLE_RANDOM_OFFSET
      positions[i * 3 + 1] = point.y + (Math.random() - 0.5) * PARTICLE_RANDOM_OFFSET
      positions[i * 3 + 2] = point.z + (Math.random() - 0.5) * PARTICLE_RANDOM_OFFSET
    })
    return positions
  }, [PARTICLE_COUNT, PARTICLE_RANDOM_OFFSET, curve, particleData])

  // Анимация смещения текстуры/вращения трубы и движения частиц по кривой
  useFrame((_, delta) => {
    // Труба
    const material = tunnelRef.current?.material as THREE.MeshStandardMaterial
    if (material?.map) {
      material.map.offset.x -= TUNNEL_SPEED.x * delta
      material.map.offset.y -= TUNNEL_SPEED.y * delta
    }
    if (tunnelRef.current) {
      tunnelRef.current.rotation.z += AUTO_ROTATE_SPEED * delta
    }

    // Частицы
    if (pointsRef.current) {
      const positionAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
      const count = PARTICLE_COUNT
      for (let i = 0; i < count; i++) {
        // Обновляем t
        particleData[i].t += PARTICLE_SPEED * delta
        // t = 1 → сброс на 0
        if (particleData[i].t > 1) {
          particleData[i].t -= 1
        }
        const p = curve.getPoint(particleData[i].t)
        const baseIndex = i * 3
        positionAttr.array[baseIndex] = p.x + (Math.random() - 0.5) * PARTICLE_RANDOM_OFFSET * 0.1
        positionAttr.array[baseIndex + 1] = p.y + (Math.random() - 0.5) * PARTICLE_RANDOM_OFFSET * 0.1
        positionAttr.array[baseIndex + 2] = p.z
      }
      positionAttr.needsUpdate = true
    }
  })

  return (
    <>
      {/* Труба */}
      <mesh ref={tunnelRef} position={[0, 0, POSITION_Z]}>
        <tubeGeometry args={[curve, SEGMENTS, TUNNEL_RADIUS, 36, true]} />
        <meshStandardMaterial side={THREE.BackSide} map={texture} />
      </mesh>

      {/* Частицы */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes-position'
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={1} color='white' transparent opacity={1} />
      </points>
    </>
  )
}

export default InfiniteRingEmitter

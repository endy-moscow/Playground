import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const ParticleTunnel = () => {
  const pointsRef = useRef<THREE.Points>(null)
  const { camera } = useThree()

  // Создаем позиции для частиц вдоль тоннеля.
  // Здесь задается count частиц, распределенных по X, Y и Z.
  // Частицы по оси Z располагаются от -1000 до 0.
  const positions = useMemo(() => {
    const count = 1000 // число частиц
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Разброс по X и Y (ширина тоннеля)
      positions[i * 3 + 0] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      // Z: от -1000 (даль) до 0 (камера)
      positions[i * 3 + 2] = -Math.random() * 1000
    }
    return positions
  }, [])

  // Обновляем позиции частиц каждый кадр:
  // частицы движутся по оси Z к камере.
  // Когда частица проходит камеру, сбрасываем её назад.
  useFrame((_, delta) => {
    if (pointsRef.current) {
      const positionAttribute = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
      const array = positionAttribute.array as Float32Array
      const speed = 100 // регулирует скорость движения частиц
      for (let i = 0; i < array.length / 3; i++) {
        array[i * 3 + 2] += delta * speed
        // Если частица зашла впереди камеры (позиция Z > 0), сбрасываем её назад
        if (array[i * 3 + 2] > camera.position.z) {
          array[i * 3 + 2] = -1000
        }
      }
      positionAttribute.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.5} color='white' />
    </points>
  )
}

export default ParticleTunnel

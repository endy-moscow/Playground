import React, { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { useControls } from 'leva'

interface PointParticleSystemProps {
  curve: THREE.CatmullRomCurve3
  positionZ: number // Если требуется сдвиг, делайте его при создании кривой
}

export const PointParticleSystem = ({ curve, positionZ }: PointParticleSystemProps) => {
  const particlesRef = useRef<THREE.Group>(null)
  const particleRefs = useRef<THREE.Group[]>([])
  const particleTexture = useLoader(TextureLoader, '/img/particle.png')

  // Настройки частиц через Leva
  const particleConfig = useControls('Частицы', {
    count: { value: 64, min: 1, max: 200, step: 10, label: 'Количество' },
    baseSpeed: { value: 124, min: 0.1, max: 200, step: 0.5, label: 'Базовая скорость' },
    size: { value: 0.5, min: 0.1, max: 5, step: 0.1, label: 'Размер' },
    minOffset: { value: 9, min: 0, max: 30, step: 1, label: 'Минимальный радиус' },
    offsetRange: { value: 22, min: 0, max: 50, step: 1, label: 'Макс. радиус отклонения' },
    opacity: { value: 1, min: 0, max: 1, step: 0.1, label: 'Прозрачность' },
  })

  // Создаём данные для частиц вдоль кривой с рандомным отступом
  const particles = useMemo(() => {
    const arr: {
      t: number
      offsetAngle: number
      offsetMagnitude: number
    }[] = []
    for (let i = 0; i < particleConfig.count; i++) {
      const t = i / particleConfig.count
      arr.push({
        t,
        // Рандомный угол отступа в радианах (0..2π)
        offsetAngle: Math.random() * Math.PI * 2,
        // Рандомное смещение, от minOffset до offsetRange
        offsetMagnitude:
          particleConfig.minOffset + Math.random() * (particleConfig.offsetRange - particleConfig.minOffset),
      })
    }
    return arr
  }, [particleConfig.count, particleConfig.offsetRange, particleConfig.minOffset])

  // Анимация: двигаем частицы вдоль кривой с учётом локального отступа
  useFrame((_, delta) => {
    if (!particlesRef.current) return

    particles.forEach((particle, i) => {
      // Обновляем параметр t используя одинаковую baseSpeed для всех частиц
      particle.t += particleConfig.baseSpeed * delta * 0.01
      if (particle.t > 1) particle.t -= 1

      // Получаем базовую точку на кривой
      const point = curve.getPoint(particle.t)

      // Получаем тангент (направление движения) на кривой для текущего t
      const tangent = curve.getTangent(particle.t).normalize()

      // Выбираем вектор up, если он почти параллелен тангенту, сменяем его
      let up = new THREE.Vector3(0, 1, 0)
      if (Math.abs(tangent.dot(up)) > 0.99) {
        up = new THREE.Vector3(1, 0, 0)
      }

      // Вычисляем нормаль как вектор, перпендикулярный тангенту
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize()
      // Вычисляем бинормаль для построения полного базиса
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize()

      // Вычисляем смещение в плоскости, перпендикулярной траектории
      const offset = new THREE.Vector3()
      offset.copy(normal).multiplyScalar(Math.cos(particle.offsetAngle))
      offset.add(binormal.clone().multiplyScalar(Math.sin(particle.offsetAngle)))
      offset.multiplyScalar(particle.offsetMagnitude)

      // Итоговая позиция частицы = точка на кривой + смещение
      const finalPos = point.clone().add(offset)

      if (particleRefs.current[i]) {
        particleRefs.current[i].position.copy(finalPos)
      }
    })
  })

  return (
    <group ref={particlesRef} renderOrder={1} position={[0, 0, positionZ]}>
      {particles.map((particle, i) => (
        <Billboard
          key={i}
          ref={(el) => {
            if (el) particleRefs.current[i] = el
          }}
          // Начальная позиция будет вычислена внутри useFrame, но можно задать точку из кривой
          position={curve.getPoint(particle.t)}
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          <mesh>
            <planeGeometry args={[particleConfig.size, particleConfig.size]} />
            <meshBasicMaterial
              map={particleTexture}
              transparent={true}
              opacity={particleConfig.opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              depthTest={true}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Billboard>
      ))}
    </group>
  )
}

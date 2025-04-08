import React, { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { useControls } from 'leva'

interface PointParticleSystemProps {
  curve: THREE.CatmullRomCurve3
  positionZ: number
}

export const PointParticleSystem = ({ curve, positionZ }: PointParticleSystemProps) => {
  const particlesRef = useRef<THREE.Group>(null)
  const particleRefs = useRef<THREE.Group[]>([])
  const particleTexture = useLoader(TextureLoader, '/img/particle.png')

  // Настройки частиц через Leva с новыми параметрами
  const particleConfig = useControls('Частицы', {
    count: { value: 64, min: 1, max: 200, step: 10, label: 'Количество' },
    baseSpeed: { value: 0.12, min: 0.01, max: 0.5, step: 0.01, label: 'Базовая скорость' },
    speedVariation: { value: 0.2, min: 0, max: 1, step: 0.05, label: 'Вариация скорости' },
    size: { value: 0.5, min: 0.1, max: 5, step: 0.1, label: 'Размер' },
    minOffset: { value: 9, min: 0, max: 30, step: 1, label: 'Минимальный радиус' },
    maxOffset: { value: 22, min: 0, max: 50, step: 1, label: 'Максимальный радиус' },
    opacity: { value: 1, min: 0, max: 1, step: 0.1, label: 'Прозрачность' },
    fadeDistance: { value: 900, min: 100, max: 2000, step: 10, label: 'Дистанция затухания' },
  })

  // Создаём данные для частиц с позицией по кривой
  const particles = useMemo(() => {
    const arr: {
      progress: number // прогресс по кривой (0-1)
      offsetAngle: number // угол смещения относительно кривой
      offsetRadius: number // величина смещения от центра кривой
      speed: number // индивидуальная скорость частицы
    }[] = []

    for (let i = 0; i < particleConfig.count; i++) {
      // Распределяем частицы равномерно вдоль кривой
      const progress = i / particleConfig.count

      // Фиксированный угол смещения вокруг кривой
      const offsetAngle = Math.random() * Math.PI * 2

      // Радиус смещения от оси между минимальным и максимальным
      const offsetRadius =
        particleConfig.minOffset + Math.random() * (particleConfig.maxOffset - particleConfig.minOffset)

      // Слегка рандомизируем скорость для естественности
      const speedFactor = 1 - (Math.random() * particleConfig.speedVariation * 2 - particleConfig.speedVariation)
      const speed = particleConfig.baseSpeed * speedFactor

      arr.push({
        progress,
        offsetAngle,
        offsetRadius,
        speed,
      })
    }
    return arr
  }, [
    particleConfig.count,
    particleConfig.minOffset,
    particleConfig.maxOffset,
    particleConfig.baseSpeed,
    particleConfig.speedVariation,
  ])

  // Анимация: двигаем частицы вдоль кривой с радиальным отклонением
  useFrame((_, delta) => {
    if (!particlesRef.current) return

    particles.forEach((particle, i) => {
      // Обновляем прогресс частицы вдоль кривой (в сторону камеры)
      particle.progress -= particle.speed * delta

      // Если частица дошла до начала кривой (камеры), перемещаем в конец
      if (particle.progress <= 0) {
        particle.progress = 1.0
      }

      if (particleRefs.current[i]) {
        // Получаем позицию на кривой в зависимости от прогресса
        const pointOnCurve = curve.getPointAt(particle.progress)

        // Получаем направление (касательную) кривой в этой точке
        const tangent = curve.getTangentAt(particle.progress)

        // Создаем перпендикулярные направления (binormal и normal)
        // Это позволит правильно ориентировать смещение частиц
        let normal = new THREE.Vector3(0, 1, 0)
        if (Math.abs(tangent.y) > 0.99) {
          normal.set(1, 0, 0)
        }

        // Binormal - перпендикуляр к касательной и нормали
        const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize()
        // Нормаль - перпендикуляр к касательной и бинормали
        normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize()

        // Вычисляем радиальное смещение от кривой
        const offsetX = Math.cos(particle.offsetAngle) * particle.offsetRadius
        const offsetY = Math.sin(particle.offsetAngle) * particle.offsetRadius

        // Применяем смещение к позиции на кривой
        const finalPosition = pointOnCurve
          .clone()
          .add(normal.clone().multiplyScalar(offsetX))
          .add(binormal.clone().multiplyScalar(offsetY))

        // Устанавливаем позицию частицы
        particleRefs.current[i].position.copy(finalPosition)

        // Вычисляем прозрачность на основе расстояния от камеры
        // Чем ближе к началу кривой (к камере), тем больше прозрачность
        const distance = particle.progress * curve.getLength()
        const fadeFactor =
          distance < particleConfig.fadeDistance ? Math.min(1.0, distance / particleConfig.fadeDistance) : 1.0

        // Применяем прозрачность к материалу частицы
        const mesh = particleRefs.current[i].children[0] as THREE.Mesh
        if (mesh && mesh.material) {
          const material = mesh.material as THREE.MeshBasicMaterial
          material.opacity = particleConfig.opacity * fadeFactor
        }
      }
    })
  })

  // Здесь мы размещаем Billboard вдоль кривой
  return (
    <group ref={particlesRef} renderOrder={1} position={[0, 0, positionZ]}>
      {particles.map((particle, i) => {
        // Получаем начальную точку на кривой для первоначального размещения
        const initialPoint = curve.getPointAt(particle.progress)

        // Получаем начальную касательную для ориентации
        const initialTangent = curve.getTangentAt(particle.progress)

        // Создаем перпендикулярное направление
        let initialNormal = new THREE.Vector3(0, 1, 0)
        if (Math.abs(initialTangent.y) > 0.99) {
          initialNormal.set(1, 0, 0)
        }

        // Вычисляем binormal и нормаль
        const initialBinormal = new THREE.Vector3().crossVectors(initialTangent, initialNormal).normalize()
        initialNormal = new THREE.Vector3().crossVectors(initialBinormal, initialTangent).normalize()

        // Вычисляем начальное смещение
        const initialOffsetX = Math.cos(particle.offsetAngle) * particle.offsetRadius
        const initialOffsetY = Math.sin(particle.offsetAngle) * particle.offsetRadius

        // Применяем смещение к начальной точке
        const initialPosition = initialPoint
          .clone()
          .add(initialNormal.clone().multiplyScalar(initialOffsetX))
          .add(initialBinormal.clone().multiplyScalar(initialOffsetY))

        return (
          <Billboard
            key={i}
            ref={(el) => {
              if (el) particleRefs.current[i] = el
            }}
            position={initialPosition}
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
        )
      })}
    </group>
  )
}

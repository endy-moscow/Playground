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
    baseSpeed: { value: 124, min: 0.1, max: 200, step: 0.5, label: 'Базовая скорость' },
    size: { value: 0.5, min: 0.1, max: 5, step: 0.1, label: 'Размер' },
    minOffset: { value: 9, min: 0, max: 30, step: 1, label: 'Минимальный радиус' },
    maxOffset: { value: 22, min: 0, max: 50, step: 1, label: 'Максимальный радиус' },
    opacity: { value: 1, min: 0, max: 1, step: 0.1, label: 'Прозрачность' },
    tunnelLength: { value: 1000, min: 100, max: 2000, step: 10, label: 'Длина пути' },
    fadeDistance: { value: 900, min: 100, max: 2000, step: 10, label: 'Дистанция затухания' },
  })

  // Создаём данные для частиц с фиксированным положением в X-Y плоскости
  const particles = useMemo(() => {
    const arr: {
      z: number // позиция по Z
      offsetAngle: number // угол смещения в плоскости X-Y
      offsetRadius: number // величина смещения в плоскости X-Y
      speed: number // индивидуальная скорость частицы
    }[] = []

    for (let i = 0; i < particleConfig.count; i++) {
      // Распределяем частицы равномерно вдоль Z
      const z = -particleConfig.tunnelLength * (i / particleConfig.count)

      // Фиксированный угол смещения в X-Y плоскости
      const offsetAngle = Math.random() * Math.PI * 2

      // Радиус смещения от оси между минимальным и максимальным
      const offsetRadius =
        particleConfig.minOffset + Math.random() * (particleConfig.maxOffset - particleConfig.minOffset)

      // Слегка рандомизируем скорость для естественности
      const speed = particleConfig.baseSpeed * (0.9 + Math.random() * 0.2)

      arr.push({
        z,
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
    particleConfig.tunnelLength,
  ])

  // Анимация: двигаем частицы строго вдоль оси Z с фиксированным отклонением
  useFrame((_, delta) => {
    if (!particlesRef.current) return

    particles.forEach((particle, i) => {
      // Движемся только вдоль оси Z
      particle.z += particle.speed * delta

      // Если частица ушла за конец туннеля, перемещаем в начало
      if (particle.z > 0) {
        particle.z = -particleConfig.tunnelLength
      }

      // Вычисляем позицию в плоскости X-Y на основе угла и радиуса
      const x = Math.cos(particle.offsetAngle) * particle.offsetRadius
      const y = Math.sin(particle.offsetAngle) * particle.offsetRadius

      if (particleRefs.current[i]) {
        // Устанавливаем позицию частицы
        particleRefs.current[i].position.set(x, y, particle.z)

        // Вычисляем прозрачность на основе расстояния (эффект затухания)
        const distance = Math.abs(particle.z)
        const fadeFactor =
          distance > particleConfig.fadeDistance
            ? 1.0 -
              Math.min(
                1.0,
                (distance - particleConfig.fadeDistance) / (particleConfig.tunnelLength - particleConfig.fadeDistance),
              )
            : 1.0

        // Применяем прозрачность к материалу частицы
        const mesh = particleRefs.current[i].children[0] as THREE.Mesh
        if (mesh && mesh.material) {
          const material = mesh.material as THREE.MeshBasicMaterial
          material.opacity = particleConfig.opacity * fadeFactor
        }
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
          position={[
            Math.cos(particle.offsetAngle) * particle.offsetRadius,
            Math.sin(particle.offsetAngle) * particle.offsetRadius,
            particle.z,
          ]}
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

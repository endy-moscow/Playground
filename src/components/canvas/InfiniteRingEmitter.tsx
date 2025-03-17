import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { useControls } from 'leva'
import { PointParticleSystem } from './PointParticleSystem'
import { Tunnel } from './Tunnel'
import { createBeerwareShaderMaterial } from '../../templates/Shader/BeerwareShaderMaterial'

// Make sure this interface matches exactly what's defined in BeerwareShaderMaterial.ts
interface BeerwareShaderOptions {
  color1: string
  color2: string
  opacity: number
  scale: number
  offsetX: number
  offsetY: number
  time?: number
  resolution?: THREE.Vector2
}

const InfiniteRingEmitter = () => {
  // Refs для анимации
  const middleOffsetRef = useRef({ x: 0, y: 0 })
  const animationTimeRef = useRef(0)
  const groupRef = useRef<THREE.Group>(null!)

  // Общие настройки туннеля
  const {
    tunnelRadius,
    tunnelLength,
    segments,
    curveAmplitudeStart,
    curveAmplitudeEnd,
    curveTwists,
    autoRotate,
    rotationSpeed,
  } = useControls('Общие настройки', {
    tunnelRadius: { value: 24, min: 1, max: 40, label: 'Радиус тоннеля' },
    tunnelLength: { value: 1500, min: 100, max: 4000, label: 'Длина тоннеля' },
    segments: { value: 64, min: 10, max: 200, step: 1, label: 'Сегменты' },
    curveAmplitudeStart: { value: 0, min: 0, max: 50, label: 'Амплитуда начала' },
    curveAmplitudeEnd: { value: 48, min: 0, max: 100, label: 'Амплитуда конца' },
    curveTwists: { value: 1, min: 0, max: 10, label: 'Количество витков' },
    autoRotate: { value: true, label: 'Автоповорот' },
    rotationSpeed: { value: 0.8, min: -2, max: 2, step: 0.05, label: 'Скорость поворота' },
  })

  // Настройки среднего туннеля (шейдер)
  const {
    middleRadiusRatio,
    middleOpacity,
    middleSpeed,
    middleSpeedX,
    middleSpeedY,
    middleScale,
    middleFadeStartDistance,
    middleFadeEndDistance,
  } = useControls('Средний туннель', {
    middleRadiusRatio: { value: 0.99, min: 0.2, max: 0.99, step: 0.01, label: 'Пропорция радиуса' },
    middleOpacity: { value: 1.0, min: 0, max: 1, step: 0.05, label: 'Прозрачность' },
    middleSpeed: { value: 1.5, min: 0.1, max: 5, step: 0.1, label: 'Скорость анимации' },
    middleSpeedX: { value: 0.6, min: -10, max: 10, step: 0.1, label: 'Скорость X' },
    middleSpeedY: { value: 0.2, min: -10, max: 10, step: 0.1, label: 'Скорость Y' },
    middleScale: { value: 64, min: 1, max: 1000, step: 0.5, label: 'Размер ячеек' },
    middleFadeNearCamera: { value: 0.0, min: 0, max: 1, step: 0.01, label: 'Затухание у камеры' },
    middleFadeDistantParts: { value: 0.025, min: 0, max: 1, step: 0.01, label: 'Затухание вдали' },
    middleFadeStartDistance: { value: 980, min: 0, max: 2000, step: 10, label: 'Начало затухания (у камеры)' },
    middleFadeEndDistance: { value: 630, min: 0, max: 2000, step: 10, label: 'Конец затухания (вдали)' },
  })

  // Фиксированные цвета вместо выбора из предустановок
  const middleColor1 = '#7D164A'
  const middleColor2 = '#E72487'

  // Ref for tracking current speed
  const middleCurrentSpeed = useRef({ x: middleSpeedX, y: middleSpeedY })

  const positionZ = -1498

  // Generate curve for tunnel
  const curve = React.useMemo(() => {
    return new THREE.CatmullRomCurve3(
      Array.from({ length: segments }, (_, i) => {
        const progress = i / segments
        const angle = progress * Math.PI * curveTwists
        const amplitude = (1 - progress) * curveAmplitudeEnd + progress * curveAmplitudeStart
        return new THREE.Vector3(
          Math.sin(angle) * amplitude,
          Math.cos(angle) * amplitude,
          (i * tunnelLength) / segments,
        )
      }),
    )
  }, [segments, tunnelLength, curveAmplitudeStart, curveAmplitudeEnd, curveTwists])

  // Черный материал для подложки (новый)
  const blackBackgroundMaterial = React.useMemo(() => {
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide,
      transparent: false,
      depthWrite: true,
      depthTest: true,
    })
    return material
  }, [])

  // Средний туннель с Beerware шейдером
  const middleTunnelMaterial = React.useMemo(() => {
    const material = createBeerwareShaderMaterial({
      color1: middleColor1,
      color2: middleColor2,
      opacity: middleOpacity,
      scale: middleScale,
      offsetX: 0,
      offsetY: 0,
      time: 0,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      fadeStart: middleFadeStartDistance / tunnelLength,
      fadeEnd: middleFadeEndDistance / tunnelLength,
    })
    // Настройки прозрачности
    material.transparent = true
    material.depthWrite = false
    material.depthTest = true
    material.side = THREE.BackSide
    material.blending = THREE.AdditiveBlending
    return material
  }, [
    middleColor1,
    middleColor2,
    middleOpacity,
    middleScale,
    middleFadeStartDistance,
    middleFadeEndDistance,
    tunnelLength,
  ])

  // Update tunnel animation and rotation
  useFrame((_, delta) => {
    // Обновляем смещение для среднего туннеля
    middleOffsetRef.current.x -= middleSpeedX * delta
    middleOffsetRef.current.y -= middleSpeedY * delta

    // Обновление времени анимации
    animationTimeRef.current += delta * middleSpeed

    // Применяем автоповорот, если он включен
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.z += rotationSpeed * delta
    }

    // Обновляем средний туннель (шейдер)
    const middleMaterial = middleTunnelMaterial as THREE.ShaderMaterial
    if (middleMaterial.uniforms) {
      // Безопасное обновление time
      if (middleMaterial.uniforms.time) {
        middleMaterial.uniforms.time.value = animationTimeRef.current
      }

      // Безопасное обновление offset
      if (middleMaterial.uniforms.offsetX && middleMaterial.uniforms.offsetY) {
        middleMaterial.uniforms.offsetX.value = middleOffsetRef.current.x
        middleMaterial.uniforms.offsetY.value = middleOffsetRef.current.y
      }

      // Безопасное обновление resolution
      if (middleMaterial.uniforms.resolution) {
        middleMaterial.uniforms.resolution.value.x = window.innerWidth
        middleMaterial.uniforms.resolution.value.y = window.innerHeight
      }

      // Безопасное обновление opacity и scale
      if (middleMaterial.uniforms.opacity) {
        middleMaterial.uniforms.opacity.value = middleOpacity
      }

      if (middleMaterial.uniforms.scale) {
        middleMaterial.uniforms.scale.value = middleScale
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Черный тоннель-подложка (новый) */}
      <Tunnel
        curve={curve}
        radius={tunnelRadius * middleRadiusRatio + 0.1}
        segments={segments}
        material={blackBackgroundMaterial}
        position={[0, 0, positionZ]}
        renderOrder={0}
      />

      {/* Средний туннель */}
      <Tunnel
        curve={curve}
        radius={tunnelRadius * middleRadiusRatio}
        segments={segments}
        material={middleTunnelMaterial}
        position={[0, 0, positionZ]}
        renderOrder={1}
      />

      {/* Частицы */}
      <PointParticleSystem curve={curve} positionZ={positionZ} />
    </group>
  )
}

export default InfiniteRingEmitter

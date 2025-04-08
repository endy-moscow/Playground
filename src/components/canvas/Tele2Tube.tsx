import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva'
import { PointParticleSystem } from './PointParticleSystem'
import { Tunnel } from './Tunnel'
// Import the specific creator function
import { createTele2ShaderMaterial } from '../../templates/Shader/Tele2ShaderMaterial'

// Removed the large BeerwareShaderOptions interface here,
// as we are not using createBeerwareShaderMaterial in this component anymore.
// If you use it elsewhere, keep the interface definition there or in a shared types file.

const Tele2Tube = () => {
  // Refs for animation
  // middleOffsetRef is no longer needed for the new shader
  const animationTimeRef = useRef(0)
  const groupRef = useRef<THREE.Group>(null!)

  // Общие настройки туннеля (Keep these as they define the geometry)
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
    curveTwists: { value: 7, min: 0, max: 10, label: 'Количество витков' },
    autoRotate: { value: true, label: 'Автоповорот' },
    rotationSpeed: { value: 0.8, min: -2, max: 2, step: 0.05, label: 'Скорость поворота' },
  })

  // Настройки для шейдера с новыми параметрами качества и интенсивности
  const { middleOpacity, colorIntensity, primaryColor, secondaryColor, gridSize, animationSpeed } = useControls(
    'Настройки Шейдера Туннеля',
    {
      middleOpacity: { value: 1.0, min: 0, max: 1, step: 0.05, label: 'Прозрачность' },
      colorIntensity: { value: 0.1, min: 0.1, max: 5.0, step: 0.1, label: 'Интенсивность цвета' },
      primaryColor: { value: '#00aaff', label: 'Основной цвет' },
      secondaryColor: { value: '#0044aa', label: 'Дополнительный цвет' },
      gridSize: { value: 8, min: 2, max: 20, step: 1, label: 'Размер сетки' },
      animationSpeed: { value: 1.4, min: 0.1, max: 3.0, step: 0.1, label: 'Скорость анимации' },
    },
  )

  const positionZ = -tunnelLength + 2 // Adjust slightly to ensure camera starts inside

  // Generate curve for tunnel (Keep this)
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      Array.from({ length: segments }, (_, i) => {
        const progress = i / segments
        const angle = progress * Math.PI * 2 * curveTwists // Corrected twist calculation
        const amplitude = THREE.MathUtils.lerp(curveAmplitudeStart, curveAmplitudeEnd, progress) // Use lerp for smooth transition
        return new THREE.Vector3(
          Math.sin(angle) * amplitude,
          Math.cos(angle) * amplitude,
          (i * tunnelLength) / segments,
        )
      }),
      false, // closed
      'catmullrom', // curveType
      0.5, // tension
    )
  }, [segments, tunnelLength, curveAmplitudeStart, curveAmplitudeEnd, curveTwists])

  // Черный материал для подложки (Keep this or remove if not needed with new shader)
  // It might help prevent seeing "outside" if the raymarching misses sometimes.
  const blackBackgroundMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide,
      transparent: false,
      depthWrite: true, // Important: Let it write depth
      depthTest: true,
    })
  }, [])

  // Создаем материал с улучшенным шейдером Tele2
  const middleTunnelMaterial = useMemo(() => {
    return createTele2ShaderMaterial({
      opacity: middleOpacity,
      colorIntensity: colorIntensity,
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      gridSize: gridSize,
      animationSpeed: animationSpeed,
    })
  }, [middleOpacity, colorIntensity, primaryColor, secondaryColor, gridSize, animationSpeed])

  // Update tunnel animation and rotation
  useFrame((state, delta) => {
    // Update animation time, scaled by the speed control
    animationTimeRef.current += delta * animationSpeed

    // Apply auto-rotation if enabled
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.z += rotationSpeed * delta
    }

    // Update the uniforms of the new Tele2 shader material
    const material = middleTunnelMaterial as THREE.ShaderMaterial
    if (material.uniforms) {
      // Update time
      if (material.uniforms.time) {
        material.uniforms.time.value = animationTimeRef.current
      }

      // Update resolution on resize (could also be done with an effect)
      if (material.uniforms.resolution) {
        const currentWidth = state.size.width * state.viewport.dpr
        const currentHeight = state.size.height * state.viewport.dpr
        if (
          material.uniforms.resolution.value.x !== currentWidth ||
          material.uniforms.resolution.value.y !== currentHeight
        ) {
          material.uniforms.resolution.value.set(currentWidth, currentHeight)
        }
      }

      // Update opacity from Leva control
      if (material.uniforms.opacity) {
        material.uniforms.opacity.value = middleOpacity
      }

      // Update color intensity if changed
      if (material.uniforms.colorIntensity) {
        material.uniforms.colorIntensity.value = colorIntensity
      }

      // Update animation speed if changed
      if (material.uniforms.animationSpeed) {
        material.uniforms.animationSpeed.value = animationSpeed
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Черный тоннель-подложка (Render first) */}
      {/* Use slightly larger radius to avoid z-fighting */}
      <Tunnel
        curve={curve}
        radius={tunnelRadius + 0.1}
        segments={segments}
        material={blackBackgroundMaterial}
        position={[0, 0, positionZ]}
        renderOrder={0} // Render before the shader tunnel
      />

      {/* Туннель с новым Tele2 шейдером (Raymarched) */}
      <Tunnel
        curve={curve}
        radius={tunnelRadius} // Use the main radius
        segments={segments}
        material={middleTunnelMaterial}
        position={[0, 0, positionZ]}
        renderOrder={1} // Render after the black background
      />

      {/* Частицы (Keep if desired) */}
      <PointParticleSystem curve={curve} positionZ={positionZ} />
    </group>
  )
}

export default Tele2Tube

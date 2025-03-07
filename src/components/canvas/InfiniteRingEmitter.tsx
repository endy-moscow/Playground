import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { useControls } from 'leva'
import { PointParticleSystem } from './PointParticleSystem'
import { Tunnel } from './Tunnel'
import { createBeerwareShaderMaterial } from '../../templates/Shader/BeerwareShaderMaterial'
import { createOuterTunnelShaderMaterial } from '../../templates/Shader/OuterTunnelShaderMaterial'
import { createInnerTunnelMaterial } from '../../templates/Shader/InnerTunnelShaderMaterial'

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
  // Refs for texture offsets and animation state
  const outerOffsetRef = useRef({ x: 0, y: 0 })
  const middleOffsetRef = useRef({ x: 0, y: 0 })
  const innerOffsetRef = useRef({ x: 0, y: 0 })
  const animationTimeRef = useRef(0)

  // Общие настройки туннеля
  const { tunnelRadius, tunnelLength, segments, curveAmplitudeStart, curveAmplitudeEnd, curveTwists } = useControls(
    'Общие настройки',
    {
      tunnelRadius: { value: 20, min: 1, max: 30, label: 'Радиус тоннеля' },
      tunnelLength: { value: 1000, min: 100, max: 2000, label: 'Длина тоннеля' },
      segments: { value: 48, min: 10, max: 200, step: 1, label: 'Сегменты' },
      curveAmplitudeStart: { value: 0, min: 0, max: 50, label: 'Амплитуда начала' },
      curveAmplitudeEnd: { value: 48, min: 0, max: 100, label: 'Амплитуда конца' },
      curveTwists: { value: 1, min: 0, max: 10, label: 'Количество витков' },
    },
  )

  // Настройки внешнего туннеля
  const {
    tunnelSpeedX,
    tunnelSpeedY,
    textureRepeatX,
    textureRepeatY,
    overlayTextureRepeatX,
    overlayTextureRepeatY,
    bumpIntensity,
    overlayOpacity,
  } = useControls('Внешний туннель', {
    tunnelSpeedX: { value: 0.4, min: -10, max: 10, step: 0.1, label: 'Скорость X' },
    tunnelSpeedY: { value: 0.2, min: -10, max: 10, step: 0.1, label: 'Скорость Y' },
    textureRepeatX: { value: 64, min: 1, max: 128, label: 'Повтор текстуры X' },
    textureRepeatY: { value: 64, min: 1, max: 128, label: 'Повтор текстуры Y' },
    overlayTextureRepeatX: { value: 0.8, min: 0.1, max: 10, label: 'Повтор наложения X' },
    overlayTextureRepeatY: { value: 0.8, min: 0.1, max: 10, label: 'Повтор наложения Y' },
    bumpIntensity: { value: 7, min: 0, max: 50, step: 1, label: 'Интенсивность рельефа' },
    overlayOpacity: { value: 3, min: 0, max: 5, label: 'Прозрачность наложения' },
  })

  // Настройки среднего туннеля (шейдер)
  const {
    middleRadiusRatio,
    middleOpacity,
    middleSpeed,
    middleSpeedX,
    middleSpeedY,
    middleScale,
    middleColorPreset,
    middleFadeStart,
    middleFadeEnd,
  } = useControls('Средний туннель', {
    middleRadiusRatio: { value: 0.85, min: 0.2, max: 0.98, step: 0.01, label: 'Пропорция радиуса' },
    middleOpacity: { value: 0.5, min: 0, max: 1, step: 0.05, label: 'Прозрачность' },
    middleSpeed: { value: 0.5, min: 0.1, max: 5, step: 0.1, label: 'Скорость анимации' },
    middleSpeedX: { value: 0.6, min: -10, max: 10, step: 0.1, label: 'Скорость X' },
    middleSpeedY: { value: 0.2, min: -10, max: 10, step: 0.1, label: 'Скорость Y' },
    middleScale: { value: 124, min: 1, max: 1000, step: 0.5, label: 'Размер ячеек' },
    // Используем выбор из предустановленных цветов
    middleColorPreset: {
      options: {
        Magenta: 'magenta',
        Красный: 'red',
        Зеленый: 'green',
        Оранжевый: 'orange',
        Фиолетовый: 'purple',
      },
      value: 'magenta',
      label: 'Основной цвет',
    },
    middleFadeStart: { value: 0.6, min: 0, max: 1, step: 0.001, label: 'Начало затухания' },
    middleFadeEnd: { value: 0.5, min: 0, max: 1, step: 0.001, label: 'Конец затухания' },
  })

  // Функция для преобразования предустановок в цвета
  const getColorsByPreset = (preset) => {
    const presets = {
      magenta: { color1: '#7D164A', color2: '#E72487' },
      red: { color1: '#ff5555', color2: '#cc0000' },
      green: { color1: '#44ff44', color2: '#009900' },
      orange: { color1: '#ffaa00', color2: '#ff6600' },
      purple: { color1: '#aa00ff', color2: '#6600cc' },
    }
    return presets[preset] || presets.magenta
  }

  const { color1: middleColor1, color2: middleColor2 } = getColorsByPreset(middleColorPreset)

  // Настройки внутреннего туннеля (текстура)
  const { innerRadiusRatio, innerOpacity, innerSpeedX, innerSpeedY, innerTextureRepeatX, innerTextureRepeatY } =
    useControls('Внутренний туннель', {
      innerRadiusRatio: { value: 0.92, min: 0.2, max: 0.98, step: 0.01, label: 'Пропорция радиуса' },
      innerOpacity: { value: 0.7, min: 0, max: 1, step: 0.05, label: 'Прозрачность' },
      innerSpeedX: { value: 1.3, min: -10, max: 10, step: 0.1, label: 'Скорость X' },
      innerSpeedY: { value: 0.15, min: -10, max: 10, step: 0.1, label: 'Скорость Y' },
      innerTextureRepeatX: { value: 3, min: 1, max: 10, step: 0.1, label: 'Повтор текстуры X' },
      innerTextureRepeatY: { value: 3, min: 1, max: 10, step: 0.1, label: 'Повтор текстуры Y' },
    })

  // Ref for tracking current speed
  const middleCurrentSpeed = useRef({ x: middleSpeedX, y: middleSpeedY })

  const positionZ = -998
  const overlayTextureRepeat = React.useMemo(
    () => ({ x: overlayTextureRepeatX, y: overlayTextureRepeatY }),
    [overlayTextureRepeatX, overlayTextureRepeatY],
  )
  const textureRepeat = React.useMemo(
    () => ({ x: textureRepeatX, y: textureRepeatY }),
    [textureRepeatX, textureRepeatY],
  )

  const innerTextureRepeat = React.useMemo(
    () => ({ x: innerTextureRepeatX, y: innerTextureRepeatY }),
    [innerTextureRepeatX, innerTextureRepeatY],
  )

  // Load textures
  const [baseColorMap, overlayTexture, bumpMap, innerTexture] = useLoader(TextureLoader, [
    '/img/basecolor.jpg',
    '/img/overlay-texture.png',
    '/img/bumb.jpg',
    '/img/inner.png',
  ])

  // Setup textures
  const setupTexture = (texture, repeat) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(repeat.x, repeat.y)
    texture.minFilter = texture.magFilter = THREE.LinearFilter
    return texture
  }

  setupTexture(baseColorMap, textureRepeat)
  setupTexture(overlayTexture, overlayTextureRepeat)
  setupTexture(bumpMap, textureRepeat)
  setupTexture(innerTexture, innerTextureRepeat)

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

  // Внешний шейдерный материал (текстурированный туннель)
  const outerTunnelMaterial = React.useMemo(() => {
    return createOuterTunnelShaderMaterial({
      baseColorMap,
      overlayTexture,
      bumpMap,
      bumpIntensity,
      overlayOpacity,
      textureRepeat,
      overlayTextureRepeat,
    })
  }, [baseColorMap, overlayTexture, bumpMap, bumpIntensity, textureRepeat, overlayTextureRepeat, overlayOpacity])

  // Средний туннель с Beerware шейдером
  const middleTunnelMaterial = React.useMemo(() => {
    return createBeerwareShaderMaterial({
      color1: middleColor1,
      color2: middleColor2,
      opacity: middleOpacity,
      scale: middleScale,
      offsetX: 0,
      offsetY: 0,
      time: 0,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      fadeStart: middleFadeStart,
      fadeEnd: middleFadeEnd,
    })
  }, [middleColor1, middleColor2, middleOpacity, middleScale, middleFadeStart, middleFadeEnd])

  // Внутренний туннель с текстурой inner.png
  const innerTunnelMaterial = React.useMemo(() => {
    return createInnerTunnelMaterial({
      texture: innerTexture,
      opacity: innerOpacity,
    })
  }, [innerTexture, innerOpacity])

  // Update tunnel texture animation
  useFrame((_, delta) => {
    // Обновляем смещение для внешнего туннеля
    outerOffsetRef.current.x -= tunnelSpeedX * delta
    outerOffsetRef.current.y -= tunnelSpeedY * delta

    // Обновляем смещение для среднего туннеля
    middleOffsetRef.current.x -= middleSpeedX * delta
    middleOffsetRef.current.y -= middleSpeedY * delta

    // Обновление смещения для внутреннего туннеля
    innerOffsetRef.current.x -= innerSpeedX * delta
    innerOffsetRef.current.y -= innerSpeedY * delta

    // Обновление времени анимации
    animationTimeRef.current += delta * middleSpeed

    // Применяем обновленные значения к материалам
    const outerMaterial = outerTunnelMaterial as THREE.ShaderMaterial
    outerMaterial.uniforms.baseOffset.value.set(outerOffsetRef.current.x, outerOffsetRef.current.y)
    outerMaterial.uniforms.bumpIntensity.value = bumpIntensity
    outerMaterial.uniforms.overlayOpacity.value = overlayOpacity

    // Обновляем средний туннель (шейдер)
    const middleMaterial = middleTunnelMaterial as THREE.ShaderMaterial
    if (middleMaterial.uniforms) {
      // Безопасное обновление time
      if (middleMaterial.uniforms.time) {
        middleMaterial.uniforms.time.value = animationTimeRef.current
      }

      // Безопасное обновление offset - fixed to use offsetX and offsetY
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

    // Обновляем внутренний туннель (текстуру)
    if (innerTunnelMaterial.map) {
      innerTunnelMaterial.map.offset.set(innerOffsetRef.current.x, innerOffsetRef.current.y)
    }
    innerTunnelMaterial.opacity = innerOpacity
  })

  return (
    <>
      {/* Внешний туннель (самый большой радиус) */}
      <Tunnel
        curve={curve}
        radius={tunnelRadius}
        segments={segments}
        material={outerTunnelMaterial}
        position={[0, 0, positionZ]}
        renderOrder={1}
      />

      {/* Средний туннель */}
      <Tunnel
        curve={curve}
        radius={tunnelRadius * middleRadiusRatio}
        segments={segments}
        material={middleTunnelMaterial}
        position={[0, 0, positionZ]}
        renderOrder={2}
      />

      {/* Внутренний туннель (самый малый радиус) */}
      <Tunnel
        curve={curve}
        radius={tunnelRadius * innerRadiusRatio}
        segments={segments}
        material={innerTunnelMaterial}
        position={[0, 0, positionZ]}
        renderOrder={3}
      />

      <PointParticleSystem curve={curve} positionZ={positionZ} />
    </>
  )
}

export default InfiniteRingEmitter

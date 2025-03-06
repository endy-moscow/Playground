import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { useControls } from 'leva'
import { PointParticleSystem } from './PointParticleSystem'
import { Tunnel } from './Tunnel'
import { createBeerwareShaderMaterial } from '../../templates/Shader/BeerwareShaderMaterial'

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
    textureRepeatX: { value: 2, min: 1, max: 64, label: 'Повтор текстуры X' },
    textureRepeatY: { value: 2, min: 1, max: 64, label: 'Повтор текстуры Y' },
    overlayTextureRepeatX: { value: 0.8, min: 0.1, max: 10, label: 'Повтор наложения X' },
    overlayTextureRepeatY: { value: 0.8, min: 0.1, max: 10, label: 'Повтор наложения Y' },
    bumpIntensity: { value: 7, min: 0, max: 50, step: 1, label: 'Интенсивность рельефа' },
    overlayOpacity: { value: 3, min: 0, max: 5, label: 'Прозрачность наложения' },
  })

  // Настройки среднего туннеля (шейдер)
  const { middleRadiusRatio, middleOpacity, middleSpeed, middleSpeedX, middleSpeedY, middleScale, middleColorPreset } =
    useControls('Средний туннель', {
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
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: true,
      depthTest: true,
      uniforms: {
        baseColorMap: { value: baseColorMap },
        overlayTexture: { value: overlayTexture },
        bumpMap: { value: bumpMap },
        bumpIntensity: { value: bumpIntensity },
        overlayOpacity: { value: overlayOpacity },
        baseOffset: { value: new THREE.Vector2(0, 0) },
        baseRepeat: { value: new THREE.Vector2(textureRepeat.x, textureRepeat.y) },
        overlayRepeat: { value: new THREE.Vector2(overlayTextureRepeat.x, overlayTextureRepeat.y) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vTangent;
        varying vec3 vBitangent;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          
          // Calculate tangent vectors for bump mapping
          vec3 tangent = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
          vec3 bitangent = normalize(cross(vNormal, tangent));
          vTangent = tangent;
          vBitangent = bitangent;
          
          vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -modelPosition.xyz;
          
          gl_Position = projectionMatrix * modelPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D baseColorMap;
        uniform sampler2D overlayTexture;
        uniform sampler2D bumpMap;
        uniform float bumpIntensity;
        uniform float overlayOpacity;
        uniform vec2 baseOffset;
        uniform vec2 baseRepeat;
        uniform vec2 overlayRepeat;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vTangent;
        varying vec3 vBitangent;
        
        void main() {
          vec2 baseUv = mod((vUv * baseRepeat) + baseOffset, 1.0);
          vec2 overlayUv = mod(vUv * overlayRepeat, 1.0);
          
          // Sample the base and overlay textures
          vec4 baseColor = texture2D(baseColorMap, baseUv);
          vec4 overlayColor = texture2D(overlayTexture, overlayUv);
          
          // Sample the bump map
          vec3 bumpValue = texture2D(bumpMap, baseUv).rgb;
          float bumpAmount = (bumpValue.r + bumpValue.g + bumpValue.b) / 3.0;
          float bumpScale = 0.015 * bumpIntensity;
          
          vec3 normalPerturbation = normalize(
            vNormal + vTangent * (bumpAmount * 2.0 - 1.0) * bumpScale
            + vBitangent * (bumpAmount * 2.0 - 1.0) * bumpScale
          );
          
          float viewFactor = pow(abs(dot(normalPerturbation, vec3(0.0, 0.0, 1.0))), 0.5);
          float blendFactor = overlayColor.a * overlayOpacity * viewFactor;
          
          float reflectivity = bumpAmount * 0.2 * bumpIntensity;
          
          vec4 finalColor = vec4(mix(baseColor.rgb * 0.8, overlayColor.rgb, blendFactor), baseColor.a);
          finalColor.rgb += reflectivity * vec3(0.1, 0.1, 0.2);
          finalColor.rgb = max(finalColor.rgb, vec3(0.02));
          
          gl_FragColor = finalColor;
        }
      `,
    })
  }, [baseColorMap, overlayTexture, bumpMap, bumpIntensity, textureRepeat, overlayTextureRepeat, overlayOpacity])

  // Средний туннель с Beerware шейдером
  const middleTunnelMaterial = React.useMemo(() => {
    return createBeerwareShaderMaterial({
      color1: middleColor1,
      color2: middleColor2,
      opacity: middleOpacity,
      scale: middleScale,
      offset: new THREE.Vector2(0, 0),
      time: 0,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    })
  }, [middleColor1, middleColor2, middleOpacity, middleScale])

  // Внутренний туннель с текстурой inner.png
  const innerTunnelMaterial = React.useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: innerTexture,
      transparent: true,
      opacity: innerOpacity,
      side: THREE.BackSide,
      depthWrite: false,
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

      // Безопасное обновление offset
      if (middleMaterial.uniforms.offset) {
        middleMaterial.uniforms.offset.value.x = middleOffsetRef.current.x
        middleMaterial.uniforms.offset.value.y = middleOffsetRef.current.y
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

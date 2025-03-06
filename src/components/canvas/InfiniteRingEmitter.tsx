import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { useControls } from 'leva'
import { PointParticleSystem } from './PointParticleSystem'
import { Tunnel } from './Tunnel'
import { createBeerwareShaderMaterial } from '../../templates/Shader/BeerwareShaderMaterial'

const InfiniteRingEmitter = () => {
  const textureOffsetRef = useRef({ x: 0, y: 0 })
  const innerOffsetRef = useRef({ x: 0, y: 0 })
  const voronoiOffsetRef = useRef({ x: 0, y: 0 })
  const voronoiTimeRef = useRef(0)

  // Расширенные настройки Leva с добавлением параметров для Вороного
  const {
    // ...существующие параметры...
    tunnelRadius,
    tunnelLength,
    segments,
    tunnelSpeedX,
    tunnelSpeedY,
    textureRepeatX,
    textureRepeatY,
    overlayTextureRepeatX,
    overlayTextureRepeatY,
    bumpIntensity,
    overlayOpacity,
    curveAmplitudeStart,
    curveAmplitudeEnd,
    curveTwists,

    // Внутренний туннель
    innerRadiusRatio,
    innerOpacity,
    innerSpeedX,
    innerSpeedY,
    innerAcceleration,

    // Новые параметры для туннеля с Вороного
    voronoiRadiusRatio,
    voronoiOpacity,
    voronoiSpeed,
    voronoiScale,
    voronoiColor1,
    voronoiColor2,
  } = useControls('Тоннель', {
    // ...существующие параметры...
    tunnelRadius: { value: 20, min: 1, max: 30, label: 'Радиус тоннеля' },
    tunnelLength: { value: 1000, min: 100, max: 2000, label: 'Длина тоннеля' },
    segments: { value: 48, min: 10, max: 200, step: 1, label: 'Сегменты' },
    tunnelSpeedX: { value: 0.4, min: -10, max: 10, step: 0.1, label: 'Скорость X' },
    tunnelSpeedY: { value: 0.1, min: -10, max: 10, step: 0.1, label: 'Скорость Y' },
    textureRepeatX: { value: 2, min: 1, max: 64, label: 'Повтор текстуры X' },
    textureRepeatY: { value: 2, min: 1, max: 64, label: 'Повтор текстуры Y' },
    overlayTextureRepeatX: { value: 0.8, min: 0.1, max: 10, label: 'Повтор наложения X' },
    overlayTextureRepeatY: { value: 0.8, min: 0.1, max: 10, label: 'Повтор наложения Y' },
    bumpIntensity: { value: 7, min: 0, max: 50, step: 1, label: 'Интенсивность рельефа' },
    overlayOpacity: { value: 3, min: 0, max: 5, label: 'Прозрачность наложения' },
    curveAmplitudeStart: { value: 0, min: 0, max: 50, label: 'Амплитуда начала' },
    curveAmplitudeEnd: { value: 48, min: 0, max: 100, label: 'Амплитуда конца' },
    curveTwists: { value: 1, min: 0, max: 10, label: 'Количество витков' },
    innerRadiusRatio: { value: 0.85, min: 0.2, max: 0.98, step: 0.01, label: 'Пропорция внутр. радиуса' },
    innerOpacity: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Прозрачность внутр. слоя' },
    innerSpeedX: { value: 0.6, min: -10, max: 10, step: 0.1, label: 'Скорость X внутр.' },
    innerSpeedY: { value: 0.2, min: -10, max: 10, step: 0.1, label: 'Скорость Y внутр.' },
    innerAcceleration: { value: 0, min: 0, max: 1, step: 0.01, label: 'Ускорение внутр.' },
    // Группа для эффекта воронои (складываем в конец)
    voronoiRadiusRatio: { value: 0.92, min: 0.2, max: 0.98, step: 0.01, label: 'Пропорция Вороного' },
    voronoiOpacity: { value: 0.5, min: 0, max: 1, step: 0.05, label: 'Прозрачность Вороного' },
    voronoiSpeed: { value: 0.5, min: 0.1, max: 5, step: 0.1, label: 'Скорость Вороного' },
    voronoiScale: { value: 5, min: 1, max: 20, step: 0.5, label: 'Масштаб клеток' },
    voronoiColor1: { value: '#00aaff', label: 'Цвет 1' },
    voronoiColor2: { value: '#0088ff', label: 'Цвет 2' },
  })

  // Рефы для отслеживания актуальной скорости с учетом ускорения
  const innerCurrentSpeed = useRef({ x: innerSpeedX, y: innerSpeedY })

  const positionZ = -998
  const overlayTextureRepeat = React.useMemo(
    () => ({ x: overlayTextureRepeatX, y: overlayTextureRepeatY }),
    [overlayTextureRepeatX, overlayTextureRepeatY],
  )
  const textureRepeat = React.useMemo(
    () => ({ x: textureRepeatX, y: textureRepeatY }),
    [textureRepeatX, textureRepeatY],
  )

  // Load textures
  const [baseColorMap, overlayTexture, bumpMap, innerTexture] = useLoader(TextureLoader, [
    '/img/basecolor.jpg',
    '/img/overlay-texture.png',
    '/img/bumb.jpg',
    '/img/inner.png', // Для внутреннего слоя можно использовать ту же или другую текстуру
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
  setupTexture(innerTexture, { x: textureRepeat.x * 1.5, y: textureRepeat.y * 1.5 }) // Другой масштаб для внутреннего слоя

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

  // Внешний шейдерный материал (оставляем как в оригинале)
  const outerTunnelMaterial = React.useMemo(() => {
    // ...существующий код создания материала...
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

  // Создаем упрощенный материал для внутреннего туннеля
  const innerTunnelMaterial = React.useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide, //
      transparent: true,
      opacity: innerOpacity,
      depthWrite: false,
      depthTest: true, // Важно для правильной отрисовки
      blending: THREE.AdditiveBlending,
      uniforms: {
        innerTexture: { value: innerTexture },
        baseOffset: { value: new THREE.Vector2(0, 0) },
        baseRepeat: { value: new THREE.Vector2(textureRepeat.x * 1.5, textureRepeat.y * 1.5) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * modelPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D innerTexture;
        uniform vec2 baseOffset;
        uniform vec2 baseRepeat;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = mod((vUv * baseRepeat) + baseOffset, 1.0);
          vec4 texColor = texture2D(innerTexture, uv);
          
          // Добавляем свечение и эффекты
          vec3 glow = vec3(0.2, 0.4, 0.8) * 0.5;
          texColor.rgb = mix(texColor.rgb, glow, 0.6);
          
          gl_FragColor = texColor;
        }
      `,
    })
  }, [innerTexture, textureRepeat, innerOpacity])

  // Add a new material instance for the inner tunnel
  const innerBeerwareMaterial = React.useMemo(() => {
    return createBeerwareShaderMaterial({
      color1: '#00ddff', // Slightly different color for inner tunnel
      color2: '#0066ff',
      opacity: innerOpacity,
    })
  }, [innerOpacity])

  // Original voronoi material replacement (for the middle tunnel)
  const beerwareShaderMaterial = React.useMemo(() => {
    return createBeerwareShaderMaterial({
      color1: voronoiColor1,
      color2: voronoiColor2,
      opacity: voronoiOpacity,
    })
  }, [voronoiColor1, voronoiColor2, voronoiOpacity])

  // Update tunnel texture animation
  useFrame((_, delta) => {
    // Обновляем смещение для внешнего туннеля
    textureOffsetRef.current.x -= tunnelSpeedX * delta
    textureOffsetRef.current.y -= tunnelSpeedY * delta

    // Вычисляем ускорение для внутреннего туннеля (плавное увеличение скорости)
    if (innerAcceleration > 0) {
      innerCurrentSpeed.current.x += (innerSpeedX * 1.5 - innerCurrentSpeed.current.x) * innerAcceleration * delta
      innerCurrentSpeed.current.y += (innerSpeedY * 1.5 - innerCurrentSpeed.current.y) * innerAcceleration * delta
    } else {
      // Без ускорения используем базовую скорость
      innerCurrentSpeed.current.x = innerSpeedX
      innerCurrentSpeed.current.y = innerSpeedY
    }

    // Обновляем смещение для внутреннего туннеля (независимая скорость)
    innerOffsetRef.current.x -= innerCurrentSpeed.current.x * delta
    innerOffsetRef.current.y -= innerCurrentSpeed.current.y * delta

    // Обновление для туннеля с Вороного
    voronoiTimeRef.current += delta * voronoiSpeed
    voronoiOffsetRef.current.x += delta * voronoiSpeed * 0.2
    voronoiOffsetRef.current.y += delta * voronoiSpeed * 0.1

    const outerMaterial = outerTunnelMaterial as THREE.ShaderMaterial
    outerMaterial.uniforms.baseOffset.value.set(textureOffsetRef.current.x, textureOffsetRef.current.y)
    outerMaterial.uniforms.bumpIntensity.value = bumpIntensity
    outerMaterial.uniforms.overlayOpacity.value = overlayOpacity

    const innerMaterial = innerTunnelMaterial as THREE.ShaderMaterial
    innerMaterial.uniforms.baseOffset.value.set(innerOffsetRef.current.x, innerOffsetRef.current.y)
    innerMaterial.opacity = innerOpacity // Явное обновление прозрачности

    const innerBeerwareMat = innerBeerwareMaterial as THREE.ShaderMaterial
    innerBeerwareMat.uniforms.time.value = voronoiTimeRef.current * 0.7 // Slightly different speed
    innerBeerwareMat.uniforms.resolution.value.set(window.innerWidth, window.innerHeight)
    innerBeerwareMat.uniforms.opacity.value = innerOpacity // Update opacity

    const beerwareMat = beerwareShaderMaterial as THREE.ShaderMaterial
    beerwareMat.uniforms.time.value = voronoiTimeRef.current
    beerwareMat.uniforms.resolution.value.set(window.innerWidth, window.innerHeight)
    beerwareMat.uniforms.opacity.value = voronoiOpacity // Update opacity
  })

  return (
    <>
      {/* Внешний туннель */}
      <Tunnel
        curve={curve}
        radius={tunnelRadius}
        segments={segments}
        material={outerTunnelMaterial}
        position={[0, 0, positionZ]}
        renderOrder={1}
      />

      {/* Внутренний туннель с Beerware */}
      <Tunnel
        curve={curve}
        radius={tunnelRadius * innerRadiusRatio}
        segments={segments}
        material={innerBeerwareMaterial}
        position={[0, 0, positionZ]}
        renderOrder={2}
      />

      {/* Воронои туннель также с Beerware, но с другими параметрами */}
      <Tunnel
        curve={curve}
        radius={tunnelRadius * voronoiRadiusRatio}
        segments={segments}
        material={beerwareShaderMaterial}
        position={[0, 0, positionZ]}
        renderOrder={3}
      />

      <PointParticleSystem curve={curve} positionZ={positionZ} />
    </>
  )
}

export default InfiniteRingEmitter

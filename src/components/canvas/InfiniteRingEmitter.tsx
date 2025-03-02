import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree, useLoader } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import { TextureLoader } from 'three'

const InfiniteRingEmitter = () => {
  // ======== Ссылки на объекты туннеля и частиц (точки) ========
  const tunnelRef = useRef<THREE.Mesh>(null)
  const pointsRef = useRef<THREE.Points>(null)

  // Размер вьюпорта нужен для LineMaterial (чтобы правильно масштабировать толщину в пикселях)
  const { size } = useThree()

  // Параметры из Leva - удаляем autoRotateSpeed
  const {
    tunnelRadius,
    tunnelLength,
    segments,
    tunnelSpeed,
    textureRepeat,
    overlayTextureRepeat,
    overlayOpacity,
    normalScale,
    roughnessIntensity,
    metallicIntensity,
    curveAmplitudeStart,
    curveAmplitudeEnd,
    curveTwists,
    positionZ,
    particleCount,
    particleRandomOffset,
    particleSpeed,
    particleSize,
    particleMinDistance, // Добавляем минимальную дистанцию от центра
  } = useControls({
    tunnelRadius: { value: 24, min: 10, max: 100, step: 1 },
    tunnelLength: { value: 1000, min: 500, max: 2000, step: 10 },
    segments: { value: 300, min: 100, max: 1000, step: 10 },
    tunnelSpeed: { value: { x: 7, y: 0 }, joystick: 'invertY' },
    textureRepeat: { value: { x: 40, y: 10 }, joystick: 'invertY' },
    overlayTextureRepeat: { value: { x: 1, y: 1 }, joystick: 'invertY' },
    overlayOpacity: { value: 0.5, min: 0, max: 1, step: 0.01 },
    normalScale: { value: 1.0, min: 0, max: 2, step: 0.1 },
    roughnessIntensity: { value: 1.0, min: 0, max: 2, step: 0.1 },
    metallicIntensity: { value: 0.5, min: 0, max: 1, step: 0.1 },
    curveAmplitudeStart: { value: 0, min: 0, max: 100, step: 1 },
    curveAmplitudeEnd: { value: 60, min: 0, max: 100, step: 1 },
    curveTwists: { value: 1, min: 1, max: 10, step: 1 },
    positionZ: { value: -999, min: -2000, max: 0, step: 10 },
    particleCount: { value: 500, min: 200, max: 5000, step: 100 },
    particleRandomOffset: { value: 20, min: 0, max: 100, step: 0.1 },
    particleSpeed: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    particleSize: { value: 1.5, min: 0.1, max: 5, step: 0.1 },
    particleMinDistance: { value: 5, min: 0, max: 50, step: 1 },
  })

  // =============================
  // === Загрузка PBR текстур и оверлея
  // =============================
  const [baseColorMap, metallicMap, normalMap, opacityMap, roughnessMap, overlayTexture] = useLoader(TextureLoader, [
    '/img/basecolor.jpg',
    '/img/metallic.jpg',
    '/img/normal.jpg',
    '/img/opacity.jpg',
    '/img/roughness.jpg',
    '/img/overlay-texture.png',
  ])

  // Настройка всех текстур
  const setupTexture = (texture, repeat) => {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(repeat.x, repeat.y)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    return texture
  }

  // Настройка PBR текстур
  setupTexture(baseColorMap, textureRepeat)
  setupTexture(metallicMap, textureRepeat)
  setupTexture(normalMap, textureRepeat)
  setupTexture(opacityMap, textureRepeat)
  setupTexture(roughnessMap, textureRepeat)
  setupTexture(overlayTexture, overlayTextureRepeat)

  // Создаем пользовательский шейдерный материал с PBR
  const tunnelMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      uniforms: {
        baseColorMap: { value: baseColorMap },
        metallicMap: { value: metallicMap },
        normalMap: { value: normalMap },
        opacityMap: { value: opacityMap },
        roughnessMap: { value: roughnessMap },
        overlayTexture: { value: overlayTexture },
        overlayOpacity: { value: overlayOpacity },
        normalScale: { value: normalScale },
        roughnessIntensity: { value: roughnessIntensity },
        metallicIntensity: { value: metallicIntensity },
        baseOffset: { value: new THREE.Vector2(0, 0) },
        baseRepeat: { value: new THREE.Vector2(textureRepeat.x, textureRepeat.y) },
        overlayRepeat: { value: new THREE.Vector2(overlayTextureRepeat.x, overlayTextureRepeat.y) },
        lightPosition: { value: new THREE.Vector3(0, 0, 0) }, // Добавляем позицию света
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vViewPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -modelPosition.xyz;
          
          gl_Position = projectionMatrix * modelPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D baseColorMap;
        uniform sampler2D metallicMap;
        uniform sampler2D normalMap;
        uniform sampler2D opacityMap;
        uniform sampler2D roughnessMap;
        uniform sampler2D overlayTexture;
        uniform float overlayOpacity;
        uniform float normalScale;
        uniform float roughnessIntensity;
        uniform float metallicIntensity;
        uniform vec2 baseOffset;
        uniform vec2 baseRepeat;
        uniform vec2 overlayRepeat;
        uniform vec3 lightPosition;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vViewPosition;
        
        // Функция для преобразования нормалей из карты нормалей
        vec3 perturbNormal2Arb(vec2 uv, vec3 eye_pos, vec3 surf_norm) {
          vec3 q0 = dFdx(eye_pos.xyz);
          vec3 q1 = dFdy(eye_pos.xyz);
          vec2 st0 = dFdx(uv);
          vec2 st1 = dFdy(uv);
          
          vec3 S = normalize(q0 * st1.t - q1 * st0.t);
          vec3 T = normalize(-q0 * st1.s + q1 * st0.s);
          vec3 N = surf_norm;
          
          vec3 mapN = texture2D(normalMap, uv).xyz * 2.0 - 1.0;
          mapN.xy *= normalScale;
          
          mat3 tsn = mat3(S, T, N);
          return normalize(tsn * mapN);
        }
        
        void main() {
          // Вычисление текстурных координат с учетом повторения и смещения
          vec2 baseUv = mod((vUv * baseRepeat) + baseOffset, 1.0);
          vec2 overlayUv = mod(vUv * overlayRepeat, 1.0);
          
          // Получаем значения из текстур PBR
          vec4 baseColor = texture2D(baseColorMap, baseUv);
          float metallic = texture2D(metallicMap, baseUv).r * metallicIntensity;
          vec3 normal = perturbNormal2Arb(baseUv, vViewPosition, vNormal);
          float opacity = texture2D(opacityMap, baseUv).r;
          float roughness = texture2D(roughnessMap, baseUv).r * roughnessIntensity;
          
          // Оверлей текстура
          vec4 overlayColor = texture2D(overlayTexture, overlayUv);
          
          // Базовое освещение - направленный свет
          vec3 lightDir = normalize(lightPosition - vPosition);
          float diffuse = max(dot(normal, lightDir), 0.1);
          
          // PBR освещение (упрощенная модель)
          vec3 viewDir = normalize(vViewPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float specularPower = (1.0 - roughness) * 100.0 + 8.0;
          float specular = pow(max(dot(normal, halfDir), 0.0), specularPower) * (1.0 - roughness);
          
          // Fresnel эффект для металличности
          float fresnelTerm = pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0) * metallic;
          
          // Комбинируем диффузное и спекулярное освещение
          vec3 finalLight = baseColor.rgb * diffuse + specular * mix(vec3(1.0), baseColor.rgb, metallic) + fresnelTerm * baseColor.rgb;
          
          // Учитываем ориентацию нормали для смешивания с оверлеем
          float viewFactor = pow(abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 0.5);
          float blendFactor = overlayColor.a * overlayOpacity * viewFactor;
          
          // Итоговый цвет с учетом оверлея
          vec4 finalColor = vec4(mix(finalLight, overlayColor.rgb, blendFactor), opacity);
          
          // Предотвращаем полностью черные пиксели
          finalColor.rgb = max(finalColor.rgb, vec3(0.02));
          
          gl_FragColor = finalColor;
        }
      `,
    })
  }, [
    baseColorMap,
    metallicMap,
    normalMap,
    opacityMap,
    roughnessMap,
    overlayTexture,
    overlayOpacity,
    textureRepeat,
    overlayTextureRepeat,
    normalScale,
    roughnessIntensity,
    metallicIntensity,
  ])

  // Переменные для хранения текущего смещения текстуры
  const textureOffsetRef = useRef({ x: 0, y: 0 })

  // =============================
  // === Генерация кривой для туннеля
  // =============================
  const curve = useMemo(() => {
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
  }, [segments, curveTwists, curveAmplitudeStart, curveAmplitudeEnd, tunnelLength])

  // =============================
  // === Частицы (Points)
  // =============================
  const positions = useMemo(() => new Float32Array(particleCount * 3), [particleCount])
  const particles = useMemo(() => {
    const arr = []
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount
      const point = curve.getPoint(t)

      // Генерируем случайные смещения
      let offsetX, offsetY, offsetZ
      let distanceFromCenter

      // Проверяем, чтобы частица не оказалась слишком близко к центру туннеля
      do {
        offsetX = (Math.random() - 0.5) * particleRandomOffset
        offsetY = (Math.random() - 0.5) * particleRandomOffset
        offsetZ = (Math.random() - 0.5) * particleRandomOffset

        // Вычисляем расстояние от центра туннеля
        distanceFromCenter = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
      } while (distanceFromCenter < particleMinDistance)

      const offset = new THREE.Vector3(offsetX, offsetY, offsetZ)

      const idx = i * 3
      positions[idx] = point.x + offset.x
      positions[idx + 1] = point.y + offset.y
      positions[idx + 2] = point.z + offset.z

      arr.push({
        t,
        offset,
        speed: Math.random() * (particleSpeed - 0.2) + 0.2,
      })
    }
    return arr
  }, [particleCount, curve, particleRandomOffset, particleSpeed, particleMinDistance, positions])

  // =============================
  // === Анимация
  // =============================
  useFrame((_, delta) => {
    // Туннель - обновляем смещение текстуры в шейдере
    if (tunnelRef.current) {
      // Обновляем значения смещения
      textureOffsetRef.current.x -= tunnelSpeed.x * delta
      textureOffsetRef.current.y -= tunnelSpeed.y * delta

      // Передаем обновленные смещения в шейдер
      const material = tunnelRef.current.material as THREE.ShaderMaterial
      material.uniforms.baseOffset.value.x = textureOffsetRef.current.x
      material.uniforms.baseOffset.value.y = textureOffsetRef.current.y
    }

    // Частицы
    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
      particles.forEach((particle, i) => {
        particle.t += particle.speed * delta
        if (particle.t > 1) particle.t -= 1
        const p = curve.getPoint(particle.t)
        const idx = i * 3

        // Применяем смещения, сохраняя минимальную дистанцию от центра
        const newX = p.x + particle.offset.x
        const newY = p.y + particle.offset.y
        const newZ = p.z + particle.offset.z

        // Проверка расстояния от центра и коррекция при необходимости
        const distanceFromCenter = Math.sqrt(Math.pow(newX - p.x, 2) + Math.pow(newY - p.y, 2))

        if (distanceFromCenter < particleMinDistance) {
          // Нормализуем вектор смещения и масштабируем его до минимальной дистанции
          const dirX = (newX - p.x) / distanceFromCenter
          const dirY = (newY - p.y) / distanceFromCenter

          posAttr.array[idx] = p.x + dirX * particleMinDistance
          posAttr.array[idx + 1] = p.y + dirY * particleMinDistance
          posAttr.array[idx + 2] = newZ
        } else {
          posAttr.array[idx] = newX
          posAttr.array[idx + 1] = newY
          posAttr.array[idx + 2] = newZ
        }
      })
      posAttr.needsUpdate = true
      pointsRef.current.geometry.computeBoundingSphere()
    }
  })

  // =============================
  // === Рендер
  // =============================
  return (
    <>
      {/* Туннель */}
      <mesh ref={tunnelRef} position={[0, 0, positionZ]}>
        <tubeGeometry args={[curve, segments, tunnelRadius, 36, false]} />
        <primitive object={tunnelMaterial} attach='material' />
      </mesh>

      {/* Частицы */}
      <points ref={pointsRef} position={[0, 0, positionZ]}>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes-position'
            count={particleCount}
            array={positions}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
        </bufferGeometry>
        <pointsMaterial
          size={particleSize}
          sizeAttenuation
          color='white'
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest
          map={new THREE.TextureLoader().load('/img/particle.png')}
        />
      </points>
    </>
  )
}

export default InfiniteRingEmitter

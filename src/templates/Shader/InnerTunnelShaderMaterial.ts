import * as THREE from 'three'

interface InnerTunnelMaterialOptions {
  texture?: THREE.Texture
  opacity?: number
  fadeNear?: number // Коэффициент затухания ближних участков (0-1)
  fadeFar?: number // Коэффициент затухания дальних участков (0-1)
  fadeStart?: number // Позиция начала затухания (0-1)
  fadeEnd?: number // Позиция конца затухания (0-1)
}

export const createInnerTunnelMaterial = (options: InnerTunnelMaterialOptions = {}): THREE.ShaderMaterial => {
  const { 
    texture, 
    opacity = 1.0,
    fadeNear = 0.7, // По умолчанию ближние участки будут тусклее на 30%
    fadeFar = 0.9,  // По умолчанию дальние участки будут затухать на 90%
    fadeStart = 0.7, // По умолчанию затухание начинается в 70% от длины туннеля
    fadeEnd = 1.0,   // По умолчанию затухание заканчивается в конце туннеля
  } = options

  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      map: { value: texture },
      opacity: { value: opacity },
      fadeNear: { value: fadeNear },
      fadeFar: { value: fadeFar },
      fadeStart: { value: fadeStart },
      fadeEnd: { value: fadeEnd },
      uvOffset: { value: new THREE.Vector2(0, 0) }
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vDepth;
      
      void main() {
        vUv = uv;
        
        // Передаем глубину (z-координату) во фрагментный шейдер
        vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);
        vDepth = modelPosition.z;
        
        gl_Position = projectionMatrix * modelPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float fadeNear;
      uniform float fadeFar;
      uniform float fadeStart;
      uniform float fadeEnd;
      uniform vec2 uvOffset;
      
      varying vec2 vUv;
      varying float vDepth;
      
      void main() {
        // Применяем смещение UV координат для анимации текстуры
        vec2 uv = mod(vUv + uvOffset, 1.0);
        vec4 texColor = texture2D(map, uv);
        
        // Нормализуем глубину для более предсказуемой работы
        float depth = -vDepth;
        float normalizedDepth = clamp((depth + 1000.0) / 2000.0, 0.0, 1.0);
        
        // 1. Эффект затухания ближних участков (линейный)
        float nearFactor = mix(fadeNear, 1.0, normalizedDepth);
        
        // 2. Эффект затухания дальних участков с мягкой границей
        float distanceFromStart = (normalizedDepth - fadeStart) / (fadeEnd - fadeStart);
        float farFactor = 1.0 - clamp(distanceFromStart, 0.0, 1.0) * fadeFar;
        
        // Объединяем оба фактора затухания
        float depthFade = nearFactor * farFactor;
        
        // Применяем эффект затухания к цвету и прозрачности
        vec4 finalColor = texColor;
        finalColor.a *= opacity * depthFade;
        
        gl_FragColor = finalColor;
      }
    `,
  })
}

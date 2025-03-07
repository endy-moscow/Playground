import * as THREE from 'three'

interface BeerwareShaderOptions {
  color1?: string // Основной цвет эффекта
  color2?: string // Вторичный цвет эффекта
  opacity?: number // Общая прозрачность эффекта
  scale?: number // Масштаб узора
  offsetX?: number // Смещение по оси X
  offsetY?: number // Смещение по оси Y
  time?: number // Время анимации
  resolution?: THREE.Vector2 // Разрешение экрана
  fadeNear?: number // Коэффициент затухания ближних ячеек (0-1)
  fadeFar?: number // Коэффициент затухания дальних ячеек (0-1)
  fadeStart?: number // Позиция начала затухания (0-1)
  fadeEnd?: number // Позиция конца затухания (0-1)
}

export const createBeerwareShaderMaterial = (options: BeerwareShaderOptions = {}): THREE.ShaderMaterial => {
  // Параметры по умолчанию
  const {
    color1 = '#00aaff',
    color2 = '#0088ff',
    opacity = 0.5,
    scale = 20.0,
    offsetX = 0.0,
    offsetY = 0.0,
    time = 0.0,
    resolution = new THREE.Vector2(window.innerWidth, window.innerHeight),
    fadeNear = 0.7, // По умолчанию ближние ячейки будут тусклее на 30%
    fadeFar = 0.9,  // По умолчанию дальние ячейки будут затухать на 90%
    fadeStart = 0.7, // По умолчанию затухание начинается в 70% от длины туннеля
    fadeEnd = 1.0,   // По умолчанию затухание заканчивается в конце туннеля
  } = options

  // Преобразуем цвета в THREE.Color
  const color1Vec = new THREE.Color(color1)
  const color2Vec = new THREE.Color(color2)

  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      time: { value: time },
      resolution: { value: resolution },
      color1: { value: new THREE.Vector3(color1Vec.r, color1Vec.g, color1Vec.b) },
      color2: { value: new THREE.Vector3(color2Vec.r, color2Vec.g, color2Vec.b) },
      opacity: { value: opacity },
      scale: { value: scale },
      offsetX: { value: offsetX },
      offsetY: { value: offsetY },
      fadeNear: { value: fadeNear },
      fadeFar: { value: fadeFar },
      fadeStart: { value: fadeStart },
      fadeEnd: { value: fadeEnd },
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
      uniform float time;
      uniform vec2 resolution;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float opacity;
      uniform float scale;
      uniform float offsetX;
      uniform float offsetY;
      uniform float fadeNear;
      uniform float fadeFar;
      uniform float fadeStart;
      uniform float fadeEnd;
      
      varying vec2 vUv;
      varying float vDepth;
      
      vec2 rand(vec2 p) {
        float n = sin(dot(p, vec2(1.0, 113.0)));
        return fract(vec2(262144.0, 32768.0) * n);     
      }
      
      float sdRoundBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      }
      
      void main() {
        // Переводим из UV-координат в центрированные координаты
        vec2 uv = (vUv - 0.5) * 2.0;
        
        // Применяем масштаб
        uv *= scale;
        
        // Применяем смещение
        uv.x += offsetX * scale;
        uv.y += offsetY * scale;
        
        vec2 fl = floor(uv);
        vec2 fr = (fract(uv) - 0.5) * 2.0;
        
        float a = sdRoundBox(fr, vec2(0.7, 0.7), 0.1);
        float s = smoothstep(0.1, 0.01, a);
        
        vec2 ran = rand(fl);
        float t = pow(abs(sin(ran.x * 6.2831 + time * (0.25 + ran.y))), 8.0);
        
        // Делаем квадраты яркими без затухания
        t = t > 0.5 ? 1.0 : t * 0.5;
        
        // Нормализуем глубину для более предсказуемой работы
        // Приводим к диапазону примерно от 0 (ближе) до 1 (дальше)
        // Значение 1000.0 - это предполагаемая максимальная глубина туннеля
        float depth = -vDepth;
        float normalizedDepth = clamp((depth + 1000.0) / 2000.0, 0.0, 1.0);
        
        // DEBUG - Раскрашиваем тоннель в зависимости от глубины (0-красный, 1-синий)
        // vec3 debugColor = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), normalizedDepth);
        
        // 1. Эффект затухания ближних ячеек (линейный)
        // Использует fadeNear: 0-полное затухание, 1-без затухания
        float nearFactor = mix(fadeNear, 1.0, normalizedDepth);
        
        // 2. Эффект затухания дальних ячеек с мягкой границей
        // Использует fadeStart и fadeEnd для определения зоны затухания
        float distanceFromStart = (normalizedDepth - fadeStart) / (fadeEnd - fadeStart);
        float farFactor = 1.0 - clamp(distanceFromStart, 0.0, 1.0) * fadeFar;
        
        // Объединяем оба фактора затухания
        float depthFade = nearFactor * farFactor;
        
        // Добавляем небольшое случайное значение для неравномерного затухания
        float randomFactor = ran.x * 0.2 + 0.8; // От 0.8 до 1.0
        depthFade *= randomFactor;
        
        // Смешиваем цвета с учётом всех факторов
        vec3 col = mix(color1, color2, ran.y) * s * t * depthFade;
        
        // Применяем прозрачность
        float finalAlpha = s * opacity * depthFade;
        
        gl_FragColor = vec4(col, finalAlpha);
      }
    `,
  })
}

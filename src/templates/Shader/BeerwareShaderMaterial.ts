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
  blinkSpeed?: number // Скорость мигания (1.0 = нормальная скорость)
  blinkVariation?: number // Вариация в скорости мигания (0-1)
  blinkProbability?: number // Вероятность мигания клетки (0-1)
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
    fadeNear = 0.7, 
    fadeFar = 0.9,  
    fadeStart = 0.7, 
    fadeEnd = 1.0,
    blinkSpeed = 1.0,
    blinkVariation = 0.8,
    blinkProbability = 0.7,
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
      blinkSpeed: { value: blinkSpeed },
      blinkVariation: { value: blinkVariation },
      blinkProbability: { value: blinkProbability },
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
      uniform float blinkSpeed;
      uniform float blinkVariation;
      uniform float blinkProbability;
      
      varying vec2 vUv;
      varying float vDepth;
      
      // Improved random function for better distribution
      vec2 rand(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return fract(sin(p) * 43758.5453);
      }
      
      // Hash function for more chaotic randomness
      float hash(float n) {
        return fract(sin(n) * 43758.5453123);
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
        
        // New multi-layer blinking strategy
        float cellID = ran.x + ran.y * 1000.0;
        
        // Determine if this cell should blink at all
        float shouldBlink = ran.x < blinkProbability ? 1.0 : 0.0;
        
        // Generate multiple animation frequencies for this cell
        float freq1 = 0.3 + ran.x * blinkVariation;
        float freq2 = 0.7 + ran.y * blinkVariation;
        float freq3 = 1.2 - ran.x * blinkVariation;
        
        // Offset phases to avoid alignment
        float phase1 = hash(cellID) * 6.2831;
        float phase2 = hash(cellID * 1.5) * 6.2831;
        float phase3 = hash(cellID * 0.8) * 6.2831;
        
        // Generate different animation types for more variation
        float wave1 = sin(time * blinkSpeed * freq1 + phase1);
        float wave2 = abs(sin(time * blinkSpeed * freq2 + phase2));
        float wave3 = pow(sin(time * blinkSpeed * freq3 + phase3) * 0.5 + 0.5, 2.0);
        
        // Use one of three animation types based on cell ID
        float waveSelector = fract(cellID * 7.919) * 3.0;
        float t;
        
        if (waveSelector < 1.0) {
            t = wave1 * 0.5 + 0.5; // Smooth sine
        } else if (waveSelector < 2.0) {
            t = wave2;             // Abs sine
        } else {
            t = wave3;             // Power sine
        }
        
        // Add occasional random discontinuities to break patterns
        if (hash(cellID + floor(time * 0.1)) < 0.01) {
            t = 1.0 - t; // Flip animation state for some cells occasionally
        }
        
        // Apply binary threshold for more pronounced on/off states
        t = shouldBlink * ((t > 0.5) ? 1.0 : 0.2);
        
        // Add some cells that stay always on
        if (hash(cellID * 3.33) < 0.1) {
            t = 1.0;
        }
        
        // Нормализуем глубину
        float depth = -vDepth;
        float normalizedDepth = clamp((depth + 1000.0) / 2000.0, 0.0, 1.0);
        
        // Факторы затухания
        float nearFactor = mix(fadeNear, 1.0, normalizedDepth);
        float distanceFromStart = (normalizedDepth - fadeStart) / (fadeEnd - fadeStart);
        float farFactor = 1.0 - clamp(distanceFromStart, 0.0, 1.0) * fadeFar;
        float depthFade = nearFactor * farFactor;
        
        // Добавляем небольшое случайное значение для неравномерного затухания
        float randomFactor = ran.x * 0.2 + 0.8;
        depthFade *= randomFactor;
        
        // Определяем находимся ли мы в "хвосте" тоннеля (дальняя часть)
        bool isTail = normalizedDepth < fadeEnd;
        
        // Определяем интенсивность ячейки
        float cellIntensity = s * t * depthFade;

        // Устанавливаем цвет и прозрачность в зависимости от положения
        if (isTail) {
          // Мы в хвосте тоннеля - используем чистый черный цвет с фиксированной непрозрачностью
          if (s > 0.01) {
            // Ячейка видима - используем цвет с низкой интенсивностью
            vec3 tailColor = mix(color1, color2, ran.y) * cellIntensity * 0.3;
            gl_FragColor = vec4(tailColor, opacity);
          } else {
            // Пространство между ячейками - используем чисто чёрный цвет
            gl_FragColor = vec4(0.0, 0.0, 0.0, opacity);
          }
        } else {
          // Обычная часть тоннеля - используем стандартное отображение
          vec3 col = mix(color1, color2, ran.y) * s * t * depthFade;
          gl_FragColor = vec4(col, opacity);
        }
      }
    `,
  })
}

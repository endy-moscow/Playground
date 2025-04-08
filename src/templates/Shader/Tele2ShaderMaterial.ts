import * as THREE from 'three'

// Simplified options interface
interface Tele2TunnelShaderOptions {
  time?: number
  opacity?: number
  colorIntensity?: number
  primaryColor?: THREE.Color | string
  secondaryColor?: THREE.Color | string
  gridSize?: number
  animationSpeed?: number
}

// Beerware shader interface (if you need it elsewhere)
interface BeerwareShaderOptions {
  color1?: string
  color2?: string
  opacity?: number
  scale?: number
  offsetX?: number
  offsetY?: number
  time?: number
  resolution?: THREE.Vector2
  fadeNear?: number
  fadeFar?: number
  fadeStart?: number
  fadeEnd?: number
  blinkSpeed?: number
  blinkVariation?: number
  blinkProbability?: number
}

// Simplified Tele2 shader implementation
export const createTele2ShaderMaterial = (options: Tele2TunnelShaderOptions = {}): THREE.ShaderMaterial => {
  const {
    time = 0.0,
    opacity = 1.0,
    colorIntensity = 1.5,
    primaryColor = '#00aaff',
    secondaryColor = '#ff00aa',
    gridSize = 10.0,
    animationSpeed = 1.0,
  } = options

  // Convert colors if they're strings
  const color1 = typeof primaryColor === 'string' ? new THREE.Color(primaryColor) : primaryColor
  const color2 = typeof secondaryColor === 'string' ? new THREE.Color(secondaryColor) : secondaryColor

  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: time },
      opacity: { value: opacity },
      colorIntensity: { value: colorIntensity },
      primaryColor: { value: new THREE.Vector3(color1.r, color1.g, color1.b) },
      secondaryColor: { value: new THREE.Vector3(color2.r, color2.g, color2.b) },
      gridSize: { value: gridSize },
      animationSpeed: { value: animationSpeed },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float opacity;
      uniform float colorIntensity;
      uniform vec3 primaryColor;
      uniform vec3 secondaryColor;
      uniform float gridSize;
      uniform float animationSpeed;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      // Simple hash function
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
      // Grid with customizable size
      float grid(vec2 uv, float size) {
        vec2 grid = fract(uv * size);
        return max(
          smoothstep(0.95, 1.0, grid.x) + smoothstep(0.0, 0.05, grid.x),
          smoothstep(0.95, 1.0, grid.y) + smoothstep(0.0, 0.05, grid.y)
        );
      }
      
      // Pulse effect
      float pulse(float speed, float offset) {
        return 0.5 + 0.5 * sin(time * speed + offset);
      }
      
      // Simple energy wave effect
      float energyWave(vec2 uv) {
        float t = time * animationSpeed;
        float wave = sin(uv.x * 10.0 + t) * cos(uv.y * 10.0 + t * 0.5);
        return 0.5 + 0.5 * wave;
      }
      
      void main() {
        // Basic grid patterns at different scales
        float baseGrid = grid(vUv, gridSize);
        float smallGrid = grid(vUv, gridSize * 5.0) * 0.5;
        
        // Animated diagonal lines
        float diagonalLines = 0.5 + 0.5 * sin(vUv.x * 20.0 + vUv.y * 20.0 + time * animationSpeed * 2.0);
        
        // Energy pulse that travels along tunnel
        float energyPulse = smoothstep(0.0, 0.2, 
          sin(vUv.y * 40.0 - time * animationSpeed * 3.0) * 
          sin(vUv.x * 40.0 - time * animationSpeed * 2.0)
        );
        
        // Energy wave effect
        float wave = energyWave(vUv);
        
        // Combine grid elements
        float gridEffect = baseGrid + smallGrid * 0.3;
        
        // Add scrolling dots at grid intersections
        vec2 gridPoints = floor(vUv * gridSize);
        float dots = hash(gridPoints) * pulse(3.0, gridPoints.x + gridPoints.y);
        dots *= smoothstep(0.8, 0.9, baseGrid);
        
        // Edge highlighting to give the tunnel more definition
        float edgeHighlight = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 3.0);
        
        // Combine all effects
        float combinedEffect = 
          gridEffect * 0.6 + 
          diagonalLines * 0.2 + 
          energyPulse * 0.4 + 
          dots * 0.5 +
          wave * 0.3 +
          edgeHighlight * 0.7;
        
        // Color mixing based on effects
        vec3 glowColor = mix(
          primaryColor,
          secondaryColor,
          pulse(0.7, 0.0) * 0.7 + wave * 0.3
        );
        
        // Final color with intensity adjustment
        vec3 finalColor = glowColor * combinedEffect * colorIntensity;
        
        // Add distance fade
        float distanceFade = smoothstep(0.0, 0.5, vUv.y);
        finalColor *= distanceFade;
        
        // Output with opacity
        gl_FragColor = vec4(finalColor, opacity * combinedEffect);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  })
}

// Beerware shader implementation (if you need it elsewhere)
export const createBeerwareShaderMaterial = (options: BeerwareShaderOptions = {}): THREE.ShaderMaterial => {
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

      // Signed distance function for lines
      float sdLine(vec2 p, vec2 a, vec2 b, float w) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return length(pa - ba * h) - w;
      }

      void main() {
        // Переводим из UV-координат в центрированные координаты
        vec2 uv = (vUv - 0.5) * 2.0;

        // Применяем масштаб
        uv *= scale;

        // Применяем смещение
        uv.x += offsetX * scale;
        uv.y += offsetY * scale;

        // Используем сетку линий вместо квадратов
        vec2 grid = floor(uv) + 0.5;
        vec2 randomOffset = rand(grid) * 0.6 - 0.3; // случайное смещение точек пересечения
        grid += randomOffset;

        // Создаем 4 линии из каждой точки сетки
        float d1 = sdLine(uv, grid, grid + vec2(1.0, 0.5 + rand(grid).x * 0.5), 0.04);
        float d2 = sdLine(uv, grid, grid + vec2(-0.5 - rand(grid).y * 0.5, 1.0), 0.04);
        float d3 = sdLine(uv, grid, grid + vec2(0.0, -1.0 - rand(grid).x * 0.3), 0.04);
        float d4 = sdLine(uv, grid, grid + vec2(-1.0 - rand(grid).y * 0.3, 0.0), 0.04);

        float d = min(min(d1, d2), min(d3, d4));

        // Пульсирующие линии
        vec2 cellID = grid;
        float cellNum = cellID.x + cellID.y * 100.0;
        float shouldBlink = rand(cellID).x < blinkProbability ? 1.0 : 0.0;

        float freq = 0.5 + rand(cellID).y * blinkVariation;
        float pulsePhase = hash(cellNum) * 6.28;
        float pulse = sin(time * blinkSpeed * freq + pulsePhase) * 0.5 + 0.5;

        // Интенсивность линии зависит от пульсации и случайности
        float intensity = shouldBlink * pulse + (1.0 - shouldBlink) * 0.7;

        // Добавляем эффект свечения в зависимости от расстояния
        float glow = 1.0 - smoothstep(0.0, 0.12, d);

        // Нормализуем глубину
        float depth = -vDepth;
        float normalizedDepth = clamp((depth + 1000.0) / 2000.0, 0.0, 1.0);

        // Факторы затухания
        float nearFactor = mix(fadeNear, 1.0, normalizedDepth);
        float distanceFromStart = (normalizedDepth - fadeStart) / (fadeEnd - fadeStart);
        float farFactor = 1.0 - clamp(distanceFromStart, 0.0, 1.0) * fadeFar;
        float depthFade = nearFactor * farFactor;

        // Градиент цвета в зависимости от положения и времени
        vec3 lineColor = mix(color1, color2, sin(uv.x * 0.05 + time * 0.2) * 0.5 + 0.5);

        // Добавляем цветовую вариацию в зависимости от глубины
        float colorShift = sin(normalizedDepth * 5.0 + time * 0.1) * 0.5 + 0.5;
        lineColor = mix(lineColor, mix(color1, color2, colorShift), 0.3);

        // Финальный цвет с учетом всех факторов
        vec3 finalColor = lineColor * glow * intensity * depthFade;

        // Добавляем фоновое свечение с пульсацией
        float bgPulse = sin(time * 0.3) * 0.5 + 0.5;
        vec3 bgColor = mix(color1, color2, 0.5) * 0.05 * bgPulse;

        gl_FragColor = vec4(finalColor + bgColor, opacity * glow);
      }
    `,
  })
}

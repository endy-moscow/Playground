import * as THREE from 'three'

interface OuterTunnelShaderOptions {
  baseColorMap: THREE.Texture
  overlayTexture1: THREE.Texture
  overlayTexture2: THREE.Texture
  bumpMap: THREE.Texture
  bumpIntensity?: number
  overlayOpacity1?: number
  overlayOpacity2?: number
  textureRepeat?: { x: number; y: number }
  overlayTextureRepeat?: { x: number; y: number }
  fadeNear?: number    // Ближе к камере – коэффициент затухания
  fadeFar?: number     // Дальние участки – коэффициент затухания
  fadeStart?: number   // Начало затухания (0-1)
  fadeEnd?: number     // Конец затухания (0-1)
}

export const createOuterTunnelShaderMaterial = (
  options: OuterTunnelShaderOptions,
): THREE.ShaderMaterial => {
  const {
    baseColorMap,
    overlayTexture1,
    overlayTexture2,
    bumpMap,
    bumpIntensity = 1.0,
    overlayOpacity1 = 0.5,
    overlayOpacity2 = 0.7,
    textureRepeat = { x: 1, y: 1 },
    overlayTextureRepeat = { x: 1, y: 1 },
    fadeNear = 0.7,
    fadeFar = 0.9,
    fadeStart = 0.7,
    fadeEnd = 1.0,
  } = options

  const uniforms = {
    baseColorMap: { value: baseColorMap },
    overlayTexture1: { value: overlayTexture1 },
    overlayTexture2: { value: overlayTexture2 },
    bumpMap: { value: bumpMap },
    bumpIntensity: { value: bumpIntensity },
    overlayOpacity1: { value: overlayOpacity1 },
    overlayOpacity2: { value: overlayOpacity2 },
    baseOffset: { value: new THREE.Vector2(0, 0) },
    baseRepeat: { value: new THREE.Vector2(textureRepeat.x, textureRepeat.y) },
    overlayRepeat: { value: new THREE.Vector2(overlayTextureRepeat.x, overlayTextureRepeat.y) },
    fadeNear: { value: fadeNear },
    fadeFar: { value: fadeFar },
    fadeStart: { value: fadeStart },
    fadeEnd: { value: fadeEnd },
  }

  const vertexShader = `
    varying vec2 vUv;
    // Передадим глубину для расчёта затухания
    varying float vDepth;
    void main(){
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vDepth = -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;
    }
  `

  const fragmentShader = `
    uniform sampler2D baseColorMap;
    uniform sampler2D overlayTexture1;
    uniform sampler2D overlayTexture2;
    uniform sampler2D bumpMap;
    
    uniform float bumpIntensity;
    uniform float overlayOpacity1;
    uniform float overlayOpacity2;
    
    uniform vec2 baseOffset;
    uniform vec2 baseRepeat;
    uniform vec2 overlayRepeat;
    
    uniform float fadeNear;
    uniform float fadeFar;
    uniform float fadeStart;
    uniform float fadeEnd;
    
    varying vec2 vUv;
    varying float vDepth;
    
    void main(){
      // Рассчитываем UV для базовой текстуры с повторением и смещением
      vec2 baseUv = mod(vUv * baseRepeat + baseOffset, 1.0);
      vec2 overlayUv = mod(vUv * overlayRepeat, 1.0);
      
      // Базовая текстура с коррекцией UV на основе bumpMap
      float bumpVal = texture2D(bumpMap, baseUv).r * bumpIntensity;
      vec2 bumpedUv = baseUv + (bumpVal * 0.01); // масштабируем влияние бампа
      vec4 baseColor = texture2D(baseColorMap, bumpedUv);
      
      // Первый оверлей накладывается с использованием mix()
      vec4 overlay1 = texture2D(overlayTexture1, overlayUv);
      vec4 mixed1 = mix(baseColor, overlay1, overlayOpacity1);
      
      // Второй (приоритетный) оверлей поверх первого
      vec4 overlay2 = texture2D(overlayTexture2, overlayUv);
      vec4 finalColor = mix(mixed1, overlay2, overlayOpacity2);
      
      // Расчет эффекта затухания по глубине
      // Нормализуем глубину: здесь предполагается, что рабочий диапазон глубины – от 1000 до 3000,
      // настройте этот диапазон, если необходимо
      float normalizedDepth = clamp((vDepth - 1000.0) / 2000.0, 0.0, 1.0);
      float nearFactor = mix(fadeNear, 1.0, normalizedDepth);
      float distanceFactor = (normalizedDepth - fadeStart) / (fadeEnd - fadeStart);
      float farFactor = 1.0 - clamp(distanceFactor, 0.0, 1.0) * fadeFar;
      float depthFade = nearFactor * farFactor;
      
      finalColor.rgb *= depthFade;
      // Сохраняем альфа-канал равным 1, чтобы труба не была прозрачной
      finalColor.a = 1.0;
      
      gl_FragColor = finalColor;
    }
  `

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: true,
    depthTest: true,
  })

  return material
}

interface OuterTunnelBasicShaderOptions {
  baseColorMap: THREE.Texture
  bumpMap: THREE.Texture
  bumpIntensity?: number
  textureRepeat?: { x: number; y: number }
}

export const createOuterTunnelBasicShaderMaterial = (
  options: OuterTunnelBasicShaderOptions,
): THREE.ShaderMaterial => {
  const {
    baseColorMap,
    bumpMap,
    bumpIntensity = 1.0,
    textureRepeat = { x: 1, y: 1 },
  } = options

  const uniforms = {
    baseColorMap: { value: baseColorMap },
    bumpMap: { value: bumpMap },
    bumpIntensity: { value: bumpIntensity },
    baseOffset: { value: new THREE.Vector2(0, 0) },
    baseRepeat: { value: new THREE.Vector2(textureRepeat.x, textureRepeat.y) },
  }

  const vertexShader = `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * viewMatrix * modelPosition;
    }
  `

  const fragmentShader = `
    uniform sampler2D baseColorMap;
    uniform sampler2D bumpMap;
    uniform float bumpIntensity;
    uniform vec2 baseOffset;
    uniform vec2 baseRepeat;
    
    varying vec2 vUv;
    void main(){
      // Рассчитываем UV с учетом повтора и смещения
      vec2 uv = mod(vUv * baseRepeat + baseOffset, 1.0);
      // Получаем значение рельефа (bump) и смещаем UV
      float bumpVal = texture2D(bumpMap, uv).r * bumpIntensity;
      vec2 bumpedUv = uv + bumpVal * 0.01;
      
      vec4 baseColor = texture2D(baseColorMap, bumpedUv);
      gl_FragColor = vec4(baseColor.rgb, 1.0);
    }
  `

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    transparent: false,
    depthWrite: true,
    depthTest: true,
  })

  return material
}

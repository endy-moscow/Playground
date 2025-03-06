import * as THREE from 'three'

interface BeerwareShaderOptions {
  color1?: string // Primary color for the effect
  color2?: string // Secondary color for the effect
  opacity?: number // Overall opacity of the effect
  scale?: number // Scale of the pattern
}

export const createBeerwareShaderMaterial = (options: BeerwareShaderOptions = {}): THREE.ShaderMaterial => {
  // Default options
  const { color1 = '#00aaff', color2 = '#0088ff', opacity = 0.5, scale = 20.0 } = options

  // Convert colors to THREE.Color
  const color1Vec = new THREE.Color(color1)
  const color2Vec = new THREE.Color(color2)

  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      color1: { value: new THREE.Vector3(color1Vec.r, color1Vec.g, color1Vec.b) },
      color2: { value: new THREE.Vector3(color2Vec.r, color2Vec.g, color2Vec.b) },
      opacity: { value: opacity },
      scale: { value: scale },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec2 resolution;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float opacity;
      uniform float scale;
      
      varying vec2 vUv;
      
      vec2 rand(vec2 p) {
        float n = sin(dot(p, vec2(1.0, 113.0)));
        return fract(vec2(262144.0, 32768.0) * n);     
      }
      
      float sdRoundBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      }
      
      void main() {
        // Convert from uv coordinates to centered coordinates like in the original shader
        vec2 uv = (vUv - 0.5) * 2.0;
        
        // Apply scale
        uv *= scale;
        
        vec2 fl = floor(uv);
        vec2 fr = (fract(uv) - 0.5) * 2.0;
        
        float a = sdRoundBox(fr, vec2(0.7, 0.7), 0.1);
        float s = smoothstep(0.1, 0.01, a);
        
        vec2 ran = rand(fl);
        float t = pow(abs(sin(ran.x * 6.2831 + time * (0.25 + ran.y))), 8.0);
        
        // Make squares bright without fading
        t = t > 0.5 ? 1.0 : t * 0.5; // Keep bright squares fully bright
        
        // Mix the two colors based on random value
        vec3 col = mix(color1, color2, ran.y) * s * t;
        
        // Apply opacity but make visible squares fully opaque
        float finalAlpha = s * opacity;
        
        gl_FragColor = vec4(col, finalAlpha);
      }
    `,
  })
}

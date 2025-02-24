import * as THREE from 'three'
import { useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

const TunnelOverlayMaterial = shaderMaterial(
  {
    iTime: 0,
    iResolution: new THREE.Vector3(1, 1, 1),
    iMouse: new THREE.Vector2(0, 0),
  },

  // Vertex shader
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  // Fragment shader
  /* glsl */ `
    #define PI 3.14159

    // === Core Settings ===
    const int LINE_COUNT = 128;
    const float LINE_WIDTH = 0.24;
    const float STRETCH_FACTOR = 0.05;
    const float SPEED_MULT = 0.4;
    const float TRAIL_LENGTH_MIN = 35.0;
    const float TRAIL_LENGTH_MAX = 95.0;
    const float OSCILLATION_FREQ = 33.1;
    const float OSCILLATION_INTENSITY = 0.3;
    const float GRADIENT_SHARPNESS = 2.0;
    const float BRIGHTNESS_MULT = 5.0;

    // === Color Settings ===
    const vec3 COLOR_GREEN = vec3(0.07, 0.82, 0.3);
    const vec3 COLOR_ORANGE = vec3(0.98, 0.68, 0.08);
    const vec3 COLOR_BLUE = vec3(0.0, 0.65, 1.0);
    const vec3 COLOR_RED = vec3(0.94, 0.18, 0.31);

    uniform float iTime;
    uniform vec3 iResolution;
    uniform vec2 iMouse;
    varying vec2 vUv;

    float vDrop(vec2 uv, float t) {
        uv.x = uv.x * float(LINE_COUNT);
        float dx = fract(uv.x);
        uv.x = floor(uv.x);
        uv.y *= STRETCH_FACTOR;
        float o = sin(uv.x * 215.4);
        float s = cos(uv.x * OSCILLATION_FREQ) * OSCILLATION_INTENSITY + 0.7;
        float trail = mix(TRAIL_LENGTH_MAX, TRAIL_LENGTH_MIN, s);
        float yv = fract(uv.y + t * s + o) * trail;
        yv = 1.0 / yv;
        yv = smoothstep(0.0, 1.0, pow(yv, GRADIENT_SHARPNESS));
        yv = sin(yv * PI) * (s * BRIGHTNESS_MULT);
        float d2 = sin(dx * PI * LINE_WIDTH);
        return yv * (d2 * d2);
    }

    void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float d = length(p) + 0.1;
        p = vec2(atan(p.x, p.y) / PI, 2.5 / d);
        
        float t = iTime * SPEED_MULT;
        
        vec3 col = COLOR_GREEN * vDrop(p, t);
        col += COLOR_ORANGE * vDrop(p, t + 0.25);
        col += COLOR_BLUE * vDrop(p, t + 0.5);
        col += COLOR_RED * vDrop(p, t + 0.75);

        float brightness = dot(col, vec3(0.299, 0.587, 0.114));
        float alpha = smoothstep(0.0, 0.2, brightness);
        
        gl_FragColor = vec4(col * (d * d), alpha);
    }
  `,
)

extend({ TunnelOverlayMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      tunnelOverlayMaterial: any
    }
  }
}

export function ShaderOverlay(props) {
  const materialRef = useRef()
  const { clock, size, mouse } = useThree()

  useFrame(() => {
    if (!materialRef.current) return
    materialRef.current.iTime = clock.getElapsedTime()
    materialRef.current.iResolution.set(size.width, size.height, 1)
    materialRef.current.iMouse.set(mouse.x, mouse.y)
  })

  return (
    <mesh {...props}>
      <planeGeometry args={[2, 2]} />
      <tunnelOverlayMaterial
        ref={materialRef}
        key={TunnelOverlayMaterial.key}
        transparent
        depthWrite={false}
        blending={THREE.CustomBlending}
        blendSrc={THREE.SrcAlphaFactor}
        blendDst={THREE.OneMinusSrcAlphaFactor}
      />
    </mesh>
  )
}

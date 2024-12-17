import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

// --- Shader Variables ---
const MAGENTA = new THREE.Color(231 / 255, 36 / 255, 135 / 255) // RGB значения для #E72487
const PULSE_INTENSITY = 0.4
const BASE_MIX = 0.7

// --- Utility Function ---
function getFullscreenTriangle() {
  const geometry = new THREE.BufferGeometry()
  const vertices = new Float32Array([-1, -1, 3, -1, -1, 3])
  const uvs = new Float32Array([0, 0, 2, 0, 0, 2])

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 2))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

  return geometry
}

// --- Post-Processing Hook ---
const usePostProcess = () => {
  const { gl, scene, camera, size, viewport } = useThree()

  const [screenCamera, screenScene, screen, renderTarget] = useMemo(() => {
    const screenScene = new THREE.Scene()
    const screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const screen = new THREE.Mesh(getFullscreenTriangle())
    screen.frustumCulled = false
    screenScene.add(screen)

    const renderTarget = new THREE.WebGLRenderTarget(
      size.width * viewport.dpr,
      size.height * viewport.dpr,
      {
        samples: 4,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter
      }
    )
    renderTarget.depthTexture = new THREE.DepthTexture(size.width, size.height)

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        diffuse: { value: null },
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(size.width, size.height) }
      },
      vertexShader: /* glsl */ `
        in vec2 uv;
        in vec3 position;
        out vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        out vec4 pc_fragColor;
        uniform sampler2D diffuse;
        uniform float time;
        uniform vec2 resolution;
        in vec2 vUv;

        void main() {
          vec4 texColor = texture(diffuse, vUv);
          vec4 magenta = vec4(${MAGENTA.r}, ${MAGENTA.g}, ${MAGENTA.b}, 1.0);
          
          float pulse = (sin(time * 2.0) + 1.0) * 0.5;
          float mixFactor = ${BASE_MIX} + pulse * ${PULSE_INTENSITY};

          vec4 finalColor = mix(texColor, magenta, mixFactor);
          pc_fragColor = finalColor;
        }
      `,
      glslVersion: THREE.GLSL3,
      transparent: true,
    }) as THREE.RawShaderMaterial
    screen.material = material
    material.uniforms.diffuse.value = renderTarget.texture

    return [screenCamera, screenScene, screen, renderTarget]
  }, [size, viewport.dpr])

  useEffect(() => {
    const { width, height } = size
    renderTarget.setSize(width * viewport.dpr, height * viewport.dpr)
  }, [viewport.dpr, size, renderTarget])

  useFrame((state, delta) => {
    const currentRenderTarget = gl.getRenderTarget()

    gl.setRenderTarget(renderTarget)
    gl.render(scene, camera)

    gl.setRenderTarget(null)

    const material = screen.material as THREE.ShaderMaterial
    material.uniforms.time.value += delta * 2
    material.uniforms.resolution.value.set(size.width, size.height)

    gl.render(screenScene, screenCamera)

    gl.setRenderTarget(currentRenderTarget)
  })

  return null
}

export default usePostProcess

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { useControls } from 'leva'
import * as THREE from 'three'

// Utility function to create a fullscreen triangle
// This triangle covers the entire viewport and is used as the base for post-processing
function getFullscreenTriangle() {
  const geometry = new THREE.BufferGeometry()
  const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]) // Define vertex positions
  const uvs = new Float32Array([0, 0, 2, 0, 0, 2]) // Define UV coordinates

  // Attach vertex and UV attributes to the geometry
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 2))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

  return geometry
}

// Main hook to apply post-processing effects with Leva controls
const usePostProcess = () => {
  // Extract relevant properties from the three.js context
  const [{ dpr }, size, gl] = useThree((state) => [state.viewport, state.size, state.gl])

  // Leva controls for dynamic adjustments in the shader
  const { timeSpeed } = useControls({
    timeSpeed: { value: 0.8, min: 0.1, max: 2.0, step: 0.1 }, // Control time progression speed
  })

  // Memoize objects to avoid recreating them on every render
  const [screenCamera, screenScene, screen, renderTarget] = useMemo(() => {
    const screenScene = new THREE.Scene()

    // Orthographic camera for rendering fullscreen triangle
    const screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // Mesh with fullscreen triangle geometry
    const screen = new THREE.Mesh(getFullscreenTriangle())
    screen.frustumCulled = false // Ensure the triangle is always rendered
    screenScene.add(screen)

    // Render target for offscreen rendering
    const renderTarget = new THREE.WebGLRenderTarget(512, 512, { samples: 4, encoding: gl.encoding })
    renderTarget.depthTexture = new THREE.DepthTexture() // Fix potential depth issues

    // Shader material for custom post-processing
    screen.material = new THREE.RawShaderMaterial({
      uniforms: {
        diffuse: { value: null }, // Input texture from the render target
        time: { value: 0 }, // Time uniform for animation effects
      },
      vertexShader: /* glsl */ `
        in vec2 uv;
        in vec3 position;
        precision highp float;

        out vec2 vUv;
        void main() {
          vUv = uv; // Pass UV coordinates to the fragment shader
          gl_Position = vec4(position, 1.0); // Set position of each vertex
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        out highp vec4 pc_fragColor;
        uniform sampler2D diffuse;
        uniform float time;
        in vec2 vUv;

        void main() {
          vec4 texColor = texture(diffuse, vUv); // Sample the texture
          vec4 magenta = vec4(1.0, 0.0, 1.0, 1.0); // Define magenta color
          pc_fragColor = mix(texColor, magenta, 0.5); // Blend original texture with magenta
        }
      `,
      glslVersion: THREE.GLSL3, // Specify GLSL version
    })
    screen.material.uniforms.diffuse.value = renderTarget.texture

    return [screenCamera, screenScene, screen, renderTarget]
  }, [gl.encoding])

  // Update render target size on window resize or DPR change
  useEffect(() => {
    const { width, height } = size
    const { w, h } = {
      w: width * dpr,
      h: height * dpr,
    }
    renderTarget.setSize(w, h)
  }, [dpr, size, renderTarget])

  // Update the scene and render post-processed output each frame
  useFrame(({ scene, camera, gl }, delta) => {
    gl.setRenderTarget(renderTarget) // Render main scene to the offscreen texture
    gl.render(scene, camera)

    gl.setRenderTarget(null) // Reset render target to the default framebuffer
    if (screen) screen.material.uniforms.time.value += delta * timeSpeed // Increment time uniform

    gl.render(screenScene, screenCamera) // Render the fullscreen triangle with the post-processing effect
  }, 1)

  return null // No visible DOM element is returned
}

export default usePostProcess

import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

const usePostProcess = () => {
  const { gl, scene, camera, size } = useThree()
  const composer = useMemo(() => {
    const composer = new EffectComposer(gl)

    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const overlayPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        color: { value: new THREE.Color(231 / 255, 36 / 255, 135 / 255) },
        opacity: { value: 0.5 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 color;
        uniform float opacity;
        varying vec2 vUv;

        void main() {
          vec4 originalColor = texture2D(tDiffuse, vUv);
          vec4 overlay = vec4(color, opacity);
          gl_FragColor = mix(originalColor, overlay, opacity);
        }
      `,
    })

    composer.addPass(overlayPass)

    return composer
  }, [gl, scene, camera])

  useEffect(() => {
    composer.setSize(size.width, size.height)
    composer.setPixelRatio(window.devicePixelRatio)
  }, [composer, size])

  useFrame(() => {
    composer.render()
  }, 1)

  return null
}

export default usePostProcess

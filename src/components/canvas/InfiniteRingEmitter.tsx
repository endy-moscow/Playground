import React, { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'

export default function InfiniteRingEmitter() {
  // Контролы через Leva (без metalness и roughness)
  const { tunnelScale, tunnelSpeedX, tunnelSpeedY, textureRepeatX, textureRepeatY } = useControls('InfiniteTunnel', {
    tunnelScale: { value: 1, min: 1, max: 500, step: 10 },
    tunnelSpeedX: { value: 1, min: 0, max: 1, step: 0.01 },
    tunnelSpeedY: { value: 0, min: 0, max: 1, step: 0.01 },
    textureRepeatX: { value: 1, min: 0.1, max: 100, step: 0.1 },
    textureRepeatY: { value: 1, min: 0.1, max: 100, step: 0.1 },
  })

  // Загружаем текстуру с помощью useTexture
  const materialProps = useTexture({
    map: '/img/texture.jpg',
  })

  materialProps.map.wrapS = THREE.RepeatWrapping
  materialProps.map.wrapT = THREE.RepeatWrapping
  materialProps.map.repeat.set(textureRepeatX, textureRepeatY)

  // Загружаем модель (предполагается, что в сцене один mesh)
  const { scene } = useGLTF('/models/Tube.glb')

  // Клонируем сцену и назначаем указанный материал единственному мешу
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    // Предполагается, что первый ребёнок клона — это нужный mesh
    const mesh = clone.children[0] as THREE.Mesh
    mesh.material = new THREE.MeshStandardMaterial(materialProps)
    return clone
  }, [scene, materialProps])

  // Анимируем смещение текстуры для единственного mesh
  useFrame((_, delta) => {
    const mesh = clonedScene.children[0] as THREE.Mesh
    const mat = mesh.material as THREE.MeshStandardMaterial
    if (mat.map) {
      mat.map.offset.x -= tunnelSpeedX * delta
      mat.map.offset.y -= tunnelSpeedY * delta
    }
  })

  return <primitive object={clonedScene} scale={[tunnelScale, tunnelScale, tunnelScale]} />
}

import * as THREE from 'three'

interface InnerTunnelMaterialOptions {
  texture?: THREE.Texture
  opacity?: number
}

export const createInnerTunnelMaterial = (options: InnerTunnelMaterialOptions = {}): THREE.MeshBasicMaterial => {
  const { texture, opacity = 1.0 } = options

  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: opacity,
    side: THREE.BackSide,
    depthWrite: false,
  })
}

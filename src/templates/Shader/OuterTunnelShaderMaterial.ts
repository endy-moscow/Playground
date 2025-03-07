import * as THREE from 'three'

interface OuterTunnelShaderOptions {
  baseColorMap?: THREE.Texture
  overlayTexture?: THREE.Texture
  bumpMap?: THREE.Texture
  bumpIntensity?: number
  overlayOpacity?: number
  textureRepeat?: { x: number; y: number }
  overlayTextureRepeat?: { x: number; y: number }
}

export const createOuterTunnelShaderMaterial = (options: OuterTunnelShaderOptions = {}): THREE.ShaderMaterial => {
  const {
    baseColorMap,
    overlayTexture,
    bumpMap,
    bumpIntensity = 1.0,
    overlayOpacity = 1.0,
    textureRepeat = { x: 1, y: 1 },
    overlayTextureRepeat = { x: 1, y: 1 },
  } = options

  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.95,
    depthWrite: true,
    depthTest: true,
    uniforms: {
      baseColorMap: { value: baseColorMap },
      overlayTexture: { value: overlayTexture },
      bumpMap: { value: bumpMap },
      bumpIntensity: { value: bumpIntensity },
      overlayOpacity: { value: overlayOpacity },
      baseOffset: { value: new THREE.Vector2(0, 0) },
      baseRepeat: { value: new THREE.Vector2(textureRepeat.x, textureRepeat.y) },
      overlayRepeat: { value: new THREE.Vector2(overlayTextureRepeat.x, overlayTextureRepeat.y) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vTangent;
      varying vec3 vBitangent;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        // Calculate tangent vectors for bump mapping
        vec3 tangent = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
        vec3 bitangent = normalize(cross(vNormal, tangent));
        vTangent = tangent;
        vBitangent = bitangent;
        
        vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -modelPosition.xyz;
        
        gl_Position = projectionMatrix * modelPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D baseColorMap;
      uniform sampler2D overlayTexture;
      uniform sampler2D bumpMap;
      uniform float bumpIntensity;
      uniform float overlayOpacity;
      uniform vec2 baseOffset;
      uniform vec2 baseRepeat;
      uniform vec2 overlayRepeat;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vTangent;
      varying vec3 vBitangent;
      
      void main() {
        vec2 baseUv = mod((vUv * baseRepeat) + baseOffset, 1.0);
        vec2 overlayUv = mod(vUv * overlayRepeat, 1.0);
        
        // Sample the base and overlay textures
        vec4 baseColor = texture2D(baseColorMap, baseUv);
        vec4 overlayColor = texture2D(overlayTexture, overlayUv);
        
        // Sample the bump map
        vec3 bumpValue = texture2D(bumpMap, baseUv).rgb;
        float bumpAmount = (bumpValue.r + bumpValue.g + bumpValue.b) / 3.0;
        float bumpScale = 0.015 * bumpIntensity;
        
        vec3 normalPerturbation = normalize(
          vNormal + vTangent * (bumpAmount * 2.0 - 1.0) * bumpScale
          + vBitangent * (bumpAmount * 2.0 - 1.0) * bumpScale
        );
        
        float viewFactor = pow(abs(dot(normalPerturbation, vec3(0.0, 0.0, 1.0))), 0.5);
        float blendFactor = overlayColor.a * overlayOpacity * viewFactor;
        
        float reflectivity = bumpAmount * 0.2 * bumpIntensity;
        
        vec4 finalColor = vec4(mix(baseColor.rgb * 0.8, overlayColor.rgb, blendFactor), baseColor.a);
        finalColor.rgb += reflectivity * vec3(0.1, 0.1, 0.2);
        finalColor.rgb = max(finalColor.rgb, vec3(0.02));
        
        gl_FragColor = finalColor;
      }
    `,
  })
}

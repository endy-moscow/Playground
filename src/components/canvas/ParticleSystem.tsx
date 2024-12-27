import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleSystem = () => {
  const particlesRef = useRef<THREE.Points>();

  useEffect(() => {
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random();
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = 0;

      velocities[i * 3] = -positions[i * 3] * 0.01;
      velocities[i * 3 + 1] = -positions[i * 3 + 1] * 0.01;
      velocities[i * 3 + 2] = 0;
    }

    particlesRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    particlesRef.current.geometry.setAttribute(
      'velocity',
      new THREE.BufferAttribute(velocities, 3)
    );
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    const positions = particlesRef.current.geometry.attributes.position.array;
    const velocities = particlesRef.current.geometry.attributes.velocity.array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      const distance = Math.sqrt(
        positions[i] * positions[i] + positions[i + 1] * positions[i + 1]
      );

      if (distance < 0.1) {
        positions[i] = Math.random() * 2 - 1;
        positions[i + 1] = Math.random() * 2 - 1;
        velocities[i] = -positions[i] * 0.01;
        velocities[i + 1] = -positions[i + 1] * 0.01;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <shaderMaterial
        transparent
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </points>
  );
};

const vertexShader = `
  attribute vec3 velocity;
  varying float vOpacity;
  void main() {
    vOpacity = length(position) * 2.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 5.0;
  }
`;

const fragmentShader = `
  varying float vOpacity;
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0 - vOpacity);
  }
`;

export default ParticleSystem;

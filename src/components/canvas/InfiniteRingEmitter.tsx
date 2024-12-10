//InfiniteRingEmitter.tsx
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useCursor, Html } from '@react-three/drei';
import { Leva, useControls } from 'leva';
import * as THREE from 'three';
import { TextureLoader } from 'three';

const InfiniteRingEmitter = () => {
  const tunnelRef = useRef<THREE.Mesh<THREE.TubeGeometry, THREE.MeshStandardMaterial>>(null);
  const { size, camera } = useThree();
  const texture = useLoader(TextureLoader, '/img/example.jpg'); // Path to texture
  const [hovered, setHovered] = useState(false);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 }); // Mouse position
  const [rotationBoost, setRotationBoost] = useState(1);

  const {
    TUNNEL_RADIUS,
    TUNNEL_LENGTH,
    SEGMENTS,
    TUNNEL_SPEED,
    TEXTURE_REPEAT,
    AUTO_ROTATE_SPEED,
    BOOST_ROTATE_MULTIPLIER,
    CURVE_AMPLITUDE_START,
    CURVE_AMPLITUDE_END,
    CURVE_TWISTS,
    POSITION_Z
  } = useControls({
    TUNNEL_RADIUS: { value: 10, min: 10, max: 100, step: 1 },
    TUNNEL_LENGTH: { value: 1000, min: 500, max: 2000, step: 10 },
    SEGMENTS: { value: 500, min: 100, max: 1000, step: 10 },
    TUNNEL_SPEED: { value: { x: 0.1, y: 0.07 }, joystick: 'invertY' },
    TEXTURE_REPEAT: { value: { x: 0.01, y: 7 }, joystick: 'invertY' },
    AUTO_ROTATE_SPEED: { value: 0.1, min: 0.1, max: 2, step: 0.01 },
    BOOST_ROTATE_MULTIPLIER: { value: 2, min: 1, max: 5, step: 0.1 },
    CURVE_AMPLITUDE_START: { value: 0, min: 0, max: 100, step: 1 },
    CURVE_AMPLITUDE_END: { value: 64, min: 0, max: 100, step: 1 },
    CURVE_TWISTS: { value: 1, min: 1, max: 10, step: 1 },
    POSITION_Z: { value: -999, min: -2000, max: 0, step: 10 }
  });

  useCursor(hovered, 'pointer', 'auto');

  // Texture settings
  texture.wrapS = THREE.MirroredRepeatWrapping;
  texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.repeat.set(TEXTURE_REPEAT.x, TEXTURE_REPEAT.y);

  // Mouse event handlers
  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = event.clientX / size.width;
      const y = event.clientY / size.height;
      setMouse({ x, y });
    };

    const handlePointerDown = () => {
      setRotationBoost(BOOST_ROTATE_MULTIPLIER);
    };

    const handlePointerUp = () => {
      setRotationBoost(1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [size, BOOST_ROTATE_MULTIPLIER]);

  // Animation frame updates
  useFrame((_, delta) => {
    if (tunnelRef.current?.material?.map) {
      tunnelRef.current.material.map.offset.x -= TUNNEL_SPEED.x * delta; // Move texture X
      tunnelRef.current.material.map.offset.y -= TUNNEL_SPEED.y * delta; // Move texture Y
    }

    // Rotate tube automatically
    if (tunnelRef.current) {
      tunnelRef.current.rotation.z += AUTO_ROTATE_SPEED * rotationBoost * delta;
    }
  });

  // Create curve with smooth amplitude transitions
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: SEGMENTS }, (_, i) => {
      const progress = i / SEGMENTS; // Progress from 0 to 1
      const angle = progress * Math.PI * CURVE_TWISTS; // Twists in the tube
      const amplitude =
        (1 - progress) * CURVE_AMPLITUDE_END + // Decrease amplitude closer to camera
        progress * CURVE_AMPLITUDE_START; // Increase amplitude farther away
      return new THREE.Vector3(
        Math.sin(angle) * amplitude, // Bend X
        Math.cos(angle) * amplitude, // Bend Y
        i * (TUNNEL_LENGTH / SEGMENTS) // Length Z
      );
    })
  );

  return (
    <>

      <mesh
        ref={tunnelRef}
        position={[0, 0, POSITION_Z]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <tubeGeometry args={[curve, SEGMENTS, TUNNEL_RADIUS, 36, true]} />
        <meshStandardMaterial side={THREE.BackSide} map={texture} />
      </mesh>
    </>
  );
};

export default InfiniteRingEmitter;

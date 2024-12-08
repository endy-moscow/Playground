//InfiniteRingEmitter.tsx
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';
import { Leva, useControls } from 'leva';
import * as THREE from 'three';
import { TextureLoader } from 'three';

const InfiniteRingEmitter = () => {
  const tunnelRef = useRef<THREE.Mesh<THREE.TubeGeometry, THREE.MeshStandardMaterial>>(null);
  const { size, camera } = useThree();
  const texture = useLoader(TextureLoader, '/img/example.jpg'); // Путь к текстуре
  const [hovered, setHovered] = useState(false);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 }); // Положение мыши
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
    CURVE_TWISTS
  } = useControls({
    TUNNEL_RADIUS: { value: 30, min: 10, max: 100, step: 1 },
    TUNNEL_LENGTH: { value: 1000, min: 500, max: 2000, step: 50 },
    SEGMENTS: { value: 500, min: 100, max: 1000, step: 10 },
    TUNNEL_SPEED: { value: { x: 0.4, y: 0.1 }, joystick: 'invertY' },
    TEXTURE_REPEAT: { value: { x: 0.01, y: 5 }, joystick: 'invertY' },
    AUTO_ROTATE_SPEED: { value: 0.24, min: 0.1, max: 2, step: 0.01 },
    BOOST_ROTATE_MULTIPLIER: { value: 2, min: 1, max: 5, step: 0.1 },
    CURVE_AMPLITUDE_START: { value: 0, min: 0, max: 100, step: 1 },
    CURVE_AMPLITUDE_END: { value: 64, min: 0, max: 100, step: 1 },
    CURVE_TWISTS: { value: 1, min: 1, max: 10, step: 1 }
  });

  useCursor(hovered, 'pointer', 'auto');

  // Настройка текстуры
  texture.wrapS = THREE.MirroredRepeatWrapping;
  texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.repeat.set(TEXTURE_REPEAT.x, TEXTURE_REPEAT.y);

  // Обработка событий мыши
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

  // Анимация текстуры и вращения трубы
  useFrame((_, delta) => {
    if (tunnelRef.current?.material?.map) {
      tunnelRef.current.material.map.offset.x -= TUNNEL_SPEED.x * delta; // Движение по X
      tunnelRef.current.material.map.offset.y -= TUNNEL_SPEED.y * delta; // Движение по Y
    }

    // Автоматическое вращение трубы
    if (tunnelRef.current) {
      tunnelRef.current.rotation.z += AUTO_ROTATE_SPEED * rotationBoost * delta;
    }
  });

  // Создаем кривую с плавным изменением амплитуды
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: SEGMENTS }, (_, i) => {
      const progress = i / SEGMENTS; // Прогресс от 0 до 1
      const angle = progress * Math.PI * CURVE_TWISTS; // Закручивание трубы
      const amplitude =
        (1 - progress) * CURVE_AMPLITUDE_END + // Уменьшение амплитуды ближе к камере
        progress * CURVE_AMPLITUDE_START; // Увеличение амплитуды дальше от камеры
      return new THREE.Vector3(
        Math.sin(angle) * amplitude, // Изгиб по X
        Math.cos(angle) * amplitude, // Изгиб по Y
        i * (TUNNEL_LENGTH / SEGMENTS) // Длина по Z
      );
    })
  );

  return (
    <>
      <mesh
        ref={tunnelRef}
        position={[0, 0, -999]}
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

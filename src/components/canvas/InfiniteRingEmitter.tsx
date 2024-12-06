import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';

// Настройки
const TUNNEL_RADIUS = 30; // Радиус трубы
const TUNNEL_LENGTH = 1000; // Длина трубы
const SEGMENTS = 500; // Количество сегментов трубы
const TUNNEL_SPEED = { x: 0.4, y: 0.1 }; // Скорость движения текстуры по X и Y
const TEXTURE_REPEAT = { x: 0.1, y: 5 }; // Повторение текстуры
const TUNNEL_POSITION = [0, 0, -999]; // Позиция трубы (отодвинута дальше по Z)
const CURVE_TWISTS = 1; // Количество поворотов на всю длину
const CURVE_AMPLITUDE_START = 0; // Амплитуда поворотов ближе к камере
const CURVE_AMPLITUDE_END = 64; // Амплитуда поворотов в конце (дальше от камеры)
const MOUSE_SENSITIVITY = 0.01; // Чувствительность к движению мыши
const AUTO_ROTATE_SPEED = 0.24; // Автоматическая скорость вращения трубы
const BOOST_ROTATE_MULTIPLIER = 2; // Увеличение скорости вращения при клике

const InfiniteRingEmitter = () => {
  const tunnelRef = useRef();
  const { size, camera } = useThree();
  const texture = useLoader(TextureLoader, '/img/example.jpg'); // Путь к текстуре
  const [hovered, setHovered] = useState(false);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 }); // Положение мыши
  const [rotationBoost, setRotationBoost] = useState(1);
  const [tunnelSpeed, setTunnelSpeed] = useState(TUNNEL_SPEED); // Скорость текстуры

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
      setTunnelSpeed({ x: TUNNEL_SPEED.x * 2, y: TUNNEL_SPEED.y * 2 });
    };
    const handlePointerUp = () => {
      setRotationBoost(1);
      setTunnelSpeed(TUNNEL_SPEED);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [size]);

  // Анимация текстуры и вращения трубы
  useFrame((_, delta) => {
    if (tunnelRef.current?.material?.map) {
      tunnelRef.current.material.map.offset.x -= tunnelSpeed.x * delta; // Движение по X
      tunnelRef.current.material.map.offset.y -= tunnelSpeed.y * delta; // Движение по Y
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
    <mesh
      ref={tunnelRef}
      position={TUNNEL_POSITION}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <tubeGeometry args={[curve, SEGMENTS, TUNNEL_RADIUS, 36, true]} />
      <meshStandardMaterial side={THREE.BackSide} map={texture} />
    </mesh>
  );
};

export default InfiniteRingEmitter;

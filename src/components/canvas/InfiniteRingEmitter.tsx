import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import * as THREE from 'three';

// *** Настройки ***
const PARTICLE_COUNT = 100; // Количество линий
const RADIUS = 50; // Радиус генерации частиц
const ROTATION_SPEED = 0.1; // Скорость вращения вокруг оси трубы
const PARTICLE_SPEED = 1; // Скорость движения частиц вдоль оси Z
const RESET_THRESHOLD = 50; // Граница, после которой линии перезапускаются
const BLOOM_INTENSITY = 3.0; // Интенсивность свечения
const BLOOM_THRESHOLD = 0.2; // Порог свечения
const BLOOM_SMOOTHING = 0.5; // Плавность свечения
const OPACITY_FADE_SPEED = 0.8; // Скорость фейдинга (появление и исчезновение линий)
const LINE_WIDTH = 60; // Толщина линий
const INITIAL_OPACITY = 0.5; // Начальная прозрачность
const SPAWN_INTERVAL = 0.001; // Интервал появления новых частиц (в секундах)
// ********************

function InfiniteRingEmitter() {
  const linesRef = useRef<THREE.LineSegments>(null);
  let lastSpawnTime = 0;

  // Генерация линий
  const { positions, radii, angles, opacities } = useMemo(() => {
    const positions = [];
    const radii = [];
    const angles = [];
    const opacities = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 3; // Угол вокруг центра
      const r = RADIUS + THREE.MathUtils.randFloat(-0.1, 0.1); // Радиус с шумом

      const x = Math.cos(angle) * r; // Начало линии
      const y = Math.sin(angle) * r;
      const z = THREE.MathUtils.randFloat(-100, -50); // Начальная глубина

      const length = THREE.MathUtils.randFloat(1, 5); // Длина линии
      const x2 = x;
      const y2 = y;
      const z2 = z + length;

      positions.push(x, y, z, x2, y2, z2);
      radii.push(r); // Сохраняем радиус для линии
      angles.push(angle); // Сохраняем начальный угол
      opacities.push(0); // Изначально линии невидимы
    }

    return {
      positions: new Float32Array(positions),
      radii,
      angles,
      opacities,
    };
  }, []);

  // Анимация линий
  useFrame(({ clock }) => {
    if (linesRef.current) {
      const positionsArray = linesRef.current.geometry.attributes.position.array;
      const opacityAttribute = linesRef.current.geometry.attributes.opacity.array;
      const time = clock.getElapsedTime();

      // Перезапуск линий с равномерным интервалом
      if (time - lastSpawnTime > SPAWN_INTERVAL) {
        const idx = Math.floor(Math.random() * PARTICLE_COUNT); // Случайная линия
        const newAngle = Math.random() * Math.PI * 2;
        const newRadius = RADIUS + THREE.MathUtils.randFloat(-0.1, 0.1);
        const x = Math.cos(newAngle) * newRadius;
        const y = Math.sin(newAngle) * newRadius;
        const z = THREE.MathUtils.randFloat(-100, -50);
        const length = THREE.MathUtils.randFloat(1, 5);

        positionsArray[idx * 6 + 0] = x; // x начала
        positionsArray[idx * 6 + 1] = y; // y начала
        positionsArray[idx * 6 + 2] = z; // z начала
        positionsArray[idx * 6 + 3] = x; // x конца
        positionsArray[idx * 6 + 4] = y; // y конца
        positionsArray[idx * 6 + 5] = z + length; // z конца

        radii[idx] = newRadius;
        angles[idx] = newAngle;
        opacityAttribute[idx] = 0; // Начинаем с нуля

        lastSpawnTime = time; // Обновляем время последнего перезапуска
      }

      // Анимация и плавное появление
      for (let i = 0; i < positionsArray.length; i += 6) {
        const idx = i / 6;
        const radius = radii[idx];
        const initialAngle = angles[idx];
        const angle = initialAngle + ROTATION_SPEED * time;

        // Обновляем координаты начала линии
        positionsArray[i] = Math.cos(angle) * radius; // x
        positionsArray[i + 1] = Math.sin(angle) * radius; // y
        positionsArray[i + 2] += PARTICLE_SPEED; // z

        // Обновляем координаты конца линии
        positionsArray[i + 3] = Math.cos(angle) * radius; // x
        positionsArray[i + 4] = Math.sin(angle) * radius; // y
        positionsArray[i + 5] += PARTICLE_SPEED; // z

        // Плавное увеличение прозрачности
        if (opacityAttribute[idx] < INITIAL_OPACITY) {
          opacityAttribute[idx] += OPACITY_FADE_SPEED;
        }

        // Перезапуск линии, если выходит за границу
        if (positionsArray[i + 2] > RESET_THRESHOLD) {
          opacityAttribute[idx] = 0; // Сбрасываем прозрачность
        }
      }

      linesRef.current.geometry.attributes.position.needsUpdate = true;
      linesRef.current.geometry.attributes.opacity.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Линии */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={positions.length / 3}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-opacity"
            array={new Float32Array(opacities)}
            count={opacities.length}
            itemSize={1}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#FFFFFF"
          linewidth={LINE_WIDTH}
          transparent
          opacity={INITIAL_OPACITY}
          depthWrite={false}
        />
      </lineSegments>

      {/* Эффект Bloom */}
      <EffectComposer>
        <Bloom
          intensity={BLOOM_INTENSITY}
          luminanceThreshold={BLOOM_THRESHOLD}
          luminanceSmoothing={BLOOM_SMOOTHING}
          kernelSize={KernelSize.LARGE}
        />
        <SMAA />
      </EffectComposer>
    </>
  );
}

export default InfiniteRingEmitter;

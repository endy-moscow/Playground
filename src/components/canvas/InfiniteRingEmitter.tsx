import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import * as THREE from 'three';

function InfiniteRingEmitter() {
  const linesRef = useRef<THREE.LineSegments>(null);

  // Генерация направленных линий
  const linePositions = useMemo(() => {
    const positions = [];
    const particleCount = 1000; // Количество линий
    const radius = 10;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2; // Угол вокруг центра
      const r = radius + THREE.MathUtils.randFloat(-1, 1); // Радиус с шумом

      const x = Math.cos(angle) * r; // Начало линии
      const y = Math.sin(angle) * r;
      const z = THREE.MathUtils.randFloat(-100, -50); // Начальная глубина

      const length = THREE.MathUtils.randFloat(1, 5); // Длина линии
      const x2 = x; // Направление совпадает с началом
      const y2 = y;
      const z2 = z + length; // Конец линии впереди начала

      positions.push(x, y, z, x2, y2, z2);
    }

    return new Float32Array(positions);
  }, []);

  // *** Настройка анимации частиц ***
  const particleSpeed = 1; // Скорость движения частиц к камере
  const resetThreshold = 1; // Порог, за которым линии перезапускаются
  const spawnFactor = 1; // Коэффициент, регулирующий "редкость" перезапуска линий
  // *****************************************

  // Анимация линий
  useFrame(() => {
    if (linesRef.current) {
      const positions = linesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 6) {
        positions[i + 2] += particleSpeed; // Движение начала линии к камере
        positions[i + 5] += particleSpeed; // Движение конца линии к камере

        if (positions[i + 2] > resetThreshold) {
          // Перезапуск линий с регулируемым шансом
          if (Math.random() < 1 / spawnFactor) {
            const angle = Math.random() * Math.PI * 2;
            const r = 10 + THREE.MathUtils.randFloat(-1, 1);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            const z = THREE.MathUtils.randFloat(-100, -50);
            const length = THREE.MathUtils.randFloat(1, 5);

            positions[i] = x; // Начало линии X
            positions[i + 1] = y; // Начало линии Y
            positions[i + 2] = z; // Начало линии Z
            positions[i + 3] = x; // Конец линии X
            positions[i + 4] = y; // Конец линии Y
            positions[i + 5] = z + length; // Конец линии Z
          }
        }
      }
      linesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Линии */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={linePositions}
            count={linePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#FFFFFF" // Цвет линий
          linewidth={1}
          transparent
          opacity={0.5} // Базовая прозрачность
          depthWrite={false} // Улучшение визуального эффекта
        />
      </lineSegments>

      {/* Эффект Bloom */}
      <EffectComposer>
        <Bloom
          intensity={3.0} // Усиленное свечение
          luminanceThreshold={0.2} // Более низкий порог свечения
          luminanceSmoothing={0.5} // Плавный переход
          kernelSize={KernelSize.LARGE}
        />
        <SMAA />
      </EffectComposer>
    </>
  );
}

export default InfiniteRingEmitter;

// page.tsx
'use client';

import { Html } from '@react-three/drei';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Динамические импорты
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full flex-col items-center justify-center">
      <svg className="-ml-1 mr-3 size-5 animate-spin text-black" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  ),
});

const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), {
  ssr: false,
});

const InfiniteRingEmitter = dynamic(() => import('../src/components/canvas/InfiniteRingEmitter'), { ssr: false });

export default function Page() {
  return (
    <>
      <View className="relative size-full">
        <Suspense fallback={null}>
          <InfiniteRingEmitter />
          <Html><h1>Hello World</h1></Html>
          <Common color="#E72487" />
        </Suspense>
      </View>
      <div className="h-screen w-full bg-white"></div>
      <View className="relative size-full">
        <Suspense fallback={null}>
          <InfiniteRingEmitter />
          <Html><h1>Hello World</h1></Html>
          <Common color="#E72487" />
        </Suspense>
      </View>
    </>
  );
}

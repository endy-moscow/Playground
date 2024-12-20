'use client';

import { Html } from '@react-three/drei';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import 'swiper/css';
import { Autoplay, EffectCreative } from 'swiper/modules';
import HeroFloor from '../src/components/canvas/HeroFloor';
import VideoCallFloor from '../src/components/canvas/VideoCallFloor';
import SendFileFloor from '../src/components/canvas/SendFileFloor';
import MapFloor from '@/components/canvas/MapFloor';
import GameFloor from '@/components/dom/GameFloor';
import SpeedFloor from '@/components/dom/SpeedFloor';
import StableConnectionFloor from '@/components/dom/StableConnectionFloor';
import SubscriptionFloor from '@/components/dom/SubscriptionFloor';
import FAQFloor from '@/components/dom/FAQFloor';
import Footer from '@/components/dom/Footer';
// Динамические импорты
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-altel" />
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
          <Common color="#E72487" />
        </Suspense>
      </View>
      <div className="absolute inset-0 z-50 h-screen w-full bg-altel mix-blend-color"></div>


      {/* First Floor */}
      <HeroFloor />

      {/* Second Floor */}
      <VideoCallFloor />

      {/* Third Floor*/}
      <SendFileFloor />

      {/* Fourth Floor */}
      <MapFloor />

      {/* Fifth Floor */}
      <GameFloor />

      {/* Sixth Floor */}
      <SpeedFloor />

      {/* Seventh Floor */}
      <StableConnectionFloor />

      {/* Eighth Floor */}
      <SubscriptionFloor />

      {/* Ninth Floor */}
      <FAQFloor />

      <Footer />
    </>
  );
}


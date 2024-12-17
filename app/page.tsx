'use client';

import { Html } from '@react-three/drei';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import 'swiper/css';
import { Autoplay, EffectCreative } from 'swiper/modules';
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

      <div className="absolute inset-0 z-50 flex h-screen w-full flex-col items-center justify-center text-white">
        <Image
          src="/img/altel.svg"
          width={240} // Задайте ширину
          height={50} // Задайте высоту
          alt="Logo"
          className="mb-10"
        />
        <h1 className="max-w-7xl text-center font-stratos text-8xl font-bold uppercase leading-tight">
          быстрая и стабильная связь для всей семьи
        </h1>

        <Swiper
          spaceBetween={10}
          effect={'creative'}
          creativeEffect={{
            prev: {
              translate: [0, -40, 0],
              opacity: 0,
            },
            next: {
              translate: [0, -40, 0],
              opacity: 0,
            },
          }}
          slidesPerView={1}
          className="my-24 w-8/12 text-4xl"
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
          }}
          modules={[Autoplay, EffectCreative]}
        >
          <SwiperSlide className="flex items-center justify-center">
            <div className="flex size-full items-center justify-center">
              <p className="w-full text-center">Стабильная связь без помех</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="flex items-center justify-center">
            <div className="flex size-full items-center justify-center">
              <p className="w-full text-center">Сверхскоростной интернет</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="flex items-center justify-center">
            <div className="flex size-full items-center justify-center">
              <p className="w-full text-center">Быстрая загрузка и отправка файлов</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="flex items-center justify-center">
            <div className="flex size-full items-center justify-center">
              <p className="w-full text-center">Минимальный пинг в играх</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="flex items-center justify-center">
            <div className="flex size-full items-center justify-center">
              <p className="w-full text-center">Без проседаний скорости по вечерам</p>
            </div>
          </SwiperSlide>
        </Swiper>

        <button className="rounded-lg bg-white px-12 py-6 text-xl text-altel">
          Узнать больше
        </button>
      </div>

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


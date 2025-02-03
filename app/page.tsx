'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import 'swiper/css'
import HeroFloor from '@/components/dom/HeroFloor'
import VideoCallFloor from '@/components/dom/VideoCallFloor'
import SendFileFloor from '@/components/dom/SendFileFloor'
import MapFloor from '@/components/dom/MapFloor'
import GameFloor from '@/components/dom/GameFloor'
import SpeedFloor from '@/components/dom/SpeedFloor'
import StableConnectionFloor from '@/components/dom/StableConnectionFloor'
import SubscriptionFloor from '@/components/dom/SubscriptionFloor'
import FAQFloor from '@/components/dom/FAQFloor'
import Footer from '@/components/dom/Footer'
// Динамические импорты
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => <div className='flex size-full items-center justify-center bg-altel' />,
})

const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), {
  ssr: false,
})

const InfiniteRingEmitter = dynamic(() => import('../src/components/canvas/InfiniteRingEmitter'), { ssr: false })

export default function Page() {
  return (
    <>
      {/* Hero */}

      <View className='relative size-full'>
        <Suspense fallback={null}>
          <InfiniteRingEmitter />
          <Common color={'#000'} />
        </Suspense>
      </View>
      {/* <div className='absolute inset-0 z-10 h-screen w-full bg-altel mix-blend-color'></div> */}

      {/* Mask */}
      <div className='scroll-smooth antialiased'>
        {/* First Floor */}
        <HeroFloor />

        {/* Second Floor */}
        {/* <VideoCallFloor /> */}
        <SpeedFloor />

        {/* Third Floor*/}
        <SendFileFloor />

        {/* Fourth Floor */}
        <MapFloor />

        {/* Fifth Floor */}
        {/* <GameFloor /> */}

        {/* Sixth Floor */}
        {/* <SpeedFloor /> */}

        {/* Seventh Floor */}
        {/* <StableConnectionFloor /> */}

        {/* Eighth Floor */}
        {/* <SubscriptionFloor /> */}

        {/* Ninth Floor */}
        <FAQFloor />

        <Footer />
      </div>
    </>
  )
}

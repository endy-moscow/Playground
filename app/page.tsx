'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
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
  loading: () => <div className='flex size-full items-center justify-center bg-black' />,
})

const AltelTube = dynamic(() => import('@/components/canvas/AltelTube'), { ssr: false })

const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), {
  ssr: false,
})

export default function Page() {
  return (
    <>
      {/* Hero */}

      <View className='relative size-full'>
        <Suspense fallback={null}>
          {/* <ShaderOverlay position={[0, 0, 0]} scale={[1, 1, 0]} /> */}
          {/* <AltelTube /> */}
          <AltelTube />
          <Common />
        </Suspense>
      </View>
      <motion.div
        initial={{ backgroundColor: 'rgba(0, 0, 0, 1)' }}
        animate={{ backgroundColor: 'rgba(231, 36, 135, 1)' }}
        transition={{ duration: 2, delay: 1 }}
        className='absolute inset-0 z-10 h-screen w-full mix-blend-color'
      />

      {/* Mask */}
      <div className='scroll-smooth antialiased'>
        {/* First Floor */}
        <HeroFloor />

        {/* Second Floor */}
        <VideoCallFloor />
        <SpeedFloor />

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
      </div>
    </>
  )
}

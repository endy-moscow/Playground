'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import VideoCallFloor from '@/components/dom/VideoCallFloor'
import FAQFloor from '@/components/dom/FAQFloor'
import Footer from '@/components/dom/Footer'
import HeroFloor from '@/components/dom/HeroFloor'

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

      <div className='scroll-smooth antialiased'>
        <HeroFloor />

        <VideoCallFloor />

        <FAQFloor />

        <Footer />
      </div>
    </>
  )
}

'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import Image from 'next/image'
import 'swiper/css'
import { Autoplay, EffectCreative } from 'swiper/modules'
import { AnimatePresence, motion, useInView } from 'motion/react'

export function RotateWords({ text = 'Rotate', words = ['1', '2', '3', '4', '5'] }: { text: string; words: string[] }) {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [words.length])
  return (
    <div className='flex w-fit items-center justify-center gap-1.5 pb-24 text-center font-stratos text-2xl font-bold uppercase tracking-wide lg:text-7xl'>
      {text}{' '}
      <AnimatePresence mode='wait'>
        <motion.p
          key={words[index]}
          initial={{ filter: 'blur(20px)', opacity: 0 }}
          animate={{ filter: 'blur(0px)', opacity: 1 }}
          exit={{ filter: 'blur(100px)', opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {words[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

const HeroFloor = () => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div className='absolute inset-0 z-50 flex h-screen w-full flex-col items-center justify-center px-4 text-white'>
      <Image src='/img/altel.svg' width={240} height={50} alt='Logo' className='mb-16 sm:w-36 lg:w-48 ' />
      <h1 className='mb-8 px-24 text-center font-stratos  uppercase sm:text-6xl lg:text-9xl lg:leading-[1.2]'>
        Скоростной <br />
        мобильный интернет <br />
        для&nbsp;всей семьи
      </h1>
      <RotateWords
        words={[
          'Стабильная связь без помех',
          'Сверхскоростной интернет',
          'Быстрая загрузка и отправка файлов',
          'Сверхскоростной интернет',
          'Без проседаний скорости по вечерам',
        ]}
        text={''}
      />

      <a href='#1'>
        <motion.button
          className='rounded-lg bg-white/60 px-8  py-4 font-stratos text-sm font-bold uppercase text-black backdrop-blur-md hover:bg-white/95 active:bg-white/95 sm:px-12 sm:py-6 sm:text-xl'
          transition={{ duration: 0.3 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          whileTap={{
            scale: 0.97,
            transition: { duration: 0.15 },
          }}
        >
          Узнать больше
        </motion.button>
      </a>
    </div>
  )
}

export default HeroFloor

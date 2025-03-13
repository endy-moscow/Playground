'use client'

import React from 'react'
import Image from 'next/image'
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
    <div className='flex w-fit items-center justify-center gap-1.5 pb-24 text-center font-stratos text-base font-bold uppercase tracking-wide lg:text-7xl'>
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

const AnimatedTitle = () => {
  const words = ['Скоростной', 'мобильный интернет', 'для всей семьи']

  return (
    <h1 className='mb-2 px-2 pb-4 text-center font-stratos uppercase lg:text-9xl lg:leading-[1.2]'>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className='block'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.2, // Each word appears 0.2s after the previous
            ease: [0.4, 0.0, 0.2, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  )
}

const HeroFloor = () => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div className='absolute inset-0 z-50 flex h-screen w-full flex-col items-center justify-center px-4 text-2xl text-white'>
      <Image src='/img/altel.svg' width={115.2} height={24} alt='Logo' className='mb-16 sm:w-36 lg:w-48 ' />
      <AnimatedTitle />
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

      <a href='#1' className='px-2 py-1'>
        <motion.button
          className='absolute inset-x-8 bottom-8 rounded-lg bg-white/60  px-8 py-4 font-stratos text-sm font-bold uppercase text-black backdrop-blur-md hover:bg-white/95 active:bg-white/95'
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

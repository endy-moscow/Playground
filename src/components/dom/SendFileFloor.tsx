import React, { useRef } from 'react'
import { motion, useInView } from 'motion/react'

const ANIMATION_SETTINGS = {
  initialDelay: 0.5, // Задержка до заголовка
  afterFirstMessageDelay: 3, // Задержка после первого сообщения
  subsequentDelay: 1.5, // Задержка между остальными сообщениями
  duration: 0.5, // Длительность анимации
}

const SendFileFloor = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay:
          index === 0
            ? ANIMATION_SETTINGS.initialDelay
            : index === 1
              ? ANIMATION_SETTINGS.initialDelay + ANIMATION_SETTINGS.afterFirstMessageDelay
              : ANIMATION_SETTINGS.initialDelay +
                ANIMATION_SETTINGS.afterFirstMessageDelay +
                (index - 1) * ANIMATION_SETTINGS.subsequentDelay,
        duration: ANIMATION_SETTINGS.duration,
        ease: 'easeInOut',
      },
    }),
  }

  return (
    <div ref={ref} className='flex w-full items-center justify-center py-16 '>
      <div className='flex w-full max-w-screen-xl flex-row gap-32 p-4'>
        {/* Сообщения */}
        <div className='flex w-1/3 flex-col gap-4'>
          {/* Видео-блок */}
          <motion.div
            className='relative h-[420px] w-[275px] self-end rounded-[15px] '
            initial='hidden'
            animate={isInView ? 'visible' : 'hidden'}
            variants={messageVariants}
            custom={0} // Индекс для первого элемента
          >
            <video width={275} height={420} autoPlay loop muted playsInline preload='none' className='rounded-[15px]'>
              <source src='/video/Mountains.mp4' type='video/mp4' />
              Your browser does not support the video tag.
            </video>
            <div className='absolute bottom-0 w-full rounded-b-[14px] bg-[#007AFF] p-3'>
              <p className='text-[14px] text-white sm:text-[16px]'>Привет, мам! Смотри, где я 🤩</p>
            </div>
          </motion.div>

          {/* Сообщения чата */}
          <motion.div
            className='flex items-start gap-2 self-start'
            initial='hidden'
            animate={isInView ? 'visible' : 'hidden'}
            variants={messageVariants}
            custom={1}
          >
            <div className='rounded-[15px] bg-[#E6E5EB] p-3 text-black'>
              <p className='text-[14px] leading-snug sm:text-[16px]'>
                вааау, как красиво!!!
                <br />я так за тебя рада ❤️
              </p>
            </div>
          </motion.div>

          <motion.div
            className='flex justify-end gap-2 self-end'
            initial='hidden'
            animate={isInView ? 'visible' : 'hidden'}
            variants={messageVariants}
            custom={2}
          >
            <div className='rounded-[15px] bg-[#007AFF] p-3 text-white'>
              <p className='text-[14px] sm:text-[16px]'>❤️❤️❤️</p>
            </div>
          </motion.div>

          <motion.div
            className='flex items-start gap-2 self-start'
            initial='hidden'
            animate={isInView ? 'visible' : 'hidden'}
            variants={messageVariants}
            custom={3}
          >
            <div className='rounded-[15px] bg-[#E6E5EB] p-3 text-black'>
              <p className='text-[14px] sm:text-[16px]'>❤️❤️❤️</p>
            </div>
          </motion.div>
        </div>

        {/* Заголовок */}
        <motion.h1
          className='sticky top-0 h-fit w-full py-12 font-stratos text-5xl font-bold leading-tight text-black'
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: ANIMATION_SETTINGS.duration,
                delay: ANIMATION_SETTINGS.initialDelay,
              },
            },
          }}
        >
          Делитесь впечатлениями здесь и сейчас. Большие файлы отправляются быстро
        </motion.h1>
      </div>
    </div>
  )
}

export default SendFileFloor

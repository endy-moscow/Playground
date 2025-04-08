// GameFloor.tsx

import React from 'react'
import Image from 'next/image'

const GameFloor = () => {
  return (
    <div className='flex w-full flex-col items-center justify-center gap-8 bg-white px-4'>
      {/* Title Section */}
      <h3 className='text-center font-stratos text-5xl font-bold text-black'>Играйте и выигрывайте</h3>

      {/* Content Section */}
      <div className='flex w-full max-w-screen-xl flex-row items-center justify-center gap-12'>
        {/* Left Card */}
        <div className='flex h-[230px] w-[192px] flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 p-6'>
          <h2 className='text-sm font-semibold text-gray-500'>4G и ниже</h2>
          <div className='text-2xl font-bold'>
            100-120 <span className='text-xs font-medium'>мс</span>
          </div>
          <p className='text-xs text-gray-400'>Блин, я же первый стрелял!</p>
        </div>

        {/* Center Video/Image */}
        <div className='relative flex h-[340px] w-[600px] items-center justify-center overflow-hidden rounded-xl bg-gray-900'>
          <Image src='/img/example.jpg' alt='Пример видео' fill className='rounded-xl' />
          <div className='absolute left-4 top-4 rounded bg-pink-500 px-2 py-1 text-xs font-bold text-white'>
            ALTEL 5G
          </div>
        </div>

        {/* Right Card */}
        <div className='flex h-[230px] w-[192px] flex-col items-center justify-center gap-2 rounded-lg border border-pink-300 p-6 shadow-lg shadow-pink-500/20'>
          <h2 className='text-sm font-semibold text-pink-500'>ALTEL 5G</h2>
          <div className='text-2xl font-bold text-pink-500'>
            10-20 <span className='text-xs font-medium'>мс</span>
          </div>
          <p className='text-xs text-pink-500'>Пап, смотри, я победил</p>
        </div>
      </div>
    </div>
  )
}

export default GameFloor

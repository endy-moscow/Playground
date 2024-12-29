import React from 'react'
import Lottie4G from './Lottie4G'
import Lottie5G from './Lottie5G'

const SpeedFloor = () => {
  return (
    <div className='flex w-full flex-col items-center justify-center gap-8 bg-white px-4 py-24 text-center'>
      <div className='flex flex-col gap-2'>
        <h1 className='font-stratos text-5xl font-bold leading-tight'>Перейдите на новый уровень скорости</h1>
        <p className='mx-auto max-w-2xl text-lg text-gray-600'>
          У 5G самая высокая скорость передачи данных среди всех стандартов сотовой связи. Это в 10 раз быстрее, чем
          предыдущее поколение интернета
        </p>
      </div>

      <div className='flex flex-row items-center justify-center gap-12'>
        <div className='flex flex-col items-center gap-2'>
          <Lottie4G />
          <p className=' text-sm text-gray-500'>
            Фильм в 4K скачается <br />
            за <span className='font-bold'>50 минут</span>
          </p>
        </div>

        <div className=' flex flex-col items-center font-stratos uppercase'>
          <p className='text-8xl font-bold text-gray-400'>
            x<span className='text-altel'>10</span>
          </p>
          <p className='text-xl font-bold text-gray-400'>прирост скорости</p>
        </div>

        <div className='flex flex-col items-center gap-2'>
          <Lottie5G />
          <p className='text-sm text-gray-500'>
            Фильм в 4K скачается <br />
            за <span className='font-bold'>5 минут</span>
          </p>
        </div>
      </div>

      <button className='rounded-lg bg-pink-500 px-6 py-3 text-lg text-white hover:bg-pink-400'>Подключить</button>
    </div>
  )
}

export default SpeedFloor

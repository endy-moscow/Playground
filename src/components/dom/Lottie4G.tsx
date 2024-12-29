import React from 'react'
import { useLottie, useLottieInteractivity } from 'lottie-react'
import lottie4GData from './speed-data-4g.json'

const Lottie4G = () => {
  const options = {
    animationData: lottie4GData,
  }

  const lottie4G = useLottie(options)
  const lottie4GInteractive = useLottieInteractivity({
    lottieObj: lottie4G,
    actions: [
      {
        visibility: [0, 0.5],
        type: 'seek',
        frames: [0, 29],
      },
      {
        visibility: [0.5, 1],
        type: 'loop',
        frames: [30, 89],
      },
    ],
  })

  return (
    <div className='relative flex size-72 items-center justify-center'>
      {lottie4GInteractive}
      <div className='absolute text-center'>
        <p className=' font-bold text-gray-400'>4G</p>
        <p className='font-mono text-4xl font-bold'>150</p>
        <p className=' text-gray-400'>Мбит/с</p>
      </div>
    </div>
  )
}

export default Lottie4G

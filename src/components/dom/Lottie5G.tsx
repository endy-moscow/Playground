import React from 'react'
import { useLottie, useLottieInteractivity } from 'lottie-react'
import lottie5GData from './speed-data-altel.json'

const Lottie5G = () => {
  const options = {
    animationData: lottie5GData,
    loop: true,
    autoplay: true,
  }
  const lottieObj = useLottie(options)
  const Animation = useLottieInteractivity({
    lottieObj,
    player: '#fourthLottie',
    mode: 'scroll',
    actions: [
      {
        visibility: [0.0, 0.5],
        type: 'seek',
        frames: [0, 30],
      },
      {
        visibility: [0.5, 1],
        type: 'loop',
        frames: [30, 80],
      },
    ],
  })

  return (
    <div className='relative flex size-72 items-center justify-center'>
      {Animation}
      <div className='absolute text-center'>
        <p className=' font-bold text-gray-400'>5G</p>
        <p className='font-mono text-4xl font-bold'>1500</p>
        <p className=' text-gray-400'>Мбит/с</p>
      </div>
    </div>
  )
}

export default Lottie5G

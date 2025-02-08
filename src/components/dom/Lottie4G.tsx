import React from 'react'
import { useLottie, useLottieInteractivity } from 'lottie-react'
import lottie4GData from './speed-data-4g.json'

const Lottie4G = () => {
  const options = {
    animationData: lottie4GData,
    loop: false,
    autoplay: true,
  }
  const lottieObj = useLottie(options)
  const Animation = useLottieInteractivity({
    mode: 'scroll', // добавлено обязательное поле
    lottieObj,
    actions: [
      {
        visibility: [0.0, 0.5],
        type: 'stop',
        frames: [0, 29],
      },
      {
        visibility: [0.5, 1],
        type: 'loop',
        frames: [30, 89],
      },
    ],
  })

  return Animation
}

export default Lottie4G

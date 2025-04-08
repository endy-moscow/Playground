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

  return Animation
}

export default Lottie5G

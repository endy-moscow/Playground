import React from 'react'
import { useLottie } from 'lottie-react'
import lottie4GData from './speed-data-4g.json'

const Lottie4G = () => {
  const options = {
    animationData: lottie4GData,
    loop: true,
    autoplay: true,
  }

  const { View } = useLottie(options)

  return View
}

export default Lottie4G

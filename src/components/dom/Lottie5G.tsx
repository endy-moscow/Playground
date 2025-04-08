import React from 'react'
import { useLottie } from 'lottie-react'
import lottie5GData from './speed-data-altel.json'

const Lottie5G = () => {
  const options = {
    animationData: lottie5GData,
    loop: true,
    autoplay: true,
  }

  const { View } = useLottie(options)

  return View
}

export default Lottie5G

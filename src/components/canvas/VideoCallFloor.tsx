import React, { useRef } from 'react';
import Image from 'next/image';
const VideoCallFloor = () => {

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-8 bg-gray-100 pb-24 text-center leading-relaxed">
      <h1 className="flex w-2/4 flex-col items-center justify-center font-stratos text-6xl">
        Разговаривайте по видео без задержек и зависаний
      </h1>
      <div className="flex w-full max-w-screen-xl flex-row items-center justify-center gap-12">

        <div className="flex max-w-[192px] flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-500">4G и ниже</h2>
          <div className="text-center text-xl font-semibold">50-100 мс</div>
          <p className="text-xs text-gray-400">Очень мешает при живом общении</p>
        </div>

        <div className="relative flex items-center justify-center gap-12">
          <Image src="/img/atashka-4g.png" alt="4G" width={180} height={372} className="rounded-lg shadow-lg" />
          <Image src="/img/atashka-5g.png" alt="5G" width={180} height={372} className="rounded-lg shadow-lg" />
        </div>

        <div className="flex max-w-[192px] flex-col items-center gap-2 rounded-lg border border-pink-300 bg-white p-6 shadow-lg shadow-pink-500/20">
          <h2 className="text-sm font-semibold text-pink-600">ALTEL 5G</h2>
          <div className="text-center text-xl font-semibold text-pink-600">до 5 мс</div>
          <p className="text-xs text-pink-600">Комфортно разговаривать по видео</p>
        </div>
      </div>
      <button className="rounded-lg bg-pink-600 px-12 py-6 text-xl text-white hover:bg-pink-500">
        Подключить 5G
      </button>
    </div>
  );
};

export default VideoCallFloor;

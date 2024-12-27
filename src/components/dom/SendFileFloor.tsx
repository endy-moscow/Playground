import React, { useRef } from 'react';
import Image from 'next/image';

const SendFileFloor = () => {
  return (
    <div className="flex h-fit w-full flex-row items-center justify-center gap-12 bg-white p-48 py-96">
      {/* Left Section */}
      <div className="flex flex-col gap-4">
        {/* Video Bubble */}
        <div className="relative h-[411px] w-[274px] rounded-[15px] bg-[#007AFF]">
          <Image
            src="/img/example.jpg"
            alt="Снежные горы"
            layout="fill"
            objectFit="cover"
            className="rounded-[15px]"
          />
          <div className="absolute bottom-0 w-full rounded-b-[15px] bg-[#007AFF] p-3">
            <p className="text-[14px] text-white">Привет, мам! Смотри, где я 🤩</p>
          </div>
        </div>

        {/* Chat Bubbles */}
        <div className="flex flex-row items-start gap-2">
          <div className="rounded-[15px] bg-[#E6E5EB] p-3 text-black">
            <p className="text-[14px] leading-snug">
              вааау, как красиво!!!
              <br />
              я так за тебя рада ❤️
            </p>
          </div>
        </div>

        <div className="flex flex-row justify-end gap-2">
          <div className="rounded-[15px] bg-[#007AFF] p-3 text-white">
            <p className="text-[14px]">❤️❤️❤️</p>
          </div>
        </div>

        <div className="flex flex-row items-start gap-2">
          <div className="rounded-[15px] bg-[#E6E5EB] p-3 text-black">
            <p className="text-[14px]">❤️❤️❤️</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col gap-4">
        <h1 className="font-stratos text-5xl font-bold leading-tight text-black">
          Делитесь впечатлениями здесь и сейчас. Большие файлы отправляются быстро
        </h1>
      </div>
    </div>
  );
};

export default SendFileFloor;





'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import 'swiper/css';
import { Autoplay, EffectCreative } from 'swiper/modules';

const HeroFloor = () => {
  return (
    <div className="absolute inset-0 z-50 flex h-screen w-full flex-col items-center justify-center px-4 text-white">
      <Image
        src="/img/altel.svg"
        width={240}
        height={50}
        alt="Logo"
        className="mb-6 sm:w-36 lg:w-48"
      />
      <h1 className="max-w-6xl text-center font-stratos text-3xl font-bold uppercase leading-tight md:text-6xl lg:text-8xl">
        быстрая и&nbsp;стабильная связь для&nbsp;всей семьи
      </h1>

      <Swiper
        spaceBetween={10}
        effect={'creative'}
        creativeEffect={{
          prev: {
            translate: [0, -40, 0],
            opacity: 0,
          },
          next: {
            translate: [0, -40, 0],
            opacity: 0,
          },
        }}
        slidesPerView={1}
        className="my-12 w-10/12 text-5xl md:my-16 lg:w-8/12"
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
        }}
        modules={[Autoplay, EffectCreative]}
      >
        <SwiperSlide className="flex items-center justify-center">
          <p className="w-full text-center ">
            Стабильная связь без помех
          </p>
        </SwiperSlide>
        <SwiperSlide className="flex items-center justify-center">
          <p className="w-full text-center">
            Сверхскоростной интернет
          </p>
        </SwiperSlide>
        <SwiperSlide className="flex items-center justify-center">
          <p className="w-full text-center">
            Быстрая загрузка и отправка файлов
          </p>
        </SwiperSlide>
        <SwiperSlide className="flex items-center justify-center">
          <p className="w-full text-center">
            Минимальный пинг в играх
          </p>
        </SwiperSlide>
        <SwiperSlide className="flex items-center justify-center">
          <p className="w-full text-center">
            Без проседаний скорости по вечерам
          </p>
        </SwiperSlide>
      </Swiper>

      <button className="rounded-lg bg-white px-8 py-4 text-sm font-bold text-altel sm:px-12 sm:py-6 sm:text-xl">
        Узнать больше
      </button>
    </div >
  );
};

export default HeroFloor;

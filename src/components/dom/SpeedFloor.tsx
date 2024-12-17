import React from 'react';
import Image from 'next/image';

const SpeedFloor = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-8 bg-white px-4 text-center">
      {/* Заголовок */}
      <div className="flex flex-col gap-2">
        <h1 className="font-stratos text-5xl font-bold leading-tight">
          Перейдите на новый уровень скорости
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-500">
          У 5G самая высокая скорость передачи данных среди всех стандартов сотовой связи. Это в 10 раз быстрее, чем
          предыдущее поколение интернета
        </p>
      </div>

      {/* Контент */}
      <div className="flex flex-row items-center justify-center gap-12">
        {/* Левая секция */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex size-44 items-center justify-center">
            <div className="absolute size-44 rounded-full border-8 border-yellow-400" style={{ borderRightColor: '#E5E5E5' }}></div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-400">4G</p>
              <p className="text-2xl font-bold">150</p>
              <p className="text-sm text-gray-400">Мбит/с</p>
            </div>
          </div>
          <p className="max-w-[150px] text-sm text-gray-500">
            Фильм в 4K скачается за <span className="font-bold">50 минут</span>
          </p>
        </div>

        {/* Центральный текст */}
        <div className="flex flex-col items-center">
          <p className="text-4xl font-bold text-gray-400">x<span className="text-pink-500">10</span></p>
          <p className="text-2xl font-bold text-gray-400">прирост скорости</p>
        </div>

        {/* Правая секция */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex size-44 items-center justify-center">
            <div className="absolute size-44 rounded-full border-8 border-pink-500" style={{ borderRightColor: '#E5E5E5' }}></div>
            <div className="text-center">
              <Image src="/img/example.jpg" alt="ALTEL 5G" width={40} height={20} />
              <p className="text-2xl font-bold">1000</p>
              <p className="text-sm text-gray-400">Мбит/с</p>
            </div>
          </div>
          <p className="max-w-[150px] text-sm text-gray-500">
            Фильм в 4K скачается за <span className="font-bold">5 минут</span>
          </p>
        </div>
      </div>

      {/* Кнопка */}
      <button className="rounded-lg bg-pink-500 px-6 py-3 text-lg text-white hover:bg-pink-400">
        Подключить
      </button>
    </div>
  );
};

export default SpeedFloor;

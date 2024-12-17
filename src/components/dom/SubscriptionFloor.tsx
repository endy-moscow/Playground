// SubscriptionFloor
import React from 'react';
import Image from 'next/image';

const SubscriptionFloor = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-white px-4 py-16">
      {/* Title */}
      <h1 className="mb-8 text-center font-stratos text-5xl font-bold text-pink-600">
        Подключите 5G от Altel
      </h1>

      {/* Content Container */}
      <div className="flex max-w-4xl flex-row items-center justify-center gap-8">
        {/* Card Left */}
        <div className="flex flex-col items-center rounded-lg bg-gray-100 p-8 shadow-md">
          <h2 className="mb-4 font-semibold text-gray-700">На смартфон</h2>
          <Image
            src="/img/example.jpg"
            alt="Смартфон с Altel 5G"
            width={150}
            height={150}
            className="rounded-lg"
          />
        </div>

        {/* Card Right */}
        <div className="flex flex-col items-center rounded-lg bg-gray-100 p-8 shadow-md">
          <h2 className="mb-4 font-semibold text-gray-700">Домой</h2>
          <Image
            src="/img/example.jpg"
            alt="Роутер с Altel 5G"
            width={150}
            height={150}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Features List */}
      <div className="mt-8 flex w-full max-w-2xl flex-col gap-4">
        <div className="flex items-center rounded-md bg-gray-50 p-4 shadow-sm">
          <span className="mr-4">✔️</span> Перенос остатков трафика на следующий месяц
        </div>
        <div className="flex items-center rounded-md bg-gray-50 p-4 shadow-sm">
          <span className="mr-4">📞</span> Бесплатные звонки внутри сети Altel и Tele2
        </div>
        <div className="flex items-center rounded-md bg-gray-50 p-4 shadow-sm">
          <span className="mr-4">🎥</span> Безлимитные соцсети и сервисы
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <button className="rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-pink-500">
          Подключить от 3 390 т/мес
        </button>
        <button className="rounded-lg border border-pink-600 px-6 py-3 font-semibold text-pink-600 hover:bg-pink-50">
          Перенести свой номер в Altel 5G
        </button>
      </div>
    </div>
  );
};

export default SubscriptionFloor;

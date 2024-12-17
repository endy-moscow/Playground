import React from 'react';
import Image from 'next/image';

const StableConnectionFloor = () => {
  return (
    <div className="flex flex-col items-center gap-12 bg-gray-100 px-4 py-16">
      {/* Верхний блок */}
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="font-stratos text-5xl font-bold">
          Стабильное соединение без перегрузок сети
        </h1>
        <div className="flex justify-center gap-8">
          {/* 4G блок */}
          <div className="flex flex-col items-center justify-center rounded-lg border bg-white p-6 shadow-lg">
            <p className="text-sm text-gray-400">4G и ниже</p>
            <h2 className="text-2xl font-bold">До 100 тыс.</h2>
            <p className="text-sm text-gray-500">устройств на км²</p>
            <p className="mt-2 text-gray-600">
              Сеть перегружается устройствами, вечером в городах наблюдаются просадки в сети
            </p>
          </div>
          {/* ALTEL блок */}
          <div className="flex flex-col items-center justify-center rounded-lg border bg-pink-100 p-6 shadow-lg">
            <p className="text-sm font-bold text-pink-600">ALTEL</p>
            <h2 className="text-2xl font-bold text-pink-600">До 1 млн</h2>
            <p className="text-sm text-pink-600">устройств на км²</p>
            <p className="mt-2 text-gray-600">
              Стабильный интернет даже в самом большом ЖК, на праздниках и на концерте
            </p>
          </div>
        </div>
      </div>

      {/* Нижний блок */}
      <div className="flex flex-col items-center gap-8">
        <h2 className="font-stratos text-4xl font-bold text-black">
          Доступ к новейшим технологиям прямо сейчас
        </h2>
        <p className="max-w-screen-md text-center text-gray-600">
          Будьте первыми, кто сможет пользоваться новыми технологиями, которые зависят от
          скоростного и стабильного интернета
        </p>
        <div className="flex justify-center gap-8">
          {/* Карточка 1 */}
          <div className="flex flex-col items-center gap-4 rounded-lg bg-pink-100 p-6 shadow-lg">
            <Image src="/img/example.jpg" alt="Дрон" width={150} height={150} />
            <p className="text-center text-gray-600">
              Заказать беспилотную доставку и такси, чтобы ехать одному
            </p>
          </div>
          {/* Карточка 2 */}
          <div className="flex flex-col items-center gap-4 rounded-lg bg-pink-100 p-6 shadow-lg">
            <Image src="/img/example.jpg" alt="VR Очки" width={150} height={150} />
            <p className="text-center text-gray-600">
              Собраться на той с родственниками за границей в виртуальной реальности
            </p>
          </div>
          {/* Карточка 3 */}
          <div className="flex flex-col items-center gap-4 rounded-lg bg-pink-100 p-6 shadow-lg">
            <Image src="/img/example.jpg" alt="Камера" width={150} height={150} />
            <p className="text-center text-gray-600">
              Получать realtime-картинку с камер видеонаблюдения на участке или в детской
            </p>
          </div>
        </div>
        <button className="rounded-lg bg-pink-600 px-12 py-4 text-lg font-bold text-white hover:bg-pink-500">
          Подключить
        </button>
      </div>
    </div>
  );
};

export default StableConnectionFloor;

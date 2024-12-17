import React from 'react';

const MapFloor = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-start bg-white px-4 py-12">
      {/* Heading Section */}
      <div className="mb-8 text-center">
        <h1 className="font-stratos text-5xl font-bold leading-tight">
          Будущее мобильных сетей в вашем городе
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          5G активно внедряют по всему миру. Каждую неделю в городах Казахстана появляются новые вышки
        </p>
        <p className="text-lg text-gray-600">
          Проверьте 5G в вашем городе и подключитесь одними из первых
        </p>
      </div>

      {/* Select Dropdown */}
      <div className="mb-8">
        <select className="w-40 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:outline-none">
          <option value="almaty">Алматы</option>
        </select>
      </div>

      {/* Map Section */}
      <div className="relative h-[400px] w-full rounded-lg bg-altel">
        <div className="absolute inset-0 rounded-lg bg-[#E6007E] opacity-70"></div>
      </div>
    </div>
  );
};

export default MapFloor;

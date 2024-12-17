import React from 'react';

const FAQFloor = () => {
  return (
    <div className="flex w-full flex-col items-center bg-white px-4 py-12">
      {/* Заголовок */}
      <h1 className="mb-4 text-center font-stratos text-4xl font-bold leading-tight">
        Нас часто спрашивают о 5G
        <br />
        Сейчас всё расскажем
      </h1>

      {/* FAQ Section */}
      <div className="w-full max-w-4xl rounded-lg border border-gray-200 bg-gray-50">
        {/* Вопрос 1 */}
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Что такое 5G и как это работает?</h2>
          <p className="mt-2 text-gray-600">
            5G — это радиоволны, которые передают сигналы между антенной и устройством.
            Главное отличие — это более высокая частота, позволяющая передавать сигналы быстро на меньшее расстояние.
          </p>
        </div>

        {/* Вопрос 2 */}
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Говорят, что излучение 5G опасно для здоровья. Это правда?</h2>
          <p className="mt-2 text-gray-600">
            Нет. Исследования показывают, что радиоволны 5G не оказывают негативного влияния на здоровье человека.
          </p>
        </div>

        {/* Вопрос 3 */}
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Мне нужен особенный смартфон или SIM-карта, чтобы подключить 5G?</h2>
          <p className="mt-2 text-gray-600">
            Ваш смартфон должен поддерживать 5G, но менять SIM-карту не потребуется.
          </p>
        </div>

        {/* Вопрос 4 */}
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Как узнать, есть ли 5G в моем районе?</h2>
          <p className="mt-2 text-gray-600">
            Проверьте карту покрытия на сайте Altel и выберите город.
          </p>
        </div>

        {/* Вопрос 5 */}
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">5G заменит 4G или Wi-Fi?</h2>
          <p className="mt-2 text-gray-600">
            Нет. 5G и Wi-Fi будут работать вместе, обеспечивая стабильный интернет.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQFloor;

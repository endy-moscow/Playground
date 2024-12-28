// import React from 'react';
// import { useLottie, useLottieInteractivity } from 'lottie-react';
// import lottie4GData from './speed-data-4g.json'; // Убедитесь, что путь к файлу правильный
// import lottie5GData from './speed-data-altel.json'; // Убедитесь, что путь к файлу правильный

// const lottieOptions4G = {
//   animationData: lottie4GData,
//   loop: true,
//   autoplay: true,
// };

// const lottieOptions5G = {
//   animationData: lottie5GData,
//   loop: true,
//   autoplay: true,
// };

// const SpeedFloor = () => {
//   // 4G Animation
//   const lottie4G = useLottie(lottieOptions4G);
//   const lottie4GInteractive = useLottieInteractivity({
//     lottieObj: lottie4G,
//     mode: 'scroll',
//     actions: [
//       {
//         visibility: [0, 0.5],
//         type: 'seek',
//         frames: [0, 30], // Play intro
//       },
//       {
//         visibility: [0.5, 1],
//         type: 'loop',
//         frames: [30, 90], // Loop specific segment
//       },
//     ],
//   });

//   // 5G Animation
//   const lottie5G = useLottie(lottieOptions5G);
//   const lottie5GInteractive = useLottieInteractivity({
//     lottieObj: lottie5G,
//     mode: 'scroll',
//     actions: [
//       {
//         visibility: [0, 0.5],
//         type: 'seek',
//         frames: [0, 30], // Play intro
//       },
//       {
//         visibility: [0.5, 1],
//         type: 'loop',
//         frames: [30, 90], // Loop specific segment
//       },
//     ],
//   });

//   return (
//     <div className="flex w-full flex-col items-center justify-center gap-8 bg-white px-4 py-24 text-center">
//       {/* Header Section */}
//       <div className="flex flex-col gap-2">
//         <h1 className="font-stratos text-5xl font-bold leading-tight">
//           Перейдите на новый уровень скорости
//         </h1>
//         <p className="mx-auto max-w-2xl text-lg text-gray-500">
//           У 5G самая высокая скорость передачи данных среди всех стандартов сотовой связи. Это в 10 раз быстрее, чем
//           предыдущее поколение интернета
//         </p>
//       </div>

//       {/* Content Section */}
//       <div className="flex flex-row items-center justify-center gap-12">
//         {/* Left Section */}
//         <div className="flex flex-col items-center gap-2">
//           <div className="relative flex size-72 items-center justify-center">
//             {lottie4GInteractive}
//             <div className="absolute text-center">
//               <p className="text-sm font-bold text-gray-400">4G</p>
//               <p className="text-2xl font-bold">150</p>
//               <p className="text-sm text-gray-400">Мбит/с</p>
//             </div>
//           </div>
//           <p className="max-w-[150px] text-sm text-gray-500">
//             Фильм в 4K скачается за <span className="font-bold">50 минут</span>
//           </p>
//         </div>

//         {/* Center Text */}
//         <div className="flex flex-col items-center">
//           <p className="text-4xl font-bold text-gray-400">
//             x<span className="text-pink-500">10</span>
//           </p>
//           <p className="text-2xl font-bold text-gray-400">прирост скорости</p>
//         </div>

//         {/* Right Section */}
//         <div className="flex flex-col items-center gap-2">
//           <div className="relative flex size-72 items-center justify-center">
//             {lottie5GInteractive}
//             <div className="absolute text-center">
//               <p className="text-sm font-bold text-gray-400">5G</p>
//               <p className="text-2xl font-bold">1500</p>
//               <p className="text-sm text-gray-400">Мбит/с</p>
//             </div>
//           </div>
//           <p className="text-sm text-gray-500">
//             Фильм в 4K скачается <br />за <span className="font-bold">5 минут</span>
//           </p>
//         </div>
//       </div>

//       {/* Button Section */}
//       <button className="rounded-lg bg-pink-500 px-6 py-3 text-lg text-white hover:bg-pink-400">
//         Подключить
//       </button>
//     </div>
//   );
// };

// export default SpeedFloor;

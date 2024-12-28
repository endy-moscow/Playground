import React from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";

const BlurIn = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.h2
      ref={ref}
      initial={{ filter: "blur(20px)", opacity: 0 }}
      animate={isInView ? { filter: "blur(0px)", opacity: 1 } : {}}
      transition={{ duration: 1.2 }}
      className="text-center text-xl font-bold tracking-tighter sm:text-4xl md:text-6xl md:leading-[4rem]"
    >
      {children}
    </motion.h2>
  );
};

const AnimatedCard = ({
  title,
  videoSrc,
  delay,
  latency,
  description,
  borderStyle,
  textStyle,
  children,
}: {
  title: string;
  videoSrc: string;
  delay: number;
  latency: string;
  description: string;
  borderStyle?: string;
  textStyle?: string;
  children?: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className={`flex flex-col items-center gap-2 rounded-lg p-4 shadow-md ${borderStyle || ""}`}
  >
    <h3 className={`w-full text-lg font-semibold ${textStyle || "text-gray-500"}`}>
      {title}
    </h3>
    <video width={320} height={662} autoPlay loop muted playsInline preload="none">
      <source src={videoSrc} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <h2 className={`text-center text-xl font-semibold ${textStyle || "text-gray-500"}`}>
      {latency}
    </h2>
    <p className={`text-center ${textStyle || "text-gray-400"}`}>{description}</p>
  </motion.div>
);

const VideoCallFloor = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div
      id="1"
      className="flex h-fit w-full flex-col items-center justify-center gap-24 bg-gray-100 p-48 text-center leading-relaxed"
    >
      {/* Заголовок */}
      <BlurIn>
        Разговаривайте по видео <br /> без задержек и зависаний
      </BlurIn>

      {/* Карточки */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex w-full max-w-screen-xl flex-row items-center justify-center gap-12"
      >
        <AnimatedCard
          title="4G и ниже"
          videoSrc="/video/atashka-4g.mp4"
          delay={0.2}
          latency="50-100 мс"
          description="Очень мешает при живом общении"
          borderStyle="border border-gray-200 bg-white"
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex items-center justify-center gap-12"
        >
          <AnimatedCard
            title=""
            videoSrc="/video/atashka-5g.mp4"
            delay={0.4}
            latency="до 5 мс"
            description="Комфортно разговаривать по видео"
            borderStyle="border-4 border-altel bg-white shadow-2xl shadow-altel/40"
            textStyle="text-altel"
          >
            <Image src="/img/altel.svg" width={132} height={28} alt="Logo" />
          </AnimatedCard>
        </motion.div>
      </motion.div>

      {/* Кнопка */}
      <motion.button
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.6 }}
        className="rounded-lg bg-altel px-8 py-4 text-lg text-white hover:bg-pink-500"
      >
        Подключить 5G
      </motion.button>
    </div>
  );
};

export default VideoCallFloor;

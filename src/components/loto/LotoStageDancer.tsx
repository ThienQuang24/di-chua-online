import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LotoChromaKeyVideo } from './LotoChromaKeyVideo';

export type LotoDanceStyle = 'fan' | 'hipshake' | 'disco' | 'robot' | 'troupe';

interface LotoStageDancerProps {
  danceStyle: LotoDanceStyle | null;
  donorName?: string;
  giftName?: string;
  customVideoUrl?: string;
  customIsGreenScreen?: boolean;
  onClose?: () => void;
  useVideo?: boolean;
}

const DANCE_CONFIGS: Record<
  LotoDanceStyle,
  {
    title: string;
    icon: string;
    animClass: string;
    model1: string;
    video1?: string;
    model2?: string;
    video2?: string;
    isGreenScreen?: boolean;
    tagline: string;
    glowColor: string;
  }
> = {
  fan: {
    title: 'Vũ Điệu Múa Quạt TikTok',
    icon: '🪭',
    animClass: 'animate-dance-fan',
    model1: '/assets/loto/dancers/dancer-fan.png',
    video1: '/assets/loto/dancers/dance-fan-sample.webm',
    model2: '/assets/loto/patron-2.png',
    tagline: 'Múa quạt dẻo quẹo theo nhịp beat cực sung!',
    glowColor: 'from-amber-400 via-rose-500 to-yellow-300',
  },
  hipshake: {
    title: 'Vũ Điệu Lắc Hông Bốc Lửa',
    icon: '💃',
    animClass: 'animate-dance-hipshake',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    model2: '/assets/nhau/patron-female-1.png',
    tagline: 'Lắc hông bốc lửa khuấy động cả khán phòng!',
    glowColor: 'from-pink-500 via-purple-500 to-rose-400',
  },
  disco: {
    title: 'Vũ Điệu Disco Quẩy Vinahouse',
    icon: '🕺',
    animClass: 'animate-dance-disco',
    model1: '/assets/loto/dancers/dancer-disco.png',
    video1: '/assets/loto/dancers/dance-disco-sample.webm',
    model2: '/assets/nhau/patron-1.png',
    tagline: 'Chỉ tay lên nóc nhà - Bắt trọn từng nhịp bass!',
    glowColor: 'from-cyan-400 via-blue-500 to-purple-500',
  },
  robot: {
    title: 'Vũ Điệu Robot Hiphop Pop-Lock',
    icon: '🤖',
    animClass: 'animate-dance-robot',
    model1: '/assets/loto/dancers/dancer-hiphop.png',
    model2: '/assets/loto/patron-1.png',
    tagline: 'Giật cơ bắp pop & lock cực chất đường phố!',
    glowColor: 'from-emerald-400 via-teal-500 to-lime-400',
  },
  troupe: {
    title: 'Vũ Đoàn Hội Chợ Đồng Diễn',
    icon: '👯‍♀️',
    animClass: 'animate-dance-fan',
    model1: '/assets/loto/dancers/dancer-fan.png',
    video1: '/assets/loto/dancers/dance-fan-sample.webm',
    model2: '/assets/loto/dancers/dancer-disco.png',
    video2: '/assets/loto/dancers/dance-disco-sample.webm',
    tagline: 'Vũ đoàn đồng diễn 2 bên sân khấu tưng bừng hội chợ!',
    glowColor: 'from-yellow-400 via-red-500 to-pink-500',
  },
};

export const LotoStageDancer: React.FC<LotoStageDancerProps> = ({
  danceStyle,
  donorName,
  giftName,
  customVideoUrl,
  customIsGreenScreen,
  onClose,
  useVideo = true,
}) => {
  if (!danceStyle) return null;

  const cfg = DANCE_CONFIGS[danceStyle] || DANCE_CONFIGS.fan;
  const isDuo = danceStyle === 'troupe';
  const activeVideo1 = customVideoUrl || (useVideo ? cfg.video1 : undefined);
  const activeIsGreen = customIsGreenScreen !== undefined ? customIsGreenScreen : cfg.isGreenScreen;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="absolute inset-x-0 top-[37%] z-30 flex flex-col items-center pointer-events-none select-none"
      >
        {/* 1. BADGE ĐIỆU NHẢY */}
        <div className="flex items-center gap-1.5 px-3 py-0.5 mb-1 rounded-full bg-black/90 border border-yellow-300/90 shadow-[0_0_15px_rgba(245,158,11,0.7)] backdrop-blur-md pointer-events-auto">
          <span className="text-xs animate-bounce">{cfg.icon}</span>
          <span className="text-[9.5px] font-black uppercase text-yellow-300 tracking-wider">
            {cfg.title}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-1 w-3.5 h-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[8px] text-slate-300 flex items-center justify-center border border-slate-600"
              title="Đóng vũ công"
            >
              ✕
            </button>
          )}
        </div>

        {/* 2. SÂN KHẤU VŨ CÔNG BIỂU DIỄN (BỤC GỖ NEON RỰC RỠ) */}
        <div className="relative w-full max-w-[380px] h-[165px] flex items-end justify-center pointer-events-none">
          {/* Vòng sàn nhảy neon tỏa sáng trên mặt gỗ sân khấu */}
          <div className="absolute bottom-1 w-44 h-9 rounded-[50%] bg-gradient-to-r from-yellow-500/30 via-red-500/40 to-pink-500/30 blur-md animate-pulse" />
          <div className="absolute bottom-1 w-36 h-7 rounded-[50%] border-2 border-yellow-300/80 shadow-[0_0_15px_rgba(253,224,71,0.8)]" />

          {/* Tia đèn rọi sân khấu (Spotlights) 2 bên */}
          <div className="absolute -top-10 left-6 w-32 h-44 bg-gradient-to-b from-yellow-300/25 to-transparent transform -rotate-25 pointer-events-none animate-spotlight-glow" />
          <div className="absolute -top-10 right-6 w-32 h-44 bg-gradient-to-b from-pink-400/25 to-transparent transform rotate-25 pointer-events-none animate-spotlight-glow" />

          {/* Nốt nhạc & hoa tuyết bay quanh vũ công */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {['🎵', '✨', '🪭', '🔥', '💃', '🎶'].map((sym, i) => (
              <span
                key={i}
                className="absolute text-xs animate-bounce"
                style={{
                  left: `${20 + (i * 14) % 60}%`,
                  top: `${10 + (i * 18) % 60}%`,
                  animationDuration: `${1 + (i % 3) * 0.4}s`,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                {sym}
              </span>
            ))}
          </div>

          {/* VŨ CÔNG TRÊN SÂN KHẤU (HỖ TRỢ CẢ VIDEO CHUYỂN ĐỘNG THẬT & MÔ HÌNH ẢNH 3D) */}
          {isDuo ? (
            <div className="flex items-end justify-center gap-12 w-full z-10">
              {/* Vũ công trái */}
              <div className={`relative w-28 h-38 flex items-end justify-center ${activeVideo1 ? '' : cfg.animClass}`}>
                <LotoChromaKeyVideo
                  videoSrc={activeVideo1}
                  fallbackImage={cfg.model1}
                  alt="Vũ công 1"
                  isGreenScreen={activeIsGreen}
                  className="w-full h-full"
                />
              </div>

              {/* Vũ công phải */}
              <div
                className={`relative w-28 h-38 flex items-end justify-center ${useVideo && (cfg.video2 || cfg.video1) ? '' : cfg.animClass}`}
                style={{ animationDelay: '0.2s', transform: 'scaleX(-1)' }}
              >
                <LotoChromaKeyVideo
                  videoSrc={useVideo ? (cfg.video2 || cfg.video1) : undefined}
                  fallbackImage={cfg.model2 || cfg.model1}
                  alt="Vũ công 2"
                  isGreenScreen={cfg.isGreenScreen}
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            /* Vũ công chính giữa */
            <div className={`relative w-36 h-40 flex items-end justify-center z-10 ${activeVideo1 ? '' : cfg.animClass}`}>
              <LotoChromaKeyVideo
                videoSrc={activeVideo1}
                fallbackImage={cfg.model1}
                alt={cfg.title}
                isGreenScreen={activeIsGreen}
                className="w-full h-full"
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

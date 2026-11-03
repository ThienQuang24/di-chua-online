import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LotoChromaKeyVideo } from './LotoChromaKeyVideo';
import { LotoThreeDancer } from './LotoThreeDancer';
import type { LotoDanceStyle } from '../../services/loto/lotoEngine';

export type { LotoDanceStyle };

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
    model3d?: string;
    anim3d?: string;
    isGreenScreen?: boolean;
    tagline: string;
    glowColor: string;
  }
> = {
  // 1. VIDEO 1 GỐC - ANIME CHIKA DANCE (GIỮ NGUYÊN THEO YÊU CẦU NGƯỜI DÙNG)
  anime: {
    title: 'Anime Chika (Vẫy Tay Lắc Hông)',
    icon: '🎀',
    animClass: 'animate-dance-hipshake',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-anime.webm',
    tagline: 'Chika vẫy tay uốn lượn, lắc hông nhảy múa cực điêu luyện!',
    glowColor: 'from-pink-500 via-rose-400 to-purple-500',
  },

  // 2. VIDEO MỚI 2 - ANIME CHIKA XOAY VÒNG BƯỚC NHẢY
  chika_spin: {
    title: 'Anime Chika (Xoay Vòng Nhún Nhảy)',
    icon: '🌸',
    animClass: 'animate-dance-disco',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-chika-spin.webm',
    tagline: 'Chika xoay váy nhún nhảy cực dễ thương theo nhịp beat!',
    glowColor: 'from-rose-400 via-pink-400 to-amber-300',
  },

  // 3. VIDEO MỚI 3 - ANIME WAIFU ALICE HAPPY HANDS 4K
  alice: {
    title: 'Anime Alice (Vũ Điệu Happy Hands)',
    icon: '🐰',
    animClass: 'animate-dance-fan',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-alice.webm',
    tagline: 'Waifu Alice tai thỏ nhảy điệu Happy Hands siêu hot!',
    glowColor: 'from-pink-400 via-fuchsia-500 to-rose-300',
  },

  // 4. VIDEO MỚI 4 - ANIME WAIFU RAIKOU QUẨY KIẾM MMD
  waifu_mmd: {
    title: 'Anime Waifu Raikou (Quẩy Kiếm MMD)',
    icon: '⚔️',
    animClass: 'animate-dance-disco',
    model1: '/assets/loto/dancers/dancer-disco.png',
    video1: '/assets/loto/dancers/dance-waifu-mmd.webm',
    tagline: 'Waifu quý phái mang kiếm nhảy điệu 3D MMD điêu nghệ!',
    glowColor: 'from-purple-500 via-indigo-400 to-pink-500',
  },

  // 5. VIDEO MỚI 5 - CHÚ MÈO TIKTOK 2 CHÂN SIÊU MEME
  cat_meme: {
    title: 'Chú Mèo TikTok (Meme Đứng 2 Chân)',
    icon: '🐱',
    animClass: 'animate-dance-robot',
    model1: '/assets/loto/dancers/dancer-fan.png',
    video1: '/assets/loto/dancers/dance-cat-meme.webm',
    tagline: 'Chú mèo đứng 2 chân uốn éo lắc lư làm khán trường cười nghiêng ngả!',
    glowColor: 'from-amber-400 via-orange-500 to-yellow-300',
  },

  // 6. VIDEO MỚI 6 - ANIME WAIFU ALTERA LẮC HÔNG BỐC LỬA
  altera: {
    title: 'Anime Waifu Altera (Lắc Hông Bốc Lửa)',
    icon: '💃',
    animClass: 'animate-dance-hipshake',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-altera.webm',
    tagline: 'Vũ điệu lắc hông Good Civilization bùng cháy sân khấu!',
    glowColor: 'from-emerald-400 via-teal-400 to-yellow-400',
  },

  // 7. VŨ ĐOÀN ĐỒNG DIỄN SONG CA (CHIKA + ALICE)
  troupe: {
    title: 'Song Ca Waifu (Chika & Alice Đồng Diễn)',
    icon: '👯‍♀️',
    animClass: 'animate-dance-fan',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-anime.webm',
    model2: '/assets/loto/dancers/dancer-female-flair.png',
    video2: '/assets/loto/dancers/dance-alice.webm',
    tagline: 'Cặp đôi Chika & Alice cùng quẩy tưng bừng 2 bên sân khấu!',
    glowColor: 'from-yellow-400 via-pink-500 to-rose-500',
  },

  // CÁC MÃ ĐIỆU NHẢY TƯƠNG THÍCH CŨ (ĐỀU ĐƯỢC CHUYỂN SANG CÁC VIDEO THẬT MỚI TOANH)
  fan: {
    title: 'Anime Chika (Xoay Vòng Nhún Nhảy)',
    icon: '🪭',
    animClass: 'animate-dance-fan',
    model1: '/assets/loto/dancers/dancer-fan.png',
    video1: '/assets/loto/dancers/dance-chika-spin.webm',
    tagline: 'Chika xoay váy nhún nhảy cực dễ thương theo nhịp beat!',
    glowColor: 'from-amber-400 via-rose-500 to-yellow-300',
  },
  hipshake: {
    title: 'Anime Waifu Altera (Lắc Hông Bốc Lửa)',
    icon: '💃',
    animClass: 'animate-dance-hipshake',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-altera.webm',
    tagline: 'Lắc hông bốc lửa khuấy động cả khán phòng!',
    glowColor: 'from-pink-500 via-purple-500 to-rose-400',
  },
  disco: {
    title: 'Anime Alice (Vũ Điệu Happy Hands)',
    icon: '🕺',
    animClass: 'animate-dance-disco',
    model1: '/assets/loto/dancers/dancer-disco.png',
    video1: '/assets/loto/dancers/dance-alice.webm',
    tagline: 'Waifu Alice tai thỏ nhảy điệu Happy Hands siêu hot!',
    glowColor: 'from-cyan-400 via-blue-500 to-purple-500',
  },
  robot: {
    title: 'Anime Waifu Raikou (Quẩy Kiếm MMD)',
    icon: '⚔️',
    animClass: 'animate-dance-robot',
    model1: '/assets/loto/dancers/dancer-hiphop.png',
    video1: '/assets/loto/dancers/dance-waifu-mmd.webm',
    tagline: 'Waifu quý phái mang kiếm nhảy điệu 3D MMD điêu nghệ!',
    glowColor: 'from-emerald-400 via-teal-500 to-lime-400',
  },
  baga: {
    title: 'Chú Mèo TikTok (Meme Đứng 2 Chân)',
    icon: '🐱',
    animClass: 'animate-dance-disco',
    model1: '/assets/nhau/patron-uncle-1.png',
    video1: '/assets/loto/dancers/dance-cat-meme.webm',
    tagline: 'Chú mèo đứng 2 chân uốn éo lắc lư làm khán trường cười nghiêng ngả!',
    glowColor: 'from-amber-400 via-orange-500 to-red-500',
  },
  vica: {
    title: 'Anime Waifu Raikou (Quẩy Kiếm MMD)',
    icon: '⚔️',
    animClass: 'animate-dance-disco',
    model1: '/assets/nhau/patron-1.png',
    video1: '/assets/loto/dancers/dance-waifu-mmd.webm',
    tagline: 'Waifu quý phái mang kiếm nhảy điệu 3D MMD điêu nghệ!',
    glowColor: 'from-blue-400 via-indigo-500 to-purple-500',
  },
  stickmin: {
    title: 'Chú Mèo TikTok (Meme Đứng 2 Chân)',
    icon: '🐱',
    animClass: 'animate-dance-disco',
    model1: '/assets/loto/dancers/dancer-hiphop.png',
    video1: '/assets/loto/dancers/dance-cat-meme.webm',
    tagline: 'Chú mèo đứng 2 chân uốn éo lắc lư!',
    glowColor: 'from-cyan-400 via-emerald-400 to-yellow-400',
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
        className="absolute inset-x-0 top-[33%] z-30 flex flex-col items-center pointer-events-none select-none"
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
            /* Vũ công chính giữa: Ưu tiên mô hình 3D rigged chuyển động thật nếu có */
            <div className={`relative w-40 h-44 flex items-end justify-center z-10`}>
              {cfg.model3d ? (
                <LotoThreeDancer
                  modelUrl={cfg.model3d}
                  animationName={cfg.anim3d || 'Dance'}
                  fallbackImage={cfg.model1}
                  className="w-full h-full"
                  scale={1.1}
                  yOffset={-0.6}
                />
              ) : (
                <div className={`w-full h-full flex items-end justify-center ${activeVideo1 ? '' : cfg.animClass}`}>
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
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

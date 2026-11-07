import type { LotoDanceStyle } from '../../services/loto/lotoEngine';

export interface DanceConfig {
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

export const DANCE_CONFIGS: Record<LotoDanceStyle, DanceConfig> = {
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

  // 2. TREND TIKTOK 1 - VŨ ĐOÀN K-POP 3 NGƯỜI ("HOW IT'S DONE" DANCE)
  kpop_trio: {
    title: 'Vũ Đoàn K-Pop 3 Người (Hot Trend TikTok)',
    icon: '✨',
    animClass: 'animate-dance-fan',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-kpop-trio.webm',
    tagline: 'Trio 3 vũ công K-Pop đồng diễn vũ điệu triệu view cực bốc!',
    glowColor: 'from-fuchsia-500 via-pink-400 to-purple-600',
  },

  // 3. TREND TIKTOK 2 - ERLING HAALAND BRAZILIAN PHONK DANCE
  haaland: {
    title: 'Haaland Phonk Dance (Bóng Đá TikTok)',
    icon: '⚡',
    animClass: 'animate-dance-disco',
    model1: '/assets/loto/dancers/dancer-hiphop.png',
    video1: '/assets/loto/dancers/dance-haaland.webm',
    tagline: 'Siêu tiền đạo Haaland nhảy điệu Brazilian Phonk cực ngầu!',
    glowColor: 'from-red-500 via-rose-500 to-amber-400',
  },

  // 4. TREND TIKTOK 3 - TOC TOC DANCE (VŨ ĐIỆU SOÁI CA)
  toctoc: {
    title: 'Toc Toc Dance (Vũ Điệu Soái Ca)',
    icon: '🕺',
    animClass: 'animate-dance-disco',
    model1: '/assets/loto/dancers/dancer-disco.png',
    video1: '/assets/loto/dancers/dance-toctoc.webm',
    tagline: 'Vũ điệu Toc Toc Dance TikTok đảo chân uốn éo siêu cuốn!',
    glowColor: 'from-blue-500 via-cyan-400 to-indigo-500',
  },

  // 5. TREND TIKTOK 4 - CHÚ MÈO ĐỨNG 2 CHÂN (MEME TRIỆU VIEW)
  cat_meme: {
    title: 'Chú Mèo TikTok (Meme Đứng 2 Chân)',
    icon: '🐱',
    animClass: 'animate-dance-robot',
    model1: '/assets/loto/dancers/dancer-fan.png',
    video1: '/assets/loto/dancers/dance-cat-meme.webm',
    tagline: 'Chú mèo đứng 2 chân uốn éo lắc lư làm khán trường cười nghiêng ngả!',
    glowColor: 'from-amber-400 via-orange-500 to-yellow-300',
  },

  // 6. TREND TIKTOK 5 - CẶP ĐÔI CÁ SẤU LẮC HÔNG (SMOOTH CRIMINAL)
  croc_duo: {
    title: 'Cặp Đôi Cá Sấu (Lắc Hông Siêu Bựa)',
    icon: '🐊',
    animClass: 'animate-dance-hipshake',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-croc-duo.webm',
    tagline: '2 chú cá sấu đứng lắc hông uốn lượn siêu hài hước!',
    glowColor: 'from-emerald-400 via-teal-400 to-lime-400',
  },

  // 7. VŨ ĐOÀN ĐỒNG DIỄN SONG CA (K-POP TRIO + CHIKA)
  troupe: {
    title: 'Đại Hội Vũ Đoàn (K-Pop & Chika Đồng Diễn)',
    icon: '👯‍♀️',
    animClass: 'animate-dance-fan',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-kpop-trio.webm',
    model2: '/assets/loto/dancers/dancer-female-flair.png',
    video2: '/assets/loto/dancers/dance-anime.webm',
    tagline: 'Vũ đoàn K-Pop kết hợp Chika bung nóc 2 bên sân khấu!',
    glowColor: 'from-yellow-400 via-pink-500 to-rose-500',
  },

  // CÁC MÃ DỰ PHÒNG TƯƠNG THÍCH (CŨNG DÙNG VIDEO TREND THẬT)
  chika_spin: {
    title: 'Anime Chika (Xoay Vòng Nhún Nhảy)',
    icon: '🌸',
    animClass: 'animate-dance-disco',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-chika-spin.webm',
    tagline: 'Chika xoay váy nhún nhảy cực dễ thương theo nhịp beat!',
    glowColor: 'from-rose-400 via-pink-400 to-amber-300',
  },
  alice: {
    title: 'Anime Alice (Vũ Điệu Happy Hands)',
    icon: '🐰',
    animClass: 'animate-dance-fan',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-alice.webm',
    tagline: 'Waifu Alice tai thỏ nhảy điệu Happy Hands siêu hot!',
    glowColor: 'from-pink-400 via-fuchsia-500 to-rose-300',
  },
  waifu_mmd: {
    title: 'Anime Waifu Raikou (Quẩy Kiếm MMD)',
    icon: '⚔️',
    animClass: 'animate-dance-disco',
    model1: '/assets/loto/dancers/dancer-disco.png',
    video1: '/assets/loto/dancers/dance-waifu-mmd.webm',
    tagline: 'Waifu quý phái mang kiếm nhảy điệu 3D MMD điêu nghệ!',
    glowColor: 'from-purple-500 via-indigo-400 to-pink-500',
  },
  altera: {
    title: 'Anime Waifu Altera (Lắc Hông Bốc Lửa)',
    icon: '💃',
    animClass: 'animate-dance-hipshake',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-altera.webm',
    tagline: 'Vũ điệu lắc hông Good Civilization bùng cháy sân khấu!',
    glowColor: 'from-emerald-400 via-teal-400 to-yellow-400',
  },
  fan: {
    title: 'Vũ Đoàn K-Pop 3 Người (Hot Trend TikTok)',
    icon: '✨',
    animClass: 'animate-dance-fan',
    model1: '/assets/loto/dancers/dancer-fan.png',
    video1: '/assets/loto/dancers/dance-kpop-trio.webm',
    tagline: 'Trio 3 vũ công K-Pop đồng diễn vũ điệu triệu view!',
    glowColor: 'from-amber-400 via-rose-500 to-yellow-300',
  },
  hipshake: {
    title: 'Haaland Phonk Dance (Bóng Đá TikTok)',
    icon: '⚡',
    animClass: 'animate-dance-hipshake',
    model1: '/assets/loto/dancers/dancer-female-flair.png',
    video1: '/assets/loto/dancers/dance-haaland.webm',
    tagline: 'Siêu tiền đạo Haaland nhảy Brazilian Phonk cực sung!',
    glowColor: 'from-pink-500 via-purple-500 to-rose-400',
  },
  disco: {
    title: 'Toc Toc Dance (Vũ Điệu Soái Ca)',
    icon: '🕺',
    animClass: 'animate-dance-disco',
    model1: '/assets/loto/dancers/dancer-disco.png',
    video1: '/assets/loto/dancers/dance-toctoc.webm',
    tagline: 'Vũ điệu Toc Toc Dance TikTok cực thịnh hành!',
    glowColor: 'from-cyan-400 via-blue-500 to-purple-500',
  },
  robot: {
    title: 'Cặp Đôi Cá Sấu (Lắc Hông Siêu Bựa)',
    icon: '🐊',
    animClass: 'animate-dance-robot',
    model1: '/assets/loto/dancers/dancer-hiphop.png',
    video1: '/assets/loto/dancers/dance-croc-duo.webm',
    tagline: '2 chú cá sấu đứng lắc hông uốn lượn siêu hài hước!',
    glowColor: 'from-emerald-400 via-teal-500 to-lime-400',
  },
  baga: {
    title: 'Chú Mèo TikTok (Meme Đứng 2 Chân)',
    icon: '🐱',
    animClass: 'animate-dance-disco',
    model1: '/assets/nhau/patron-uncle-1.png',
    video1: '/assets/loto/dancers/dance-cat-meme.webm',
    tagline: 'Chú mèo đứng 2 chân uốn éo lắc lư!',
    glowColor: 'from-amber-400 via-orange-500 to-red-500',
  },
  vica: {
    title: 'Haaland Phonk Dance (Bóng Đá TikTok)',
    icon: '⚡',
    animClass: 'animate-dance-disco',
    model1: '/assets/nhau/patron-1.png',
    video1: '/assets/loto/dancers/dance-haaland.webm',
    tagline: 'Haaland quẩy nhiệt tình trên sân khấu!',
    glowColor: 'from-blue-400 via-indigo-500 to-purple-500',
  },
  stickmin: {
    title: 'Toc Toc Dance (Vũ Điệu Soái Ca)',
    icon: '🕺',
    animClass: 'animate-dance-disco',
    model1: '/assets/loto/dancers/dancer-hiphop.png',
    video1: '/assets/loto/dancers/dance-toctoc.webm',
    tagline: 'Vũ điệu Toc Toc Dance TikTok cực sung!',
    glowColor: 'from-cyan-400 via-emerald-400 to-yellow-400',
  },
};

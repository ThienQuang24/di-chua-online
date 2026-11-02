import React from 'react';
import { motion } from 'motion/react';
import { Devotee } from '../../types/temple';

export const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export interface SeatPos {
  x: number;
  y: number;
  scale: number;
  flip?: boolean;
  modelIndex: number;
}

const ALL_PATRON_MODELS = [
  '/assets/nhau/patron-uncle-1.png',   // 0: Chú Ba áo ba lỗ, bia hơi
  '/assets/nhau/patron-female-1.png',  // 1: Bạn nữ trẻ trung áo pastel
  '/assets/nhau/patron-1.png',         // 2: Thanh niên áo thun streetwear
  '/assets/nhau/patron-female-2.png',  // 3: Cô gái tóc đuôi ngựa nâng ly
  '/assets/nhau/patron-2.png',         // 4: Thanh niên áo hoa nhiệt đới
  '/assets/nhau/patron-3.png',         // 5: Thanh niên nón kết áo khoác
];

const DEFAULT_AVATAR_PROFILES = [
  { bg: 'from-rose-500 to-pink-600', icon: '👧' },
  { bg: 'from-sky-500 to-blue-700', icon: '👦' },
  { bg: 'from-amber-500 to-orange-600', icon: '👨' },
  { bg: 'from-emerald-500 to-teal-700', icon: '👩' },
  { bg: 'from-violet-500 to-purple-700', icon: '😎' },
  { bg: 'from-fuchsia-500 to-pink-700', icon: '🧢' },
  { bg: 'from-orange-500 to-red-600', icon: '🍺' },
  { bg: 'from-yellow-400 to-amber-600', icon: '✨' },
];

interface NhauPatronProps {
  devotee: Devotee;
  isCheering: boolean;
  isDiscoMode?: boolean;
  isBirthdayPerson?: boolean;
  seatPos: SeatPos;
}

export const NhauPatron: React.FC<NhauPatronProps> = ({
  devotee,
  isCheering,
  isDiscoMode = false,
  isBirthdayPerson = false,
  seatPos,
}) => {
  const seed = hash(devotee.username);
  // Pick model by seat index + user seed for maximum diversity (no duplicates per table)
  const modelIdx = (seatPos.modelIndex + seed) % ALL_PATRON_MODELS.length;
  const sprite = ALL_PATRON_MODELS[modelIdx];
  const avatarProfile = DEFAULT_AVATAR_PROFILES[seed % DEFAULT_AVATAR_PROFILES.length];
  const isNew = Date.now() - devotee.joinedAt < 2500;
  const isFlipped = seatPos.flip ?? false;

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center select-none pointer-events-none"
      style={{
        left: `${seatPos.x}%`,
        top: `${seatPos.y}%`,
        zIndex: Math.round(seatPos.y * 10),
      }}
      initial={false}
      animate={{
        opacity: 1,
        y: isCheering ? -8 : isDiscoMode ? [-3, 2, -3] : 0,
        scale: isCheering ? seatPos.scale * 1.08 : isDiscoMode ? seatPos.scale * 1.03 : seatPos.scale,
      }}
      transition={{
        duration: isDiscoMode ? 0.48 : 0.35,
        repeat: isDiscoMode ? Infinity : 0,
        ease: 'easeInOut',
      }}
    >
      {/* 1. BONG BÓNG CHAT HOẶC HÔ DÔ HOẶC SINH NHẬT */}
      <div className="flex flex-col items-center mb-0.5 z-40">
        {isBirthdayPerson ? (
          <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border border-yellow-300 text-[8px] font-black text-white shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-bounce whitespace-nowrap">
            👑 SINH NHẬT TÔI NHA! 🎂
          </div>
        ) : isCheering ? (
          <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border border-yellow-300 text-[8px] font-black text-white shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-bounce whitespace-nowrap">
            🍻 1 2 3 DÔ!
          </div>
        ) : devotee.activeComment ? (
          <div className="max-w-[110px] px-2 py-0.5 rounded-lg bg-black/85 border border-amber-500/60 text-[8px] text-amber-200 shadow-lg truncate text-center backdrop-blur-sm animate-in fade-in">
            {devotee.activeComment}
          </div>
        ) : null}
      </div>

      {/* 2. KHUNG HÌNH NHÂN VẬT 3D VÀ AVATAR TIKTOK GẮN GỌN GÀNG TRÊN ĐẦU */}
      <div className="relative w-20 h-24 flex items-end justify-center">
        {/* Avatar TikTok đặt sát ngay trên đỉnh đầu nhân vật (không bay lơ lửng) */}
        <div className="absolute top-[-10px] z-30 flex flex-col items-center">
          {isBirthdayPerson && (
            <span className="absolute -top-3.5 text-xs animate-bounce z-40 filter drop-shadow">
              👑
            </span>
          )}
          <div className={`w-6 h-6 rounded-full border ${isBirthdayPerson ? 'border-amber-300 ring-2 ring-yellow-400' : 'border-yellow-400'} p-[1px] bg-black/80 shadow-[0_0_6px_rgba(245,158,11,0.6)] overflow-hidden flex items-center justify-center`}>
            {devotee.avatarUrl ? (
              <img
                src={devotee.avatarUrl}
                alt={devotee.displayName}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full rounded-full bg-gradient-to-tr ${avatarProfile.bg} text-[11px] flex items-center justify-center shadow-inner`}
              >
                <span>{avatarProfile.icon}</span>
              </div>
            )}
          </div>
          {isCheering && (
            <span className="absolute -top-2 -right-1 text-[9px] animate-ping">
              ✨
            </span>
          )}
        </div>

        {/* Bóng đổ tròn mềm dưới nền bê tông */}
        <div className="absolute -bottom-1 w-14 h-4 bg-black/60 rounded-[50%] blur-[3px]" />

        {/* Sprite nhân vật 3D chân thực */}
        <div
          className="w-full h-full flex items-end justify-center"
          style={{ transform: isFlipped ? 'scaleX(-1)' : 'none' }}
        >
          <img
            src={sprite}
            alt={devotee.displayName}
            className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
            loading="eager"
          />
        </div>
      </div>

      {/* 3. TÊN BỢM NHẬU (PILL GỌN GÀNG SANG TRỌNG DƯỚI CHÂN) */}
      <div className="mt-[-2px] z-20 px-1.5 py-[1px] rounded-full bg-black/85 border border-amber-500/40 text-[7.5px] font-bold text-amber-200 shadow-md text-center truncate max-w-[80px] backdrop-blur-xs">
        {devotee.displayName}
      </div>
    </motion.div>
  );
};

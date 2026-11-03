import React from 'react';
import { motion } from 'motion/react';
import { Devotee } from '../../types/temple';
import { lotoEngine } from '../../services/loto/lotoEngine';

export type LotoDanceTier = 'rose' | 'icecream' | 'crown' | 'rocket' | null;

interface LotoFairCrowdProps {
  devotees: Devotee[];
  currentNumber: number | null;
  onSelectPlayer?: (username: string) => void;
  activeDanceTier?: LotoDanceTier;
}

// 6 diverse 3D character models for the festival crowd
const FAIR_MODELS = [
  '/assets/loto/patron-1.png',        // 0: Khán giả nam chăm chú dò vé
  '/assets/loto/patron-2.png',        // 1: Khán giả giơ vé hô Kinh
  '/assets/nhau/patron-female-1.png', // 2: Bạn nữ trẻ trung áo pastel
  '/assets/nhau/patron-female-2.png', // 3: Bạn nữ nâng ly / vẫy tay
  '/assets/nhau/patron-1.png',        // 4: Thanh niên áo thun streetwear
  '/assets/nhau/patron-uncle-1.png',  // 5: Chú trung niên vui tính
];

const DEFAULT_AVATARS = [
  { bg: 'from-rose-500 to-pink-600', icon: '👧' },
  { bg: 'from-sky-500 to-blue-700', icon: '👦' },
  { bg: 'from-amber-500 to-orange-600', icon: '👨' },
  { bg: 'from-emerald-500 to-teal-700', icon: '👩' },
  { bg: 'from-violet-500 to-purple-700', icon: '😎' },
  { bg: 'from-fuchsia-500 to-pink-700', icon: '🧢' },
  { bg: 'from-orange-500 to-red-600', icon: '🥳' },
  { bg: 'from-yellow-400 to-amber-600', icon: '✨' },
];

// 16 seats arranged in 3 curved rows on the fairground floor (below stage, y: 70% - 90%)
// Completely separated from stage cage and chant banner (y: 18% - 50%)
const FAIR_SEATS = [
  // Hàng 1 (phía sau hội trường, cách xa chân sân khấu) - 5 chỗ
  { x: 18, y: 70, scale: 0.82, flip: false, modelIdx: 0 },
  { x: 34, y: 71, scale: 0.84, flip: false, modelIdx: 2 },
  { x: 50, y: 72, scale: 0.86, flip: false, modelIdx: 1 },
  { x: 66, y: 71, scale: 0.84, flip: true,  modelIdx: 3 },
  { x: 82, y: 70, scale: 0.82, flip: true,  modelIdx: 4 },

  // Hàng 2 (hàng giữa sân hội chợ) - 6 chỗ
  { x: 13, y: 80, scale: 0.90, flip: false, modelIdx: 5 },
  { x: 28, y: 81, scale: 0.92, flip: false, modelIdx: 0 },
  { x: 43, y: 82, scale: 0.94, flip: false, modelIdx: 2 },
  { x: 57, y: 82, scale: 0.94, flip: true,  modelIdx: 1 },
  { x: 72, y: 81, scale: 0.92, flip: true,  modelIdx: 3 },
  { x: 87, y: 80, scale: 0.90, flip: true,  modelIdx: 4 },

  // Hàng 3 (tiền cảnh, gần người xem nhất) - 5 chỗ
  { x: 16, y: 89, scale: 1.00, flip: false, modelIdx: 1 },
  { x: 33, y: 90, scale: 1.02, flip: false, modelIdx: 2 },
  { x: 50, y: 91, scale: 1.05, flip: false, modelIdx: 0 },
  { x: 67, y: 90, scale: 1.02, flip: true,  modelIdx: 4 },
  { x: 84, y: 89, scale: 1.00, flip: true,  modelIdx: 5 },
];

export const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const LotoFairCrowd: React.FC<LotoFairCrowdProps> = ({
  devotees,
  currentNumber,
  onSelectPlayer,
  activeDanceTier,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {FAIR_SEATS.map((seat, idx) => {
        const devotee = devotees[idx];
        if (!devotee) return null;

        const ticket = lotoEngine.getTicketForUser(devotee.username);
        const isWaitingKin = Boolean(ticket && ticket.waitingNumbers.length > 0 && !ticket.hasWon);
        const isWinner = Boolean(ticket && ticket.hasWon);
        const isNew = Date.now() - devotee.joinedAt < 2500;
        const seed = hash(devotee.username);

        const justMatched =
          ticket &&
          currentNumber !== null &&
          ticket.grid.some((row) => row.some((c) => c.val === currentNumber));

        // Use cheering sprite if winning or waiting for Kinh, or during active dance
        const isDancing = Boolean(activeDanceTier);
        const modelIndex = isWinner || isWaitingKin || isDancing ? 1 : (seat.modelIdx + seed) % FAIR_MODELS.length;
        const sprite = FAIR_MODELS[modelIndex];
        const avatarProfile = DEFAULT_AVATARS[seed % DEFAULT_AVATARS.length];
        const isFlipped = seat.flip;

        const danceAnimClass =
          activeDanceTier === 'rocket'
            ? 'animate-bounce scale-125 drop-shadow-[0_0_15px_rgba(239,68,68,0.9)]'
            : activeDanceTier === 'crown'
            ? 'animate-bounce scale-115 drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]'
            : activeDanceTier === 'icecream'
            ? 'animate-bounce scale-110'
            : activeDanceTier === 'rose'
            ? 'animate-pulse scale-105'
            : '';

        return (
          <motion.div
            key={devotee.id}
            onClick={() => onSelectPlayer?.(devotee.username)}
            className={`
              absolute -translate-x-1/2 -translate-y-full flex flex-col items-center cursor-pointer pointer-events-auto transition-all duration-300
              ${isWaitingKin ? 'animate-bounce' : ''}
              ${isWinner ? 'scale-125' : 'hover:scale-105'}
              ${danceAnimClass}
            `}
            style={{
              left: `${seat.x}%`,
              top: `${seat.y}%`,
              transform: `translate(-50%, -100%) scale(${seat.scale})`,
              zIndex: isWinner ? 60 : isWaitingKin ? 50 : Math.round(seat.y * 10),
            }}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 1. HUY HIỆU CẢM XÚC TRÊN ĐẦU (CHỜ KINH / DÍNH SỐ / KINH / CHAT) */}
            <div className="flex flex-col items-center mb-0.5 z-30">
              {isWinner ? (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-[8px] font-black text-white shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-bounce whitespace-nowrap">
                  👑 KINH RỒI!
                </span>
              ) : isWaitingKin && ticket ? (
                <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-[7px] font-extrabold text-yellow-200 shadow-md whitespace-nowrap animate-pulse">
                  🔥 Chờ {ticket.waitingNumbers.slice(0, 2).map((n) => (n < 10 ? `0${n}` : n)).join(',')}
                </span>
              ) : activeDanceTier ? (
                <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-[7px] font-black text-slate-950 shadow-md animate-bounce whitespace-nowrap">
                  {activeDanceTier === 'rocket'
                    ? '🚀 QUẨY TỚI BẾN!'
                    : activeDanceTier === 'crown'
                    ? '👑 ĐẠI GIA QUẨY!'
                    : activeDanceTier === 'icecream'
                    ? '🍦 NHÚN NHẢY NÀO!'
                    : '🌹 HOA HỒNG TƯƠI!'}
                </span>
              ) : justMatched ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-[7px] font-bold text-slate-950 shadow animate-ping whitespace-nowrap">
                  🎯 Dính số!
                </span>
              ) : devotee.activeComment ? (
                <span className="px-1.5 py-0.5 rounded-lg bg-black/85 border border-amber-500/50 text-[7.5px] text-amber-200 truncate max-w-[85px] shadow">
                  {devotee.activeComment}
                </span>
              ) : null}
            </div>

            {/* 2. KHUNG NHÂN VẬT & AVATAR GẮN GỌN GÀNG SÁT ĐỈNH ĐẦU */}
            <div className="relative w-16 h-20 flex items-end justify-center">
              {/* Avatar TikTok nhỏ xinh tinh tế sát đỉnh đầu */}
              <div className="absolute top-[-8px] z-20 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full border border-yellow-400 p-[0.5px] bg-black/80 shadow-[0_0_6px_rgba(245,158,11,0.6)] overflow-hidden flex items-center justify-center">
                  {devotee.avatarUrl ? (
                    <img
                      src={devotee.avatarUrl}
                      alt={devotee.displayName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full rounded-full bg-gradient-to-tr ${avatarProfile.bg} text-[10px] flex items-center justify-center shadow-inner`}
                    >
                      <span>{avatarProfile.icon}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bóng đổ nền sàn hội chợ */}
              <div className="absolute -bottom-1 w-12 h-3.5 bg-black/60 rounded-[50%] blur-[2.5px]" />

              {/* Sprite nhân vật 3D cầm vé */}
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

            {/* 3. TÊN KHÁN GIẢ GỌN GÀNG DƯỚI CHÂN */}
            <div className="mt-[-1px] px-1.5 py-[0.5px] rounded-full bg-black/85 border border-amber-500/50 text-[7px] font-bold text-amber-200 shadow text-center truncate max-w-[65px] backdrop-blur-xs">
              {devotee.displayName}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

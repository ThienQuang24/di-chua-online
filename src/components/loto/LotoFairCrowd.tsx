import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Devotee } from '../../types/temple';
import { lotoEngine, LotoTicket } from '../../services/loto/lotoEngine';

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

/**
 * 31 SEATS ARRANGED IN 5 CURVED STADIUM ROWS (y: 58% - 90.5%)
 * Natural perspective depth: smaller in back (0.62), larger in front (1.02).
 * Completely unobstructed below the wooden stage (y: 33% - 53%) and above footer buttons (y: 93%+).
 */
export const FAIR_SEATS = [
  // HÀNG 1 (Sát chân bục gỗ sân khấu, y ~58-60%) - 6 chỗ (scale: 0.62)
  { x: 14, y: 58.0, scale: 0.62, flip: false, modelIdx: 0 },
  { x: 28, y: 59.0, scale: 0.63, flip: false, modelIdx: 2 },
  { x: 42, y: 59.8, scale: 0.64, flip: false, modelIdx: 1 },
  { x: 58, y: 59.8, scale: 0.64, flip: true,  modelIdx: 4 },
  { x: 72, y: 59.0, scale: 0.63, flip: true,  modelIdx: 3 },
  { x: 86, y: 58.0, scale: 0.62, flip: true,  modelIdx: 5 },

  // HÀNG 2 (Hàng sau trung tâm, y ~65-68%) - 7 chỗ (scale: 0.72)
  { x: 10, y: 65.5, scale: 0.71, flip: false, modelIdx: 5 },
  { x: 23, y: 66.5, scale: 0.72, flip: false, modelIdx: 0 },
  { x: 36, y: 67.5, scale: 0.73, flip: false, modelIdx: 2 },
  { x: 50, y: 68.0, scale: 0.74, flip: false, modelIdx: 1 },
  { x: 64, y: 67.5, scale: 0.73, flip: true,  modelIdx: 3 },
  { x: 77, y: 66.5, scale: 0.72, flip: true,  modelIdx: 4 },
  { x: 90, y: 65.5, scale: 0.71, flip: true,  modelIdx: 0 },

  // HÀNG 3 (Hàng giữa hội trường, y ~73-76%) - 7 chỗ (scale: 0.82)
  { x: 9,  y: 73.0, scale: 0.80, flip: false, modelIdx: 1 },
  { x: 22, y: 74.0, scale: 0.82, flip: false, modelIdx: 3 },
  { x: 36, y: 75.0, scale: 0.84, flip: false, modelIdx: 5 },
  { x: 50, y: 75.5, scale: 0.85, flip: false, modelIdx: 0 },
  { x: 64, y: 75.0, scale: 0.84, flip: true,  modelIdx: 2 },
  { x: 78, y: 74.0, scale: 0.82, flip: true,  modelIdx: 4 },
  { x: 91, y: 73.0, scale: 0.80, flip: true,  modelIdx: 1 },

  // HÀNG 4 (Hàng cận cảnh, y ~81-84%) - 6 chỗ (scale: 0.92)
  { x: 12, y: 81.0, scale: 0.90, flip: false, modelIdx: 4 },
  { x: 27, y: 82.0, scale: 0.92, flip: false, modelIdx: 2 },
  { x: 42, y: 83.0, scale: 0.94, flip: false, modelIdx: 0 },
  { x: 58, y: 83.0, scale: 0.94, flip: true,  modelIdx: 1 },
  { x: 73, y: 82.0, scale: 0.92, flip: true,  modelIdx: 3 },
  { x: 88, y: 81.0, scale: 0.90, flip: true,  modelIdx: 5 },

  // HÀNG 5 (Hàng tiền cảnh, y ~89-91%) - 5 chỗ (scale: 1.02)
  { x: 16, y: 89.0, scale: 1.00, flip: false, modelIdx: 1 },
  { x: 33, y: 90.0, scale: 1.02, flip: false, modelIdx: 0 },
  { x: 50, y: 90.8, scale: 1.04, flip: false, modelIdx: 2 },
  { x: 67, y: 90.0, scale: 1.02, flip: true,  modelIdx: 4 },
  { x: 84, y: 89.0, scale: 1.00, flip: true,  modelIdx: 3 },
];

/**
 * THỨ TỰ LẤP ĐẦY CHỖ NGỒI (SEAT FILL ORDER):
 * Khi có ít người (4-8 người), ưu tiên ngồi hàng tiền cảnh & trung tâm (Row 5 & 4).
 * Khi đông người hơn (10-20 người), mở rộng sang Row 3 & 4.
 * Khi đầy kín (31 người), lấp đầy toàn bộ khán phòng đến sát sân khấu.
 */
const SEAT_FILL_ORDER = [
  // 1. Nhóm 4-7 người đầu: Tiền cảnh trung tâm nổi bật nhất
  28, // Row 5 (x=50)
  27, // Row 5 (x=33)
  29, // Row 5 (x=67)
  22, // Row 4 (x=42)
  23, // Row 4 (x=58)
  26, // Row 5 (x=16)
  30, // Row 5 (x=84)

  // 2. Nhóm 8-16 người: Hàng cận cảnh & hàng giữa
  21, // Row 4 (x=27)
  24, // Row 4 (x=73)
  16, // Row 3 (x=50)
  15, // Row 3 (x=36)
  17, // Row 3 (x=64)
  20, // Row 4 (x=12)
  25, // Row 4 (x=88)
  14, // Row 3 (x=22)
  18, // Row 3 (x=78)

  // 3. Nhóm 17-25 người: Hàng giữa & hàng sau
  13, // Row 3 (x=9)
  19, // Row 3 (x=91)
  9,  // Row 2 (x=50)
  8,  // Row 2 (x=38)
  10, // Row 2 (x=62)
  7,  // Row 2 (x=25)
  11, // Row 2 (x=77)
  6,  // Row 2 (x=12)
  12, // Row 2 (x=88)

  // 4. Nhóm 26-31 người: Lấp đầy hàng 1 sát chân bục gỗ sân khấu
  2,  // Row 1 (x=42)
  3,  // Row 1 (x=58)
  1,  // Row 1 (x=28)
  4,  // Row 1 (x=72)
  0,  // Row 1 (x=14)
  5,  // Row 1 (x=86)
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
  // Sắp xếp ưu tiên thông minh: Ai đang Kinh / Chờ Kinh / Dính số / Vừa chat sẽ luôn được lên ghế trước
  const prioritizedDevotees = useMemo(() => {
    return [...devotees].sort((a, b) => {
      const ticketA = lotoEngine.getTicketForUser(a.username);
      const ticketB = lotoEngine.getTicketForUser(b.username);

      const getScore = (d: Devotee, t?: LotoTicket) => {
        let score = 0;
        // 1. Đã Kinh (Winner) -> Ưu tiên tuyệt đối vị trí số 1
        if (t?.hasWon) score += 1000000;
        // 2. Chờ Kinh (còn 1-2 số để thắng)
        if (t && t.waitingNumbers.length > 0 && !t.hasWon) {
          score += 500000 + (t.markedCount * 10000);
        }
        // 3. Vừa dính số trong lượt quay hiện tại
        if (
          t &&
          currentNumber !== null &&
          t.grid.some((row) => row.some((c) => c.val === currentNumber))
        ) {
          score += 200000;
        }
        // 4. Đang có bình luận hiển thị trên đầu
        if (d.activeComment) score += 100000;
        // 5. Đang có vé may mắn
        if (t) score += 50000;
        // 6. Hoạt động gần đây nhất
        score += Math.min(d.lastActive || d.joinedAt || 0, 9999999);
        return score;
      };

      return getScore(b, ticketB) - getScore(a, ticketA);
    });
  }, [devotees, currentNumber]);

  const visibleDevotees = prioritizedDevotees.slice(0, FAIR_SEATS.length);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* RENDER TOÀN BỘ KHÁN GIẢ ĐƯỢC PHÂN BỔ VÀO GHẾ THEO THỨ TỰ THÔNG MINH */}
      {visibleDevotees.map((devotee, rankIdx) => {
        const seatIdx = SEAT_FILL_ORDER[rankIdx] ?? rankIdx;
        const seat = FAIR_SEATS[seatIdx];
        if (!seat) return null;

        const ticket = lotoEngine.getTicketForUser(devotee.username);
        const isWaitingKin = Boolean(ticket && ticket.waitingNumbers.length > 0 && !ticket.hasWon);
        const isWinner = Boolean(ticket && ticket.hasWon);
        const seed = hash(devotee.username);

        const justMatched =
          ticket &&
          currentNumber !== null &&
          ticket.grid.some((row) => row.some((c) => c.val === currentNumber));

        // Cheering sprite if winning or waiting for Kinh, or during active dance
        const isDancing = Boolean(activeDanceTier);
        const modelIndex =
          isWinner || isWaitingKin || isDancing
            ? 1
            : (seat.modelIdx + seed) % FAIR_MODELS.length;
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
            key={devotee.id || devotee.username}
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
                  {devotee.avatarUrl && (devotee.avatarUrl.startsWith('http') || devotee.avatarUrl.startsWith('data:')) ? (
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

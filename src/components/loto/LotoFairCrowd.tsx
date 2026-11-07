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
  fakeKinhUsername?: string | null;
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
 * KHÁN ĐÀI HỘI CHỢ LÔ TÔ DÂN GIAN:
 * 1. 31 người ngồi quây quần gần nhau ở trung tâm (Row 5 -> Row 1, y: 60% - 93%).
 * 2. Nếu còn người thì xếp vào các hàng đằng sau hướng về bục gỗ (Row 0, Row -1, Row -2, y: 44% - 55%).
 * 3. TẤT CẢ TÊN KHÁN GIẢ ĐỀU Ở TRÊN ĐẦU (Head Nameplate: [Avatar + Tên]), dưới chân hoàn toàn sạch đẹp.
 */
export const FAIR_SEATS = [
  // HÀNG 5 (Hàng tiền cảnh sát mép dưới - 5 chỗ, scale 1.05, y: ~92.5%)
  { x: 18, y: 92.0, scale: 1.04, flip: false, modelIdx: 1 }, // 0
  { x: 34, y: 92.5, scale: 1.05, flip: false, modelIdx: 0 }, // 1
  { x: 50, y: 93.0, scale: 1.06, flip: false, modelIdx: 2 }, // 2
  { x: 66, y: 92.5, scale: 1.05, flip: true,  modelIdx: 4 }, // 3
  { x: 82, y: 92.0, scale: 1.04, flip: true,  modelIdx: 3 }, // 4

  // HÀNG 4 (Hàng cận cảnh - 6 chỗ, scale 0.93, y: ~84.5%)
  { x: 16, y: 83.5, scale: 0.92, flip: false, modelIdx: 4 }, // 5
  { x: 30, y: 84.2, scale: 0.93, flip: false, modelIdx: 2 }, // 6
  { x: 43, y: 84.8, scale: 0.94, flip: false, modelIdx: 0 }, // 7
  { x: 57, y: 84.8, scale: 0.94, flip: true,  modelIdx: 1 }, // 8
  { x: 70, y: 84.2, scale: 0.93, flip: true,  modelIdx: 3 }, // 9
  { x: 84, y: 83.5, scale: 0.92, flip: true,  modelIdx: 5 }, // 10

  // HÀNG 3 (Hàng giữa hội trường - 7 chỗ, scale 0.83, y: ~76.5%)
  { x: 15, y: 75.5, scale: 0.82, flip: false, modelIdx: 1 }, // 11
  { x: 27, y: 76.0, scale: 0.83, flip: false, modelIdx: 3 }, // 12
  { x: 38, y: 76.5, scale: 0.84, flip: false, modelIdx: 5 }, // 13
  { x: 50, y: 77.0, scale: 0.85, flip: false, modelIdx: 0 }, // 14
  { x: 62, y: 76.5, scale: 0.84, flip: true,  modelIdx: 2 }, // 15
  { x: 73, y: 76.0, scale: 0.83, flip: true,  modelIdx: 4 }, // 16
  { x: 85, y: 75.5, scale: 0.82, flip: true,  modelIdx: 1 }, // 17

  // HÀNG 2 (Hàng sau trung tâm - 7 chỗ, scale 0.74, y: ~68.5%)
  { x: 17, y: 67.5, scale: 0.73, flip: false, modelIdx: 5 }, // 18
  { x: 28, y: 68.0, scale: 0.74, flip: false, modelIdx: 0 }, // 19
  { x: 39, y: 68.5, scale: 0.75, flip: false, modelIdx: 2 }, // 20
  { x: 50, y: 69.0, scale: 0.76, flip: false, modelIdx: 1 }, // 21
  { x: 61, y: 68.5, scale: 0.75, flip: true,  modelIdx: 3 }, // 22
  { x: 72, y: 68.0, scale: 0.74, flip: true,  modelIdx: 4 }, // 23
  { x: 83, y: 67.5, scale: 0.73, flip: true,  modelIdx: 0 }, // 24

  // HÀNG 1 (Hàng đầu cụm 31 người - 6 chỗ, scale 0.65, y: ~60.5%)
  { x: 20, y: 60.0, scale: 0.64, flip: false, modelIdx: 0 }, // 25
  { x: 32, y: 60.5, scale: 0.65, flip: false, modelIdx: 2 }, // 26
  { x: 44, y: 61.0, scale: 0.66, flip: false, modelIdx: 1 }, // 27
  { x: 56, y: 61.0, scale: 0.66, flip: true,  modelIdx: 4 }, // 28
  { x: 68, y: 60.5, scale: 0.65, flip: true,  modelIdx: 3 }, // 29
  { x: 80, y: 60.0, scale: 0.64, flip: true,  modelIdx: 5 }, // 30

  // HÀNG PHÍA SAU (NẾU CÒN THÊM NGƯỜI THÌ XẾP ĐẰNG SAU - ROW 0, ROW -1)
  // Row 0 (Hàng phía sau 1 - 8 chỗ, scale 0.56, y: ~55.5%)
  { x: 17, y: 55.0, scale: 0.55, flip: false, modelIdx: 4 }, // 31
  { x: 26, y: 55.4, scale: 0.56, flip: false, modelIdx: 1 }, // 32
  { x: 36, y: 55.7, scale: 0.56, flip: false, modelIdx: 3 }, // 33
  { x: 45, y: 56.0, scale: 0.57, flip: false, modelIdx: 5 }, // 34
  { x: 55, y: 56.0, scale: 0.57, flip: true,  modelIdx: 0 }, // 35
  { x: 64, y: 55.7, scale: 0.56, flip: true,  modelIdx: 2 }, // 36
  { x: 74, y: 55.4, scale: 0.56, flip: true,  modelIdx: 4 }, // 37
  { x: 83, y: 55.0, scale: 0.55, flip: true,  modelIdx: 1 }, // 38

  // Row -1 (Hàng phía sau 2 sát chân bục gỗ - 8 chỗ, scale 0.48, y: ~50.5%)
  { x: 19, y: 50.0, scale: 0.47, flip: false, modelIdx: 2 }, // 39
  { x: 28, y: 50.3, scale: 0.48, flip: false, modelIdx: 0 }, // 40
  { x: 37, y: 50.6, scale: 0.49, flip: false, modelIdx: 4 }, // 41
  { x: 46, y: 50.8, scale: 0.49, flip: false, modelIdx: 1 }, // 42
  { x: 54, y: 50.8, scale: 0.49, flip: true,  modelIdx: 3 }, // 43
  { x: 63, y: 50.6, scale: 0.49, flip: true,  modelIdx: 5 }, // 44
  { x: 72, y: 50.3, scale: 0.48, flip: true,  modelIdx: 2 }, // 45
  { x: 81, y: 50.0, scale: 0.47, flip: true,  modelIdx: 0 }, // 46
];

/**
 * THỨ TỰ LẤP ĐẦY CHỖ NGỒI (SEAT FILL ORDER):
 * 1. Nhóm 31 người đầu: Lấp đầy trọn vẹn cụm 31 ghế gần nhau (Row 5 -> Row 1).
 * 2. Người thứ 32 trở đi: Tiếp tục ngồi các hàng đằng sau hướng về phía bục gỗ sân khấu.
 */
const SEAT_FILL_ORDER = [
  // 1. Nhóm 1-5 người: Tiền cảnh trung tâm
  2,  // Row 5 center (x=50)
  1,  // Row 5 mid-left (x=35)
  3,  // Row 5 mid-right (x=65)
  7,  // Row 4 mid-left (x=43)
  8,  // Row 4 mid-right (x=57)

  // 2. Nhóm 6-11 người: Tiền cảnh & Cận cảnh
  0,  // Row 5 left (x=20)
  4,  // Row 5 right (x=80)
  14, // Row 3 center (x=50)
  6,  // Row 4 left (x=30)
  9,  // Row 4 right (x=70)
  13, // Row 3 mid-left (x=38)

  // 3. Nhóm 12-21 người: Hàng giữa & Cận cảnh
  15, // Row 3 mid-right (x=62)
  5,  // Row 4 far-left (x=17)
  10, // Row 4 far-right (x=83)
  21, // Row 2 center (x=50)
  12, // Row 3 left (x=27)
  16, // Row 3 right (x=73)
  20, // Row 2 mid-left (x=40)
  22, // Row 2 mid-right (x=60)
  11, // Row 3 far-left (x=16)
  17, // Row 3 far-right (x=84)

  // 4. Nhóm 22-31 người: Lấp đầy hàng 2 & hàng 1 (Tròn 31 người quây quần gần nhau)
  19, // Row 2 left (x=29)
  23, // Row 2 right (x=71)
  18, // Row 2 far-left (x=18)
  24, // Row 2 far-right (x=82)
  27, // Row 1 mid-left (x=44)
  28, // Row 1 mid-right (x=56)
  26, // Row 1 left (x=32)
  29, // Row 1 right (x=68)
  25, // Row 1 far-left (x=20)
  30, // Row 1 far-right (x=80)

  // 5. Nếu còn thêm người: Tự động xếp vào các hàng đằng sau
  34, 35, 33, 36, 32, 37, 31, 38, // Row 0 (y ~55.5%)
  42, 43, 41, 44, 40, 45, 39, 46, // Row -1 (y ~50.5%)
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
  fakeKinhUsername,
}) => {
  // Sắp xếp ưu tiên thông minh: Ai đang Kinh / Kinh giả / Chờ Kinh / VIP / Dính số / Vừa chat sẽ luôn được lên ghế trước
  const prioritizedDevotees = useMemo(() => {
    return [...devotees].sort((a, b) => {
      const ticketA = lotoEngine.getTicketForUser(a.username);
      const ticketB = lotoEngine.getTicketForUser(b.username);

      const getScore = (d: Devotee, t?: LotoTicket) => {
        let score = 0;
        // 1. Đã Kinh (Winner) -> Ưu tiên tuyệt đối vị trí số 1
        if (t?.hasWon) score += 1000000;
        // 1.5. Đang bị bắt Kinh Giả -> Lên ghế đầu chịu phạt cho cả phòng xem
        if (fakeKinhUsername && d.username.toLowerCase() === fakeKinhUsername.toLowerCase()) {
          score += 800000;
        }
        // 2. Chờ Kinh (còn 1-2 số để thắng)
        if (t && t.waitingNumbers.length > 0 && !t.hasWon) {
          score += 500000 + (t.markedCount * 10000);
        }
        // 2.5. Đại gia Vé Vàng VIP
        if (t?.isVip || d.isVip) {
          score += 350000;
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
  }, [devotees, currentNumber, fakeKinhUsername]);

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
        const isVip = Boolean(ticket?.isVip || devotee.isVip);
        const isFakeKinhOffender = Boolean(
          fakeKinhUsername && devotee.username.toLowerCase() === fakeKinhUsername.toLowerCase()
        );
        const seed = hash(devotee.username);

        const justMatched =
          ticket &&
          currentNumber !== null &&
          ticket.grid.some((row) => row.some((c) => c.val === currentNumber));

        // Cheering sprite if winning or waiting for Kinh, or during active dance / fake kinh penalty
        const isDancing = Boolean(activeDanceTier) || isFakeKinhOffender;
        const modelIndex =
          isWinner || isWaitingKin || isDancing
            ? 1
            : (seat.modelIdx + seed) % FAIR_MODELS.length;
        const sprite = FAIR_MODELS[modelIndex];
        const avatarProfile = DEFAULT_AVATARS[seed % DEFAULT_AVATARS.length];
        const isFlipped = seat.flip;

        const danceAnimClass = isFakeKinhOffender
          ? 'animate-bounce scale-115 drop-shadow-[0_0_15px_rgba(244,63,94,0.95)]'
          : activeDanceTier === 'rocket'
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
              zIndex: isWinner
                ? 60
                : isFakeKinhOffender
                ? 58
                : devotee.activeComment
                ? 56
                : isWaitingKin
                ? 50
                : Math.round(seat.y * 10),
            }}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 0. BONG BÓNG CHAT TRỰC TIẾP TRÊN ĐẦU NHÂN VẬT (LUÔN HIỂN THỊ KHI KHÁN GIẢ BÌNH LUẬN) */}
            {devotee.activeComment && (
              <div className="relative flex flex-col items-center mb-1 z-40 animate-bounce">
                <div className="px-2 py-0.5 rounded-xl bg-white text-slate-950 border-2 border-amber-400 text-[8px] font-extrabold max-w-[115px] truncate shadow-[0_3px_10px_rgba(0,0,0,0.85)] flex items-center gap-1">
                  <span className="text-[8px] shrink-0">💬</span>
                  <span className="truncate">{devotee.activeComment}</span>
                </div>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-amber-400 -mt-[1px]" />
              </div>
            )}

            {/* 1. HUY HIỆU CẢM XÚC TRÊN ĐẦU (CHỜ KINH / DÍNH SỐ / KINH / PHẠT KINH GIẢ) */}
            <div className="flex flex-col items-center mb-0.5 z-30">
              {isWinner ? (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-[8px] font-black text-white shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-bounce whitespace-nowrap">
                  👑 KINH RỒI!
                </span>
              ) : isFakeKinhOffender ? (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-orange-500 border border-yellow-300 text-[7.5px] font-black text-white shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-bounce whitespace-nowrap">
                  🚨 KINH HỤT! Phạt múa quạt!
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
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 border border-emerald-300 text-[7px] font-black text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap">
                  🎯 Dính số!
                </span>
              ) : null}
            </div>

            {/* 2. TÊN KHÁN GIẢ & AVATAR ĐẶT GỌN GÀNG TRÊN ĐẦU (TÊN Ở TRÊN ĐẦU, CÓ VƯƠNG MIỆN NẾU LÀ VIP) */}
            <div
              className={`flex items-center gap-1 px-1.5 py-[1.5px] rounded-full backdrop-blur-xs max-w-[72px] mb-[-5px] z-20 ${
                isVip
                  ? 'bg-gradient-to-r from-amber-950/95 via-yellow-900/95 to-amber-950/95 border border-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.75)]'
                  : 'bg-black/90 border border-amber-400/80 shadow-[0_2px_5px_rgba(0,0,0,0.8)]'
              }`}
            >
              <div className="w-3 h-3 rounded-full border border-yellow-300/80 p-[0.5px] bg-black overflow-hidden flex items-center justify-center shrink-0">
                {devotee.avatarUrl && (devotee.avatarUrl.startsWith('http') || devotee.avatarUrl.startsWith('data:')) ? (
                  <img
                    src={devotee.avatarUrl}
                    alt={devotee.displayName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-tr ${avatarProfile.bg} text-[7px] flex items-center justify-center shadow-inner`}
                  >
                    <span>{avatarProfile.icon}</span>
                  </div>
                )}
              </div>
              <span
                className={`text-[7px] font-bold truncate leading-none ${
                  isVip ? 'text-yellow-200 font-black' : 'text-amber-200'
                }`}
              >
                {isVip ? `👑 ${devotee.displayName}` : devotee.displayName}
              </span>
            </div>

            {/* 3. KHUNG NHÂN VẬT 3D */}
            <div className="relative w-16 h-20 flex items-end justify-center">
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
          </motion.div>
        );
      })}
    </div>
  );
};

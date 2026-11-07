import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Devotee } from '../../types/temple';
import { lotoEngine, LotoTicket } from '../../services/loto/lotoEngine';
import { FAIR_MODELS, DEFAULT_AVATARS, FAIR_SEATS, SEAT_FILL_ORDER, hash } from './lotoFairSeats';

export { FAIR_SEATS, hash };
export type LotoDanceTier = 'rose' | 'icecream' | 'crown' | 'rocket' | null;

interface LotoFairCrowdProps {
  devotees: Devotee[];
  currentNumber: number | null;
  onSelectPlayer?: (username: string) => void;
  activeDanceTier?: LotoDanceTier;
  fakeKinhUsername?: string | null;
}

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

import React, { useEffect, useState, useRef } from 'react';
import { LotoWinner } from '../../services/loto/lotoEngine';

interface LotoWinnerCelebrationProps {
  winner: LotoWinner | null;
  onClose: () => void;
  onNewRound?: () => void;
  autoNextRoundCountdown?: number | null;
}

export const LotoWinnerCelebration: React.FC<LotoWinnerCelebrationProps> = ({
  winner,
  onClose,
  onNewRound,
  autoNextRoundCountdown,
}) => {
  const [visible, setVisible] = useState(false);
  const celebratedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (winner) {
      const winnerKey = `${winner.roundId}_${winner.username}_${winner.wonAt}`;
      // Only open if this is a newly triggered victory that hasn't been dismissed yet
      if (celebratedKeyRef.current !== winnerKey) {
        celebratedKeyRef.current = winnerKey;
        setVisible(true);
      }
    } else {
      setVisible(false);
      celebratedKeyRef.current = null;
    }
  }, [winner]);

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  const handleNextRound = () => {
    setVisible(false);
    if (onNewRound) {
      onNewRound();
    } else {
      onClose();
    }
  };

  if (!visible || !winner) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Pháo hoa giả lập hiệu ứng hạt lấp lánh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-ping"
            style={{
              width: `${6 + (i % 6) * 3}px`,
              height: `${6 + (i % 6) * 3}px`,
              left: `${10 + (i * 7) % 80}%`,
              top: `${10 + (i * 11) % 80}%`,
              backgroundColor: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#eab308'][i % 6],
              animationDuration: `${1 + (i % 3) * 0.5}s`,
              animationIterationCount: 'infinite',
            }}
          />
        ))}
      </div>

      {/* Hộp chúc mừng chính */}
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-amber-600 via-amber-950 to-slate-950 p-6 border-4 border-yellow-300 shadow-[0_0_50px_rgba(245,158,11,0.8)] text-center text-white flex flex-col items-center animate-in zoom-in-75 duration-300">
        {/* Nút đóng góc phải */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 border border-yellow-400/60 text-slate-300 hover:text-white flex items-center justify-center text-xs shadow hover:scale-105 active:scale-95"
          title="Đóng bảng thắng cuộc"
        >
          ✕
        </button>

        <div className="text-4xl animate-bounce mb-1">👑 🎪 👑</div>

        <h2 className="text-2xl font-black text-yellow-300 uppercase tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          KINH RỒI BÀ CON ƠI!
        </h2>

        <p className="text-xs text-amber-200 mt-1 uppercase tracking-widest font-semibold">
          CHÚC MỪNG NGƯỜI THẮNG CUỘC
        </p>

        {/* Avatar người thắng */}
        <div className="relative my-3">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-yellow-300 to-red-500 blur-md animate-pulse" />
          {winner.avatarUrl ? (
            <img
              src={winner.avatarUrl}
              alt={winner.displayName}
              className="relative w-20 h-20 rounded-full object-cover border-4 border-yellow-300 shadow-xl"
            />
          ) : (
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-3xl flex items-center justify-center border-4 border-yellow-300 shadow-xl">
              👑
            </div>
          )}
        </div>

        <div className="text-lg font-extrabold text-white mb-2">
          {winner.displayName}
        </div>

        {/* Dãy số trúng */}
        <div className="bg-black/70 rounded-xl px-4 py-2 border border-yellow-400/50 mb-3 w-full">
          <div className="text-[10px] text-amber-300 uppercase font-semibold mb-1">
            Dãy số may mắn đã KINH:
          </div>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {winner.winningRowNumbers.map((num) => (
              <span
                key={num}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-black font-mono shadow-md
                  ${
                    num === winner.winningNumber
                      ? 'bg-red-500 text-white animate-bounce ring-2 ring-yellow-300'
                      : 'bg-amber-400 text-slate-950'
                  }
                `}
              >
                {num < 10 ? `0${num}` : num}
              </span>
            ))}
          </div>
        </div>

        {/* Hộp quà tặng thưởng sang trọng */}
        <div className="mb-3 w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border-2 border-yellow-400 shadow-lg flex items-center justify-between gap-2 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎁</span>
            <div className="text-left">
              <div className="text-[9.5px] font-bold text-yellow-300 uppercase tracking-wider">
                PHẦN THƯỞNG VÁN NÀY:
              </div>
              <div className="text-xs sm:text-sm font-black text-white drop-shadow">
                {winner.prize || 'Thẻ cào điện thoại 50.000đ'}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-red-600 text-[8.5px] font-black uppercase text-white shadow">
            Trúng Thưởng
          </span>
        </div>

        {/* Hướng dẫn nhận thưởng cho người thắng */}
        <div className="text-[10px] text-amber-200/90 bg-black/70 rounded-xl p-2 border border-amber-500/40 w-full mb-3 text-center">
          📲 Bạn <strong>{winner.displayName}</strong> hãy <strong>chụp ảnh màn hình</strong> này và <strong>inbox cho kênh TikTok</strong> để nhận quà nhé!
        </div>

        <button
          onClick={handleNextRound}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-1.5"
        >
          <span>🔄</span>
          <span>
            {autoNextRoundCountdown !== null && autoNextRoundCountdown !== undefined
              ? `Tự động qua Ván mới (${autoNextRoundCountdown}s)...`
              : 'Bắt đầu ván mới'}
          </span>
        </button>
      </div>
    </div>
  );
};

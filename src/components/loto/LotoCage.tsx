import React, { useMemo } from 'react';

interface LotoCageProps {
  isSpinning: boolean;
  currentNumber: number | null;
  currentChant: string;
}

const BALL_COLORS = [
  'from-red-500 to-rose-700',
  'from-amber-400 to-orange-600',
  'from-emerald-400 to-teal-700',
  'from-blue-500 to-indigo-700',
  'from-purple-500 to-pink-600',
  'from-yellow-400 to-amber-600',
  'from-cyan-400 to-blue-600',
];

export const LotoCage: React.FC<LotoCageProps> = ({ isSpinning, currentNumber, currentChant }) => {
  // Generate random floating balls inside the cage
  const balls = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      color: BALL_COLORS[i % BALL_COLORS.length],
      num: Math.floor(Math.random() * 90) + 1,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      size: 18 + Math.random() * 8,
    }));
  }, []);

  const ballColor = currentNumber ? BALL_COLORS[currentNumber % BALL_COLORS.length] : BALL_COLORS[0];

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none py-1">
      {/* VÙNG LỒNG CẦU VÀ QUẢ BÓNG SỐ (BỐ CỤC NẰM GỌN NHAU) */}
      <div className="relative flex items-center justify-center gap-4">
        {/* 1. LỒNG CẦU QUAY SỐ */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          {/* Lồng sắt bảo vệ ngoài */}
          <div
            className={`
              absolute inset-0 rounded-full border-3 border-amber-400/70 shadow-[0_0_15px_rgba(245,158,11,0.5)]
              flex items-center justify-center bg-radial from-amber-950/40 via-slate-950/80 to-slate-950
              ${isSpinning ? 'animate-spin' : ''}
            `}
            style={{ animationDuration: isSpinning ? '0.6s' : '12s' }}
          >
            <div className="absolute inset-0 rounded-full border border-dashed border-amber-300/40" />
            <div className="absolute w-full h-[1.5px] bg-amber-400/30" />
            <div className="absolute h-full w-[1.5px] bg-amber-400/30" />
            <div className="absolute w-full h-[1.5px] bg-amber-400/30 rotate-45" />
            <div className="absolute w-full h-[1.5px] bg-amber-400/30 -rotate-45" />
          </div>

          {/* Các quả bóng nhảy nhót bên trong */}
          <div className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center">
            {balls.map((b) => (
              <div
                key={b.id}
                className={`
                  absolute rounded-full bg-gradient-to-br ${b.color} text-white font-bold text-[8px]
                  flex items-center justify-center shadow-sm border border-white/40
                  ${isSpinning ? 'animate-ping' : 'animate-pulse'}
                `}
                style={{
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDuration: `${0.8 + (b.id % 5) * 0.3}s`,
                }}
              >
                {b.num}
              </div>
            ))}

            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 border border-white shadow-md z-10 flex items-center justify-center">
              <span className="text-[8px]">🎪</span>
            </div>
          </div>

          {/* Chân đế lồng cầu */}
          <div className="absolute -bottom-2 w-20 h-2.5 bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 rounded-md shadow border border-amber-300/60" />
        </div>

        {/* 2. QUẢ BÓNG SỐ VỪA RA (POP UP NỔI BẬT BÊN CẠNH) */}
        <div className="relative flex flex-col items-center">
          {currentNumber !== null ? (
            <div className="relative flex flex-col items-center animate-in zoom-in-75 duration-300">
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 opacity-75 blur-md animate-pulse" />
              <div
                className={`
                  relative w-20 h-20 rounded-full bg-gradient-to-br ${ballColor}
                  border-3 border-yellow-200 shadow-[0_6px_20px_rgba(0,0,0,0.6)]
                  flex flex-col items-center justify-center text-white
                `}
              >
                <div className="absolute top-1.5 left-2 w-5 h-2 rounded-full bg-white/60 blur-[1px] rotate-[-25deg]" />
                <span className="text-[8px] uppercase font-bold tracking-widest text-yellow-200 opacity-90">
                  SỐ
                </span>
                <span className="text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-mono">
                  {currentNumber < 10 ? `0${currentNumber}` : currentNumber}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-400/40 flex items-center justify-center bg-slate-950/60">
              <span className="text-[10px] text-amber-300/70 font-semibold text-center px-1">
                {isSpinning ? 'Đang quay...' : 'Chuẩn bị'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. CÂU HÒ XƯỚNG LÔ TÔ (HIỂN THỊ TRỌN VẸN LỜI HÁT CA DAO / TÂN NHẠC VẦN ĐIỆU) */}
      <div className="mt-1.5 w-full max-w-[370px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-amber-950/95 border border-amber-500/50 shadow-lg text-center backdrop-blur-md min-h-[48px] flex items-center justify-center">
        <p className="text-[10px] sm:text-[10.5px] text-amber-200 font-medium italic leading-relaxed whitespace-pre-line text-center drop-shadow">
          "{currentChant}"
        </p>
      </div>
    </div>
  );
};

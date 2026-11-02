import React, { useEffect, useState } from 'react';

interface DiscoOverlayProps {
  isActive: boolean;
  discoUntil?: number;
  onFinish?: () => void;
}

// 22 realistic golden party confetti & sparkle elements
const PARTY_CONFETTI = Array.from({ length: 22 }).map((_, i) => ({
  id: i,
  left: `${(i * 4.6 + 2) % 96}%`,
  delay: `${(i * 0.18) % 2.5}s`,
  duration: `${2.0 + (i % 3) * 0.5}s`,
  icon: ['✨', '🎉', '⭐', '🎊', '✨', '🍻', '🌟'][i % 7],
  size: 13 + (i % 3) * 4,
}));

export const DiscoOverlay: React.FC<DiscoOverlayProps> = ({ isActive, discoUntil = 0 }) => {
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (!isActive) return;
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((discoUntil - Date.now()) / 1000));
      setSecondsLeft(remaining > 0 ? remaining : 60);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isActive, discoUntil]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-35 pointer-events-none select-none overflow-hidden">
      {/* 1. HIỆU ỨNG ÁNH SÁNG TIỆC TÙNG ẤM ÁP (KHÔNG LÀM MỜ HAY ÁO ẢNH PHÔNG NỀN) */}
      {/* Vignette viền màn hình tạo chiều sâu điện ảnh */}
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.65)]" />

      {/* Ánh sáng ấm nhấp nháy theo nhịp điệu bass (rất nhẹ nhàng, không bị chói mắt) */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-orange-500/10 animate-pulse" style={{ animationDuration: '0.9s' }} />

      {/* Đèn rọi sân khấu quét nhẹ ở 2 góc */}
      <div
        className="absolute -top-12 -left-10 w-48 h-[130%] bg-gradient-to-b from-amber-400/20 via-yellow-400/5 to-transparent blur-2xl rotate-20 origin-top pointer-events-none animate-pulse"
        style={{ animationDuration: '1.6s' }}
      />
      <div
        className="absolute -top-12 -right-10 w-48 h-[130%] bg-gradient-to-b from-orange-400/20 via-red-400/5 to-transparent blur-2xl -rotate-20 origin-top pointer-events-none animate-pulse"
        style={{ animationDuration: '1.4s' }}
      />

      {/* 2. BANNER DJ LÊN NHẠC SANG TRỌNG VỚI SÓNG NHẠC EQUALIZER NHẢY BEAT */}
      <div className="absolute top-14 inset-x-2 flex justify-center z-40 animate-in zoom-in-95 duration-300">
        <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-950/95 via-black/90 to-amber-950/95 border border-yellow-400/80 shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center gap-2.5 backdrop-blur-md">
          {/* Cột sóng nhạc Equalizer nhảy theo điệu beat */}
          <div className="flex items-end gap-[2px] h-3.5">
            <span className="w-[2.5px] bg-yellow-400 rounded-full animate-pulse h-full" style={{ animationDuration: '0.35s' }} />
            <span className="w-[2.5px] bg-amber-300 rounded-full animate-pulse h-2/3" style={{ animationDuration: '0.55s' }} />
            <span className="w-[2.5px] bg-orange-400 rounded-full animate-pulse h-4/5" style={{ animationDuration: '0.4s' }} />
            <span className="w-[2.5px] bg-red-400 rounded-full animate-pulse h-full" style={{ animationDuration: '0.3s' }} />
            <span className="w-[2.5px] bg-yellow-300 rounded-full animate-pulse h-1/2" style={{ animationDuration: '0.5s' }} />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-yellow-300 drop-shadow flex items-center gap-1.5">
              <span>🔥</span>
              <span>QUÁN LÊN NHẠC • CẢ QUÁN CÙNG QUẨY!</span>
              <span>🔥</span>
            </span>
            <span className="text-[7.5px] font-bold text-amber-200/90">
              Đại tiệc cụng ly toàn quán • Còn {secondsLeft}s
            </span>
          </div>

          {/* Cột sóng nhạc bên phải đối xứng */}
          <div className="flex items-end gap-[2px] h-3.5">
            <span className="w-[2.5px] bg-yellow-300 rounded-full animate-pulse h-1/2" style={{ animationDuration: '0.5s' }} />
            <span className="w-[2.5px] bg-red-400 rounded-full animate-pulse h-full" style={{ animationDuration: '0.3s' }} />
            <span className="w-[2.5px] bg-orange-400 rounded-full animate-pulse h-4/5" style={{ animationDuration: '0.4s' }} />
            <span className="w-[2.5px] bg-amber-300 rounded-full animate-pulse h-2/3" style={{ animationDuration: '0.55s' }} />
            <span className="w-[2.5px] bg-yellow-400 rounded-full animate-pulse h-full" style={{ animationDuration: '0.35s' }} />
          </div>
        </div>
      </div>

      {/* 3. MƯA KIM TUYẾN & PHÁO HOA LẤP LÁNH RƠI NHẸ NHÀNG */}
      {PARTY_CONFETTI.map((p) => (
        <div
          key={p.id}
          className="absolute -top-10 animate-fade-drop pointer-events-none"
          style={{
            left: p.left,
            fontSize: `${p.size}px`,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          {p.icon}
        </div>
      ))}
    </div>
  );
};

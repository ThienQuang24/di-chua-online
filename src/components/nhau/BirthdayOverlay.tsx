import React, { useEffect, useState } from 'react';
import { BirthdayEvent } from '../../services/nhau/nhauEngine';

interface BirthdayOverlayProps {
  birthdayEvent: BirthdayEvent | null;
}

// Balloons and festive birthday confetti particles
const BIRTHDAY_PARTICLES = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  left: `${(i * 5.5 + 4) % 94}%`,
  delay: `${(i * 0.25) % 3}s`,
  duration: `${2.8 + (i % 3) * 0.6}s`,
  icon: ['🎈', '✨', '🎂', '🎉', '🎁', '⭐', '🎈'][i % 7],
  size: 15 + (i % 3) * 5,
}));

export const BirthdayOverlay: React.FC<BirthdayOverlayProps> = ({ birthdayEvent }) => {
  const [secondsLeft, setSecondsLeft] = useState(35);

  useEffect(() => {
    if (!birthdayEvent) return;
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((birthdayEvent.activeUntil - Date.now()) / 1000));
      setSecondsLeft(remaining > 0 ? remaining : 35);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [birthdayEvent]);

  if (!birthdayEvent) return null;

  return (
    <div className="absolute inset-0 z-38 pointer-events-none select-none overflow-hidden animate-in fade-in duration-500">
      {/* 1. KHUNG CHÚC MỪNG SINH NHẬT VÀNG KIM LỘNG LẪY Ở ĐỈNH */}
      <div className="absolute top-14 inset-x-2 flex justify-center z-40 animate-in zoom-in-95 duration-400">
        <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-950/95 via-amber-950/90 to-red-950/95 border-2 border-yellow-400 shadow-[0_0_30px_rgba(245,158,11,0.8)] flex items-center gap-3 backdrop-blur-md">
          {/* Icon Bánh kem & nến lung linh */}
          <div className="relative text-2xl animate-bounce">
            🎂
            <span className="absolute -top-1.5 -right-1 text-xs animate-ping">
              ✨
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <span>👑</span>
              <span>ĐẠI TIỆC CHÚC MỪNG SINH NHẬT</span>
              <span>👑</span>
            </span>
            <span className="text-sm font-black text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-pulse">
              {birthdayEvent.displayName}
            </span>
            <span className="text-[7.5px] font-semibold text-amber-200/90 italic truncate max-w-[200px]">
              "{birthdayEvent.wishes}"
            </span>
          </div>

          <div className="flex flex-col items-center pl-1 border-l border-amber-600/50 text-right">
            <span className="text-xs">🎉</span>
            <span className="text-[7.5px] font-bold text-yellow-300 font-mono">
              {secondsLeft}s
            </span>
          </div>
        </div>
      </div>

      {/* 2. CHIẾC BÁNH SINH NHẬT 3D ĐẶT TRANG TRỌNG GIỮA BÀN VIP TRUNG TÂM */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-35 animate-in zoom-in duration-500"
        style={{ left: '50%', top: '78%' }}
      >
        {/* Pháo sáng sinh nhật phụt 2 bên */}
        <div className="absolute -top-8 -left-4 text-xs animate-ping">
          ✨💥
        </div>
        <div className="absolute -top-8 -right-4 text-xs animate-ping" style={{ animationDelay: '0.3s' }}>
          💥✨
        </div>

        {/* Khối bánh kem sinh nhật 2 tầng với nến phát sáng */}
        <div className="relative flex flex-col items-center">
          {/* Nến đang cháy */}
          <div className="flex items-center gap-1 mb-[-2px] z-10">
            <span className="text-xs animate-pulse">🕯️</span>
            <span className="text-xs animate-pulse" style={{ animationDelay: '0.2s' }}>🕯️</span>
            <span className="text-xs animate-pulse" style={{ animationDelay: '0.4s' }}>🕯️</span>
          </div>

          {/* Tầng trên bánh kem */}
          <div className="w-10 h-4 rounded-t-lg bg-gradient-to-r from-pink-400 via-rose-300 to-pink-400 border border-yellow-200 shadow-md flex items-center justify-around px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-xs" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-xs" />
          </div>

          {/* Tầng dưới bánh kem */}
          <div className="w-14 h-5 rounded-lg bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 border border-yellow-300 shadow-xl flex items-center justify-center">
            <span className="text-[6.5px] font-black uppercase tracking-tight text-red-600 drop-shadow-xs">
              HAPPY BIRTHDAY
            </span>
          </div>

          {/* Dĩa lót mạ vàng */}
          <div className="w-16 h-1.5 rounded-[50%] bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg -mt-0.5" />
        </div>
      </div>

      {/* 3. MƯA BÓNG BAY VÀ KIM TUYẾN SINH NHẬT */}
      {BIRTHDAY_PARTICLES.map((p) => (
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

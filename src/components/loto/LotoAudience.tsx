import React from 'react';
import { LotoTicket } from '../../services/loto/lotoEngine';

interface LotoAudienceProps {
  tickets: LotoTicket[];
  currentNumber: number | null;
  selectedUsername: string | null;
  onSelectPlayer: (username: string) => void;
}

const SHIRT_COLORS = [
  'bg-blue-600',
  'bg-rose-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-indigo-600',
  'bg-pink-600',
];

// Pre-define 16 seat positions in 2 curved rows for the audience
const AUDIENCE_SEATS = [
  // Front row (8 seats)
  { row: 0, x: 7, y: 55, scale: 0.95 },
  { row: 0, x: 19, y: 57, scale: 0.97 },
  { row: 0, x: 31, y: 59, scale: 1.0 },
  { row: 0, x: 43, y: 60, scale: 1.0 },
  { row: 0, x: 57, y: 60, scale: 1.0 },
  { row: 0, x: 69, y: 59, scale: 1.0 },
  { row: 0, x: 81, y: 57, scale: 0.97 },
  { row: 0, x: 93, y: 55, scale: 0.95 },

  // Back row (8 seats)
  { row: 1, x: 10, y: 15, scale: 0.8 },
  { row: 1, x: 22, y: 18, scale: 0.82 },
  { row: 1, x: 34, y: 20, scale: 0.84 },
  { row: 1, x: 45, y: 21, scale: 0.85 },
  { row: 1, x: 55, y: 21, scale: 0.85 },
  { row: 1, x: 66, y: 20, scale: 0.84 },
  { row: 1, x: 78, y: 18, scale: 0.82 },
  { row: 1, x: 90, y: 15, scale: 0.8 },
];

export const LotoAudience: React.FC<LotoAudienceProps> = ({
  tickets,
  currentNumber,
  selectedUsername,
  onSelectPlayer,
}) => {
  return (
    <div className="relative w-full h-[155px] bg-slate-950/60 rounded-2xl border border-amber-500/30 overflow-hidden shadow-inner p-1 select-none">
      {/* Phông nền dãy ghế khán giả hội chợ */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Tiêu đề nhỏ */}
      <div className="absolute top-1 left-2.5 z-10 flex items-center gap-1.5 text-[9px] font-bold text-amber-300 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        KHÁN GIẢ ĐANG NGỒI DÒ VÉ ({tickets.length} NGƯỜI)
      </div>

      {/* Render các vị trí ghế ngồi */}
      <div className="relative w-full h-full">
        {AUDIENCE_SEATS.map((seat, idx) => {
          const player = tickets[idx];
          const isSelected = player && selectedUsername === player.username;
          const isWaitingKin = player && player.waitingNumbers.length > 0;
          const isWinner = player && player.hasWon;
          const justMatched =
            player &&
            currentNumber !== null &&
            player.grid.some((row) => row.some((c) => c.val === currentNumber));

          const shirtColor = SHIRT_COLORS[idx % SHIRT_COLORS.length];

          if (!player) {
            // Ghế trống (chờ người vào)
            return (
              <div
                key={`empty-${idx}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-30 hover:opacity-60 transition-opacity"
                style={{
                  left: `${seat.x}%`,
                  top: `${seat.y}%`,
                  transform: `translate(-50%, -50%) scale(${seat.scale * 0.85})`,
                  zIndex: seat.row === 1 ? 5 : 15,
                }}
              >
                {/* Ghế gỗ trống */}
                <div className="w-7 h-8 rounded-t-lg bg-amber-950/80 border border-amber-800/50 flex flex-col items-center justify-center">
                  <span className="text-[7px] text-amber-500 font-mono">#{idx + 1}</span>
                </div>
                <div className="w-8 h-2 bg-amber-900 rounded-b shadow" />
              </div>
            );
          }

          return (
            <div
              key={player.id}
              onClick={() => onSelectPlayer(player.username)}
              className={`
                absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300
                ${isWaitingKin ? 'animate-bounce' : ''}
                ${isWinner ? 'animate-pulse scale-110' : 'hover:scale-105'}
              `}
              style={{
                left: `${seat.x}%`,
                top: `${seat.y}%`,
                transform: `translate(-50%, -50%) scale(${seat.scale})`,
                zIndex: isSelected ? 30 : isWaitingKin ? 25 : seat.row === 1 ? 8 : 18,
              }}
            >
              {/* 1. STATUS BADGE TRÊN ĐẦU (ĐANG CHỜ KINH / VỪA TRÚNG) */}
              <div className="flex flex-col items-center mb-0.5 pointer-events-none">
                {isWinner ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-[8px] font-black text-white shadow-[0_0_8px_#ef4444] animate-bounce whitespace-nowrap">
                    👑 KINH RỒI!
                  </span>
                ) : isWaitingKin ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-[7px] font-extrabold text-yellow-100 shadow-[0_0_6px_#f59e0b] whitespace-nowrap animate-pulse">
                    🔥 Chờ {player.waitingNumbers.slice(0, 2).map((n) => (n < 10 ? `0${n}` : n)).join(',')}
                  </span>
                ) : justMatched ? (
                  <span className="px-1 py-0.5 rounded bg-emerald-500 text-[7px] font-bold text-slate-950 shadow animate-ping whitespace-nowrap">
                    +1 Dính!
                  </span>
                ) : (
                  <span className="text-[7px] text-amber-300/80 font-mono bg-black/60 px-1 rounded">
                    {player.markedCount}/15
                  </span>
                )}
              </div>

              {/* 2. AVATAR & TÊN NGƯỜI CHƠI */}
              <div className="relative">
                {player.avatarUrl ? (
                  <img
                    src={player.avatarUrl}
                    alt={player.displayName}
                    className={`
                      w-7 h-7 rounded-full object-cover border-2 shadow-md
                      ${
                        isSelected
                          ? 'border-yellow-300 ring-2 ring-yellow-400'
                          : isWaitingKin
                          ? 'border-red-400 ring-2 ring-red-500'
                          : 'border-amber-400/80'
                      }
                    `}
                  />
                ) : (
                  <div
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 border-2 shadow-md
                      ${
                        isSelected
                          ? 'bg-yellow-300 border-white ring-2 ring-yellow-400'
                          : isWaitingKin
                          ? 'bg-red-500 text-white border-yellow-300 ring-2 ring-red-500'
                          : 'bg-amber-400 border-yellow-200'
                      }
                    `}
                  >
                    {player.displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Vương miện nếu thắng */}
                {isWinner && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs">
                    👑
                  </span>
                )}
              </div>

              {/* 3. THÂN NHÂN VẬT & TẤM VÉ TRÊN TAY */}
              <div className="relative mt-[-3px] flex flex-col items-center">
                {/* Thân áo */}
                <div className={`w-6 h-5 rounded-t-lg ${shirtColor} shadow-md flex items-center justify-center`}>
                  {/* Tấm vé nhỏ trên tay nhân vật */}
                  <div className="w-4 h-3 bg-amber-100 rounded-[2px] border border-amber-600 shadow-[0_1px_2px_rgba(0,0,0,0.5)] flex flex-col justify-around p-[1px]">
                    <div className="w-full h-[1px] bg-red-500" />
                    <div className="w-full h-[1px] bg-amber-800" />
                  </div>
                </div>

                {/* Chân / ghế ngồi */}
                <div className="w-7 h-1.5 bg-amber-950 rounded-b shadow" />
              </div>

              {/* 4. NAME TAG DƯỚI CHÂN */}
              <div
                className={`
                  mt-0.5 px-1 py-[1px] rounded text-[8px] font-semibold max-w-[65px] truncate text-center shadow
                  ${
                    isSelected
                      ? 'bg-yellow-400 text-slate-950 font-bold'
                      : 'bg-black/75 text-slate-200 border border-slate-700/60'
                  }
                `}
              >
                {player.displayName}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

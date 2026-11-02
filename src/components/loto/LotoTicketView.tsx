import React from 'react';
import { LotoTicket } from '../../services/loto/lotoEngine';

interface LotoTicketViewProps {
  tickets: LotoTicket[];
  currentNumber: number | null;
  selectedUsername?: string | null;
}

export const LotoTicketView: React.FC<LotoTicketViewProps> = ({ tickets, selectedUsername }) => {
  // Find players waiting for 1 number (Chờ Kinh)
  const waitingPlayers = React.useMemo(() => {
    return tickets
      .filter((t) => !t.hasWon && t.waitingNumbers.length > 0)
      .slice(0, 5);
  }, [tickets]);

  // Find sample ticket to display (prefer selected user, or highest marked count)
  const spotlightTicket = React.useMemo(() => {
    if (tickets.length === 0) return null;
    if (selectedUsername) {
      const found = tickets.find((t) => t.username.toLowerCase() === selectedUsername.toLowerCase());
      if (found) return found;
    }
    return [...tickets].sort((a, b) => b.markedCount - a.markedCount)[0];
  }, [tickets, selectedUsername]);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* 1. KHU VỰC "ĐANG CHỜ KINH" (CỰC KỲ KỊCH TÍNH) */}
      {waitingPlayers.length > 0 && (
        <div className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-red-950/80 via-slate-900/90 to-red-950/80 border border-red-500/50 shadow-md">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs animate-bounce">🔥</span>
            <span className="text-[11px] font-extrabold text-red-400 uppercase tracking-wide">
              ĐANG HỒI HỘP CHỜ KINH:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {waitingPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-900/40 border border-red-500/30 text-[10px]"
              >
                {player.avatarUrl ? (
                  <img
                    src={player.avatarUrl}
                    alt={player.displayName}
                    className="w-4 h-4 rounded-full object-cover border border-amber-300"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[8px]">
                    {player.displayName.charAt(0)}
                  </div>
                )}
                <span className="font-semibold text-slate-200 truncate max-w-[80px]">
                  {player.displayName}
                </span>
                <span className="text-yellow-400 font-bold">
                  chờ:{' '}
                  {player.waitingNumbers.map((n) => (n < 10 ? `0${n}` : n)).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TẤM VÉ LÔ TÔ MẪU TIÊU BIỂU CỦA NGƯỜI XEM */}
      {spotlightTicket && (
        <div className="w-full bg-amber-950/70 border border-amber-500/40 rounded-xl p-2.5 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {spotlightTicket.avatarUrl ? (
                <img
                  src={spotlightTicket.avatarUrl}
                  alt={spotlightTicket.displayName}
                  className="w-6 h-6 rounded-full object-cover border border-amber-400"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {spotlightTicket.displayName.charAt(0)}
                </div>
              )}
              <span className="text-xs font-bold text-amber-300">
                Vé của: <strong className="text-white">{spotlightTicket.displayName}</strong>
              </span>
            </div>
            <span className="text-[10px] text-amber-200/90 font-mono bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/30">
              Trúng: {spotlightTicket.markedCount}/15 số
            </span>
          </div>

          {/* Bảng vé 3 hàng x 9 cột chuẩn Việt Nam */}
          <div className="flex flex-col gap-1 bg-slate-950/80 p-1.5 rounded-lg border border-amber-600/30">
            {spotlightTicket.grid.map((row, rIdx) => {
              const isWinningRow = spotlightTicket.winningRow === rIdx;
              return (
                <div
                  key={rIdx}
                  className={`grid grid-cols-9 gap-1 p-0.5 rounded ${
                    isWinningRow ? 'bg-red-600/30 border border-red-500 animate-pulse' : ''
                  }`}
                >
                  {row.map((cell, cIdx) => (
                    <div
                      key={cIdx}
                      className={`
                        aspect-square flex items-center justify-center rounded text-[10px] font-bold font-mono transition-all
                        ${
                          cell.val === null
                            ? 'bg-slate-900/40 text-transparent'
                            : cell.isMarked
                            ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black shadow-[0_0_8px_#f59e0b]'
                            : 'bg-slate-800/80 text-slate-300 border border-slate-700/50'
                        }
                      `}
                    >
                      {cell.val !== null ? (cell.val < 10 ? `0${cell.val}` : cell.val) : ''}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="mt-1 text-center text-[10px] text-amber-400/80 italic">
            Gõ "ve" trong chat để nhận vé may mắn của riêng bạn!
          </div>
        </div>
      )}
    </div>
  );
};

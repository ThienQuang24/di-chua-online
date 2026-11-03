import React from 'react';
import { LotoTicket } from '../../services/loto/lotoEngine';

interface LotoPlayerTicketModalProps {
  ticket: LotoTicket;
  currentNumber: number | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  totalTickets?: number;
  currentIndex?: number;
}

export const LotoPlayerTicketModal: React.FC<LotoPlayerTicketModalProps> = ({
  ticket,
  currentNumber,
  onClose,
  onPrev,
  onNext,
  totalTickets = 1,
  currentIndex = 0,
}) => {
  const isWaiting = ticket.waitingNumbers.length > 0 && !ticket.hasWon;
  const isWinner = ticket.hasWon;

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full max-w-[390px] rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col gap-2.5 transition-all
          bg-gradient-to-b from-amber-950/95 via-slate-950/95 to-amber-950/95 border-2
          ${
            isWinner
              ? 'border-yellow-300 shadow-[0_0_25px_rgba(234,179,8,0.8)] ring-2 ring-yellow-400'
              : isWaiting
              ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] ring-2 ring-red-500 animate-pulse'
              : 'border-yellow-400/80 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
          }
        `}
      >
        {/* 1. HEADER TỜ VÉ: AVATAR, TÊN KHÁN GIẢ & NÚT ĐÓNG */}
        <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
          <div className="flex items-center gap-2 min-w-0">
            {/* Tag số thứ tự vé */}
            <span className="px-2 py-0.5 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-mono font-black">
              #{currentIndex + 1}/{totalTickets}
            </span>

            {/* Avatar người chơi */}
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-yellow-300 shrink-0 bg-slate-900 shadow">
              {ticket.avatarUrl ? (
                <img src={ticket.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-yellow-300">
                  {ticket.displayName.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-black text-white truncate drop-shadow">
                {ticket.displayName}
              </span>
              <span className="text-[9px] text-amber-300/80 font-mono">
                @{ticket.username}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Điểm trúng hoặc thông báo Kinh */}
            {isWinner ? (
              <span className="px-2.5 py-1 rounded-full bg-red-600 text-[10px] font-black text-white shadow-lg animate-bounce">
                👑 KINH RỒI! 🎉
              </span>
            ) : isWaiting ? (
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-[9.5px] font-black text-yellow-200 border border-yellow-300 shadow-md animate-pulse">
                🔥 CHỜ SỐ: {ticket.waitingNumbers.join(', ')}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-[10px] font-mono font-bold text-yellow-300 border border-amber-500/40 shadow-inner">
                🎯 {ticket.markedCount}/15 số
              </span>
            )}

            {/* Nút đóng vé */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs border border-slate-700 shadow transition-all active:scale-95"
              title="Đóng vé"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. BẢNG SỐ 3 HÀNG x 9 CỘT CHUẨN LÔ TÔ VIỆT NAM (TO RÕ NÉT) */}
        <div className="flex flex-col gap-1 bg-black/80 p-2 rounded-2xl border border-amber-600/40 shadow-inner">
          {ticket.grid.map((row, rIdx) => {
            const isWinningRow = ticket.winningRow === rIdx;
            const rowMarked = row.filter((c) => c.isMarked).length;

            return (
              <div
                key={rIdx}
                className={`grid grid-cols-9 gap-1 p-1 rounded-xl transition-all ${
                  isWinningRow
                    ? 'bg-red-600/30 border border-red-500 animate-pulse'
                    : 'bg-slate-900/40'
                }`}
              >
                {row.map((cell, cIdx) => {
                  const hasNumber = cell.val !== null;
                  const isJustCalled = cell.val !== null && cell.val === currentNumber;

                  return (
                    <div
                      key={cIdx}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg font-mono transition-all duration-300
                        ${
                          !hasNumber
                            ? 'bg-slate-950/50 text-transparent border border-white/5'
                            : cell.isMarked
                            ? `
                              bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white font-black
                              shadow-[0_0_10px_rgba(239,68,68,0.95)] ring-2 ring-yellow-300 scale-105 rounded-full
                              text-xs sm:text-sm
                              ${isJustCalled ? 'animate-ping' : ''}
                            `
                            : 'bg-amber-100 text-slate-950 border border-amber-300/80 font-black text-xs sm:text-sm shadow-sm'
                        }
                      `}
                    >
                      {hasNumber ? (cell.val! < 10 ? `0${cell.val}` : cell.val) : ''}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* 3. TIẾN ĐỘ TỪNG HÀNG */}
        <div className="flex items-center justify-between text-[9px] px-1 text-slate-300">
          <span className="font-mono text-amber-200">
            H1: <strong className="text-white">{ticket.grid[0].filter((c) => c.isMarked).length}/5</strong> • H2:{' '}
            <strong className="text-white">{ticket.grid[1].filter((c) => c.isMarked).length}/5</strong> • H3:{' '}
            <strong className="text-white">{ticket.grid[2].filter((c) => c.isMarked).length}/5</strong>
          </span>

          {isWaiting ? (
            <span className="text-yellow-300 font-extrabold animate-pulse">
              🚨 Chỉ thiếu 1 số là KINH!
            </span>
          ) : (
            <span className="text-slate-400">
              Đạt 5 số cùng hàng là trúng thưởng
            </span>
          )}
        </div>

        {/* 4. FOOTER ĐIỀU HƯỚNG: XEM VÉ NGƯỜI TIẾP THEO & ĐÓNG */}
        <div className="flex items-center justify-between pt-1.5 border-t border-amber-900/60">
          <div className="flex items-center gap-1.5">
            {onPrev && totalTickets > 1 && (
              <button
                onClick={onPrev}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-[10px] font-bold border border-slate-700 active:scale-95 transition-all shadow"
              >
                ◀ Vé trước
              </button>
            )}
            {onNext && totalTickets > 1 && (
              <button
                onClick={onNext}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-[10px] font-bold border border-slate-700 active:scale-95 transition-all shadow"
              >
                Vé sau ▶
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] shadow active:scale-95 transition-all"
          >
            ✕ Đóng để xem khán phòng
          </button>
        </div>
      </div>
    </div>
  );
};

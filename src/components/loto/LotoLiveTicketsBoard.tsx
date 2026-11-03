import React, { useState, useEffect, useMemo } from 'react';
import { lotoEngine, LotoTicket, LotoScreenConfig, LotoTicketLayout } from '../../services/loto/lotoEngine';

interface LotoLiveTicketsBoardProps {
  tickets: LotoTicket[];
  currentNumber: number | null;
  screenConfig: LotoScreenConfig;
  onSelectTicket?: (username: string) => void;
}

// 4 distinct traditional Vietnamese Lô Tô fairground color themes
const THEMES = [
  {
    name: 'Vàng Hoàng Kim',
    border: 'border-amber-400/80',
    headerBg: 'from-amber-600/90 via-amber-500/80 to-yellow-600/90',
    cardBg: 'from-amber-950/90 via-slate-950/95 to-amber-950/90',
    numberBg: 'bg-amber-100/95 text-slate-950 border-amber-300/80',
    badgeBg: 'bg-amber-400 text-slate-950',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]',
  },
  {
    name: 'Hồng Cánh Sen',
    border: 'border-pink-400/80',
    headerBg: 'from-rose-600/90 via-pink-500/80 to-rose-600/90',
    cardBg: 'from-rose-950/90 via-slate-950/95 to-rose-950/90',
    numberBg: 'bg-rose-100/95 text-slate-950 border-pink-300/80',
    badgeBg: 'bg-pink-400 text-slate-950',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
  },
  {
    name: 'Xanh Ngọc Bích',
    border: 'border-emerald-400/80',
    headerBg: 'from-emerald-600/90 via-teal-500/80 to-emerald-600/90',
    cardBg: 'from-emerald-950/90 via-slate-950/95 to-emerald-950/90',
    numberBg: 'bg-emerald-100/95 text-slate-950 border-emerald-300/80',
    badgeBg: 'bg-emerald-400 text-slate-950',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
  },
  {
    name: 'Tím Cẩm Lệ',
    border: 'border-purple-400/80',
    headerBg: 'from-purple-600/90 via-fuchsia-500/80 to-purple-600/90',
    cardBg: 'from-purple-950/90 via-slate-950/95 to-purple-950/90',
    numberBg: 'bg-purple-100/95 text-slate-950 border-purple-300/80',
    badgeBg: 'bg-purple-400 text-slate-950',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.35)]',
  },
];

export const LotoLiveTicketsBoard: React.FC<LotoLiveTicketsBoardProps> = ({
  tickets,
  currentNumber,
  screenConfig,
  onSelectTicket,
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Determine capacity per page based on current layout
  const pageSize = useMemo(() => {
    switch (screenConfig.layout) {
      case '1-ticket':
        return 1;
      case '2-tickets':
        return 2;
      case '6-tickets':
        return 6;
      case '4-tickets':
      default:
        return 4;
    }
  }, [screenConfig.layout]);

  // Sort and filter tickets based on display mode
  const sortedTickets = useMemo(() => {
    if (tickets.length === 0) return [];

    const list = [...tickets];

    if (screenConfig.mode === 'pinned' && screenConfig.pinnedUsernames.length > 0) {
      // Put pinned tickets first
      list.sort((a, b) => {
        const aPinned = screenConfig.pinnedUsernames.includes(a.username.toLowerCase());
        const bPinned = screenConfig.pinnedUsernames.includes(b.username.toLowerCase());
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return b.markedCount - a.markedCount;
      });
      return list;
    }

    if (screenConfig.mode === 'priority_waiting') {
      // Put players waiting for Kinh (or winners) first!
      list.sort((a, b) => {
        if (a.hasWon && !b.hasWon) return -1;
        if (!a.hasWon && b.hasWon) return 1;
        const aWait = a.waitingNumbers.length > 0 ? 1 : 0;
        const bWait = b.waitingNumbers.length > 0 ? 1 : 0;
        if (aWait !== bWait) return bWait - aWait;
        return b.markedCount - a.markedCount;
      });
      return list;
    }

    // Default: normal order
    return list;
  }, [tickets, screenConfig.mode, screenConfig.pinnedUsernames]);

  const totalPages = Math.max(1, Math.ceil(sortedTickets.length / pageSize));

  // Auto-cycle pages if enabled
  useEffect(() => {
    if (screenConfig.mode !== 'auto_cycle' || totalPages <= 1) return;

    const intervalMs = (screenConfig.cycleIntervalSeconds || 8) * 1000;
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [screenConfig.mode, screenConfig.cycleIntervalSeconds, totalPages]);

  // Ensure current page does not overflow
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  const displayedTickets = useMemo(() => {
    const start = currentPage * pageSize;
    return sortedTickets.slice(start, start + pageSize);
  }, [sortedTickets, currentPage, pageSize]);

  // Count players waiting for Kinh
  const waitingCount = useMemo(() => {
    return tickets.filter((t) => !t.hasWon && t.waitingNumbers.length > 0).length;
  }, [tickets]);

  if (!screenConfig.showOnScreenTickets) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-1.5 px-2 select-none z-30">
      {/* 1. THANH TIÊU ĐỀ BẢNG VÉ TRỰC TIẾP TRÊN MÀN HÌNH */}
      <div className="w-full flex items-center justify-between px-2.5 py-1 rounded-xl bg-black/85 border border-amber-500/50 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="text-xs animate-bounce">🎫</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 font-temple">
            VÉ LIVE ({tickets.length} vé)
          </span>
          {waitingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-[8px] font-black text-white animate-pulse shadow">
              🔥 {waitingCount} vé SẮP KINH!
            </span>
          )}
        </div>

        {/* Nút chuyển đổi layout nhanh & chuyển trang */}
        <div className="flex items-center gap-1.5">
          {totalPages > 1 && (
            <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-0.5 rounded-lg border border-slate-700 text-[9px] text-amber-200">
              <button
                onClick={() => setCurrentPage((p) => (p - 1 + totalPages) % totalPages)}
                className="hover:text-white px-0.5"
                title="Trang trước"
              >
                ◀
              </button>
              <span className="font-mono font-bold">
                {currentPage + 1}/{totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => (p + 1) % totalPages)}
                className="hover:text-white px-0.5"
                title="Trang sau"
              >
                ▶
              </button>
            </div>
          )}

          {/* Nút đổi bố cục nhanh: 2 vé hoặc 4 vé */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700 text-[8.5px]">
            <button
              onClick={() => lotoEngine.setScreenConfig({ layout: '2-tickets' })}
              className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                screenConfig.layout === '2-tickets'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="2 Vé To Rõ"
            >
              2 Vé
            </button>
            <button
              onClick={() => lotoEngine.setScreenConfig({ layout: '4-tickets' })}
              className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                screenConfig.layout === '4-tickets'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="4 Vé Chuẩn Live"
            >
              4 Vé
            </button>
          </div>
        </div>
      </div>

      {/* 2. KHU VỰC HIỂN THỊ CÁC TỜ VÉ LÔ TÔ TRỰC TIẾP */}
      {displayedTickets.length === 0 ? (
        <div className="w-full p-4 rounded-2xl bg-black/70 border border-dashed border-amber-500/40 text-center backdrop-blur-sm">
          <p className="text-xs text-amber-300 font-semibold">Chưa có vé nào trên màn hình</p>
          <button
            onClick={() => lotoEngine.seedInitialTickets(4)}
            className="mt-1.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold shadow"
          >
            + Cấp 4 Vé Mẫu Lên Màn Hình
          </button>
        </div>
      ) : (
        <div
          className={`w-full ${
            screenConfig.layout === '1-ticket'
              ? 'flex flex-col gap-2'
              : screenConfig.layout === '2-tickets'
              ? 'flex flex-col gap-2'
              : screenConfig.layout === '6-tickets'
              ? 'grid grid-cols-2 gap-1.5'
              : 'grid grid-cols-2 gap-1.5' // default '4-tickets' (2x2)
          }`}
        >
          {displayedTickets.map((ticket, idx) => {
            const theme = THEMES[idx % THEMES.length];
            const isWaiting = ticket.waitingNumbers.length > 0 && !ticket.hasWon;
            const isWinner = ticket.hasWon;
            const isLarge = screenConfig.layout === '2-tickets' || screenConfig.layout === '1-ticket';

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket?.(ticket.username)}
                className={`
                  relative rounded-xl border flex flex-col overflow-hidden transition-all duration-300 cursor-pointer
                  bg-gradient-to-b ${theme.cardBg} ${theme.glow}
                  ${
                    isWinner
                      ? 'border-yellow-300 ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.8)] scale-[1.01]'
                      : isWaiting
                      ? 'border-red-500 ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse'
                      : `${theme.border} hover:border-white/60`
                  }
                  ${isLarge ? 'p-1.5 sm:p-2' : 'p-1'}
                `}
              >
                {/* Header tờ vé */}
                <div
                  className={`
                    w-full flex items-center justify-between rounded-lg px-2 py-0.5 mb-1
                    bg-gradient-to-r ${theme.headerBg} text-white shadow-sm
                  `}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="px-1 py-0.2 rounded bg-black/40 text-[8.5px] font-black font-mono">
                      #{idx + 1 + currentPage * pageSize}
                    </span>

                    {/* Avatar người chơi */}
                    <div className="w-4 h-4 rounded-full overflow-hidden border border-white/60 shrink-0 bg-slate-900">
                      {ticket.avatarUrl ? (
                        <img
                          src={ticket.avatarUrl}
                          alt={ticket.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-yellow-300">
                          {ticket.displayName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <span
                      className={`font-black truncate drop-shadow text-white ${
                        isLarge ? 'text-[11px] max-w-[140px]' : 'text-[9.5px] max-w-[95px]'
                      }`}
                    >
                      {ticket.displayName}
                    </span>
                  </div>

                  {/* Huy hiệu điểm trúng hoặc trạng thái KINH */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isWinner ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-[8px] font-black text-white shadow animate-bounce">
                        👑 KINH RỒI!
                      </span>
                    ) : isWaiting ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-red-700 text-[8px] font-black text-yellow-200 border border-yellow-300 shadow animate-pulse">
                        🔥 CHỜ {ticket.waitingNumbers.slice(0, 2).map((n) => (n < 10 ? `0${n}` : n)).join(',')}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded-full bg-black/50 text-[8px] font-mono font-bold text-amber-200">
                        {ticket.markedCount}/15
                      </span>
                    )}
                  </div>
                </div>

                {/* BẢNG 3 HÀNG x 9 CỘT CHUẨN LÔ TÔ VIỆT NAM */}
                <div className="flex flex-col gap-0.5 bg-black/60 p-0.5 rounded-lg border border-white/10">
                  {ticket.grid.map((row, rIdx) => {
                    const isWinningRow = ticket.winningRow === rIdx;
                    return (
                      <div
                        key={rIdx}
                        className={`grid grid-cols-9 gap-0.5 rounded ${
                          isWinningRow ? 'bg-red-600/30 border border-red-500 animate-pulse' : ''
                        }`}
                      >
                        {row.map((cell, cIdx) => {
                          const isJustCalled = cell.val !== null && cell.val === currentNumber;
                          const hasNumber = cell.val !== null;

                          return (
                            <div
                              key={cIdx}
                              className={`
                                flex items-center justify-center rounded font-mono transition-all duration-300
                                ${isLarge ? 'h-7 text-xs sm:text-sm font-black' : 'h-4 text-[8px] font-bold'}
                                ${
                                  !hasNumber
                                    ? 'bg-slate-950/40 text-transparent border border-transparent'
                                    : cell.isMarked
                                    ? `
                                      bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white font-black
                                      shadow-[0_0_8px_rgba(239,68,68,0.95)] ring-1 ring-yellow-300 scale-[1.03] rounded-full
                                      ${isJustCalled ? 'animate-ping' : ''}
                                    `
                                    : `${theme.numberBg} shadow-sm`
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

                {/* Dòng trạng thái đáy vé */}
                <div className="mt-1 flex items-center justify-between text-[8px] px-1 text-slate-300 font-medium">
                  <span className="text-amber-200/90 font-mono">
                    H1: {ticket.grid[0].filter((c) => c.isMarked).length}/5 • H2:{' '}
                    {ticket.grid[1].filter((c) => c.isMarked).length}/5 • H3:{' '}
                    {ticket.grid[2].filter((c) => c.isMarked).length}/5
                  </span>
                  {isWaiting && (
                    <span className="text-yellow-300 font-bold animate-pulse">
                      ⚡ Sắp trúng!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

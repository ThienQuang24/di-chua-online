import React from 'react';

export interface LotoCell {
  val: number | null;
  isMarked: boolean;
}

export interface MobileLotoTicket {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  grid: LotoCell[][];
  markedCount: number;
  waitingNumbers: number[];
  hasWon: boolean;
  winningRow?: number;
  isVip?: boolean;
  vipGiftName?: string;
}

export interface LotoServerState {
  roundId: number;
  calledNumbers: number[];
  currentNumber: number | null;
  currentChant: string;
  isSpinning: boolean;
  lastWinner: any | null;
}

export const playMobileSfx = (type: 'stamp' | 'match' | 'win') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === 'stamp') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'match') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'square';
        o.frequency.setValueAtTime(freq, now + idx * 0.12);
        g.gain.setValueAtTime(0.25, now + idx * 0.12);
        g.gain.linearRampToValueAtTime(0.01, now + idx * 0.12 + 0.25);
        o.start(now + idx * 0.12);
        o.stop(now + idx * 0.12 + 0.25);
      });
    }
  } catch {}
};

export const recalculateTicketGrid = (grid: LotoCell[][]) => {
  let total = 0;
  const waiting: number[] = [];
  let won = false;
  let winRow: number | undefined;
  for (let r = 0; r < 3; r++) {
    let rowCount = 0;
    let miss: number | null = null;
    for (let c = 0; c < 9; c++) {
      const cell = grid[r][c];
      if (cell.val !== null) {
        if (cell.isMarked) {
          rowCount++;
          total++;
        } else {
          miss = cell.val;
        }
      }
    }
    if (rowCount === 5) {
      won = true;
      winRow = r;
    } else if (rowCount === 4 && miss !== null) {
      waiting.push(miss);
    }
  }
  return { markedCount: total, waitingNumbers: waiting, hasWon: won, winningRow: winRow };
};

export const MobileTicketEntryForm: React.FC<{
  inputName: string;
  setInputName: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSelectPreset: (name: string) => void;
}> = ({ inputName, setInputName, onSubmit, onSelectPreset }) => (
  <div className="min-h-screen bg-[#0d0705] text-amber-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
    <div className="w-full max-w-sm bg-gradient-to-b from-[#221008] via-[#1a0c07] to-[#0f0704] border-2 border-yellow-500/70 rounded-3xl p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col items-center text-center">
      <div className="text-5xl animate-bounce mb-2">🎪 🎫 🎪</div>
      <h1 className="text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow">
        GÁNH HÁT LÔ TÔ
      </h1>
      <p className="text-xs text-amber-300/80 mt-1 uppercase tracking-widest font-semibold">
        Bàn Dò Vé Điện Tử Tương Tác
      </p>
      <p className="text-xs text-slate-300 mt-4 leading-relaxed">
        Nhập tên TikTok của bạn để nhận <strong>1 tờ vé riêng biệt</strong>, tự động dò số thời gian thực đồng bộ với Livestream!
      </p>

      <form onSubmit={onSubmit} className="w-full mt-5 flex flex-col gap-3">
        <input
          type="text" value={inputName} onChange={(e) => setInputName(e.target.value)}
          placeholder="Nhập tên TikTok của bạn..." autoFocus
          className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-yellow-500/50 text-white placeholder-slate-500 font-bold text-center focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 text-sm"
        />
        <button
          type="submit" disabled={!inputName.trim()}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:brightness-110 disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          🎲 Nhận Vé May Mắn Ngay!
        </button>
      </form>

      <div className="w-full mt-4 pt-4 border-t border-amber-900/40">
        <p className="text-[10px] text-amber-400/70 mb-2">Hoặc chọn nhanh tên thử nghiệm:</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {['Hương Giang', 'Minh Tuấn', 'Bảo Ngọc', 'Hoàng Nam', 'Khánh Linh'].map((n) => (
            <button key={n} onClick={() => onSelectPreset(n)} className="px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-700/40 text-[10px] text-amber-200 hover:bg-amber-900">
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const MobileTicketCardGrid: React.FC<{
  ticket: MobileLotoTicket | null;
  currentNumber: number | null;
  onCellClick: (rIdx: number, cIdx: number) => void;
}> = ({ ticket, currentNumber, onCellClick }) => {
  if (!ticket) {
    return (
      <div className="p-8 text-center bg-black/60 rounded-3xl border border-amber-500/40">
        <div className="text-2xl animate-spin mb-2">⏳</div>
        <p className="text-xs text-amber-200">Đang chuẩn bị tờ vé số của bạn...</p>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-b from-[#2a1708] via-[#1c0f06] to-[#120803] p-2 border-2 ${
        ticket.isVip
          ? 'border-yellow-300 shadow-[0_0_28px_rgba(250,204,21,0.55)] ring-1 ring-yellow-400'
          : 'border-yellow-500/80 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
      }`}
    >
      <div className="flex items-center justify-between pb-1 mb-1 border-b border-amber-900/60 text-xs px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{ticket.isVip ? '👑' : '🎫'}</span>
          <span className="font-black text-yellow-300 uppercase tracking-wider font-temple text-[10px]">
            {ticket.isVip ? 'VÉ VÀNG ĐẠI GIA VIP' : 'VÉ SỐ MAY MẮN'}
          </span>
        </div>
        <div className="text-[9px] text-amber-300/80 font-mono">ID: {ticket.id.slice(-8)}</div>
      </div>

      <div className="grid grid-cols-9 gap-0.5 mb-1 text-center text-[7.5px] font-black text-amber-400/80 uppercase">
        <span>1-9</span><span>1x</span><span>2x</span><span>3x</span><span>4x</span><span>5x</span><span>6x</span><span>7x</span><span>8-90</span>
      </div>

      <div className="flex flex-col gap-0.5 bg-black/90 p-1 rounded-xl border border-yellow-500/50">
        {ticket.grid.map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-9 gap-0.5">
            {row.map((cell, cIdx) => {
              const isHit = cell.val !== null && cell.isMarked;
              const isCurrent = cell.val !== null && cell.val === currentNumber;
              return (
                <button
                  key={cIdx}
                  type="button"
                  onClick={() => onCellClick(rIdx, cIdx)}
                  disabled={cell.val === null}
                  className={`w-full aspect-square p-0 rounded flex items-center justify-center font-mono font-black text-[11px] leading-none transition-all duration-150 relative select-none ${
                    cell.val === null
                      ? 'bg-amber-950/20 border border-amber-900/10 text-transparent cursor-default'
                      : isHit
                      ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-yellow-100 border border-yellow-300 shadow-[0_0_8px_#ef4444] scale-95'
                      : 'bg-slate-900 text-slate-100 border border-slate-700/70 hover:border-amber-400 active:scale-95'
                  } ${isCurrent ? 'ring-2 ring-yellow-300 animate-pulse' : ''}`}
                >
                  {cell.val !== null && (
                    <>
                      <span>{cell.val < 10 ? `0${cell.val}` : cell.val}</span>
                      {isHit && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-yellow-400 text-slate-950 text-[6.5px] flex items-center justify-center font-black shadow">✓</span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-3 gap-1">
        {ticket.grid.map((row, rIdx) => {
          const markedInRow = row.filter((c) => c.val !== null && c.isMarked).length;
          const isRowWon = markedInRow === 5;
          const isRowWaiting = markedInRow === 4;
          return (
            <div
              key={rIdx}
              className={`px-1 py-0.5 rounded-lg border text-[8px] font-bold text-center flex flex-col items-center justify-center ${
                isRowWon ? 'bg-red-950/80 border-red-500 text-red-300 animate-bounce' : isRowWaiting ? 'bg-amber-950/80 border-amber-500 text-amber-200 animate-pulse' : 'bg-black/60 border-slate-800 text-slate-400'
              }`}
            >
              <span className="text-[7px] uppercase tracking-wider text-slate-400">Hàng {rIdx + 1}</span>
              <span className="font-mono font-black text-[9px] text-yellow-300">
                {isRowWon ? '👑 KINH!' : isRowWaiting ? '🔥 CHỜ KINH' : `${markedInRow}/5`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 text-center text-[8.5px] text-amber-400/80">
        💡 Chạm vào số để tự khoanh tròn hoặc để hệ thống tự động dò
      </div>
    </div>
  );
};

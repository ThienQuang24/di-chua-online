import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LotoCell {
  val: number | null;
  isMarked: boolean;
}

interface LotoTicket {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  grid: LotoCell[][];
  markedCount: number;
  waitingNumbers: number[];
  hasWon: boolean;
  winningRow?: number;
}

interface LotoServerState {
  roundId: number;
  calledNumbers: number[];
  currentNumber: number | null;
  currentChant: string;
  isSpinning: boolean;
  lastWinner: any | null;
}

// Simple Web Audio Synthesizer for rich audio feedback without extra file assets
const playSfx = (type: 'stamp' | 'match' | 'win') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
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
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
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
  } catch {
    // AudioContext blocked by browser policy before user interaction
  }
};

export const MobileLotoTicketView: React.FC = () => {
  const [username, setUsername] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlUser = params.get('u') || params.get('user') || params.get('name');
      if (urlUser) return urlUser;
      return localStorage.getItem('loto_username') || '';
    }
    return '';
  });

  const [inputName, setInputName] = useState<string>('');
  const [ticket, setTicket] = useState<LotoTicket | null>(null);
  const [lotoState, setLotoState] = useState<LotoServerState>({
    roundId: 1,
    calledNumbers: [],
    currentNumber: null,
    currentChant: 'Đang kết nối bàn quay Lô Tô...',
    isSpinning: false,
    lastWinner: null,
  });

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const prevCalledCountRef = useRef<number>(0);

  // Fetch or issue ticket for current user
  const fetchTicket = async (userToFetch: string) => {
    if (!userToFetch.trim()) return;
    try {
      const res = await fetch(`/api/loto/ticket?user=${encodeURIComponent(userToFetch.trim())}`);
      const data = await res.json();
      if (data.success && data.ticket) {
        setTicket(data.ticket);
        if (data.lotoState) setLotoState(data.lotoState);
      }
    } catch (err) {
      console.error('Lỗi tải vé Lô Tô:', err);
    }
  };

  // Initial load
  useEffect(() => {
    if (username) {
      fetchTicket(username);
      localStorage.setItem('loto_username', username);
    }
  }, [username]);

  // Real-time synchronization via SSE
  useEffect(() => {
    const eventSource = new EventSource('/api/tiktok/events');

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    eventSource.addEventListener('loto_update', (e) => {
      try {
        const data: LotoServerState = JSON.parse(e.data);
        setLotoState(data);

        // Check if a new number was just called
        if (data.calledNumbers.length > prevCalledCountRef.current) {
          prevCalledCountRef.current = data.calledNumbers.length;
          const newestNumber = data.currentNumber;

          // Check if user has this number on their ticket
          setTicket((prevTicket) => {
            if (!prevTicket) return prevTicket;
            let matched = false;
            const updatedGrid = prevTicket.grid.map((row) =>
              row.map((cell) => {
                if (cell.val === newestNumber) {
                  matched = true;
                  return { ...cell, isMarked: true };
                }
                return cell;
              })
            );

            if (matched) {
              if (soundEnabled) playSfx('match');
              if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            }

            // Recalculate status
            let total = 0;
            const waiting: number[] = [];
            let won = false;
            let winRow: number | undefined;

            for (let r = 0; r < 3; r++) {
              let rowCount = 0;
              let miss: number | null = null;
              for (let c = 0; c < 9; c++) {
                const cell = updatedGrid[r][c];
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

            return {
              ...prevTicket,
              grid: updatedGrid,
              markedCount: total,
              waitingNumbers: waiting,
              hasWon: won,
              winningRow: winRow,
            };
          });
        }

        // If new round started, reload ticket
        if (data.roundId !== lotoState.roundId && username) {
          fetchTicket(username);
        }
      } catch (err) {
        console.error('Lỗi nhận dữ liệu Lô Tô SSE:', err);
      }
    });

    eventSource.addEventListener('loto_win', (e) => {
      try {
        const winner = JSON.parse(e.data);
        setLotoState((prev) => ({ ...prev, lastWinner: winner }));
      } catch (err) {
        console.error('Lỗi nhận tin thắng cuộc:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [username, soundEnabled, lotoState.roundId]);

  // Handle manual toggle of cell marking (for tactile feeling)
  const handleCellClick = (rIdx: number, cIdx: number) => {
    if (!ticket) return;
    const cell = ticket.grid[rIdx][cIdx];
    if (cell.val === null) return;

    if (soundEnabled) playSfx('stamp');

    setTicket((prev) => {
      if (!prev) return prev;
      const nextGrid = prev.grid.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === rIdx && ci === cIdx) {
            return { ...c, isMarked: !c.isMarked };
          }
          return c;
        })
      );

      let total = 0;
      const waiting: number[] = [];
      let won = false;
      let winRow: number | undefined;

      for (let r = 0; r < 3; r++) {
        let rowCount = 0;
        let miss: number | null = null;
        for (let c = 0; c < 9; c++) {
          const item = nextGrid[r][c];
          if (item.val !== null) {
            if (item.isMarked) {
              rowCount++;
              total++;
            } else {
              miss = item.val;
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

      return {
        ...prev,
        grid: nextGrid,
        markedCount: total,
        waitingNumbers: waiting,
        hasWon: won,
        winningRow: winRow,
      };
    });
  };

  // Submit "HÔ KINH" to server
  const handleClaimWin = async () => {
    if (!username || !ticket || isClaiming) return;
    setIsClaiming(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/loto/claim-win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimSuccess(true);
        if (soundEnabled) playSfx('win');
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
      } else {
        setErrorMessage(data.error || 'Chưa đủ điều kiện để Kinh!');
      }
    } catch {
      setErrorMessage('Không thể gửi tín hiệu tới bàn quay. Vui lòng thử lại!');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleRegisterName = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUsername(inputName.trim());
      setInputName('');
    }
  };

  // 1. DIALOG NHẬP TÊN NẾU CHƯA CÓ USERNAME
  if (!username) {
    return (
      <div className="min-h-screen bg-[#0d0705] text-amber-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
        {/* Họa tiết lồng đèn phía trên */}
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

          <form onSubmit={handleRegisterName} className="w-full mt-5 flex flex-col gap-3">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Nhập tên TikTok của bạn..."
              autoFocus
              className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-yellow-500/50 text-white placeholder-slate-500 font-bold text-center focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 text-sm"
            />
            <button
              type="submit"
              disabled={!inputName.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:brightness-110 disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              🎲 Nhận Vé May Mắn Ngay!
            </button>
          </form>

          {/* Gợi ý tên nhanh */}
          <div className="w-full mt-4 pt-4 border-t border-amber-900/40">
            <p className="text-[10px] text-amber-400/70 mb-2">Hoặc chọn nhanh tên thử nghiệm:</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {['Hương Giang', 'Minh Tuấn', 'Bảo Ngọc', 'Hoàng Nam', 'Khánh Linh'].map((n) => (
                <button
                  key={n}
                  onClick={() => setUsername(n)}
                  className="px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-700/40 text-[10px] text-amber-200 hover:bg-amber-900"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. MÀN HÌNH VÉ LÔ TÔ CHÍNH TRÊN ĐIỆN THOẠI
  return (
    <div className="min-h-screen bg-[#0d0705] text-amber-100 flex flex-col items-center justify-between pb-6 px-2 select-none overflow-x-hidden">
      {/* 2.1 HEADER VÁN CỜ & TRẠNG THÁI KẾT NỐI */}
      <div className="w-full max-w-[350px] pt-2.5 flex flex-col items-center gap-1.5">
        <div className="w-full flex items-center justify-between px-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-slate-300 font-medium text-[9.5px]">
              {isConnected ? '🟢 Đồng bộ bàn quay' : '🔴 Đang kết nối...'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="text-[9.5px] px-2 py-0.5 rounded bg-black/60 border border-amber-500/30 text-amber-300"
              title="Bật/Tắt âm thanh"
            >
              {soundEnabled ? '🔊 Âm thanh' : '🔇 Tắt âm'}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('loto_username');
                setUsername('');
              }}
              className="text-[9px] text-slate-400 hover:text-white underline"
            >
              Đổi tên
            </button>
          </div>
        </div>

        {/* Thanh tiêu đề lễ hội */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-red-700 via-amber-600 to-red-700 p-2 shadow-md border border-yellow-300/80 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎪</span>
            <div>
              <h1 className="text-[11px] font-black uppercase text-white drop-shadow font-temple tracking-wide">
                GÁNH HÁT LÔ TÔ HỘI CHỢ
              </h1>
              <p className="text-[8.5px] text-yellow-200 font-medium">
                Khán giả: <strong className="text-white">{ticket?.displayName || username}</strong> • Ván #{lotoState.roundId}
              </p>
            </div>
          </div>
          <div className="bg-black/60 px-2 py-0.5 rounded-xl border border-yellow-400/60 text-right">
            <div className="text-[7.5px] text-amber-300 uppercase font-bold">Đã trúng</div>
            <div className="text-xs font-black text-yellow-300 font-mono">
              {ticket?.markedCount || 0}/15
            </div>
          </div>
        </div>

        {/* Khung số vừa gọi thời gian thực */}
        <div className="w-full bg-black/80 rounded-2xl p-2 border border-amber-500/50 shadow-inner flex items-center justify-between gap-2">
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[8.5px] text-amber-400 font-bold uppercase tracking-wider">
              {lotoState.isSpinning ? '🎲 Lồng cầu đang quay...' : 'Quả Cầu Vừa Gọi:'}
            </span>
            <div className="text-[9.5px] text-slate-300 italic truncate">
              "{lotoState.currentChant || 'Chúc bạn may mắn!'}"
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {lotoState.currentNumber !== null ? (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-300 via-red-500 to-amber-500 border-2 border-yellow-200 shadow-[0_0_12px_#f59e0b] flex items-center justify-center text-base font-black text-white font-mono animate-bounce">
                {lotoState.currentNumber < 10 ? `0${lotoState.currentNumber}` : lotoState.currentNumber}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                --
              </div>
            )}
          </div>
        </div>

        {/* Dải 6 số gọi gần nhất */}
        <div className="w-full flex items-center gap-1 overflow-x-auto py-0.5 px-0.5 scrollbar-none text-[8.5px]">
          <span className="text-slate-400 whitespace-nowrap font-bold">Vừa gọi:</span>
          {lotoState.calledNumbers.length === 0 ? (
            <span className="text-slate-500 italic">Chưa gọi số nào</span>
          ) : (
            lotoState.calledNumbers.slice(-6).reverse().map((num, i) => (
              <span
                key={num}
                className={`px-1.5 py-0.5 rounded font-black font-mono shadow ${
                  i === 0
                    ? 'bg-red-600 text-white border border-yellow-300 scale-105'
                    : 'bg-slate-900 text-amber-200 border border-slate-800'
                }`}
              >
                {num < 10 ? `0${num}` : num}
              </span>
            ))
          )}
        </div>
      </div>

      {/* 2.2 TỜ VÉ LÔ TÔ TRUYỀN THỐNG VIỆT NAM (3 DÒNG X 9 CỘT) */}
      <div className="w-full max-w-[350px] my-auto pt-1.5">
        {ticket ? (
          <div className="relative rounded-2xl bg-gradient-to-b from-[#2a1708] via-[#1c0f06] to-[#120803] p-2 border-2 border-yellow-500/80 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
            {/* Header tờ vé */}
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-amber-900/60 text-xs px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🎫</span>
                <span className="font-black text-yellow-300 uppercase tracking-wider font-temple text-[10px]">
                  VÉ SỐ MAY MẮN
                </span>
              </div>
              <div className="text-[9px] text-amber-300/80 font-mono">
                ID: {ticket.id.slice(-8)}
              </div>
            </div>

            {/* Tiêu đề 9 cột phân nhóm số 1-90 */}
            <div className="grid grid-cols-9 gap-0.5 mb-1 text-center text-[7.5px] font-black text-amber-400/80 uppercase">
              <span>1-9</span>
              <span>1x</span>
              <span>2x</span>
              <span>3x</span>
              <span>4x</span>
              <span>5x</span>
              <span>6x</span>
              <span>7x</span>
              <span>8-90</span>
            </div>

            {/* Bảng 3 hàng x 9 cột chuẩn Việt Nam */}
            <div className="flex flex-col gap-0.5 bg-black/90 p-1 rounded-xl border border-yellow-500/50">
              {ticket.grid.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-9 gap-0.5">
                  {row.map((cell, cIdx) => {
                    const isHit = cell.val !== null && cell.isMarked;
                    const isCurrent = cell.val !== null && cell.val === lotoState.currentNumber;

                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => handleCellClick(rIdx, cIdx)}
                        disabled={cell.val === null}
                        className={`
                          w-full aspect-square p-0 rounded flex items-center justify-center font-mono font-black text-[11px] leading-none transition-all duration-150 relative select-none
                          ${
                            cell.val === null
                              ? 'bg-amber-950/20 border border-amber-900/10 text-transparent cursor-default'
                              : isHit
                              ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-yellow-100 border border-yellow-300 shadow-[0_0_8px_#ef4444] scale-95'
                              : 'bg-slate-900 text-slate-100 border border-slate-700/70 hover:border-amber-400 active:scale-95'
                          }
                          ${isCurrent ? 'ring-2 ring-yellow-300 animate-pulse' : ''}
                        `}
                      >
                        {cell.val !== null ? (
                          <>
                            <span>{cell.val < 10 ? `0${cell.val}` : cell.val}</span>
                            {isHit && (
                              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-yellow-400 text-slate-950 text-[6.5px] flex items-center justify-center font-black shadow">
                                ✓
                              </span>
                            )}
                          </>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Thanh tiến độ 3 hàng gọn gàng bên dưới vé */}
            <div className="mt-1.5 grid grid-cols-3 gap-1">
              {ticket.grid.map((row, rIdx) => {
                const markedInRow = row.filter((c) => c.val !== null && c.isMarked).length;
                const isRowWon = markedInRow === 5;
                const isRowWaiting = markedInRow === 4;

                return (
                  <div
                    key={rIdx}
                    className={`
                      px-1 py-0.5 rounded-lg border text-[8px] font-bold text-center flex flex-col items-center justify-center
                      ${
                        isRowWon
                          ? 'bg-red-950/80 border-red-500 text-red-300 animate-bounce'
                          : isRowWaiting
                          ? 'bg-amber-950/80 border-amber-500 text-amber-200 animate-pulse'
                          : 'bg-black/60 border-slate-800 text-slate-400'
                      }
                    `}
                  >
                    <span className="text-[7px] uppercase tracking-wider text-slate-400">Hàng {rIdx + 1}</span>
                    <span className="font-mono font-black text-[9px] text-yellow-300">
                      {isRowWon ? '👑 KINH!' : isRowWaiting ? '🔥 CHỜ KINH' : `${markedInRow}/5`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Lời nhắc chạm để chấm vé */}
            <div className="mt-1.5 text-center text-[8.5px] text-amber-400/80">
              💡 Chạm vào số để tự khoanh tròn hoặc để hệ thống tự động dò
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-black/60 rounded-3xl border border-amber-500/40">
            <div className="text-2xl animate-spin mb-2">⏳</div>
            <p className="text-xs text-amber-200">Đang chuẩn bị tờ vé số của bạn...</p>
          </div>
        )}
      </div>

      {/* 2.3 KHỐI NÚT HÔ KINH HOẶC TRẠNG THÁI */}
      <div className="w-full max-w-[350px] pt-2 flex flex-col gap-1.5">
        {errorMessage && (
          <div className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs text-center font-semibold animate-shake">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* NÚT HÔ KINH TỎA SÁNG KHI ĐỦ 5 SỐ */}
        {ticket && ticket.hasWon ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClaimWin}
            disabled={isClaiming || claimSuccess}
            className={`
              w-full py-4 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2 transition-all
              ${
                claimSuccess
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-gradient-to-r from-red-600 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_30px_#f59e0b] border-2 border-yellow-200 animate-pulse'
              }
            `}
          >
            <span>👑</span>
            <span>
              {claimSuccess
                ? 'ĐÃ HÔ KINH THÀNH CÔNG! 🎉'
                : isClaiming
                ? 'Đang gửi tín hiệu...'
                : 'BẤM ĐỂ HÔ KINH NGAY! (TRÚNG RỒI)'}
            </span>
            <span>👑</span>
          </motion.button>
        ) : (
          <div className="w-full py-3 rounded-2xl bg-black/70 border border-amber-900/60 text-center text-xs text-amber-300 font-semibold flex items-center justify-center gap-2">
            <span>🎯</span>
            <span>
              {ticket && ticket.waitingNumbers.length > 0
                ? `ĐANG CHỜ SỐ: ${ticket.waitingNumbers.map((n) => (n < 10 ? `0${n}` : n)).join(', ')}`
                : 'Đang dò vé... Chúc bạn may mắn nổ Kinh!'}
            </span>
          </div>
        )}

        {/* Thông báo nếu đã hô Kinh thành công */}
        {claimSuccess && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-900/90 to-red-900/90 border border-yellow-400 text-center text-xs text-yellow-200 font-bold shadow-lg animate-in zoom-in-95">
            🎉 Bạn đã hô KINH thành công! Hãy theo dõi trên màn hình Livestream để nhận vinh danh nhé!
          </div>
        )}
      </div>

      {/* POPUP PHÁO HOA KHI THẮNG */}
      <AnimatePresence>
        {claimSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 350,
                  y: (Math.random() - 0.5) * 600,
                  scale: Math.random() * 2 + 1,
                  opacity: 0,
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: (i % 5) * 0.2 }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#eab308'][i % 6],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

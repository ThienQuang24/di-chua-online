import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../services/apiClient';
import {
  MobileLotoTicket, LotoServerState, playMobileSfx, recalculateTicketGrid,
  MobileTicketEntryForm, MobileTicketCardGrid,
} from './MobileTicketCardGrid';
import { MobileTicketBottomActions } from './MobileTicketBottomActions';

export const MobileLotoTicketView: React.FC = () => {
  const [username, setUsername] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('u') || params.get('user') || params.get('name') || localStorage.getItem('loto_username') || '';
    }
    return '';
  });

  const [inputName, setInputName] = useState<string>('');
  const [ticket, setTicket] = useState<MobileLotoTicket | null>(null);
  const [lotoState, setLotoState] = useState<LotoServerState>({
    roundId: 1, calledNumbers: [], currentNumber: null,
    currentChant: 'Đang kết nối bàn quay Lô Tô...', isSpinning: false, lastWinner: null,
  });

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [myPrediction, setMyPrediction] = useState<'chan' | 'le' | null>(null);
  const prevCalledCountRef = useRef<number>(0);

  const handlePredict = async (choice: 'chan' | 'le') => {
    if (!username) return;
    setMyPrediction(choice);
    if (soundEnabled) playMobileSfx('stamp');
    await apiClient.submitLotoPrediction(username, choice).catch(() => {});
  };

  const fetchTicket = async (userToFetch: string) => {
    if (!userToFetch.trim()) return;
    try {
      const data = await apiClient.fetchMobileTicket(userToFetch.trim());
      if (data.success && data.ticket) {
        setTicket(data.ticket);
        if (data.lotoState) setLotoState(data.lotoState);
      }
    } catch {}
  };

  useEffect(() => {
    if (username) {
      fetchTicket(username);
      localStorage.setItem('loto_username', username);
    }
  }, [username]);

  useEffect(() => {
    const eventSource = new EventSource('/api/tiktok/events');
    eventSource.onopen = () => setIsConnected(true);
    eventSource.onerror = () => setIsConnected(false);

    eventSource.addEventListener('loto_update', (e) => {
      try {
        const data: LotoServerState = JSON.parse(e.data);
        setLotoState(data);

        if (data.calledNumbers.length > prevCalledCountRef.current) {
          prevCalledCountRef.current = data.calledNumbers.length;
          const newestNumber = data.currentNumber;
          setTicket((prevTicket) => {
            if (!prevTicket) return prevTicket;
            let matched = false;
            const updatedGrid = prevTicket.grid.map((row) =>
              row.map((cell) => {
                if (cell.val === newestNumber) { matched = true; return { ...cell, isMarked: true }; }
                return cell;
              })
            );
            if (matched) {
              if (soundEnabled) playMobileSfx('match');
              if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            }
            return { ...prevTicket, grid: updatedGrid, ...recalculateTicketGrid(updatedGrid) };
          });
        }
        if (data.roundId !== lotoState.roundId && username) fetchTicket(username);
      } catch {}
    });

    eventSource.addEventListener('loto_win', (e) => {
      try { setLotoState((prev) => ({ ...prev, lastWinner: JSON.parse(e.data) })); } catch {}
    });

    return () => eventSource.close();
  }, [username, soundEnabled, lotoState.roundId]);

  const handleCellClick = (rIdx: number, cIdx: number) => {
    if (!ticket || ticket.grid[rIdx][cIdx].val === null) return;
    if (soundEnabled) playMobileSfx('stamp');
    setTicket((prev) => {
      if (!prev) return prev;
      const nextGrid = prev.grid.map((r, ri) =>
        r.map((c, ci) => (ri === rIdx && ci === cIdx ? { ...c, isMarked: !c.isMarked } : c))
      );
      return { ...prev, grid: nextGrid, ...recalculateTicketGrid(nextGrid) };
    });
  };

  const handleClaimWin = async () => {
    if (!username || !ticket || isClaiming) return;
    setIsClaiming(true);
    setErrorMessage('');
    try {
      const data = await apiClient.claimMobileWin(username);
      if (data.success) {
        setClaimSuccess(true);
        if (soundEnabled) playMobileSfx('win');
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

  if (!username) {
    return (
      <MobileTicketEntryForm
        inputName={inputName} setInputName={setInputName}
        onSubmit={(e) => { e.preventDefault(); if (inputName.trim()) { setUsername(inputName.trim()); setInputName(''); } }}
        onSelectPreset={(n) => setUsername(n)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0705] text-amber-100 flex flex-col items-center justify-between pb-6 px-2 select-none overflow-x-hidden">
      <div className="w-full max-w-[350px] pt-2.5 flex flex-col items-center gap-1.5">
        <div className="w-full flex items-center justify-between px-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-slate-300 font-medium text-[9.5px]">{isConnected ? '🟢 Đồng bộ bàn quay' : '🔴 Đang kết nối...'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSoundEnabled((prev) => !prev)} className="text-[9.5px] px-2 py-0.5 rounded bg-black/60 border border-amber-500/30 text-amber-300">
              {soundEnabled ? '🔊 Âm thanh' : '🔇 Tắt âm'}
            </button>
            <button onClick={() => { localStorage.removeItem('loto_username'); setUsername(''); }} className="text-[9px] text-slate-400 hover:text-white underline">Đổi tên</button>
          </div>
        </div>

        <div className="w-full rounded-2xl bg-gradient-to-r from-red-700 via-amber-600 to-red-700 p-2 shadow-md border border-yellow-300/80 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎪</span>
            <div>
              <h1 className="text-[11px] font-black uppercase text-white drop-shadow font-temple tracking-wide">GÁNH HÁT LÔ TÔ HỘI CHỢ</h1>
              <p className="text-[8.5px] text-yellow-200 font-medium">Khán giả: <strong className="text-white">{ticket?.displayName || username}</strong> • Ván #{lotoState.roundId}</p>
            </div>
          </div>
          <div className="bg-black/60 px-2 py-0.5 rounded-xl border border-yellow-400/60 text-right">
            <div className="text-[7.5px] text-amber-300 uppercase font-bold">Đã trúng</div>
            <div className="text-xs font-black text-yellow-300 font-mono">{ticket?.markedCount || 0}/15</div>
          </div>
        </div>

        <div className="w-full bg-black/80 rounded-2xl p-2 border border-amber-500/50 shadow-inner flex items-center justify-between gap-2">
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[8.5px] text-amber-400 font-bold uppercase tracking-wider">{lotoState.isSpinning ? '🎲 Lồng cầu đang quay...' : 'Quả Cầu Vừa Gọi:'}</span>
            <div className="text-[9.5px] text-slate-300 italic truncate">"{lotoState.currentChant || 'Chúc bạn may mắn!'}"</div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {lotoState.currentNumber !== null ? (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-300 via-red-500 to-amber-500 border-2 border-yellow-200 shadow-[0_0_12px_#f59e0b] flex items-center justify-center text-base font-black text-white font-mono animate-bounce">
                {lotoState.currentNumber < 10 ? `0${lotoState.currentNumber}` : lotoState.currentNumber}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-mono">--</div>
            )}
          </div>
        </div>

        <div className="w-full flex items-center gap-1 overflow-x-auto py-0.5 px-0.5 scrollbar-none text-[8.5px]">
          <span className="text-slate-400 whitespace-nowrap font-bold">Vừa gọi:</span>
          {lotoState.calledNumbers.length === 0 ? (
            <span className="text-slate-500 italic">Chưa gọi số nào</span>
          ) : (
            lotoState.calledNumbers.slice(-6).reverse().map((num, i) => (
              <span key={num} className={`px-1.5 py-0.5 rounded font-black font-mono shadow ${i === 0 ? 'bg-red-600 text-white border border-yellow-300 scale-105' : 'bg-slate-900 text-amber-200 border border-slate-800'}`}>
                {num < 10 ? `0${num}` : num}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="w-full max-w-[350px] my-auto pt-1.5">
        <MobileTicketCardGrid ticket={ticket} currentNumber={lotoState.currentNumber} onCellClick={handleCellClick} />
      </div>

      <MobileTicketBottomActions
        ticket={ticket}
        myPrediction={myPrediction}
        onPredict={handlePredict}
        errorMessage={errorMessage}
        isClaiming={isClaiming}
        claimSuccess={claimSuccess}
        onClaimWin={handleClaimWin}
      />
    </div>
  );
};

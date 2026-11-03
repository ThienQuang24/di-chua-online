import React, { useEffect, useState } from 'react';
import { LotoCage } from './LotoCage';
import { LotoWinnerCelebration } from './LotoWinnerCelebration';
import { LotoFairCrowd } from './LotoFairCrowd';
import { LotoLiveTicketsBoard } from './LotoLiveTicketsBoard';
import { lotoEngine, LotoState, LotoTicket } from '../../services/loto/lotoEngine';
import { soundEngine, formatUsernameForTts } from '../../services/soundEngine';
import { GiftNotificationBanner } from '../GiftNotificationBanner';
import { FlowerRain, LikeBar } from '../LikeRain';
import { LIKES_PER_RAIN } from '../../services/likeRain';
import { Devotee, GiftEvent, StreamConfig } from '../../types/temple';

interface LotoStageProps {
  config: StreamConfig;
  devotees: Devotee[];
  currentGift: GiftEvent | null;
  likeProgress?: number;
  rainUntil?: number;
  isBgmPlaying?: boolean;
  onToggleBgm?: () => void;
}

export const LotoStage: React.FC<LotoStageProps> = ({
  config,
  devotees,
  currentGift,
  likeProgress = 0,
  rainUntil = 0,
  isBgmPlaying = true,
  onToggleBgm,
}) => {
  const [gameState, setGameState] = useState<LotoState>(lotoEngine.getState());
  const [tickets, setTickets] = useState<LotoTicket[]>(lotoEngine.getTickets());
  const [raining, setRaining] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [selectedTicketUser, setSelectedTicketUser] = useState<string | null>(null);
  const [showStageQr, setShowStageQr] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<{ ticketUrl: string } | null>(null);

  useEffect(() => {
    fetch('/api/network-info')
      .then((r) => r.json())
      .then((d) => setNetworkInfo(d))
      .catch(() => {});
  }, []);

  const handleCloseWinner = React.useCallback(() => {
    lotoEngine.clearWinner();
  }, []);

  const handleNewRound = React.useCallback(() => {
    lotoEngine.resetRound();
  }, []);

  // Subscribe to lotoEngine updates
  useEffect(() => {
    const unsubState = lotoEngine.subscribe((st) => {
      setGameState(st);
      setTickets(lotoEngine.getTickets());
    });

    const unsubNumber = lotoEngine.onNumberCalled((num, verse, spokenText) => {
      soundEngine.playLotoCall(num, verse, spokenText);
    });

    const unsubWin = lotoEngine.onWin((winner) => {
      const cleanName = formatUsernameForTts(winner.displayName);
      soundEngine.speak(
        `Chúc mừng bạn ${cleanName} đã KINH rồi! Xuất sắc ván cờ, bạn ${cleanName} đã trúng Lô Tô rồi bà con ơi!`
      );
    });

    return () => {
      unsubState();
      unsubNumber();
      unsubWin();
    };
  }, []);

  useEffect(() => {
    const left = rainUntil - Date.now();
    setRaining(left > 0);
    if (left <= 0) return;
    const t = setTimeout(() => setRaining(false), left);
    return () => clearTimeout(t);
  }, [rainUntil]);

  // Spotlight ticket to show (prefer selected player, otherwise highest marked count)
  const activeTicket = React.useMemo(() => {
    if (tickets.length === 0) return null;
    if (selectedTicketUser) {
      const found = tickets.find((t) => t.username.toLowerCase() === selectedTicketUser.toLowerCase());
      if (found) return found;
    }
    return [...tickets].sort((a, b) => b.markedCount - a.markedCount)[0];
  }, [tickets, selectedTicketUser]);

  return (
    <div
      className={`relative mx-auto bg-[#0a0403] overflow-hidden shadow-2xl flex flex-col justify-between border border-amber-500/40 select-none ${
        config.displayRatio === '9:16'
          ? 'w-full max-w-[430px] aspect-9/16 rounded-2xl'
          : 'w-full h-full rounded-none'
      }`}
    >
      {/* 1. REAL AUTHENTIC LÔ TÔ STAGE BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/bg/loto-stage-hd.jpg"
          alt="Sân Khấu Lô Tô Hội Chợ"
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.85) contrast(1.05)' }}
        />
        {/* Soft volumetric vignette for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Dây đèn lồng lễ hội trang trí đỉnh */}
      <div className="absolute top-0 inset-x-0 flex justify-around pointer-events-none z-10">
        {['🏮', '✨', '🏮', '✨', '🏮', '✨', '🏮'].map((icon, idx) => (
          <span key={idx} className="text-sm animate-pulse" style={{ animationDelay: `${idx * 0.2}s` }}>
            {icon}
          </span>
        ))}
      </div>

      {/* Mưa hoa / sao khi đạt mốc like */}
      {raining && <FlowerRain until={rainUntil} />}

      {/* 2. KHỐI TRÊN: HEADER TIÊU ĐỀ & SÂN KHẤU BIỂU DIỄN LÔ TÔ */}
      <div className="relative z-30 flex flex-col items-center w-full">
        {/* Header thông tin hội chợ */}
        <div className="w-full flex flex-col items-center gap-1 pt-2.5 px-3">
          <div className="px-5 py-1 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border border-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
            <h1 className="text-xs font-black tracking-widest uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-2 font-temple">
              <span>🎪</span>
              <span>{config.channelName || 'GÁNH HÁT LÔ TÔ HỘI CHỢ'}</span>
              <span>🎪</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 text-[9px] text-amber-200 font-semibold">
            <span className="bg-black/60 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              Ván #{gameState.roundId}
            </span>
            <span className="bg-black/60 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              👥 {devotees.length} khán giả trong hội trường
            </span>
          </div>

          {/* Thanh số vừa gọi gọn gàng */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/85 border border-amber-500/50 shadow-md backdrop-blur-sm">
            <span className="text-[9px] text-amber-300 font-bold uppercase whitespace-nowrap">
              Đã gọi ({gameState.calledNumbers.length}/90):
            </span>
            <div className="flex items-center gap-1">
              {gameState.calledNumbers.length === 0 ? (
                <span className="text-[8.5px] text-slate-400 italic">Bấm "Quay Số" để bắt đầu</span>
              ) : (
                gameState.calledNumbers.slice(-6).reverse().map((num, i) => (
                  <span
                    key={num}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black font-mono shadow ${
                      i === 0
                        ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white border border-yellow-300 animate-pulse scale-105'
                        : 'bg-slate-800/90 text-amber-200 border border-slate-700'
                    }`}
                  >
                    {num < 10 ? `0${num}` : num}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Thanh đếm tim */}
          <div className="w-full max-w-[340px] mt-0.5">
            <LikeBar
              progress={likeProgress}
              goal={LIKES_PER_RAIN}
              raining={raining}
              isRelative={true}
              customLabel={`❤️ ${likeProgress}/${LIKES_PER_RAIN} tim – Đạt mốc bắn pháo hoa hội chợ!`}
              customRainingLabel="🎆 PHÁO HOA HỘI CHỢ RỰC RỠ! 🎆"
            />
          </div>
        </div>

        {/* Sân khấu biểu diễn: Lồng cầu quay số ảo & câu hò xướng số (nằm gọn trên bục gỗ) */}
        <div className="w-full flex flex-col items-center justify-center pt-1.5 pb-0.5 pointer-events-none">
          <LotoCage
            isSpinning={gameState.isSpinning}
            currentNumber={gameState.currentNumber}
            currentChant={gameState.currentChant}
          />
        </div>
      </div>

      {/* 3. KHU VỰC BẢNG VÉ TRỰC TIẾP TRÊN MÀN HÌNH LIVE (TIKTOK STREAM BOARD) */}
      {gameState.screenConfig?.showOnScreenTickets && (
        <div className="relative z-30 w-full flex-1 flex flex-col justify-center px-1 my-0.5 overflow-hidden">
          <LotoLiveTicketsBoard
            tickets={tickets}
            currentNumber={gameState.currentNumber}
            screenConfig={gameState.screenConfig}
            onSelectTicket={(username) => {
              setSelectedTicketUser(username);
              setShowTicket(true);
            }}
          />
        </div>
      )}

      {/* 4. ĐÁM ĐÔNG KHÁN GIẢ HỘI CHỢ NGỒI DÒ VÉ TRÊN SÂN HỘI TRƯỜNG (KHÔNG ĐÈ LÊN SÂN KHẤU) */}
      <div
        className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 ${
          gameState.screenConfig?.showOnScreenTickets ? 'opacity-25' : 'opacity-100'
        }`}
      >
        <LotoFairCrowd
          devotees={devotees}
          currentNumber={gameState.currentNumber}
          onSelectPlayer={(username) => {
            setSelectedTicketUser(username);
            setShowTicket(true);
          }}
        />
      </div>

      {/* 5. MODAL XEM CHI TIẾT VÉ LÔ TÔ (CHỈ HIỆN KHI BẤM NÚT XEM, KHÔNG CHIẾM MÀN HÌNH MẶC ĐỊNH) */}
      {activeTicket && showTicket && (
        <div className="absolute inset-x-3 bottom-12 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-950/95 border-2 border-amber-500 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🎫</span>
                <span className="text-xs font-bold text-amber-300">
                  Vé theo dõi: <strong className="text-white">{activeTicket.displayName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-amber-300 font-mono bg-amber-950 px-2 py-0.5 rounded-full border border-amber-500/40">
                  Đã trúng: {activeTicket.markedCount}/15 số
                </span>
                <button
                  onClick={() => setShowTicket(false)}
                  className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Bảng 3 dòng x 9 cột chuẩn Việt Nam */}
            <div className="flex flex-col gap-0.5 bg-black/80 p-1.5 rounded-xl border border-amber-900/50">
              {activeTicket.grid.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-9 gap-0.5">
                  {row.map((cell, cIdx) => (
                    <div
                      key={cIdx}
                      className={`
                        aspect-square flex items-center justify-center rounded text-[9.5px] font-bold font-mono transition-all
                        ${
                          cell.val === null
                            ? 'bg-slate-900/40 text-transparent'
                            : cell.isMarked
                            ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black shadow-[0_0_8px_#f59e0b]'
                            : 'bg-slate-800/90 text-slate-200 border border-slate-700/60'
                        }
                      `}
                    >
                      {cell.val !== null ? (cell.val < 10 ? `0${cell.val}` : cell.val) : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-1.5 text-center text-[9px] text-amber-400 font-medium">
              Gõ "ve" trong chat để nhận vé may mắn của bạn!
            </div>
          </div>
        </div>
      )}

      {/* 6. KHU VỰC ĐÁY: THANH ĐIỀU HƯỚNG GỌN GÀNG (KHÔNG CHE KHUẤT KHÁN GIẢ) */}
      <div className="relative z-30 w-full max-w-[390px] mx-auto px-2 pb-2 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowStageQr((prev) => !prev)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/85 border border-yellow-400/60 text-[8px] text-yellow-300 font-bold shadow-lg backdrop-blur-sm hover:brightness-110 active:scale-95 transition-all"
          >
            <span>📱</span>
            <span>{showStageQr ? '✕ Đóng QR' : 'Quét QR'}</span>
          </button>

          <button
            onClick={() =>
              lotoEngine.setScreenConfig({
                showOnScreenTickets: !gameState.screenConfig?.showOnScreenTickets,
              })
            }
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-bold shadow-lg backdrop-blur-sm transition-all active:scale-95 ${
              gameState.screenConfig?.showOnScreenTickets
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border border-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'bg-black/85 text-amber-300 border border-amber-500/50'
            }`}
          >
            <span>📺</span>
            <span>{gameState.screenConfig?.showOnScreenTickets ? 'Vé Live: BẬT' : 'Hiện Vé Live'}</span>
          </button>
        </div>

        {activeTicket && (
          <button
            onClick={() => setShowTicket((prev) => !prev)}
            className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-[8px] shadow-lg flex items-center gap-1 transition-transform active:scale-95"
          >
            <span>🎫</span>
            <span>
              {showTicket ? '✕ Đóng' : `Vé: ${activeTicket.displayName} (${activeTicket.markedCount}/15)`}
            </span>
          </button>
        )}
      </div>

      {/* MODAL QR CODE XEM VÉ TRÊN ĐIỆN THOẠI TRÊN SÂN KHẤU LIVE */}
      {showStageQr && (
        <div className="absolute inset-x-6 bottom-14 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-950/95 border-2 border-yellow-400 rounded-3xl p-3 shadow-2xl backdrop-blur-md flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between pb-1 mb-1 border-b border-amber-900/60">
              <span className="text-[10px] font-black text-yellow-300 uppercase font-temple">
                📱 QUÉT MÃ CẦM VÉ TRÊN TAY
              </span>
              <button
                onClick={() => setShowStageQr(false)}
                className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
            <div className="p-2 bg-white rounded-2xl shadow-xl border-2 border-yellow-400 my-1">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  networkInfo?.ticketUrl || window.location.origin + '/ve'
                )}`}
                alt="QR Code Lô Tô Ticket"
                className="w-32 h-32 object-contain"
              />
            </div>
            <span className="text-[8.5px] text-amber-300 font-mono font-bold mt-1 select-all">
              {networkInfo?.ticketUrl || window.location.origin + '/ve'}
            </span>
            <span className="text-[8px] text-slate-400 mt-0.5">
              Mỗi khán giả sẽ nhận 1 tờ vé riêng, tự động dò số đồng bộ với live!
            </span>
          </div>
        </div>
      )}

      {/* 7. BANNER TẶNG QUÀ */}
      <GiftNotificationBanner currentGift={currentGift} />

      {/* 8. MÀN HÌNH CHÚC MỪNG CHIẾN THẮNG KINH! */}
      <LotoWinnerCelebration
        winner={gameState.lastWinner}
        onClose={handleCloseWinner}
        onNewRound={handleNewRound}
      />

      {/* 9. NÚT ÂM THANH GÓC MÀN HÌNH */}
      <div className="absolute bottom-2 right-2 z-30 flex items-center gap-1.5">
        {onToggleBgm && (
          <button
            onClick={onToggleBgm}
            title={isBgmPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
            className="w-7 h-7 rounded-full bg-slate-900/80 border border-amber-500/50 flex items-center justify-center text-[10px] text-amber-300 shadow hover:scale-105 active:scale-95"
          >
            {isBgmPlaying ? '🎵' : '🔇'}
          </button>
        )}
      </div>
    </div>
  );
};

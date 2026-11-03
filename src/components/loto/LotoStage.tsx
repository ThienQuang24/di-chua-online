import React, { useEffect, useState } from 'react';
import { LotoCage } from './LotoCage';
import { LotoWinnerCelebration } from './LotoWinnerCelebration';
import { LotoFairCrowd } from './LotoFairCrowd';
import { LotoPlayerTicketModal } from './LotoPlayerTicketModal';
import { LotoGiftPerksModal } from './LotoGiftPerksModal';
import { LotoStageDancer } from './LotoStageDancer';
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
  const [gameState, setGameState] = useState<LotoState>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlDance = params.get('dance') as any;
      if (urlDance && ['fan', 'hipshake', 'disco', 'robot', 'troupe', 'baga', 'vica', 'anime', 'stickmin'].includes(urlDance)) {
        lotoEngine.triggerDance(urlDance, 60000, 'Đại Gia TikTok', 'Vũ Điệu Hội Chợ');
      }
    }
    return lotoEngine.getState();
  });
  const [tickets, setTickets] = useState<LotoTicket[]>(lotoEngine.getTickets());
  const [raining, setRaining] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [selectedTicketUser, setSelectedTicketUser] = useState<string | null>(null);
  const [showStageQr, setShowStageQr] = useState(false);
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<{ ticketUrl: string } | null>(null);
  const [activeDanceTier, setActiveDanceTier] = useState<'rose' | 'icecream' | 'crown' | 'rocket' | null>(null);

  useEffect(() => {
    if (!currentGift) return;
    const d = (currentGift.diamonds || 1) * (currentGift.comboCount || 1);
    const name = currentGift.giftName.toLowerCase();

    let tier: 'rose' | 'icecream' | 'crown' | 'rocket' = 'rose';
    let duration = 3000;

    const donor = currentGift.displayName || currentGift.username;
    if (d >= 1000 || name.includes('tên lửa') || name.includes('rocket') || name.includes('sư tử') || name.includes('pháo hoa')) {
      tier = 'rocket';
      duration = 11000;
      lotoEngine.triggerDance('troupe', 11000, donor, currentGift.giftName);
    } else if (d >= 90 || name.includes('vương miện') || name.includes('crown') || name.includes('tim') || name.includes('heart')) {
      tier = 'crown';
      duration = 8000;
      lotoEngine.triggerDance('disco', 8000, donor, currentGift.giftName);
    } else if (d >= 10 || name.includes('kem') || name.includes('ice') || name.includes('donut') || name.includes('bánh')) {
      tier = 'icecream';
      duration = 5000;
      lotoEngine.triggerDance('hipshake', 5000, donor, currentGift.giftName);
    } else {
      tier = 'rose';
      duration = 3500;
      lotoEngine.triggerDance('fan', 3500, donor, currentGift.giftName);
    }

    setActiveDanceTier(tier);
    soundEngine.playLotoGiftDanceBeat(tier);

    const timer = setTimeout(() => {
      setActiveDanceTier(null);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentGift]);

  useEffect(() => {
    fetch('/api/network-info')
      .then((r) => r.json())
      .then((d) => setNetworkInfo(d))
      .catch(() => {});

    // Allow testing or previewing dancers via URL param (e.g. ?dance=fan or ?dance=disco)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlDance = params.get('dance') as any;
      if (urlDance && ['fan', 'hipshake', 'disco', 'robot', 'troupe', 'baga', 'vica', 'anime', 'stickmin'].includes(urlDance)) {
        lotoEngine.triggerDance(urlDance, 60000, 'Đại Gia TikTok', 'Vũ Điệu Hội Chợ');
      }
    }
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

  // Active ticket determination: prefer spotlightTicketUser if set, or selectedTicketUser
  const currentTicketUsername = gameState.spotlightTicketUser || selectedTicketUser;
  const isTicketModalOpen = Boolean((gameState.showSpotlightTicket || showTicket) && tickets.length > 0);

  const activeTicket = React.useMemo(() => {
    if (tickets.length === 0) return null;
    if (currentTicketUsername) {
      const found = tickets.find((t) => t.username.toLowerCase() === currentTicketUsername.toLowerCase());
      if (found) return found;
    }
    return [...tickets].sort((a, b) => b.markedCount - a.markedCount)[0];
  }, [tickets, currentTicketUsername]);

  const currentTicketIndex = React.useMemo(() => {
    if (!activeTicket) return 0;
    const idx = tickets.findIndex((t) => t.id === activeTicket.id);
    return idx >= 0 ? idx : 0;
  }, [tickets, activeTicket]);

  const handleSelectUser = (username: string) => {
    setSelectedTicketUser(username);
    setShowTicket(true);
    lotoEngine.setSpotlightTicket(username);
  };

  const handleCloseTicket = () => {
    setShowTicket(false);
    lotoEngine.closeSpotlightTicket();
  };

  const handlePrevTicket = () => {
    if (tickets.length <= 1) return;
    const nextIdx = (currentTicketIndex - 1 + tickets.length) % tickets.length;
    handleSelectUser(tickets[nextIdx].username);
  };

  const handleNextTicket = () => {
    if (tickets.length <= 1) return;
    const nextIdx = (currentTicketIndex + 1) % tickets.length;
    handleSelectUser(tickets[nextIdx].username);
  };

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

          {/* Hướng dẫn chat lấy vé & thông tin phần thưởng ván */}
          <div className="flex items-center justify-center gap-2 px-3 py-0.5 rounded-full bg-black/85 border border-yellow-400/60 shadow-md backdrop-blur-sm mt-0.5 animate-in fade-in">
            <span className="text-[8.5px] text-yellow-300 font-bold flex items-center gap-1">
              <span>💬</span>
              <span>Chat <strong className="text-white underline">layve</strong> lấy vé</span>
            </span>
            <span className="text-[7.5px] text-slate-500">•</span>
            <span className="text-[8.5px] text-amber-200 font-semibold flex items-center gap-1">
              <span>🎁</span>
              <span>Thưởng: <strong className="text-yellow-300">{gameState.currentPrize || 'Thẻ cào 50K'}</strong></span>
            </span>
          </div>
        </div>

        {/* Sân khấu biểu diễn: Lồng cầu quay số ảo & câu hò xướng số (nằm gọn trên bục gỗ) */}
        <div className="w-full flex flex-col items-center justify-center pt-1.5 pb-0.5 pointer-events-none">
          <LotoCage
            isSpinning={gameState.isSpinning}
            currentNumber={gameState.currentNumber}
            currentChant={
              gameState.danceStyle
                ? `⭐ ${gameState.danceDonorName || 'Khán giả'} tặng ${gameState.danceGiftName || 'quà'} - Cả hội trường cùng quẩy! 🎵`
                : gameState.currentChant
            }
          />
        </div>
      </div>

      {/* 3.5. MÔ HÌNH VŨ CÔNG BIỂU DIỄN VŨ ĐIỆU TRÊN SÂN KHẤU (KHI CÓ QUÀ TẶNG HOẶC STREAMER CHỌN) */}
      <LotoStageDancer
        danceStyle={gameState.danceStyle}
        donorName={gameState.danceDonorName}
        giftName={gameState.danceGiftName}
        customVideoUrl={gameState.customVideoUrl}
        customIsGreenScreen={gameState.isGreenScreen}
        onClose={() => lotoEngine.stopDance()}
      />

      {/* 4. ĐÁM ĐÔNG KHÁN GIẢ HỘI CHỢ NGỒI DÒ VÉ TRÊN SÂN HỘI TRƯỜNG (HOÀN TOÀN KHÔNG BỊ CHE KHUẤT) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <LotoFairCrowd
          devotees={devotees}
          currentNumber={gameState.currentNumber}
          onSelectPlayer={(username) => handleSelectUser(username)}
          activeDanceTier={activeDanceTier}
        />
      </div>

      {/* 5. TẤM VÉ CHỈ HIỆN LÊN KHI NHẤN VÀO KHÁN GIẢ HOẶC CHỌN VÉ */}
      {isTicketModalOpen && activeTicket && (
        <LotoPlayerTicketModal
          ticket={activeTicket}
          currentNumber={gameState.currentNumber}
          onClose={handleCloseTicket}
          onPrev={handlePrevTicket}
          onNext={handleNextTicket}
          totalTickets={tickets.length}
          currentIndex={currentTicketIndex}
        />
      )}

      {/* 6. BẢNG MENU QUÀ TẶNG HỘI CHỢ (KÍCH THÍCH MOI QUÀ DONATE) */}
      {showGiftMenu && (
        <LotoGiftPerksModal onClose={() => setShowGiftMenu(false)} />
      )}

      {/* 7. KHU VỰC ĐÁY: GỌN GÀNG, THOÁNG ĐÃNG, KHÔNG ĐÈ LÊN LOA (MATCH HÌNH NGƯỜI DÙNG CHỤP) */}
      <div className="relative z-30 w-full px-3 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Nút quét QR cầm vé riêng trên điện thoại cá nhân */}
          <button
            onClick={() => setShowStageQr((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/85 border border-yellow-400/80 text-[9px] text-yellow-300 font-bold shadow-lg backdrop-blur-sm hover:brightness-110 active:scale-95 transition-all"
          >
            <span>📱</span>
            <span>{showStageQr ? '✕ Đóng QR' : 'Quét QR Cầm Vé'}</span>
          </button>

          {/* Nút mở Menu quà tặng kích thích donate */}
          <button
            onClick={() => setShowGiftMenu((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 border border-yellow-300 text-[9px] text-white font-black shadow-lg hover:brightness-110 active:scale-95 transition-all animate-pulse"
          >
            <span>🎁</span>
            <span>{showGiftMenu ? '✕ Đóng' : 'Tặng Quà Nhận Vé'}</span>
          </button>
        </div>

        {/* Nút âm thanh góc phải tích hợp an toàn, không bao giờ bị đè */}
        {onToggleBgm && (
          <button
            onClick={onToggleBgm}
            title={isBgmPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
            className="w-8 h-8 rounded-full bg-slate-900/90 border border-amber-500/60 flex items-center justify-center text-xs text-amber-300 shadow-lg hover:scale-105 active:scale-95"
          >
            {isBgmPlaying ? '🎵' : '🔇'}
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
              Khán giả mở điện thoại: <strong>chỉ hiển thị vé của riêng bạn</strong>, tự động dò số đồng bộ với live!
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
    </div>
  );
};

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
      if (urlDance && ['fan', 'hipshake', 'disco', 'robot', 'troupe', 'baga', 'vica', 'anime', 'stickmin', 'chika_spin', 'alice', 'waifu_mmd', 'altera', 'cat_meme'].includes(urlDance)) {
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
      if (urlDance && ['fan', 'hipshake', 'disco', 'robot', 'troupe', 'baga', 'vica', 'anime', 'stickmin', 'chika_spin', 'alice', 'waifu_mmd', 'altera', 'cat_meme'].includes(urlDance)) {
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

  // Synthesize dramatic siren for Fake Kinh or heartbeat for Tension mode
  const playStageSfx = React.useCallback((type: 'siren' | 'heartbeat') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      if (type === 'siren') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.25);
        osc.frequency.linearRampToValueAtTime(520, now + 0.5);
        osc.frequency.linearRampToValueAtTime(880, now + 0.75);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.85);
        osc.start(now);
        osc.stop(now + 0.85);
      } else if (type === 'heartbeat') {
        [0, 0.22].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(110, now + offset);
          osc.frequency.exponentialRampToValueAtTime(48, now + offset + 0.16);
          gain.gain.setValueAtTime(0.32, now + offset);
          gain.gain.linearRampToValueAtTime(0.01, now + offset + 0.18);
          osc.start(now + offset);
          osc.stop(now + offset + 0.18);
        });
      }
    } catch {
      // Ignore AudioContext block before interaction
    }
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

    const unsubFakeKinh = lotoEngine.onFakeKinh((fakeEv) => {
      playStageSfx('siren');
      const cleanName = formatUsernameForTts(fakeEv.displayName);
      soundEngine.speak(
        `Báo động Kinh giả bà con ơi! Bạn ${cleanName} mới trúng có ${fakeEv.maxRowMatched} con một hàng mà dám hô Kinh! Phạt ${fakeEv.penaltyText}`
      );
    });

    return () => {
      unsubState();
      unsubNumber();
      unsubWin();
      unsubFakeKinh();
    };
  }, [playStageSfx]);

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

  // Tích hợp danh sách khán giả và toàn bộ người cầm vé (hỗ trợ quy mô 100 - 1,000+ người chơi)
  const allAudience = React.useMemo(() => {
    const map = new Map<string, Devotee>();
    devotees.forEach((d) => map.set(d.username.toLowerCase(), d));
    tickets.forEach((t, idx) => {
      const key = t.username.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: `ticket-dev-${t.id || idx}`,
          username: t.username,
          displayName: t.displayName || t.username,
          avatarUrl: t.avatarUrl || '',
          joinedAt: t.createdAt || Date.now(),
          lastActive: t.createdAt || Date.now(),
          seat: idx,
          robeColor: '#f59e0b',
          bowOffset: 0,
        });
      }
    });
    return Array.from(map.values());
  }, [devotees, tickets]);

  const totalAudienceCount = Math.max(allAudience.length, tickets.length);

  // Feature 2: Danh sách khán giả đang "Chờ Kinh" (4/5 số trên 1 hàng)
  const waitingTickets = React.useMemo(
    () => tickets.filter((t) => t.waitingNumbers.length > 0 && !t.hasWon),
    [tickets]
  );

  // Play heartbeat sound when spinning while players are waiting for Kinh
  useEffect(() => {
    if (gameState.isSpinning && waitingTickets.length > 0) {
      playStageSfx('heartbeat');
    }
  }, [gameState.isSpinning, waitingTickets.length, playStageSfx]);

  const chanCount = gameState.predictionSummary?.chanUsers?.length || 0;
  const leCount = gameState.predictionSummary?.leUsers?.length || 0;
  const totalPred = chanCount + leCount;
  const chanPct = totalPred > 0 ? Math.round((chanCount / totalPred) * 100) : 50;
  const lastPredResult = gameState.predictionSummary?.lastResult;
  const isRecentPredResult = Boolean(lastPredResult && Date.now() - lastPredResult.timestamp < 8000);

  return (
    <div
      className={`relative mx-auto bg-[#0a0403] overflow-hidden shadow-2xl flex flex-col justify-between border select-none transition-all duration-500 ${
        waitingTickets.length >= 2
          ? 'border-red-500 ring-2 ring-red-500/70 shadow-[inset_0_0_28px_rgba(239,68,68,0.35)]'
          : 'border-amber-500/40'
      } ${
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
        {/* Header thông tin hội chợ gọn gàng */}
        <div className="w-full flex flex-col items-center gap-0.5 pt-1.5 px-3">
          <div className="px-4 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border border-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
            <h1 className="text-[11px] font-black tracking-widest uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-1.5 font-temple">
              <span>🎪</span>
              <span>{config.channelName || 'GÁNH HÁT LÔ TÔ HỘI CHỢ'}</span>
              <span>🎪</span>
            </h1>
          </div>

          {/* Gộp Ván + Khán giả + Chat layve + Giải thưởng vào 1 dòng siêu gọn */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/80 border border-yellow-400/50 text-[8px] text-amber-200 font-semibold shadow">
            <span className="text-yellow-300 font-bold">Ván #{gameState.roundId}</span>
            <span className="text-slate-500">•</span>
            <span>👥 {totalAudienceCount} khách</span>
            <span className="text-slate-500">•</span>
            <span className="text-yellow-300 font-bold">
              💬 Chat <strong className="text-white underline">layve</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span>
              🎁 <strong className="text-yellow-300">{gameState.currentPrize || 'Thẻ cào 50K'}</strong>
            </span>
          </div>

          {/* Thanh số vừa gọi gọn gàng */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/85 border border-amber-500/50 shadow-md backdrop-blur-sm">
            <span className="text-[8.5px] text-amber-300 font-bold uppercase whitespace-nowrap">
              Đã gọi ({gameState.calledNumbers.length}/90):
            </span>
            <div className="flex items-center gap-1">
              {gameState.calledNumbers.length === 0 ? (
                <span className="text-[8px] text-slate-400 italic">Bấm "Quay Số" để bắt đầu</span>
              ) : (
                gameState.calledNumbers.slice(-6).reverse().map((num, i) => (
                  <span
                    key={num}
                    className={`px-1.5 py-[1px] rounded text-[9.5px] font-black font-mono shadow ${
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
          <div className="w-full max-w-[340px]">
            <LikeBar
              progress={likeProgress}
              goal={LIKES_PER_RAIN}
              raining={raining}
              isRelative={true}
              customLabel={`❤️ ${likeProgress}/${LIKES_PER_RAIN} tim – Đạt mốc bắn pháo hoa hội chợ!`}
              customRainingLabel="🎆 PHÁO HOA HỘI CHỢ RỰC RỠ! 🎆"
            />
          </div>

          {/* Ý TƯỞNG 2: BẢNG CAO TRÀO CHỜ KINH (SẮP NỔ HŨ) */}
          {waitingTickets.length > 0 && (
            <div className="w-full max-w-[395px] flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-900/95 via-red-600/95 to-amber-600/95 border border-yellow-300 shadow-[0_0_14px_rgba(239,68,68,0.85)] animate-pulse overflow-hidden">
              <span className="text-[7.5px] font-black text-yellow-200 whitespace-nowrap shrink-0">
                🔥 {waitingTickets.length} CHỜ KINH:
              </span>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {waitingTickets.slice(0, 4).map((wt) => (
                  <button
                    key={wt.username}
                    onClick={() => handleSelectUser(wt.username)}
                    className="pointer-events-auto text-[7px] font-bold text-white bg-black/50 hover:bg-black/80 px-1.5 py-0.2 rounded-full whitespace-nowrap border border-yellow-300/40"
                  >
                    @{wt.displayName}{' '}
                    <strong className="text-yellow-300">
                      (chờ {wt.waitingNumbers.map((n) => (n < 10 ? `0${n}` : n)).join(',')})
                    </strong>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sân khấu biểu diễn: Lồng cầu quay số ảo & câu hò xướng số (nằm gọn trên bục gỗ) */}
        <div className="w-full flex flex-col items-center justify-center pt-0.5 pb-0 pointer-events-none">
          <LotoCage
            isSpinning={gameState.isSpinning}
            currentNumber={gameState.currentNumber}
            currentChant={
              gameState.danceStyle
                ? `⭐ ${gameState.danceDonorName || 'Khán giả'} tặng ${gameState.danceGiftName || 'quà'} - Cả hội trường cùng quẩy! 🎵`
                : gameState.currentChant
            }
          />

          {/* Hàng pill dưới lồng cầu: Đại gia xin vía VIP + Mini-game Đoán số Chẵn/Lẻ */}
          <div className="mt-0.5 flex flex-wrap items-center justify-center gap-1 px-2 max-w-[400px]">
            {/* Ý TƯỞNG 3: ĐẠI GIA XIN VÍA LỒNG CẦU (VIP GIFT PERK) */}
            {gameState.cageSponsor && (
              <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-950/90 via-yellow-900/90 to-amber-950/90 border border-yellow-300/90 shadow-[0_0_8px_rgba(250,204,21,0.5)] flex items-center gap-1">
                <span className="text-[7.5px]">👑</span>
                <span className="text-[7px] font-bold text-yellow-200 whitespace-nowrap">
                  VIP <strong className="text-white">{gameState.cageSponsor.displayName}</strong> xin vía!
                </span>
              </div>
            )}

            {/* Ý TƯỞNG 4: MINI-GAME ĐOÁN SỐ TIẾP THEO CHẴN / LẺ */}
            {gameState.showPredictionWidget && (
              <div className="px-2 py-0.5 rounded-full bg-black/85 border border-sky-400/50 shadow-md backdrop-blur-xs flex items-center gap-1.5">
                {isRecentPredResult && lastPredResult ? (
                  <div className="flex items-center gap-1 text-[7px] font-black text-emerald-300 animate-pulse whitespace-nowrap">
                    <span>🎉</span>
                    <span>
                      Số {lastPredResult.number < 10 ? `0${lastPredResult.number}` : lastPredResult.number}:{' '}
                      <strong className="text-yellow-300 uppercase">
                        {lastPredResult.outcome === 'chan' ? 'CHẴN' : 'LẺ'}
                      </strong>{' '}
                      ({lastPredResult.winners.length} trúng)
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-[7px] font-bold text-sky-200 whitespace-nowrap">
                      🎲 Đoán (<strong className="text-yellow-300">C</strong>/<strong className="text-pink-300">L</strong>):
                    </span>
                    <div className="flex items-center gap-1 text-[7px] font-black whitespace-nowrap">
                      <span className="px-1 py-0.1 rounded bg-sky-600/80 text-white border border-sky-300/60">
                        C: {chanCount} ({chanPct}%)
                      </span>
                      <span className="px-1 py-0.1 rounded bg-rose-600/80 text-white border border-rose-300/60">
                        L: {leCount} ({100 - chanPct}%)
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ý TƯỞNG 1: BÁO ĐỘNG KINH GIẢ - PHẠT HÀI HƯỚC! */}
      {gameState.lastFakeKinh && (
        <div className="absolute top-[135px] inset-x-3 z-50 pointer-events-auto animate-bounce">
          <div className="rounded-2xl bg-gradient-to-r from-rose-950/95 via-red-900/95 to-orange-950/95 border-2 border-yellow-300 p-2.5 shadow-[0_0_25px_rgba(244,63,94,0.95)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-full bg-red-600 border-2 border-yellow-300 flex items-center justify-center text-lg shrink-0 shadow-lg">
                🚨
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-wider text-yellow-300 flex items-center gap-1">
                  <span>BÁO ĐỘNG KINH HỤT / KINH GIẢ!</span>
                </div>
                <div className="text-[9px] text-white font-bold truncate">
                  Bạn <strong className="text-yellow-200">@{gameState.lastFakeKinh.displayName}</strong> mới trúng{' '}
                  <strong className="text-rose-300">{gameState.lastFakeKinh.maxRowMatched}/5 số</strong> 1 hàng mà dám hô KINH!
                </div>
                <div className="text-[8.5px] text-amber-200 font-extrabold mt-0.5">
                  ⚡ Hình phạt: <span className="text-yellow-300 underline">{gameState.lastFakeKinh.penaltyText}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => lotoEngine.clearFakeKinh()}
              className="px-2 py-1 rounded-lg bg-black/50 hover:bg-black/80 text-[9px] font-bold text-slate-200 border border-white/20 shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
          devotees={allAudience}
          currentNumber={gameState.currentNumber}
          onSelectPlayer={(username) => handleSelectUser(username)}
          activeDanceTier={activeDanceTier}
          fakeKinhUsername={gameState.lastFakeKinh?.username}
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
        autoNextRoundCountdown={gameState.autoNextRoundCountdown}
      />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { LotoWinnerCelebration } from './LotoWinnerCelebration';
import { LotoFairCrowd } from './LotoFairCrowd';
import { LotoPlayerTicketModal } from './LotoPlayerTicketModal';
import { LotoGiftPerksModal } from './LotoGiftPerksModal';
import { LotoStageDancer } from './LotoStageDancer';
import { LotoStageHeader } from './LotoStageHeader';
import { LotoStageFooterModals, playStageSfx } from './LotoStageFooterModals';
import { lotoEngine, LotoState, LotoTicket } from '../../services/loto/lotoEngine';
import { soundEngine, formatUsernameForTts } from '../../services/soundEngine';
import { apiClient } from '../../services/apiClient';
import { GiftNotificationBanner } from '../GiftNotificationBanner';
import { FlowerRain } from '../LikeRain';
import { Devotee, GiftEvent, StreamConfig } from '../../types/temple';

interface LotoStageProps {
  config: StreamConfig; devotees: Devotee[]; currentGift: GiftEvent | null;
  likeProgress?: number; rainUntil?: number; isBgmPlaying?: boolean; onToggleBgm?: () => void;
}

export const LotoStage: React.FC<LotoStageProps> = ({
  config, devotees, currentGift, likeProgress = 0, rainUntil = 0, isBgmPlaying = true, onToggleBgm,
}) => {
  const [gameState, setGameState] = useState<LotoState>(() => {
    if (typeof window !== 'undefined') {
      const urlDance = new URLSearchParams(window.location.search).get('dance') as any;
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
    const donor = currentGift.displayName || currentGift.username;

    let tier: 'rose' | 'icecream' | 'crown' | 'rocket' = 'rose';
    let duration = 3500;
    if (d >= 1000 || name.includes('tên lửa') || name.includes('rocket') || name.includes('sư tử') || name.includes('pháo hoa')) {
      tier = 'rocket'; duration = 11000;
      lotoEngine.triggerDance('troupe', 11000, donor, currentGift.giftName);
    } else if (d >= 90 || name.includes('vương miện') || name.includes('crown') || name.includes('tim') || name.includes('heart')) {
      tier = 'crown'; duration = 8000;
      lotoEngine.triggerDance('disco', 8000, donor, currentGift.giftName);
    } else if (d >= 10 || name.includes('kem') || name.includes('ice') || name.includes('donut') || name.includes('bánh')) {
      tier = 'icecream'; duration = 5000;
      lotoEngine.triggerDance('hipshake', 5000, donor, currentGift.giftName);
    } else {
      lotoEngine.triggerDance('fan', 3500, donor, currentGift.giftName);
    }

    setActiveDanceTier(tier);
    soundEngine.playLotoGiftDanceBeat(tier);
    const timer = setTimeout(() => setActiveDanceTier(null), duration);
    return () => clearTimeout(timer);
  }, [currentGift]);

  useEffect(() => {
    apiClient.getNetworkInfo().then((d) => { if (d) setNetworkInfo(d); });
  }, []);

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
      soundEngine.speak(`Chúc mừng bạn ${cleanName} đã KINH rồi! Xuất sắc ván cờ, bạn ${cleanName} đã trúng Lô Tô rồi bà con ơi!`);
    });
    const unsubFakeKinh = lotoEngine.onFakeKinh((fakeEv) => {
      playStageSfx('siren');
      const cleanName = formatUsernameForTts(fakeEv.displayName);
      soundEngine.speak(`Báo động Kinh giả bà con ơi! Bạn ${cleanName} mới trúng có ${fakeEv.maxRowMatched} con một hàng mà dám hô Kinh! Phạt ${fakeEv.penaltyText}`);
    });
    return () => { unsubState(); unsubNumber(); unsubWin(); unsubFakeKinh(); };
  }, []);

  useEffect(() => {
    const left = rainUntil - Date.now();
    setRaining(left > 0);
    if (left <= 0) return;
    const t = setTimeout(() => setRaining(false), left);
    return () => clearTimeout(t);
  }, [rainUntil]);

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

  const waitingTickets = React.useMemo(
    () => tickets.filter((t) => t.waitingNumbers.length > 0 && !t.hasWon),
    [tickets]
  );

  useEffect(() => {
    if (gameState.isSpinning && waitingTickets.length > 0) playStageSfx('heartbeat');
  }, [gameState.isSpinning, waitingTickets.length]);

  const ticketUrl = networkInfo?.ticketUrl || (typeof window !== 'undefined' ? window.location.origin + '/ve' : 'http://localhost:3000/ve');

  return (
    <div
      className={`relative mx-auto bg-[#0a0403] overflow-hidden shadow-2xl flex flex-col justify-between border select-none transition-all duration-500 ${
        waitingTickets.length >= 2
          ? 'border-red-500 ring-2 ring-red-500/70 shadow-[inset_0_0_28px_rgba(239,68,68,0.35)]'
          : 'border-amber-500/40'
      } ${config.displayRatio === '9:16' ? 'w-full max-w-[430px] aspect-9/16 rounded-2xl' : 'w-full h-full rounded-none'}`}
    >
      <div className="absolute inset-0 z-0">
        <img src="/assets/bg/loto-stage-hd.jpg" alt="Sân Khấu Lô Tô Hội Chợ" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.85) contrast(1.05)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/80 pointer-events-none" />
      </div>

      <div className="absolute top-0 inset-x-0 flex justify-around pointer-events-none z-10">
        {['🏮', '✨', '🏮', '✨', '🏮', '✨', '🏮'].map((icon, idx) => (
          <span key={idx} className="text-sm animate-pulse" style={{ animationDelay: `${idx * 0.2}s` }}>{icon}</span>
        ))}
      </div>

      {raining && <FlowerRain until={rainUntil} />}

      <LotoStageHeader
        config={config}
        gameState={gameState}
        totalAudienceCount={Math.max(allAudience.length, tickets.length)}
        likeProgress={likeProgress}
        raining={raining}
        waitingTickets={waitingTickets}
        onSelectUser={handleSelectUser}
      />

      <LotoStageDancer
        danceStyle={gameState.danceStyle}
        donorName={gameState.danceDonorName}
        giftName={gameState.danceGiftName}
        customVideoUrl={gameState.customVideoUrl}
        customIsGreenScreen={gameState.isGreenScreen}
        onClose={() => lotoEngine.stopDance()}
      />

      <div className="absolute inset-0 z-20 pointer-events-none">
        <LotoFairCrowd
          devotees={allAudience}
          currentNumber={gameState.currentNumber}
          onSelectPlayer={handleSelectUser}
          activeDanceTier={activeDanceTier}
          fakeKinhUsername={gameState.lastFakeKinh?.username}
        />
      </div>

      {isTicketModalOpen && activeTicket && (
        <LotoPlayerTicketModal
          ticket={activeTicket}
          currentNumber={gameState.currentNumber}
          onClose={handleCloseTicket}
          onPrev={() => tickets.length > 1 && handleSelectUser(tickets[(currentTicketIndex - 1 + tickets.length) % tickets.length].username)}
          onNext={() => tickets.length > 1 && handleSelectUser(tickets[(currentTicketIndex + 1) % tickets.length].username)}
          totalTickets={tickets.length}
          currentIndex={currentTicketIndex}
        />
      )}

      {showGiftMenu && <LotoGiftPerksModal onClose={() => setShowGiftMenu(false)} />}

      <LotoStageFooterModals
        gameState={gameState}
        showStageQr={showStageQr}
        setShowStageQr={setShowStageQr}
        showGiftMenu={showGiftMenu}
        setShowGiftMenu={setShowGiftMenu}
        isBgmPlaying={isBgmPlaying}
        onToggleBgm={onToggleBgm}
        ticketUrl={ticketUrl}
      />

      <GiftNotificationBanner currentGift={currentGift} />

      <LotoWinnerCelebration
        winner={gameState.lastWinner}
        onClose={() => lotoEngine.clearWinner()}
        onNewRound={() => lotoEngine.resetRound()}
        autoNextRoundCountdown={gameState.autoNextRoundCountdown}
      />
    </div>
  );
};

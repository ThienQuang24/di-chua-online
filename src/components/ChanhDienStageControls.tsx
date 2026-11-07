import React from 'react';
import { TempleLightingEffects } from './TempleLightingEffects';
import { CompactBangCongDuc } from './CompactBangCongDuc';
import { GoldenLotusBloom } from './GoldenLotusBloom';
import { FlowerRain, LikeBar } from './LikeRain';
import { CraneFlight } from './CraneFlight';
import { GiftNotificationBanner } from './GiftNotificationBanner';
import { LIKES_PER_RAIN } from '../services/likeRain';
import { GiftEvent, LeaderboardEntry, StreamConfig } from '../types/temple';

interface ChanhDienHeaderOverlaysProps {
  config: StreamConfig;
  currentGift: GiftEvent | null;
  leaderboardDonors: LeaderboardEntry[];
  auraIntensity: number;
  isGiftActive: boolean;
  likeProgress: number;
  rainUntil: number;
  raining: boolean;
}

export const ChanhDienHeaderOverlays: React.FC<ChanhDienHeaderOverlaysProps> = ({
  config,
  currentGift,
  leaderboardDonors,
  auraIntensity,
  isGiftActive,
  likeProgress,
  rainUntil,
  raining,
}) => (
  <>
    {/* 2. DYNAMIC LIGHTING EFFECTS OVER THE BUDDHA (Rotating Halo at Buddha back) */}
    <TempleLightingEffects auraIntensity={auraIntensity} isGiftActive={isGiftActive} />

    {/* 3. TOP THÀNH TÂM (merit board) under the adidaphat hint */}
    <CompactBangCongDuc topDonors={leaderboardDonors} />

    {/* 4. GIFT: golden lotus opens and pink lotus petals fall, bigger and brighter for bigger gifts */}
    <GoldenLotusBloom giftId={currentGift?.id} diamonds={currentGift?.diamonds} />

    {/* Notice scrolling in a thin strip under the like bar (the channel owner's wording) */}
    <div className="absolute top-[20.3%] left-[8%] right-[8%] z-30 overflow-hidden pointer-events-none rounded-full bg-black/35 border border-[#c9973f]/40">
      <div className="w-max whitespace-nowrap py-0.5 text-[9px] text-[#f3d08a]/90 font-temple animate-notice-scroll">
        Xin lưu ý, đây là không gian thư giãn mang tinh thần an nhiên; quà tặng chỉ để nhận lời chúc, không phải tiền cúng dường hay để cầu may.
      </div>
    </div>

    {/* 5. TITLE: lowered so TikTok's top bar doesn't cover it, with the chant under it */}
    <div className="absolute top-[7.5%] inset-x-0 z-30 flex flex-col items-center pointer-events-none">
      <h1
        className="text-2xl sm:text-3xl font-black tracking-widest font-temple uppercase bg-linear-to-b from-[#FFFDF0] via-[#FDE047] to-[#B45309] bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(245,158,11,1)] text-center"
        style={{ letterSpacing: '0.18em' }}
      >
        {config.channelName}
      </h1>
      <div className="mt-0.5 text-[13px] font-semibold text-[#f3d08a] font-temple tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
        Nam Mô A Di Đà Phật
      </div>
    </div>

    {/* Likes toward the next flower rain, under the chant */}
    <LikeBar progress={likeProgress} goal={LIKES_PER_RAIN} raining={raining} />
    <FlowerRain until={rainUntil} />
    <CraneFlight />
  </>
);

interface ChanhDienFooterBarProps {
  config: StreamConfig;
  currentGift: GiftEvent | null;
  isBgmPlaying: boolean;
  onToggleBgm?: () => void;
  onRingBell: () => void;
  onPlayGong: () => void;
}

export const ChanhDienFooterBar: React.FC<ChanhDienFooterBarProps> = ({
  config,
  currentGift,
  isBgmPlaying,
  onToggleBgm,
  onRingBell,
  onPlayGong,
}) => (
  <>
    {/* 8. GIFT NOTIFICATION BANNER WITH COMBO MULTIPLIER */}
    <GiftNotificationBanner currentGift={currentGift} />

    {/* 9. DISCREET STREAMER SOUND SHORTCUTS (Chuông, Mõ, Nhạc nền) */}
    <div className="absolute bottom-0 inset-x-0 z-150 px-3 pb-3 pt-1 flex items-center justify-between pointer-events-auto">
      {/* Real Buddhist Music status indicator */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-amber-500/40 text-[10px] text-stone-200 backdrop-blur-md">
        <span className={`w-2 h-2 rounded-full ${isBgmPlaying ? 'bg-amber-400 animate-pulse' : 'bg-stone-600'}`} />
        <span className="font-medium truncate max-w-[190px]">
          {isBgmPlaying
            ? config.buddhistMusicTrack === 'chill'
              ? '🍃 Nhạc chill thư giãn'
              : config.buddhistMusicTrack === 'niem_phat'
              ? '📿 Niệm Phật Thích Trí Thoát'
              : config.buddhistMusicTrack === 'khuc_thien_dao'
              ? '🎶 Khúc Thiền Đạo Trầm Bổng'
              : '🎋 Sáo Trúc & Đàn Tranh Dịu Êm'
            : 'Nhạc Phật giáo đang tắt'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onToggleBgm && (
          <button
            onClick={onToggleBgm}
            title={isBgmPlaying ? 'Tắt Nhạc Phật Giáo' : 'Bật Nhạc Niệm Phật Always'}
            className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm shadow-lg hover:scale-110 active:scale-95 transition-all backdrop-blur-md ${
              isBgmPlaying
                ? 'bg-amber-950/80 border-amber-400/70 text-amber-300'
                : 'bg-black/70 border-stone-700 text-stone-500'
            }`}
          >
            🎵
          </button>
        )}
        <button
          onClick={onRingBell}
          title="Thỉnh Chuông U Minh"
          className="w-9 h-9 rounded-full bg-black/70 border border-amber-400/50 flex items-center justify-center text-amber-300 text-sm shadow-lg hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
        >
          🔔
        </button>
        <button
          onClick={onPlayGong}
          title="Gõ Mõ Tụng Kinh"
          className="w-9 h-9 rounded-full bg-black/70 border border-amber-600/50 flex items-center justify-center text-amber-300 text-sm shadow-lg hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
        >
          🪵
        </button>
      </div>
    </div>
  </>
);

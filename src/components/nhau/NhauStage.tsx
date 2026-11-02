import React, { useEffect, useState } from 'react';
import { NhauCrowd } from './NhauCrowd';
import { DiscoOverlay } from './DiscoOverlay';
import { BirthdayOverlay } from './BirthdayOverlay';
import { nhauEngine, NhauState } from '../../services/nhau/nhauEngine';
import { soundEngine } from '../../services/soundEngine';
import { GiftNotificationBanner } from '../GiftNotificationBanner';
import { LikeBar } from '../LikeRain';
import { LIKES_PER_RAIN } from '../../services/likeRain';
import { Devotee, GiftEvent, StreamConfig } from '../../types/temple';

interface NhauStageProps {
  config: StreamConfig;
  devotees: Devotee[];
  currentGift: GiftEvent | null;
  likeProgress?: number;
  rainUntil?: number;
  isBgmPlaying?: boolean;
  onToggleBgm?: () => void;
}

export const NhauStage: React.FC<NhauStageProps> = ({
  config,
  devotees,
  currentGift,
  likeProgress = 0,
  rainUntil = 0,
  isBgmPlaying = true,
  onToggleBgm,
}) => {
  const [nhauState, setNhauState] = useState<NhauState>(nhauEngine.getState());
  const [raining, setRaining] = useState(false);

  useEffect(() => {
    const unsubState = nhauEngine.subscribe((st) => {
      setNhauState(st);
    });

    const unsubCheer = nhauEngine.onCheer((chant) => {
      soundEngine.speak(chant);
    });

    return () => {
      unsubState();
      unsubCheer();
    };
  }, []);

  useEffect(() => {
    const left = rainUntil - Date.now();
    setRaining(left > 0);
    if (left <= 0) return;
    const t = setTimeout(() => setRaining(false), left);
    return () => clearTimeout(t);
  }, [rainUntil]);

  return (
    <div
      className={`relative mx-auto bg-[#0a0403] overflow-hidden shadow-2xl flex flex-col justify-between border border-amber-500/40 select-none ${
        config.displayRatio === '9:16'
          ? 'w-full max-w-[430px] aspect-9/16 rounded-2xl'
          : 'w-full h-full rounded-none'
      }`}
    >
      {/* 1. REAL AUTHENTIC SIDEWALK PUB BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/bg/quan-nhau-hd.jpg"
          alt="Quán Nhậu Vỉa Hè"
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.9) contrast(1.05)' }}
        />
        {/* Soft atmospheric gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Dây đèn lồng & bóng đèn vàng lung linh */}
      <div className="absolute top-0 inset-x-0 flex justify-around pointer-events-none z-10">
        {['💡', '🍺', '💡', '🍻', '💡', '🍺', '💡'].map((icon, idx) => (
          <span key={idx} className="text-xs animate-bounce" style={{ animationDelay: `${idx * 0.15}s` }}>
            {icon}
          </span>
        ))}
      </div>

      {/* HIỆU ỨNG VŨ TRƯỜNG BAY LẮC 60S (KHI BẤM NÚT HOẶC ĐẠT ĐỦ TIM) */}
      <DiscoOverlay
        isActive={nhauState.isDiscoMode || raining}
        discoUntil={nhauState.isDiscoMode ? nhauState.discoUntil : rainUntil}
      />

      {/* HIỆU ỨNG ĐẠI TIỆC CHÚC MỪNG SINH NHẬT (BÁNH KEM, NẾN, PHÁO SÁNG, VƯƠNG MIỆN) */}
      <BirthdayOverlay birthdayEvent={nhauState.birthdayEvent} />

      {/* 2. HEADER: BIỂN HIỆU QUÁN NHẬU ĐÊM */}
      <div className="relative z-30 flex flex-col items-center gap-1 pt-2.5 px-3">
        <div className="px-5 py-1 rounded-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 border border-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
          <h1 className="text-xs font-black tracking-widest uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-2 font-temple">
            <span>🍻</span>
            <span>{config.channelName || 'QUÁN NHẬU BÌNH DÂN 1 2 3 DÔ!'}</span>
            <span>🍻</span>
          </h1>
        </div>

        {/* Thống kê quán */}
        <div className="flex items-center gap-2 text-[9px] text-amber-200 font-semibold">
          <span className="bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/40">
            👥 {devotees.length} bợm nhậu đang ngồi
          </span>
          <span className="bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/40">
            🍺 {nhauState.totalBeers} ly đã cạn
          </span>
          <span className="bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/40">
            🎉 {nhauState.cheerCount} lần DÔ
          </span>
        </div>

        {/* Thanh đếm tim */}
        <div className="w-full max-w-[340px] mt-0.5">
          <LikeBar
            progress={likeProgress}
            goal={LIKES_PER_RAIN}
            raining={raining}
            isRelative={true}
            customLabel={`❤️ ${likeProgress}/${LIKES_PER_RAIN} tim – Đạt mốc lên nhạc quẩy!`}
            customRainingLabel="🔥 QUÁN LÊN NHẠC • CẢ QUÁN CÙNG QUẨY! 🔥"
          />
        </div>
      </div>

      {/* 3. HIỆU ỨNG CỤNG LY 1 2 3 DÔ TOÀN QUÁN (POPUP CHÍNH GIỮA KHI HÔ DÔ) */}
      {nhauState.isCheering && (
        <div className="relative z-40 my-auto flex flex-col items-center justify-center animate-in zoom-in-75 duration-300 pointer-events-none">
          <div className="text-5xl animate-bounce mb-1">🍻 💥 🍻</div>
          <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border-2 border-yellow-300 shadow-[0_0_30px_rgba(245,158,11,0.9)]">
            <h2 className="text-xl font-black text-white uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-pulse">
              1, 2, 3 DÔ! CẠN LY!
            </h2>
          </div>
        </div>
      )}

      {/* 4. ĐÁM ĐÔNG BỢM NHẬU NGỒI TRÊN GHẾ NHỰA QUANH BÀN BIA HƠI (KHÔNG PHẢI LẠY PHẬT!) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <NhauCrowd
          devotees={devotees}
          isCheering={nhauState.isCheering}
          isDiscoMode={nhauState.isDiscoMode || raining}
          birthdayDisplayName={nhauState.birthdayEvent?.displayName}
        />
      </div>

      {/* 5. KHU VỰC ĐÁY: BANNER CHỦ XỊ BAO QUÁN & TÂM SỰ BÀN NHẬU */}
      <div className="relative z-30 w-full max-w-[390px] mx-auto px-2 pb-2 flex flex-col gap-1.5">
        {/* Banner Top Đại Gia Bao Quán */}
        {nhauState.topSponsor && (
          <div className="w-full px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/90 via-black/85 to-amber-950/90 border border-yellow-400/60 shadow-lg flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-base animate-bounce">👑</span>
              <div className="flex flex-col">
                <span className="text-[7.5px] text-amber-400 font-bold uppercase tracking-wider">
                  CHỦ XỊ BAO TRỌN QUÁN
                </span>
                <span className="text-xs font-black text-yellow-300">
                  {nhauState.topSponsor.displayName}
                </span>
              </div>
            </div>
            <span className="text-[8.5px] text-amber-200/90 font-medium italic truncate max-w-[160px]">
              {nhauState.topSponsor.contribution}
            </span>
          </div>
        )}

        {/* Khung Tâm Sự / Lời Chúc Bàn Nhậu */}
        <div className="w-full px-3 py-1.5 rounded-xl bg-black/80 border border-amber-900/50 shadow text-center backdrop-blur-md">
          <div className="text-[8px] text-amber-400 uppercase font-semibold mb-0.5">
            💬 TÂM SỰ BÀN NHẬU (Gõ "dzo" để cùng chạm ly):
          </div>
          <p className="text-[11px] text-slate-200 font-medium italic truncate">
            {nhauState.recentToast}
          </p>
        </div>
      </div>

      {/* 6. BANNER TẶNG QUÀ */}
      <GiftNotificationBanner currentGift={currentGift} />

      {/* 7. NÚT ÂM THANH GÓC MÀN HÌNH */}
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

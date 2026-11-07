import React, { useState } from 'react';
import { lotoEngine, LotoState, LotoTicket, LotoDanceStyle } from '../../../services/loto/lotoEngine';
import { soundEngine } from '../../../services/soundEngine';
import { apiClient } from '../../../services/apiClient';

const MC_PROMPTS = [
  {
    label: '🌹 Kêu gọi tặng hoa nhận vé VIP',
    text: 'Gia đình mình ơi, ai chưa có vé thì gõ layve hoặc tặng 1 bông hoa hồng để gánh hát cấp vé Vàng VIP ngồi hàng đầu dò trúng quà to nha!',
  },
  {
    label: '🎲 Kêu gọi đoán Chẵn / Lẻ',
    text: 'Bà con ơi bình luận ngay chữ C nếu đoán số tiếp theo là Chẵn, hoặc chữ L nếu đoán số Lẻ để đua top thần dự đoán nha!',
  },
  {
    label: '🚀 Kêu gọi thả tim & chia sẻ',
    text: 'Cả nhà mình cùng bấm thả tim màn hình đủ 666 tim để gánh hát bắn pháo hoa rực rỡ cả hội trường nha quý vị!',
  },
];

interface LotoTabEffectsProps {
  gameState: LotoState;
  tickets: LotoTicket[];
  onSimulateWin: () => void;
  onSimulateGift: (giftName: string, coins: number, gifterName?: string) => void;
}

export const LotoTabEffects: React.FC<LotoTabEffectsProps> = ({
  gameState,
  tickets,
  onSimulateWin,
  onSimulateGift,
}) => {
  const [simulatedGifterName, setSimulatedGifterName] = useState<string>('');
  const [danceVideoUrl, setDanceVideoUrl] = useState<string>('/assets/loto/dancers/dance-anime.webm');
  const [danceIsGreenScreen, setDanceIsGreenScreen] = useState<boolean>(false);
  const [danceUploadMsg, setDanceUploadMsg] = useState<string>('');
  const [isUploadingDance, setIsUploadingDance] = useState<boolean>(false);

  const handleTriggerDance = (style: LotoDanceStyle, overrideVideoUrl?: string, overrideIsGreen?: boolean) => {
    const vUrl = overrideVideoUrl !== undefined ? overrideVideoUrl : danceVideoUrl;
    const isGreen = overrideIsGreen !== undefined ? overrideIsGreen : danceIsGreenScreen;
    if (overrideVideoUrl !== undefined) setDanceVideoUrl(overrideVideoUrl);
    if (overrideIsGreen !== undefined) setDanceIsGreenScreen(isGreen);

    lotoEngine.triggerDance(style, 60000, 'Streamer', 'Vũ Điệu Biểu Diễn', vUrl || undefined, isGreen);
    apiClient.sendControl({
      action: 'loto_dance', text: style, danceStyle: style, danceDuration: 60000,
      danceDonorName: 'Streamer', danceGiftName: 'Vũ Điệu Biểu Diễn',
      customVideoUrl: vUrl || undefined, isGreenScreen: isGreen,
    });
    const tierMap: Record<string, 'rose' | 'icecream' | 'crown' | 'rocket'> = {
      fan: 'rose', hipshake: 'icecream', disco: 'crown', robot: 'crown', baga: 'rocket', troupe: 'rocket',
    };
    soundEngine.playLotoGiftDanceBeat(tierMap[style] || 'rose');
  };

  const handleDanceVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDance(true);
    setDanceUploadMsg('Đang nạp file video nhảy...');
    const reader = new FileReader();
    reader.onload = async () => {
      const data = await apiClient.uploadDanceVideo(file.name, reader.result as string, danceIsGreenScreen);
      if (data.success && data.url) {
        setDanceVideoUrl(data.url);
        setDanceUploadMsg(`✓ Đã nạp & đang chiếu: ${file.name}`);
        handleTriggerDance('fan', data.url, danceIsGreenScreen);
      } else {
        setDanceUploadMsg(`Lỗi tải video: ${data.error || 'Thất bại'}`);
      }
      setIsUploadingDance(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 1. BỘ NÚT KÍCH HOẠT HIỆU ỨNG CAO TRÀO */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/40 flex flex-col gap-2">
        <span className="text-xs font-black text-amber-300 uppercase">
          ⚡ Kích Hoạt Nhanh Hiệu Ứng Cao Trào Phòng Live
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => lotoEngine.simulateFakeKinh()} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-orange-600 hover:brightness-110 text-white text-[11px] font-black border border-yellow-300/70 shadow active:scale-95 transition-all">
            🚨 Test Bắt Kinh Giả (Phạt Hài Hước)
          </button>
          <button onClick={() => lotoEngine.simulateTensionWaiting(3)} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-700 to-amber-600 hover:brightness-110 text-yellow-100 text-[11px] font-black border border-yellow-300/70 shadow active:scale-95 transition-all">
            🔥 Test Cao Trào Chờ Kinh (3 Người 4/5)
          </button>
          <button
            onClick={() => {
              const first = tickets[0];
              const uname = first ? first.username : 'dai_gia_vip';
              const dname = first ? first.displayName : 'Đại Gia VIP';
              const avt = first ? first.avatarUrl : '/assets/loto/patron-1.png';
              lotoEngine.upgradeToVip(uname, dname, avt, 'Hoa Hồng Vàng', 99);
              lotoEngine.setSpotlightTicket(uname);
            }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 text-slate-950 text-[11px] font-black border border-yellow-200 shadow active:scale-95 transition-all"
          >
            👑 Test Đại Gia Vé VIP & Xin Vía
          </button>
          <button onClick={() => lotoEngine.simulatePredictions(10)} className="px-3 py-1.5 rounded-lg bg-sky-900 hover:bg-sky-800 text-sky-100 text-[11px] font-bold border border-sky-400/50 shadow active:scale-95 transition-all">
            🎲 Test 10 Khách Đoán Chẵn/Lẻ
          </button>
          <button onClick={onSimulateWin} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black text-[11px] border border-white shadow active:scale-95 transition-all">
            👑 Test Nổ KINH!
          </button>
        </div>
      </div>

      {/* 2. VŨ CÔNG NHẢY MÚA SÂN KHẤU (7 ĐIỆU NHẢY GỌN ĐẸP) */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-pink-500/40 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-pink-300 uppercase">💃 Vũ Công Nhảy Múa Trên Sân Khấu (7 Trend TikTok)</span>
            {gameState.danceStyle && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase animate-pulse">
                Đang nhảy: {gameState.danceStyle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {gameState.danceStyle && (
              <button
                onClick={() => { lotoEngine.stopDance(); apiClient.sendControl({ action: 'loto_dance', text: 'stop' }); }}
                className="px-2.5 py-1 rounded-lg bg-red-900 hover:bg-red-800 text-red-100 text-[10.5px] font-bold border border-red-500/60"
              >
                ⏹️ Dừng vũ công
              </button>
            )}

            <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-pink-950 hover:bg-pink-900 border border-pink-500/50 text-pink-200 text-[10.5px] font-bold flex items-center gap-1">
              <span>📁 Nạp Video Nhảy (.mp4/.webm)</span>
              <input type="file" accept="video/mp4,video/webm" onChange={handleDanceVideoUpload} disabled={isUploadingDance} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
          {[
            { id: 'anime' as LotoDanceStyle, icon: '🎀', label: '1. Chika Vẫy Tay', url: '/assets/loto/dancers/dance-anime.webm' },
            { id: 'kpop_trio' as LotoDanceStyle, icon: '✨', label: '2. K-Pop Trio', url: '/assets/loto/dancers/dance-kpop-trio.webm' },
            { id: 'haaland' as LotoDanceStyle, icon: '⚡', label: '3. Haaland Phonk', url: '/assets/loto/dancers/dance-haaland.webm' },
            { id: 'toctoc' as LotoDanceStyle, icon: '🕺', label: '4. Toc Toc Dance', url: '/assets/loto/dancers/dance-toctoc.webm' },
            { id: 'cat_meme' as LotoDanceStyle, icon: '🐱', label: '5. Mèo Nhảy', url: '/assets/loto/dancers/dance-cat-meme.webm' },
            { id: 'croc_duo' as LotoDanceStyle, icon: '🐊', label: '6. Cá Sấu Đôi', url: '/assets/loto/dancers/dance-croc-duo.webm' },
            { id: 'troupe' as LotoDanceStyle, icon: '👯‍♀️', label: '7. Song Ca Đôi', url: undefined },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => handleTriggerDance(d.id, d.url, false)}
              className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all active:scale-95 ${
                gameState.danceStyle === d.id
                  ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white border-yellow-300 shadow-lg scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-pink-500/60'
              }`}
            >
              <span className="text-xl">{d.icon}</span>
              <span className="text-[10px] font-bold text-center leading-tight">{d.label}</span>
            </button>
          ))}
        </div>

        {danceUploadMsg && <span className="text-[10px] text-emerald-400 font-semibold">{danceUploadMsg}</span>}
      </div>

      {/* 3. GIẢ LẬP QUÀ TẶNG TIKTOK & LỜI RAO MC */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/40 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-black text-yellow-300 uppercase">🎁 Giả Lập Khách Tặng Quà TikTok & Lời Rao AI MC</span>
          <input
            type="text" value={simulatedGifterName} onChange={(e) => setSimulatedGifterName(e.target.value)}
            placeholder="Tên người tặng (bỏ trống = ngẫu nhiên)..."
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-white w-52 focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button onClick={() => onSimulateGift('Hoa Hồng', 1, simulatedGifterName)} className="p-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 text-xs font-bold text-rose-200 flex items-center justify-center gap-1.5 active:scale-95"><span>🌹</span><span>Hoa Hồng (1 xu)</span></button>
          <button onClick={() => onSimulateGift('Cây Kem', 10, simulatedGifterName)} className="p-2 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-yellow-500/50 text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5 active:scale-95"><span>🍦</span><span>Cây Kem (10 xu)</span></button>
          <button onClick={() => onSimulateGift('Vương Miện', 99, simulatedGifterName)} className="p-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/50 text-xs font-bold text-purple-200 flex items-center justify-center gap-1.5 active:scale-95"><span>👑</span><span>Vương Miện (99 xu)</span></button>
          <button onClick={() => onSimulateGift('Tên Lửa', 1000, simulatedGifterName)} className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-xs font-black text-white border border-yellow-300 flex items-center justify-center gap-1.5 active:scale-95"><span>🚀</span><span>Tên Lửa (1000 xu)</span></button>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {MC_PROMPTS.map((prompt, idx) => (
            <button key={idx} onClick={() => soundEngine.speak(prompt.text)} className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-950 border border-amber-500/40 text-[10px] text-amber-200 font-semibold flex items-center gap-1">
              <span>🔊</span><span>{prompt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

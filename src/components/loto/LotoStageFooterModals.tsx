import React from 'react';
import { lotoEngine, LotoState } from '../../services/loto/lotoEngine';

export const playStageSfx = (type: 'siren' | 'heartbeat') => {
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
    } else {
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
  } catch {}
};

interface LotoStageFooterModalsProps {
  gameState: LotoState;
  showStageQr: boolean;
  setShowStageQr: React.Dispatch<React.SetStateAction<boolean>>;
  showGiftMenu: boolean;
  setShowGiftMenu: React.Dispatch<React.SetStateAction<boolean>>;
  isBgmPlaying: boolean;
  onToggleBgm?: () => void;
  ticketUrl: string;
}

export const LotoStageFooterModals: React.FC<LotoStageFooterModalsProps> = ({
  gameState,
  showStageQr,
  setShowStageQr,
  showGiftMenu,
  setShowGiftMenu,
  isBgmPlaying,
  onToggleBgm,
  ticketUrl,
}) => (
  <>
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

    {/* 7. KHU VỰC ĐÁY: GỌN GÀNG, THOÁNG ĐÃNG, KHÔNG ĐÈ LÊN LOA */}
    <div className="relative z-30 w-full px-3 pb-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowStageQr((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/85 border border-yellow-400/80 text-[9px] text-yellow-300 font-bold shadow-lg backdrop-blur-sm hover:brightness-110 active:scale-95 transition-all"
        >
          <span>📱</span>
          <span>{showStageQr ? '✕ Đóng QR' : 'Quét QR Cầm Vé'}</span>
        </button>

        <button
          onClick={() => setShowGiftMenu((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 border border-yellow-300 text-[9px] text-white font-black shadow-lg hover:brightness-110 active:scale-95 transition-all animate-pulse"
        >
          <span>🎁</span>
          <span>{showGiftMenu ? '✕ Đóng' : 'Tặng Quà Nhận Vé'}</span>
        </button>
      </div>

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
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ticketUrl)}`}
              alt="QR Code Lô Tô Ticket"
              className="w-32 h-32 object-contain"
            />
          </div>
          <span className="text-[8.5px] text-amber-300 font-mono font-bold mt-1 select-all">
            {ticketUrl}
          </span>
          <span className="text-[8px] text-slate-400 mt-0.5">
            Khán giả mở điện thoại: <strong>chỉ hiển thị vé của riêng bạn</strong>, tự động dò số đồng bộ với live!
          </span>
        </div>
      </div>
    )}
  </>
);

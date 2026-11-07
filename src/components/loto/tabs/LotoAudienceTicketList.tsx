import React from 'react';
import { lotoEngine, LotoState, LotoTicket } from '../../../services/loto/lotoEngine';

interface LotoAudienceTicketListProps {
  gameState: LotoState;
  tickets: LotoTicket[];
  onAddBatchPlayers: (count: number) => void;
  onFillAudience: (targetCount: number) => void;
  onClearAudience: () => void;
  newPlayerName: string;
  setNewPlayerName: (val: string) => void;
  onAddNewPlayer: () => void;
}

export const LotoAudienceTicketList: React.FC<LotoAudienceTicketListProps> = ({
  gameState,
  tickets,
  onAddBatchPlayers,
  onFillAudience,
  onClearAudience,
  newPlayerName,
  setNewPlayerName,
  onAddNewPlayer,
}) => (
  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/40 flex flex-col gap-3">
    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black text-amber-300 uppercase">
            🎟️ Khán Phòng Hội Trường ({tickets.length} vé • {Math.min(tickets.length, 47)}/47 ghế 3D)
          </h3>
          {gameState.showSpotlightTicket && gameState.spotlightTicketUser && (
            <button
              onClick={() => lotoEngine.closeSpotlightTicket()}
              className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-[10px] shadow animate-pulse"
            >
              ✕ Đóng vé đang chiếu ({gameState.spotlightTicketUser})
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Bấm trực tiếp vào người ngồi trên sân khấu hoặc bấm <strong>[👁️ Chiếu vé]</strong> bên dưới để phóng to vé lên màn hình Live.
        </p>
      </div>

      <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10.5px] text-amber-200">
        <input
          type="checkbox"
          checked={gameState.autoShowOnWaitingKin}
          onChange={(e) => lotoEngine.setAutoShowOnWaitingKin(e.target.checked)}
          className="w-3.5 h-3.5 accent-amber-500 rounded"
        />
        <span>Tự chiếu vé khi có người 4/5 số</span>
      </label>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <button onClick={() => onAddBatchPlayers(1)} className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold border border-emerald-500/50 active:scale-95 transition-all">+1 Khách</button>
        <button onClick={() => onAddBatchPlayers(5)} className="px-2.5 py-1 rounded-lg bg-teal-950/70 hover:bg-teal-900 text-teal-300 text-[11px] font-bold border border-teal-500/50 active:scale-95 transition-all">+5 Khách</button>
        <button onClick={() => onAddBatchPlayers(10)} className="px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 text-[11px] font-bold border border-indigo-500/50 active:scale-95 transition-all">+10 Khách</button>
        <button onClick={() => onFillAudience(31)} className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-[11px] shadow active:scale-95 transition-all">🔥 Lấp Đầy 31 Ghế</button>
        <button onClick={() => onFillAudience(47)} className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 font-bold text-[11px] border border-amber-500/50 active:scale-95 transition-all">🎪 Đầy 47 Ghế</button>
        <button onClick={onClearAudience} className="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 text-[11px] font-semibold border border-rose-800/50 active:scale-95 transition-all">🧹 Xóa hết</button>
      </div>

      <div className="flex items-center gap-1.5 flex-1 min-w-[240px]">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAddNewPlayer()}
          placeholder="Nhập tên khách TikTok để cấp vé..."
          className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
        />
        <button onClick={onAddNewPlayer} className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap active:scale-95 transition-all">+ Cấp vé</button>
      </div>
    </div>

    {tickets.length > 0 && (
      <div className="max-h-52 overflow-y-auto flex flex-col gap-1 pr-1">
        {tickets.map((t, idx) => {
          const isSpotlight = gameState.showSpotlightTicket && gameState.spotlightTicketUser?.toLowerCase() === t.username.toLowerCase();
          const isWaiting = t.waitingNumbers.length > 0 && !t.hasWon;
          return (
            <div
              key={t.id}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                isSpotlight ? 'bg-amber-500/20 border-yellow-400 ring-1 ring-yellow-400' : t.hasWon ? 'bg-yellow-950/60 border-yellow-500 text-yellow-200' : isWaiting ? 'bg-red-950/50 border-red-500/70 text-red-200' : 'bg-slate-900/70 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-[10px] text-slate-500">#{idx + 1}</span>
                <span className="font-bold truncate max-w-[130px]">{t.displayName}</span>
                {t.isVip && <span className="text-[9px] font-black text-slate-950 bg-yellow-400 px-1.5 rounded">👑 VIP</span>}
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/50 border border-white/10 text-amber-300">{t.markedCount}/15</span>
                {t.hasWon ? (
                  <span className="text-[9.5px] font-black text-yellow-300 bg-red-600 px-1.5 rounded animate-pulse">👑 KINH</span>
                ) : isWaiting ? (
                  <span className="text-[9.5px] font-black text-yellow-300 bg-red-700 px-1.5 rounded animate-pulse">🔥 Chờ: {t.waitingNumbers.join(', ')}</span>
                ) : null}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => isSpotlight ? lotoEngine.closeSpotlightTicket() : lotoEngine.setSpotlightTicket(t.username)}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold border transition-all ${isSpotlight ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-black' : 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border-amber-500/50'}`}
                >
                  {isSpotlight ? '✕ Đóng' : '👁️ Chiếu vé'}
                </button>
                <button onClick={() => lotoEngine.upgradeToVip(t.username, t.displayName, t.avatarUrl, 'Vé Vàng VIP', 10)} className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${t.isVip ? 'bg-yellow-500 text-slate-950 border-yellow-300' : 'bg-slate-800 hover:bg-slate-700 text-yellow-300 border-slate-700'}`} title="Nâng cấp Vé Vàng VIP">👑 VIP</button>
                <button onClick={() => lotoEngine.simulateFakeKinh(t.username)} className="px-1.5 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-[10px] font-bold border border-rose-700" title="Bắt Kinh giả & phạt người này">🚨 Phạt</button>
                <button onClick={() => lotoEngine.rerollTicket(t.username)} className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700" title="Đổi vé khác">🎲</button>
                <button onClick={() => lotoEngine.removeTicket(t.username)} className="px-1.5 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 text-[10px] border border-rose-800" title="Xóa">✕</button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

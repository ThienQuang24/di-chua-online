import React, { useState, useEffect } from 'react';
import { lotoEngine, LotoState, LotoTicket } from '../../services/loto/lotoEngine';
import { soundEngine } from '../../services/soundEngine';
import { apiClient } from '../../services/apiClient';
import { TikTokLiveStatus } from '../../types/temple';
import { LotoTabMain } from './tabs/LotoTabMain';
import { LotoTabAutoLive } from './tabs/LotoTabAutoLive';
import { LotoTabEffects } from './tabs/LotoTabEffects';
import { LotoTabAudio } from './tabs/LotoTabAudio';

interface LotoStreamerPanelProps {
  onAddDevotee?: (name: string, avatarUrl: string) => void;
  onTriggerGift?: (username: string, giftName: string, count?: number) => void;
  onResetCrowd?: () => void;
  tikTokStatus?: TikTokLiveStatus;
  onConnectTikTok?: (username: string) => void;
  onDisconnectTikTok?: () => void;
  onSimulateChat?: (username: string, text: string, avatarUrl?: string) => void;
}

type LotoPanelTab = 'main' | 'autolive' | 'effects' | 'audio';

const VIETNAMESE_NAMES = [
  'Hương Giang', 'Minh Tuấn', 'Bảo Ngọc', 'Hoàng Nam', 'Linh Đan', 'Thanh Hằng',
  'Anh Ba Sài Gòn', 'Chị Tư Cần Thơ', 'Tuấn Ken', 'Khánh Linh', 'Quốc Bảo',
  'Hà My', 'Mai Phương', 'Hùng Râu', 'Bé Bắp', 'Chú Năm Bia Hơi', 'Cô Bảy Lô Tô',
  'Văn Hậu', 'Trâm Anh', 'Thúy Kiều', 'Đại Gia Phúc', 'Hải Đăng', 'Thu Trang',
  'Tiến Luật', 'Diệu Nhi', 'Anh Tú', 'Phương Ly', 'Sơn Tùng (Fan)', 'Ngọc Trinh',
  'Bình An', 'Kim Ngân', 'Đức Huy', 'Trọng Hoàng', 'Quang Hải', 'Văn Toàn',
  'Chị Lan Bến Tre', 'Bác Tám Cà Mau', 'Bé Heo', 'Duy Mạnh', 'Bảo Anh',
];

const FAIR_AVATARS = [
  '/assets/loto/patron-1.png', '/assets/loto/patron-2.png',
  '/assets/nhau/patron-female-1.png', '/assets/nhau/patron-female-2.png',
  '/assets/nhau/patron-1.png', '/assets/nhau/patron-uncle-1.png',
];

export const LotoStreamerPanel: React.FC<LotoStreamerPanelProps> = ({
  onAddDevotee, onTriggerGift, onResetCrowd, tikTokStatus, onConnectTikTok, onDisconnectTikTok,
}) => {
  const [activeTab, setActiveTab] = useState<LotoPanelTab>('main');
  const [gameState, setGameState] = useState<LotoState>(lotoEngine.getState());
  const [tickets, setTickets] = useState<LotoTicket[]>(lotoEngine.getTickets());
  const [customSpeak, setCustomSpeak] = useState('');
  const [networkInfo, setNetworkInfo] = useState<{ localIp: string; port: number; ticketUrl: string } | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [prizeInput, setPrizeInput] = useState<string>(gameState.currentPrize || 'Thẻ cào điện thoại 50.000đ');

  useEffect(() => {
    apiClient.getNetworkInfo().then((data) => { if (data) setNetworkInfo(data); });
    return lotoEngine.subscribe((st) => {
      setGameState(st);
      setTickets(lotoEngine.getTickets());
    });
  }, []);

  const handleAddBatchPlayers = (count: number) => {
    const existingUsers = new Set(lotoEngine.getTickets().map((t) => t.username.toLowerCase()));
    const addedList: Array<{ username: string; displayName: string; avatarUrl: string; grid: any[][] }> = [];
    for (let i = 0; i < count; i++) {
      const name = VIETNAMESE_NAMES[Math.floor(Math.random() * VIETNAMESE_NAMES.length)];
      const cleanUser = `${name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}_${Math.floor(100 + Math.random() * 900)}`;
      const avatar = FAIR_AVATARS[Math.floor(Math.random() * FAIR_AVATARS.length)];
      if (!existingUsers.has(cleanUser)) {
        existingUsers.add(cleanUser);
        const ticket = lotoEngine.issueTicket(cleanUser, name, avatar, undefined, true);
        onAddDevotee?.(cleanUser, avatar);
        addedList.push({ username: cleanUser, displayName: name, avatarUrl: avatar, grid: ticket.grid });
      }
    }
    if (addedList.length > 0) apiClient.addLotoPlayers(addedList);
  };

  const handleFillAudience = (targetCount: number = 31) => {
    handleAddBatchPlayers(Math.max(targetCount - lotoEngine.getTickets().length, 5));
  };

  const handleClearAudience = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả khán giả và vé ván này để làm mới hội trường?')) {
      lotoEngine.clearAllTickets();
      onResetCrowd?.();
      apiClient.clearLotoTickets();
    }
  };

  const ticketUrl = networkInfo?.ticketUrl || (typeof window !== 'undefined' ? window.location.origin + '/ve' : 'http://localhost:3000/ve');
  const obsStageUrl = `http://lvh.me:${networkInfo?.port || 3000}/?view=stage&theme=loto`;

  return (
    <div className="flex flex-col gap-3.5 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 shadow-2xl">
      {/* 1. HEADER CHÍNH */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-black text-amber-400 flex items-center gap-1.5">
              <span>🎪</span><span>BẢNG ĐIỀU KHIỂN LÔ TÔ (VÁN #{gameState.roundId})</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
              <span>💾</span><span>Auto-Save ({tickets.length} vé)</span>
            </span>
            {tikTokStatus?.isConnected ? (
              <span className="px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500 text-[10px] font-bold text-red-300 flex items-center gap-1 animate-pulse">
                <span>🔴</span><span>Live: @{tikTokStatus.username} ({tikTokStatus.viewerCount || 0} xem)</span>
              </span>
            ) : (
              <button onClick={() => setActiveTab('autolive')} className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                <span>📡</span><span>Kết nối TikTok / OBS</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Đã gọi: <strong className="text-amber-300">{gameState.calledNumbers.length}/90 số</strong> • <strong className="text-white">{tickets.length}</strong> khán giả đang dò vé
            {gameState.autoNextRoundCountdown !== null && <span className="ml-2 text-yellow-300 font-bold animate-pulse">• ⏳ Tự qua ván mới sau {gameState.autoNextRoundCountdown}s...</span>}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => lotoEngine.spinNext()} disabled={gameState.isSpinning} className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all ${gameState.isSpinning ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95'}`}>
            <span>🎲</span><span>{gameState.isSpinning ? 'Đang quay...' : 'Quay Số Tiếp'}</span>
          </button>
          <button
            onClick={() => {
              const next = !gameState.isAutoSpin;
              lotoEngine.setAutoSpin(next); lotoEngine.setAutoResetOnWin(true); lotoEngine.setAutoBotCrowd(next);
            }}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow ${gameState.isAutoSpin ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border border-emerald-300' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'}`}
          >
            <span>🤖</span><span>{gameState.isAutoSpin ? 'Treo Tự Động 24/7: BẬT' : 'Treo Tự Động 24/7: TẮT'}</span>
          </button>
          <button onClick={() => lotoEngine.resetRound()} className="px-3 py-2 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 hover:bg-red-900/60 font-bold text-xs transition-all active:scale-95">🔄 Ván mới</button>
        </div>
      </div>

      {/* 2. THANH CHUYỂN TAB 4 MỤC */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
        {([
          { id: 'main', icon: '🎮', label: '1. Khán Phòng & Chat', activeCls: 'from-amber-500 to-yellow-400 text-slate-950' },
          { id: 'autolive', icon: '🚀', label: '2. Tự Động Live & OBS', activeCls: 'from-red-600 to-amber-500 text-white' },
          { id: 'effects', icon: '💃', label: '3. Vũ Công & Cao Trào', activeCls: 'from-pink-600 to-rose-500 text-white' },
          { id: 'audio', icon: '🎵', label: '4. Âm Thanh (90 Số)', activeCls: 'from-emerald-600 to-teal-500 text-white' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${activeTab === tab.id ? `bg-gradient-to-r ${tab.activeCls} shadow font-black` : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            <span>{tab.icon}</span><span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'main' && (
        <LotoTabMain
          gameState={gameState} tickets={tickets} prizeInput={prizeInput} setPrizeInput={setPrizeInput}
          onSavePrize={(p) => { const val = p.trim() || 'Thẻ cào điện thoại 50.000đ'; lotoEngine.setPrize(val); setPrizeInput(val); }}
          onAddBatchPlayers={handleAddBatchPlayers} onFillAudience={handleFillAudience} onClearAudience={handleClearAudience}
          newPlayerName={newPlayerName} setNewPlayerName={setNewPlayerName}
          onAddNewPlayer={() => {
            if (!newPlayerName.trim()) return;
            const raw = newPlayerName.trim();
            const cleanUser = raw.toLowerCase().replace(/[^a-z0-9_]/g, '_') + '_' + Math.floor(100 + Math.random() * 900);
            const avatar = FAIR_AVATARS[Math.floor(Math.random() * FAIR_AVATARS.length)];
            lotoEngine.issueTicket(cleanUser, raw, avatar);
            onAddDevotee?.(cleanUser, avatar);
            setNewPlayerName('');
          }}
        />
      )}

      {activeTab === 'autolive' && (
        <LotoTabAutoLive
          tikTokStatus={tikTokStatus} onConnectTikTok={onConnectTikTok} onDisconnectTikTok={onDisconnectTikTok}
          tickets={tickets} onFillAudience={handleFillAudience}
          obsStageUrl={obsStageUrl} ticketUrl={ticketUrl} onShowQr={() => setShowQr(true)}
        />
      )}

      {activeTab === 'effects' && (
        <LotoTabEffects
          gameState={gameState} tickets={tickets}
          onSimulateWin={() => { const w = lotoEngine.simulateWin(); onAddDevotee?.(w.username, w.avatarUrl); }}
          onSimulateGift={(giftName, coins, gifterName) => {
            const fakeNames = ['Đại Gia Phúc', 'Thúy Kiều', 'Văn Hậu', 'Trâm Anh', 'Tuấn Ken', 'Bảo Ngọc', 'Hoàng Nam'];
            const name = (gifterName || '').trim() || fakeNames[Math.floor(Math.random() * fakeNames.length)];
            if (onTriggerGift) onTriggerGift(name, giftName, coins);
            else { lotoEngine.issueTicket(name, name, ''); soundEngine.speak(`Cảm ơn đại gia ${name} đã gửi tặng ${giftName}!`); lotoEngine.setSpotlightTicket(name); onAddDevotee?.(name, ''); }
          }}
        />
      )}

      {activeTab === 'audio' && <LotoTabAudio gameState={gameState} />}

      {/* 3. THANH ĐỌC LỜI MC NHANH */}
      <div className="flex gap-2 pt-1 border-t border-slate-800/80">
        <input
          type="text" value={customSpeak} onChange={(e) => setCustomSpeak(e.target.value)}
          placeholder="🔊 Nhập câu bất kỳ để AI MC đọc vang trên Live (Enter để đọc)..."
          onKeyDown={(e) => { if (e.key === 'Enter' && customSpeak.trim()) { soundEngine.speak(customSpeak.trim()); setCustomSpeak(''); } }}
          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        />
        <button onClick={() => { if (customSpeak.trim()) { soundEngine.speak(customSpeak.trim()); setCustomSpeak(''); } }} className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase transition-all">Đọc ngay</button>
      </div>

      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-950 border-2 border-yellow-400 p-6 text-center text-white shadow-2xl flex flex-col items-center">
            <button onClick={() => setShowQr(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm">✕</button>
            <span className="text-3xl mb-1">📱 🎪 📱</span>
            <h3 className="text-base font-black text-yellow-300 uppercase">MÃ QR CẦM VÉ TRÊN TAY</h3>
            <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-yellow-400 my-3">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ticketUrl)}`} alt="QR Code Lô Tô Ticket" className="w-48 h-48 object-contain" />
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-300 break-all select-all">{ticketUrl}</div>
            <button onClick={() => setShowQr(false)} className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs">Đóng lại</button>
          </div>
        </div>
      )}
    </div>
  );
};

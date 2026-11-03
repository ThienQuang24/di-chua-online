import React, { useState, useEffect } from 'react';
import { lotoEngine, LotoState, LotoTicket } from '../../services/loto/lotoEngine';
import { getLotoChant } from '../../services/loto/lotoVerses';
import { soundEngine } from '../../services/soundEngine';

interface LotoStreamerPanelProps {
  onAddDevotee?: (name: string, avatarUrl: string) => void;
  onTriggerGift?: (username: string, giftName: string, count?: number) => void;
}

export const LotoStreamerPanel: React.FC<LotoStreamerPanelProps> = ({ onAddDevotee, onTriggerGift }) => {
  const [gameState, setGameState] = useState<LotoState>(lotoEngine.getState());
  const [tickets, setTickets] = useState<LotoTicket[]>(lotoEngine.getTickets());
  const [customSpeak, setCustomSpeak] = useState('');
  const [networkInfo, setNetworkInfo] = useState<{ localIp: string; port: number; ticketUrl: string } | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lotoVoice, setLotoVoice] = useState<string>(soundEngine.getLotoVoice());
  const [useBeat, setUseBeat] = useState<boolean>(soundEngine.getLotoUseBeat());
  const [availableSongs, setAvailableSongs] = useState<number[]>([]);
  const [showSunoGuide, setShowSunoGuide] = useState(false);
  const [uploadNum, setUploadNum] = useState<number>(12);
  const [uploadMsg, setUploadMsg] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [newPlayerName, setNewPlayerName] = useState<string>('');

  // AI Voice Cloning State
  const [showCloneStudio, setShowCloneStudio] = useState(false);
  const [cloneStatus, setCloneStatus] = useState<{
    hasApiKey: boolean;
    apiKeyMasked: string;
    voiceId: string;
    voiceName: string;
    clonedCount: number;
    clonedNumbers: number[];
  }>({
    hasApiKey: false,
    apiKeyMasked: '',
    voiceId: '',
    voiceName: 'Ngọc Nữ Hằng Ny (Cloned)',
    clonedCount: 0,
    clonedNumbers: [],
  });
  const [cloneApiKeyInput, setCloneApiKeyInput] = useState('');
  const [cloneVoiceIdInput, setCloneVoiceIdInput] = useState('');
  const [cloneNumInput, setCloneNumInput] = useState<number>(1);
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneMsg, setCloneMsg] = useState('');

  const refreshCloneStatus = () => {
    fetch('/api/loto/clone/status')
      .then((r) => r.json())
      .then((d) => {
        setCloneStatus(d);
        if (d.voiceId) setCloneVoiceIdInput(d.voiceId);
      })
      .catch(() => {});
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadMsg('Đang nạp file bài hát...');
    try {
      const buffer = await file.arrayBuffer();
      const res = await fetch(`/api/loto/upload-song?num=${uploadNum}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'audio/mpeg' },
        body: buffer,
      });
      const data = await res.json();
      if (data.success) {
        setUploadMsg(`Đã nạp thành công bài hát số ${uploadNum}!`);
        fetch('/api/loto/songs')
          .then((r) => r.json())
          .then((d) => {
            if (d.songs) setAvailableSongs(d.songs);
          })
          .catch(() => {});
      } else {
        setUploadMsg(`Lỗi: ${data.error}`);
      }
    } catch (err) {
      setUploadMsg(`Lỗi tải lên: ${String(err)}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadMsg(''), 4000);
      e.target.value = '';
    }
  };

  useEffect(() => {
    fetch('/api/network-info')
      .then((r) => r.json())
      .then((data) => setNetworkInfo(data))
      .catch(() => {});

    fetch('/api/loto/songs')
      .then((r) => r.json())
      .then((data) => {
        if (data.songs) setAvailableSongs(data.songs);
      })
      .catch(() => {});

    refreshCloneStatus();
  }, []);

  const handleSaveCloneConfig = async () => {
    setCloneLoading(true);
    setCloneMsg('Đang lưu cấu hình...');
    try {
      const res = await fetch('/api/loto/clone/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: cloneApiKeyInput || undefined,
          voiceId: cloneVoiceIdInput || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCloneMsg('Đã lưu cấu hình Voice Clone thành công!');
        refreshCloneStatus();
      } else {
        setCloneMsg(`Lỗi: ${data.error}`);
      }
    } catch (err) {
      setCloneMsg(`Lỗi kết nối: ${String(err)}`);
    } finally {
      setCloneLoading(false);
      setTimeout(() => setCloneMsg(''), 4000);
    }
  };

  const handleGenerateCloneNumber = async () => {
    setCloneLoading(true);
    setCloneMsg(`Đang gọi AI ElevenLabs clone giọng cho số ${cloneNumInput}...`);
    try {
      const res = await fetch('/api/loto/clone/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num: cloneNumInput }),
      });
      const data = await res.json();
      if (data.success) {
        setCloneMsg(`Tạo thành công giọng Hằng Ny cho số ${cloneNumInput}!`);
        refreshCloneStatus();
        soundEngine.playLotoCall(cloneNumInput);
      } else {
        setCloneMsg(`Lỗi: ${data.error}`);
      }
    } catch (err) {
      setCloneMsg(`Lỗi: ${String(err)}`);
    } finally {
      setCloneLoading(false);
      setTimeout(() => setCloneMsg(''), 4000);
    }
  };

  const handleUploadClonedFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCloneLoading(true);
    setCloneMsg(`Đang nạp file giọng clone cho số ${cloneNumInput}...`);
    try {
      const buffer = await file.arrayBuffer();
      const res = await fetch(`/api/loto/clone/upload-number?num=${cloneNumInput}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'audio/mpeg' },
        body: buffer,
      });
      const data = await res.json();
      if (data.success) {
        setCloneMsg(`Đã nạp file giọng Hằng Ny cho số ${cloneNumInput}!`);
        refreshCloneStatus();
      } else {
        setCloneMsg(`Lỗi: ${data.error}`);
      }
    } catch (err) {
      setCloneMsg(`Lỗi nạp file: ${String(err)}`);
    } finally {
      setCloneLoading(false);
      setTimeout(() => setCloneMsg(''), 4000);
      e.target.value = '';
    }
  };

  useEffect(() => {
    const unsub = lotoEngine.subscribe((st) => {
      setGameState(st);
      setTickets(lotoEngine.getTickets());
    });
    return () => {
      unsub();
    };
  }, []);

  const handleSpinNext = () => {
    lotoEngine.spinNext();
  };

  const handleToggleAuto = () => {
    lotoEngine.setAutoSpin(!gameState.isAutoSpin);
  };

  const handleResetRound = () => {
    if (confirm('Bạn có chắc chắn muốn bắt đầu ván mới không? (Bảng số sẽ được xóa về 0)')) {
      lotoEngine.resetRound();
    }
  };

  const handleAddNewPlayer = () => {
    if (!newPlayerName.trim()) return;
    const raw = newPlayerName.trim();
    const cleanUser = raw.toLowerCase().replace(/[^a-z0-9_]/g, '_') + '_' + Math.floor(100 + Math.random() * 900);
    lotoEngine.issueTicket(cleanUser, raw, '');
    onAddDevotee?.(cleanUser, '');
    setNewPlayerName('');
  };

  const handleSimulatePlayer = () => {
    const fakeNames = ['Hương Giang', 'Minh Tuấn', 'Thanh Hằng', 'Bảo Ngọc', 'Hoàng Nam', 'Khánh Linh', 'Tuấn Ken', 'Chị Lan', 'Anh Ba', 'Hà My', 'Quốc Bảo'];
    const baseName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    const username = `${baseName.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(100 + Math.random() * 900)}`;
    lotoEngine.issueTicket(username, baseName, '');
    onAddDevotee?.(username, '');
  };

  const handleSimulateWin = () => {
    const winner = lotoEngine.simulateWin();
    onAddDevotee?.(winner.username, winner.avatarUrl);
  };

  const [simulatedGifterName, setSimulatedGifterName] = useState<string>('');

  const handleSimulateGift = (giftName: string, coins: number) => {
    const fakeNames = ['Đại Gia Phúc', 'Thúy Kiều', 'Văn Hậu', 'Trâm Anh', 'Tuấn Ken', 'Bảo Ngọc', 'Hoàng Nam'];
    const name = simulatedGifterName.trim() || fakeNames[Math.floor(Math.random() * fakeNames.length)];
    if (onTriggerGift) {
      onTriggerGift(name, giftName, coins);
    } else {
      lotoEngine.issueTicket(name, name, '');
      soundEngine.speak(`Cảm ơn đại gia ${name} đã gửi tặng ${giftName}! Gánh hát đã cấp ngay vé may mắn cho bạn!`);
      lotoEngine.setSpotlightTicket(name);
      onAddDevotee?.(name, '');
    }
  };

  const MC_PROMPTS = [
    {
      label: '🌹 Kêu gọi tặng hoa nhận vé',
      text: 'Gia đình mình ơi, ai chưa có vé thì bấm gửi 1 bông hoa hồng, gánh hát cấp vé may mắn liền tay để dò trúng quà to nha!',
    },
    {
      label: '🍦 Nâng cấp vé VIP Vàng',
      text: 'Đại gia nào tặng cây kem hoặc vương miện em cho ngồi hàng ghế đầu VIP máy lạnh, nâng cấp vé Vàng may mắn dễ nổ Kinh nha cả nhà!',
    },
    {
      label: '🚀 Quyền chỉ định số tiếp theo',
      text: 'Tên lửa xuất hiện là gánh hát cho đại gia chỉ định luôn con số tiếp theo quay trong lồng cầu nha quý vị!',
    },
  ];

  const handleSpeak = () => {
    if (customSpeak.trim()) {
      soundEngine.speak(customSpeak.trim());
      setCustomSpeak('');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100">
      {/* 1. THANH TRẠNG THÁI VÀ NÚT ĐIỀU KHIỂN CHÍNH */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <span>🎪</span> ĐIỀU KHIỂN LÔ TÔ ONLINE (VÁN #{gameState.roundId})
          </h2>
          <p className="text-xs text-slate-400">
            Đã gọi: <strong className="text-amber-300">{gameState.calledNumbers.length}/90 số</strong> •{' '}
            {gameState.activeTicketCount} vé đang dò
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút quay số thủ công */}
          <button
            onClick={handleSpinNext}
            disabled={gameState.isSpinning}
            className={`
              px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all
              ${
                gameState.isSpinning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95'
              }
            `}
          >
            <span>🎲</span>
            <span>{gameState.isSpinning ? 'Đang quay...' : 'Quay Số Tiếp'}</span>
          </button>

          {/* Bật / Tắt quay tự động */}
          <button
            onClick={handleToggleAuto}
            className={`
              px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all
              ${
                gameState.isAutoSpin
                  ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
              }
            `}
          >
            <span>{gameState.isAutoSpin ? '🟢 Tự động: BẬT' : '⚪ Tự động: TẮT'}</span>
          </button>

          {/* Bắt đầu ván mới */}
          <button
            onClick={handleResetRound}
            className="px-3 py-2 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-900/60 font-semibold text-xs transition-all"
          >
            🔄 Ván mới
          </button>
        </div>
      </div>

      {/* 2. BẢNG VÉ & CHIẾU VÉ KHÁN GIẢ TRỰC TIẾP TRÊN LIVE */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 p-4 rounded-2xl border-2 border-amber-500/60 shadow-xl flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎟️</span>
            <div>
              <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <span>VÉ KHÁN GIẢ TRỰC TIẾP (BẤM VÀO NGƯỜI ĐỂ HIỆN VÉ)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider">
                  Khán phòng thoáng đãng
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Toàn cảnh khán giả ngồi dò vé 100% rõ nét. Chỉ khi bấm vào người ngồi (hoặc chọn bên dưới), vé của họ mới phóng to lên màn hình!
              </p>
            </div>
          </div>

          {/* Trạng thái chiếu vé hiện tại */}
          <div className="flex items-center gap-2">
            {gameState.showSpotlightTicket ? (
              <button
                onClick={() => lotoEngine.closeSpotlightTicket()}
                className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.6)] active:scale-95"
              >
                <span>✕</span>
                <span>Đóng vé đang chiếu</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 font-semibold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                👁️ Đang xem toàn cảnh
              </span>
            )}
          </div>
        </div>

        {/* Thông báo trạng thái chiếu vé & tùy chọn tự động */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            {gameState.showSpotlightTicket && gameState.spotlightTicketUser ? (
              <span className="text-amber-300 font-bold flex items-center gap-1.5 animate-pulse">
                <span>📺</span>
                <span>
                  Đang chiếu vé của: <strong className="text-white underline">{gameState.spotlightTicketUser}</strong> trên màn hình Live!
                </span>
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>💡</span>
                <span>Bấm vào bất kỳ nhân vật nào đang ngồi trên ghế (hoặc nút [Chiếu vé] bên dưới) để mở vé của họ lên Live.</span>
              </span>
            )}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-amber-200">
            <input
              type="checkbox"
              checked={gameState.autoShowOnWaitingKin}
              onChange={(e) => lotoEngine.setAutoShowOnWaitingKin(e.target.checked)}
              className="w-3.5 h-3.5 accent-amber-500 rounded"
            />
            <span>Tự động chiếu vé khi có người Sắp KINH (4/5 số)</span>
          </label>
        </div>

        {/* Form cấp vé nhanh cho người xem */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNewPlayer()}
              placeholder="Nhập tên người xem TikTok (VD: @linh_dan, Anh Ba)..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleAddNewPlayer}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs shadow active:scale-95 transition-all whitespace-nowrap flex items-center gap-1"
            >
              <span>+</span>
              <span>Cấp vé cho khán giả</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => lotoEngine.seedInitialTickets(4)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold border border-slate-700 shadow active:scale-95 transition-all"
              title="Cấp 4 vé mẫu ban đầu"
            >
              🎲 Cấp 4 vé mẫu
            </button>
            <button
              onClick={() => lotoEngine.clearAllTickets()}
              className="px-2.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-[11px] font-semibold border border-rose-800/50 shadow active:scale-95 transition-all"
              title="Xóa hết vé ván này"
            >
              🧹 Xóa hết vé
            </button>
          </div>
        </div>

        {/* Danh sách các vé người chơi hiện tại */}
        {tickets.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Danh sách vé người chơi đang ngồi trong khán phòng ({tickets.length} vé):</span>
              <span className="text-[10px] text-amber-400 italic">Bấm 👁️ để chiếu vé của họ lên màn hình Live</span>
            </div>

            <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1">
              {tickets.map((t, idx) => {
                const isSpotlight =
                  gameState.showSpotlightTicket &&
                  gameState.spotlightTicketUser?.toLowerCase() === t.username.toLowerCase();
                const isWaiting = t.waitingNumbers.length > 0 && !t.hasWon;

                return (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                      isSpotlight
                        ? 'bg-amber-500/20 border-yellow-400 shadow-md ring-1 ring-yellow-400'
                        : t.hasWon
                        ? 'bg-yellow-950/60 border-yellow-500 text-yellow-200'
                        : isWaiting
                        ? 'bg-red-950/50 border-red-500/70 text-red-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] text-slate-500">#{idx + 1}</span>
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                        {t.avatarUrl ? (
                          <img src={t.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-amber-400">
                            {t.displayName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="font-bold truncate max-w-[120px]">{t.displayName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/50 border border-white/10 text-amber-300">
                        {t.markedCount}/15 số
                      </span>
                      {t.hasWon ? (
                        <span className="text-[10px] font-black text-yellow-300 bg-red-600 px-1.5 rounded animate-pulse">
                          👑 KINH
                        </span>
                      ) : isWaiting ? (
                        <span className="text-[10px] font-black text-yellow-300 bg-red-700 px-1.5 rounded animate-pulse">
                          🔥 Chờ: {t.waitingNumbers.join(', ')}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          isSpotlight
                            ? lotoEngine.closeSpotlightTicket()
                            : lotoEngine.setSpotlightTicket(t.username)
                        }
                        className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all active:scale-95 ${
                          isSpotlight
                            ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow font-black'
                            : 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border-amber-500/50'
                        }`}
                        title={isSpotlight ? 'Đóng vé khỏi màn hình' : 'Chiếu vé này lên màn hình Live'}
                      >
                        {isSpotlight ? '✕ Đang chiếu' : '👁️ Chiếu vé'}
                      </button>
                      <button
                        onClick={() => lotoEngine.rerollTicket(t.username)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700"
                        title="Đổi bộ số mới cho vé này"
                      >
                        🎲 Đổi
                      </button>
                      <button
                        onClick={() => lotoEngine.removeTicket(t.username)}
                        className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 text-[10px] border border-rose-800"
                        title="Xóa vé"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. PHÁT VÉ ĐIỆN TỬ CHO TỪNG THIẾT BỊ / ĐIỆN THOẠI KHÁN GIẢ (TÙY CHỌN) */}
      <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 p-3.5 rounded-2xl border border-yellow-500/50 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center text-xl shadow-inner">
            📱
          </div>
          <div>
            <div className="text-xs font-black text-yellow-300 flex items-center gap-2">
              <span>PHÁT VÉ ĐIỆN TỬ CHO TỪNG KHÁN GIẢ (ĐIỆN THOẠI)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono border border-emerald-500/40">
                🟢 Real-time Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Khán giả truy cập: <strong className="text-white font-mono">{networkInfo?.ticketUrl || 'http://localhost:3000/ve'}</strong> (hoặc quét mã QR)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const url = networkInfo?.ticketUrl || window.location.origin + '/ve';
              navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 active:scale-95 transition-all shadow"
          >
            <span>{copied ? '✓ Đã chép link' : '📋 Sao chép link vé'}</span>
          </button>

          <button
            onClick={() => setShowQr(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 text-slate-950 text-xs font-black shadow flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <span>🔍 Mở Mã QR</span>
          </button>
        </div>
      </div>

      {/* MODAL XEM MÃ QR PHÁT VÉ */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-950 border-2 border-yellow-400 p-6 text-center text-white shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm shadow"
            >
              ✕
            </button>

            <span className="text-3xl mb-1">📱 🎪 📱</span>
            <h3 className="text-base font-black text-yellow-300 uppercase tracking-wide">
              MÃ QR CẦM VÉ TRÊN TAY
            </h3>
            <p className="text-[11px] text-slate-300 mt-1 mb-4 leading-relaxed">
              Khán giả quét mã này bằng Camera điện thoại để nhận <strong>1 tờ vé riêng biệt</strong>, tự động dò số đồng bộ với bàn quay!
            </p>

            <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-yellow-400">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  networkInfo?.ticketUrl || window.location.origin + '/ve'
                )}`}
                alt="QR Code Lô Tô Ticket"
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="mt-4 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-300 break-all select-all">
              {networkInfo?.ticketUrl || window.location.origin + '/ve'}
            </div>

            <button
              onClick={() => setShowQr(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}

      {/* 3. CẤU HÌNH TỐC ĐỘ QUAY TỰ ĐỘNG */}
      <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400">Thời gian giữa 2 lần gọi số:</span>
        <input
          type="range"
          min="10"
          max="30"
          step="2"
          value={gameState.spinInterval}
          onChange={(e) => lotoEngine.setSpinInterval(Number(e.target.value))}
          className="w-48 accent-amber-500 cursor-pointer"
        />
        <span className="font-mono font-bold text-amber-400">{gameState.spinInterval} giây</span>
        <span className="text-[11px] text-slate-500 italic">
          (Khuyên dùng 16-20s để AI hát trọn vẹn cả câu hò và chốt số)
        </span>
      </div>

      {/* 3. CẤU HÌNH ÂM THANH & GIỌNG HÁT LÔ TÔ */}
      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-amber-500/30 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🎵</span>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              Âm Thanh & Giọng Hát Lô Tô Hội Chợ
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCloneStudio(!showCloneStudio)}
              className="text-[11px] text-pink-400 hover:text-pink-300 font-bold underline flex items-center gap-1 cursor-pointer transition-all"
            >
              <span>🎙️</span>
              <span>{showCloneStudio ? 'Đóng AI Voice Clone Studio' : 'AI Voice Clone: Nhân Bản Giọng Hằng Ny 100%'}</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setShowSunoGuide(!showSunoGuide)}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer"
            >
              <span>💡</span>
              <span>{showSunoGuide ? 'Đóng hướng dẫn Suno AI' : 'Tạo bằng Suno AI'}</span>
            </button>
          </div>
        </div>

        {/* AI Voice Cloning Studio (Clone giọng ca sĩ Hằng Ny 100% không ghép nối) */}
        {showCloneStudio && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-slate-950 border border-pink-500/40 text-xs flex flex-col gap-3 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎙️</span>
                <div>
                  <h4 className="font-bold text-pink-300 text-xs">AI Voice Cloning Studio: Ngọc Nữ Hằng Ny</h4>
                  <p className="text-[10px] text-slate-400">
                    Sử dụng công nghệ AI Voice Cloning để cô ấy tự đọc và gọi mọi số từ 1 đến 90 (100% cùng 1 giọng, không ghép nối)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-950 border border-pink-500/50 text-[10px] text-pink-200 font-mono font-bold">
                <span>Đã có giọng clone:</span>
                <span className="text-amber-300">{cloneStatus.clonedCount}/90 số</span>
              </div>
            </div>

            {/* Hướng dẫn 2 cách */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              {/* Cột trái: Tải mẫu giọng & Dùng Free trên Web */}
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <span>📥</span>
                  <span>Cách 1: Miễn phí qua Web ElevenLabs / Fish Audio</span>
                </span>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  1. Tải <b>file mẫu âm thanh giọng chuẩn 1 phút của ca sĩ Hằng Ny</b> về máy:
                </p>
                <a
                  href="/api/loto/clone/sample"
                  download="hang_ny_loto_sample.mp3"
                  className="px-3 py-1.5 rounded bg-pink-600 hover:bg-pink-500 text-white font-bold text-center text-[10px] flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all"
                >
                  <span>⬇️</span>
                  <span>Tải Mẫu Giọng Hằng Ny (.mp3 1 phút)</span>
                </a>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  2. Mở <a href="https://elevenlabs.io" target="_blank" rel="noreferrer" className="text-pink-400 underline font-bold">ElevenLabs.io</a> (free 10,000 ký tự) hoặc <a href="https://fish.audio" target="_blank" rel="noreferrer" className="text-pink-400 underline font-bold">Fish.audio</a>.
                  <br />
                  3. Chọn <b>Instant Voice Cloning</b> &rarr; Tải file vừa tải lên &rarr; Nhập câu gọi số và tải file MP3 về nạp vào app bên dưới.
                </p>
              </div>

              {/* Cột phải: Kết nối API tự động */}
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-pink-300 flex items-center gap-1">
                  <span>⚡</span>
                  <span>Cách 2: Kết nối API ElevenLabs (Tự động 100%)</span>
                </span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-20 shrink-0">API Key:</span>
                    <input
                      type="password"
                      placeholder={cloneStatus.hasApiKey ? 'Đã lưu: ' + cloneStatus.apiKeyMasked : 'Dán xi-api-key...'}
                      value={cloneApiKeyInput}
                      onChange={(e) => setCloneApiKeyInput(e.target.value)}
                      className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-amber-300 text-[10px] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-20 shrink-0">Voice ID:</span>
                    <input
                      type="text"
                      placeholder="Nhập Voice ID trên ElevenLabs..."
                      value={cloneVoiceIdInput}
                      onChange={(e) => setCloneVoiceIdInput(e.target.value)}
                      className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-pink-300 font-mono text-[10px] focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveCloneConfig}
                    disabled={cloneLoading}
                    className="mt-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>💾</span>
                    <span>Lưu Cấu Hình API</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quản lý từng số cụ thể */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 text-[11px] font-semibold">Tạo / Nạp giọng cho số:</span>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={cloneNumInput}
                  onChange={(e) => setCloneNumInput(Math.max(1, Math.min(90, Number(e.target.value))))}
                  className="w-12 px-1.5 py-0.5 text-center font-mono font-bold bg-slate-950 border border-slate-700 rounded text-pink-300 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                {cloneStatus.hasApiKey && cloneStatus.voiceId && (
                  <button
                    onClick={handleGenerateCloneNumber}
                    disabled={cloneLoading}
                    className="px-2.5 py-1 rounded bg-gradient-to-r from-pink-600 to-rose-600 hover:brightness-110 text-white font-bold text-[10px] flex items-center gap-1 shadow active:scale-95 transition-all cursor-pointer"
                  >
                    <span>⚡</span>
                    <span>Gọi AI Tạo Số #{cloneNumInput}</span>
                  </button>
                )}

                <label className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-[10px] cursor-pointer flex items-center gap-1 active:scale-95 transition-all">
                  <span>📁</span>
                  <span>Nạp file MP3 số #{cloneNumInput}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleUploadClonedFile}
                    disabled={cloneLoading}
                    className="hidden"
                  />
                </label>

                {cloneStatus.clonedNumbers.includes(cloneNumInput) && (
                  <button
                    onClick={() => soundEngine.playLotoCall(cloneNumInput)}
                    className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>▶️</span>
                    <span>Nghe Thử</span>
                  </button>
                )}
              </div>
            </div>

            {cloneMsg && (
              <div className={`text-[11px] font-semibold ${cloneMsg.includes('Lỗi') ? 'text-rose-400' : 'text-emerald-400'}`}>
                {cloneMsg}
              </div>
            )}
          </div>
        )}

        {/* Modal / Hướng dẫn tạo bài hát Lô Tô có nhạc phổ */}
        {showSunoGuide && (
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-xs flex flex-col gap-2 text-slate-300">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>🌟</span>
              <span>Công thức tạo bài hát Lô Tô có nhạc phổ bằng Suno AI (hoàn toàn miễn phí):</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              1. Truy cập <span className="font-mono text-amber-200">suno.com</span> hoặc <span className="font-mono text-amber-200">udio.com</span>. Bấm <b>Create</b>.
            </p>
            <p className="text-[11px] leading-relaxed">
              2. Bật chế độ <b>Custom Mode</b>. Dán Style Prompt sau:
            </p>
            <div className="bg-slate-900 p-2 rounded border border-slate-700 font-mono text-[10px] text-amber-300 select-all">
              Vietnamese folk loto fair, acoustic organ, cajon and bo percussion, cheerful southern Vietnamese melody, bolero chachacha, lively festival
            </div>
            <p className="text-[11px] leading-relaxed">
              3. Phần <b>Lyrics</b>: dán câu hò của số (ví dụ: <i>Trúc xinh trúc mọc đầu đình... Cờ ra con Mười Hai!</i>).
            </p>
            <p className="text-[11px] leading-relaxed">
              4. Tải file MP3 về, đặt tên là <span className="font-mono text-emerald-400 font-bold">12.mp3</span> (hoặc số tương ứng) và lưu vào thư mục:
              <br />
              <code className="text-[10px] bg-slate-900 px-1 py-0.5 rounded text-amber-300">public/assets/loto/songs/</code>
              <br />
              Hệ thống sẽ <b>tự động ưu tiên phát file bài hát thật</b> này thay vì đọc AI!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Lựa chọn giọng MC xướng */}
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Giọng MC Xướng Số:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setLotoVoice('vi-VN-NamMinhNeural');
                  soundEngine.setLotoVoice('vi-VN-NamMinhNeural');
                }}
                className={`py-2 px-2.5 rounded-lg border font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all ${
                  lotoVoice === 'vi-VN-NamMinhNeural'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-[1.02]'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>🧔</span>
                <span>Nam Minh (Hào sảng)</span>
              </button>
              <button
                onClick={() => {
                  setLotoVoice('vi-VN-HoaiMyNeural');
                  soundEngine.setLotoVoice('vi-VN-HoaiMyNeural');
                }}
                className={`py-2 px-2.5 rounded-lg border font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all ${
                  lotoVoice === 'vi-VN-HoaiMyNeural'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-[1.02]'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>👩</span>
                <span>Hoài My (Ngọt ngào)</span>
              </button>
            </div>
          </div>

          {/* Hòa âm Beat Đờn Organ Hội Chợ */}
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Beat Đờn Organ & Trống Bo:</span>
            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 select-none">
              <input
                type="checkbox"
                checked={useBeat}
                onChange={(e) => {
                  setUseBeat(e.target.checked);
                  soundEngine.setLotoUseBeat(e.target.checked);
                }}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <span className="text-[11px] text-slate-200">
                Tự động đệm beat đàn Organ + Reverb sân khấu khi hô số
              </span>
            </label>
          </div>
        </div>

        {/* Thông báo cơ chế gọi số thông minh */}
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-200">
          <span className="text-base shrink-0">💡</span>
          <div>
            <strong className="text-amber-300">Cơ chế gọi số thông minh:</strong> Khi bấm <em>Quay số ngẫu nhiên (1-90)</em>, hệ thống tự động phát câu hò / dạo đầu bolero luyến láy 10-12s của ca sĩ thật để giữ không khí hồi hộp, rồi hô vang chính xác số vừa quay ra! Nếu quay trúng số có bài hát riêng (#1, #2, #3, #12), bài hát gốc của ca sĩ sẽ được phát trọn vẹn 100%.
          </div>
        </div>

        {/* Quản lý và nạp file MP3 ca sĩ hát thật */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-900 text-[11px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Kho bài hát ca sĩ hát thật:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-bold text-[10px] flex items-center gap-1 shadow-sm">
                <span>🎉</span>
                <span>Đã có đủ {availableSongs.length}/90 bài hát người thật (100% không ghép nối)</span>
              </span>
            </div>

            {/* Form nạp nhanh file MP3 ca sĩ hát luyến láy */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">Nạp MP3 cho số:</span>
              <input
                type="number"
                min="1"
                max="90"
                value={uploadNum}
                onChange={(e) => setUploadNum(Math.max(1, Math.min(90, Number(e.target.value))))}
                className="w-12 px-1.5 py-0.5 text-center font-mono font-bold bg-slate-950 border border-slate-700 rounded text-amber-400 text-xs focus:outline-none"
              />
              <label className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] cursor-pointer flex items-center gap-1 active:scale-95 transition-all">
                <span>{isUploading ? '⏳' : '📁'}</span>
                <span>{isUploading ? 'Đang nạp...' : 'Thay MP3'}</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleUploadFile}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Danh sách 90 bài hát cuộn mượt mà */}
          {availableSongs.length > 0 ? (
            <div className="max-h-36 overflow-y-auto flex flex-wrap gap-1 p-2 rounded-lg bg-slate-950/90 border border-slate-800/80 shadow-inner">
              {availableSongs.map((s) => (
                <div key={s} className="inline-flex items-center rounded border border-emerald-500/30 bg-slate-900/90 overflow-hidden text-[10px] hover:border-emerald-400 transition-all">
                  <button
                    onClick={() => soundEngine.playLotoCall(s)}
                    className="px-1.5 py-0.5 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 font-mono font-bold flex items-center gap-0.5 cursor-pointer"
                    title={`Bấm nghe thử ca sĩ hát bài số ${s}`}
                  >
                    <span>▶️</span>
                    <span>#{s}</span>
                  </button>
                  <button
                    onClick={() => lotoEngine.spinNext(s)}
                    className="px-1.5 py-0.5 bg-amber-950/90 hover:bg-amber-800 border-l border-amber-600/40 text-amber-300 font-bold flex items-center gap-0.5 cursor-pointer text-[9px]"
                    title={`Quay lồng cầu và gọi trúng số ${s} trên sân khấu`}
                  >
                    <span>🎲</span>
                    <span>Quay</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-slate-500 italic">Chưa có bài hát nào</span>
          )}

          {uploadMsg && (
            <div className={`text-[11px] font-semibold ${uploadMsg.includes('Lỗi') ? 'text-rose-400' : 'text-emerald-400'}`}>
              {uploadMsg}
            </div>
          )}
        </div>
      </div>

      {/* 4. BỘ TEST NHANH GIẢ LẬP & HÁT LÔ TÔ */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
        <span className="text-xs font-semibold text-slate-400">Nghe Thử Ca Sĩ Hát Thật:</span>
        <button
          onClick={() => {
            soundEngine.playLotoCall(2);
          }}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 via-rose-500 to-amber-400 hover:brightness-110 text-[11px] text-white font-bold border border-pink-300 shadow flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>🌸</span>
          <span>Nữ Ca Sĩ Số 2 (Hằng Ny Ngọt Ngào)</span>
        </button>
        <button
          onClick={() => {
            soundEngine.playLotoCall(3);
          }}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-600 via-pink-500 to-rose-400 hover:brightness-110 text-[11px] text-white font-bold border border-pink-200 shadow flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>🌸</span>
          <span>Nữ Ca Sĩ Số 3 (Dạ Thảo Tân Thời)</span>
        </button>
        <button
          onClick={() => {
            soundEngine.playLotoCall(12);
          }}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:brightness-110 text-[11px] text-white font-bold border border-yellow-300 shadow flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>🎵</span>
          <span>Hát Thật Số 12 (Gánh Hương Nam)</span>
        </button>
        <button
          onClick={() => {
            soundEngine.playLotoCall(1);
          }}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:brightness-110 text-[11px] text-white font-bold border border-purple-300 shadow flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>🎵</span>
          <span>Mở Màn Số 1</span>
        </button>
        <button
          onClick={() => soundEngine.stopLotoCall()}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 shadow flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>⏹️</span>
          <span>Dừng tiếng</span>
        </button>
        <button
          onClick={handleSimulatePlayer}
          className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-[11px] font-bold border border-emerald-500/50 shadow flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>👥</span>
          <span>+ Thêm người chơi giả lập</span>
        </button>
        <button
          onClick={handleSimulateWin}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-[11px] border border-yellow-200 shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>👑</span>
          <span>⚡ Test nổ KINH!</span>
        </button>
      </div>

      {/* 4.5. KHU VỰC THỬ NGHIỆM MOI QUÀ TIKTOK LIVE & KỊCH BẢN MC */}
      <div className="flex flex-col gap-2.5 bg-gradient-to-r from-red-950/40 via-purple-950/30 to-amber-950/40 p-3 rounded-xl border border-red-500/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎁</span>
            <span className="text-xs font-bold text-yellow-300 uppercase tracking-wide">
              Thử Nghiệm Tặng Quà TikTok Live ("Moi Quà" Khán Giả)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={simulatedGifterName}
              onChange={(e) => setSimulatedGifterName(e.target.value)}
              placeholder="Tên người tặng (bỏ trống = random)..."
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] text-slate-200 placeholder:text-slate-500 w-44 focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        {/* 4 Nút Tặng Quà Theo Tier */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleSimulateGift('Hoa Hồng', 1)}
            className="p-2 rounded-xl bg-gradient-to-r from-rose-900/60 to-red-800/60 hover:from-rose-800 hover:to-red-700 border border-rose-500/60 flex flex-col items-center gap-0.5 shadow transition-all active:scale-95"
            title="Tặng 1 hoa hồng (1 xu) - cấp vé thường"
          >
            <div className="flex items-center gap-1">
              <span className="text-base">🌹</span>
              <span className="text-[11px] font-black text-rose-200">Hoa Hồng (1 xu)</span>
            </div>
            <span className="text-[9px] text-rose-300/80">Cấp vé thường + cảm ơn</span>
          </button>

          <button
            onClick={() => handleSimulateGift('Cây Kem', 10)}
            className="p-2 rounded-xl bg-gradient-to-r from-amber-900/60 to-yellow-800/60 hover:from-amber-800 hover:to-yellow-700 border border-yellow-500/60 flex flex-col items-center gap-0.5 shadow transition-all active:scale-95"
            title="Tặng cây kem (10 xu) - nâng vé VIP Vàng"
          >
            <div className="flex items-center gap-1">
              <span className="text-base">🍦</span>
              <span className="text-[11px] font-black text-amber-200">Cây Kem (10 xu)</span>
            </div>
            <span className="text-[9px] text-amber-300/80">Vé VIP Viền Vàng May Mắn</span>
          </button>

          <button
            onClick={() => handleSimulateGift('Vương Miện', 99)}
            className="p-2 rounded-xl bg-gradient-to-r from-purple-900/60 to-pink-800/60 hover:from-purple-800 hover:to-pink-700 border border-purple-500/60 flex flex-col items-center gap-0.5 shadow transition-all active:scale-95"
            title="Tặng vương miện (99 xu) - 2 vé + ghế đầu VIP + MC hô tên"
          >
            <div className="flex items-center gap-1">
              <span className="text-base">👑</span>
              <span className="text-[11px] font-black text-purple-200">Vương Miện (99 xu)</span>
            </div>
            <span className="text-[9px] text-purple-300/80">2 Vé + Ghế đầu VIP + MC khen</span>
          </button>

          <button
            onClick={() => handleSimulateGift('Tên Lửa', 1000)}
            className="p-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:brightness-110 border border-yellow-300 flex flex-col items-center gap-0.5 shadow-lg transition-all active:scale-95 animate-pulse"
            title="Tặng tên lửa (1000 xu) - pháo hoa rực rỡ + chọn số tiếp theo"
          >
            <div className="flex items-center gap-1">
              <span className="text-base">🚀</span>
              <span className="text-[11px] font-black text-white">Tên Lửa (1000 xu)</span>
            </div>
            <span className="text-[9px] text-yellow-200 font-bold">Pháo hoa + Chọn số quay</span>
          </button>
        </div>

        {/* Kịch bản MC Hô Hào Moi Quà Nhanh */}
        <div className="pt-2 border-t border-red-500/30 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
            <span>📢</span>
            <span>Kịch Bản AI MC Hô Hào Moi Quà (Bấm là AI MC cất giọng đọc ngay trên Live):</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {MC_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => soundEngine.speak(prompt.text)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-amber-950/80 border border-amber-500/40 text-[10px] text-amber-200 font-medium flex items-center gap-1 active:scale-95 transition-all text-left"
                title={prompt.text}
              >
                <span>🔊</span>
                <span>{prompt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. ĐỌC CÂU BẤT KỲ TRÊN LIVE */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customSpeak}
          onChange={(e) => setCustomSpeak(e.target.value)}
          placeholder="Nhập thông báo hoặc lời chào của MC..."
          onKeyDown={(e) => e.key === 'Enter' && handleSpeak()}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={handleSpeak}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase transition-all"
        >
          Đọc ngay
        </button>
      </div>
    </div>
  );
};

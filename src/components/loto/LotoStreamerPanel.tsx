import React, { useState, useEffect } from 'react';
import { lotoEngine, LotoState, LotoTicket, LotoDanceStyle } from '../../services/loto/lotoEngine';
import { soundEngine } from '../../services/soundEngine';
import { TikTokLiveStatus } from '../../types/temple';

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
  '/assets/loto/patron-1.png',
  '/assets/loto/patron-2.png',
  '/assets/nhau/patron-female-1.png',
  '/assets/nhau/patron-female-2.png',
  '/assets/nhau/patron-1.png',
  '/assets/nhau/patron-uncle-1.png',
];

export const LotoStreamerPanel: React.FC<LotoStreamerPanelProps> = ({
  onAddDevotee,
  onTriggerGift,
  onResetCrowd,
  tikTokStatus,
  onConnectTikTok,
  onDisconnectTikTok,
}) => {
  const [activeTab, setActiveTab] = useState<LotoPanelTab>('main');
  const [gameState, setGameState] = useState<LotoState>(lotoEngine.getState());
  const [tickets, setTickets] = useState<LotoTicket[]>(lotoEngine.getTickets());
  const [customSpeak, setCustomSpeak] = useState('');
  const [networkInfo, setNetworkInfo] = useState<{ localIp: string; port: number; ticketUrl: string } | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedObs, setCopiedObs] = useState(false);
  const [lotoVoice, setLotoVoice] = useState<string>(soundEngine.getLotoVoice());
  const [useBeat, setUseBeat] = useState<boolean>(soundEngine.getLotoUseBeat());
  const [availableSongs, setAvailableSongs] = useState<number[]>([]);
  const [uploadNum, setUploadNum] = useState<number>(12);
  const [uploadMsg, setUploadMsg] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [newPlayerName, setNewPlayerName] = useState<string>('');

  // Chat bubble test state
  const [chatSenderName, setChatSenderName] = useState<string>('');
  const [chatMessageInput, setChatMessageInput] = useState<string>('');

  // Video Dancer State
  const [danceVideoUrl, setDanceVideoUrl] = useState<string>('/assets/loto/dancers/dance-anime.webm');
  const [danceIsGreenScreen, setDanceIsGreenScreen] = useState<boolean>(false);
  const [danceUploadMsg, setDanceUploadMsg] = useState<string>('');
  const [isUploadingDance, setIsUploadingDance] = useState<boolean>(false);

  // Auto-Live & OBS Automation State
  const [tiktokInput, setTiktokInput] = useState<string>(tikTokStatus?.username || '');
  const [autoWatchTikTok, setAutoWatchTikTok] = useState<boolean>(true);
  const [obsWebSocketUrl, setObsWebSocketUrl] = useState<string>('ws://127.0.0.1:4455');
  const [obsPassword, setObsPassword] = useState<string>('');
  const [rtmpServer, setRtmpServer] = useState<string>('');
  const [rtmpStreamKey, setRtmpStreamKey] = useState<string>('');
  const [showObsAdvanced, setShowObsAdvanced] = useState<boolean>(false);
  const [autoLiveStatusMsg, setAutoLiveStatusMsg] = useState<string>('');
  const [autoLiveLoading, setAutoLiveLoading] = useState<boolean>(false);

  const [simulatedGifterName, setSimulatedGifterName] = useState<string>('');
  const [prizeInput, setPrizeInput] = useState<string>(gameState.currentPrize || 'Thẻ cào điện thoại 50.000đ');

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

    fetch('/api/live/auto-config')
      .then((r) => r.json())
      .then((data) => {
        if (data?.config) {
          if (data.config.tiktokUsername) setTiktokInput(data.config.tiktokUsername);
          if (typeof data.config.autoWatchTikTok === 'boolean') setAutoWatchTikTok(data.config.autoWatchTikTok);
          if (data.config.obsWebSocketUrl) setObsWebSocketUrl(data.config.obsWebSocketUrl);
          if (data.config.rtmpServer) setRtmpServer(data.config.rtmpServer);
          if (data.config.rtmpStreamKeyMasked) setRtmpStreamKey(data.config.rtmpStreamKeyMasked);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tikTokStatus?.username && !tiktokInput) {
      setTiktokInput(tikTokStatus.username);
    }
  }, [tikTokStatus?.username]);

  useEffect(() => {
    const unsub = lotoEngine.subscribe((st) => {
      setGameState(st);
      setTickets(lotoEngine.getTickets());
    });
    return () => {
      unsub();
    };
  }, []);

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

  const handleSpinNext = () => {
    lotoEngine.spinNext();
  };

  // Bật / tắt chế độ Treo Máy Tự Động 24/7 (tự quay số + tự qua ván mới + bot giữ nhiệt)
  const handleToggleAutoPilot = () => {
    const next = !gameState.isAutoSpin;
    lotoEngine.setAutoSpin(next);
    lotoEngine.setAutoResetOnWin(true);
    lotoEngine.setAutoBotCrowd(next);
  };

  const handleResetRound = () => {
    lotoEngine.resetRound();
  };

  const handleAddNewPlayer = () => {
    if (!newPlayerName.trim()) return;
    const raw = newPlayerName.trim();
    const cleanUser = raw.toLowerCase().replace(/[^a-z0-9_]/g, '_') + '_' + Math.floor(100 + Math.random() * 900);
    const avatar = FAIR_AVATARS[Math.floor(Math.random() * FAIR_AVATARS.length)];
    lotoEngine.issueTicket(cleanUser, raw, avatar);
    onAddDevotee?.(cleanUser, avatar);
    setNewPlayerName('');
  };

  const handleAddBatchPlayers = (count: number) => {
    const existingTickets = lotoEngine.getTickets();
    const existingUsers = new Set(existingTickets.map((t) => t.username.toLowerCase()));
    const addedList: Array<{ username: string; displayName: string; avatarUrl: string; grid: any[][] }> = [];

    for (let i = 0; i < count; i++) {
      const name = VIETNAMESE_NAMES[Math.floor(Math.random() * VIETNAMESE_NAMES.length)];
      const randId = Math.floor(100 + Math.random() * 900);
      const cleanUser = `${name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}_${randId}`;
      const avatar = FAIR_AVATARS[Math.floor(Math.random() * FAIR_AVATARS.length)];

      if (!existingUsers.has(cleanUser)) {
        existingUsers.add(cleanUser);
        const ticket = lotoEngine.issueTicket(cleanUser, `${name}`, avatar, undefined, true);
        onAddDevotee?.(cleanUser, avatar);
        addedList.push({ username: cleanUser, displayName: `${name}`, avatarUrl: avatar, grid: ticket.grid });
      }
    }

    if (addedList.length > 0) {
      fetch('/api/loto/add-players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: addedList }),
      }).catch(() => {});
    }
  };

  const handleFillAudience = (targetCount: number = 31) => {
    const current = lotoEngine.getTickets().length;
    const toAdd = Math.max(targetCount - current, 5);
    handleAddBatchPlayers(toAdd);
  };

  const handleClearAudience = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả khán giả và vé ván này để làm mới hội trường?')) {
      lotoEngine.clearAllTickets();
      onResetCrowd?.();
      fetch('/api/loto/clear-tickets', { method: 'POST' }).catch(() => {});
    }
  };

  const handleSimulateWin = () => {
    const winner = lotoEngine.simulateWin();
    onAddDevotee?.(winner.username, winner.avatarUrl);
  };

  const handleSavePrize = (prize: string) => {
    const val = prize.trim() || 'Thẻ cào điện thoại 50.000đ';
    lotoEngine.setPrize(val);
    setPrizeInput(val);
  };

  const handleSendTestChat = (overrideText?: string) => {
    const text = (overrideText ?? chatMessageInput).trim();
    if (!text) return;
    const targetUser = chatSenderName.trim() || (tickets[0] ? tickets[0].username : 'Anh Ba Sài Gòn');
    lotoEngine.triggerRandomBotChat(targetUser, text);
    if (!overrideText) setChatMessageInput('');
  };

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

  const handleDanceVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDance(true);
    setDanceUploadMsg('Đang nạp file video nhảy...');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/upload-dance-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            dataBase64: base64,
            isGreenScreen: danceIsGreenScreen,
          }),
        });
        const data = await res.json();
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
    } catch (err: any) {
      setDanceUploadMsg(`Lỗi: ${err.message}`);
      setIsUploadingDance(false);
    }
  };

  const handleTriggerDance = (
    style: LotoDanceStyle,
    overrideVideoUrl?: string,
    overrideIsGreen?: boolean
  ) => {
    const vUrl = overrideVideoUrl !== undefined ? overrideVideoUrl : danceVideoUrl;
    const isGreen = overrideIsGreen !== undefined ? overrideIsGreen : danceIsGreenScreen;
    if (overrideVideoUrl !== undefined) setDanceVideoUrl(overrideVideoUrl);
    if (overrideIsGreen !== undefined) setDanceIsGreenScreen(isGreen);

    lotoEngine.triggerDance(
      style,
      60000,
      'Streamer',
      'Vũ Điệu Biểu Diễn',
      vUrl || undefined,
      isGreen
    );
    fetch('/api/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'loto_dance',
        text: style,
        danceStyle: style,
        danceDuration: 60000,
        danceDonorName: 'Streamer',
        danceGiftName: 'Vũ Điệu Biểu Diễn',
        customVideoUrl: vUrl || undefined,
        isGreenScreen: isGreen,
      }),
    }).catch(() => {});

    const tierMap: Record<string, 'rose' | 'icecream' | 'crown' | 'rocket'> = {
      fan: 'rose',
      hipshake: 'icecream',
      disco: 'crown',
      robot: 'crown',
      baga: 'rocket',
      troupe: 'rocket',
    };
    soundEngine.playLotoGiftDanceBeat(tierMap[style] || 'rose');
  };

  const handleStopDance = () => {
    lotoEngine.stopDance();
    fetch('/api/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'loto_dance', text: 'stop' }),
    }).catch(() => {});
  };

  // Kích hoạt Tự Động Live Toàn Diện (1-Click Auto-Live)
  const handleOneClickAutoLive = async (withObsWebSocket: boolean = false) => {
    setAutoLiveLoading(true);
    setAutoLiveStatusMsg('🚀 Đang thiết lập Tự Động Live & Treo Máy 24/7...');
    try {
      const cleanUser = tiktokInput.trim().replace(/^@/, '');
      if (cleanUser && onConnectTikTok) {
        onConnectTikTok(cleanUser);
      }
      // Bật Auto-Pilot (Quay tự động + Tự qua ván mới + Bot giữ nhiệt)
      lotoEngine.setAutoSpin(true);
      lotoEngine.setAutoResetOnWin(true);
      lotoEngine.setAutoBotCrowd(true);
      if (tickets.length < 15) {
        handleFillAudience(20);
      }

      const res = await fetch('/api/live/auto-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiktokUsername: cleanUser,
          autoWatchTikTok,
          launchStage: true,
          connectObs: withObsWebSocket,
          obsWebSocketUrl,
          obsPassword,
          rtmpServer,
          rtmpStreamKey,
          enableAutoPilot: true,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.steps)) {
        setAutoLiveStatusMsg('✓ ' + data.steps.join(' • '));
      } else {
        setAutoLiveStatusMsg('✓ Đã kích hoạt chế độ Tự Động Live & Treo 24/7!');
      }
    } catch (err: any) {
      setAutoLiveStatusMsg('Lỗi: ' + (err.message || 'Không thể kết nối'));
    } finally {
      setAutoLiveLoading(false);
    }
  };

  const handleLaunchStageWindow = async (openObs: boolean = false) => {
    try {
      const res = await fetch('/api/live/launch-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openObs }),
      });
      const data = await res.json();
      if (data.message) setAutoLiveStatusMsg('✓ ' + data.message);
    } catch {}
  };

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

  const handleSpeak = () => {
    if (customSpeak.trim()) {
      soundEngine.speak(customSpeak.trim());
      setCustomSpeak('');
    }
  };

  const obsStageUrl = `http://lvh.me:${networkInfo?.port || 3000}/?view=stage&theme=loto`;

  return (
    <div className="flex flex-col gap-3.5 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 shadow-2xl">
      {/* 1. HEADER CHÍNH: TRẠNG THÁI VÁN + NÚT QUAY / TREO TỰ ĐỘNG 24/7 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-black text-amber-400 flex items-center gap-1.5">
              <span>🎪</span>
              <span>BẢNG ĐIỀU KHIỂN LÔ TÔ (VÁN #{gameState.roundId})</span>
            </h2>
            <span
              className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 flex items-center gap-1"
              title="Tự động lưu trạng thái ván chơi & vé liên tục"
            >
              <span>💾</span>
              <span>Auto-Save ({tickets.length} vé)</span>
            </span>
            {tikTokStatus?.isConnected ? (
              <span className="px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500 text-[10px] font-bold text-red-300 flex items-center gap-1 animate-pulse">
                <span>🔴</span>
                <span>Live: @{tikTokStatus.username} ({tikTokStatus.viewerCount || 0} xem)</span>
              </span>
            ) : (
              <button
                onClick={() => setActiveTab('autolive')}
                className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-semibold text-amber-300 flex items-center gap-1"
              >
                <span>📡</span>
                <span>Kết nối TikTok / OBS</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Đã gọi: <strong className="text-amber-300">{gameState.calledNumbers.length}/90 số</strong> •{' '}
            <strong className="text-white">{tickets.length}</strong> khán giả đang dò vé
            {gameState.autoNextRoundCountdown !== null && (
              <span className="ml-2 text-yellow-300 font-bold animate-pulse">
                • ⏳ Tự qua ván mới sau {gameState.autoNextRoundCountdown}s...
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Nút Quay Số Tiếp */}
          <button
            onClick={handleSpinNext}
            disabled={gameState.isSpinning}
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all ${
              gameState.isSpinning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95'
            }`}
          >
            <span>🎲</span>
            <span>{gameState.isSpinning ? 'Đang quay...' : 'Quay Số Tiếp'}</span>
          </button>

          {/* Nút Treo Tự Động 24/7 (Auto-Pilot) */}
          <button
            onClick={handleToggleAutoPilot}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow ${
              gameState.isAutoSpin
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Bật chế độ tự động quay số, tự động qua ván mới khi có người Kinh, và tự động cho Bot khán giả chat giữ nhiệt"
          >
            <span>🤖</span>
            <span>{gameState.isAutoSpin ? 'Treo Tự Động 24/7: BẬT' : 'Treo Tự Động 24/7: TẮT'}</span>
          </button>

          {/* Ván mới */}
          <button
            onClick={handleResetRound}
            className="px-3 py-2 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 hover:bg-red-900/60 font-bold text-xs transition-all active:scale-95"
          >
            🔄 Ván mới
          </button>
        </div>
      </div>

      {/* 2. THANH CHUYỂN TAB GỌN GÀNG (4 MỤC RÕ RÀNG, KHÔNG RỐI MẮT) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
        <button
          onClick={() => setActiveTab('main')}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'main'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>🎮</span>
          <span>1. Khán Phòng & Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('autolive')}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'autolive'
              ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>🚀</span>
          <span>2. Tự Động Live & OBS</span>
        </button>

        <button
          onClick={() => setActiveTab('effects')}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'effects'
              ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>💃</span>
          <span>3. Vũ Công & Cao Trào</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'audio'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>🎵</span>
          <span>4. Âm Thanh (90 Số)</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: KHÁN PHÒNG, TREO TỰ ĐỘNG, BONG BÓNG CHAT & DANH SÁCH VÉ
         ===================================================================== */}
      {activeTab === 'main' && (
        <div className="flex flex-col gap-3">
          {/* A. CÀI ĐẶT TREO MÁY TỰ ĐỘNG 24/7 & PHẦN THƯỞNG VÁN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Cột trái: Cấu hình Treo Tự Động */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-300 uppercase flex items-center gap-1.5">
                  <span>🤖</span>
                  <span>Chế Độ Treo Máy Tự Động 24/7</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {gameState.spinInterval}s / số
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-[11px] text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={gameState.autoResetOnWin}
                    onChange={(e) => lotoEngine.setAutoResetOnWin(e.target.checked)}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded"
                  />
                  <span>Tự động qua Ván mới sau 15s khi có người trúng Kinh</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={gameState.autoBotCrowd}
                    onChange={(e) => lotoEngine.setAutoBotCrowd(e.target.checked)}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded"
                  />
                  <span>Bot khán giả tự động lấp ghế & hiện Bong Bóng Chat giữ nhiệt</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={gameState.showPredictionWidget}
                    onChange={(e) => lotoEngine.setShowPredictionWidget(e.target.checked)}
                    className="w-3.5 h-3.5 accent-sky-500 rounded"
                  />
                  <span>Hiện thanh Mini-game Đoán số Chẵn (C) / Lẻ (L)</span>
                </label>
              </div>
            </div>

            {/* Cột phải: Phần thưởng ván này */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-yellow-500/30 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-yellow-300 uppercase flex items-center gap-1.5">
                  <span>🎁</span>
                  <span>Phần Thưởng Ván Này</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[8px] font-black uppercase">
                  Hiện Trên Live
                </span>
              </div>

              <input
                type="text"
                value={prizeInput}
                onChange={(e) => setPrizeInput(e.target.value)}
                onBlur={() => handleSavePrize(prizeInput)}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePrize(prizeInput)}
                placeholder="Nhập phần quà (VD: Thẻ cào 50K)..."
                className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-yellow-400/50 text-xs text-yellow-200 focus:outline-none focus:border-yellow-300"
              />

              <div className="flex flex-wrap items-center gap-1">
                {['Thẻ cào 20K', 'Thẻ cào 50K', 'Thẻ cào 100K', 'Gấu bông', 'Hộp quà bí mật'].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSavePrize(p)}
                    className={`px-2 py-0.5 rounded text-[9.5px] font-bold border transition-all ${
                      prizeInput === p
                        ? 'bg-yellow-500 text-slate-950 border-yellow-300'
                        : 'bg-slate-900 text-amber-200/80 border-slate-700 hover:border-yellow-500/60'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* B. BONG BÓNG CHAT TRÊN ĐẦU NHÂN VẬT (TEST HOẶC GỬI CHAT TRỰC TIẾP) */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-950 to-amber-950/30 border border-sky-500/40 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">💬</span>
                <div>
                  <h3 className="text-xs font-black text-sky-300 uppercase">
                    Bong Bóng Chat Trên Đầu Nhân Vật (Tự Động Khi Khách Bình Luận TikTok)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Khi người xem bình luận bất kỳ câu gì trên TikTok Live, câu chat sẽ nổi lên ngay trên đầu nhân vật của họ trong 8 giây!
                  </p>
                </div>
              </div>

              <button
                onClick={() => lotoEngine.triggerRandomBotChat()}
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10.5px] font-bold shadow active:scale-95 transition-all flex items-center gap-1"
              >
                <span>🎲</span>
                <span>Cho 1 Khán Giả Chat Ngẫu Nhiên</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={chatSenderName}
                onChange={(e) => setChatSenderName(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 font-semibold focus:outline-none focus:border-sky-400 sm:w-44"
              >
                <option value="">-- Chọn người ngồi --</option>
                {tickets.map((t) => (
                  <option key={t.id} value={t.username}>
                    {t.displayName}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={chatMessageInput}
                onChange={(e) => setChatMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendTestChat()}
                placeholder="Nhập câu chat muốn hiện lên đầu nhân vật (VD: Ra số 25 đi ad ơi!)..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />

              <button
                onClick={() => handleSendTestChat()}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs shadow active:scale-95 transition-all whitespace-nowrap"
              >
                💬 Hiện Lên Đầu
              </button>
            </div>

            {/* Các câu chat mẫu 1-click */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-slate-400">Chat mẫu nhanh:</span>
              {[
                { label: '🎫 "layve"', text: 'layve' },
                { label: '🎲 "Chẵn (C)"', text: 'Chẵn' },
                { label: '🎲 "Lẻ (L)"', text: 'Lẻ' },
                { label: '🔥 "Còn 1 con nữa Kinh!"', text: 'Còn 1 con nữa là em Kinh rồi!' },
                { label: '🚨 "kinh" (Báo động Kinh giả)', text: 'kinh' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendTestChat(item.text)}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-sky-200 border border-slate-700 hover:border-sky-400 transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* C. QUẢN LÝ KHÁN PHÒNG (47 GHẾ) & DANH SÁCH VÉ */}
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

            {/* Cụm nút thêm khách & cấp vé thủ công */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleAddBatchPlayers(1)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold border border-emerald-500/50 active:scale-95 transition-all"
                >
                  +1 Khách
                </button>
                <button
                  onClick={() => handleAddBatchPlayers(5)}
                  className="px-2.5 py-1 rounded-lg bg-teal-950/70 hover:bg-teal-900 text-teal-300 text-[11px] font-bold border border-teal-500/50 active:scale-95 transition-all"
                >
                  +5 Khách
                </button>
                <button
                  onClick={() => handleAddBatchPlayers(10)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 text-[11px] font-bold border border-indigo-500/50 active:scale-95 transition-all"
                >
                  +10 Khách
                </button>
                <button
                  onClick={() => handleFillAudience(31)}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-[11px] shadow active:scale-95 transition-all"
                >
                  🔥 Lấp Đầy 31 Ghế
                </button>
                <button
                  onClick={() => handleFillAudience(47)}
                  className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 font-bold text-[11px] border border-amber-500/50 active:scale-95 transition-all"
                >
                  🎪 Đầy 47 Ghế
                </button>
                <button
                  onClick={handleClearAudience}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 text-[11px] font-semibold border border-rose-800/50 active:scale-95 transition-all"
                >
                  🧹 Xóa hết
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-1 min-w-[240px]">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNewPlayer()}
                  placeholder="Nhập tên khách TikTok để cấp vé..."
                  className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleAddNewPlayer}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap active:scale-95 transition-all"
                >
                  + Cấp vé
                </button>
              </div>
            </div>

            {/* Danh sách vé cuộn gọn */}
            {tickets.length > 0 && (
              <div className="max-h-52 overflow-y-auto flex flex-col gap-1 pr-1">
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
                          ? 'bg-amber-500/20 border-yellow-400 ring-1 ring-yellow-400'
                          : t.hasWon
                          ? 'bg-yellow-950/60 border-yellow-500 text-yellow-200'
                          : isWaiting
                          ? 'bg-red-950/50 border-red-500/70 text-red-200'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] text-slate-500">#{idx + 1}</span>
                        <span className="font-bold truncate max-w-[130px]">{t.displayName}</span>
                        {t.isVip && (
                          <span className="text-[9px] font-black text-slate-950 bg-yellow-400 px-1.5 rounded">
                            👑 VIP
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/50 border border-white/10 text-amber-300">
                          {t.markedCount}/15
                        </span>
                        {t.hasWon ? (
                          <span className="text-[9.5px] font-black text-yellow-300 bg-red-600 px-1.5 rounded animate-pulse">
                            👑 KINH
                          </span>
                        ) : isWaiting ? (
                          <span className="text-[9.5px] font-black text-yellow-300 bg-red-700 px-1.5 rounded animate-pulse">
                            🔥 Chờ: {t.waitingNumbers.join(', ')}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            isSpotlight
                              ? lotoEngine.closeSpotlightTicket()
                              : lotoEngine.setSpotlightTicket(t.username)
                          }
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold border transition-all ${
                            isSpotlight
                              ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-black'
                              : 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border-amber-500/50'
                          }`}
                        >
                          {isSpotlight ? '✕ Đóng' : '👁️ Chiếu vé'}
                        </button>
                        <button
                          onClick={() =>
                            lotoEngine.upgradeToVip(t.username, t.displayName, t.avatarUrl, 'Vé Vàng VIP', 10)
                          }
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            t.isVip
                              ? 'bg-yellow-500 text-slate-950 border-yellow-300'
                              : 'bg-slate-800 hover:bg-slate-700 text-yellow-300 border-slate-700'
                          }`}
                          title="Nâng cấp Vé Vàng VIP"
                        >
                          👑 VIP
                        </button>
                        <button
                          onClick={() => lotoEngine.simulateFakeKinh(t.username)}
                          className="px-1.5 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-[10px] font-bold border border-rose-700"
                          title="Bắt Kinh giả & phạt người này"
                        >
                          🚨 Phạt
                        </button>
                        <button
                          onClick={() => lotoEngine.rerollTicket(t.username)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700"
                          title="Đổi vé khác"
                        >
                          🎲
                        </button>
                        <button
                          onClick={() => lotoEngine.removeTicket(t.username)}
                          className="px-1.5 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 text-[10px] border border-rose-800"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: KẾT NỐI TIKTOK & TỰ ĐỘNG PHÁT LIVE (1-CLICK AUTO-LIVE & OBS)
         ===================================================================== */}
      {activeTab === 'autolive' && (
        <div className="flex flex-col gap-3">
          {/* 1. HỘP TỔNG LỆNH 1-CLICK AUTO-LIVE TIKTOK */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/50 via-slate-950 to-amber-950/40 border-2 border-amber-500/60 shadow-xl flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="text-sm font-black text-amber-300 uppercase">
                    Tự Động Kết Nối TikTok Live & Treo Máy 24/7 (1-Click Auto-Live)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Chỉ cần nhập tài khoản TikTok của bạn và bấm nút dưới đây: Hệ thống tự động mở cửa sổ Sân Khấu 9:16, tự động canh bắt sóng phòng Live và tự động chạy game Lô Tô xuyên đêm!
                  </p>
                </div>
              </div>

              {tikTokStatus?.isConnected ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black flex items-center gap-1.5 animate-pulse">
                  <span>🟢</span>
                  <span>Đang kết nối: @{tikTokStatus.username}</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
                  ⚪ Chưa kết nối phòng Live
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2">
                <span className="text-amber-400 font-black text-sm mr-1.5">@</span>
                <input
                  type="text"
                  value={tiktokInput}
                  onChange={(e) => setTiktokInput(e.target.value.replace(/^@/, ''))}
                  placeholder="Nhập ID tài khoản TikTok của bạn (VD: gánh_hát_lô_tô)..."
                  className="bg-transparent text-xs text-white focus:outline-none w-full font-bold"
                />
              </div>

              <button
                onClick={() => handleOneClickAutoLive(false)}
                disabled={autoLiveLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>🚀</span>
                <span>{autoLiveLoading ? 'Đang kích hoạt...' : 'Bật Tự Động Live Toàn Diện'}</span>
              </button>

              {tikTokStatus?.isConnected && (
                <button
                  onClick={() => onDisconnectTikTok?.()}
                  className="px-3.5 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs"
                >
                  ⏹ Ngắt kết nối
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoWatchTikTok}
                  onChange={(e) => setAutoWatchTikTok(e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-500 rounded"
                />
                <span>
                  <strong>Tự động canh sóng (Auto-Watch 15s):</strong> Hễ bạn bấm <em>Phát trực tiếp (Go LIVE)</em> trên TikTok là hệ thống tự bắt sóng ngay!
                </span>
              </label>
            </div>

            {autoLiveStatusMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 font-semibold">
                {autoLiveStatusMsg}
              </div>
            )}

            {tikTokStatus?.error && (
              <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-[11px] text-amber-200">
                💡 <strong>Trạng thái phòng Live:</strong> {tikTokStatus.error} (Hệ thống đang bật chế độ Tự Động Canh Sóng — ngay khi tài khoản <strong>@{tiktokInput || 'của bạn'}</strong> lên sóng trên TikTok, app sẽ tự động kết nối!)
              </div>
            )}
          </div>

          {/* 2. KẾT NỐI OBS STUDIO / TIKTOK LIVE STUDIO TỰ ĐỘNG */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black text-amber-300 uppercase flex items-center gap-1.5">
                  <span>🎥</span>
                  <span>Nguồn Phát Hình Ảnh & Âm Thanh Lên OBS / TikTok LIVE Studio</span>
                </h4>
                <p className="text-[10.5px] text-slate-400">
                  Mở cửa sổ Sân Khấu 9:16 độc lập hoặc dán Link OBS vào mục <strong>Liên kết (Browser Source)</strong> kích thước <strong>1080x1920</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleLaunchStageWindow(false)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow active:scale-95 transition-all flex items-center gap-1"
                >
                  <span>🖥️</span>
                  <span>Mở Cửa Sổ Sân Khấu 9:16</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(obsStageUrl);
                    setCopiedObs(true);
                    setTimeout(() => setCopiedObs(false), 2500);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/40 active:scale-95 transition-all"
                >
                  {copiedObs ? '✓ Đã chép Link OBS' : '📋 Chép Link OBS (lvh.me)'}
                </button>

                <button
                  onClick={() => setShowObsAdvanced(!showObsAdvanced)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-700"
                >
                  ⚙️ OBS WebSocket / RTMP {showObsAdvanced ? '▲' : '▼'}
                </button>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300 select-all">
              {obsStageUrl}
            </div>

            {showObsAdvanced && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 flex flex-col gap-2.5 text-xs">
                <div className="font-bold text-amber-300">
                  ⚡ Điều Khiển OBS Studio Tự Động Qua OBS WebSocket (Cổng 4455):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={obsWebSocketUrl}
                    onChange={(e) => setObsWebSocketUrl(e.target.value)}
                    placeholder="ws://127.0.0.1:4455"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                  />
                  <input
                    type="password"
                    value={obsPassword}
                    onChange={(e) => setObsPassword(e.target.value)}
                    placeholder="Mật khẩu OBS WebSocket (nếu có)..."
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={rtmpServer}
                    onChange={(e) => setRtmpServer(e.target.value)}
                    placeholder="RTMP Server URL TikTok (tùy chọn)..."
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                  />
                  <input
                    type="password"
                    value={rtmpStreamKey}
                    onChange={(e) => setRtmpStreamKey(e.target.value)}
                    placeholder="RTMP Stream Key TikTok (tùy chọn)..."
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleOneClickAutoLive(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs shadow active:scale-95 transition-all"
                  >
                    🎬 Tự Động Nạp Scene & Bấm Start Stream Trên OBS
                  </button>
                  <span className="text-[10px] text-slate-400">
                    (Trong OBS: Vào menu <em>Công cụ &rarr; Cài đặt máy chủ WebSocket &rarr; Bật</em>)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3. LINK & MÃ QR CẦM VÉ TRÊN ĐIỆN THOẠI (/VE) */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-yellow-500/40 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-black text-yellow-300 uppercase flex items-center gap-1.5">
                <span>📱</span>
                <span>Phát Vé Điện Tử Cho Điện Thoại Khán Giả (/ve)</span>
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Link cầm vé: <strong className="text-white font-mono">{networkInfo?.ticketUrl || 'http://localhost:3000/ve'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const url = networkInfo?.ticketUrl || window.location.origin + '/ve';
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
              >
                {copied ? '✓ Đã chép link' : '📋 Chép link /ve'}
              </button>

              <button
                onClick={() => setShowQr(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 text-xs font-black shadow"
              >
                🔍 Hiện Mã QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: VŨ CÔNG SÂN KHẤU, HIỆU ỨNG CAO TRÀO & GIẢ LẬP QUÀ TẶNG
         ===================================================================== */}
      {activeTab === 'effects' && (
        <div className="flex flex-col gap-3">
          {/* 1. BỘ NÚT KÍCH HOẠT HIỆU ỨNG CAO TRÀO */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/40 flex flex-col gap-2">
            <span className="text-xs font-black text-amber-300 uppercase">
              ⚡ Kích Hoạt Nhanh Hiệu Ứng Cao Trào Phòng Live
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => lotoEngine.simulateFakeKinh()}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-orange-600 hover:brightness-110 text-white text-[11px] font-black border border-yellow-300/70 shadow active:scale-95 transition-all"
              >
                🚨 Test Bắt Kinh Giả (Phạt Hài Hước)
              </button>

              <button
                onClick={() => lotoEngine.simulateTensionWaiting(3)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-700 to-amber-600 hover:brightness-110 text-yellow-100 text-[11px] font-black border border-yellow-300/70 shadow active:scale-95 transition-all"
              >
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

              <button
                onClick={() => lotoEngine.simulatePredictions(10)}
                className="px-3 py-1.5 rounded-lg bg-sky-900 hover:bg-sky-800 text-sky-100 text-[11px] font-bold border border-sky-400/50 shadow active:scale-95 transition-all"
              >
                🎲 Test 10 Khách Đoán Chẵn/Lẻ
              </button>

              <button
                onClick={handleSimulateWin}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black text-[11px] border border-white shadow active:scale-95 transition-all"
              >
                👑 Test Nổ KINH!
              </button>
            </div>
          </div>

          {/* 2. VŨ CÔNG NHẢY MÚA SÂN KHẤU (7 ĐIỆU NHẢY GỌN ĐẸP, KHÔNG TRÙNG LẶP) */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-pink-500/40 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-pink-300 uppercase">
                  💃 Vũ Công Nhảy Múa Trên Sân Khấu (7 Trend TikTok)
                </span>
                {gameState.danceStyle && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase animate-pulse">
                    Đang nhảy: {gameState.danceStyle}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {gameState.danceStyle && (
                  <button
                    onClick={handleStopDance}
                    className="px-2.5 py-1 rounded-lg bg-red-900 hover:bg-red-800 text-red-100 text-[10.5px] font-bold border border-red-500/60"
                  >
                    ⏹️ Dừng vũ công
                  </button>
                )}

                <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-pink-950 hover:bg-pink-900 border border-pink-500/50 text-pink-200 text-[10.5px] font-bold flex items-center gap-1">
                  <span>📁 Nạp Video Nhảy (.mp4/.webm)</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleDanceVideoUpload}
                    disabled={isUploadingDance}
                    className="hidden"
                  />
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

            {danceUploadMsg && (
              <span className="text-[10px] text-emerald-400 font-semibold">{danceUploadMsg}</span>
            )}
          </div>

          {/* 3. GIẢ LẬP QUÀ TẶNG TIKTOK & LỜI RAO MC */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/40 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black text-yellow-300 uppercase">
                🎁 Giả Lập Khách Tặng Quà TikTok & Lời Rao AI MC
              </span>
              <input
                type="text"
                value={simulatedGifterName}
                onChange={(e) => setSimulatedGifterName(e.target.value)}
                placeholder="Tên người tặng (bỏ trống = ngẫu nhiên)..."
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-white w-52 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleSimulateGift('Hoa Hồng', 1)}
                className="p-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 text-xs font-bold text-rose-200 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🌹</span>
                <span>Hoa Hồng (1 xu)</span>
              </button>
              <button
                onClick={() => handleSimulateGift('Cây Kem', 10)}
                className="p-2 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-yellow-500/50 text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🍦</span>
                <span>Cây Kem (10 xu)</span>
              </button>
              <button
                onClick={() => handleSimulateGift('Vương Miện', 99)}
                className="p-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/50 text-xs font-bold text-purple-200 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>👑</span>
                <span>Vương Miện (99 xu)</span>
              </button>
              <button
                onClick={() => handleSimulateGift('Tên Lửa', 1000)}
                className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-xs font-black text-white border border-yellow-300 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🚀</span>
                <span>Tên Lửa (1000 xu)</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {MC_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => soundEngine.speak(prompt.text)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-950 border border-amber-500/40 text-[10px] text-amber-200 font-semibold flex items-center gap-1"
                >
                  <span>🔊</span>
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: ÂM THANH, GIỌNG HÒ & KHO 90 BÀI HÁT LÔ TÔ
         ===================================================================== */}
      {activeTab === 'audio' && (
        <div className="flex flex-col gap-3">
          {/* 1. TỐC ĐỘ QUAY, GIỌNG MC & BEAT ĐÀN ORGAN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-slate-400 font-semibold text-[11px]">
                ⏱️ Tốc độ quay tự động: <strong className="text-amber-300">{gameState.spinInterval} giây/số</strong>
              </span>
              <input
                type="range"
                min="10"
                max="30"
                step="2"
                value={gameState.spinInterval}
                onChange={(e) => lotoEngine.setSpinInterval(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Khuyên dùng 16-20s để nghe trọn câu hò</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-slate-400 font-semibold text-[11px]">🎙️ Giọng MC Xướng Số:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    setLotoVoice('vi-VN-NamMinhNeural');
                    soundEngine.setLotoVoice('vi-VN-NamMinhNeural');
                  }}
                  className={`py-1.5 px-2 rounded-lg border font-bold text-[11px] ${
                    lotoVoice === 'vi-VN-NamMinhNeural'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  🧔 Nam Minh
                </button>
                <button
                  onClick={() => {
                    setLotoVoice('vi-VN-HoaiMyNeural');
                    soundEngine.setLotoVoice('vi-VN-HoaiMyNeural');
                  }}
                  className={`py-1.5 px-2 rounded-lg border font-bold text-[11px] ${
                    lotoVoice === 'vi-VN-HoaiMyNeural'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  👩 Hoài My
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-slate-400 font-semibold text-[11px]">🎹 Nhạc Đệm & Điều Khiển:</span>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={useBeat}
                    onChange={(e) => {
                      setUseBeat(e.target.checked);
                      soundEngine.setLotoUseBeat(e.target.checked);
                    }}
                    className="w-3.5 h-3.5 accent-amber-500 rounded"
                  />
                  <span>Đệm Beat Organ</span>
                </label>
                <button
                  onClick={() => soundEngine.stopLotoCall()}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700"
                >
                  ⏹️ Dừng tiếng
                </button>
              </div>
            </div>
          </div>

          {/* 2. KHO 90 BÀI HÁT LÔ TÔ NGƯỜI THẬT */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-300 uppercase">
                  🎵 Kho Bài Hát Lô Tô Người Thật ({availableSongs.length}/90 số)
                </span>
                <span className="text-[10px] text-slate-400">
                  (Bấm ▶️ để nghe thử hoặc 🎲 để quay ra đúng số đó)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Thay MP3 số:</span>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={uploadNum}
                  onChange={(e) => setUploadNum(Math.max(1, Math.min(90, Number(e.target.value))))}
                  className="w-12 px-1.5 py-0.5 text-center font-mono font-bold bg-slate-900 border border-slate-700 rounded text-amber-400 text-xs"
                />
                <label className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] cursor-pointer">
                  <span>{isUploading ? '⏳ Đang nạp...' : '📁 Chọn MP3'}</span>
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

            {uploadMsg && (
              <div className="text-[11px] font-semibold text-emerald-400">{uploadMsg}</div>
            )}

            <div className="max-h-44 overflow-y-auto flex flex-wrap gap-1 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              {availableSongs.map((s) => (
                <div
                  key={s}
                  className="inline-flex items-center rounded border border-emerald-500/30 bg-slate-950 overflow-hidden text-[10px]"
                >
                  <button
                    onClick={() => soundEngine.playLotoCall(s)}
                    className="px-1.5 py-0.5 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 font-mono font-bold"
                    title={`Nghe thử bài số ${s}`}
                  >
                    ▶️ #{s}
                  </button>
                  <button
                    onClick={() => lotoEngine.spinNext(s)}
                    className="px-1.5 py-0.5 bg-amber-950/90 hover:bg-amber-800 border-l border-amber-600/40 text-amber-300 font-bold text-[9px]"
                    title={`Quay trúng số ${s}`}
                  >
                    🎲
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. THANH ĐỌC LỜI MC NHANH (LUÔN NẰM GỌN DƯỚI ĐÁY) */}
      <div className="flex gap-2 pt-1 border-t border-slate-800/80">
        <input
          type="text"
          value={customSpeak}
          onChange={(e) => setCustomSpeak(e.target.value)}
          placeholder="🔊 Nhập câu bất kỳ để AI MC đọc vang trên Live (Enter để đọc)..."
          onKeyDown={(e) => e.key === 'Enter' && handleSpeak()}
          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={handleSpeak}
          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase transition-all"
        >
          Đọc ngay
        </button>
      </div>

      {/* MODAL XEM MÃ QR PHÁT VÉ */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-950 border-2 border-yellow-400 p-6 text-center text-white shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm"
            >
              ✕
            </button>
            <span className="text-3xl mb-1">📱 🎪 📱</span>
            <h3 className="text-base font-black text-yellow-300 uppercase">
              MÃ QR CẦM VÉ TRÊN TAY
            </h3>
            <p className="text-[11px] text-slate-300 mt-1 mb-4">
              Khán giả quét mã này bằng điện thoại để nhận <strong>1 tờ vé riêng biệt</strong>, tự động dò số đồng bộ với bàn quay!
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
              className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

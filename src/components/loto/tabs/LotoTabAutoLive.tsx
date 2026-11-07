import React, { useState, useEffect } from 'react';
import { lotoEngine, LotoTicket } from '../../../services/loto/lotoEngine';
import { apiClient } from '../../../services/apiClient';
import { TikTokLiveStatus } from '../../../types/temple';

interface LotoTabAutoLiveProps {
  tikTokStatus?: TikTokLiveStatus;
  onConnectTikTok?: (username: string) => void;
  onDisconnectTikTok?: () => void;
  tickets: LotoTicket[];
  onFillAudience: (targetCount: number) => void;
  obsStageUrl: string;
  ticketUrl: string;
  onShowQr: () => void;
}

export const LotoTabAutoLive: React.FC<LotoTabAutoLiveProps> = ({
  tikTokStatus,
  onConnectTikTok,
  onDisconnectTikTok,
  tickets,
  onFillAudience,
  obsStageUrl,
  ticketUrl,
  onShowQr,
}) => {
  const [tiktokInput, setTiktokInput] = useState<string>(tikTokStatus?.username || '');
  const [autoWatchTikTok, setAutoWatchTikTok] = useState<boolean>(true);
  const [obsWebSocketUrl, setObsWebSocketUrl] = useState<string>('ws://127.0.0.1:4455');
  const [obsPassword, setObsPassword] = useState<string>('');
  const [rtmpServer, setRtmpServer] = useState<string>('');
  const [rtmpStreamKey, setRtmpStreamKey] = useState<string>('');
  const [autoLiveStatusMsg, setAutoLiveStatusMsg] = useState<string>('');
  const [autoLiveLoading, setAutoLiveLoading] = useState<boolean>(false);
  const [copiedObs, setCopiedObs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showObsAdvanced, setShowObsAdvanced] = useState(false);

  useEffect(() => {
    apiClient.getAutoLiveConfig().then((data) => {
      if (data?.config) {
        if (data.config.tiktokUsername) setTiktokInput(data.config.tiktokUsername);
        if (typeof data.config.autoWatchTikTok === 'boolean') setAutoWatchTikTok(data.config.autoWatchTikTok);
        if (data.config.obsWebSocketUrl) setObsWebSocketUrl(data.config.obsWebSocketUrl);
        if (data.config.rtmpServer) setRtmpServer(data.config.rtmpServer);
        if (data.config.rtmpStreamKeyMasked) setRtmpStreamKey(data.config.rtmpStreamKeyMasked);
      }
    });
  }, []);

  useEffect(() => {
    if (tikTokStatus?.username && !tiktokInput) setTiktokInput(tikTokStatus.username);
  }, [tikTokStatus?.username]);

  const handleOneClickAutoLive = async (withObsWebSocket: boolean = false) => {
    setAutoLiveLoading(true);
    setAutoLiveStatusMsg('🚀 Đang thiết lập Tự Động Live & Treo Máy 24/7...');
    try {
      const cleanUser = tiktokInput.trim().replace(/^@/, '');
      if (cleanUser && onConnectTikTok) onConnectTikTok(cleanUser);
      lotoEngine.setAutoSpin(true);
      lotoEngine.setAutoResetOnWin(true);
      lotoEngine.setAutoBotCrowd(true);
      if (tickets.length < 15) onFillAudience(20);

      const data = await apiClient.startAutoLive({
        tiktokUsername: cleanUser, autoWatchTikTok, launchStage: true,
        connectObs: withObsWebSocket, obsWebSocketUrl, obsPassword, rtmpServer, rtmpStreamKey, enableAutoPilot: true,
      });
      setAutoLiveStatusMsg(data.success && Array.isArray(data.steps) ? '✓ ' + data.steps.join(' • ') : '✓ Đã kích hoạt chế độ Tự Động Live & Treo 24/7!');
    } catch (err: any) {
      setAutoLiveStatusMsg('Lỗi: ' + (err.message || 'Không thể kết nối'));
    } finally {
      setAutoLiveLoading(false);
    }
  };

  return (
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
              <span>🟢</span><span>Đang kết nối: @{tikTokStatus.username}</span>
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
              type="text" value={tiktokInput} onChange={(e) => setTiktokInput(e.target.value.replace(/^@/, ''))}
              placeholder="Nhập ID tài khoản TikTok của bạn (VD: gánh_hát_lô_tô)..."
              className="bg-transparent text-xs text-white focus:outline-none w-full font-bold"
            />
          </div>

          <button
            onClick={() => handleOneClickAutoLive(false)}
            disabled={autoLiveLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>🚀</span><span>{autoLiveLoading ? 'Đang kích hoạt...' : 'Bật Tự Động Live Toàn Diện'}</span>
          </button>

          {tikTokStatus?.isConnected && (
            <button onClick={() => onDisconnectTikTok?.()} className="px-3.5 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs">
              ⏹ Ngắt kết nối
            </button>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-300 pt-1">
          <input type="checkbox" checked={autoWatchTikTok} onChange={(e) => setAutoWatchTikTok(e.target.checked)} className="w-3.5 h-3.5 accent-amber-500 rounded" />
          <span><strong>Tự động canh sóng (Auto-Watch 15s):</strong> Hễ bạn bấm <em>Phát trực tiếp (Go LIVE)</em> trên TikTok là hệ thống tự bắt sóng ngay!</span>
        </label>

        {autoLiveStatusMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 font-semibold">{autoLiveStatusMsg}</div>
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
              <span>🎥</span><span>Nguồn Phát Hình Ảnh & Âm Thanh Lên OBS / TikTok LIVE Studio</span>
            </h4>
            <p className="text-[10.5px] text-slate-400">
              Mở cửa sổ Sân Khấu 9:16 độc lập hoặc dán Link OBS vào mục <strong>Liên kết (Browser Source)</strong> kích thước <strong>1080x1920</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => apiClient.launchStageWindow(false).then((d) => { if (d?.message) setAutoLiveStatusMsg('✓ ' + d.message); })}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow active:scale-95 transition-all flex items-center gap-1"
            >
              <span>🖥️</span><span>Mở Cửa Sổ Sân Khấu 9:16</span>
            </button>

            <button
              onClick={() => { navigator.clipboard.writeText(obsStageUrl); setCopiedObs(true); setTimeout(() => setCopiedObs(false), 2500); }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/40 active:scale-95 transition-all"
            >
              {copiedObs ? '✓ Đã chép Link OBS' : '📋 Chép Link OBS (lvh.me)'}
            </button>

            <button onClick={() => setShowObsAdvanced(!showObsAdvanced)} className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
              ⚙️ OBS WebSocket / RTMP {showObsAdvanced ? '▲' : '▼'}
            </button>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300 select-all">{obsStageUrl}</div>

        {showObsAdvanced && (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 flex flex-col gap-2.5 text-xs">
            <div className="font-bold text-amber-300">⚡ Điều Khiển OBS Studio Tự Động Qua OBS WebSocket (Cổng 4455):</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" value={obsWebSocketUrl} onChange={(e) => setObsWebSocketUrl(e.target.value)} placeholder="ws://127.0.0.1:4455" className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs" />
              <input type="password" value={obsPassword} onChange={(e) => setObsPassword(e.target.value)} placeholder="Mật khẩu OBS WebSocket (nếu có)..." className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs" />
              <input type="text" value={rtmpServer} onChange={(e) => setRtmpServer(e.target.value)} placeholder="RTMP Server URL TikTok (tùy chọn)..." className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs" />
              <input type="password" value={rtmpStreamKey} onChange={(e) => setRtmpStreamKey(e.target.value)} placeholder="RTMP Stream Key TikTok (tùy chọn)..." className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs" />
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button onClick={() => handleOneClickAutoLive(true)} className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs shadow active:scale-95 transition-all">
                🎬 Tự Động Nạp Scene & Bấm Start Stream Trên OBS
              </button>
              <span className="text-[10px] text-slate-400">(Trong OBS: Vào menu <em>Công cụ &rarr; Cài đặt máy chủ WebSocket &rarr; Bật</em>)</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. LINK & MÃ QR CẦM VÉ TRÊN ĐIỆN THOẠI (/VE) */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-yellow-500/40 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-black text-yellow-300 uppercase flex items-center gap-1.5">
            <span>📱</span><span>Phát Vé Điện Tử Cho Điện Thoại Khán Giả (/ve)</span>
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5">Link cầm vé: <strong className="text-white font-mono">{ticketUrl}</strong></p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(ticketUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
          >
            {copied ? '✓ Đã chép link' : '📋 Chép link /ve'}
          </button>
          <button onClick={onShowQr} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 text-xs font-black shadow">
            🔍 Hiện Mã QR
          </button>
        </div>
      </div>
    </div>
  );
};

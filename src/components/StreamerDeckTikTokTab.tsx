import React, { useState } from 'react';
import { TikTokLiveStatus } from '../types/temple';
import { LiveControlPanel } from './LiveControlPanel';

const obsStageUrl = () => `http://lvh.me:${(typeof window !== 'undefined' && window.location.port) || '3000'}/?view=stage`;

interface StreamerDeckTikTokTabProps {
  tikTokStatus?: TikTokLiveStatus;
  onConnectTikTok?: (username: string) => void;
  onDisconnectTikTok?: () => void;
}

export const StreamerDeckTikTokTab: React.FC<StreamerDeckTikTokTabProps> = ({
  tikTokStatus,
  onConnectTikTok,
  onDisconnectTikTok,
}) => {
  const [tiktokUsernameInput, setTiktokUsernameInput] = useState(tikTokStatus?.username || '');
  const [copiedUrl, setCopiedUrl] = useState(false);

  return (
    <div className="space-y-4">
      <LiveControlPanel />

      {/* 1. REAL TIKTOK LIVE CONNECTOR BOX */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-stone-900/90 to-stone-950 border border-amber-500/30 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔴</span>
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Kết Nối Phòng Live TikTok Thật (Webcast Real-time)
              </h4>
              <p className="text-[11px] text-stone-400">
                Bắt comment "adidaphat", quà tặng và người xem trực tiếp từ TikTok
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tikTokStatus?.isConnected ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Đang Live: @{tikTokStatus.username}
              </span>
            ) : tikTokStatus?.isConnecting ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin" />
                Đang kết nối...
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-800 text-stone-400 border border-stone-700">
                ⚪ Chưa kết nối
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="flex-1 flex items-center bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 focus-within:border-amber-400 transition-colors">
            <span className="text-sm font-bold text-amber-400 mr-1.5">@</span>
            <input
              type="text"
              value={tiktokUsernameInput}
              onChange={(e) => setTiktokUsernameInput(e.target.value.replace(/^@/, ''))}
              placeholder="Nhập username TikTok của bạn (không cần @)"
              className="bg-transparent text-xs text-white placeholder-stone-500 focus:outline-none w-full font-medium"
            />
          </div>

          {tikTokStatus?.isConnected ? (
            <button
              onClick={() => onDisconnectTikTok?.()}
              className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-md flex items-center justify-center gap-1.5"
            >
              <span>⏹</span> Ngắt Kết Nối
            </button>
          ) : (
            <button
              onClick={() => {
                if (tiktokUsernameInput.trim() && onConnectTikTok) {
                  onConnectTikTok(tiktokUsernameInput.trim());
                }
              }}
              disabled={tikTokStatus?.isConnecting || !tiktokUsernameInput.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-stone-950 rounded-lg text-xs font-black transition-all whitespace-nowrap shadow-md flex items-center justify-center gap-1.5"
            >
              <span>🔴</span> Bắt Đầu Kết Nối Live Thật
            </button>
          )}
        </div>

        {tikTokStatus?.isConnected && (
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="p-2 rounded-lg bg-stone-950/70 border border-stone-800 text-center">
              <span className="text-[10px] text-stone-400 block">Người Xem (Viewers)</span>
              <span className="text-sm font-black text-amber-300">👥 {tikTokStatus.viewerCount ?? 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-950/70 border border-stone-800 text-center">
              <span className="text-[10px] text-stone-400 block">Lượt Thích (Likes)</span>
              <span className="text-sm font-black text-rose-400">❤️ {tikTokStatus.totalLikes ?? 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-950/70 border border-stone-800 text-center">
              <span className="text-[10px] text-stone-400 block">Mã Phòng Live</span>
              <span className="text-[11px] font-mono font-bold text-stone-300 truncate block">
                {tikTokStatus.roomId ? `#${tikTokStatus.roomId.slice(-6)}` : 'Đang đồng bộ'}
              </span>
            </div>
          </div>
        )}

        {tikTokStatus?.error && (
          <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-[11px] text-red-200 flex items-start gap-2">
            <span className="text-base shrink-0">⚠️</span>
            <div>
              <strong className="font-bold">Lưu ý kết nối: </strong>
              {tikTokStatus.error}
              <div className="mt-1 text-[10px] text-stone-400">
                💡 Mẹo: Hãy mở app TikTok trên điện thoại hoặc TikTok LIVE Studio trên PC, bấm <strong>Phát trực tiếp (Go LIVE)</strong> trước, sau đó bấm Kết Nối lại tại đây!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. OBS & TIKTOK LIVE STUDIO BROWSER SOURCE URL */}
      <div className="p-4 rounded-xl bg-stone-900/70 border border-stone-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎥</span>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              Link Màn Hình OBS Studio & TikTok LIVE Studio (Tỷ Lệ 9:16 Dọc)
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Chuẩn 1080 x 1920
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-amber-200 select-all overflow-x-auto whitespace-nowrap">
            {obsStageUrl()}
          </div>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(obsStageUrl());
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 3000);
              }
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
              copiedUrl
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40'
            }`}
          >
            <span>{copiedUrl ? '✓' : '📋'}</span>
            <span>{copiedUrl ? 'Đã Sao Chép!' : 'Sao Chép Link OBS'}</span>
          </button>
          <a
            href="/?view=stage"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded-lg text-xs font-medium transition-all text-center flex items-center justify-center gap-1"
          >
            <span>👁️</span> Mở Tab Tràn Viền
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <span>📱</span> Cách 1: Dùng TikTok LIVE Studio (Khuyên Dùng)
            </div>
            <ol className="text-[11px] text-stone-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Mở phần mềm <strong>TikTok LIVE Studio</strong> trên máy tính.</li>
              <li>Trong mục Nguồn (Sources), bấm <strong>Thêm Nguồn (Add Source)</strong> &rarr; Chọn <strong>Trình duyệt (Browser)</strong>.</li>
              <li>Dán link OBS ở trên vào ô <strong>URL</strong>.</li>
              <li>Đặt kích thước: Rộng <strong>1080</strong>, Cao <strong>1920</strong> (Tỷ lệ 9:16 dọc).</li>
              <li>Tích chọn <strong>Điều khiển âm thanh</strong> (Control audio via OBS/Studio) để phát tiếng chuông mõ & kinh Niệm Phật qua Live!</li>
            </ol>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <span>🎬</span> Cách 2: Dùng OBS Studio
            </div>
            <ol className="text-[11px] text-stone-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Mở <strong>OBS Studio</strong> &rarr; Tại khung <strong>Sources (+)</strong> &rarr; Chọn <strong>Browser</strong>.</li>
              <li>Dán URL ở trên vào &rarr; Đặt Width: <strong>1080</strong>, Height: <strong>1920</strong>, FPS: <strong>60</strong>.</li>
              <li>Đánh dấu tích vào ô <strong>Control audio via OBS</strong>.</li>
              <li>Bấm <strong>Start Virtual Camera (Khởi động Camera ảo)</strong> hoặc nhập <strong>Stream Key</strong> TikTok vào Settings &rarr; Stream!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 3. EXPLANATION */}
      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2.5">
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
          <span>💡</span> Cơ Chế Hoạt Động Khi User Thật Vào Tương Tác
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px] text-stone-300">
          <div className="p-2.5 rounded-lg bg-stone-950/60 border border-stone-800 space-y-1">
            <div className="font-bold text-amber-200 flex items-center gap-1">
              <span>💬</span> Bình luận thật trên TikTok:
            </div>
            <p className="leading-relaxed text-stone-300">
              Khi người xem gõ <strong className="text-white">"adidaphat"</strong> hoặc <strong className="text-white">"a di đà phật"</strong> trên ứng dụng TikTok, hình ảnh phật tử quỳ lạy sẽ xuất hiện ngay lập tức trên Chánh điện cùng lời cầu nguyện trên đầu!
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-stone-950/60 border border-stone-800 space-y-1">
            <div className="font-bold text-amber-200 flex items-center gap-1">
              <span>🎁</span> Tặng quà thật trên TikTok:
            </div>
            <p className="leading-relaxed text-stone-300">
              Khán giả tặng Hoa hồng, Hoa sen, Tim, Tiền xu... sân khấu bật hiệu ứng sen vàng và cánh sen rơi, máy quay áp sát người tặng, cộng điểm vào <strong>TOP THÀNH TÂM</strong>, và giọng đọc gọi tên cảm ơn kèm lời chúc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

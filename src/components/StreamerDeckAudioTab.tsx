import React from 'react';
import { StreamConfig } from '../types/temple';
import { soundEngine } from '../services/soundEngine';
import { apiClient } from '../services/apiClient';

interface StreamerDeckAudioTabProps {
  config: StreamConfig;
  onUpdateConfig: (newConfig: Partial<StreamConfig>) => void;
}

export const StreamerDeckAudioTab: React.FC<StreamerDeckAudioTabProps> = ({ config, onUpdateConfig }) => {
  return (
    <div className="space-y-4">
      <div className="p-3.5 bg-stone-900/70 border border-stone-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>🎙</span> Giọng Nữ Phật Giáo (Dịu Dàng, Từ Bi)
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Tự động chào người mới vào, cảm ơn người tặng quà và gửi lời chúc
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoTts}
              onChange={(e) => onUpdateConfig({ autoTts: e.target.checked })}
              className="rounded border-stone-700 text-amber-500 focus:ring-amber-400"
            />
            <span className="text-xs font-semibold text-white">Tự Động Đọc</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-300 font-medium">Lựa Chọn Giọng:</span>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateConfig({ voiceGender: 'female', ttsPitch: 1.08 })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                config.voiceGender === 'female' ? 'bg-amber-400 text-stone-950 shadow-md' : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              👩 Giọng Nữ Phật Giáo (Khuyên dùng)
            </button>
            <button
              onClick={() => onUpdateConfig({ voiceGender: 'male', ttsPitch: 0.88 })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                config.voiceGender === 'male' ? 'bg-amber-400 text-stone-950 shadow-md' : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              👨 Giọng Nam Thầy Trầm Ấm
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-stone-400">Tốc Độ Đọc (Rate):</span>
              <span className="font-bold text-amber-300">{config.ttsSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.15"
              step="0.05"
              value={config.ttsSpeed}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                onUpdateConfig({ ttsSpeed: rate });
                apiClient.sendControl('setRate', String(rate));
              }}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-stone-400">Cao Độ Giọng (Pitch):</span>
              <span className="font-bold text-amber-300">{config.ttsPitch}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.25"
              step="0.05"
              value={config.ttsPitch}
              onChange={(e) => onUpdateConfig({ ttsPitch: parseFloat(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-600/30 text-[11px] text-amber-200 flex items-center gap-2">
          <span className="text-base">🔔</span>
          <span>
            <strong>Quy chuẩn Live:</strong> Mọi quà đều được cảm ơn kèm câu chúc (combo chỉ đọc 1 lần, mỗi người tối đa 1 lần/30 giây, lúc đông thì bỏ qua quà nhỏ). Ngoài ra đọc khi có người follow, chào khách, chúc mong cầu và nhắc chia sẻ.
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => soundEngine.readGiftAcknowledgment('Minh An', 'Hoa sen', 1)}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>🪷</span> Thử câu cảm ơn quà
          </button>

          <button
            onClick={() => soundEngine.readFollowThanks('Minh An')}
            className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold border border-amber-600/30"
          >
            <span>☸</span> Thử Cảm Ơn Follow
          </button>

          <button
            onClick={() => soundEngine.readShareReminder([])}
            className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold border border-amber-600/30"
          >
            <span>📣</span> Thử Nhắc Chia Sẻ
          </button>
        </div>
      </div>

      {/* NHẠC PHẬT GIÁO THẬT PHÁT LIÊN TỤC ALWAYS */}
      <div className="p-3.5 bg-stone-900/70 border border-stone-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>🎵</span> Nhạc Phật Giáo Chánh Điện (Phát Liên Tục Always)
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Nhạc niệm Phật và sáo trúc thiền môn thanh tịnh (Đã loại bỏ hoàn toàn sóng âm gây đau đầu)
            </p>
          </div>

          <button
            onClick={() => onUpdateConfig({ bgmEnabled: !config.bgmEnabled })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              config.bgmEnabled
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${config.bgmEnabled ? 'bg-white animate-pulse' : 'bg-stone-500'}`} />
            {config.bgmEnabled ? 'Đang Phát Nhạc Phật' : 'Đã Tắt Nhạc'}
          </button>
        </div>

        <div className="space-y-1.5 pt-1">
          <span className="text-xs text-stone-300 font-medium">Lựa Chọn Bài Nhạc Phật Giáo:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 'chill' as const, icon: '🍃', title: 'Chill Thư Giãn', desc: 'Piano, sáo nhẹ, không lời', highlight: true },
              { id: 'sao_truc' as const, icon: '🎋', title: 'Sáo Trúc & Đàn Tranh', desc: 'Dịu nhẹ, trong trẻo, năng lượng tích cực', highlight: true },
              { id: 'niem_phat' as const, icon: '🪷', title: 'Niệm Phật 6 Chữ', desc: 'Bản thu niệm Phật có sẵn', highlight: false },
              { id: 'khuc_thien_dao' as const, icon: '🎶', title: 'Khúc Thiền Đạo', desc: 'Guzheng & Tiêu thanh tịnh', highlight: false },
            ].map((track) => (
              <button
                key={track.id}
                onClick={() => {
                  onUpdateConfig({ buddhistMusicTrack: track.id });
                  soundEngine.switchBgmTrack(track.id);
                }}
                className={`p-2.5 rounded-lg border text-left transition flex items-center gap-2.5 ${
                  config.buddhistMusicTrack === track.id
                    ? 'bg-amber-950/40 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span className="text-lg">{track.icon}</span>
                <div>
                  <div className="text-xs font-bold">{track.title}</div>
                  <div className={`text-[10px] ${track.highlight ? 'text-amber-400/90' : 'text-stone-400'}`}>{track.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-stone-400">Âm Lượng Nhạc Nền:</span>
            <span className="font-bold text-amber-300">{Math.round(config.bgmVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.bgmVolume}
            onChange={(e) => onUpdateConfig({ bgmVolume: parseFloat(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>
      </div>

      {/* Sacred Temple Sounds */}
      <div className="p-3.5 bg-stone-900/70 border border-stone-800 rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
          Âm Thanh Nhạc Cụ Thiền
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => soundEngine.playTempleBell(1.0)}
            className="p-3 bg-stone-950 rounded-lg border border-stone-800 hover:border-amber-500/50 text-left transition flex items-center gap-2"
          >
            <span className="text-xl">🔔</span>
            <div>
              <div className="text-xs font-bold text-white">Chuông U Minh (8 Giây)</div>
              <div className="text-[10px] text-stone-400">Ngân sâu trầm ấm</div>
            </div>
          </button>

          <button
            onClick={() => soundEngine.playMuoGong(1.4)}
            className="p-3 bg-stone-950 rounded-lg border border-stone-800 hover:border-amber-500/50 text-left transition flex items-center gap-2"
          >
            <span className="text-xl">🪵</span>
            <div>
              <div className="text-xs font-bold text-amber-300">Mõ Gia Trì (Cốc Cốc)</div>
              <div className="text-[10px] text-stone-400">Âm vang thùng gỗ rỗng</div>
            </div>
          </button>

          <button
            onClick={() => soundEngine.playLotusBloom(1.2)}
            className="p-3 bg-stone-950 rounded-lg border border-stone-800 hover:border-amber-500/50 text-left transition flex items-center gap-2"
          >
            <span className="text-xl">🪷</span>
            <div>
              <div className="text-xs font-bold text-amber-300">Chuông Sen Nở (Khánh Đồng)</div>
              <div className="text-[10px] text-stone-400">Thanh thoát, ngân vang</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

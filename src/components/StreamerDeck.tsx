import React, { useEffect, useState } from 'react';
import { StreamConfig, TikTokLiveStatus } from '../types/temple';
import { StreamerDeckTikTokTab } from './StreamerDeckTikTokTab';
import { StreamerDeckAudioTab } from './StreamerDeckAudioTab';

interface StreamerDeckProps {
  config: StreamConfig;
  onUpdateConfig: (newConfig: Partial<StreamConfig>) => void;
  tikTokStatus?: TikTokLiveStatus;
  onConnectTikTok?: (username: string) => void;
  onDisconnectTikTok?: () => void;
  onSaveChannelName?: (name: string) => void;
}

export const StreamerDeck: React.FC<StreamerDeckProps> = ({
  config,
  onUpdateConfig,
  tikTokStatus,
  onConnectTikTok,
  onDisconnectTikTok,
  onSaveChannelName,
}) => {
  const [activeTab, setActiveTab] = useState<'tiktok_obs' | 'audio'>('tiktok_obs');
  const [nameDraft, setNameDraft] = useState(config.channelName);
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => setNameDraft(config.channelName), [config.channelName]);

  const saveName = () => {
    const name = nameDraft.trim();
    if (!name) return;
    onSaveChannelName?.(name);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#120806] border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
      {/* DECK HEADER / CONNECTION SETTINGS */}
      <div className="p-3.5 border-b border-stone-800 bg-stone-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
            ⚙
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Bảng Điều Khiển Live: {config.channelName}
            </h3>
            <span className="text-[11px] text-stone-400">
              Giọng đọc · Nhạc nền · Kết nối TikTok LIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1">
            <span className="text-xs text-amber-400 font-bold mr-1.5">Tên kênh:</span>
            <input
              type="text"
              value={nameDraft}
              maxLength={40}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              placeholder="Tâm Tịnh Tâm An"
              className="bg-transparent text-xs text-white focus:outline-none w-36 font-medium"
            />
          </div>
          <button
            onClick={saveName}
            disabled={!nameDraft.trim() || nameDraft.trim() === config.channelName}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:bg-stone-800 disabled:text-stone-400 transition-colors"
          >
            {nameSaved ? 'Đã lưu' : 'Lưu'}
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-stone-800 bg-stone-950/40 px-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tiktok_obs')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tiktok_obs'
              ? 'border-amber-400 text-amber-300 bg-amber-950/30'
              : 'border-transparent text-stone-300 hover:text-white'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {tikTokStatus?.isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-500"></span>
            )}
          </span>
          <span>📡</span> TikTok LIVE & OBS (Trực Tiếp)
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audio'
              ? 'border-amber-400 text-amber-300 bg-amber-950/20'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <span>🎙</span> Nhạc Phật Giáo & Giọng Đọc
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="p-4 flex-1 overflow-y-auto">
        {activeTab === 'tiktok_obs' && (
          <StreamerDeckTikTokTab
            tikTokStatus={tikTokStatus}
            onConnectTikTok={onConnectTikTok}
            onDisconnectTikTok={onDisconnectTikTok}
          />
        )}

        {activeTab === 'audio' && (
          <StreamerDeckAudioTab
            config={config}
            onUpdateConfig={onUpdateConfig}
          />
        )}
      </div>
    </div>
  );
};

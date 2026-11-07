import React, { useState, useEffect } from 'react';
import { lotoEngine, LotoState } from '../../../services/loto/lotoEngine';
import { soundEngine } from '../../../services/soundEngine';
import { apiClient } from '../../../services/apiClient';

interface LotoTabAudioProps {
  gameState: LotoState;
}

export const LotoTabAudio: React.FC<LotoTabAudioProps> = ({ gameState }) => {
  const [lotoVoice, setLotoVoice] = useState<string>(soundEngine.getLotoVoice());
  const [useBeat, setUseBeat] = useState<boolean>(soundEngine.getLotoUseBeat());
  const [availableSongs, setAvailableSongs] = useState<number[]>([]);
  const [uploadNum, setUploadNum] = useState<number>(12);
  const [uploadMsg, setUploadMsg] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    apiClient.getLotoSongs().then((songs) => setAvailableSongs(songs));
  }, []);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadMsg('Đang nạp file bài hát...');
    try {
      const buffer = await file.arrayBuffer();
      const data = await apiClient.uploadLotoSong(uploadNum, buffer, file.type || 'audio/mpeg');
      if (data.success) {
        setUploadMsg(`Đã nạp thành công bài hát số ${uploadNum}!`);
        apiClient.getLotoSongs().then((songs) => setAvailableSongs(songs));
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

  return (
    <div className="flex flex-col gap-3">
      {/* 1. TỐC ĐỘ QUAY, GIỌNG MC & BEAT ĐÀN ORGAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-400 font-semibold text-[11px]">
            ⏱️ Tốc độ quay tự động: <strong className="text-amber-300">{gameState.spinInterval} giây/số</strong>
          </span>
          <input
            type="range" min="10" max="30" step="2" value={gameState.spinInterval}
            onChange={(e) => lotoEngine.setSpinInterval(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">Khuyên dùng 16-20s để nghe trọn câu hò</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-slate-400 font-semibold text-[11px]">🎙️ Giọng MC Xướng Số:</span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => { setLotoVoice('vi-VN-NamMinhNeural'); soundEngine.setLotoVoice('vi-VN-NamMinhNeural'); }}
              className={`py-1.5 px-2 rounded-lg border font-bold text-[11px] ${lotoVoice === 'vi-VN-NamMinhNeural' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'}`}
            >
              🧔 Nam Minh
            </button>
            <button
              onClick={() => { setLotoVoice('vi-VN-HoaiMyNeural'); soundEngine.setLotoVoice('vi-VN-HoaiMyNeural'); }}
              className={`py-1.5 px-2 rounded-lg border font-bold text-[11px] ${lotoVoice === 'vi-VN-HoaiMyNeural' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'}`}
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
                type="checkbox" checked={useBeat}
                onChange={(e) => { setUseBeat(e.target.checked); soundEngine.setLotoUseBeat(e.target.checked); }}
                className="w-3.5 h-3.5 accent-amber-500 rounded"
              />
              <span>Đệm Beat Organ</span>
            </label>
            <button onClick={() => soundEngine.stopLotoCall()} className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700">
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
            <span className="text-[10px] text-slate-400">(Bấm ▶️ để nghe thử hoặc 🎲 để quay ra đúng số đó)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Thay MP3 số:</span>
            <input
              type="number" min="1" max="90" value={uploadNum}
              onChange={(e) => setUploadNum(Math.max(1, Math.min(90, Number(e.target.value))))}
              className="w-12 px-1.5 py-0.5 text-center font-mono font-bold bg-slate-900 border border-slate-700 rounded text-amber-400 text-xs"
            />
            <label className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] cursor-pointer">
              <span>{isUploading ? '⏳ Đang nạp...' : '📁 Chọn MP3'}</span>
              <input type="file" accept="audio/*" onChange={handleUploadFile} disabled={isUploading} className="hidden" />
            </label>
          </div>
        </div>

        {uploadMsg && <div className="text-[11px] font-semibold text-emerald-400">{uploadMsg}</div>}

        <div className="max-h-44 overflow-y-auto flex flex-wrap gap-1 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
          {availableSongs.map((s) => (
            <div key={s} className="inline-flex items-center rounded border border-emerald-500/30 bg-slate-950 overflow-hidden text-[10px]">
              <button onClick={() => soundEngine.playLotoCall(s)} className="px-1.5 py-0.5 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 font-mono font-bold" title={`Nghe thử bài số ${s}`}>
                ▶️ #{s}
              </button>
              <button onClick={() => lotoEngine.spinNext(s)} className="px-1.5 py-0.5 bg-amber-950/90 hover:bg-amber-800 border-l border-amber-600/40 text-amber-300 font-bold text-[9px]" title={`Quay trúng số ${s}`}>
                🎲
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

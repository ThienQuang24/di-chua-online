import React, { useState } from 'react';
import { lotoEngine, LotoState, LotoTicket } from '../../../services/loto/lotoEngine';
import { LotoAudienceTicketList } from './LotoAudienceTicketList';

interface LotoTabMainProps {
  gameState: LotoState;
  tickets: LotoTicket[];
  prizeInput: string;
  setPrizeInput: (val: string) => void;
  onSavePrize: (val: string) => void;
  onAddBatchPlayers: (count: number) => void;
  onFillAudience: (targetCount: number) => void;
  onClearAudience: () => void;
  newPlayerName: string;
  setNewPlayerName: (val: string) => void;
  onAddNewPlayer: () => void;
}

export const LotoTabMain: React.FC<LotoTabMainProps> = ({
  gameState,
  tickets,
  prizeInput,
  setPrizeInput,
  onSavePrize,
  onAddBatchPlayers,
  onFillAudience,
  onClearAudience,
  newPlayerName,
  setNewPlayerName,
  onAddNewPlayer,
}) => {
  const [chatSenderName, setChatSenderName] = useState<string>('');
  const [chatMessageInput, setChatMessageInput] = useState<string>('');

  const handleSendTestChat = (overrideText?: string) => {
    const text = (overrideText ?? chatMessageInput).trim();
    if (!text) return;
    const targetUser = chatSenderName.trim() || (tickets[0] ? tickets[0].username : 'Anh Ba Sài Gòn');
    lotoEngine.triggerRandomBotChat(targetUser, text);
    if (!overrideText) setChatMessageInput('');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* A. CÀI ĐẶT TREO MÁY TỰ ĐỘNG 24/7 & PHẦN THƯỞNG VÁN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-300 uppercase flex items-center gap-1.5">
              <span>🤖</span>
              <span>Chế Độ Treo Máy Tự Động 24/7</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">{gameState.spinInterval}s / số</span>
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
            onBlur={() => onSavePrize(prizeInput)}
            onKeyDown={(e) => e.key === 'Enter' && onSavePrize(prizeInput)}
            placeholder="Nhập phần quà (VD: Thẻ cào 50K)..."
            className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-yellow-400/50 text-xs text-yellow-200 focus:outline-none focus:border-yellow-300"
          />

          <div className="flex flex-wrap items-center gap-1">
            {['Thẻ cào 20K', 'Thẻ cào 50K', 'Thẻ cào 100K', 'Gấu bông', 'Hộp quà bí mật'].map((p) => (
              <button
                key={p}
                onClick={() => onSavePrize(p)}
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

      {/* B. BONG BÓNG CHAT TRÊN ĐẦU NHÂN VẬT */}
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
              <option key={t.id} value={t.username}>{t.displayName}</option>
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
      <LotoAudienceTicketList
        gameState={gameState}
        tickets={tickets}
        onAddBatchPlayers={onAddBatchPlayers}
        onFillAudience={onFillAudience}
        onClearAudience={onClearAudience}
        newPlayerName={newPlayerName}
        setNewPlayerName={setNewPlayerName}
        onAddNewPlayer={onAddNewPlayer}
      />
    </div>
  );
};

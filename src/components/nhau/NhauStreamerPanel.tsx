import React, { useState } from 'react';
import { nhauEngine } from '../../services/nhau/nhauEngine';
import { soundEngine } from '../../services/soundEngine';

interface NhauStreamerPanelProps {
  onAddDevotee?: (name: string, avatarUrl: string) => void;
}

export const NhauStreamerPanel: React.FC<NhauStreamerPanelProps> = ({ onAddDevotee }) => {
  const [customToast, setCustomToast] = useState('');
  const [birthdayName, setBirthdayName] = useState('');

  const handleCheer = () => {
    nhauEngine.triggerCheer();
  };

  const handleBirthday = (name?: string) => {
    const target = (name || birthdayName).trim() || 'Mai Phương';
    nhauEngine.triggerBirthday(target);
    onAddDevotee?.(target, '');
    setBirthdayName('');
  };

  const handleAddFakeGuest = () => {
    const fakeNames = ['Anh Ba Chợ Lớn', 'Tuấn Ken', 'Hùng Bia Hơi', 'Mai Phương', 'Quang Hải', 'Huy Béo', 'Chị Lan Quán Nướng', 'Bảo Ngọc', 'Hoàng Nam'];
    const name = fakeNames[Math.floor(Math.random() * fakeNames.length)] + '_' + Math.floor(Math.random() * 100);
    nhauEngine.addGuest(name, name, '');
    onAddDevotee?.(name, '');
  };

  const handleTestSponsor = () => {
    nhauEngine.addDonation('DaiGiaSaiThanh', 'Đại Gia Sài Thành', '', 'Tháp Bia Phát Sáng & Cua Hoàng Đế', 99);
    onAddDevotee?.('Đại Gia Sài Thành', '');
  };

  const handleToggleDisco = () => {
    nhauEngine.setDiscoMode(true);
    soundEngine.speak('Lên nhạc anh em ơi! Cả quán cùng bay lắc quẩy tưng bừng 60 giây nào!');
  };

  const handleSpeakToast = () => {
    if (customToast.trim()) {
      soundEngine.speak(customToast.trim());
      setCustomToast('');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100">
      {/* 1. NÚT CỤNG LY TOÀN QUÁN CHÍNH */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-amber-400 flex items-center gap-2 font-temple">
            <span>🍻</span> ĐIỀU KHIỂN QUÁN NHẬU 1 2 3 DÔ!
          </h2>
          <p className="text-xs text-slate-400">
            Khán giả gõ <strong className="text-amber-300">"dzo"</strong> hoặc <strong className="text-amber-300">"uong"</strong> để cùng chạm ly cả quán
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút 1 2 3 Dô to bự */}
          <button
            onClick={handleCheer}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            <span>🍻</span>
            <span>1, 2, 3 DÔ!</span>
          </button>
        </div>
      </div>

      {/* 2. CÁC NÚT TEST GIẢ LẬP NHANH */}
      <div className="flex flex-wrap items-center gap-2.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
        <span className="text-xs font-semibold text-slate-400">Nút Test Quán:</span>
        <button
          onClick={handleAddFakeGuest}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5"
        >
          <span>👤</span> + Thêm bợm nhậu vào bàn
        </button>

        <button
          onClick={handleTestSponsor}
          className="px-3 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-800/50 text-xs text-amber-300 border border-amber-600/40 flex items-center gap-1.5"
        >
          <span>🦞</span> Test Đại Gia Bao Quán
        </button>

        <button
          onClick={handleToggleDisco}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-900/50 to-orange-900/50 hover:brightness-125 text-xs text-yellow-300 border border-amber-500/50 flex items-center gap-1.5 shadow"
        >
          <span>🔥</span> Quán Lên Nhạc 60s
        </button>

        <button
          onClick={() => handleBirthday('Mai Phương')}
          className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 text-xs text-rose-300 border border-rose-500/50 flex items-center gap-1.5 shadow"
        >
          <span>🎂</span> Test Sinh Nhật Mai Phương
        </button>
      </div>

      {/* 3. TỔ CHỨC SINH NHẬT THEO TÊN KHÁN GIẢ */}
      <div className="flex items-center gap-2 bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/40">
        <span className="text-sm">🎂</span>
        <input
          type="text"
          value={birthdayName}
          onChange={(e) => setBirthdayName(e.target.value)}
          placeholder="Nhập tên người sinh nhật (hoặc khán giả gõ 'cmsn [tên]')..."
          onKeyDown={(e) => e.key === 'Enter' && handleBirthday()}
          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
        />
        <button
          onClick={() => handleBirthday()}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white font-bold text-xs uppercase shadow hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
        >
          🎂 Chúc Mừng Sinh Nhật
        </button>
      </div>

      {/* 3. LỜI CHÚC / MC XƯỚNG TÂM SỰ BÀN NHẬU */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customToast}
          onChange={(e) => setCustomToast(e.target.value)}
          placeholder="Nhập lời mời rượu hoặc lời chúc của chủ quán..."
          onKeyDown={(e) => e.key === 'Enter' && handleSpeakToast()}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={handleSpeakToast}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase transition-all"
        >
          Xướng ngay
        </button>
      </div>
    </div>
  );
};

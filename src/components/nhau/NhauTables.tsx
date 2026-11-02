import React from 'react';
import { NhauGuest, NhauTable } from '../../services/nhau/nhauEngine';

interface NhauTablesProps {
  tables: NhauTable[];
  guests: NhauGuest[];
  isCheering: boolean;
  onSelectGuest?: (guest: NhauGuest) => void;
}

// 4 distinct Vietnamese street drinker outfits
const OUTFITS = [
  { name: 'Áo Hoa Hòe', shirtColor: '#e11d48', pattern: '🌺', skin: '#fcd34d' },
  { name: 'Áo Ba Lỗ', shirtColor: '#f8fafc', pattern: '', skin: '#fbcfe8' },
  { name: 'Áo Polo Bụi', shirtColor: '#0284c7', pattern: '⚡', skin: '#fde68a' },
  { name: 'Sơ Mi Mở Cúc', shirtColor: '#059669', pattern: '🌴', skin: '#fed7aa' },
];

// Seat arrangement around the table
const SEAT_LAYOUT = [
  // Top seat (behind table, facing down)
  { id: 0, x: 50, y: 14, scale: 0.9, zIndex: 10, armAngle: -10 },
  // Left seat
  { id: 1, x: 14, y: 50, scale: 0.95, zIndex: 25, armAngle: 15 },
  // Right seat
  { id: 2, x: 86, y: 50, scale: 0.95, zIndex: 25, armAngle: -15 },
  // Bottom seat (in front of table)
  { id: 3, x: 50, y: 86, scale: 1.0, zIndex: 40, armAngle: 0 },
];

export const NhauTables: React.FC<NhauTablesProps> = ({ tables, guests, isCheering, onSelectGuest }) => {
  return (
    <div className="w-full grid grid-cols-2 gap-3.5 p-1 select-none">
      {tables.map((table) => {
        const tableGuests = guests.filter((g) => g.tableId === table.id);
        const isVipTable = table.id === 2;

        return (
          <div
            key={table.id}
            className={`
              relative rounded-3xl p-2.5 flex flex-col items-center justify-between min-h-[220px] transition-all
              ${
                isVipTable
                  ? 'bg-gradient-to-b from-[#2e1708]/95 via-[#1a0c04]/95 to-[#0f0702]/95 border-2 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                  : 'bg-gradient-to-b from-[#1c120c]/90 via-[#120a06]/95 to-[#0a0503]/95 border border-amber-900/60 shadow-lg'
              }
            `}
          >
            {/* 1. TÊN BÀN VÀ SỐ LY ĐÃ UỐNG */}
            <div className="w-full flex items-center justify-between pb-1.5 border-b border-amber-900/40 text-[10px]">
              <span className={`font-bold flex items-center gap-1.5 ${isVipTable ? 'text-amber-300' : 'text-amber-200'}`}>
                <span>{isVipTable ? '👑' : '🏮'}</span>
                <span className="truncate max-w-[110px]">{table.name}</span>
              </span>
              <span className="text-[9px] font-mono font-bold text-amber-400 bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                🍺 {tableGuests.reduce((acc, g) => acc + g.beerCount, 0)} ly
              </span>
            </div>

            {/* 2. KHÔNG GIAN BÀN NHẬU VỚI NHÂN VẬT VÀ GHẾ NHỰA */}
            <div className="relative w-full h-[155px] flex items-center justify-center my-1">
              {/* Bóng đổ của cả cụm bàn dưới sàn */}
              <div className="absolute w-36 h-14 bg-black/60 rounded-[50%] blur-md pointer-events-none" />

              {/* BÀN TRÒN NHỰA VỈA HÈ (ĐỎ HOẶC XANH LÁ) */}
              <div
                className={`
                  relative w-28 h-20 rounded-[50%] flex flex-col items-center justify-center z-20 shadow-2xl transition-transform
                  ${
                    isVipTable
                      ? 'bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-950 border-3 border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.5)]'
                      : 'bg-gradient-to-br from-red-600 via-rose-700 to-red-950 border-3 border-red-400/90 shadow-[0_4px_16px_rgba(239,68,68,0.4)]'
                  }
                  ${isCheering ? 'scale-105' : ''}
                `}
              >
                {/* Viền bóng phản chiếu ánh đèn quán */}
                <div className="absolute top-1 left-4 right-4 h-3 rounded-[50%] bg-white/25 blur-[1px]" />

                {/* ĐĨA MỒI VÀ THÁP BIA TRÊN BÀN */}
                <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                  {isVipTable && (
                    <div className="flex items-center gap-1 -mt-1">
                      <span className="text-base animate-bounce drop-shadow">🦞</span>
                      <span className="text-sm drop-shadow">🍻</span>
                    </div>
                  )}

                  {/* Dĩa thức ăn chính */}
                  <div className="px-2 py-0.5 rounded-full bg-black/70 border border-white/20 backdrop-blur-xs flex items-center gap-1 shadow">
                    <span className="text-xs">
                      {table.specialDishes.includes('Cua hoàng đế')
                        ? '🦀'
                        : table.specialDishes.includes('Tôm hùm')
                        ? '🦞'
                        : table.specialDishes.includes('Mực nướng')
                        ? '🦑'
                        : '🥜'}
                    </span>
                    <span className="text-[7.5px] font-black uppercase tracking-tight text-yellow-300 truncate max-w-[65px]">
                      {table.specialDishes[0] || 'Mồi bén'}
                    </span>
                  </div>

                  {/* Cốc bia trên bàn */}
                  <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                    <span className="opacity-80">🍺</span>
                    <span className="opacity-90">🍺</span>
                  </div>
                </div>

                {/* Hiệu ứng tia sáng khi cụng ly */}
                {isCheering && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center text-sm font-black text-yellow-300 animate-ping">
                    💥 CHẠM LY! 💥
                  </div>
                )}
              </div>

              {/* 4 VỊ TRÍ GHẾ VÀ BỢM NHẬU QUANH BÀN */}
              {SEAT_LAYOUT.map((pos) => {
                const guest = tableGuests.find((g) => g.seatIndex === pos.id);
                const outfit = OUTFITS[(table.id * 4 + pos.id) % OUTFITS.length];
                const chairColor = (table.id + pos.id) % 2 === 0 ? 'bg-blue-600 border-blue-400' : 'bg-red-600 border-red-400';

                if (!guest) {
                  // GHẾ NHỰA TRỐNG ĐẶC TRƯNG VIỆT NAM (Ghế Duy Tân)
                  return (
                    <div
                      key={`empty-seat-${pos.id}`}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-40 hover:opacity-75 transition-opacity"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        transform: `translate(-50%, -50%) scale(${pos.scale * 0.9})`,
                        zIndex: pos.zIndex,
                      }}
                    >
                      {/* Lưng ghế nhựa có 3 rãnh */}
                      <div className={`w-7 h-7 rounded-t-lg ${chairColor} border shadow-md flex items-center justify-around p-1`}>
                        <div className="w-[2px] h-3 bg-black/40 rounded-full" />
                        <div className="w-[2px] h-4 bg-black/40 rounded-full" />
                        <div className="w-[2px] h-3 bg-black/40 rounded-full" />
                      </div>
                      {/* Chân ghế */}
                      <div className="w-8 h-2.5 bg-slate-900 rounded-b shadow" />
                      <span className="text-[6.5px] text-amber-300/80 font-mono mt-0.5">Ghế #{pos.id + 1}</span>
                    </div>
                  );
                }

                // NHÂN VẬT BỢM NHẬU (CHÂN DUNG 2.5D CẦM LY BIA BỐC BỌT)
                return (
                  <div
                    key={guest.id}
                    onClick={() => onSelectGuest?.(guest)}
                    className={`
                      absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300
                      ${guest.isRaisingGlass || isCheering ? 'scale-125 -translate-y-3' : 'hover:scale-110'}
                    `}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: `translate(-50%, -50%) scale(${pos.scale})`,
                      zIndex: guest.isRaisingGlass ? 50 : pos.zIndex,
                    }}
                  >
                    {/* BONG BÓNG LỜI NÓI / CÂU HÔ DÔ */}
                    {(guest.isRaisingGlass || isCheering) && (
                      <div className="mb-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 border border-yellow-300 text-[8px] font-black text-white shadow-lg animate-bounce whitespace-nowrap">
                        🍻 1 2 3 DÔ!
                      </div>
                    )}

                    {/* CỐC BIA HƠI SỦI BỌT TRÊN TAY */}
                    <div
                      className={`
                        relative flex items-center gap-0.5 mb-[-4px] z-10 transition-transform
                        ${guest.isRaisingGlass ? 'scale-125 animate-pulse' : ''}
                      `}
                    >
                      {/* Cốc bia vàng sủi bọt */}
                      <div className="relative w-4 h-5 rounded-sm bg-gradient-to-b from-amber-300 to-amber-600 border border-yellow-200 shadow-md flex flex-col justify-between overflow-hidden">
                        {/* Lớp bọt trắng tràn mép cốc */}
                        <div className="w-full h-1.5 bg-white shadow-xs" />
                        {/* Bọt bia sủi tăm */}
                        <div className="w-1 h-1 rounded-full bg-white/70 mx-auto animate-ping" />
                        <div className="w-full h-1 bg-amber-700/60" />
                      </div>
                      {/* Quai cầm cốc */}
                      <div className="w-1.5 h-3 border-2 border-l-0 border-yellow-200 rounded-r-md -ml-1" />
                    </div>

                    {/* ĐẦU VÀ AVATAR NGƯỜI CHƠI */}
                    <div className="relative">
                      {guest.avatarUrl ? (
                        <img
                          src={guest.avatarUrl}
                          alt={guest.displayName}
                          className="w-8 h-8 rounded-full object-cover border-2 border-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-md">
                          {guest.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Khăn rằn / Mũ vui nhộn góc đầu */}
                      <span className="absolute -top-1 -right-1 text-[9px]">
                        {pos.id % 2 === 0 ? '🍺' : '✨'}
                      </span>
                    </div>

                    {/* THÂN VÀ TRANG PHỤC BỢM NHẬU */}
                    <div
                      className="relative w-7 h-5 rounded-t-xl shadow-md border border-white/20 flex items-center justify-center"
                      style={{ backgroundColor: outfit.shirtColor }}
                    >
                      {outfit.pattern && (
                        <span className="text-[8px] opacity-80">{outfit.pattern}</span>
                      )}
                    </div>

                    {/* GHẾ NHỰA DƯỚI ĐÁY */}
                    <div className="w-8 h-1.5 bg-blue-700 rounded-b border-t border-black/40 shadow" />

                    {/* THẺ TÊN BỢM NHẬU */}
                    <div className="mt-0.5 px-1.5 py-[1px] rounded-full bg-black/85 border border-amber-500/40 text-[7.5px] font-bold text-amber-200 shadow text-center truncate max-w-[65px]">
                      {guest.displayName}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. MÓN ĐẶC SẢN ĐANG GỌI TẠI BÀN */}
            <div className="w-full flex items-center justify-center gap-1 pt-1 border-t border-amber-900/40 text-[8px] text-amber-200/80">
              <span className="text-amber-400 font-semibold">Mồi:</span>
              <span className="text-yellow-300 font-bold truncate max-w-[130px]">
                {table.specialDishes.join(', ')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

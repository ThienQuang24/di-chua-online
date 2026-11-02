import React from 'react';
import { Devotee } from '../../types/temple';
import { NhauPatron, type SeatPos } from './NhauPatron';

interface NhauCrowdProps {
  devotees: Devotee[];
  isCheering: boolean;
  isDiscoMode?: boolean;
  birthdayDisplayName?: string | null;
}

// 12 diverse seat positions around 3 drinking tables on the sidewalk
const PATRON_SEATS: SeatPos[] = [
  // Bàn 1 (Bên trái): Chú Ba, Bạn nữ áo pastel, Thanh niên áo thun, Cô gái nâng ly
  { x: 18, y: 62, scale: 0.88, flip: false, modelIndex: 0 },
  { x: 38, y: 62, scale: 0.88, flip: true,  modelIndex: 1 },
  { x: 17, y: 72, scale: 0.94, flip: false, modelIndex: 2 },
  { x: 37, y: 72, scale: 0.94, flip: true,  modelIndex: 3 },

  // Bàn 2 (Bên phải): Thanh niên áo hoa, Cô gái tóc đuôi ngựa, Thanh niên nón kết, Bạn nữ xinh xắn
  { x: 63, y: 62, scale: 0.88, flip: false, modelIndex: 4 },
  { x: 83, y: 62, scale: 0.88, flip: true,  modelIndex: 3 },
  { x: 63, y: 72, scale: 0.94, flip: false, modelIndex: 5 },
  { x: 83, y: 72, scale: 0.94, flip: true,  modelIndex: 1 },

  // Bàn 3 (Bàn VIP ở giữa phía trước): Chú Ba bợm nhậu, Cô gái áo pastel, Thanh niên áo hoa, Thanh niên streetwear
  { x: 34, y: 77, scale: 1.02, flip: false, modelIndex: 0 },
  { x: 66, y: 77, scale: 1.02, flip: true,  modelIndex: 1 },
  { x: 26, y: 86, scale: 1.08, flip: false, modelIndex: 4 },
  { x: 74, y: 86, scale: 1.08, flip: true,  modelIndex: 2 },
];

// 3 authentic sidewalk tables using 3D rendered table asset
const DRINKING_TABLES = [
  { id: 1, x: 28, y: 66, name: 'Bàn 1: Nem & Lạc', icon: '🥜', size: 'w-28' },
  { id: 2, x: 73, y: 66, name: 'Bàn 2: Mực & Ốc', icon: '🦑', size: 'w-28' },
  { id: 3, x: 50, y: 80, name: 'Bàn VIP: Tháp Bia & Cua', icon: '👑', size: 'w-36' },
];

export const NhauCrowd: React.FC<NhauCrowdProps> = ({
  devotees,
  isCheering,
  isDiscoMode = false,
  birthdayDisplayName = null,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* 1. CÁC BÀN NHẬU VỈA HÈ (RENDER TỪ ASSET 3D CHÂN THỰC) */}
      {DRINKING_TABLES.map((t) => (
        <div
          key={t.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${t.x}%`, top: `${t.y}%`, zIndex: Math.round(t.y * 10 - 2) }}
        >
          {/* Ảnh bàn nhậu 3D thực tế với mồi bén & ly bia sủi bọt */}
          <div
            className={`relative ${t.size} transition-transform duration-300 ${
              isCheering ? 'scale-105' : ''
            }`}
          >
            {/* Bóng đổ nền đường */}
            <div className="absolute -bottom-1 inset-x-2 h-5 bg-black/60 rounded-[50%] blur-[3px]" />
            <img
              src="/assets/nhau/table-pub.png"
              alt={t.name}
              className="w-full h-auto object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]"
            />

            {/* Hiệu ứng cụng ly phát sáng khi Dô */}
            {isCheering && (
              <div className="absolute -top-4 inset-x-0 flex justify-center text-xs animate-ping">
                ✨🍻✨
              </div>
            )}
          </div>

          {/* Bảng tên bàn nhỏ gọn tinh tế (không che cảnh) */}
          <div className="mt-[-8px] z-10 px-2 py-0.5 rounded-full bg-black/80 border border-amber-500/40 text-[7px] font-bold text-amber-200 shadow-md backdrop-blur-xs flex items-center gap-1">
            <span>{t.icon}</span>
            <span>{t.name}</span>
          </div>
        </div>
      ))}

      {/* 2. CÁC BỢM NHẬU NGỒI GHẾ NHỰA QUANH BÀN (NHÂN VẬT 3D ĐA DẠNG: NAM, NỮ, CHÚ TRUNG NIÊN) */}
      {PATRON_SEATS.map((seat, idx) => {
        const devotee = devotees[idx];

        if (!devotee) {
          return null;
        }

        const isBirthdayPerson = Boolean(
          birthdayDisplayName &&
            (devotee.displayName.toLowerCase().includes(birthdayDisplayName.toLowerCase()) ||
              devotee.username.toLowerCase().includes(birthdayDisplayName.toLowerCase()))
        );

        return (
          <NhauPatron
            key={devotee.id}
            devotee={devotee}
            isCheering={isCheering}
            isDiscoMode={isDiscoMode}
            isBirthdayPerson={isBirthdayPerson}
            seatPos={seat}
          />
        );
      })}
    </div>
  );
};

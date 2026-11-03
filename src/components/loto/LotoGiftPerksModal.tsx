import React from 'react';

interface LotoGiftPerksModalProps {
  onClose: () => void;
}

const GIFT_PERKS = [
  {
    icon: '🌹',
    name: '1 Hoa Hồng',
    cost: '1 xu',
    bg: 'from-rose-500/20 to-red-600/30',
    border: 'border-rose-500/50',
    badge: 'Vé Thường',
    perk: 'Nhận 1 Tờ Vé May Mắn vào khán trường ngồi dò số tự động.',
  },
  {
    icon: '🍦',
    name: 'Cây Kem / Donut',
    cost: '10 - 30 xu',
    bg: 'from-amber-500/20 to-yellow-600/30',
    border: 'border-yellow-400/60',
    badge: 'Vé VIP Vàng',
    perk: 'Nâng cấp Vé VIP Viền Vàng May Mắn (bộ số đẹp, dễ nổ Kinh hơn).',
  },
  {
    icon: '👑',
    name: 'Vương Miện / Tim',
    cost: '99 xu',
    bg: 'from-purple-500/20 to-pink-600/30',
    border: 'border-purple-400/60',
    badge: 'Đại Gia VIP',
    perk: 'Cấp 2 Tờ Vé + Ngồi hàng ghế đầu VIP + MC đọc tên cảm ơn trực tiếp!',
  },
  {
    icon: '🚀',
    name: 'Tên Lửa / Pháo Hoa',
    cost: '1000+ xu',
    bg: 'from-yellow-500/30 via-red-600/30 to-rose-600/30',
    border: 'border-yellow-300',
    badge: 'Trùm Phòng Live',
    perk: 'Bắn Pháo Hoa Hội Chợ toàn màn hình + Được quyền chọn số quay tiếp theo!',
  },
];

export const LotoGiftPerksModal: React.FC<LotoGiftPerksModalProps> = ({ onClose }) => {
  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[390px] rounded-3xl p-4 shadow-2xl flex flex-col gap-3 bg-gradient-to-b from-amber-950 via-slate-950 to-amber-950 border-2 border-yellow-400"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-amber-500/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-yellow-300 uppercase tracking-wide font-temple">
                BẢNG ĐỔI QUÀ NHẬN VÉ LÔ TÔ
              </h3>
              <p className="text-[9.5px] text-amber-200/80">
                Tặng quà TikTok để nhận vé may mắn & lên màn hình Live
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs border border-slate-700 shadow"
          >
            ✕
          </button>
        </div>

        {/* Danh sách 4 mức quà kích thích donate */}
        <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-0.5">
          {GIFT_PERKS.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-2xl border bg-gradient-to-r ${item.bg} ${item.border} flex items-start gap-2.5 shadow-md`}
            >
              <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/20 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                {item.icon}
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">{item.name}</span>
                    <span className="text-[9px] font-mono font-bold text-amber-300 bg-black/40 px-1.5 py-0.2 rounded border border-amber-400/30">
                      {item.cost}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider bg-red-600 text-white shadow">
                    {item.badge}
                  </span>
                </div>

                <p className="text-[10px] text-slate-200 mt-1 leading-snug font-medium">
                  {item.perk}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Lời kêu gọi hành động */}
        <div className="p-2 rounded-xl bg-black/60 border border-amber-500/30 text-center text-[10px] text-amber-200 flex items-center justify-center gap-1.5">
          <span>💡</span>
          <span>Khán giả bấm tặng quà trên TikTok, hệ thống sẽ <strong>tự động cấp vé</strong> ngay lập tức!</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          Đã hiểu – Quay lại khán phòng
        </button>
      </div>
    </div>
  );
};

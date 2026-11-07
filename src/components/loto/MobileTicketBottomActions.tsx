import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MobileLotoTicket } from './MobileTicketCardGrid';

interface MobileTicketBottomActionsProps {
  ticket: MobileLotoTicket | null;
  myPrediction: 'chan' | 'le' | null;
  onPredict: (choice: 'chan' | 'le') => void;
  errorMessage: string;
  isClaiming: boolean;
  claimSuccess: boolean;
  onClaimWin: () => void;
}

export const MobileTicketBottomActions: React.FC<MobileTicketBottomActionsProps> = ({
  ticket,
  myPrediction,
  onPredict,
  errorMessage,
  isClaiming,
  claimSuccess,
  onClaimWin,
}) => (
  <>
    <div className="w-full max-w-[350px] pt-1.5">
      <div className="rounded-xl bg-black/75 border border-sky-500/40 p-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-sky-200">🎲 Đoán số kế tiếp:</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPredict('chan')}
            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all active:scale-95 ${
              myPrediction === 'chan'
                ? 'bg-sky-500 text-slate-950 border border-yellow-300 shadow-[0_0_10px_rgba(14,165,233,0.8)]'
                : 'bg-slate-800 text-sky-300 border border-sky-500/40 hover:bg-slate-700'
            }`}
          >
            {myPrediction === 'chan' ? '✓ ĐÃ CHỌN CHẴN' : 'CHẴN (C)'}
          </button>
          <button
            type="button"
            onClick={() => onPredict('le')}
            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all active:scale-95 ${
              myPrediction === 'le'
                ? 'bg-rose-500 text-white border border-yellow-300 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                : 'bg-slate-800 text-rose-300 border border-rose-500/40 hover:bg-slate-700'
            }`}
          >
            {myPrediction === 'le' ? '✓ ĐÃ CHỌN LẺ' : 'LẺ (L)'}
          </button>
        </div>
      </div>
    </div>

    <div className="w-full max-w-[350px] pt-2 flex flex-col gap-1.5">
      {errorMessage && (
        <div className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs text-center font-semibold animate-shake">
          ⚠️ {errorMessage}
        </div>
      )}

      {ticket && ticket.hasWon ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClaimWin}
          disabled={isClaiming || claimSuccess}
          className={`w-full py-4 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2 transition-all ${
            claimSuccess
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-gradient-to-r from-red-600 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_30px_#f59e0b] border-2 border-yellow-200 animate-pulse'
          }`}
        >
          <span>👑</span>
          <span>
            {claimSuccess ? 'ĐÃ HÔ KINH THÀNH CÔNG! 🎉' : isClaiming ? 'Đang gửi tín hiệu...' : 'BẤM ĐỂ HÔ KINH NGAY! (TRÚNG RỒI)'}
          </span>
          <span>👑</span>
        </motion.button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1 py-2.5 px-3 rounded-2xl bg-black/70 border border-amber-900/60 text-center text-[11px] text-amber-300 font-semibold flex items-center justify-center gap-1.5">
            <span>🎯</span>
            <span>
              {ticket && ticket.waitingNumbers.length > 0
                ? `CHỜ SỐ: ${ticket.waitingNumbers.map((n) => (n < 10 ? `0${n}` : n)).join(', ')}`
                : 'Đang dò vé... Chúc bạn nổ Kinh!'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClaimWin}
            disabled={isClaiming}
            className="px-3 py-2.5 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-[10px] font-black text-rose-200 whitespace-nowrap active:scale-95 transition-all"
          >
            🚨 Hô Kinh!
          </button>
        </div>
      )}

      {claimSuccess && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-900/90 to-red-900/90 border border-yellow-400 text-center text-xs text-yellow-200 font-bold shadow-lg animate-in zoom-in-95">
          🎉 Bạn đã hô KINH thành công! Hãy theo dõi trên màn hình Livestream để nhận vinh danh nhé!
        </div>
      )}
    </div>

    <AnimatePresence>
      {claimSuccess && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{ x: (Math.random() - 0.5) * 350, y: (Math.random() - 0.5) * 600, scale: Math.random() * 2 + 1, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: (i % 5) * 0.2 }}
              className="absolute w-3 h-3 rounded-full"
              style={{ backgroundColor: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#eab308'][i % 6] }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  </>
);

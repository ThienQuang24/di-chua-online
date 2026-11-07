import React from 'react';
import { LotoCage } from './LotoCage';
import { LikeBar } from '../LikeRain';
import { LIKES_PER_RAIN } from '../../services/likeRain';
import { LotoState, LotoTicket } from '../../services/loto/lotoEngine';
import { StreamConfig } from '../../types/temple';

interface LotoStageHeaderProps {
  config: StreamConfig;
  gameState: LotoState;
  totalAudienceCount: number;
  likeProgress: number;
  raining: boolean;
  waitingTickets: LotoTicket[];
  onSelectUser: (username: string) => void;
}

export const LotoStageHeader: React.FC<LotoStageHeaderProps> = ({
  config,
  gameState,
  totalAudienceCount,
  likeProgress,
  raining,
  waitingTickets,
  onSelectUser,
}) => {
  const chanCount = gameState.predictionSummary?.chanUsers?.length || 0;
  const leCount = gameState.predictionSummary?.leUsers?.length || 0;
  const totalPred = chanCount + leCount;
  const chanPct = totalPred > 0 ? Math.round((chanCount / totalPred) * 100) : 50;
  const lastPredResult = gameState.predictionSummary?.lastResult;
  const isRecentPredResult = Boolean(lastPredResult && Date.now() - lastPredResult.timestamp < 8000);

  return (
    <div className="relative z-30 flex flex-col items-center w-full">
      {/* Header thông tin hội chợ gọn gàng */}
      <div className="w-full flex flex-col items-center gap-0.5 pt-1.5 px-3">
        <div className="px-4 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border border-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
          <h1 className="text-[11px] font-black tracking-widest uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-1.5 font-temple">
            <span>🎪</span>
            <span>{config.channelName || 'GÁNH HÁT LÔ TÔ HỘI CHỢ'}</span>
            <span>🎪</span>
          </h1>
        </div>

        {/* Gộp Ván + Khán giả + Chat layve + Giải thưởng vào 1 dòng siêu gọn */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/80 border border-yellow-400/50 text-[8px] text-amber-200 font-semibold shadow">
          <span className="text-yellow-300 font-bold">Ván #{gameState.roundId}</span>
          <span className="text-slate-500">•</span>
          <span>👥 {totalAudienceCount} khách</span>
          <span className="text-slate-500">•</span>
          <span className="text-yellow-300 font-bold">
            💬 Chat <strong className="text-white underline">layve</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span>
            🎁 <strong className="text-yellow-300">{gameState.currentPrize || 'Thẻ cào 50K'}</strong>
          </span>
        </div>

        {/* Thanh số vừa gọi gọn gàng */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/85 border border-amber-500/50 shadow-md backdrop-blur-sm">
          <span className="text-[8.5px] text-amber-300 font-bold uppercase whitespace-nowrap">
            Đã gọi ({gameState.calledNumbers.length}/90):
          </span>
          <div className="flex items-center gap-1">
            {gameState.calledNumbers.length === 0 ? (
              <span className="text-[8px] text-slate-400 italic">Bấm "Quay Số" để bắt đầu</span>
            ) : (
              gameState.calledNumbers.slice(-6).reverse().map((num, i) => (
                <span
                  key={num}
                  className={`px-1.5 py-[1px] rounded text-[9.5px] font-black font-mono shadow ${
                    i === 0
                      ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white border border-yellow-300 animate-pulse scale-105'
                      : 'bg-slate-800/90 text-amber-200 border border-slate-700'
                  }`}
                >
                  {num < 10 ? `0${num}` : num}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Thanh đếm tim */}
        <div className="w-full max-w-[340px]">
          <LikeBar
            progress={likeProgress}
            goal={LIKES_PER_RAIN}
            raining={raining}
            isRelative={true}
            customLabel={`❤️ ${likeProgress}/${LIKES_PER_RAIN} tim – Đạt mốc bắn pháo hoa hội chợ!`}
            customRainingLabel="🎆 PHÁO HOA HỘI CHỢ RỰC RỠ! 🎆"
          />
        </div>

        {/* Ý TƯỞNG 2: BẢNG CAO TRÀO CHỜ KINH (SẮP NỔ HŨ) */}
        {waitingTickets.length > 0 && (
          <div className="w-full max-w-[395px] flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-900/95 via-red-600/95 to-amber-600/95 border border-yellow-300 shadow-[0_0_14px_rgba(239,68,68,0.85)] animate-pulse overflow-hidden">
            <span className="text-[7.5px] font-black text-yellow-200 whitespace-nowrap shrink-0">
              🔥 {waitingTickets.length} CHỜ KINH:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {waitingTickets.slice(0, 4).map((wt) => (
                <button
                  key={wt.username}
                  onClick={() => onSelectUser(wt.username)}
                  className="pointer-events-auto text-[7px] font-bold text-white bg-black/50 hover:bg-black/80 px-1.5 py-0.2 rounded-full whitespace-nowrap border border-yellow-300/40"
                >
                  @{wt.displayName}{' '}
                  <strong className="text-yellow-300">
                    (chờ {wt.waitingNumbers.map((n) => (n < 10 ? `0${n}` : n)).join(',')})
                  </strong>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sân khấu biểu diễn: Lồng cầu quay số ảo & câu hò xướng số (nằm gọn trên bục gỗ) */}
      <div className="w-full flex flex-col items-center justify-center pt-0.5 pb-0 pointer-events-none">
        <LotoCage
          isSpinning={gameState.isSpinning}
          currentNumber={gameState.currentNumber}
          currentChant={
            gameState.danceStyle
              ? `⭐ ${gameState.danceDonorName || 'Khán giả'} tặng ${gameState.danceGiftName || 'quà'} - Cả hội trường cùng quẩy! 🎵`
              : gameState.currentChant
          }
        />

        {/* Hàng pill dưới lồng cầu: Đại gia xin vía VIP + Mini-game Đoán số Chẵn/Lẻ */}
        <div className="mt-0.5 flex flex-wrap items-center justify-center gap-1 px-2 max-w-[400px]">
          {gameState.cageSponsor && (
            <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-950/90 via-yellow-900/90 to-amber-950/90 border border-yellow-300/90 shadow-[0_0_8px_rgba(250,204,21,0.5)] flex items-center gap-1">
              <span className="text-[7.5px]">👑</span>
              <span className="text-[7px] font-bold text-yellow-200 whitespace-nowrap">
                VIP <strong className="text-white">{gameState.cageSponsor.displayName}</strong> xin vía!
              </span>
            </div>
          )}

          {gameState.showPredictionWidget && (
            <div className="px-2 py-0.5 rounded-full bg-black/85 border border-sky-400/50 shadow-md backdrop-blur-xs flex items-center gap-1.5">
              {isRecentPredResult && lastPredResult ? (
                <div className="flex items-center gap-1 text-[7px] font-black text-emerald-300 animate-pulse whitespace-nowrap">
                  <span>🎉</span>
                  <span>
                    Số {lastPredResult.number < 10 ? `0${lastPredResult.number}` : lastPredResult.number}:{' '}
                    <strong className="text-yellow-300 uppercase">
                      {lastPredResult.outcome === 'chan' ? 'CHẴN' : 'LẺ'}
                    </strong>{' '}
                    ({lastPredResult.winners.length} trúng)
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-[7px] font-bold text-sky-200 whitespace-nowrap">
                    🎲 Đoán (<strong className="text-yellow-300">C</strong>/<strong className="text-pink-300">L</strong>):
                  </span>
                  <div className="flex items-center gap-1 text-[7px] font-black whitespace-nowrap">
                    <span className="px-1 py-0.1 rounded bg-sky-600/80 text-white border border-sky-300/60">
                      C: {chanCount} ({chanPct}%)
                    </span>
                    <span className="px-1 py-0.1 rounded bg-rose-600/80 text-white border border-rose-300/60">
                      L: {leCount} ({100 - chanPct}%)
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

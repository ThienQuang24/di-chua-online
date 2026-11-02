import React from 'react';

interface LotoBoardProps {
  calledNumbers: number[];
  currentNumber: number | null;
}

export const LotoBoard: React.FC<LotoBoardProps> = ({ calledNumbers, currentNumber }) => {
  const calledSet = React.useMemo(() => new Set(calledNumbers), [calledNumbers]);

  return (
    <div className="w-full bg-slate-950/85 backdrop-blur-md rounded-2xl border border-amber-500/40 p-2.5 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-bold tracking-wider text-amber-300 uppercase flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          BẢNG SỐ 1 - 90
        </span>
        <span className="text-[10px] text-amber-200/80 font-mono">
          Đã gọi: <strong className="text-amber-400 text-xs">{calledNumbers.length}</strong>/90
        </span>
      </div>

      {/* Grid 10 columns x 9 rows */}
      <div className="grid grid-cols-10 gap-1 select-none">
        {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
          const isCalled = calledSet.has(num);
          const isCurrent = num === currentNumber;

          return (
            <div
              key={num}
              className={`
                aspect-square flex items-center justify-center rounded text-[10px] font-bold transition-all duration-300
                ${
                  isCurrent
                    ? 'bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-300 text-slate-950 scale-125 z-10 shadow-[0_0_12px_#f59e0b] animate-bounce ring-2 ring-white'
                    : isCalled
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow-[0_0_5px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-900/60 text-slate-500 border border-slate-800/60 hover:text-slate-400'
                }
              `}
            >
              {num < 10 ? `0${num}` : num}
            </div>
          );
        })}
      </div>
    </div>
  );
};

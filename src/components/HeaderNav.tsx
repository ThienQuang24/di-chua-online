import React from 'react';
import { StreamConfig } from '../types/temple';

export type AppTheme = 'loto' | 'chua' | 'nhau';

interface HeaderNavProps {
  viewMode: StreamConfig['viewMode'];
  onChangeViewMode: (mode: StreamConfig['viewMode']) => void;
  currentTheme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  viewMode,
  onChangeViewMode,
  currentTheme,
  onChangeTheme,
}) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-b border-stone-800 bg-[#120806]/95 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Theme Switcher & Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-900 border border-stone-700">
          <button
            onClick={() => onChangeTheme('loto')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentTheme === 'loto'
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🎪</span>
            <span>Lô Tô Hội Chợ</span>
          </button>

          <button
            onClick={() => onChangeTheme('chua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentTheme === 'chua'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>☸</span>
            <span>Đi Chùa Online</span>
          </button>

          <button
            onClick={() => onChangeTheme('nhau')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentTheme === 'nhau'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🍻</span>
            <span>Quán Nhậu 123 Dô</span>
          </button>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-stone-300">
        <button
          onClick={() => onChangeViewMode('dual')}
          className={`hover:text-amber-300 px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
            viewMode === 'dual' ? 'text-amber-400 font-bold bg-stone-800/60' : ''
          }`}
        >
          Chế Độ Kép (Dual View)
        </button>
        <button
          onClick={() => onChangeViewMode('stage_only')}
          className={`hover:text-amber-300 px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
            viewMode === 'stage_only' ? 'text-amber-400 font-bold bg-stone-800/60' : ''
          }`}
        >
          Màn Hình Live (OBS 9:16)
        </button>
        <button
          onClick={() => onChangeViewMode('control_only')}
          className={`hover:text-amber-300 px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
            viewMode === 'control_only' ? 'text-amber-400 font-bold bg-stone-800/60' : ''
          }`}
        >
          Bảng Điều Khiển
        </button>
      </nav>

      {/* Zone 3: OBS Link Copy Helper */}
      <div className="flex items-center gap-2">
        <a
          href={`/?view=stage&theme=${currentTheme}`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/50 hover:bg-amber-500/20 rounded-lg transition-colors flex items-center gap-1"
        >
          <span>🔗 Mở Link OBS</span>
        </a>
      </div>
    </header>
  );
};

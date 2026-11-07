import { getLotoChant } from './lotoVerses';

export interface LotoCell {
  val: number | null; // null represents blank space on standard loto card
  isMarked: boolean;
}

export interface LotoTicket {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  grid: LotoCell[][]; // 3 rows x 9 columns
  markedCount: number;
  waitingNumbers: number[]; // Numbers needed to win (when 4 of 5 in a row are marked)
  hasWon: boolean;
  winningRow?: number;
  createdAt: number;
  isVip?: boolean;
  vipGiftName?: string;
  vipCoins?: number;
}

export interface LotoWinner {
  username: string;
  displayName: string;
  avatarUrl: string;
  winningNumber: number;
  winningRowNumbers: number[];
  wonAt: number;
  roundId: number;
  prize?: string;
}

export interface LotoFakeKinhEvent {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  maxRowMatched: number; // 0..4 out of 5
  totalMarked: number;
  penaltyText: string;
  timestamp: number;
}

export interface LotoCageSponsor {
  username: string;
  displayName: string;
  avatarUrl: string;
  giftName: string;
  coins: number;
  until: number;
}

export interface LotoPredictionSummary {
  chanUsers: string[];
  leUsers: string[];
  lastResult?: {
    number: number;
    outcome: 'chan' | 'le';
    winners: string[];
    timestamp: number;
  } | null;
}

export type LotoTicketLayout = '1-ticket' | '2-tickets' | '4-tickets' | '6-tickets';
export type LotoTicketDisplayMode = 'priority_waiting' | 'auto_cycle' | 'pinned';

export interface LotoScreenConfig {
  showOnScreenTickets: boolean;
  layout: LotoTicketLayout;
  mode: LotoTicketDisplayMode;
  pinnedUsernames: string[];
  cycleIntervalSeconds: number;
}

export type LotoDanceStyle =
  | 'fan'
  | 'hipshake'
  | 'disco'
  | 'robot'
  | 'troupe'
  | 'baga'
  | 'vica'
  | 'anime'
  | 'stickmin'
  | 'chika_spin'
  | 'alice'
  | 'waifu_mmd'
  | 'altera'
  | 'cat_meme'
  | 'kpop_trio'
  | 'haaland'
  | 'toctoc'
  | 'croc_duo';

export interface LotoState {
  roundId: number;
  calledNumbers: number[];
  currentNumber: number | null;
  currentChant: string;
  isSpinning: boolean;
  isAutoSpin: boolean;
  spinInterval: number; // in seconds
  lastWinner: LotoWinner | null;
  historyWinners: LotoWinner[];
  activeTicketCount: number;
  screenConfig: LotoScreenConfig;
  spotlightTicketUser: string | null;
  showSpotlightTicket: boolean;
  autoShowOnWaitingKin: boolean;
  currentPrize: string;
  danceStyle: LotoDanceStyle | null;
  danceDonorName?: string;
  danceGiftName?: string;
  customVideoUrl?: string;
  isGreenScreen?: boolean;
  lastFakeKinh: LotoFakeKinhEvent | null;
  cageSponsor: LotoCageSponsor | null;
  predictionSummary: LotoPredictionSummary;
  showPredictionWidget: boolean;
  lastSavedAt: number;
  autoResetOnWin: boolean;
  autoNextRoundCountdown: number | null;
  autoBotCrowd: boolean;
}

// Generate a authentic Vietnamese Lô Tô card: 3 rows, 9 columns.
// Each row has exactly 5 numbers and 4 blanks.
// Col 0: 1-9, Col 1: 10-19, ..., Col 8: 80-90.
export function generateVietnameseLotoCard(): number[][] {
  const grid: (number | null)[][] = [
    new Array(9).fill(null),
    new Array(9).fill(null),
    new Array(9).fill(null),
  ];

  const getColPool = (c: number) => {
    const min = c === 0 ? 1 : c * 10;
    const max = c === 8 ? 90 : c * 10 + 9;
    const pool: number[] = [];
    for (let i = min; i <= max; i++) pool.push(i);
    return pool;
  };

  const colPools: number[][] = [];
  for (let c = 0; c < 9; c++) {
    colPools.push(getColPool(c).sort(() => Math.random() - 0.5));
  }

  // For each of the 3 rows, pick 5 distinct columns to place numbers
  for (let r = 0; r < 3; r++) {
    const cols = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, 5).sort((a, b) => a - b);
    for (const c of cols) {
      const num = colPools[c].pop() ?? (c * 10 + Math.floor(Math.random() * 9) + (c === 0 ? 1 : 0));
      grid[r][c] = num;
    }
  }

  // Ensure each column has numbers sorted vertically if multiple exist
  for (let c = 0; c < 9; c++) {
    const numsInCol: number[] = [];
    for (let r = 0; r < 3; r++) {
      if (grid[r][c] !== null) numsInCol.push(grid[r][c]!);
    }
    numsInCol.sort((a, b) => a - b);
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      if (grid[r][c] !== null) {
        grid[r][c] = numsInCol[idx++];
      }
    }
  }

  return grid as number[][];
}

const FAKE_KINH_PENALTIES = [
  'Đứng dậy múa quạt 10 giây trước hội trường!',
  'Lắc hông nhảy điệu Cá Sấu 10 giây!',
  'Đứng lên hát 1 câu cải lương chuộc lỗi!',
  'Thả 50 tim liền tay vì tội báo động giả!',
  'Uống 1 hơi hết ly nước lọc không nghỉ!',
  'Đứng nhún nhảy cổ vũ bà con suốt 10 giây!',
];

const LOTO_STORAGE_KEY = 'loto_engine_backup_v1';

class LotoEngineService {
  private roundId: number = 1;
  private calledNumbers: number[] = [];
  private currentNumber: number | null = null;
  private currentChant: string = 'Đêm hội Lô Tô đang mở màn, xin chúc cả nhà may mắn!';
  private isSpinning: boolean = false;
  private isAutoSpin: boolean = true;
  private spinInterval: number = 18; // 18 seconds between numbers (enough time for AI to sing full loto chant)
  private autoTimer: ReturnType<typeof setInterval> | null = null;

  private screenConfig: LotoScreenConfig = {
    showOnScreenTickets: true,
    layout: '4-tickets',
    mode: 'priority_waiting',
    pinnedUsernames: [],
    cycleIntervalSeconds: 8,
  };

  private spotlightTicketUser: string | null = null;
  private showSpotlightTicket: boolean = false;
  private autoShowOnWaitingKin: boolean = true;

  private tickets: Map<string, LotoTicket> = new Map();
  private lastWinner: LotoWinner | null = null;
  private historyWinners: LotoWinner[] = [];
  private currentPrize: string = 'Thẻ cào điện thoại 50.000đ';
  private danceStyle: LotoDanceStyle | null = null;
  private danceDonorName?: string;
  private danceGiftName?: string;
  private customVideoUrl?: string;
  private isGreenScreen?: boolean;
  private danceTimer: ReturnType<typeof setTimeout> | null = null;

  private lastFakeKinh: LotoFakeKinhEvent | null = null;
  private fakeKinhTimer: ReturnType<typeof setTimeout> | null = null;
  private cageSponsor: LotoCageSponsor | null = null;
  private predictions: Map<string, { username: string; displayName: string; choice: 'chan' | 'le' }> = new Map();
  private lastPredictionResult: LotoPredictionSummary['lastResult'] = null;
  private showPredictionWidget: boolean = true;
  private lastSavedAt: number = Date.now();
  private autoResetOnWin: boolean = true;
  private autoNextRoundCountdown: number | null = null;
  private nextRoundInterval: ReturnType<typeof setInterval> | null = null;
  private autoBotCrowd: boolean = false;
  private botCrowdInterval: ReturnType<typeof setInterval> | null = null;

  private listeners: Set<(state: LotoState) => void> = new Set();
  private onNumberCalledCallbacks: Set<(num: number, chant: string, spokenText: string) => void> = new Set();
  private onWinCallbacks: Set<(winner: LotoWinner) => void> = new Set();
  private onFakeKinhCallbacks: Set<(fakeEvent: LotoFakeKinhEvent) => void> = new Set();
  private onBotChatCallbacks: Set<(username: string, displayName: string, comment: string, avatarUrl: string) => void> = new Set();

  constructor() {
    // Start with auto-spin disabled until stream begins or owner turns it on
    this.isAutoSpin = false;
    const restored = this.restoreFromLocalStorage();
    if (!restored || this.tickets.size === 0) {
      this.seedInitialTickets(4);
    }
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      this.lastSavedAt = Date.now();
      const payload = {
        roundId: this.roundId,
        calledNumbers: this.calledNumbers,
        currentNumber: this.currentNumber,
        currentChant: this.currentChant,
        currentPrize: this.currentPrize,
        lastWinner: this.lastWinner,
        historyWinners: this.historyWinners.slice(0, 20),
        cageSponsor: this.cageSponsor,
        showPredictionWidget: this.showPredictionWidget,
        tickets: Array.from(this.tickets.values()),
        savedAt: this.lastSavedAt,
      };
      window.localStorage.setItem(LOTO_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }

  private restoreFromLocalStorage(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const raw = window.localStorage.getItem(LOTO_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return false;
      // Only restore if saved within the last 12 hours
      if (parsed.savedAt && Date.now() - parsed.savedAt > 12 * 3600 * 1000) return false;

      if (typeof parsed.roundId === 'number') this.roundId = parsed.roundId;
      if (Array.isArray(parsed.calledNumbers)) this.calledNumbers = parsed.calledNumbers;
      if (parsed.currentNumber !== undefined) this.currentNumber = parsed.currentNumber;
      if (typeof parsed.currentChant === 'string') this.currentChant = parsed.currentChant;
      if (typeof parsed.currentPrize === 'string') this.currentPrize = parsed.currentPrize;
      if (parsed.lastWinner) this.lastWinner = parsed.lastWinner;
      if (Array.isArray(parsed.historyWinners)) this.historyWinners = parsed.historyWinners;
      if (parsed.cageSponsor) this.cageSponsor = parsed.cageSponsor;
      if (typeof parsed.showPredictionWidget === 'boolean') this.showPredictionWidget = parsed.showPredictionWidget;
      if (typeof parsed.savedAt === 'number') this.lastSavedAt = parsed.savedAt;

      if (Array.isArray(parsed.tickets) && parsed.tickets.length > 0) {
        this.tickets.clear();
        for (const t of parsed.tickets) {
          if (t && t.username && Array.isArray(t.grid)) {
            this.recalcTicketStatus(t);
            this.tickets.set(t.username.toLowerCase(), t);
          }
        }
        return true;
      }
    } catch {
      // Ignore parse errors
    }
    return false;
  }

  public onFakeKinh(cb: (fakeEvent: LotoFakeKinhEvent) => void) {
    this.onFakeKinhCallbacks.add(cb);
    return () => {
      this.onFakeKinhCallbacks.delete(cb);
    };
  }

  public clearFakeKinh() {
    if (this.fakeKinhTimer) clearTimeout(this.fakeKinhTimer);
    this.lastFakeKinh = null;
    this.notify();
  }

  // Feature 1: Check when a viewer claims "KINH" in chat or mobile
  public claimKinh(
    username: string,
    displayName?: string,
    avatarUrl?: string
  ): { won: boolean; fakeEvent?: LotoFakeKinhEvent; winner?: LotoWinner } {
    const t = this.issueTicket(username, displayName || username, avatarUrl || '');
    this.recalcTicketStatus(t);

    if (t.hasWon && t.winningRow !== undefined) {
      const winningRowNumbers: number[] = [];
      t.grid[t.winningRow].forEach((c) => {
        if (c.val !== null) winningRowNumbers.push(c.val);
      });
      const winner: LotoWinner = {
        username: t.username,
        displayName: t.displayName,
        avatarUrl: t.avatarUrl,
        winningNumber: this.currentNumber || winningRowNumbers[winningRowNumbers.length - 1] || 1,
        winningRowNumbers,
        wonAt: Date.now(),
        roundId: this.roundId,
        prize: this.currentPrize,
      };
      this.lastWinner = winner;
      this.historyWinners.unshift(winner);
      this.notify();
      this.onWinCallbacks.forEach((cb) => cb(winner));
      return { won: true, winner };
    }

    // Fake Kinh! Calculate max numbers matched in a single row
    let maxRowMatched = 0;
    for (let r = 0; r < 3; r++) {
      let rowMatched = 0;
      for (let c = 0; c < 9; c++) {
        if (t.grid[r][c].val !== null && t.grid[r][c].isMarked) {
          rowMatched++;
        }
      }
      if (rowMatched > maxRowMatched) maxRowMatched = rowMatched;
    }

    const penaltyText = FAKE_KINH_PENALTIES[Math.floor(Math.random() * FAKE_KINH_PENALTIES.length)];
    const fakeEvent: LotoFakeKinhEvent = {
      id: `fake_${Date.now()}_${t.username}`,
      username: t.username,
      displayName: t.displayName,
      avatarUrl: t.avatarUrl,
      maxRowMatched,
      totalMarked: t.markedCount,
      penaltyText,
      timestamp: Date.now(),
    };

    if (this.fakeKinhTimer) clearTimeout(this.fakeKinhTimer);
    this.lastFakeKinh = fakeEvent;
    // Automatically spotlight the offender's ticket so everyone sees they only had maxRowMatched/5!
    this.spotlightTicketUser = t.username.toLowerCase();
    this.showSpotlightTicket = true;
    this.notify();
    this.onFakeKinhCallbacks.forEach((cb) => cb(fakeEvent));

    this.fakeKinhTimer = setTimeout(() => {
      if (this.lastFakeKinh?.id === fakeEvent.id) {
        this.lastFakeKinh = null;
        this.notify();
      }
    }, 10000);

    return { won: false, fakeEvent };
  }

  public simulateFakeKinh(targetUsername?: string): LotoFakeKinhEvent {
    const all = this.getTickets();
    let target = targetUsername ? this.getTicketForUser(targetUsername) : undefined;
    if (!target) {
      const nonWinners = all.filter((t) => !t.hasWon);
      target = nonWinners.length > 0 ? nonWinners[Math.floor(Math.random() * nonWinners.length)] : all[0];
    }
    if (!target) {
      target = this.issueTicket('minh_tuan', 'Minh Tuấn', '/assets/nhau/patron-1.png');
    }
    const res = this.claimKinh(target.username, target.displayName, target.avatarUrl);
    if (res.fakeEvent) return res.fakeEvent;
    // Fallback if target already won
    const fallbackEvent: LotoFakeKinhEvent = {
      id: `fake_${Date.now()}`,
      username: target.username,
      displayName: target.displayName,
      avatarUrl: target.avatarUrl,
      maxRowMatched: 2,
      totalMarked: 4,
      penaltyText: FAKE_KINH_PENALTIES[0],
      timestamp: Date.now(),
    };
    this.lastFakeKinh = fallbackEvent;
    this.notify();
    return fallbackEvent;
  }

  // Feature 3: Upgrade donor to VIP Ticket & Cage Sponsor ("Xin Vía Lồng Cầu")
  public upgradeToVip(
    username: string,
    displayName: string,
    avatarUrl: string,
    giftName: string = 'Hoa Hồng',
    coins: number = 1,
    skipServerSync: boolean = false
  ): LotoTicket {
    const t = this.issueTicket(username, displayName, avatarUrl, undefined, true);
    t.isVip = true;
    t.vipGiftName = giftName;
    t.vipCoins = (t.vipCoins || 0) + coins;

    // Set Cage Sponsor ("Xin Vía Lồng Cầu")
    this.cageSponsor = {
      username: t.username,
      displayName: t.displayName,
      avatarUrl: t.avatarUrl,
      giftName,
      coins,
      until: Date.now() + 60000,
    };

    if (skipServerSync) {
      this.notifyLocalOnly();
    } else {
      this.notify();
      if (typeof window !== 'undefined') {
        fetch('/api/loto/add-players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            players: [
              {
                username: t.username,
                displayName: t.displayName,
                avatarUrl: t.avatarUrl,
                grid: t.grid,
                isVip: true,
                vipGiftName: t.vipGiftName,
                vipCoins: t.vipCoins,
              },
            ],
          }),
        }).catch(() => {});
      }
    }
    return t;
  }

  // Feature 4: Next Number Odd/Even (Chẵn/Lẻ) Prediction Mini-Game
  public submitPrediction(
    username: string,
    displayName: string,
    choice: 'chan' | 'le',
    skipServerSync: boolean = false
  ) {
    const key = username.toLowerCase();
    this.predictions.set(key, {
      username,
      displayName: displayName || username,
      choice,
    });
    if (skipServerSync) {
      this.notifyLocalOnly();
    } else {
      this.notify();
    }
  }

  public simulatePredictions(count: number = 8) {
    const all = this.getTickets();
    const pool = all.length > 0 ? all : [];
    for (let i = 0; i < Math.min(count, Math.max(pool.length, count)); i++) {
      const p = pool[i % Math.max(1, pool.length)];
      const uname = p ? p.username : `khach_${i + 1}`;
      const dname = p ? p.displayName : `Khách #${i + 1}`;
      const choice: 'chan' | 'le' = Math.random() > 0.48 ? 'chan' : 'le';
      this.predictions.set(uname.toLowerCase(), { username: uname, displayName: dname, choice });
    }
    this.notify();
  }

  // Feature 2 Demo: Put up to 3 tickets into "Chờ Kinh" (4/5 numbers on row 0) to trigger Tension Mode
  public simulateTensionWaiting(count: number = 3) {
    const all = this.getTickets();
    if (all.length === 0) {
      this.seedInitialTickets(4);
    }
    const targets = this.getTickets().slice(0, count);
    targets.forEach((t) => {
      let markedInRow0 = 0;
      for (let c = 0; c < 9; c++) {
        const cell = t.grid[0][c];
        if (cell.val !== null) {
          if (markedInRow0 < 4) {
            cell.isMarked = true;
            if (!this.calledNumbers.includes(cell.val)) {
              this.calledNumbers.push(cell.val);
            }
            markedInRow0++;
          } else {
            cell.isMarked = false;
          }
        }
      }
      this.recalcTicketStatus(t);
    });
    this.notify();
  }

  public setShowPredictionWidget(enabled: boolean) {
    this.showPredictionWidget = enabled;
    this.notify();
  }

  public getPredictionSummary(): LotoPredictionSummary {
    const chanUsers: string[] = [];
    const leUsers: string[] = [];
    this.predictions.forEach((v) => {
      if (v.choice === 'chan') chanUsers.push(v.displayName);
      else leUsers.push(v.displayName);
    });
    return {
      chanUsers,
      leUsers,
      lastResult: this.lastPredictionResult,
    };
  }

  public setSpotlightTicket(username: string | null) {
    this.spotlightTicketUser = username ? username.toLowerCase() : null;
    this.showSpotlightTicket = Boolean(username);
    this.notify();
  }

  public closeSpotlightTicket() {
    this.showSpotlightTicket = false;
    this.notify();
  }

  public toggleSpotlightTicket(username?: string) {
    if (this.showSpotlightTicket) {
      if (!username || (this.spotlightTicketUser && this.spotlightTicketUser === username.toLowerCase())) {
        this.showSpotlightTicket = false;
      } else {
        this.spotlightTicketUser = username.toLowerCase();
      }
    } else {
      if (username) this.spotlightTicketUser = username.toLowerCase();
      this.showSpotlightTicket = true;
    }
    this.notify();
  }

  public setAutoShowOnWaitingKin(enabled: boolean) {
    this.autoShowOnWaitingKin = enabled;
    this.notify();
  }

  public getScreenConfig(): LotoScreenConfig {
    return { ...this.screenConfig, pinnedUsernames: [...this.screenConfig.pinnedUsernames] };
  }

  public setScreenConfig(partial: Partial<LotoScreenConfig>) {
    this.screenConfig = { ...this.screenConfig, ...partial };
    this.notify();
  }

  public pinTicket(username: string) {
    const key = username.toLowerCase();
    if (!this.screenConfig.pinnedUsernames.includes(key)) {
      this.screenConfig.pinnedUsernames.push(key);
      this.notify();
    }
  }

  public unpinTicket(username: string) {
    const key = username.toLowerCase();
    this.screenConfig.pinnedUsernames = this.screenConfig.pinnedUsernames.filter((u) => u !== key);
    this.notify();
  }

  public removeTicket(username: string) {
    const key = username.toLowerCase();
    this.tickets.delete(key);
    this.screenConfig.pinnedUsernames = this.screenConfig.pinnedUsernames.filter((u) => u !== key);
    if (this.spotlightTicketUser === key) {
      this.showSpotlightTicket = false;
      this.spotlightTicketUser = null;
    }
    this.notify();
  }

  public clearAllTickets(skipServerSync: boolean = false) {
    this.tickets.clear();
    this.screenConfig.pinnedUsernames = [];
    this.showSpotlightTicket = false;
    this.spotlightTicketUser = null;
    if (skipServerSync) {
      this.notifyLocalOnly();
    } else {
      this.notify();
    }
  }

  public rerollTicket(username: string) {
    const key = username.toLowerCase();
    const t = this.tickets.get(key);
    if (!t) return;
    const rawGrid = generateVietnameseLotoCard();
    t.grid = rawGrid.map((row) =>
      row.map((val) => ({
        val,
        isMarked: val !== null && this.calledNumbers.includes(val),
      }))
    );
    this.recalcTicketStatus(t);
    this.notify();
  }

  public seedInitialTickets(count: number = 4) {
    const defaultViewers = [
      { user: 'huong_giang', name: 'Hương Giang', avatar: '/assets/loto/patron-1.png' },
      { user: 'minh_tuan', name: 'Minh Tuấn', avatar: '/assets/nhau/patron-1.png' },
      { user: 'bao_ngoc', name: 'Bảo Ngọc', avatar: '/assets/loto/patron-2.png' },
      { user: 'hoang_nam', name: 'Hoàng Nam', avatar: '/assets/nhau/patron-female-1.png' },
      { user: 'linh_dan', name: 'Linh Đan (Fan Cứng)', avatar: '/assets/nhau/patron-female-2.png' },
      { user: 'thanh_hang', name: 'Thanh Hằng', avatar: '/assets/nhau/patron-uncle-1.png' },
    ];
    for (let i = 0; i < Math.min(count, defaultViewers.length); i++) {
      const v = defaultViewers[i];
      if (!this.tickets.has(v.user)) {
        this.issueTicket(v.user, v.name, v.avatar, undefined, true);
      }
    }
  }

  public subscribe(cb: (state: LotoState) => void) {
    this.listeners.add(cb);
    cb(this.getState());
    return () => {
      this.listeners.delete(cb);
    };
  }

  public onNumberCalled(cb: (num: number, chant: string, spokenText: string) => void) {
    this.onNumberCalledCallbacks.add(cb);
    return () => {
      this.onNumberCalledCallbacks.delete(cb);
    };
  }

  public onWin(cb: (winner: LotoWinner) => void) {
    this.onWinCallbacks.add(cb);
    return () => {
      this.onWinCallbacks.delete(cb);
    };
  }

  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private syncToServer() {
    if (typeof window === 'undefined') return;
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      fetch('/api/loto/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: this.roundId,
          calledNumbers: this.calledNumbers,
          currentNumber: this.currentNumber,
          currentChant: this.currentChant,
          isSpinning: this.isSpinning,
          lastWinner: this.lastWinner,
          spotlightTicketUser: this.spotlightTicketUser,
          showSpotlightTicket: this.showSpotlightTicket,
          currentPrize: this.currentPrize,
          danceStyle: this.danceStyle,
          danceDonorName: this.danceDonorName,
          danceGiftName: this.danceGiftName,
          customVideoUrl: this.customVideoUrl,
          isGreenScreen: this.isGreenScreen,
          lastFakeKinh: this.lastFakeKinh,
          cageSponsor: this.cageSponsor,
          predictionSummary: this.getPredictionSummary(),
          showPredictionWidget: this.showPredictionWidget,
        }),
      }).catch(() => {});
    }, 100);
  }

  private notifyLocalOnly() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  private notify() {
    this.saveToLocalStorage();
    this.notifyLocalOnly();
    this.syncToServer();
  }

  // Apply state received from SSE (e.g. when Streamer controls from another tab) without echoing back to server
  public applyRemoteState(data: any) {
    if (!data) return;
    let roundChanged = false;
    if (typeof data.roundId === 'number' && data.roundId !== this.roundId) {
      this.roundId = data.roundId;
      this.calledNumbers = [];
      this.currentNumber = null;
      this.lastWinner = null;
      this.lastFakeKinh = null;
      this.predictions.clear();
      this.lastPredictionResult = null;
      roundChanged = true;
    }

    const prevNumber = this.currentNumber;
    const prevSpinning = this.isSpinning;

    if (typeof data.isSpinning === 'boolean') {
      this.isSpinning = data.isSpinning;
    }
    if (typeof data.currentChant === 'string') {
      this.currentChant = data.currentChant;
    }
    if (data.currentNumber !== undefined) {
      this.currentNumber = data.currentNumber;
    }

    if (Array.isArray(data.calledNumbers)) {
      this.calledNumbers = data.calledNumbers;
      this.tickets.forEach((ticket) => {
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 9; c++) {
            const cell = ticket.grid[r][c];
            cell.isMarked = cell.val !== null && this.calledNumbers.includes(cell.val);
          }
        }
        this.recalcTicketStatus(ticket);
      });
    } else if (roundChanged) {
      this.tickets.forEach((ticket) => {
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 9; c++) {
            ticket.grid[r][c].isMarked = false;
          }
        }
        this.recalcTicketStatus(ticket);
      });
    }

    if (data.spotlightTicketUser !== undefined) {
      this.spotlightTicketUser = data.spotlightTicketUser;
    }
    if (typeof data.showSpotlightTicket === 'boolean') {
      this.showSpotlightTicket = data.showSpotlightTicket;
    }
    if (typeof data.currentPrize === 'string') {
      this.currentPrize = data.currentPrize;
    }
    if (data.danceStyle !== undefined) {
      this.danceStyle = data.danceStyle;
      this.danceDonorName = data.danceDonorName ?? undefined;
      this.danceGiftName = data.danceGiftName ?? undefined;
      this.customVideoUrl = data.customVideoUrl ?? undefined;
      this.isGreenScreen = data.isGreenScreen ?? undefined;
    }

    const prevFake = this.lastFakeKinh;
    if (data.lastFakeKinh !== undefined) {
      this.lastFakeKinh = data.lastFakeKinh;
      if (this.lastFakeKinh && (!prevFake || prevFake.id !== this.lastFakeKinh.id)) {
        this.onFakeKinhCallbacks.forEach((cb) => cb(this.lastFakeKinh!));
      }
    }

    if (data.cageSponsor !== undefined) {
      this.cageSponsor = data.cageSponsor;
    }

    if (typeof data.showPredictionWidget === 'boolean') {
      this.showPredictionWidget = data.showPredictionWidget;
    }

    if (data.predictionSummary && typeof data.predictionSummary === 'object') {
      this.predictions.clear();
      if (Array.isArray(data.predictionSummary.chanUsers)) {
        data.predictionSummary.chanUsers.forEach((name: string) => {
          this.predictions.set(name.toLowerCase(), { username: name, displayName: name, choice: 'chan' });
        });
      }
      if (Array.isArray(data.predictionSummary.leUsers)) {
        data.predictionSummary.leUsers.forEach((name: string) => {
          this.predictions.set(name.toLowerCase(), { username: name, displayName: name, choice: 'le' });
        });
      }
      if (data.predictionSummary.lastResult !== undefined) {
        this.lastPredictionResult = data.predictionSummary.lastResult;
      }
    }

    const prevWinner = this.lastWinner;
    if (data.lastWinner !== undefined) {
      this.lastWinner = data.lastWinner;
      if (
        this.lastWinner &&
        (!prevWinner ||
          prevWinner.username !== this.lastWinner.username ||
          prevWinner.wonAt !== this.lastWinner.wonAt)
      ) {
        const t = this.getTicketForUser(this.lastWinner.username);
        if (t) t.hasWon = true;
        this.onWinCallbacks.forEach((cb) => cb(this.lastWinner!));
      }
    }

    if (
      this.currentNumber !== null &&
      !this.isSpinning &&
      (this.currentNumber !== prevNumber || prevSpinning)
    ) {
      const { verse, spokenText } = getLotoChant(this.currentNumber);
      this.onNumberCalledCallbacks.forEach((cb) =>
        cb(this.currentNumber!, this.currentChant || verse, spokenText)
      );
    }

    this.saveToLocalStorage();
    this.notifyLocalOnly();
  }

  // Set winner triggered from external mobile companion device
  public setExternalWinner(winner: LotoWinner) {
    this.lastWinner = winner;
    this.historyWinners.unshift(winner);
    const t = this.getTicketForUser(winner.username);
    if (t) {
      t.hasWon = true;
    }
    this.notify();
    this.onWinCallbacks.forEach((cb) => cb(winner));
  }

  public triggerDance(
    style: LotoDanceStyle | null,
    durationMs: number = 8000,
    donorName?: string,
    giftName?: string,
    customVideoUrl?: string,
    isGreenScreen?: boolean
  ) {
    if (this.danceTimer) clearTimeout(this.danceTimer);
    this.danceStyle = style;
    this.danceDonorName = donorName;
    this.danceGiftName = giftName;
    this.customVideoUrl = customVideoUrl;
    this.isGreenScreen = isGreenScreen;
    this.notify();

    if (style && durationMs > 0) {
      this.danceTimer = setTimeout(() => {
        this.danceStyle = null;
        this.danceDonorName = undefined;
        this.danceGiftName = undefined;
        this.customVideoUrl = undefined;
        this.isGreenScreen = undefined;
        this.notify();
      }, durationMs);
    }
  }

  public stopDance() {
    if (this.danceTimer) clearTimeout(this.danceTimer);
    this.danceStyle = null;
    this.danceDonorName = undefined;
    this.danceGiftName = undefined;
    this.customVideoUrl = undefined;
    this.isGreenScreen = undefined;
    this.notify();
  }

  public getState(): LotoState {
    return {
      roundId: this.roundId,
      calledNumbers: [...this.calledNumbers],
      currentNumber: this.currentNumber,
      currentChant: this.currentChant,
      isSpinning: this.isSpinning,
      isAutoSpin: this.isAutoSpin,
      spinInterval: this.spinInterval,
      lastWinner: this.lastWinner,
      historyWinners: [...this.historyWinners],
      activeTicketCount: this.tickets.size,
      screenConfig: this.getScreenConfig(),
      spotlightTicketUser: this.spotlightTicketUser,
      showSpotlightTicket: this.showSpotlightTicket,
      autoShowOnWaitingKin: this.autoShowOnWaitingKin,
      currentPrize: this.currentPrize,
      danceStyle: this.danceStyle,
      danceDonorName: this.danceDonorName,
      danceGiftName: this.danceGiftName,
      customVideoUrl: this.customVideoUrl,
      isGreenScreen: this.isGreenScreen,
      lastFakeKinh: this.lastFakeKinh,
      cageSponsor: this.cageSponsor,
      predictionSummary: this.getPredictionSummary(),
      showPredictionWidget: this.showPredictionWidget,
      lastSavedAt: this.lastSavedAt,
      autoResetOnWin: this.autoResetOnWin,
      autoNextRoundCountdown: this.autoNextRoundCountdown,
      autoBotCrowd: this.autoBotCrowd,
    };
  }

  public onBotChat(cb: (username: string, displayName: string, comment: string, avatarUrl: string) => void) {
    this.onBotChatCallbacks.add(cb);
    return () => {
      this.onBotChatCallbacks.delete(cb);
    };
  }

  public setAutoResetOnWin(enabled: boolean) {
    this.autoResetOnWin = enabled;
    if (!enabled && this.nextRoundInterval) {
      clearInterval(this.nextRoundInterval);
      this.nextRoundInterval = null;
      this.autoNextRoundCountdown = null;
    } else if (enabled && this.isAutoSpin && (this.lastWinner || this.calledNumbers.length >= 90)) {
      this.scheduleAutoNextRound();
    }
    this.notify();
  }

  private scheduleAutoNextRound(seconds: number = 15) {
    if (!this.isAutoSpin || !this.autoResetOnWin) return;
    if (this.nextRoundInterval) {
      clearInterval(this.nextRoundInterval);
      this.nextRoundInterval = null;
    }
    this.autoNextRoundCountdown = seconds;
    this.notify();
    this.nextRoundInterval = setInterval(() => {
      if (!this.isAutoSpin || !this.autoResetOnWin) {
        if (this.nextRoundInterval) clearInterval(this.nextRoundInterval);
        this.nextRoundInterval = null;
        this.autoNextRoundCountdown = null;
        this.notify();
        return;
      }
      if (this.autoNextRoundCountdown !== null && this.autoNextRoundCountdown > 1) {
        this.autoNextRoundCountdown -= 1;
        this.notifyLocalOnly();
      } else {
        if (this.nextRoundInterval) clearInterval(this.nextRoundInterval);
        this.nextRoundInterval = null;
        this.autoNextRoundCountdown = null;
        this.resetRound();
      }
    }, 1000);
  }

  public setAutoBotCrowd(enabled: boolean) {
    this.autoBotCrowd = enabled;
    if (this.botCrowdInterval) {
      clearInterval(this.botCrowdInterval);
      this.botCrowdInterval = null;
    }
    if (enabled) {
      this.triggerRandomBotChat();
      this.botCrowdInterval = setInterval(() => {
        if (!this.autoBotCrowd) return;
        this.triggerRandomBotChat();
      }, 7500);
    }
    this.notify();
  }

  public triggerRandomBotChat(customUser?: string, customComment?: string) {
    const botPool = [
      { user: 'anh_ba_sg', name: 'Anh Ba Sài Gòn', avatar: '/assets/nhau/patron-1.png' },
      { user: 'co_bay_mientay', name: 'Cô Bảy Miền Tây', avatar: '/assets/loto/patron-1.png' },
      { user: 'tuan_ken_99', name: 'Tuấn Ken', avatar: '/assets/nhau/patron-2.png' },
      { user: 'be_bap_cute', name: 'Bé Bắp', avatar: '/assets/nhau/patron-female-1.png' },
      { user: 'hung_rau_q4', name: 'Hùng Râu', avatar: '/assets/nhau/patron-uncle-1.png' },
      { user: 'dieu_nhi_loto', name: 'Diệu Nhi', avatar: '/assets/nhau/patron-female-2.png' },
      { user: 'minh_tri_vip', name: 'Minh Trí', avatar: '/assets/loto/patron-2.png' },
      { user: 'linh_dan_idol', name: 'Linh Đan', avatar: '/assets/nhau/patron-chill-1.png' },
    ];
    if (this.tickets.size < 10) {
      botPool.forEach((b) => {
        if (!this.tickets.has(b.user)) {
          this.issueTicket(b.user, b.name, b.avatar);
        }
      });
    }

    const ticketsArr = this.getTickets();
    if (ticketsArr.length === 0) return;

    const picked = customUser
      ? ticketsArr.find((t) => t.username.toLowerCase() === customUser.toLowerCase()) || ticketsArr[0]
      : ticketsArr[Math.floor(Math.random() * ticketsArr.length)];

    const sampleChats = [
      'Gánh hát kêu số mát tay quá ad ơi! 🔥',
      'Còn thiếu đúng 1 con nữa là nổ Kinh!',
      'Em chốt số Chẵn (C) lượt này nha!',
      'Ra số Lẻ (L) đi lồng cầu ơi!',
      'Xin vía Thẻ cào 50K ván này nha cả nhà 🍀',
      'Hội chợ đông vui quá, thả tim mạnh lên anh em!',
      picked.waitingNumbers.length > 0
        ? `Trời ơi em đang chờ con ${picked.waitingNumbers[0]} hú hồn!`
        : 'Đợi mãi chưa thấy con hàng chục của em đâu 😂',
      'Ca sĩ hát ngọt lịm luôn á!',
    ];

    const text = customComment || sampleChats[Math.floor(Math.random() * sampleChats.length)];
    if (text.includes('Chẵn')) {
      this.submitPrediction(picked.username, picked.displayName, 'chan');
    } else if (text.includes('Lẻ')) {
      this.submitPrediction(picked.username, picked.displayName, 'le');
    }

    this.onBotChatCallbacks.forEach((cb) => cb(picked.username, picked.displayName, text, picked.avatarUrl));
    if (typeof window !== 'undefined') {
      fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_chat',
          username: picked.username,
          displayName: picked.displayName,
          text,
          avatarUrl: picked.avatarUrl,
        }),
      }).catch(() => {});
    }
  }

  public setPrize(prize: string) {
    this.currentPrize = prize.trim() || 'Thẻ cào 50.000đ';
    this.notify();
  }

  public getPrize(): string {
    return this.currentPrize;
  }

  public getTickets(): LotoTicket[] {
    return Array.from(this.tickets.values());
  }

  public getTicketForUser(username: string): LotoTicket | undefined {
    return this.tickets.get(username.toLowerCase());
  }

  // Issue or get ticket for a viewer
  public issueTicket(
    username: string,
    displayName: string,
    avatarUrl: string,
    externalGrid?: any[][],
    skipServerSync: boolean = false,
    isVip?: boolean,
    vipGiftName?: string,
    vipCoins?: number
  ): LotoTicket {
    const key = username.toLowerCase();
    const existing = this.tickets.get(key);
    if (existing) {
      if (displayName) existing.displayName = displayName;
      if (avatarUrl) existing.avatarUrl = avatarUrl;
      if (isVip) existing.isVip = true;
      if (vipGiftName) existing.vipGiftName = vipGiftName;
      if (typeof vipCoins === 'number') existing.vipCoins = vipCoins;
      if (Array.isArray(externalGrid) && externalGrid.length === 3) {
        existing.grid = externalGrid.map((row) =>
          row.map((cell) => {
            const val = typeof cell === 'object' && cell !== null ? cell.val : cell;
            return {
              val: typeof val === 'number' ? val : null,
              isMarked: typeof val === 'number' && this.calledNumbers.includes(val),
            };
          })
        );
        this.recalcTicketStatus(existing);
        this.notifyLocalOnly();
      }
      return existing;
    }

    let grid: LotoCell[][];
    if (Array.isArray(externalGrid) && externalGrid.length === 3) {
      grid = externalGrid.map((row) =>
        row.map((cell) => {
          const val = typeof cell === 'object' && cell !== null ? cell.val : cell;
          return {
            val: typeof val === 'number' ? val : null,
            isMarked: typeof val === 'number' && this.calledNumbers.includes(val),
          };
        })
      );
    } else {
      const rawGrid = generateVietnameseLotoCard();
      grid = rawGrid.map((row) =>
        row.map((val) => ({
          val,
          isMarked: val !== null && this.calledNumbers.includes(val),
        }))
      );
    }

    const ticket: LotoTicket = {
      id: `ticket_${this.roundId}_${key}`,
      username,
      displayName: displayName || username,
      avatarUrl,
      grid,
      markedCount: 0,
      waitingNumbers: [],
      hasWon: false,
      createdAt: Date.now(),
      isVip: !!isVip,
      vipGiftName,
      vipCoins,
    };

    this.recalcTicketStatus(ticket);
    this.tickets.set(key, ticket);
    if (skipServerSync) {
      this.saveToLocalStorage();
      this.notifyLocalOnly();
    } else {
      this.notify();
      if (typeof window !== 'undefined') {
        fetch('/api/loto/add-players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            players: [
              {
                username: ticket.username,
                displayName: ticket.displayName,
                avatarUrl: ticket.avatarUrl,
                grid: ticket.grid,
                isVip: ticket.isVip,
                vipGiftName: ticket.vipGiftName,
                vipCoins: ticket.vipCoins,
              },
            ],
          }),
        }).catch(() => {});
      }
    }
    return ticket;
  }

  private recalcTicketStatus(ticket: LotoTicket) {
    let totalMarked = 0;
    const waiting: number[] = [];
    let hasWon = false;
    let winningRow: number | undefined;

    for (let r = 0; r < 3; r++) {
      let rowMarked = 0;
      let missingNumber: number | null = null;
      for (let c = 0; c < 9; c++) {
        const cell = ticket.grid[r][c];
        if (cell.val !== null) {
          if (cell.isMarked) {
            rowMarked++;
            totalMarked++;
          } else {
            missingNumber = cell.val;
          }
        }
      }
      if (rowMarked === 5) {
        hasWon = true;
        winningRow = r;
      } else if (rowMarked === 4 && missingNumber !== null) {
        waiting.push(missingNumber);
      }
    }

    ticket.markedCount = totalMarked;
    ticket.waitingNumbers = waiting;
    ticket.hasWon = hasWon;
    ticket.winningRow = winningRow;
  }

  // Spin the next ball (optionally targeting a specific number with a song)
  public spinNext(preferredNum?: number): number | null {
    if (this.calledNumbers.length >= 90 || this.isSpinning) {
      return null;
    }

    this.isSpinning = true;
    this.notify();

    // Pick a random uncalled number between 1 and 90
    const available: number[] = [];
    for (let i = 1; i <= 90; i++) {
      if (!this.calledNumbers.includes(i)) available.push(i);
    }

    if (available.length === 0) {
      this.isSpinning = false;
      this.notify();
      return null;
    }

    const nextNum = preferredNum && available.includes(preferredNum)
      ? preferredNum
      : available[Math.floor(Math.random() * available.length)];

    // Simulate 2 seconds of cage spin animation before ball pops out
    setTimeout(() => {
      this.calledNumbers.push(nextNum);
      this.currentNumber = nextNum;
      this.isSpinning = false;

      const { verse, spokenText } = getLotoChant(nextNum);
      this.currentChant = verse;

      // Feature 4: Evaluate Odd/Even (Chẵn/Lẻ) predictions for this drawn number
      const outcome: 'chan' | 'le' = nextNum % 2 === 0 ? 'chan' : 'le';
      const predWinners: string[] = [];
      this.predictions.forEach((p) => {
        if (p.choice === outcome) predWinners.push(p.displayName);
      });
      this.lastPredictionResult = {
        number: nextNum,
        outcome,
        winners: predWinners,
        timestamp: Date.now(),
      };
      this.predictions.clear();

      // Update all tickets
      const newWinners: LotoWinner[] = [];

      this.tickets.forEach((ticket) => {
        let changed = false;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 9; c++) {
            const cell = ticket.grid[r][c];
            if (cell.val === nextNum) {
              cell.isMarked = true;
              changed = true;
            }
          }
        }
        if (changed) {
          const wasWon = ticket.hasWon;
          this.recalcTicketStatus(ticket);
          if (!wasWon && ticket.hasWon && ticket.winningRow !== undefined) {
            const winningRowNumbers: number[] = [];
            ticket.grid[ticket.winningRow].forEach((c) => {
              if (c.val !== null) winningRowNumbers.push(c.val);
            });

            newWinners.push({
              username: ticket.username,
              displayName: ticket.displayName,
              avatarUrl: ticket.avatarUrl,
              winningNumber: nextNum,
              winningRowNumbers,
              wonAt: Date.now(),
              roundId: this.roundId,
              prize: this.currentPrize,
            });
          }
        }
      });

      this.notify();

      // Trigger spoken verse callback
      this.onNumberCalledCallbacks.forEach((cb) => cb(nextNum, verse, spokenText));

      // Trigger winners
      if (newWinners.length > 0) {
        const primaryWinner = newWinners[0];
        this.lastWinner = primaryWinner;
        this.historyWinners.unshift(...newWinners);
        this.onWinCallbacks.forEach((cb) => cb(primaryWinner));
        this.scheduleAutoNextRound(15);
      } else if (this.calledNumbers.length >= 90) {
        this.scheduleAutoNextRound(10);
      }
    }, 2000);

    return nextNum;
  }

  // Clear winner dialog without resetting the current round
  public clearWinner() {
    this.lastWinner = null;
    if (this.nextRoundInterval) {
      clearInterval(this.nextRoundInterval);
      this.nextRoundInterval = null;
    }
    this.autoNextRoundCountdown = null;
    this.notify();
  }

  // Simulate a winning celebration for testing or demo purposes
  public simulateWin(targetName?: string): LotoWinner {
    const allTickets = this.getTickets();
    let t = allTickets[0];
    const name = targetName || (t ? t.displayName : 'Hương Giang');
    if (!t) {
      t = this.issueTicket(name.toLowerCase().replace(/\s+/g, '_'), name, '');
    }

    // Mark the 5 numbers of row 0
    const row0Nums: number[] = [];
    t.grid[0].forEach((c) => {
      if (c.val !== null) {
        c.isMarked = true;
        row0Nums.push(c.val);
        if (!this.calledNumbers.includes(c.val)) {
          this.calledNumbers.push(c.val);
        }
      }
    });

    const winningNum = row0Nums[row0Nums.length - 1] || 12;
    this.currentNumber = winningNum;
    t.hasWon = true;
    t.winningRow = 0;
    t.markedCount = Math.max(5, t.markedCount);

    const winner: LotoWinner = {
      username: t.username,
      displayName: t.displayName,
      avatarUrl: t.avatarUrl,
      winningNumber: winningNum,
      winningRowNumbers: row0Nums,
      wonAt: Date.now(),
      roundId: this.roundId,
      prize: this.currentPrize,
    };

    this.lastWinner = winner;
    this.historyWinners.unshift(winner);
    this.notify();
    this.onWinCallbacks.forEach((cb) => cb(winner));
    this.scheduleAutoNextRound(15);
    return winner;
  }

  // Reset for a fresh game round
  public resetRound() {
    if (this.nextRoundInterval) {
      clearInterval(this.nextRoundInterval);
      this.nextRoundInterval = null;
    }
    this.autoNextRoundCountdown = null;
    this.roundId++;
    this.calledNumbers = [];
    this.currentNumber = null;
    this.currentChant = `Ván mới số #${this.roundId} bắt đầu! Chúc cả nhà phát tài phát lộc!`;
    this.isSpinning = false;
    this.lastWinner = null;
    this.lastFakeKinh = null;
    this.predictions.clear();
    this.lastPredictionResult = null;

    // Regenerate tickets for existing players
    if (this.tickets.size === 0) {
      this.seedInitialTickets(4);
    } else {
      const updatedBatch: any[] = [];
      this.tickets.forEach((ticket, key) => {
        const rawGrid = generateVietnameseLotoCard();
        ticket.grid = rawGrid.map((row) =>
          row.map((val) => ({
            val,
            isMarked: false,
          }))
        );
        ticket.markedCount = 0;
        ticket.waitingNumbers = [];
        ticket.hasWon = false;
        ticket.winningRow = undefined;
        ticket.id = `ticket_${this.roundId}_${key}`;
        updatedBatch.push({
          username: ticket.username,
          displayName: ticket.displayName,
          avatarUrl: ticket.avatarUrl,
          grid: ticket.grid,
          isVip: ticket.isVip,
          vipGiftName: ticket.vipGiftName,
          vipCoins: ticket.vipCoins,
        });
      });
      if (typeof window !== 'undefined' && updatedBatch.length > 0) {
        fetch('/api/loto/add-players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: updatedBatch }),
        }).catch(() => {});
      }
    }

    this.notify();
  }

  public setAutoSpin(enabled: boolean) {
    this.isAutoSpin = enabled;
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
    if (!enabled && this.nextRoundInterval) {
      clearInterval(this.nextRoundInterval);
      this.nextRoundInterval = null;
      this.autoNextRoundCountdown = null;
    }
    if (enabled) {
      if (this.lastWinner || this.calledNumbers.length >= 90) {
        this.scheduleAutoNextRound(10);
      }
      this.autoTimer = setInterval(() => {
        if (!this.isSpinning && this.calledNumbers.length < 90 && !this.lastWinner) {
          this.spinNext();
        } else if (!this.isSpinning && (this.lastWinner || this.calledNumbers.length >= 90) && this.autoResetOnWin && this.autoNextRoundCountdown === null) {
          this.scheduleAutoNextRound(12);
        }
      }, this.spinInterval * 1000);
    }
    this.notify();
  }

  public setSpinInterval(seconds: number) {
    this.spinInterval = Math.max(8, Math.min(60, seconds));
    if (this.isAutoSpin) {
      this.setAutoSpin(true); // restart timer with new interval
    } else {
      this.notify();
    }
  }

  // Clear tickets older than 30 mins
  public pruneOldTickets() {
    const cutoff = Date.now() - 30 * 60 * 1000;
    this.tickets.forEach((t, k) => {
      if (t.createdAt < cutoff) this.tickets.delete(k);
    });
    this.notify();
  }
}

export const lotoEngine = new LotoEngineService();

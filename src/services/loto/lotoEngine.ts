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
}

export interface LotoWinner {
  username: string;
  displayName: string;
  avatarUrl: string;
  winningNumber: number;
  winningRowNumbers: number[];
  wonAt: number;
  roundId: number;
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

  private tickets: Map<string, LotoTicket> = new Map();
  private lastWinner: LotoWinner | null = null;
  private historyWinners: LotoWinner[] = [];

  private listeners: Set<(state: LotoState) => void> = new Set();
  private onNumberCalledCallbacks: Set<(num: number, chant: string, spokenText: string) => void> = new Set();
  private onWinCallbacks: Set<(winner: LotoWinner) => void> = new Set();

  constructor() {
    // Start with auto-spin disabled until stream begins or owner turns it on
    this.isAutoSpin = false;
    this.seedInitialTickets(4);
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
    this.notify();
  }

  public clearAllTickets() {
    this.tickets.clear();
    this.screenConfig.pinnedUsernames = [];
    this.notify();
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
      { user: 'hoang_nam', name: 'Hoàng Nam (TikTok)', avatar: '/assets/loto/patron-1.png' },
      { user: 'linh_dan', name: 'Linh Đan (Fan Cứng)', avatar: '/assets/nhau/patron-female-1.png' },
      { user: 'minh_tuan', name: 'Minh Tuấn (VIP)', avatar: '/assets/nhau/patron-1.png' },
      { user: 'thanh_hang', name: 'Thanh Hằng (Góp Tim)', avatar: '/assets/nhau/patron-female-2.png' },
      { user: 'bao_ngoc', name: 'Bảo Ngọc', avatar: '/assets/loto/patron-2.png' },
      { user: 'quoc_bao', name: 'Quốc Bảo', avatar: '/assets/nhau/patron-uncle-1.png' },
    ];
    for (let i = 0; i < Math.min(count, defaultViewers.length); i++) {
      const v = defaultViewers[i];
      if (!this.tickets.has(v.user)) {
        this.issueTicket(v.user, v.name, v.avatar);
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
        }),
      }).catch(() => {});
    }, 100);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
    this.syncToServer();
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
    };
  }

  public getTickets(): LotoTicket[] {
    return Array.from(this.tickets.values());
  }

  public getTicketForUser(username: string): LotoTicket | undefined {
    return this.tickets.get(username.toLowerCase());
  }

  // Issue or get ticket for a viewer
  public issueTicket(username: string, displayName: string, avatarUrl: string): LotoTicket {
    const key = username.toLowerCase();
    const existing = this.tickets.get(key);
    if (existing) {
      if (displayName) existing.displayName = displayName;
      if (avatarUrl) existing.avatarUrl = avatarUrl;
      return existing;
    }

    const rawGrid = generateVietnameseLotoCard();
    const grid: LotoCell[][] = rawGrid.map((row) =>
      row.map((val) => ({
        val,
        isMarked: val !== null && this.calledNumbers.includes(val),
      }))
    );

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
    };

    this.recalcTicketStatus(ticket);
    this.tickets.set(key, ticket);
    this.notify();
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
      }
    }, 2000);

    return nextNum;
  }

  // Clear winner dialog without resetting the current round
  public clearWinner() {
    this.lastWinner = null;
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
    };

    this.lastWinner = winner;
    this.historyWinners.unshift(winner);
    this.notify();
    this.onWinCallbacks.forEach((cb) => cb(winner));
    return winner;
  }

  // Reset for a fresh game round
  public resetRound() {
    this.roundId++;
    this.calledNumbers = [];
    this.currentNumber = null;
    this.currentChant = `Ván mới số #${this.roundId} bắt đầu! Chúc cả nhà phát tài phát lộc!`;
    this.isSpinning = false;
    this.lastWinner = null;

    // Regenerate tickets for existing players
    if (this.tickets.size === 0) {
      this.seedInitialTickets(4);
    } else {
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
      });
    }

    this.notify();
  }

  public setAutoSpin(enabled: boolean) {
    this.isAutoSpin = enabled;
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
    if (enabled) {
      this.autoTimer = setInterval(() => {
        if (!this.isSpinning && this.calledNumbers.length < 90 && !this.lastWinner) {
          this.spinNext();
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

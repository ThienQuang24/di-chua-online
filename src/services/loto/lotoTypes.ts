export interface LotoCell {
  val: number | null;
  isMarked: boolean;
}

export interface LotoTicket {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  grid: LotoCell[][];
  markedCount: number;
  waitingNumbers: number[];
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
  maxRowMatched: number;
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
  | 'fan' | 'hipshake' | 'disco' | 'robot' | 'troupe' | 'baga'
  | 'vica' | 'anime' | 'stickmin' | 'chika_spin' | 'alice' | 'waifu_mmd'
  | 'altera' | 'cat_meme' | 'kpop_trio' | 'haaland' | 'toctoc' | 'croc_duo';

export interface LotoState {
  roundId: number;
  calledNumbers: number[];
  currentNumber: number | null;
  currentChant: string;
  isSpinning: boolean;
  isAutoSpin: boolean;
  spinInterval: number;
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

export const FAKE_KINH_PENALTIES = [
  'Đứng dậy múa quạt 10 giây trước hội trường!',
  'Lắc hông nhảy điệu Cá Sấu 10 giây!',
  'Đứng lên hát 1 câu cải lương chuộc lỗi!',
  'Thả 50 tim liền tay vì tội báo động giả!',
  'Uống 1 hơi hết ly nước lọc không nghỉ!',
  'Đứng nhún nhảy cổ vũ bà con suốt 10 giây!',
];

export const DEFAULT_LOTO_VIEWERS = [
  { user: 'huong_giang', name: 'Hương Giang', avatar: '/assets/loto/patron-1.png' },
  { user: 'minh_tuan', name: 'Minh Tuấn', avatar: '/assets/nhau/patron-1.png' },
  { user: 'bao_ngoc', name: 'Bảo Ngọc', avatar: '/assets/loto/patron-2.png' },
  { user: 'hoang_nam', name: 'Hoàng Nam', avatar: '/assets/nhau/patron-female-1.png' },
  { user: 'linh_dan', name: 'Linh Đan (Fan Cứng)', avatar: '/assets/nhau/patron-female-2.png' },
  { user: 'thanh_hang', name: 'Thanh Hằng', avatar: '/assets/nhau/patron-uncle-1.png' },
];

export const BOT_CROWD_POOL = [
  { user: 'anh_ba_sg', name: 'Anh Ba Sài Gòn', avatar: '/assets/nhau/patron-1.png' },
  { user: 'co_bay_mientay', name: 'Cô Bảy Miền Tây', avatar: '/assets/loto/patron-1.png' },
  { user: 'tuan_ken_99', name: 'Tuấn Ken', avatar: '/assets/nhau/patron-2.png' },
  { user: 'be_bap_cute', name: 'Bé Bắp', avatar: '/assets/nhau/patron-female-1.png' },
  { user: 'hung_rau_q4', name: 'Hùng Râu', avatar: '/assets/nhau/patron-uncle-1.png' },
  { user: 'dieu_nhi_loto', name: 'Diệu Nhi', avatar: '/assets/nhau/patron-female-2.png' },
  { user: 'minh_tri_vip', name: 'Minh Trí', avatar: '/assets/loto/patron-2.png' },
  { user: 'linh_dan_idol', name: 'Linh Đan', avatar: '/assets/nhau/patron-chill-1.png' },
];

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

  for (let r = 0; r < 3; r++) {
    const cols = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, 5).sort((a, b) => a - b);
    for (const c of cols) {
      const num = colPools[c].pop() ?? (c * 10 + Math.floor(Math.random() * 9) + (c === 0 ? 1 : 0));
      grid[r][c] = num;
    }
  }

  for (let c = 0; c < 9; c++) {
    const numsInCol: number[] = [];
    for (let r = 0; r < 3; r++) {
      if (grid[r][c] !== null) numsInCol.push(grid[r][c]!);
    }
    numsInCol.sort((a, b) => a - b);
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      if (grid[r][c] !== null) grid[r][c] = numsInCol[idx++];
    }
  }

  return grid as number[][];
}

export function recalcTicketStatus(ticket: LotoTicket) {
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

export function normalizeLotoGrid(externalGrid: any[][] | undefined, calledNumbers: number[]): LotoCell[][] {
  if (Array.isArray(externalGrid) && externalGrid.length === 3) {
    return externalGrid.map((row) =>
      row.map((cell) => {
        const val = typeof cell === 'object' && cell !== null ? cell.val : cell;
        return {
          val: typeof val === 'number' ? val : null,
          isMarked: typeof val === 'number' && calledNumbers.includes(val),
        };
      })
    );
  }
  const rawGrid = generateVietnameseLotoCard();
  return rawGrid.map((row) =>
    row.map((val) => ({
      val,
      isMarked: val !== null && calledNumbers.includes(val),
    }))
  );
}

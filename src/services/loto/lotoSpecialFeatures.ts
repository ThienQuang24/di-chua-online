import {
  LotoTicket,
  LotoWinner,
  LotoFakeKinhEvent,
  LotoState,
  FAKE_KINH_PENALTIES,
  recalcTicketStatus,
  normalizeLotoGrid,
} from './lotoTypes';

export function evaluateClaimKinhForTicket(
  t: LotoTicket,
  currentNumber: number | null,
  roundId: number,
  currentPrize: string
): { won: boolean; winner?: LotoWinner; fakeEvent?: LotoFakeKinhEvent } {
  recalcTicketStatus(t);

  if (t.hasWon && t.winningRow !== undefined) {
    const winningRowNumbers: number[] = [];
    t.grid[t.winningRow].forEach((c) => {
      if (c.val !== null) winningRowNumbers.push(c.val);
    });
    const winner: LotoWinner = {
      username: t.username,
      displayName: t.displayName,
      avatarUrl: t.avatarUrl,
      winningNumber: currentNumber || winningRowNumbers[winningRowNumbers.length - 1] || 1,
      winningRowNumbers,
      wonAt: Date.now(),
      roundId,
      prize: currentPrize,
    };
    return { won: true, winner };
  }

  let maxRowMatched = 0;
  for (let r = 0; r < 3; r++) {
    let rowMatched = 0;
    for (let c = 0; c < 9; c++) {
      if (t.grid[r][c].val !== null && t.grid[r][c].isMarked) rowMatched++;
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

  return { won: false, fakeEvent };
}

export function applyTensionWaitingOnTickets(targets: LotoTicket[], calledNumbers: number[]) {
  targets.forEach((t) => {
    let markedInRow0 = 0;
    for (let c = 0; c < 9; c++) {
      const cell = t.grid[0][c];
      if (cell.val !== null) {
        if (markedInRow0 < 4) {
          cell.isMarked = true;
          if (!calledNumbers.includes(cell.val)) calledNumbers.push(cell.val);
          markedInRow0++;
        } else {
          cell.isMarked = false;
        }
      }
    }
    recalcTicketStatus(t);
  });
}

export function pickBotCrowdComment(picked: LotoTicket, customComment?: string): string {
  if (customComment) return customComment;
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
  return sampleChats[Math.floor(Math.random() * sampleChats.length)];
}

export function markTicketRowZeroWinner(
  t: LotoTicket,
  calledNumbers: number[],
  roundId: number,
  currentPrize: string
): LotoWinner {
  const row0Nums: number[] = [];
  t.grid[0].forEach((c) => {
    if (c.val !== null) {
      c.isMarked = true;
      row0Nums.push(c.val);
      if (!calledNumbers.includes(c.val)) calledNumbers.push(c.val);
    }
  });
  const winningNum = row0Nums[row0Nums.length - 1] || 12;
  t.hasWon = true;
  t.winningRow = 0;
  t.markedCount = Math.max(5, t.markedCount);

  return {
    username: t.username,
    displayName: t.displayName,
    avatarUrl: t.avatarUrl,
    winningNumber: winningNum,
    winningRowNumbers: row0Nums,
    wonAt: Date.now(),
    roundId,
    prize: currentPrize,
  };
}

export function markDrawnNumberOnTickets(
  tickets: Map<string, LotoTicket>,
  nextNum: number,
  roundId: number,
  currentPrize: string
): LotoWinner[] {
  const newWinners: LotoWinner[] = [];
  tickets.forEach((ticket) => {
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
      recalcTicketStatus(ticket);
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
          roundId,
          prize: currentPrize,
        });
      }
    }
  });
  return newWinners;
}

export function buildLotoStateSnapshot(engine: any): LotoState {
  return {
    roundId: engine.roundId,
    calledNumbers: [...engine.calledNumbers],
    currentNumber: engine.currentNumber,
    currentChant: engine.currentChant,
    isSpinning: engine.isSpinning,
    isAutoSpin: engine.isAutoSpin,
    spinInterval: engine.spinInterval,
    lastWinner: engine.lastWinner,
    historyWinners: [...engine.historyWinners],
    activeTicketCount: engine.tickets.size,
    screenConfig: engine.getScreenConfig(),
    spotlightTicketUser: engine.spotlightTicketUser,
    showSpotlightTicket: engine.showSpotlightTicket,
    autoShowOnWaitingKin: engine.autoShowOnWaitingKin,
    currentPrize: engine.currentPrize,
    danceStyle: engine.danceStyle,
    danceDonorName: engine.danceDonorName,
    danceGiftName: engine.danceGiftName,
    customVideoUrl: engine.customVideoUrl,
    isGreenScreen: engine.isGreenScreen,
    lastFakeKinh: engine.lastFakeKinh,
    cageSponsor: engine.cageSponsor,
    predictionSummary: engine.getPredictionSummary(),
    showPredictionWidget: engine.showPredictionWidget,
    lastSavedAt: engine.lastSavedAt,
    autoResetOnWin: engine.autoResetOnWin,
    autoNextRoundCountdown: engine.autoNextRoundCountdown,
    autoBotCrowd: engine.autoBotCrowd,
  };
}

export function upsertTicketInEngine(
  engine: any,
  username: string,
  displayName: string,
  avatarUrl: string,
  externalGrid?: any[][],
  isVip?: boolean,
  vipGiftName?: string,
  vipCoins?: number
): { ticket: LotoTicket; isNew: boolean } {
  const key = username.toLowerCase();
  const existing = engine.tickets.get(key);
  if (existing) {
    if (displayName) existing.displayName = displayName;
    if (avatarUrl) existing.avatarUrl = avatarUrl;
    if (isVip) existing.isVip = true;
    if (vipGiftName) existing.vipGiftName = vipGiftName;
    if (typeof vipCoins === 'number') existing.vipCoins = vipCoins;
    if (Array.isArray(externalGrid) && externalGrid.length === 3) {
      existing.grid = normalizeLotoGrid(externalGrid, engine.calledNumbers);
      recalcTicketStatus(existing);
    }
    return { ticket: existing, isNew: false };
  }
  const ticket: LotoTicket = {
    id: `ticket_${engine.roundId}_${key}`,
    username,
    displayName: displayName || username,
    avatarUrl,
    grid: normalizeLotoGrid(externalGrid, engine.calledNumbers),
    markedCount: 0,
    waitingNumbers: [],
    hasWon: false,
    createdAt: Date.now(),
    isVip: !!isVip,
    vipGiftName,
    vipCoins,
  };
  recalcTicketStatus(ticket);
  engine.tickets.set(key, ticket);
  return { ticket, isNew: true };
}

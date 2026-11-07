import { getLotoChant } from './lotoVerses';
import {
  LotoTicket,
  LotoFakeKinhEvent,
  FAKE_KINH_PENALTIES,
  BOT_CROWD_POOL,
  normalizeLotoGrid,
} from './lotoTypes';
import { postLotoAddPlayers, postSimulateBotChat } from './lotoSyncHelper';
import {
  evaluateClaimKinhForTicket,
  pickBotCrowdComment,
  markDrawnNumberOnTickets,
} from './lotoSpecialFeatures';

export function performClaimKinh(
  engine: any,
  username: string,
  displayName?: string,
  avatarUrl?: string
) {
  const t = engine.issueTicket(username, displayName || username, avatarUrl || '');
  const res = evaluateClaimKinhForTicket(t, engine.currentNumber, engine.roundId, engine.currentPrize);
  if (res.won && res.winner) {
    engine.lastWinner = res.winner;
    engine.historyWinners.unshift(res.winner);
    engine.notify();
    engine.onWinCallbacks.forEach((cb: any) => cb(res.winner!));
    return res;
  }
  const fakeEvent = res.fakeEvent!;
  if (engine.fakeKinhTimer) clearTimeout(engine.fakeKinhTimer);
  engine.lastFakeKinh = fakeEvent;
  engine.spotlightTicketUser = t.username.toLowerCase();
  engine.showSpotlightTicket = true;
  engine.notify();
  engine.onFakeKinhCallbacks.forEach((cb: any) => cb(fakeEvent));
  engine.fakeKinhTimer = setTimeout(() => {
    if (engine.lastFakeKinh?.id === fakeEvent.id) {
      engine.lastFakeKinh = null;
      engine.notify();
    }
  }, 10000);
  return res;
}

export function performSimulateFakeKinh(engine: any, targetUsername?: string): LotoFakeKinhEvent {
  const all = engine.getTickets();
  let target = targetUsername
    ? engine.getTicketForUser(targetUsername)
    : all.find((t: LotoTicket) => !t.hasWon) || all[0];
  if (!target) target = engine.issueTicket('minh_tuan', 'Minh Tuấn', '/assets/nhau/patron-1.png');
  const res = engine.claimKinh(target.username, target.displayName, target.avatarUrl);
  if (res.fakeEvent) return res.fakeEvent;
  const fb: LotoFakeKinhEvent = {
    id: `fake_${Date.now()}`,
    username: target.username,
    displayName: target.displayName,
    avatarUrl: target.avatarUrl,
    maxRowMatched: 2,
    totalMarked: 4,
    penaltyText: FAKE_KINH_PENALTIES[0],
    timestamp: Date.now(),
  };
  engine.lastFakeKinh = fb;
  engine.notify();
  return fb;
}

export function performRandomBotChat(engine: any, customUser?: string, customComment?: string) {
  if (engine.tickets.size < 10) {
    BOT_CROWD_POOL.forEach((b) => {
      if (!engine.tickets.has(b.user)) engine.issueTicket(b.user, b.name, b.avatar);
    });
  }
  const ticketsArr: LotoTicket[] = engine.getTickets();
  if (ticketsArr.length === 0) return;
  const picked = customUser
    ? ticketsArr.find((t) => t.username.toLowerCase() === customUser.toLowerCase()) || ticketsArr[0]
    : ticketsArr[Math.floor(Math.random() * ticketsArr.length)];
  const text = pickBotCrowdComment(picked, customComment);
  if (text.includes('Chẵn')) engine.submitPrediction(picked.username, picked.displayName, 'chan');
  else if (text.includes('Lẻ')) engine.submitPrediction(picked.username, picked.displayName, 'le');
  engine.onBotChatCallbacks.forEach((cb: any) => cb(picked.username, picked.displayName, text, picked.avatarUrl));
  postSimulateBotChat(picked, text);
}

export function performSpinNext(engine: any, preferredNum?: number): number | null {
  if (engine.calledNumbers.length >= 90 || engine.isSpinning) return null;
  engine.isSpinning = true;
  engine.notify();
  const available = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (n) => !engine.calledNumbers.includes(n)
  );
  if (available.length === 0) {
    engine.isSpinning = false;
    engine.notify();
    return null;
  }
  const nextNum =
    preferredNum && available.includes(preferredNum)
      ? preferredNum
      : available[Math.floor(Math.random() * available.length)];
  setTimeout(() => {
    engine.calledNumbers.push(nextNum);
    engine.currentNumber = nextNum;
    engine.isSpinning = false;
    const { verse, spokenText } = getLotoChant(nextNum);
    engine.currentChant = verse;
    const outcome: 'chan' | 'le' = nextNum % 2 === 0 ? 'chan' : 'le';
    const predWinners: string[] = [];
    engine.predictions.forEach((p: any) => {
      if (p.choice === outcome) predWinners.push(p.displayName);
    });
    engine.lastPredictionResult = {
      number: nextNum,
      outcome,
      winners: predWinners,
      timestamp: Date.now(),
    };
    engine.predictions.clear();
    const newWinners = markDrawnNumberOnTickets(engine.tickets, nextNum, engine.roundId, engine.currentPrize);
    engine.notify();
    engine.onNumberCalledCallbacks.forEach((cb: any) => cb(nextNum, verse, spokenText));
    if (newWinners.length > 0) {
      engine.lastWinner = newWinners[0];
      engine.historyWinners.unshift(...newWinners);
      engine.onWinCallbacks.forEach((cb: any) => cb(newWinners[0]));
      engine.scheduleAutoNextRound(15);
    } else if (engine.calledNumbers.length >= 90) {
      engine.scheduleAutoNextRound(10);
    }
  }, 2000);
  return nextNum;
}

export function performResetRound(engine: any) {
  if (engine.nextRoundInterval) {
    clearInterval(engine.nextRoundInterval);
    engine.nextRoundInterval = null;
  }
  engine.autoNextRoundCountdown = null;
  engine.roundId++;
  engine.calledNumbers = [];
  engine.currentNumber = null;
  engine.currentChant = `Ván mới số #${engine.roundId} bắt đầu! Chúc cả nhà phát tài phát lộc!`;
  engine.isSpinning = false;
  engine.lastWinner = null;
  engine.lastFakeKinh = null;
  engine.predictions.clear();
  engine.lastPredictionResult = null;
  if (engine.tickets.size === 0) {
    engine.seedInitialTickets(4);
  } else {
    const updatedBatch: Array<Partial<LotoTicket>> = [];
    engine.tickets.forEach((ticket: LotoTicket, key: string) => {
      ticket.grid = normalizeLotoGrid(undefined, []);
      ticket.markedCount = 0;
      ticket.waitingNumbers = [];
      ticket.hasWon = false;
      ticket.winningRow = undefined;
      ticket.id = `ticket_${engine.roundId}_${key}`;
      updatedBatch.push(ticket);
    });
    postLotoAddPlayers(updatedBatch);
  }
  engine.notify();
}
